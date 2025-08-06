import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { ChartCard } from "@/components/analytics/ChartCard";
import {
  ArrowRight,
  BarChart3,
  Calendar,
  Gamepad2,
  Laptop,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react";
import { format, subDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30"); // Default to 30 days
  
  // Format dates for API
  const endDate = format(new Date(), "yyyy-MM-dd");
  const startDate = format(subDays(new Date(), parseInt(timeRange)), "yyyy-MM-dd");
  
  // Fetch analytics data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/analytics/dashboard", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/dashboard?startDate=${startDate}&endDate=${endDate}`);
      if (!res.ok) throw new Error("Failed to fetch analytics data");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }
  
  // If no analytics data yet
  if (!data || (data.topGames.length === 0 && data.totalGamePlays === 0)) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        </div>
        
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <BarChart3 className="h-16 w-16 text-muted-foreground opacity-30" />
            <h2 className="text-2xl font-semibold">No Analytics Data Yet</h2>
            <p className="max-w-md text-muted-foreground">
              Analytics will be displayed once users start interacting with games on the platform. 
              Check back after your games receive some plays.
            </p>
          </div>
        </Card>
      </div>
    );
  }
  
  // Process the data for visualization
  
  // Traffic sources data for pie chart
  const trafficSourcesData = Object.entries(data.trafficData.sources).map(([name, value]) => ({
    name,
    value,
  }));
  
  // Device breakdown data for pie chart
  const deviceData = Object.entries(data.deviceData.devices).map(([name, value]) => ({
    name: name === "desktop" ? "Desktop" : name === "mobile" ? "Mobile" : "Tablet",
    value,
  }));
  
  // Browser data for bar chart
  const browserData = Object.entries(data.deviceData.browsers).map(([name, value]) => ({
    name,
    value,
  }));
  
  // OS data for bar chart
  const osData = Object.entries(data.deviceData.os).map(([name, value]) => ({
    name,
    value,
  }));
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        
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
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnalyticsCard
          title="Total Game Plays"
          value={data.totalGamePlays.toLocaleString()}
          icon={<Gamepad2 className="h-5 w-5" />}
          description={`From ${format(new Date(startDate), "MMM d, yyyy")} to ${format(new Date(endDate), "MMM d, yyyy")}`}
        />
        
        <AnalyticsCard
          title="Device Breakdown"
          value={`${data.deviceData.devices.desktop || 0} / ${data.deviceData.devices.mobile || 0}`}
          icon={<Laptop className="h-5 w-5" />}
          description="Desktop / Mobile plays"
        />
        
        <AnalyticsCard
          title="Traffic Sources"
          value={Object.keys(data.trafficData.sources).length}
          icon={<Users className="h-5 w-5" />}
          description="Number of different traffic sources"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Traffic Sources">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSourcesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {trafficSourcesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Plays"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        
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
      </div>
      
      {/* Browser and OS Stats */}
      <Tabs defaultValue="browser" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="browser">Browser Stats</TabsTrigger>
          <TabsTrigger value="os">OS Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browser" className="p-0">
          <ChartCard title="Browser Distribution">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Plays"]} />
                  <Legend />
                  <Bar dataKey="value" name="Plays" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>
        
        <TabsContent value="os" className="p-0">
          <ChartCard title="Operating System Distribution">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={osData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, "Plays"]} />
                  <Legend />
                  <Bar dataKey="value" name="Plays" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
      
      {/* Top Games */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Top Games by Plays</CardTitle>
          <CardDescription>
            The most played games on the platform during this period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {data.topGames.map((game, index) => (
              <div key={game.id} className="flex items-center">
                <div className="mr-4 font-bold text-muted-foreground">
                  #{index + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{game.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {game.totalPlays} plays
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/admin/analytics/games/${game.id}`}>
                    <span className="flex items-center">
                      Details <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-6 w-6 mr-4" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}