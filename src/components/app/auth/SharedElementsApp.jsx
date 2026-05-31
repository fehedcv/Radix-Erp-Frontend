import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

// 1. INPUTS AS SURFACES
// Now using a glassy backdrop-blur look with refined focus states
export const AuthInput = ({ className = "", ...props }) => (
  <div className="relative group">
    <input
      {...props}
      className={`w-full bg-[#18181B]/50 border border-white/5 px-5 py-4 text-white text-[0.95rem] rounded-[1.25rem] 
      focus:outline-none focus:bg-[#18181B] focus:border-[#A475FF]/50 focus:ring-4 focus:ring-[#A475FF]/10 
      transition-all duration-300 placeholder:text-gray-600 ${className}`}
    />
    {/* Subtle inner shadow effect */}
    <div className="absolute inset-0 rounded-[1.25rem] pointer-events-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"></div>
  </div>
);

// 2. ERROR AS A SUBTLE BANNER
// Uses a refined color palette that fits the dark mode aesthetic without being harsh
export const ErrorMsg = ({ msg }) => (
  <div className="flex items-center gap-3 bg-[#F0524F]/10 border border-[#F0524F]/20 px-4 py-3 rounded-[1rem]">
    <AlertCircle size={16} className="text-[#F0524F] shrink-0" strokeWidth={2.5} />
    <span className="text-[0.8rem] font-medium text-[#F0524F]">{msg}</span>
  </div>
);

// 3. CTA BUTTON AS A "BLOCK"
// Increased padding and height to make it feel like a primary command block
export const SubmitBtn = ({ loading, label, icon, className = "" }) => (
  <button
    type="submit"
    disabled={loading}
    className={`w-full py-5 rounded-[1.25rem] font-bold text-[0.95rem] flex items-center justify-center gap-3 
    bg-gradient-to-tr from-[#6020FF] to-[#A475FF] text-white 
    hover:brightness-110 active:scale-[0.98] transition-all duration-300 
    shadow-[0_10px_30px_-5px_rgba(96,32,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {loading ? (
      <>
        <Loader2 size={20} className="animate-spin" /> 
        <span className="opacity-90 tracking-wide">Processing...</span>
      </>
    ) : (
      <>
        {icon} 
        <span className="tracking-wide">{label}</span>
      </>
    )}
  </button>
);