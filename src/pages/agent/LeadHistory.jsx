import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowLeft, Calendar, User, Building2, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';

const LeadHistory = ({ leads, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Filter Logic
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
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4 hover:text-indigo-600 transition-all">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h2 className="text-3xl font-black tracking-tight uppercase">Submission History</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search Client or ID..."
              className="pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-2xl outline-none w-full sm:w-64 font-bold text-sm focus:border-indigo-600 transition-all shadow-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              className="pl-10 pr-10 py-4 bg-white border border-slate-100 rounded-2xl outline-none font-black text-[10px] uppercase tracking-widest appearance-none shadow-sm cursor-pointer"
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

      {/* History List */}
      <div className="bg-white rounded-[3rem] p-4 md:p-8 border border-slate-100 shadow-sm overflow-hidden">
        <div className="hidden lg:grid grid-cols-5 gap-4 px-6 mb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="col-span-1">Lead ID</div>
          <div className="col-span-1">Client Name</div>
          <div className="col-span-1">Target Business</div>
          <div className="col-span-1">Date Submitted</div>
          <div className="col-span-1 text-right">Status</div>
        </div>

        <div className="space-y-3">
          {filteredLeads.length > 0 ? (
            filteredLeads.map((lead, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={lead.id} 
                className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center p-6 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl text-indigo-600 font-black text-[10px] shadow-sm italic">
                    {lead.id}
                  </div>
                  <span className="lg:hidden text-[10px] font-black uppercase text-slate-400 tracking-widest">Submission ID</span>
                </div>

                <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                   <User size={14} className="text-slate-300" /> {lead.clientName}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                  <Building2 size={14} className="text-slate-300" /> {lead.businessUnit}
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                  <Calendar size={14} /> {lead.date}
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4">
                  <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(lead.status)}`}>
                    {lead.status}
                  </span>
                  {/* <button className="p-2 bg-white rounded-lg text-slate-200 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                    <ChevronRight size={18} />
                  </button> */}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No matching leads found.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LeadHistory;