import React from "react";
import { Link } from "wouter";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="material-icons text-4xl text-black">contact_mail</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Contact Us</h1>
          <p className="text-xl text-black/80 max-w-2xl mx-auto">
            Get in touch with the GamesChakra team. We're here to help with any questions or feedback.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-black">phone</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Call Us</h3>
                </div>
                <p className="text-gray-300 text-lg">+91 9953105778</p>
                <p className="text-gray-400 text-sm mt-2">Monday to Friday, 9 AM - 6 PM IST</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-sky-500 rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">email</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Email Us</h3>
                </div>
                <p className="text-gray-300 text-lg">madishanstudios@gmail.com</p>
                <p className="text-gray-400 text-sm mt-2">We'll respond within 24 hours</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-4">
                    <span className="material-icons text-white">business</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Business</h3>
                </div>
                <p className="text-gray-300 text-lg">Madishan Studios</p>
                <p className="text-gray-400 text-sm mt-2">Gaming & Entertainment</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mr-4">
                  <span className="material-icons text-white">send</span>
                </div>
                <h3 className="text-2xl font-bold text-white">Send Message</h3>
              </div>
              
              <form className="space-y-6">
                <div>
                  <label className="block text-white font-medium mb-2">Name *</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Your full name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Email *</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Subject *</label>
                  <select className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="business">Business Partnership</option>
                    <option value="feedback">Feedback</option>
                    <option value="bug">Report a Bug</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Message *</label>
                  <textarea 
                    rows={5}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-vertical"
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold py-3 px-6 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 shadow-2xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6">
                <span className="material-icons text-3xl text-white">help_outline</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-400">Quick answers to common questions</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <h4 className="font-bold text-white mb-2">How do I submit a game?</h4>
                  <p className="text-gray-300 text-sm">Visit our Developer Portal to submit your HTML5 games for review and publication.</p>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <h4 className="font-bold text-white mb-2">Are games free to play?</h4>
                  <p className="text-gray-300 text-sm">Yes! All games on GamesChakra are completely free to play with no downloads required.</p>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <h4 className="font-bold text-white mb-2">Do you have mobile games?</h4>
                  <p className="text-gray-300 text-sm">Many of our HTML5 games are mobile-optimized and work great on phones and tablets.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <h4 className="font-bold text-white mb-2">How do I report a bug?</h4>
                  <p className="text-gray-300 text-sm">Use the contact form above with "Report a Bug" selected, or email us directly.</p>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <h4 className="font-bold text-white mb-2">Can I advertise on your site?</h4>
                  <p className="text-gray-300 text-sm">For advertising inquiries, please contact us using "Business Partnership" in the form above.</p>
                </div>
                
                <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30">
                  <h4 className="font-bold text-white mb-2">Do you offer game licensing?</h4>
                  <p className="text-gray-300 text-sm">Yes, we offer licensing opportunities. Contact us for more information about our developer program.</p>
                </div>
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
  );
}