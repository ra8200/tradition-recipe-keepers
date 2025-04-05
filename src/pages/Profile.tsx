
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Settings, LogOut } from 'lucide-react';

const Profile = () => {
  const { user, signOut, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.name || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await updateProfile(displayName);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null} 
        onLogin={() => {}} 
        onLogout={signOut} 
      />
      
      <main className="flex-grow bg-recipe-100 py-10">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 bg-recipe-800 text-white">
              <h1 className="text-2xl font-serif flex items-center gap-2">
                <User className="h-6 w-6" /> My Profile
              </h1>
            </div>
            
            <div className="p-8">
              {!isEditing ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-recipe-700">Display Name</h2>
                    <p className="text-xl font-serif">{user?.user_metadata?.name || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-recipe-700">Email</h2>
                    <p>{user?.email}</p>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Settings className="h-4 w-4" /> Edit Profile
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive/10"
                      onClick={signOut}
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold text-recipe-700">Email</h2>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Email cannot be changed through this form.
                    </p>
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <Button 
                      type="submit"
                      className="bg-spice-600 hover:bg-spice-700"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user?.user_metadata?.name || '');
                      }}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Profile;
