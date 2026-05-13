import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Calendar, Building2,
  CheckCircle2, Wallet, Clock, BarChart3, PieChart,
  Activity, User, AlertCircle, ChevronDown , X
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient'; // Added Supabase client
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// 1:1 STRUCTURAL SKELETON (BENTO STYLE)
// ==========================================
const HistorySkeleton = ({ theme }) => {
  const isLight = theme === 'light';
  const pulseColor = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';
  const cardBg = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10';

  return (
    <div className="w-full max-w-[1200px] mx-auto  space-y-5 pb-32 ">
      {/* Separator */}
                <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`} />

      {/* Header Skeleton */}
      <div className="space-y-2 mb-6">
        <div className={`h-8 w-40 rounded-xl ${pulseColor} animate-pulse`} />
        <div className={`h-3 w-32 rounded-md ${pulseColor} animate-pulse`} />
      </div>

      {/* Info Box Skeleton */}
      <div className={`h-24 w-full rounded-2xl border animate-pulse ${cardBg}`} />

      {/* Analytics Skeletons */}
      <div className="space-y-4">
        <div className={`h-48 w-full rounded-2xl border animate-pulse ${cardBg}`} />
        <div className={`h-64 w-full rounded-2xl border animate-pulse ${cardBg}`} />
      </div>

      {/* Search/Filter Skeleton */}
      <div className="space-y-3">
        <div className={`h-14 w-full rounded-xl animate-pulse ${pulseColor}`} />
        <div className={`h-14 w-full rounded-xl animate-pulse ${pulseColor}`} />
      </div>

      {/* List Skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className={`h-64 w-full rounded-3xl border animate-pulse ${cardBg}`} />
      ))}
    </div>
  );
};

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

// ==========================================
// MAIN COMPONENT
// ==========================================
const LeadHistoryApp = () => {
  const { theme } = useTheme(); 
  const isLight = theme === 'light';
  
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Fetching real data from Supabase
        const { data, error } = await supabase
          .from('leads')
          .select(`
            id, customer_name, status, service, created_at, credit_status,
            business_units ( business_name )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching leads:', error);
          return;
        }

        // Map data to fit the UI component expectations exactly
        const mappedLeads = data.map(lead => ({
          id: lead.id,
          clientName: lead.customer_name,
          status: lead.status,
          service: lead.service || lead.business_units?.business_name || 'N/A',
          date: new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          creditStatus: lead.credit_status,
          businessUnit: lead.business_units?.business_name || 'Unknown'
        }));

        setLeads(mappedLeads);
      } catch (err) {
        console.error(err);
      } finally {
        // Keep the timeout to maintain the smooth skeleton transition of the app
        setTimeout(() => setLoading(false), 800); 
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

  // ==========================================
  // DESIGN SYSTEM CONFIGS (Colors & Types)
  // ==========================================
  const CHART_COLORS = ['#DAC18A', '#48477A', '#38BDF8', '#81B398', '#F0524F']; // Mustard, Indigo, Blue, Sage, Coral

  const barChartConfig = {
    series: [{
      name: 'Deals',
      data: [statusCounts.Pending, statusCounts.Verified, statusCounts["In Progress"], statusCounts.Completed, statusCounts.Rejected]
    }],
    options: {
      chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true }, fontFamily: 'Plus Jakarta Sans, sans-serif' },
      colors: CHART_COLORS,
      plotOptions: { bar: { borderRadius: 6, distributed: true, columnWidth: '60%' } },
      xaxis: {
        categories: ['Pnd.', 'Ver.', 'In P.', 'Done', 'Rej.'],
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontWeight: 800, fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { show: false },
      legend: { show: false },
      grid: { show: false },
      dataLabels: { enabled: false },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  };

  const donutChartConfig = {
    series: [statusCounts.Pending, statusCounts.Verified, statusCounts["In Progress"], statusCounts.Completed, statusCounts.Rejected],
    options: {
      chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans, sans-serif' },
      labels: ['Pending', 'Verified', 'In Progress', 'Completed', 'Rejected'],
      colors: CHART_COLORS,
      stroke: { show: false },
      legend: { 
        show: true, 
        position: 'bottom',
        fontSize: '11px',
        fontWeight: 700,
        labels: { colors: isLight ? '#1A202C' : '#F4F5F7' },
        markers: { radius: 6 }
      },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': 
      case 'In Progress':
        return 'text-[#DAC18A] bg-[#DAC18A]/10 border-[#DAC18A]/20';
      case 'Verified': 
      case 'Completed': 
        return 'text-[#81B398] bg-[#81B398]/10 border-[#81B398]/20';
      case 'Rejected': 
        return 'text-[#F0524F] bg-[#F0524F]/10 border-[#F0524F]/20';
      default: 
        return 'text-[#48477A] bg-[#48477A]/10 border-[#48477A]/20';
    }
  };

  // --- LOADING STATE ---
  if (loading) return <HistorySkeleton theme={theme} />;

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] pb-24  transition-colors duration-200 overflow-x-hidden ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      <main className="w-full max-w-[1200px] mx-auto space-y-5">
        
        {/* PROFESSIONAL SEPARATOR */}
 
                <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`} >

          {/* Header Section */}
          <div className="flex justify-between items-end px-2 mb-2">
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                My Leads
              </h1>
              <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Track your submissions
              </p>
            </div>
          </div>
        </div>

        {/* PAYOUT INFO BENTO (Muted Indigo) */}
        <div className={`flex items-start gap-4 p-5 rounded-2xl border transition-all ${
          isLight ? 'bg-[#48477A]/5 border-[#48477A]/20' : 'bg-[#48477A]/10 border-[#48477A]/20'
        }`}>
          <AlertCircle size={20} className="text-[#48477A] shrink-0 mt-0.5" />
          <div>
            <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#48477A]">Payout Info</h5>
            <p className={`text-sm mt-1.5 font-medium leading-relaxed ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
              Credits are settled when a lead status is <span className="font-bold text-[#81B398] uppercase">Completed</span>.
            </p>
          </div>
        </div>

        {/* ANALYTICS STACKED BENTO */}
        <div className="space-y-4">
          {/* Distribution Chart */}
          <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} className="text-[#81B398]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Deal Distribution
              </span>
            </div>
            <Chart options={barChartConfig.options} series={barChartConfig.series} type="bar" height={160} />
          </div>

          {/* Breakdown Chart */}
          <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <div className="flex items-center gap-2 mb-4">
              <PieChart size={16} className="text-[#81B398]" />
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Status Breakdown
              </span>
            </div>
            <Chart options={donutChartConfig.options} series={donutChartConfig.series} type="donut" height={220} />
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Leads..."
              className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none border transition-all ${
                isLight 
                  ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                  : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
              }`}
            />
          </div>

          <div className="relative">
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
    className={`w-full pl-4 pr-12 py-3.5 rounded-xl text-sm font-semibold appearance-none outline-none border transition-all duration-200 cursor-pointer ${
      isLight
        ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C] hover:border-[#CBD5E0]'
        : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7] hover:border-white/20'
    }`}
  >
    <option value="All">All Statuses</option>
    <option value="Pending">Pending</option>
    <option value="Verified">Verified</option>
    <option value="In Progress">In Progress</option>
    <option value="Completed">Completed</option>
    <option value="Rejected">Rejected</option>
  </select>

  {/* Divider */}
  <div
    className={`absolute right-11 top-1/2 -translate-y-1/2 h-5 w-px ${
      isLight ? 'bg-[#CBD5E0]' : 'bg-white/10'
    }`}
  />

  {/* Dropdown Icon */}
  <ChevronDown
    size={16}
    strokeWidth={2.5}
    className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-all ${
      isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
    }`}
  />
