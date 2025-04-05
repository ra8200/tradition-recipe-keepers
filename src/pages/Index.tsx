
import React, { useState } from 'react';
import Hero from '@/components/Hero';
import FeatureSection from '@/components/FeatureSection';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setIsAuthModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null} 
        onLogin={handleLogin} 
        onLogout={signOut} 
      />
      
      <main className="flex-grow">
        <Hero isAuthenticated={!!user} onGetStarted={handleLogin} />
        <FeatureSection />
        
        <section className="py-16 bg-white text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-serif text-recipe-800 mb-4">Start Your Family Recipe Collection Today</h2>
            <p className="text-recipe-600 max-w-2xl mx-auto mb-8">
              Don't let cherished family recipes fade away. Preserve them digitally for generations to come.
            </p>
            {user ? (
              <Link to="/books/create">
                <Button className="bg-spice-600 hover:bg-spice-700 text-white">
                  Create Your First Recipe Book <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button onClick={handleLogin} className="bg-spice-600 hover:bg-spice-700 text-white">
                Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </section>
        
        <Testimonials />
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

export default Index;
