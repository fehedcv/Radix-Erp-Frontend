import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Wallet, Clock, ArrowRight, BarChart3, TrendingUp, Zap, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi'; // Import the API utility
import Loader from '../../components/Loader'
const DashboardOverview = () => {
  const navigate = useNavigate();
  const { setIsModalOpen } = useOutletContext();
  
  // --- 1. STATE MANAGEMENT ---
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. DATA FETCHING ---
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

  // --- 3. DYNAMIC DATA & CHARTS (Derived from state) ---
  const { stats, areaChartConfig, radialChartConfig, recentActivity, totalLeads } = useMemo(() => {
    if (!dashboardData) {
      // Default structure to prevent crashes before data loads
      return {
        stats: { walletBalance: 0, totalPayouts: 0, activeLeads: 0, successRate: 0 },
        areaChartConfig: { series: [{ data: [] }], options: {} },
        radialChartConfig: { series: [0], options: {} },
        recentActivity: [],
        totalLeads: 0,
      };
    }

    const { walletBalance, totalPayouts, activeLeads, earningActivity, recentActivity: activities } = dashboardData;
    
    // Calculate success rate
    const completedCount = activities.filter(a => a[1] === 'Completed').length;
    const totalCount = activities.length;
    const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const stats = { walletBalance, totalPayouts, activeLeads, successRate };

    // Configure Area Chart
    const areaChartConfig = {
      series: [{
        name: 'Credits Earned',
        data: earningActivity.map(item => item[0]).slice(-8)
      }],
      options: {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: true } },
        colors: ['#007ACC'],
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
        tooltip: { theme: 'light', x: { show: false } }
      }
    };
    
    // Configure Radial Chart
    const radialChartConfig = {
      series: [successRate],
      options: {
        chart: { height: 250, type: 'radialBar' },
        plotOptions: {
          radialBar: {
            hollow: { size: '60%' },
            dataLabels: {
              name: { show: false },
              value: { fontSize: '22px', fontWeight: 900, color: '#1e293b', offsetY: 8, formatter: (val) => `${val}%` }
            },
            track: { background: '#f1f5f9' }
          }
        },
        colors: ['#007ACC'],
        stroke: { lineCap: 'round' }
      }
    };

    return { stats, areaChartConfig, radialChartConfig, recentActivity: activities, totalLeads: totalCount };
  }, [dashboardData]);

  // --- UI Feedback for Loading and Error States ---
  // --- UI Feedback for Loading and Error States ---
  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        {/* fullScreen={false} keeps it perfectly inside your dashboard container instead of taking over the whole screen */}
        <Loader fullScreen={false} text="Loading Overview..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="text-center p-8 bg-rose-50 border border-rose-100 rounded-2xl">
          <Zap size={32} className="text-rose-400 mx-auto mb-4" />
          <p className="text-sm font-bold text-rose-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-white text-xs font-bold text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

 return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Home Overview</h1>
          <p className="text-sm text-slate-500 mt-1">Tracking your business performance in real-time.</p>
        </div>
       
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Wallet size={20} />} label="Wallet Balance" value={stats.walletBalance.toLocaleString()} subtext="Total Credits Earned" unit="CR" color="text-blue-600" highlight />
        <StatCard icon={<TrendingUp size={20} />} label="Total Payouts" value={`₹${Math.abs(stats.totalPayouts)}`} subtext="Processed Successfully" color="text-slate-700" />
        <StatCard icon={<Clock size={20} />} label="Active Leads" value={stats.activeLeads} subtext="Leads Under Review" unit="Leads" color="text-slate-700" />
        
        {/* Highlight Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-xl shadow-md text-white overflow-hidden relative group border border-blue-500/20">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-xs text-blue-100 font-medium uppercase tracking-wide">Success Score</p>
              <Target size={18} className="text-blue-200" />
            </div>
            <h3 className="text-4xl font-bold mt-3">{stats.successRate}%</h3>
            <div className="mt-5 w-full bg-black/20 rounded-full h-1.5 overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${stats.successRate}%` }} transition={{ duration: 1.5 }} className="bg-white h-full rounded-full" />
            </div>
          </div>
          <BarChart3 size={90} className="absolute -bottom-4 -right-4 text-white/10 group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500" />
        </div>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" /> Earning Activity
            </h4>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Recent Trends</span>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height={250} />
          </div>
        </div>
        
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h4 className="text-base font-semibold text-slate-800 mb-2">Pipeline Success</h4>
          <p className="text-xs text-slate-500 mb-4">Total Engagements: <span className="font-semibold text-slate-700">{totalLeads}</span></p>
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <Chart options={radialChartConfig.options} series={radialChartConfig.series} type="radialBar" height={280} />
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 gap-4">
          <h4 className="font-semibold text-slate-800 text-lg">Recent Activity</h4>
          <button onClick={() => navigate('/agent/history')} className="group flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View All History <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recentActivity.slice(0, 5).map((activity, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-white border border-slate-200 shadow-sm rounded-lg flex items-center justify-center text-slate-500 font-semibold text-xs uppercase">
                  {activity[0].substring(0, 4)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 capitalize">{activity[0]}</p>
                  <span className="text-xs text-slate-500">
                    {new Date(activity[2]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-md text-xs font-medium border ${
                  activity[1] === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                  activity[1] === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {activity[1]}
              </div>
            </div>
          ))}
          
          {recentActivity.length === 0 && (
            <div className="text-center py-16 bg-slate-50/50">
                <Zap size={32} className="text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 font-medium text-sm mb-6">No Activity Recorded Yet</p>
                <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium hover:bg-blue-600 transition-colors rounded-lg shadow-sm">
                  Create First Submission
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


const StatCard = ({ icon, label, value, subtext, unit, color, highlight }) => (
  <div className={`bg-white p-6 border ${highlight ? 'border-blue-100 shadow-lg shadow-blue-500/5' : 'border-slate-200'} rounded-2xl shadow-sm group hover:border-blue-300 transition-all`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:-translate-y-1 ${highlight ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
      {icon}
    </div>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-2">{label}</p>
    <div className="flex items-baseline gap-1.5">
      <h3 className={`text-3xl font-black tracking-tighter ${color}`}>{value}</h3>
      {unit && <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{unit}</span>}
    </div>
    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wide opacity-60">{subtext}</p>
  </div>
);

export default DashboardOverview;