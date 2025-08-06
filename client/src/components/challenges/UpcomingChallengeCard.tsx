import React from "react";
import { Challenge, Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Add game property to Challenge
interface ChallengeWithGame extends Challenge {
  game?: Game;
}

interface UpcomingChallengeCardProps {
  challenge: ChallengeWithGame;
  calculateCountdown: (date: string) => string;
}

const UpcomingChallengeCard: React.FC<UpcomingChallengeCardProps> = ({
  challenge,
  calculateCountdown,
}) => {
  // Create full thumbnail URL if game has a thumbnailUrl
  let thumbnailUrl = "/images/challenge-placeholder.jpg";
  if (challenge.game?.thumbnailUrl) {
    // Check if thumbnailUrl already has the path
    const thumbUrl = challenge.game.thumbnailUrl;
    thumbnailUrl = thumbUrl.startsWith('/api/thumbnails/') ? thumbUrl : `/api/thumbnails/${thumbUrl}`;
  }
  const altText = `${challenge.title} - ${challenge.game?.title || "Challenge"} thumbnail`;
  
  // Format the prizes to display as a string
  let prizesText = "Join to compete with others";
  
  if (challenge.prizes) {
    if (typeof challenge.prizes === 'string') {
      prizesText = challenge.prizes;
    } else if (typeof challenge.prizes === 'object') {
      try {
        // Format prizes object as a comma-separated list
        const prizeValues = Object.values(challenge.prizes as Record<string, string>);
        if (prizeValues.length > 0) {
          prizesText = prizeValues.join(', ');
        } else {
          prizesText = "Prizes available!";
        }
      } catch (e) {
        prizesText = "Prizes available!";
      }
    }
  }
  
  return (
    <Card className="bg-muted rounded-md shadow-md overflow-hidden flex flex-col group flex-shrink-0 w-full md:w-[350px]">
      {/* Thumbnail Image */}
      <div className="w-full h-[120px] rounded-t-md overflow-hidden">
        <img 
          src={thumbnailUrl} 
          alt={altText} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/images/placeholder-game.jpg";
          }}
        />
      </div>
      
      {/* Challenge Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex items-center">
              <span className="material-icons text-blue-500 mr-2 group-hover:animate-pulse">schedule</span>
              {challenge.title}
            </CardTitle>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
              Upcoming
            </Badge>
          </div>
          <CardDescription className="line-clamp-1 text-sm mt-1">
            {challenge.description}
          </CardDescription>
          
          <div className="flex flex-col gap-2 mt-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="material-icons text-gray-400 text-sm">event</span>
              <span>
                Starts in: {calculateCountdown(challenge.startDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="material-icons text-gray-400 text-sm">update</span>
              <span>
                Duration: {Math.ceil((new Date(challenge.endDate).getTime() - new Date(challenge.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            {challenge.maxScore && challenge.maxScore > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="material-icons text-gray-400 text-sm">leaderboard</span>
                <span>Max score: {challenge.maxScore}</span>
              </div>
            )}
            {challenge.gameId && challenge.game && (
              <div className="flex items-center gap-2 text-sm">
                <span className="material-icons text-gray-400 text-sm">sports_esports</span>
                <span>Game: {challenge.game.title || "Game"}</span>
              </div>
            )}
            
            {/* Show prizes if available */}
            <div className="mt-1 p-2 bg-blue-50 rounded-md">
              <div className="text-xs font-medium text-blue-600 mb-1">Prizes</div>
              <div className="text-sm">
                <span className="material-icons text-amber-500 text-sm align-middle mr-1">star</span>
                {prizesText}
              </div>
            </div>
          </div>
        </div>
        
        <CardFooter className="pt-3 px-0 pb-0">
          <Button 
            variant="outline"
            className="w-full border-blue-500 text-blue-500 hover:bg-blue-50"
            onClick={() => window.location.href = `/challenges/${challenge.slug}`}
          >
            <span className="material-icons mr-2 text-sm">notifications</span>
            Remind me
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};

export default UpcomingChallengeCard;