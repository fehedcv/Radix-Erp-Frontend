import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Wallet, Clock, ArrowRight, BarChart3, TrendingUp, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi'; 
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// SKELETON COMPONENT (MATCHED LAYOUT)
// ==========================================
const DashboardSkeleton = ({ theme }) => {
  const bgColor = theme === 'light' ? 'bg-gray-200' : 'bg-white/5';
  const pulseClass = "animate-pulse";

  return (
    <div className="space-y-6 px-2">
      {/* Title Skeleton */}
      <div className={`h-8 w-40 rounded-lg ${bgColor} ${pulseClass}`} />

      {/* Hero Card Skeleton */}
      <div className={`rounded-[2rem] p-8 h-56 flex flex-col justify-between ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
        <div className="flex justify-between">
          <div className={`w-12 h-12 rounded-full ${bgColor} ${pulseClass}`} />
          <div className={`h-6 w-16 rounded-full ${bgColor} ${pulseClass}`} />
        </div>
        <div className="space-y-2">
          <div className={`h-3 w-24 rounded-lg ${bgColor} ${pulseClass}`} />
          <div className={`h-12 w-48 rounded-lg ${bgColor} ${pulseClass}`} />
        </div>
      </div>

      {/* Grid Stats Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className={`rounded-[1.5rem] p-5 aspect-square flex flex-col justify-between ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
            <div className={`w-10 h-10 rounded-full ${bgColor} ${pulseClass}`} />
            <div className="space-y-2">
              <div className={`h-2 w-16 rounded-lg ${bgColor} ${pulseClass}`} />
              <div className={`h-6 w-20 rounded-lg ${bgColor} ${pulseClass}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Progress Card Skeleton */}
      <div className={`rounded-[2rem] p-6 h-24 ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
        <div className="flex justify-between mb-4">
          <div className={`h-3 w-32 rounded-lg ${bgColor} ${pulseClass}`} />
          <div className={`h-6 w-12 rounded-lg ${bgColor} ${pulseClass}`} />
        </div>
        <div className={`h-2 w-full rounded-full ${bgColor} ${pulseClass}`} />
      </div>

      {/* Chart Skeleton */}
      <div className={`rounded-[2rem] p-6 h-56 ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
        <div className={`h-4 w-32 rounded-lg ${bgColor} ${pulseClass} mb-8`} />
        <div className={`h-32 w-full rounded-lg ${bgColor} ${pulseClass}`} />
      </div>
    </div>
  );
};

const DashboardOverviewApp = () => {
  // ==========================================
  // EXACT SAME LOGIC & STATE
  // ==========================================
  const navigate = useNavigate();
  const { setIsModalOpen } = useOutletContext();
  const { theme } = useTheme(); 
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await frappeApi.get('/method/business_chain.api.agent.get_agent_dashboard_data');
        setDashboardData(response.data.message);
        setError(null);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
        console.error(err);
      } finally {
        // Small delay to ensure smooth transition from skeleton
        setTimeout(() => setLoading(false), 800);
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

    const areaChartConfig = {
      series: [{
        name: 'Credits Earned',
        data: earningActivity.map(item => item[0]).slice(-8)
      }],
      options: {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: true } },
        colors: ['#38BDF8'],
        stroke: { curve: 'smooth', width: 4 },
        fill: { 
          type: 'gradient', 
          gradient: { 
            shadeIntensity: 1, 
            opacityFrom: theme === 'light' ? 0.3 : 0.4, 
            opacityTo: 0, 
            stops: [0, 100] 
          } 
        },
        tooltip: { theme: theme === 'light' ? 'light' : 'dark', x: { show: false } },
        grid: { show: false }
      }
    };
    
    const radialChartConfig = {
      series: [successRate],
      options: {
        chart: { height: 250, type: 'radialBar' },
        plotOptions: {
          radialBar: {
            hollow: { size: '60%' },
            dataLabels: {
              name: { show: false },
              value: { 
                fontSize: '24px', 
                fontWeight: 900, 
                color: theme === 'light' ? '#000000' : '#FFFFFF', 
                offsetY: 8, 
                formatter: (val) => `${val}%` 
              }
            },
            track: { background: theme === 'light' ? '#F4F5F9' : 'rgba(255,255,255,0.05)' }
          }
        },
        colors: ['#4ADE80'],
        stroke: { lineCap: 'round' }
      }
    };

    return { stats, areaChartConfig, radialChartConfig, recentActivity: activities, totalLeads: totalCount };
  }, [dashboardData, theme]);

  // --- LOADING STATE TRIGGER ---
  if (loading) return <DashboardSkeleton theme={theme} />;

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-[60vh] px-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <div className={`w-full text-center p-8 rounded-[2rem] shadow-xl ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <Zap size={32} className="text-red-500" />
          </div>
          <p className={`text-sm font-black uppercase tracking-tight mb-6 ${theme === 'light' ? 'text-black' : 'text-white'}`}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`w-full py-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
              theme === 'light' ? 'bg-black text-white active:bg-gray-800' : 'bg-white text-black active:bg-gray-200'
            }`}
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 font-['Plus_Jakarta_Sans',sans-serif] ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      
      {/* Title */}
      <h1 className="text-2xl font-extrabold tracking-tight uppercase px-2 ">Overview</h1>

      {/* Hero Bento Card */}
      <div className="">
        <div className={`rounded-[2rem] p-8 relative overflow-hidden shadow-sm ${
          theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${
              theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'
            }`}>
              <Wallet size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
              theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
            }`}>WALLET</span>
          </div>
          
          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Wallet Balance</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#4ADE80]">
              {stats.walletBalance.toLocaleString()}
            </h3>
            <span className={`text-xs font-black uppercase tracking-tighter ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`}>CR</span>
          </div>
          <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Total Credits Earned</p>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4 ">
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

      {/* Success Score Progress Card */}
      <div className="">
        <div className={`rounded-[2rem] p-6 relative overflow-hidden shadow-sm ${
          theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
        }`}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-[#38BDF8]" />
              <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Success Score</p>
            </div>
            <h3 className="text-2xl font-black">{stats.successRate}%</h3>
          </div>
          <div className={`w-full rounded-full h-2 overflow-hidden ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${stats.successRate}%` }} 
                transition={{ duration: 1.5, ease: "easeOut" }} 
                className="bg-gradient-to-r from-[#38BDF8] to-[#4ADE80] h-full rounded-full" 
              />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="space-y-4">
        <div className={`rounded-[2rem] p-6 pb-2 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black uppercase tracking-tight">Earning Trend</h4>
            <span className="text-[#38BDF8]"><TrendingUp size={16} /></span>
          </div>
          <div className="w-full -ml-2">
            <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height={180} />
          </div>
        </div>

        <div className={`rounded-[2rem] p-6 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <h4 className="text-xs font-black uppercase tracking-tight mb-1">Pipeline Ratio</h4>
          <p className={`text-[9px] uppercase font-bold tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
            Total Submissions: <span className={theme === 'light' ? 'text-black' : 'text-white'}>{totalLeads}</span>
          </p>
          <div className="flex justify-center mt-2">
            <Chart options={radialChartConfig.options} series={radialChartConfig.series} type="radialBar" height={220} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="pt-4  pb-16 ">
        <div className="flex justify-between items-end mb-4 px-1">
          <h4 className="font-extrabold text-lg uppercase tracking-tight">Activity</h4>
          <button 
            onClick={() => navigate('/agent/history')} 
            className="text-[9px] font-black uppercase tracking-widest text-[#38BDF8] flex items-center gap-1"
          >
            View All <ArrowRight size={12} />
          </button>
        </div>
        
        <div className="space-y-3">
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className={`rounded-2xl p-4 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform ${
              theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
            }`}>
              <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xs uppercase ${
                   theme === 'light' ? 'bg-[#F4F5F9] text-gray-500' : 'bg-white/5 text-gray-400'
                 }`}>
                  {activity[0].substring(0, 2)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-tight">{activity[0]}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(activity[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
              
              <div className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                  activity[1] === 'Completed' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 
                  activity[1] === 'Rejected' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#F59E0B]/10 text-[#F59E0B]'
                }`}>
                  {activity[1]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const StatCardApp = ({ icon, label, value, unit, theme }) => (
  <div className={`rounded-[1.5rem] p-5 relative overflow-hidden shadow-sm flex flex-col justify-between aspect-square ${
    theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
  }`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 shadow-inner ${
      theme === 'light' ? 'bg-[#F4F5F9] text-gray-500' : 'bg-white/5 text-gray-400'
    }`}>
      {icon}
    </div>
    <div>
      <p className={`text-[8px] font-bold uppercase tracking-widest mb-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
      <div className="flex items-baseline gap-1">
        <h3 className="text-2xl font-black tracking-tighter truncate">{value}</h3>
        {unit && <span className={`text-[9px] font-black uppercase tracking-tighter ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`}>{unit}</span>}
      </div>
    </div>
  </div>
);

export default DashboardOverviewApp;