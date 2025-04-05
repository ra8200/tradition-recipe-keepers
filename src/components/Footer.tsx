
import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-recipe-800 text-recipe-100 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <UtensilsCrossed className="h-6 w-6 text-spice-400" />
            <span className="text-xl font-serif font-semibold">Family Traditions</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/about" className="text-recipe-100 hover:text-white transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-recipe-100 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-recipe-100 hover:text-white transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-recipe-100 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <div className="text-center text-recipe-300 text-sm pt-4 border-t border-recipe-700">
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-spice-400" fill="currentColor" /> for families everywhere
          </p>
          <p className="mt-1">© {new Date().getFullYear()} Family Traditions. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
