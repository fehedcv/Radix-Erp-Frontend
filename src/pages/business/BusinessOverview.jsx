import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, TrendingUp, CheckCircle2, Briefcase } from 'lucide-react';

const BusinessOverview = ({ leads = [] }) => {
  
  // Logic preserved: Filter for specific unit performance [cite: 29-30]
  const myLeads = leads.filter(l => l.businessUnit === "IT Solutions");
  
  const stats = {
    total: myLeads.length,
    verified: myLeads.filter(l => l.status === 'Verified').length,
    started: myLeads.filter(l => l.status === 'Started').length,
    inProgress: myLeads.filter(l => l.status === 'In Progress').length,
    completed: myLeads.filter(l => l.status === 'Completed').length,
  };

  const cards = [
    { label: 'Total Received', value: stats.total, icon: <Users size={20}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Verified Leads', value: stats.verified, icon: <CheckCircle size={20}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Progress', value: stats.inProgress, icon: <Clock size={20}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={20}/>, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      
      {/* 1. STATS GRID - Sharp Industrial Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-none border border-slate-200 shadow-sm hover:border-indigo-600 transition-all group">
            <div className="flex items-center justify-between mb-6">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.label}</span>
               <div className={`p-2.5 rounded-none ${card.bg} ${card.color} transition-transform group-hover:-translate-y-1`}>
                 {card.icon}
               </div>
            </div>
            <div>
              <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 2. EFFICIENCY / PROGRESS SECTION */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
               <TrendingUp size={16} className="text-indigo-600" />
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency Metrics</h4>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Project Completion Rate</h3>
            <p className="text-sm text-slate-500 font-medium italic">Based on the ratio of successfully closed leads within this unit[cite: 33].</p>
          </div>
          
          <div className="text-left md:text-right">
             <div className="flex items-baseline gap-2 md:justify-end">
                <h3 className="text-5xl font-bold text-indigo-600 tracking-tighter">{completionRate}%</h3>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Success Rate</span>
             </div>
          </div>
        </div>

        {/* Sharp Progress Bar */}
        <div className="relative">
          <div className="overflow-hidden h-2 mb-3 bg-slate-100 rounded-none">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-indigo-600"
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <span>Initial Stage</span>
             <span>Target Achievement</span>
          </div>
        </div>
      </div>

      {/* 3. UNIT FOOTER INFO */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        <div className="p-2 bg-slate-900 text-white rounded-none">
          <Briefcase size={14} />
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Business Unit Performance Analytics • Live Data Link
        </p>
      </div>

    </div>
  );
};

export default BusinessOverview;