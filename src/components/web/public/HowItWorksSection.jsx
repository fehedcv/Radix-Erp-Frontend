import React from 'react';
import { Send, ShieldCheck, Wallet } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <section id="works" className="py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 relative">
        
        <div className="lg:col-span-5 lg:sticky lg:top-40 self-start reveal-up">
           <h3 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
             Maximum Leverage<br/> Zero Friction.
           </h3>
           <p className="text-white/50 text-lg leading-relaxed font-light mb-8 max-w-md">
             Transform your professional network into a high-yielding corporate asset. Our streamlined architecture allows you to initiate massive projects in seconds, freeing you to focus on building elite relationships while our divisions handle the execution.
           </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8 md:gap-12 lg:pt-10">
           
           <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                 <Send className="text-[#B282FE]" size={24} />
              </div>
              <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">1. Initiate the Project</h4>
              <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                 Identify a high-value client requiring premium business services. Log into your IBP dashboard and securely register the project brief directly to our headquarters.
              </p>
           </div>

           <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                 <ShieldCheck className="text-[#B282FE]" size={24} />
              </div>
              <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">2. Our Divisions Execute</h4>
              <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                 Our specialized Project Managers immediately take the helm. From high-level client negotiations to full-scale technical execution, our divisions handle the heavy lifting while you monitor milestones live.
              </p>
           </div>

           <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                 <Wallet className="text-[#B282FE]" size={24} />
              </div>
              <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">3. Claim Your Profit Share</h4>
              <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                 As project milestones are achieved and verified by Administration, your profit distribution is automatically authorized and routed directly into your secure partner wallet.
              </p>
           </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;