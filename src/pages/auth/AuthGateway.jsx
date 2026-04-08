import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, AlertCircle, Eye, EyeOff,
  ChevronLeft, Wallet, CheckCircle2, Lock
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';

const AuthGateway = ({ onLoginSuccess }) => {
  const navigate     = useNavigate();
  const infoSideRef  = useRef(null);
  const [tab, setTab] = useState('login'); // 'login' | 'signup'

  // Login state
  const [loginLoading,  setLoginLoading]  = useState(false);
  const [loginError,    setLoginError]    = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Signup state
  const [signupLoading,  setSignupLoading]  = useState(false);
  const [signupError,    setSignupError]    = useState('');
  const [signupSuccess,  setSignupSuccess]  = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [signupForm,     setSignupForm]     = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
  });

  // Floating GSAP animation (Mobile only background elements)
  useEffect(() => {
    if (infoSideRef.current && window.innerWidth < 1024) {
      gsap.to('.floating-node', {
        y: -20, duration: 3, repeat: -1, yoyo: true,
        ease: 'power1.inOut', stagger: 0.3,
      });
    }
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    const formData = new FormData(e.target);

    try {
      const tokenRes = await frappeApi.post(
        '/method/business_chain.api.auth.mobile_login',
        {
          usr: formData.get('email'),
          pwd: formData.get('password'),
        }
      );
      const { api_key, api_secret } = tokenRes.data.message;

      localStorage.setItem('bc_api_key',    api_key);
      localStorage.setItem('bc_api_secret', api_secret);

      const res = await frappeApi.get('/method/business_chain.api.api.whoami');
      const { user, primary_role, roles } = res.data.message;

      if (!primary_role) throw new Error('ROLE_NOT_ASSIGNED');

      localStorage.setItem('vynx_user', JSON.stringify({ email: user, role: primary_role, roles }));
      onLoginSuccess(primary_role);

      if      (primary_role === 'agent')    navigate('/agent');
      else if (primary_role === 'business') navigate('/business');
      else if (primary_role === 'admin')    navigate('/admin');
      else                                  navigate('/unauthorized');

    } catch (err) {
      const serverMsg = err?.response?.data?._server_messages;
      if (serverMsg) {
        try {
          const parsed = JSON.parse(JSON.parse(serverMsg)[0]);
          setLoginError(parsed.message || 'Login failed.');
        } catch {
          setLoginError('Invalid credentials or role not assigned.');
        }
      } else {
        setLoginError('Invalid credentials or role not assigned.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Signup ────────────────────────────────────────────────────────────────
  const setField = (k) => (e) => setSignupForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (signupForm.password !== signupForm.confirm) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (signupForm.password.length < 8) {
      setSignupError('Password must be at least 8 characters.');
      return;
    }

    setSignupLoading(true);
    try {
      await frappeApi.post('/method/business_chain.api.auth.agent_signup', {
        full_name: signupForm.full_name,
        email:     signupForm.email,
        password:  signupForm.password,
        phone:     signupForm.phone,
      });
      setSignupSuccess(true);
    } catch (err) {
      const msg = err?.response?.data?._server_messages;
      if (msg) {
        try {
          const parsed = JSON.parse(JSON.parse(msg)[0]);
          setSignupError(parsed.message || 'Signup failed.');
        } catch {
          setSignupError('Signup failed. Please try again.');
        }
      } else {
        setSignupError('Signup failed. Please try again.');
      }
    } finally {
      setSignupLoading(false);
    }
  };

  // Framer Motion variants
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    // Outer Wrapper: Locks to strictly 100dvh, disables all scrolling
    <div ref={infoSideRef} className="h-[100dvh] w-full bg-[#05050A] lg:bg-black flex flex-col lg:flex-row items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden selection:bg-white/30 relative">

      {/* --- MOBILE AMBIENT ORBS (Hidden on Desktop) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 lg:hidden">
        <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#7038FF] mix-blend-screen filter blur-[120px] opacity-30 floating-node" />
        <div className="absolute bottom-[10%] right-[10%] w-[70vw] h-[70vw] rounded-full bg-[#9D4EDD] mix-blend-screen filter blur-[130px] opacity-20 floating-node" style={{ animationDelay: '-2s' }} />
      </div>

      {/* --- DESKTOP DECORATIVE LINES (Hidden on Mobile) --- */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-[150vw] h-[150vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" viewBox="0 0 1000 1000" fill="none">
          <path d="M0,800 Q300,500 500,800 T1000,400" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M-200,200 Q400,800 800,200" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>

      {/* --- DESKTOP LEFT PANEL (Welcome Text) --- */}
      <div className="hidden lg:flex w-1/2 h-full flex-col justify-center px-16 xl:px-24 z-10 relative">
        <h1 className="text-6xl xl:text-7xl font-medium tracking-tighter leading-[1.05] mb-6 text-white">
          Access your <br/> Dashboard.
        </h1>
        <p className="text-white/60 text-lg max-w-md font-light leading-relaxed">
Submit referrals, monitor approvals, and withdraw your commissions through our agent portal.        </p>
      </div>

      {/* --- RIGHT PANEL (Mobile Full Width / Desktop Right Half) --- */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center px-4 relative z-10">
        
        {/* Mobile Header / Back Button */}
        <div className="absolute top-0 left-0 w-full p-6 z-40 flex justify-between items-center lg:hidden">
          <Link to="/" className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95">
            <ChevronLeft size={20} />
          </Link>
        </div>

        {/* AUTH CARD WRAPPER */}
        <div className="w-full max-w-[400px]">

          {/* CARD CONTAINER
            Mobile: Liquid Glassmorphism
            Desktop: Minimalist Dark Box 
          */}
          <div className="bg-white/[0.03] lg:bg-[#0a0a0a] backdrop-blur-[60px] lg:backdrop-blur-none border border-white/[0.08] lg:border-[#222] rounded-[2rem] lg:rounded-3xl p-5 sm:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] lg:shadow-none relative overflow-hidden">
            
            {/* Mobile Glossy Highlight (Hidden on Desktop) */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none lg:hidden"></div>

            {/* Tab Switcher */}
            <div className="relative flex bg-[#12121A]/80 lg:bg-[#111] backdrop-blur-md lg:backdrop-blur-none p-1.5 rounded-full mb-6 border border-white/[0.05] lg:border-[#222] z-10">
              <div 
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/[0.1] lg:bg-[#222] border border-white/[0.1] lg:border-[#333] rounded-full shadow-sm transition-all duration-300 ease-out"
                style={{ left: tab === 'login' ? '6px' : 'calc(50%)' }}
              />
              <button
                onClick={() => { setTab('login'); setLoginError(''); }}
                className={`relative z-10 flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors ${tab === 'login' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Login
              </button>
              <button
                onClick={() => { setTab('signup'); setSignupError(''); setSignupSuccess(false); }}
                className={`relative z-10 flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors ${tab === 'signup' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
              >
                Sign Up
              </button>
            </div>

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                
                {/* ── LOGIN FORM ── */}
                {tab === 'login' && (
                  <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    <header className="hidden lg:block mb-4 text-center">
                      <h2 className="text-2xl font-medium text-white">Welcome Back</h2>
                    </header>
                    <form onSubmit={handleLogin} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Email Address</label>
                        <AuthInput name="email" type="text" placeholder="name@company.com" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Password</label>
                        <div className="relative">
                          <AuthInput name="password" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" required />
                          <button type="button" onClick={() => setShowLoginPass(p => !p)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#B282FE] lg:hover:text-white transition-colors"
                          >
                            {showLoginPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-1">
                        {loginError && <ErrorMsg msg={loginError} />}
                      </div>
                      
                      <div className="pt-2">
                        <SubmitBtn loading={loginLoading} label="Secure Login" icon={<Lock size={16}/>} />
                      </div>
                    </form>
                  </motion.div>
                )}

                {/* ── SIGNUP FORM ── */}
                {tab === 'signup' && (
                  <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
                    
                    {signupSuccess ? (
                      <div className="flex flex-col items-center text-center gap-3 py-4">
                        <div className="w-16 h-16 bg-emerald-500/10 lg:bg-[#111] border border-emerald-500/20 lg:border-emerald-500/50 rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.2)] lg:shadow-none">
                          <CheckCircle2 size={32} className="text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-light lg:font-medium text-white tracking-tight">Welcome Aboard</h3>
                          <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
                            Your agent account is verified and ready.
                          </p>
                        </div>
                        <button
                          onClick={() => { setTab('login'); setSignupSuccess(false); setSignupForm({ full_name:'', email:'', phone:'', password:'', confirm:'' }); }}
                          className="w-full mt-2 bg-white/10 lg:bg-white lg:text-black hover:bg-white/20 border border-white/10 lg:border-transparent text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                        >
                          Proceed to Login
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleSignup} className="space-y-3">
                        <header className="hidden lg:block mb-4 text-center">
                          <h2 className="text-2xl font-medium text-white">Create Account</h2>
                        </header>
                        
                        {/* TWO FIELDS IN ONE LINE: Name & Email */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Full Name</label>
                            <AuthInput value={signupForm.full_name} onChange={setField('full_name')} placeholder="John Doe" required />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Email</label>
                            <AuthInput type="email" value={signupForm.email} onChange={setField('email')} placeholder="john@mail.com" required />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Phone Number</label>
                          <AuthInput type="tel" value={signupForm.phone} onChange={setField('phone')} placeholder="+91 98765 43210" required />
                        </div>
                        
                        {/* TWO FIELDS IN ONE LINE: Passwords */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Password</label>
                            <div className="relative">
                              <AuthInput type={showSignupPass ? 'text' : 'password'} value={signupForm.password} onChange={setField('password')} placeholder="Min 8 chars" required />
                              <button type="button" onClick={() => setShowSignupPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#B282FE] lg:hover:text-white transition-colors">
                                {showSignupPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Confirm Pwd</label>
                            <AuthInput type="password" value={signupForm.confirm} onChange={setField('confirm')} placeholder="Re-enter" required />
                          </div>
                        </div>

                        <div className="pt-1">
                          {signupError && <ErrorMsg msg={signupError} />}
                        </div>

                        <div className="pt-2">
                          <SubmitBtn loading={signupLoading} label="Create Account" icon={<Wallet size={16}/>} />
                        </div>
                      </form>
                    )}
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </div>

          <p className="text-center text-[10px] text-white/20 uppercase tracking-widest mt-6 font-medium">
            Protected by Frappe Session Auth
          </p>

        </div>
      </div>
    </div>
  );
};

// ─── Shared Sub-components ───────────────────────────────────────────────────

const AuthInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full text-sm text-white font-light outline-none transition-all placeholder:text-white/20 lg:placeholder:text-white/30
      /* Mobile: Glassmorphism */
      bg-black/20 backdrop-blur-md border border-white/[0.08] px-5 py-3.5 rounded-2xl focus:border-[#B282FE]/50 focus:bg-white/[0.02] focus:ring-4 focus:ring-[#B282FE]/10
      /* Desktop: Minimalist Website Theme */
      lg:bg-[#111] lg:backdrop-blur-none lg:border-[#333] lg:rounded-xl lg:px-4 lg:py-3 lg:focus:border-white lg:focus:bg-[#151515] lg:focus:ring-0
    "
  />
);

const ErrorMsg = ({ msg }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-red-400 text-xs bg-red-500/10 lg:bg-[#111] border border-red-500/20 lg:border-red-500/40 px-4 py-3 lg:py-2.5 rounded-xl lg:rounded-lg font-medium">
    <AlertCircle size={16} className="shrink-0" /> {msg}
  </motion.div>
);

const SubmitBtn = ({ loading, label, icon }) => (
  <button
    type="submit"
    disabled={loading}
    className="group relative w-full overflow-hidden flex justify-center items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100
      /* Mobile: Glassmorphism Gradient Button */
      bg-white text-black py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(178,130,254,0.2)] lg:shadow-none
      /* Desktop: Minimalist Outline Button */
      lg:bg-transparent lg:text-white lg:py-3.5 lg:rounded-full lg:border lg:border-white
    "
  >
    {/* Mobile: Gradient Fill on Press */}
    <span className="absolute inset-0 bg-gradient-to-r from-[#B282FE] to-[#7038FF] opacity-0 group-active:opacity-100 transition-opacity duration-300 lg:hidden"></span>
    
    {/* Desktop: Solid White Fill on Hover */}
    <span className="hidden lg:block absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>

    <span className="relative z-10 flex items-center gap-2 group-active:text-white lg:group-hover:text-black transition-colors duration-300">
      {loading ? <><Loader2 size={16} className="animate-spin"/> Processing</> : <>{icon} {label}</>}
    </span>
  </button>
);

export default AuthGateway;