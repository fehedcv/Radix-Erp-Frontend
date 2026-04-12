import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Calendar, Building2,
  CheckCircle2, Wallet, Clock, BarChart3, PieChart,
  Activity, User, AlertCircle
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; // Import Global Theme

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
  const { theme } = useTheme(); // Access Theme
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

  const barChartConfig = {
    series: [{
      name: 'Deals',
      data: [statusCounts.Pending, statusCounts.Verified, statusCounts["In Progress"], statusCounts.Completed, statusCounts.Rejected]
    }],
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      colors: ['#F59E0B', '#3B82F6', '#6366F1', '#4ADE80', '#EF4444'],
      plotOptions: { bar: { borderRadius: 4, distributed: true, columnWidth: '40%' } },
      xaxis: {
        categories: ['Pending', 'Verified', 'In Prog.', 'Done', 'Rejected'],
        labels: { style: { colors: theme === 'light' ? '#64748B' : '#94A3B8', fontWeight: 600, fontSize: '10px' } },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: { labels: { style: { colors: theme === 'light' ? '#64748B' : '#94A3B8' } } },
      legend: { show: false },
      grid: { borderColor: theme === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.05)' },
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
        position: 'bottom', 
        fontSize: '10px', 
        fontWeight: 600, 
        labels: { colors: theme === 'light' ? '#475569' : '#94A3B8' } 
      },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      tooltip: { theme: theme === 'light' ? 'light' : 'dark' }
    }
  };

  const getStatusStyle = (status) => {
    const isLight = theme === 'light';
    switch (status) {
      case 'Pending': return isLight ? 'text-amber-700 bg-amber-100 border-amber-200' : 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Verified': return isLight ? 'text-blue-700 bg-blue-100 border-blue-200' : 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'In Progress': return isLight ? 'text-indigo-700 bg-indigo-100 border-indigo-200' : 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      case 'Completed': return isLight ? 'text-emerald-700 bg-emerald-100 border-emerald-200' : 'text-[#4ADE80] bg-[#4ADE80]/10 border-[#4ADE80]/20';
      case 'Rejected': return isLight ? 'text-rose-700 bg-rose-100 border-rose-200' : 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      default: return isLight ? 'text-slate-500 bg-slate-100 border-slate-200' : 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader fullScreen={false} text="Loading History..." />
      </div>
    );
  }

  return (
    <div className={`space-y-10 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-500 ${theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'}`}>
      
      {/* AMBIENT BACKGROUND BLOBS (Dark Mode Only) */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[0%] left-[10%] w-[400px] h-[400px] bg-lime-400/10 rounded-full blur-[120px] pointer-events-none -z-20" />
          <div className="fixed top-[30%] left-[40%] w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[140px] pointer-events-none -z-20" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-orange-400/10 rounded-full blur-[130px] pointer-events-none -z-20" />
        </>
      )}

      {/* 1. HEADER */}
      <div className="space-y-6">
        <h2 className="text-3xl font-black tracking-tight uppercase">My Leads</h2>

        <div className={`flex items-start gap-4 p-6 border rounded-xl shadow-sm backdrop-blur-md max-w-3xl transition-all ${
          theme === 'light' ? 'bg-blue-50 border-blue-100' : 'bg-[#38BDF8]/5 border-[#38BDF8]/20 shadow-lg'
        }`}>
          <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider">Payout Information</h5>
            <p className={`text-xs mt-2 leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-[#94A3B8]'}`}>
              Credits are only added to your wallet <strong>after</strong> the lead is officially marked as <span className={`px-2 py-0.5 rounded-xl text-[10px] font-black uppercase ${theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-[#4ADE80]/20 text-[#4ADE80]'}`}>Completed</span>.
            </p>
          </div>
        </div>
      </div>

      {/* 2. ANALYTICS (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-8 rounded-xl border transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-xl'}`}>
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={18} className="text-[#38BDF8]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Deal Distribution</span>
          </div>
          <Chart options={barChartConfig.options} series={barChartConfig.series} type="bar" height={220} />
        </div>

        <div className={`p-8 rounded-xl border transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-xl'}`}>
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={18} className="text-[#38BDF8]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Status Breakdown</span>
          </div>
          <Chart options={donutChartConfig.options} series={donutChartConfig.series} type="donut" height={240} />
        </div>
      </div>

      {/* 3. SEARCH / FILTER */}
      <div className={`rounded-xl p-6 border transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-xl'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`} />
            <input
              value={searchTerm}
              placeholder="Search by client or deal ID..."
              className={`w-full pl-12 pr-5 py-3.5 border rounded-xl text-sm font-medium transition-all focus:outline-none focus:border-[#38BDF8]/50 ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/5 text-[#E2E8F0] placeholder:text-[#64748B]'
              }`}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> 
          <select
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`w-full sm:w-56 pl-4 pr-8 py-3.5 border rounded-xl text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer focus:outline-none focus:border-[#38BDF8]/50 ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-white/5 border-white/5 text-[#E2E8F0]'
            }`}
          >
            <option value="All" className={theme === 'light' ? '' : 'bg-[#0F172A]'}>All Status</option>
            <option value="Pending" className={theme === 'light' ? '' : 'bg-[#0F172A]'}>Pending</option>
            <option value="Verified" className={theme === 'light' ? '' : 'bg-[#0F172A]'}>Verified</option>
            <option value="In Progress" className={theme === 'light' ? '' : 'bg-[#0F172A]'}>In Progress</option>
            <option value="Completed" className={theme === 'light' ? '' : 'bg-[#0F172A]'}>Completed</option>
            <option value="Rejected" className={theme === 'light' ? '' : 'bg-[#0F172A]'}>Rejected</option>
          </select>
        </div>
      </div>

      {/* 4. LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
        {filteredLeads.length ? filteredLeads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`rounded-xl border p-8 flex flex-col transition-all duration-500 group ${
              theme === 'light' 
              ? 'bg-[#F1F5F9] border-slate-200 hover:bg-slate-200/50 hover:border-slate-300 shadow-sm' 
              : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-xl hover:bg-white/[0.04] hover:border-white/20'
            } hover:-translate-y-2`}
          >
            <div className="flex justify-between items-start mb-8 gap-4">
              <div className="flex-1 overflow-hidden">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>ID: {lead.id}</p>
                <h3 className="text-xl font-black uppercase tracking-tight truncate">{lead.clientName}</h3>
              </div>
              <div className={`w-14 h-14 border rounded-xl flex items-center justify-center transition-colors ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-400' : 'bg-white/5 border-white/5 text-[#94A3B8] group-hover:text-[#38BDF8]'
              }`}>
                <User size={24} />
              </div>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              <div className={`flex items-center gap-4 text-xs font-bold p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200 text-slate-500' : 'bg-white/5 border-white/5 text-[#94A3B8]'}`}>
                <Building2 size={16} className="text-[#38BDF8] shrink-0" />
                <span className="truncate">{lead.businessUnit}</span>
              </div>
              <div className={`flex items-center gap-4 text-xs font-bold p-3 rounded-xl border ${theme === 'light' ? 'bg-white border-slate-200 text-slate-500' : 'bg-white/5 border-white/5 text-[#94A3B8]'}`}>
                <Calendar size={16} className="text-[#38BDF8] shrink-0" />
                <span>{lead.date}</span>
              </div>
            </div>

            <div className={`mt-auto pt-6 border-t space-y-4 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  <Activity size={14} className="text-[#38BDF8]" /> Status
                </span>
                <span className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-xl border ${getStatusStyle(normalizeStatus(lead.status))}`}>
                  {normalizeStatus(lead.status)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>
                  <Wallet size={14} className="text-[#6366f1]" /> Wallet
                </span>
                {lead.creditStatus === "Credited" ? (
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${theme === 'light' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'text-[#4ADE80] bg-[#4ADE80]/10 border-[#4ADE80]/20'}`}>
                    <CheckCircle2 size={12} /> Settled
                  </span>
                ) : (
                  <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${theme === 'light' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'}`}>
                    <Clock size={12} /> Pending
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className={`col-span-full py-28 text-center border rounded-xl transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.02] border-white/10 shadow-xl'}`}>
            <Activity size={48} className="mx-auto text-slate-400 mb-6 opacity-20" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em]">No Lead History Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadHistory;