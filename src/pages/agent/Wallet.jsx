import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowUpRight, CheckCircle, Clock, X, IndianRupee, History, Briefcase } from 'lucide-react';

const WalletPage = ({ leads = [] }) => {
  // 1. STATE MANAGEMENT (Logic Preserved)
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('vynx_user') || "{}");

  // 2. LOAD WITHDRAWAL HISTORY (Logic Preserved) 
  useEffect(() => {
    const savedWithdrawals = localStorage.getItem('vynx_withdrawals');
    if (savedWithdrawals) {
      const allWithdrawals = JSON.parse(savedWithdrawals);
      setWithdrawalHistory(allWithdrawals.filter(w => w.agentId === currentUser.id));
    }
  }, [currentUser.id]);

  // 3. DYNAMIC WALLET LOGIC (Logic Preserved) [cite: 26, 43]
  const walletData = useMemo(() => {
    const totalCredits = leads.reduce((sum, item) => sum + (item.credits || 0), 0);
    const withdrawnAmount = withdrawalHistory
      .filter(w => w.status === 'Approved')
      .reduce((sum, w) => sum + w.amount, 0);
    const pendingAmount = withdrawalHistory
      .filter(w => w.status === 'Pending')
      .reduce((sum, w) => sum + w.amount, 0);

    const totalCashEarned = totalCredits * 10;
    const availableCash = totalCashEarned - withdrawnAmount - pendingAmount;

    return {
      totalCredits,
      availableCash,
      withdrawnAmount,
      pendingAmount
    };
  }, [leads, withdrawalHistory]);

  // 4. HANDLER: Submit Withdrawal to Admin (Logic Preserved)
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
    <div className="space-y-8 pb-20">
      {/* HEADER */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">My Wallet</h2>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">Earnings and Payout Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Main Balance Card - Industrial Dark */}
        <div className="bg-slate-900 text-white p-10 rounded-none shadow-xl relative overflow-hidden lg:col-span-2 border border-slate-800">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <div className="h-2 w-2 bg-emerald-500 rounded-none animate-pulse"></div>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Available for Payout</p>
            </div>
            <h3 className="text-6xl font-bold tracking-tighter">₹{walletData.availableCash.toLocaleString()}</h3>
            <div className="flex items-center gap-4 mt-6">
                <span className="bg-white/10 px-4 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest text-slate-300 border border-white/5">
                    {walletData.totalCredits} Credits Total
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Rate: 1 Cr = ₹10</span>
            </div>
            
            <button 
              disabled={walletData.availableCash <= 0}
              onClick={() => setShowConfirm(true)}
              className="mt-12 bg-indigo-600 text-white px-8 py-4 rounded-none font-bold text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-white hover:text-slate-900 transition-all active:scale-[0.98] shadow-lg disabled:opacity-50"
            >
              Request Withdrawal <ArrowUpRight size={18} />
            </button>
          </div>
          <Wallet size={200} className="absolute -bottom-12 -right-12 text-white/[0.03] rotate-12" />
        </div>

        {/* Sidebar Stats - Sharp Framing */}
        <div className="space-y-6">
          <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm flex items-center gap-5 group hover:border-indigo-600 transition-all">
            <div className="bg-slate-100 p-4 rounded-none text-slate-900 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
              <p className="text-2xl font-bold text-slate-900">₹{walletData.withdrawnAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm flex items-center gap-5 group hover:border-amber-600 transition-all">
            <div className="bg-slate-100 p-4 rounded-none text-slate-900 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">In Processing</p>
              <p className="text-2xl font-bold text-slate-900">₹{walletData.pendingAmount.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-6 border border-dashed border-slate-200 rounded-none flex flex-col items-center justify-center text-center bg-slate-50/50">
             <History size={20} className="text-slate-300 mb-2"/>
             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Withdrawal history is logged automatically</p>
          </div>
        </div>
      </div>

      {/* --- WITHDRAWAL CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md rounded-none p-10 relative shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-none flex items-center justify-center mx-auto mb-6">
                  <IndianRupee size={32} />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Confirm Request</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed">
                  You are requesting a settlement of your available balance. This will be sent for approval.
                </p>

                <div className="my-8 p-8 bg-slate-50 border border-slate-200 rounded-none">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                  <p className="text-5xl font-bold text-indigo-600 tracking-tighter">₹{walletData.availableCash.toLocaleString()}</p>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={handleFinalConfirm}
                    disabled={isProcessing}
                    className="w-full py-4 bg-slate-900 text-white rounded-none font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? "Processing..." : "Authorize Request"}
                  </button>
                  
                  <button 
                    onClick={() => setShowConfirm(false)}
                    disabled={isProcessing}
                    className="w-full py-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-rose-600"
                  >
                    Discard Changes
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