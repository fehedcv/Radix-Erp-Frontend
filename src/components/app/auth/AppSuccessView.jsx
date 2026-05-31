import React from 'react';
import { CheckCircle2, LogIn } from 'lucide-react';

const AppSuccessView = ({ onReset }) => {
  return (
    <div className="w-full max-w-[320px] mx-auto animate-[fadeIn_0.4s_ease-in-out]">
      <div className="text-center w-full flex flex-col items-center">
        
        {/* Success Icon with Brand Gradient Accent */}
        <div className="w-20 h-20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 bg-[#A475FF]/10 text-[#A475FF] border border-[#A475FF]/20 shadow-[0_0_20px_rgba(164,117,255,0.1)]">
          <CheckCircle2 size={40} strokeWidth={2} />
        </div>
        
        {/* Text Content */}
        <h3 className="text-[2rem] font-bold text-white leading-tight mb-3">
          Ready to Go!
        </h3>
        
        <p className="text-[0.9rem] text-[#9CA3AF] leading-relaxed mb-10 px-2">
          Your partner account has been created successfully. Log in to start earning.
        </p>

        {/* Action Button - Consistent Gradient Style */}
        <button
          onClick={onReset}
          className="w-full py-5 rounded-[1.25rem] font-bold text-[0.95rem] flex items-center justify-center gap-3 bg-gradient-to-tr from-[#6020FF] to-[#A475FF] text-white hover:brightness-110 active:scale-[0.98] transition-all duration-300 shadow-[0_10px_30px_-5px_rgba(96,32,255,0.4)]"
        >
          Proceed to Login <LogIn size={18} />
        </button>
      </div>
    </div>
  );
};

export default AppSuccessView;