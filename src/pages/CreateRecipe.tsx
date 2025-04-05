
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Image, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

const categories = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Dessert',
  'Snack',
  'Appetizer',
  'Beverage',
  'Side Dish',
  'Main Course',
  'Salad',
  'Soup',
  'Baked Goods',
  'Other',
];

const CreateRecipe = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bookDetails, setBookDetails] = useState<any>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [category, setCategory] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('recipe_books')
          .select('*')
          .eq('id', bookId)
          .single();
          
        if (error) throw error;
        
        setBookDetails(data);
        
        // Check if user is a member of this book
        const { data: memberData, error: memberError } = await supabase
          .from('recipe_book_members')
          .select('*')
          .eq('book_id', bookId)
          .eq('user_id', user.id)
          .single();
          
        if (memberError || !memberData) {
          toast({
            title: "Access denied",
            description: "You are not a member of this recipe book.",
            variant: "destructive"
          });
          navigate('/books');
        }
      } catch (error: any) {
        console.error('Error fetching book details:', error);
        toast({
          title: "Error fetching book details",
          description: error.message,
          variant: "destructive"
        });
        navigate('/books');
      }
    };

    if (user) {
      fetchBookDetails();
    }
  }, [bookId, user, navigate]);

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const uploadImage = async () => {
    if (!imageFile || !user) return null;
    
    try {
      setUploading(true);
      
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${nanoid()}.${fileExt}`;
      const filePath = `recipes/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(filePath, imageFile);
        
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(filePath);
        
      return publicURL.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !bookId) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create a recipe.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title || !instructions || !ingredients) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Upload image if one was selected
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage() || '';
      }
      
      // Create recipe
      const { data, error } = await supabase
        .from('recipes')
        .insert([
          {
            title,
            description,
            ingredients,
            instructions,
            category,
            cook_time: cookTime,
            servings: parseInt(servings) || null,
            image_url: finalImageUrl,
            book_id: bookId,
            created_by: user.id
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Recipe created",
        description: "Your recipe has been successfully created.",
      });
      
      // Navigate to recipe details page
      navigate(`/books/${bookId}`);
    } catch (error: any) {
      console.error('Error creating recipe:', error);
      toast({
        title: "Error creating recipe",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
              You need to be signed in to create recipes.
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar 
        user={{ name: user.user_metadata?.name || user.email || '', email: user.email || '' }}
        onLogin={handleLogin} 
        onLogout={signOut} 
      />
      
      <main className="flex-grow bg-recipe-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center mb-6">
            <Link 
              to={`/books/${bookId}`}
              className="flex items-center text-recipe-600 hover:text-recipe-800 mr-4"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Recipe Book</span>
            </Link>
            
            <h1 className="text-3xl font-serif text-recipe-800">Create New Recipe</h1>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">New Recipe</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title *</Label>
                  <Input 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Grandma's Famous Apple Pie"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of your recipe"
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cookTime">Cook Time</Label>
                    <Input 
                      id="cookTime" 
                      value={cookTime}
                      onChange={(e) => setCookTime(e.target.value)}
                      placeholder="e.g. 1h 30m"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="servings">Servings</Label>
                    <Input 
                      id="servings" 
                      type="number"
                      value={servings}
                      onChange={(e) => setServings(e.target.value)}
                      placeholder="e.g. 4"
                      min="1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ingredients">Ingredients *</Label>
                  <Textarea 
                    id="ingredients" 
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    placeholder="List ingredients, one per line"
                    className="min-h-[120px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions *</Label>
                  <Textarea 
                    id="instructions" 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Step-by-step instructions"
                    className="min-h-[200px]"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Recipe Image</Label>
                  <div className="flex flex-col items-center border-2 border-dashed border-recipe-300 rounded-md p-4">
                    {imageUrl ? (
                      <div className="mb-4 w-full">
                        <img 
                          src={imageUrl} 
                          alt="Recipe Preview" 
                          className="max-h-64 object-contain mx-auto"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-recipe-500 py-4">
                        <Image className="h-12 w-12 mb-2" />
                        <p>No image selected</p>
                      </div>
                    )}
                    
                    <Input 
                      id="image" 
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-4 w-full"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    className="bg-spice-600 hover:bg-spice-700"
                    disabled={loading || uploading}
                  >
                    {(loading || uploading) && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Create Recipe
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
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
};

export default CreateRecipe;
