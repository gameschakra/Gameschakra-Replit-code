import React from "react";
import { Link } from "wouter";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="material-icons text-4xl text-white">cookie</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Cookie Policy</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Learn about how we use cookies to enhance your browsing experience on GamesChakra.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 md:p-12 shadow-2xl">
            <div className="prose prose-lg max-w-none prose-invert">
              {/* Last Updated Info */}
              <div className="bg-orange-600/20 border border-orange-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-orange-400 mr-3">update</span>
                  <h2 className="text-xl font-bold text-white m-0">Last Updated</h2>
                </div>
                <p className="text-gray-300 mb-0">This Cookie Policy was last updated on January 1, 2025.</p>
              </div>
            
              <p className="text-gray-300 leading-relaxed mb-8">At GamesChakra, we use cookies to enhance your browsing experience on our website. This Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies.</p>
              
              {/* What Are Cookies Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-blue-400 mr-3">help_outline</span>
                  <h2 className="text-2xl font-bold text-white m-0">What are cookies?</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.</p>
              </div>
              
              {/* How We Use Cookies Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-purple-400 mr-3">settings</span>
                  <h2 className="text-2xl font-bold text-white m-0">How we use cookies</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">GamesChakra uses cookies for various purposes, including:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-green-400 mr-2 text-sm">security</span>
                      <h4 className="font-bold text-white text-sm">Essential cookies</h4>
                    </div>
                    <p className="text-gray-300 text-sm">These are necessary for the website to function properly and cannot be disabled.</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-amber-400 mr-2 text-sm">analytics</span>
                      <h4 className="font-bold text-white text-sm">Performance cookies</h4>
                    </div>
                    <p className="text-gray-300 text-sm">These help us understand how visitors interact with our website by collecting information anonymously.</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-blue-400 mr-2 text-sm">tune</span>
                      <h4 className="font-bold text-white text-sm">Functionality cookies</h4>
                    </div>
                    <p className="text-gray-300 text-sm">These allow the website to remember choices you make and provide enhanced, personalized features.</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-pink-400 mr-2 text-sm">ads_click</span>
                      <h4 className="font-bold text-white text-sm">Targeting/advertising cookies</h4>
                    </div>
                    <p className="text-gray-300 text-sm">These are used to deliver advertisements relevant to you and your interests.</p>
                  </div>
                </div>
              </div>
              
              {/* Third-Party Cookies Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-cyan-400 mr-3">share</span>
                  <h2 className="text-2xl font-bold text-white m-0">Third-party cookies</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">In addition to our own cookies, we may also use third-party cookies from services such as:</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30 text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="material-icons text-red-400">analytics</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-2">Google Analytics</h4>
                    <p className="text-gray-300 text-xs">Helps analyze site usage and traffic patterns</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30 text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="material-icons text-blue-400">ads_click</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-2">Google AdSense</h4>
                    <p className="text-gray-300 text-xs">Delivers personalized advertisements</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30 text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="material-icons text-green-400">share</span>
                    </div>
                    <h4 className="font-bold text-white text-sm mb-2">Social Media</h4>
                    <p className="text-gray-300 text-xs">Enables sharing and social features</p>
                  </div>
                </div>
              </div>
              
              {/* Managing Cookies Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-yellow-400 mr-3">manage_accounts</span>
                  <h2 className="text-2xl font-bold text-white m-0">Managing cookies</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. You can set your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
                
                <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <span className="material-icons text-yellow-400 mr-3 mt-1">warning</span>
                    <div>
                      <h4 className="font-bold text-white mb-2">Important Note</h4>
                      <p className="text-gray-300 text-sm">Please note that disabling certain cookies may affect the functionality of our website and your user experience.</p>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-300 leading-relaxed mb-4">Here's how to manage cookies in popular browsers:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <span className="material-icons mr-2 text-blue-400">web</span>
                      Chrome
                    </h4>
                    <p className="text-gray-300 text-sm">Settings → Privacy and security → Cookies and other site data</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <span className="material-icons mr-2 text-orange-400">web</span>
                      Firefox
                    </h4>
                    <p className="text-gray-300 text-sm">Options → Privacy & Security → Cookies and Site Data</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <span className="material-icons mr-2 text-blue-400">web</span>
                      Safari
                    </h4>
                    <p className="text-gray-300 text-sm">Preferences → Privacy → Manage Website Data</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <h4 className="font-bold text-white mb-2 flex items-center">
                      <span className="material-icons mr-2 text-cyan-400">web</span>
                      Edge
                    </h4>
                    <p className="text-gray-300 text-sm">Settings → Cookies and site permissions → Manage and delete cookies</p>
                  </div>
                </div>
              </div>
              
              {/* Updates to Policy Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-green-400 mr-3">update</span>
                  <h2 className="text-2xl font-bold text-white m-0">Updates to this policy</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date. We encourage you to review this Cookie Policy periodically to stay informed about our cookie practices.</p>
              </div>
              
              {/* More Information Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-indigo-400 mr-3">info</span>
                  <h2 className="text-2xl font-bold text-white m-0">More information</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">For more information about how we use your personal data, please refer to our <Link href="/privacy" className="text-orange-400 hover:text-orange-300 underline">Privacy Policy</Link>.</p>
                <p className="text-gray-300 leading-relaxed mb-4">If you have any questions about our Cookie Policy, please contact us at:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-blue-400 mr-2">email</span>
                      <h4 className="font-bold text-white text-sm">Email</h4>
                    </div>
                    <p className="text-gray-300 text-sm">madishanstudios@gmail.com</p>
                  </div>
                  <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-green-400 mr-2">phone</span>
                      <h4 className="font-bold text-white text-sm">Phone</h4>
                    </div>
                    <p className="text-gray-300 text-sm">+91 9266528955</p>
                  </div>
                </div>
              </div>
              
              {/* Cookie Preferences Section */}
              <div className="bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-orange-400 mr-3">tune</span>
                  <h2 className="text-2xl font-bold text-white m-0">Your Cookie Preferences</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">You have the right to choose which cookies you accept. You can manage your preferences at any time through your browser settings or by contacting us directly.</p>
                <div className="flex flex-wrap gap-3">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Accept All Cookies
                  </button>
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Essential Only
                  </button>
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Customize Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center">
              <Link href="/">
                <button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105">
                  <span className="flex items-center">
                    <span className="material-icons mr-2">games</span>
                    Explore Games
                  </span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}