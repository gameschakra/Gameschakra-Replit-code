import React from "react";
import { Link } from "wouter";

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="material-icons text-4xl text-white">work</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Join Our Team</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Build the future of gaming with GamesChakra. Discover exciting career opportunities in gaming technology.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Company Culture */}
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Why Work at GamesChakra?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-white">trending_up</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Growth Focused</h3>
                <p className="text-gray-300">Join a rapidly growing gaming platform with endless opportunities for professional development.</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-white">psychology</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Innovation First</h3>
                <p className="text-gray-300">Work with cutting-edge technologies and contribute to revolutionary gaming experiences.</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-black">groups</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Great Team</h3>
                <p className="text-gray-300">Collaborate with passionate gamers and developers who love what they do.</p>
              </div>
            </div>
          </div>

          {/* Open Positions */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Open Positions</h2>
              <p className="text-gray-400">Current opportunities to join our team</p>
            </div>

            <div className="space-y-6">
              {/* Job Position 1 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl hover:border-amber-500/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="material-icons text-white">code</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Full Stack Developer</h3>
                        <p className="text-gray-400">Remote • Full Time</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Join our development team to build and maintain our gaming platform using React, Node.js, and modern web technologies.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">React</span>
                      <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm">Node.js</span>
                      <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">TypeScript</span>
                      <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-sm">MongoDB</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Position 2 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl hover:border-amber-500/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="material-icons text-white">palette</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">UI/UX Designer</h3>
                        <p className="text-gray-400">Remote • Full Time</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Create amazing user experiences and beautiful interfaces for our gaming platform and mobile applications.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-pink-600/20 text-pink-300 px-3 py-1 rounded-full text-sm">Figma</span>
                      <span className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm">Adobe XD</span>
                      <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">Prototyping</span>
                      <span className="bg-green-600/20 text-green-300 px-3 py-1 rounded-full text-sm">User Research</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <button className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Position 3 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl hover:border-amber-500/50 transition-all duration-300">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                        <span className="material-icons text-white">sports_esports</span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">Game Developer</h3>
                        <p className="text-gray-400">Remote • Contract</p>
                      </div>
                    </div>
                    <p className="text-gray-300 mb-4">
                      Develop engaging HTML5 games and interactive experiences for our platform using modern game development frameworks.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-orange-600/20 text-orange-300 px-3 py-1 rounded-full text-sm">JavaScript</span>
                      <span className="bg-red-600/20 text-red-300 px-3 py-1 rounded-full text-sm">Phaser.js</span>
                      <span className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">WebGL</span>
                      <span className="bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm">Game Design</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-6">
                    <button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-16 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Benefits & Perks</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-white">home</span>
                </div>
                <h3 className="font-bold text-white mb-2">Remote First</h3>
                <p className="text-gray-300 text-sm">Work from anywhere in the world</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-white">schedule</span>
                </div>
                <h3 className="font-bold text-white mb-2">Flexible Hours</h3>
                <p className="text-gray-300 text-sm">Choose your optimal working schedule</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-black">school</span>
                </div>
                <h3 className="font-bold text-white mb-2">Learning Budget</h3>
                <p className="text-gray-300 text-sm">Annual budget for courses and conferences</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-2xl text-white">health_and_safety</span>
                </div>
                <h3 className="font-bold text-white mb-2">Health Benefits</h3>
                <p className="text-gray-300 text-sm">Comprehensive health coverage</p>
              </div>
            </div>
          </div>

          {/* Application Process */}
          <div className="mb-16 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white text-center mb-8">How We Hire</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <span className="text-2xl font-bold text-white">1</span>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="material-icons text-xs text-black">send</span>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2">Apply</h3>
                <p className="text-gray-300 text-sm">Submit your application with portfolio</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <span className="text-2xl font-bold text-white">2</span>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="material-icons text-xs text-black">chat</span>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2">Screen</h3>
                <p className="text-gray-300 text-sm">Quick call to get to know each other</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <span className="text-2xl font-bold text-black">3</span>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="material-icons text-xs text-white">code</span>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2">Challenge</h3>
                <p className="text-gray-300 text-sm">Technical assessment or design challenge</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <span className="text-2xl font-bold text-white">4</span>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="material-icons text-xs text-white">celebration</span>
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2">Welcome</h3>
                <p className="text-gray-300 text-sm">Join the GamesChakra team!</p>
              </div>
            </div>
          </div>

          {/* Don't See Your Role */}
          <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-6">
              <span className="material-icons text-2xl text-white">email</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Don't see your role?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our team. Send us your resume and tell us how you'd like to contribute to GamesChakra.
            </p>
            <Link href="/contact">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105">
                Get in Touch
              </button>
            </Link>
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
  );
}