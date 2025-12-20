import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Building2, Wallet, User, Plus } from 'lucide-react';

// Component Imports
import DashboardOverview from './DashboardOverview';
import BusinessDirectory from './BusinessDirectory';
import BusinessDetail from './BusinessDetail';
import WalletPage from './Wallet';
import ProfilePage from './Profile';
import LeadFormModal from './LeadFormModal';
import LeadHistory from './LeadHistory'; // <--- THIS WAS MISSING
import { initialLeads } from '../../data/leadHistoryData';

const AgentHub = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [viewingBusiness, setViewingBusiness] = useState(null);
  
  // 1. STATE MANAGEMENT WITH PERSISTENCE
  const [leads, setLeads] = useState(() => {
    const savedLeads = localStorage.getItem('vynx_leads');
    return savedLeads ? JSON.parse(savedLeads) : initialLeads;
  });

  // 2. SAVE TO LOCALSTORAGE
  useEffect(() => {
    localStorage.setItem('vynx_leads', JSON.stringify(leads));
  }, [leads]);

  // 3. HANDLERS
  const addNewLead = (formData) => {
    const newEntry = {
      id: `L-${Math.floor(Math.random() * 900) + 100}`,
      clientName: formData.clientName,
      businessUnit: formData.category,
      service: formData.service,
      status: "Pending", 
      date: new Date().toISOString().split('T')[0],
      credits: 0
    };
    setLeads([newEntry, ...leads]);
  };

  const openLeadForm = (unitName = "") => {
    setSelectedBusiness(unitName);
    setIsModalOpen(true);
  };

  const viewBusinessPortfolio = (unit) => {
    setViewingBusiness(unit);
    setActiveTab('business-detail');
  };

  // 4. NAVIGATION LOGIC
  const renderContent = () => {
    switch(activeTab) {
      case 'home': 
        return (
          <DashboardOverview 
            leads={leads} 
            openModal={openLeadForm}  
            onViewHistory={() => setActiveTab('history')}
          />
        );
      case 'directory': 
        return <BusinessDirectory onViewDetails={viewBusinessPortfolio} />;
      case 'business-detail': 
        return (
          <BusinessDetail 
            unit={viewingBusiness} 
            openModal={openLeadForm} 
            onBack={() => setActiveTab('directory')} 
          />
        );
      case 'wallet': 
        return <WalletPage />;
      case 'history': 
        return <LeadHistory leads={leads} onBack={() => setActiveTab('home')} />;
      case 'profile': 
        return <ProfilePage />;
      default: 
        return <DashboardOverview leads={leads} openModal={openLeadForm} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pb-10 font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">V</div>
          <h1 className="text-sm font-black tracking-widest uppercase hidden md:block tracking-tighter">Vynx Business Chain</h1>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {['home', 'directory', 'wallet', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab || (activeTab === 'business-detail' && tab === 'directory') || (activeTab === 'history' && tab === 'home')
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button 
          onClick={() => openLeadForm()} 
          className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 hover:bg-slate-900 active:scale-95 transition-all"
        >
          <Plus size={20} />
        </button>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        {renderContent()}
      </main>

      {/* LEAD MODAL */}
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialUnit={selectedBusiness}
        onSubmitLead={addNewLead} 
      />

      {/* MOBILE NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl border border-white/10 px-8 py-4 flex justify-between items-center z-30 rounded-[2.5rem] shadow-2xl shadow-indigo-100">
        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'home' || activeTab === 'history' ? 'text-indigo-600' : 'text-slate-300'}`}>
          <LayoutDashboard size={20} />
          <span className="text-[8px] font-black uppercase">Home</span>
        </button>
        <button onClick={() => setActiveTab('directory')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'directory' || activeTab === 'business-detail' ? 'text-indigo-600' : 'text-slate-300'}`}>
          <Building2 size={20} />
          <span className="text-[8px] font-black uppercase">Units</span>
        </button>
        <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'wallet' ? 'text-indigo-600' : 'text-slate-300'}`}>
          <Wallet size={20} />
          <span className="text-[8px] font-black uppercase">Wallet</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-300'}`}>
          <User size={20} />
          <span className="text-[8px] font-black uppercase">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default AgentHub;