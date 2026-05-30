import React from 'react';

const HeroIllustration = () => {
  return (
    <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-26 mt-14">
      {/* Ambient Glow behind the image to make it pop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#81B398]/20 rounded-full blur-[40px] -z-10" />
      
      {/* Static 3D Dummy Image */}
      <img
        src="https://res.cloudinary.com/dmtzmgbkj/image/upload/v1778689818/Gemini_Generated_Image_vvbh60vvbh60vvbh-removebg-preview_1_yxxeaj.png"
        alt="3D Business Chain Concept"
        className="w-full h-full object-contain drop-shadow-2xl"
      />
    </div>
  );
};

export default HeroIllustration;