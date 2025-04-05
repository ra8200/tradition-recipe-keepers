
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Clock, Edit2, Image, Loader, Trash2, User, Users } from 'lucide-react';

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

interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string;
  instructions: string;
  category: string;
  cook_time: string;
  servings: number;
  image_url: string;
  book_id: string;
  created_by: string;
  created_at: string;
}

interface Creator {
  id: string;
  email: string;
  user_metadata: {
    name?: string;
  };
}

const RecipeDetails = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { recipeId } = useParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [bookTitle, setBookTitle] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
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
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!recipeId || !user) {
        setLoading(false);
        return;
      }
      
      try {
        const { data: recipeData, error: recipeError } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', recipeId)
          .single();
          
        if (recipeError) throw recipeError;
        if (!recipeData) {
          toast({
            title: "Recipe not found",
            description: "The recipe you're looking for doesn't exist.",
            variant: "destructive"
          });
          navigate('/books');
          return;
        }
        
        setRecipe(recipeData);
        
        // Get book title
        const { data: bookData } = await supabase
          .from('recipe_books')
          .select('title')
          .eq('id', recipeData.book_id)
          .single();
          
        if (bookData) {
          setBookTitle(bookData.title);
        }
        
        // Check user permissions
        const { data: memberData } = await supabase
          .from('recipe_book_members')
          .select('role')
          .eq('book_id', recipeData.book_id)
          .eq('user_id', user.id)
          .single();
          
        const isCreator = recipeData.created_by === user.id;
        const isAdmin = memberData?.role === 'admin' || memberData?.role === 'owner';
        
        setCanEdit(isCreator || isAdmin);
        
        // Get creator info
        if (recipeData.created_by) {
          const { data: userData } = await supabase.auth.admin.getUserById(
            recipeData.created_by
          );
          
          if (userData?.user) {
            setCreator(userData.user as Creator);
          }
        }
        
        // Set form fields
        setTitle(recipeData.title || '');
        setDescription(recipeData.description || '');
        setIngredients(recipeData.ingredients || '');
        setInstructions(recipeData.instructions || '');
        setCategory(recipeData.category || '');
        setCookTime(recipeData.cook_time || '');
        setServings(recipeData.servings?.toString() || '');
        setImageUrl(recipeData.image_url || '');
      } catch (error: any) {
        console.error('Error fetching recipe:', error);
        toast({
          title: "Error loading recipe",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [recipeId, user, navigate]);

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
    if (!imageFile || !user) return imageUrl;
    
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
      return imageUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !recipe) {
      return;
    }
    
    if (!title || !ingredients || !instructions) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Upload image if one was selected
      let finalImageUrl = imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadImage();
      }
      
      // Update recipe
      const { error } = await supabase
        .from('recipes')
        .update({
          title,
          description,
          ingredients,
          instructions,
          category,
          cook_time: cookTime,
          servings: parseInt(servings) || null,
          image_url: finalImageUrl,
        })
        .eq('id', recipe.id);
        
      if (error) throw error;
      
      // Update local state
      setRecipe({
        ...recipe,
        title,
        description,
        ingredients,
        instructions,
        category,
        cook_time: cookTime,
        servings: parseInt(servings) || 0,
        image_url: finalImageUrl,
      });
      
      setEditMode(false);
      
      toast({
        title: "Recipe updated",
        description: "Your recipe has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating recipe:', error);
      toast({
        title: "Error updating recipe",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !recipe) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipe.id);
        
      if (error) throw error;
      
      toast({
        title: "Recipe deleted",
        description: "Your recipe has been successfully deleted.",
      });
      
      navigate(`/books/${recipe.book_id}`);
    } catch (error: any) {
      console.error('Error deleting recipe:', error);
      toast({
        title: "Error deleting recipe",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
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
              You need to be signed in to view this recipe.
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
  
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar 
          user={{ name: user.user_metadata?.name || user.email || '', email: user.email || '' }}
          onLogin={handleLogin} 
          onLogout={signOut} 
        />
        
        <main className="flex-grow bg-recipe-100 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-spice-600 mb-4" />
            <p className="text-recipe-600">Loading recipe...</p>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar 
          user={{ name: user.user_metadata?.name || user.email || '', email: user.email || '' }}
          onLogin={handleLogin} 
          onLogout={signOut} 
        />
        
        <main className="flex-grow bg-recipe-100">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-2xl font-serif text-recipe-800 mb-4">Recipe Not Found</h2>
            <p className="text-recipe-600 mb-6">
              The recipe you're looking for doesn't exist or has been deleted.
            </p>
            <Link to="/books">
              <Button className="bg-spice-600 hover:bg-spice-700">
                Back to Recipe Books
              </Button>
            </Link>
          </div>
        </main>
        
        <Footer />
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
          <div className="mb-6">
            <Link 
              to={`/books/${recipe.book_id}`}
              className="text-sm text-recipe-600 hover:text-recipe-800"
            >
              ← Back to {bookTitle || "Recipe Book"}
            </Link>
          </div>

          {!editMode ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Recipe header with image */}
              {recipe.image_url && (
                <div className="relative h-64 md:h-80 w-full bg-recipe-200">
                  <img 
                    src={recipe.image_url} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-3xl font-serif text-recipe-800">{recipe.title}</h1>
                  
                  {canEdit && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit2 className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      
                      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Recipe</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{recipe.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive" 
                              onClick={handleDelete}
                              disabled={loading}
                            >
                              {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                              Delete
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
                
                {recipe.description && (
                  <p className="text-recipe-600 mb-6">{recipe.description}</p>
                )}
                
                <div className="flex flex-wrap gap-4 mb-6">
                  {recipe.category && (
                    <div className="inline-flex items-center bg-recipe-100 text-recipe-800 px-3 py-1 rounded-full text-sm">
                      {recipe.category}
                    </div>
                  )}
                  
                  {recipe.cook_time && (
                    <div className="inline-flex items-center gap-1 text-recipe-600 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{recipe.cook_time}</span>
                    </div>
                  )}
                  
                  {recipe.servings > 0 && (
                    <div className="inline-flex items-center gap-1 text-recipe-600 text-sm">
                      <Users className="h-4 w-4" />
                      <span>Serves {recipe.servings}</span>
                    </div>
                  )}
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-medium text-recipe-800 mb-3">Ingredients</h2>
                    <div className="whitespace-pre-line">{recipe.ingredients}</div>
                  </div>
                  
                  <div>
                    <h2 className="text-xl font-medium text-recipe-800 mb-3">Instructions</h2>
                    <div className="whitespace-pre-line">{recipe.instructions}</div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-recipe-200">
                  <div className="flex items-center gap-1 text-xs text-recipe-500">
                    <User className="h-3.5 w-3.5" />
                    <span>
                      Recipe by {creator?.user_metadata?.name || creator?.email || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Edit Recipe</CardTitle>
                <CardDescription>Make changes to your recipe</CardDescription>
              </CardHeader>
              <CardContent>
                <form id="editForm" onSubmit={handleSave} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Recipe Title *</Label>
                    <Input 
                      id="title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
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
                </form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  form="editForm"
                  className="bg-spice-600 hover:bg-spice-700"
                  disabled={saving || uploading}
                >
                  {(saving || uploading) && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}
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

export default RecipeDetails;
