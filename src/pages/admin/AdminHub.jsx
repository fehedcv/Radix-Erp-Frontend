import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, 
  CreditCard, PieChart, LogOut,
  AlertCircle, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminHub = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // --- NAVIGATION DATA ---
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'leads', label: 'Inquiries', icon: PieChart, path: '/admin/leads' },
    { id: 'units', label: 'Businesses', icon: Building2, path: '/admin/units' },
    { id: 'agents', label: 'Agents', icon: Users, path: '/admin/agents' },
    { id: 'credits', label: 'Payments', icon: CreditCard, path: '/admin/credits' },
  ];

  const currentTab = menuItems.find(item => location.pathname.startsWith(item.path));
  const currentTabName = currentTab?.label || "Dashboard";

  // --- THEME TOGGLE UI ---
  const ThemeToggle = () => (
    <div 
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 flex items-center px-1 border ${
        isLight ? 'bg-black/10 border-transparent' : 'bg-black/20 border-white/10'
      }`}
    >
      <motion.div 
        animate={{ x: isLight ? 0 : 22 }}
        className={`w-4 h-4 rounded-full flex items-center justify-center bg-[#FFFFFF]`}
      >
        {isLight ? <Sun size={10} className="text-[#DAC18A]" /> : <Moon size={10} className="text-[#81B398]" />}
      </motion.div>
    </div>
  );

  return (
    <div className={`flex h-screen font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-300 ${
      isLight ? 'bg-[#475569]' : 'bg-[#0F172A]' 
    }`}>
      
      {/* 1. FIXED DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-[260px] h-screen shrink-0 transition-all duration-300">
        
        {/* BRANDING */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Logo" className="h-8 w-8 object-contain opacity-100" 
            />
            <div>
              <h1 className="text-[17px] font-extrabold tracking-tight leading-none text-[#FFFFFF]">Radix</h1>
              <p className="text-[9px] font-bold text-[#81B398] uppercase tracking-widest mt-1">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                group relative w-full flex items-center px-4 py-3.5 rounded-md transition-all duration-200 
                ${isActive 
                  ? 'bg-white/10 text-[#FFFFFF] font-bold' 
                  : 'bg-transparent text-slate-300 hover:bg-white/5 hover:text-[#FFFFFF] font-medium'}
              `}
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#81B398]' : 'text-inherit opacity-70 group-hover:opacity-100'} />
                  <span className="text-sm tracking-tight">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 mt-auto space-y-2">
          <div className="flex items-center justify-between px-4 py-3 rounded-md bg-white/5 border border-white/5">
            <span className="text-xs font-medium text-slate-300">Theme</span>
            <ThemeToggle />
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-full flex items-center gap-3 px-4 py-3.5 transition-all rounded-md text-sm font-medium text-slate-300 hover:text-[#F0524F] hover:bg-[#F0524F]/10 border border-transparent"
          >
            <LogOut size={18} strokeWidth={2} className="opacity-70" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA (Floating Rounded Card) */}
      <main className={`flex-1 flex flex-col min-w-0 h-screen lg:h-[calc(100vh-24px)] lg:my-3 lg:mr-3 lg:rounded-xl  overflow-hidden relative transition-colors duration-300 ${
        isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
      }`}>
        
        {/* Mobile Header */}
        <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors duration-300 ${
          isLight ? 'bg-[#F4F5F7]/90' : 'bg-[#131720]/90'
        } backdrop-blur-xl lg:hidden`}>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Admin</span>
            <span className={`text-xs ${isLight ? 'text-[#E2E8F0]' : 'text-white/20'}`}>/</span>
            <span className="text-sm font-bold tracking-tight text-[#81B398]">{currentTabName}</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-10 pb-24 lg:pb-10 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <AnimatePresence mode="wait">
              <motion.div 
                key={location.pathname} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 h-[72px] flex justify-around items-center px-2 z-50 border-t transition-colors duration-300 pb-safe ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'
      }`}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink 
              key={item.id} to={item.path} 
              className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
                isActive ? 'text-[#81B398]' : (isLight ? 'text-[#718096]' : 'text-[#9CA3AF]')
              }`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-semibold ${isActive ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
        <button 
          onClick={() => setShowLogoutConfirm(true)} 
          className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
            isLight ? 'text-[#718096] hover:text-[#F0524F]' : 'text-[#9CA3AF] hover:text-[#F0524F]'
          }`}
        >
          <LogOut size={22} strokeWidth={2} />
          <span className="text-[10px] font-semibold opacity-0">Exit</span>
        </button>
      </nav>

      {/* SIGN OUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className={`w-full max-w-[340px] p-8 rounded-md text-center border transition-all ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'
              }`}
            >
              <div className={`w-14 h-14 flex items-center justify-center mx-auto rounded-md mb-5 ${
                isLight ? 'bg-[#F0524F]/10 text-[#F0524F]' : 'bg-[#F0524F]/20 text-[#F0524F]'
              }`}>
                <AlertCircle size={28} />
              </div>
              <div className="space-y-2 mb-8">
                <h3 className={`text-lg font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Sign Out</h3>
                <p className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Are you sure you want to end your session?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  className={`py-2.5 rounded-md text-sm font-semibold transition-all border ${
                    isLight ? 'bg-[#F4F5F7] text-[#1A202C] border-[#E2E8F0] hover:bg-[#E2E8F0]' : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:bg-[#1A202C]'
                  }`}
                >
                  Stay
                </button>
                <button 
                  onClick={onLogout} 
                  className="py-2.5 bg-[#F0524F] text-[#FFFFFF] rounded-md text-sm font-semibold hover:bg-[#D44846] transition-all"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHub;