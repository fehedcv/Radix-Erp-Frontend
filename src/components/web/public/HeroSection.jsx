import React from 'react';
import { ArrowRight, Wallet, Lock, CheckCircle, Plus } from 'lucide-react';

const HeroSection = ({ onEnterPortal }) => {
  return (
    <section className="relative pt-8 md:pt-24 pb-20 md:pb-32 px-4 sm:px-6 max-w-[1200px] mx-auto min-h-[85vh] flex flex-col">
      
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 z-20 relative w-full">
        <div className="reveal-up lg:w-[60%] mt-8 lg:mt-0">
          <h1 className="font-['Syne',sans-serif] text-6xl sm:text-7xl lg:text-[5.5rem] font-medium tracking-tighter leading-[1.05] text-white">
            Share Deals. <br />
            Earn Cash.
          </h1>
        </div>
        
        <div className="reveal-up lg:w-[40%] flex flex-col items-start lg:pl-10 text-left relative">
          <p className="text-white/60 text-sm md:text-base leading-relaxed font-light mb-8 max-w-sm">
            Join our new partner program. Send us high-quality business leads, track them easily, and get paid fast when deals close.
          </p>

          <button 
            onClick={onEnterPortal} 
            className="group relative px-8 py-4 rounded-full overflow-hidden text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-2xl"
          >
            <span className="absolute inset-0 border border-white/20 rounded-full transition-colors duration-300 group-hover:border-transparent"></span>
            <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#B282FE] to-[#7038FF] transition-all duration-500 ease-out group-hover:h-full rounded-full"></span>
            <span className="relative flex items-center justify-center gap-3 z-10">
               Start Earning Today <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="parallax-element relative mt-24 lg:mt-32 w-full flex flex-col md:flex-row items-center lg:items-end justify-center lg:justify-end gap-6 z-10">
         
         <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200%] -z-10 pointer-events-none opacity-20 hidden lg:block" viewBox="0 0 1000 500" fill="none">
            <path d="M-100,250 C200,250 300,50 500,250 C700,450 900,250 1100,250" stroke="white" strokeWidth="1" />
            <path d="M500,250 C500,100 800,0 1100,100" stroke="white" strokeWidth="1" strokeDasharray="4 4"/>
         </svg>

         {/* Left Card - Earning Potential */}
         <div className="bg-[#12121A]/90 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-black/80 w-full md:w-auto relative group transition-transform duration-500 hover:-translate-y-2">
            <div className="absolute left-0 top-[60%] -translate-x-full w-12 h-[1px] bg-white/20 hidden md:block group-hover:bg-[#B282FE]/50 transition-colors">
               <div className="absolute left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#B282FE]/50 transition-colors"></div>
            </div>
            
            <h2 className="font-['Syne',sans-serif] text-white/40 text-[10px] font-medium tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
              <Wallet size={14} className="text-[#B282FE]" /> Registered Businesses
            </h2>
            <p className="text-6xl md:text-7xl font-light tracking-tighter text-white mb-2">Seven</p>
            <p className="text-white/40 text-xs font-light tracking-wide">Verified Business Units.</p>
         </div>

         {/* Right Card - Easy Setup */}
         <div className="bg-[#12121A]/90 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-black/80 w-full md:w-auto relative group transition-transform duration-500 hover:-translate-y-2 lg:mb-8">
            <div className="absolute left-0 top-[40%] -translate-x-full w-12 h-[1px] bg-white/20 hidden md:block group-hover:bg-[#B282FE]/50 transition-colors"></div>

            <h2 className="font-['Syne',sans-serif] text-white/40 text-[10px] font-medium tracking-[0.2em] uppercase mb-4 text-left flex items-center gap-2">
              <Lock size={14} className="text-[#B282FE]" /> Platform Access
            </h2>
            <p className="text-5xl md:text-6xl font-light tracking-tighter text-white text-left mb-2">Free</p>
            <p className="text-white/40 text-xs font-light tracking-wide mb-6">Zero hidden fees. Start submitting instantly.</p>
            
            <div className="absolute -bottom-4 right-10 flex items-center">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7038FF] to-[#B282FE] flex items-center justify-center text-[10px] font-bold border-4 border-[#07070A] shadow-lg z-30">HQ</div>
               <div className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-emerald-400 text-[12px] border-4 border-[#07070A] -ml-4 shadow-lg z-20"><CheckCircle size={16}/></div>
               <div className="w-10 h-10 rounded-full bg-[#2A2A3A] flex items-center justify-center text-white/50 border-4 border-[#07070A] -ml-4 shadow-lg hover:bg-white/10 transition-colors cursor-pointer z-10"><Plus size={14}/></div>
            </div>
         </div>
      </div>
    </section>
  );
};

export default HeroSection;