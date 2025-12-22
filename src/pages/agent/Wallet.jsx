import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom'; // 1. Outlet context ചേർത്തു
import { Wallet, ArrowUpRight, CheckCircle, Clock, X, IndianRupee, History, Briefcase } from 'lucide-react';

const WalletPage = () => {
  // 2. AgentHub-ൽ നിന്ന് അയച്ച ഡാറ്റ ഇവിടെ സ്വീകരിക്കുന്നു
  const { myLeads = [], currentUser = {} } = useOutletContext();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  // 3. വിത്ത്ഡ്രോവൽ ഹിസ്റ്ററി ലോഡ് ചെയ്യുന്നു
  useEffect(() => {
    const savedWithdrawals = localStorage.getItem('vynx_withdrawals');
    if (savedWithdrawals) {
      const allWithdrawals = JSON.parse(savedWithdrawals);
      setWithdrawalHistory(allWithdrawals.filter(w => w.agentId === currentUser.id));
    }
  }, [currentUser.id]);

  // 4. വാലറ്റ് ലോജിക് (myLeads ഉപയോഗിക്കുന്നു)
  const walletData = useMemo(() => {
    // ഏജന്റിന്റെ ആകെ ക്രെഡിറ്റുകൾ
    const totalCredits = myLeads.reduce((sum, item) => sum + (item.credits || 0), 0);
    
    // അംഗീകരിച്ച തുക
    const withdrawnAmount = withdrawalHistory
      .filter(w => w.status === 'Approved')
      .reduce((sum, w) => sum + w.amount, 0);
      
    // പ്രോസസ്സിംഗിലുള്ള തുക
    const pendingAmount = withdrawalHistory
      .filter(w => w.status === 'Pending')
      .reduce((sum, w) => sum + w.amount, 0);

    const totalCashEarned = totalCredits * 10; // Rate: 1 Credit = 10 INR
    const availableCash = totalCashEarned - withdrawnAmount - pendingAmount;

    return {
      totalCredits,
      availableCash,
      withdrawnAmount,
      pendingAmount
    };
  }, [myLeads, withdrawalHistory]);

  // 5. വിത്ത്ഡ്രോവൽ റിക്വസ്റ്റ് ഹാൻഡ്ലർ
  const handleFinalConfirm = () => {
    if (walletData.availableCash <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const newRequest = {
        id: `WR-${Math.floor(1000 + Math.random() * 9000)}`,
        agentId: currentUser.id,
        agentName: currentUser.name,
        amount: walletData.availableCash,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().getTime()
      };

      const globalWithdrawals = JSON.parse(localStorage.getItem('vynx_withdrawals') || "[]");
      const updatedGlobal = [newRequest, ...globalWithdrawals];
      localStorage.setItem('vynx_withdrawals', JSON.stringify(updatedGlobal));

      setWithdrawalHistory(updatedGlobal.filter(w => w.agentId === currentUser.id));
      setIsProcessing(false);
      setShowConfirm(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER SECTION */}
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Financial Node</h2>
        <p className="text-sm font-medium text-slate-500 mt-2 italic">Asset ledger and transmission registry for agent {currentUser.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Balance Card - Industrial Dark */}
        <div className="bg-slate-900 text-white p-12 lg:col-span-8 rounded-none shadow-2xl relative overflow-hidden border-b-8 border-indigo-600">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="h-2 w-2 bg-emerald-500 rounded-none animate-pulse"></div>
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Ready for Settlement</p>
            </div>
            <h3 className="text-6xl md:text-8xl font-bold tracking-tighter">₹{walletData.availableCash.toLocaleString()}</h3>
            
            <div className="flex flex-wrap items-center gap-6 mt-10">
                <div className="bg-white/5 border border-white/10 px-5 py-2">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Points</p>
                   <p className="text-sm font-bold">{walletData.totalCredits} CR</p>
                </div>
                <div className="bg-white/5 border border-white/10 px-5 py-2">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Exchange Rate</p>
                   <p className="text-sm font-bold text-indigo-400">1 CR : ₹10</p>
                </div>
            </div>
            
            <button 
              disabled={walletData.availableCash <= 0}
              onClick={() => setShowConfirm(true)}
              className="mt-14 bg-indigo-600 text-white px-10 py-5 rounded-none font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-white hover:text-slate-900 transition-all active:scale-[0.98] shadow-2xl disabled:opacity-30 disabled:grayscale"
            >
              Initialize Withdrawal <ArrowUpRight size={18} />
            </button>
          </div>
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>
          <Wallet size={300} className="absolute -bottom-20 -right-20 text-white/[0.02] rotate-12" />
        </div>

        {/* Sidebar Analytics */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm flex items-center gap-6 group hover:border-indigo-600 transition-all">
            <div className="bg-slate-900 text-white p-4 rounded-none">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Dispatched</p>
              <p className="text-2xl font-bold text-slate-900 uppercase tracking-tight">₹{walletData.withdrawnAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm flex items-center gap-6 group hover:border-amber-500 transition-all">
            <div className="bg-amber-500 text-white p-4 rounded-none">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Awaiting Audit</p>
              <p className="text-2xl font-bold text-slate-900 uppercase tracking-tight">₹{walletData.pendingAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-8 border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center text-center">
             <History size={24} className="text-slate-300 mb-3"/>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">Transactions are logged to the global chain registry automatically.</p>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-none p-12 relative shadow-2xl border border-slate-200"
            >
              <div className="text-center space-y-8">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-none flex items-center justify-center mx-auto shadow-xl">
                  <IndianRupee size={32} />
                </div>
                
                <div>
                   <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Authorize Payout</h3>
                   <p className="text-xs text-slate-500 mt-3 font-medium leading-relaxed uppercase tracking-wider">
                     Initializing secure transmission of settlement request for the available node balance.
                   </p>
                </div>

                <div className="p-8 bg-slate-50 border border-slate-200 rounded-none">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Registry Value</p>
                  <p className="text-5xl font-bold text-indigo-600 tracking-tighter">₹{walletData.availableCash.toLocaleString()}</p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleFinalConfirm}
                    disabled={isProcessing}
                    className="w-full py-5 bg-slate-900 text-white rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? "Transmitting..." : "Confirm & Send"}
                  </button>
                  
                  <button 
                    onClick={() => setShowConfirm(false)}
                    disabled={isProcessing}
                    className="w-full py-3 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] hover:text-rose-600 transition-colors"
                  >
                    Abort Registry Entry
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

export default WalletPage;