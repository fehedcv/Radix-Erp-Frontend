import React, { useState } from 'react';
import { LayoutDashboard, Building2, Wallet, User, Plus, X } from 'lucide-react';
import DashboardOverview from './DashboardOverview';
import BusinessDirectory from './BusinessDirectory';
import BusinessDetail from './BusinessDetail';
import WalletPage from './Wallet';
import ProfilePage from './Profile';
import LeadFormModal from './LeadFormModal';

const AgentHub = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(""); // For the form
  const [viewingBusiness, setViewingBusiness] = useState(null); // For the portfolio page

  // Function to open lead form from anywhere
  const openLeadForm = (unitName = "") => {
    setSelectedBusiness(unitName);
    setIsModalOpen(true);
  };

  // Function to view business portfolio
  const viewBusinessPortfolio = (unit) => {
    setViewingBusiness(unit);
    setActiveTab('business-detail');
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'home': return <DashboardOverview openModal={openLeadForm} />;
      case 'directory': return <BusinessDirectory onViewDetails={viewBusinessPortfolio} />;
      case 'business-detail': return <BusinessDetail unit={viewingBusiness} openModal={openLeadForm} onBack={() => setActiveTab('directory')} />;
      case 'wallet': return <WalletPage />;
      case 'profile': return <ProfilePage />;
      default: return <DashboardOverview openModal={openLeadForm} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 lg:pb-10 font-sans text-slate-900">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-100 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">V</div>
          <h1 className="text-sm font-black tracking-widest uppercase hidden md:block">Business Chain</h1>
        </div>

        <nav className="hidden lg:flex items-center gap-2">
          {['home', 'directory', 'wallet', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab || (activeTab === 'business-detail' && tab === 'directory')
                ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <button onClick={() => openLeadForm()} className="bg-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-100 active:scale-95 transition-all">
          <Plus size={20} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        {renderContent()}
      </main>

      {/* LEAD MODAL */}
      <LeadFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialUnit={selectedBusiness} 
      />

      {/* MOBILE NAV */}
      <nav className="lg:hidden fixed bottom-6 left-6 right-6 bg-white shadow-2xl border border-slate-100 p-4 flex justify-between items-center z-30 rounded-[2rem]">
        <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-indigo-600' : 'text-slate-300'}><LayoutDashboard /></button>
        <button onClick={() => setActiveTab('directory')} className={activeTab === 'directory' || activeTab === 'business-detail' ? 'text-indigo-600' : 'text-slate-300'}><Building2 /></button>
        <button onClick={() => setActiveTab('wallet')} className={activeTab === 'wallet' ? 'text-indigo-600' : 'text-slate-300'}><Wallet /></button>
        <button onClick={() => setActiveTab('profile')} className={activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-300'}><User /></button>
      </nav>
    </div>
  );
};

export default AgentHub;