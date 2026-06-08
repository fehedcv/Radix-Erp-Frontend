import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  CheckCircle2, Search, XCircle, FilterX, 
  User, ArrowRight, Activity, Calendar, Clock
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';

const STATUSES = ['All', 'Pending', 'Verified', 'In Progress', 'Completed', 'Rejected'];

const ManageLeadsApp = () => {
  const navigate = useNavigate();
  const { theme } = useOutletContext(); 
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  // --- STATE MANAGEMENT ---
  const [leads, setLeads] = useState([]);
  const [summaryState, setSummaryState] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  // --- API CALLS ---
  const fetchLeads = async () => {
   if (leads.length === 0) {
    setLoading(true);
  }
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
        totalSaleAmount: lead.total_sale_amount || 0,
        creditStatus: lead.credit_status === 'credited' ? 'Credited' : 'Pending'
      }));

      const calculatedSummary = {
        total: mappedLeads.length,
        pending: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'pending'
        ).length,
        in_progress: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'in progress'
        ).length,
        completed: mappedLeads.filter(
          (l) => l.status?.toLowerCase() === 'completed'
        ).length,
        settledAmount: mappedLeads
          .filter((l) => String(l.paymentStatus).toLowerCase() === 'settled')
          .reduce((sum, lead) => sum + Number(lead.totalSaleAmount || 0), 0)
      };

      setLeads(mappedLeads);
      setSummaryState(calculatedSummary);

      sessionStorage.setItem(
        "manageLeads",
        JSON.stringify(mappedLeads)
      );
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    const cachedLeads = sessionStorage.getItem("manageLeads");

    if (cachedLeads) {
      setLeads(JSON.parse(cachedLeads));
      setLoading(false);
      setHasLoaded(true);

      // Fetch latest data silently
      fetchLeads();
    } else {
      fetchLeads();
    }
  }, []);

  // --- MEMOIZED DERIVATIONS ---
  const summary = useMemo(() => {
    return {
      total: leads.length,
      pending: leads.filter((l) => l.status?.toLowerCase() === 'pending').length,
      in_progress: leads.filter((l) => l.status?.toLowerCase() === 'in progress').length,
      completed: leads.filter((l) => l.status?.toLowerCase() === 'completed').length,
      settledAmount: leads
        .filter((l) => String(l.paymentStatus).toLowerCase() === 'settled')
        .reduce((sum, lead) => sum + Number(lead.totalSaleAmount || 0), 0)
    };
  }, [leads]);

  const visibleLeads = useMemo(() => {
    let filtered = leads;

    if (statusFilter !== 'All') {
      filtered = filtered.filter(lead => lead.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(lead => {
        const clientName = lead.customer_name ? lead.customer_name.toLowerCase() : "";
        const leadId = lead.id ? lead.id.toLowerCase() : "";
        const agentId = lead.agentId ? lead.agentId.toLowerCase() : "";
        return clientName.includes(query) || leadId.includes(query) || agentId.includes(query);
      });
    }

    return filtered;
  }, [leads, statusFilter, searchQuery]);

  // --- CHART CONFIGURATIONS ---
  const donutConfig = useMemo(() => ({
    series: [summary.pending || 0, summary.in_progress || 0, summary.completed || 0],
    options: {
      chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
      labels: ['Pending', 'In Progress', 'Completed'],
      colors: ['#DAC18A', '#38BDF8', '#81B398'],
      plotOptions: {
        pie: {
          donut: {
            size: '75%',
            labels: {
              show: true,
              name: { color: isLight ? '#718096' : '#9CA3AF', fontWeight: 600 },
              value: { color: isLight ? '#1A202C' : '#F4F5F7', fontSize: '24px', fontWeight: 'bold' },
              total: { show: true, label: 'Total Projects', color: isLight ? '#718096' : '#9CA3AF', formatter: () => summary.total }
            }
          }
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: false },
      legend: { position: 'bottom', labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  }), [summary, isLight]);

  const barConfig = useMemo(() => ({
    series: [{ name: 'Projects', data: [summary.pending || 0, summary.in_progress || 0, summary.completed || 0] }],
    options: {
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
      plotOptions: {
        bar: { borderRadius: 6, horizontal: false, columnWidth: '45%', distributed: true }
      },
      colors: ['#DAC18A', '#38BDF8', '#81B398'],
      dataLabels: { enabled: false },
      xaxis: {
        categories: ['Pending', 'In Progress', 'Completed'],
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontWeight: 600 } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontWeight: 500 } }
      },
      grid: {
        borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)',
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
        padding: { top: 0, right: 0, bottom: 0, left: 10 }
      },
      legend: { show: false },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  }), [summary, isLight]);

  // --- UI HELPERS ---
  const getStatusBadgeStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'completed' || s === 'settled' || s === 'credited') {
      return 'bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20';
    }
    if (s === 'rejected') {
      return 'bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20';
    }
    if (s === 'pending') {
      return 'bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20';
    }
    if (s === 'in progress' || s === 'verified') {
      return 'bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20';
    }
    return isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5';
  };

  // SKELETON LOADER
  if (!hasLoaded && loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0">
        <div className="pt-2 mb-6">
          <div className={`h-10 w-64 rounded-md mb-2 ${pulseClass} animate-pulse`} />
          <div className={`h-4 w-48 rounded-md ${pulseClass} animate-pulse`} />
        </div>
        
        {/* Top Summary Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-6">
           {[1,2,3,4].map(i => (
             <div key={i} className={`h-[100px] rounded-2xl ${pulseClass} animate-pulse`} />
           ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <div className={`h-[320px] rounded-2xl ${pulseClass} animate-pulse`} />
           <div className={`h-[320px] rounded-2xl ${pulseClass} animate-pulse`} />
        </div>

        {/* Toolbar Skeleton */}
        <div className={`h-16 w-full rounded-2xl ${pulseClass} animate-pulse`} />
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className={`h-[280px] rounded-2xl ${pulseClass} animate-pulse`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2 lg:mt-4 px-4 lg:px-0 ${textPrimary}`}>
      
      {/* 1. HEADER (Free/Borderless) */}
      <div className="pt-2">
        <h1 className={`text-[32px] lg:text-[40px] font-extrabold tracking-tight leading-none mb-2 ${textPrimary}`}>
          Project Portfolio
        </h1>
        <p className={`text-sm font-medium ${textSecondary}`}>
          Management Console
        </p>
      </div>

      {/* 2. TOP SUMMARY STATS */}
      <div className="mb-4 px-1">
        {/* Full Width Settled Amount Card */}
        <div className={`mb-3 rounded-3xl p-6 md:p-8 border transition-all duration-200 flex flex-col justify-center ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
        }`}>
          <p className={`text-[10px] md:text-xs font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Total Executed Revenue
          </p>
          <h3 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#81B398]">
            ₹{summary.settledAmount?.toLocaleString() || 0}
          </h3>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
           <QuickStat label="Assigned Projects" count={summary.total || 0} isLight={isLight} color="bg-[#48477A]/10 text-[#48477A] border-[#48477A]/20" />
           <QuickStat label="Pending" count={summary.pending || 0} isLight={isLight} color="bg-[#DAC18A]/10 text-[#DAC18A] border-[#DAC18A]/20" />
           <QuickStat label="In Progress" count={summary.in_progress || 0} isLight={isLight} color="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20" />
           <QuickStat label="Completed" count={summary.completed || 0} isLight={isLight} color="bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20" />
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className={`min-w-0 p-6 lg:p-8 rounded-2xl border transition-all duration-300 flex flex-col ${surfaceClass}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 ${textPrimary}`}>
              Project Allocation
            </h3>
            <div className="w-full h-[260px] overflow-hidden flex items-center justify-center">
              <Chart options={donutConfig.options} series={donutConfig.series} type="donut" height="100%" width="100%" />
            </div>
          </div>
          <div className={`min-w-0 p-6 lg:p-8 rounded-2xl border transition-all duration-300 flex flex-col ${surfaceClass}`}>
            <h3 className={`text-sm font-bold uppercase tracking-wider mb-6 ${textPrimary}`}>
              Status Breakdown
            </h3>
            <div className="w-full h-[260px] overflow-hidden">
              <Chart options={barConfig.options} series={barConfig.series} type="bar" height="100%" width="100%" />
            </div>
          </div>
        </div>
      )}

      {/* 4. TOOLBAR (Search & Filters) */}
      <div className={`p-4 lg:p-5 rounded-2xl border transition-all flex flex-col md:flex-row gap-4 ${surfaceClass}`}>
        <div className="relative flex-1 w-full group">
          <label className={`block mb-1.5 pl-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Search
          </label>
          <div className="relative">
            <Search 
              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${textSecondary}`} 
              size={16} 
            />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Client, Contract ID, or Partner..." 
              className={`w-full pl-11 pr-10 py-3.5 rounded-xl outline-none text-sm font-bold transition-all duration-300 border ${
                isLight 
                  ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] placeholder:text-[#718096] focus:bg-[#FFFFFF] focus:border-[#81B398]' 
                  : 'bg-[#131720] border-transparent text-[#F4F5F7] placeholder:text-[#9CA3AF] focus:bg-[#222938] focus:border-[#81B398]'
              }`}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${textSecondary} hover:text-[#F0524F]`}
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>

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

      {/* 5. REQUEST LISTING */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence mode="popLayout">

          {!loading && visibleLeads.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`col-span-full flex flex-col items-center justify-center py-24 rounded-2xl border ${surfaceClass}`}>
              <FilterX size={40} className={`mb-4 opacity-30 ${textSecondary}`} />
              <h3 className={`text-base font-semibold ${textPrimary}`}>No Projects Found</h3>
              <p className={`text-sm mt-1 ${textSecondary}`}>Try adjusting your search or filters.</p>
            </motion.div>
          )}

          {!loading && visibleLeads.map((lead) => (
            <motion.div
              layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              key={lead.id}
              className={`rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398] hover:shadow-sm' : 'bg-[#222938] border-white/5 hover:border-[#81B398] hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
              }`}
            >
              {/* Card Header */}
              <div className={`flex items-center justify-between p-5 border-b ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyles(lead.status)}`}>
                  {lead.status}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-[#F4F5F7] text-[#718096]' : 'bg-[#131720] text-[#9CA3AF]'}`}>
                  <User size={14} />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col gap-4 text-xs flex-1">
                
                <div className="flex justify-between items-center gap-2">
                  <span className={`font-semibold ${textSecondary}`}>Client</span>
                  <span className={`font-bold text-right truncate text-sm ${textPrimary}`}>{lead.customer_name || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={`font-semibold ${textSecondary}`}>Date</span>
                  <span className={`font-medium text-right ${textPrimary}`}>{lead.date ? new Date(lead.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={`font-semibold ${textSecondary}`}>Service</span>
                  <span className={`font-medium text-right truncate ${textPrimary}`}>{lead.service}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className={`font-semibold ${textSecondary}`}>Sourced By</span>
                  <span className={`font-medium text-right truncate ${textPrimary}`}>{lead.agentId || "Unassigned"}</span>
                </div>

                <div className={`h-px w-full my-2 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/5'}`}></div>

                {/* Settlement Status */}
                <div className="flex justify-between items-center gap-2">
                  <span className={`font-semibold ${textSecondary}`}>Profit Clearance</span>
                  <div className="flex items-center gap-1.5">
                    {String(lead.paymentStatus).toLowerCase() === "settled" ? (
                      <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>
                        <CheckCircle2 size={12} /> Settled
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#DAC18A]' : 'text-[#DAC18A]'}`}>
                        <Activity size={12} /> Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className={`font-semibold ${textSecondary}`}>Status</span>
                  <div className="flex items-center gap-1.5">
                    {lead.status?.toLowerCase() === "approved" || lead.status?.toLowerCase() === "completed" ? (
                      <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>
                        <CheckCircle2 size={12} /> {lead.status}
                      </span>
                    ) : lead.status?.toLowerCase() === "rejected" ? (
                      <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#F0524F]' : 'text-[#F0524F]'}`}>
                        <XCircle size={12} /> Rejected
                      </span>
                    ) : (
                      <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#DAC18A]' : 'text-[#DAC18A]'}`}>
                        <Clock size={12} /> {lead.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
      
              {/* Card Footer Action */}
              <div className={`p-4 border-t mt-auto transition-colors ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
                <button
                  onClick={() => navigate(`/business/leads/${lead.id}`)}
                  className={`w-full py-2.5 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 border ${
                    isLight 
                    ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' 
                    : 'bg-[#131720] border-white/5 text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'
                  }`}
                >
                  Details <ArrowRight size={16} />
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

const QuickStat = ({ label, count, color, isLight }) => (
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