import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderEdit, Settings, 
  Bell, LogOut, Briefcase, AlertCircle, 
  ShieldCheck, Activity, Clock, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data Source - Ensure this path is correct in your project
import { initialLeads } from '../../data/leadHistoryData';

const BusinessHub = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // 1. DATA MANAGEMENT
  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");
  const businessName = currentUser.name || currentUser.businessName || "Business Team";

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    const allLeads = saved ? JSON.parse(saved) : initialLeads;
    if (!saved) localStorage.setItem('vynx_leads', JSON.stringify(initialLeads));
    return allLeads.filter(l => l.businessUnit === businessName);
  });

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const notificationLeads = leads.filter(l => l.status === 'Pending');
  const notificationCount = notificationLeads.length;

  const updateLeadStatus = (id, newStatus) => {
    const masterSaved = JSON.parse(localStorage.getItem('vynx_leads') || "[]");
    const updatedMasterLeads = masterSaved.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    );
    localStorage.setItem('vynx_leads', JSON.stringify(updatedMasterLeads));
    setLeads(updatedMasterLeads.filter(l => l.businessUnit === businessName));
  };

  const navItems = [
    { id: 'dashboard', label: 'Team Overview', icon: LayoutDashboard, path: '/business/dashboard' },
    { id: 'leads', label: 'Incoming Leads', icon: Users, path: '/business/leads' },
    { id: 'portfolio', label: 'Project Portfolio', icon: FolderEdit, path: '/business/portfolio' },
    { id: 'settings', label: 'Account Settings', icon: Settings, path: '/business/settings' },
  ];

  const currentTabName = location.pathname.split('/').pop().replace('-', ' ') || 'Dashboard';

  return (
    <div className="flex h-screen bg-[#FBFCFD] text-[#1A1C1E] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-100 overflow-hidden">
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-slate-200 z-30 shadow-[10px_0_30px_rgba(0,0,0,0.01)]">
        <div className="p-8">
          <div className="flex items-center gap-3.5 mb-6">
            <div className="h-11 w-11 bg-[#007ACC] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <Briefcase size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tighter leading-none uppercase italic">Radix</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">Business Hub</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100/50">
             <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-40" />
             </div>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unit ID: {currentUser.id || "B-092"}</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.25em] mb-4">Main Navigation</p>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`group relative flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all duration-300 overflow-visible
                  ${isActive ? 'bg-blue-50/50 text-[#007ACC]' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className={`text-[13px] font-bold tracking-tight transition-colors ${isActive ? 'text-blue-700' : ''}`}>
                  {item.label}
                </span>

                {/* THE ACTIVE STATUS VERTICAL LINE */}
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-indicator"
                    className="absolute -right-[17px] w-1.5 h-8 bg-[#007ACC] rounded-l-full shadow-[0_0_15px_rgba(0,122,204,0.5)] z-10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
           <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl mb-3 shadow-sm hover:border-blue-200 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-black text-white shadow-md uppercase">
                {businessName[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight">{businessName}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Administrator</p>
              </div>
           </div>
           <button 
             onClick={() => setShowLogoutConfirm(true)} 
             className="w-full flex items-center justify-center gap-2.5 p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl text-[11px] font-black uppercase tracking-widest"
           >
             <LogOut size={16} /> Sign Out
           </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 border-b border-slate-200 flex items-center justify-between px-8 lg:px-12 bg-white/70 backdrop-blur-md z-20">
          <div>
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                Manager <span className="text-slate-300">/</span> <span className="text-blue-600 italic">{currentTabName}</span>
              </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Notification Center */}
             <div className="relative" ref={notificationRef}>
                <motion.button 
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-3 rounded-2xl border transition-all relative ${showNotifications ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400 shadow-sm'}`}
                >
                  <Bell size={20} />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 rounded-full border-[3px] border-white text-[9px] flex items-center justify-center text-white font-black shadow-sm">
                      {notificationCount}
                    </span>
                  )}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }} 
                      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }} 
                      exit={{ opacity: 0, y: 10, scale: 0.95, filter: 'blur(4px)' }} 
                      className="absolute top-16 right-0 w-80 bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] overflow-hidden z-50"
                    >
                       <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700">Notifications</span>
                          <span className="text-[9px] bg-blue-600 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-tighter">{notificationCount} New</span>
                       </div>
                       <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
                          {notificationLeads.map((note) => (
                             <button key={note.id} onClick={() => { navigate('/business/leads'); setShowNotifications(false); }} className="w-full p-5 flex gap-4 hover:bg-blue-50/50 text-left transition-all group">
                                <div className="h-11 w-11 bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 rounded-2xl border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all"><Clock size={18} /></div>
                                <div className="overflow-hidden">
                                   <p className="text-xs font-black text-slate-900 uppercase truncate leading-tight">{note.clientName}</p>
                                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight truncate mt-1">{note.service}</p>
                                </div>
                             </button>
                          ))}
                          {notificationCount === 0 && (
                            <div className="p-16 text-center">
                              <Bell size={32} className="mx-auto text-slate-200 mb-4" strokeWidth={1} />
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Inbox is empty</p>
                            </div>
                          )}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </header>

        {/* Viewport Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 pb-32">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet context={{ leads, businessName, updateLeadStatus }} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Status Footer */}
        <footer className="hidden lg:flex absolute bottom-0 right-0 left-0 h-10 bg-white/80 backdrop-blur-md border-t border-slate-200 text-slate-400 px-8 items-center justify-between z-10">
           <div className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em]">
                <ShieldCheck size={14} className="text-emerald-500" /> Security: SSL Active
              </span>
              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em]">
                <Activity size={14} className="text-blue-500" /> Database: Synced
              </span>
           </div>
           <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Build 2025.4.1</span>
        </footer>
      </main>

      {/* 3. MOBILE NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] h-20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink 
              key={item.id}
              to={item.path} 
              className={`flex flex-col items-center gap-1.5 px-4 transition-all duration-300 ${isActive ? 'text-[#007ACC]' : 'text-slate-400'}`}
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-black uppercase tracking-tight">{item.label.split(' ')[0]}</span>
              {isActive && <motion.div layoutId="mobile-indicator" className="w-1 h-1 bg-blue-600 rounded-full" />}
            </NavLink>
          );
        })}
      </nav>

      {/* LOGOUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }} 
              className="bg-white w-full max-w-sm p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 text-center"
            >
                <div className="w-20 h-20 bg-rose-50 text-rose-600 flex items-center justify-center mx-auto rounded-[2rem] border border-rose-100 mb-8">
                  <AlertCircle size={36} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Confirm Exit</h3>
                <p className="text-sm text-slate-500 font-medium mt-4 mb-10 leading-relaxed italic">"Ready to end your current business session?"</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
                  <button onClick={onLogout} className="py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">Log Out</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessHub;