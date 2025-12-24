import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Building2, Zap, TrendingUp, 
  ShieldCheck, ArrowRight, BarChart3, 
  Plus, UserPlus, Clock, Database, Sparkles, Activity, ChevronRight
} from 'lucide-react';
import Chart from 'react-apexcharts';

// Data Sources
import { initialLeads } from '../../data/leadHistoryData';
import { businessUnits } from '../../data/businessData';

const AdminOverview = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalLeads: 0,
    totalUnits: 0,
    totalCredits: 0,
    statusCounts: { Pending: 0, Verified: 0, Completed: 0 }
  });

  const latestAgents = [
    { id: 'A-901', name: 'Zaid Al-Farsi', joined: '2h ago', status: 'Active' },
    { id: 'A-902', name: 'Sarah Mehmood', joined: '5h ago', status: 'Active' },
    { id: 'A-903', name: 'Omar Al-Hassan', joined: '1d ago', status: 'Pending' },
    { id: 'A-904', name: 'Layla Rashid', joined: '2d ago', status: 'Active' },
  ];

  useEffect(() => {
    const leadCount = initialLeads.length;
    const unitCount = businessUnits.length;
    const totalCredits = initialLeads.reduce((sum, l) => sum + (l.credits || 0), 0);
    
    const counts = initialLeads.reduce((acc, curr) => {
      const status = (curr.status === 'Verified' || curr.status === 'Verfied') ? 'Verified' : curr.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { Pending: 0, Verified: 0, Completed: 0 });

    setStats({
      totalLeads: leadCount,
      totalUnits: unitCount,
      totalCredits: totalCredits,
      statusCounts: counts
    });
  }, []);

  // --- REAL DATA CHART PROCESSING ---
  const trendChartData = useMemo(() => {
    const dailyCounts = initialLeads.reduce((acc, lead) => {
      acc[lead.date] = (acc[lead.date] || 0) + 1;
      return acc;
    }, {});
    const sortedDates = Object.keys(dailyCounts).sort().slice(-7);
    return {
      labels: sortedDates.map(d => d.split('-').slice(1).join('/')),
      data: sortedDates.map(d => dailyCounts[d])
    };
  }, []);

  const partnerPerformanceData = useMemo(() => {
    const unitActivity = initialLeads.reduce((acc, lead) => {
      acc[lead.businessUnit] = (acc[lead.businessUnit] || 0) + 1;
      return acc;
    }, {});
    const labels = Object.keys(unitActivity).slice(0, 7);
    return {
      labels: labels.map(l => l.split(' ')[0]),
      data: labels.map(l => unitActivity[l])
    };
  }, []);

  // --- CHART CONFIGURATIONS ---
  const activityTrendConfig = {
    series: [{ name: 'Inquiries', data: trendChartData.data }],
    options: {
      chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: false } },
      colors: ['#007ACC'],
      stroke: { curve: 'smooth', width: 2 },
      fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
      xaxis: { categories: trendChartData.labels, labels: { style: { fontSize: '10px', fontWeight: 600, colors: '#94A3B8' } } },
      yaxis: { labels: { style: { fontSize: '10px', fontWeight: 600, colors: '#94A3B8' } } },
      grid: { borderColor: '#F1F5F9', strokeDashArray: 4 },
      dataLabels: { enabled: false },
    }
  };

  const statusDistributionConfig = {
    series: [stats.statusCounts.Pending, stats.statusCounts.Verified, stats.statusCounts.Completed],
    options: {
      chart: { type: 'donut' },
      labels: ['Pending', 'Verified', 'Success'],
      colors: ['#F59E0B', '#007ACC', '#10B981'],
      legend: { position: 'bottom', fontSize: '10px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' },
      plotOptions: { pie: { donut: { size: '70%' } } },
      dataLabels: { enabled: false }
    }
  };

  const performanceConfig = {
    series: [{ name: 'Leads Received', data: partnerPerformanceData.data }],
    options: {
      chart: { type: 'bar', toolbar: { show: false } },
      colors: ['#007ACC'],
      plotOptions: { bar: { borderRadius: 4, columnWidth: '35%' } },
      xaxis: { categories: partnerPerformanceData.labels, labels: { style: { fontSize: '9px', fontWeight: 700, colors: '#94A3B8' } } },
      grid: { borderColor: '#F1F5F9', strokeDashArray: 2 },
      dataLabels: { enabled: false },
    }
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-6 max-w-[1600px] mx-auto">
      
      {/* 1. COMPACT HEADER */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#007ACC] border border-blue-100 shrink-0">
              <Sparkles size={24} />
           </div>
           <div>
              <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Management Center</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" /> Active System Pulse
              </p>
           </div>
        </div>
        <button 
          onClick={() => navigate('/admin/leads')}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-[#007ACC] text-white rounded-xl font-black text-[10px] hover:bg-[#0F172A] transition-all uppercase tracking-widest shadow-md active:scale-95"
        >
          View Master Registry <ArrowRight size={14} />
        </button>
      </motion.div>

      {/* 2. ANALYTICS SUITE (MOVED TO TOP) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Daily Activity" subtitle="Real-time inquiry flow">
          <Chart options={activityTrendConfig.options} series={activityTrendConfig.series} type="area" height={220} />
        </ChartCard>
        
        <ChartCard title="Inquiry Status" subtitle="Verification distribution">
          <Chart options={statusDistributionConfig.options} series={statusDistributionConfig.series} type="donut" height={220} />
        </ChartCard>

        <ChartCard title="Partner Ranking" subtitle="Top performing business units">
          <Chart options={performanceConfig.options} series={performanceConfig.series} type="bar" height={220} />
        </ChartCard>
      </div>

      {/* 3. METRIC NODES (NOW BELOW CHARTS) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inquiries', val: stats.totalLeads, icon: <Activity size={16}/>, color: 'text-[#007ACC]', bg: 'bg-blue-50' },
          { label: 'Business Partners', val: stats.totalUnits, icon: <Building2 size={16}/>, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Network Credits', val: stats.totalCredits, icon: <Zap size={16}/>, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Team', val: latestAgents.length, icon: <Users size={16}/>, color: 'text-emerald-600', bg: 'bg-emerald-50' }
        ].map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm hover:border-[#007ACC] transition-all cursor-default"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 border transition-colors ${m.bg} ${m.color} border-current/10`}>
              {m.icon}
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{m.label}</p>
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{m.val.toLocaleString()}</h3>
          </motion.div>
        ))}
      </div>

      {/* 4. TEAM & PARTNER SNAPSHOT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* TEAM ONBOARDING */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <UserPlus size={16} className="text-[#007ACC]" /> Team Onboarding
            </h4>
            <button onClick={() => navigate('/admin/agents')} className="text-[9px] font-black text-[#007ACC] uppercase tracking-widest hover:text-slate-900 transition-colors">Directory</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {latestAgents.map((agent, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl hover:border-[#007ACC] transition-all group">
                <div className="w-10 h-10 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-[10px] uppercase group-hover:scale-105 transition-transform">
                  {agent.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-slate-900 uppercase truncate">{agent.name}</p>
                  <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{agent.joined} • {agent.id}</p>
                </div> 
                <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              </div>
            ))}
          </div>
        </div>

        {/* KEY PARTNERS */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50">
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Plus size={16} className="text-[#007ACC]" /> Key Partners
            </h4>
          </div>
          <div className="p-3 space-y-2 flex-1">
            {businessUnits.slice(0, 5).map((unit, i) => (
              <div key={i} onClick={() => navigate('/admin/units')} className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-xl hover:border-[#007ACC] transition-all cursor-pointer group shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#007ACC] group-hover:bg-[#007ACC] group-hover:text-white transition-colors">
                    <Database size={14} />
                  </div>
                  <div className="truncate">
                    <p className="text-[10px] font-black text-slate-900 uppercase truncate">{unit.name}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase truncate mt-0.5">{unit.location.split(',')[0]}</p>
                  </div>
                </div>
                <ChevronRight size={12} className="text-slate-300 group-hover:text-[#007ACC]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- CHART CARD HELPER ---
const ChartCard = ({ title, subtitle, children }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }}
    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
  >
    <div className="mb-4">
      <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{title}</h4>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
    </div>
    <div className="w-full">{children}</div>
  </motion.div>
);

export default AdminOverview;