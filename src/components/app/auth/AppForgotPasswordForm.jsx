import React, { useState } from 'react';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../../supabase/supabaseClient';
import { AuthInput, ErrorMsg, SubmitBtn } from './SharedElementsApp';

const AppForgotPasswordForm = ({ setTab }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setError('');
    try {
      // Native apps receive the reset link via the com.radix.app:// deep link scheme
      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'com.radix.app://reset-password',
      });
      if (supaErr) { setError(supaErr.message); return; }
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[320px] mx-auto animate-[fadeIn_0.4s_ease-in-out]">

      {/* Header */}
      <div className="mb-10 text-center">
        <h2 className="text-[2rem] font-bold text-white leading-tight mb-2">
          Reset Password
        </h2>
        <p className="text-[#9CA3AF] text-[0.9rem]">
          We'll send a reset link to your email
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-6 py-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-green-400" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-white font-semibold">Check your inbox</p>
            <p className="text-[#9CA3AF] text-sm leading-relaxed">
              Password reset link has been sent to your email.
            </p>
          </div>
          <button
            onClick={() => setTab('login')}
            className="w-full py-3.5 rounded-[1rem] font-bold text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200 active:scale-95"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
              Email Address
            </label>
            <AuthInput
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          {error && <ErrorMsg msg={error} />}

          <div className="pt-2">
            <SubmitBtn
              loading={loading}
              label="Send Reset Link"
              icon={<Mail size={18} strokeWidth={2.5} />}
            />
          </div>
        </form>
      )}

      {/* Back to login */}
      {!sent && (
        <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center">
          <button
            onClick={() => setTab('login')}
            className="flex items-center gap-2 text-[#6B7280] hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default AppForgotPasswordForm;
