
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
}

const Hero: React.FC<HeroProps> = ({ isAuthenticated, onGetStarted }) => {
  return (
    <div className="relative py-16 md:py-24 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556909114-44e3e9699e2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-recipe-900 mb-4">
            Preserve Your Family's Culinary Heritage
          </h1>
          <p className="text-lg md:text-xl text-recipe-700 mb-8">
            Collect, organize, and share your family's precious recipes across generations in beautiful digital cookbooks.
          </p>
          <div className="flex flex-wrap gap-4">
            {isAuthenticated ? (
              <Link to="/books">
                <Button className="bg-spice-600 hover:bg-spice-700 text-white">
                  My Recipe Books
                </Button>
              </Link>
            ) : (
              <Button onClick={onGetStarted} className="bg-spice-600 hover:bg-spice-700 text-white">
                Get Started
              </Button>
            )}
            <Link to="/about">
              <Button variant="outline" className="border-recipe-400 text-recipe-700 hover:bg-recipe-200">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
