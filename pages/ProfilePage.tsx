
import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/store';
import { Profile } from '../types';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icon';

export const ProfilePage = ({ id }: { id?: string }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const userIdToFetch = id || user?.id;
    if (userIdToFetch) {
      getProfile(userIdToFetch).then(p => {
        if (p) {
          setProfile(p);
          setUsername(p.username || '');
          setBio(p.bio || '');
        } else if (user && user.id === userIdToFetch) {
          // Fallback for simulation
          setUsername(user.user_metadata?.username || user.email?.split('@')[0] || '');
        }
        setLoading(false);
      });
    }
  }, [id, user]);

  const handleSave = async () => {
    // Fix: Ensure user is authenticated and pass user.id to updateProfile
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { username, bio });
      alert('Profile updated!');
    } catch (e: any) {
      alert('Error updating profile: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user && !id) return <div className="text-center py-20">Please login to view profile.</div>;
  if (loading) return <div className="text-center py-20"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto" /></div>;

  const isOwnProfile = !id || id === user?.id;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="relative mb-12">
        <div className="h-32 bg-brand-500 rounded-3xl" />
        <div className="absolute -bottom-10 left-8 flex items-end gap-6">
          <div className="w-24 h-24 bg-white p-1.5 rounded-2xl shadow-xl">
            <div className="w-full h-full bg-brand-500 text-white rounded-xl flex items-center justify-center font-black text-3xl">
              {username[0]?.toUpperCase() || user?.email?.[0].toUpperCase() || 'W'}
            </div>
          </div>
          <div className="mb-2">
            <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2 text-gray-900">
              {username || user?.email?.split('@')[0] || 'Foydalanuvchi'}
              {profile?.is_verified && (
                <Icons.CheckCircle className="w-5 h-5 text-brand-500" />
              )}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               {user?.email}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Tarjimai hol / Manifesto</h2>
            {isOwnProfile ? (
              <textarea 
                value={bio} 
                onChange={e => setBio(e.target.value)}
                className="w-full bg-transparent text-sm font-medium border-none focus:ring-0 p-0 resize-none h-32 text-gray-700"
                placeholder="O'zingiz haqingizda yozing..."
              />
            ) : (
              <p className="text-sm font-medium text-gray-700">
                {bio || "Ushbu muallif hali o'zi haqida ma'lumot qoldirmagan."}
              </p>
            )}
          </div>
          
          {isOwnProfile && (
             <button 
               onClick={handleSave} 
               disabled={saving} 
               className="px-8 py-3 bg-gray-900 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-brand-600 transition-all shadow-lg disabled:opacity-50"
             >
               {saving ? 'SAQLANMOQDA...' : 'PROFILNI SAQLASH'}
             </button>
          )}
        </div>

        <div className="space-y-6">
           <div className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Hisob holati</h3>
              <div className="flex items-center gap-3">
                {profile?.is_verified ? (
                  <>
                    <Icons.CheckCircle className="w-5 h-5 text-brand-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Tasdiqlangan muallif</span>
                  </>
                ) : (
                  <>
                    <Icons.Clock className="w-5 h-5 text-gray-300" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Ko'rib chiqilmoqda</span>
                  </>
                )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
