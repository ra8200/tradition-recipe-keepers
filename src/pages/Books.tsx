
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import RecipeBookCard from '@/components/RecipeBookCard';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface RecipeBook {
  id: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
}

interface RecipeCount {
  book_id: string;
  count: number;
}

interface MemberCount {
  book_id: string;
  count: number;
}

const Books = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    const fetchBooks = async () => {
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
          setBooks([]);
          setLoading(false);
          return;
        }

        const bookIds = memberBooks.map(book => book.book_id);
        
        // Get details for all these books
        const { data: booksData, error: booksError } = await supabase
          .from('recipe_books')
          .select('*')
          .in('id', bookIds);

        if (booksError) throw booksError;
        
        // Get recipe counts for each book using raw SQL count
        const recipeCounts: Record<string, number> = {};
        
        for (const bookId of bookIds) {
          const { count, error } = await supabase
            .from('recipes')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', bookId);
            
          if (error) throw error;
          recipeCounts[bookId] = count || 0;
        }
        
        // Get member counts for each book
        const memberCounts: Record<string, number> = {};
        
        for (const bookId of bookIds) {
          const { count, error } = await supabase
            .from('recipe_book_members')
            .select('*', { count: 'exact', head: true })
            .eq('book_id', bookId);
            
          if (error) throw error;
          memberCounts[bookId] = count || 0;
        }
        
        // Combine all data
        const booksWithCounts = booksData.map(book => {
          return {
            ...book,
            recipeCount: recipeCounts[book.id] || 0,
            membersCount: memberCounts[book.id] || 0
          };
        });
        
        setBooks(booksWithCounts);
      } catch (error: any) {
        console.error('Error fetching recipe books:', error);
        toast({
          title: "Error fetching recipe books",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null} 
        onLogin={handleLogin} 
        onLogout={signOut} 
      />
      
      <main className="flex-grow bg-recipe-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-serif text-recipe-800">My Recipe Books</h1>
            {user && (
              <Link to="/books/create">
                <Button className="bg-spice-600 hover:bg-spice-700">
                  <PlusCircle className="mr-2 h-4 w-4" /> Create New Book
                </Button>
              </Link>
            )}
          </div>
          
          {user ? (
            <>
              {loading ? (
                <div className="text-center py-16">
                  <p className="text-recipe-600">Loading recipe books...</p>
                </div>
              ) : books.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map(book => (
                    <RecipeBookCard
                      key={book.id}
                      id={book.id}
                      title={book.title}
                      description={book.description}
                      recipeCount={book.recipeCount}
                      membersCount={book.membersCount}
                      coverImageUrl={book.cover_image_url}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white rounded-lg border border-recipe-300 shadow-sm">
                  <h2 className="text-2xl font-serif text-recipe-800 mb-4">No Recipe Books Yet</h2>
                  <p className="text-recipe-600 max-w-md mx-auto mb-6">
                    You haven't created or been added to any recipe books yet. Create your first recipe book to get started.
                  </p>
                  <Link to="/books/create">
                    <Button className="bg-spice-600 hover:bg-spice-700">
                      <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Recipe Book
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg border border-recipe-300 shadow-sm">
              <h2 className="text-2xl font-serif text-recipe-800 mb-4">Sign In to View Your Recipe Books</h2>
              <p className="text-recipe-600 max-w-md mx-auto mb-6">
                You need to be signed in to view and manage your family recipe books.
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

export default Books;
