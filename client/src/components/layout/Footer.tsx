import React from "react";
import { Link, useLocation } from "wouter";
import { FaFacebook, FaTwitter, FaDiscord, FaInstagram, FaWhatsapp, FaYoutube, FaArrowUp } from "react-icons/fa";

// Custom ScrollLink component to handle scroll-to-top functionality
const ScrollLink = ({ href, children, className }: { href: string, children: React.ReactNode, className?: string }) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.location.href = href;
    }, 500);
  };
  
  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-card border-t border-border py-8 mt-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <img 
                  src="/assets/logo.png" 
                  alt="GamesChakra Logo" 
                  className="h-16 w-auto transition-all duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-md"></div>
              </div>
              <span className="font-title font-bold text-xl text-foreground group-hover:text-amber-400 transition-colors duration-300">GamesChakra</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              GamesChakra is a browser game platform that features free online HTML5 games. All games are unblocked and available to play instantly.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-blue-400 transition-all duration-300 text-xl hover:scale-125 hover:bounce focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded outline-none" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="#" className="text-muted-foreground hover:text-sky-400 transition-all duration-300 text-xl hover:scale-125 hover:bounce focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded outline-none" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="#" className="text-muted-foreground hover:text-indigo-400 transition-all duration-300 text-xl hover:scale-125 hover:bounce focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded outline-none" aria-label="Discord">
                <FaDiscord />
              </a>
              <a href="#" className="text-muted-foreground hover:text-pink-400 transition-all duration-300 text-xl hover:scale-125 hover:bounce focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded outline-none" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" className="text-muted-foreground hover:text-green-400 transition-all duration-300 text-xl hover:scale-125 hover:bounce focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded outline-none" aria-label="WhatsApp">
                <FaWhatsapp />
              </a>
              <a href="#" className="text-muted-foreground hover:text-red-400 transition-all duration-300 text-xl hover:scale-125 hover:bounce focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black rounded outline-none" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground text-base mb-3">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <ScrollLink href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </ScrollLink>
              </li>
              <li>
                <ScrollLink href="/company" className="text-muted-foreground hover:text-primary transition-colors">
                  Company
                </ScrollLink>
              </li>
              <li>
                <ScrollLink href="/jobs" className="text-muted-foreground hover:text-primary transition-colors">
                  Jobs
                </ScrollLink>
              </li>
              <li>
                <ScrollLink href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </ScrollLink>
              </li>
            </ul>
            <div className="mt-4 text-sm text-muted-foreground space-y-1">
              <p className="flex items-center hover:text-amber-400 transition-colors duration-300">
                <span className="material-icons text-sm mr-2">phone</span>
                +91 9953105778
              </p>
              <p className="flex items-center hover:text-amber-400 transition-colors duration-300">
                <span className="material-icons text-sm mr-2">email</span>
                madishanstudios@gmail.com
              </p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground text-base mb-3">For Developers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/submit-game" className="text-muted-foreground hover:text-primary transition-colors">
                  Submit Game
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-muted-foreground hover:text-primary transition-colors">
                  Developer Portal
                </Link>
              </li>
              <li>
                <Link href="/docs/api" className="text-muted-foreground hover:text-primary transition-colors">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link href="/developer-program" className="text-muted-foreground hover:text-primary transition-colors">
                  Developer Program
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-foreground text-base mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/info-for-parents" className="text-muted-foreground hover:text-primary transition-colors">
                  Info for Parents
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} GamesChakra.com. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black px-3 py-2 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-amber-500/25 group hover:scale-105 hover:rotate-12 focus-visible:ring-2 ring-amber-400/50 ring-offset-2 ring-offset-black outline-none"
              aria-label="Scroll to top"
            >
              <FaArrowUp className="text-sm transition-transform duration-300 group-hover:animate-bounce" />
              <span className="text-sm font-medium">Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}