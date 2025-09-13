import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Crown, Award, Medal, Star, Clock, Users, GamepadIcon } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Mock data for now - will be replaced with real API calls
const mockLeaderboardData = {
  activeChallenge: {
    id: 1,
    title: "Weekly Speed Challenge", 
    description: "Score as many points as possible in Star Blaster",
    game: {
      id: 29,
      title: "Star Blaster",
      thumbnailUrl: "/images/games/star-blaster.jpg"
    },
    startDate: "2025-01-06",
    endDate: "2025-01-13", 
    status: "active",
    totalParticipants: 234,
    prizesText: "iPhone 15 for Winner + Prizes",
    timeRemaining: "4 days 12 hours"
  },
  leaderboard: [
    { rank: 1, username: "gaming_ninja", score: 9850, playTime: "2:35", lastPlayed: "2 hours ago" },
    { rank: 2, username: "star_destroyer", score: 9720, playTime: "2:42", lastPlayed: "4 hours ago" },
    { rank: 3, username: "blast_master", score: 9650, playTime: "2:58", lastPlayed: "1 hour ago" },
    { rank: 4, username: "chakra_warrior", score: 9580, playTime: "3:12", lastPlayed: "6 hours ago" },
    { rank: 5, username: "crown_hunter", score: 9450, playTime: "3:25", lastPlayed: "3 hours ago" },
    { rank: 6, username: "frutti_lover", score: 9380, playTime: "3:38", lastPlayed: "5 hours ago" },
    { rank: 7, username: "pro_gamer123", score: 9250, playTime: "3:45", lastPlayed: "8 hours ago" },
    { rank: 8, username: "champion_player", score: 9180, playTime: "4:02", lastPlayed: "1 day ago" },
    { rank: 9, username: "game_legend", score: 9120, playTime: "4:15", lastPlayed: "7 hours ago" },
    { rank: 10, username: "victory_seeker", score: 9050, playTime: "4:28", lastPlayed: "9 hours ago" },
  ]
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="w-6 h-6 text-yellow-500" />;
    case 2:
      return <Award className="w-6 h-6 text-gray-400" />;
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />;
    default:
      return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">#{rank}</span>;
  }
};

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/30";
    case 2:
      return "bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-400/30";
    case 3:
      return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/30";
    default:
      return "bg-gray-50/50 border-gray-200/50 hover:bg-gray-100/50";
  }
};

export default function Leaderboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const LeaderboardSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
            <div className="text-right space-y-1">
              <Skeleton className="h-4 w-16 ml-auto" />
              <Skeleton className="h-3 w-12 ml-auto" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900/20 via-blue-900/10 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
            Game Challenge Leaderboard
          </h1>
          {isAuthenticated && user ? (
            <p className="text-lg text-muted-foreground">
              Welcome back, <span className="font-semibold text-amber-500">{user.username}</span>! Ready to climb the ranks?
            </p>
          ) : (
            <p className="text-lg text-muted-foreground">
              <Link href="/login">
                <Button variant="link" className="text-amber-500 hover:text-amber-400 p-0 h-auto text-lg">
                  Login
                </Button>
              </Link>
              {" "}to participate in challenges and see your ranking!
            </p>
          )}
        </div>

        {/* Active Challenge Info */}
        <Card className="mb-8 border-2 border-purple-500/20 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <Trophy className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl mb-1">{mockLeaderboardData.activeChallenge.title}</CardTitle>
                  <CardDescription className="text-base">
                    {mockLeaderboardData.activeChallenge.description}
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                <Clock className="w-4 h-4 mr-1" />
                {mockLeaderboardData.activeChallenge.timeRemaining} left
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Game Info */}
              <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  <GamepadIcon className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{mockLeaderboardData.activeChallenge.game.title}</h3>
                  <p className="text-sm text-muted-foreground">Featured Challenge Game</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">{mockLeaderboardData.activeChallenge.totalParticipants}</h3>
                  <p className="text-sm text-muted-foreground">Players Competing</p>
                </div>
              </div>

              {/* Prizes */}
              <div className="flex items-center gap-4 p-4 bg-black/20 rounded-lg">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{mockLeaderboardData.activeChallenge.prizesText}</h3>
                  <p className="text-sm text-muted-foreground">Prize Pool</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              {isAuthenticated ? (
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => navigate(`/games/star-blaster`)}
                >
                  <GamepadIcon className="w-5 h-5 mr-2" />
                  Join Challenge & Play
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  onClick={() => navigate('/login')}
                >
                  Login to Participate
                </Button>
              )}
              <Button variant="outline" size="lg">
                <Trophy className="w-5 h-5 mr-2" />
                View Challenge Rules
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Current Challenge
            </TabsTrigger>
            <TabsTrigger value="all-time" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              All-Time Leaders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {mockLeaderboardData.leaderboard.slice(0, 3).map((player, index) => (
                <Card 
                  key={player.rank} 
                  className={cn(
                    "text-center relative overflow-hidden",
                    getRankColor(player.rank)
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-center mb-2">
                      {getRankIcon(player.rank)}
                    </div>
                    <CardTitle className="text-lg">{player.username}</CardTitle>
                    <CardDescription>Rank #{player.rank}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-400 mb-1">{player.score.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      <div>Time: {player.playTime}</div>
                      <div>Last played: {player.lastPlayed}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Full Rankings
                </CardTitle>
                <CardDescription>
                  Top {mockLeaderboardData.leaderboard.length} players in the current challenge
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {mockLeaderboardData.leaderboard.map((player) => (
                    <div 
                      key={`${player.rank}-${player.username}`}
                      className={cn(
                        "flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors",
                        player.rank <= 3 && "bg-muted/30"
                      )}
                    >
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12">
                        {getRankIcon(player.rank)}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-lg">{player.username}</div>
                        <div className="text-sm text-muted-foreground">
                          Last played: {player.lastPlayed}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="text-right">
                        <div className="font-bold text-xl text-purple-400">
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {player.playTime}
                        </div>
                      </div>

                      {/* Prize indicator for top 10 */}
                      {player.rank <= 10 && (
                        <div className="text-yellow-500">
                          <Star className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all-time">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  All-Time Champions
                </CardTitle>
                <CardDescription>
                  Coming Soon - Hall of Fame for all past challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Crown className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  All-time leaderboard will be available soon. Keep competing in challenges to earn your place in the hall of fame!
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User's Position (if logged in) */}
        {isAuthenticated && user && (
          <Card className="mt-8 border-amber-500/20 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Your Position
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">
                    You haven't participated in this challenge yet.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Play the challenge game to see your ranking here!
                  </p>
                </div>
                <Button 
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={() => navigate(`/games/star-blaster`)}
                >
                  Start Playing
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}