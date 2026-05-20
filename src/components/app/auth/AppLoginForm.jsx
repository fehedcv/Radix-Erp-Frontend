import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { AuthInput, ErrorMsg, SubmitBtn } from './SharedElementsApp';

const AppLoginForm = ({ onSubmit, error, loading, isLight, setTab, formVariants }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full shrink-0">
      {/* Welcome Text */}
      <div className="mb-8 text-center">
        <h2 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
          Welcome Back!
        </h2>
        <p className={`text-sm font-medium mt-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
          Log in to your partner account
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Email Address
          </label>
          <AuthInput isLight={isLight} name="email" type="email" placeholder="name@company.com" required />
        </div>

        <div>
          <div className="flex justify-between items-end mb-2 pl-1 pr-1">
            <label className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              Password
            </label>
          </div>
          <div className="relative">
            <AuthInput isLight={isLight} name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" required />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-[#718096] hover:text-[#1A202C]' : 'text-[#9CA3AF] hover:text-[#F4F5F7]'}`}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && <div className="pt-1"><ErrorMsg isLight={isLight} msg={error} /></div>}

        <div className="pt-4">
          <SubmitBtn loading={loading} label="Sign In" icon={<LogIn size={18} strokeWidth={2.5} />} />
        </div>
      </form>

      {/* attractive Toggle to Signup */}
      <div className={`mt-8 pt-6 border-t flex flex-col items-center ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
        <p className={`text-[11px] font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
          Don't have an account?
        </p>
        <button 
          onClick={() => setTab('signup')}
          className="w-full py-3.5 rounded-[1rem] font-bold text-sm transition-all duration-200 active:scale-95 bg-[#81B398]/10 text-[#81B398] hover:bg-[#81B398]/20 border border-[#81B398]/20"
        >
          Join Now Free
        </button>
      </div>
    </motion.div>
  );
};

export default AppLoginForm;