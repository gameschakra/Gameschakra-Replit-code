import React from "react";
import { Link } from "wouter";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <span className="material-icons text-4xl text-white">description</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Terms & Conditions</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Please read these terms carefully before using GamesChakra. By using our service, you agree to these terms.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8 md:p-12 shadow-2xl">
            <div className="prose prose-lg max-w-none prose-invert">
              {/* Last Updated Info */}
              <div className="bg-emerald-600/20 border border-emerald-500/30 rounded-lg p-6 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-emerald-400 mr-3">schedule</span>
                  <h2 className="text-xl font-bold text-white m-0">Last Updated</h2>
                </div>
                <p className="text-gray-300 mb-0">These Terms & Conditions were last updated on January 1, 2025.</p>
              </div>
            
              {/* Welcome Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-blue-400 mr-3">waving_hand</span>
                  <h2 className="text-2xl font-bold text-white m-0">Welcome to GamesChakra!</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">These terms and conditions outline the rules and regulations for the use of GamesChakra's Website, located at <a href="https://www.gameschakra.com/" className="text-emerald-400 hover:text-emerald-300 underline">https://www.gameschakra.com/</a>.</p>
                <p className="text-gray-300 leading-relaxed mb-4">By accessing this website we assume you accept these terms and conditions. Do not continue to use GamesChakra if you do not agree to take all of the terms and conditions stated on this page.</p>
                <p className="text-gray-300 leading-relaxed mb-0">The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and all Agreements: "Client", "You" and "Your" refers to you, the person log on this website and compliant to the Company's terms and conditions. "The Company", "Ourselves", "We", "Our" and "Us", refers to our Company. "Party", "Parties", or "Us", refers to both the Client and ourselves.</p>
              </div>
              
              {/* User Accounts Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-blue-400 mr-3">account_circle</span>
                  <h2 className="text-2xl font-bold text-white m-0">User Accounts and Registration</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">To access certain features of GamesChakra, you may be required to create an account. When registering for an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Provide accurate information:</strong> All information provided during registration must be current, complete, and accurate</li>
                  <li><strong>Maintain security:</strong> You are responsible for maintaining the confidentiality of your account credentials</li>
                  <li><strong>Accept responsibility:</strong> You are responsible for all activities that occur under your account</li>
                  <li><strong>Notify us of unauthorized use:</strong> You must immediately notify us of any unauthorized access to your account</li>
                </ul>
                
                <h3 className="text-lg font-bold text-white mb-3">Google OAuth Authentication</h3>
                <p className="text-gray-300 leading-relaxed mb-4">We offer Google OAuth as an authentication method. By using Google sign-in, you acknowledge that:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li>Your Google account information (name, email, profile picture) will be used to create your GamesChakra account</li>
                  <li>You consent to our access to your basic Google profile information as outlined in our Privacy Policy</li>
                  <li>Google's Terms of Service and Privacy Policy also apply to your use of Google authentication</li>
                  <li>You can revoke this access through your Google Account settings at any time</li>
                </ul>
                
                <p className="text-gray-300 leading-relaxed mb-0">We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or illegal activities.</p>
              </div>
              
              {/* Data Collection and Use Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-green-400 mr-3">storage</span>
                  <h2 className="text-2xl font-bold text-white m-0">Data Collection and Use</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">By using GamesChakra, you acknowledge and consent to our collection and use of your information as described in our <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">Privacy Policy</Link>. This includes:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Account Information:</strong> Personal details provided during registration or through Google OAuth</li>
                  <li><strong>Gaming Activity:</strong> Game play history, scores, achievements, favorites, and preferences</li>
                  <li><strong>Technical Data:</strong> IP address, browser information, device details, and usage analytics</li>
                  <li><strong>Communication Data:</strong> Messages, support requests, and feedback you provide</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-0">You have the right to access, modify, or delete your personal data as outlined in our Privacy Policy and applicable data protection laws.</p>
              </div>
              
              {/* Cookies Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-amber-400 mr-3">cookie</span>
                  <h2 className="text-2xl font-bold text-white m-0">Cookies and Tracking</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">We employ the use of cookies and similar tracking technologies. By accessing GamesChakra, you consent to the use of cookies in agreement with our Privacy Policy.</p>
                
                <h3 className="text-lg font-bold text-white mb-3">Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Essential Cookies:</strong> Required for login functionality and account management</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how you use our website to improve user experience</li>
                  <li><strong>Advertising Cookies:</strong> Used by Google AdSense to display relevant advertisements</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and customization choices</li>
                </ul>
                
                <p className="text-gray-300 leading-relaxed mb-0">You can control cookie preferences through your browser settings, though disabling certain cookies may affect website functionality. Third-party advertising partners like Google may also use cookies as described in their privacy policies.</p>
              </div>
              
              {/* License Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-purple-400 mr-3">license</span>
                  <h2 className="text-2xl font-bold text-white m-0">License</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">Unless otherwise stated, GamesChakra and/or its licensors own the intellectual property rights for all material on GamesChakra. All intellectual property rights are reserved. You may access this from GamesChakra for your own personal use subjected to restrictions set in these terms and conditions.</p>
                <p className="text-gray-300 leading-relaxed mb-4">You must not:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li>Republish material from GamesChakra</li>
                  <li>Sell, rent or sub-license material from GamesChakra</li>
                  <li>Reproduce, duplicate or copy material from GamesChakra</li>
                  <li>Redistribute content from GamesChakra</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-0">This Agreement shall begin on the date hereof.</p>
              </div>
              
              {/* Third-Party Services Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-blue-400 mr-3">integration_instructions</span>
                  <h2 className="text-2xl font-bold text-white m-0">Third-Party Services and Advertising</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">GamesChakra integrates with various third-party services to provide you with enhanced functionality. By using our website, you also agree to the terms and policies of these services:</p>
                
                <h3 className="text-lg font-bold text-white mb-3">Google Services</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Google OAuth:</strong> For authentication and account management</li>
                  <li><strong>Google AdSense:</strong> For displaying targeted advertisements</li>
                  <li><strong>Google Analytics:</strong> For website analytics and performance monitoring</li>
                </ul>
                
                <h3 className="text-lg font-bold text-white mb-3">Advertising Terms</h3>
                <p className="text-gray-300 leading-relaxed mb-4">We display advertisements through Google AdSense. By using our website, you acknowledge that:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li>Advertisements are provided by third parties and not endorsed by GamesChakra</li>
                  <li>We are not responsible for the content, accuracy, or practices of advertisers</li>
                  <li>Clicking on ads may redirect you to external websites governed by their own terms</li>
                  <li>Ad personalization is managed by Google and can be controlled through your Google Ad Settings</li>
                </ul>
                
                <p className="text-gray-300 leading-relaxed mb-0">These third-party services have their own terms of service and privacy policies. We encourage you to review them as they govern your use of those services.</p>
              </div>
              
              {/* User Conduct Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-pink-400 mr-3">group</span>
                  <h2 className="text-2xl font-bold text-white m-0">User Conduct and Acceptable Use</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">When using GamesChakra, you agree to conduct yourself respectfully and responsibly. You must not:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li><strong>Violate laws:</strong> Engage in any illegal activities or violate applicable laws</li>
                  <li><strong>Harm others:</strong> Harass, threaten, or harm other users or third parties</li>
                  <li><strong>Misuse accounts:</strong> Create fake accounts, share accounts, or impersonate others</li>
                  <li><strong>Distribute malware:</strong> Upload viruses, malware, or malicious code</li>
                  <li><strong>Spam or abuse:</strong> Send unsolicited messages or abuse our platform features</li>
                  <li><strong>Infringe rights:</strong> Violate intellectual property rights or privacy of others</li>
                  <li><strong>Circumvent security:</strong> Attempt to bypass security measures or access restrictions</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-0">Violation of these conduct rules may result in account suspension, termination, and potential legal action. We reserve the right to investigate and take appropriate action against violators.</p>
              </div>
              
              {/* Hyperlinking Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-cyan-400 mr-3">link</span>
                  <h2 className="text-2xl font-bold text-white m-0">Hyperlinking to our Content</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">The following organizations may link to our Website without prior written approval:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li>Government agencies;</li>
                  <li>Search engines;</li>
                  <li>News organizations;</li>
                  <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and</li>
                  <li>System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-0">These organizations may link to our home page, to publications or to other Website information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party's site.</p>
              </div>
              
              {/* iFrames Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-orange-400 mr-3">web_asset</span>
                  <h2 className="text-2xl font-bold text-white m-0">iFrames</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">Without prior approval and written permission, you may not create frames around our Webpages that alter in any way the visual presentation or appearance of our Website.</p>
              </div>
              
              {/* Content Liability Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-red-400 mr-3">warning</span>
                  <h2 className="text-2xl font-bold text-white m-0">Content Liability</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">We shall not be hold responsible for any content that appears on your Website. You agree to protect and defend us against all claims that is rising on your Website. No link(s) should appear on any Website that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>
              </div>
              
              {/* Your Privacy Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-green-400 mr-3">privacy_tip</span>
                  <h2 className="text-2xl font-bold text-white m-0">Your Privacy</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">Please read <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 underline">Privacy Policy</Link></p>
              </div>
              
              {/* Reservation of Rights Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-indigo-400 mr-3">gavel</span>
                  <h2 className="text-2xl font-bold text-white m-0">Reservation of Rights</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-0">We reserve the right to request that you remove all links or any particular link to our Website. You approve to immediately remove all links to our Website upon request. We also reserve the right to amen these terms and conditions and it's linking policy at any time. By continuously linking to our Website, you agree to be bound to and follow these linking terms and conditions.</p>
              </div>
              
              {/* Disclaimer Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-yellow-400 mr-3">info</span>
                  <h2 className="text-2xl font-bold text-white m-0">Disclaimer</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. Nothing in this disclaimer will:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li>limit or exclude our or your liability for death or personal injury;</li>
                  <li>limit or exclude our or your liability for fraud or fraudulent misrepresentation;</li>
                  <li>limit any of our or your liabilities in any way that is not permitted under applicable law; or</li>
                  <li>exclude any of our or your liabilities that may not be excluded under applicable law.</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-4">The limitations and prohibitions of liability set in this Section and elsewhere in this disclaimer:</p>
                <p className="text-gray-300 leading-relaxed mb-4">(a) are subject to the preceding paragraph; and</p>
                <p className="text-gray-300 leading-relaxed mb-4">(b) govern all liabilities arising under the disclaimer, including liabilities arising in contract, in tort and for breach of statutory duty.</p>
                <p className="text-gray-300 leading-relaxed mb-0">As long as the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>
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