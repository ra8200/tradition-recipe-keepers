
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader } from 'lucide-react';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookTitle: string;
  bookDescription: string;
  setBookTitle: (title: string) => void;
  setBookDescription: (description: string) => void;
  handleEditBook: () => void;
  editLoading: boolean;
}

const EditBookModal: React.FC<EditBookModalProps> = ({
  isOpen,
  onClose,
  bookTitle,
  bookDescription,
  setBookTitle,
  setBookDescription,
  handleEditBook,
  editLoading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Recipe Book</DialogTitle>
          <DialogDescription>
            Update the title and description of your recipe book.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={bookDescription}
              onChange={(e) => setBookDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleEditBook} disabled={editLoading}>
            {editLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditBookModal;
