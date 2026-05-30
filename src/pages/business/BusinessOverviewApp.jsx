import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const BusinessOverviewApp = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const { data: rpcData, error } = await supabase.rpc('get_business_overview');
        if (error) {
          console.error('Failed to load business overview:', error);
          return;
        }
        setData(rpcData);
      } catch (err) {
        console.error('Failed to load business overview:', err);
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

  // Chart configuration with updated Semantic Colors (Sage Green #81B398)
  const areaChartConfig = useMemo(() => ({
    series: [{ name: 'Leads Received', data: trend.data.length ? trend.data : [0, 0, 0, 0, 0, 0, 0] }],
    options: {
      chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', zoom: { enabled: false }, background: 'transparent' },
      colors: ['#81B398'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: isLight ? 0.3 : 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
      },
      xaxis: {
        categories: trend.labels,
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '10px', fontWeight: 800 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '10px', fontWeight: 800 } },
        tickAmount: 4,
      },
      grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
      tooltip: { theme: isLight ? 'light' : 'dark' },
      dataLabels: { enabled: false }
    },
  }), [trend, isLight]);

  const radialConfig = {
    series: [completion_rate],
    options: {
      chart: { type: 'radialBar', fontFamily: 'Plus Jakarta Sans' },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { size: '65%' },
          track: { background: isLight ? '#F4F5F7' : 'rgba(255,255,255,0.05)' },
          dataLabels: {
            name: { offsetY: 20, color: isLight ? '#718096' : '#9CA3AF', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' },
            value: { offsetY: -15, color: isLight ? '#1A202C' : '#F4F5F7', fontSize: '28px', fontWeight: 800, formatter: (val) => `${val}%` },
          },
        },
      },
      colors: ['#81B398'],
      stroke: { lineCap: 'round' },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`} strokeWidth={2.5} />
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
      
      {/* HEADER TITLE */}
      <div className="mb-6 px-1">
        <h2 className="text-2xl font-extrabold tracking-tight">Dashboard</h2>
        <p className={`text-sm font-medium mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
          Overview of your recent activity.
        </p>
      </div>

      {/* METRICS GRID - 2 Cards per row on mobile, tight padding */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <MetricCard label="Total Leads" value={total} isLight={isLight} />
        <MetricCard label="Verified" value={verified} isLight={isLight} />
        <MetricCard label="In Progress" value={in_progress} isLight={isLight} />
        <MetricCard label="Success Rate" value={`${completion_rate}%`} isLight={isLight} />
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <div className={`lg:col-span-2 rounded-3xl p-5 border transition-all duration-200 ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
        }`}>
          <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height={280} />
        </div>

        <div className={`rounded-3xl p-5 border transition-all duration-200 ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
        }`}>
          <Chart options={radialConfig.options} series={radialConfig.series} type="radialBar" height={280} />
        </div>
      </div>
    </div>
  );
};

// Simplified Metric Card (No shadow, no icon, clean bento structure)
const MetricCard = ({ label, value, isLight }) => (
  <div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${
    isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
  }`}>
    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
      {label}
    </p>
    <h3 className="text-3xl font-extrabold tracking-tighter">
      {value}
    </h3>
  </div>
);

export default BusinessOverviewApp;