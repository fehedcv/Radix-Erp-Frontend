import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { AuthInput, ErrorMsg, SubmitBtn } from './SharedElementsApp';

const AppSignupForm = ({ onSubmit, error, loading, form, setForm, setTab }) => {
  const [showPass, setShowPass] = useState(false);

  const setField = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div className="w-full max-w-[320px] mx-auto py-8 animate-[fadeIn_0.4s_ease-in-out]">
      
      {/* Header */}
      <div className="mb-10 text-center mt-24">
        <h2 className="text-[2rem] font-bold text-white leading-tight mb-2">
          Create Account
        </h2>
        <p className="text-[#9CA3AF] text-[0.9rem]">
          Join the partner network
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {[
          { label: 'Full Name', name: 'full_name', type: 'text', placeholder: 'John Doe' },
          { label: 'Email Address', name: 'email', type: 'email', placeholder: 'name@company.com' },
          { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
        ].map((field) => (
          <div key={field.name}>
            <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
              {field.label}
            </label>
            <AuthInput 
              type={field.type} 
              value={form[field.name]} 
              onChange={setField(field.name)} 
              placeholder={field.placeholder} 
              required 
            />
          </div>
        ))}

        {/* Password Fields */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
            Password
          </label>
          <div className="relative">
            <AuthInput 
              type={showPass ? 'text' : 'password'} 
              value={form.password} 
              onChange={setField('password')} 
              placeholder="Min 8 characters" 
              required 
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-2 block pl-1">
            Confirm Password
          </label>
          <AuthInput 
            type="password" 
            value={form.confirm} 
            onChange={setField('confirm')} 
            placeholder="Re-enter password" 
            required 
          />
        </div>

        {error && <div className="pt-1"><ErrorMsg msg={error} /></div>}

        <div className="pt-2">
          <SubmitBtn 
            loading={loading} 
            label="Create Account" 
            icon={<UserPlus size={18} strokeWidth={2.5} />} 
          />
        </div>
      </form>

      {/* Footer Toggle */}
      <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#6B7280] mb-4">
          Already have an account?
        </p>
        <button 
          onClick={() => setTab('login')}
          className="w-full py-3.5 rounded-[1rem] font-bold text-sm text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-200 active:scale-95"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default AppSignupForm;