
import React, { useState, useEffect, useRef } from 'react';
import { getArticleById, saveArticle, uploadImage } from '../services/store';
import { suggestTopics, generateArticle } from '../services/gemini';
import { Icons } from '../components/Icon';
import { useAuth } from '../context/AuthContext';
import { ArticleCategory, Language, Article } from '../types';
import { MarkdownRenderer } from '../components/MarkdownRenderer';
import { TableEditor } from '../components/TableEditor';

export const EditorPage = ({ id, onNavigate }: { id?: string, onNavigate: (r: any) => void }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>(ArticleCategory.OTHER);
  const [imageUrl, setImageUrl] = useState('');
  const [sources, setSources] = useState<NonNullable<Article['sources']>>([]);
  const [targetAge, setTargetAge] = useState('All');
  const [visibility, setVisibility] = useState<Article['visibility']>('public');
  const [audienceTags, setAudienceTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>('uz');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [categorySearch, setCategorySearch] = useState('');

  const autoSaveTimerRef = useRef<any>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!user) {
      onNavigate({ name: 'auth' });
      return;
    }
    if (id) {
      getArticleById(id).then(a => {
        if (a) {
           setTitle(a.title);
           setContent(a.content);
           setImageUrl(a.image_url || '');
           setCategory(a.category || ArticleCategory.OTHER);
           setSources(a.sources || []);
           setTargetAge(a.target_age || 'All');
           setVisibility(a.visibility || 'public');
           setAudienceTags(a.audience_tags || []);
           setLanguage(a.language || 'uz');
        }
      });
    }
  }, [id, user]);

  const handleAiSuggestTopics = async () => {
    setAiLoading(true);
    try {
      const topics = await suggestTopics(title || content.substring(0, 100));
      setSuggestedTopics(topics);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiGenerate = async (topic: string) => {
    setAiLoading(true);
    try {
      const result = await generateArticle(topic);
      setTitle(result.title);
      setContent(result.content);
      setShowAiAssistant(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (!title || !content || !user) return;
    
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;
      
      const payload = { 
        id, title, content, image_url: imageUrl, 
        category, status: 'draft' as const, 
        sources, target_age: targetAge,
        visibility, audience_tags: audienceTags,
        language,
        user_id: user.id
      };
      try {
        const saved = await saveArticle(payload, !!id);
        if (!id && saved?.id) {
          onNavigate({ name: 'edit', id: saved.id });
        }
        setLastSaved(new Date());
      } catch (e) {
        console.warn("Auto-save failed silently", e);
      } finally {
        isSavingRef.current = false;
      }
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, content, category, imageUrl, sources, targetAge, visibility, audienceTags, user]);

  const handleSave = async (isPublish = true) => {
    if (!title.trim() || !content.trim() || !user) {
      alert("Sarlavha va mazmun bo'sh bo'lishi mumkin emas.");
      return;
    }
    setLoading(true);
    
    try {
      let finalImageUrl = imageUrl;
      if (file) {
        finalImageUrl = await uploadImage(file);
      }

      await saveArticle({ 
        id, title, content, image_url: finalImageUrl, 
        category, status: isPublish ? 'published' : 'draft',
        sources, target_age: targetAge,
        visibility, audience_tags: audienceTags,
        language,
        user_id: user.id
      }, !!id);
      
      onNavigate({ name: 'home' });
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addSource = () => {
    if (sources.length >= 100) {
      alert("Maksimal 100 ta manba qo'shish mumkin.");
      return;
    }
    setSources([...sources, { title: '', type: 'reference' }]);
  };

  const updateSource = (index: number, field: keyof NonNullable<Article['sources']>[0], value: string) => {
    const newSources = [...sources];
    newSources[index] = { ...newSources[index], [field]: value } as any;
    setSources(newSources);
  };

  const removeSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('article-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const before = text.substring(0, start);
    const after = text.substring(end);
    setContent(before + prefix + selectedText + suffix + after);
  };

  const wordCount = content.split(/\s+/).filter(x => x).length;
  const readTime = Math.ceil(wordCount / 200);

  const filteredCategories = Object.values(ArticleCategory).filter(cat => 
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      {showTableEditor && (
        <TableEditor 
          onInsert={(md) => insertMarkdown(md)} 
          onClose={() => setShowTableEditor(false)} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate({ name: 'home' })} className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all shadow-sm">
            <Icons.ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-gray-900 leading-none">
              {id ? 'Tahrirlash' : 'Yozish'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsPreview(!isPreview)}
             className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-50 transition-all shadow-sm"
           >
             {isPreview ? 'Tahrirga qaytish' : 'Ko\'rish'}
           </button>
           <button 
             onClick={() => handleSave(true)}
             disabled={loading}
             className="px-8 py-3.5 bg-brand-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-brand-500/20 hover:bg-brand-600 disabled:opacity-50 transition-all"
           >
             {loading ? 'Saqlanmoqda...' : 'Chop etish'}
           </button>
        </div>
      </div>

      {!isPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Editor Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="MAQOLA SARLAVHASI"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full text-4xl md:text-5xl font-black bg-transparent border-none placeholder-gray-200 focus:ring-0 focus:outline-none px-0 tracking-tighter uppercase leading-tight"
              />
              <div className="h-1 w-20 bg-brand-500 rounded-full" />
            </div>

            {/* Markdown Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-white border border-gray-100 rounded-2xl shadow-sm sticky top-24 z-30">
              <div className="flex items-center bg-gray-50 rounded-xl p-1">
                <button onClick={() => insertMarkdown('# ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-xs font-black transition-all">H1</button>
                <button onClick={() => insertMarkdown('## ', '')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-xs font-black transition-all">H2</button>
                <button onClick={() => insertMarkdown('**', '**')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-xs font-black transition-all">B</button>
                <button onClick={() => insertMarkdown('_', '_')} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-xs font-black transition-all">I</button>
              </div>
              
              <div className="w-px h-6 bg-gray-100 mx-1" />
              
              <div className="flex items-center bg-gray-50 rounded-xl p-1">
                <button onClick={() => setShowTableEditor(true)} title="Visual Jadval" className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Icons.Menu className="w-4 h-4" /></button>
                <button onClick={() => insertMarkdown('\n```mermaid\ngraph TD;\n  A-->B;\n  B-->C;\n  C-->A;\n```\n')} title="Diagramma (Mermaid)" className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all"><Icons.PenTool className="w-4 h-4" /></button>
              </div>

              <div className="w-px h-6 bg-gray-100 mx-1" />

              <button 
                onClick={() => setShowAiAssistant(!showAiAssistant)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${showAiAssistant ? 'bg-brand-500 text-white shadow-lg' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'}`}
              >
                <Icons.Sparkles className="w-3 h-3" /> Gemini AI
              </button>

              <div className="flex-grow" />
              
              <button 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${showAdvanced ? 'bg-brand-50 text-brand-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                <Icons.Settings className="w-3 h-3" /> Sozlamalar
              </button>
            </div>
            
            {showAiAssistant && (
              <div className="bg-white border border-brand-100 rounded-[32px] p-8 shadow-xl shadow-brand-500/5 animate-soft-in space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-50 rounded-xl">
                      <Icons.Sparkles className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Gemini AI Yordamchi</h3>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Maqola yozishda yordam beradi</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAiAssistant(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Icons.X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mavzu bo'yicha maqola yozish</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Mavzuni kiriting..." 
                        value={aiTopic}
                        onChange={e => setAiTopic(e.target.value)}
                        className="flex-1 p-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-brand-500/10"
                      />
                      <button 
                        onClick={() => handleAiGenerate(aiTopic)}
                        disabled={aiLoading || !aiTopic}
                        className="px-4 py-3 bg-brand-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-600 disabled:opacity-50 transition-all"
                      >
                        {aiLoading ? '...' : 'Yozish'}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mavzu tavsiyalari</label>
                      <button 
                        onClick={handleAiSuggestTopics}
                        disabled={aiLoading}
                        className="text-[9px] font-black text-brand-500 uppercase tracking-widest hover:underline"
                      >
                        Yangilash
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTopics.length > 0 ? suggestedTopics.map((topic, i) => (
                        <button 
                          key={i}
                          onClick={() => handleAiGenerate(topic)}
                          className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-100 transition-all"
                        >
                          {topic}
                        </button>
                      )) : (
                        <p className="text-[10px] font-bold text-gray-300 uppercase italic">Tavsiyalar olish uchun tugmani bosing</p>
                      )}
                    </div>
                  </div>
                </div>

                {aiLoading && (
                  <div className="pt-4 flex items-center gap-3 text-brand-500 animate-pulse">
                    <Icons.Loader className="w-4 h-4 animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Gemini ma'lumotlarni sintez qilmoqda...</span>
                  </div>
                )}
              </div>
            )}
            
            <div className="relative">
              <textarea
                id="article-textarea"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Bilimlarni hujjatlashtirishni boshlang..."
                className="w-full h-[70vh] p-12 bg-white rounded-[48px] border border-gray-100 shadow-soft focus:ring-8 focus:ring-brand-500/5 focus:outline-none transition-all font-sans text-xl leading-relaxed resize-none custom-scrollbar"
              />
            </div>

            {/* Sources Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 flex items-center gap-2">
                    <Icons.BookOpen className="w-4 h-4 text-brand-500" /> Manbalar va Iqtiboslar
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{sources.length}/100 manba</p>
                </div>
                <button onClick={addSource} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-gray-800 transition-all">
                  <Icons.Plus className="w-3 h-3" /> Qo'shish
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {sources.map((src, idx) => (
                  <div key={idx} className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-start animate-soft-in">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                      <input 
                        placeholder="Manba nomi (masalan: Ibn Xaldun, Muqaddima)" 
                        value={src.title}
                        onChange={e => updateSource(idx, 'title', e.target.value)}
                        className="p-3 bg-gray-50 border-none rounded-xl text-xs font-bold"
                      />
                      <input 
                        placeholder="Tavsif yoki sahifa (masalan: 12-bet)" 
                        value={src.description || ''}
                        onChange={e => updateSource(idx, 'description', e.target.value)}
                        className="p-3 bg-gray-50 border-none rounded-xl text-xs font-bold"
                      />
                      <select 
                        value={src.type}
                        onChange={e => updateSource(idx, 'type', e.target.value as any)}
                        className="p-3 bg-gray-50 border-none rounded-xl text-xs font-black uppercase"
                      >
                        <option value="reference">Adabiyot</option>
                        <option value="opinion">Muallif fikri</option>
                        <option value="scientific">Ilmiy ish</option>
                        <option value="other">Boshqa</option>
                      </select>
                    </div>
                    <button onClick={() => removeSource(idx)} className="p-3 text-red-400 hover:text-red-600 transition-colors">
                      <Icons.X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {sources.length === 0 && (
                  <div className="p-10 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Hozircha manbalar qo'shilmagan</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-soft space-y-8 sticky top-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Kategoriya</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input 
                      placeholder="Qidirish..." 
                      value={categorySearch}
                      onChange={e => setCategorySearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-brand-500/10"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-2xl p-2 space-y-1 custom-scrollbar">
                    {filteredCategories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${category === cat ? 'bg-brand-50 text-brand-600' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Muqova Rasmi</label>
                <div className="space-y-4">
                  {imageUrl && <img src={imageUrl} className="w-full h-32 object-cover rounded-2xl" alt="Preview" />}
                  <input 
                    type="text" 
                    placeholder="Rasm URL manzili..." 
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Maqola Tili</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { code: 'uz', label: "O'zbek" },
                    { code: 'en', label: 'English' },
                    { code: 'ru', label: 'Русский' },
                    { code: 'kaa', label: 'Qaraqalpaq' }
                  ].map(l => (
                    <button 
                      key={l.code}
                      onClick={() => setLanguage(l.code as Language)}
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${language === l.code ? 'bg-brand-500 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {showAdvanced && (
                <div className="space-y-8 pt-8 border-t border-gray-100 animate-soft-in">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ko'rinish</label>
                    <select 
                      value={visibility}
                      onChange={e => setVisibility(e.target.value as any)}
                      className="w-full p-3 bg-gray-50 border-none rounded-xl text-[10px] font-black uppercase"
                    >
                      <option value="public">Ochiq</option>
                      <option value="private">Maxfiy</option>
                      <option value="link-only">Link orqali</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mo'ljallangan Yosh</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['7-12', '13-17', '18+', 'All'].map(age => (
                        <button 
                          key={age}
                          onClick={() => setTargetAge(age)}
                          className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${targetAge === age ? 'bg-brand-500 text-white shadow-md' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                          {age}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Auditoriya Teglari</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                      {audienceTags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-black uppercase text-gray-600 flex items-center gap-1">
                          {tag}
                          <button onClick={() => setAudienceTags(audienceTags.filter((_, idx) => idx !== i))}><Icons.X className="w-2 h-2" /></button>
                        </span>
                      ))}
                      <input 
                        placeholder="Teg..." 
                        className="bg-transparent border-none focus:ring-0 text-[10px] font-bold flex-1 min-w-[60px]"
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !audienceTags.includes(val)) {
                              setAudienceTags([...audienceTags, val]);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-gray-100 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span className="text-gray-400">So'zlar</span>
                  <span className="text-gray-900">{wordCount}</span>
                </div>
                {lastSaved && (
                  <p className="text-[8px] font-bold text-gray-300 uppercase text-right">Saqlandi: {lastSaved.toLocaleTimeString()}</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="bg-white p-8 md:p-20 rounded-[48px] shadow-soft border border-gray-100 animate-soft-in">
           <div className="max-w-3xl mx-auto space-y-16">
             <div className="text-center space-y-6">
                <div className="flex items-center justify-center gap-3">
                  <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase tracking-widest rounded-full">{category}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{language.toUpperCase()}</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{targetAge} yosh uchun</span>
                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">{visibility}</span>
                </div>
                {audienceTags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {audienceTags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[8px] font-black uppercase tracking-widest border border-gray-100 rounded-md">#{tag}</span>
                    ))}
                  </div>
                )}
                <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-tight">{title || 'SARLAVHASIZ MAQOLA'}</h1>
                <div className="flex items-center justify-center gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">{user?.email?.[0].toUpperCase()}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">{user?.email}</span>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{readTime} min o'qish</span>
                </div>
             </div>
             
             {imageUrl && <img src={imageUrl} className="w-full h-auto rounded-[40px] shadow-2xl" alt="Cover" />}
             
             <div className="reading-area">
                <MarkdownRenderer content={content} />
             </div>

             {sources.length > 0 && (
               <div className="pt-16 border-t border-gray-100 space-y-8">
                 <h3 className="text-xl font-black uppercase tracking-tighter text-gray-900">Manbalar</h3>
                 <div className="grid grid-cols-1 gap-4">
                   {sources.map((src, i) => (
                     <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                       <span className="w-6 h-6 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-[10px] font-black text-gray-400">{i + 1}</span>
                       <div>
                         <p className="text-sm font-bold text-gray-900">{src.title}</p>
                         <p className="text-xs font-medium text-gray-500 italic">{src.description}</p>
                         <span className="inline-block mt-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-[8px] font-black uppercase rounded-md">{src.type}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
           </div>
        </div>
      )}
    </div>
  );
};

