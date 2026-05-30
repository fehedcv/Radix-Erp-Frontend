import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext'; 

// Modules
import AuthLogo from '../../components/app/auth/AuthLogo';
import AppLoginForm from '../../components/app/auth/AppLoginForm';
import AppSignupForm from '../../components/app/auth/AppSignupForm';
import AppSuccessView from '../../components/app/auth/AppSuccessView';

const AuthGatewayApp = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  
  const [tab, setTab] = useState('login');

  // Login state
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup state
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
    <div className={`relative min-h-[100dvh] w-full flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] overflow-y-auto overflow-x-hidden ${
      isLight ? 'bg-[#FFFFFF] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      {/* --- SLEEK FLOATING BACK BUTTON --- */}
      <div className="absolute top-10 left-6 z-50">
        <Link 
          to="/"
          className={`w-10 h-10 rounded-full flex items-center justify-center active:scale-90 ${
            isLight ? ' text-[#1A202C] hover:bg-[#E2E8F0]' : ' text-[#F4F5F7] hover:bg-white/10'
          }`}
        >
          <span className='text-emerald-500 font-semibold'>Back</span>
        </Link>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="w-full max-w-sm mx-auto px-6 py-10 flex flex-col items-center justify-center min-h-[100dvh]">
        
        <AuthLogo />

        {tab === 'login' && (
          <AppLoginForm 
            onSubmit={handleLogin}
            error={loginError}
            loading={loginLoading}
            isLight={isLight}
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
            isLight={isLight}
            setTab={setTab}
          />
        )}

        {tab === 'success' && (
          <AppSuccessView 
            onReset={handleResetSuccess}
            isLight={isLight}
          />
        )}
      </main>
    </div>
  );
};

export default AuthGatewayApp; 