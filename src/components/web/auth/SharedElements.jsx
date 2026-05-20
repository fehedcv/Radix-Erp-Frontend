import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';

export const AuthInput = ({ ...props }) => (
  <input
    {...props}
    className="w-full text-sm text-white font-light outline-none transition-all placeholder:text-white/20 lg:placeholder:text-white/30
      bg-black/20 backdrop-blur-md border border-white/[0.08] px-5 py-3.5 rounded-2xl focus:border-[#B282FE]/50 focus:bg-white/[0.02] focus:ring-4 focus:ring-[#B282FE]/10
      lg:bg-[#111] lg:backdrop-blur-none lg:border-[#333] lg:rounded-xl lg:px-4 lg:py-3 lg:focus:border-white lg:focus:bg-[#151515] lg:focus:ring-0
    "
  />
);

export const ErrorMsg = ({ msg }) => (
  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 text-red-400 text-xs bg-red-500/10 lg:bg-[#111] border border-red-500/20 lg:border-red-500/40 px-4 py-3 lg:py-2.5 rounded-xl lg:rounded-lg font-medium">
    <AlertCircle size={16} className="shrink-0" /> {msg}
  </motion.div>
);

export const SubmitBtn = ({ loading, label, icon }) => (
  <button
    type="submit"
    disabled={loading}
    className="group relative w-full overflow-hidden flex justify-center items-center gap-2 font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100
      bg-white text-black py-3.5 rounded-2xl shadow-[0_10px_30px_rgba(178,130,254,0.2)] lg:shadow-none
      lg:bg-transparent lg:text-white lg:py-3.5 lg:rounded-full lg:border lg:border-white
    "
  >
    <span className="absolute inset-0 bg-gradient-to-r from-[#B282FE] to-[#7038FF] opacity-0 group-active:opacity-100 transition-opacity duration-300 lg:hidden"></span>
    <span className="hidden lg:block absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
    <span className="relative z-10 flex items-center gap-2 group-active:text-white lg:group-hover:text-black transition-colors duration-300">
      {loading ? <><Loader2 size={16} className="animate-spin"/> Processing</> : <>{icon} {label}</>}
    </span>
  </button>
);