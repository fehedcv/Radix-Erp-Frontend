import React from 'react';

const TabSwitcher = ({ tab, setTab, setLoginError, setSignupError, setSignupSuccess, setSignupForm }) => {
  return (
    <div className="relative flex bg-[#12121A]/80 lg:bg-[#111] backdrop-blur-md lg:backdrop-blur-none p-1.5 rounded-full mb-6 border border-white/[0.05] lg:border-[#222] z-10">
      <div 
        className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white/[0.1] lg:bg-[#222] border border-white/[0.1] lg:border-[#333] rounded-full shadow-sm transition-all duration-300 ease-out"
        style={{ left: tab === 'login' ? '6px' : 'calc(50%)' }}
      />
      <button
        onClick={() => { setTab('login'); setLoginError(''); }}
        className={`relative z-10 flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors ${tab === 'login' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
      >
        Login
      </button>
      <button
        onClick={() => { setTab('signup'); setSignupError(''); setSignupSuccess(false); }}
        className={`relative z-10 flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest rounded-full transition-colors ${tab === 'signup' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
      >
        Sign Up
      </button>
    </div>
  );
};

export default TabSwitcher;