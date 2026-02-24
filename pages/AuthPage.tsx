import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icon';
import { motion, AnimatePresence } from 'motion/react';

export const AuthPage = ({ onNavigate }: { onNavigate: (route: any) => void }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'form' | 'code'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        await login(email, password);
        onNavigate({ name: 'home' });
      } else {
        await register(email, password, username);
        setSuccess("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
        setTimeout(() => onNavigate({ name: 'home' }), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Xatolik yuz berdi. Ma'lumotlar bazasi ulanishini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[40px] p-10 shadow-2xl border border-gray-100 flex flex-col items-center relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
        
        <motion.div 
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center shadow-xl shadow-brand-500/20 mb-8 relative z-10"
        >
          <Icons.Logo className="w-12 h-12 text-white" />
        </motion.div>
        
        <div className="text-center space-y-2 mb-10 relative z-10">
          <h2 className="text-3xl font-black tracking-tight text-gray-900 uppercase">
            {isLogin ? 'Kirish' : 'Roʻyxatdan oʻtish'}
          </h2>
          <p className="text-sm font-medium text-gray-400">
            {isLogin ? 'Atlas hamjamiyatiga qaytish' : 'Yangi bilimlar olamiga qoʻshiling'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-6 p-4 bg-red-50 text-red-600 text-[10px] font-black rounded-2xl border border-red-100 text-center uppercase tracking-widest"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full mb-6 p-4 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-2xl border border-emerald-100 text-center uppercase tracking-widest"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form 
          onSubmit={handleAuth} 
          className="w-full space-y-5 relative z-10"
        >
          {!isLogin && (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm group-focus-within:text-brand-500 transition-colors">@</div>
              <input
                type="text"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all outline-none"
                placeholder="username"
              />
            </div>
          )}

          <div className="relative group">
            <Icons.User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all outline-none"
              placeholder="Email manzilingiz"
            />
          </div>
          
          <div className="relative group">
            <Icons.ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:bg-white transition-all outline-none"
              placeholder="Parol"
            />
          </div>
          
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gray-900 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl hover:bg-brand-600 transition-all disabled:opacity-50"
          >
            {loading ? 'Yuborilmoqda...' : (isLogin ? 'Kirish' : 'Roʻyxatdan oʻtish')}
          </motion.button>
        </motion.form>

        <div className="mt-10 flex flex-col items-center gap-6 relative z-10">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
            className="text-[10px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-700 transition-colors"
          >
            {isLogin ? 'Hisob yaratish' : 'Hisobga kirish'}
          </button>
          
          <div className="flex items-center gap-4 text-gray-100">
            <div className="w-12 h-px bg-gray-100" />
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300">WikiAtlas Core</span>
            <div className="w-12 h-px bg-gray-100" />
          </div>
        </div>
      </motion.div>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-10"
      >
        WikiAtlas ochiq bilimlar platformasi. Ma'lumotlaringiz xavfsizligi kafolatlanadi.
      </motion.p>
    </div>
  );
};