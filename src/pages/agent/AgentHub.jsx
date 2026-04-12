import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Wallet, User, Plus, 
  LogOut, Briefcase, History, AlertCircle, 
  ShieldCheck, Activity, Bell, Clock, Sun, Moon 
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';
import { useTheme } from '../../context/ThemeContext';

// Lead Modal Import
import LeadFormModal from './LeadFormModal';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';

const AgentHub = ({ onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [businessUnits, setBusinessUnits] = useState({});
  
  // Theme State from Context
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

  // Theme Toggle Component
  const ThemeToggle = () => (
    <div 
      onClick={toggleTheme}
      className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-300 flex items-center px-1 ${
        theme === 'light' ? 'bg-slate-300' : 'bg-slate-700'
      }`}
    >
      <motion.div 
        animate={{ x: theme === 'light' ? 0 : 24 }}
        className={`w-4 h-4 rounded-full flex items-center justify-center shadow-sm ${
          theme === 'light' ? 'bg-[#F8FAFC]' : 'bg-slate-900'
        }`}
      >
        {theme === 'light' ? <Sun size={10} className="text-orange-500" /> : <Moon size={10} className="text-blue-400" />}
      </motion.div>
    </div>
  );

  return (
    <div className={`flex h-screen font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden relative transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#F8FAFC] text-[#1E293B]' : 'bg-[#020617] text-[#E2E8F0]'
    }`}>
      
      {/* --- GLOBAL AMBIENT BACKGROUND BLOBS (Hidden in Light Mode) --- */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[-5%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-lime-400/10 blur-[120px] pointer-events-none z-0" />
          <div className="fixed top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#38BDF8]/10 blur-[130px] pointer-events-none z-0" />
          <div className="fixed bottom-[-10%] left-[20%] w-[35vw] h-[35vw] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none z-0" />
        </>
      )}

      {/* 1. SIDEBAR */}
      <aside className={`hidden lg:flex flex-col w-64 h-screen sticky top-0 z-30 shrink-0 border-r transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10'
      }`}>
        <div className="p-6 pb-4">
          <div className="flex items-center gap-2">
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Radix Logo" 
              className={`h-8 w-8 object-contain shrink-0 ${theme === 'light' ? '' : ''}`} 
            />
            <div>
              <h1 className={`text-lg font-bold tracking-tighter leading-none uppercase ${theme === 'light' ? 'text-slate-800' : 'text-[#E2E8F0]'}`}>RADIX</h1>
              <p className="text-[8px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#4ADE80] uppercase tracking-wider">Partner</p>
            </div>
          </div>
        </div>

        <div className="px-3 py-6 flex-1 overflow-y-auto no-scrollbar">
          <nav className="space-y-1 relative">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `group relative flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                    ? (theme === 'light' ? 'text-[#38BDF8] bg-slate-200/50' : 'text-[#38BDF8] bg-white/5 border-white/5') 
                    : (theme === 'light' ? 'text-slate-500 border-transparent hover:bg-slate-200/30 hover:text-slate-900' : 'text-[#94A3B8] border border-transparent hover:bg-white/5 hover:text-[#E2E8F0]')
                }`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className={`absolute right-0 w-1 h-5 rounded-l-full ${
                          theme === 'light' ? 'bg-[#38BDF8]' : 'bg-[#38BDF8] shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                        }`}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Theme Toggle & Logout Section */}
        <div className={`p-5 space-y-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
          <div className="flex items-center justify-between px-4 py-2 bg-slate-400/5 rounded-lg">
            <span className={`text-[9px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
              Appearance
            </span>
            <ThemeToggle />
          </div>
          
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className={`group flex items-center border border-transparent rounded-xl gap-3 w-full px-4 py-3 transition-all uppercase font-bold text-[9px] tracking-[0.2em] ${
              theme === 'light' ? 'text-slate-500 hover:bg-red-50 hover:text-red-500' : 'text-[#94A3B8] hover:bg-white/5 hover:text-[#EF4444]'
            }`}
          >
            <LogOut size={14} /> Log Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative no-scrollbar z-10 bg-transparent">
        
        <header className={`h-16 w-full sticky top-0 z-[100] flex items-center justify-between lg:justify-end px-6 lg:px-10 border-b transition-colors duration-300 backdrop-blur-3xl ${
          theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]'
        }`}>
          
          {/* Mobile Theme Toggle (Visible only on small screens) */}
          <div className="lg:hidden flex items-center gap-3">
             <ThemeToggle />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setSelectedBusiness(""); setIsModalOpen(true); }} 
              className={`px-5 py-2.5 transition-all flex items-center gap-2 text-[9px] font-black uppercase tracking-widest rounded-xl border shadow-lg active:scale-95 group ${
                theme === 'light' 
                ? 'bg-[#1E293B] text-white border-transparent hover:bg-slate-800' 
                : 'bg-white/5 text-[#E2E8F0] border-white/10 hover:bg-white/10 hover:border-[#38BDF8]/40'
              }`}
            >
              <Plus size={14} strokeWidth={3} className="text-[#38BDF8] group-hover:rotate-90 transition-transform duration-300" /> 
              <span>New Lead</span>
            </button>
          </div>
        </header>

        <div className="w-full flex-1 overflow-x-hidden relative">
          <div className="max-w-[1400px] mx-auto p-4 lg:p-6 relative z-10">
            <motion.div 
              key={`${location.pathname}-${theme}`} 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 0.3 }}
              className="w-full origin-top"
            >
              <Outlet context={{ myLeads, setIsModalOpen, setSelectedBusiness, currentUser, theme }} />
            </motion.div>
          </div>
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 border-t flex justify-between items-center px-2 py-3 z-50 transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]' : 'bg-[#0F172A]/60 backdrop-blur-3xl border-white/10'
      }`}>
        {navItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 transition-colors ${
              isActive 
                ? 'text-[#38BDF8] drop-shadow-[0_0_5px_rgba(56,189,248,0.3)]' 
                : (theme === 'light' ? 'text-slate-500' : 'text-[#64748B]')
            }`}
          >
            {({ isActive }) => (
               <>
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[7px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
               </>
            )}
          </NavLink>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex-1 flex flex-col items-center gap-1 text-[#EF4444]">
           <LogOut size={18} />
           <span className="text-[7px] font-black uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

      {/* 4. SIGN OUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className={`fixed inset-0 z-[500] flex items-center justify-center p-6 backdrop-blur-md ${
            theme === 'light' ? 'bg-slate-900/10' : 'bg-[#020617]/80'
          }`}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.98 }} 
              className={`w-full max-w-xs rounded-xl p-8 shadow-2xl text-center space-y-6 border transition-colors duration-300 ${
                theme === 'light' ? 'bg-[#F8FAFC] border-slate-200' : 'bg-[#0F172A]/80 backdrop-blur-3xl border-white/10'
              }`}
            >
              <div className="w-12 h-12 bg-[#EF4444]/10 text-[#EF4444] rounded-xl flex items-center justify-center mx-auto border border-[#EF4444]/20">
                <AlertCircle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className={`text-base font-bold uppercase tracking-tight ${theme === 'light' ? 'text-slate-800' : 'text-[#E2E8F0]'}`}>Log out?</h3>
                <p className={`text-xs font-medium leading-relaxed px-4 ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>Are you sure you want to leave the dashboard?</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  className={`py-3 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                    theme === 'light' ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200' : 'bg-white/5 text-[#94A3B8] border-white/10 hover:bg-white/10'
                  }`}
                >
                  Cancel
                </button>
                <button onClick={onLogout} className="py-3 bg-[#EF4444]/20 text-[#EF4444] text-[9px] font-black uppercase tracking-widest rounded-xl border border-[#EF4444]/40 transition-all hover:bg-[#EF4444]/30">
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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