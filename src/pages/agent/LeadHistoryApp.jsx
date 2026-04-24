import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Calendar, Building2,
  CheckCircle2, Wallet, Clock, BarChart3, PieChart,
  Activity, User, AlertCircle, ChevronDown
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// SKELETON COMPONENT (MATCHED LAYOUT)
// ==========================================
const HistorySkeleton = ({ theme }) => {
  const bgColor = theme === 'light' ? 'bg-gray-200' : 'bg-white/5';
  const pulseClass = "animate-pulse";

  return (
    <div className="space-y-6 px-2 ">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className={`h-8 w-40 rounded-lg ${bgColor} ${pulseClass}`} />
        <div className={`h-3 w-32 rounded-lg ${bgColor} ${pulseClass}`} />
      </div>

      {/* Info Box Skeleton */}
      <div className={`h-24 w-full rounded-[2rem] ${bgColor} ${pulseClass}`} />

      {/* Analytics Skeletons (Two Lines) */}
      <div className="space-y-4">
        <div className={`h-48 w-full rounded-[2rem] ${bgColor} ${pulseClass}`} />
        <div className={`h-64 w-full rounded-[2rem] ${bgColor} ${pulseClass}`} />
      </div>

      {/* Search/Filter Skeleton */}
      <div className="space-y-3">
        <div className={`h-14 w-full rounded-[1.25rem] ${bgColor} ${pulseClass}`} />
        <div className={`h-14 w-full rounded-[1.25rem] ${bgColor} ${pulseClass}`} />
      </div>

      {/* List Skeletons */}
      {[1, 2].map((i) => (
        <div key={i} className={`h-64 w-full rounded-[2rem] ${bgColor} ${pulseClass}`} />
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

const LeadHistoryApp = () => {
  // ==========================================
  // EXACT SAME LOGIC & STATE AS WEB VERSION
  // ==========================================
  const { theme } = useTheme(); 
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await frappeApi.get('/method/business_chain.api.api.get_my_lead_history');
        setLeads(res.data.message || []);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Small delay for smooth skeleton feel
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
  // MOBILE OPTIMIZED CHART CONFIGS
  // ==========================================
  const barChartConfig = {
    series: [{
      name: 'Deals',
      data: [statusCounts.Pending, statusCounts.Verified, statusCounts["In Progress"], statusCounts.Completed, statusCounts.Rejected]
    }],
    options: {
      chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: true } },
      colors: ['#F59E0B', '#3B82F6', '#6366F1', '#4ADE80', '#EF4444'],
      plotOptions: { bar: { borderRadius: 8, distributed: true, columnWidth: '60%' } },
      xaxis: {
        categories: ['Pnd.', 'Ver.', 'In P.', 'Done', 'Rej.'],
        labels: { style: { colors: theme === 'light' ? '#94A3B8' : '#64748B', fontWeight: 800, fontSize: '9px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { show: false },
      legend: { show: false },
      grid: { show: false },
      dataLabels: { enabled: false },
      tooltip: { theme: theme === 'light' ? 'light' : 'dark' }
    }
  };

  const donutChartConfig = {
    series: [statusCounts.Pending, statusCounts.Verified, statusCounts["In Progress"], statusCounts.Completed, statusCounts.Rejected],
    options: {
      chart: { type: 'donut' },
      labels: ['Pending', 'Verified', 'In Progress', 'Completed', 'Rejected'],
      colors: ['#F59E0B', '#3B82F6', '#6366F1', '#4ADE80', '#EF4444'],
      stroke: { show: false },
      legend: { 
        show: true, 
        position: 'bottom',
        fontSize: '9px',
        fontWeight: 800,
        labels: { colors: theme === 'light' ? '#94A3B8' : '#64748B' },
        markers: { radius: 12 }
      },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      tooltip: { theme: theme === 'light' ? 'light' : 'dark' }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Verified': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'In Progress': return 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20';
      case 'Completed': return 'text-[#4ADE80] bg-[#4ADE80]/10 border-[#4ADE80]/20';
      case 'Rejected': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-gray-500 bg-white/5 border-white/10';
    }
  };

  // --- LOADING STATE TRIGGER ---
  if (loading) return <HistorySkeleton theme={theme} />;

  return (
    <div className={`space-y-6 font-['Plus_Jakarta_Sans',sans-serif] pb-14 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      
      {/* Header Section */}
      <div className="flex justify-between items-end px-2 ">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">My Leads</h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
            Track your submissions
          </p>
        </div>
      </div>

      {/* Payout Info Bento */}
      <div className="">
        <div className={`flex items-start gap-4 p-5 rounded-[2rem] shadow-sm transition-all ${
          theme === 'light' ? 'bg-[#38BDF8]/10 border border-[#38BDF8]/20' : 'bg-[#38BDF8]/5 border border-[#38BDF8]/10'
        }`}>
          <AlertCircle size={20} className="text-[#38BDF8] shrink-0 mt-0.5" />
          <div>
            <h5 className="text-[10px] font-black uppercase tracking-widest">Payout Info</h5>
            <p className={`text-[11px] mt-1.5 leading-relaxed font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
              Credits are settled when a lead status is <span className="font-black text-[#4ADE80] uppercase">Completed</span>.
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Stacked (Two Lines) */}
      <div className=" space-y-4">
        {/* Distribution Chart */}
        <div className={`rounded-[2rem] p-6 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <div className="flex items-center gap-2 mb-4 px-1">
            <BarChart3 size={14} className="text-[#38BDF8]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Deal Distribution</span>
          </div>
          <Chart options={barChartConfig.options} series={barChartConfig.series} type="bar" height={160} />
        </div>

        {/* Breakdown Chart */}
        <div className={`rounded-[2rem] p-6 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <div className="flex items-center gap-2 mb-4 px-1">
            <PieChart size={14} className="text-[#38BDF8]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Status Breakdown</span>
          </div>
          <Chart options={donutChartConfig.options} series={donutChartConfig.series} type="donut" height={220} />
        </div>
      </div>

      {/* Search & Filters (Dropdown Style) */}
      <div className=" space-y-3">
        <div className="relative">
          <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Leads..."
            className={`w-full pl-11 pr-4 py-4 rounded-[1.25rem] text-sm font-bold outline-none transition-all shadow-inner ${
              theme === 'light' ? 'bg-white focus:ring-2 focus:ring-black' : 'bg-[#18181B] border border-white/5 focus:ring-2 focus:ring-white'
            }`}
          />
        </div>

        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full pl-5 pr-12 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest appearance-none outline-none transition-all shadow-sm ${
              theme === 'light' ? 'bg-white text-black' : 'bg-[#18181B] text-white border border-white/5'
            }`}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Verified">Verified</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className=" space-y-4">
        {filteredLeads.length ? filteredLeads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-[2rem] p-6 relative overflow-hidden shadow-sm active:scale-[0.98] transition-all ${
              theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
            }`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1 min-w-0">
                <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`}>ID: {lead.id}</p>
                <h3 className="text-lg font-extrabold tracking-tight uppercase truncate">{lead.clientName}</h3>
              </div>
              <div className={`w-10 h-10 rounded-[1rem] flex items-center justify-center shrink-0 ${
                theme === 'light' ? 'bg-[#F4F5F9] text-gray-400' : 'bg-white/5 text-gray-500'
              }`}>
                <User size={20} />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className={`flex items-center gap-3 p-4 rounded-[1.25rem] ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                <Building2 size={14} className="text-[#38BDF8] shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-tight truncate">{lead.businessUnit}</span>
              </div>
              <div className={`flex items-center gap-3 p-4 rounded-[1.25rem] ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                <Calendar size={14} className="text-[#38BDF8] shrink-0" />
                <span className="text-[11px] font-bold uppercase tracking-tight">{lead.date}</span>
              </div>
            </div>

            <div className={`pt-5 border-t flex items-center justify-between ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
              <div className="flex flex-col gap-1">
                <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Status</span>
                <span className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-full border ${getStatusStyle(normalizeStatus(lead.status))}`}>
                  {normalizeStatus(lead.status)}
                </span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Credit</span>
                {lead.creditStatus === "Credited" ? (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase text-[#4ADE80]">
                    <CheckCircle2 size={10} /> Credited
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[8px] font-black uppercase text-amber-500">
                    <Clock size={10} /> Pending
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="py-20 text-center">
            <Activity size={32} className="mx-auto text-gray-500 mb-4 opacity-20" />
            <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>No Lead History Found</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default LeadHistoryApp;