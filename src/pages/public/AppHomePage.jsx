import React from 'react';
import { useTheme } from '../../context/ThemeContext'; 

// Isolated Subcomponents
import HeroIllustration from '../../components/app/public/HeroIllustration';
import FeatureTypography from '../../components/app/public/FeatureTypography';
import ActionControls from '../../components/app/public/ActionControls';
import BrandingFooter from '../../components/app/public/BrandingFooter';

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
        
        <HeroIllustration />

        <FeatureTypography isLight={isLight} />

        <ActionControls onEnterPortal={onEnterPortal} />

      </main>

      {/* --- BOTTOM FOOTER: LOGO BRANDING --- */}
      <BrandingFooter />

    </div>
  );
};

export default AppHomePage;