import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import {
  Search, Filter, Calendar, Building2,
  ChevronRight, BarChart3, PieChart,
  Activity
} from 'lucide-react';
import Chart from 'react-apexcharts';

const LeadHistory = () => {
  const { myLeads = [] } = useOutletContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  /* ---------------- FILTER LOGIC (UNCHANGED) ---------------- */
  const filteredLeads = useMemo(() => {
    return myLeads.filter(lead => {
      const clientName = lead.clientName || "";
      const leadId = lead.id || "";
      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leadId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || lead.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [myLeads, searchTerm, filterStatus]);

  /* ---------------- CHART LOGIC (UNCHANGED) ---------------- */
  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, Successful: 0, Rejected: 0 };
    myLeads.forEach(l => {
      if (['Verified', 'Completed', 'Successful'].includes(l.status)) counts.Successful++;
      else if (l.status === 'Rejected') counts.Rejected++;
      else counts.Pending++;
    });
    return counts;
  }, [myLeads]);

  const barChartConfig = {
    series: [{ name: 'Deals', data: [statusCounts.Successful, statusCounts.Pending, statusCounts.Rejected] }],
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
    series: [statusCounts.Successful, statusCounts.Pending, statusCounts.Rejected],
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
      plotOptions: {
        pie: { donut: { size: '72%' } }
      }
    }
  };

  const getStatusStyle = (status) => {
    if (['Verified', 'Completed', 'Successful'].includes(status))
      return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (status === 'Rejected')
      return 'bg-rose-50 text-rose-600 border-rose-100';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif] pb-24">

      {/* ================= PAGE HEADER ================= */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Activity History
        </h2>
        <p className="text-sm text-slate-500 font-medium italic mt-1">
          Reviewing your past referrals and deal outcomes.
        </p>
      </div>

      {/* ================= SEARCH + FILTER (TOP, MODERN) ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">

          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by client or deal ID..."
              className="
                w-full pl-11 pr-5 py-3
                rounded-xl border border-slate-200
                text-xs font-bold
                focus:border-[#007ACC] outline-none
                shadow-sm
              "
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="relative w-full sm:w-48">
            <Filter
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <select
              onChange={(e) => setFilterStatus(e.target.value)}
              className="
                w-full pl-10 pr-8 py-3
                rounded-xl border border-slate-200
                bg-white text-[10px] font-bold uppercase tracking-widest
                focus:border-[#007ACC] outline-none
                appearance-none cursor-pointer
                shadow-sm
              "
            >
              <option value="All">All Status</option>
              <option value="Successful">Successful</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

        </div>
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-[#007ACC]" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Outcome Distribution
            </h4>
          </div>
          <div className="h-[200px]">
            <Chart
              options={barChartConfig.options}
              series={barChartConfig.series}
              type="bar"
              height="100%"
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <PieChart size={16} className="text-[#007ACC]" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Performance Ratio
            </h4>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
            <Chart
              options={donutChartConfig.options}
              series={donutChartConfig.series}
              type="donut"
              height={240}
            />
          </div>
        </div>
      </div>

      {/* ================= HISTORY LIST ================= */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="hidden lg:grid grid-cols-5 px-8 py-4 bg-slate-50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest">
          <div>Deal ID</div>
          <div>Client Name</div>
          <div>Business Team</div>
          <div>Date Submitted</div>
          <div className="text-right">Status</div>
        </div>

        <div className="divide-y divide-slate-50">
          {filteredLeads.length ? filteredLeads.map((lead, idx) => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-6 lg:px-8 hover:bg-slate-50/50"
            >
              <div className="flex justify-between lg:block">
                <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg">
                  {lead.id}
                </span>
                <span className={`lg:hidden px-3 py-1 text-[9px] font-black rounded-full border ${getStatusStyle(lead.status)}`}>
                  {lead.status}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 uppercase">
                {lead.clientName}
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <Building2 size={12} /> {lead.businessUnit}
              </div>

              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                <Calendar size={12} /> {lead.date}
              </div>

              <div className="hidden lg:flex justify-end items-center gap-3">
                <span className={`px-4 py-1.5 text-[9px] font-black rounded-full border ${getStatusStyle(lead.status)}`}>
                  {lead.status}
                </span>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
            </motion.div>
          )) : (
            <div className="py-24 text-center">
              <Activity size={32} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                No matching records found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadHistory;
