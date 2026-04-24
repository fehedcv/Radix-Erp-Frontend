import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Building2, Wallet, User, Plus, 
  LogOut, History, AlertCircle, Sun, Moon 
} from 'lucide-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import frappeApi from '../../api/frappeApi';
import { useTheme } from '../../context/ThemeContext';
import LeadFormModal from './LeadFormModal';
import { initialLeads } from '../../data/leadHistoryData';

const AgentHub = ({ onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [businessUnits, setBusinessUnits] = useState({});
  const [isAppLoading, setIsAppLoading] = useState(true); 
  
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [leads, setLeads] = useState(() => {
    const savedLeads = localStorage.getItem('vynx_leads');
    return savedLeads ? JSON.parse(savedLeads) : initialLeads;
  });

  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");

  useEffect(() => {
    const fetchBusinessUnits = async () => {
      try {
        const response = await frappeApi.get('/resource/Business Unit', {
          params: {
            fields: '["name", "category", "services.service_name", "services.name"]',
            limit_page_length: 100
          }
        });

        const grouped = {};
        (response.data.data || []).forEach(item => {
          const cat = item.category;
          const svc = item.service_name;
          if (!cat) return;
          if (!grouped[cat]) grouped[cat] = [];
          if (svc && !grouped[cat].includes(svc)) {
            grouped[cat].push(svc);
          }
        });

        setBusinessUnits(grouped);
      } catch (error) {
        console.error("Failed to fetch business units", error);
      } finally {
        setTimeout(() => setIsAppLoading(false), 600); 
      }
    };

    fetchBusinessUnits();

    const handleSync = () => {
      const saved = localStorage.getItem('vynx_leads');
      if (saved) setLeads(JSON.parse(saved));
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const handleLeadSubmitted = () => {
    setIsModalOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/agent/dashboard' },
    { id: 'units', label: 'Businesses', icon: Building2, path: '/agent/units' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/agent/wallet' },
    { id: 'history', label: 'Leads', icon: History, path: '/agent/history' },
    { id: 'profile', label: 'Profile', icon: User, path: '/agent/profile' },
  ];

  const myLeads = leads.filter(l => l.agentId === currentUser.id);

  const ThemeToggle = () => (
    <div 
      onClick={toggleTheme}
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-300 flex items-center px-1 ${
        theme === 'light' ? 'bg-[#E2E8F0]' : 'bg-[#222938]'
      }`}
    >
      <motion.div 
        animate={{ x: theme === 'light' ? 0 : 20 }}
        className={`w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
          theme === 'light' ? 'bg-[#FFFFFF]' : 'bg-[#131720]'
        }`}
      >
        {theme === 'light' ? <Sun size={10} className="text-[#DAC18A]" /> : <Moon size={10} className="text-[#F4F5F7]" />}
      </motion.div>
    </div>
  );

  return (
    <div className={`flex h-screen font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#5B6777]' : 'bg-[#131720]'
    }`}>
      
      {/* 1. DESKTOP SIDEBAR - Content sizes reduced to prevent scrolling */}
      <aside className={`hidden lg:flex flex-col w-[260px] h-screen shrink-0 relative transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#5B6777]' : 'bg-[#1A202C]'
      }`}>
        
        {/* Logo Area */}
        <div className="p-5 pt-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-[#81B398] flex items-center justify-center shadow-sm">
             <span className="text-[#FFFFFF] font-bold text-[16px]">R</span>
          </div>
          <div>
            <h1 className="text-[16px] font-semibold tracking-tight text-[#FFFFFF] leading-tight">Radix</h1>
            <p className="text-[10px] font-medium text-[#DAC18A] tracking-[0.025em]">Partner Hub</p>
          </div>
        </div>

        {/* Profile Area */}
        <div className="px-5 mb-5 mt-2">
          {isAppLoading ? (
            <div className="flex flex-col items-center animate-pulse">
               <div className={`w-16 h-16 rounded-full mb-3 ${theme === 'light' ? 'bg-[#F4F5F7]/20' : 'bg-[#222938]'}`} />
               <div className={`h-3 w-28 rounded-md mb-2 ${theme === 'light' ? 'bg-[#F4F5F7]/20' : 'bg-[#222938]'}`} />
               <div className={`h-2 w-20 rounded-md ${theme === 'light' ? 'bg-[#F4F5F7]/20' : 'bg-[#222938]'}`} />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-[1.5px] border-[#81B398] shadow-sm mb-2.5 relative">
                <img 
                  src={currentUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Shahad&backgroundColor=F4F5F7"} 
                  alt="Profile" 
                  className="w-full h-full object-cover bg-white"
                />
              </div>
              <h2 className="text-[15px] font-semibold text-[#FFFFFF] tracking-tight leading-tight">
                {currentUser.name || "Muhammed Shahad T."}
              </h2>
              <p className="text-[12px] font-normal text-[#9CA3AF] mt-0.5">
                {currentUser.role || "Lead Developer"}
              </p>
            </div>
          )}
        </div>

        {/* Navigation - Strict layout without overflow to prevent scrolling */}
        <div className="px-3 flex-1 flex flex-col justify-center">
          <nav className="space-y-1">
            {isAppLoading ? (
               <div className="space-y-1.5 animate-pulse px-2">
                 {[1,2,3,4].map(i => <div key={i} className={`h-9 w-full rounded-md ${theme === 'light' ? 'bg-[#F4F5F7]/10' : 'bg-[#222938]'}`} />)}
               </div>
            ) : (
              navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all duration-200 ${
                    isActive 
                      ? 'text-[#FFFFFF] font-medium bg-[#48477A]/20' 
                      : 'text-[#9CA3AF] font-normal hover:text-[#FFFFFF] hover:bg-[#F4F5F7]/5'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={16} className={isActive ? "text-[#81B398]" : "text-[#9CA3AF] group-hover:text-[#FFFFFF] transition-colors"} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))
            )}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="p-4 pb-6 space-y-2 shrink-0">
          <div className={`flex items-center justify-between px-3 py-2.5 rounded-md ${theme === 'light' ? 'bg-[#F4F5F7]/5' : 'bg-[#131720]/50'}`}>
            <span className="text-[11px] font-medium tracking-[0.025em] text-[#9CA3AF]">Theme</span>
            <ThemeToggle />
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-[13px] font-medium text-[#9CA3AF] hover:text-[#F0524F] hover:bg-[#F0524F]/10 transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN CANVAS AREA */}
      <main className={`flex-1 flex flex-col min-w-0 h-screen lg:py-3 lg:pr-3 overflow-hidden relative z-10 transition-colors duration-300`}>
        <div className={`w-full h-full flex flex-col relative overflow-hidden transition-colors duration-300 ${
          theme === 'light' ? 'bg-[#F4F5F7] lg:rounded-xl shadow-lg' : 'bg-[#131720] lg:rounded-xl shadow-2xl lg:border border-white/5'
        }`}>
          
          {/* MOBILE HEADER (Matches Screenshot) */}
          <header className={`lg:hidden flex items-center justify-between px-4 pt-6 pb-4 z-20 transition-colors duration-300 ${
            theme === 'light' ? 'bg-[#F4F5F7]' : 'bg-[#131720]'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#81B398] to-[#6FA085] flex items-center justify-center shadow-md">
                 <span className="text-[#FFFFFF] font-bold text-xl">R</span>
              </div>
              <div className="flex flex-col justify-center">
                <span className={`text-[10px] font-semibold tracking-[0.1em] uppercase ${theme === 'light' ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Welcome Back
                </span>
                <span className={`text-[16px] font-bold tracking-tight uppercase leading-tight ${theme === 'light' ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                  {currentUser.name?.split(' ')[0] || "Agent"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <ThemeToggle />
               <button 
                 onClick={() => setShowLogoutConfirm(true)}
                 className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                   theme === 'light' ? 'bg-[#F0524F]/10 text-[#F0524F]' : 'bg-[#F0524F]/20 text-[#F0524F]'
                 }`}
               >
                 <LogOut size={16} strokeWidth={2.5} />
               </button>
            </div>
          </header>

          {/* DESKTOP HEADER (Minimal) */}
          <header className={`hidden lg:flex h-16 shrink-0 items-center justify-end px-8 border-b z-20 ${
            theme === 'light' ? 'border-[#E2E8F0] bg-[#FFFFFF]' : 'border-[#222938] bg-[#131720]'
          }`}>
            <button 
              onClick={() => { setSelectedBusiness(""); setIsModalOpen(true); }} 
              className="px-4 py-2 flex items-center gap-2 text-[13px] font-medium rounded-md bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} /> 
              <span>New Lead</span>
            </button>
          </header>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-28 lg:pb-0 relative">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8">
              {isAppLoading ? (
                 <div className="w-full space-y-6">
                   <div className={`h-8 w-48 rounded-md animate-pulse ${theme === 'light' ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {[1,2,3].map(i => (
                       <div key={i} className={`h-32 rounded-lg animate-pulse ${theme === 'light' ? 'bg-[#FFFFFF]' : 'bg-[#222938]'}`} />
                     ))}
                   </div>
                 </div>
              ) : (
                <motion.div 
                  key={`${location.pathname}-${theme}`} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ duration: 0.3 }}
                >
                  <Outlet context={{ myLeads, setIsModalOpen, setSelectedBusiness, currentUser, theme, isAppLoading }} />
                </motion.div>
              )}
            </div>
          </div>
          
          {/* MOBILE FLOATING ACTION BUTTON (New Lead) */}
          <button 
            onClick={() => { setSelectedBusiness(""); setIsModalOpen(true); }}
            className={`lg:hidden fixed bottom-[90px] right-5 w-14 h-14 rounded-full flex items-center justify-center z-40 shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-90 transition-all ${
              theme === 'light' ? 'bg-[#1A202C] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#131720]'
            }`}
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>

        </div>
      </main>

      {/* 3. MOBILE NATIVE ICON-ONLY BOTTOM NAV */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-safe pt-2 h-[72px] rounded-t-[24px] transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#FFFFFF] shadow-[0_-10px_40px_rgba(0,0,0,0.06)]' : 'bg-[#1A202C] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
      }`}>
        {navItems.map((item) => {
          const isActive = location.pathname.includes(item.path);
          return (
            <NavLink 
              key={item.id}
              to={item.path} 
              className="flex flex-col items-center justify-center w-14 h-14 relative"
            >
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`transition-colors duration-300 ${
                  isActive 
                    ? (theme === 'light' ? 'text-[#1A202C]' : 'text-[#FFFFFF]') 
                    : 'text-[#718096]'
                }`} 
              />
              {/* Animated Active Dot Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="mobile-nav-dot"
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[#1A202C]' : 'bg-[#FFFFFF]'}`}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* 4. MINIMALIST SIGN OUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className={`w-full max-w-[320px] rounded-2xl p-6 shadow-2xl transition-colors duration-300 ${
                theme === 'light' ? 'bg-[#FFFFFF]' : 'bg-[#1A202C]'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#F0524F]/10 flex items-center justify-center text-[#F0524F]">
                  <AlertCircle size={20} strokeWidth={2.5} />
                </div>
                <h3 className={`text-[18px] font-semibold tracking-tight ${theme === 'light' ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                  Log out
                </h3>
              </div>
              
              <p className={`text-[13px] font-normal mb-6 leading-relaxed ${theme === 'light' ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Are you sure you want to end your current session? You will need to log back in to access your data.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    theme === 'light' ? 'bg-[#F4F5F7] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#222938] text-[#F4F5F7] hover:bg-[#131720]'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={onLogout} 
                  className="px-4 py-2 bg-[#F0524F] text-[#FFFFFF] text-[13px] font-medium rounded-lg transition-colors hover:bg-[#D44846] shadow-md shadow-[#F0524F]/20"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logic Untouched: Lead Form Modal */}
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleLeadSubmitted}
        businessUnits={businessUnits}
        initialUnit={selectedBusiness} 
        theme={theme}
      />

    </div>
  );
};

export default AgentHub;