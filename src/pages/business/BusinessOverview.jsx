import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Clock,
  Activity,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const BusinessOverview = () => {
  const cachedData = sessionStorage.getItem("businessOverview");

const [data, setData] = useState(
  cachedData ? JSON.parse(cachedData) : null
);

const [loading, setLoading] = useState(!cachedData);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  useEffect(() => {
    const loadDashboard = async () => {
      if (!data) {
  setLoading(true);
}
      try {
        const { data: rpcData, error } = await supabase.rpc('get_business_overview');
        sessionStorage.setItem(
  "businessOverview",
  JSON.stringify(rpcData)
);
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

  // Ensure arrays are never empty to prevent ApexCharts axis crashing
  const trendLabels = trend?.labels?.length ? trend.labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const trendData = trend?.data?.length ? trend.data : [0, 0, 0, 0, 0, 0, 0];

  // Chart Configurations mapped to Earth-Tech Palette
  const areaChartConfig = useMemo(() => ({
    series: [{ name: 'Leads Received', data: trendData }],
    options: {
      chart: { 
        type: 'area', 
        toolbar: { show: false }, 
        fontFamily: 'Plus Jakarta Sans', 
        zoom: { enabled: false }, 
        background: 'transparent', 
        parentHeightOffset: 0,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800,
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      colors: ['#DAC18A'], // Earth-Tech Sand
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: isLight ? 0.3 : 0.4, opacityTo: 0, stops: [0, 100] },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: trendLabels,
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '12px', fontFamily: 'Plus Jakarta Sans', fontWeight: 500 } },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '12px', fontFamily: 'Plus Jakarta Sans', fontWeight: 500 } },
        tickAmount: 4,
      },
      grid: { 
        borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', 
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
        padding: { top: 0, right: 0, bottom: 0, left: 10 } 
      },
      tooltip: { theme: isLight ? 'light' : 'dark' },
    },
  }), [trendData, trendLabels, isLight]);

  const radialConfig = {
    series: [completion_rate],
    options: {
      chart: { type: 'radialBar', sparkline: { enabled: true }, parentHeightOffset: 0 },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { size: '65%' },
          track: { background: isLight ? '#F4F5F7' : '#131720', strokeWidth: '100%' },
          dataLabels: {
            name: { offsetY: 20, color: isLight ? '#718096' : '#9CA3AF', fontSize: '12px', fontWeight: 600, fontFamily: 'Plus Jakarta Sans' },
            value: { offsetY: -15, color: isLight ? '#1A202C' : '#F4F5F7', fontSize: '28px', fontWeight: 800, fontFamily: 'Plus Jakarta Sans', formatter: (val) => `${val}%` },
          },
        },
      },
      colors: ['#81B398'], // Earth-Tech Sage Green
      stroke: { lineCap: 'round' },
    },
  };

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0">
        {/* Header Skeleton */}
        <div className="pt-2 mb-6">
          <div className={`h-10 w-48 rounded-md mb-2 ${pulseClass} animate-pulse`} />
          <div className={`h-4 w-64 rounded-md ${pulseClass} animate-pulse`} />
        </div>

        {/* Top Row: Metric Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className={`p-6 rounded-2xl border flex flex-col justify-between h-[140px] lg:h-[160px] animate-pulse min-w-0 ${surfaceClass}`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`h-4 w-20 rounded-md ${pulseClass}`} />
                <div className={`h-8 w-8 rounded-lg ${pulseClass}`} />
              </div>
              <div className={`h-8 w-16 rounded-md ${pulseClass}`} />
            </div>
          ))}
        </div>

        {/* Bottom Row: Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-6">
          <div className={`lg:col-span-2 h-[360px] rounded-2xl border animate-pulse min-w-0 ${surfaceClass}`} />
          <div className={`lg:col-span-1 h-[360px] rounded-2xl border animate-pulse min-w-0 ${surfaceClass}`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2 lg:mt-4 px-4 lg:px-0 ${textPrimary}`}>
      
      {/* HEADER (Free/Borderless) */}
      <div className="pt-2">
        <h1 className={`text-[32px] lg:text-[40px] font-extrabold tracking-tight leading-none mb-2 ${textPrimary}`}>
          Dashboard
        </h1>
        <p className={`text-sm font-medium ${textSecondary}`}>
          Monitor your business lead performance and analytics.
        </p>
      </div>

      {/* TOP ROW: Core Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8">
        <MetricCard 
          label="Total Leads" 
          value={total} 
          icon={<Users size={18} />} 
          isLight={isLight} 
          colorClass={isLight ? 'bg-[#F4F5F7] text-[#48477A]' : 'bg-[#131720] text-[#81B398]'}
        />
        <MetricCard 
          label="Verified" 
          value={verified} 
          icon={<ShieldCheck size={18} />} 
          isLight={isLight} 
          colorClass={isLight ? 'bg-[#F4F5F7] text-[#81B398]' : 'bg-[#81B398]/10 text-[#81B398]'}
        />
        <MetricCard 
          label="In Progress" 
          value={in_progress} 
          icon={<Clock size={18} />} 
          isLight={isLight} 
          colorClass={isLight ? 'bg-[#F4F5F7] text-[#DAC18A]' : 'bg-[#DAC18A]/10 text-[#DAC18A]'}
        />
      </div>

      {/* BOTTOM ROW: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Side: Trend Chart (Col Span 2) */}
    <div className={`lg:col-span-2 min-w-0 p-6 lg:p-8 rounded-2xl border transition-all duration-300 flex flex-col ${surfaceClass}`}>
  <div className="flex justify-between items-center mb-6 shrink-0">
    <h3 className={`text-xl font-bold tracking-tight ${textPrimary}`}>Activity</h3>
    <div className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors border ${
      isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
    }`}>
      <TrendingUp size={14} /> Earning Trends
    </div>
  </div>
  
  {/* Removed overflow-hidden to prevent clipping the line at the bottom when values are 0 */}
  <div className="w-full h-[260px]">
    <Chart 
      key={`trend-chart-${isLight ? 'light' : 'dark'}`} 
      options={{
        ...areaChartConfig.options,
        stroke: { 
          ...areaChartConfig.options?.stroke,
          show: true, 
          curve: 'smooth', 
          width: 3 
        },
        markers: { 
          size: 5, 
          colors: ['#DAC18A'],
          strokeColors: isLight ? '#FFFFFF' : '#131720',
          strokeWidth: 2,
          hover: { size: 7 }
        }
      }} 
      series={areaChartConfig.series} 
      type="area" 
      height="100%" 
      width="100%" 
    />
  </div>
</div>

        {/* Right Side: Success Rate Radial Highlight (Col Span 1) */}
        <div className={`lg:col-span-1 min-w-0 p-6 lg:p-8 rounded-2xl border flex flex-col transition-all duration-300 ${surfaceClass}`}>
          <div className="w-full flex justify-between items-start mb-2 shrink-0">
            <div>
              <h3 className={`text-xl font-bold tracking-tight ${textPrimary}`}>Success Score</h3>
              <p className={`text-xs font-medium mt-1 ${textSecondary}`}>Based on completed leads</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}>
              <Activity size={18} className="text-[#81B398]" />
            </div>
          </div>
          {/* Strictly constrained flex container for Radial Chart */}
          <div className="flex-1 w-full h-[200px] flex items-center justify-center overflow-hidden -my-2">
            <Chart 
              key={`radial-chart-${isLight ? 'light' : 'dark'}`}
              options={radialConfig.options} 
              series={radialConfig.series} 
              type="radialBar" 
              height="100%" 
              width="100%" 
            />
          </div>
          <div className="w-full mt-auto pt-2 shrink-0 flex justify-center">
            <span className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${
              isLight ? 'bg-[#F0524F] text-white' : 'bg-[#F0524F] text-white'
            }`}>
              {completion_rate}% Now
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};

// Extracted Metric Card Component for clean rendering
const MetricCard = ({ label, value, icon, isLight, colorClass }) => {
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';

  return (
    <div className={`min-w-0 p-5 lg:p-6 rounded-2xl border flex flex-col justify-between h-[140px] lg:h-[160px] transition-all duration-300 ${surfaceClass}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wider truncate mr-2 ${textSecondary}`}>
          {label}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
          {icon}
        </div>
      </div>
      <h3 className={`text-3xl lg:text-4xl font-bold tracking-tight truncate ${textPrimary}`}>
        {value}
      </h3>
    </div>
  );
};

export default BusinessOverview;