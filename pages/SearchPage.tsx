import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { searchArticles } from '../services/store';
import { Icons } from '../components/Icon';
import { motion } from 'motion/react';

export const SearchPage = ({ query, onNavigate }: { query: string, onNavigate: (r: any) => void }) => {
  const [results, setResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query) {
      setLoading(true);
      searchArticles(query).then(setResults).finally(() => setLoading(false));
    }
  }, [query]);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <header className="mb-16 space-y-4">
        <div className="flex items-center gap-3 text-brand-500">
          <Icons.Sparkles className="w-6 h-6" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Qidiruv Tizimi</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter uppercase">
          "{query}" uchun natijalar
        </h2>
        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
          {results.length} ta mos keladigan maqola topildi
        </p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-500 border-t-transparent shadow-xl"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 animate-pulse">Gemini ma'lumotlarni sintez qilmoqda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {results.map((article, i) => (
            <motion.div 
              key={article.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onNavigate({ name: 'article', id: article.id })} 
              className="p-8 bg-white rounded-[40px] border border-gray-100 cursor-pointer hover:border-brand-500 hover:shadow-2xl transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-brand-50 text-brand-500 rounded-lg text-[8px] font-black uppercase tracking-widest">
                  {article.category}
                </span>
                <Icons.ArrowLeft className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-all rotate-180" />
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-brand-500 transition-colors uppercase leading-tight">
                {article.title}
              </h3>
              <p className="text-gray-500 text-xs font-medium line-clamp-3 leading-relaxed">
                {article.content}
              </p>
              <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {article.author_name || 'Atlas Muallifi'}
                </span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  {new Date(article.created_at).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
          
          {results.length === 0 && (
            <div className="col-span-full py-32 text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                <Icons.Search className="w-8 h-8 text-gray-300" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-black text-gray-900 uppercase tracking-tight">Hech narsa topilmadi</p>
                <p className="text-sm font-medium text-gray-400">Boshqa kalit so'zlar bilan qidirib ko'ring yoki AI yordamida yangi maqola yarating.</p>
              </div>
              <button 
                onClick={() => onNavigate({ name: 'edit' })}
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-600 transition-all"
              >
                Yangi maqola yozish
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
