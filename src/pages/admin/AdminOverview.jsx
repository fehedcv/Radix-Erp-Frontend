import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate ഇംപോർട്ട് ചെയ്തു
import { 
  Activity, Users, Building2, Layers, Zap, TrendingUp, 
  ShieldCheck, ArrowRight, ChevronRight, BarChart3, 
  Briefcase, UserPlus, Clock, Database
} from 'lucide-react';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';
import { businessUnits } from '../../data/businessData';

const AdminOverview = () => { // onNavigate പ്രോപ്പ് ഒഴിവാക്കി
  const navigate = useNavigate(); // 2. നാവിഗേഷൻ ഫങ്ക്ഷൻ സെറ്റ് ചെയ്തു
  
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalUnits: 0,
    totalCredits: 0,
    statusCounts: { Pending: 0, Verified: 0, Completed: 0 }
  });

  const latestAgents = [
    { id: 'A-901', name: 'Zaid Al-Farsi', joined: '2 hours ago', status: 'Active' },
    { id: 'A-902', name: 'Sarah Mehmood', joined: '5 hours ago', status: 'Active' },
    { id: 'A-903', name: 'Omar Al-Hassan', joined: '1 day ago', status: 'Pending' },
    { id: 'A-904', name: 'Layla Rashid', joined: '2 days ago', status: 'Active' },
  ];

  useEffect(() => {
    const leadCount = initialLeads.length;
    const unitCount = businessUnits.length;
    const totalCredits = initialLeads.reduce((sum, l) => sum + (l.credits || 0), 0);
    
    const counts = initialLeads.reduce((acc, curr) => {
      const status = (curr.status === 'Verfied' || curr.status === 'Verified') ? 'Verified' : curr.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { Pending: 0, Verified: 0, Completed: 0 });

    setStats({
      totalLeads: leadCount,
      totalUnits: unitCount,
      totalCredits: totalCredits,
      statusCounts: counts
    });
  }, []);

  const calculateWidth = (count) => {
    return stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0;
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. TOP OPERATIONAL HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">System Overview</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 italic">Vynx Network Centralized Intelligence Feed</p>
        </div>
        <button 
          onClick={() => navigate('/admin/leads')} // മാറ്റം വരുത്തി
          className="px-6 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-none hover:bg-indigo-600 transition-all flex items-center gap-3 shadow-lg active:scale-[0.98]"
        >
          Audit Master Registry <ArrowRight size={16} />
        </button>
      </div>

      {/* 2. CORE PERFORMANCE NODES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Cumulative Leads', val: stats.totalLeads, icon: <Layers size={18}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Active Business Units', val: stats.totalUnits, icon: <Building2 size={18}/>, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Network Credits', val: stats.totalCredits, icon: <Zap size={18}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Registered Agents', val: '42', icon: <Users size={18}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((m, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-none shadow-sm group hover:border-indigo-600 transition-all">
            <div className={`w-10 h-10 rounded-none flex items-center justify-center mb-6 border transition-colors ${m.bg} ${m.color} border-current/10`}>
              {m.icon}
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{m.label}</p>
            <h3 className="text-4xl font-bold text-slate-900 tracking-tighter">{m.val}</h3>
          </div>
        ))}
      </div>

      {/* 3. REGISTRY THROUGHPUT & TOP UNITS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* PIPELINE MONITOR */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden flex flex-col">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
             <BarChart3 size={18} className="text-indigo-600" />
             <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Lead Pipeline Registry</h4>
          </div>
          <div className="p-10 space-y-8 flex-1">
            {[
              { label: 'Unverified Entries', count: stats.statusCounts.Pending, color: 'bg-amber-500' },
              { label: 'Authorized Nodes', count: stats.statusCounts.Verified, color: 'bg-indigo-600' },
              { label: 'Settled Projects', count: stats.statusCounts.Completed, color: 'bg-emerald-600' }
            ].map((row, i) => (
              <div key={i} className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">{row.count} Units Found</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-none overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} animate={{ width: `${calculateWidth(row.count)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`${row.color} h-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UNIT DIRECTORY SNAPSHOT */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-none shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Briefcase size={16} className="text-indigo-600" /> Priority Units
            </h4>
            {/* NavLink അല്ലെങ്കിൽ navigate ഉപയോഗിക്കാം */}
            <button onClick={() => navigate('/admin/units')} className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-slate-900 transition-colors">View Directory</button>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {businessUnits.slice(0, 5).map((unit, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-none hover:bg-white hover:border-indigo-600 transition-all cursor-pointer group">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="w-8 h-8 rounded-none bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Database size={14} />
                  </div>
                  <div className="truncate">
                    <p className="text-[11px] font-bold text-slate-900 uppercase leading-none truncate">{unit.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase truncate tracking-widest">{unit.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. AGENT NETWORK & GOVERNANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LATEST AGENT REGISTRY */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
          <div className="px-8 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <UserPlus size={16} className="text-emerald-600" /> Field Agent Onboarding
            </h4>
            <button onClick={() => navigate('/admin/agents')} className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest hover:text-slate-900">Directory</button>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestAgents.map((agent, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-none hover:bg-slate-50 transition-all group">
                <div className="w-12 h-12 rounded-none bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {agent.name.split(' ')[0][0]}{agent.name.split(' ')[1][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-tight">{agent.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                     <Clock size={10} className="text-slate-400" />
                     <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{agent.joined} • {agent.id}</p>
                  </div>
                </div> 
                <div className={`w-1.5 h-1.5 rounded-none ${agent.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'} shadow-sm`} />
              </div>
            ))}
          </div>
        </div>

        {/* FINANCIAL GOVERNANCE NODE */}
        <div className="lg:col-span-4 bg-slate-900 p-10 rounded-none flex flex-col justify-between shadow-xl relative overflow-hidden group">
          <ShieldCheck size={180} className="absolute -bottom-12 -right-12 text-white/[0.03] rotate-12 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 space-y-4">
            <div className="p-3 bg-indigo-600 text-white w-fit">
               <ShieldCheck size={20} />
            </div>
            <h3 className="text-white text-3xl font-bold uppercase tracking-tighter leading-tight">Financial<br/>Management</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Manual Settlement Protocol</p>
          </div>
          <button 
            onClick={() => navigate('/admin/credits')} // മാറ്റം വരുത്തി
            className="relative z-10 w-full py-4 mt-12 bg-white text-slate-900 rounded-none font-bold text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-[0.98]"
          >
            Access Asset Vault
          </button>
        </div>
      </div>

    </div>
  );
};

export default AdminOverview;