import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Game } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { BarChart, ChevronRight, Clock, GamepadIcon, Laptop, Smartphone, User } from "lucide-react";
import { AnalyticsCard } from "../analytics/AnalyticsCard";
import { Skeleton } from "@/components/ui/skeleton";

interface GameAnalyticsCardProps {
  game: Game;
}

export function GameAnalyticsCard({ game }: GameAnalyticsCardProps) {
  // Fetch game analytics summary
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/analytics/games/${game.id}`],
    // Setting staleTime to 5 minutes to avoid frequent refetching
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <AnalyticsCardSkeleton />;
  }

  // If there's no play data yet
  if (!analytics || analytics.analytics.totalPlays === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Game Analytics: {game.title}</CardTitle>
          <CardDescription>No play data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 space-y-4 text-center">
            <GamepadIcon className="h-12 w-12 text-muted-foreground opacity-30" />
            <div className="text-muted-foreground">
              This game hasn't been played yet. Analytics will appear once users start playing.
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/analytics/games/${game.id}`}>
                <span className="flex items-center">View Details <ChevronRight className="ml-1 h-4 w-4" /></span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { totalPlays, completionRate, averageScore, averageDuration, deviceBreakdown } = analytics.analytics;
  
  // Calculate device percentages
  const totalDevices = Object.values(deviceBreakdown).reduce((sum, count) => sum + count, 0);
  const desktopPercentage = Math.round((deviceBreakdown.desktop || 0) / totalDevices * 100);
  const mobilePercentage = Math.round((deviceBreakdown.mobile || 0) / totalDevices * 100);
  const tabletPercentage = Math.round((deviceBreakdown.tablet || 0) / totalDevices * 100);
  
  // Format duration to minutes and seconds
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Game Analytics: {game.title}</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/admin/analytics/games/${game.id}`}>
              <span className="flex items-center">Details <ChevronRight className="ml-1 h-4 w-4" /></span>
            </Link>
          </Button>
        </div>
        <CardDescription>Analytics summary for the past 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <AnalyticsCard 
            title="Total Plays" 
            value={totalPlays}
            icon={<GamepadIcon className="h-5 w-5" />}
          />
          
          <AnalyticsCard 
            title="Avg. Play Time" 
            value={formatDuration(averageDuration)}
            icon={<Clock className="h-5 w-5" />}
          />
          
          {averageScore > 0 && (
            <AnalyticsCard 
              title="Avg. Score" 
              value={Math.round(averageScore).toLocaleString()}
              icon={<BarChart className="h-5 w-5" />}
            />
          )}
          
          <AnalyticsCard 
            title="Completion Rate" 
            value={`${Math.round(completionRate)}%`}
            icon={<User className="h-5 w-5" />}
          />
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Device Breakdown</h4>
          <div className="flex items-center space-x-4">
            {desktopPercentage > 0 && (
              <div className="flex items-center">
                <Laptop className="h-4 w-4 mr-1 text-primary" />
                <span className="text-xs">{desktopPercentage}% Desktop</span>
              </div>
            )}
            
            {mobilePercentage > 0 && (
              <div className="flex items-center">
                <Smartphone className="h-4 w-4 mr-1 text-primary" />
                <span className="text-xs">{mobilePercentage}% Mobile</span>
              </div>
            )}
            
            {tabletPercentage > 0 && (
              <div className="flex items-center">
                <Smartphone className="h-4 w-4 mr-1 text-primary" />
                <span className="text-xs">{tabletPercentage}% Tablet</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsCardSkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="shadow-sm">
              <CardHeader className="pb-1 pt-3">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-4 w-1/3 mt-4" />
        <div className="flex items-center space-x-4 mt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}