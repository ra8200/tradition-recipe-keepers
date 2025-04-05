
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeBookCardProps {
  id: string;
  title: string;
  description: string;
  recipeCount: number;
  membersCount: number;
  coverImageUrl?: string;
  className?: string;
}

const RecipeBookCard: React.FC<RecipeBookCardProps> = ({
  id,
  title,
  description,
  recipeCount,
  membersCount,
  coverImageUrl,
  className
}) => {
  return (
    <Link to={`/books/${id}`} className={cn(
      "block bg-white rounded-lg border border-recipe-200 shadow-sm hover:shadow-md transition-shadow",
      className
    )}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden bg-recipe-200">
            {coverImageUrl ? (
              <img 
                src={coverImageUrl} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-recipe-300">
                <Book className="h-8 w-8 text-recipe-600" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-recipe-800 mb-1">{title}</h3>
            <p className="text-sm text-recipe-600 mb-3 line-clamp-2">{description}</p>
            <div className="flex items-center gap-4 text-xs text-recipe-500">
              <div className="flex items-center gap-1">
                <Book className="h-3.5 w-3.5" />
                <span>{recipeCount} {recipeCount === 1 ? 'recipe' : 'recipes'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>{membersCount} {membersCount === 1 ? 'member' : 'members'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecipeBookCard;
