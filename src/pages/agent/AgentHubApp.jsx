import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabase/supabaseClient';

// Lead Modal Import
import LeadFormAppModal from './LeadFormModalApp';
import useAppResume from '../../hooks/useAppResume';

const AgentHubApp = ({ onLogout }) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [businessUnits, setBusinessUnits] = useState({});
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  const channelRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setIsAppLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[AgentHubApp] Auth Error:', authError);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users').select('*').eq('id', user.id).single();

      if (profileError) {
        console.error('[AgentHubApp] Profile Fetch Error:', profileError);
      } else {
        setCurrentUser({
          id: user.id,
          name: profileData.full_name,
          role: profileData.role,
          avatar: profileData.avatar_url,
          email: user.email
        });
      }

      const { data: leadsData, error: leadsError } = await supabase.from('leads').select('*');
      if (leadsError) console.error('[AgentHubApp] Leads Fetch Error:', leadsError);
      else setLeads(leadsData || []);

      const { data: businessData, error: businessError } = await supabase.from('business_units').select('*');
      if (businessError) {
        console.error('[AgentHubApp] Business Units Error:', businessError);
      } else {
        const groupedUnits = {};
        businessData.forEach((item) => {
          if (!groupedUnits[item.category]) groupedUnits[item.category] = [];
          groupedUnits[item.category].push(item.unit_name);
        });
        setBusinessUnits(groupedUnits);
      }
    } catch (error) {
      console.error('[AgentHubApp] Unexpected Error:', error);
    } finally {
      setIsAppLoading(false);
    }
  }, []);

  const connectRealtime = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase
      .channel('realtime-leads-app')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, async () => {
        const { data } = await supabase.from('leads').select('*');
        setLeads(data || []);
      })
      .subscribe();
    channelRef.current = ch;
    console.log('[AgentHubApp] Realtime channel subscribed');
  }, []);

  useEffect(() => {
    fetchData();
    connectRealtime();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [fetchData, connectRealtime]);

  // On native resume: refetch data and reconnect the realtime channel.
  // The global App.jsx handler reconnects the WebSocket; this re-subscribes the channel.
  useAppResume(async () => {
    console.log('[AgentHubApp] Resuming — refetching data');
    await fetchData();
    connectRealtime();
  });

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

  const myLeads = leads.filter(
    (l) => l.agent_id === currentUser.id || l.user_id === currentUser.id
  );

  // ==========================================
  // CAPACITOR NATIVE UI/UX DESIGN SYSTEM (BENTO GRID)
  // ==========================================
  return (
    <div className={`flex flex-col h-screen w-full font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden relative transition-colors duration-200 ${
      theme === 'light' ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      {/* Maximum Width Constraint for Dashboard Consistency */}
      <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto relative">

      {/* NATIVE APP BAR (Top) - Flat Layering */}
        <header className="flex items-center justify-between px-6 pt-12 pb-4 z-10 bg-transparent shrink-0">
          
          {/* LEFT: Logo & User Info */}
          <div className="flex items-center gap-2">
            {/* 
              Logo Wrapper: Fixed to w-8 and h-8. Added shrink-0.
              Restored the bento border logic so it pops nicely on the canvas. 
            */}
            <div className={`w-8  shrink-0 rounded-lg flex items-center justify-center overflow-hidden 
              `}>
               <img 
                src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Text alignment tightened to match the 32px logo height */}
            <div className="flex flex-col justify-center">
              <span className={`text-[10px] font-bold uppercase tracking-wider mb-[2px] leading-none ${
                theme === 'light' ? 'text-[#718096]' : 'text-[#9CA3AF]'
              }`}>
                Welcome Back
              </span>
              <span className="text-base font-extrabold tracking-tight leading-none">
                {currentUser.name?.split(' ')[0] || 'Agent'}
              </span>
            </div>
          </div>
          
          {/* RIGHT: Top Right Controls Container */}
          <div className="flex items-center gap-3">
            {/* Bento Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-xl p-1 flex items-center transition-all duration-200 active:scale-95 border ${
                theme === 'light' 
                  ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' 
                  : 'bg-[#222938] border-white/10 hover:border-[#81B398]'
              }`}
            >
              <motion.div 
                animate={{ x: theme === 'light' ? 0 : 24 }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  theme === 'light' ? 'bg-[#F4F5F7]' : 'bg-[#131720]'
                }`}
              >
                {theme === 'light' ? <Sun size={12} className="text-[#1A202C]" /> : <Moon size={12} className="text-[#F4F5F7]" />}
              </motion.div>
            </button>

            {/* Destructive Logout Button (Opacity Logic: 10/100/20) */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20 hover:bg-[#F0524F]/20"
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
            transition={{ duration: 0.2 }}
          >
            <Outlet context={{ myLeads, setIsModalOpen, setSelectedBusiness, currentUser, theme, isAppLoading }} />
          </motion.div>
        </main>

        {/* FLOATING ACTION BUTTON (FAB) - Bento Style */}
        <div className="fixed right-6 z-50 bottom-[calc(6.5rem+env(safe-area-inset-bottom))]">
          <button 
            onClick={() => { setSelectedBusiness(""); setIsModalOpen(true); }} 
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085] border border-[#81B398]/20 shadow-sm"
          >
            <Plus size={24} strokeWidth={3} />
          </button>
        </div>

        {/* FLAT BENTO BOTTOM NAVIGATION */}
        <nav className={`fixed bottom-0 left-0 right-0 z-50 px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] flex justify-between items-center transition-colors duration-200 border-t ${
          theme === 'light' 
            ? 'bg-[#FFFFFF] border-[#E2E8F0]' 
            : 'bg-[#222938] border-white/10'
        }`}>
          <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
            {navItems.map((item) => (
              <NavLink 
                key={item.id}
                to={item.path} 
                className={({ isActive }) => `relative flex flex-col items-center justify-center w-12 h-12 transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? 'text-[#81B398]' 
                    : (theme === 'light' ? 'text-[#718096]' : 'text-[#9CA3AF]')
                }`}
              >
                {({ isActive }) => (
                   <>
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'mb-1' : ''} />
                    {isActive && (
                      <motion.div 
                        layoutId="nav-indicator"
                        className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#81B398]"
                      />
                    )}
                   </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* BENTO LOGOUT MODAL */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                transition={{ duration: 0.2 }}
                className={`w-full max-w-sm rounded-3xl p-8 text-center space-y-6 border ${
                  theme === 'light' ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                }`}
              >
                {/* Destructive Icon Badge */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20">
                  <AlertCircle size={32} />
                </div>
                
                <div>
                  <h3 className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                    Sign Out
                  </h3>
                  <p className={`text-sm mt-2 font-medium ${theme === 'light' ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Are you sure you want to end your session?
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 mt-4">
                  {/* Destructive Action */}
                  <button 
                    onClick={onLogout} 
                    className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 bg-[#F0524F] text-white hover:bg-[#D44846]"
                  >
                    Confirm Exit
                  </button>
                  {/* Neutral Action */}
                  <button 
                    onClick={() => setShowLogoutConfirm(false)} 
                    className={`w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 border ${
                      theme === 'light' 
                        ? 'bg-[#F4F5F7] text-[#1A202C] border-transparent hover:bg-[#E2E8F0]' 
                        : 'bg-[#131720] text-[#F4F5F7] border-white/10 hover:bg-[#222938]'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Lead Form Modal */}
        <LeadFormAppModal
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleLeadSubmitted}
          businessUnits={businessUnits}
          initialUnit={selectedBusiness} 
          theme={theme}
        />

      </div>
    </div>
  );
};

export default AgentHubApp; 