import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { AnalyticsCard } from "@/components/analytics/AnalyticsCard";
import { ChartCard } from "@/components/analytics/ChartCard";
import {
  BarChart3,
  Calendar,
  Clock,
  Eye,
  Gamepad2,
  Laptop,
  Smartphone,
  Users,
  Activity,
  TrendingUp,
  MapPin,
  Download
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
import { useAuth } from "@/providers/AuthProvider";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

interface AnalyticsSummary {
  visits: number;
  uniques: number;
  gameStarts: number;
  avgPlayTime: number;
  onlineNow: number;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface TopGame {
  id: number;
  title: string;
  starts: number;
  avgDuration: number;
}

interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
}

interface ReferrerStats {
  referrerHost: string;
  count: number;
}

export default function AnalyticsDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
      <AnalyticsDashboardInner />
    </div>
  );
}

function AnalyticsDashboardInner() {
  const [, navigate] = useLocation();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(subDays(new Date(), 6)), // Last 7 days
    to: endOfDay(new Date())
  });

  // Safe date range handler
  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    if (!newDateRange) {
      // Reset to default range if undefined
      setDateRange({
        from: startOfDay(subDays(new Date(), 6)),
        to: endOfDay(new Date())
      });
    } else {
      setDateRange(newDateRange);
    }
  };
  const [currentMetric, setCurrentMetric] = useState<'visits' | 'starts'>('visits');

  // Check admin auth - use AuthProvider
  const { user, isLoading: userLoading } = useAuth();

  // Format dates for API with proper null checks
  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : format(subDays(new Date(), 6), "yyyy-MM-dd");
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

  // Fetch analytics summary
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery<AnalyticsSummary>({
    queryKey: ['analytics', 'summary', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/summary?from=${startDate}&to=${endDate}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch analytics summary');
      }
      return response.json();
    },
    staleTime: 120000, // 2 minutes
  });

  // Fetch time series data
  const { data: timeseries, isLoading: timeseriesLoading } = useQuery<TimeSeriesPoint[]>({
    queryKey: ['analytics', 'timeseries', currentMetric, startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/timeseries?metric=${currentMetric}&from=${startDate}&to=${endDate}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch timeseries data');
      }
      return response.json();
    },
    staleTime: 120000,
  });

  // Fetch top games
  const { data: topGames, isLoading: topGamesLoading } = useQuery<TopGame[]>({
    queryKey: ['analytics', 'top-games', startDate, endDate, 10],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/top-games?from=${startDate}&to=${endDate}&limit=10`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch top games');
      }
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Fetch device stats
  const { data: deviceStats, isLoading: deviceLoading } = useQuery<DeviceStats[]>({
    queryKey: ['analytics', 'devices', startDate, endDate],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/devices?from=${startDate}&to=${endDate}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch device stats');
      }
      return response.json();
    },
    staleTime: 300000,
  });

  // Fetch referrer stats
  const { data: referrerStats, isLoading: referrerLoading } = useQuery<ReferrerStats[]>({
    queryKey: ['analytics', 'referrers', startDate, endDate, 10],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/referrers?from=${startDate}&to=${endDate}&limit=10`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch referrer stats');
      }
      return response.json();
    },
    staleTime: 300000,
  });

  const isLoading = summaryLoading || timeseriesLoading || topGamesLoading || deviceLoading || referrerLoading;

  useEffect(() => {
    if (!userLoading && (!user || !user.isAdmin)) {
      navigate('/login');
    }
  }, [user, userLoading, navigate]);

  if (userLoading) return <DashboardSkeleton />;
  if (!user || !user.isAdmin) return null; // Will redirect in useEffect
  if (isLoading) return <DashboardSkeleton />;
  if (!summary || (summary.visits === 0 && summary.gameStarts === 0)) {
    return <EmptyAnalyticsState onRefresh={() => window.location.reload()} />;
  }

  // Check for empty or very low data
  const hasLowData = summary && (summary.visits < 10 || summary.gameStarts < 5);
  
  const dataQualityHint = hasLowData ? (
    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
        <Activity className="h-4 w-4" />
        <span className="text-sm font-medium">Low traffic detected</span>
      </div>
      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
        Analytics show limited data. Check back after 24 hours for more meaningful insights.
      </p>
    </div>
  ) : null;

  const formatPlayTime = (seconds: number): string => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0));
    if (safeSeconds < 60) return `${safeSeconds}s`;
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const safeNumber = (value: number | undefined | null): number => {
    const num = Number(value) || 0;
    return isNaN(num) || !isFinite(num) ? 0 : Math.max(0, num);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    let csv = '';
    let headers: string[] = [];
    
    if (filename === 'top-games') {
      headers = ['Rank', 'Game', 'Starts', 'Avg Duration (seconds)'];
      csv = headers.join(',') + '\n';
      data.forEach((game, index) => {
        csv += [
          index + 1,
          `"${game.title}"`,
          game.starts,
          game.avgDuration
        ].join(',') + '\n';
      });
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}-${startDate}-${endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <DateRangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-[240px]"
          />
        </div>
      </div>

      {dataQualityHint}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <AnalyticsCard
          title="Page Visits"
          value={safeNumber(summary.visits).toLocaleString()}
          icon={<Eye className="h-5 w-5" />}
          description="Total page views"
        />
        
        <AnalyticsCard
          title="Unique Visitors"
          value={safeNumber(summary.uniques).toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          description="Unique users"
        />
        
        <AnalyticsCard
          title="Game Starts"
          value={safeNumber(summary.gameStarts).toLocaleString()}
          icon={<Gamepad2 className="h-5 w-5" />}
          description="Games started"
        />
        
        <AnalyticsCard
          title="Avg Play Time"
          value={formatPlayTime(summary.avgPlayTime)}
          icon={<Clock className="h-5 w-5" />}
          description="Average session duration"
        />
        
        <AnalyticsCard
          title="Online Now"
          value={safeNumber(summary.onlineNow).toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          description="Active in last 5 minutes"
          className="border-green-200 bg-green-50"
        />
      </div>

      {/* Time Series Charts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Trends</h2>
          <Select
            value={currentMetric}
            onValueChange={(value: 'visits' | 'starts') => setCurrentMetric(value)}
          >
            <SelectTrigger className="w-[150px]">
              <TrendingUp className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="visits">Page Visits</SelectItem>
              <SelectItem value="starts">Game Starts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <ChartCard title={`${currentMetric === 'visits' ? 'Page Visits' : 'Game Starts'} Over Time`}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeseries || []}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => Math.floor(value).toString()}
                />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date as string), 'MMM d, yyyy')}
                  formatter={(value: number) => [Math.floor(value), currentMetric === 'visits' ? 'Visits' : 'Game Starts']}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorMetric)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Device and Referrer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Device Breakdown">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceStats || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ device, percentage }) => `${device}: ${percentage}%`}
                >
                  {(deviceStats || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Unique Visitors"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
        
        <ChartCard title="Top Referrers">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={referrerStats || []}>
                <XAxis 
                  dataKey="referrerHost" 
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis 
                  axisLine={{ stroke: '#374151', strokeWidth: 1 }}
                  tickLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => Math.floor(value).toString()}
                />
                <Tooltip 
                  formatter={(value: number) => [Math.floor(value), "Visitors"]}
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151', 
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
                <Bar dataKey="count" name="Visitors" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
      
      {/* Top Games */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Top Games by Starts
              </CardTitle>
              <CardDescription>
                The most played games on the platform during this period
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportToCSV(topGames || [], 'top-games')}
              disabled={!topGames || topGames.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(topGames || []).map((game, index) => (
              <div key={game.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    #{index + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">{game.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.starts} starts • {formatPlayTime(game.avgDuration)} avg
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatPlayTime(game.avgDuration)}
                </div>
              </div>
            ))}
            {(!topGames || topGames.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                <Gamepad2 className="mx-auto h-12 w-12 opacity-30 mb-2" />
                <p>No game activity during this period</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyAnalyticsState({ onRefresh }: { onRefresh: () => void }) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingStep, setSeedingStep] = useState<'idle' | 'seeding' | 'aggregating' | 'done'>('idle');

  const handleSeedData = async () => {
    if (process.env.NODE_ENV === 'production') return;
    
    setIsSeeding(true);
    setSeedingStep('seeding');
    
    try {
      // Step 1: Seed data
      const seedResponse = await fetch('/api/analytics/debug/seed?hours=48', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!seedResponse.ok) {
        throw new Error('Failed to seed data');
      }
      
      setSeedingStep('aggregating');
      
      // Step 2: Aggregate data  
      const aggregateResponse = await fetch('/api/analytics/debug/aggregate', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!aggregateResponse.ok) {
        throw new Error('Failed to aggregate data');
      }
      
      setSeedingStep('done');
      
      // Step 3: Refresh the page after a short delay
      setTimeout(() => {
        onRefresh();
      }, 1000);
      
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Failed to seed analytics data. Check console for details.');
      setIsSeeding(false);
      setSeedingStep('idle');
    }
  };

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
      </div>
      
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center justify-center py-8 space-y-6">
          <BarChart3 className="h-16 w-16 text-muted-foreground opacity-30" />
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">No Analytics Data Yet</h2>
            <p className="max-w-md text-muted-foreground">
              {isDev 
                ? "No analytics data found. You can seed some test data to see how the dashboard looks."
                : "Analytics will be displayed once users start visiting your site and playing games."
              }
            </p>
          </div>
          
          {isDev && (
            <div className="space-y-4">
              <Button 
                onClick={handleSeedData}
                disabled={isSeeding}
                size="lg"
                className="flex items-center gap-2"
              >
                {isSeeding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    {seedingStep === 'seeding' && 'Seeding data...'}
                    {seedingStep === 'aggregating' && 'Processing...'}
                    {seedingStep === 'done' && 'Done! Refreshing...'}
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4" />
                    Seed Test Data
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                This will create 48 hours of sample analytics data for testing
              </p>
            </div>
          )}
          
          {!isDev && (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>To see analytics data:</p>
              <ul className="text-left max-w-md space-y-1">
                <li>• Share your site to get real visitors</li>
                <li>• Wait for users to browse and play games</li>
                <li>• Data will appear here automatically</li>
              </ul>
            </div>
          )}
        </div>
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-32 mt-1" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-32" />
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
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}