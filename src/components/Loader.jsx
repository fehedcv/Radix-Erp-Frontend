import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function GlobalLoader({ fullScreen = true, text = "Syncing Data..." }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Earth-Tech Minimalist container styles
  const containerStyle = fullScreen 
    ? `fixed inset-0 z-[500] flex flex-col items-center justify-center backdrop-blur-md transition-colors duration-300 ${
        isLight ? "bg-[#FFFFFF]/80" : "bg-[#131720]/80"
      }`
    : "flex flex-col items-center justify-center p-12 w-full h-full min-h-[300px] bg-transparent";

  const textSecondary = isLight ? "text-[#718096]" : "text-[#9CA3AF]";

  return (
    <div className={`${containerStyle} font-['Plus_Jakarta_Sans',sans-serif]`}>
      
      {/* Modern SaaS 3-Dot Pulse Loader (Earth-Tech Palette) */}
      <div className="flex items-center gap-2.5">
        <div 
          className="w-2.5 h-2.5 rounded-full bg-[#81B398]" 
          style={{ animation: 'saas-pulse 1.2s ease-in-out infinite' }} 
        />
        <div 
          className="w-2.5 h-2.5 rounded-full bg-[#DAC18A]" 
          style={{ animation: 'saas-pulse 1.2s ease-in-out 0.2s infinite' }} 
        />
        <div 
          className="w-2.5 h-2.5 rounded-full bg-[#48477A]" 
          style={{ animation: 'saas-pulse 1.2s ease-in-out 0.4s infinite' }} 
        />
      </div>

      {/* Minimalist Typography */}
      {text && (
        <div className="mt-6">
          <p className={`text-xs font-bold uppercase tracking-widest transition-colors duration-300 ${textSecondary}`}>
            {text}
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes saas-pulse {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(0.8); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2); 
          }
        }
      `}</style>
      
    </div>
  );
}