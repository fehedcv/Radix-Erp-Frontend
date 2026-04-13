import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  Building2, Wallet, User, Plus, 
  LogOut, History, AlertCircle, 
  LayoutDashboard, Sun, Moon 
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';
import { useTheme } from '../../context/ThemeContext';

// Lead Modal Import
import LeadFormModal from './LeadFormModal';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';
import LeadFormAppModal from './LeadFormModalApp';

const AgentHubApp = ({ onLogout }) => {
  // ==========================================
  // EXACT SAME LOGIC & STATE AS WEB VERSION
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [businessUnits, setBusinessUnits] = useState({});
  
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
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard, path: '/agent/dashboard' },
    { id: 'units', label: 'Units', icon: Building2, path: '/agent/units' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/agent/wallet' },
    { id: 'history', label: 'Leads', icon: History, path: '/agent/history' },
    { id: 'profile', label: 'Profile', icon: User, path: '/agent/profile' },
  ];

  const myLeads = leads.filter(l => l.agentId === currentUser.id);

  // ==========================================
  // CAPACITOR NATIVE UI/UX DESIGN SYSTEM
  // ==========================================
  return (
    <div className={`flex flex-col h-screen w-full font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden relative transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#F4F5F9] text-black' : 'bg-[#09090B] text-white'
    }`}>
      
      {/* Ambient Dark Mode Background */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[-5%] left-[-5%] w-[45vw] h-[45vw] rounded-full bg-lime-400/10 blur-[100px] pointer-events-none z-0" />
          <div className="fixed top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none z-0" />
        </>
      )}

      {/* NATIVE APP BAR (Top) */}
 {/* NATIVE APP BAR (Top) */}
      <header className="flex items-center  justify-between px-6 pt-12 pb-4 z-50 bg-transparent shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-7 rounded-full flex items-center justify-center  ${theme === 'light' ? '' : ''}`}>
             <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Welcome Back</span>
            <span className="text-sm font-extrabold tracking-tight uppercase leading-none">
              {currentUser.name || 'Agent'}
            </span>
          </div>
        </div>
        
        {/* Top Right Controls Container */}
        <div className="flex items-center gap-3">
          {/* Modern Pill Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className={`w-14 h-8 rounded-full p-1 flex items-center transition-colors duration-300 shadow-sm ${
              theme === 'light' ? 'bg-white' : 'bg-white/10'
            }`}
          >
            <motion.div 
              animate={{ x: theme === 'light' ? 0 : 24 }}
              className={`w-6 h-6 rounded-full flex items-center justify-center ${
                theme === 'light' ? 'bg-[#F4F5F9] shadow-inner' : 'bg-[#09090B]'
              }`}
            >
              {theme === 'light' ? <Sun size={12} className="text-black" /> : <Moon size={12} className="text-white" />}
            </motion.div>
          </button>

          {/* THE MISSING LOGOUT BUTTON */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 shadow-sm ${
              theme === 'light' 
                ? 'bg-white text-red-500 active:bg-red-50' 
                : 'bg-white/10 text-red-400 active:bg-white/20'
            }`}
          >
            <LogOut size={14} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* SCROLLABLE MAIN CONTENT */}
      <main className="flex-1 w-full overflow-y-auto no-scrollbar relative z-10 px-4 pb-32">
        <motion.div 
          key={`${location.pathname}-${theme}`} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <Outlet context={{ myLeads, setIsModalOpen, setSelectedBusiness, currentUser, theme }} />
        </motion.div>
      </main>

      {/* FLOATING ACTION BUTTON (Native Android Style) */}
      <div className="fixed bottom-28 right-6 z-[60]">
        <button 
          onClick={() => { setSelectedBusiness(""); setIsModalOpen(true); }} 
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.2)] active:scale-90 transition-all ${
            theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
          }`}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </div>

      {/* BENTO-STYLE BOTTOM NAVIGATION */}
      <nav className={`fixed bottom-0 left-0 right-0 z-50 px-6 py-5 pb-8 rounded-t-[2rem] flex justify-between items-center transition-colors duration-300 ${
        theme === 'light' 
          ? 'bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)]' 
          : 'bg-[#18181B] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-white/5'
      }`}>
        {navItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `relative flex flex-col items-center justify-center w-12 h-12 transition-all ${
              isActive 
                ? (theme === 'light' ? 'text-black' : 'text-white') 
                : (theme === 'light' ? 'text-gray-400' : 'text-gray-500')
            }`}
          >
            {({ isActive }) => (
               <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'mb-1' : ''} />
                {isActive && (
                  <motion.div 
                    layoutId="nav-indicator"
                    className={`absolute bottom-0 w-1 h-1 rounded-full ${theme === 'light' ? 'bg-black' : 'bg-white'}`}
                  />
                )}
               </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* NATIVE-STYLE LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className={`w-full max-w-sm rounded-[2rem] p-8 text-center space-y-6 shadow-2xl ${
                theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${theme === 'light' ? 'bg-gray-100' : 'bg-white/5'}`}>
                <AlertCircle size={32} className={theme === 'light' ? 'text-black' : 'text-white'} />
              </div>
              
              <div>
                <h3 className={`text-xl font-black uppercase tracking-tight ${theme === 'light' ? 'text-black' : 'text-white'}`}>Sign Out</h3>
                <p className={`text-sm mt-2 font-medium ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                  Are you sure you want to end your session?
                </p>
              </div>
              
              <div className="flex flex-col gap-3 mt-4">
                <button 
                  onClick={onLogout} 
                  className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    theme === 'light' ? 'bg-black text-white active:bg-gray-800' : 'bg-white text-black active:bg-gray-200'
                  }`}
                >
                  Confirm Exit
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)} 
                  className={`w-full py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    theme === 'light' ? 'bg-gray-100 text-black active:bg-gray-200' : 'bg-white/10 text-white active:bg-white/20'
                  }`}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal remains unchanged, receives identical props */}
      <LeadFormAppModal
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

export default AgentHubApp;