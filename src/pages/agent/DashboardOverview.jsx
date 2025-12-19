import React from 'react';
import { Wallet, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const DashboardOverview = () => {
  // Dummy Data
  const stats = {
    totalCredits: 120,
    equivalentAmount: 1200, // Based on 1 Credit = ₹10
    payout: 400,
    pending: 200,
    successRate: 64, // Calculated: (Verified / Total) * 100
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group">
          <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 transition-transform group-hover:scale-110">
            <Wallet size={24} />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Credits Balance</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-slate-900">{stats.totalCredits}</h3>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">≈ ₹{stats.equivalentAmount}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <CheckCircle size={24} />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Total Payout</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">₹{stats.payout}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="bg-amber-50 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
            <Clock size={24} />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Processing</p>
          <h3 className="text-3xl font-black text-slate-900 mt-1">₹{stats.pending}</h3>
        </div>

        <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100 text-white overflow-hidden relative">
          <div className="relative z-10">
            <p className="text-[10px] text-indigo-200 font-black uppercase tracking-widest">Success Rate</p>
            <h3 className="text-4xl font-black mt-1">{stats.successRate}%</h3>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                <div className="bg-white h-full" style={{ width: `${stats.successRate}%` }}></div>
              </div>
            </div>
          </div>
          <TrendingUp size={100} className="absolute -bottom-6 -right-6 text-white/10" />
        </div>
      </div>

      {/* 2. RECENT ACTIVITY [cite: 25] */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight mb-6">Recent Lead Status</h4>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm font-bold text-xs">
                  #{i}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Lead Referral - Interior Unit</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Oct {10+i}, 2025</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-lg text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase">Verified</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;