
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Book, Users, Upload, ShieldCheck, UtensilsCrossed } from 'lucide-react';

const About = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
    setIsAuthModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
      
      <main className="flex-grow">
        <div className="bg-recipe-200 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-serif text-recipe-800 text-center">About Family Traditions</h1>
          </div>
        </div>
        
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
              <div className="md:w-1/2">
                <UtensilsCrossed className="h-16 w-16 text-spice-600 mb-4" />
                <h2 className="text-3xl font-serif text-recipe-800 mb-4">Our Mission</h2>
                <p className="text-recipe-700 mb-4">
                  Family Traditions was born from a simple yet powerful idea: to preserve the culinary heritage that binds families together across generations.
                </p>
                <p className="text-recipe-700">
                  We believe that every recipe tells a story, and every family has a unique culinary legacy worth preserving. Our mission is to provide a beautiful, intuitive platform where these recipes and stories can live on forever.
                </p>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1551645701-0e68cfc880f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Family cooking together" 
                  className="rounded-lg shadow-md w-full"
                />
              </div>
            </div>
            
            <h2 className="text-3xl font-serif text-recipe-800 mb-6 text-center">Why We're Different</h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-recipe-100 p-6 rounded-lg border border-recipe-300">
                <Book className="h-8 w-8 text-spice-600 mb-3" />
                <h3 className="text-xl font-serif text-recipe-800 mb-2">Family-Centered Organization</h3>
                <p className="text-recipe-700">
                  Unlike generic recipe apps, we built Family Traditions specifically to organize recipes by family branches, allowing you to preserve each side's unique culinary heritage.
                </p>
              </div>
              
              <div className="bg-recipe-100 p-6 rounded-lg border border-recipe-300">
                <Users className="h-8 w-8 text-spice-600 mb-3" />
                <h3 className="text-xl font-serif text-recipe-800 mb-2">Collaborative by Design</h3>
                <p className="text-recipe-700">
                  Our platform enables multi-generational collaboration with customizable permissions, so grandma can share her secrets while the grandkids can add their modern twist.
                </p>
              </div>
              
              <div className="bg-recipe-100 p-6 rounded-lg border border-recipe-300">
                <Upload className="h-8 w-8 text-spice-600 mb-3" />
                <h3 className="text-xl font-serif text-recipe-800 mb-2">Preservation of Originals</h3>
                <p className="text-recipe-700">
                  We know those handwritten recipe cards are treasures. Our OCR technology digitizes them while preserving the original images, handwriting and all.
                </p>
              </div>
              
              <div className="bg-recipe-100 p-6 rounded-lg border border-recipe-300">
                <ShieldCheck className="h-8 w-8 text-spice-600 mb-3" />
                <h3 className="text-xl font-serif text-recipe-800 mb-2">Privacy & Control</h3>
                <p className="text-recipe-700">
                  Your family recipes are yours. We provide robust privacy controls so you decide exactly who can access, edit, or contribute to your culinary heritage.
                </p>
              </div>
            </div>
            
            <div className="bg-recipe-200 p-8 rounded-lg text-center">
              <h2 className="text-3xl font-serif text-recipe-800 mb-4">Join Our Community</h2>
              <p className="text-recipe-700 mb-6 max-w-2xl mx-auto">
                Every day, families around the world are using Family Traditions to rediscover, preserve, and share the recipes that have shaped their lives and memories.
              </p>
              <p className="font-serif text-xl text-recipe-700 italic">"Every recipe has a story. What's yours?"</p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default About;
