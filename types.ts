import React from 'react';

export type Language = 'uz' | 'en' | 'ru';

export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface Profile {
  id: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  updated_at?: string;
  is_verified?: boolean; // Blue tick status
  donation_link?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string; 
  excerpt: string;
  image_url?: string;
  user_id: string;
  author_id?: string; // Supabase author ID
  author_email?: string;
  created_at: string;
  category: string;
  language: Language;
  status: 'draft' | 'published' | 'review';
  visibility: 'public' | 'private' | 'link-only';
  audience_tags: string[];
  reading_time?: number;
  author_name?: string;
  references?: string; // Legacy field
  citations?: string; // Legacy field
  sources?: {
    title: string;
    url?: string;
    description?: string;
    type: 'reference' | 'opinion' | 'scientific' | 'other';
  }[];
  target_age?: string; // e.g., "7-12", "18+", "All"
  translations?: Partial<Record<Language, { title: string; content: string }>>;
}

export interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  cover_url?: string;
  creator_id: string;
  members_count: number;
  created_at: string;
  tags: string[];
  category: string;
  visibility: 'public' | 'private' | 'invite';
}

export interface ArticleComment {
  id: string;
  article_id: string;
  author_id: string;
  author_name?: string;
  content: string;
  created_at: string;
  is_flagged?: boolean;
}

export enum ArticleCategory {
  SCIENCE = 'Fan',
  HISTORY = 'Tarix',
  TECHNOLOGY = 'Texnologiya',
  CULTURE = 'Madaniyat',
  ART = 'San\'at',
  GEOGRAPHY = 'Geografiya',
  BIOGRAPHY = 'Biografiya',
  LITERATURE = 'Adabiyot',
  PHILOSOPHY = 'Falsafa',
  ECONOMY = 'Iqtisodiyot',
  HEALTH = 'Salomatlik',
  SOCIETY = 'Jamiyat',
  NATURE = 'Tabiat',
  MATHEMATICS = 'Matematika',
  PHYSICS = 'Fizika',
  CHEMISTRY = 'Kimyo',
  BIOLOGY = 'Biologiya',
  ASTRONOMY = 'Astronomiya',
  MEDICINE = 'Tibbiyot',
  ENGINEERING = 'Muhandislik',
  ARCHITECTURE = 'Arxitektura',
  MUSIC = 'Musiqa',
  CINEMA = 'Kino',
  PHOTOGRAPHY = 'Fotosurat',
  DESIGN = 'Dizayn',
  FASHION = 'Moda',
  COOKING = 'Pazandachilik',
  TRAVEL = 'Sayohat',
  SPORTS = 'Sport',
  GAMING = 'O\'yinlar',
  POLITICS = 'Siyosat',
  LAW = 'Huquq',
  RELIGION = 'Din',
  PSYCHOLOGY = 'Psixologiya',
  EDUCATION = 'Ta\'lim',
  BUSINESS = 'Biznes',
  FINANCE = 'Moliya',
  MARKETING = 'Marketing',
  ENTREPRENEURSHIP = 'Tadbirkorlik',
  AGRICULTURE = 'Qishloq xo\'jaligi',
  ENVIRONMENT = 'Atrof-muhit',
  SPACE = 'Kosmos',
  ROBOTICS = 'Robototexnika',
  AI = 'Sun\'iy intellekt',
  CYBERSECURITY = 'Kiberxavfsizlik',
  BLOCKCHAIN = 'Blokcheyn',
  PROGRAMMING = 'Dasturlash',
  DATA_SCIENCE = 'Ma\'lumotlar fani',
  LINGUISTICS = 'Tilshunoslik',
  ARCHAEOLOGY = 'Arxeologiya',
  ANTHROPOLOGY = 'Antropologiya',
  MYTHOLOGY = 'Mifologiya',
  FOLKLORE = 'Folklor',
  COMICS = 'Komikslar',
  MANGA = 'Manga',
  ANIME = 'Anime',
  POETRY = 'She\'riyat',
  DRAMA = 'Drama',
  JOURNALISM = 'Jurnalistika',
  OTHER = 'Boshqa'
}

export type ThemeMode = 'light' | 'dark';
export type VisualStyle = 'minimalist' | 'vibrant';