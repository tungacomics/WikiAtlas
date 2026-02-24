
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icons } from '../components/Icon';
import { getArticles } from '../services/store';
import { Article, Language } from '../types';
import { useAuth } from '../context/AuthContext';

const translations = {
  uz: {
    hero: "Bilimlar xazinasi siz uchun ochiq",
    subtitle: "WikiAtlas — sifatli, ishonchli va professional bilimlar almashinuvi maydoni. Dunyoqarashingizni biz bilan kengaytiring.",
    featured: "Saralangan maqolalar",
    latest: "So'nggi arxivlar",
    explore: "Atlasni kashf eting",
    writer: "Maqola yozish",
    knowledgeAwaits: "BILIM — KUCHDIR",
    allArticles: "Barcha Maqolalar",
    fullArchive: "Atlasning to'liq arxivi",
    back: "Orqaga qaytish",
    archiveEnd: "Arxiv yakunlandi",
    backToTop: "Tepaga qaytish",
    viewAll: "Barcha maqolalarni ko'rish"
  }
};

const MassiveCounter = ({ target, subtext }: { target: number, subtext: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = progress === 1 ? target : target * (1 - Math.pow(2, -10 * progress));
      setCount(Math.floor(currentCount));

      if (frame === totalFrames) {
        clearInterval(timer);
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <h2 className="text-7xl md:text-[10rem] font-black text-gray-900 tracking-tighter leading-none select-none">
          {count.toLocaleString()}+
        </h2>
        <div className="absolute -top-4 -right-8 bg-brand-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full rotate-12 shadow-lg uppercase">
          Maqolalar
        </div>
      </div>
      <p className="text-sm md:text-xl font-bold text-brand-500 uppercase tracking-[0.4em] mt-6 opacity-80">
        {subtext}
      </p>
    </div>
  );
};

const FeaturedSlider = ({ articles, onNavigate }: { articles: Article[], onNavigate: (r: any) => void }) => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef<any>(null);

  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setIndex((prevIndex) => (prevIndex === articles.length - 1 ? 0 : prevIndex + 1));
    }, 6000);

    return () => resetTimeout();
  }, [index, articles.length]);

  if (articles.length === 0) return null;

  return (
    <div className="relative overflow-hidden group min-h-[500px]">
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={articles[index].id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onNavigate({ name: 'article', id: articles[index].id })}
            className="w-full bg-white/70 backdrop-blur-xl p-12 md:p-20 rounded-[64px] border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] cursor-pointer relative overflow-hidden group/card min-h-[500px] flex flex-col justify-center transition-all hover:shadow-[0_48px_96px_-24px_rgba(0,0,0,0.12)]"
          >
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover/card:opacity-10 transition-opacity">
               <Icons.Sparkles className="w-48 h-48 text-brand-500" />
            </div>
            <div className="relative z-10 space-y-8 max-w-2xl">
              <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {articles[index].category}
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-tight">
                {articles[index].title}
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed line-clamp-3">
                {articles[index].content}
              </p>
              <div className="flex items-center gap-4 pt-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-black">
                  {articles[index].author_name?.[0] || 'S'}
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{articles[index].author_name || 'System'}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Atlas Muallifi</p>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {articles.map((_, i) => (
          <button 
            key={i} 
            onClick={() => { resetTimeout(); setIndex(i); }}
            className={`h-1.5 rounded-full transition-all ${index === i ? 'w-12 bg-brand-500' : 'w-3 bg-gray-200 hover:bg-gray-300'}`}
          />
        ))}
      </div>

      <button 
        onClick={() => { resetTimeout(); setIndex(prev => prev === 0 ? articles.length - 1 : prev - 1); }}
        className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
      >
        <Icons.ArrowLeft className="w-6 h-6 text-gray-900" />
      </button>
      <button 
        onClick={() => { resetTimeout(); setIndex(prev => prev === articles.length - 1 ? 0 : prev + 1); }}
        className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20"
      >
        <Icons.ChevronRight className="w-6 h-6 text-gray-900" />
      </button>
    </div>
  );
};

export const HomePage = ({ onNavigate, lang }: { onNavigate: (route: any) => void, lang: Language }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations.uz;

  useEffect(() => {
    getArticles().then(data => {
      setArticles(data);
      
      // Filter for 5 specific articles as requested
      // Heuristic: search for keywords in titles
      const keywords = ['bobur', 'navoiy', 'elon musk', 'foyda', 'maqola'];
      const featured = data.filter(a => 
        keywords.some(k => a.title.toLowerCase().includes(k))
      ).slice(0, 5);
      
      // If not enough found, just take first 5
      if (featured.length < 5) {
        const remaining = data.filter(a => !featured.includes(a)).slice(0, 5 - featured.length);
        setFeaturedArticles([...featured, ...remaining]);
      } else {
        setFeaturedArticles(featured);
      }
      
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-32 pb-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-32">
        <div className="container mx-auto text-center relative z-10">
          <MassiveCounter target={articles.length} subtext={t.knowledgeAwaits} />
          
          <div className="max-w-3xl mx-auto space-y-12 mt-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-black text-gray-900 leading-tight uppercase tracking-tighter"
            >
              {t.hero}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto"
            >
              {t.subtitle}
            </motion.p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <button 
                onClick={() => onNavigate({ name: 'atlas' })}
                className="group relative px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
              >
                <span className="relative z-10">{t.explore}</span>
                <div className="absolute inset-0 bg-brand-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
              <button 
                onClick={() => user ? onNavigate({ name: 'edit' }) : onNavigate({ name: 'auth' })}
                className="px-10 py-5 bg-white border border-gray-200 text-gray-900 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all hover:-translate-y-1"
              >
                {t.writer}
              </button>
            </div>
          </div>
        </div>
      </section>

      {!user && (
        <section className="container mx-auto px-6">
          <div className="relative bg-gray-900 rounded-[64px] p-12 md:p-24 text-center overflow-hidden group shadow-[0_48px_96px_-32px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 via-transparent to-brand-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] group-hover:bg-brand-500/20 transition-all duration-1000" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] group-hover:bg-brand-600/20 transition-all duration-1000" />
            
            <div className="relative z-10 space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">
                <Icons.Users className="w-3 h-3" /> Hamjamiyatga qo'shiling
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] max-w-4xl mx-auto">
                Bilimlar olamini <span className="text-brand-500">birgalikda</span> yaratamiz
              </h2>
              <p className="text-gray-400 font-medium max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
                Oʻz bilimlaringizni ulashing, maqolalar yozing va dunyo boʻylab olimlar bilan muloqot qiling. Atlas sizning hissangizni kutmoqda.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                <button 
                  onClick={() => onNavigate({ name: 'auth' })}
                  className="px-12 py-6 bg-brand-500 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-brand-600 transition-all hover:-translate-y-1 shadow-[0_20px_40px_-12px_rgba(242,125,38,0.4)]"
                >
                  Hisob yaratish
                </button>
                <button 
                  onClick={() => onNavigate({ name: 'auth' })}
                  className="px-12 py-6 bg-white/5 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm"
                >
                  Kirish
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Articles Section */}
      <section id="atlas-section" className="container mx-auto px-6 space-y-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3">
              <Icons.Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 uppercase">{t.featured}</h2>
          </div>
          <button 
            onClick={() => onNavigate({ name: 'atlas' })}
            className="text-xs font-black text-brand-500 uppercase tracking-widest hover:underline"
          >
            {t.viewAll}
          </button>
        </div>

        {loading ? (
          <div className="h-[500px] bg-gray-100 rounded-[60px] animate-pulse" />
        ) : (
          <FeaturedSlider articles={featuredArticles} onNavigate={onNavigate} />
        )}
      </section>
    </div>
  );
};
