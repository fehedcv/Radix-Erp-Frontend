import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, FolderEdit, Settings, 
  Bell, LogOut, Package, ShieldCheck, X, ArrowRight, 
  MessageSquare, CheckCircle, Clock 
} from 'lucide-react';

// Component Imports
import BusinessOverview from './BusinessOverview';
import ManageLeads from './ManageLeads';
import PortfolioManager from './PortfolioManager';
import BusinessSettings from './BusinessSettings';
import { initialLeads } from '../../data/leadHistoryData';

const BusinessHub = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // 1. SHARED STATE: Leads Data
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  // 2. SHARED STATE: Business Identity
  const [businessInfo, setBusinessInfo] = useState(() => {
    const saved = localStorage.getItem('vynx_business_settings');
    return saved ? JSON.parse(saved) : { businessName: "Interior Design Unit" };
  });

  // 3. UPDATED NOTIFICATION LOGIC
  const notificationLeads = leads.filter(l => 
    (l.status === 'Pending' || l.status === 'Verified') && 
    (l.businessUnit === businessInfo.businessName || l.businessUnit === "Interior Design Unit")
  );

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

  const handleBusinessUpdate = (newData) => {
    setBusinessInfo(newData);
  };

  const updateLeadStatus = (id, newStatus) => {
    const updatedLeads = leads.map(l => l.id === id ? { ...l, status: newStatus } : l);
    setLeads(updatedLeads);
    localStorage.setItem('vynx_leads', JSON.stringify(updatedLeads));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <BusinessOverview leads={leads} />;
      case 'leads': return <ManageLeads businessName={businessInfo.businessName} leads={leads} onUpdateStatus={updateLeadStatus} />;
      case 'portfolio': return <PortfolioManager />;
      case 'settings': return <BusinessSettings onUpdate={handleBusinessUpdate} />;
      default: return <BusinessOverview leads={leads} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'leads', label: 'Incoming Leads', icon: <Users size={18} /> },
    { id: 'portfolio', label: 'Unit Portfolio', icon: <FolderEdit size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-900 overflow-hidden">
      
      {/* SIDEBAR - Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 flex-col shrink-0">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold mr-3">
            B
          </div>
          <span className="font-semibold text-slate-900 tracking-tight">Vynx Business</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-slate-100 text-slate-900' 
                  : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
              }`}
            >
              <span className={activeTab === item.id ? 'text-slate-900' : 'text-slate-400'}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        
        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-3 px-2">
             <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
               UM
             </div>
             <div className="overflow-hidden">
               <p className="text-sm font-medium text-slate-900 truncate">Unit Manager</p>
               <p className="text-xs text-slate-500 truncate">{businessInfo.businessName}</p>
             </div>
           </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
             <div className="lg:hidden h-8 w-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-bold text-sm">
                B
             </div>
             <div>
               <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                 {navItems.find(n => n.id === activeTab)?.label}
               </h2>
             </div>
          </div>
          
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-md transition-colors ${
                showNotifications ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
              }`}
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-12 right-0 w-[320px] sm:w-[380px] bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50 origin-top-right"
                >
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Notifications</span>
                    {notificationCount > 0 && (
                      <span className="bg-slate-900 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                        {notificationCount} New
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-[350px] overflow-y-auto">
                    {notificationLeads.length > 0 ? (
                      notificationLeads.map((note) => (
                        <button 
                          key={note.id}
                          onClick={() => { setActiveTab('leads'); setShowNotifications(false); }}
                          className="w-full p-4 flex gap-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left transition-colors group"
                        >
                          <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 border ${
                            note.status === 'Pending' 
                              ? 'bg-amber-50 border-amber-100 text-amber-600' 
                              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                          }`}>
                            {note.status === 'Pending' ? <Clock size={14} /> : <CheckCircle size={14} />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                               <span className="text-sm font-medium text-slate-900 truncate pr-2">{note.clientName}</span>
                               <span className="text-[10px] text-slate-400 whitespace-nowrap">#{note.id}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">
                              {note.status === 'Pending' ? 'New lead waiting for review.' : 'Lead verified successfully.'}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-sm text-slate-400">No new notifications</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {renderContent()}
            </div>
            {/* Spacer for mobile nav */}
            <div className="h-16 lg:hidden"></div> 
        </main>
      </div>

      {/* MOBILE NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-40">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => setActiveTab(item.id)} 
              className={`flex flex-col items-center justify-center w-full h-full gap-1 ${
                activeTab === item.id ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              <div className={activeTab === item.id ? 'text-slate-900' : 'text-slate-400'}>
                  {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

    </div>
  );
};

export default BusinessHub;