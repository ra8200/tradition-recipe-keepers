
import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { extractTextFromImage } from '@/lib/ocr';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader, FileImage, ChevronLeft, Upload } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const ImportRecipe = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { bookId } = useParams();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [recipeFields, setRecipeFields] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cookTime: '',
    servings: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form validation schema
  const formSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    description: z.string().optional(),
    ingredients: z.string().min(1, { message: "Ingredients are required" }),
    instructions: z.string().min(1, { message: "Instructions are required" }),
    cookTime: z.string().optional(),
    servings: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      ingredients: '',
      instructions: '',
      cookTime: '',
      servings: '',
    },
  });

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) {
      return;
    }

    const file = e.target.files[0];
    setFileName(file.name);
    
    try {
      setUploading(true);
      
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setFileUrl(objectUrl);
      
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const filePath = `recipe-imports/${user.id}/${nanoid()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('recipe-files')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: publicURL } = supabase.storage
        .from('recipe-files')
        .getPublicUrl(filePath);
        
      // Extract text from image
      setProcessing(true);
      const extracted = await extractTextFromImage(publicURL.publicUrl);
      setExtractedText(extracted.fullText);
      
      // Try to intelligently parse the extracted text
      parseExtractedText(extracted.fullText);
      
      toast({
        title: "File uploaded successfully",
        description: "We've extracted the text from your image.",
      });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast({
        title: "Error uploading file",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };
  
  // Try to intelligently parse the extracted text into recipe fields
  const parseExtractedText = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    
    // First line is likely the title
    if (lines.length > 0) {
      form.setValue('title', lines[0]);
    }
    
    // Look for ingredients section
    const ingredientsIndex = lines.findIndex(line => 
      line.toLowerCase().includes('ingredients') || 
      line.toLowerCase().includes('what you need')
    );
    
    // Look for instructions section
    const instructionsIndex = lines.findIndex(line => 
      line.toLowerCase().includes('instructions') || 
      line.toLowerCase().includes('directions') || 
      line.toLowerCase().includes('method') ||
      line.toLowerCase().includes('steps')
    );
    
    if (ingredientsIndex !== -1) {
      let ingredientsEndIndex = instructionsIndex !== -1 ? instructionsIndex : lines.length;
      const ingredients = lines.slice(ingredientsIndex + 1, ingredientsEndIndex).join('\n');
      form.setValue('ingredients', ingredients);
    }
    
    if (instructionsIndex !== -1) {
      const instructions = lines.slice(instructionsIndex + 1).join('\n');
      form.setValue('instructions', instructions);
    }
    
    // Look for cooking time
    const timeRegex = /(\d+)\s*(min|hour|hr|minute|minutes|hours)/i;
    const timeMatch = text.match(timeRegex);
    if (timeMatch) {
      form.setValue('cookTime', timeMatch[0]);
    }
    
    // Look for servings
    const servingsRegex = /serves\s*(\d+)|servings[:]*\s*(\d+)|yield[:]*\s*(\d+)/i;
    const servingsMatch = text.match(servingsRegex);
    if (servingsMatch) {
      const servingNum = servingsMatch[1] || servingsMatch[2] || servingsMatch[3];
      form.setValue('servings', servingNum);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user || !bookId) {
      toast({
        title: "Authentication required",
        description: "You must be signed in to create a recipe.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create recipe
      const { data: recipeData, error } = await supabase
        .from('recipes')
        .insert([
          {
            title: data.title,
            description: data.description,
            ingredients: data.ingredients,
            instructions: data.instructions,
            cook_time: data.cookTime,
            servings: parseInt(data.servings) || null,
            image_url: fileUrl,
            book_id: bookId,
            created_by: user.id,
            ocr_source: true
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      toast({
        title: "Recipe created",
        description: "Your recipe has been successfully imported.",
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
              You need to be signed in to import recipes.
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
            
            <h1 className="text-3xl font-serif text-recipe-800">Import Recipe</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* File upload area */}
            <Card className="md:self-start">
              <CardHeader>
                <CardTitle>Upload Recipe Image</CardTitle>
                <CardDescription>
                  Upload an image of a recipe to automatically extract the text
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-recipe-300 rounded-md p-8 flex flex-col items-center justify-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {fileUrl ? (
                    <div className="w-full">
                      <img 
                        src={fileUrl} 
                        alt="Recipe preview" 
                        className="max-h-64 mx-auto object-contain mb-4" 
                      />
                      <p className="text-sm text-center text-recipe-600">
                        {fileName}
                      </p>
                    </div>
                  ) : (
                    <>
                      <FileImage className="h-16 w-16 text-recipe-400 mb-4" />
                      <p className="text-recipe-600 mb-2">
                        Click to select a recipe image to upload
                      </p>
                      <p className="text-xs text-recipe-500">
                        Supports JPG, PNG, and PDF formats
                      </p>
                    </>
                  )}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || processing}
                >
                  {(uploading || processing) ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Uploading...' : 
                   processing ? 'Processing...' : 
                   'Select Another File'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Recipe form */}
            <Card>
              <CardHeader>
                <CardTitle>Recipe Details</CardTitle>
                <CardDescription>
                  Review and edit the extracted recipe information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Recipe Title *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Grandma's Apple Pie" {...field} />
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
                              placeholder="A brief description of your recipe" 
                              className="min-h-[80px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cookTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cook Time</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 1h 30m" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="servings"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Servings</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="e.g. 4" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ingredients *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List ingredients, one per line" 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="instructions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instructions *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Step-by-step instructions" 
                              className="min-h-[200px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-spice-600 hover:bg-spice-700"
                      disabled={loading}
                    >
                      {loading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                      Save Recipe
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          
          {extractedText && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Raw Extracted Text</CardTitle>
                <CardDescription>
                  This is the raw text extracted from your image
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap text-sm font-mono">
                  {extractedText}
                </div>
              </CardContent>
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

export default ImportRecipe;
