import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  CheckCircle2, Search, XCircle, FilterX, 
  User, ArrowRight, Activity, Calendar
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

const STATUSES = ['All', 'Pending', 'Verified', 'In Progress', 'Completed', 'Rejected'];

const ManageLeadsApp = () => {
  const navigate = useNavigate();
  const { theme } = useOutletContext(); 
  const isLight = theme === 'light';

  // --- STATE MANAGEMENT ---
  const [leads, setLeads] = useState([]);
  const [summary, setSummary] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // --- API CALLS ---
const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          customer_name,
          status,
          created_at,
          payment_status,
          credit_status,
          source_user_id,
          total_sale_amount,
          business_unit_services (
            service_name
          ),
          users!source_user_id (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load leads:', error);
        return;
      }

      const mappedLeads = (data || []).map((lead) => ({
        id: lead.id,
        customer_name: lead.customer_name,
        status: lead.status || 'Pending',
        service: lead.business_unit_services?.service_name || 'Unknown',
        date: lead.created_at,
        agentId: lead.users?.full_name || 'Unknown',
        paymentStatus: lead.payment_status,
        totalSaleAmount: lead.total_sale_amount,
        creditStatus: lead.credit_status === 'credited' ? 'Credited' : 'Pending'
      }));

      const summary = {
        total: mappedLeads.length,
        pending: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'pending'
        ).length,
        in_progress: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'in progress'
        ).length,
        completed: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'completed'
        ).length ,

        settledAmount: mappedLeads
          .filter((l) => String(l.paymentStatus).toLowerCase() === 'settled')
          .reduce((sum, lead) => sum + Number(lead.totalSaleAmount), 0)
      };

      const visibleLeads =
        statusFilter === 'All'
          ? mappedLeads
          : mappedLeads.filter(
              (lead) => lead.status?.toLowerCase() === statusFilter.toLowerCase()
            );

      setLeads(visibleLeads);
      setSummary(summary);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [statusFilter, dateFilter]);

  // SAFE FILTERING: Using String() to prevent crashes if ID or Name are numbers/null
  const filteredLeads = leads.filter((lead) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const clientName = lead.customer_name ? String(lead.customer_name).toLowerCase() : "";
    const leadId = lead.id ? String(lead.id).toLowerCase() : "";
    const agentId = lead.agentId ? String(lead.agentId).toLowerCase() : "";
    
    return clientName.includes(query) || leadId.includes(query) || agentId.includes(query);
  });

  // --- UI HELPERS ---
  const getStatusColor = (status) => {
    const s = status ? String(status).toLowerCase() : '';
    if (s === 'completed' || s === 'verified') return 'text-[#81B398] bg-[#81B398]/10 border-[#81B398]/20';
    if (s === 'rejected') return 'text-[#F0524F] bg-[#F0524F]/10 border-[#F0524F]/20';
    if (s === 'in progress') return 'text-[#48477A] bg-[#48477A]/10 border-[#48477A]/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20'; // Pending
  };

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
      
      {/* 1. HEADER & STATS */}
      <div className="mb-4 px-1">
        <h2 className="text-2xl font-extrabold tracking-tight mb-4">Project Details</h2>
        
        {/* Full Width Settled Amount Card */}
        <div className={`mb-3 rounded-3xl p-6 md:p-8 border transition-all duration-200 flex flex-col justify-center ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
        }`}>
          <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Total Revenue
          </p>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#81B398]">
            ₹{summary.settledAmount?.toLocaleString() || 0}
          </h3>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
           <QuickStat label="Total Projects" count={summary.total || 0} isLight={isLight} />
           <QuickStat label="Pending" count={summary.pending || 0} isLight={isLight} />
           <QuickStat label="In Progress" count={summary.in_progress || 0} isLight={isLight} />
           <QuickStat label="Completed" count={summary.completed || 0} isLight={isLight} />
        </div>
      </div>

      {/* 2. TOOLBAR (Search & Filters with Labels) */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-end gap-3 transition-colors duration-200 ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
      }`}>
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <label className={`block mb-1.5 pl-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Search
          </label>
          <div className="relative">
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} strokeWidth={2.5} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..." 
              className={`w-full pl-12 pr-10 py-3.5 rounded-xl outline-none text-sm font-bold transition-all border ${
                isLight 
                  ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]' 
                  : 'bg-[#131720] border-transparent text-white placeholder:text-[#718096] focus:border-[#81B398]'
              }`}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                <XCircle size={16} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex w-full md:w-auto items-end gap-3">
          {/* Status Dropdown */}
          <div className="relative flex-1 md:flex-none md:w-40">
            <label className={`block mb-1.5 pl-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              Status
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`w-full appearance-none pl-4 pr-10 py-3.5 rounded-xl outline-none text-sm font-bold transition-all border cursor-pointer ${
                  isLight 
                    ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] focus:border-[#81B398]' 
                    : 'bg-[#131720] border-transparent text-white focus:border-[#81B398]'
                }`}
              >
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="relative flex-1 md:flex-none md:w-44">
            <label className={`block mb-1.5 pl-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              Filter by Date
            </label>
            <div className="relative">
              <input 
                type="date" 
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className={`w-full appearance-none pl-10 pr-4 py-3.5 rounded-xl outline-none text-sm font-bold transition-all border cursor-pointer ${
                  isLight 
                    ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] focus:border-[#81B398]' 
                    : 'bg-[#131720] border-transparent text-white focus:border-[#81B398]'
                }`}
              />
              <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} strokeWidth={2.5} />
              {dateFilter && (
                <button onClick={() => setDateFilter("")} className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 ${isLight ? 'text-[#F0524F]' : 'text-[#F0524F]'}`}>
                  <XCircle size={14} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. REQUEST LISTING */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
        <AnimatePresence mode="popLayout">

          {loading && (
            <>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} isLight={isLight} />)}
            </>
          )}

          {!loading && filteredLeads.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`col-span-full flex flex-col items-center justify-center py-24 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
              <FilterX size={32} strokeWidth={2.5} className="text-[#81B398] mb-4" />
              <h3 className="text-base font-extrabold tracking-tight">No Leads Found</h3>
              <p className={`text-sm font-medium mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Try adjusting your filters or search query.</p>
            </motion.div>
          )}

          {!loading && filteredLeads.map((lead) => (
            <motion.div
              layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              key={lead.id}
              className={`rounded-3xl border transition-all duration-200 flex flex-col overflow-hidden ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#222938] border-white/10 hover:border-[#81B398]'
              }`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(lead.status)}`}>
                  {lead.status}
                </span>
                <User size={16} strokeWidth={2.5} className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'} />
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col gap-4 text-xs flex-1">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Client</span>
                    <span className="font-extrabold text-sm truncate">{lead.customer_name || "Unknown"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Agent</span>
                    <span className="font-extrabold text-sm truncate">{lead.agentId || "Unassigned"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Service</span>
                    <span className="font-bold truncate">{lead.service}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Date</span>
                    <span className="font-bold">{lead.date ? new Date(lead.date).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                <div className={`h-px w-full my-1 ${isLight ? 'bg-[#F4F5F7]' : 'bg-white/5'}`}></div>

                {/* Settlement Status */}
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Settlement</span>
                  <div className="flex items-center gap-1.5">
                    {String(lead.paymentStatus).toLowerCase() === "settled" ? (
                      <><CheckCircle2 size={14} strokeWidth={2.5} className="text-[#81B398]" /><span className="text-[#81B398] font-bold">Settled</span></>
                    ) : <><Activity size={14} strokeWidth={2.5} className="text-amber-500" /><span className="text-amber-500 font-bold">Pending</span></>}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => navigate(`/business/leads/${lead.id}`)}
                  className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 border ${
                    isLight 
                      ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' 
                      : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'
                  }`}
                >
                  View Details <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// UI COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

const QuickStat = ({ label, count, isLight }) => (
  <div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${
    isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
  }`}>
    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
      {label}
    </p>
    <h3 className="text-2xl font-extrabold tracking-tighter">
      {count}
    </h3>
  </div>
);

const SkeletonCard = ({ isLight }) => (
  <div className={`rounded-3xl border p-5 flex flex-col gap-4 animate-pulse ${
    isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
  }`}>
    <div className="flex justify-between">
      <div className={`w-20 h-6 rounded-lg ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}></div>
      <div className={`w-6 h-6 rounded-full ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}></div>
    </div>
    <div className={`w-full h-10 rounded-xl ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}></div>
    <div className="grid grid-cols-2 gap-4">
      <div className={`w-full h-8 rounded-xl ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}></div>
      <div className={`w-full h-8 rounded-xl ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}></div>
    </div>
    <div className={`w-full h-10 mt-2 rounded-xl ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}></div>
  </div>
);

export default ManageLeadsApp;