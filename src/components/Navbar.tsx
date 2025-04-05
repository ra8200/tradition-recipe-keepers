
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, BookOpen, User, LogOut } from 'lucide-react';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
  } | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogin, onLogout }) => {
  return (
    <nav className="bg-white border-b border-recipe-300 py-3 px-4 md:px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <UtensilsCrossed className="h-6 w-6 text-spice-600" />
          <span className="text-xl font-serif font-semibold text-recipe-800">Family Traditions</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link to="/recipes" className="text-recipe-700 hover:text-recipe-900 transition-colors">
            Recipes
          </Link>
          <Link to="/books" className="text-recipe-700 hover:text-recipe-900 transition-colors">
            Recipe Books
          </Link>
          <Link to="/about" className="text-recipe-700 hover:text-recipe-900 transition-colors">
            About
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 text-recipe-700 hover:text-recipe-900">
                <User className="h-5 w-5" />
                <span className="hidden md:inline">{user.name}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={onLogout} title="Log out">
                <LogOut className="h-5 w-5 text-recipe-700" />
              </Button>
            </div>
          ) : (
            <Button onClick={onLogin} variant="outline" className="border-recipe-400 text-recipe-700 hover:bg-recipe-200">
              Log In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
