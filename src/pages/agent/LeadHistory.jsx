import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Calendar, Building2,
  CreditCard,CheckCircle2,Wallet,Clock, BarChart3, PieChart,
  Activity,User,ArrowRight,AlertCircle
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader'
const LeadHistory = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // ---------------- FETCH ----------------
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await frappeApi.get(
          '/method/business_chain.api.api.get_my_lead_history'
        );
        console.log(res.data.message);
        setLeads(res.data.message || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // ---------------- FILTER ----------------
  const filteredLeads = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return leads.filter(lead => {
      const matchesSearch =
        ((lead.clientName || '').toString()).toLowerCase().includes(search) ||
        ((lead.id || '').toString()).toLowerCase().includes(search);

      const matchesStatus =
        filterStatus === "All" || normalizeStatus(lead.status) === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, filterStatus]);

  // ---------------- CHARTS ----------------
  const normalizeStatus = (status) => {
  if (!status) return "";

  const s = status.toLowerCase().trim();

  if (s === "pending") return "Pending";
  if (s === "verified") return "Verified";
  if (s === "in progress") return "In Progress";
  if (s === "completed") return "Completed";
  if (s === "rejected") return "Rejected";

    if (s === "successful") return "Completed";


  return status; // fallback
};
  const statusCounts = useMemo(() => {
const counts = { 
  Pending: 0, 
  Verified: 0, 
  "In Progress": 0, 
  Completed: 0, 
  Rejected: 0 
};
leads.forEach(l => {
  const status = normalizeStatus(l.status);

  if (counts[status] !== undefined) {
    counts[status]++;
  }
});
    return counts;
  }, [leads]);

  const barChartConfig = {
    series: [{
      name: 'Deals',
     data: [
  statusCounts.Pending,
  statusCounts.Verified,
  statusCounts["In Progress"],
  statusCounts.Completed,
  statusCounts.Rejected
]
    }],
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      plotOptions: {
        bar: { borderRadius: 6, distributed: true, columnWidth: '40%' }
      },
      xaxis: {
categories: ['Pending', 'Verified', 'In Progress', 'Completed', 'Rejected'],
        labels: { style: { fontWeight: 700, fontSize: '10px' } }
      },
      legend: { show: false },
      grid: { borderColor: '#f1f5f9' }
    }
  };

const donutChartConfig = {
  series: [
    statusCounts.Pending,
    statusCounts.Verified,
    statusCounts["In Progress"],
    statusCounts.Completed,
    statusCounts.Rejected
  ],
  options: {
    chart: { type: 'donut' },
    labels: ['Pending', 'Verified', 'In Progress', 'Completed', 'Rejected'],
    colors: ['#f59e0b', '#3b82f6', '#6366f1', '#10b981', '#ef4444'],
    stroke: { show: false },
    legend: {
      position: 'bottom',
      fontSize: '10px',
      fontWeight: 600
    },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '72%' } } }
  }
};
   const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':     return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Verified':    return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'In Progress': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Completed':   return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Rejected':    return 'text-rose-600 bg-rose-50 border-rose-100';
      default:            return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  // ---------------- RENDER ----------------
 if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        {/* fullScreen={false} keeps it perfectly inside your dashboard container instead of taking over the whole screen */}
        <Loader fullScreen={false} text="Loading History..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* HEADER */}
      {/* // import { AlertCircle } from 'lucide-react'; */}

<div>
  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
    My Leads
  </h2>
  <p className="text-sm text-slate-500 mt-1">
    Reviewing your referrals and their status.
  </p>

  {/* Important Warning Note */}
  <div className="mt-5 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-md shadow-sm max-w-2xl">
    <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
    <div>
      <h5 className="text-sm font-semibold text-amber-800">
        Payout Information
      </h5>
      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
        Credits for your referrals are only calculated and added to your wallet <strong>after</strong> the lead status is officially marked as <span className="px-1.5 py-0.5 bg-amber-100 rounded text-[10px] font-bold uppercase tracking-wide">Completed</span>.
      </p>
    </div>
  </div>
</div>

      {/* SEARCH / FILTER */}
      <div className="bg-white  rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={searchTerm}
              placeholder="Search by client or deal ID..."
              className="w-full pl-11 pr-5 py-3 rounded-xl border border-gray-200 text-xs font-bold"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div> 

          <select
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 pl-4 pr-8 py-3 rounded-xl border border-gray-200 text-[10px] font-bold uppercase"
          >
            <option value="All">All Status</option>

            <option value="Pending">Pending</option>
<option value="Verified">Verified</option>
<option value="In Progress">In Progress</option>
<option value="Completed">Completed</option>
<option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl ">
          <BarChart3 size={16} className="text-[#007ACC] mb-4" />
          <Chart options={barChartConfig.options} series={barChartConfig.series} type="bar" height={220} />
        </div>

        <div className="bg-white p-6 rounded-2xl ">
          <PieChart size={16} className="text-[#007ACC] mb-4" />
          <Chart options={donutChartConfig.options} series={donutChartConfig.series} type="donut" height={240} />
        </div>
      </div>

      {/* LIST */}
      {/* Grid Container instead of a single background box */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredLeads.length ? filteredLeads.map((lead, i) => (
    <motion.div
      key={lead.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
      className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 flex flex-col hover:border-blue-300 hover:shadow-lg transition-all duration-300 group"
    >
      {/* --- Top Section: ID, Name & Icon --- */}
      <div className="flex justify-between items-start mb-5 gap-4">
        <div className="flex-1 overflow-hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Lead ID: {lead.id}
          </p>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight truncate">
            {lead.clientName}
          </h3>
        </div>
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
          <User size={22} strokeWidth={2.5} />
        </div>
      </div>

      {/* --- Middle Section: Lead Details --- */}
      <div className="flex-1 space-y-3 mb-6">
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-50">
          <Building2 size={14} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Business</span> 
          <ArrowRight size={12} className="text-slate-300 shrink-0" /> 
          <span className="text-slate-700 truncate">{lead.businessUnit}</span>
        </div>
        
        <div className="flex items-center gap-2.5 text-xs font-medium text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-50">
          <Calendar size={14} className="text-slate-400 shrink-0" />
          <span className="text-slate-400">Lead Date</span> 
          <ArrowRight size={12} className="text-slate-300 shrink-0" /> 
          <span className="text-slate-700">{lead.date}</span>
        </div>
      </div>

      {/* --- Bottom Section: Statuses & Tags --- */}
      <div className="mt-auto pt-5 border-t border-slate-100 space-y-3.5">
        
        {/* Lead Status */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Activity size={14} className="text-blue-400" /> Lead Status
          </span>
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusStyle(normalizeStatus(lead.status))}`}>
            {normalizeStatus(lead.status)}
          </span>
        </div>

        {/* Payment Status */}
      

        {/* Credit Status */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Wallet size={14} className="text-indigo-400" /> Credit
          </span>
          {lead.creditStatus === "Credited" ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-md">
              <CheckCircle2 size={12} /> Credited
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-md">
              <Clock size={12} /> Not Credited
            </span>
          )}
        </div>

      </div>
    </motion.div>
  )) : (
    /* --- Empty State --- */
    <div className="col-span-full py-24 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
      <Activity size={32} className="mx-auto text-slate-300 mb-4" />
      <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest">
        No records found
      </p>
    </div>
  )}
</div>
    </div>
  );
};

export default LeadHistory;
