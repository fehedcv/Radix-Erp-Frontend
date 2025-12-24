import React, { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Wallet, Clock, ArrowRight, BarChart3, TrendingUp, Zap, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';

const DashboardOverview = () => {
  const navigate = useNavigate();
  const { myLeads = [], setIsModalOpen } = useOutletContext(); 

  // --- 1. DYNAMIC DATA CALCULATION (PRESERVED) ---
  const stats = useMemo(() => {
    const totalCredits = myLeads.reduce((sum, item) => sum + (item.credits || 0), 0);
    const verifiedLeads = myLeads.filter(l => ['Verified', 'Completed', 'Successful'].includes(l.status)).length;
    const pendingLeads = myLeads.filter(l => l.status === 'Pending').length;
    const successRate = myLeads.length > 0 ? Math.round((verifiedLeads / myLeads.length) * 100) : 0;

    return { totalCredits, equivalentAmount: totalCredits, payouts: 0, processingCount: pendingLeads, successRate };
  }, [myLeads]);

  // --- 2. APEX CHARTS CONFIGURATION ---
  const areaChartConfig = {
    series: [{
      name: 'Credits Earned',
      data: myLeads.slice(-8).reverse().map(l => l.credits || 0)
    }],
    options: {
      chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false }, sparkline: { enabled: true } },
      colors: ['#007ACC'],
      stroke: { curve: 'smooth', width: 3 },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0, stops: [0, 100] } },
      tooltip: { theme: 'light', x: { show: false } }
    }
  };

  const radialChartConfig = {
    series: [stats.successRate],
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

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]  ">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Home Overview</h1>
          <p className="text-sm text-slate-500 font-medium italic">Tracking your business performance in real-time.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
           <Activity size={14} className="text-blue-600" />
           <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Connection: Secure</span>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Wallet size={22} />} label="Wallet Balance" value={stats.totalCredits.toLocaleString()} subtext="Total Credits Earned" unit="CR" color="text-[#007ACC]" highlight />
        <StatCard icon={<TrendingUp size={22} />} label="Total Payouts" value={`₹${stats.payouts}`} subtext="Processed Successfully" color="text-slate-600" />
        <StatCard icon={<Clock size={22} />} label="Active Leads" value={stats.processingCount} subtext="Leads Under Review" unit="Leads" color="text-slate-600" />
        
        <div className="bg-[#007ACC] p-6 rounded-2xl shadow-xl shadow-blue-100 text-white overflow-hidden relative group">
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <p className="text-[10px] text-blue-100 font-bold uppercase tracking-[0.15em]">Success Score</p>
              <Target size={18} className="text-blue-200" />
            </div>
            <h3 className="text-4xl font-black tracking-tighter mt-2">{stats.successRate}%</h3>
            <div className="mt-4 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
               <motion.div initial={{ width: 0 }} animate={{ width: `${stats.successRate}%` }} transition={{ duration: 1.5 }} className="bg-white h-full" />
            </div>
          </div>
          <BarChart3 size={80} className="absolute -bottom-2 -right-2 text-white/10 group-hover:scale-110 transition-transform duration-700" />
        </div>
      </div>

     {/* 3. PERFORMANCE ANALYTICS */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  {/* Earnings Trend */}
  <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm flex flex-col">
    <div className="flex items-center justify-between mb-8">
       <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
         <TrendingUp size={14} className="text-blue-500" /> Earning Activity
       </h4>
       <span className="text-[10px] font-bold text-slate-300">RECENT TRENDS</span>
    </div>
    
    {/* FIXED: Added a specific height for mobile via min-h */}
    <div className="flex-1 min-h-[250px] w-full">
      <Chart 
        options={areaChartConfig.options} 
        series={areaChartConfig.series} 
        type="area" 
        height={250} // Changed from 100% to fixed px
      />
    </div>
  </div>

  {/* Lead Success Radial */}
  <div className="bg-white border border-slate-200 rounded-[1.5rem] p-6 shadow-sm text-center">
    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-left">Pipeline Success</h4>
    
    {/* FIXED: Ensured container has enough space */}
    <div className="min-h-[250px] flex items-center justify-center">
      <Chart 
        options={radialChartConfig.options} 
        series={radialChartConfig.series} 
        type="radialBar" 
        height={280} 
      />
    </div>
    <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Total Deals: {myLeads.length}</p>
  </div>
</div>

      {/* 4. ACTIVITY LIST */}
      <div className="bg-white border border-slate-200 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 lg:p-8 border-b border-slate-100 gap-4">
          <h4 className="font-extrabold text-slate-900 text-lg tracking-tight uppercase flex items-center gap-3">
             <div className="w-1.5 h-6 bg-[#007ACC] rounded-full" /> Recent Activity
          </h4>
          <button onClick={() => navigate('/agent/history')} className="group flex items-center gap-2 text-xs font-bold text-[#007ACC] hover:text-[#005fb8] transition-all uppercase tracking-widest bg-blue-50 px-5 py-2.5 rounded-full">
            View All History <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
          </button>
        </div>

        <div className="divide-y divide-slate-50">
          {myLeads.slice(0, 5).map((lead) => (
            <div key={lead.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-slate-50/50 transition-all group gap-4">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[10px] group-hover:text-[#007ACC] group-hover:border-blue-200 transition-colors uppercase">
                  {lead.id}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-0.5">{lead.clientName}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lead.businessUnit}</span>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{lead.service}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                {lead.credits > 0 && (
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-300 uppercase mb-0.5">Earnings</p>
                    <p className="text-sm font-black text-emerald-600">+{lead.credits} CR</p>
                  </div>
                )}
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                  ['Verified', 'Completed', 'Successful'].includes(lead.status) ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  lead.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {lead.status}
                </div>
              </div>
            </div>
          ))}
          {myLeads.length === 0 && (
            <div className="text-center py-24 bg-slate-50/30">
                <Zap size={32} className="text-slate-300 mx-auto mb-6" />
                <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.2em] mb-6">No Activity Recorded</p>
                <button onClick={() => setIsModalOpen(true)} className="px-8 py-3.5 bg-[#0F172A] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#007ACC] transition-all rounded-full">
                  Create First Submission
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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