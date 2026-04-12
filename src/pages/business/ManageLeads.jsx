import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  CheckCircle2, Inbox, Search, XCircle, FilterX, 
  User, ArrowRight, Loader2, Activity
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
  const { theme } = useOutletContext(); // Get global theme from Hub
  const isLight = theme === 'light';

  // --- STATE MANAGEMENT ---
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
        { params: { status: statusFilter } }
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
  }, [statusFilter]);

  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName = lead.customer_name ? lead.customer_name.toLowerCase() : "";
    const leadId = lead.id ? lead.id.toLowerCase() : "";
    const agentId = lead.agentId ? lead.agentId.toLowerCase() : "";
    return clientName.includes(query) || leadId.includes(query) || agentId.includes(query);
  });

  // --- UI HELPERS ---
  const getStatusBadgeStyles = (status) => {
    if (!isLight) {
        switch (status) {
            case 'Pending': return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
            case 'Completed': return 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20';
            default: return 'bg-white/5 text-slate-400 border-white/10';
        }
    }
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Verified': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'In Progress': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className={`space-y-5 pb-16 max-w-[1400px] mx-auto px-2 sm:px-0 transition-colors duration-300 ${isLight ? 'text-[#1A1D1F]' : 'text-[#E2E8F0]'}`}>
      
      {/* 1. HEADER & STATS */}
      <div className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
        isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10 shadow-sm'
      }`}>
        <div className="flex items-center gap-4">
           <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-colors ${
             isLight ? 'bg-white text-[#61D9DE] border-[#E8ECEF]' : 'bg-blue-50/10 text-[#38BDF8] border-white/5'
           }`}>
              <Inbox size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Leads Overview</h2>
              <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>Management Console</p>
           </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
           <QuickStat label="Total" count={summary.total || 0} isLight={isLight} color="bg-slate-200/50 text-slate-600" />
           <QuickStat label="Pending" count={summary.pending || 0} isLight={isLight} color="bg-amber-100 text-amber-700" />
           <QuickStat label="Active" count={summary.in_progress || 0} isLight={isLight} color="bg-indigo-100 text-indigo-700" />
           <QuickStat label="Done" count={summary.completed || 0} isLight={isLight} color="bg-emerald-100 text-emerald-700" />
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full group">
  {/* Search Icon - Adjusted to Theme Muted Text */}
  <Search 
    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
      isLight ? 'text-[#9A9FA5] group-focus-within:text-[#61D9DE]' : 'text-slate-400 group-focus-within:text-[#38BDF8]'
    }`} 
    size={14} 
  />

  <input 
    type="text" 
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    placeholder="Search by Client, ID, or Agent..." 
    className={`w-full pl-10 pr-10 py-2.5 rounded-xl outline-none text-xs font-bold transition-all duration-300 border ${
      isLight 
        ? 'bg-[#F8FAFB] border-[#E8ECEF] text-[#1A1D1F] placeholder:text-[#9A9FA5]/60 focus:bg-white focus:border-[#61D9DE] focus:shadow-[0_0_0_4px_rgba(97,217,222,0.1)]' 
        : 'bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-[#38BDF8]/50 focus:bg-white/10'
    }`}
  />

  {/* Clear Button - Synced with Theme Colors */}
  {searchQuery && (
    <button 
      onClick={() => setSearchQuery("")} 
      className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
        isLight ? 'text-[#9A9FA5] hover:text-[#1A1D1F]' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <XCircle size={14} />
    </button>
  )}
</div>

         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
            {STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
                  statusFilter === status 
                  ? 'bg-[#61D9DE] text-white border-[#61D9DE] shadow-sm' 
                  : (isLight ? 'bg-white text-[#9A9FA5] border-[#E8ECEF] hover:bg-[#F8FAFB]' : 'bg-white/5 text-slate-400 border-white/10')
                }`}
              >
                {status}
              </button>
            ))}
         </div>
      </div>

      {/* 3. REQUEST LISTING */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        <AnimatePresence mode="popLayout">

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full flex flex-col items-center justify-center py-20">
              <Loader2 className={`h-10 w-10 animate-spin mb-4 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]'}`} />
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>Loading Leads...</p>
            </motion.div>
          )}

          {!loading && filteredLeads.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`col-span-full flex flex-col items-center justify-center py-20 rounded-2xl border ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-white/5 border-white/10'}`}>
              <FilterX size={32} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold">No Leads Found</h3>
            </motion.div>
          )}

          {!loading && filteredLeads.map((lead) => (
            <motion.div
              layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              key={lead.id}
              className={`rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
                isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] hover:border-[#61D9DE] hover:shadow-sm' : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${isLight ? 'bg-white/40 border-[#E8ECEF]' : 'bg-white/5 border-white/10'}`}>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyles(lead.status)}`}>
                  {lead.status}
                </span>
                <User size={16} className={isLight ? 'text-[#9A9FA5]' : 'text-slate-500'} />
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-3.5 text-xs flex-1">
                <div className="flex justify-between items-center gap-2">
                  <span className={isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}>Client</span>
                  <span className="font-bold text-right truncate">{lead.customer_name || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}>Date</span>
                  <span className="font-medium text-right opacity-80">{lead.date ? new Date(lead.date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}>Service</span>
                  <span className="font-medium text-right truncate">{lead.service}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}>Agent</span>
                  <span className="font-medium text-right truncate">{lead.agentId || "Unassigned"}</span>
                </div>

                <div className={`h-px w-full my-1 ${isLight ? 'bg-[#E8ECEF]' : 'bg-white/5'}`}></div>

                <div className="flex justify-between items-center gap-2">
                  <span className={isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}>Settlement</span>
                  <div className="flex items-center gap-1.5">
                    {lead.paymentStatus === "Settled" ? (
                      <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-emerald-600 font-bold">Settled</span></>
                    ) : <><Activity size={14} className="text-amber-500" /><span className="text-amber-600 font-bold">Pending</span></>}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className={isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}>Credit</span>
                  <div className="flex items-center gap-1.5">
                    {lead.creditStatus === "Credited" ? (
                      <><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-emerald-600 font-bold">Credited</span></>
                    ) : <><Activity size={14} className="text-amber-500" /><span className="text-amber-600 font-bold">Pending</span></>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`p-3 border-t mt-auto ${isLight ? 'bg-white/40 border-[#E8ECEF]' : 'bg-white/5 border-white/10'}`}>
                <button
                  onClick={() => navigate(`/business/leads/${lead.id}`)}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 border ${
                    isLight ? 'bg-white border-[#E8ECEF] text-[#1A1D1F] hover:border-[#61D9DE] hover:text-[#61D9DE]' : 'bg-white/5 border-white/10 text-white hover:border-white/20'
                  }`}
                >
                  Details <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

const QuickStat = ({ label, count, color, isLight }) => (
  <div className={`px-4 py-2 border rounded-xl text-center min-w-[75px] transition-colors ${
    isLight ? `bg-white border-[#E8ECEF]` : 'bg-white/5 border-white/10'
  }`}>
    <p className={`text-[7px] font-black uppercase mb-1 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-500'}`}>{label}</p>
    <p className={`text-sm font-black ${isLight ? 'text-[#1A1D1F]' : 'text-white'}`}>{count}</p>
  </div>
);

export default ManageLeads;