import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, TrendingUp, Play, CheckCircle2 } from 'lucide-react';

const BusinessOverview = ({ leads = [] }) => {
  
  // Logic remains exactly the same
  const myLeads = leads.filter(l => l.businessUnit === "IT Solutions");
  
  const stats = {
    total: myLeads.length,
    verified: myLeads.filter(l => l.status === 'Verified').length,
    started: myLeads.filter(l => l.status === 'Started').length,
    inProgress: myLeads.filter(l => l.status === 'In Progress').length,
    completed: myLeads.filter(l => l.status === 'Completed').length,
  };

  const cards = [
    { label: 'Total Received', value: stats.total, icon: <Users size={20}/>, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: 'Verified', value: stats.verified, icon: <CheckCircle size={20}/>, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: 'In Progress', value: stats.inProgress, icon: <Clock size={20}/>, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle2 size={20}/>, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="animate-in fade-in duration-500 space-y-6">
      
      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between mb-4">
               <span className="text-sm font-medium text-gray-500">{card.label}</span>
               <div className={`p-2 rounded-md ${card.bg} ${card.color}`}>
                 {card.icon}
               </div>
            </div>
            <div>
              <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* EFFICIENCY / PROGRESS SECTION */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <TrendingUp size={18} className="text-gray-400" />
               <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Efficiency Tracking</h4>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900">Overall Completion Rate</h3>
            <p className="text-sm text-gray-500 mt-1">Based on total leads vs. completed projects</p>
          </div>
          
          <div className="text-left md:text-right">
             <div className="flex items-baseline gap-1 md:justify-end">
                <h3 className="text-4xl font-bold text-indigo-600">{completionRate}%</h3>
                <span className="text-sm text-gray-400 font-medium">Success</span>
             </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="overflow-hidden h-3 mb-2 text-xs flex rounded-full bg-gray-100">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-gray-400">
             <span>0%</span>
             <span>Target: 100%</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BusinessOverview;