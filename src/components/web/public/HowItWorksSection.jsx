import React from 'react';
import { Send, ShieldCheck, Wallet } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <section id="works" className="py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 relative">
        
        <div className="lg:col-span-5 lg:sticky lg:top-40 self-start reveal-up">
           <h3 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
             Built for speed. <br/> Designed for you.
           </h3>
           <p className="text-white/50 text-lg leading-relaxed font-light mb-8 max-w-md">
             Transform your professional network into a steady stream of income. Our streamlined process ensures you spend less time submitting, and more time earning.
           </p>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8 md:gap-12 lg:pt-10">
           
           <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                 <Send className="text-[#B282FE]" size={24} />
              </div>
              <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">Send us the details</h4>
              <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                 Know a company that needs specific services? Simply log into your dashboard and fill out a quick, one-minute form to register your lead in our secure system.
              </p>
           </div>

           <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                 <ShieldCheck className="text-[#B282FE]" size={24} />
              </div>
              <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">We close the deal</h4>
              <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                 Our professional sales team takes over immediately. They contact the business and negotiate the contract. You get live status updates directly in your dashboard.
              </p>
           </div>

           <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                 <Wallet className="text-[#B282FE]" size={24} />
              </div>
              <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">You get paid</h4>
              <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                 The moment the deal is signed and verified by headquarters, your commission is automatically calculated and deposited straight into your secure platform wallet.
              </p>
           </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;