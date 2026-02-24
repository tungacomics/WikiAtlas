import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icon';
import { Community } from '../types';
import { getCommunities, createCommunity } from '../services/store';
import { useAuth } from '../context/AuthContext';

export const CommunityPage = ({ onNavigate }: { onNavigate: (r: any) => void }) => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // New community form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Science');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  useEffect(() => {
    getCommunities().then(setCommunities);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return onNavigate({ name: 'auth' });
    
    setLoading(true);
    try {
      await createCommunity({
        name,
        slug: slug.toLowerCase().replace(/\s+/g, '-'),
        description,
        category,
        visibility,
        tags: [category]
      });
      setIsCreating(false);
      getCommunities().then(setCommunities);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-16 animate-soft-in">
      {/* Community Hero */}
      <div className="bg-brand-500 rounded-[48px] p-20 text-white relative overflow-hidden shadow-2xl">
        <div className="max-w-2xl relative z-10 space-y-8">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
            <Icons.Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">The Knowledge Hub</h1>
          <p className="text-xl font-medium text-brand-100 italic leading-relaxed">
            Unite with experts. Build global projects. Secure the future of human information through collaborative archives.
          </p>
          <button 
            onClick={() => user ? setIsCreating(true) : onNavigate({ name: 'auth' })}
            className="px-12 py-5 bg-white text-brand-600 font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:scale-105 transition-transform bumble-bounce"
          >
            Create New Community
          </button>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* Creation Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsCreating(false)} />
          <form onSubmit={handleCreate} className="relative bg-white w-full max-w-xl rounded-[40px] p-12 shadow-2xl space-y-8 animate-soft-in">
            <div className="flex justify-between items-center">
               <h2 className="text-3xl font-black uppercase tracking-tighter">Register Community</h2>
               <button type="button" onClick={() => setIsCreating(false)}><Icons.X className="w-6 h-6" /></button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400">Display Name</label>
                 <input 
                   required
                   value={name}
                   onChange={e => setName(e.target.value)}
                   className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 font-bold"
                   placeholder="e.g. Silk Road Historians"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400">Community URL Slug</label>
                 <input 
                   required
                   value={slug}
                   onChange={e => setSlug(e.target.value)}
                   className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 font-mono text-sm"
                   placeholder="silk-road-scholars"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-gray-400">Mission Description</label>
                 <textarea 
                   required
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                   className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 h-32 italic text-sm"
                   placeholder="Describe the purpose of this collective..."
                 />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Visibility</label>
                    <select 
                      value={visibility}
                      onChange={e => setVisibility(e.target.value as any)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black uppercase text-xs"
                    >
                      <option value="public">Public (Open)</option>
                      <option value="private">Private (Restricted)</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400">Category</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-black uppercase text-xs"
                    >
                      <option value="Science">Science</option>
                      <option value="History">History</option>
                      <option value="Culture">Culture</option>
                      <option value="Tech">Technology</option>
                    </select>
                 </div>
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-brand-500 text-white font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl hover:bg-brand-600 transition-all"
            >
              {loading ? 'Registering Protocol...' : 'Launch Community'}
            </button>
          </form>
        </div>
      )}

      {/* Community Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {communities.map(c => (
          <div key={c.id} className="group p-10 bg-white border border-gray-100 rounded-[40px] shadow-soft hover:shadow-hover transition-all duration-700 bumble-bounce flex flex-col">
            <div className="flex justify-between items-start mb-8">
              <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-500">
                <Icons.Users className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black bg-brand-500 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  {c.members_count} Scholars
                </span>
                <span className="text-[8px] font-black text-gray-300 uppercase mt-2 tracking-widest">Active Members</span>
              </div>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 group-hover:text-brand-600 transition-colors">{c.name}</h3>
            <p className="text-sm text-gray-500 italic mb-8 flex-grow leading-relaxed line-clamp-3">
              {c.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-10">
              {c.tags?.map(t => (
                <span key={t} className="px-3 py-1 bg-gray-50 text-[9px] font-black text-gray-400 rounded-lg uppercase tracking-widest">
                  #{t}
                </span>
              ))}
            </div>

            <button className="w-full py-4 bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-brand-500 transition-all shadow-soft">
              Access Feed
            </button>
          </div>
        ))}

        {/* Placeholder if none */}
        {communities.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-gray-100 rounded-[40px]">
             <Icons.Users className="w-16 h-16 text-gray-100 mx-auto mb-6" />
             <p className="text-xl font-black uppercase tracking-tighter text-gray-300">No active communities yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};