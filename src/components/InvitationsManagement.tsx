
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, X, Mail, Link as LinkIcon } from 'lucide-react';
import { invitationHelpers } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { formatDistance } from 'date-fns';

interface InvitationsManagementProps {
  bookId: string;
  refreshTrigger: number;
}

const InvitationsManagement: React.FC<InvitationsManagementProps> = ({ bookId, refreshTrigger }) => {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoading(true);
      try {
        const { data, error } = await invitationHelpers.getBookInvitations(bookId);
        
        if (error) throw error;
        
        setInvitations(data || []);
      } catch (error: any) {
        console.error('Error fetching invitations:', error);
        toast({
          title: "Error loading invitations",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [bookId, refreshTrigger]);

  const handleRevokeInvitation = async (invitationId: string) => {
    setRevoking(invitationId);
    try {
      const { error } = await invitationHelpers.revokeInvitation(invitationId);
      
      if (error) throw error;
      
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      
      toast({
        title: "Invitation revoked",
        description: "The invitation has been successfully revoked.",
      });
    } catch (error: any) {
      console.error('Error revoking invitation:', error);
      toast({
        title: "Error revoking invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRevoking(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader className="h-6 w-6 animate-spin text-spice-600" />
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            No pending invitations
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations</CardTitle>
        <CardDescription>
          Manage pending invitations to this recipe book
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {invitations.filter(inv => inv.status === 'pending').map((invitation) => (
            <li key={invitation.id} className="flex items-center justify-between p-3 bg-background border rounded-md">
              <div className="flex items-center gap-3">
                {invitation.email ? (
                  <Mail className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">
                    {invitation.email || 'Invite Link'}
                    <span className="ml-2 text-xs text-muted-foreground capitalize">
                      ({invitation.role})
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sent {formatDistance(new Date(invitation.created_at), new Date(), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevokeInvitation(invitation.id)}
                disabled={revoking === invitation.id}
              >
                {revoking === invitation.id ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default InvitationsManagement;
