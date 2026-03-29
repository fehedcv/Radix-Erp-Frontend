import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Calendar, Briefcase, FileText, 
  ShieldCheck, Inbox, Search, XCircle, FilterX, 
  Play, Check, LayoutGrid 
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';

const STATUSES = [
  'All',
  'Pending',
  'Verified',
  'In Progress',
  'Completed',
  'Rejected'
];

const ManageLeads = () => {
  const navigate = useNavigate();

  // --- STATE MANAGEMENT (Kept from your original code) ---
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // --- API CALLS ---
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await frappeApi.get(
        '/method/business_chain.api.leads.get_business_leads',
        {
          params: {
            status: statusFilter,
            search: searchQuery || undefined
          }
        }
      );
      setLeads(res.data.message.leads);
      setSummary(res.data.message.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, searchQuery]);

  const updateStatus = async (leadId, status) => {
    await frappeApi.post(
      '/method/business_chain.api.leads.update_lead_status',
      { lead_id: leadId, status }
    );
    fetchLeads();
  };

  // --- UI HELPERS ---
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-400';
      case 'Verified': return 'bg-blue-500';
      case 'In Progress': return 'bg-indigo-500';
      case 'Completed': return 'bg-emerald-500';
      case 'Rejected': return 'bg-rose-400';
      default: return 'bg-slate-300';
    }
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Verified': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'In Progress': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-5 font-sans pb-16 max-w-[1400px] mx-auto px-2">
      
      {/* 1. HEADER & STATS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#007ACC] border border-blue-100 shadow-sm shrink-0">
              <Inbox size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Lead Registry</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <ShieldCheck size={10} className="text-emerald-500" /> Business / Active Queue
              </p>
           </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
           <QuickStat label="Total" count={summary.total || 0} color="bg-slate-50 text-slate-600" />
           <QuickStat label="Pending" count={summary.pending || 0} color="bg-amber-50 text-amber-600 border-amber-100" />
           <QuickStat label="Working" count={summary.in_progress || 0} color="bg-indigo-50 text-indigo-600 border-indigo-100" />
           <QuickStat label="Done" count={summary.completed || 0} color="bg-emerald-50 text-emerald-600 border-emerald-100" />
        </div>
      </div>

      {/* 2. FUNCTIONAL TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center gap-3">
         {/* Search */}
         <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by customer name or ID..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-[#007ACC] transition-all shadow-sm"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                <XCircle size={14} />
              </button>
            )}
         </div>

         {/* Filter Buttons */}
         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  statusFilter === status 
                  ? 'bg-[#007ACC] text-white border-[#007ACC] shadow-md shadow-blue-100' 
                  : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
         </div>
      </div>

      {/* 3. REQUEST LISTING */}
      <div className="grid grid-cols-1 gap-3">
        <AnimatePresence mode="popLayout">
          {!loading && leads.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-xl">
              <FilterX size={32} className="text-slate-200 mx-auto mb-4" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">No Leads Found</h3>
              <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Try adjusting your search or filters.</p>
            </motion.div>
          )}

          {leads.map((lead) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              key={lead.id} 
              className="bg-white rounded-xl border border-slate-200 p-5 md:p-6 hover:border-[#007ACC] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-sm relative overflow-hidden"
            >
              {/* Colored Status Strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${getStatusColor(lead.status)}`} />

              {/* Content */}
              <div className="flex-1 space-y-3 relative z-10 pl-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${getStatusBadgeStyles(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {lead.id}</span>
                </div>
                
                <div>
                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight group-hover:text-[#007ACC] transition-colors leading-none">
                      {lead.customer_name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                           <Calendar size={12} className="text-[#007ACC]"/> {lead.date}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1.5">
                           <Briefcase size={12} className="text-[#007ACC]" /> {lead.service}
                        </p>
                    </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 relative z-10 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-50">
                <button 
                  onClick={() => navigate(`/business/leads/${lead.id}`)}
                  className="flex-1 lg:flex-none px-5 py-2.5 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-[#0F172A] hover:text-white rounded-lg transition-all flex items-center justify-center gap-2 border border-slate-100"
                >
                  <FileText size={14} /> View
                </button>
                
                {/* Dynamic Action Button based on Status */}
                {lead.status === 'Pending' && (
                  <ActionButton 
                    onClick={() => updateStatus(lead.id, 'Verified')}
                    icon={<CheckCircle2 size={14} />}
                    label="Verify"
                    color="bg-[#007ACC] shadow-blue-500/10"
                  />
                )}

                {lead.status === 'Verified' && (
                  <ActionButton 
                    onClick={() => updateStatus(lead.id, 'In Progress')}
                    icon={<Play size={14} />}
                    label="Start"
                    color="bg-indigo-600 shadow-indigo-500/10"
                  />
                )}

                {lead.status === 'In Progress' && (
                  <ActionButton 
                    onClick={() => updateStatus(lead.id, 'Completed')}
                    icon={<Check size={14} />}
                    label="Complete"
                    color="bg-emerald-600 shadow-emerald-500/10"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// --- HELPER COMPONENTS ---

const QuickStat = ({ label, count, color }) => (
  <div className={`px-4 py-2 border border-slate-100 rounded-xl text-center min-w-[70px] ${color}`}>
    <p className="text-[7px] font-black uppercase opacity-60 leading-none mb-1">{label}</p>
    <p className="text-sm font-black leading-none">{count}</p>
  </div>
);

const ActionButton = ({ onClick, icon, label, color }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`flex-1 lg:flex-none px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#0F172A] rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 active:scale-95 ${color}`}
  >
    {icon} {label}
  </button>
);

export default ManageLeads;