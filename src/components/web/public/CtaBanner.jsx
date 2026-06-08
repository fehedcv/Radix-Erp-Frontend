import React from 'react';
import { ArrowUpRight, MessageCircle } from 'lucide-react';

const CtaBanner = ({ onEnterPortal }) => {
  return (
    <section id="contact" className="py-24 px-4 sm:px-6 relative">
      <div className="max-w-[1200px] mx-auto reveal-up">
        <div className="bg-gradient-to-br from-[#161622] to-[#0A0A0F] border border-white/10 rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-black/50">
           
           {/* Background Orb */}
           <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#B282FE]/20 blur-[100px] rounded-full pointer-events-none"></div>

           <div className="md:w-3/5 relative z-10 text-center md:text-left">
              <h2 className="font-['Syne',sans-serif] text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
                 Ready to capitalize on your network?
              </h2>
              <p className="text-white/50 text-lg font-light max-w-md mx-auto md:mx-0">
                 Apply to become an Independent Business Partner (IBP) today. Leverage Zypher’s corporate infrastructure to execute high-value contracts and build a serious, scalable portfolio.
              </p>
           </div>

           <div className="md:w-2/5 relative z-10 flex flex-col items-center md:items-end gap-4 w-full">
              <button 
                onClick={onEnterPortal} 
                className="w-full sm:w-auto group relative px-10 py-5 rounded-full overflow-hidden text-xs font-bold uppercase tracking-[0.2em] text-black bg-white shadow-2xl transition-transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">APPLY FOR PARTNERSHIP<ArrowUpRight size={16}/></span>
              </button>
              
              <a href="https://wa.me/919567543636" target='_blank' rel="noopener noreferrer" className="w-full sm:w-auto px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2">
                 <MessageCircle size={16}/> SPEAK TO AN EXECUTIVE
              </a>
           </div>

        </div>
      </div>
    </section>
  );
};

export default CtaBanner;