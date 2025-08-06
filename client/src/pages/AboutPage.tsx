import React from "react";
import { Link } from "wouter";

export default function AboutPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-4xl font-bold text-primary mb-6 text-center">Hi there, gaming fam!</h1>
            
            <div className="space-y-4 text-gray-700">
              <p className="text-xl font-medium text-center">The next generation of gaming is finally here to reign the gaming world.</p>
              
              <p>Creative developers at GAMESCHAKRA wanted to transform the gaming world with utter creativity, user-friendly features and fun, so we created an integrated, adaptable, and innovative gaming platform inclusive for one and all.</p>
              
              <p>Stuck on what to play? Well, turn on your gaming gears and get ready to evolve your gaming experience.</p>
              
              <p>Our games are designed to stay on the cutting edge of innovation and advanced technology is our magic!</p>
              
              <p>Play with anyone, anywhere, on any device, it's that easy!</p>
              
              <p>Gameschakra has a diverse range of games developed exclusively for every age group.</p>
              
              <p>Gamify your day today and start playing. Our games are free. Let's explore the world of adventures.</p>
              
              <p>We truly value our community and strive to make your gaming experience fun-filled. Please reach out with any queries or feedbacks. We'd be more than happy to interact.</p>
              
              <div className="bg-gray-50 p-6 rounded-lg mt-8 border border-gray-200">
                <h3 className="text-xl font-bold text-primary mb-4">Contact Information</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Phone:</span> 
                    <span>+91 9953105778</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium mr-2">Email:</span> 
                    <span>madishanstudios@gmail.com</span>
                  </li>
                </ul>
              </div>
              
              <h2 className="text-3xl font-bold text-primary text-center mt-8">It's your time to WIN IT ALL.</h2>
              
              <div className="flex justify-center mt-8">
                <Link href="/">
                  <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Start Playing Now
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