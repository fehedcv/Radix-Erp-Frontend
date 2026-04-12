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
  CreditCard, PieChart, LogOut, Bell,
  ArrowRight, Wallet, X, AlertCircle, Sparkles, ShieldCheck, Clock, CheckCheck
} from 'lucide-react';

import { initialLeads } from '../../data/leadHistoryData';

const AdminHub = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const [leads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  // --- UPDATED NOTIFICATION DATA ---
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: 'agent', 
      title: 'New Agent Joined', 
      message: 'Rahul Sharma registered as a partner.', 
      time: '5m ago', 
      path: '/admin/agents',
      icon: <Users size={16} />
    },
    { 
      id: 2, 
      type: 'payment', 
      title: 'Pending Payout', 
      message: 'Zaid Al-Farsi requested ₹5,000.', 
      time: '1h ago', 
      path: '/admin/credits',
      icon: <Wallet size={16} />
    },
    { 
      id: 3, 
      type: 'credit', 
      title: 'Low Credit Alert', 
      message: 'Unit #402 is running low on credits.', 
      time: '3h ago', 
      path: '/admin/units',
      icon: <CreditCard size={16} />
    }
  ]);

  const totalNotifications = notifications.length;

  const handleClearNotifications = (e) => {
    e.stopPropagation();
    setNotifications([]);
  };

  const handleNotificationClick = (path) => {
    navigate(path);
    setShowNotifications(false);
  };
  // ---------------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'leads', label: 'Inquiries', icon: PieChart, path: '/admin/leads' },
    { id: 'units', label: 'Businesses', icon: Building2, path: '/admin/units' },
    { id: 'agents', label: 'Agents', icon: Users, path: '/admin/agents' },
    { id: 'credits', label: 'Payments', icon: CreditCard, path: '/admin/credits' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      
      {/* 1. FIXED DESKTOP SIDEBAR - Reduced width to w-64 and tightened padding */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen z-30 overflow-hidden">
        
        {/* BRANDING - Tighter padding */}
        <div className="p-5">
          <div className="flex items-center gap-2 pl-2">
            <img 
              src="https://res.cloudinary.com/dmtzmgbkj/image/upload/f_webp/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png" 
              alt="Logo" className="h-6 w-6 object-contain" 
            />
            <div>
              <h1 className="text-base font-bold tracking-tighter uppercase leading-none">RADIX</h1>
              <p className="text-[8px] font-black text-[#61D9DE] uppercase tracking-widest">Admin</p>
            </div>
          </div>
        </div>

        {/* NAVIGATION - Reduced gap and vertical padding */}
        <div className="px-3 py-2">
          <nav className="space-y-1 relative">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `group relative flex items-center gap-3 px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                  ? 'text-[#007ACC] bg-blue-50/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                    
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active-line"
                        className="absolute right-0 w-1 h-5 bg-[#007ACC] rounded-l-full shadow-[-2px_0_10px_rgba(0,122,204,0.3)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* FOOTER AREA - Tightened padding */}
        <div className="mt-auto p-4 bg-white border-t border-slate-50">
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="group border p-2.5 rounded-xl border-slate-200 flex items-center justify-center gap-2 w-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all uppercase font-black text-[9px] tracking-[0.2em]"
          >
            <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-[#007ACC] uppercase tracking-[0.2em]">Dashboard</span>
          </div>
        </header>

        <div className="py-2 px-4 lg:px-8 max-w-[1600px] w-full mx-auto pb-24 lg:pb-12">
          <AnimatePresence mode="wait">
            <motion.div 
              key={location.pathname} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between items-center px-2 py-3 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        {menuItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `relative flex flex-col items-center gap-1 flex-1 transition-all duration-300 ${isActive ? 'text-[#007ACC]' : 'text-slate-400'}`}
          >
            {({ isActive }) => (
               <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-blue-50 shadow-sm' : 'bg-transparent'}`}>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[7px] font-black uppercase tracking-tight ${isActive ? 'opacity-100' : 'opacity-60'}`}>{item.label}</span>
                {isActive && (
                  <motion.div layoutId="mobile-nav-line" className="absolute -top-[12px] w-8 h-1 bg-[#007ACC] rounded-b-full shadow-[0_2px_10px_rgba(0,122,204,0.4)]" transition={{ type: "spring", stiffness: 350, damping: 30 }} />
                )}
               </>
            )}
          </NavLink>
        ))}
        
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center gap-1 flex-1 text-rose-500">
          <div className="p-1.5 rounded-xl hover:bg-rose-50 transition-colors">
            <LogOut size={20} strokeWidth={2} />
          </div>
          <span className="text-[7px] font-black uppercase tracking-tight opacity-60">Sign Out</span>
        </button>
      </nav>

      {/* SIGN OUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[1rem] p-8 shadow-2xl border border-slate-100 text-center space-y-8">
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
                <AlertCircle size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Confirm Sign Out?</h3>
                <p className="text-xs text-slate-500 font-medium px-4 leading-relaxed font-sans">End your secure session on the Radix management portal.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 font-sans">
                <button onClick={() => setShowLogoutConfirm(false)} className="py-3 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">Back</button>
                <button onClick={onLogout} className="py-3 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-500 transition-colors shadow-lg shadow-rose-500/20">Sign Out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHub;