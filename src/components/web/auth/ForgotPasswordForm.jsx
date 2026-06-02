import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../../../supabase/supabaseClient';
import { AuthInput, ErrorMsg, SubmitBtn } from './SharedElements';

const ForgotPasswordForm = ({ formVariants, onBack }) => {
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
      const redirectTo = Capacitor.isNativePlatform()
        ? 'com.radix.app://reset-password'
        : `${window.location.origin}/reset-password`;

      const { error: supaErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (supaErr) { setError(supaErr.message); return; }
      setSent(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div key="forgot" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
      <header className="hidden lg:block mb-4 text-center">
        <h2 className="text-2xl font-medium text-white">Reset Password</h2>
      </header>

      {sent ? (
        <div className="text-center py-8 space-y-5">
          <div className="flex justify-center">
            <CheckCircle2 size={40} className="text-green-400" />
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Password reset link has been sent to your email.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 mx-auto text-white/40 hover:text-white text-[10px] uppercase tracking-widest transition-colors"
          >
            <ArrowLeft size={12} /> Back to Login
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-white/40 text-xs leading-relaxed">
            Enter your email and we'll send you a reset link.
          </p>
          <div className="space-y-1">
            <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">
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

          <div className="pt-1">
            {error && <ErrorMsg msg={error} />}
          </div>

          <div className="pt-2">
            <SubmitBtn loading={loading} label="Send Reset Link" icon={<Mail size={16} />} />
          </div>

          <button
            type="button"
            onClick={onBack}
            className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white text-[10px] uppercase tracking-widest transition-colors pt-1"
          >
            <ArrowLeft size={12} /> Back to Login
          </button>
        </form>
      )}
    </motion.div>
  );
};

export default ForgotPasswordForm;
