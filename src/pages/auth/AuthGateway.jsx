import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

// Subcomponents
import BackgroundDecorations from '../../components/web/auth/BackgroundDecorations';
import LeftWelcomePanel from '../../components/web/auth/LeftWelcomePanel';
import TabSwitcher from '../../components/web/auth/TabSwitcher';
import LoginForm from '../../components/web/auth/LoginForm';
import SignupForm from '../../components/web/auth/SignupForm';
import ForgotPasswordForm from '../../components/web/auth/ForgotPasswordForm';

const AuthGateway = ({ onLoginSuccess }) => {
  const infoSideRef = useRef(null);
  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'forgot'

  // Terms state
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Login state
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupForm, setSignupForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
  });

  // ── Login ─────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    if (!agreedToTerms) {
      setLoginError('You must agree to the Terms & Conditions');
      setLoginLoading(false);
      return;
    }

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      setLoginError('Please enter email and password');
      setLoginLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError(error.message);
      } else {
        onLoginSuccess?.(data);
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Signup ────────────────────────────────────────────────────────────────
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError('');

    if (!agreedToTerms) {
      setSignupError('You must agree to the Terms & Conditions');
      return;
    }

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
            phone: signupForm.phone
          }
        }
      });

      if (error) {
        setSignupError(error.message);
      } else {
        setSignupSuccess(true);
      }
    } catch (err) {
      setSignupError('Signup failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div ref={infoSideRef} className="h-[100dvh] w-full bg-[#05050A] lg:bg-black flex flex-col lg:flex-row items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden selection:bg-white/30 relative">
      
      <BackgroundDecorations infoSideRef={infoSideRef} />

      <LeftWelcomePanel />

      {/* --- RIGHT PANEL --- */}
      <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center px-4 relative z-10">
        
        {/* Mobile Header / Back Button */}
        <div className="absolute top-0 left-0 w-full p-6 z-40 flex justify-between items-center lg:hidden">
          <Link to="/" className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95">
            <ChevronLeft size={20} />
          </Link>
        </div>

        {/* AUTH CARD WRAPPER */}
        <div className="w-full max-w-[400px]">
          <div className="bg-white/[0.03] lg:bg-[#0a0a0a] backdrop-blur-[60px] lg:backdrop-blur-none border border-white/[0.08] lg:border-[#222] rounded-[2rem] lg:rounded-3xl p-5 sm:p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] lg:shadow-none relative overflow-hidden">
            
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none lg:hidden"></div>

            <TabSwitcher 
              tab={tab} 
              setTab={setTab} 
              setLoginError={setLoginError} 
              setSignupError={setSignupError} 
              setSignupSuccess={setSignupSuccess} 
              setSignupForm={setSignupForm} 
            />

            <div className="relative z-10">
              <AnimatePresence mode="wait">
                {tab === 'login' && (
                  <LoginForm
                    onSubmit={handleLogin}
                    error={loginError}
                    loading={loginLoading}
                    formVariants={formVariants}
                    onForgotPassword={() => { setLoginError(''); setTab('forgot'); }}
                  />
                )}

                {tab === 'signup' && (
                  <SignupForm
                    onSubmit={handleSignup}
                    error={signupError}
                    loading={signupLoading}
                    success={signupSuccess}
                    form={signupForm}
                    setForm={setSignupForm}
                    setTab={setTab}
                    setSuccess={setSignupSuccess}
                    formVariants={formVariants}
                  />
                )}

                {tab === 'forgot' && (
                  <ForgotPasswordForm
                    formVariants={formVariants}
                    onBack={() => setTab('login')}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center gap-2 relative z-10">
              <input 
                type="checkbox" 
                id="terms" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 cursor-pointer accent-white"
              />
              <label htmlFor="terms" className="text-xs text-white/60 cursor-pointer select-none">
                I agree to the <Link to="/terms" target="_blank" className="text-white hover:underline">Terms & Conditions</Link>
              </label>
            </div>

          </div>

          <p className="text-center text-[10px] text-white/20 uppercase tracking-widest mt-6 font-medium">
            Secured Authentication
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthGateway;