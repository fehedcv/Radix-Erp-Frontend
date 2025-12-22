import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom'; // റൂട്ടിംഗ് ഹുക്കുകൾ ചേർത്തു
import { 
  LayoutDashboard, Users, FolderEdit, Settings, 
  Bell, LogOut, ShieldCheck, X, ChevronRight, 
  Clock, Briefcase, AlertCircle
} from 'lucide-react';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';

const BusinessHub = ({ onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // 1. SESSION MANAGEMENT
  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");
  const businessName = currentUser.name || currentUser.businessName || "Business Unit";

  // 2. DATA SYNC
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    const allLeads = saved ? JSON.parse(saved) : initialLeads;
    if (!saved) localStorage.setItem('vynx_leads', JSON.stringify(initialLeads));
    return allLeads.filter(l => l.businessUnit === businessName);
  });

  // 3. STORAGE LISTENER
  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('vynx_leads');
      if (saved) {
        const allLeads = JSON.parse(saved);
        setLeads(allLeads.filter(l => l.businessUnit === businessName));
      }
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, [businessName]);

  // 4. NOTIFICATION LOGIC
  const notificationLeads = leads.filter(l => l.status === 'Pending');
  const notificationCount = notificationLeads.length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 5. UPDATE HANDLER (Passed to sub-pages via Outlet context)
  const updateLeadStatus = (id, newStatus) => {
    const masterSaved = JSON.parse(localStorage.getItem('vynx_leads') || "[]");
    const updatedMasterLeads = masterSaved.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    );
    localStorage.setItem('vynx_leads', JSON.stringify(updatedMasterLeads));
    setLeads(updatedMasterLeads.filter(l => l.businessUnit === businessName));
  };

  const navItems = [
    { id: 'dashboard', label: 'Unit Overview', icon: <LayoutDashboard size={18} />, path: '/business/dashboard' },
    { id: 'leads', label: 'Incoming Leads', icon: <Users size={18} />, path: '/business/leads' },
    { id: 'portfolio', label: 'Portfolio', icon: <FolderEdit size={18} />, path: '/business/portfolio' },
    { id: 'settings', label: 'Unit Settings', icon: <Settings size={18} />, path: '/business/settings' },
  ];

  // Get current path name for header
  const currentPathName = location.pathname.split('/').pop().replace('-', ' ');

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 overflow-hidden">
      
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 flex items-center justify-center text-white rounded-none">
              <Briefcase size={18} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight uppercase">Vynx Unit</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Management Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center justify-between p-3.5 transition-all rounded-none
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-40" />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-3 mb-6 px-1">
              <div className="h-9 w-9 rounded-none bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400 border border-indigo-400/30 uppercase">
                {businessName[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Unit Manager</p>
                <p className="text-sm font-bold text-white truncate tracking-tight uppercase">{businessName}</p>
              </div>
           </div>
           <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="w-full flex items-center gap-3 p-3 rounded-none text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all uppercase tracking-widest"
           >
             <LogOut size={16} /> Exit System
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
          <div className="hidden lg:block">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Portal / <span className="text-slate-900">{currentPathName}</span>
            </h2>
          </div>

          <div className="lg:hidden flex items-center gap-3">
             <div className="h-8 w-8 bg-slate-900 flex items-center justify-center text-white rounded-none">
                <Briefcase size={16} />
             </div>
             <span className="text-sm font-bold uppercase tracking-tight">{currentPathName}</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications Terminal */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-all border rounded-none ${showNotifications ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 rounded-none border border-white text-[8px] flex items-center justify-center text-white font-bold">
                    {notificationCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 right-0 w-80 bg-white border border-slate-200 shadow-2xl rounded-none overflow-hidden z-50"
                  >
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Incoming Alerts</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notificationLeads.length > 0 ? notificationLeads.map((note) => (
                        <button key={note.id} onClick={() => { navigate('/business/leads'); setShowNotifications(false); }} className="w-full p-4 flex gap-4 hover:bg-slate-50 border-b border-slate-50 text-left transition-all group last:border-0">
                          <div className="h-10 w-10 bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 rounded-none border border-amber-100"><Clock size={18} /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 uppercase">{note.clientName}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{note.service}</p>
                          </div>
                        </button>
                      )) : (
                        <div className="p-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Zero Pending Tasks</div>
                      )}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all">Close Terminal</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto"
          >
            {/* SUB-PAGES RENDER HERE */}
            <Outlet context={{ leads, businessName, updateLeadStatus }} />
          </motion.div>
        </div>
      </main>

      {/* MOBILE NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-40 shadow-xl">
        {navItems.map((item) => (
          <NavLink 
            key={item.id} 
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center justify-center p-2 transition-all ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            {item.icon}
            <span className="text-[9px] font-bold uppercase mt-1">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center justify-center p-2 text-rose-500">
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase mt-1">Exit</span>
        </button>
      </nav>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm rounded-none p-10 shadow-2xl border border-slate-200 text-center space-y-6"
            >
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-none flex items-center justify-center mx-auto border border-red-100">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Authorize Exit</h3>
                  <p className="text-sm text-slate-500 font-medium">Are you sure you want to terminate the current unit management session?</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <button onClick={() => setShowLogoutConfirm(false)} className="py-4 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                  <button onClick={onLogout} className="py-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-red-100 hover:bg-red-700 transition-all">Terminate</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessHub;