import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Game } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

// Mock data for charts (in a real app, this would come from the API)
const COLORS = ["#6C63FF", "#FF6584", "#00E396", "#FEB019", "#FF4560", "#775DD0"];

export default function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState("week");

  // Get popular games for chart data
  const { data: popularGames, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/popular", { limit: 10 }],
  });

  // Get categories for chart data
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Convert games data to chart format
  const gamePlayData = popularGames
    ? popularGames.map((game) => ({
        name: game.title,
        plays: game.playCount,
      }))
    : [];

  // Convert categories data to chart format
  const categoryData = categories
    ? categories.map((category, index) => ({
        name: category.name,
        value: category.gameCount,
        color: COLORS[index % COLORS.length],
      }))
    : [];

  // Overall stats
  const totalGames = popularGames ? popularGames.length : 0;
  const totalPlays = popularGames
    ? popularGames.reduce((sum, game) => sum + game.playCount, 0)
    : 0;
  const totalCategories = categories ? categories.length : 0;

  if (gamesLoading || categoriesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="plays" className="w-full">
          <TabsList>
            <TabsTrigger value="plays">Game Plays</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <TabsContent value="plays">
            <Card>
              <CardHeader>
                <CardTitle>Top Games by Plays</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Games by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[400px] w-full" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalGames}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Plays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalPlays}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalCategories}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="plays" className="w-full">
        <TabsList>
          <TabsTrigger value="plays">Game Plays</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="plays">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <CardTitle>Top Games by Plays</CardTitle>
                <div className="flex mt-2 sm:mt-0">
                  <TabsList>
                    <TabsTrigger
                      value="week"
                      onClick={() => setTimeRange("week")}
                      className={timeRange === "week" ? "bg-primary text-primary-foreground" : ""}
                    >
                      Week
                    </TabsTrigger>
                    <TabsTrigger
                      value="month"
                      onClick={() => setTimeRange("month")}
                      className={timeRange === "month" ? "bg-primary text-primary-foreground" : ""}
                    >
                      Month
                    </TabsTrigger>
                    <TabsTrigger
                      value="year"
                      onClick={() => setTimeRange("year")}
                      className={timeRange === "year" ? "bg-primary text-primary-foreground" : ""}
                    >
                      Year
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={gamePlayData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="plays" fill="#6C63FF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Games by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularGames?.slice(0, 5).map((game) => (
              <div key={game.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded overflow-hidden mr-3">
                    <img
                      src={game.thumbnailUrl || "https://via.placeholder.com/40?text=Game"}
                      alt={game.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{game.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(game.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="material-icons text-sm mr-1 text-gray-400">visibility</span>
                  <span>{game.playCount} plays</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
