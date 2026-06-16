import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import { AuthInput, ErrorMsg, SubmitBtn } from '../../components/app/auth/SharedElementsApp';
import { useNotification } from '../../context/NotificationContext';

const ResetPasswordApp = () => {
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setValidSession(true);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
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

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center font-['Plus_Jakarta_Sans',sans-serif] bg-[#0D0D12] text-[#F4F5F7] overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6020FF]/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <main className="w-full max-w-[400px] mx-auto px-6 flex flex-col items-center justify-center z-10">

        {checking ? (
          <p className="text-[#9CA3AF] text-sm">Verifying session…</p>
        ) : !validSession ? (
          <div className="text-center space-y-4">
            <p className="text-[#9CA3AF] text-sm">This link is invalid or has expired.</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="text-[#A475FF] text-xs uppercase tracking-widest hover:text-white transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <div className="w-full max-w-[320px] mx-auto animate-[fadeIn_0.4s_ease-in-out]">
            <div className="mb-10 text-center">
              <h2 className="text-[2rem] font-bold text-white leading-tight mb-2">New Password</h2>
              <p className="text-[#9CA3AF] text-[0.9rem]">Choose a strong password to secure your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
                  New Password
                </label>
                <div className="relative">
                  <AuthInput
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPass(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <AuthInput
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <ErrorMsg msg={error} />}

              <div className="pt-2">
                <SubmitBtn
                  loading={loading}
                  label="Update Password"
                  icon={<KeyRound size={18} strokeWidth={2.5} />}
                />
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default ResetPasswordApp;
