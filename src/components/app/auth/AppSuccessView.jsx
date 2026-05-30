import React from 'react';
import { CheckCircle2, LogIn } from 'lucide-react';

const AppSuccessView = ({ onReset, isLight }) => {
  return (
    <div className="w-full py-6 shrink-0">
      <div className="text-center w-full flex flex-col items-center">
        {/* Success Icon Container */}
        <div className="w-20 h-20 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        
        {/* Text Content */}
        <h3 className={`text-2xl font-extrabold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
          Ready to Go!
        </h3>
        
        <p className={`text-sm font-medium leading-relaxed mb-10 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
          Your partner account has been created successfully. Log in to start earning.
        </p>

        {/* Action Button */}
        <button
          onClick={onReset}
          className="w-full py-4 rounded-[1rem] font-bold text-sm flex items-center justify-center gap-2 bg-[#81B398] text-white hover:bg-[#6FA085]"
        >
          Proceed to Login <LogIn size={18} />
        </button>
      </div>
    </div>
  );
};

export default AppSuccessView;