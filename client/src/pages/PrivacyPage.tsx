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
                <p className="text-gray-300 leading-relaxed mb-4">We collect information you provide directly to us and automatically when you use our service:</p>
                
                <h3 className="text-lg font-bold text-white mb-3">Account Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Registration Data:</strong> Name, email address, username, phone number, city, country</li>
                  <li><strong>Profile Information:</strong> Avatar/profile picture, gaming preferences, account settings</li>
                  <li><strong>Authentication Data:</strong> Password (encrypted) or third-party authentication tokens</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Google OAuth Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Google Profile Data:</strong> When you sign in with Google, we receive your name, email address, and profile picture</li>
                  <li><strong>OAuth Tokens:</strong> We store authentication tokens to maintain your login session</li>
                  <li><strong>Google ID:</strong> Your unique Google account identifier for account linking</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Gaming Activity Data</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Game Play History:</strong> Games played, play duration, scores, and achievements</li>
                  <li><strong>Favorites:</strong> Games you've marked as favorites</li>
                  <li><strong>Recently Played:</strong> Your recent gaming activity</li>
                  <li><strong>User Preferences:</strong> Game categories, difficulty settings, display preferences</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Technical Information</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-0">
                  <li><strong>Device Information:</strong> Browser type, operating system, screen resolution</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent, click patterns, search queries</li>
                  <li><strong>IP Address:</strong> For security and analytics purposes</li>
                  <li><strong>Cookies:</strong> Session cookies, preference cookies, and analytics cookies</li>
                </ul>
              </div>
              
              {/* How We Use Information Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-purple-400 mr-3">analytics</span>
                  <h2 className="text-2xl font-bold text-white m-0">How we use your information</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">We use the information we collect in various ways, including to:</p>
                
                <h3 className="text-lg font-bold text-white mb-3">Core Platform Services</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Account Management:</strong> Create, maintain, and manage your user account and profile</li>
                  <li><strong>Authentication:</strong> Verify your identity and provide secure access to our platform</li>
                  <li><strong>Game Services:</strong> Deliver game content, track your progress, save your achievements and favorites</li>
                  <li><strong>Personalization:</strong> Customize game recommendations and content based on your preferences</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Google OAuth Data Usage</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Account Creation:</strong> Use your Google profile information to create your GamesChakra account</li>
                  <li><strong>Profile Setup:</strong> Populate your profile with your Google name, email, and profile picture</li>
                  <li><strong>Single Sign-On:</strong> Enable seamless login without requiring separate passwords</li>
                  <li><strong>Account Linking:</strong> Connect your Google account with your gaming profile and activity</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Communication & Support</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Customer Service:</strong> Respond to your inquiries, provide technical support, and resolve issues</li>
                  <li><strong>Platform Updates:</strong> Send important notifications about service changes, new features, or security updates</li>
                  <li><strong>Optional Marketing:</strong> With your consent, share news about new games and platform features</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Analytics & Improvement</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Usage Analytics:</strong> Understand how users interact with our platform to improve user experience</li>
                  <li><strong>Performance Monitoring:</strong> Track technical performance and identify areas for optimization</li>
                  <li><strong>Feature Development:</strong> Analyze user behavior to develop new games, features, and functionality</li>
                  <li><strong>Security:</strong> Monitor for suspicious activity, prevent fraud, and protect user accounts</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Legal & Compliance</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300">
                  <li><strong>Legal Obligations:</strong> Comply with applicable laws, regulations, and legal processes</li>
                  <li><strong>Terms Enforcement:</strong> Ensure compliance with our Terms of Service and community guidelines</li>
                  <li><strong>Data Protection:</strong> Maintain security and integrity of user data and our platform</li>
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
              
              {/* Data Retention Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-green-400 mr-3">schedule</span>
                  <h2 className="text-2xl font-bold text-white m-0">Data Retention</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy:</p>
                
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Account Data:</strong> We retain your account information while your account is active and for up to 3 years after account deletion</li>
                  <li><strong>Google OAuth Data:</strong> Authentication tokens are refreshed regularly and expired tokens are automatically deleted</li>
                  <li><strong>Gaming Activity:</strong> Game play history, scores, and achievements are retained while your account is active</li>
                  <li><strong>Technical Logs:</strong> Server logs and analytics data are retained for up to 12 months for security and performance monitoring</li>
                  <li><strong>Marketing Communications:</strong> Email marketing data is retained until you unsubscribe or request deletion</li>
                </ul>
                
                <p className="text-gray-300 leading-relaxed mb-0">You can request deletion of your personal data at any time by contacting us. Some information may be retained longer if required by law or for legitimate business purposes such as fraud prevention.</p>
              </div>
              
              {/* Third-Party Services Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-blue-400 mr-3">integration_instructions</span>
                  <h2 className="text-2xl font-bold text-white m-0">Third-Party Services</h2>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-3">Google Services</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Google OAuth:</strong> When you sign in with Google, we use Google's authentication service. Google may collect information about your use of our service. See <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a></li>
                  <li><strong>Google AdSense:</strong> We use Google AdSense to display advertisements. Google may use cookies and personal data to provide relevant ads. You can control ad personalization in your <a href="https://adssettings.google.com/" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a></li>
                  <li><strong>Google Analytics:</strong> We use Google Analytics to understand how users interact with our website. This service collects anonymous usage data</li>
                </ul>

                <h3 className="text-lg font-bold text-white mb-3">Data Sharing</h3>
                <p className="text-gray-300 leading-relaxed mb-0">We do not sell, trade, or rent your personal data to third parties. We may share data with service providers (like Google) only to provide our services and only as described in their privacy policies. All third-party services we use are GDPR and CCPA compliant.</p>
              </div>

              {/* Google DoubleClick DART Cookie Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-red-400 mr-3">ads_click</span>
                  <h2 className="text-2xl font-bold text-white m-0">Advertising & Cookies</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">We use Google AdSense and other advertising partners to display ads on our website. These services may use cookies and tracking technologies:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>DART Cookies:</strong> Google uses DART cookies to serve ads based on your visits to our site and other sites</li>
                  <li><strong>Personalized Ads:</strong> Ads may be personalized based on your interests and browsing behavior</li>
                  <li><strong>Opt-out Options:</strong> You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">Google Ad Settings</a></li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-0">For more information about Google's advertising practices, visit: <a href="https://policies.google.com/technologies/ads" className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a></p>
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