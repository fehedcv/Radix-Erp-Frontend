import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Building2, Wallet, User, Plus, 
  LogOut, Briefcase, History, ChevronRight, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Component Imports
import DashboardOverview from './DashboardOverview';
import BusinessDirectory from './BusinessDirectory';
import BusinessDetail from './BusinessDetail';
import WalletPage from './Wallet';
import ProfilePage from './Profile';
import LeadFormModal from './LeadFormModal';
import LeadHistory from './LeadHistory';

// Data Sources [cite: 53, 54, 55]
import { initialLeads } from '../../data/leadHistoryData';

const AgentHub = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // New state for logout popup
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [viewingBusiness, setViewingBusiness] = useState(null);
  
  // Data Source Logic [cite: 17, 18, 55]
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
    if (!localStorage.getItem('vynx_leads')) {
      localStorage.setItem('vynx_leads', JSON.stringify(initialLeads));
    }
    window.addEventListener('storage', handleSync);
    return () => window.removeEventListener('storage', handleSync);
  }, []);

  // Handler for adding leads [cite: 24, 25, 83]
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
  };

  const openLeadForm = (unitName = "") => {
    setSelectedBusiness(unitName);
    setIsModalOpen(true);
  };

  const viewBusinessPortfolio = (unit) => {
    setViewingBusiness(unit);
    setActiveTab('business-detail');
  };

  const renderContent = () => {
    const myLeads = leads.filter(l => l.agentId === currentUser.id);
    switch(activeTab) {
      case 'home': return <DashboardOverview leads={myLeads} openModal={openLeadForm} onViewHistory={() => setActiveTab('history')} />;
      case 'directory': return <BusinessDirectory onViewDetails={viewBusinessPortfolio} />;
      case 'business-detail': return <BusinessDetail unit={viewingBusiness} openModal={openLeadForm} onBack={() => setActiveTab('directory')} />;
      case 'wallet': return <WalletPage onBack={() => setActiveTab('home')} leads={myLeads} />;
      case 'history': return <LeadHistory leads={myLeads} onBack={() => setActiveTab('home')} />;
      case 'profile': return <ProfilePage onLogout={() => setShowLogoutConfirm(true)} user={currentUser} />;
      default: return <DashboardOverview leads={myLeads} openModal={openLeadForm} />;
    }
  };

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Business Units', icon: Building2 },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'history', label: 'Lead History', icon: History },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const totalCredits = leads.filter(l => l.agentId === currentUser.id).reduce((sum, lead) => sum + (lead.credits || 0), 0);

  const isTabActive = (itemId) => {
    if (activeTab === itemId) return true;
    if (itemId === 'directory' && activeTab === 'business-detail') return true;
    return false;
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* 1. SIDEBAR (DESKTOP) */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 flex items-center justify-center text-white rounded-none">
              <Briefcase size={18} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Vynx Network</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Agent Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between p-3.5 transition-all rounded-none ${
                isTabActive(item.id)
                ? 'bg-indigo-600 text-white shadow-lg' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} />
                <span className="text-xs font-semibold">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform ${isTabActive(item.id) ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <div className="mb-4">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Credits</p>
            <p className="text-xl font-bold text-white tracking-tight">{totalCredits.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-bold rounded-none"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 bg-white z-20">
          <div className="lg:hidden flex items-center gap-3">
             <div className="h-7 w-7 bg-slate-900 flex items-center justify-center text-white rounded-none">
                <Briefcase size={14} />
             </div>
             <span className="text-sm font-bold uppercase">{activeTab}</span>
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation / <span className="text-slate-900">{activeTab.replace('-', ' ')}</span></h2>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => openLeadForm()} 
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-none hover:bg-slate-900 transition-all flex items-center gap-2 text-xs font-bold"
            >
              <Plus size={16} /> Add New Lead
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </main>

      {/* 3. MOBILE FOOTER NAV */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-50">
        {navItems.filter(i => i.id !== 'history').map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)} 
            className={`flex flex-col items-center gap-1 p-2 ${isTabActive(item.id) ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
          </button>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center gap-1 p-2 text-rose-500">
          <LogOut size={20} />
          <span className="text-[10px] font-bold">Logout</span>
        </button>
      </nav>

      {/* LEAD MODAL */}
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialUnit={selectedBusiness}
        onSubmitLead={addNewLead} 
      />

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Card */}
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
                    Are you sure you want to terminate your current session? You will need to re-authenticate to access the portal.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-3 px-4 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={onLogout}
                    className="py-3 px-4 bg-red-600 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
                  >
                    Logout
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

export default AgentHub;