import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <a href="/" className="text-2xl font-bold">GamesChakra</a>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/" className="text-foreground hover:text-primary transition-colors">Home</a>
              <a href="/games" className="text-foreground hover:text-primary transition-colors">Games</a>
              <a href="/blog" className="text-foreground hover:text-primary transition-colors">Blog</a>
              <a href="/about" className="text-foreground hover:text-primary transition-colors">About</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-background border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold mb-2">GamesChakra</h3>
              <p className="text-muted-foreground max-w-md">The ultimate platform for HTML5 game enthusiasts, developers, and players alike.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3">Links</h4>
                <ul className="space-y-2">
                  <li><a href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</a></li>
                  <li><a href="/games" className="text-muted-foreground hover:text-primary transition-colors">Games</a></li>
                  <li><a href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                  <li><a href="/about" className="text-muted-foreground hover:text-primary transition-colors">About</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Legal</h4>
                <ul className="space-y-2">
                  <li><a href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
                  <li><a href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} GamesChakra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PageLayout;