import React, { useEffect } from 'react';
import gsap from 'gsap';

const BackgroundDecorations = ({ infoSideRef }) => {
  // Floating GSAP animation (Mobile only background elements)
  useEffect(() => {
    if (infoSideRef.current && window.innerWidth < 1024) {
      gsap.to('.floating-node', {
        y: -20,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        stagger: 0.3,
      });
    }
  }, [infoSideRef]);

  return (
    <>
      {/* --- MOBILE AMBIENT ORBS (Hidden on Desktop) --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 lg:hidden">
        <div className="absolute top-[10%] left-[10%] w-[60vw] h-[60vw] rounded-full bg-[#7038FF] mix-blend-screen filter blur-[120px] opacity-30 floating-node" />
        <div className="absolute bottom-[10%] right-[10%] w-[70vw] h-[70vw] rounded-full bg-[#9D4EDD] mix-blend-screen filter blur-[130px] opacity-20 floating-node" style={{ animationDelay: '-2s' }} />
      </div>

      {/* --- DESKTOP DECORATIVE LINES (Hidden on Mobile) --- */}
      <div className="hidden lg:block absolute inset-0 overflow-hidden pointer-events-none z-0">
        <svg className="absolute w-[150vw] h-[150vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" viewBox="0 0 1000 1000" fill="none">
          <path d="M0,800 Q300,500 500,800 T1000,400" stroke="white" strokeWidth="0.5" strokeDasharray="4 4" />
          <path d="M-200,200 Q400,800 800,200" stroke="white" strokeWidth="0.5" />
        </svg>
      </div>
    </>
  );
};

export default BackgroundDecorations;