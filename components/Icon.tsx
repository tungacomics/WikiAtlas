import React from 'react';
import { 
  Search, BookOpen, PenTool, Settings, Home, Menu, X, 
  Moon, Sun, ChevronRight, ThumbsUp, MessageSquare, 
  Share2, ArrowLeft, Save, Sparkles, CheckCircle, 
  AlertTriangle, Eye, Clock, Hash, Globe, User,
  Flag, Send, Users, ShieldCheck, Heart, MessageCircle,
  HelpCircle, Calendar, Plus, Loader, Trash, Play, Pause
} from 'lucide-react';

export const Icons = {
  Search, BookOpen, PenTool, Settings, Home, Menu, X,
  Moon, Sun, ChevronRight, ThumbsUp, MessageSquare,
  Share2, ArrowLeft, Save, Sparkles, CheckCircle,
  AlertTriangle, Eye, Clock, Hash, Globe, User,
  Flag, Send, Users, ShieldCheck, Heart, MessageCircle,
  HelpCircle, Calendar, Plus, Loader, Trash, Play, Pause,
  Logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 100 100" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg" 
      {...props}
    >
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M50 20C35 20 20 35 20 50C20 65 35 80 50 80C65 80 80 65 80 50" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M50 40L65 50L50 60L35 50L50 40Z" fill="currentColor" />
      <circle cx="50" cy="50" r="5" fill="white" />
    </svg>
  )
};