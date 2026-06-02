import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import { AuthInput, ErrorMsg, SubmitBtn } from '../../components/web/auth/SharedElements';
import BackgroundDecorations from '../../components/web/auth/BackgroundDecorations';
import { useNotification } from '../../context/NotificationContext';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  // Supabase fires PASSWORD_RECOVERY which sets the session — verify it on mount
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setValidSession(true);
        setChecking(false);
      }
    });

    // Also check if session is already active (user landed directly on the page)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { setValidSession(true); }
      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const { error: supaErr } = await supabase.auth.updateUser({ password });
      if (supaErr) { setError(supaErr.message); return; }

      showToast({ title: 'Password updated', body: 'Your password has been changed successfully.' });
      await supabase.auth.signOut();
      navigate('/login', { replace: true });
    } catch {
      setError('Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  };

  return (
    <div className="h-[100dvh] w-full bg-[#05050A] flex items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden relative">
      <BackgroundDecorations infoSideRef={{ current: null }} />

      <div className="w-full max-w-[400px] px-4 relative z-10">
        <div className="bg-white/[0.03] backdrop-blur-[60px] border border-white/[0.08] rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

          {checking ? (
            <div className="py-12 text-center text-white/40 text-sm">Verifying session…</div>
          ) : !validSession ? (
            <div className="py-12 text-center space-y-4">
              <p className="text-white/60 text-sm">This link is invalid or has expired.</p>
              <Link to="/login" className="text-[#B282FE] text-xs uppercase tracking-widest hover:text-white transition-colors">
                Back to Login
              </Link>
            </div>
          ) : (
            <motion.div variants={formVariants} initial="hidden" animate="visible" className="space-y-4">
              <header className="mb-5 text-center">
                <h2 className="text-2xl font-medium text-white">Set New Password</h2>
                <p className="text-white/40 text-xs mt-2">Choose a strong password of at least 8 characters.</p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <AuthInput
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPass(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#B282FE] transition-colors"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <AuthInput
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#B282FE] transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  {error && <ErrorMsg msg={error} />}
                </div>

                <div className="pt-2">
                  <SubmitBtn loading={loading} label="Update Password" icon={<KeyRound size={16} />} />
                </div>
              </form>
            </motion.div>
          )}
        </div>

        <p className="text-center text-[10px] text-white/20 uppercase tracking-widest mt-6 font-medium">
          Secured Authentication
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
