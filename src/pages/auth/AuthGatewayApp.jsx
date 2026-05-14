import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, AlertCircle, Eye, EyeOff,
  ChevronLeft, CheckCircle2, LogIn, UserPlus
} from 'lucide-react';

import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext'; 

const AuthGatewayApp = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'success'

  // Login state
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Signup state
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);

  const [signupForm, setSignupForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });

  // ───────────────── LOGIN LOGIC ─────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      setLoginError('Please enter email and password');
      setLoginLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (!data?.user) {
        setLoginError('User not found');
        return;
      }

      const role = data.user.user_metadata?.role || 'agent';

      localStorage.setItem(
        'vynx_user',
        JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name:
            data.user.user_metadata?.full_name ||
            data.user.email?.split('@')[0],
          phone: data.user.user_metadata?.phone || '',
          role,
          roles: [role],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        })
      );

      onLoginSuccess(role);

      if (role === 'agent') navigate('/agent');
      else if (role === 'business') navigate('/business');
      else if (role === 'admin') navigate('/admin');
      else navigate('/unauthorized');
      
    } catch (err) {
      console.error(err);
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ───────────────── SIGNUP LOGIC ─────────────────
  const setField = (k) => (e) =>
    setSignupForm((prev) => ({ ...prev, [k]: e.target.value }));

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
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            full_name: signupForm.full_name,
            phone: signupForm.phone,
            role: 'agent',
          },
        },
      });

      if (error) {
        setSignupError(error.message);
        return;
      }

      console.log('Signup successful:', data);
      setTab('success'); // Move to success view
      
    } catch (err) {
      console.error(err);
      setSignupError('Signup failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  // Lightweight Motion Variants (Opacity only for zero-lag)
  const formVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  return (
    <div className={`relative min-h-[100dvh] w-full flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200 overflow-y-auto overflow-x-hidden ${
      isLight ? 'bg-[#FFFFFF] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      {/* --- SLEEK FLOATING BACK BUTTON --- */}
      <div className="absolute top-10 left-6 z-50">
        <Link 
          to="/"
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
            isLight 
              ? ' text-[#1A202C] hover:bg-[#E2E8F0]' 
              : ' text-[#F4F5F7] hover:bg-white/10'
          }`}
        >
          <span className='text-emerald-500'>Back</span>
          
        </Link>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="w-full max-w-sm mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-[100dvh]">
        
        {/* ==================== CENTERED LOGO SECTION ==================== */}
        <div className="flex flex-col items-center mb-4 w-full shrink-0">
          <div className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center p-1  ${
            isLight ? '' : ''
          }`}>
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Radix Logo" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center font-extrabold text-2xl text-[#81B398]">R</div>';
              }}
            />
          </div>
          {/* <h1 className="text-3xl font-extrabold tracking-tight">Radix</h1> */}
        </div>

        <AnimatePresence mode="wait">
          
          {/* ==================== LOGIN VIEW ==================== */}
          {tab === 'login' && (
            <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full shrink-0">
              
              {/* Welcome Text */}
              <div className="mb-8 text-center">
                <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                  Welcome Back!
                </h2>
                <p className={`text-sm font-medium mt-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Log in to your partner account
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Email Address
                  </label>
                  <AuthInput isLight={isLight} name="email" type="email" placeholder="name@company.com" required />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2 pl-1 pr-1">
                    <label className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                      Password
                    </label>
                    
                  </div>
                  <div className="relative">
                    <AuthInput isLight={isLight} name="password" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" required />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass((p) => !p)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-[#718096] hover:text-[#1A202C]' : 'text-[#9CA3AF] hover:text-[#F4F5F7]'}`}
                    >
                      {showLoginPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {loginError && <div className="pt-1"><ErrorMsg isLight={isLight} msg={loginError} /></div>}

                <div className="pt-4">
                  <SubmitBtn loading={loginLoading} label="Sign In" icon={<LogIn size={18} strokeWidth={2.5} />} />
                </div>
              </form>

              {/* Attractive Toggle to Signup */}
              <div className={`mt-8 pt-6 border-t flex flex-col items-center ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Don't have an account?
                </p>
                <button 
                  onClick={() => { setTab('signup'); setLoginError(''); }}
                  className="w-full py-3.5 rounded-[1rem] font-bold text-sm transition-all duration-200 active:scale-95 bg-[#81B398]/10 text-[#81B398] hover:bg-[#81B398]/20 border border-[#81B398]/20"
                >
                  Join Now Free
                </button>
              </div>

            </motion.div>
          )}

          {/* ==================== SIGNUP VIEW ==================== */}
          {tab === 'signup' && (
            <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full shrink-0">
              
              {/* Signup Text */}
              <div className="mb-8 text-center">
                <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                  Create Account
                </h2>
                <p className={`text-sm font-medium mt-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Join the partner network for free
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Full Name
                  </label>
                  <AuthInput isLight={isLight} value={signupForm.full_name} onChange={setField('full_name')} placeholder="John Doe" required />
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Email Address
                  </label>
                  <AuthInput isLight={isLight} type="email" value={signupForm.email} onChange={setField('email')} placeholder="john@email.com" required />
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Phone Number
                  </label>
                  <AuthInput isLight={isLight} type="tel" value={signupForm.phone} onChange={setField('phone')} placeholder="+91 98765 43210" required />
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Password
                  </label>
                  <div className="relative">
                    <AuthInput isLight={isLight} type={showSignupPass ? 'text' : 'password'} value={signupForm.password} onChange={setField('password')} placeholder="Min 8 characters" required />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass((p) => !p)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-[#718096] hover:text-[#1A202C]' : 'text-[#9CA3AF] hover:text-[#F4F5F7]'}`}
                    >
                      {showSignupPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Confirm Password
                  </label>
                  <AuthInput isLight={isLight} type="password" value={signupForm.confirm} onChange={setField('confirm')} placeholder="Re-enter password" required />
                </div>

                {signupError && <div className="pt-1"><ErrorMsg isLight={isLight} msg={signupError} /></div>}

                <div className="pt-4">
                  <SubmitBtn loading={signupLoading} label="Create Account" icon={<UserPlus size={18} strokeWidth={2.5} />} />
                </div>
              </form>

              {/* Attractive Toggle to Login */}
              <div className={`mt-8 pt-6 border-t flex flex-col items-center ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Already have an account?
                </p>
                <button 
                  onClick={() => { setTab('login'); setSignupError(''); }}
                  className="w-full py-3.5 rounded-[1rem] font-bold text-sm transition-all duration-200 active:scale-95 bg-[#81B398]/10 text-[#81B398] hover:bg-[#81B398]/20 border border-[#81B398]/20"
                >
                  Log In Here
                </button>
              </div>

            </motion.div>
          )}

          {/* ==================== SUCCESS VIEW ==================== */}
          {tab === 'success' && (
            <motion.div key="success" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full py-6 shrink-0">
              <div className="text-center w-full flex flex-col items-center">
                <div className="w-20 h-20 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20 shadow-xl">
                  <CheckCircle2 size={40} strokeWidth={2.5} />
                </div>
                
                <h3 className={`text-2xl font-extrabold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                  Ready to Go!
                </h3>
                
                <p className={`text-sm font-medium leading-relaxed mb-10 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Your partner account has been created successfully. Log in to start earning.
                </p>

                <button
                  onClick={() => {
                    setTab('login');
                    setSignupForm({ full_name: '', email: '', phone: '', password: '', confirm: '' });
                  }}
                  className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085] shadow-lg shadow-[#81B398]/20"
                >
                  Proceed to Login <LogIn size={18} />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

// ───────────────── CARDLESS BENTO COMPONENTS ─────────────────

const AuthInput = ({ isLight, ...props }) => (
  <input
    {...props}
    className={`w-full px-5 py-4 rounded-[1rem] text-sm font-bold outline-none border transition-all placeholder:font-medium ${
      isLight 
        ? 'bg-[#FFFFFF] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C] placeholder:text-[#A0AEC0]' 
        : 'bg-[#222938] border-white/10 focus:border-[#81B398] text-[#F4F5F7] placeholder:text-[#718096]'
    }`}
  />
);

const ErrorMsg = ({ msg }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2.5 bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20 px-4 py-3.5 rounded-[1rem]"
  >
    <AlertCircle size={16} className="shrink-0" strokeWidth={2.5} />
    <span className="text-xs font-bold">{msg}</span>
  </motion.div>
);

const SubmitBtn = ({ loading, label, icon }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-4 rounded-[1rem] font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-[#81B398] text-white hover:bg-[#6FA085] shadow-lg shadow-[#81B398]/20"
  >
    {loading ? (
      <>
        <Loader2 size={18} className="animate-spin" /> Processing...
      </>
    ) : (
      <>
        {icon} {label}
      </>
    )}
  </button>
);

export default AuthGatewayApp;