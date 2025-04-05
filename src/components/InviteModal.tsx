
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Copy, Mail, Link, Loader } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { invitationHelpers } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface InviteModalProps {
  bookId: string;
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ bookId, isOpen, onClose, onInviteSuccess }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [linkGenerated, setLinkGenerated] = useState(false);

  const handleEmailInvite = async () => {
    if (!user || !email) return;

    setLoading(true);
    try {
      const { error } = await invitationHelpers.createInvitation(bookId, email, role, user.id);
      
      if (error) throw error;
      
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${email}.`,
      });
      
      setEmail('');
      onInviteSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error sending invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await invitationHelpers.createInvitation(bookId, '', role, user.id);
      
      if (error) throw error;
      
      const token = data?.token;
      if (!token) throw new Error('Failed to generate invitation token');
      
      // Create invite link with token
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/invite/${token}`;
      
      setInviteLink(link);
      setLinkGenerated(true);
      
      toast({
        title: "Invitation link generated",
        description: "Share this link with someone you want to invite.",
      });
    } catch (error: any) {
      console.error('Error generating invitation link:', error);
      toast({
        title: "Error generating invitation link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Invitation link copied to clipboard.",
        });
      })
      .catch(err => {
        console.error("Failed to copy link: ", err);
        toast({
          title: "Error copying link",
          description: "Failed to copy the invitation link.",
          variant: "destructive",
        });
      });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to Recipe Book</DialogTitle>
          <DialogDescription>
            Invite someone to collaborate on this recipe book.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Invite Link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>
              
              <div>
                <Label>Role</Label>
                <RadioGroup value={role} onValueChange={setRole} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="admin" id="admin" />
                    <Label htmlFor="admin">Admin</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="member" id="member" />
                    <Label htmlFor="member">Member</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleEmailInvite} disabled={loading || !email}>
                {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="link" className="space-y-4 pt-4">
            <div className="space-y-4">
              {!linkGenerated ? (
                <div>
                  <Label>Role</Label>
                  <RadioGroup value={role} onValueChange={setRole} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="admin" id="admin-link" />
                      <Label htmlFor="admin-link">Admin</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="member" id="member-link" />
                      <Label htmlFor="member-link">Member</Label>
                    </div>
                  </RadioGroup>
                  
                  <Button 
                    onClick={handleGenerateLink} 
                    disabled={loading} 
                    className="mt-4 w-full"
                  >
                    {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Invitation Link
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label>Invitation Link</Label>
                    <div className="flex mt-1">
                      <Input 
                        readOnly 
                        value={inviteLink} 
                        className="flex-1 rounded-r-none" 
                      />
                      <Button 
                        onClick={handleCopyLink} 
                        className="rounded-l-none flex gap-2"
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Button 
                      onClick={() => {
                        setLinkGenerated(false);
                        setInviteLink('');
                      }} 
                      variant="outline" 
                      className="mt-2 w-full"
                    >
                      Generate New Link
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InviteModal;
