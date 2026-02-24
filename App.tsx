import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ArticlePage } from './pages/ArticlePage';
import { EditorPage } from './pages/EditorPage';
import { SearchPage } from './pages/SearchPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { CommunityPage } from './pages/CommunityPage';
import { AtlasPage } from './pages/AtlasPage';
import { VisualStyle, Language } from './types';

type Route = 
  | { name: 'home' }
  | { name: 'article', id: string }
  | { name: 'edit', id?: string } 
  | { name: 'search', query: string }
  | { name: 'auth' }
  | { name: 'profile', id?: string }
  | { name: 'communities' }
  | { name: 'atlas' };

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('minimalist');
  const [lang, setLang] = useState<Language>('uz');
  const [route, setRoute] = useState<Route>({ name: 'home' });

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (visualStyle === 'vibrant') document.documentElement.classList.add('vibrant-style');
    else document.documentElement.classList.remove('vibrant-style');
  }, [visualStyle]);

  const navigate = (newRoute: Route) => {
    setRoute(newRoute);
    window.scrollTo(0, 0);
  };

  return (
    <AuthProvider>
      <Layout 
        onNavigate={navigate} 
        currentRoute={route.name}
        theme={theme}
        toggleTheme={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
        visualStyle={visualStyle}
        setVisualStyle={setVisualStyle}
        lang={lang}
        setLang={setLang}
      >
        {route.name === 'home' && <HomePage onNavigate={navigate} lang={lang} />}
        {route.name === 'article' && <ArticlePage id={route.id} onNavigate={navigate} />}
        {route.name === 'edit' && <EditorPage id={route.id} onNavigate={navigate} />}
        {route.name === 'search' && <SearchPage query={route.query} onNavigate={navigate} />}
        {route.name === 'auth' && <AuthPage onNavigate={navigate} />}
        {route.name === 'profile' && <ProfilePage id={route.id} />}
        {route.name === 'communities' && <CommunityPage onNavigate={navigate} />}
        {route.name === 'atlas' && <AtlasPage onNavigate={navigate} />}
      </Layout>
    </AuthProvider>
  );
}