import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom'; // 1. Router hooks ചേർത്തു
import { Search, Filter, ArrowLeft, Calendar, User, Building2, ChevronRight } from 'lucide-react';

const LeadHistory = () => {
  const navigate = useNavigate();
  
  // 2. AgentHub-ൽ നിന്ന് അയച്ച context ഡാറ്റ ഇവിടെ സ്വീകരിക്കുന്നു
  // 'myLeads' എന്ന് തന്നെയാണ് AgentHub-ൽ നൽകിയിട്ടുള്ളത് എന്ന് ഉറപ്പുവരുത്തുക
  const { myLeads = [] } = useOutletContext(); 

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // 3. Filter Logic (myLeads ഉപയോഗിക്കുന്നു)
  const filteredLeads = myLeads.filter(lead => {
    // lead ഡാറ്റ ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുന്നു (Safety Check)
    const clientName = lead.clientName || "";
    const leadId = lead.id || "";
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          leadId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/agent/dashboard')} // 4. Router Navigation
            className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] hover:text-indigo-600 transition-all"
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Submission Registry</h2>
          <p className="text-xs font-medium text-slate-400 italic">Historical log of all transmitted leads</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search Client or ID..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-none outline-none w-full sm:w-72 text-xs font-bold uppercase tracking-widest focus:border-indigo-600 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select 
              className="pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-none outline-none text-[10px] font-bold uppercase tracking-widest appearance-none cursor-pointer focus:border-indigo-600"
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. HISTORY DATA LIST */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
        {/* Table Header (Desktop Only) */}
        <div className="hidden lg:grid grid-cols-5 gap-4 px-8 py-5 bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div>Ref Identity</div>
          <div>Client / Legal Name</div>
          <div>Business Node</div>
          <div>Registry Date</div>
          <div className="text-right">Audit Status</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={lead.id} 
                className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center p-6 lg:px-8 hover:bg-slate-50 transition-all group"
              >
                {/* ID Column */}
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 bg-slate-900 text-white font-bold text-[10px] rounded-none font-mono">
                    {lead.id}
                  </div>
                </div>

                {/* Client Name */}
                <div className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                   {lead.clientName}
                </div>

                {/* Target Business */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Building2 size={12} className="text-indigo-400" /> {lead.businessUnit}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Calendar size={12} /> {lead.date}
                </div>

                {/* Status Badge */}
                <div className="flex items-center justify-between lg:justify-end gap-6">
                  <div className={`px-3 py-1.5 rounded-none text-[9px] font-black uppercase tracking-[0.15em] border ${getStatusStyle(lead.status)}`}>
                    {lead.status}
                  </div>
                  <ChevronRight size={14} className="text-slate-200 group-hover:text-indigo-600 transition-colors hidden lg:block" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center bg-slate-50/30">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">No matching records found in system registry.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeadHistory;