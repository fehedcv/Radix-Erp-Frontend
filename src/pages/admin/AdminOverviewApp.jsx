import React, { useEffect, useState, useMemo } from 'react';
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

const AdminOverviewApp = () => {
  const navigate = useNavigate();
  
  // --- THEME INTEGRATION ---
  const { theme } = useTheme();
  const isLight = theme === 'light';

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

  // --- CHART CONFIGURATIONS (Updated to Match Theme & Sage Green Accents) ---
  const activityTrendConfig = useMemo(() => ({
    series: [{ name: 'Projects', data: trendChartData.data }],
    options: {
      chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false }, animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
      colors: ['#81B398'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: isLight ? 0.3 : 0.45, opacityTo: 0.05, stops: [0, 90, 100] } },
      xaxis: { categories: trendChartData.labels, labels: { style: { fontSize: '10px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { fontSize: '10px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } } },
      grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: { theme: isLight ? 'light' : 'dark' },
    }
  }), [trendChartData, isLight]);

  const statusDistributionConfig = useMemo(() => ({
    series: [stats.statusCounts.Pending, stats.statusCounts.Verified, stats.statusCounts.Completed],
    options: {
      chart: { type: 'donut', animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
      labels: ['Pending', 'Verified', 'Success'],
      colors: ['#F59E0B', '#48477A', '#81B398'],
      legend: { position: 'bottom', fontSize: '10px', fontWeight: 800, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
      plotOptions: { pie: { donut: { size: '70%' } }, stroke: { colors: isLight ? '#FFFFFF' : '#222938' } },
      dataLabels: { enabled: false },
      tooltip: { theme: isLight ? 'light' : 'dark' },
    }
  }), [stats, isLight]);

  const performanceConfig = useMemo(() => ({
    series: [{ name: 'Projects Received', data: partnerPerformanceData.data }],
    options: {
      chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
      colors: ['#81B398'],
      plotOptions: { bar: { borderRadius: 4, columnWidth: '35%' } },
      xaxis: { categories: partnerPerformanceData.labels, labels: { style: { fontSize: '9px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } }, axisBorder: { show: false }, axisTicks: { show: false } },
      yaxis: { labels: { style: { fontSize: '10px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } } },
      grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
      dataLabels: { enabled: false },
      tooltip: { theme: isLight ? 'light' : 'dark' },
    }
  }), [partnerPerformanceData, isLight]);

  if (loading) {
    return <SkeletonLoader isLight={isLight} />;
  }

  const dashboardAgents = (dashboard.allAgents || []).slice(0, 4);

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
      
      {/* 1. FREE HEADING */}
      <div className="mb-4 px-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-1">Network Operations</h2>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Ecosystem performance and IBP portfolio overview.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/leads')}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
        >
          View Contract History <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* 2. METRIC NODES (MOVED TO TOP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'ACTIVE PORTFOLIOS', val: stats.totalLeads, icon: <Activity size={16} strokeWidth={2.5}/>, color: 'text-[#81B398]', bg: isLight ? 'bg-[#81B398]/10' : 'bg-[#81B398]/10' },
          { label: 'ACTIVE DIVISIONS', val: stats.totalUnits, icon: <Building2 size={16} strokeWidth={2.5}/>, color: 'text-[#48477A]', bg: isLight ? 'bg-[#48477A]/10' : 'bg-[#48477A]/10' },
          { label: 'ACTIVE IBPs', val: dashboard.totalAgents, icon: <Users size={16} strokeWidth={2.5}/>, color: 'text-[#81B398]', bg: isLight ? 'bg-[#81B398]/10' : 'bg-[#81B398]/10' },
          { label: 'PENDING APPROVALS', val: dashboard.inquiryPending, icon: <Clock size={16} strokeWidth={2.5}/>, color: 'text-amber-500', bg: isLight ? 'bg-amber-500/10' : 'bg-amber-500/10' }
        ].map((m, i) => (
          <div 
            key={i}
            className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center cursor-default ${
              isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{m.label}</p>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${m.bg} ${m.color}`}>
                {m.icon}
              </div>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tighter">{m.val.toLocaleString()}</h3>
          </div>
        ))}
      </div>

      {/* 3. ANALYTICS SUITE (MOVED BELOW METRICS) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
        <ChartCard title="Real-time project influx" subtitle="Real-time inquiry flow" isLight={isLight}>
          <Chart options={activityTrendConfig.options} series={activityTrendConfig.series} type="area" height={240} />
        </ChartCard>
        
        <ChartCard title="Inquiry Status" subtitle="Verification distribution" isLight={isLight}>
          <Chart options={statusDistributionConfig.options} series={statusDistributionConfig.series} type="donut" height={240} />
        </ChartCard>

        <ChartCard title="Division Performance." subtitle="Top performing business units" isLight={isLight}>
          <Chart options={performanceConfig.options} series={performanceConfig.series} type="bar" height={240} />
        </ChartCard>
      </div>

      {/* 4. TEAM & PARTNER SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        {/* TEAM ONBOARDING */}
        <div className={`lg:col-span-8 rounded-3xl border transition-all duration-200 overflow-hidden ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
        }`}>
          <div className={`px-5 md:px-6 py-5 border-b flex items-center justify-between ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]/50' : 'border-white/10 bg-[#1A1A24]/50'}`}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <UserPlus size={14} strokeWidth={2.5} className="text-[#81B398]" /> IBP Network Expansion
            </h4>
            <button onClick={() => navigate('/admin/agents')} className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${isLight ? 'text-[#81B398] hover:text-[#6FA085]' : 'text-[#81B398] hover:text-white'}`}>Directory →</button>
          </div>
          <div className="p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
            {dashboardAgents.map((agent, i) => {
              const displayName = agent.full_name || agent.name || agent.agentName || `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Unknown Agent';
              const email = agent.email || agent.name || 'N/A';
              const initials = displayName.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase();
              const status = agent.status || (agent.isActive ? 'Active' : 'Inactive') || 'Pending';
              return (
                <div key={i} className={`flex items-center gap-4 p-4 border rounded-2xl transition-all group ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#131720] border-white/10 hover:border-[#81B398]'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs uppercase transition-transform group-hover:scale-105 shrink-0 ${
                    isLight ? 'bg-[#1A202C] text-white' : 'bg-[#F4F5F7] text-[#1A202C]'
                  }`}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-extrabold uppercase truncate tracking-wider">{displayName}</p>
                    <p className={`text-[9px] font-bold uppercase tracking-wider truncate mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{email}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${status === 'Active' ? 'bg-[#81B398]' : 'bg-amber-500'}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* KEY PARTNERS */}
        <div className={`lg:col-span-4 rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
        }`}>
          <div className={`px-5 md:px-6 py-5 border-b ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]/50' : 'border-white/10 bg-[#1A1A24]/50'}`}>
            <h4 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <Building2Icon size={14} strokeWidth={2.5} className="text-[#81B398]" /> Execution Teams
            </h4>
          </div>
          <div className="p-4 space-y-2 flex-1">
            {(dashboard.allBusinessUnits || []).slice(0, 5).map((unit, i) => {
              const displayName = unit.business_name || unit.name || unit.unitName || 'Unknown';
              const location = unit.category || unit.address || 'Unknown';
              return (
                <div key={i} onClick={() => navigate('/admin/units')} className={`flex items-center justify-between p-4 border rounded-2xl transition-all cursor-pointer group ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#131720] border-white/10 hover:border-[#81B398]'
                }`}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                      isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#81B398] group-hover:bg-[#81B398] group-hover:text-white group-hover:border-[#81B398]' : 'bg-[#222938] border-white/10 text-[#81B398] group-hover:bg-[#81B398] group-hover:text-white group-hover:border-[#81B398]'
                    }`}>
                      <Database size={14} strokeWidth={2.5} />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider truncate">{displayName}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-wider truncate mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{location.split(',')[0]}</p>
                    </div>
                  </div>
                  <ChevronRight size={14} strokeWidth={2.5} className={isLight ? 'text-[#718096] group-hover:text-[#81B398]' : 'text-[#9CA3AF] group-hover:text-[#81B398]'} />
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
const ChartCard = ({ title, subtitle, children, isLight }) => (
  <div className={`rounded-3xl p-5 md:p-6 border transition-all duration-200 ${
    isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
  }`}>
    <div className="mb-5">
      <h4 className="text-sm font-extrabold uppercase tracking-tight">{title}</h4>
      <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{subtitle}</p>
    </div>
    <div className="w-full">{children}</div>
  </div>
);

// --- SKELETON LOADER ---
const SkeletonLoader = ({ isLight }) => (
  <div className="space-y-4 pt-2 pb-6 w-full animate-pulse">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1 mb-4">
       <div className="space-y-2">
         <div className={`w-48 h-8 rounded-lg ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
         <div className={`w-32 h-3 rounded ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
       </div>
       <div className={`w-40 h-12 rounded-xl ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
    </div>

    {/* Metrics */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {[1,2,3,4].map(i => <div key={i} className={`h-32 rounded-3xl ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} border`} />)}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
      {[1,2,3].map(i => <div key={i} className={`h-72 rounded-3xl ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} border`} />)}
    </div>

    {/* Bottom Sections */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 mt-4">
      <div className={`lg:col-span-8 h-80 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      <div className={`lg:col-span-4 h-80 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
    </div>
  </div>
);

export default AdminOverviewApp;