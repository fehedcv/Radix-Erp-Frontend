import React from 'react';
import { Smartphone, ArrowRight } from 'lucide-react';

const AppSection = () => {
  return (
    <section id="app" className="relative overflow-hidden bg-[#07070A] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* TOP HEADER BLOCK */}
      <div className="bg-[#07070A] pt-20 pb-40 md:pt-28 md:pb-60 px-4 text-center relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#080a07] blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 font-['Syne',sans-serif]">
          <h2 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6">
            Radix Android <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#B282FE] to-[#7038FF]">
              Application
            </span>
          </h2>
          
          <p className="text-white/50 text-lg leading-relaxed font-light max-w-2xl mx-auto">
            Take your business networking to the next level. Submit high-quality leads directly from your contacts, track verification milestones in real-time, and manage your earned credits with our high-performance mobile portal.
          </p>
        </div>
      </div>

      {/* DEVICE SECTION */}
      <div className="relative -mt-32 md:-mt-48 px-4 z-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
            
            {/* Side Phone - Left */}
            <div className="hidden md:block w-64 h-[500px] rounded-[2.5rem] border-[6px] border-[#1A1A24] bg-white shadow-2xl overflow-hidden transform -rotate-6 translate-y-12">
               <img src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1775842532/WhatsApp_Image_2026-04-10_at_11.04.58_PM_qzmp3u.jpg" className="w-full h-full object-cover" alt="App UI 1" />
            </div>

            {/* Main Phone - Center */}
            <div className="w-72 h-[580px] rounded-[3rem] border-[8px] border-[#1A1A24] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden z-30">
               <img src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1775842532/WhatsApp_Image_2026-04-10_at_11.04.58_PM_qzmp3u.jpg" className="w-full h-full object-cover" alt="App UI Main" />
            </div>

            {/* Side Phone - Right */}
            <div className="hidden md:block w-64 h-[500px] rounded-[2.5rem] border-[6px] border-[#1A1A24] bg-white shadow-2xl overflow-hidden transform rotate-6 translate-y-12">
               <img src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1775842532/WhatsApp_Image_2026-04-10_at_11.04.58_PM_qzmp3u.jpg" className="w-full h-full object-cover" alt="App UI 2" />
            </div>
          </div>
        </div>
      </div>

      {/* DOWNLOAD ACTION AREA */}
      <div className="py-20 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a 
            href="/radix-v1.apk" 
            className="group relative px-8 py-5 rounded-full overflow-hidden text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <span className="absolute inset-0 border border-white/20 rounded-full transition-colors duration-300 group-hover:border-transparent"></span>
            <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#B282FE] to-[#7038FF] transition-all duration-500 ease-out group-hover:h-full rounded-full"></span>
            
            <span className="relative flex items-center gap-4 z-10">
              <Smartphone size={24} className="text-[#B282FE] group-hover:text-white transition-colors duration-300" />
              
              <div className="text-left">
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity leading-none mb-1">
                  Available for
                </p>
                <p className="text-sm font-black uppercase tracking-widest leading-none">
                  Android APK
                </p>
              </div>

              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </div>

      <div className="absolute top-[60%] right-10 w-32 h-32 bg-[#7038FF]/5 rounded-full blur-2xl"></div>
    </section>
  );
};

export default AppSection;