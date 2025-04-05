
import { createClient } from '@supabase/supabase-js';

// Use the provided Supabase URL and anon key
const supabaseUrl = 'https://sqrejzyrelllhnayloox.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxcmVqenlyZWxsbGhuYXlsb294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwMjQxMDUsImV4cCI6MjA1ODYwMDEwNX0.XGCKrIR0NCZvwNu4hNfScJWUZAhEaTJZyDv9B4moRh0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Invitation helper functions
export const invitationHelpers = {
  // Create a new invitation
  async createInvitation(bookId: string, email: string, role: string, senderId: string) {
    const token = Math.random().toString(36).substring(2, 15);
    
    const { data, error } = await supabase
      .from('recipe_book_invitations')
      .insert([{
        book_id: bookId,
        email,
        role,
        token,
        invited_by: senderId,
        status: 'pending'
      }])
      .select()
      .single();
      
    return { data, error };
  },
  
  // Get invitation by token
  async getInvitationByToken(token: string) {
    const { data, error } = await supabase
      .from('recipe_book_invitations')
      .select('*, recipe_books(title, description)')
      .eq('token', token)
      .eq('status', 'pending')
      .single();
      
    return { data, error };
  },
  
  // Accept invitation
  async acceptInvitation(token: string, userId: string) {
    const { data: invitation, error: fetchError } = await supabase
      .from('recipe_book_invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();
      
    if (fetchError || !invitation) {
      return { data: null, error: fetchError || new Error('Invitation not found') };
    }
    
    // Add user as member
    const { error: memberError } = await supabase
      .from('recipe_book_members')
      .insert([{
        book_id: invitation.book_id,
        user_id: userId,
        role: invitation.role
      }]);
      
    if (memberError) {
      return { data: null, error: memberError };
    }
    
    // Update invitation status
    const { data, error: updateError } = await supabase
      .from('recipe_book_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id)
      .select()
      .single();
      
    return { data, error: updateError };
  },
  
  // Get all invitations for a book
  async getBookInvitations(bookId: string) {
    const { data, error } = await supabase
      .from('recipe_book_invitations')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });
      
    return { data, error };
  },
  
  // Revoke invitation
  async revokeInvitation(invitationId: string) {
    const { data, error } = await supabase
      .from('recipe_book_invitations')
      .delete()
      .eq('id', invitationId)
      .select()
      .single();
      
    return { data, error };
  }
};

// Permission helpers
export const permissionHelpers = {
  // Check if user is owner of a book
  isBookOwner: (bookCreatorId: string, userId: string) => {
    return bookCreatorId === userId;
  },
  
  // Check if user is admin of a book
  isBookAdmin: (members: any[], userId: string) => {
    const userMember = members.find(m => m.user_id === userId);
    return userMember && userMember.role === 'admin';
  },
  
  // Check if user is a member of a book
  isBookMember: (members: any[], userId: string) => {
    return members.some(m => m.user_id === userId);
  },
  
  // Check if user can perform action based on role
  canPerformAction: (action: 'invite' | 'remove_member' | 'delete_book' | 'edit_book' | 'create_recipe', 
                    members: any[], bookCreatorId: string, userId: string) => {
    // Owner can do everything
    if (bookCreatorId === userId) return true;
    
    const userMember = members.find(m => m.user_id === userId);
    if (!userMember) return false;
    
    // Admin permissions
    if (userMember.role === 'admin') {
      return ['invite', 'create_recipe'].includes(action);
    }
    
    // Member permissions
    if (userMember.role === 'member') {
      return ['create_recipe'].includes(action);
    }
    
    return false;
  }
};
