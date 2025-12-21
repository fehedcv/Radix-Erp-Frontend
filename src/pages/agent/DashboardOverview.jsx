import React, { useMemo } from 'react';
import { Wallet, Clock, CheckCircle, ArrowUpRight, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardOverview = ({ leads = [], openModal, onViewHistory }) => {
  
  // 1. DYNAMIC STATS CALCULATION [cite: 26, 43, 44]
  const stats = useMemo(() => {
    const totalCredits = leads.reduce((sum, item) => sum + (item.credits || 0), 0);
    const verifiedLeads = leads.filter(l => l.status === 'Verified' || l.status === 'Completed').length;
    const pendingLeads = leads.filter(l => l.status === 'Pending').length;
    
    const successRate = leads.length > 0 
      ? Math.round((verifiedLeads / leads.length) * 100) 
      : 0;

    return {
      totalCredits,
      equivalentAmount: totalCredits, 
      payouts: 0, 
      processingCount: pendingLeads,
      successRate
    };
  }, [leads]);

  return (
    <div className="space-y-10">
      
      {/* 1. ANALYTICS GRID [cite: 42, 60] */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Credits Card [cite: 26, 45] */}
        <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm group hover:border-indigo-600 transition-all">
          <div className="bg-slate-900 w-12 h-12 rounded-none flex items-center justify-center text-white mb-6 transition-transform group-hover:-translate-y-1">
            <Wallet size={24} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Wallet Balance</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{stats.totalCredits.toLocaleString()}</h3>
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Credits</span>
          </div>
          <p className="text-xs font-bold text-slate-300 mt-1 uppercase">Value: ₹{stats.equivalentAmount.toLocaleString()}</p>
        </div>

        {/* Payout Card [cite: 44, 45] */}
        <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm group">
          <div className="bg-slate-100 w-12 h-12 rounded-none flex items-center justify-center text-slate-900 mb-6 transition-transform group-hover:rotate-3">
            <TrendingUp size={24} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Total Earnings</p>
          <h3 className="text-3xl font-bold text-slate-900">₹{stats.payouts}</h3>
          <p className="text-xs font-bold text-slate-300 mt-1 uppercase">Processed Payouts</p>
        </div>

        {/* Pending Card [cite: 25] */}
        <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm">
          <div className="bg-slate-100 w-12 h-12 rounded-none flex items-center justify-center text-slate-900 mb-6">
            <Clock size={24} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Active Pipeline</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-slate-900">{stats.processingCount}</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Leads</span>
          </div>
          <p className="text-xs font-bold text-slate-300 mt-1 uppercase">Pending Review</p>
        </div>

        {/* Success Rate Card [cite: 42] */}
        <div className="bg-indigo-600 p-8 rounded-none shadow-xl shadow-indigo-100 text-white overflow-hidden relative group">
          <div className="relative z-10">
            <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest mb-2">Success Score</p>
            <h3 className="text-4xl font-bold tracking-tight">{stats.successRate}%</h3>
            <div className="mt-6 flex items-center gap-2">
              <div className="flex-1 bg-white/20 rounded-none h-1 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.successRate}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="bg-white h-full"
                ></motion.div>
              </div>
            </div>
          </div>
          <BarChart3 size={100} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

      {/* 2. RECENT ACTIVITY LIST [cite: 30, 39] */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm">
        <div className="flex justify-between items-center p-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
             <h4 className="font-bold text-slate-900 text-lg uppercase tracking-tight">Recent Lead Activity</h4>
          </div>
          
          <button 
            onClick={onViewHistory} 
            className="group flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-slate-900 transition-all uppercase tracking-widest"
          >
            View All History <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"/>
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {leads.slice(0, 5).map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all group">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white border border-slate-200 rounded-none flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors">
                  {lead.id}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-1">{lead.clientName}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{lead.businessUnit}</span>
                    <span className="h-1 w-1 bg-slate-200 rounded-none"></span>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">{lead.service}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-10">
                {lead.credits > 0 && (
                  <div className="hidden sm:block text-right">
                    <p className="text-[9px] font-bold text-slate-300 uppercase mb-1">Earned</p>
                    <p className="text-sm font-bold text-emerald-600">+{lead.credits}</p>
                  </div>
                )}

                <div className={`px-4 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest border ${
                  lead.status === 'Verified' || lead.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  lead.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 
                  'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {lead.status}
                </div>
              </div>
            </div>
          ))}
          
          {leads.length === 0 && (
            <div className="text-center py-20 bg-slate-50/50">
                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest mb-6">No Activity Detected in Pipeline</p>
                <button 
                  onClick={() => openModal()} 
                  className="px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-colors rounded-none"
                >
                  Create Initial Lead Submission
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;