import React from "react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="material-icons text-4xl text-white">info</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Hi there, gaming fam!</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            The next generation of gaming is finally here to reign the gaming world.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Mission Statement */}
          <div className="text-center mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 md:p-12 shadow-2xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mb-6">
                <span className="material-icons text-2xl text-white">rocket_launch</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Creative developers at GAMESCHAKRA wanted to transform the gaming world with utter creativity, user-friendly features and fun, so we created an integrated, adaptable, and innovative gaming platform inclusive for one and all.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl text-center hover:border-indigo-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-2xl text-white">devices</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Play Anywhere</h3>
              <p className="text-gray-300">Play with anyone, anywhere, on any device, it's that easy! Our games work seamlessly across all platforms.</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl text-center hover:border-purple-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-2xl text-white">psychology</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Cutting Edge</h3>
              <p className="text-gray-300">Our games are designed to stay on the cutting edge of innovation and advanced technology is our magic!</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl text-center hover:border-green-500/50 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-icons text-2xl text-white">groups</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">For Everyone</h3>
              <p className="text-gray-300">Gameschakra has a diverse range of games developed exclusively for every age group. Something for everyone!</p>
            </div>
          </div>

          {/* What We Offer */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">What We Offer</h2>
              <p className="text-gray-400">Discover what makes GamesChakra special</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="material-icons text-black">sports_esports</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Free Games</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Gamify your day today and start playing. Our games are free. Let's explore the world of adventures together without any cost barriers.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="material-icons text-white">favorite</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Community First</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  We truly value our community and strive to make your gaming experience fun-filled. Please reach out with any queries or feedbacks.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="material-icons text-white">update</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Regular Updates</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Stuck on what to play? Well, turn on your gaming gears and get ready to evolve your gaming experience with fresh content regularly.
                </p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="material-icons text-white">speed</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Instant Play</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  No downloads, no installations, no waiting. Jump straight into the action with our instant-play HTML5 games that load in seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Our Story */}
          <div className="mb-16 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-4">
                    <span className="material-icons text-white">auto_stories</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white">Our Story</h2>
                </div>
                <div className="space-y-4 text-gray-300 leading-relaxed">
                  <p>
                    GamesChakra was born from a simple vision: to make gaming accessible, enjoyable, and inclusive for everyone. Our journey began when a team of passionate developers recognized the need for a platform that could deliver high-quality gaming experiences without barriers.
                  </p>
                  <p>
                    We believe that great games shouldn't be locked behind paywalls or require expensive hardware. That's why we've built a platform that runs smoothly on any device with a web browser, bringing the joy of gaming to millions of players worldwide.
                  </p>
                  <p>
                    Today, GamesChakra continues to grow, powered by our community of players and developers who share our passion for creating amazing gaming experiences.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-80 lg:w-96">
                <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-icons text-3xl text-white">emoji_events</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">It's your time to WIN IT ALL.</h3>
                  <p className="text-purple-200 mb-6">Join our gaming community and discover your next favorite game!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-16 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-6">
                <span className="material-icons text-2xl text-white">contact_support</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Get in Touch</h2>
              <p className="text-gray-400">We'd be more than happy to interact with you!</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white">phone</span>
                </div>
                <h4 className="font-bold text-white mb-2">Phone</h4>
                <p className="text-gray-300">+91 9266528955</p>
              </div>
              
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white">email</span>
                </div>
                <h4 className="font-bold text-white mb-2">Email</h4>
                <p className="text-gray-300">madishanstudios@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Team Values */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Our Values</h2>
              <p className="text-gray-400">The principles that guide everything we do</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-2xl text-center hover:border-blue-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white">lightbulb</span>
                </div>
                <h4 className="font-bold text-white mb-2">Innovation</h4>
                <p className="text-gray-300 text-sm">Pushing boundaries with creative solutions</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-2xl text-center hover:border-green-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white">accessibility</span>
                </div>
                <h4 className="font-bold text-white mb-2">Accessibility</h4>
                <p className="text-gray-300 text-sm">Gaming for everyone, everywhere</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-2xl text-center hover:border-purple-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-white">star</span>
                </div>
                <h4 className="font-bold text-white mb-2">Quality</h4>
                <p className="text-gray-300 text-sm">Excellence in every gaming experience</p>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-2xl text-center hover:border-orange-500/50 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-icons text-black">diversity_3</span>
                </div>
                <h4 className="font-bold text-white mb-2">Community</h4>
                <p className="text-gray-300 text-sm">Building connections through gaming</p>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <Link href="/">
                <button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105">
                  <span className="flex items-center">
                    <span className="material-icons mr-2">sports_esports</span>
                    Start Playing Now
                  </span>
                </button>
              </Link>
            </div>
            
            <div className="text-center">
              <Link href="/contact">
                <button className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold px-8 py-3 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105">
                  <span className="flex items-center">
                    <span className="material-icons mr-2">contact_support</span>
                    Get in Touch
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