import React from 'react';
import { Wallet, TrendingUp, Clock, CheckCircle, ArrowUpRight } from 'lucide-react';

// Props ആയി leads-ഉം onViewHistory-യും സ്വീകരിക്കുന്നു
const DashboardOverview = ({ leads = [], openModal, onViewHistory }) => {
  
  const stats = {
    totalCredits: 120,
    equivalentAmount: 1200,
    payout: 400,
    pending: 200,
    successRate: 64,
  };

  return (
    <div className="animate-in fade-in duration-500">
      {/* 1. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* ... (നേരത്തെ നൽകിയ സ്റ്റാറ്റ്സ് കാർഡുകൾ ഇവിടെ വരും) ... */}
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

      {/* 2. RECENT LEAD STATUS SECTION */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8">
          <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">Recent Lead Status</h4>
          
          {/* ബട്ടൺ ഇവിടെ അപ്‌ഡേറ്റ് ചെയ്തു */}
          <button 
            onClick={onViewHistory} // ഇതാണ് ഹിസ്റ്ററി പേജിലേക്ക് കൊണ്ടുപോകുന്നത്
            className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 transition-all"
          >
            View All History
          </button>
        </div>

        <div className="space-y-4">
          {/* നമ്മൾ പാസ്സ് ചെയ്ത leads ലിസ്റ്റ് ഇവിടെ ലൂപ്പ് ചെയ്യുന്നു */}
          {leads.slice(0, 4).map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-5 bg-slate-50 rounded-[2rem] border border-transparent hover:border-indigo-100 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm font-black text-[10px] italic">
                  {lead.id}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{lead.clientName}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">{lead.businessUnit} • {lead.service}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                  lead.status === 'Verified' ? 'bg-emerald-50 text-emerald-600' : 
                  lead.status === 'Rejected' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {lead.status}
                </span>
                {/* <button className="p-2 bg-white rounded-xl text-slate-300 hover:text-indigo-600 transition-colors shadow-sm">
                  <ArrowUpRight size={16} />
                </button> */}
              </div>
            </div>
          ))}
          
          {leads.length === 0 && (
            <p className="text-center py-10 text-slate-400 font-bold uppercase text-[10px] tracking-widest">No recent leads found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;