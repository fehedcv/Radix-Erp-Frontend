import React from 'react';
import { motion } from 'framer-motion';

const BrandingFooter = () => {
  return (
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
      </div>
    </motion.footer>
  );
};

export default BrandingFooter;