</div>
        </div>

        {/* LEADS LIST BENTO */}
        <div className="space-y-4 pt-2">
          {filteredLeads.length ? filteredLeads.map((lead, i) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-3xl p-6 border relative overflow-hidden transition-all duration-200 hover:border-[#81B398] active:scale-95 ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    ID: {lead.id}
                  </p>
                  <h3 className={`text-xl font-extrabold tracking-tight truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                    {lead.clientName}
                  </h3>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
                }`}>
                  <User size={20} className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'} />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                  <Building2 size={16} className="text-[#81B398] shrink-0" />
                  <span className={`text-sm font-bold truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                    {lead.service || 'N/A'}
                  </span>
                </div>
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                  <Calendar size={16} className="text-[#81B398] shrink-0" />
                  <span className={`text-sm font-bold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                    {lead.date}
                  </span>
                </div>
              </div>

              <div className={`pt-5 border-t flex items-center justify-between ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                <div className="flex flex-col gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Status</span>
                  <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border w-fit ${getStatusStyle(normalizeStatus(lead.status))}`}>
                    {normalizeStatus(lead.status)}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Credit</span>
                  {normalizeStatus(lead.status) === "Completed" ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#81B398]">
                      <CheckCircle2 size={12} strokeWidth={3} /> Credited
                    </span>
                  ) : normalizeStatus(lead.status) === "Rejected" ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#F0524F]">
                      <X size={12} strokeWidth={3} /> Rejected
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#DAC18A]">
                      <Clock size={12} strokeWidth={3} /> Pending
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )) : (
            <div className={`py-16 text-center rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
              <Activity size={32} className={`mx-auto mb-4 ${isLight ? 'text-[#E2E8F0]' : 'text-white/10'}`} />
              <p className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No Lead History Found</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default LeadHistoryApp;