import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext'; 

// Modules (AuthLogo removed)
import AppLoginForm from '../../components/app/auth/AppLoginForm';
import AppSignupForm from '../../components/app/auth/AppSignupForm';
import AppSuccessView from '../../components/app/auth/AppSuccessView';

const AuthGatewayApp = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  
  // Force Dark Theme
  useEffect(() => {
    setTheme('dark');
  }, [setTheme]);

  const [tab, setTab] = useState('login');
  
  // Terms & Conditions State
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Login State
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup State
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupForm, setSignupForm] = useState({
    full_name: '', email: '', phone: '', password: '', confirm: '',
  });

  // ───────────────── LOGIN LOGIC ─────────────────
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
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0],
          phone: data.user.user_metadata?.phone || '',
          role,
          roles: [role],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.email}`,
        })
      );

      onLoginSuccess?.(role);
      
      const routes = { agent: '/agent', business: '/business', admin: '/admin' };
      navigate(routes[role] || '/unauthorized');
      
    } catch (err) {
      console.error(err);
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ───────────────── SIGNUP LOGIC ─────────────────
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
            phone: signupForm.phone,
            role: 'agent',
          },
        },
      });

      if (error) {
        setSignupError(error.message);
        return;
      }

      setTab('success');
    } catch (err) {
      console.error(err);
      setSignupError('Signup failed. Please try again.');
    } finally {
      setSignupLoading(false);
    }
  };

  const handleResetSuccess = () => {
    setTab('login');
    setSignupForm({ full_name: '', email: '', phone: '', password: '', confirm: '' });
  };

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] bg-[#0D0D12] text-[#F4F5F7] overflow-hidden">
      
      {/* Premium Ambient Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6020FF]/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      {/* Back Button */}
      <div className="absolute top-14 left-8 z-50">
        <Link to="/" className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          Back
        </Link>
      </div>

      {/* Main Content Container */}
      <main className="w-full max-w-[400px] mx-auto px-6 flex flex-col items-center justify-center z-10">
        
        {/* Forms aligned directly to the center */}
        {tab === 'login' && (
          <AppLoginForm 
            onSubmit={handleLogin}
            error={loginError}
            loading={loginLoading}
            isLight={false} 
            setTab={setTab}
          />
        )}

        {tab === 'signup' && (
          <AppSignupForm 
            onSubmit={handleSignup}
            error={signupError}
            loading={signupLoading}
            form={signupForm}
            setForm={setSignupForm}
            isLight={false}
            setTab={setTab}
          />
        )}

        {tab === 'success' && (
          <AppSuccessView 
            onReset={handleResetSuccess}
            isLight={false}
          />
        )}

        {/* Terms & Conditions Checkbox (Hidden on Success Screen) */}
        {tab !== 'success' && (
          <div className="mt-5 pt-4 border-t border-white/[0.05] flex items-center justify-center gap-2 w-full">
            <input 
              type="checkbox" 
              id="terms" 
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-white bg-transparent border-white/20 rounded"
            />
            <label htmlFor="terms" className="text-xs text-white/60 cursor-pointer select-none">
              I agree to the <a href="https://radixnetworks.in/terms" target="_blank" rel="noopener noreferrer" className="text-white hover:underline font-medium">Terms & Conditions</a>
            </label>
          </div>
        )}
      </main>
    </div>
  );
};

export default AuthGatewayApp;