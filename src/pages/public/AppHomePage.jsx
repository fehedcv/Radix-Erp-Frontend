import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext'; 

// =========================================================
// 1. DATA & CONTENT
// =========================================================

const onboardingSteps = [
  {
    id: 0,
    title: "The best way\nto manage your\nmoney",
  },
  {
    id: 1,
    title: "Track all your\nexpenses in\none place", 
  },
  {
    id: 2,
    title: "Achieve your\nfinancial goals\nfaster", 
  }
];

// =========================================================
// 2. UI COMPONENTS
// =========================================================

const HeaderBrand = ({ onBack, showBack }) => (
  // Aligned px-8 to match the bottom text container
  <header className="absolute top-0 left-0 w-full pt-12 px-4 z-50 flex items-center justify-between pointer-events-none">
    <div className="flex items-center gap-2">
      <img
        src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1780302338/ChatGPT_Image_May_31__2026__03_45_06_PM-removebg-preview_m1f9qh.png"
        alt="Brand Logo"
        className="h-[40px] w-auto object-contain opacity-90 drop-shadow-md"
      />
      {/* <span className="h-8 flex items-center text-white text-3xl font-bold tracking-tight">
        Radix
      </span> */}
    </div>
    
    {/* Back Button */}
    <div className="pointer-events-auto">
      <button 
        onClick={onBack}
        className={`text-white/60 hover:text-white text-sm font-medium transition-all duration-300 px-2 py-1 flex items-center gap-1 ${
          showBack ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
        aria-label="Go Back"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>
    </div>
  </header>
);

const AbstractRings = () => (
  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
    <svg 
      viewBox="0 0 375 812" 
      className="w-full h-full object-cover"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Top Blue Arc Gradient */}
        <linearGradient id="blueRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0044FF" />
          <stop offset="100%" stopColor="#00071A" />
        </linearGradient>
        
        {/* Middle Purple Arc Gradient */}
        <linearGradient id="purpleRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#B388FF" />
          <stop offset="100%" stopColor="#1C0054" />
        </linearGradient>

       <linearGradient id="fadeRing" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#2563EB" stopOpacity="1" />
  <stop offset="20%" stopColor="#022269" stopOpacity="1" />
  <stop offset="50%" stopColor="#022269" stopOpacity="0" />
  <stop offset="100%" stopColor="#022269" stopOpacity="0" />
</linearGradient>
      </defs>
      
      {/* Top Blue Ring */}
      <circle 
        cx="187" 
        cy="-50" 
        r="280" 
        fill="none" 
        stroke="url(#blueRing)" 
        strokeWidth="70" 
      />
      
      {/* Middle/Intersecting Purple Ring */}
      <circle 
        cx="320" 
        cy="420" 
        r="260" 
        fill="none" 
        stroke="url(#purpleRing)" 
        strokeWidth="70" 
        opacity="0.95"
      />

      {/* Faint Bottom Left Ring (Reduced opacity + fade gradient) */}
      <circle 
        cx="-80" 
        cy="650" 
        r="200" 
        fill="none" 
        stroke="url(#fadeRing)" 
        strokeWidth="70" 
        opacity="" 
      />
    </svg>
  </div>
);

// =========================================================
// 3. MAIN PAGE WRAPPER
// =========================================================

const AppOnboardingPage = ({ onEnterPortal }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme("dark");
  }, []);

  const handleNext = () => {
    if (currentPage < onboardingSteps.length - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      onEnterPortal();
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden bg-[#0D0D12] text-white">
      
      {/* Logo & Back Button */}
      <HeaderBrand onBack={handleBack} showBack={currentPage > 0} />

      {/* Background Abstract Graphic */}
      <AbstractRings />

      {/* Storytelling Text & Navigation Controls */}
      <div className="absolute bottom-0 left-0 w-full px-8 pb-14 z-20 flex flex-col justify-end h-1/2">
        
        {/* Main Typography with crossfade transition */}
      <div className="mb-16 min-h-[120px] flex items-end">
  <div className="relative inline-block">
    
    {/* Glow Background */}
    <div className="absolute inset-0 -z-10 rounded-full bg-black blur-3xl scale-150" />

    <h1
      key={currentPage}
      className="text-[2.25rem] sm:text-[2.5rem] leading-[1.2] font-bold tracking-wide whitespace-pre-line animate-[fadeIn_0.4s_ease-in-out]"
    >
      {onboardingSteps[currentPage].title}
    </h1>

  </div>
</div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between w-full h-[3.25rem]">
          
          {/* Dynamic Pagination Indicators */}
          <div className="flex items-center gap-2.5">
            {onboardingSteps.map((step, index) => (
              <div 
                key={step.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentPage === index 
                    ? "w-2 bg-white" 
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>

          {/* Dynamic Action Button */}
          <button 
            onClick={handleNext}
            className={`h-[3.25rem] rounded-full bg-gradient-to-br from-[#A475FF] to-[#6020FF] flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_8px_20px_rgba(96,32,255,0.25)] group ${
              currentPage === 2 ? "px-7 w-auto" : "w-[3.25rem]"
            }`}
            aria-label={currentPage === 2 ? "Login or Earn" : "Next Step"}
          >
            {currentPage === 2 ? (
              <span className="text-white font-bold tracking-wide whitespace-nowrap animate-[fadeIn_0.3s_ease-in-out]">
                Login
              </span>
            ) : (
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:translate-x-0.5 transition-transform"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
          </button>
          
        </div>
      </div>
      
      {/* Inline styles for simple crossfade animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default AppOnboardingPage;