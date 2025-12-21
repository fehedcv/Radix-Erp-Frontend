import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, UserPlus, Mail, Lock, User, 
  Loader2, AlertCircle, Eye, EyeOff, ChevronLeft, ShieldCheck 
} from 'lucide-react';

// 1. IMPORT DUMMY DATA (Core Access Roles)
import { dummyUsers } from '../../data/userData';

const AuthGateway = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    // Authentication Logic [cite: 18, 22]
    setTimeout(() => {
      if (isLogin) {
        // Private HQ Access [cite: 19]
        if (email === dummyUsers.admin.email && password === dummyUsers.admin.password) {
          completeAuth(dummyUsers.admin);
          return;
        }
        // Private Business Access [cite: 21]
        const localUnits = JSON.parse(localStorage.getItem('vynx_units') || "[]");
        const allUnits = [...dummyUsers.businessUnits, ...localUnits];
        const bizMatch = allUnits.find(u => u.email === email && u.password === password);
        if (bizMatch) {
          completeAuth({ ...bizMatch, role: 'business' });
          return;
        }
        // Agent Access [cite: 20]
        const localAgents = JSON.parse(localStorage.getItem('vynx_agents') || "[]");
        const allAgents = [...dummyUsers.agents, ...localAgents];
        const agentMatch = allAgents.find(a => a.email === email && a.password === password);
        if (agentMatch) {
          completeAuth({ ...agentMatch, role: 'agent' });
          return;
        }
        setError("AUTHENTICATION_FAILED: ACCESS_DENIED");
      } else {
        // Agent Registry [cite: 14]
        const existingAgents = JSON.parse(localStorage.getItem('vynx_agents') || "[]");
        const emailExists = dummyUsers.agents.some(a => a.email === email) || 
                            existingAgents.some(a => a.email === email);
        if (emailExists) {
          setError("REGISTRATION_FAILED: IDENTITY_EXISTS");
        } else {
          const newAgent = { 
            id: `A-${Math.floor(1000 + Math.random() * 9000)}`, 
            name, email, password, role: 'agent',
            joinedDate: new Date().toISOString()
          };
          localStorage.setItem('vynx_agents', JSON.stringify([...existingAgents, newAgent]));
          completeAuth(newAgent);
        }
      }
      setIsLoading(false);
    }, 1200);
  };

  const completeAuth = (userData) => {
    localStorage.setItem('vynx_user', JSON.stringify(userData));
    onLoginSuccess(userData.role);
  };

  return (
    <div className="h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* TECHNICAL GRID BACKDROP  */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" 
           style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '32px 32px' }} />

      {/* PORTAL CARD [cite: 60, 62] */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-slate-50 border border-slate-200 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.1)] relative z-10"
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white/50">
          <button 
            onClick={() => window.location.href = '/'}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft size={12} />
            Home
          </button>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Radix Network</span>
        </div>

        <div className="p-6 lg:p-8 space-y-5">
          {/* BRANDING SECTION */}
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 bg-slate-900 flex items-center justify-center text-white shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h1 className="text-xl font-medium text-slate-900 tracking-tight">
                {isLogin ? "Secure Portal" : "Agent Registry"}
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Authorized Access Only</p>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 overflow-hidden"
                >
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                    <input required name="name" type="text" placeholder="Identity Name" className="w-full bg-white border border-slate-200 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity (Email)</label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input required name="email" type="email" placeholder="name@network.com" className="w-full bg-white border border-slate-200 py-3 pl-10 pr-4 text-xs font-medium text-slate-900 outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Passkey</label>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input required name="password" type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white border border-slate-200 py-3 pl-10 pr-10 text-xs font-medium text-slate-900 outline-none focus:border-indigo-600 transition-all placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2 text-red-600 border-l-2 border-red-600 pl-3 py-1 bg-red-50/50">
                <AlertCircle size={12} className="mt-0.5 shrink-0" />
                <p className="text-[9px] font-black uppercase tracking-tight">{error}</p>
              </motion.div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-indigo-100/10"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>{isLogin ? <LogIn size={16} /> : <UserPlus size={16} />} {isLogin ? "Authenticate" : "Initialize Registry"}</>
              )}
            </button>
          </form>

          {/* AGENT CTA SECTION [cite: 14] */}
          <div className="pt-4 border-t border-slate-200">
            {isLogin ? (
              <div className="space-y-2.5">
                <p className="text-[9px] text-center font-black text-slate-400 uppercase tracking-widest">New to the Business Chain?</p>
                <button 
                  onClick={() => {setIsLogin(false); setError("");}}
                  className="w-full py-3.5 border border-indigo-600 text-indigo-600 text-[9px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Register Your Agent Identity
                </button>
              </div>
            ) : (
              <button 
                onClick={() => {setIsLogin(true); setError("");}}
                className="w-full text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-[0.2em] transition-colors"
              >
                Return to Login Terminal
              </button>
            )}
          </div>
        </div>

        {/* COMPACT FOOTER */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Radix Infrastructure</span>
          <div className="flex gap-1.5">
            <div className="w-6 h-0.5 bg-slate-900"></div>
            <div className="w-2 h-0.5 bg-indigo-600"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthGateway;