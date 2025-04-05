
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import InviteModal from '@/components/InviteModal';
import InvitationsManagement from '@/components/InvitationsManagement';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

// Import refactored components
import BookHeader from '@/components/recipe-book/BookHeader';
import MembersList from '@/components/recipe-book/MembersList';
import RecipesList from '@/components/recipe-book/RecipesList';
import EditBookModal from '@/components/recipe-book/EditBookModal';
import DeleteBookDialog from '@/components/recipe-book/DeleteBookDialog';

interface RecipeBook {
  id: string;
  created_at: string;
  created_by: string;
  title: string;
  description: string;
  is_public: boolean;
}

interface Recipe {
  id: string;
  title: string;
  description: string;
  cook_time: string;
  servings: number;
  image_url: string;
  ocr_source: boolean;
}

interface Member {
  id: string;
  user_id: string;
  book_id: string;
  role: string;
  profile?: {
    email: string;
    name: string;
  };
}

const RecipeBookDetails = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { id: bookId } = useParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [book, setBook] = useState<RecipeBook | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [publicURLLoading, setPublicURLLoading] = useState(false);
  const [publicURL, setPublicURL] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [memberRole, setMemberRole] = useState('member');
  const [removingMember, setRemovingMember] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [invitationRefreshTrigger, setInvitationRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId || !user) {
        setLoading(false);
        return;
      }

      try {
        const { data: bookData, error: bookError } = await supabase
          .from('recipe_books')
          .select('*')
          .eq('id', bookId)
          .single();

        if (bookError) throw bookError;

        if (!bookData) {
          toast({
            title: "Recipe book not found",
            description: "The recipe book you're looking for doesn't exist.",
            variant: "destructive"
          });
          navigate('/books');
          return;
        }

        setBook(bookData);
        setIsPublic(bookData.is_public);
        setBookTitle(bookData.title);
        setBookDescription(bookData.description);

        const { data: recipesData, error: recipesError } = await supabase
          .from('recipes')
          .select('*')
          .eq('book_id', bookId)
          .order('created_at', { ascending: false });

        if (recipesError) throw recipesError;
        setRecipes(recipesData || []);

        const { data: membersData, error: membersError } = await supabase
          .from('recipe_book_members')
          .select('*, profile:profiles(email, name)')
          .eq('book_id', bookId);

        if (membersError) throw membersError;
        setMembers(membersData || []);

        const member = membersData?.find(m => m.user_id === user.id);
        const isCurrentUserOwner = bookData.created_by === user.id;
        const isCurrentUserAdmin = member?.role === 'admin';
        const isCurrentUserMember = !!member;

        setIsOwner(isCurrentUserOwner);
        setIsAdmin(isCurrentUserAdmin);
        setIsMember(isCurrentUserMember);
        setMemberRole(member?.role || '');
      } catch (error: any) {
        console.error('Error fetching book details:', error);
        toast({
          title: "Error loading recipe book",
          description: error.message,
          variant: "destructive"
        });
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId, user, navigate]);

  useEffect(() => {
    const generatePublicURL = async () => {
      if (!bookId || !isPublic) {
        setPublicURL(null);
        return;
      }

      setPublicURLLoading(true);
      try {
        const { data } = await supabase
          .storage
          .from('public')
          .getPublicUrl(`recipe_books/${bookId}.json`);

        setPublicURL(data.publicUrl);
      } catch (error) {
        console.error("Error generating public URL:", error);
        toast({
          title: "Error generating public URL",
          description: "Failed to generate public URL for this recipe book.",
          variant: "destructive"
        });
        setPublicURL(null);
      } finally {
        setPublicURLLoading(false);
      }
    };

    generatePublicURL();
  }, [bookId, isPublic]);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleJoinBook = async () => {
    if (!user || !bookId) return;

    setJoinLoading(true);
    try {
      const { error } = await supabase
        .from('recipe_book_members')
        .insert([{ book_id: bookId, user_id: user.id, role: 'member' }]);

      if (error) throw error;

      setIsMember(true);
      setMembers(prevMembers => [...prevMembers, { book_id: bookId, user_id: user.id, role: 'member', id: 'temp' }]);

      toast({
        title: "Joined recipe book",
        description: "You have successfully joined this recipe book.",
      });
    } catch (error: any) {
      console.error('Error joining book:', error);
      toast({
        title: "Error joining recipe book",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeaveBook = async () => {
    if (!user || !bookId) return;

    setLeaveLoading(true);
    try {
      const { error } = await supabase
        .from('recipe_book_members')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsMember(false);
      setIsAdmin(false);
      setMembers(prevMembers => prevMembers.filter(m => m.user_id !== user.id));
      setMemberRole('');

      toast({
        title: "Left recipe book",
        description: "You have successfully left this recipe book.",
      });
    } catch (error: any) {
      console.error('Error leaving book:', error);
      toast({
        title: "Error leaving recipe book",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!user || !book) return;

    setPublicURLLoading(true);
    try {
      const { error } = await supabase
        .from('recipe_books')
        .update({ is_public: !isPublic })
        .eq('id', bookId);

      if (error) throw error;

      setIsPublic(!isPublic);

      toast({
        title: "Recipe book visibility updated",
        description: `Recipe book is now ${!isPublic ? 'public' : 'private'}.`,
      });
    } catch (error: any) {
      console.error('Error toggling public status:', error);
      toast({
        title: "Error updating recipe book visibility",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setPublicURLLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (publicURL) {
      navigator.clipboard.writeText(publicURL)
        .then(() => {
          toast({
            title: "Public URL copied",
            description: "The public URL has been copied to your clipboard.",
          });
        })
        .catch(err => {
          console.error("Failed to copy public URL: ", err);
          toast({
            title: "Error copying public URL",
            description: "Failed to copy the public URL to your clipboard.",
            variant: "destructive"
          });
        });
    }
  };

  const handleEditBook = async () => {
    if (!user || !book) return;

    setEditLoading(true);
    try {
      const { error } = await supabase
        .from('recipe_books')
        .update({ title: bookTitle, description: bookDescription })
        .eq('id', bookId);

      if (error) throw error;

      setBook({ ...book, title: bookTitle, description: bookDescription });
      setIsEditModalOpen(false);

      toast({
        title: "Recipe book updated",
        description: "Recipe book details have been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating recipe book:', error);
      toast({
        title: "Error updating recipe book",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!user || !book) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('recipe_books')
        .delete()
        .eq('id', bookId);

      if (error) throw error;

      toast({
        title: "Recipe book deleted",
        description: "Recipe book has been successfully deleted.",
      });

      navigate('/books');
    } catch (error: any) {
      console.error('Error deleting recipe book:', error);
      toast({
        title: "Error deleting recipe book",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!user || !bookId) return;

    setRemovingMember(true);
    setRemovingMemberId(memberId);
    try {
      const { error } = await supabase
        .from('recipe_book_members')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', memberId);

      if (error) throw error;

      setMembers(prevMembers => prevMembers.filter(m => m.user_id !== memberId));

      toast({
        title: "Member removed",
        description: "Member has been successfully removed from the recipe book.",
      });
    } catch (error: any) {
      console.error('Error removing member:', error);
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRemovingMember(false);
      setRemovingMemberId(null);
    }
  };

  const handleInviteSuccess = () => {
    setInvitationRefreshTrigger(prev => prev + 1);
  };

  const canManageMembers = isOwner;
  const canInvite = isOwner || isAdmin;
  const canCreateRecipe = isOwner || isAdmin || isMember;

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={null}
          onLogin={handleLogin}
          onLogout={signOut}
        />

        <main className="flex-grow bg-recipe-100 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-serif text-recipe-800 mb-4">Sign In Required</h2>
            <p className="text-recipe-600 mb-6">
              You need to be signed in to view this recipe book.
            </p>
            <Button onClick={handleLogin} className="bg-spice-600 hover:bg-spice-700">
              Sign In Now
            </Button>
          </div>
        </main>

        <Footer />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => setIsAuthModalOpen(false)}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={{ name: user.user_metadata?.name || user.email || '', email: user.email || '' }}
          onLogin={handleLogin}
          onLogout={signOut}
        />

        <main className="flex-grow bg-recipe-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-spice-600 mb-4" />
            <p className="text-recipe-600">Loading recipe book...</p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={{ name: user.user_metadata?.name || user.email || '', email: user.email || '' }}
          onLogin={handleLogin}
          onLogout={signOut}
        />

        <main className="flex-grow bg-recipe-100">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-serif text-recipe-800 mb-4">Recipe Book Not Found</h2>
            <p className="text-recipe-600 mb-6">
              The recipe book you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate('/books')} className="bg-spice-600 hover:bg-spice-700">
              Back to Recipe Books
            </Button>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        user={{ name: user.user_metadata?.name || user.email || '', email: user.email || '' }}
        onLogin={handleLogin}
        onLogout={signOut}
      />

      <main className="flex-grow bg-recipe-100 p-4">
        <div className="container mx-auto">
          <BookHeader 
            book={book}
            isOwner={isOwner}
            isAdmin={isAdmin}
            isMember={isMember}
            canCreateRecipe={canCreateRecipe}
            isPublic={isPublic}
            joinLoading={joinLoading}
            leaveLoading={leaveLoading}
            publicURLLoading={publicURLLoading}
            handleJoinBook={handleJoinBook}
            handleLeaveBook={handleLeaveBook}
            handleTogglePublic={handleTogglePublic}
            handleCopyToClipboard={handleCopyToClipboard}
            setIsEditModalOpen={setIsEditModalOpen}
            setDeleteDialogOpen={setDeleteDialogOpen}
            setIsInviteModalOpen={setIsInviteModalOpen}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div className="lg:col-span-3">
              <RecipesList 
                recipes={recipes}
                bookId={bookId || ''}
                bookTitle={book.title}
                canCreateRecipe={canCreateRecipe}
              />
            </div>
            
            <div className="space-y-6">
              {canInvite && (
                <InvitationsManagement 
                  bookId={bookId || ''} 
                  refreshTrigger={invitationRefreshTrigger} 
                />
              )}
              
              <MembersList 
                members={members}
                currentUserId={user.id}
                bookOwnerId={book.created_by}
                canManageMembers={canManageMembers}
                removingMember={removingMember}
                removingMemberId={removingMemberId}
                handleRemoveMember={handleRemoveMember}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <EditBookModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        bookTitle={bookTitle}
        bookDescription={bookDescription}
        setBookTitle={setBookTitle}
        setBookDescription={setBookDescription}
        handleEditBook={handleEditBook}
        editLoading={editLoading}
      />

      <DeleteBookDialog 
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        bookTitle={book.title}
        onDelete={handleDeleteBook}
        deleteLoading={deleteLoading}
      />

      <InviteModal
        bookId={bookId || ''}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteSuccess={handleInviteSuccess}
      />
    </div>
  );
};

export default RecipeBookDetails;
