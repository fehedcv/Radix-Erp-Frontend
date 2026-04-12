import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Activity,
  ShieldCheck,
  TrendingUp,
  Loader2
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';
import { useTheme } from '../../context/ThemeContext';

const BusinessOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isLight = theme === 'light';

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

  const safeData = data || {
    total: 0,
    verified: 0,
    in_progress: 0,
    completion_rate: 0,
    trend: { labels: [], data: [] }
  };

  const { total, verified, in_progress, completion_rate, trend } = safeData;

  const areaChartConfig = useMemo(() => ({
    series: [{ name: 'Leads Received', data: trend.data.length ? trend.data : [0, 0, 0, 0, 0, 0, 0] }],
    options: {
      chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', zoom: { enabled: false }, background: 'transparent' },
      colors: ['#61D9DE'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: isLight ? 0.3 : 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      xaxis: {
        categories: trend.labels,
        labels: { style: { colors: isLight ? '#9A9FA5' : '#94A3B8', fontSize: '11px', fontWeight: 600 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: isLight ? '#9A9FA5' : '#94A3B8', fontSize: '11px', fontWeight: 600 } },
        tickAmount: 4,
      },
      grid: { borderColor: isLight ? '#E8ECEF' : 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
      tooltip: { theme: isLight ? 'light' : 'dark' },
    },
  }), [trend, isLight]);

  const radialConfig = {
    series: [completion_rate],
    options: {
      chart: { type: 'radialBar' },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { size: '65%' },
          track: { background: isLight ? '#F0F2F5' : 'rgba(255,255,255,0.05)' },
          dataLabels: {
            name: { offsetY: 20, color: isLight ? '#9A9FA5' : '#64748B', fontSize: '11px', fontWeight: 700 },
            value: { offsetY: -15, color: isLight ? '#1A1D1F' : '#E2E8F0', fontSize: '26px', fontWeight: 800, formatter: (val) => `${val}%` },
          },
        },
      },
      colors: ['#61D9DE'],
      stroke: { lineCap: 'round' },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className={`h-10 w-10 animate-spin mb-4 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]'}`} />
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-6 pb-16 transition-colors duration-300 ${isLight ? 'text-[#1A1D1F]' : 'text-[#E2E8F0]'}`}>
      
      {/* HEADER CARD - Now #F8FAFB */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border transition-all duration-300 ${
          isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10 shadow-sm'
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-colors ${
            isLight ? 'bg-white text-[#61D9DE] border-[#E8ECEF]' : 'bg-blue-50/10 text-[#38BDF8] border-blue-500/20'
          }`}>
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Analytics</h2>
            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>Performance Overview</p>
          </div>
        </div>
      </motion.div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Leads" value={total} icon={<Users size={18} />} isLight={isLight} />
        <MetricCard label="Verified" value={verified} icon={<ShieldCheck size={18} />} isLight={isLight} />
        <MetricCard label="In Progress" value={in_progress} icon={<Clock size={18} />} isLight={isLight} />
        <MetricCard label="Success Rate" value={`${completion_rate}%`} icon={<Activity size={18} />} isLight={isLight} />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 rounded-2xl p-6 border transition-all ${
          isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10 shadow-sm'
        }`}>
          <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height={280} />
        </div>

        <div className={`rounded-2xl p-6 border transition-all ${
          isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10 shadow-sm'
        }`}>
          <Chart options={radialConfig.options} series={radialConfig.series} type="radialBar" height={260} />
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, icon, isLight }) => (
  <div className={`rounded-2xl p-6 border transition-all ${
    isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10 shadow-sm'
  }`}>
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
      isLight ? 'bg-white text-[#61D9DE] border-[#E8ECEF] border' : 'bg-blue-50/10 text-[#38BDF8] border border-white/5'
    }`}>
      {icon}
    </div>
    <p className={`text-[11px] font-bold uppercase mt-4 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>{label}</p>
    <h3 className="text-3xl font-black">{value}</h3>
  </div>
);

export default BusinessOverview;