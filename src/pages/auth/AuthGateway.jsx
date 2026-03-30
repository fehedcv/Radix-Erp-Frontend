import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  Loader2, AlertCircle, Eye, EyeOff,
  ChevronLeft, ShieldCheck, Layers, Wallet, CheckCircle2
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

  // Floating GSAP animation
  useEffect(() => {
    if (infoSideRef.current) {
      gsap.to('.floating-node', {
        y: -15, duration: 2, repeat: -1, yoyo: true,
        ease: 'power1.inOut', stagger: 0.2,
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
    // 1. Get tokens via custom login endpoint
    const tokenRes = await frappeApi.post(
      '/method/business_chain.api.auth.mobile_login',
      {
        usr: formData.get('email'),
        pwd: formData.get('password'),
      }
    );
    const { api_key, api_secret } = tokenRes.data.message;

    // 2. Persist tokens
    localStorage.setItem('bc_api_key',    api_key);
    localStorage.setItem('bc_api_secret', api_secret);

    // 3. Now fetch role — interceptor will auto-attach the token
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

  return (
    <div className="min-h-svh bg-[#F8FAFC] flex font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden">

      {/* ── LEFT PANEL ── */}
      <div
        ref={infoSideRef}
        className="hidden lg:flex w-1/2 bg-[#0F172A] relative flex-col justify-center px-20 text-white overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Layers size={24} />
            </div>
            <span className="text-xl font-bold uppercase">
              Radix<span className="text-indigo-400">Chain</span>
            </span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            The Business Chain <br />
            <span className="text-indigo-400 italic">Infrastructure.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md mb-12">
            Authorized access to the unified ledger for agents, business units, and headquarters.
          </p>
          <div className="space-y-4">
            <div className="floating-node w-64 bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Standard Rate</p>
                <p className="text-sm font-bold">1.00 INR / Credit</p>
              </div>
            </div>
            <div className="floating-node w-72 bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 ml-12">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Security</p>
                <p className="text-sm font-bold">Frappe Session Auth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px] space-y-7">

          <Link to="/" className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-400">
            <ChevronLeft size={14} /> Back
          </Link>

          {/* Tab switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { setTab('login'); setLoginError(''); }}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              Login
            </button>
            <button
              onClick={() => { setTab('signup'); setSignupError(''); setSignupSuccess(false); }}
              className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
            >
              Sign Up
            </button>
          </div>

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-bold text-[#0F172A]">Partner Login</h2>
                <p className="text-slate-500 text-sm mt-1">Enter your credentials to access your dashboard.</p>
              </header>
              <form onSubmit={handleLogin} className="space-y-4">
                <AuthInput name="email" type="email" placeholder="name@company.com" required />
                <div className="relative">
                  <AuthInput name="password" type={showLoginPass ? 'text' : 'password'} placeholder="••••••••" required />
                  <button type="button" onClick={() => setShowLoginPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showLoginPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>
                {loginError && <ErrorMsg msg={loginError} />}
                <SubmitBtn loading={loginLoading} label="Login" />
              </form>
              <p className="text-center text-xs text-slate-400">
                Don't have an account?{' '}
                <button onClick={() => setTab('signup')} className="text-indigo-600 font-bold hover:underline">
                  Sign up as Agent
                </button>
              </p>
            </div>
          )}

          {/* ── SIGNUP FORM ── */}
          {tab === 'signup' && (
            <div className="space-y-6">
              <header>
                <h2 className="text-3xl font-bold text-[#0F172A]">Agent Sign Up</h2>
                <p className="text-slate-500 text-sm mt-1">Create your agent account to start submitting referrals.</p>
              </header>

              {signupSuccess ? (
                /* Success state */
                <div className="flex flex-col items-center text-center gap-4 py-8">
                  <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <CheckCircle2 size={36} className="text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Account Created!</h3>
                    <p className="text-sm text-slate-500 mt-1 max-w-xs">
                      Your agent account is ready. Log in to access your dashboard.
                    </p>
                  </div>
                  <button
                    onClick={() => { setTab('login'); setSignupSuccess(false); setSignupForm({ full_name:'', email:'', phone:'', password:'', confirm:'' }); }}
                    className="w-full bg-[#0F172A] text-white py-3.5 rounded-xl font-bold text-sm"
                  >
                    Go to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Full Name *</label>
                    <AuthInput
                      value={signupForm.full_name} onChange={setField('full_name')}
                      placeholder="e.g. Zaid Al-Farsi" required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email *</label>
                    <AuthInput
                      type="email" value={signupForm.email} onChange={setField('email')}
                      placeholder="name@company.com" required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone *</label>
                    <AuthInput
                      type="tel" value={signupForm.phone} onChange={setField('phone')}
                      placeholder="+91 98765 43210" required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Password *</label>
                    <div className="relative">
                      <AuthInput
                        type={showSignupPass ? 'text' : 'password'}
                        value={signupForm.password} onChange={setField('password')}
                        placeholder="Min. 8 characters" required
                      />
                      <button type="button" onClick={() => setShowSignupPass(p => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                      >
                        {showSignupPass ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confirm Password *</label>
                    <AuthInput
                      type="password" value={signupForm.confirm} onChange={setField('confirm')}
                      placeholder="Re-enter password" required
                    />
                  </div>

                  {signupError && <ErrorMsg msg={signupError} />}

                  <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-[9px] text-indigo-700 font-bold uppercase tracking-wide">
                      Your account will be created with the Agent role. Contact an admin if you need elevated access.
                    </p>
                  </div>

                  <SubmitBtn loading={signupLoading} label="Create Agent Account" />
                </form>
              )}

              {!signupSuccess && (
                <p className="text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <button onClick={() => setTab('login')} className="text-indigo-600 font-bold hover:underline">
                    Log in
                  </button>
                </p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────
const AuthInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full border border-slate-200 bg-white px-4 py-3 rounded-xl text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-slate-300"
  />
);

const ErrorMsg = ({ msg }) => (
  <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
    <AlertCircle size={14} className="shrink-0" /> {msg}
  </div>
);

const SubmitBtn = ({ loading, label }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-[#0F172A] hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-60"
  >
    {loading ? <><Loader2 size={18} className="animate-spin"/> Processing...</> : label}
  </button>
);

export default AuthGateway;