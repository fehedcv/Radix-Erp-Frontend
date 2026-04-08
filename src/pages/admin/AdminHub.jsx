import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate // Keep this, remove 'navigate'
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
    { id: 'units', label: 'Partners', icon: Building2, path: '/admin/units' },
    { id: 'agents', label: 'Team', icon: Users, path: '/admin/agents' },
    { id: 'credits', label: 'Payments', icon: CreditCard, path: '/admin/credits' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      
      {/* 1. FIXED DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen z-30 overflow-hidden">
        {/* BRANDING */}
      <div className="p-2 pb-6">
  <div className="p-8 pb-6">
  <div className="flex items-center gap-4">
    {/* LOGO PLACEHOLDER (No Box) */}
    <div className="h-12 w-12 shrink-0 flex items-center justify-center">
      <img 
        src="https://placehold.co/100x100/FF0000/FFFFFF?" 
        alt="RADIX Logo" 
        className="w-full h-full object-contain"
        // Fallback styling if image fails/is missing
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23007ACC' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='12 2 2 7 12 12 22 7 12 2'%3E%3C/polygon%3E%3Cpolyline points='2 17 12 22 22 17'%3E%3C/polyline%3E%3Cpolyline points='2 12 12 17 22 12'%3E%3C/polyline%3E%3C/svg%3E";
          e.target.className = "w-10 h-10 object-contain";
        }}
      />
    </div>
    
    {/* TYPOGRAPHY */}
    <div className="flex flex-col justify-center">
      <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase leading-none">
        RADIX
      </h1>
      <p className="text-[10px] font-bold text-[#007ACC] uppercase tracking-widest mt-1.5 leading-none">
        Management
      </p>
    </div>
  </div>
</div>
</div>

        {/* NAVIGATION */}
        <div className="px-4 py-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-4 px-4 font-sans">navigation</p>
          <nav className="space-y-1 relative">
            {menuItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `group relative flex items-center gap-4 px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  isActive 
                  ? 'text-[#007ACC] bg-blue-50/50' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                    
                    {isActive && (
                      <motion.div 
                        layoutId="sidebar-active-line"
                        className="absolute right-0 w-1 h-6 bg-[#007ACC] rounded-l-full shadow-[-2px_0_10px_rgba(0,122,204,0.3)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* FOOTER AREA */}
        <div className="mt-auto p-6 space-y-6 bg-white border-t border-slate-50">
          

          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="group border p-3 rounded-md border-gray-300 flex items-center gap-3 w-full px-4 mb-2 text-slate-400 hover:text-rose-500 transition-colors uppercase font-black text-[10px] tracking-[0.2em]"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 flex items-center justify-between px-6 lg:px-12 sticky top-0 bg-[#F8FAFC]/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-[#007ACC] uppercase tracking-[0.2em]">Dashboard</span>
          </div>

         
        </header>

        <div className="py-3 px-3 max-w-[1600px] w-full mx-auto pb-24 lg:pb-12">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION - (UNCHANGED) */}
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

      {/* SIGN OUT MODAL - (UNCHANGED) */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[1rem] p-10 shadow-2xl border border-slate-100 text-center space-y-10">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[2rem] flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">Confirm Sign Out?</h3>
                <p className="text-sm text-slate-500 font-medium px-4 leading-relaxed font-sans">End your secure session on the Radix management portal.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 font-sans">
                <button onClick={() => setShowLogoutConfirm(false)} className="py-4 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-2xl">Back</button>
                <button onClick={onLogout} className="py-4 bg-[#0F172A] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-500 transition-colors shadow-xl">Sign Out</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminHub;