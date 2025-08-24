import React from "react";
import { Link } from "wouter";

export default function ParentsInfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-rose-600 to-pink-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="material-icons text-4xl text-white">family_restroom</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Information for Parents</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Ensuring a safe and enjoyable gaming environment for children of all ages.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 md:p-12 shadow-2xl">
            {/* Introduction */}
            <div className="bg-rose-600/20 border border-rose-500/30 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-4">
                <span className="material-icons text-rose-400 mr-3">verified_user</span>
                <h2 className="text-xl font-bold text-white m-0">Our Commitment</h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-0">At GamesChakra, we are committed to providing a safe and enjoyable gaming environment for users of all ages. We understand that parents and guardians want to make informed decisions about the content their children access online.</p>
            </div>

            {/* Game Content and Age Ratings */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
              <div className="flex items-center mb-6">
                <span className="material-icons text-amber-400 mr-3">stars</span>
                <h2 className="text-2xl font-bold text-white m-0">Game Content and Age Ratings</h2>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-4">All games on our platform are categorized and include age recommendations. We encourage parents to review game descriptions and ratings before allowing children to play.</p>
              
              <p className="text-gray-300 leading-relaxed mb-4">Our games are categorized as follows:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-600/20 rounded-lg p-4 border border-green-500/30">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-400 mr-2">child_friendly</span>
                    <h4 className="font-bold text-white">For Everyone</h4>
                  </div>
                  <p className="text-gray-300 text-sm">Suitable for all ages with no inappropriate content</p>
                </div>
                
                <div className="bg-blue-600/20 rounded-lg p-4 border border-blue-500/30">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-blue-400 mr-2">child_care</span>
                    <h4 className="font-bold text-white">7+</h4>
                  </div>
                  <p className="text-gray-300 text-sm">May contain mild cartoon violence</p>
                </div>
                
                <div className="bg-orange-600/20 rounded-lg p-4 border border-orange-500/30">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-orange-400 mr-2">school</span>
                    <h4 className="font-bold text-white">12+</h4>
                  </div>
                  <p className="text-gray-300 text-sm">May contain moderate fantasy violence and mild language</p>
                </div>
                
                <div className="bg-red-600/20 rounded-lg p-4 border border-red-500/30">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-red-400 mr-2">person</span>
                    <h4 className="font-bold text-white">16+</h4>
                  </div>
                  <p className="text-gray-300 text-sm">May contain realistic violence, mature themes, and suggestive content</p>
                </div>
              </div>
            </div>

            {/* Parental Controls */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
              <div className="flex items-center mb-6">
                <span className="material-icons text-purple-400 mr-3">admin_panel_settings</span>
                <h2 className="text-2xl font-bold text-white m-0">Parental Controls</h2>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-4">We recommend that parents take advantage of the following measures to ensure a safe online experience:</p>
              
              <div className="space-y-4">
                <div className="flex items-start bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                  <span className="material-icons text-blue-400 mr-3 mt-1">visibility</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Supervise Gaming</h4>
                    <p className="text-gray-300 text-sm">Monitor your child's gaming activities and play together when possible</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                  <span className="material-icons text-green-400 mr-3 mt-1">security</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Browser Controls</h4>
                    <p className="text-gray-300 text-sm">Use browser parental controls to limit access to certain content</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                  <span className="material-icons text-amber-400 mr-3 mt-1">schedule</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Time Limits</h4>
                    <p className="text-gray-300 text-sm">Set appropriate time limits for gaming sessions</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                  <span className="material-icons text-pink-400 mr-3 mt-1">school</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Online Safety Education</h4>
                    <p className="text-gray-300 text-sm">Educate your children about online safety and digital citizenship</p>
                  </div>
                </div>
                
                <div className="flex items-start bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                  <span className="material-icons text-cyan-400 mr-3 mt-1">history</span>
                  <div>
                    <h4 className="font-bold text-white mb-1">Regular Check-ins</h4>
                    <p className="text-gray-300 text-sm">Regularly check your child's browsing history and discuss their online activities</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Protection */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
              <div className="flex items-center mb-6">
                <span className="material-icons text-green-400 mr-3">shield</span>
                <h2 className="text-2xl font-bold text-white m-0">Privacy Protection</h2>
              </div>
              
              <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <span className="material-icons text-green-400 mr-3 mt-1">verified</span>
                  <div>
                    <h4 className="font-bold text-white mb-2">COPPA Compliance</h4>
                    <p className="text-gray-300 text-sm">We do not knowingly collect personal information from children under 13 without parental consent.</p>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-0">We take children's privacy seriously and follow strict guidelines to protect young users. For more information, please refer to our <Link href="/privacy" className="text-rose-400 hover:text-rose-300 underline">Privacy Policy</Link>.</p>
            </div>

            {/* Reporting Section */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
              <div className="flex items-center mb-6">
                <span className="material-icons text-orange-400 mr-3">report</span>
                <h2 className="text-2xl font-bold text-white m-0">Reporting Inappropriate Content</h2>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-4">If you find any content on our platform that you believe is inappropriate for children, please contact us immediately. We take all reports seriously and will investigate promptly.</p>
              
              <div className="flex flex-wrap gap-3">
                <Link href="/contact">
                  <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center">
                    <span className="material-icons mr-2 text-sm">report_problem</span>
                    Report Content
                  </button>
                </Link>
                
                <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center">
                  <span className="material-icons mr-2 text-sm">email</span>
                  Email Us Directly
                </button>
              </div>
            </div>

            {/* Safe Gaming Tips */}
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6 mb-8">
              <div className="flex items-center mb-6">
                <span className="material-icons text-blue-400 mr-3">lightbulb</span>
                <h2 className="text-2xl font-bold text-white m-0">Tips for Safe Online Gaming</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="material-icons text-green-400 mr-2 mt-1 text-sm">chat</span>
                    <p className="text-gray-300 text-sm">Encourage open communication about online activities</p>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="material-icons text-yellow-400 mr-2 mt-1 text-sm">no_accounts</span>
                    <p className="text-gray-300 text-sm">Teach children not to share personal information online</p>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="material-icons text-blue-400 mr-2 mt-1 text-sm">rule</span>
                    <p className="text-gray-300 text-sm">Set clear rules about when and how long children can play</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="material-icons text-purple-400 mr-2 mt-1 text-sm">home</span>
                    <p className="text-gray-300 text-sm">Keep gaming devices in common areas of your home</p>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="material-icons text-orange-400 mr-2 mt-1 text-sm">games</span>
                    <p className="text-gray-300 text-sm">Be aware of the games your children are playing</p>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="material-icons text-red-400 mr-2 mt-1 text-sm">contact_support</span>
                    <p className="text-gray-300 text-sm">Create an environment where children feel safe reporting concerns</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
              <div className="flex items-center mb-6">
                <span className="material-icons text-cyan-400 mr-3">contact_support</span>
                <h2 className="text-2xl font-bold text-white m-0">Contact Us</h2>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6">If you have any questions or concerns regarding your child's safety on our platform, please don't hesitate to contact us:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-blue-400 mr-2">email</span>
                    <h4 className="font-bold text-white text-sm">Email</h4>
                  </div>
                  <p className="text-gray-300 text-sm">madishanstudios@gmail.com</p>
                  <p className="text-gray-400 text-xs mt-1">We respond within 24 hours</p>
                </div>
                
                <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30">
                  <div className="flex items-center mb-2">
                    <span className="material-icons text-green-400 mr-2">phone</span>
                    <h4 className="font-bold text-white text-sm">Phone</h4>
                  </div>
                  <p className="text-gray-300 text-sm">+91 9953105778</p>
                  <p className="text-gray-400 text-xs mt-1">Monday to Friday, 9 AM - 6 PM IST</p>
                </div>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
              <div className="flex items-center mb-6">
                <span className="material-icons text-indigo-400 mr-3">library_books</span>
                <h2 className="text-2xl font-bold text-white m-0">Additional Resources</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="material-icons text-white">security</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">Online Safety Guide</h4>
                  <p className="text-gray-300 text-xs">Learn about internet safety for children</p>
                </div>
                
                <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="material-icons text-white">settings</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">Parental Controls</h4>
                  <p className="text-gray-300 text-xs">Setup guides for various devices and browsers</p>
                </div>
                
                <div className="bg-gray-600/20 rounded-lg p-4 border border-gray-500/30 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="material-icons text-white">psychology</span>
                  </div>
                  <h4 className="font-bold text-white text-sm mb-2">Digital Wellness</h4>
                  <p className="text-gray-300 text-xs">Tips for healthy screen time habits</p>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/">
                  <button className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105">
                    <span className="flex items-center justify-center">
                      <span className="material-icons mr-2">games</span>
                      Browse Safe Games
                    </span>
                  </button>
                </Link>
                
                <Link href="/contact">
                  <button className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/25 hover:scale-105">
                    <span className="flex items-center justify-center">
                      <span className="material-icons mr-2">support</span>
                      Get Support
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}