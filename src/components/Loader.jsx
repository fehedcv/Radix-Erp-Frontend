import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function GlobalLoader({ fullScreen = true, text = "Syncing Data..." }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Theme-consistent styles based on reference image image_526edd.png
  const containerStyle = fullScreen 
    ? `fixed inset-0 z-[500] flex flex-col items-center justify-center backdrop-blur-xl transition-colors duration-300 ${
        isLight ? "bg-[#F0F2F5]/80" : "bg-[#020617]/80"
      }`
    : "flex flex-col items-center justify-center p-12 w-full h-full min-h-[300px] bg-transparent";

  return (
    <div className={`${containerStyle} font-['Plus_Jakarta_Sans',sans-serif]`}>
      
      {/* SaaS Premium Minimal Spinner - Color Synced to Cyan Accent */}
      <div 
        className={`w-10 h-10 rounded-full border-2 border-transparent transition-colors duration-300 ${
          isLight 
            ? "border-t-[#61D9DE] border-r-[#61D9DE]/30" 
            : "border-t-[#38BDF8] border-r-[#38BDF8]/40 shadow-[0_0_20px_rgba(56,189,248,0.2)]"
        }`} 
        style={{ animation: 'premium-spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} 
      />

      {/* Modern Minimal Text - Synced to Theme Text Colors */}
      {text && (
        <div className="mt-8">
          <p className={`text-[9px] font-black uppercase tracking-[0.5em] opacity-70 transition-colors duration-300 ${
            isLight ? "text-[#1A1D1F]" : "text-[#E2E8F0] drop-shadow-[0_0_10px_rgba(56,189,248,0.2)]"
          }`}>
            {text}
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes premium-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      
    </div>
  );
}