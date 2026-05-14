import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext'; 

const AppHomePage = ({ onEnterPortal }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    // STRICTLY NON-SCROLLABLE: Locked to viewport height
    <div className={`relative h-[100dvh] w-full flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200 overflow-hidden ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>

      {/* --- CENTERED BODY: 3D IMAGE + TEXT + BUTTON --- */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-md mx-auto min-h-0">
        
        {/* 3D Floating Image Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-26 mt-14"
        >
          {/* Ambient Glow behind the image to make it pop */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#81B398]/20 rounded-full blur-[40px] -z-10" />
          
          {/* 3D Dummy Image with smooth continuous floating animation */}
          <motion.img
  src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1778689818/Gemini_Generated_Image_vvbh60vvbh60vvbh-removebg-preview_1_yxxeaj.png"
  alt="3D Business Chain Concept"
  className="w-full h-full object-contain drop-shadow-2xl"
/>
        </motion.div>

        {/* Minimal Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tighter leading-[1.1] mb-3">
            Refer Leads 
            <span className="text-[#81B398]"> Earn Money.</span>
          </h1>
          <p className={`text-sm leading-relaxed font-medium px-4 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Join the ultimate business chain. Submit leads and get paid instantly.
          </p>
        </motion.div>

        {/* SINGLE PRIMARY ACTION BUTTON (Centered, Fixed Width) */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          onClick={onEnterPortal}
          className="w-[160px] py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085] shadow-lg shadow-[#81B398]/20"
        >
          Earn Now <ArrowRight size={18} strokeWidth={2.5} />
        </motion.button>

      </main>

      {/* --- BOTTOM FOOTER: LOGO BRANDING --- */}
      <motion.footer 
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }} 
  transition={{ duration: 0.5, delay: 0.3 }}
  className="shrink-0 w-full px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4 flex justify-center items-center"
>
  <div className="flex items-center gap-1 opacity-90">
    
    {/* Logo */}
    <div className="w-24 h-24 flex items-center justify-center overflow-hidden">
      <img 
        src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1778691102/Gemini_Generated_Image_5i5u2i5i5u2i5i5u-removebg-preview_l3ukts.png"
        alt="Radix Logo" 
        className="w-full h-full object-contain"
      />
    </div>

    {/* Brand Name
    <span className="text-3xl font-['Plus_Jakarta_Sans',sans-serif] tracking-tight">
      Radix
    </span>  */}
    

  </div>
</motion.footer>

    </div>
  );
};

export default AppHomePage;