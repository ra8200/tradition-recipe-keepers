
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Book } from 'lucide-react';

type FormValues = {
  title: string;
  description: string;
};

const CreateRecipeBook = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to create a recipe book",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create a new recipe book
      const { data, error } = await supabase
        .from('recipe_books')
        .insert({
          title: values.title,
          description: values.description,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a member with 'owner' role
      const { error: memberError } = await supabase
        .from('recipe_book_members')
        .insert({
          book_id: data.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      toast({
        title: "Recipe book created",
        description: "Your recipe book has been created successfully",
      });
      
      navigate('/books');
    } catch (error: any) {
      console.error('Error creating recipe book:', error);
      toast({
        title: "Error creating recipe book",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={user ? { name: user.user_metadata?.name || user.email || '', email: user.email || '' } : null}
        onLogin={() => navigate('/')} 
        onLogout={() => {}} 
      />
      
      <main className="flex-grow bg-recipe-100 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow p-6 md:p-8">
            <div className="flex items-center mb-6">
              <Book className="h-8 w-8 text-spice-600 mr-3" />
              <h1 className="text-2xl md:text-3xl font-serif text-recipe-800">Create Recipe Book</h1>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="E.g., Grandma's Family Recipes" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="A brief description of your recipe book..." 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/books')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-spice-600 hover:bg-spice-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Recipe Book'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateRecipeBook;
