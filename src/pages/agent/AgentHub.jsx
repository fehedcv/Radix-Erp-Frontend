import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Wallet, User, Plus, 
  LogOut, Briefcase, History, AlertCircle, 
  ShieldCheck, Activity, Bell, Clock 
} from 'lucide-react';

// Lead Modal Import
import LeadFormModal from './LeadFormModal';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';

const AgentHub = ({ onLogout }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  
  const location = useLocation();
  const navigate = useNavigate();

  // 1. DATA LOGIC
  const [leads, setLeads] = useState(() => {
    const savedLeads = localStorage.getItem('vynx_leads');
    return savedLeads ? JSON.parse(savedLeads) : initialLeads;
  });

  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");

  useEffect(() => {
    const handleSync = () => {
      const saved = localStorage.getItem('vynx_leads');
      if (saved) setLeads(JSON.parse(saved));
    };
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  const addNewLead = (formData) => {
    const currentDatabase = JSON.parse(localStorage.getItem('vynx_leads') || "[]");
    const newEntry = {
      id: `L-${Math.floor(Math.random() * 900) + 100}`,
      clientName: formData.clientName,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress || "Not Provided",
      businessUnit: formData.category,
      service: formData.service,
      description: formData.description || "",
      status: "Pending", 
      date: new Date().toISOString().split('T')[0],
      credits: 0,
      agentName: currentUser.name || "Member",
      agentId: currentUser.id || "M-000"
    };
    const updatedLeads = [newEntry, ...currentDatabase];
    localStorage.setItem('vynx_leads', JSON.stringify(updatedLeads));
    setLeads(updatedLeads);
    setIsModalOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/agent/dashboard' },
    { id: 'units', label: 'Partner Units', icon: Building2, path: '/agent/units' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/agent/wallet' },
    { id: 'history', label: 'History', icon: History, path: '/agent/history' },
    { id: 'profile', label: 'Profile', icon: User, path: '/agent/profile' },
  ];

  const myLeads = leads.filter(l => l.agentId === currentUser.id);
  const currentTabName = location.pathname.split('/').pop().replace('-', ' ');

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 z-30 shrink-0">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 bg-[#007ACC] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
              <ShieldCheck size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-[21px] font-black text-slate-900 tracking-tighter leading-none uppercase italic">RADIX</h1>
              <p className="text-[9px] font-black text-[#007ACC] uppercase tracking-[0.3em] mt-1.5 leading-none">Agent Hub</p>
            </div>
          </div>
        </div>

        <div className="px-4 py-6 flex-1 overflow-y-auto no-scrollbar">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6 px-4">Navigation</p>
          <nav className="space-y-1 relative">
            {navItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `group relative flex items-center gap-4 px-6 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  isActive ? 'text-[#007ACC] bg-blue-50/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div 
                        layoutId="active-pill"
                        className="absolute right-0 w-1.5 h-6 bg-[#007ACC] rounded-l-full shadow-[-2px_0_10px_rgba(0,122,204,0.3)]"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6 bg-white border-t border-slate-50">
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="group flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-rose-500 transition-colors uppercase font-bold text-[10px] tracking-[0.2em]"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto relative no-scrollbar">
        
        {/* TOP HEADER */}
        <header className="h-20 flex items-center justify-between px-8  py-2 lg:px-12 sticky top-0 bg-white/80 backdrop-blur-xl z-40 border-b border-slate-200/50 shadow-sm">
          <div>
             <span className="text-[9px] font-black text-[#007ACC] uppercase tracking-[0.2em]"> <span className="text-slate-900 uppercase tracking-widest font-bold">{currentTabName}</span></span>
          </div>

          <button 
            onClick={() => { setSelectedBusiness(""); setIsModalOpen(true); }} 
            className="bg-slate-900 text-white px-6 py-3 hover:bg-[#007ACC] transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg active:scale-95"
          >
            <Plus size={16} strokeWidth={3} /> New Inquiry
          </button>
        </header>

        {/* CONTENT */}
        <div className="px-3 py-3 lg:p-12 max-w-[1600px] w-full mx-auto pb-24">
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Outlet context={{ myLeads, setIsModalOpen, setSelectedBusiness, currentUser }} />
          </motion.div>
        </div>

        {/* FOOTER */}
        {/* <footer className="hidden lg:flex sticky bottom-0 h-10 bg-white/80 backdrop-blur-md border-t border-slate-200 text-slate-400 px-12 items-center justify-between z-30">
           <div className="flex items-center gap-8">
              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em]"><ShieldCheck size={14} className="text-emerald-500" /> Secure Protocol</span>
              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em]"><Activity size={14} className="text-blue-500" /> Network Active</span>
           </div>
           <span className="text-[9px] font-black uppercase tracking-widest opacity-40 italic">Agent v2.1</span>
        </footer> */}
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-between items-center px-2 py-3 z-50 shadow-2xl">
        {navItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 ${isActive ? 'text-[#007ACC]' : 'text-slate-400'}`}
          >
            {({ isActive }) => (
               <>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[8px] font-black uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
               </>
            )}
          </NavLink>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex-1 flex flex-col items-center gap-1 text-rose-500">
           <LogOut size={20} />
           <span className="text-[8px] font-black uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

      {/* 4. SIGN OUT MODAL */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className="bg-white w-full max-w-xs rounded-2xl p-8 shadow-2xl text-center space-y-6"
            >
              <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={30} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sign Out?</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">Are you sure you want to leave? Your session progress is saved automatically.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={() => setShowLogoutConfirm(false)} className="py-3 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={onLogout} className="py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-colors shadow-lg">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. LEAD FORM MODAL (FIXED) */}
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={addNewLead} 
        selectedBusiness={selectedBusiness} 
      />

    </div>
  );
};

export default AgentHub;