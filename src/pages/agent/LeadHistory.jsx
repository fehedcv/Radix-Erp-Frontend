import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowLeft, Calendar, User, Building2, ChevronRight } from 'lucide-react';

const LeadHistory = ({ leads, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Filter Logic preserved
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lead.id.toLowerCase().includes(searchTerm.toLowerCase());
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
      
      {/* 1. HEADER & SEARCH SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-4">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-indigo-600 transition-all"
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">Submission Log</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input - Sharp Edges */}
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Client or ID..."
              className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-none outline-none w-full sm:w-72 text-sm font-semibold focus:border-indigo-600 transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Status Filter - Sharp Edges */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="pl-10 pr-10 py-3.5 bg-white border border-slate-200 rounded-none outline-none text-xs font-bold uppercase tracking-widest appearance-none cursor-pointer focus:border-indigo-600"
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
        <div className="hidden lg:grid grid-cols-5 gap-4 px-8 py-5 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div>Lead Identity</div>
          <div>Client Name</div>
          <div>Business Unit</div>
          <div>Date Submitted</div>
          <div className="text-right">Current Status</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead, idx) => (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.03 }}
                key={lead.id} 
                className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center p-6 lg:px-8 hover:bg-slate-50 transition-all group"
              >
                {/* ID Column */}
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 bg-slate-900 text-white font-bold text-[10px] rounded-none">
                    {lead.id}
                  </div>
                  <span className="lg:hidden text-[10px] font-bold uppercase text-slate-400">ID Reference</span>
                </div>

                {/* Client Name */}
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-tight">
                   <User size={14} className="text-slate-300" /> {lead.clientName}
                </div>

                {/* Target Business */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  <Building2 size={14} className="text-slate-300" /> {lead.businessUnit}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Calendar size={14} /> {lead.date}
                </div>

                {/* Status Badge - Sharp Edges */}
                <div className="flex items-center justify-between lg:justify-end gap-4">
                  <div className={`px-4 py-2 rounded-none text-[10px] font-bold uppercase tracking-widest border ${getStatusStyle(lead.status)}`}>
                    {lead.status}
                  </div>
                  <ChevronRight size={16} className="text-slate-200 group-hover:text-indigo-600 transition-colors hidden lg:block" />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-24 text-center bg-slate-50/30">
              <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No matching lead records found in registry.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeadHistory;