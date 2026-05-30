import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Wallet, Clock, ArrowRight, Target, TrendingUp, Zap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { setIsModalOpen } = useOutletContext();
  const { theme } = useTheme(); 
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLight = theme === 'light';

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
    
    // FIX 1: Make the status check case-insensitive so "COMPLETED" or "Completed" both work
    const completedCount = activities.filter(a => typeof a[1] === 'string' && a[1].toUpperCase() === 'COMPLETED').length;
    const totalCount = activities.length;
    const successRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const stats = { walletBalance, totalPayouts, activeLeads, successRate };

    const extractedData = earningActivity.map(item => {
      const val = Array.isArray(item) ? item[0] : item;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') return Number(val) || 0;
      if (typeof val === 'object' && val !== null) {
        return val.amount || val.credits || val.value || val.earned || 0;
      }
      return 0;
    }).slice(-8);

    let finalChartData = [...Array(Math.max(0, 8 - extractedData.length)).fill(0), ...extractedData];

    const isCompletelyFlat = finalChartData.every(val => val === 0);
    if (isCompletelyFlat) {
      finalChartData = [5, 25, 12, 45, 30, 55, 35, 65]; 
    }

    // Area Chart Config
    const areaChartConfig = {
      series: [{
        name: isCompletelyFlat ? 'Credits (Demo Data)' : 'Credits Earned',
        data: finalChartData
      }],
      options: {
        chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: false }, parentHeightOffset: 0 },
        colors: ['#DAC18A'], 
        stroke: { curve: 'smooth', width: 4 },
        fill: { 
          type: 'gradient', 
          gradient: { shadeIntensity: 1, opacityFrom: isLight ? 0.3 : 0.4, opacityTo: 0, stops: [0, 100] } 
        },
        dataLabels: { enabled: false },
        xaxis: { 
          categories: ['01', '02', '03', '04', '05', '06', '07', '08'],
          labels: { style: { colors: isLight ? '#9CA3AF' : '#718096', fontSize: '12px', fontFamily: 'Plus Jakarta Sans' } },
          axisBorder: { show: false },
          axisTicks: { show: false },
        },
        yaxis: {
          labels: { style: { colors: isLight ? '#9CA3AF' : '#718096', fontSize: '12px', fontFamily: 'Plus Jakarta Sans' } },
        },
        tooltip: { theme: isLight ? 'light' : 'dark' },
        grid: { 
          show: true, 
          borderColor: isLight ? '#F0F2F5' : '#2D3748', 
          strokeDashArray: 4, 
          position: 'back',
          xaxis: { lines: { show: false } },
          yaxis: { lines: { show: true } }
        }
      }
    };
    
    // Radial Chart Config
    const radialChartConfig = {
      series: [successRate],
      options: {
        chart: { height: 160, type: 'radialBar', sparkline: { enabled: true } },
        plotOptions: {
          radialBar: {
            hollow: { size: '60%' },
            dataLabels: {
              name: { show: false },
              value: { fontSize: '20px', fontWeight: 800, color: isLight ? '#1A202C' : '#F4F5F7', offsetY: 8, formatter: (val) => `${val}%` }
            },
            track: { background: isLight ? '#E2E8F0' : '#131720', strokeWidth: '100%' }
          }
        },
        colors: ['#F0524F'], // Matched to your red theme color for contrast
        stroke: { lineCap: 'round' }
      }
    };

    return { stats, areaChartConfig, radialChartConfig, recentActivity: activities, totalLeads: totalCount };
  }, [dashboardData, theme, isLight]);

  // SKELETON LOADING STATE
  if (loading) {
    const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
    const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

    return (
      <div className="max-w-[1400px] mx-auto font-['Plus_Jakarta_Sans',sans-serif] relative transition-colors duration-300 pb-12 space-y-8 lg:space-y-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 justify-between animate-pulse">
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="pt-2">
              <div className={`h-10 w-48 rounded-md mb-3 ${pulseClass}`} />
              <div className={`h-4 w-32 rounded-md ${pulseClass}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className={`p-5 lg:p-6 rounded-2xl border ${surfaceClass}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-3 w-16 rounded-md ${pulseClass}`} />
                    <div className={`h-6 w-6 rounded-full ${pulseClass}`} />
                  </div>
                  <div className={`h-8 w-24 rounded-md mt-2 ${pulseClass}`} />
                </div>
              ))}
            </div>
          </div>
          <div className={`w-full lg:w-[380px] h-[220px] rounded-3xl border ${surfaceClass}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-pulse">
          <div className={`lg:col-span-2 flex flex-col p-6 lg:p-8 rounded-3xl border ${surfaceClass}`}>
            <div className="flex justify-between items-center mb-6">
              <div className={`h-6 w-24 rounded-md ${pulseClass}`} />
              <div className={`h-8 w-32 rounded-full ${pulseClass}`} />
            </div>
            <div className={`w-full flex-1 min-h-[300px] rounded-xl ${pulseClass}`} />
          </div>
          <div className={`flex flex-col p-6 lg:p-8 rounded-3xl border ${surfaceClass}`}>
            <div className={`h-6 w-32 rounded-md mb-6 ${pulseClass}`} />
            <div className="flex flex-col gap-5 flex-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${pulseClass}`} />
                    <div className="space-y-2">
                      <div className={`h-4 w-20 rounded-md ${pulseClass}`} />
                      <div className={`h-3 w-12 rounded-md ${pulseClass}`} />
                    </div>
                  </div>
                  <div className={`h-4 w-16 rounded-md ${pulseClass}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`w-full h-[140px] rounded-3xl animate-pulse ${isLight ? 'bg-[#E6F5F2]' : 'bg-[#81B398]/10'}`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <div className={`text-center p-8 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
          <AlertCircle size={32} className="text-[#F0524F] mx-auto mb-4" />
          <p className={`text-sm font-semibold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2.5 text-sm font-medium rounded-lg bg-[#81B398] text-white hover:bg-[#6FA085] transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

 return (
    <div className="max-w-[1400px] mx-auto font-['Plus_Jakarta_Sans',sans-serif] relative transition-colors duration-300 pb-12 space-y-8 lg:space-y-10">
      
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 justify-between">
        <div className="flex-1 flex flex-col justify-between gap-6">
          <div className="pt-2">
            <h1 className={`text-[32px] lg:text-[40px] font-extrabold tracking-tight leading-none ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
              Dashboard
            </h1>
            <p className={`text-sm mt-2 font-medium flex items-center gap-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              Data updates real-time <span className="w-1.5 h-1.5 rounded-full bg-[#81B398] animate-pulse"></span>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 lg:p-6 rounded-2xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Balance</p>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLight ? 'bg-[#81B398]/10' : 'bg-[#81B398]/20'}`}>
                  <div className="w-2 h-2 rounded-full bg-[#81B398]" />
                </div>
              </div>
              <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                {stats.walletBalance.toLocaleString()}
              </h3>
            </div>

            <div className={`p-5 lg:p-6 rounded-2xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Payouts</p>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLight ? 'bg-[#F0524F]/10' : 'bg-[#F0524F]/20'}`}>
                  <div className="w-2 h-2 rounded-full bg-[#F0524F]" />
                </div>
              </div>
              <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                {Math.abs(stats.totalPayouts)}
              </h3>
            </div>

            <div className={`p-5 lg:p-6 rounded-2xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
              <div className="flex items-center justify-between mb-3">
                <p className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Leads</p>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isLight ? 'bg-[#DAC18A]/10' : 'bg-[#DAC18A]/20'}`}>
                  <div className="w-2 h-2 rounded-full bg-[#DAC18A]" />
                </div>
              </div>
              <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                {stats.activeLeads}
              </h3>
            </div>
          </div>
        </div>

        {/* FIX 2: Added layout to properly display the Radial Chart inside the card */}
        <div className={`w-full lg:w-[380px] p-8 rounded-3xl border flex flex-col justify-between relative overflow-hidden transition-colors ${
          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#1A202C] border-white/5'
        }`}>
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${isLight ? 'bg-[#81B398]/20' : 'bg-[#81B398]/20'}`}>
                <Target size={20} className="text-[#81B398]" />
              </div>
              <h3 className={`text-xl font-bold tracking-tight mb-1 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Success Score</h3>
              <p className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Based on completed leads</p>
            </div>
            
            {/* The actual Radial Chart rendering */}
            <div className="w-[120px] h-[120px] -mt-6 -mr-4 relative z-10 flex items-center justify-center">
               {dashboardData && (
                 <Chart options={radialChartConfig.options} series={radialChartConfig.series} type="radialBar" height={180} />
               )}
            </div>
          </div>
          
          <div className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 pointer-events-none">
             <div className="absolute inset-0 rounded-full border-[15px] border-[#48477A]" />
             <div className="absolute inset-4 rounded-full border-[15px] border-[#DAC18A]" />
          </div>

          <div className="relative z-10 mt-8 flex items-center gap-4">
            <button className="px-6 py-3 bg-[#F0524F] text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-[#D44846] transition-colors">
              {stats.successRate}% NOW
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className={`lg:col-span-2 flex flex-col p-6 lg:p-8 rounded-3xl border transition-colors ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Activity</h3>
            <div className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 cursor-pointer border transition-colors ${
              isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
            }`}>
              Earning Trends
            </div>
          </div>
          <div className={`w-full flex-1 min-h-[300px] relative`}>
            {dashboardData && (
              <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height={300} width="100%" />
            )}
          </div>
        </div>

       <div className={`flex flex-col p-6 lg:p-8 rounded-3xl border transition-colors ${
  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'
}`}>
  <h3 className={`text-xl font-bold tracking-tight mb-6 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Recent Leads</h3>
  <div className="flex flex-col gap-5 flex-1">
    {recentActivity.slice(0, 4).map((activity, index) => {
       const isCompleted = typeof activity[1] === 'string' && activity[1].toUpperCase() === 'COMPLETED';
       const isRejected = typeof activity[1] === 'string' && activity[1].toUpperCase() === 'REJECTED';
       
       const statusColor = isCompleted ? 'text-[#81B398]' : isRejected ? 'text-[#F0524F]' : 'text-[#DAC18A]';

      return (
        <div key={index} className="flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border transition-colors ${
              isLight ? 'bg-[#F4F5F7] text-[#1A202C] border-[#E2E8F0]' : 'bg-[#131720] text-[#F4F5F7] border-white/5'
            }`}>
              {activity[0] ? activity[0].substring(0, 1) : '-'}
            </div>
            <div>
              <p className={`text-sm font-bold capitalize ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{activity[0]}</p>
              <p className={`text-[11px] font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                 {new Date(activity[2]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-1.5 rounded-lg border flex items-center justify-center min-w-[96px] transition-colors ${
            isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'
          }`}>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${statusColor}`}>
              {activity[1]}
            </span>
          </div>
        </div>
      );
    })}
    {recentActivity.length === 0 && (
      <div className="flex-1 flex flex-col items-center justify-center opacity-50 py-4">
         <Zap size={24} className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'} />
         <p className={`text-xs mt-2 font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No leads yet</p>
      </div>
    )}
    <div className="mt-auto pt-4">
      <button onClick={() => navigate('/agent/history')} className={`text-xs font-bold transition-colors ${isLight ? 'text-[#718096] hover:text-[#1A202C]' : 'text-[#9CA3AF] hover:text-[#F4F5F7]'}`}>
        View More 
      </button>
    </div>
  </div>
</div>
      </div>

      <div className={`w-full rounded-3xl p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors ${
        isLight ? 'bg-[#E6F5F2]' : 'bg-[#81B398]/10'
      }`}>
        <div className="flex-1 text-center md:text-left">
          <h3 className={`text-[22px] font-bold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
            Pipeline Success
          </h3>
          <p className={`text-sm font-medium leading-relaxed max-w-full md:max-w-[200px] ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            Your engagement statistics for all time.
          </p>
        </div>

        <div className="flex flex-wrap md:flex-nowrap justify-center gap-4">
          <div className={`w-28 py-6 px-4 rounded-2xl border flex flex-col items-center text-center transition-colors ${
            isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#222938] border-white/5'
          }`}>
             <div className="w-8 h-8 rounded-full bg-[#81B398] text-white flex items-center justify-center mb-3">
               <TrendingUp size={14} />
             </div>
             <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Total</p>
             <p className={`text-lg font-bold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{totalLeads}</p>
          </div>

          <div className={`w-28 py-6 px-4 rounded-2xl border flex flex-col items-center text-center transition-colors ${
            isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#222938] border-white/5'
          }`}>
             <div className="w-8 h-8 rounded-full bg-[#48477A] text-white flex items-center justify-center mb-3">
               <CheckCircle2 size={14} />
             </div>
             <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Done</p>
             <p className={`text-lg font-bold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{stats.activeLeads}</p>
          </div>
        </div>

        <div className={`w-full md:w-32 py-6 px-4 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:opacity-90 transition-opacity ${
          isLight ? 'bg-[#81B398] text-white' : 'bg-[#81B398] text-[#131720]'
        }`} onClick={() => navigate('/agent/history')}>
          <h4 className="text-base font-bold text-center leading-tight mb-3">Full<br/>Stats</h4>
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;