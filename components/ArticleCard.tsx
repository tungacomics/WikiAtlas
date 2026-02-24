
import React from 'react';
import { Article } from '../types';
import { Icons } from './Icon';

interface ArticleCardProps {
  article: Article;
  onClick: (id: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick }) => {
  const wordCount = article.content?.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div 
      onClick={() => onClick(article.id)}
      className="group flex flex-col h-full bg-white rounded-2xl cursor-pointer transition-all duration-500 hover:shadow-hover border border-gray-100 hover:border-brand-200 shadow-soft overflow-hidden"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
        {article.image_url ? (
          <img 
            src={article.image_url} 
            alt={article.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
             <Icons.BookOpen className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur shadow-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-brand-600 border border-brand-100">
            {article.category || 'Maqola'}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{readTime} daqiqa mutolaa</span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest">WikiAtlas Arxiv</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 tracking-tight group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 font-normal">
          {article.excerpt}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center font-bold text-[10px] text-brand-600 border border-brand-100 uppercase">
              {article.author_email?.charAt(0) || 'A'}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-gray-900 leading-none">
                {article.author_email?.split('@')[0] || 'Muallif'}
              </span>
              <Icons.CheckCircle className="w-3 h-3 text-emerald-500 fill-emerald-50" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-gray-400">
            <Icons.Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-medium">
               {new Date(article.created_at).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
