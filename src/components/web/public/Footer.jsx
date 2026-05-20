import React from 'react';

const Footer = () => {
  return (
    <footer className="pt-24 pb-8 px-6 border-t border-white/5 bg-[#07070A] relative overflow-hidden flex flex-col items-center">
      
      {/* Giant Watermark Text */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full text-center overflow-hidden pointer-events-none select-none z-0 opacity-100">
         <h1 className="font-['Syne',sans-serif] text-[20vw] md:text-[15vw] font-bold text-white/[0.02] leading-none tracking-tighter">
           RADIX
         </h1>
      </div>

      <div className="max-w-[1400px] w-full mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left mt-20 md:mt-32">
        
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center">
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775796828/Radix_logo_on_navy_blue_background__1_-removebg-preview_1_qbqtpi.png" 
              alt="Radix Holdings Logo" 
              className="h-8 md:h-22 w-auto object-contain" 
            />
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-6">
           {/* Updated Copyright & Developer Credit */}
           <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-[10px] text-white/30 font-medium tracking-[0.2em] uppercase">
               <span>© {new Date().getFullYear()} Radix. All rights reserved.</span>
               <span className="hidden md:block w-1 h-1 rounded-full bg-white/20"></span>
               <span className="flex items-center gap-1.5">
                  Developed by 
                  <a href="https://wa.me/919847512024" target="_blank" rel="noopener noreferrer" className="text-transparent bg-clip-text bg-gradient-to-r from-[#7038FF] to-[#B282FE] font-bold tracking-[0.25em] hover:opacity-80 transition-opacity drop-shadow-[0_0_10px_rgba(178,130,254,0.3)]">
                      Vynx Webworks
                  </a>
               </span>
           </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;