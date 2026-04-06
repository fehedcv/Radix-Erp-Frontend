import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Wallet, Lock, TrendingUp, LogIn, MessageCircle
} from 'lucide-react';

const AppHomePage = ({ onEnterPortal }) => {
  // Fluid animation variants for the glass elements
  const containerVars = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVars = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 20 }
    }
  };

  // Background Orb Animation (Slow, fluid movement behind the curved header)
  const orbVars = {
    animate: {
      x: [0, 40, -30, 0],
      y: [0, -50, 30, 0],
      transition: {
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="relative h-[100dvh] w-full bg-[#05050A] text-white font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden selection:bg-[#B282FE]/30 flex flex-col">
      
      {/* --- AMBIENT BACKGROUND ORBS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          variants={orbVars} animate="animate"
          className="absolute -top-[10%] -left-[10%] w-[80vw] h-[80vw] rounded-full bg-[#7038FF] mix-blend-screen filter blur-[100px] opacity-40"
        />
        <motion.div 
          variants={orbVars} animate="animate" style={{ animationDelay: '-5s' }}
          className="absolute top-[30%] -right-[20%] w-[90vw] h-[90vw] rounded-full bg-[#9D4EDD] mix-blend-screen filter blur-[120px] opacity-30"
        />
      </div>

      {/* --- ANDROID-STYLE SWEEPING CURVED HEADER --- */}
      {/* Height kept to perfectly wrap the text and elements */}
      <div className="absolute top-0 left-0 w-full h-[62%] bg-[#12121C] rounded-b-[4rem] shadow-2xl z-0 overflow-hidden border-b border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-to-br from-[#12121C] via-[#1A1A2A] to-[#2A0A4A] opacity-80"></div>
          {/* Inner highlight for depth */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-white/[0.02] rounded-full blur-2xl"></div>
          
          {/* --- ADDED GLOW EFFECT BEHIND GLASS CARD --- */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-[#B282FE] rounded-full blur-[60px] opacity-25 z-0"></div>
      </div>

      {/* --- HEADER CONTROLS --- */}
      <header className="relative z-40 px-6 pt-12 pb-4 flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-[14px] bg-[#B282FE]/20 backdrop-blur-xl border border-[#B282FE]/30 shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)] flex items-center justify-center">
            <TrendingUp size={20} strokeWidth={2.5} className="text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white/90">
            Radix
          </span>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
          onClick={onEnterPortal}
          className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white bg-white/[0.1] backdrop-blur-xl px-5 py-2.5 rounded-full border border-white/[0.15] shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:bg-white/[0.15] transition-colors"
        >
          <LogIn size={14} className="text-white"/> Login
        </motion.button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col justify-center px-6 relative z-10 w-full max-w-md mx-auto mt-[-2vh]">
        <motion.div 
          variants={containerVars}
          initial="hidden"
          animate="visible"
          className="flex flex-col w-full"
        >
          
          {/* Hero Typography (Inside the curve) */}
          <motion.div variants={itemVars} className="text-left mb-10">
            <h1 className="text-5xl sm:text-6xl font-light tracking-tighter leading-[1.1] mb-3 text-white drop-shadow-lg">
              Refer Business.<br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#D4B3FF] to-[#B282FE]">
                Earn Cash.
              </span>
            </h1>
            <p className="text-white/60 text-sm leading-relaxed font-light pr-8 mb-6">
              Submit high-quality leads, track them seamlessly, and get paid instantly when deals close.
            </p>
          </motion.div>

          {/* SINGLE COMBINED LIQUID GLASS CARD (Overlapping the curved background edge) */}
          <motion.div variants={itemVars} className="w-full relative mt-8">
              {/* Glass Card */}
              <div className="relative w-full overflow-hidden bg-white/[0.03] backdrop-blur-[60px] border border-white/[0.08] rounded-[2rem] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_0_20px_rgba(255,255,255,0.02)] flex items-center justify-between z-10">
                
                {/* Glossy inner highlight */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none"></div>
                
                {/* Left Side: Rate */}
                <div className="flex flex-col items-start relative z-10 w-[45%]">
                  <div className="w-10 h-10 mb-3 rounded-[14px] bg-gradient-to-br from-[#B282FE]/30 to-[#7038FF]/10 flex items-center justify-center border border-[#B282FE]/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]">
                    <Wallet size={16} className="text-[#D4B3FF]" />
                  </div>
                  <p className="text-2xl font-light text-white mb-0.5 tracking-tight">₹1.00</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold">Per Credit</p>
                </div>

                {/* Subtle Center Divider */}
                <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/[0.15] to-transparent relative z-10"></div>

                {/* Right Side: Access */}
                <div className="flex flex-col items-end relative z-10 w-[45%]">
                  <div className="w-10 h-10 mb-3 rounded-[14px] bg-white/[0.05] flex items-center justify-center border border-white/[0.05] shadow-[inset_0_2px_4px_rgba(255,255,255,0.05)]">
                    <Lock size={16} className="text-white/70" />
                  </div>
                  <p className="text-2xl font-light text-white mb-0.5 tracking-tight">Free</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest font-semibold text-right">Platform Setup</p>
                </div>
              </div>
          </motion.div>

        </motion.div>
      </main>

      {/* --- SMALL, CENTERED WHATSAPP CONTACT PILL --- */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.8, type: "spring" }}
        className="absolute bottom-6 w-full flex justify-center z-50 pointer-events-none"
      >
        <a 
          href="https://wa.me/yournumber" 
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-emerald-500/[0.15] backdrop-blur-xl border border-emerald-500/30 shadow-[0_4px_15px_rgba(16,185,129,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)] active:scale-95 transition-transform"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_8px_rgba(16,185,129,0.5)]">
            <MessageCircle size={12} />
          </div>
          <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest leading-none">
            WhatsApp Support
          </span>
        </a>
      </motion.div>

    </div>
  );
};

export default AppHomePage;