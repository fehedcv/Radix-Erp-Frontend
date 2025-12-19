import React from 'react';
import { Wallet, ArrowUpRight, CheckCircle, Clock } from 'lucide-react';

const WalletPage = () => {
  const walletData = {
    totalCredits: 120,
    equivalentAmount: 1200, // 1 Credit = ₹10 logic
    withdrawn: 400,
    pending: 200
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight">MY WALLET</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Manage your earnings and withdrawals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-indigo-900 text-white p-8 rounded-[3rem] shadow-xl relative overflow-hidden lg:col-span-2">
          <div className="relative z-10">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-[0.2em]">Available for Withdrawal</p>
            <h3 className="text-5xl font-black mt-2">₹{walletData.equivalentAmount}</h3>
            <p className="text-indigo-300 text-sm mt-1 font-medium italic">{walletData.totalCredits} Credits accumulated</p>
            
            <button className="mt-10 bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 transition-all">
              Request Withdrawal <ArrowUpRight size={18} />
            </button>
          </div>
          <Wallet size={150} className="absolute -bottom-10 -right-10 text-white/10" />
        </div>

        {/* Mini Stats */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><CheckCircle /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Out</p>
              <p className="text-xl font-black">₹{walletData.withdrawn}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="bg-amber-50 p-4 rounded-2xl text-amber-600"><Clock /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In Process</p>
              <p className="text-xl font-black">₹{walletData.pending}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletPage;