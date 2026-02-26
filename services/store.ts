
import axios from 'axios';
import { Article, Profile, Community, ArticleCategory, ArticleComment } from '../types';

import { suggestSemanticMatches } from './gemini';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

/**
 * WIKIATLAS BACKEND PROXY SERVICE
 */

// --- FALLBACK MOCK DATA ---
const MOCK_ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Kvant fizikasi: Borliqning sirli asosi',
    content: 'Kvant fizikasi — bu tabiatning eng kichik miqyosdagi (atom va subatom darajadagi) xatti-harakatlarini o\'rganadigan fan sohasi. Klassik fizika qonunlari bu darajada o\'z kuchini yo\'qotadi. Masalan, elektron bir vaqtning o\'zida ikki joyda bo\'lishi (superpozitsiya) yoki masofadan turib bir-biriga ta\'sir qilishi (kvant chigalligi) mumkin. Ushbu soha nafaqat nazariy, balki zamonaviy texnologiyalar, jumladan kvant kompyuterlari va lazerlarning asosi hisoblanadi.',
    excerpt: 'Kvant fizikasi — bu tabiatning eng kichik miqyosdagi xatti-harakatlarini o\'rganadigan fan sohasi...',
    user_id: 'system',
    author_email: 'olim@wikiatlas.uz',
    created_at: new Date().toISOString(),
    category: ArticleCategory.SCIENCE,
    language: 'uz',
    status: 'published',
    visibility: 'public',
    audience_tags: [],
    reading_time: 4
  }
];

export const calculateReadingTime = (content: string): number => {
  if (!content) return 1;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

export const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await api.get('/articles');
    
    // Ensure response.data is an array before mapping
    const rawData = Array.isArray(response.data) ? response.data : [];
    
    if (!Array.isArray(response.data)) {
      console.error("API did not return an array for articles:", response.data);
    }

    const data = rawData.map((row: any) => ({
      ...row,
      excerpt: row.content ? row.content.substring(0, 150) + '...' : '',
      reading_time: calculateReadingTime(row.content || '')
    }));
    
    // Ensure unique IDs and titles to prevent UI glitches and clones
    const seenIds = new Set();
    const seenTitles = new Set();
    return data.filter((item: any) => {
      if (!item.id || seenIds.has(item.id)) return false;
      if (item.title && seenTitles.has(item.title.toLowerCase().trim())) return false;
      
      seenIds.add(item.id);
      if (item.title) seenTitles.add(item.title.toLowerCase().trim());
      return true;
    });
  } catch (e) {
    console.warn("Backend Unreachable: Using Local Archives", e);
    return MOCK_ARTICLES;
  }
};

export const getArticleCount = async (): Promise<number> => {
  try {
    const articles = await getArticles();
    return articles.length;
  } catch {
    return 0;
  }
};

export const getArticlesPaginated = async (page: number, limit: number = 6): Promise<Article[]> => {
  const articles = await getArticles();
  const start = page * limit;
  return articles.slice(start, start + limit);
};

export const searchArticles = async (query: string): Promise<Article[]> => {
  try {
    const articles = await getArticles();
    const q = query.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 1);
    
    // 1. Local Search First (Exact or partial matches)
    const localResults = articles.filter(a => {
      const title = a.title.toLowerCase();
      const content = a.content.toLowerCase();
      const category = a.category.toLowerCase();
      
      // Check if all words are present in title or content (basic fuzzy/multi-word)
      return words.every(word => 
        title.includes(word) || content.includes(word) || category.includes(word)
      );
    });

    if (localResults.length > 0) return localResults;

    // 2. AI Search as Second Stage
    const matchedIds = await suggestSemanticMatches(query, articles);
    if (matchedIds.length > 0) {
      return articles.filter(a => matchedIds.includes(a.id));
    }

    return [];
  } catch (e) {
    console.error("Search failed", e);
    return [];
  }
};

export const getArticleById = async (id: string): Promise<Article | undefined> => {
  try {
    const response = await api.get(`/articles/${id}`);
    return {
      ...response.data,
      excerpt: response.data.content ? response.data.content.substring(0, 150) + '...' : '',
      reading_time: calculateReadingTime(response.data.content || '')
    };
  } catch {
    return undefined;
  }
};

export const getRelatedArticles = async (category: string, excludeId: string): Promise<Article[]> => {
  const articles = await getArticles();
  return articles
    .filter(a => a.category === category && a.id !== excludeId)
    .slice(0, 3);
};

export const saveArticle = async (article: Partial<Article>, isUpdate = false): Promise<Article | null> => {
  try {
    if (isUpdate && article.id) {
      const response = await api.put(`/articles/${article.id}`, article);
      return response.data;
    } else {
      const response = await api.post('/articles', article);
      return response.data;
    }
  } catch (err: any) {
    const serverMessage = err.response?.data?.details || err.response?.data?.error;
    console.error("Save Operation Error:", err.response?.data || err.message);
    throw new Error(serverMessage || "Atlas sync failed. Please check network connection.");
  }
};

export const deleteArticle = async (id: string): Promise<void> => {
  try {
    await api.delete(`/articles/${id}`);
  } catch (err: any) {
    const serverMessage = err.response?.data?.error || "Maqolani o'chirishda xatolik.";
    throw new Error(serverMessage);
  }
};

export const addComment = async (articleId: string, content: string): Promise<ArticleComment> => {
  const response = await api.post(`/articles/${articleId}/comments`, { content });
  return response.data;
};

export const getProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const response = await api.get(`/profiles/${userId}`);
    return response.data;
  } catch {
    return { id: userId, username: 'Anonymous' };
  }
};

export const updateProfile = async (userId: string, profile: Partial<Profile>): Promise<void> => {
  await api.put(`/profiles/${userId}`, profile);
};

export const getCommunities = async (): Promise<Community[]> => {
  try {
    const response = await api.get('/communities');
    return response.data;
  } catch {
    return [];
  }
};

export const createCommunity = async (comm: Partial<Community>): Promise<Community> => {
  const response = await api.post('/communities', comm);
  return response.data;
};

export const generateSampleArticles = async (userId: string) => {
  // No-op for now as we are using Airtable
};

export const uploadImage = async (file: File): Promise<string> => {
  // Mock upload for now
  return "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800";
};
