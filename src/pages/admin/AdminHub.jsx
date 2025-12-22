import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  useNavigate 
} from 'react-router-dom'; // Added routing hooks
import { 
  ShieldAlert, LayoutDashboard, Building2, Users, 
  CreditCard, PieChart, LogOut, Bell,
  ArrowRight, Wallet, CheckCircle2, X, Menu, AlertCircle, Briefcase
} from 'lucide-react';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';

const AdminHub = ({ onLogout }) => {
  // REMOVED: activeTab state (Now handled by URL)
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const notificationRef = useRef(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // 1. DATA SOURCE (Logic Preserved)
  const [leads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    return saved ? JSON.parse(saved) : initialLeads;
  });

  // 2. NOTIFICATION LOGIC (Logic Preserved)
  const pendingSettlements = leads.filter(l => 
    (l.status === 'Verified' || l.status === 'Completed') && (!l.credits || l.credits === 0)
  );

  const withdrawalRequests = [
    { id: 'W-901', agent: 'Zaid Al-Farsi', amount: 500, time: '10m ago' },
    { id: 'W-905', agent: 'Suhail Ahmed', amount: 1200, time: '1h ago' }
  ];

  const totalNotifications = pendingSettlements.length + withdrawalRequests.length;

  // 3. EVENT HANDLERS
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Updated menuItems with 'path' instead of just 'id'
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'leads', label: 'Leads', icon: PieChart, path: '/admin/leads' },
    { id: 'units', label: 'Units', icon: Building2, path: '/admin/units' },
    { id: 'agents', label: 'Agents', icon: Users, path: '/admin/agents' },
    { id: 'credits', label: 'Settlements', icon: CreditCard, path: '/admin/credits' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100">
      
      {/* 1. DESKTOP SIDEBAR - Authority Layer */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 sticky top-0 h-screen z-30">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-indigo-600 flex items-center justify-center text-white rounded-none">
              <ShieldAlert size={18} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight uppercase">Admin Panel</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Global HQ System</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center gap-4 px-4 py-3.5 rounded-none text-xs font-bold uppercase tracking-widest transition-all ${
                isActive
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50">
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors text-xs font-bold rounded-none uppercase tracking-widest"
          >
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 sticky top-0 bg-white z-20">
          <div className="flex items-center gap-4">
             {/* Network Status Node */}
             <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Network Operational</span>
             </div>
             <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
             <span className="hidden sm:block text-[10px] font-bold text-slate-900 uppercase tracking-widest">
                {/* Dynamically reading the current route name */}
                Portal / {location.pathname.split('/').pop().replace('-', ' ')}
             </span>
          </div>

          <div className="flex items-center gap-4">
            {/* NOTIFICATION HUB */}
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 border transition-all rounded-none ${showNotifications ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
              >
                <Bell size={20} />
                {totalNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 border border-white flex items-center justify-center text-[8px] font-bold text-white shadow-sm">
                    {totalNotifications}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-12 right-0 w-80 md:w-96 bg-white border border-slate-200 shadow-2xl rounded-none overflow-hidden z-[100]"
                  >
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Action Queue</h4>
                      <span className="text-[9px] font-bold text-indigo-600 uppercase bg-white px-2 py-0.5 border border-indigo-100">{totalNotifications} Tasks</span>
                    </div>

                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
                      {withdrawalRequests.map(req => (
                        <button key={req.id} onClick={() => { navigate('/admin/agents'); setShowNotifications(false); }} className="w-full p-4 flex items-start gap-4 hover:bg-slate-50 text-left transition-all group">
                          <div className="h-9 w-9 bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 rounded-none"><Wallet size={16}/></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payout • {req.time}</p>
                            <h5 className="text-xs font-bold text-slate-900 truncate uppercase tracking-tight">{req.agent} / ₹{req.amount}</h5>
                            <p className="text-[9px] text-indigo-600 font-bold mt-1 uppercase flex items-center gap-1">Process <ArrowRight size={10}/></p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className="w-full py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all">Close Registry</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="h-8 w-8 bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold rounded-none uppercase">HQ</div>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl w-full mx-auto pb-24">
          <motion.div
            key={location.pathname} // Animation triggers on route change
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {/* --- THIS RENDERS THE SUB-PAGE COMPONENT --- */}
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAV - Functional Layer */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => (
          <NavLink 
            key={item.id}
            to={item.path} 
            className={({ isActive }) => `flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <item.icon size={20} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
          </NavLink>
        ))}
        <button onClick={() => setShowLogoutConfirm(true)} className="flex flex-col items-center gap-1 p-2 text-rose-500">
          <LogOut size={20} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Exit</span>
        </button>
      </nav>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-sm rounded-none p-10 relative shadow-2xl border border-slate-200"
            >
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-none flex items-center justify-center mx-auto border border-red-100">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Confirm Exit</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Terminate the global administrative session? All secure link protocols will be disconnected.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button 
                    onClick={() => setShowLogoutConfirm(false)}
                    className="py-4 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all rounded-none"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={onLogout}
                    className="py-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest shadow-xl hover:bg-red-700 transition-all rounded-none"
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

export default AdminHub;