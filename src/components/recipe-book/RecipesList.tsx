
import React from 'react';
import { Link } from 'react-router-dom';
import RecipeCard from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

interface Recipe {
  id: string;
  title: string;
  description: string;
  cook_time: string;
  servings: number;
  image_url: string;
  ocr_source: boolean;
}

interface RecipesListProps {
  recipes: Recipe[];
  bookId: string;
  bookTitle: string;
  canCreateRecipe: boolean;
}

const RecipesList: React.FC<RecipesListProps> = ({
  recipes,
  bookId,
  bookTitle,
  canCreateRecipe,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map(recipe => (
        <RecipeCard
          key={recipe.id}
          id={recipe.id}
          title={recipe.title}
          description={recipe.description}
          cookTime={recipe.cook_time}
          servings={recipe.servings}
          bookName={bookTitle}
          bookId={bookId}
          imageUrl={recipe.image_url}
          ocrSource={recipe.ocr_source}
        />
      ))}
      {recipes.length === 0 && (
        <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
          <p className="text-recipe-600 mb-4">This recipe book is empty.</p>
          {canCreateRecipe && (
            <div className="space-y-2">
              <p className="text-recipe-600">Start by adding your first recipe!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <Link to={`/books/${bookId}/recipes/create`}>
                  <Button className="w-full sm:w-auto">Create Recipe</Button>
                </Link>
                <Link to={`/books/${bookId}/recipes/import`}>
                  <Button variant="outline" className="w-full sm:w-auto">Import Recipe</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecipesList;
