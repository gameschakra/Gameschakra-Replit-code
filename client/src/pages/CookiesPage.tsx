import React from "react";
import { Link } from "wouter";

export default function CookiesPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-primary mb-6">Cookie Policy</h1>
            
            <p>At GamesChakra, we use cookies to enhance your browsing experience on our website. This Cookie Policy explains what cookies are, how we use them, and your choices regarding cookies.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">What are cookies?</h2>
            
            <p>Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">How we use cookies</h2>
            
            <p>GamesChakra uses cookies for various purposes, including:</p>
            
            <ul className="list-disc pl-6 my-4">
                <li>Essential cookies: These are necessary for the website to function properly and cannot be disabled.</li>
                <li>Performance cookies: These help us understand how visitors interact with our website by collecting and reporting information anonymously.</li>
                <li>Functionality cookies: These allow the website to remember choices you make and provide enhanced, personalized features.</li>
                <li>Targeting/advertising cookies: These are used to deliver advertisements relevant to you and your interests.</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Third-party cookies</h2>
            
            <p>In addition to our own cookies, we may also use third-party cookies from services such as Google Analytics and advertising partners to help analyze how our site is used and to deliver personalized advertisements.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Managing cookies</h2>
            
            <p>Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser. You can set your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
            
            <p>However, please note that disabling certain cookies may affect the functionality of our website and your user experience.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Updates to this policy</h2>
            
            <p>We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">More information</h2>
            
            <p>For more information about how we use your personal data, please refer to our <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>.</p>
            
            <p>If you have any questions about our Cookie Policy, please contact us at:</p>
            <ul className="list-none pl-6 my-4">
                <li>Email: madishanstudios@gmail.com</li>
                <li>Phone: +91 9953105778</li>
            </ul>
            
            <div className="mt-8">
              <Link href="/">
                <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}