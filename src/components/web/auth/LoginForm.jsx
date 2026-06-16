import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { AuthInput, ErrorMsg, SubmitBtn } from '../../web/auth/SharedElements';

const LoginForm = ({ onSubmit, error, loading, formVariants, onForgotPassword }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <motion.div key="login" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="space-y-4">
      <header className="hidden lg:block mb-4 text-center">
        <h2 className="text-2xl font-medium text-white">keep it as Welcome Back, Partner.</h2>
      </header>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Email Address</label>
          <AuthInput name="email" type="text" placeholder="name@company.com" required />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-white/40 uppercase tracking-widest ml-2 lg:ml-1">Password</label>
          <div className="relative">
            <AuthInput name="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" required />
            <button type="button" onClick={() => setShowPass(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-[#B282FE] lg:hover:text-white transition-colors"
            >
              {showPass ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[10px] text-white/30 hover:text-[#B282FE] uppercase tracking-widest transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <div className="pt-1">
          {error && <ErrorMsg msg={error} />}
        </div>

        <div className="pt-2">
          <SubmitBtn loading={loading} label="Login" icon={<Lock size={16}/>} />
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;