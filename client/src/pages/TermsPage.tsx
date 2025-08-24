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
              
              {/* Cookies Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-amber-400 mr-3">cookie</span>
                  <h2 className="text-2xl font-bold text-white m-0">Cookies</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">We employ the use of cookies. By accessing GamesChakra, you agreed to use cookies in agreement with the GamesChakra's Privacy Policy.</p>
                <p className="text-gray-300 leading-relaxed mb-0">Most interactive websites use cookies to let us retrieve the user's details for each visit. Cookies are used by our website to enable the functionality of certain areas to make it easier for people visiting our website. Some of our affiliate/advertising partners may also use cookies.</p>
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
              
              {/* User Comments Section */}
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 mb-8">
                <div className="flex items-center mb-4">
                  <span className="material-icons text-pink-400 mr-3">forum</span>
                  <h2 className="text-2xl font-bold text-white m-0">User Comments</h2>
                </div>
                <p className="text-gray-300 leading-relaxed mb-4">Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. GamesChakra does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of GamesChakra, its agents and/or affiliates.</p>
                <p className="text-gray-300 leading-relaxed mb-4">GamesChakra reserves the right to monitor all Comments and to remove any Comments which can be considered inappropriate, offensive or causes breach of these Terms and Conditions.</p>
                <p className="text-gray-300 leading-relaxed mb-4">You warrant and represent that:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-300 mb-4">
                  <li>You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;</li>
                  <li>The Comments do not invade any intellectual property right, including without limitation copyright, patent or trademark of any third party;</li>
                  <li>The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material which is an invasion of privacy;</li>
                  <li>The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.</li>
                </ul>
                <p className="text-gray-300 leading-relaxed mb-0">You hereby grant GamesChakra a non-exclusive license to use, reproduce, edit and authorize others to use, reproduce and edit any of your Comments in any and all forms, formats or media.</p>
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