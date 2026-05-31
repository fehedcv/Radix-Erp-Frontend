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
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../supabase/supabaseClient';

// Lead Modal Import
import LeadFormAppModal from './LeadFormModalApp';

const AgentHubApp = ({ onLogout }) => {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [businessUnits, setBusinessUnits] = useState({});
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  const isLight = theme === 'light';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsAppLoading(true);

        const {
          data: { user },
          error: authError
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('Auth Error:', authError);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile Fetch Error:', profileError);
        } else {
          setCurrentUser({
            id: user.id,
            name: profileData.full_name,
            role: profileData.role,
            avatar: profileData.avatar_url,
            email: user.email
          });
        }

        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*');

        if (leadsError) {
          console.error('Leads Fetch Error:', leadsError);
        } else {
          setLeads(leadsData || []);
        }

        const { data: businessData, error: businessError } = await supabase
          .from('business_units')
          .select('*');

        if (businessError) {
          console.error('Business Units Error:', businessError);
        } else {
          const groupedUnits = {};
          businessData.forEach((item) => {
            if (!groupedUnits[item.category]) {
              groupedUnits[item.category] = [];
            }
            groupedUnits[item.category].push(item.unit_name);
          });
          setBusinessUnits(groupedUnits);
        }

      } catch (error) {
        console.error('Unexpected Error:', error);
      } finally {
        setIsAppLoading(false);
      }
    };

    fetchData();

    const channel = supabase
      .channel('realtime-leads')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        async () => {
          const { data } = await supabase
            .from('leads')
            .select('*');
          setLeads(data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const currentTab = navItems.find(item => location.pathname.startsWith(item.path));
  const currentTabName = currentTab?.label || "Home";

  const myLeads = leads.filter(
    (l) => l.agent_id === currentUser.id || l.user_id === currentUser.id
  );

  // ==========================================
  // CAPACITOR NATIVE UI/UX DESIGN SYSTEM (BENTO GRID)
  // ==========================================
  return (
    <div className={`flex flex-col h-screen w-full font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden relative transition-colors duration-200 ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      {/* Maximum Width Constraint for Dashboard Consistency */}
      <div className="flex flex-col h-full w-full max-w-[1400px] mx-auto relative">

      {/* NATIVE APP BAR (Top) - Flat Layering */}
        <header className="flex items-center justify-between px-6 pt-12 pb-4 z-20 bg-transparent shrink-0">
          
          {/* LEFT: User Profile Info with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-3 text-left focus:outline-none transition-opacity active:opacity-70"
            >
              <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center overflow-hidden border-2 shadow-sm ${
                isLight ? 'border-[#E2E8F0] bg-[#FFFFFF]' : 'border-white/10 bg-[#222938]'
              }`}>
                {currentUser.avatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={18} className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'} />
                )}
              </div>
              
              <div className="flex flex-col justify-center">
                <span className={`text-[10px] font-bold uppercase tracking-wider mb-[2px] leading-none ${
                  isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
                }`}>
                  Welcome Back
                </span>
                <span className="text-base font-extrabold tracking-tight leading-none">
                  {currentUser.name?.split(' ')[0] || 'Agent'}
                </span>
              </div>
            </button>

            {/* Profile Menu Popover */}
            <AnimatePresence>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowProfileMenu(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full left-0 mt-3 w-56 p-2 rounded-2xl border shadow-xl z-40 ${
                      isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                    }`}
                  >
                    <div className={`px-3 py-3 border-b mb-2 flex flex-col ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                      <span className="text-sm font-bold truncate">{currentUser.name || 'Agent User'}</span>
                      <span className={`text-xs truncate mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        {currentUser.email || 'agent@example.com'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowLogoutConfirm(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200 active:scale-95 bg-[#F0524F]/10 text-[#F0524F] hover:bg-[#F0524F]/20"
                    >
                      <LogOut size={16} strokeWidth={2.5} />
                      Sign Out
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
          
          {/* RIGHT: Top Right Controls Container */}
          <div className="flex items-center gap-3">
            
            {/* Dynamic Page Label */}
            <span className={`text-xs font-bold tracking-tight px-3 py-1.5 rounded-lg border ${
              isLight 
              ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' 
              : 'bg-[#222938] border-white/10 text-[#F4F5F7]'
            }`}>
              {currentTabName}
            </span>

            {/* Bento Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`w-14 h-8 rounded-xl p-1 flex items-center transition-all duration-200 active:scale-95 border ${
                isLight 
                  ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' 
                  : 'bg-[#222938] border-white/10 hover:border-[#81B398]'
              }`}
            >
              <motion.div 
                animate={{ x: isLight ? 0 : 24 }}
                className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'
                }`}
              >
                {isLight ? <Sun size={12} className="text-[#1A202C]" /> : <Moon size={12} className="text-[#F4F5F7]" />}
              </motion.div>
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
        <nav className={`fixed bottom-0 left-0 right-0 z-50 px-6 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))] flex justify-between items-center transition-colors duration-200 border-t ${
          isLight 
            ? 'bg-[#FFFFFF] border-[#E2E8F0]' 
            : 'bg-[#222938] border-white/10'
        }`}>
          <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
            {navItems.map((item) => (
              <NavLink 
                key={item.id}
                to={item.path} 
                className={({ isActive }) => `relative flex flex-col items-center justify-center w-14 h-12 transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? 'text-[#81B398]' 
                    : (isLight ? 'text-[#718096]' : 'text-[#9CA3AF]')
                }`}
              >
                {({ isActive }) => (
                   <>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[10px] font-bold mt-1 tracking-wide transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 font-semibold'}`}>
                      {item.label}
                    </span>
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
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                }`}
              >
                {/* Destructive Icon Badge */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20">
                  <AlertCircle size={32} />
                </div>
                
                <div>
                  <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                    Sign Out
                  </h3>
                  <p className={`text-sm mt-2 font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
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
                      isLight 
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