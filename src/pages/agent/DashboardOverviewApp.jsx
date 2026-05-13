import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Wallet, Clock, ArrowRight, BarChart3, TrendingUp, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; 
import { supabase } from '../../supabase/supabaseClient'; 

// ==========================================
// 1:1 STRUCTURAL SKELETON (BENTO STYLE)
// ==========================================
const DashboardSkeleton = ({ theme }) => {
  const isLight = theme === 'light';
  const pulseColor = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';
  const cardBg = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10';

  return (
    <div className="space-y-4 pb-24">
      {/* Separator to match the actual layout */}
      <div className={`w-full h-[1px] mb-6 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`} />
      
      {/* Title Skeleton */}
      <div className={`h-8 w-40 rounded-xl ${pulseColor} animate-pulse`} />

      {/* Hero Card Skeleton */}
      <div className={`rounded-3xl p-6 h-48 border flex flex-col justify-between animate-pulse ${cardBg}`}>
        <div className="flex justify-between items-start">
          <div className={`w-12 h-12 rounded-xl ${pulseColor}`} />
          <div className={`h-6 w-16 rounded-lg ${pulseColor}`} />
        </div>
        <div className="space-y-3">
          <div className={`h-3 w-24 rounded-md ${pulseColor}`} />
          <div className={`h-12 w-48 rounded-xl ${pulseColor}`} />
        </div>
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className={`rounded-2xl p-5 aspect-square border flex flex-col justify-between animate-pulse ${cardBg}`}>
            <div className={`w-10 h-10 rounded-xl ${pulseColor}`} />
            <div className="space-y-2">
              <div className={`h-2 w-16 rounded-md ${pulseColor}`} />
              <div className={`h-8 w-20 rounded-lg ${pulseColor}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Progress & Charts Skeleton */}
      <div className={`rounded-2xl p-6 h-24 border animate-pulse ${cardBg}`}>
        <div className="flex justify-between mb-4">
          <div className={`h-3 w-32 rounded-md ${pulseColor}`} />
          <div className={`h-6 w-12 rounded-lg ${pulseColor}`} />
        </div>
        <div className={`h-2 w-full rounded-full ${pulseColor}`} />
      </div>
    </div>
  );
};

// ==========================================
// MAIN DASHBOARD COMPONENT
// ==========================================
const DashboardOverviewApp = () => {
  const navigate = useNavigate();
  const { setIsModalOpen } = useOutletContext();
  const { theme } = useTheme(); 
  const isLight = theme === 'light';
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_agent_dashboard');
        
        if (error) {
          setError('Failed to fetch dashboard data. Please try again.');
          console.error(error);
          return;
        }

        const transformedData = {
          ...data,
          earningActivity: (data.earningActivity || []).map(val => [val])
        };

        setDashboardData(transformedData);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchData();
  }, []);

  const { stats, areaChartConfig, radialChartConfig, recentActivity, totalLeads } = useMemo(() => {
    if (!dashboardData) {
      return {
        stats: { walletBalance: 0, totalPayouts: 0, activeLeads: 0, successRate: 0 },
        areaChartConfig: { series: [{ data: [] }], options: {} },
        radialChartConfig: { series: [0], options: {} },
        recentActivity: [],
        totalLeads: 0,
      };
    }

    const { walletBalance, totalPayouts, activeLeads, earningActivity, recentActivity: activities } = dashboardData;
    
    const completedCount = activities.filter(a => a[1] === 'Completed').length;
    const totalCount = activities.length;
    const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const stats = { walletBalance, totalPayouts, activeLeads, successRate };

    // BENTO CHART CONFIG (Using Sage Green #81B398)
    const areaChartConfig = {
      series: [{
        name: 'Credits Earned',
        data: earningActivity.map(item => item[0]).slice(-8)
      }],
      options: {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: true } },
        colors: ['#81B398'],
        stroke: { curve: 'smooth', width: 3 },
        fill: { 
          type: 'gradient', 
          gradient: { 
            shadeIntensity: 1, 
            opacityFrom: isLight ? 0.3 : 0.4, 
            opacityTo: 0, 
            stops: [0, 100] 
          } 
        },
        tooltip: { theme: isLight ? 'light' : 'dark', x: { show: false } },
        grid: { show: false }
      }
    };
    
    const radialChartConfig = {
      series: [successRate],
      options: {
        chart: { height: 250, type: 'radialBar' },
        plotOptions: {
          radialBar: {
            hollow: { size: '65%' },
            dataLabels: {
              name: { show: false },
              value: { 
                fontSize: '24px', 
                fontWeight: 800,
                fontFamily: 'Plus Jakarta Sans', 
                color: isLight ? '#1A202C' : '#F4F5F7', 
                offsetY: 8, 
                formatter: (val) => `${val}%` 
              }
            },
            track: { background: isLight ? '#F4F5F7' : 'rgba(255,255,255,0.05)' }
          }
        },
        colors: ['#81B398'],
        stroke: { lineCap: 'round' }
      }
    };

    return { stats, areaChartConfig, radialChartConfig, recentActivity: activities, totalLeads: totalCount };
  }, [dashboardData, isLight]);

  // --- LOADING STATE ---
  if (loading) return <DashboardSkeleton theme={theme} />;

  // --- ERROR STATE (Coral Red #F0524F) ---
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-[60vh]">
        <div className={`w-full text-center p-8 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20">
            <Zap size={32} />
          </div>
          <p className={`text-sm font-bold tracking-tight mb-6 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 bg-[#F0524F] text-white hover:bg-[#D44846]"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      
      {/* 
        PROFESSIONAL SEPARATOR
        This 1px border visually disconnects the scrollable dashboard from the fixed header. 
      */}
      <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
        <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
          Dashboard
        </h1>
      </div>

      {/* HERO BENTO CARD (Wallet) */}
      <div className={`rounded-3xl p-7 relative overflow-hidden border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
            <Wallet size={20} className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
            WALLET
          </span>
        </div>
        
        <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Available Balance</p>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-5xl font-extrabold tracking-tighter ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
            {stats.walletBalance.toLocaleString()}
          </h3>
          <span className={`text-sm font-bold tracking-tight ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>CR</span>
        </div>
      </div>

      {/* GRID STATS */}
      <div className="grid grid-cols-2 gap-4">
        <StatCardApp 
          icon={<TrendingUp size={18} />} 
          label="Total Payouts" 
          value={`₹${Math.abs(stats.totalPayouts)}`} 
          theme={theme} 
        />
        <StatCardApp 
          icon={<Clock size={18} />} 
          label="Active Leads" 
          value={stats.activeLeads} 
          unit="LDS"
          theme={theme} 
        />
      </div>

      {/* PROGRESS CARD (Success Score) */}
      <div className={`rounded-2xl p-6 relative overflow-hidden border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-[#81B398]" />
            <p className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Success Score</p>
          </div>
          <h3 className={`text-xl font-bold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{stats.successRate}%</h3>
        </div>
        <div className={`w-full rounded-full h-2 overflow-hidden ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}>
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${stats.successRate}%` }} 
              transition={{ duration: 1.2, ease: "easeOut" }} 
              className="bg-[#81B398] h-full rounded-full" 
            />
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="space-y-4">
        <div className={`rounded-2xl p-6 pb-2 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className={`text-sm font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Earning Trend</h4>
            <span className="text-[#81B398]"><TrendingUp size={16} /></span>
          </div>
          <div className="w-full -ml-2">
            <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height={160} />
          </div>
        </div>

        <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <h4 className={`text-sm font-bold tracking-tight mb-1 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Pipeline Ratio</h4>
          <p className={`text-[11px] font-bold tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Total Submissions: <span className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}>{totalLeads}</span>
          </p>
          <div className="flex justify-center mt-2">
            <Chart options={radialChartConfig.options} series={radialChartConfig.series} type="radialBar" height={220} />
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY BENTO LIST */}
      <div className="pt-2">
        <div className="flex justify-between items-end mb-4 px-1">
          <h4 className={`text-xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Activity</h4>
          <button 
            onClick={() => navigate('/agent/history')} 
            className="text-[11px] font-bold uppercase tracking-wider text-[#81B398] flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>
        
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity, index) => {
             // Bento 10/100/20 Opacity Status Logic
             let statusStyle = 'bg-[#DAC18A]/10 text-[#DAC18A] border-[#DAC18A]/20'; // Pending / Default
             if (activity[1] === 'Completed') statusStyle = 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20';
             if (activity[1] === 'Rejected') statusStyle = 'bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20';

             return (
              <div key={index} className={`rounded-2xl p-4 flex items-center justify-between border transition-all duration-200 active:scale-95 ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}>
                <div className="flex items-center gap-4">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase border ${
                     isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/10 text-[#9CA3AF]'
                   }`}>
                    {activity[0].substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{activity[0]}</span>
                    <span className={`text-[10px] font-medium tracking-wide mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                      {new Date(activity[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${statusStyle}`}>
                  {activity[1]}
                </div>
              </div>
            )
          })}
          
          {recentActivity.length === 0 && (
              <div className={`flex flex-col items-center justify-center py-10 rounded-2xl border ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                 <Zap size={24} className={isLight ? 'text-[#E2E8F0]' : 'text-white/10'} />
                 <p className={`text-[11px] mt-2 font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No activity yet</p>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// BENTO STAT CARD
// ==========================================
const StatCardApp = ({ icon, label, value, unit, theme }) => {
  const isLight = theme === 'light';
  return (
    <div className={`rounded-2xl p-5 border flex flex-col justify-between aspect-square ${
      isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 border ${
        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{label}</p>
        <div className="flex items-baseline gap-1">
          <h3 className={`text-2xl font-extrabold tracking-tighter truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{value}</h3>
          {unit && <span className={`text-[11px] font-bold tracking-tight ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{unit}</span>}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverviewApp;