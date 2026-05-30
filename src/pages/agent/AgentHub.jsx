import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Building2,
  Wallet,
  User,
  Plus,
  LogOut,
  History,
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import LeadFormModal from './LeadFormModal';
import useAppResume from '../../hooks/useAppResume';
import { supabase } from '../../supabase/supabaseClient';

const AgentHub = ({ onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [businessUnits, setBusinessUnits] = useState({});
  const [isAppLoading, setIsAppLoading] = useState(true);

  const [leads, setLeads] = useState([]);
  const [currentUser, setCurrentUser] = useState({});

  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const channelRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      setIsAppLoading(true);

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error('[AgentHub] Auth Error:', authError);
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('users').select('*').eq('id', user.id).single();

      if (profileError) {
        console.error('[AgentHub] Profile Fetch Error:', profileError);
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
      if (leadsError) console.error('[AgentHub] Leads Fetch Error:', leadsError);
      else setLeads(leadsData || []);

      const { data: businessData, error: businessError } = await supabase.from('business_units').select('*');
      if (businessError) {
        console.error('[AgentHub] Business Units Error:', businessError);
      } else {
        const groupedUnits = {};
        businessData.forEach((item) => {
          if (!groupedUnits[item.category]) groupedUnits[item.category] = [];
          groupedUnits[item.category].push(item.unit_name);
        });
        setBusinessUnits(groupedUnits);
      }
    } catch (error) {
      console.error('[AgentHub] Unexpected Error:', error);
    } finally {
      setIsAppLoading(false);
    }
  }, []);

  const connectRealtime = useCallback(() => {
    if (channelRef.current) supabase.removeChannel(channelRef.current);
    const ch = supabase
      .channel('realtime-leads-web')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, async () => {
        const { data } = await supabase.from('leads').select('*');
        setLeads(data || []);
      })
      .subscribe();
    channelRef.current = ch;
    console.log('[AgentHub] Realtime channel subscribed');
  }, []);

  useEffect(() => {
    fetchData();
    connectRealtime();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [fetchData, connectRealtime]);

  // On resume: refetch stale data and reconnect the realtime channel.
  useAppResume(async () => {
    console.log('[AgentHub] Resuming — refetching data');
    await fetchData();
    connectRealtime();
  });

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

  const myLeads = leads.filter(
    (l) =>
      l.agent_id === currentUser.id ||
      l.user_id === currentUser.id
  );

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
        {theme === 'light' ? (
          <Sun size={10} className="text-[#DAC18A]" />
        ) : (
          <Moon size={10} className="text-[#F4F5F7]" />
        )}
      </motion.div>
    </div>
  );

  return (
    <div
      className={`flex h-screen font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden transition-colors duration-300 ${
        theme === 'light' ? 'bg-[#5B6777]' : 'bg-[#1A202C]'
      }`}
    >

      {/* 1. DESKTOP SIDEBAR */}
      <aside
        className={`hidden lg:flex flex-col w-[260px] h-screen shrink-0 relative transition-colors duration-300 ${
          theme === 'light' ? 'bg-[#5B6777]' : 'bg-[#1A202C]'
        }`}
      >

        {/* Logo Area */}
        <div className="p-5 pt-6 flex items-center gap-2">
  <div className="w-[38px] h-7 rounded-md overflow-hidden ">
    <img
      src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png"
      alt="Radix Logo"
      className="w-full h-full object-cover"
    />
  </div>

  <div>
    <h1 className="text-[16px] font-semibold tracking-tight text-[#FFFFFF] leading-tight">
      Radix
    </h1>

    <p className="text-[10px] font-medium text-[#DAC18A] tracking-[0.025em]">
      Partner Hub
    </p>
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
                  src={
                    currentUser.avatar ||
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Shahad&backgroundColor=F4F5F7"
                  }
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

        {/* Navigation */}
        <div className="px-3 flex-1 flex flex-col justify-center">
          <nav className="space-y-1">
            {isAppLoading ? (
              <div className="space-y-1.5 animate-pulse px-2">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className={`h-9 w-full rounded-md ${
                      theme === 'light'
                        ? 'bg-[#F4F5F7]/10'
                        : 'bg-[#222938]'
                    }`}
                  />
                ))}
              </div>
            ) : (
              navItems.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] transition-all duration-200 ${
                      isActive
                        ? 'text-[#FFFFFF] font-medium bg-[#48477A]/20'
                        : 'text-[#9CA3AF] font-normal hover:text-[#FFFFFF] hover:bg-[#F4F5F7]/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={16}
                        className={
                          isActive
                            ? "text-[#81B398]"
                            : "text-[#9CA3AF] group-hover:text-[#FFFFFF] transition-colors"
                        }
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))
            )}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-4 pb-6 space-y-2 shrink-0">
          <div className={`flex items-center justify-between px-3 py-2.5 rounded-md ${
            theme === 'light'
              ? 'bg-[#F4F5F7]/5'
              : 'bg-[#131720]/50'
          }`}>
            <span className="text-[11px] font-medium tracking-[0.025em] text-[#9CA3AF]">
              Theme
            </span>
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

      {/* MAIN AREA */}
      <main className={`flex-1 flex flex-col min-w-0 h-screen lg:py-3 lg:pr-3 overflow-hidden relative z-10 transition-colors duration-300`}>
        <div className={`w-full h-full flex flex-col relative overflow-hidden transition-colors duration-300 ${
          theme === 'light'
            ? 'bg-[#F4F5F7] lg:rounded-xl shadow-lg'
            : 'bg-[#131720] lg:rounded-xl shadow-2xl lg:border border-white/5'
        }`}>

          {/* MOBILE HEADER */}
          <header className={`lg:hidden flex items-center justify-between px-4 pt-6 pb-4 z-0 transition-colors duration-300 ${
            theme === 'light'
              ? 'bg-[#F4F5F7]'
              : 'bg-[#131720]'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg overflow-hidden ">
  <img
    src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png"
    alt="Radix Logo"
    className="w-full h-full object-cover"
  />
</div>

              <div className="flex flex-col justify-center">
                <span className={`text-[10px] font-semibold tracking-[0.1em] uppercase ${
                  theme === 'light'
                    ? 'text-[#718096]'
                    : 'text-[#9CA3AF]'
                }`}>
                  Welcome Back
                </span>

                <span className={`text-[16px] font-bold tracking-tight uppercase leading-tight ${
                  theme === 'light'
                    ? 'text-[#1A202C]'
                    : 'text-[#F4F5F7]'
                }`}>
                  {currentUser.name?.split(' ')[0] || "Agent"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'light'
                    ? 'bg-[#F0524F]/10 text-[#F0524F]'
                    : 'bg-[#F0524F]/20 text-[#F0524F]'
                }`}
              >
                <LogOut size={16} strokeWidth={2.5} />
              </button>
            </div>
          </header>

          {/* DESKTOP HEADER */}
          <header className={`hidden lg:flex h-16 shrink-0 items-center justify-end px-8 border-b z-0 ${
            theme === 'light'
              ? 'border-[#E2E8F0] bg-[#F4F5F7]'
              : 'border-[#222938] bg-[#131720]'
          }`}>
            <button
              onClick={() => {
                setSelectedBusiness("");
                setIsModalOpen(true);
              }}
              className="px-4 py-2 flex items-center gap-2 text-[13px] font-medium rounded-md bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] active:scale-95 transition-all shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>New Lead</span>
            </button>
          </header>

          {/* CONTENT */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-28 lg:pb-0 relative">
            <div className="max-w-[1400px] mx-auto p-4 lg:p-8">

              <motion.div
                key={`${location.pathname}-${theme}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet
                  context={{
                    myLeads,
                    setIsModalOpen,
                    setSelectedBusiness,
                    currentUser,
                    theme,
                    isAppLoading
                  }}
                />
              </motion.div>

            </div>
          </div>

          {/* MOBILE FLOAT BUTTON */}
          <button
            onClick={() => {
              setSelectedBusiness("");
              setIsModalOpen(true);
            }}
            className={`lg:hidden fixed bottom-[90px] right-5 w-14 h-14 rounded-full flex items-center justify-center z-40 shadow-[0_8px_30px_rgba(0,0,0,0.3)] active:scale-90 transition-all ${
              theme === 'light'
                ? 'bg-[#1A202C] text-[#FFFFFF]'
                : 'bg-[#FFFFFF] text-[#131720]'
            }`}
          >
            <Plus size={28} strokeWidth={2.5} />
          </button>

        </div>
      </main>

      {/* MOBILE NAV */}
      <nav className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-safe pt-2 h-[72px] rounded-t-[24px] transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-[#FFFFFF] shadow-[0_-10px_40px_rgba(0,0,0,0.06)]'
          : 'bg-[#1A202C] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]'
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
                    ? (theme === 'light'
                      ? 'text-[#1A202C]'
                      : 'text-[#FFFFFF]')
                    : 'text-[#718096]'
                }`}
              />

              {isActive && (
                <motion.div
                  layoutId="mobile-nav-dot"
                  className={`absolute bottom-1 w-1 h-1 rounded-full ${
                    theme === 'light'
                      ? 'bg-[#1A202C]'
                      : 'bg-[#FFFFFF]'
                  }`}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-[320px] rounded-2xl p-6 shadow-2xl transition-colors duration-300 ${
                theme === 'light'
                  ? 'bg-[#FFFFFF]'
                  : 'bg-[#1A202C]'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#F0524F]/10 flex items-center justify-center text-[#F0524F]">
                  <AlertCircle size={20} strokeWidth={2.5} />
                </div>

                <h3 className={`text-[18px] font-semibold tracking-tight ${
                  theme === 'light'
                    ? 'text-[#1A202C]'
                    : 'text-[#F4F5F7]'
                }`}>
                  Log out
                </h3>
              </div>

              <p className={`text-[13px] font-normal mb-6 leading-relaxed ${
                theme === 'light'
                  ? 'text-[#718096]'
                  : 'text-[#9CA3AF]'
              }`}>
                Are you sure you want to end your current session?
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    theme === 'light'
                      ? 'bg-[#F4F5F7] text-[#1A202C] hover:bg-[#E2E8F0]'
                      : 'bg-[#222938] text-[#F4F5F7] hover:bg-[#131720]'
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

      {/* LEAD MODAL */}
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