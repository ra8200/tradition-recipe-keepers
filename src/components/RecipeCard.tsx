
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, BookOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  id: string;
  title: string;
  description: string;
  cookTime: string;
  servings: number;
  bookName: string;
  bookId: string;
  imageUrl?: string;
  ocrSource?: boolean;
  className?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  description,
  cookTime,
  servings,
  bookName,
  bookId,
  imageUrl,
  ocrSource,
  className
}) => {
  return (
    <Link to={`/recipes/${id}`} className={cn("block overflow-hidden bg-white rounded-lg border border-recipe-200 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="aspect-video w-full overflow-hidden bg-recipe-200 relative">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-recipe-300">
            <span className="text-recipe-600 font-serif italic">No image</span>
          </div>
        )}
        {ocrSource && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs py-1 px-2 rounded-full flex items-center">
            <FileText className="h-3 w-3 mr-1" />
            <span>OCR</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-recipe-800 mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-recipe-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center justify-between text-xs text-recipe-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{cookTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>Serves {servings}</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-recipe-200 flex items-center gap-1 text-xs text-recipe-500">
          <BookOpen className="h-3.5 w-3.5" />
          <span>From <Link to={`/books/${bookId}`} className="hover:text-recipe-700 hover:underline" onClick={(e) => e.stopPropagation()}>{bookName}</Link></span>
        </div>
      </div>
    </Link>
  );
};

export default RecipeCard;
