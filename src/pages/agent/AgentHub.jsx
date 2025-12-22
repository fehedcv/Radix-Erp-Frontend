import React, { useState, useEffect } from 'react';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Wallet, User, Plus, 
  LogOut, Briefcase, History, ChevronRight, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  // Data Source Logic
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

  // Handler for adding leads
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
      agentName: currentUser.name || "Unknown Agent",
      agentId: currentUser.id || "A-000"
    };
    const updatedLeads = [newEntry, ...currentDatabase];
    localStorage.setItem('vynx_leads', JSON.stringify(updatedLeads));
    setLeads(updatedLeads);
    setIsModalOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/agent/dashboard' },
    { id: 'units', label: 'Business Units', icon: Building2, path: '/agent/units' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/agent/wallet' },
    { id: 'history', label: 'Lead History', icon: History, path: '/agent/history' },
    { id: 'profile', label: 'My Profile', icon: User, path: '/agent/profile' },
  ];

  const myLeads = leads.filter(l => l.agentId === currentUser.id);
  const totalCredits = myLeads.reduce((sum, lead) => sum + (lead.credits || 0), 0);

  // Get current path name for header display
  const currentTabName = location.pathname.split('/').pop().replace('-', ' ');

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 flex items-center justify-center text-white">
              <Briefcase size={18} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight uppercase">Radix Agent</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Network Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
                w-full flex items-center justify-between p-3.5 transition-all
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight size={14} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="mb-6 bg-slate-800/50 p-4 border-l-2 border-indigo-600">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Asset Ledger</p>
            <p className="text-xl font-bold text-white tracking-tighter">₹{totalCredits.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} /> Logout Node
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
             <div className="lg:hidden h-8 w-8 bg-slate-900 text-white flex items-center justify-center"><Briefcase size={16}/></div>
             <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               Navigation / <span className="text-slate-900">{currentTabName}</span>
             </h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setSelectedBusiness(""); setIsModalOpen(true); }} 
              className="bg-slate-900 text-white px-5 py-2.5 hover:bg-indigo-600 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest shadow-lg"
            >
              <Plus size={14} /> New Lead
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto pb-24">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ഈ Outlet വഴിയാണ് സബ്-പേജുകൾ ലോഡ് ചെയ്യുന്നത്. 
               context പ്രോപ്പ് വഴി എല്ലാ സബ് പേജുകൾക്കും ഡാറ്റ ലഭ്യമാക്കാം.
            */}
            <Outlet context={{ myLeads, setIsModalOpen, setSelectedBusiness, currentUser }} />
          </motion.div>
        </div>
      </main>

      {/* 3. MOBILE FOOTER NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-50">
        {navItems.filter(i => i.id !== 'history').map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <item.icon size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center gap-1 p-2 text-rose-500">
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

      {/* MODALS */}
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialUnit={selectedBusiness}
        onSubmitLead={addNewLead} 
      />

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-sm p-10 shadow-2xl border border-slate-200 text-center space-y-6"
            >
                <div className="w-16 h-16 bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold uppercase tracking-tight">Terminate Session</h3>
                  <p className="text-sm text-slate-500 font-medium">Are you sure you want to disconnect from the agent portal registry?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowLogoutConfirm(false)} className="py-4 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">Abort</button>
                  <button onClick={onLogout} className="py-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl">Logout</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentHub;