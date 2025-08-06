import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ChartCard } from "@/components/analytics/ChartCard";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  Gamepad2,
  LayoutGrid,
  Layers,
  MousePointerClick,
  Trophy,
  User,
} from "lucide-react";
import { format, subDays, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function GameAnalytics() {
  const [, params] = useRoute("/admin/analytics/games/:id");
  const gameId = params?.id;
  const [timeRange, setTimeRange] = useState("30"); // Default to 30 days
  
  // Format dates for API
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), parseInt(timeRange)), "yyyy-MM-dd");
  
  // Fetch game data
  const { data: gameData, isLoading: isGameLoading } = useQuery({
    queryKey: [`/api/games/${gameId}`],
    enabled: !!gameId,
  });
  
  // Fetch game analytics data
  const { data: analyticsData, isLoading: isAnalyticsLoading } = useQuery({
    queryKey: [`/api/analytics/games/${gameId}`, startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/games/${gameId}?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch game analytics data");
      return res.json();
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const isLoading = isGameLoading || isAnalyticsLoading;
  
  if (isLoading) {
    return <GameAnalyticsSkeleton />;
  }
  
  if (!gameData || !analyticsData) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center mb-6">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/admin/analytics">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Game Analytics</h1>
        </div>
        
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <BarChart3 className="h-16 w-16 text-muted-foreground opacity-30" />
            <h2 className="text-2xl font-semibold">Game Not Found</h2>
            <p className="max-w-md text-muted-foreground">
              The requested game could not be found or no analytics data is available.
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  const { game } = gameData;
  const { analytics, dailyData } = analyticsData;
  
  // Format duration to minutes and seconds
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };
  
  // Calculate device percentages
  const deviceData = Object.entries(analytics.deviceBreakdown).map(([name, value]) => ({
    name: name === "desktop" ? "Desktop" : name === "mobile" ? "Mobile" : "Tablet",
    value: value as number,
  }));
  
  // Format daily data for charts
  const formattedDailyData = dailyData.map((day) => ({
    date: format(parseISO(day.date), "MMM dd"),
    plays: day.plays,
    uniqueUsers: day.uniqueUsers,
    avgDuration: day.avgDuration / 60, // Convert to minutes
    avgScore: day.avgScore,
    completionRate: day.completionRate * 100, // Convert to percentage
  }));
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-4">
            <Link href="/admin/analytics">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">{game.title} Analytics</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onValueChange={(value) => setTimeRange(value)}
          >
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Plays"
          value={analytics.totalPlays.toLocaleString()}
          icon={<Gamepad2 className="h-5 w-5" />}
        />
        
        <AnalyticsCard
          title="Unique Players"
          value={analytics.uniquePlayers.toLocaleString()}
          icon={<User className="h-5 w-5" />}
        />
        
        <AnalyticsCard
          title="Avg. Play Time"
          value={formatDuration(analytics.averageDuration)}
          icon={<Clock className="h-5 w-5" />}
        />
        
        <AnalyticsCard
          title="Completion Rate"
          value={`${Math.round(analytics.completionRate)}%`}
          icon={<Trophy className="h-5 w-5" />}
        />
      </div>
      
      {/* Play Count Chart */}
      <ChartCard title="Daily Game Plays">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedDailyData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="plays"
                stroke="#3b82f6"
                name="Total Plays"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="uniqueUsers"
                stroke="#10b981"
                name="Unique Players"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
      
      {/* Device Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Device Breakdown">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Plays"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        
        <ChartCard title="Player Engagement">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formattedDailyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="avgDuration"
                  name="Avg. Duration (mins)"
                  fill="#3b82f6"
                />
                <Bar
                  yAxisId="right"
                  dataKey="completionRate"
                  name="Completion Rate (%)"
                  fill="#10b981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      
      {/* Performance Metrics */}
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="scores">Score Metrics</TabsTrigger>
          <TabsTrigger value="levels">Level Progression</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scores" className="p-0">
          <ChartCard title="Daily Average Scores">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={formattedDailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#8b5cf6"
                    name="Average Score"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>
        
        <TabsContent value="levels" className="p-0">
          <ChartCard title="Level Progression Distribution">
            <div className="h-80 flex items-center justify-center">
              {analytics.levelData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={Object.entries(analytics.levelData).map(([level, count]) => ({
                      level: `Level ${level}`,
                      count,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, "Players"]} />
                    <Legend />
                    <Bar dataKey="count" name="Players Reached" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted-foreground">No level progression data available</p>
              )}
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
      
      {/* Player Retention and Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Actions</CardTitle>
            <CardDescription>Most common player actions in-game</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.actionData ? (
              <div className="space-y-4">
                {Object.entries(analytics.actionData)
                  .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                  .slice(0, 5)
                  .map(([action, count], index) => (
                    <div key={action} className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-full mr-3">
                          <MousePointerClick className="h-4 w-4 text-primary" />
                        </div>
                        <span>{action}</span>
                      </div>
                      <span className="text-muted-foreground">{count} times</span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Layers className="h-12 w-12 text-muted-foreground opacity-30 mb-2" />
                <p className="text-muted-foreground">No action data available</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Session Insights</CardTitle>
            <CardDescription>Key metrics about user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <span>Avg. Session Length</span>
                </div>
                <span className="text-muted-foreground">{formatDuration(analytics.averageDuration)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                  </div>
                  <span>Sessions per User</span>
                </div>
                <span className="text-muted-foreground">
                  {(analytics.totalPlays / (analytics.uniquePlayers || 1)).toFixed(1)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="bg-primary/10 p-2 rounded-full mr-3">
                    <Trophy className="h-4 w-4 text-primary" />
                  </div>
                  <span>Completion Rate</span>
                </div>
                <span className="text-muted-foreground">{Math.round(analytics.completionRate)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function GameAnalyticsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Skeleton className="h-10 w-32 mr-4" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Skeleton className="h-10 w-48" />
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}