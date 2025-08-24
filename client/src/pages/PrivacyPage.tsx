import React from "react";
import { Link } from "wouter";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="material-icons text-4xl text-white">shield</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your privacy is important to us. Learn how we collect, use, and protect your information.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 md:p-12 shadow-2xl">
            <div className="prose prose-lg max-w-none prose-invert">
              {/* Last Updated Info */}
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-blue-400 mr-3">info</span>
                  <h2 className="text-xl font-bold text-white m-0">Last Updated</h2>
                </div>
                <p className="text-gray-300 mb-0">This Privacy Policy was last updated on January 1, 2025.</p>
              </div>
            
              <p className="text-gray-300 leading-relaxed mb-6">At GamesChakra, accessible from https://www.gameschakra.com/, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by GamesChakra and how we use it.</p>
              
              <p className="text-gray-300 leading-relaxed mb-6">If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>
              
              <p className="text-gray-300 leading-relaxed mb-8">This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in GamesChakra. This policy is not applicable to any information collected offline or via channels other than this website.</p>
              
              {/* Consent Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-green-400 mr-3">check_circle</span>
                  <h2 className="text-2xl font-bold text-white m-0">Consent</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
              </div>
              
              {/* Information We Collect Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-amber-400 mr-3">storage</span>
                  <h2 className="text-2xl font-bold text-white m-0">Information we collect</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
                <p className="text-gray-300 leading-relaxed mb-4">If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>
                <p className="text-gray-300 leading-relaxed mb-0">When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>
              </div>
              
              {/* How We Use Information Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-purple-400 mr-3">analytics</span>
                  <h2 className="text-2xl font-bold text-white m-0">How we use your information</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">We use the information we collect in various ways, including to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Provide, operate, and maintain our website</li>
                  <li>Improve, personalize, and expand our website</li>
                  <li>Understand and analyze how you use our website</li>
                  <li>Develop new products, services, features, and functionality</li>
                  <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                  <li>Send you emails</li>
                  <li>Find and prevent fraud</li>
                </ul>
              </div>
              
              {/* Log Files Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-orange-400 mr-3">description</span>
                  <h2 className="text-2xl font-bold text-white m-0">Log Files</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">GamesChakra follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>
              </div>
              
              {/* Cookies and Web Beacons Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-pink-400 mr-3">cookie</span>
                  <h2 className="text-2xl font-bold text-white m-0">Cookies and Web Beacons</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">Like any other website, GamesChakra uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>
              </div>
              
              {/* Google DoubleClick DART Cookie Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-red-400 mr-3">ads_click</span>
                  <h2 className="text-2xl font-bold text-white m-0">Google DoubleClick DART Cookie</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.gameschakra.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a></p>
              </div>
              
              {/* CCPA Privacy Rights Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-indigo-400 mr-3">gavel</span>
                  <h2 className="text-2xl font-bold text-white m-0">CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">Under the CCPA, among other rights, California consumers have the right to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
                  <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
                  <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
                  <li>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</li>
                </ul>
              </div>
              
              {/* GDPR Data Protection Rights Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-cyan-400 mr-3">security</span>
                  <h2 className="text-2xl font-bold text-white m-0">GDPR Data Protection Rights</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li>The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.</li>
                  <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</li>
                  <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
                  <li>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                  <li>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</li>
                  <li>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
                  <li>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</li>
                </ul>
              </div>
              
              {/* Children's Information Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-yellow-400 mr-3">child_care</span>
                  <h2 className="text-2xl font-bold text-white m-0">Children's Information</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>
                <p className="text-gray-300 leading-relaxed mb-0">GamesChakra does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.</p>
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