import React from "react";
import { Link } from "wouter";

export default function ParentsInfoPage() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          <div className="prose prose-lg max-w-none">
            <h1 className="text-3xl font-bold text-primary mb-6">Information for Parents</h1>
            
            <p>At GamesChakra, we are committed to providing a safe and enjoyable gaming environment for users of all ages. We understand that parents and guardians want to make informed decisions about the content their children access online.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Game Content and Age Ratings</h2>
            
            <p>All games on our platform are categorized and include age recommendations. We encourage parents to review game descriptions and ratings before allowing children to play.</p>
            
            <p>Our games are categorized as follows:</p>
            <ul className="list-disc pl-6 my-4">
                <li><strong>For Everyone:</strong> Suitable for all ages</li>
                <li><strong>7+:</strong> May contain mild cartoon violence</li>
                <li><strong>12+:</strong> May contain moderate fantasy violence and mild language</li>
                <li><strong>16+:</strong> May contain realistic violence, mature themes, and suggestive content</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Parental Controls</h2>
            
            <p>We recommend that parents take advantage of the following measures to ensure a safe online experience:</p>
            
            <ul className="list-disc pl-6 my-4">
                <li>Supervise your child's gaming activities</li>
                <li>Use browser parental controls to limit access to certain content</li>
                <li>Set time limits for gaming sessions</li>
                <li>Educate your children about online safety</li>
                <li>Regularly check your child's browsing history</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Privacy Protection</h2>
            
            <p>We take children's privacy seriously. We do not knowingly collect personal information from children under 13 without parental consent. For more information, please refer to our <Link href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Reporting Inappropriate Content</h2>
            
            <p>If you find any content on our platform that you believe is inappropriate for children, please contact us immediately. We take all reports seriously and will investigate promptly.</p>
            
            <h2 className="text-2xl font-bold text-primary mt-8 mb-4">Contact Us</h2>
            
            <p>If you have any questions or concerns regarding your child's safety on our platform, please don't hesitate to contact us:</p>
            
            <ul className="list-none pl-6 my-4">
                <li>Email: madishanstudios@gmail.com</li>
                <li>Phone: +91 9953105778</li>
            </ul>
            
            <div className="bg-blue-50 p-6 rounded-lg mt-8 border border-blue-100">
              <h3 className="text-xl font-bold text-primary mb-2">Tips for Safe Online Gaming</h3>
              <ul className="list-disc pl-6 my-2 space-y-2">
                <li>Encourage open communication with your children about their online activities</li>
                <li>Teach your children not to share personal information online</li>
                <li>Set clear rules about when and how long your children can play</li>
                <li>Keep gaming devices in common areas of your home</li>
                <li>Be aware of the games your children are playing</li>
              </ul>
            </div>
            
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