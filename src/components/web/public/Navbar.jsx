import React from 'react';
import { motion } from 'framer-motion';

const Navbar = ({ onEnterPortal }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-[#07070A]/80 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-[1400px] mx-auto px-4 sm:px-16 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-12">
          
          {/* LOGO */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <img
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png"
              alt="Radix Holdings Logo"
              className="h-8 md:h-8 w-auto block"
            />
          </motion.div>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {['How it Works', 'Dashboard'].map((item) => (
              <a
                key={item}
                href={`#${item.split(' ').pop().toLowerCase()}`}
                className="text-xs font-medium text-white/50 hover:text-white transition-colors duration-300 uppercase tracking-widest"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
        
        {/* CTA BUTTON WITH BORDER FILL HOVER */}
        <button 
          onClick={onEnterPortal}
          className="group relative px-6 py-2.5 rounded-full overflow-hidden text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap text-white"
        >
          <span className="absolute inset-0 border border-white/20 rounded-full transition-colors duration-300 group-hover:border-transparent"></span>
          <span className="absolute inset-0 bg-white transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0 rounded-full"></span>
          <span className="relative z-10 transition-colors duration-300 group-hover:text-black">Let's Earn</span>
        </button>
      </nav>
    </header>
  );
};

export default Navbar;