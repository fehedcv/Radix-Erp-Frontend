import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import gsap from 'gsap';
import { 
  LogIn, UserPlus, Mail, Lock, User, 
  Loader2, AlertCircle, Eye, EyeOff, ChevronLeft, ShieldCheck,
  Layers, Wallet
} from 'lucide-react';

// 1. IMPORT DUMMY DATA (Preserved)
import { dummyUsers } from '../../data/userData';

const AuthGateway = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const infoSideRef = useRef(null);
  
  const isLogin = location.pathname === '/login';

  const [isLoading, setIsLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  // --- GSAP Floating Animation ---
  useEffect(() => {
    if (infoSideRef.current) {
      gsap.to(".floating-node", {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 0.2
      });
    }
  }, []);

  // --- LOGIC (STRICTLY PRESERVED) ---
  const handleAuth = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const name = formData.get('name');

    setTimeout(() => {
      if (isLogin) {
        if (email === dummyUsers.admin.email && password === dummyUsers.admin.password) {
          completeAuth(dummyUsers.admin);
          return;
        }
        
        const localUnits = JSON.parse(localStorage.getItem('vynx_units') || "[]");
        const allUnits = [...dummyUsers.businessUnits, ...localUnits];
        const bizMatch = allUnits.find(u => u.email === email && u.password === password);
        if (bizMatch) {
          completeAuth({ ...bizMatch, role: 'business' });
          return;
        }

        const localAgents = JSON.parse(localStorage.getItem('vynx_agents') || "[]");
        const allAgents = [...dummyUsers.agents, ...localAgents];
        const agentMatch = allAgents.find(a => a.email === email && a.password === password);
        if (agentMatch) {
          completeAuth({ ...agentMatch, role: 'agent' });
          return;
        }
        setError("AUTHENTICATION_FAILED: ACCESS_DENIED");
      } else {
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
    // Changed min-h-screen to min-h-svh for better mobile address bar handling
    <div className="min-h-svh bg-[#F8FAFC] flex font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">
      
      {/* --- LEFT SIDE: VALUE SHOWCASE (Desktop Only) --- */}
      <div ref={infoSideRef} className="hidden lg:flex w-1/2 bg-[#0F172A] relative flex-col justify-center px-20 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-10"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight uppercase">Radix<span className="text-indigo-400">Chain</span></span>
          </motion.div>

          <h1 className="text-5xl font-bold tracking-tighter leading-[1.1] mb-6">
            The Business Chain <br />
            <span className="text-indigo-400 italic">Infrastructure.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mb-12 leading-relaxed font-medium">
            Authorized access to the unified ledger for agents, business units, and headquarters.
          </p>

          <div className="space-y-4">
             <div className="floating-node w-64 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                  <Wallet size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Standard Rate</p>
                  <p className="text-sm font-bold">1.00 INR / Credit</p>
                </div>
             </div>
             <div className="floating-node w-72 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md flex items-center gap-4 ml-12">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-400">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">Security Status</p>
                  <p className="text-sm font-bold">AES-256 Encrypted</p>
                </div>
             </div>
          </div>
        </div>

        {/* <div className="absolute bottom-10 left-20">
           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.4em]">© 2025 Radix Network Operations</p>
        </div> */}
      </div>

      {/* --- RIGHT SIDE: AUTHENTICATION TERMINAL --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12 sm:px-12 lg:p-16 bg-white lg:bg-[#F8FAFC] relative">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px] space-y-8"
        >
          {/* Mobile Branding - Now inside the flow for better spacing */}
          <div className="lg:hidden flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
                <Layers size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">RadixChain</span>
          </div>

          {/* Breadcrumb Navigation */}
          <Link 
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors"
          >
            <ChevronLeft size={14} /> Back to Network
          </Link>

          <header className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A]">
              {isLogin ? "Partner Login" : "Agent Registry"}
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? "Enter your credentials to access your dashboard." : "Initialize your agent identity to start earning."}
            </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode='wait'>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} 
                  animate={{ opacity: 1, height: 'auto' }} 
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Legal Identity</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input required name="name" type="text" placeholder="Full Name" className="w-full bg-white border border-slate-200 py-3.5 sm:py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 rounded-xl transition-all placeholder:text-slate-300" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email Protocol</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input required name="email" type="email" placeholder="name@radix.com" className="w-full bg-white border border-slate-200 py-3.5 sm:py-4 pl-12 pr-4 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 rounded-xl transition-all placeholder:text-slate-300" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Passkey</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input required name="password" type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white border border-slate-200 py-3.5 sm:py-4 pl-12 pr-12 text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/5 rounded-xl transition-all placeholder:text-slate-300" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors p-1">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-2 text-red-600 border border-red-100 p-3 rounded-xl bg-red-50/50">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-tight leading-normal">{error}</p>
              </motion.div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-4 sm:py-5 bg-[#0F172A] hover:bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-slate-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>{isLogin ? <LogIn size={18} /> : <UserPlus size={18} />} {isLogin ? "LOGIN TO DASHBOARD" : "REGISTER"}</>
              )}
            </button>
          </form>

          {/* TOGGLE SECTION */}
          <footer className="pt-6 sm:pt-8 border-t border-slate-100 flex flex-col items-center gap-4">
            {isLogin ? (
              <>
                <p className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-widest">New to the Business Chain?</p>
                <button 
                  onClick={() => navigate('/signup')}
                  className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest hover:text-[#0F172A] transition-colors underline-offset-4 hover:underline"
                >
                  Create Agent Account
                </button>
              </>
            ) : (
              <button 
                onClick={() => navigate('/login')}
                className="text-[11px] font-bold text-slate-400 hover:text-[#0F172A] uppercase tracking-widest transition-colors"
              >
                Return to Login Page
              </button>
            )}
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthGateway;