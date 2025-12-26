import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Activity,
  ShieldCheck,
  TrendingUp,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import Chart from 'react-apexcharts';

import frappeApi from '../../api/frappeApi';

const BusinessOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ---- FETCH DASHBOARD DATA (BACKEND AUTHORITY) ----
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await frappeApi.get(
          '/method/business_chain.api.business_dashboard.get_business_overview'
        );
        setData(res.data.message);
      } catch (err) {
        console.error('Failed to load business overview', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // ---- SAFE DEFAULTS (CRITICAL) ----
  const safeData = data || {
    total: 0,
    verified: 0,
    in_progress: 0,
    completed: 0,
    rejected: 0,
    completion_rate: 0,
    trend: { labels: [], data: [] }
  };

  const {
    total,
    verified,
    in_progress,
    completed,
    rejected,
    completion_rate,
    trend
  } = safeData;

  // ---- AREA CHART CONFIG (HOOK ALWAYS RUNS) ----
  const areaChartConfig = useMemo(() => ({
    series: [
      {
        name: 'Leads Received',
        data: trend.data.length ? trend.data : [0, 0, 0, 0, 0, 0, 0],
      },
    ],
    options: {
      chart: {
        type: 'area',
        toolbar: { show: false },
        fontFamily: 'Plus Jakarta Sans',
        zoom: { enabled: false },
      },
      colors: ['#007ACC'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: {
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      xaxis: {
        categories: trend.labels,
        labels: {
          style: { colors: '#94A3B8', fontSize: '11px', fontWeight: 600 },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#94A3B8', fontSize: '11px', fontWeight: 600 },
        },
        tickAmount: 4,
      },
      grid: {
        borderColor: '#F1F5F9',
        strokeDashArray: 4,
      },
      tooltip: {
        y: {
          formatter: (val) => `${val} New Leads`,
        },
      },
    },
  }), [trend]);

  // ---- RADIAL COMPLETION CHART ----
  const radialConfig = {
    series: [completion_rate],
    options: {
      chart: { type: 'radialBar' },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { size: '65%' },
          track: { background: '#F8FAFC' },
          dataLabels: {
            name: {
              offsetY: 20,
              color: '#64748B',
              fontSize: '11px',
              fontWeight: 700,
            },
            value: {
              offsetY: -15,
              color: '#1E293B',
              fontSize: '26px',
              fontWeight: 800,
              formatter: (val) => `${val}%`,
            },
          },
        },
      },
      colors: ['#10B981'],
      stroke: { lineCap: 'round' },
    },
  };

  // ✅ EARLY RETURN IS NOW SAFE
  if (loading) return null;

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-6 pb-16 px-4 sm:px-6 lg:px-0 max-w-[1400px] mx-auto">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#007ACC] border border-blue-100">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Business Analytics
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
              <Activity size={12} className="text-[#007ACC]" />
              Operational Performance
            </p>
          </div>
        </div>
      </motion.div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Leads" value={total} icon={<Users size={18} />} />
        <MetricCard label="Verified" value={verified} icon={<CheckCircle2 size={18} />} />
        <MetricCard label="In Progress" value={in_progress} icon={<Clock size={18} />} />
        <MetricCard label="Rejected" value={rejected} icon={<Activity size={18} />} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <Chart
            options={areaChartConfig.options}
            series={areaChartConfig.series}
            type="area"
            height={280}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <Chart
            options={radialConfig.options}
            series={radialConfig.series}
            type="radialBar"
            height={260}
          />
        </div>
      </div>
    </div>
  );
};

// ---- HELPERS ----

const MetricCard = ({ label, value, icon }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
      {icon}
    </div>
    <p className="text-[11px] font-bold text-slate-400 uppercase mt-4">{label}</p>
    <h3 className="text-3xl font-black text-slate-900">{value}</h3>
  </div>
);

export default BusinessOverview;
