
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  title: string;
  description: string;
  cook_time: string;
  servings: number;
  book_id: string;
  image_url?: string;
  book_title?: string;
}

const Recipes = () => {
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Get all recipe books the user is a member of
        const { data: memberBooks, error: memberError } = await supabase
          .from('recipe_book_members')
          .select('book_id')
          .eq('user_id', user.id);

        if (memberError) throw memberError;

        if (!memberBooks || memberBooks.length === 0) {
          setRecipes([]);
          setLoading(false);
          return;
        }

        const bookIds = memberBooks.map(book => book.book_id);
        
        // Get all recipes from these books
        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .in('book_id', bookIds);

        if (recipesError) throw recipesError;
        
        if (!recipesData || recipesData.length === 0) {
          setRecipes([]);
          setLoading(false);
          return;
        }
        
        // Get book titles
        const { data: booksData, error: booksError } = await supabase
          .from('recipe_books')
          .select('id, title')
          .in('id', bookIds);

        if (booksError) throw booksError;
        
        // Map book titles to recipes
        const recipesWithBookNames = recipesData.map(recipe => {
          const book = booksData?.find(b => b.id === recipe.book_id);
          return {
            ...recipe,
            book_title: book?.title || 'Unknown Book'
          };
        });
        
        setRecipes(recipesWithBookNames);
      } catch (error: any) {
        console.error('Error fetching recipes:', error);
        toast({
          title: "Error fetching recipes",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [user]);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const filteredRecipes = recipes.filter(recipe => 
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipe.book_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null} 
        onLogin={handleLogin} 
        onLogout={signOut} 
      />
      
      <main className="flex-grow bg-recipe-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h1 className="text-3xl font-serif text-recipe-800">All Recipes</h1>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-recipe-500 h-4 w-4" />
                <Input 
                  placeholder="Search recipes..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {user && recipes.length > 0 && (
                <Link to="/books">
                  <Button className="bg-spice-600 hover:bg-spice-700 whitespace-nowrap">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Recipe
                  </Button>
                </Link>
              )}
            </div>
          </div>
          
          {user ? (
            <>
              {loading ? (
                <div className="text-center py-16">
                  <Loader className="h-8 w-8 animate-spin text-spice-600 mx-auto mb-4" />
                  <p className="text-recipe-600">Loading recipes...</p>
                </div>
              ) : filteredRecipes.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      id={recipe.id}
                      title={recipe.title}
                      description={recipe.description || ''}
                      cookTime={recipe.cook_time || 'Not specified'}
                      servings={recipe.servings || 0}
                      bookName={recipe.book_title || 'Unknown Book'}
                      bookId={recipe.book_id}
                      imageUrl={recipe.image_url}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-recipe-300 shadow-sm">
                  <h2 className="text-2xl font-serif text-recipe-800 mb-2">
                    {searchQuery ? "No Recipes Found" : "No Recipes Yet"}
                  </h2>
                  <p className="text-recipe-600 mb-6">
                    {searchQuery 
                      ? "No recipes match your search. Try different keywords." 
                      : "You haven't added any recipes to your books yet."}
                  </p>
                  {!searchQuery && (
                    <Link to="/books">
                      <Button className="bg-spice-600 hover:bg-spice-700">
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Recipe
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-recipe-300 shadow-sm">
              <h2 className="text-2xl font-serif text-recipe-800 mb-4">Sign In to View Recipes</h2>
              <p className="text-recipe-600 max-w-md mx-auto mb-6">
                You need to be signed in to view and manage your family recipes.
              </p>
              <Button onClick={handleLogin} className="bg-spice-600 hover:bg-spice-700">
                Sign In Now
              </Button>
            </div>
          )}
        </div>
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

export default Recipes;
