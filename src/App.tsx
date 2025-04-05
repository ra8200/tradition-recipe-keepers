
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import About from "./pages/About";
import Books from "./pages/Books";
import CreateRecipeBook from "./pages/CreateRecipeBook";
import RecipeBookDetails from "./pages/RecipeBookDetails";
import Recipes from "./pages/Recipes";
import CreateRecipe from "./pages/CreateRecipe";
import ImportRecipe from "./pages/ImportRecipe";
import RecipeDetails from "./pages/RecipeDetails";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import InviteAccept from "./pages/InviteAccept";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/create" element={<CreateRecipeBook />} />
            <Route path="/books/:id" element={<RecipeBookDetails />} />
            <Route path="/books/:bookId/recipes/create" element={<CreateRecipe />} />
            <Route path="/books/:bookId/recipes/import" element={<ImportRecipe />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:recipeId" element={<RecipeDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/invite/:token" element={<InviteAccept />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
