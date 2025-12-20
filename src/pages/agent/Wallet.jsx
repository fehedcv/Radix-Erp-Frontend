import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ArrowUpRight, CheckCircle, Clock, X, AlertCircle, Check } from 'lucide-react';

const WalletPage = () => {
  // 1. STATE MANAGEMENT
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  //
  const walletData = {
    totalCredits: 120,
    equivalentAmount: 1200, // 1 Credit = ₹10 logic
    withdrawn: 400,
    pending: 200
  };

  // 2. HANDLER
  const handleFinalConfirm = () => {
    setIsProcessing(true);
    // Simulation: backend-ലേക്ക് ഡാറ്റ അയക്കുന്നതായി സങ്കൽപ്പിക്കുക
    setTimeout(() => {
      setIsProcessing(false);
      setShowConfirm(false);
      alert("Withdrawal Request Submitted to Admin!");
    }, 2000);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight uppercase">My Wallet</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Manage your earnings and withdrawals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-indigo-900 text-white p-8 md:p-12 rounded-[3rem] shadow-xl relative overflow-hidden lg:col-span-2">
          <div className="relative z-10">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em]">Available for Withdrawal</p>
            <h3 className="text-5xl md:text-6xl font-black mt-2 tracking-tighter">₹{walletData.equivalentAmount}</h3>
            <p className="text-indigo-300 text-sm mt-2 font-medium italic">{walletData.totalCredits} Credits accumulated</p>
            
            <button 
              onClick={() => setShowConfirm(true)}
              className="mt-10 bg-white text-indigo-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-2xl"
            >
              Request Withdrawal <ArrowUpRight size={18} />
            </button>
          </div>
          <Wallet size={200} className="absolute -bottom-10 -right-10 text-white/5" />
        </div>

        {/* Mini Stats */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 group">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Out</p>
              <p className="text-2xl font-black text-slate-900">₹{walletData.withdrawn}</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-5 group">
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Process</p>
              <p className="text-2xl font-black text-slate-900">₹{walletData.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- WITHDRAWAL CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isProcessing && setShowConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl overflow-hidden border border-white"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Confirm Payout</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  You are about to withdraw your full balance.
                </p>

                {/* Amount Display */}
                <div className="my-8 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                  <p className="text-4xl font-black text-indigo-600 tracking-tighter">₹{walletData.equivalentAmount}</p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={handleFinalConfirm}
                    disabled={isProcessing}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Confirm & Submit <Check size={18} /></>
                    )}
                  </button>
                  
                  <button 
                    onClick={() => setShowConfirm(false)}
                    disabled={isProcessing}
                    className="w-full py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Cancel Request
                  </button>
                </div>

                <p className="mt-6 text-[9px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">
                  Note: Payouts are usually processed by the admin within 24-48 business hours.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;