import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search, Filter, Calendar, Building2,
  ChevronRight, BarChart3, PieChart,
  Activity
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';

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
    return leads.filter(lead => {
      const matchesSearch =
        lead.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.id.toLowerCase().includes(searchTerm.toLowerCase());

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
      <div className="py-32 text-center text-slate-400 font-black uppercase text-xs">
        Loading history…
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">
          My Activity History
        </h2>
        <p className="text-sm text-slate-500 italic">
          Reviewing your past referrals and outcomes.
        </p>
      </div>

      {/* SEARCH / FILTER */}
      <div className="bg-white border rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by client or deal ID..."
              className="w-full pl-11 pr-5 py-3 rounded-xl border text-xs font-bold"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-48 pl-4 pr-8 py-3 rounded-xl border text-[10px] font-bold uppercase"
          >
            <option value="All">All Status</option>
            <option value="Successful">Successful</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border">
          <BarChart3 size={16} className="text-[#007ACC] mb-4" />
          <Chart options={barChartConfig.options} series={barChartConfig.series} type="bar" height={220} />
        </div>

        <div className="bg-white p-6 rounded-2xl border">
          <PieChart size={16} className="text-[#007ACC] mb-4" />
          <Chart options={donutChartConfig.options} series={donutChartConfig.series} type="donut" height={240} />
        </div>
      </div>

      {/* LIST */}
      <div className="bg-white border rounded-2xl overflow-hidden">
        {filteredLeads.length ? filteredLeads.map((lead, i) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-4 p-6 border-b"
          >
            <span className="font-black text-xs">{lead.id}</span>
            <span className="font-bold uppercase">{lead.clientName}</span>
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <Building2 size={12} /> {lead.businessUnit}
            </span>
            <span className="flex items-center gap-2 text-xs text-slate-400">
              <Calendar size={12} /> {lead.date}
            </span>
            <span className={`px-4 py-1.5 text-[9px] font-black rounded-full border ${getStatusStyle(lead.status)}`}>
              {lead.status}
            </span>
          </motion.div>
        )) : (
          <div className="py-24 text-center">
            <Activity size={32} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px]">
              No records found
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadHistory;
