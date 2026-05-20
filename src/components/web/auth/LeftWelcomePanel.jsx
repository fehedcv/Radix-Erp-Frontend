import React from 'react';

const LeftWelcomePanel = () => {
  return (
    <div className="hidden lg:flex w-1/2 h-full flex-col justify-center px-16 xl:px-24 z-10 relative">
      <h1 className="text-6xl xl:text-7xl font-medium tracking-tighter leading-[1.05] mb-6 text-white">
        Access your <br/> Dashboard.
      </h1>
      <p className="text-white/60 text-lg max-w-md font-light leading-relaxed">
        Submit referrals, monitor approvals, and withdraw your commissions through our agent portal.
      </p>
    </div>
  );
};

export default LeftWelcomePanel;