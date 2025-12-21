import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserX, Search, 
  Mail, Calendar, Wallet, 
  TrendingUp, X, Shield, Filter, Download, ChevronDown,
  BarChart3, Settings, ShieldAlert
} from 'lucide-react';

const AgentControl = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedAgent, setSelectedAgent] = useState(null);

  // 1. DATA SOURCE (Logic Preserved)
  const [agents] = useState([
    { id: 'A-420', name: 'Zaid Al-Farsi', email: 'zaid.f@vynx.com', joined: '2025-10-12', totalLeads: 24, balance: 1250, status: 'Active' },
    { id: 'A-109', name: 'Suhail Ahmed', email: 'suhail.a@vynx.com', joined: '2025-11-05', totalLeads: 18, balance: 800, status: 'Active' },
    { id: 'A-215', name: 'Omar Khan', email: 'omar.k@vynx.com', joined: '2025-11-20', totalLeads: 5, balance: 150, status: 'Restricted' },
    { id: 'A-332', name: 'Layla Rashid', email: 'layla.r@vynx.com', joined: '2025-12-01', totalLeads: 32, balance: 4200, status: 'Active' },
    { id: 'A-445', name: 'Priya Kapoor', email: 'priya.k@vynx.com', joined: '2025-12-10', totalLeads: 12, balance: 600, status: 'Active' },
  ]);

  // 2. FILTERING LOGIC (Logic Preserved)
  const filteredAgents = agents.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 3. EXPORT FUNCTION (Logic Preserved)
  const handleExport = () => {
    const headers = ["Agent ID", "Name", "Email", "Date Joined", "Total Leads", "Wallet Balance", "Status"];
    const csvRows = [
      headers.join(','), 
      ...filteredAgents.map(agent => [
        agent.id, `"${agent.name}"`, agent.email, agent.joined, agent.totalLeads, agent.balance, agent.status
      ].join(','))
    ];
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Vynx_Agents_Roster_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. HEADER & CONTROL REGISTRY */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Agent Directory</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 italic">Authorized personnel and performance tracking logs.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search Registry */}
          <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-none flex items-center gap-3 w-full md:w-72 focus-within:border-indigo-600 transition-all">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Search ID or Name..." 
              className="bg-transparent outline-none text-xs font-semibold w-full text-slate-900 uppercase placeholder:text-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-none cursor-pointer hover:bg-slate-50 transition-colors">
              <Filter size={16} className="text-indigo-600" />
              <select 
                className="bg-transparent text-[10px] font-bold uppercase tracking-widest text-slate-700 outline-none cursor-pointer appearance-none pr-8"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Network Nodes</option>
                <option value="Active">Active Units</option>
                <option value="Restricted">Restricted Access</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Export Command */}
          <button 
            onClick={handleExport}
            className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-3 rounded-none text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
          >
            <Download size={14} /> Export Roster File
          </button>
        </div>
      </div>

      {/* 2. AGENT GRID WORKSPACE */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <div key={agent.id} className="bg-white border border-slate-200 rounded-none p-6 relative group hover:border-indigo-600 transition-all shadow-sm">
              
              <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-bold uppercase border-l border-b ${
                agent.status === 'Active' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {agent.status}
              </div>

              <div className="flex items-center gap-5 mb-8 pt-2">
                <div className="h-14 w-14 bg-slate-900 rounded-none flex items-center justify-center text-white font-bold text-xl border-b-2 border-indigo-600">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 uppercase tracking-tight mb-1">{agent.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node ID: <span className="text-indigo-600 font-mono">{agent.id}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-slate-200 border border-slate-200 mb-8">
                <div className="bg-slate-50 p-4">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Leads Logged</p>
                  <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-600" />
                      <p className="text-xl font-bold text-slate-900">{agent.totalLeads}</p>
                  </div>
                </div>
                <div className="bg-slate-50 p-4">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Credits</p>
                  <div className="flex items-center gap-2">
                      <Wallet size={16} className="text-indigo-600" />
                      <p className="text-xl font-bold text-slate-900">{agent.balance}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => setSelectedAgent(agent)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all rounded-none"
                >
                  Analyze Node
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-none transition-all">
                  <UserX size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white border border-dashed border-slate-200 rounded-none">
             <Users size={48} className="text-slate-100 mx-auto mb-4" />
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">No registry matches found.</p>
          </div>
        )}
      </div>

      {/* 3. REGISTRY INSPECTOR (DETAIL DRAWER) */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                onClick={() => setSelectedAgent(null)} 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white w-full max-w-md h-full relative shadow-2xl border-l border-slate-200 flex flex-col rounded-none"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Registry_Inspector</span>
                <button 
                  onClick={() => setSelectedAgent(null)} 
                  className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors rounded-none"
                >
                  <X size={20}/>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-10 space-y-12">
                {/* Identity Block */}
                <div className="text-center space-y-4">
                   <div className="h-24 w-24 bg-slate-900 rounded-none flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-2xl border-b-4 border-indigo-600">
                     {selectedAgent.name[0]}
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{selectedAgent.name}</h3>
                     <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-none text-[10px] font-bold font-mono tracking-widest">{selectedAgent.id}</span>
                        <span className={`px-3 py-1 rounded-none text-[10px] font-bold uppercase tracking-widest ${selectedAgent.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {selectedAgent.status}
                        </span>
                     </div>
                   </div>
                </div>

                <div className="space-y-10">
                  {/* Communication Block */}
                  <section className="space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-3">
                        Verified Contact Data
                    </h5>
                    <div className="grid grid-cols-1 gap-3">
                       <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-none">
                         <Mail size={18} className="text-indigo-600"/>
                         <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Access Email</p>
                             <p className="text-sm font-semibold text-slate-900 lowercase">{selectedAgent.email}</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-none">
                         <Calendar size={18} className="text-indigo-600"/>
                         <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registry Onboarding</p>
                             <p className="text-sm font-semibold text-slate-900">{selectedAgent.joined}</p>
                         </div>
                       </div>
                    </div>
                  </section>

                  {/* Financial Asset Block */}
                  <section className="space-y-4">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-3">
                        Financial Asset Ledger
                    </h5>
                    <div className="p-8 bg-slate-900 rounded-none text-white relative overflow-hidden">
                       <div className="relative z-10 flex justify-between items-center">
                           <div className="space-y-1">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Liquid Assets</p>
                             <p className="text-4xl font-bold tracking-tighter text-white">₹{selectedAgent.balance.toLocaleString()}</p>
                           </div>
                           <div className="h-12 w-12 bg-indigo-600 rounded-none flex items-center justify-center shadow-xl">
                               <Wallet size={24} className="text-white"/>
                           </div>
                       </div>
                       <button className="w-full mt-8 py-3 bg-white text-slate-900 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                           Adjust Credit Balance
                       </button>
                       <Shield size={120} className="absolute -bottom-10 -right-10 text-white/[0.03] rotate-12" />
                    </div>
                  </section>

                  {/* Administrative Action Block */}
                  <section className="space-y-4 pb-10">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-3">
                        Security Protocols
                    </h5>
                    <div className="grid grid-cols-2 gap-4">
                       <button className="py-4 bg-white border border-slate-200 text-red-600 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-red-50 transition-all flex flex-col items-center gap-2">
                         <UserX size={20} /> Restrict Node
                       </button>
                       <button className="py-4 bg-white border border-slate-200 text-slate-600 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all flex flex-col items-center gap-2">
                         <ShieldAlert size={20} /> Reset Access
                       </button>
                    </div>
                  </section>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AgentControl;