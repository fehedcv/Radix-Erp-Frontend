import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Wallet, CheckCircle2 } from 'lucide-react';
import { AuthInput, ErrorMsg, SubmitBtn } from '../../web/auth/SharedElements';

const SignupForm = ({ onSubmit, error, loading, success, form, setForm, setTab, setSuccess, formVariants }) => {
  const [showPass, setShowPass] = useState(false);

  const setField = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));

  return (
    <motion.div key="signup" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
      {success ? (
        <div className="flex flex-col items-center text-center gap-3 py-4">
          <div className="w-16 h-16 bg-emerald-500/10 lg:bg-[#111] border border-emerald-500/20 lg:border-emerald-500/50 rounded-full flex items-center justify-center shadow-[inset_0_0_20px_rgba(16,185,129,0.2)] lg:shadow-none">
            <CheckCircle2 size={32} className="text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-light lg:font-medium text-white tracking-tight">Welcome To Radix</h3>
            <p className="text-xs text-white/50 mt-1 font-light leading-relaxed">
              Your account is verified and ready.
            </p>
          </div>
          <button
            onClick={() => { setTab('login'); setSuccess(false); setForm({ full_name:'', email:'', phone:'', password:'', confirm:'' }); }}
            className="w-full mt-2 bg-white/10 lg:bg-white lg:text-black hover:bg-white/20 border border-white/10 lg:border-transparent text-white py-3.5 rounded-full font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Please Login
          </button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <header className="hidden lg:block mb-4 text-center">
            <h2 className="text-2xl font-medium text-white">Create Account</h2>
          </header>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Full Name</label>
              <AuthInput value={form.full_name} onChange={setField('full_name')} placeholder="Enter your name" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Email</label>
              <AuthInput type="email" value={form.email} onChange={setField('email')} placeholder="Enter your email" required />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Phone Number</label>
            <AuthInput type="tel" value={form.phone} onChange={setField('phone')} placeholder="98765 43210" required />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Password</label>
              <div className="relative">
                <AuthInput type={showPass ? 'text' : 'password'} value={form.password} onChange={setField('password')} placeholder="Min 8 chars" required />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#B282FE] lg:hover:text-white transition-colors">
                  {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Confirm Password</label>
              <AuthInput type="password" value={form.confirm} onChange={setField('confirm')} placeholder="Re-enter" required />
            </div>
          </div>

          <div className="pt-1">
            {error && <ErrorMsg msg={error} />}
          </div>

          <div className="pt-2">
            <SubmitBtn loading={loading} label="Create Account" icon={<Wallet size={16}/>} />
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default SignupForm;