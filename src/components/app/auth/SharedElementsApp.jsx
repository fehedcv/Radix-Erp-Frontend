import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

export const AuthInput = ({ isLight, ...props }) => (
  <input
    {...props}
    className={`w-full px-5 py-4 rounded-[1rem] text-sm font-bold outline-none border transition-all placeholder:font-medium ${
      isLight 
        ? 'bg-[#FFFFFF] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C] placeholder:text-[#A0AEC0]' 
        : 'bg-[#222938] border-white/10 focus:border-[#81B398] text-[#F4F5F7] placeholder:text-[#718096]'
    }`}
  />
);

export const ErrorMsg = ({ msg }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-2.5 bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20 px-4 py-3.5 rounded-[1rem]"
  >
    <AlertCircle size={16} className="shrink-0" strokeWidth={2.5} />
    <span className="text-xs font-bold">{msg}</span>
  </motion.div>
);

export const SubmitBtn = ({ loading, label, icon }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-4 rounded-[1rem] font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-[#81B398] text-white hover:bg-[#6FA085] shadow-lg shadow-[#81B398]/20"
  >
    {loading ? (
      <>
        <Loader2 size={18} className="animate-spin" /> Processing...
      </>
    ) : (
      <>
        {icon} {label}
      </>
    )}
  </button>
);