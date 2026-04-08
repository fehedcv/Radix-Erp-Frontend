import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, Calendar, Briefcase, FileText, 
  ShieldCheck, Inbox, Search, XCircle, FilterX, 
  User, ArrowRight, Loader2, Activity, CreditCard, Wallet, Clock
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
        {
          params: {
            status: statusFilter,
            // Removed 'search' from here. The backend only handles status now.
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

  // Only refetch when the status filter changes, NO delay needed anymore.
  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  // --- FRONTEND SEARCH FILTER ---
  // This runs instantly every time you type in the search box
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
              placeholder="Search by client name, Lead ID, or Agent ID..." 
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        <AnimatePresence mode="popLayout">

          {/* --- LOADING SPINNER STATE --- */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm"
            >
              <Loader2 className="h-10 w-10 text-[#007ACC] animate-spin mb-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">
                Loading Leads...
              </p>
            </motion.div>
          )}

          {/* --- EMPTY STATE (Checks filteredLeads instead of leads) --- */}
          {!loading && filteredLeads.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm"
            >
              <FilterX size={32} className="text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-600">
                No Leads Found
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Try adjusting your search or filters
              </p>
            </motion.div>
          )}

          {/* --- LEADS CARDS (Maps over filteredLeads) --- */}
          {!loading && filteredLeads.map((lead) => (
            
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              key={lead.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
            >

              {/* Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-100">
                <span
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyles(lead.status)}`}
                >
                  {lead.status}
                </span>
                <User size={16} className="text-slate-400" />
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col gap-3.5 text-xs flex-1">

                {/* Client */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Client</span>
                  <span className="text-slate-800 font-semibold text-right truncate">
                    {lead.customer_name || "Unknown"}
                  </span>
                </div>

                {/* Date */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Date</span>
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
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Service</span>
                  <span className="text-slate-700 text-right truncate">
                    {lead.service}
                  </span>
                </div>

                {/* Agent */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Agent</span>
                  <span className="text-slate-700 text-right truncate">
                    {lead.agentId || "Unassigned"}
                  </span>
                </div> 

                {/* Divider before statuses */}
                <div className="h-px w-full bg-slate-100 my-1"></div>

                {/* Payment */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Payment</span>
                  <div className="flex items-center gap-1.5">
                    {lead.paymentStatus === "Settled" ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-emerald-600 font-medium">Settled</span>
                      </>
                    ) : lead.paymentStatus === "Pending" ? (
                      <>
                        <Activity size={14} className="text-amber-500" />
                        <span className="text-amber-600 font-medium">Pending</span>
                      </>
                    ) : (
                      <>
                        <Activity size={14} className="text-slate-400" />
                        <span className="text-slate-500 font-medium">Not Settled</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Credit */}
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 font-medium shrink-0">Credit</span>
                  <div className="flex items-center gap-1.5">
                    {lead.creditStatus === "Credited" ? (
                      <>
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-emerald-600 font-medium">Credited</span>
                      </>
                    ) : lead.paymentStatus === "Pending" ? (
                      <>
                        <Activity size={14} className="text-amber-500" />
                        <span className="text-amber-600 font-medium">Pending</span>
                      </>
                    ) : (
                      <>
                        <Activity size={14} className="text-slate-400" />
                        <span className="text-slate-500 font-medium">Not Credited</span>
                      </>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 mt-auto">
                <button
                  onClick={() => navigate(`/business/leads/${lead.id}`)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:border-[#007ACC] hover:text-[#007ACC] hover:shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
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

export default ManageLeads;