import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, 
  CreditCard, PieChart, LogOut, Sun, Moon,
  AlertCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const AdminHubApp = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'leads', label: 'Inquiries', icon: PieChart, path: '/admin/leads' },
    { id: 'units', label: 'Businesses', icon: Building2, path: '/admin/units' },
    { id: 'agents', label: 'Agents', icon: Users, path: '/admin/agents' },
    { id: 'credits', label: 'Payments', icon: CreditCard, path: '/admin/credits' },
  ];

  const currentTab = menuItems.find(item => location.pathname.startsWith(item.path));
  const currentTabName = currentTab?.label || "Dashboard";

  // Minimalist Theme Toggle
  const ThemeToggle = () => (
    <button 
      onClick={toggleTheme}
      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border ${
        isLight 
          ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398]' 
          : 'bg-[#222938] border-white/10 text-[#F4F5F7] hover:border-[#81B398]'
      }`}
    >
      {isLight ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
    </button>
  );

  return (
    <div className={`flex h-[100dvh] font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      {/* 1. FIXED DESKTOP SIDEBAR */}
      <aside className={`hidden lg:flex flex-col w-64 h-[100dvh] shrink-0 border-r transition-colors duration-200 ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
      }`}>
        
        {/* BRANDING */}
        <div className="p-5 flex items-center gap-3 border-b border-transparent">
          <div className={`w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center p-0.5 ${
            isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Logo" className="w-full h-full object-contain" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div class="font-extrabold text-sm text-[#81B398]">R</div>';
              }}
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight uppercase leading-none">RADIX</h1>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Admin Portal</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                group w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 
                ${isActive 
                  ? (isLight ? 'bg-[#F4F5F7] text-[#1A202C] font-extrabold' : 'bg-[#222938] text-[#F4F5F7] font-extrabold') 
                  : (isLight ? 'bg-transparent text-[#718096] font-bold hover:bg-[#F4F5F7]' : 'bg-transparent text-[#9CA3AF] font-bold hover:bg-[#222938]')
                }
              `}
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <item.icon size={18} strokeWidth={2.5} className={isActive ? 'text-[#81B398]' : ''} />
                  <span className="text-[11px] uppercase tracking-wider">{item.label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER AREA */}
        <div className={`p-4 mt-auto border-t space-y-3 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Theme</span>
            <ThemeToggle />
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border border-transparent ${
              isLight ? 'text-[#F0524F] hover:bg-[#F0524F]/10 hover:border-[#F0524F]/20' : 'text-[#F0524F] hover:bg-[#F0524F]/10 hover:border-[#F0524F]/20'
            }`}
          >
            <LogOut size={16} strokeWidth={2.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-[100dvh] overflow-hidden relative">
        
        {/* NATIVE APP TOP BAR (Added Bottom Border) */}
        <header className={`shrink-0 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 border-b transition-colors duration-200 ${
          isLight ? 'bg-[#F4F5F7]/90 backdrop-blur-md border-[#E2E8F0]' : 'bg-[#131720]/90 backdrop-blur-md border-white/10'
        }`}>
          
          {/* Mobile Logo & Title */}
          <div className="flex items-center gap-1 lg:hidden">
            <div className={`w-8 h-8 rounded-lg overflow-hidden  flex items-center justify-center p-0.5 `}>
              <img 
                src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
                alt="Radix" 
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div class="font-extrabold text-sm text-[#81B398]">R</div>';
                }}
              />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Radix</h2>
          </div>

          {/* Desktop Breadcrumb */}
          <h2 className="hidden lg:flex items-center text-[10px] font-bold uppercase tracking-wider">
            <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>ADMIN</span>
            <span className="mx-2 text-[#E2E8F0] dark:text-white/10">/</span>
            <span className="text-[#81B398]">{currentTabName}</span>
          </h2>
          
          {/* Top Right Actions (Theme & Logout for Mobile) */}
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <ThemeToggle />
            </div>
            <button 
              onClick={() => setShowLogoutConfirm(true)} 
              className={`lg:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#F0524F]' : 'bg-[#222938] border-white/10 text-[#F0524F]'
              }`}
            >
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* NATIVE SCROLL VIEW */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:px-8 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8 no-scrollbar">
           <div className="max-w-[1200px] w-full mx-auto">
             <Outlet />
           </div>
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION (Sign Out Moved to Top) */}
      <nav className={`lg:hidden fixed bottom-0 left-0 w-full h-[calc(4.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] flex justify-around items-center px-2 z-50 border-t transition-colors duration-200 ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
      }`}>
        {menuItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-[#81B398]' : (isLight ? 'text-[#718096]' : 'text-[#9CA3AF]')
            }`}
          >
            <item.icon size={20} strokeWidth={2.5} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </nav>

      {/* SIGN OUT MODAL (Bento Style) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-sm p-8 rounded-3xl shadow-sm text-center border animate-in fade-in zoom-in-95 duration-200 ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <div className="w-16 h-16 bg-[#F0524F]/10 text-[#F0524F] flex items-center justify-center mx-auto mb-6 rounded-2xl border border-[#F0524F]/20">
              <AlertCircle size={32} strokeWidth={2.5} />
            </div>
            
            <h3 className={`text-xl font-extrabold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
              Sign Out
            </h3>
            <p className={`text-sm font-medium mb-8 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              Are you sure you want to end your admin session?
            </p>
            
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 border ${
                  isLight 
                    ? 'bg-[#F4F5F7] text-[#1A202C] border-transparent hover:border-[#E2E8F0]' 
                    : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:border-white/10'
                }`}
              >
                Stay
              </button>
              <button 
                onClick={onLogout} 
                className="flex-[1.5] py-3.5 bg-[#F0524F] text-white rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 hover:bg-[#D94A48]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHubApp;