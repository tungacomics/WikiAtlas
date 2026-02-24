
import React, { useState, useEffect, useRef } from 'react';
import { Article, Comment } from '../types';
import { getArticleById, getRelatedArticles, deleteArticle } from '../services/store';
import { Icons } from '../components/Icon';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { useAuth } from '../context/AuthContext';
import { generateSpeech } from '../services/gemini';

export const ArticlePage = ({ id, onNavigate }: { id: string, onNavigate: (r: any) => void }) => {
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | undefined>();
  const [related, setRelated] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleListen = async () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    setAudioLoading(true);
    try {
      const base64Audio = await generateSpeech(article?.content || "");
      if (base64Audio) {
        const audioBlob = await fetch(`data:audio/wav;base64,${base64Audio}`).then(r => r.blob());
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setIsPlaying(false);
        audio.play();
        setIsPlaying(true);
      } else {
        alert("Ovozli xizmatda xatolik yuz berdi.");
      }
    } catch (e) {
      console.error(e);
      alert("Ovozli xizmatni yuklashda xatolik.");
    } finally {
      setAudioLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getArticleById(id);
      if (data) {
        setArticle(data);
        const rel = await getRelatedArticles(data.category, id);
        setRelated(rel);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Ushbu maqolani o'chirishni xohlaysizmi? Bu amalni ortga qaytarib bo'lmaydi.")) return;
    
    setIsDeleting(true);
    try {
      await deleteArticle(id);
      onNavigate({ name: 'home' });
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.content.substring(0, 100),
          url: window.location.href,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Share error:", err);
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Havola nusxalandi!");
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" /></div>;
  if (!article) return <div className="text-center py-32"><h2 className="text-2xl font-bold text-gray-900">Maqola topilmadi</h2><button onClick={() => onNavigate({ name: 'home' })} className="mt-4 text-brand-600 font-bold uppercase text-xs tracking-widest">Bosh sahifaga qaytish</button></div>;

  const isAuthor = user?.id === article.author_id || user?.id === article.user_id;
  const wordCount = article.content.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="animate-soft-in relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-[100]">
        <div className="h-full bg-brand-500 transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
      </div>

      <article className="max-w-4xl mx-auto pt-12 pb-32">
        {/* Header */}
        <header className="mb-16 space-y-8">
          <div className="flex items-center justify-between">
            <button onClick={() => onNavigate({ name: 'home' })} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-brand-500 transition-colors">
              <Icons.ArrowLeft className="w-4 h-4" /> Bosh sahifa
            </button>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-brand-50 text-brand-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-brand-100">
                {article.category}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {readTime} daqiqa mutolaa
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-b border-gray-100 pb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-bold text-lg">
                {article.author_email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-gray-900">
                    {article.author_email?.split('@')[0]}
                  </span>
                  <Icons.CheckCircle className="w-3.5 h-3.5 text-emerald-500 fill-emerald-50" />
                </div>
                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                  {new Date(article.created_at).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleListen}
                disabled={audioLoading}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${isPlaying ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                {audioLoading ? (
                  <Icons.Loader className="w-4 h-4 animate-spin" />
                ) : isPlaying ? (
                  <Icons.Pause className="w-4 h-4" />
                ) : (
                  <Icons.Play className="w-4 h-4" />
                )}
                {audioLoading ? 'Yuklanmoqda...' : isPlaying ? "To'xtatish" : "Tinglash"}
              </button>
              <button 
                onClick={handleShare}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Icons.Share2 className="w-4 h-4 text-gray-600" />
              </button>
              {isAuthor && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onNavigate({ name: 'edit', id: article.id })}
                    className="px-6 py-3 bg-gray-900 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-brand-600 transition-colors"
                  >
                    Tahrirlash
                  </button>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                    title="O'chirish"
                  >
                    <Icons.Trash className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="reading-area prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-700 prose-p:leading-relaxed mb-20">
          <MarkdownRenderer content={article.content} />
        </div>

        {/* Sources & Target Age */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-gray-100">
          {article.sources && article.sources.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                <Icons.BookOpen className="w-4 h-4 text-brand-500" /> Manbalar
              </h4>
              <div className="space-y-4">
                {article.sources.map((src, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-sm font-bold text-gray-900">{src.title}</p>
                    {src.description && <p className="text-xs text-gray-500 italic mt-1">{src.description}</p>}
                    <span className="inline-block mt-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-[8px] font-black uppercase rounded-md">{src.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
              <Icons.ShieldCheck className="w-4 h-4 text-brand-500" /> Ma'lumot
            </h4>
            <div className="p-6 bg-gray-50 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mo'ljallangan yosh</span>
                <span className="text-xs font-black text-gray-900">{article.target_age || 'Barchaga'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ko'rinish</span>
                <span className="text-xs font-black text-gray-900 uppercase">{article.visibility || 'public'}</span>
              </div>
              {article.audience_tags && article.audience_tags.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Auditoriya</span>
                  <div className="flex flex-wrap gap-1">
                    {article.audience_tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[8px] font-black uppercase text-gray-500">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Til</span>
                <span className="text-xs font-black text-gray-900 uppercase">{article.language}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">So'zlar soni</span>
                <span className="text-xs font-black text-gray-900">{wordCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-24 pt-12 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tegishli mavzular</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold uppercase text-gray-600">{article.category}</span>
                <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-bold uppercase text-gray-600">Ilmiy tadqiqot</span>
              </div>
            </div>
            <button 
              onClick={() => alert("Hisobot yuborildi.")}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors"
            >
              <Icons.Flag className="w-4 h-4" /> Xatolik haqida xabar berish
            </button>
          </div>
        </footer>
      </article>

      {/* Related Articles Section */}
      {related.length > 0 && (
        <section className="bg-gray-50 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-12 flex items-center gap-3">
              <Icons.BookOpen className="w-6 h-6 text-brand-500" /> O'xshash maqolalar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map(rel => (
                <div 
                  key={rel.id} 
                  onClick={() => {
                    onNavigate({ name: 'article', id: rel.id });
                    window.scrollTo(0, 0);
                  }}
                  className="group cursor-pointer bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <span className="text-[9px] font-bold text-brand-500 uppercase tracking-widest mb-2 block">{rel.category}</span>
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-tight mb-4">
                    {rel.title}
                  </h4>
                  <div className="flex items-center justify-between text-[10px] font-medium text-gray-400 uppercase">
                    <span>{rel.author_email?.split('@')[0]}</span>
                    <span>{new Date(rel.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
