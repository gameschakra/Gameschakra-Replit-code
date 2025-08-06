import React, { useState } from "react";
import { Challenge, Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

// Add game property to Challenge
interface ChallengeWithGame extends Challenge {
  game?: Game;
}

interface ActiveChallengeCardProps {
  challenge: ChallengeWithGame;
  calculateProgress: (startDate: string, endDate: string) => number;
  calculateCountdown: (endDate: string) => string;
}

const ActiveChallengeCard: React.FC<ActiveChallengeCardProps> = ({
  challenge,
  calculateProgress,
  calculateCountdown,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { toast } = useToast();
  const progress = calculateProgress(challenge.startDate, challenge.endDate);
  
  // Create full thumbnail URL if game has a thumbnailUrl
  let thumbnailUrl = "/images/challenge-placeholder.jpg";
  if (challenge.game?.thumbnailUrl) {
    // Check if thumbnailUrl already has the path
    const thumbUrl = challenge.game.thumbnailUrl;
    thumbnailUrl = thumbUrl.startsWith('/api/thumbnails/') ? thumbUrl : `/api/thumbnails/${thumbUrl}`;
  }
  const altText = `${challenge.title} - ${challenge.game?.title || "Challenge"} thumbnail`;

  return (
    <Card 
      className="relative bg-muted/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden flex flex-col group challenge-active flex-shrink-0 w-full md:w-[350px] border-2 border-primary/10 hover:border-primary/30 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glowing effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/20 opacity-0 transition-opacity duration-500 rounded-xl ${isHovered ? 'opacity-100' : ''}`}></div>

      {/* Trophy Badge - Stays on top */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-primary/90 backdrop-blur-md text-white p-2 rounded-full shadow-lg">
          <span className="material-icons text-amber-200 animate-pulse" style={{ fontSize: '24px' }}>emoji_events</span>
        </div>
      </div>
      
      {/* Thumbnail Image with overlay */}
      <div className="w-full h-[140px] rounded-t-xl overflow-hidden relative group">
        <img 
          src={thumbnailUrl} 
          alt={altText} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder-game.jpg";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        
        {/* Challenge title overlay on image */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex justify-between items-center">
            <h3 className="text-white font-bold text-lg drop-shadow-md">{challenge.title}</h3>
            <Badge className="bg-green-500/90 backdrop-blur-sm text-white hover:bg-green-600 transition-colors">
              Active
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Challenge Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <CardDescription className="line-clamp-2 text-sm mb-3 text-gray-300">
            {challenge.description}
          </CardDescription>
          
          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span className="text-gray-400">Challenge Progress</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200/30 rounded-full h-2.5">
              <div 
                className="bg-gradient-to-r from-primary/80 to-primary h-2.5 rounded-full transition-all duration-700 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1 text-sm bg-gray-700/60 p-2 rounded-md">
              <span className="material-icons text-amber-500 text-sm">schedule</span>
              <span className="font-medium text-gray-100">
                {calculateCountdown(challenge.endDate)}
              </span>
            </div>
            
            {challenge.gameId && challenge.game && (
              <div className="flex items-center gap-1 text-sm bg-gray-700/60 p-2 rounded-md">
                <span className="material-icons text-primary text-sm">sports_esports</span>
                <span className="font-medium truncate text-gray-100">{challenge.game.title || "Game"}</span>
              </div>
            )}
          </div>
            
          {/* Leaderboard preview */}
          <div className="mt-3 p-3 bg-gray-800/50 backdrop-blur-sm rounded-lg border border-primary/20">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-bold text-white flex items-center">
                <span className="material-icons text-amber-400 text-sm mr-1">leaderboard</span>
                Top Players
              </div>
              <Badge className="bg-blue-500/80 text-white text-xs hover:bg-blue-600">
                View All
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-700/50 p-2 rounded-md mb-1">
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-xs font-bold text-white">1</div>
              <div className="text-gray-200 text-sm font-medium">Join to compete!</div>
            </div>
          </div>
        </div>
        
        <CardFooter className="pt-3 px-0 pb-0">
          <Button 
            className="w-full bg-black hover:bg-gray-800 text-white font-medium py-2 rounded-md shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px] border border-gray-600"
            onClick={async () => {
              try {
                setIsJoining(true);
                const response = await fetch(`/api/challenges/${challenge.id}/join`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Token': 'admin123'  // Adding admin token for testing
                  },
                  credentials: 'include'
                });
                
                if (!response.ok) {
                  if (response.status === 401) {
                    // Not authenticated
                    window.location.href = `/auth?returnTo=/challenges/${challenge.slug}`;
                    return;
                  }
                  
                  const errorData = await response.json();
                  throw new Error(errorData.message || 'Failed to join challenge');
                }
                
                // Success
                toast({
                  title: "Success!",
                  description: "You have joined the challenge successfully!",
                  variant: "default",
                });
                
                // Refresh challenges data
                queryClient.invalidateQueries({ queryKey: ['/api/challenges'] });
                
                // Navigate to challenge page
                window.location.href = `/challenges/${challenge.slug}`;
              } catch (error: any) {
                toast({
                  title: "Error",
                  description: error.message || "Failed to join challenge. Please try again.",
                  variant: "destructive",
                });
              } finally {
                setIsJoining(false);
              }
            }}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Joining...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">emoji_events</span>
                Join Challenge
              </>
            )}
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default ActiveChallengeCard;