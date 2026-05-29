import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, Zap, TrendingUp, 
  ShieldCheck, ArrowRight, BarChart3, 
  Plus, UserPlus, Clock, Database, Sparkles, Activity, ChevronRight,
  UserCog,
  BriefcaseBusinessIcon,
  Building2Icon,
  GitCompareArrows,
  AppWindowMacIcon
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const AdminOverview = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';

  const [stats, setStats] = useState({
    totalLeads: 0,
    totalUnits: 0,
    totalCredits: 0,
    statusCounts: { Pending: 0, Verified: 0, Completed: 0 }
  });

  const [dashboard, setDashboard] = useState({
    inquiryGenerated: [],
    inquiryPending: 0,
    inquiryVerified: 0,
    inquiryCompleted: 0,
    topBusinessUnits: [],
    allBusinessUnits: [],
    totalLeads: 0,
    totalBusinessUnits: 0,
    totalAgents: 0,
    allAgents: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data, error } = await supabase.rpc('get_admin_dashboard_data');
        if (error) {
          console.error('Admin dashboard fetch failed:', error);
          return;
        }

        setDashboard(data);
        setStats({
          totalLeads: Number(data.totalLeads || 0),
          totalUnits: Number(data.totalBusinessUnits || 0),
          totalCredits: Number(data.totalAgents || 0),
          statusCounts: {
            Pending: Number(data.inquiryPending || 0),
            Verified: Number(data.inquiryVerified || 0),
            Completed: Number(data.inquiryCompleted || 0)
          }
        });
      } catch (error) {
        console.error('Admin dashboard fetch failed:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // --- REAL DATA CHART PROCESSING ---
  const trendChartData = useMemo(() => {
    const source = dashboard.inquiryGenerated || [];

    const dailyCounts = source.reduce((acc, item) => {
      const date = item.date || item.day || item.label || '';
      const count = Number(item.count ?? item.value ?? 1);
      if (!date) return acc;
      acc[date] = (acc[date] || 0) + count;
      return acc;
    }, {});

    const sortedDates = Object.keys(dailyCounts).sort().slice(-7);
    return {
      labels: sortedDates.map(d => d.split('-').slice(1).join('/')),
      data: sortedDates.map(d => dailyCounts[d])
    };
  }, [dashboard.inquiryGenerated]);

  const partnerPerformanceData = useMemo(() => {
    const source = (dashboard.topBusinessUnits || []).map((item) => ({
      label: item.business_name || item.business_unit || item.name || 'Unknown',
      count: Number(item.lead_count ?? item.count ?? 0)
    }));

    const labels = source.map((s) => s.label).slice(0, 7);
    return {
      labels,
      data: source.map((s) => s.count).slice(0, 7)
    };
  }, [dashboard.topBusinessUnits]);

  // --- CHART CONFIGURATIONS (Memoized & Safely Fallbacked) ---
  const activityTrendConfig = useMemo(() => ({
    series: [{ name: 'Inquiries', data: trendChartData.data.length ? trendChartData.data : [0] }],
    options: {
      chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
      colors: ['#48477A'], // Muted Indigo
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: isLight ? 0.3 : 0.4, opacityTo: 0 } },
      xaxis: { 
        categories: trendChartData.labels.length ? trendChartData.labels : ['N/A'], 
        labels: { style: { fontSize: '11px', fontWeight: 600, colors: isLight ? '#718096' : '#9CA3AF' } }, 
        axisBorder: {show: false}, 
        axisTicks: {show: false} 
      },
      yaxis: { labels: { style: { fontSize: '11px', fontWeight: 600, colors: isLight ? '#718096' : '#9CA3AF' } } },
      grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: {lines: {show: false}}, padding: {left: 10, right: 0, bottom: 0, top: 0} },
      dataLabels: { enabled: false },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  }), [trendChartData, isLight]);

  const statusDistributionConfig = useMemo(() => ({
    series: [stats.statusCounts.Pending, stats.statusCounts.Verified, stats.statusCounts.Completed],
    options: {
      chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
      labels: ['Pending', 'Verified', 'Success'],
      colors: ['#DAC18A', '#48477A', '#81B398'], // Sand, Indigo, Sage
      legend: { position: 'bottom', fontSize: '11px', fontWeight: 600, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
      plotOptions: { pie: { donut: { size: '75%' } } },
      dataLabels: { enabled: false },
      stroke: { show: false },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  }), [stats.statusCounts, isLight]);

  const performanceConfig = useMemo(() => ({
    series: [{ name: 'Leads Received', data: partnerPerformanceData.data.length ? partnerPerformanceData.data : [0] }],
    options: {
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
      colors: ['#81B398'], // Sage Green
      plotOptions: { bar: { borderRadius: 4, columnWidth: '35%' } },
      xaxis: { 
        categories: partnerPerformanceData.labels.length ? partnerPerformanceData.labels : ['N/A'], 
        labels: { style: { fontSize: '10px', fontWeight: 600, colors: isLight ? '#718096' : '#9CA3AF' } }, 
        axisBorder: {show: false}, 
        axisTicks: {show: false} 
      },
      yaxis: { labels: { style: { fontSize: '11px', fontWeight: 600, colors: isLight ? '#718096' : '#9CA3AF' } } },
      grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: {lines: {show: false}}, padding: {left: 10, right: 0, bottom: 0, top: 0} },
      dataLabels: { enabled: false },
      tooltip: { theme: isLight ? 'light' : 'dark' }
    }
  }), [partnerPerformanceData, isLight]);

  const dashboardAgents = (dashboard.allAgents || []).slice(0, 4);

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0 transition-colors duration-300 ${textPrimary}`}>
      
      {/* 1. FREE HEADER & GLOBAL ACTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pt-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            System Analytics
          </h1>
          <p className={`text-sm font-medium ${textSecondary}`}>
            Platform performance and partner tracking overview.
          </p>
        </div>
        <button 
          onClick={() => navigate('/admin/leads')}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#81B398] text-[#FFFFFF] rounded-lg text-sm font-semibold transition-all hover:bg-[#6FA085]"
        >
          View Lead History <ArrowRight size={16} />
        </button>
      </div>

      {/* 2. METRIC NODES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { label: 'Total Inquiries', val: stats.totalLeads, icon: <Activity size={18}/>, color: isLight ? 'text-[#48477A] bg-[#48477A]/10' : 'text-[#81B398] bg-[#131720]' },
          { label: 'Business Partners', val: stats.totalUnits, icon: <Building2 size={18}/>, color: isLight ? 'text-[#81B398] bg-[#F4F5F7]' : 'text-[#81B398] bg-[#81B398]/10' },
          { label: 'Total Agents', val: dashboard.totalAgents, icon: <Users size={18}/>, color: isLight ? 'text-[#48477A] bg-[#F4F5F7]' : 'text-[#48477A] bg-[#48477A]/10' },
          { label: 'Pending Requests', val: dashboard.inquiryPending, icon: <Clock size={18}/>, color: isLight ? 'text-[#DAC18A] bg-[#F4F5F7]' : 'text-[#DAC18A] bg-[#DAC18A]/10' }
        ].map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={`p-5 lg:p-6 rounded-2xl border flex flex-col justify-between h-[140px] lg:h-[160px] transition-all duration-300 min-w-0 ${surfaceClass}`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-xs font-semibold uppercase tracking-wider truncate mr-2 ${textSecondary}`}>{m.label}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                {m.icon}
              </div>
            </div>
            <h3 className="text-3xl lg:text-4xl font-bold tracking-tight truncate">{m.val.toLocaleString()}</h3>
          </motion.div>
        ))}
      </div>

      {/* 3. ANALYTICS SUITE (CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <ChartCard title="Daily Activity" subtitle="Real-time inquiry flow" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-1">
          <Chart options={activityTrendConfig.options} series={activityTrendConfig.series} type="area" height="100%" width="100%" />
        </ChartCard>
        
        <ChartCard title="Inquiry Status" subtitle="Verification distribution" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-1">
          <Chart options={statusDistributionConfig.options} series={statusDistributionConfig.series} type="donut" height="100%" width="100%" />
        </ChartCard>

        <ChartCard title="Partner Ranking" subtitle="Top performing business units" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-1">
          <Chart options={performanceConfig.options} series={performanceConfig.series} type="bar" height="100%" width="100%" />
        </ChartCard>
      </div>

      {/* 4. TEAM & PARTNER SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* TEAM ONBOARDING */}
        <div className={`lg:col-span-8 rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 ${surfaceClass}`}>
          <div className={`px-6 py-5 border-b flex items-center justify-between ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <UserPlus size={18} className="text-[#81B398]" /> Team Onboarding
            </h4>
            <button onClick={() => navigate('/admin/agents')} className={`text-xs font-semibold hover:text-[#81B398] transition-colors ${textSecondary}`}>
              Directory →
            </button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardAgents.map((agent, i) => {
              const displayName = agent.full_name || agent.name || agent.agentName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Unknown Agent';
              const email = agent.email || agent.name || 'N/A';
              const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
              const status = agent.status || (agent.isActive ? 'Active' : 'Inactive') || 'Pending';
              
              return (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm uppercase shrink-0 ${isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'}`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{displayName}</p>
                    <p className={`text-xs font-medium truncate mt-0.5 ${textSecondary}`}>{email}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${status === 'Active' ? 'bg-[#81B398]' : 'bg-[#DAC18A]'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* KEY PARTNERS */}
        <div className={`lg:col-span-4 rounded-2xl border flex flex-col overflow-hidden transition-all duration-300 ${surfaceClass}`}>
          <div className={`px-6 py-5 border-b ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <Building2Icon size={18} className="text-[#81B398]" /> Partners
            </h4>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {(dashboard.allBusinessUnits || []).slice(0, 5).map((unit, i) => {
              const displayName = unit.business_name || unit.name || unit.unitName || 'Unknown';
              const location = unit.category || unit.address || 'Unknown';
              
              return (
                <div key={i} onClick={() => navigate('/admin/units')} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 hover:bg-[#131720]'
                }`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isLight ? 'bg-[#F4F5F7] text-[#718096]' : 'bg-[#131720] text-[#9CA3AF]'}`}>
                      <Database size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate">{displayName}</p>
                      <p className={`text-xs font-medium truncate mt-0.5 ${textSecondary}`}>{location.split(',')[0]}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={`shrink-0 ${textSecondary}`} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CHART CARD HELPER ---
const ChartCard = ({ title, subtitle, children, isLight, surfaceClass, className }) => {
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`min-w-0 p-6 lg:p-8 rounded-2xl border flex flex-col transition-all duration-300 ${surfaceClass} ${className || ''}`}
    >
      <div className="mb-6 shrink-0">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>{title}</h4>
        <p className={`text-xs font-medium mt-1 ${textSecondary}`}>{subtitle}</p>
      </div>
      {/* Use fixed height container to stop ApexCharts from collapsing */}
      <div className="w-full relative h-[250px]">
        {children}
      </div>
    </motion.div>
  );
};

export default AdminOverview;