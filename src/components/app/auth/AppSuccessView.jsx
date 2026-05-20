import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, LogIn } from 'lucide-react';

const AppSuccessView = ({ onReset, isLight, formVariants }) => {
  return (
    <motion.div key="success" variants={formVariants} initial="hidden" animate="visible" exit="exit" className="w-full py-6 shrink-0">
      <div className="text-center w-full flex flex-col items-center">
        <div className="w-20 h-20 rounded-[1.25rem] flex items-center justify-center mx-auto mb-6 bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20 shadow-xl">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        
        <h3 className={`text-2xl font-extrabold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
          Ready to Go!
        </h3>
        
        <p className={`text-sm font-medium leading-relaxed mb-10 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
          Your partner account has been created successfully. Log in to start earning.
        </p>

        <button
          onClick={onReset}
          className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085] shadow-lg shadow-[#81B398]/20"
        >
          Proceed to Login <LogIn size={18} />
        </button>
      </div>
    </motion.div>
  );
};

export default AppSuccessView;