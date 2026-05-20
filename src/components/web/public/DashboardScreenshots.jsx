import React from 'react';

const DashboardScreenshots = () => {
  return (
    <section id="dashboard" className="screenshot-section py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5 overflow-hidden">
       <div className="max-w-[1200px] mx-auto">
          
          <div className="text-center mb-16 md:mb-24 reveal-up">
            <h3 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
              Manage your referrals <br className="hidden md:block" />from anywhere.
            </h3>
            <p className="text-white/50 text-lg leading-relaxed font-light max-w-2xl mx-auto">
              Track your submitted leads, monitor their real-time verification status, and watch your earned credits grow from a clean, intuitive interface that works flawlessly on your computer and right from your pocket.
            </p>
          </div>

          {/* Stacked Images Layout */}
          <div className="relative h-auto md:h-[550px] lg:h-[700px] w-full flex flex-col md:block gap-12 md:gap-0">
             
             {/* Desktop Screenshot (Base Layer) */}
             <div className="screen-1 relative md:absolute md:top-0 md:left-0 md:w-[80%] w-full h-auto rounded-[2rem] border border-white/10 bg-[#12121A] shadow-2xl overflow-hidden z-10">
                <div className="w-full h-10 bg-white/5 flex items-center px-6 border-b border-white/5">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#ff5f56] transition-colors"></div>
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#ffbd2e] transition-colors"></div>
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#27c93f] transition-colors"></div>
                   </div>
                </div>
                
                <div className="w-full aspect-[16/9] flex items-center justify-center bg-[#1A1A24] relative overflow-hidden">
                   <img src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775831651/Screenshot_1188_stqtcy.png" alt="Desktop Dashboard" className="w-full h-full object-cover" />
                </div>
             </div>

             {/* Mobile Screenshot (Overlay Layer) */}
             <div className="screen-2 relative md:absolute md:top-[120px] lg:top-[150px] md:right-[5%] w-[65%] sm:w-[50%] md:w-[26%] mx-auto md:mx-0 h-auto rounded-[2.5rem] border-[6px] lg:border-[8px] border-[#1A1A24] bg-[#12121A] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-20">
                <div className="w-full aspect-[9/16] flex items-center justify-center bg-[#0A0A0F] relative overflow-hidden rounded-b-[2rem]">
                  <img 
                    src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775842532/WhatsApp_Image_2026-04-10_at_11.04.58_PM_qzmp3u.jpg" 
                    alt="Mobile Dashboard" 
                    className="w-full h-full" 
                  />
                </div>
                
                <div className="absolute bottom-2 inset-x-0 flex justify-center z-30">
                   <div className="w-1/3 h-1 bg-white/20 rounded-full"></div>
                </div>
             </div>

          </div>
       </div>
    </section>
  );
};

export default DashboardScreenshots;