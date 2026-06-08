import React from 'react';
import { Clock } from 'lucide-react';

const ApprovalsSection = ({ flowLineRef }) => {
  return (
    <section id="approvals" className="py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5 bg-gradient-to-b from-[#07070A] to-[#0A0A0F]">
       <div className="max-w-[1200px] mx-auto text-center reveal-up mb-16 md:mb-24">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A1A24] border border-white/10 mb-6 shadow-[0_0_20px_rgba(178,130,254,0.15)]">
             <img src="" alt="" /><Clock className="text-[#B282FE]" size={20} />
          </div>
          <h2 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
             Accelerated Deal Processing. OR Rapid Verification. Zero Delays.
          </h2>
          <p className="text-white/50 text-lg max-w-2xl mx-auto font-light leading-relaxed">
             In high-tier business, time is capital. Our proprietary pipeline ensures every project you initiate is evaluated, assigned, and approved with absolute corporate transparency.
          </p>
       </div>

       {/* Pipeline Visual Container */}
       <div className="max-w-[1000px] mx-auto relative reveal-up">
          
          {/* The Track (Horizontal on desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 hidden md:block -translate-y-1/2 rounded-full overflow-hidden">
             <div ref={flowLineRef} className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#B282FE] to-transparent opacity-80 filter blur-[1px]"></div>
          </div>

          {/* Mobile Track (Vertical) */}
          <div className="absolute left-[39px] top-0 bottom-0 w-1 bg-white/5 block md:hidden rounded-full overflow-hidden">
             <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-[#B282FE] to-transparent animate-[slideDown_3s_linear_infinite]"></div>
          </div>
          
          <style>{`
             @keyframes slideDown {
               0% { transform: translateY(-100%); }
               100% { transform: translateY(300%); }
             }
          `}</style>

          {/* Nodes */}
          <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-4 relative z-10">
             
             {/* Node 1 */}
             <div className="flex flex-col sm:flex-row md:flex-col items-center md:text-center gap-6 md:gap-4 md:w-1/3">
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#12121A] border border-[#B282FE]/50 shadow-[0_0_30px_rgba(178,130,254,0.2)] flex items-center justify-center relative">
                   <div className="absolute inset-2 border border-white/10 rounded-xl"></div>
                   <span className="text-2xl font-light text-white">01</span>
                </div>
                <div>
                   <h4 className="font-['Syne',sans-serif] text-lg font-medium text-white mb-2">Initial Qualification</h4>
                   <p className="text-sm text-white/40 font-light">Instant verification of the client profile, business requirement, and project scope.</p>
                </div>
             </div>

             {/* Node 2 */}
             <div className="flex flex-col sm:flex-row md:flex-col items-center md:text-center gap-6 md:gap-4 md:w-1/3">
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#12121A] border border-white/10 flex items-center justify-center relative">
                   <div className="absolute inset-2 border border-white/5 rounded-xl"></div>
                   <span className="text-2xl font-light text-white">02</span>
                </div>
                <div>
                   <h4 className="font-['Syne',sans-serif] text-lg font-medium text-white mb-2">Executive Allocation</h4>
                   <p className="text-sm text-white/40 font-light">Our specialized Project Managers assess the requirements and lock in the execution strategy.</p>
                </div>
             </div>

             {/* Node 3 */}
             <div className="flex flex-col sm:flex-row md:flex-col items-center md:text-center gap-6 md:gap-4 md:w-1/3">
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#12121A] border border-white/10 flex items-center justify-center relative">
                   <div className="absolute inset-2 border border-white/5 rounded-xl"></div>
                   <span className="text-2xl font-light text-white">03</span>
                </div>
                <div>
                   <h4 className="font-['Syne',sans-serif] text-lg font-medium text-white mb-2">Profit Allocation</h4>
                   <p className="text-sm text-white/40 font-light">Your profit share is automatically calculated and secured in your partner ledger upon milestone clearance.</p>
                </div>
             </div>

          </div>
       </div>
    </section>
  );
};

export default ApprovalsSection;