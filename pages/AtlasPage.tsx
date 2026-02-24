
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Icons } from '../components/Icon';
import { getArticles } from '../services/store';
import { Article } from '../types';

export const AtlasPage = ({ onNavigate }: { onNavigate: (r: any) => void }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  const lastArticleElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    setLoading(true);
    getArticles().then(data => {
      // Since our mock/backend might not support pagination yet, 
      // we simulate it or just show all if it's a small set.
      // In a real app, we'd pass page/limit to getArticles.
      if (page === 1) {
        setArticles(data);
      } else {
        // Simulate more data or just stop if we reached the end of mock
        if (data.length > articles.length) {
           setArticles(data);
        } else {
           setHasMore(false);
        }
      }
      setLoading(false);
    });
  }, [page]);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase text-gray-900">Bilimlar Atlasi</h1>
          <p className="text-gray-500 font-medium mt-2 uppercase tracking-widest text-xs">Barcha maqolalar arxivi — Cheksiz bilim</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
          <Icons.BookOpen className="w-4 h-4" />
          {articles.length} Maqola
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map((article, index) => {
          if (articles.length === index + 1) {
            return (
              <div ref={lastArticleElementRef} key={article.id}>
                <ArticleCard article={article} onNavigate={onNavigate} />
              </div>
            );
          } else {
            return <ArticleCard key={article.id} article={article} onNavigate={onNavigate} />;
          }
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Icons.Loader className="w-8 h-8 text-brand-500 animate-spin" />
        </div>
      )}

      {!hasMore && articles.length > 0 && (
        <div className="text-center py-12">
          <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Atlas yakunlandi</p>
        </div>
      )}
    </div>
  );
};

const ArticleCard = ({ article, onNavigate }: { article: Article, onNavigate: (r: any) => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    onClick={() => onNavigate({ name: 'article', id: article.id })}
    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-soft hover:shadow-xl transition-all cursor-pointer group flex flex-col h-full"
  >
    <div className="flex items-center justify-between mb-4">
      <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest bg-brand-50 px-2 py-1 rounded-lg">
        {article.category}
      </span>
      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
        {article.language}
      </span>
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-brand-500 transition-colors uppercase leading-tight line-clamp-2">
      {article.title}
    </h3>
    <p className="text-gray-500 line-clamp-3 mb-6 font-medium text-sm leading-relaxed flex-grow">
      {article.content}
    </p>
    <div className="flex items-center justify-between pt-6 border-t border-gray-50">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-[8px] uppercase">
          {article.author_name?.[0] || 'S'}
        </div>
        <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">
          {article.author_name || 'System'}
        </span>
      </div>
      <Icons.ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
    </div>
  </motion.div>
);
