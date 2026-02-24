import React, { useState } from 'react';
import { Icons } from './Icon';
import { ArticleCategory, Language, VisualStyle } from '../types';
import { useAuth } from '../context/AuthContext';

const translations = {
  uz: { 
    home: 'Asosiy', 
    write: 'Yozish', 
    profile: 'Profil', 
    login: 'Kirish', 
    atlas: 'Atlas (Barcha maqolalar)',
    contact: 'Aloqa (Telegram)', 
    search: 'Bilimlar atlasidan izlang...', 
    categories: 'Atlas Kategoriyalari',
    version: 'WikiAtlas v2.5 Professional',
    copyright: '© 2026 WikiAtlas - Ochiq Bilim Standarti',
    creator: 'Yaratuvchi: @misiradham'
  },
  en: { 
    home: 'Home', 
    write: 'Write', 
    profile: 'Profile', 
    login: 'Login', 
    atlas: 'Atlas (All Articles)',
    contact: 'Contact (Telegram)', 
    search: 'Search the knowledge atlas...', 
    categories: 'Atlas Categories',
    version: 'WikiAtlas v2.5 Professional',
    copyright: '© 2026 WikiAtlas - The Open Knowledge Standard',
    creator: 'Creator: @misiradham'
  }
};

interface LayoutProps {
  children?: React.ReactNode;
  onNavigate: (route: any) => void;
  currentRoute: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  visualStyle: VisualStyle;
  setVisualStyle: (v: VisualStyle) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, onNavigate, currentRoute, theme, toggleTheme, visualStyle, setVisualStyle, lang, setLang 
}) => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const t = translations[lang === 'ru' ? 'uz' : lang] || translations.uz;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate({ name: 'search', query: searchQuery });
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navItems = [
    { name: t.home, icon: Icons.Home, route: 'home', disabled: false },
    { name: t.atlas, icon: Icons.BookOpen, route: 'atlas', disabled: false },
    { name: t.contact, icon: Icons.Send, route: 'contact', disabled: false, external: 'https://t.me/misiradham' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans transition-all duration-300">
      {/* Sidebar Drawer */}
      <div className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
        <aside className={`absolute left-0 top-0 h-full w-[320px] bg-white shadow-2xl transition-transform duration-500 ease-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <Icons.Logo className="w-8 h-8 text-brand-500" />
                <span className="font-extrabold text-xl tracking-tight text-gray-900">WikiAtlas</span>
              </div>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Icons.X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <nav className="space-y-2 mb-10">
              {navItems.map((item) => (
                <button 
                  key={item.name}
                  disabled={item.disabled}
                  onClick={() => { 
                    if(item.external) {
                      window.open(item.external, '_blank');
                    } else if(item.route && !item.disabled) {
                      onNavigate({ name: item.route }); 
                    }
                    setIsDrawerOpen(false); 
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-semibold ${item.disabled ? 'opacity-50 cursor-not-allowed text-gray-400' : 'hover:bg-brand-50 hover:text-brand-600 text-gray-700'}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}
            </nav>

            <div className="flex-1 overflow-y-auto">
              <div className="mb-4 flex items-center gap-2">
                <Icons.Hash className="w-4 h-4 text-brand-500" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">{t.categories}</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {Object.values(ArticleCategory).map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => { onNavigate({ name: 'search', query: cat }); setIsDrawerOpen(false); }} 
                    className="text-left px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-600 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6 text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t.version}</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Search Modal */}
      <div className={`fixed inset-0 z-[70] transition-all duration-300 ${isSearchOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
        <div className={`absolute top-0 left-0 w-full p-6 md:p-20 transition-transform duration-500 ${isSearchOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Icons.Search className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-8 text-brand-500" />
              <input 
                autoFocus={isSearchOpen}
                type="text"
                placeholder={t.search}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-20 pr-8 py-8 bg-white rounded-[32px] shadow-2xl text-2xl font-bold text-gray-900 focus:ring-0 border-none placeholder-gray-300"
              />
              <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-8 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Icons.X className="w-6 h-6 text-gray-400" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-soft">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDrawerOpen(true)} className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              <Icons.Menu className="w-6 h-6 text-gray-900" />
            </button>
            <div onClick={() => onNavigate({ name: 'home' })} className="flex items-center gap-2.5 cursor-pointer group">
              <Icons.Logo className="w-9 h-9 text-brand-500 transition-transform group-hover:scale-110" />
              <span className="hidden lg:block font-black text-2xl tracking-tighter text-gray-900">WIKIATLAS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all border border-gray-100 group"
            >
              <Icons.Search className="w-5 h-5 text-gray-900 group-hover:text-brand-500 transition-colors" />
            </button>

            <div className="hidden md:flex items-center bg-gray-50 p-1 rounded-2xl border border-gray-100">
              <select 
                value={lang} 
                onChange={e => setLang(e.target.value as Language)}
                className="bg-transparent text-xs font-bold uppercase tracking-tight text-gray-600 border-none focus:ring-0 cursor-pointer pl-3 pr-8 py-1.5"
              >
                <option value="uz">UZB</option>
                <option value="en">ENG</option>
              </select>
            </div>

            <button 
              onClick={() => user ? onNavigate({ name: 'edit' }) : onNavigate({ name: 'auth' })}
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-brand-50 text-brand-600 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-brand-100 transition-all border border-brand-100"
            >
              <Icons.PenTool className="w-3.5 h-3.5" />
              {t.write}
            </button>

            {user ? (
              <div className="relative group">
                <button 
                  onClick={() => onNavigate({ name: 'profile' })} 
                  className="flex items-center gap-3 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 rounded-2xl border border-brand-100 transition-all group"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold shadow-soft group-hover:scale-105 transition-transform">
                    {user.username?.[0].toUpperCase() || user.email![0].toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-900 leading-none">@{user.username || user.email?.split('@')[0]}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-1">Atlas ID</p>
                  </div>
                </button>
                
                {/* Profile Hover Card */}
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 z-50">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                    <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center text-xl font-black">
                      {user.username?.[0].toUpperCase() || user.email![0].toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-black text-gray-900 truncate uppercase tracking-tight">{user.username}</p>
                      <p className="text-[10px] font-bold text-gray-400 truncate tracking-tight">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <button 
                      onClick={() => onNavigate({ name: 'profile' })}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-all"
                    >
                      Profilni ko'rish
                    </button>
                    <button 
                      onClick={() => onNavigate({ name: 'edit' })}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-brand-600 transition-all"
                    >
                      Maqola yozish
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => onNavigate({ name: 'auth' })} 
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-2xl shadow-soft hover:bg-gray-800 transition-all"
              >
                {t.login}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-6 py-12 animate-soft-in">
        {children}
      </main>

      <footer className="bg-white border-t border-gray-100 py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Icons.Logo className="w-6 h-6 text-brand-500" />
            <span className="font-extrabold text-lg tracking-tight text-gray-900">WikiAtlas</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <button onClick={() => onNavigate({ name: 'home' })} className="hover:text-brand-500 transition-colors">{t.home}</button>
            <button onClick={() => onNavigate({ name: 'atlas' })} className="hover:text-brand-500 transition-colors">{t.atlas}</button>
            <a href="https://t.me/misiradham" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors">{t.contact}</a>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-3">
              <a href="https://t.me/misiradham" target="_blank" rel="noreferrer" className="p-2 bg-gray-50 rounded-xl hover:bg-brand-50 hover:text-brand-500 transition-all border border-gray-100">
                <Icons.Send className="w-4 h-4" />
              </a>
            </div>
            <p className="text-[8px] font-black text-brand-500 uppercase tracking-widest">{t.creator}</p>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-8 pt-4 border-t border-gray-50 text-center">
           <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.2em]">{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
};