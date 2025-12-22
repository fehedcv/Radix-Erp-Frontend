import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom'; // 1. Outlet context ചേർത്തു
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, TrendingUp, CheckCircle2, Briefcase } from 'lucide-react';

const BusinessOverview = () => {
  // 2. BusinessHub-ൽ നിന്ന് അയച്ച context ഡാറ്റ ഇവിടെ സ്വീകരിക്കുന്നു
  const { leads = [], businessName } = useOutletContext();

  // 3. ലോഗിൻ ചെയ്ത ബിസിനസ് യൂണിറ്റിന് വേണ്ടിയുള്ള ലീഡുകൾ ഫിൽട്ടർ ചെയ്യുന്നു (Dynamic Logic)
  const myLeads = useMemo(() => {
    return leads.filter(l => l.businessUnit === businessName);
  }, [leads, businessName]);

  const stats = useMemo(() => ({
    total: myLeads.length,
    verified: myLeads.filter(l => l.status === 'Verified').length,
    started: myLeads.filter(l => l.status === 'Started').length,
    inProgress: myLeads.filter(l => l.status === 'In Progress').length,
    completed: myLeads.filter(l => l.status === 'Completed').length,
  }), [myLeads]);

  const cards = [
    { label: 'Total Received', value: stats.total, icon: <Users size={20}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Verified Leads', value: stats.verified, icon: <CheckCircle size={20}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Active Progress', value: stats.inProgress, icon: <Clock size={20}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={20}/>, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-10">
      
      {/* 1. UNIT IDENTITY HEADER */}
      <div className="border-l-4 border-indigo-600 pl-6 py-2">
         <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">{businessName} Analytics</h2>
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Live Operational Intelligence Feed</p>
      </div>

      {/* 2. STATS GRID - Sharp Industrial Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-none border border-slate-200 shadow-sm hover:border-indigo-600 transition-all group"
          >
            <div className="flex items-center justify-between mb-8">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</span>
               <div className={`p-3 rounded-none ${card.bg} ${card.color} transition-transform group-hover:-translate-y-1 shadow-sm`}>
                 {card.icon}
               </div>
            </div>
            <div>
              <h3 className="text-5xl font-bold text-slate-900 tracking-tighter">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. EFFICIENCY / PROGRESS SECTION */}
      <div className="bg-slate-900 text-white p-10 rounded-none shadow-2xl relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-10 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-600">
                  <TrendingUp size={18} className="text-white" />
               </div>
               <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.3em]">Performance Metrics</h4>
            </div>
            <h3 className="text-4xl font-bold tracking-tight uppercase leading-none">Unit Success Rate</h3>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider max-w-md">Calculated based on the ratio of successfully closed leads to the total received volume.</p>
          </div>
          
          <div className="text-left md:text-right">
             <div className="flex items-baseline gap-3 md:justify-end">
                <h3 className="text-7xl font-bold text-indigo-500 tracking-tighter">{completionRate}%</h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Achieved</span>
             </div>
          </div>
        </div>

        {/* Sharp Progress Bar */}
        <div className="relative z-10">
          <div className="overflow-hidden h-2.5 mb-4 bg-white/5 rounded-none border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]"
            />
          </div>
          <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
             <span>Baseline Registry</span>
             <span>Current Performance Ceiling</span>
          </div>
        </div>

        {/* Decorative Background Icon */}
        <Briefcase size={250} className="absolute -bottom-20 -right-20 text-white/[0.02] -rotate-12 group-hover:scale-110 transition-transform duration-1000 pointer-events-none" />
      </div>

      {/* 4. FOOTER STATUS LINK */}
      <div className="flex items-center gap-4 py-6 border-t border-slate-200">
        <div className="h-2 w-2 rounded-none bg-emerald-500 animate-pulse"></div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
          Infrastructure Node Link Active • Global HQ Database Synchronized
        </p>
      </div>

    </div>
  );
};

export default BusinessOverview;