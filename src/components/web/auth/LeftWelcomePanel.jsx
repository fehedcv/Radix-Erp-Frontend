import React from 'react';

const LeftWelcomePanel = () => {
  return (
    <div className="hidden lg:flex w-1/2 h-full flex-col justify-center px-16 xl:px-24 z-10 relative">
      <h1 className="text-6xl xl:text-7xl font-medium tracking-tighter leading-[1.05] mb-6 text-white">
       Enter Your  <br/> Executive Hub.
      </h1>
      <p className="text-white/60 text-lg max-w-md font-light leading-relaxed">
        Initiate high-value client projects, track execution milestones, and manage your profit distributions through our secure partner ecosystem.
      </p>
    </div>
  );
};

export default LeftWelcomePanel;