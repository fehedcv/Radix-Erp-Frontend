import React, { useState, useEffect, useRef } from 'react';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, Users, FolderEdit, Settings, 
  Bell, LogOut, Briefcase, ChevronRight, AlertCircle, 
  ShieldCheck, Activity, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';

const BusinessHub = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // 1. SESSION & DATA MANAGEMENT
  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");
  const businessName = currentUser.name || currentUser.businessName || "Business Team";

  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    const allLeads = saved ? JSON.parse(saved) : initialLeads;
    if (!saved) localStorage.setItem('vynx_leads', JSON.stringify(initialLeads));
    return allLeads.filter(l => l.businessUnit === businessName);
  });

  const notificationLeads = leads.filter(l => l.status === 'Pending');
  const notificationCount = notificationLeads.length;

  // 2. STATUS UPDATE HANDLER
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

  const currentTabName = location.pathname.split('/').pop().replace('-', ' ');

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1E1E1E] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-100 overflow-hidden">
      
      {/* 1. SIDEBAR (DESKTOP) - DENSE & ANIMATED */}
      <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-slate-200 z-30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="h-10 w-10 bg-[#007ACC] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Briefcase size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight leading-none uppercase">Radix</span>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Business Hub</span>
            </div>
          </div>
{/*           
          <div className="flex items-center gap-2.5 mt-6 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Unit ID: {currentUser.id || "B-000"}</span>
          </div> */}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-8 overflow-hidden">
          <p className="px-4 text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-4 opacity-70">Management Menu</p>

          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                group relative w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300
                ${isActive ? 'bg-blue-50 text-[#007ACC] shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3.5">
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="transition-transform group-hover:scale-110" />
                    <span className="text-[12px] font-bold tracking-tight">{item.label}</span>
                  </div>
                  
                  {/* VERTICAL LINE ANIMATION - FIXED VISIBILITY */}
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill" 
                      className="absolute right-0 w-1 h-5 bg-[#007ACC] rounded-l-full shadow-[0_0_12px_rgba(0,122,204,0.4)]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/40">
           <div className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 rounded-2xl mb-4 shadow-sm group transition-all hover:border-blue-200">
              <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center text-xs font-black text-[#007ACC] border border-blue-100 uppercase group-hover:scale-105 transition-transform">
                {businessName[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-[8px] font-bold text-slate-400 uppercase leading-none mb-1">Manager Access</p>
                <p className="text-[11px] font-black text-slate-900 truncate tracking-tight uppercase">{businessName}</p>
              </div>
           </div>
           <button 
             onClick={() => setShowLogoutConfirm(true)} 
             className="w-full flex items-center justify-center gap-3 p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all rounded-xl text-[11px] font-bold uppercase tracking-widest active:scale-95"
           >
             <LogOut size={18} /> Sign Out
           </button>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-y-auto">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 py-3 lg:px-12 sticky top-0 bg-white/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
              <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
               <span className="text-blue-600 font-extrabold uppercase italic">{currentTabName}</span>
              </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Notification Bell */}
             <div className="relative" ref={notificationRef}>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 rounded-xl border transition-all ${showNotifications ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-white text-slate-400 border-slate-200 hover:border-[#007ACC] hover:text-[#007ACC] shadow-sm'}`}
                >
                  <Bell size={18} />
                  {notificationCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 rounded-full border-2 border-white text-[8px] flex items-center justify-center text-white font-bold">{notificationCount}</span>}
                </motion.button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div initial={{ opacity: 0, y: 15, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 15, scale: 0.95 }} className="absolute top-14 right-0 w-80 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden z-50">
                       <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Active Alerts</span>
                          <span className="text-[9px] bg-blue-100 text-[#007ACC] px-2 py-0.5 rounded font-bold uppercase">{notificationCount} New</span>
                       </div>
                       <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                          {notificationLeads.map((note) => (
                             <button key={note.id} onClick={() => { navigate('/business/leads'); setShowNotifications(false); }} className="w-full p-4 flex gap-4 hover:bg-slate-50 text-left transition-all group">
                                <div className="h-10 w-10 bg-blue-50 text-[#007ACC] flex items-center justify-center shrink-0 rounded-xl border border-blue-100 group-hover:bg-[#007ACC] group-hover:text-white transition-colors"><Clock size={18} /></div>
                                <div className="overflow-hidden">
                                   <p className="text-[11px] font-black text-slate-900 uppercase truncate">{note.clientName}</p>
                                   <p className="text-[9px] text-slate-500 font-medium uppercase tracking-tight truncate mt-0.5">{note.service}</p>
                                </div>
                             </button>
                          ))}
                          {notificationCount === 0 && <div className="p-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero New Notifications</div>}
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </header>

        <div className="p-6 lg:p-12 max-w-[1400px] w-full mx-auto pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              <Outlet context={{ leads, businessName, updateLeadStatus }} />
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="hidden lg:flex fixed bottom-0 right-0 left-[280px] h-8 bg-white border-t border-slate-200 text-slate-400 px-6 items-center justify-between z-30">
           <div className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck size={14} className="text-emerald-500" /> Account Secure
              </span>
              <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <Activity size={14} className="text-blue-500" /> Network Sync Active
              </span>
           </div>
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-50 italic">Enterprise v1.0.2</span>
        </footer>
      </main>

      {/* 3. MOBILE NAVIGATION - FIXED BOTTOM BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center px-4 py-4 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] h-16">
        {navItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-[#007ACC]' : 'text-slate-400'}`}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] font-bold uppercase tracking-tight">{item.label.split(' ')[0]}</span>
              </>
            )}
          </NavLink>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center gap-1.5 text-rose-500">
          <LogOut size={22} />
          <span className="text-[9px] font-bold uppercase tracking-tight">Exit</span>
        </button>
      </nav>

      {/* SIGN OUT CONFIRMATION */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm p-10 rounded-[1.5rem] shadow-2xl border border-slate-100 text-center space-y-8">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 flex items-center justify-center mx-auto rounded-3xl border border-rose-100 shadow-inner">
                  <AlertCircle size={32} strokeWidth={2.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">Sign Out</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed px-4 italic">"Are you sure you want to end your session?"</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="py-4 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95">Stay</button>
                  <button onClick={onLogout} className="py-4 bg-rose-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95">Confirm</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessHub;