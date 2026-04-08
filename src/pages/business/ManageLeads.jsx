import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Calendar, Briefcase, FileText, 
  ShieldCheck, Inbox, Search, XCircle, FilterX, 
  User,ArrowRight,
  Loader2,
  Activity
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
        },
        
        
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
    const delayDebounceFn = setTimeout(() => {
      fetchLeads();
    }, 500);

    // 2. Clear the timer if the user types another letter before 500ms is up
    return () => clearTimeout(delayDebounceFn);
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
    <div className="space-y-5 font-sans pb-16 max-w-[1400px] mx-auto px-2 sm:px-0">
      
      {/* 1. HEADER & STATS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center text-[#007ACC] border border-blue-100 shadow-sm shrink-0">
              <Inbox size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">Leads Details</h2>
             
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
    {/* 3. REQUEST LISTING */}
      {/* Changed to grid-cols-2 for mobile, and scaling up to 4 on large screens */}
     <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        <AnimatePresence mode="popLayout">

          {/* --- NEW LOADING SPINNER STATE --- */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-lg"
            >
              <Loader2 className="h-10 w-10 text-[#007ACC] animate-spin mb-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                Loading Leads...
              </p>
            </motion.div>
          )}

          {/* --- EMPTY STATE (Only shows if NOT loading and NO leads) --- */}
          {!loading && leads.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20 bg-white border border-slate-200 rounded-lg"
            >
              <FilterX size={28} className="text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-500">
                No Leads Found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}

          {/* --- LEADS CARDS --- */}
          {!loading && leads.map((lead) => (
            
            <motion.div
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={lead.id}
              className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition flex flex-col"
            >

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide ${getStatusBadgeStyles(lead.status)}`}
          >
            {lead.status}
          </span>

          <User size={16} className="text-slate-400" />
        </div>

        {/* Body */}
        <div className="p-4 flex flex-col gap-3 text-xs">

          {/* Client */}
          <div className="flex justify-between gap-2">
            <span className="text-slate-400 font-medium">Client</span>
            <span className="text-slate-700 font-medium text-right truncate">
              {lead.customer_name || "Unknown"}
            </span>
          </div>

          {/* Date */}
          <div className="flex justify-between gap-2">
  <span className="text-slate-400 font-medium">Date</span>
  <span className="text-slate-700 text-right truncate">
    {lead.date 
      ? new Date(lead.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        }) 
      : 'N/A'
    }
  </span>
</div>

          {/* Service */}
          <div className="flex justify-between gap-2">
            <span className="text-slate-400 font-medium">Service</span>
            <span className="text-slate-700 text-right truncate">
              {lead.service}
            </span>
          </div>

          {/* Agent */}
          <div className="flex justify-between gap-2">
            <span className="text-slate-400 font-medium">Agent</span>
            <span className="text-slate-700 text-right truncate">
              {lead.agentId || "Unassigned"}
            </span>
          </div> 

          {/* Payment */}
         <div className="flex justify-between items-center gap-2 pt-1">
  <span className="text-slate-400 font-medium">Payment</span>
  <div className="flex items-center gap-1.5">

    {lead.paymentStatus === "Settled" ? (
      <>
        <CheckCircle2 size={14} className="text-green-600" />
        <span className="text-green-600 font-medium">
          Settled
        </span>
      </>
    ) : lead.paymentStatus === "Pending" ? (
      <>
        <Activity size={14} className="text-amber-500" />
        <span className="text-amber-500 font-medium">
          Pending
        </span>
      </>
    ) : (
      <>
        <Activity size={14} className="text-slate-400" />
        <span className="text-slate-400 font-medium">
          Not Settled
        </span>
      </>
    )}

  </div>
</div>
{/* Credit */}
<div className="flex justify-between items-center gap-2 pt-1">
  <span className="text-slate-400 font-medium">Credit</span>

  {lead.creditStatus === "Credited" ? (
      <>
        <CheckCircle2 size={14} className="text-green-600" />
        <span className="text-green-600 font-medium">
          Credited
        </span>
      </>
    ) : lead.paymentStatus === "Pending" ? (
      <>
        <Activity size={14} className="text-amber-500" />
        <span className="text-amber-500 font-medium">
          Pending
        </span>
      </>
    ) : (
      <>
        <Activity size={14} className="text-slate-400" />
        <span className="text-slate-400 font-medium">
          Not Credited
        </span>
      </>
    )}
</div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => navigate(`/business/leads/${lead.id}`)}
            className="w-full py-2 text-xs font-medium text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition flex items-center justify-center gap-2"
          >
            Details
            <ArrowRight size={14} />
          </button>
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