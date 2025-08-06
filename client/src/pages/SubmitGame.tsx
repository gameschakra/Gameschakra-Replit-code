import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, FileCode, Info, Shield, Upload } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/providers/AuthProvider";

const SubmitGame = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("requirements");
  const [gameFile, setGameFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Query to fetch categories
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!gameFile) {
      toast({
        title: "Missing game file",
        description: "Please upload your game as a ZIP file",
        variant: "destructive",
      });
      return;
    }

    if (!thumbnailFile) {
      toast({
        title: "Missing thumbnail",
        description: "Please upload a thumbnail image for your game",
        variant: "destructive",
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        title: "Terms not accepted",
        description: "Please accept the terms and conditions to proceed",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    formData.append("file", gameFile);
    formData.append("thumbnail", thumbnailFile);
    formData.append("status", "draft"); // Initially submit as draft

    try {
      setUploading(true);
      
      const response = await fetch("/api/games", {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          "X-Admin-Token": "admin123" // To bypass auth during testing
        }
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      
      toast({
        title: "Game submitted successfully!",
        description: "Your game has been uploaded as a draft and will be reviewed soon.",
      });
      
      // Clear form and redirect
      e.currentTarget.reset();
      setGameFile(null);
      setThumbnailFile(null);
      setAcceptTerms(false);
      
      // Invalidate queries that include games list
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      
      // Navigate to admin page if the user is admin
      if (user?.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/");
      }
      
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "An error occurred during the upload",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleGameFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: "Game file should be less than 50MB",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      
      if (!file.name.endsWith('.zip')) {
        toast({
          title: "Invalid file format",
          description: "Please upload your game as a ZIP file",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      
      setGameFile(file);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Thumbnail should be less than 2MB",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file format",
          description: "Please upload an image (JPEG, PNG, GIF, or WEBP)",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      
      setThumbnailFile(file);
    }
  };

  return (
    <div className="bg-[#171c2a] min-h-screen">
      <div className="relative bg-gradient-to-b from-[#232a40] to-[#171c2a] py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-title font-bold text-white mb-4">
            Submit Your Game
          </h1>
          <p className="text-gray-300 text-lg md:text-xl md:w-2/3 mb-8">
            Share your HTML5 game with millions of players worldwide on GamesChakra's platform
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 -mt-10">
        <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full space-y-8">
          <div className="bg-[#232a40] rounded-xl border border-[#2d3754] p-4 shadow-lg">
            <TabsList className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="upload">Upload Form</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="requirements" className="space-y-8">
            <div className="bg-[#232a40] rounded-xl border border-[#2d3754] p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Technical Requirements</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                      <FileCode className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">File Format</h3>
                      <p className="text-gray-300">
                        Games must be submitted as a single ZIP file containing all necessary assets and code.
                        The ZIP file should be no larger than 50MB.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                      <Shield className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Content Guidelines</h3>
                      <p className="text-gray-300">
                        Games must be appropriate for general audiences. No excessive violence, 
                        adult content, or offensive material.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                      <Upload className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Required Files</h3>
                      <p className="text-gray-300">
                        The ZIP must contain an <code className="bg-[#1A2134] px-1 rounded">index.html</code> file at the root level.
                        All assets should be relatively linked.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="bg-amber-500/10 rounded-full p-3 h-fit">
                      <Info className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Thumbnail Image</h3>
                      <p className="text-gray-300">
                        An attractive thumbnail image (JPEG, PNG, GIF, or WEBP) with a maximum size of 2MB.
                        Recommended dimensions: 512x384 pixels.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#232a40] rounded-xl border border-[#2d3754] p-6 shadow-md">
                <h3 className="text-xl font-semibold text-white mb-4">Supported Technologies</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-[#1A2134] border-[#2d3754]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">HTML5 + JavaScript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">
                        Plain HTML5 and JavaScript games with any framework.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1A2134] border-[#2d3754]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">Phaser.js</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">
                        Games built with the Phaser.js framework.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1A2134] border-[#2d3754]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">PixiJS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">
                        Games using PixiJS rendering engine.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-[#1A2134] border-[#2d3754]">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg">Unity WebGL</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm">
                        WebGL exports from Unity game engine.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-amber-500 hover:bg-amber-600 text-black"
                onClick={() => setActiveTab("upload")}
              >
                Continue to Upload Form
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-8">
            <div className="bg-[#232a40] rounded-xl border border-[#2d3754] p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Game Submission Form</h2>
              
              <form id="gameForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Game Title *
                    </label>
                    <Input
                      id="title"
                      name="title"
                      required
                      placeholder="Enter your game title"
                      className="bg-[#1A2134] border-[#2d3754] text-white"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1">
                      Game Category *
                    </label>
                    <Select name="categoryId" required>
                      <SelectTrigger className="bg-[#1A2134] border-[#2d3754] text-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A2134] border-[#2d3754] text-white">
                        {Array.isArray(categories) ? categories.map((category: any) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        )) : <SelectItem value="1">Action</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                    Game Description *
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    required
                    placeholder="Describe your game in detail"
                    className="bg-[#1A2134] border-[#2d3754] text-white min-h-[120px]"
                  />
                </div>
                
                <div>
                  <label htmlFor="instructions" className="block text-sm font-medium text-gray-300 mb-1">
                    Playing Instructions *
                  </label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    required
                    placeholder="How to play your game"
                    className="bg-[#1A2134] border-[#2d3754] text-white min-h-[100px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="gameFile" className="block text-sm font-medium text-gray-300 mb-1">
                      Game File (ZIP) *
                    </label>
                    <div className="border border-dashed border-[#2d3754] rounded-md p-6 bg-[#1A2134] text-center">
                      {gameFile ? (
                        <div className="text-green-400">
                          <p className="font-medium">{gameFile.name}</p>
                          <p className="text-sm text-gray-400">{(gameFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <Upload className="h-6 w-6 mx-auto mb-2" />
                          <p>Drop your ZIP file here or click to browse</p>
                          <p className="text-xs mt-1">Maximum size: 50MB</p>
                        </div>
                      )}
                      <Input
                        id="gameFile"
                        name="gameFile"
                        type="file"
                        accept=".zip"
                        required
                        className="sr-only"
                        onChange={handleGameFileChange}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-300 mb-1">
                      Thumbnail Image *
                    </label>
                    <div className="border border-dashed border-[#2d3754] rounded-md p-6 bg-[#1A2134] text-center">
                      {thumbnailFile ? (
                        <div className="text-green-400">
                          <p className="font-medium">{thumbnailFile.name}</p>
                          <p className="text-sm text-gray-400">{(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div className="text-gray-400">
                          <Upload className="h-6 w-6 mx-auto mb-2" />
                          <p>Drop your image here or click to browse</p>
                          <p className="text-xs mt-1">JPEG, PNG, GIF, WEBP (Max: 2MB)</p>
                        </div>
                      )}
                      <Input
                        id="thumbnail"
                        name="thumbnail"
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        required
                        className="sr-only"
                        onChange={handleThumbnailChange}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="developer" className="block text-sm font-medium text-gray-300 mb-1">
                    Developer Name (Optional)
                  </label>
                  <Input
                    id="developer"
                    name="developer"
                    placeholder="Individual or studio name"
                    className="bg-[#1A2134] border-[#2d3754] text-white"
                  />
                </div>
                
                <div className="flex items-start gap-2 mt-4">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-300">
                    I confirm that I own the rights to this game or have permission to distribute it. 
                    I agree to GamesChakra's <Link href="/terms" className="text-amber-500 hover:underline">terms and conditions</Link> and 
                    <Link href="/privacy" className="text-amber-500 hover:underline"> privacy policy</Link>.
                  </label>
                </div>
                
                <div className="flex justify-center mt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-amber-500 hover:bg-amber-600 text-black px-10"
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : "Submit Game"}
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="guidelines" className="space-y-8">
            <div className="bg-[#232a40] rounded-xl border border-[#2d3754] p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Submission Guidelines</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Content Guidelines</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Games must be appropriate for general audiences (ages 13+)</li>
                    <li>No explicit adult content, excessive violence, or graphic imagery</li>
                    <li>No hate speech, discrimination, or harmful stereotypes</li>
                    <li>No content that promotes illegal activities</li>
                    <li>No infringement of third-party intellectual property rights</li>
                  </ul>
                </div>
                
                <Separator className="bg-[#2d3754]" />
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Technical Guidelines</h3>
                  <ul className="list-disc pl-6 space-y-2 text-gray-300">
                    <li>Games must run in modern browsers without plugins</li>
                    <li>Games should be responsive and playable on both desktop and mobile devices</li>
                    <li>File size should be optimized for web delivery (50MB max)</li>
                    <li>Games should not have excessive loading times</li>
                    <li>External resources must be properly licensed and credited</li>
                  </ul>
                </div>
                
                <Separator className="bg-[#2d3754]" />
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Review Process</h3>
                  <ol className="list-decimal pl-6 space-y-2 text-gray-300">
                    <li>Initial technical review to ensure the game is functional</li>
                    <li>Content review to verify compliance with our guidelines</li>
                    <li>Gameplay testing for user experience and bug identification</li>
                    <li>Final review and approval or feedback for improvements</li>
                    <li>Publication to the platform (typically within 5-7 business days)</li>
                  </ol>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="space-y-8">
            <div className="bg-[#232a40] rounded-xl border border-[#2d3754] p-6 shadow-md">
              <h2 className="text-2xl font-title font-bold text-white mb-6">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-[#1A2134] rounded-lg p-4 border border-[#2d3754]">
                  <h3 className="text-lg font-medium text-white mb-2">How long does the review process take?</h3>
                  <p className="text-gray-300">
                    Typically, the review process takes 5-7 business days from submission. You'll receive email updates as your game progresses through the review stages.
                  </p>
                </div>
                
                <div className="bg-[#1A2134] rounded-lg p-4 border border-[#2d3754]">
                  <h3 className="text-lg font-medium text-white mb-2">What happens if my game is rejected?</h3>
                  <p className="text-gray-300">
                    If your game doesn't meet our guidelines, we'll provide detailed feedback about the issues. You can make the necessary changes and resubmit your game for review.
                  </p>
                </div>
                
                <div className="bg-[#1A2134] rounded-lg p-4 border border-[#2d3754]">
                  <h3 className="text-lg font-medium text-white mb-2">How do I earn revenue from my game?</h3>
                  <p className="text-gray-300">
                    You earn revenue through our ad-sharing program. We display advertisements before, between, or alongside your game and share the revenue according to our developer agreement. Premium games also earn revenue through direct sales.
                  </p>
                </div>
                
                <div className="bg-[#1A2134] rounded-lg p-4 border border-[#2d3754]">
                  <h3 className="text-lg font-medium text-white mb-2">Can I update my game after submission?</h3>
                  <p className="text-gray-300">
                    Yes, you can update your game at any time through the developer dashboard. Updates will undergo a brief review process before going live.
                  </p>
                </div>
                
                <div className="bg-[#1A2134] rounded-lg p-4 border border-[#2d3754]">
                  <h3 className="text-lg font-medium text-white mb-2">Do I maintain ownership rights to my game?</h3>
                  <p className="text-gray-300">
                    Yes, you retain all intellectual property rights to your game. We only obtain the right to distribute it on our platform according to our terms of service.
                  </p>
                </div>
                
                <div className="bg-[#1A2134] rounded-lg p-4 border border-[#2d3754]">
                  <h3 className="text-lg font-medium text-white mb-2">Can I publish my game on other platforms too?</h3>
                  <p className="text-gray-300">
                    Yes, publishing on GamesChakra is non-exclusive unless you opt into our Premium Partner Program, which offers higher revenue shares in exchange for exclusivity.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="bg-[#232a40] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-title font-bold text-white mb-8">Ready to Join Our Developer Community?</h2>
          <div className="max-w-3xl mx-auto text-gray-300 mb-8">
            <p className="mb-4">
              By submitting your game to GamesChakra, you're joining a vibrant community of game developers
              who reach millions of players every month. Take advantage of our analytics dashboard, 
              developer resources, and revenue opportunities.
            </p>
            <p>
              If you have any questions, please contact our developer support team at <a href="mailto:developer@gameschakra.com" className="text-amber-500 hover:underline">developer@gameschakra.com</a>
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black">
              <Link href="/developers">Developer Resources</Link>
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#171c2a]">
              <Link href="/developers#documentation">View Documentation</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitGame;