import React, { useState } from "react";
import { Link } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, Code, Coins, FileText, Upload, Users, Settings, BarChart, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Developers = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data for the games list, we'd fetch this from the API in a real app
  const developerGames = [
    {
      id: 1,
      title: "Color Box",
      thumbnail: "/api/thumbnails/9c084c0a7a45cbcf5a117db72390477f.jpg",
      status: "published",
      plays: 1432,
      revenue: "$28.64",
      lastUpdated: "2025-03-28"
    },
    {
      id: 2,
      title: "Alphabet Memory",
      thumbnail: "/api/thumbnails/1bd132d7e33536e06f917a213f279db6.jpg",
      status: "published",
      plays: 856,
      revenue: "$17.12",
      lastUpdated: "2025-04-03"
    },
    {
      id: 3,
      title: "Loonie Birds",
      thumbnail: "/api/thumbnails/e783b0222848d08100df776e5ce7772a.jpg",
      status: "published",
      plays: 2156,
      revenue: "$43.12",
      lastUpdated: "2025-04-10"
    }
  ];

  return (
    <div className="bg-[#171c2a] min-h-screen">
      <div className="relative bg-gradient-to-b from-[#232a40] to-[#171c2a] py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4">
            GamesChakra Developer Portal
          </h1>
          <p className="text-gray-300 text-lg md:text-xl md:w-2/3 mb-8">
            Publish your HTML5 games to millions of players worldwide and monetize your content through our platform.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
              <Link href="/submit-game">Submit Your Game</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black">
              <Link href="/login">Developer Login</Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 -mt-10">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <div className="bg-[#232a40] rounded-xl border border-[#2d3754] p-4 shadow-lg">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
              <TabsTrigger value="monetization">Monetization</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-10">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#232a40] border-[#2d3754] shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                <CardHeader>
                  <Upload className="h-10 w-10 text-amber-500 mb-2" />
                  <CardTitle className="text-white text-xl">Submit Your Games</CardTitle>
                  <CardDescription>Upload HTML5 games to our platform easily</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Our simple submission process allows you to upload your HTML5 games
                    in minutes. Support for all major game engines included.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-amber-500 w-full justify-between group">
                    Learn More <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#232a40] border-[#2d3754] shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                <CardHeader>
                  <BarChart className="h-10 w-10 text-amber-500 mb-2" />
                  <CardTitle className="text-white text-xl">Track Analytics</CardTitle>
                  <CardDescription>Detailed insights about your games</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Access comprehensive analytics to understand player behavior, 
                    engagement metrics, and revenue statistics.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-amber-500 w-full justify-between group">
                    Learn More <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#232a40] border-[#2d3754] shadow-md hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                <CardHeader>
                  <Coins className="h-10 w-10 text-amber-500 mb-2" />
                  <CardTitle className="text-white text-xl">Monetize Your Work</CardTitle>
                  <CardDescription>Multiple revenue streams available</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">
                    Earn revenue through in-game ads, sponsorships, and our
                    revenue sharing program for premium games.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="text-amber-500 w-full justify-between group">
                    Learn More <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            </section>

            <section className="bg-[#232a40] rounded-xl border border-[#2d3754] p-8 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Why Choose GamesChakra?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-4">
                  <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Worldwide Audience</h3>
                    <p className="text-gray-300">
                      Access to millions of players across the globe, with special focus on the Indian gaming market.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                    <Coins className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Competitive Revenue Share</h3>
                    <p className="text-gray-300">
                      Earn up to 65% revenue share from advertising and premium game sales.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                    <Code className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">SDK & API Integration</h3>
                    <p className="text-gray-300">
                      Simple SDK for achievements, leaderboards, and social features to enhance your games.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                    <HelpCircle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Dedicated Support</h3>
                    <p className="text-gray-300">
                      Personal support from our developer relations team to help you succeed.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-title font-bold text-white mb-6">Success Stories</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-[#232a40] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <div className="h-40 rounded-md overflow-hidden mb-4 bg-[#1A2134]">
                      <img 
                        src="/api/thumbnails/9c084c0a7a45cbcf5a117db72390477f.jpg" 
                        alt="Color Box" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-white">Color Box</CardTitle>
                    <CardDescription>By Rajesh Kumar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      "After publishing my game on GamesChakra, I saw a 300% increase in player engagement and consistent revenue growth."
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">1M+ Plays</Badge>
                      <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30">Featured Game</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#232a40] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <div className="h-40 rounded-md overflow-hidden mb-4 bg-[#1A2134]">
                      <img 
                        src="/api/thumbnails/e783b0222848d08100df776e5ce7772a.jpg" 
                        alt="Loonie Birds" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-white">Loonie Birds</CardTitle>
                    <CardDescription>By Gaames Studio</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      "The platform's SDK helped us implement leaderboards and achievements easily, increasing our player retention by 45%."
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">2.5M+ Plays</Badge>
                      <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">Top Earner</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#232a40] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <div className="h-40 rounded-md overflow-hidden mb-4 bg-[#1A2134]">
                      <img 
                        src="/api/thumbnails/1bd132d7e33536e06f917a213f279db6.jpg" 
                        alt="Alphabet Memory" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-white">Alphabet Memory</CardTitle>
                    <CardDescription>By EdTech Games</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      "GamesChakra's focus on educational games helped us reach the perfect audience for our educational puzzle game."
                    </p>
                    <div className="flex gap-2">
                      <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30">800K+ Plays</Badge>
                      <Badge className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30">Educational Pick</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="bg-[#232a40] border-[#2d3754] rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Developer Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">Total Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">3</div>
                    <p className="text-gray-400 text-sm">+1 in the last 30 days</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">Total Plays</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">4,444</div>
                    <p className="text-gray-400 text-sm">+834 in the last 30 days</p>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-white text-lg">Est. Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">$88.88</div>
                    <p className="text-gray-400 text-sm">+$17.65 in the last 30 days</p>
                  </CardContent>
                </Card>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Your Games</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-[#2d3754]">
                      <th className="pb-2 text-gray-400 font-medium">Game</th>
                      <th className="pb-2 text-gray-400 font-medium">Status</th>
                      <th className="pb-2 text-gray-400 font-medium">Plays</th>
                      <th className="pb-2 text-gray-400 font-medium">Revenue</th>
                      <th className="pb-2 text-gray-400 font-medium">Last Updated</th>
                      <th className="pb-2 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {developerGames.map(game => (
                      <tr key={game.id} className="border-b border-[#2d3754]">
                        <td className="py-4">
                          <div className="flex items-center">
                            <img 
                              src={game.thumbnail} 
                              alt={game.title}
                              className="w-12 h-12 object-cover rounded mr-3"
                            />
                            <span className="font-medium text-white">{game.title}</span>
                          </div>
                        </td>
                        <td>
                          <Badge className={game.status === "published" ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"}>
                            {game.status}
                          </Badge>
                        </td>
                        <td className="text-white">{game.plays.toLocaleString()}</td>
                        <td className="text-white">{game.revenue}</td>
                        <td className="text-gray-300">{game.lastUpdated}</td>
                        <td>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="border-[#2d3754] hover:bg-[#2d3754] h-8 px-2">
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="border-[#2d3754] hover:bg-[#2d3754] h-8 px-2">
                              <BarChart className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-center">
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                <Link href="/submit-game">Upload New Game</Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-8">
            <div className="bg-[#232a40] border-[#2d3754] rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Developer Documentation</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <FileText className="h-8 w-8 text-amber-500 mb-2" />
                    <CardTitle className="text-white">Getting Started Guide</CardTitle>
                    <CardDescription>Everything you need to know to begin</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Learn how to prepare your HTML5 games for GamesChakra, 
                      set up your developer account, and make your first submission.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-amber-500 w-full justify-between group">
                      Read Guide <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <Code className="h-8 w-8 text-amber-500 mb-2" />
                    <CardTitle className="text-white">SDK Documentation</CardTitle>
                    <CardDescription>Implement our SDK features</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Detailed documentation for our JavaScript SDK, including 
                      leaderboards, achievements, in-app purchases, and analytics.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-amber-500 w-full justify-between group">
                      View Documentation <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Popular Topics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">Game Submission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Technical Requirements</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>File Format Guide</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Submission Process</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Review Guidelines</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">SDK Integration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Installation Guide</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Leaderboard Implementation</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Achievements System</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Analytics Tracking</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">Monetization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Ad Implementation</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Revenue Models</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Payment Processing</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Revenue Dashboard</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monetization" className="space-y-8">
            <div className="bg-[#232a40] border-[#2d3754] rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Monetization Options</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <div className="bg-amber-500/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                      <Coins className="h-6 w-6 text-amber-500" />
                    </div>
                    <CardTitle className="text-white">Ad Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-6">
                      Earn revenue through pre-roll, interstitial, and 
                      rewarded ads integrated seamlessly into your games.
                    </p>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Revenue Share</span>
                        <span className="text-white font-medium">60%</span>
                      </div>
                      <div className="w-full bg-[#232a40] rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Payment Threshold</span>
                        <span className="text-white font-medium">$50</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full">Learn More</Button>
                  </CardFooter>
                </Card>

                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md relative overflow-hidden">
                  <div className="absolute -right-5 -top-5 bg-amber-500 text-black transform rotate-45 text-xs font-bold py-1 px-10">
                    POPULAR
                  </div>
                  <CardHeader>
                    <div className="bg-purple-500/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                      <Coins className="h-6 w-6 text-purple-500" />
                    </div>
                    <CardTitle className="text-white">Premium Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-6">
                      Sell your games directly to players through our 
                      platform with flexible pricing options.
                    </p>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Revenue Share</span>
                        <span className="text-white font-medium">70%</span>
                      </div>
                      <div className="w-full bg-[#232a40] rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: "70%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Payment Threshold</span>
                        <span className="text-white font-medium">$30</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">Learn More</Button>
                  </CardFooter>
                </Card>

                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <div className="bg-green-500/20 h-12 w-12 rounded-full flex items-center justify-center mb-4">
                      <Coins className="h-6 w-6 text-green-500" />
                    </div>
                    <CardTitle className="text-white">Sponsorships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-6">
                      Get your games sponsored by brands looking for 
                      engaging content to reach their audience.
                    </p>
                    <div className="mb-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">Revenue Share</span>
                        <span className="text-white font-medium">80%</span>
                      </div>
                      <div className="w-full bg-[#232a40] rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300">By Application Only</span>
                        <span className="text-white font-medium">Selective</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" className="w-full">Learn More</Button>
                  </CardFooter>
                </Card>
              </div>

              <h3 className="text-xl font-semibold text-white mb-4">Payout Options</h3>
              
              <div className="bg-[#1A2134] rounded-lg p-6 border border-[#2d3754]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Payment Methods</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Bank Transfer (NEFT/IMPS for Indian Developers)</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>PayPal</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Wise (TransferWise)</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>UPI (for Indian Developers)</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Payment Schedule</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Monthly payments (Net 45)</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Minimum payout threshold applies</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Detailed revenue reports provided</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-2">Tax Information</h4>
                    <ul className="space-y-2 text-gray-300">
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>W-8BEN or W-9 forms required</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>Tax certificates provided annually</span>
                      </li>
                      <li className="flex items-center">
                        <ChevronRight className="h-4 w-4 text-amber-500 mr-2" />
                        <span>GST invoicing for Indian developers</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support" className="space-y-8">
            <div className="bg-[#232a40] border-[#2d3754] rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Developer Support</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <HelpCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <CardTitle className="text-white">Help Center</CardTitle>
                    <CardDescription>Browse our knowledge base</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Our comprehensive documentation covers everything from game 
                      submission to monetization strategies and technical troubleshooting.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-amber-500 w-full justify-between group">
                      Visit Help Center <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="bg-[#1A2134] border-[#2d3754] shadow-md">
                  <CardHeader>
                    <Users className="h-8 w-8 text-amber-500 mb-2" />
                    <CardTitle className="text-white">Direct Support</CardTitle>
                    <CardDescription>Get help from our team</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">
                      Contact our developer relations team directly for 
                      personalized support and guidance for your specific needs.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="text-amber-500 w-full justify-between group">
                      Contact Support <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="bg-[#1A2134] rounded-lg p-6 border border-[#2d3754]">
                <h3 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h3>
                
                <div className="space-y-4">
                  <div className="border-b border-[#2d3754] pb-4">
                    <h4 className="text-white font-medium mb-2">What types of games can I publish on GamesChakra?</h4>
                    <p className="text-gray-300">
                      We accept HTML5 games built with any framework or engine. Your games must be optimized for web browsers
                      and responsive to different screen sizes. We primarily focus on casual and hyper-casual games.
                    </p>
                  </div>
                  
                  <div className="border-b border-[#2d3754] pb-4">
                    <h4 className="text-white font-medium mb-2">How long does the review process take?</h4>
                    <p className="text-gray-300">
                      Our standard review process takes 3-5 business days. We check for technical functionality, 
                      content appropriateness, and gameplay experience. You'll receive updates throughout the process.
                    </p>
                  </div>
                  
                  <div className="border-b border-[#2d3754] pb-4">
                    <h4 className="text-white font-medium mb-2">What are the technical requirements for submissions?</h4>
                    <p className="text-gray-300">
                      Your game should be HTML5 compatible, under 50MB in size, include a proper manifest file, and
                      function without errors in modern browsers. Check our full technical documentation for details.
                    </p>
                  </div>
                  
                  <div className="border-b border-[#2d3754] pb-4">
                    <h4 className="text-white font-medium mb-2">How often will I get paid?</h4>
                    <p className="text-gray-300">
                      We process payments on a monthly basis with Net 45 terms, once your account reaches the minimum
                      payout threshold. Detailed revenue reports are provided for transparency.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-white font-medium mb-2">Can I publish my game on other platforms too?</h4>
                    <p className="text-gray-300">
                      Yes, we support non-exclusive distribution. You can publish your game on GamesChakra and
                      other platforms simultaneously, unless you opt for our premium exclusivity program.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-8 text-black">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Ready to Join Our Developer Community?</h3>
                  <p className="mb-4 md:mb-0 text-amber-900">Register today and start publishing your games to millions of players!</p>
                </div>
                <Button className="bg-black hover:bg-gray-900 text-white">
                  <Link href="/register">Sign Up as Developer</Link>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bg-[#232a40] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-title font-bold text-white mb-8">Ready to Publish Your Game?</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of game developers who are growing their audience and earning revenue on GamesChakra.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
              <Link href="/submit-game">Submit Your Game</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#171c2a]">
              <Link href="/login">Developer Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developers;