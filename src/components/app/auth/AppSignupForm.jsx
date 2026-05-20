import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { AuthInput, ErrorMsg, SubmitBtn } from './SharedElementsApp';

const AppSignupForm = ({ onSubmit, error, loading, form, setForm, isLight, setTab, formVariants }) => {
  const [showPass, setShowPass] = useState(false);

  const setField = (k) => (e) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
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

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Full Name
          </label>
          <AuthInput isLight={isLight} value={form.full_name} onChange={setField('full_name')} placeholder="John Doe" required />
        </div>

        <div>
          <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Email Address
          </label>
          <AuthInput isLight={isLight} type="email" value={form.email} onChange={setField('email')} placeholder="john@email.com" required />
        </div>

        <div>
          <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Phone Number
          </label>
          <AuthInput isLight={isLight} type="tel" value={form.phone} onChange={setField('phone')} placeholder="+91 98765 43210" required />
        </div>

        <div>
          <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Password
          </label>
          <div className="relative">
            <AuthInput isLight={isLight} type={showPass ? 'text' : 'password'} value={form.password} onChange={setField('password')} placeholder="Min 8 characters" required />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-[#718096] hover:text-[#1A202C]' : 'text-[#9CA3AF] hover:text-[#F4F5F7]'}`}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className={`text-[11px] font-bold uppercase tracking-wider mb-1.5 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Confirm Password
          </label>
          <AuthInput isLight={isLight} type="password" value={form.confirm} onChange={setField('confirm')} placeholder="Re-enter password" required />
        </div>

        {error && <div className="pt-1"><ErrorMsg isLight={isLight} msg={error} /></div>}

        <div className="pt-4">
          <SubmitBtn loading={loading} label="Create Account" icon={<UserPlus size={18} strokeWidth={2.5} />} />
        </div>
      </form>

      {/* attractive Toggle to Login */}
      <div className={`mt-8 pt-6 border-t flex flex-col items-center ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
        <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
          Already have an account?
        </p>
        <button 
          onClick={() => setTab('login')}
          className="w-full py-3.5 rounded-[1rem] font-bold text-sm transition-all duration-200 active:scale-95 bg-[#81B398]/10 text-[#81B398] hover:bg-[#81B398]/20 border border-[#81B398]/20"
        >
          Log In Here
        </button>
      </div>
    </motion.div>
  );
};

export default AppSignupForm;