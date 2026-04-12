import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderEdit, Bell, LogOut, 
  ChevronRight, AlertCircle, Sun, Moon 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { initialLeads } from '../../data/leadHistoryData';

const BusinessHub = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const isLight = theme === 'light';

  // SESSION & DATA MANAGEMENT
  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");
  const businessName = currentUser.name || currentUser.businessName || "Business Team";

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    const allLeads = saved ? JSON.parse(saved) : initialLeads;
    return allLeads.filter(l => l.businessUnit === businessName);
  });

  const updateLeadStatus = (id, newStatus) => {
    const masterSaved = JSON.parse(localStorage.getItem('vynx_leads') || "[]");
    const updatedMasterLeads = masterSaved.map(l => l.id === id ? { ...l, status: newStatus } : l);
    localStorage.setItem('vynx_leads', JSON.stringify(updatedMasterLeads));
    setLeads(updatedMasterLeads.filter(l => l.businessUnit === businessName));
  };

  const navItems = [
    { id: 'dashboard', label: 'OVERVIEW', icon: LayoutDashboard, path: '/business/dashboard' },
    { id: 'leads', label: 'LEADS', icon: Users, path: '/business/leads' },
    { id: 'portfolio', label: 'PROFILE', icon: FolderEdit, path: '/business/portfolio' },
  ];

  const currentTab = navItems.find(item => location.pathname.startsWith(item.path));
  const currentTabName = currentTab?.label || "DASHBOARD";

  // Theme Toggle UI (Refined for #F8FAFB theme)
  const ThemeToggle = () => (
    <div 
      onClick={toggleTheme}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-300 flex items-center px-1 ${
        isLight ? 'bg-[#F0F2F5]' : 'bg-slate-700'
      }`}
    >
      <motion.div 
        animate={{ x: isLight ? 0 : 20 }}
        className={`w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
          isLight ? 'bg-white' : 'bg-slate-900'
        }`}
      >
        {isLight ? <Sun size={10} className="text-[#61D9DE]" /> : <Moon size={10} className="text-[#61D9DE]" />}
      </motion.div>
    </div>
  );

  return (
    <div className={`flex h-screen font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-300 ${
      isLight ? 'bg-[#F0F2F5] text-[#1A1D1F]' : 'bg-[#020617] text-[#E2E8F0]'
    }`}>
      
      {/* 1. SIDEBAR - No Pure White */}
      <aside className={`hidden lg:flex flex-col w-64 h-screen shrink-0 border-r transition-all duration-300 ${
        isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-[#0F172A] border-white/10'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Logo" className={`h-7 w-7 object-contain ${isLight ? ' opacity-100' : ''}`} 
            />
            <div>
              <h1 className="text-base font-bold tracking-tighter uppercase leading-none">RADIX</h1>
              <p className="text-[8px] font-black text-[#61D9DE] uppercase tracking-widest">Business</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                group relative w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 
                ${isActive 
                  ? (isLight ? 'bg-white  text-[#1A1D1F] ' : 'bg-white/5  text-[#61D9DE]') 
                  : (isLight ? 'border-transparent text-[#9A9FA5] hover:text-[#1A1D1F]' : 'border-transparent text-slate-500 hover:text-white')}
              `}
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive && isLight ? 'text-[#61D9DE]' : ''} />
                  <span className="text-[11px] font-bold tracking-tight">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={`p-4 mt-auto border-t space-y-3 ${isLight ? 'border-[#E8ECEF]' : 'border-white/5'}`}>
          <div className="flex items-center justify-between px-3 py-2 bg-[#61D9DE] rounded-xl">
            <span className={`text-[9px] font-bold uppercase tracking-widest ${isLight ? 'text-[#ffffff]' : 'text-white'}`}>Appearance</span>
            <ThemeToggle />
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-full flex items-center gap-3 px-4 py-3 text-[#9A9FA5] hover:text-red-500 transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className={`h-14 flex items-center justify-between px-8 sticky top-0 z-20 border-b transition-colors duration-300 ${
          isLight ? 'bg-[#F8FAFB]/80 border-[#E8ECEF]' : 'bg-[#0F172A]/80 border-white/10'
        } backdrop-blur-xl`}>
          <h2 className="text-[10px] font-black tracking-[0.2em]">
            <span className={isLight ? 'text-[#1A1D1F]' : 'text-white'}>BUSINESS</span>
            <span className="mx-2 text-[#9A9FA5]">/</span>
            <span className="text-[#61D9DE]">{currentTabName}</span>
          </h2>
          <div className="lg:hidden"><ThemeToggle /></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 no-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet context={{ leads, businessName, updateLeadStatus, theme }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 3. MOBILE NAVIGATION */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 h-16 flex justify-around items-center px-4 z-50 border-t transition-colors duration-300 ${
        isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-[#0F172A] border-white/10'
      }`}>
        {navItems.map((item) => (
          <NavLink 
            key={item.id} to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-[#61D9DE]' : 'text-[#9A9FA5]'}`}
          >
            <item.icon size={20} />
            <span className="text-[8px] font-bold uppercase">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center gap-1 text-red-400">
          <LogOut size={20} />
          <span className="text-[8px] font-bold uppercase">Exit</span>
        </button>
      </nav>

      {/* SIGN OUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`w-full max-w-sm p-8 rounded-2xl shadow-2xl text-center space-y-6 border ${
              isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-[#0F172A] border-white/10'
            }`}>
              <div className="w-14 h-14 bg-red-50 text-red-500 flex items-center justify-center mx-auto rounded-xl border border-red-100">
                <AlertCircle size={28} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-lg font-bold uppercase tracking-tight ${isLight ? 'text-[#1A1D1F]' : 'text-white'}`}>Sign Out</h3>
                <p className="text-xs text-[#9A9FA5] font-medium">Are you sure you want to end your session?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setShowLogoutConfirm(false)} className={`py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border ${isLight ? 'bg-[#F0F2F5] text-[#9A9FA5] border-[#E8ECEF]' : 'bg-white/5 text-slate-400'}`}>Stay</button>
                <button onClick={onLogout} className="py-3 bg-red-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-sm">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessHub;