import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, FolderEdit, Settings, 
  Bell, LogOut, ShieldCheck, X, ChevronRight, 
  Clock, Briefcase, AlertCircle
} from 'lucide-react';

// Component Imports
import BusinessOverview from './BusinessOverview';
import ManageLeads from './ManageLeads';
import PortfolioManager from './PortfolioManager';
import BusinessSettings from './BusinessSettings';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';

const BusinessHub = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef(null);

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

  // 5. UPDATE HANDLER
  const updateLeadStatus = (id, newStatus) => {
    const masterSaved = JSON.parse(localStorage.getItem('vynx_leads') || "[]");
    const updatedMasterLeads = masterSaved.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    );
    localStorage.setItem('vynx_leads', JSON.stringify(updatedMasterLeads));
    setLeads(updatedMasterLeads.filter(l => l.businessUnit === businessName));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <BusinessOverview leads={leads} />;
      case 'leads': return <ManageLeads businessName={businessName} leads={leads} onUpdateStatus={updateLeadStatus} />;
      case 'portfolio': return <PortfolioManager />;
      case 'settings': return <BusinessSettings onLogout={() => setShowLogoutConfirm(true)} />;
      default: return <BusinessOverview leads={leads} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Unit Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'leads', label: 'Incoming Leads', icon: <Users size={18} /> },
    { id: 'portfolio', label: 'Portfolio', icon: <FolderEdit size={18} /> },
    { id: 'settings', label: 'Unit Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 overflow-hidden">
      
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 flex items-center justify-center text-white rounded-none">
              <Briefcase size={18} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Vynx Unit</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Management Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 transition-all rounded-none ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform ${activeTab === item.id ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
           <div className="flex items-center gap-3 mb-6 px-1">
              <div className="h-9 w-9 rounded-none bg-indigo-600/20 flex items-center justify-center text-xs font-bold text-indigo-400 border border-indigo-400/30 uppercase">
                {businessName[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none mb-1">Unit Manager</p>
                <p className="text-sm font-bold text-white truncate tracking-tight">{businessName}</p>
              </div>
           </div>
           <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="w-full flex items-center gap-3 p-3 rounded-none text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
           >
             <LogOut size={16} /> Exit System
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 z-20">
          <div className="hidden lg:block">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Portal / <span className="text-slate-900">{activeTab.replace('-', ' ')}</span>
            </h2>
          </div>

          <div className="lg:hidden flex items-center gap-3">
             <div className="h-7 w-7 bg-slate-900 flex items-center justify-center text-white rounded-none">
                <Briefcase size={14} />
             </div>
             <span className="text-sm font-bold uppercase">{activeTab}</span>
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
                        <button key={note.id} onClick={() => { setActiveTab('leads'); setShowNotifications(false); }} className="w-full p-4 flex gap-4 hover:bg-slate-50 border-b border-slate-50 text-left transition-all group last:border-0">
                          <div className="h-10 w-10 bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 rounded-none border border-amber-100"><Clock size={18} /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 uppercase">{note.clientName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{note.service}</p>
                          </div>
                        </button>
                      )) : (
                        <div className="p-10 text-center text-xs font-bold text-slate-300 uppercase tracking-widest">Zero Pending Tasks</div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* DXB NODE REMOVED FROM HERE */}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* MOBILE NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-40">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)} 
            className={`flex flex-col items-center justify-center p-2 transition-all ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            {item.icon}
            <span className="text-[9px] font-bold uppercase mt-1">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center justify-center p-2 text-rose-500">
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase mt-1">Exit</span>
        </button>
      </nav>

      {/* LOGOUT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-none p-8 relative shadow-2xl border border-slate-200"
            >
              <div className="text-center space-y-6">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-none flex items-center justify-center mx-auto border border-red-100">
                  <AlertCircle size={28} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Confirm Logout</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed px-4">
                    Are you sure you want to terminate your current session? You will need to re-authenticate to access the unit portal.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-3 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all rounded-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={onLogout}
                    className="py-3 bg-red-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all rounded-none"
                  >
                    Terminate
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessHub;