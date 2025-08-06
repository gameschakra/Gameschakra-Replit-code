import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

type Challenge = {
  id: number;
  title: string;
  description: string | null;
  rules: string | null;
  status: "upcoming" | "active" | "completed";
  startDate: string;
  endDate: string;
  prizes: any;
  maxScore: number | null;
  gameId: number | null;
  slug: string;
};

type Game = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
};

type Participant = {
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
};

type Submission = {
  id: number;
  score: number;
  comment: string | null;
  screenshot: string | null;
  submittedAt: string;
  user: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
};

type ChallengeDetailResponse = {
  challenge: Challenge;
  game: Game | null;
  participants: number;
  leaderboard: Submission[];
  isParticipating: boolean;
  userSubmission: Submission | null;
};

export default function ChallengePage({ params }: { params: { slug: string } }) {
  const [location, setLocation] = useLocation();
  const [authError, setAuthError] = useState<boolean>(false);

  // Fetch challenge details
  const { data, isLoading, error, isError } = useQuery<ChallengeDetailResponse>({
    queryKey: [`/api/challenges/${params.slug}`],
    retry: false,
    staleTime: 60000,
    onSuccess: (data) => {
      // Successfully loaded challenge data
    },
    onError: (err: Error) => {
      // Check if error is due to authentication
      console.error("Challenge fetch error:", err);
      setAuthError(true);
    }
  });

  // Check authentication status
  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Handle redirecting to login if unauthorized
  useEffect(() => {
    if (authError) {
      // Display error for a moment, then redirect to login
      const timer = setTimeout(() => {
        setLocation("/login?returnTo=/challenges/" + params.slug);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [authError, params.slug, setLocation]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate countdown for challenge end/start
  const calculateCountdown = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = Math.abs(target.getTime() - now.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} days, ${diffHours} hours`;
    } else {
      return `${diffHours} hours`;
    }
  };

  // Calculate progress percentage for active challenges
  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    
    // If not started yet
    if (now < start) return 0;
    
    // If already ended
    if (now > end) return 100;
    
    // Calculate progress
    const total = end - start;
    const elapsed = now - start;
    return Math.floor((elapsed / total) * 100);
  };

  // Join the challenge
  const handleJoinChallenge = async () => {
    if (!authData) {
      setAuthError(true);
      return;
    }
    
    try {
      const response = await fetch(`/api/challenges/${data?.challenge.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to join challenge');
      }
      
      // Refresh challenge data
      queryClient.invalidateQueries({ queryKey: [`/api/challenges/${params.slug}`] });
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  // Handle login error state
  if (authError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-8">
          <span className="material-icons mr-2">error</span>
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to view or participate in challenges. 
            Redirecting you to the login page...
          </AlertDescription>
        </Alert>
        <div className="text-center">
          <Button 
            variant="default" 
            onClick={() => setLocation("/login?returnTo=/challenges/" + params.slug)}
          >
            Login Now
          </Button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Skeleton className="h-64 w-full mb-4" />
              <Skeleton className="h-8 w-1/3 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-6" />
            </div>
            <div>
              <Skeleton className="h-40 w-full mb-4" />
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state
  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-4xl text-red-500 mb-4">
            <span className="material-icons text-5xl">error</span>
          </div>
          <h1 className="text-2xl font-bold mb-4">Challenge Not Found</h1>
          <p className="mb-6 text-gray-600">
            The challenge you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => setLocation("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const { challenge, game, participants, leaderboard, isParticipating, userSubmission } = data;
  const progress = calculateProgress(challenge.startDate, challenge.endDate);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center text-sm text-gray-500">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/?section=challenges" className="hover:text-primary">Challenges</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-800 dark:text-gray-200">{challenge.title}</span>
        </div>
        
        {/* Challenge Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold">{challenge.title}</h1>
              <Badge className={
                challenge.status === 'active' 
                  ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100' 
                  : challenge.status === 'upcoming' 
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
              }>
                {challenge.status === 'active' 
                  ? 'Active' 
                  : challenge.status === 'upcoming' 
                  ? 'Upcoming' 
                  : 'Completed'}
              </Badge>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300">{challenge.description}</p>
          </div>

          {/* Join/Participate Button */}
          {!isParticipating && challenge.status === 'active' && (
            <Button 
              className="bg-primary hover:bg-primary/90 text-white px-6"
              onClick={handleJoinChallenge}
            >
              <span className="material-icons mr-2">emoji_events</span>
              Join Challenge
            </Button>
          )}
          
          {isParticipating && (
            <Badge className="bg-primary/20 text-primary hover:bg-primary/20 py-2 px-4 text-sm">
              <span className="material-icons mr-1 text-sm">check_circle</span>
              You're Participating
            </Badge>
          )}
        </div>
        
        {/* Progress bar for active challenges */}
        {challenge.status === 'active' && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-primary h-3 rounded-full" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>{formatDate(challenge.startDate)}</span>
              <span>{progress}% completed</span>
              <span>{formatDate(challenge.endDate)}</span>
            </div>
          </div>
        )}
        
        {/* Challenge countdown for upcoming */}
        {challenge.status === 'upcoming' && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
            <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-1">
              <span className="material-icons align-middle mr-1">timer</span>
              Challenge starts in
            </h3>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {calculateCountdown(challenge.startDate)}
            </div>
          </div>
        )}
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column: Challenge details */}
          <div className="md:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                {challenge.rules && <TabsTrigger value="rules">Rules</TabsTrigger>}
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-4 border rounded-md">
                <h3 className="text-xl font-bold mb-4">Challenge Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Duration</h4>
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <span className="material-icons text-gray-500">calendar_today</span>
                      <span>{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                    </div>
                  </div>
                  
                  {challenge.maxScore && (
                    <div>
                      <h4 className="font-medium mb-2">Scoring</h4>
                      <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="material-icons text-gray-500">leaderboard</span>
                        <span>Maximum achievable score: {challenge.maxScore} points</span>
                      </div>
                    </div>
                  )}
                  
                  {game && (
                    <div>
                      <h4 className="font-medium mb-2">Featured Game</h4>
                      <Card className="border border-gray-200 dark:border-gray-700">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-lg">{game.title}</CardTitle>
                          {game.description && (
                            <CardDescription className="line-clamp-2">
                              {game.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardFooter className="p-4 pt-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setLocation(`/games/${game.slug}`)}
                          >
                            <span className="material-icons mr-2 text-sm">sports_esports</span>
                            Play Game
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  )}
                  
                  {challenge.prizes && (
                    <div>
                      <h4 className="font-medium mb-2">Prizes</h4>
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-100 dark:border-yellow-900/30">
                        <div className="flex items-start gap-2">
                          <span className="material-icons text-yellow-500">emoji_events</span>
                          <div>
                            <h5 className="font-medium text-yellow-800 dark:text-yellow-200">Win Exciting Prizes!</h5>
                            <p className="text-yellow-700 dark:text-yellow-300">
                              {typeof challenge.prizes === 'string' 
                                ? challenge.prizes 
                                : 'Complete the challenge with a high score to win prizes!'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {challenge.rules && (
                <TabsContent value="rules" className="p-4 border rounded-md">
                  <h3 className="text-xl font-bold mb-4">Rules & Guidelines</h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{challenge.rules}</p>
                  </div>
                </TabsContent>
              )}
              
              <TabsContent value="leaderboard" className="p-4 border rounded-md">
                <h3 className="text-xl font-bold mb-4">Leaderboard</h3>
                {leaderboard.length > 0 ? (
                  <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-md">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Player</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {leaderboard.map((submission, index) => (
                          <tr key={submission.id} className={index === 0 ? "bg-yellow-50 dark:bg-yellow-900/20" : ""}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {index === 0 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  <span className="material-icons text-yellow-500 text-sm mr-1">emoji_events</span>
                                  1st
                                </span>
                              ) : index === 1 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                  2nd
                                </span>
                              ) : index === 2 ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                                  3rd
                                </span>
                              ) : (
                                <span>{index + 1}th</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  {submission.user.avatarUrl ? (
                                    <img className="h-8 w-8 rounded-full" src={submission.user.avatarUrl} alt="" />
                                  ) : (
                                    <span className="material-icons text-gray-500">person</span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {submission.user.username}
                                    {userSubmission && userSubmission.user.id === submission.user.id && (
                                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        You
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-gray-100 font-bold">{submission.score} pts</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <span className="material-icons text-gray-400 text-4xl mb-2">leaderboard</span>
                    <h4 className="text-lg font-medium text-gray-500 dark:text-gray-400">No scores submitted yet</h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Be the first to participate and submit your score!
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right column: Participation info */}
          <div>
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Challenge Stats</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <Badge className={
                      challenge.status === 'active' 
                        ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100' 
                        : challenge.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300'
                    }>
                      {challenge.status === 'active' 
                        ? 'Active' 
                        : challenge.status === 'upcoming' 
                        ? 'Upcoming' 
                        : 'Completed'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Participants:</span>
                    <span className="font-medium">{participants}</span>
                  </div>
                  {challenge.status === 'active' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Time left:</span>
                      <span className="font-medium">{calculateCountdown(challenge.endDate)}</span>
                    </div>
                  )}
                </div>
                
                <Separator className="my-4" />
                
                {/* Your participation */}
                <div>
                  <h4 className="font-medium mb-3">Your Participation</h4>
                  
                  {isParticipating ? (
                    <div>
                      {userSubmission ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-700 dark:text-gray-300">Your Score:</span>
                            <span className="text-lg font-bold text-green-700 dark:text-green-300">{userSubmission.score} pts</span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Submitted on {new Date(userSubmission.submittedAt).toLocaleDateString()}
                          </div>
                          
                          {challenge.status === 'active' && (
                            <Button 
                              className="w-full mt-3 bg-primary hover:bg-primary/90"
                              onClick={() => setLocation(`/challenges/${challenge.slug}/submit`)}
                            >
                              <span className="material-icons mr-2 text-sm">update</span>
                              Update Score
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <p className="text-blue-800 dark:text-blue-200">
                              You've joined this challenge but haven't submitted a score yet.
                            </p>
                          </div>
                          
                          {challenge.status === 'active' && (
                            <Button 
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={() => setLocation(`/challenges/${challenge.slug}/submit`)}
                            >
                              <span className="material-icons mr-2 text-sm">add_circle</span>
                              Submit Score
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {challenge.status === 'active' ? (
                        <>
                          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                            <p className="text-gray-700 dark:text-gray-300">
                              You haven't joined this challenge yet. Join now to participate!
                            </p>
                          </div>
                          
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90"
                            onClick={handleJoinChallenge}
                          >
                            <span className="material-icons mr-2 text-sm">emoji_events</span>
                            Join Challenge
                          </Button>
                        </>
                      ) : challenge.status === 'upcoming' ? (
                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          <p className="text-blue-800 dark:text-blue-200">
                            This challenge hasn't started yet. Come back once it's active to participate!
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                          <p className="text-gray-700 dark:text-gray-300">
                            This challenge has ended. Check out the leaderboard to see the results!
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}