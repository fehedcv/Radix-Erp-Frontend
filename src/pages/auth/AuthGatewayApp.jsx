import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, AlertCircle, Eye, EyeOff,
  ChevronLeft, Wallet, CheckCircle2, Lock, Hexagon
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';

const AuthGatewayApp = ({ onLoginSuccess }) => {
  const navigate     = useNavigate();
  const bgRef        = useRef(null);
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

  // Floating GSAP animation (Subtle full-screen app background)
  useEffect(() => {
    if (bgRef.current) {
      gsap.to('.floating-node', {
        y: -30, x: 15, duration: 4, repeat: -1, yoyo: true,
        ease: 'sine.inOut', stagger: 0.3,
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
          setLoginError('Invalid username or password');
        }
      } else {
        setLoginError('Invalid username or password');
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div ref={bgRef} className="h-[100dvh] w-full bg-[#F4F5F9] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto no-scrollbar relative">

      {/* --- LIGHT AMBIENT BACKGROUND --- */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-20%] w-[70vw] h-[70vw] rounded-full bg-[#38BDF8] filter blur-[120px] opacity-10 floating-node" />
        <div className="absolute bottom-[20%] right-[-20%] w-[60vw] h-[60vw] rounded-full bg-[#4ADE80] filter blur-[100px] opacity-[0.08] floating-node" style={{ animationDelay: '-2s' }} />
      </div>

      {/* --- TOP HEADER NAVIGATION --- */}
      <div className="w-full p-4 pt-12 z-20 flex justify-between items-center shrink-0">
        <Link 
          to="/" 
          className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-full shadow-sm active:scale-95 transition-all text-slate-500 hover:text-black"
        >
          <ChevronLeft size={16} strokeWidth={3} />
          <span className="text-[9px] font-black uppercase tracking-widest">Back</span>
        </Link>
      </div>

      <div className="w-full max-w-[420px] mx-auto px-4 pb-12 flex-1 flex flex-col z-10 relative">
        
        {/* --- LOGO & BRANDING SECTION --- */}
        <div className="flex flex-col items-center mt-6 mb-8 text-center">
        <div className="w-20 h-20 bg-white rounded-[1.75rem] shadow-sm flex items-center justify-center mb-5 relative overflow-hidden">
  {/* Inner gradient glow for premium feel */}
  <div className="absolute inset-0 bg-gradient-to-br from-[#38BDF8]/10 to-transparent" />
  
  <img 
    src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png"   // 🔥 replace with your logo path
    alt="Logo"
    className="w-12 h-12 object-contain relative z-10"
  />
</div>
          <h1 className="text-3xl font-black text-black tracking-tight uppercase">Radix</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Partner Portal</p>
        </div>

        {/* --- TAB SWITCHER (Bento Style) --- */}
        <div className="bg-white p-1.5 rounded-[1.5rem] shadow-sm flex relative mb-4 shrink-0">
          <div 
            className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#F4F5F9] rounded-[1.25rem] transition-all duration-300 ease-out"
            style={{ left: tab === 'login' ? '6px' : 'calc(50%)' }}
          />
          <button
            onClick={() => { setTab('login'); setLoginError(''); }}
            className={`relative z-10 flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${tab === 'login' ? 'text-black' : 'text-slate-400'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('signup'); setSignupError(''); setSignupSuccess(false); }}
            className={`relative z-10 flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${tab === 'signup' ? 'text-black' : 'text-slate-400'}`}
          >
            Sign Up
          </button>
        </div>

        {/* --- MAIN FORM CARD --- */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm relative overflow-hidden shrink-0">
          <AnimatePresence mode="wait">
            
            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                    <AuthInput name="email" type="text" placeholder="name@company.com" required />
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                      <button type="button" className="text-[9px] font-black text-[#38BDF8] uppercase tracking-widest">Forgot?</button>
                    </div>
                    <div className="relative">
                      <AuthInput name="password" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" required />
                      <button type="button" onClick={() => setShowLoginPass(p => !p)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors"
                      >
                        {showLoginPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-1">
                    {loginError && <ErrorMsg msg={loginError} />}
                  </div>
                  
                  <div className="pt-2">
                    <SubmitBtn loading={loginLoading} label="Sign In" icon={<Lock size={16}/>} />
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── SIGNUP FORM ── */}
            {tab === 'signup' && (
              <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                
                {signupSuccess ? (
                  <div className="flex flex-col items-center text-center gap-3 py-4">
                    <div className="w-20 h-20 bg-[#4ADE80]/10 rounded-[1.5rem] flex items-center justify-center">
                      <CheckCircle2 size={40} className="text-[#4ADE80]" />
                    </div>
                    <div className="mt-2">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Ready</h3>
                      <p className="text-xs text-slate-500 mt-2 font-bold leading-relaxed px-2">
                        Your partner account has been created successfully.
                      </p>
                    </div>
                    <button
                      onClick={() => { setTab('login'); setSignupSuccess(false); setSignupForm({ full_name:'', email:'', phone:'', password:'', confirm:'' }); }}
                      className="w-full mt-6 bg-black text-white py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-black/10"
                    >
                      Proceed to Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-5">
                    
                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Full Name</label>
                      <AuthInput value={signupForm.full_name} onChange={setField('full_name')} placeholder="John Doe" required />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                      <AuthInput type="email" value={signupForm.email} onChange={setField('email')} placeholder="john@email.com" required />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Phone Number</label>
                      <AuthInput type="tel" value={signupForm.phone} onChange={setField('phone')} placeholder="+91 98765 43210" required />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Password</label>
                        <div className="relative">
                          <AuthInput type={showSignupPass ? 'text' : 'password'} value={signupForm.password} onChange={setField('password')} placeholder="Min 8 chars" required />
                          <button type="button" onClick={() => setShowSignupPass(p => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors">
                            {showSignupPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Confirm</label>
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

        <p className="text-center text-[9px] text-slate-400 uppercase tracking-widest mt-8 font-black">
          Secured by Radix Enterprise
        </p>

      </div>
    </div>
  );
};

// ─── Shared Sub-components (Bento Grid System) ─────────────────────────────

const AuthInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full text-sm text-slate-900 font-bold outline-none transition-all placeholder:text-slate-400 bg-[#F4F5F9] border border-transparent px-5 py-4 rounded-[1.25rem] focus:border-black focus:bg-white focus:shadow-sm"
  />
);

const ErrorMsg = ({ msg }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-rose-500 text-xs bg-rose-50 border border-rose-100 px-4 py-3 rounded-[1rem] font-bold">
    <AlertCircle size={16} className="shrink-0" /> {msg}
  </motion.div>
);

const SubmitBtn = ({ loading, label, icon }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full flex justify-center items-center gap-2 font-black text-[11px] uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 bg-black text-white py-4 rounded-[1.25rem] shadow-xl shadow-black/10 hover:bg-slate-900"
  >
    <span className="flex items-center gap-2">
      {loading ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : <>{icon && icon} {label}</>}
    </span>
  </button>
);

export default AuthGatewayApp;