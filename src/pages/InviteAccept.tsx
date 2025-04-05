
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { invitationHelpers } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Loader } from 'lucide-react';

const InviteAccept = () => {
  const { token } = useParams<{ token: string }>();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await invitationHelpers.getInvitationByToken(token);
        
        if (error || !data) {
          setError('This invitation is invalid or has expired.');
          setLoading(false);
          return;
        }
        
        setInvitation(data);
      } catch (err) {
        console.error('Error fetching invitation:', err);
        setError('Failed to load invitation details.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!user || !token) return;

    setAccepting(true);
    try {
      const { error } = await invitationHelpers.acceptInvitation(token, user.id);
      
      if (error) throw error;
      
      toast({
        title: "Invitation accepted",
        description: "You have joined the recipe book!",
      });
      
      navigate(`/books/${invitation.book_id}`);
    } catch (err: any) {
      console.error('Error accepting invitation:', err);
      toast({
        title: "Error accepting invitation",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null}
          onLogin={handleLogin}
          onLogout={signOut}
        />
        <main className="flex-grow bg-recipe-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-spice-600 mx-auto mb-4" />
            <p className="text-recipe-600">Loading invitation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar
          user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null}
          onLogin={handleLogin}
          onLogout={signOut}
        />
        <main className="flex-grow bg-recipe-100 flex items-center justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Invalid Invitation</CardTitle>
              <CardDescription>
                {error || "This invitation doesn't exist or has expired."}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/')}>
                Return to Home
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null}
        onLogin={handleLogin}
        onLogout={signOut}
      />

      <main className="flex-grow bg-recipe-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Recipe Book Invitation</CardTitle>
            <CardDescription>
              You've been invited to join a recipe book
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{invitation.recipe_books?.title}</h3>
              <p className="text-sm text-muted-foreground">{invitation.recipe_books?.description}</p>
            </div>
            <div>
              <p className="text-sm">You've been invited as: <span className="font-semibold capitalize">{invitation.role}</span></p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {user ? (
              <Button 
                onClick={handleAcceptInvitation} 
                disabled={accepting}
                className="w-full"
              >
                {accepting && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Accept Invitation
              </Button>
            ) : (
              <div className="space-y-2 w-full">
                <p className="text-center text-sm mb-2">
                  You need to sign in to accept this invitation
                </p>
                <Button onClick={handleLogin} className="w-full">
                  Sign In to Accept
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default InviteAccept;
