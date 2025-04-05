
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, Copy, UserMinus, Plus, FileText, Loader } from 'lucide-react';

interface BookHeaderProps {
  book: {
    id: string;
    title: string;
    description: string;
  };
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
  canCreateRecipe: boolean;
  isPublic: boolean;
  joinLoading: boolean;
  leaveLoading: boolean;
  publicURLLoading: boolean;
  handleJoinBook: () => void;
  handleLeaveBook: () => void;
  handleTogglePublic: () => void;
  handleCopyToClipboard: () => void;
  setIsEditModalOpen: (value: boolean) => void;
  setDeleteDialogOpen: (value: boolean) => void;
  setIsInviteModalOpen: (value: boolean) => void;
}

const BookHeader: React.FC<BookHeaderProps> = ({
  book,
  isOwner,
  isAdmin,
  isMember,
  canCreateRecipe,
  isPublic,
  joinLoading,
  leaveLoading,
  publicURLLoading,
  handleJoinBook,
  handleLeaveBook,
  handleTogglePublic,
  handleCopyToClipboard,
  setIsEditModalOpen,
  setDeleteDialogOpen,
  setIsInviteModalOpen,
}) => {
  const bookId = book.id;
  const canInvite = isOwner || isAdmin;

  return (
    <div className="md:flex md:items-center md:justify-between mb-6">
      <div>
        <h1 className="text-3xl font-serif text-recipe-800 mb-2">{book.title}</h1>
        <p className="text-recipe-600">{book.description}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
        {isOwner && (
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit Book
            </Button>

            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(true)} 
              className="text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Book
            </Button>
          </>
        )}

        {canInvite && (
          <Button variant="outline" onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Members
          </Button>
        )}

        {isPublic && (
          <Button variant="outline" onClick={handleCopyToClipboard} disabled={publicURLLoading} className="flex items-center gap-2">
            <Copy className="h-4 w-4" />
            {publicURLLoading ? <Loader className="h-4 w-4 animate-spin" /> : 'Copy Public URL'}
          </Button>
        )}

        {isOwner && (
          <Button variant="outline" onClick={handleTogglePublic} disabled={publicURLLoading} className="flex items-center gap-2">
            {isPublic ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {publicURLLoading ? <Loader className="h-4 w-4 animate-spin" /> : (isPublic ? 'Make Private' : 'Make Public')}
          </Button>
        )}

        {!isMember && !isOwner ? (
          <Button onClick={handleJoinBook} disabled={joinLoading} className="bg-spice-600 hover:bg-spice-700 flex items-center gap-2">
            {joinLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Join Book
          </Button>
        ) : null}

        {isMember && !isOwner ? (
          <Button variant="destructive" onClick={handleLeaveBook} disabled={leaveLoading} className="flex items-center gap-2">
            {leaveLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Leave Book
          </Button>
        ) : null}

        {canCreateRecipe && (
          <>
            <Link to={`/books/${bookId}/recipes/create`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Recipe
              </Button>
            </Link>
            <Link to={`/books/${bookId}/recipes/import`}>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Import Recipe
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default BookHeader;
