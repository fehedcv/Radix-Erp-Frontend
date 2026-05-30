import React from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

export const AuthInput = ({ isLight, ...props }) => (
  <input
    {...props}
    className={`w-full bg-transparent px-1 py-2.5 text-base border-0 border-b-2 rounded-none transition-colors duration-200 focus:outline-none focus:ring-0 focus:border-b-[#81B398] placeholder:opacity-40 ${
      isLight 
        ? 'border-b-[#E2E8F0] text-[#1A202C]' 
        : 'border-b-white/20 text-[#F4F5F7]'
    }`}
  />
);

export const ErrorMsg = ({ msg }) => (
  <div className="flex items-center gap-2 text-[#F0524F] px-1 py-2 rounded-none">
    <AlertCircle size={16} className="shrink-0" strokeWidth={2.5} />
    <span className="text-xs font-bold">{msg}</span>
  </div>
);

export const SubmitBtn = ({ loading, label, icon }) => (
  <button
    type="submit"
    disabled={loading}
    className="w-full py-4 rounded-none font-bold text-sm flex items-center justify-center gap-2 bg-[#81B398] text-white hover:bg-[#6FA085] disabled:opacity-50 transition-colors"
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