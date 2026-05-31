import React, { useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { AuthInput, ErrorMsg, SubmitBtn } from './SharedElementsApp';

const AppLoginForm = ({ onSubmit, error, loading, setTab }) => {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="w-full max-w-[320px] mx-auto animate-[fadeIn_0.4s_ease-in-out]">
      
      {/* Welcome Header */}
      <div className="mb-10 text-center">
        <h2 className="text-[2rem] font-bold text-white leading-tight mb-2">
          Welcome Back
        </h2>
        <p className="text-[#9CA3AF] text-[0.9rem]">
          Log in to your partner workspace
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Email Input */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
            Email Address
          </label>
          <AuthInput 
            name="email" 
            type="email" 
            placeholder="name@company.com" 
            required 
            className="bg-[#18181B] border-white/10 focus:border-[#A475FF] transition-colors"
          />
        </div>

        {/* Password Input */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
            Password
          </label>
          <div className="relative">
            <AuthInput 
              name="password" 
              type={showPass ? 'text' : 'password'} 
              placeholder="••••••••" 
              required 
              className="bg-[#18181B] border-white/10 focus:border-[#A475FF] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && <div className="pt-0"><ErrorMsg msg={error} /></div>}

        {/* Submit Button (Gradient Style) */}
        <div className="pt-2">
          <SubmitBtn 
            loading={loading} 
            label="Sign In" 
            icon={<LogIn size={18} strokeWidth={2.5} />} 
            className="bg-gradient-to-br from-[#A475FF] to-[#6020FF] hover:opacity-90 active:scale-[0.98] transition-all rounded-[1rem] shadow-[0_8px_20px_rgba(96,32,255,0.3)]"
          />
        </div>
      </form>

      {/* Toggle to Signup */}
      <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-4">
          Don't have an account?
        </p>
        <button 
          onClick={() => setTab('signup')}
          className="w-full py-3.5 rounded-[1rem] font-bold text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200 active:scale-95"
        >
          Create Account
        </button>
      </div>
    </div>
  );
};

export default AppLoginForm;