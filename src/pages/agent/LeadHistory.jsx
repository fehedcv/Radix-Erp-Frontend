import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Calendar, Building2,
  CheckCircle2, Wallet, Clock, BarChart3, PieChart,
  Activity, User, AlertCircle, Loader2
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const normalizeStatus = (status) => {
  if (!status) return "";
  const s = status.toLowerCase().trim();
  if (s === "pending") return "Pending";
  if (s === "verified") return "Verified";
  if (s === "in progress") return "In Progress";
  if (s === "completed") return "Completed";
  if (s === "rejected") return "Rejected";
  if (s === "successful") return "Completed";
  return status;
};

const LeadHistory = () => {
  const { theme } = useTheme(); 
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  // Earth-Tech Semantic Status Mapping
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#DAC18A'; // Sand
      case 'Verified': return '#48477A'; // Muted Indigo
      case 'In Progress': return '#38BDF8'; // Muted Blue 
      case 'Completed': return '#81B398'; // Sage Green
      case 'Rejected': return '#F0524F'; // Coral Red
      default: return isLight ? '#718096' : '#9CA3AF'; // Slate
    }
  };

  const getStatusPill = (status) => {
    const colorHex = getStatusColor(status);
    return `bg-[${colorHex}]/10 text-[${colorHex}] border border-[${colorHex}]/20`;
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select(`
            id, customer_name, status, service_id, created_at, credit_status,
            business_units ( business_name )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching leads:', error);
          return;
        }

        const mappedLeads = data.map(lead => ({
          id: lead.id,
          clientName: lead.customer_name,
          status: lead.status,
          service_id: lead.service_id,
          date: new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          creditStatus: lead.credit_status,
          businessUnit: lead.business_units?.business_name || 'Unknown'
        }));

        setLeads(mappedLeads);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredLeads = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return leads.filter(lead => {
      const matchesSearch =
        ((lead.clientName || '').toString()).toLowerCase().includes(search) ||
        ((lead.id || '').toString()).toLowerCase().includes(search);
      const matchesStatus = filterStatus === "All" || normalizeStatus(lead.status) === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, filterStatus]);

  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Verified: 0, "In Progress": 0, Completed: 0, Rejected: 0 };
    leads.forEach(l => {
      const status = normalizeStatus(l.status);
      if (counts[status] !== undefined) counts[status]++;
    });
    return counts;
  }, [leads]);

  // Chart Configurations injected with Earth-Tech Palette
  const chartColors = ['#DAC18A', '#48477A', '#38BDF8', '#81B398', '#F0524F'];
  
  const barChartConfig = {
    series: [{
      name: 'Deals',
      data: [statusCounts.Pending, statusCounts.Verified, statusCounts["In Progress"], statusCounts.Completed, statusCounts.Rejected]
    }],
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      colors: chartColors,
      plotOptions: { bar: { borderRadius: 4, distributed: true, columnWidth: '40%' } },
      xaxis: {
        categories: ['Pending', 'Verified', 'In Prog.', 'Done', 'Rejected'],
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontWeight: 600, fontSize: '11px', fontFamily: 'Plus Jakarta Sans' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontFamily: 'Plus Jakarta Sans' } } },
      legend: { show: false },
      grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  };

  const donutChartConfig = {
    series: [statusCounts.Pending, statusCounts.Verified, statusCounts["In Progress"], statusCounts.Completed, statusCounts.Rejected],
    options: {
      chart: { type: 'donut' },
      labels: ['Pending', 'Verified', 'In Progress', 'Completed', 'Rejected'],
      colors: chartColors,
      stroke: { show: false },
      legend: { 
        position: 'bottom', 
        fontSize: '12px', 
        fontWeight: 600, 
        fontFamily: 'Plus Jakarta Sans',
        labels: { colors: isLight ? '#1A202C' : '#F4F5F7' } 
      },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  };

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2  lg:px-0">
        <div className={`h-10 w-48 rounded-md mb-6 ${pulseClass} animate-pulse`} />
        
        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 animate-pulse">
          <div className={`h-[300px] rounded-2xl border ${surfaceClass}`} />
          <div className={`h-[300px] rounded-2xl border ${surfaceClass}`} />
        </div>

        {/* Action Bar Skeleton */}
        <div className={`h-16 rounded-xl border animate-pulse ${surfaceClass}`} />

        {/* List Skeleton */}
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-24 rounded-2xl border animate-pulse ${surfaceClass}`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2  lg:px-0 ${textPrimary}`}>
      
      {/* 1. HEADER */}
      <div className="space-y-1.5 ">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Lead Tracker</h2>
        <p className={`text-sm font-medium max-w-xl ${textSecondary}`}>
          Monitor the status of your submitted referrals in real-time.
        </p>
      </div>

      <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 lg:p-6 rounded-xl border transition-all ${
        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'
      }`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
          isLight ? 'bg-[#FFFFFF] border border-[#E2E8F0]' : 'bg-[#222938] border border-white/5'
        }`}>
          <AlertCircle size={18} className="text-[#81B398]" />
        </div>
        <div>
          <h5 className="text-sm font-bold tracking-tight">Payout Information</h5>
          <p className={`text-xs mt-1 leading-relaxed ${textSecondary}`}>
            Credits are only added to your wallet <strong>after</strong> the lead is officially marked as <span className="font-bold text-[#81B398]">Completed</span>.
          </p>
        </div>
      </div>

      {/* 2. ANALYTICS (Charts moved to top) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className={`p-6 lg:p-8 rounded-2xl border transition-all ${surfaceClass}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'}`}>
              <BarChart3 size={16} />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Deal Distribution</span>
          </div>
          <div className="flex-1 min-h-[220px]">
            <Chart options={barChartConfig.options} series={barChartConfig.series} type="bar" height={220} />
          </div>
        </div>

        <div className={`p-6 lg:p-8 rounded-2xl border transition-all ${surfaceClass}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'}`}>
               <PieChart size={16} />
            </div>
            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Status Breakdown</span>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <Chart options={donutChartConfig.options} series={donutChartConfig.series} type="donut" height={240} />
          </div>
        </div>
      </div>

      {/* 3. SEARCH / FILTER ACTION BAR */}
      <div className={`p-4 lg:p-5 rounded-2xl border transition-all flex flex-col md:flex-row gap-4 ${surfaceClass}`}>
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`} />
          <input
            value={searchTerm}
            placeholder="Search by client or deal ID..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg text-sm transition-all outline-none border ${
              isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:border-[#81B398]'
            }`}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div> 
        <div className="relative w-full md:w-56 shrink-0">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full pl-4 pr-10 py-2.5 rounded-lg text-sm font-medium transition-all outline-none appearance-none cursor-pointer border ${
              isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:border-[#81B398]'
            }`}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${textSecondary}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
        </div>
      </div>

      {/* 4. LIST (Horizontal Scannable Rows) */}
      <div className="space-y-4">
        {filteredLeads.length ? filteredLeads.map((lead, i) => {
          const status = normalizeStatus(lead.status);
          const colorHex = getStatusColor(status);
          
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all duration-300 group ${
                isLight 
                ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:shadow-sm hover:border-[#E2E8F0]' 
                : 'bg-[#222938] border-white/5 hover:bg-[#2A3241]'
              }`}
            >
              {/* Left: Avatar & Identity */}
              <div className="flex items-center gap-5 lg:w-[35%]">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
                }`}>
                  <User size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold tracking-tight truncate mb-1">{lead.clientName}</h3>
                  <p className={`text-xs font-medium uppercase tracking-wider ${textSecondary}`}>
                    ID: {lead.id}
                  </p>
                </div>
              </div>

              {/* Middle: Details (Business & Date) */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 lg:w-[40%]">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}>
                    <Building2 size={14} className={textSecondary} />
                  </div>
                  <span className={`text-sm font-medium truncate ${textSecondary}`}>{lead.businessUnit}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}>
                    <Calendar size={14} className={textSecondary} />
                  </div>
                  <span className={`text-sm font-medium shrink-0 ${textSecondary}`}>{lead.date}</span>
                </div>
              </div>

              {/* Right: Status & Wallet */}
              <div className="flex items-center gap-4 lg:w-[25%] lg:justify-end pt-4 lg:pt-0 border-t lg:border-0 border-inherit" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                {/* Status Pill */}
                <span 
                  className="px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider border"
                  style={{ backgroundColor: `${colorHex}15`, color: colorHex, borderColor: `${colorHex}30` }}
                >
                  {status}
                </span>

                {/* Wallet Status */}
                <div className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 ${
                  lead.creditStatus === "Credited" 
                  ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20' 
                  : (isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5')
                }`}>
                  {lead.creditStatus === "Credited" ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {lead.creditStatus === "Credited" ? "Settled" : "Pending"}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        }) : (
          <div className={`col-span-full py-20 text-center rounded-2xl border transition-all ${surfaceClass}`}>
            <Activity size={40} className={`mx-auto mb-4 opacity-30 ${textSecondary}`} />
            <p className={`text-sm font-semibold mb-1 ${textPrimary}`}>No Lead History Found</p>
            <p className={`text-xs ${textSecondary}`}>No referrals match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadHistory;