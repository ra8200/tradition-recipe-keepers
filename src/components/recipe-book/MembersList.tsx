import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserMinus, Loader } from 'lucide-react';

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

interface MembersListProps {
  members: Member[];
  currentUserId: string;
  bookOwnerId: string;
  canManageMembers: boolean;
  removingMember: boolean;
  removingMemberId: string | null;
  handleRemoveMember: (memberId: string) => void;
}

const MembersList: React.FC<MembersListProps> = ({
  members,
  currentUserId,
  bookOwnerId,
  canManageMembers,
  removingMember,
  removingMemberId,
  handleRemoveMember,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>
          Members of this recipe book
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {/* Owner */}
          <li className="flex items-center justify-between p-3 bg-background border rounded-md">
            <div>
              <p className="font-medium">
                {bookOwnerId === currentUserId ? 'You' : bookOwnerId}
              </p>
              <p className="text-xs text-muted-foreground">
                Owner
              </p>
            </div>
          </li>
          
          {/* Other members */}
          {members.map(member => (
            <li key={member.user_id} className="flex items-center justify-between p-3 bg-background border rounded-md">
              <div>
                <p className="font-medium">
                  {member.user_id === currentUserId ? 'You' : (member.profile?.name || member.profile?.email || member.user_id)}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {member.role}
                </p>
              </div>
              {canManageMembers && member.user_id !== currentUserId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.user_id)}
                  disabled={removingMember && removingMemberId === member.user_id}
                  className="text-red-500"
                >
                  {removingMember && removingMemberId === member.user_id ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default MembersList;
