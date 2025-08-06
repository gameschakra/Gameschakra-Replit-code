import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import GameDetail from "@/pages/GameDetail";
import GameDetailsPage from "@/pages/GameDetailsPage";
import Dashboard from "@/pages/admin/Dashboard";
import AnalyticsDashboard from "@/pages/admin/AnalyticsDashboard";
import GameAnalytics from "@/pages/admin/GameAnalytics";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import AuthTest from "@/pages/AuthTest";
import ChallengePage from "@/pages/ChallengePage";
import AboutPage from "@/pages/AboutPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import CookiesPage from "@/pages/CookiesPage";
import ParentsInfoPage from "@/pages/ParentsInfoPage";
import BlogPage from "@/pages/BlogPage";
import BlogPostPage from "@/pages/BlogPostPage";
import BlogCreate from "@/pages/admin/blog/BlogCreate";
import Developers from "@/pages/Developers";
import SubmitGame from "@/pages/SubmitGame";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/layout/ScrollToTop";
import AutoAds from "@/components/ads/AutoAds";
import AdBlockDetector from "@/components/ads/AdBlockDetector";
import DynamicAd from "@/components/ads/DynamicAd";
import { useEffect } from "react";
import { AuthProvider } from "./providers/AuthProvider";

import { useScrollToTop } from './hooks/useScrollToTop';

function Router() {
  // Use the scroll to top hook
  useScrollToTop();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/games/:slug" component={GameDetailsPage} />
          <Route path="/challenges/:slug" component={({params}) => <ChallengePage params={params} />} />
          <Route path="/admin" component={Dashboard} />
          <Route path="/admin/:tab" component={Dashboard} />
          <Route path="/admin/analytics" component={AnalyticsDashboard} />
          <Route path="/admin/analytics/games/:id" component={GameAnalytics} />
          <Route path="/admin/blog/create" component={BlogCreate} />
          <Route path="/login" component={Login} />
          <Route path="/auth-test" component={AuthTest} />
          <Route path="/blog" component={BlogPage} />
          <Route path="/blog/:slug" component={BlogPostPage} />
          <Route path="/developers" component={Developers} />
          <Route path="/submit-game" component={SubmitGame} />
          <Route path="/about" component={AboutPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/cookies" component={CookiesPage} />
          <Route path="/info-for-parents" component={ParentsInfoPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // Only create/use actual React components in the main render path
  // Don't include multiple copies of any ad-related components
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="dark">
          {/* 
            Google AdSense Auto Ads - Replace with your actual publisher ID
            Only include this component once in the entire application
          */}
          <AutoAds adClient="ca-pub-2067900913632539" />
          <Router />
          <ScrollToTopButton />
          <AdBlockDetector />
          <DynamicAd adClient="ca-pub-2067900913632539" adSlot="5962072398" />
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
