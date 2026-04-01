import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Calendar, Building2,
  ChevronRight, BarChart3, PieChart,
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
        filterStatus === "All" || lead.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, filterStatus]);

  // ---------------- CHARTS ----------------
  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Successful: 0, Rejected: 0 };
    leads.forEach(l => counts[l.status]++);
    return counts;
  }, [leads]);

  const barChartConfig = {
    series: [{
      name: 'Deals',
      data: [
        statusCounts.Successful,
        statusCounts.Pending,
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
        categories: ['Successful', 'Pending', 'Rejected'],
        labels: { style: { fontWeight: 700, fontSize: '10px' } }
      },
      legend: { show: false },
      grid: { borderColor: '#f1f5f9' }
    }
  };

  const donutChartConfig = {
    series: [
      statusCounts.Successful,
      statusCounts.Pending,
      statusCounts.Rejected
    ],
    options: {
      chart: { type: 'donut' },
      labels: ['Successful', 'Pending', 'Rejected'],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
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
    if (status === 'Successful')
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (status === 'Rejected')
      return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
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
            <option  value="All">All Status</option>
            <option  value="Successful">Successful</option>
            <option  value="Pending">Pending</option>
            <option  value="Rejected">Rejected</option>
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
            className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col hover:border-blue-300 hover:shadow-md transition-all group"
          >
            {/* Top Row: Icon & Status */}
            <div className="flex justify-between items-start mb-5">
              <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                <User size={24} />
              </div>
              
            </div>

            {/* Middle Row: Content */}
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Lead ID: {lead.id}
              </p>
              
               <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4">
                {lead.clientName}
              </h3>
              
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Building2 size={14} className="text-slate-400" />Business <ArrowRight size={12} /> {lead.businessUnit}
                </p>
                <p className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Calendar size={14} className="text-slate-400" />Lead Date <ArrowRight size={12} /> {lead.date}
                </p>
              </div>
            </div>

            {/* Bottom Row: Action Link (Matches the "View Portfolio" style in the image) */}
            <div className="mt-6 pt-4 border-t text-center border-slate-100 flex items-center justify-between text-slate-400 group-hover:text-blue-600 transition-colors cursor-pointer">
              Lead Status <ArrowRight size={12} /><span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${getStatusStyle(lead.status)}`}>
                 {lead.status}
              </span>
            </div>
          </motion.div>
        )) : (
          /* Empty State - spans full width of the grid */
          <div className="col-span-full py-24 text-center bg-white border border-slate-200 rounded-xl">
            <Activity size={32} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              No records found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadHistory;
