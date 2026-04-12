import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Wallet, Clock, ArrowRight, BarChart3, TrendingUp, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi'; 
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; // Import Global Theme

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { setIsModalOpen } = useOutletContext();
  const { theme } = useTheme(); // Access Theme
  
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
        setLoading(false);
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
        stroke: { curve: 'smooth', width: 3 },
        fill: { 
          type: 'gradient', 
          gradient: { 
            shadeIntensity: 1, 
            opacityFrom: theme === 'light' ? 0.2 : 0.4, 
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
                fontSize: '22px', 
                fontWeight: 900, 
                color: theme === 'light' ? '#1E293B' : '#E2E8F0', 
                offsetY: 8, 
                formatter: (val) => `${val}%` 
              }
            },
            track: { background: theme === 'light' ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }
          }
        },
        colors: ['#4ADE80'],
        stroke: { lineCap: 'round' }
      }
    };

    return { stats, areaChartConfig, radialChartConfig, recentActivity: activities, totalLeads: totalCount };
  }, [dashboardData, theme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader fullScreen={false} text="Loading Overview..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <div className={`text-center p-8 border rounded-xl ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.03] backdrop-blur-2xl border-white/10'}`}>
          <Zap size={32} className="text-[#EF4444] mx-auto mb-4" />
          <p className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'}`}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`mt-6 px-6 py-2.5 text-xs font-bold border rounded-xl transition-all ${
              theme === 'light' ? 'bg-slate-200 text-slate-900 border-slate-300 hover:bg-slate-300' : 'bg-white/5 text-[#E2E8F0] border-white/10 hover:bg-white/10'
            }`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

 return (
    <div className={`space-y-10 font-['Plus_Jakarta_Sans',sans-serif] relative transition-colors duration-500 ${theme === 'light' ? 'text-[#1E293B]' : 'text-[#E2E8F0]'}`}>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4  py-4 px-4 rounded-xl bg-white/[0.03] backdrop-blur-3xl border-white/10 border ">
        <div>
          <h1 className="text-3xl font-bold tracking-tight ">OVERVIEW</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={<Wallet size={20} className='text-white' />} 
          label="Wallet Balance" 
          value={stats.walletBalance.toLocaleString()} 
          subtext="Total Credits Earned" 
          unit="CR" 
          color="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#4ADE80]" 
          highlight 
          theme={theme}
        />
        <StatCard icon={<TrendingUp size={20} />} label="Total Payouts" value={`₹${Math.abs(stats.totalPayouts)}`} subtext="Processed Successfully" color={theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'} theme={theme} />
        <StatCard icon={<Clock size={20} />} label="Active Leads" value={stats.activeLeads} subtext="Leads Under Review" unit="Leads" color={theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'} theme={theme} />
        
        {/* Highlight Card - Success Score */}
        <div className={`p-8 lg:p-10 rounded-xl overflow-hidden relative border transition-all ${
          theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.03] backdrop-blur-3xl border-white/10'
        }`}>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>Success Score</p>
              <Target size={18} className="text-[#38BDF8]" />
            </div>
            <h3 className={`text-4xl font-black mt-4 ${theme === 'light' ? 'text-slate-900' : 'drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]'}`}>{stats.successRate}%</h3>
            <div className={`mt-8 w-full rounded-full h-1.5 overflow-hidden ${theme === 'light' ? 'bg-slate-300' : 'bg-white/10'}`}>
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: `${stats.successRate}%` }} 
                 transition={{ duration: 1.5 }} 
                 className="bg-gradient-to-r from-[#38BDF8] via-[#22D3EE] to-[#4ADE80] h-full rounded-full" 
               />
            </div>
          </div>
          <BarChart3 size={110} className={`absolute -bottom-6 -right-6 pointer-events-none ${theme === 'light' ? 'text-slate-900/5' : 'text-white/5'}`} />
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={`lg:col-span-2 border-xl p-8 lg:p-10 flex flex-col transition-all ${
          theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.03] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
              <TrendingUp size={18} className="text-[#38BDF8]" /> Earning Activity
            </h4>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl border ${
              theme === 'light' ? 'bg-slate-200 text-slate-500 border-slate-300' : 'bg-white/5 text-[#94A3B8] border-white/5'
            }`}>Recent Trends</span>
          </div>
          <div className="flex-1 min-h-[250px] w-full relative z-10">
            <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height={250} />
          </div>
        </div>
        
        <div className={`border rounded-xl p-8 lg:p-10 flex flex-col transition-all ${
          theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.03] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
        }`}>
          <h4 className="text-base font-bold mb-2 uppercase tracking-tight">Pipeline Success</h4>
          <p className={`text-[10px] mb-6 uppercase font-bold tracking-widest ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>Total Engagements: <span className="text-[#38BDF8]">{totalLeads}</span></p>
          <div className="flex-1 flex items-center justify-center min-h-[250px] relative z-10">
            <Chart options={radialChartConfig.options} series={radialChartConfig.series} type="radialBar" height={280} />
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className={`border rounded-xl shadow-sm overflow-hidden transition-all ${
        theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.03] backdrop-blur-3xl border-white/10'
      }`}>
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 border-b gap-4 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
          <h4 className="font-bold text-xl uppercase tracking-tight">Recent Activity</h4>
          <button onClick={() => navigate('/agent/history')} className={`group flex items-center gap-3 px-6 py-3 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
            theme === 'light' ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300' : 'bg-white/5 text-[#E2E8F0] border-white/10 hover:bg-white/10'
          }`}>
            View All History <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[#38BDF8]"/>
          </button>
        </div>
        
        <div className={`divide-y ${theme === 'light' ? 'divide-slate-200' : 'divide-white/5'}`}>
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 sm:px-10 transition-colors gap-4 ${
              theme === 'light' ? 'hover:bg-slate-200/50' : 'hover:bg-white/[0.02]'
            }`}>
              <div className="flex items-center gap-6">
                 <div className={`w-14 h-14 border rounded-xl flex items-center justify-center font-black text-xs uppercase ${
                   theme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-600' : 'bg-white/5 border-white/5 text-[#E2E8F0]'
                 }`}>
                  {activity[0].substring(0, 4)}
                </div>
                <div>
                  <p className="text-sm font-bold capitalize tracking-tight">{activity[0]}</p>
                  <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 block ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    {new Date(activity[2]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                  activity[1] === 'Completed' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20' : 
                  activity[1] === 'Rejected' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' : 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                }`}>
                  {activity[1]}
              </div>
            </div>
          ))}
          
          {recentActivity.length === 0 && (
            <div className="text-center py-20">
                <Zap size={48} className="text-[#64748B] mx-auto mb-6 opacity-20" />
                <p className="text-[#94A3B8] font-bold text-sm mb-8 uppercase tracking-widest">No Activity Recorded Yet</p>
                <button onClick={() => setIsModalOpen(true)} className={`px-8 py-4 border text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors ${
                  theme === 'light' ? 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300' : 'bg-white/5 text-[#E2E8F0] border-white/10 hover:bg-white/10'
                }`}>
                  Create First Submission
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, subtext, unit, color, highlight, theme }) => (
  <div className={`border rounded-xl p-8 lg:p-10 relative overflow-hidden transition-all border transition-all ${
    highlight && theme === 'light' ? 'bg-[#F1F5F9] border-[#38BDF8]/40 shadow-sm' : 
    highlight && theme === 'dark' ? 'bg-white/[0.03] border-[#38BDF8]/40 shadow-[0_8px_32px_rgba(56,189,248,0.1)]' :
    theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 hover:bg-slate-200/50' : 
    'bg-white/[0.03] border-white/10 hover:bg-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
  }`}>
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-8 ${
      highlight ? 'bg-gradient-to-br from-[#38BDF8] via-[#22D3EE] to-[#4ADE80] text-[#020617] shadow-sm' : 
      theme === 'light' ? 'bg-slate-200 text-slate-500 border border-slate-300' :
      'bg-white/5 text-[#94A3B8] border border-white/5'
    }`}>
      {icon}
    </div>
    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>{label}</p>
    <div className="flex items-baseline gap-2">
      <h3 className={`text-4xl font-black tracking-tighter ${color}`}>{value}</h3>
      {unit && <span className={`text-[11px] font-black uppercase tracking-tighter ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>{unit}</span>}
    </div>
    <p className={`text-[10px] font-bold mt-4 uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>{subtext}</p>
  </div>
);

export default DashboardOverview;