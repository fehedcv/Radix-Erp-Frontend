import React from 'react';

export default function GlobalLoader({ fullScreen = true, text = "Syncing Modules..." }) {
  // Toggle between a full-screen overlay or an inline container
  const containerStyle = fullScreen 
    ? "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-sm"
    : "flex flex-col items-center justify-center p-12 w-full h-full min-h-[200px]";

  return (
    <div className={`${containerStyle} font-['Plus_Jakarta_Sans',sans-serif]`}>
      
      {/* Smooth Up & Down Data Pillars */}
      <div className="flex items-end justify-center gap-2.5 h-16">
        {/* We use origin-bottom so they stretch upwards, and apply the custom animation */}
        <div className="w-3.5 h-16 bg-blue-300 rounded-sm origin-bottom" style={{ animation: 'erp-bar-bounce 1.2s ease-in-out infinite', animationDelay: '0ms' }}></div>
        <div className="w-3.5 h-16 bg-blue-500 rounded-sm origin-bottom" style={{ animation: 'erp-bar-bounce 1.2s ease-in-out infinite', animationDelay: '150ms' }}></div>
        <div className="w-3.5 h-16 bg-indigo-700 rounded-sm origin-bottom" style={{ animation: 'erp-bar-bounce 1.2s ease-in-out infinite', animationDelay: '300ms' }}></div>
        <div className="w-3.5 h-16 bg-blue-400 rounded-sm origin-bottom" style={{ animation: 'erp-bar-bounce 1.2s ease-in-out infinite', animationDelay: '450ms' }}></div>
      </div>

      {/* Loading Text & Micro-Progress */}
      {text && (
        <div className="mt-8 flex flex-col items-center">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.2em] mb-3">
            {text}
          </p>
          
          {/* Micro-Scanner Bar */}
          <div className="w-32 h-[3px] bg-slate-200 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-600 rounded-full w-1/3"
              style={{ animation: 'erp-slide 1.5s ease-in-out infinite alternate' }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Injecting custom keyframes directly so no config changes are needed */}
      <style>{`
        @keyframes erp-bar-bounce {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        @keyframes erp-slide {
          0% { transform: translateX(0%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
      
    </div>
  );
}