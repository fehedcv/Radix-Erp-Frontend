import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderEdit, LogOut, 
  AlertCircle, Sun, Moon, Briefcase 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabase/supabaseClient';

const BusinessHubApp = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [businessLogo, setBusinessLogo] = useState(null);
  const location = useLocation();
  const isLight = theme === 'light';

  // SESSION & DATA MANAGEMENT
  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");
  const businessName = currentUser.name || currentUser.businessName || "Business Team";
  const businessAvatar = currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(businessName)}`;

  useEffect(() => {
    const loadBusinessLogo = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser();

        const userId = authData?.user?.id;

        if (!userId) return;

        const { data, error } = await supabase
          .from("business_units")
          .select("logo_url")
          .eq("manager_id", userId)
          .single();

        if (error) {
          console.error("Failed to load logo", error);
          return;
        }

        setBusinessLogo(data?.logo_url || null);

      } catch (err) {
        console.error(err);
      }
    };

    loadBusinessLogo();
  }, []);

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    const allLeads = saved ? JSON.parse(saved) : []; 
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

  // Refined Minimalist Theme Toggle
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
    <div className={`flex h-screen font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-200 ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      {/* 1. DESKTOP SIDEBAR (Bento Style) */}
      <aside className={`hidden lg:flex flex-col w-64 h-screen shrink-0 border-r transition-colors duration-200 ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
      }`}>
        <div className="p-5 flex items-center gap-3 border-b border-transparent">
          <div className={`w-10 h-10 rounded-xl overflow-hidden border flex flex-col items-center justify-center ${isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Radix" 
              className="w-full h-full object-contain"
              
            />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight uppercase leading-none">RADIX</h1>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Business</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                group w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 
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

        <div className={`p-4 mt-auto border-t space-y-3 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Theme</span>
            <ThemeToggle />
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border border-transparent ${
              isLight ? 'text-[#F0524F] hover:bg-[#F0524F]/10 hover:border-[#F0524F]/20' : 'text-[#F0524F] hover:bg-[#F0524F]/10 hover:border-[#F0524F]/20'
            }`}
          >
            <LogOut size={16} strokeWidth={2.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        
        {/* NATIVE APP TOP BAR (With Added Bottom Border & Business Logo) */}
        <header className={`shrink-0 h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-20 border-b transition-colors duration-200 ${
          isLight ? 'bg-[#F4F5F7]/90 backdrop-blur-md border-[#E2E8F0]' : 'bg-[#131720]/90 backdrop-blur-md border-white/10'
        }`}>
          {/* Left Side: Mobile Logo / Desktop Breadcrumbs */}
          <div className="flex items-center gap-1 lg:hidden">
  <div className="w-8 h-[20px] overflow-hidden flex items-center justify-center">
    <img
      src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png"
      alt="Radix"
      className="w-full h-full object-contain"
    />
  </div>

  <h2 className="text-2xl font-extrabold tracking-tight">
    Radix
  </h2>
</div>
          
          <h2 className="hidden lg:flex items-center text-[10px] font-bold uppercase tracking-wider">
            <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>BUSINESS</span>
            <span className="mx-2 text-[#E2E8F0] dark:text-white/10">/</span>
            <span className="text-[#81B398]">{currentTabName}</span>
          </h2>
          
          {/* Right Side: Business Profile & Theme Toggle */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:block text-right">
                <p className={`text-xs font-extrabold tracking-tight leading-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                  {businessName}
                </p>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Business Profile
                </p>
              </div>
              <div className={`w-9 h-9 rounded-full overflow-hidden border shrink-0 ${isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                <img 
                  src={businessLogo || businessAvatar} 
                  alt="Business Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:hidden">
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* CONTENT SCROLL VIEW */}
        <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8 no-scrollbar">
          <div className="max-w-[1200px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Outlet context={{ leads, businessName, businessLogo, updateLeadStatus, theme }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className={`lg:hidden fixed bottom-0 left-0 w-full h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] flex justify-around items-center px-2 z-50 border-t transition-colors duration-200 ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
      }`}>
        {navItems.map((item) => (
          <NavLink 
            key={item.id} to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-[#81B398]' : (isLight ? 'text-[#718096]' : 'text-[#9CA3AF]')
            }`}
          >
            <item.icon size={20} strokeWidth={2.5} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <button 
          onClick={() => setShowLogoutConfirm(true)} 
          className={`flex flex-col items-center gap-1 transition-colors ${isLight ? 'text-[#F0524F]' : 'text-[#F0524F]'}`}
        >
          <LogOut size={20} strokeWidth={2.5} />
          <span className="text-[9px] font-bold uppercase tracking-wider">Exit</span>
        </button>
      </nav>

      {/* SIGN OUT MODAL (Bento Style) */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-sm p-8 rounded-3xl shadow-sm text-center border ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}
            >
              <div className="w-16 h-16 bg-[#F0524F]/10 text-[#F0524F] flex items-center justify-center mx-auto mb-6 rounded-2xl border border-[#F0524F]/20">
                <AlertCircle size={32} strokeWidth={2.5} />
              </div>
              
              <h3 className={`text-xl font-extrabold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                Sign Out
              </h3>
              <p className={`text-sm font-medium mb-8 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Are you sure you want to end your session?
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
                  className="flex-[1.5] py-3.5 bg-[#F0524F] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#F0524F]/20 transition-all duration-200 active:scale-95 hover:bg-[#D94A48]"
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

export default BusinessHubApp;