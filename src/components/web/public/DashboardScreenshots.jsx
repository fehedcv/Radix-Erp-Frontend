import React from 'react';

const DashboardScreenshots = () => {
  return (
    <section id="dashboard" className="screenshot-section py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5 overflow-hidden">
       <div className="max-w-[1200px] mx-auto">
          
          <div className="text-center mb-16 md:mb-24 reveal-up">
            <h3 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
              Total Visibility. <br className="hidden md:block" />Absolute Control. 
            </h3>
            <p className="text-white/50 text-lg leading-relaxed font-light max-w-2xl mx-auto">
              Oversee your active client portfolio, track project execution milestones in real time, and analyze your revenue generation through a secure, high-performance enterprise interface.
            </p>
          </div>

          {/* Modern 3-Screenshot Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 w-full">
             
             {/* Main Desktop Screenshot (Full Width) */}
             <div className="md:col-span-2 w-full rounded-[2rem] border border-white/10 bg-[#12121A] shadow-2xl overflow-hidden hover:border-white/20 transition-colors duration-500">
                <div className="w-full h-10 bg-white/5 flex items-center px-6 border-b border-white/5">
                   <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#ff5f56] transition-colors"></div>
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#ffbd2e] transition-colors"></div>
                      <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#27c93f] transition-colors"></div>
                   </div>
                </div>
                
                <div className="w-full aspect-[16/9] flex items-center justify-center bg-[#1A1A24] relative overflow-hidden">
                   <img 
                     src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1780204083/Screenshot_1299_rrsy7b.png" 
                     alt="Main Desktop Dashboard" 
                     loading='lazy'
                     className="w-full h-full object-cover" 
                   />
                </div>
             </div>

             {/* Secondary Screenshot 1 */}
             <div className="w-full rounded-[1.5rem] border border-white/10 bg-[#12121A] shadow-xl overflow-hidden hover:border-white/20 transition-colors duration-500">
                <div className="w-full h-8 bg-white/5 flex items-center px-4 border-b border-white/5">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-[#ff5f56] transition-colors"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-[#ffbd2e] transition-colors"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-[#27c93f] transition-colors"></div>
                   </div>
                </div>
                <div className="w-full aspect-[16/9] flex items-center justify-center bg-[#1A1A24] relative overflow-hidden">
                   {/* Changed to object-contain and matched aspect ratio to fix cropping */}
                   <img 
                     src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1780204083/Screenshot_1301_oqz5kt.png" 
                     alt="Analytics View" 
                     loading='lazy'
                     className="w-full h-full object-contain opacity-100" 
                   />
                </div>
             </div>

             {/* Secondary Screenshot 2 */}
             <div className="w-full rounded-[1.5rem] border border-white/10 bg-[#12121A] shadow-xl overflow-hidden hover:border-white/20 transition-colors duration-500">
                <div className="w-full h-8 bg-white/5 flex items-center px-4 border-b border-white/5">
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-[#ff5f56] transition-colors"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-[#ffbd2e] transition-colors"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 hover:bg-[#27c93f] transition-colors"></div>
                   </div>
                </div>
                <div className="w-full aspect-[16/9] flex items-center justify-center bg-[#1A1A24] relative overflow-hidden">
                   {/* Changed to object-contain and matched aspect ratio to fix cropping */}
                   <img 
                     src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1780204083/Screenshot_1300_jk9ro3.png" 
                     alt="Settings View" 
                     loading='lazy'
                     className="w-full h-full object-contain opacity-100" 
                   />
                </div>
             </div>

          </div>
       </div>
    </section>
  );
};

export default DashboardScreenshots;