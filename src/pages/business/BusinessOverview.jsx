import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, Clock, Activity, ShieldCheck, 
  TrendingUp, CheckCircle2, ArrowUpRight, Zap 
} from 'lucide-react';
import Chart from 'react-apexcharts';

const BusinessOverview = () => {
  const { leads = [], businessName } = useOutletContext();

  const myLeads = useMemo(() => {
    return leads.filter(l => l.businessUnit === businessName);
  }, [leads, businessName]);

  const stats = useMemo(() => ({
    total: myLeads.length,
    verified: myLeads.filter(l => l.status === 'Verified').length,
    inProgress: myLeads.filter(l => l.status === 'In Progress').length,
    completed: myLeads.filter(l => l.status === 'Completed').length,
    rejected: myLeads.filter(l => l.status === 'Rejected').length,
  }), [myLeads]);

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // --- Smooth Area Chart Logic ---
  const trendData = useMemo(() => {
    const countsByDate = myLeads.reduce((acc, lead) => {
      acc[lead.date] = (acc[lead.date] || 0) + 1;
      return acc;
    }, {});
    
    const sortedDates = Object.keys(countsByDate).sort().slice(-7);
    return {
      labels: sortedDates.map(d => d.split('-').slice(1).join('/')), 
      data: sortedDates.map(d => countsByDate[d])
    };
  }, [myLeads]);

  const areaChartConfig = {
    series: [{ name: 'Leads Received', data: trendData.data.length ? trendData.data : [0,0,0,0,0,0,0] }],
    options: {
      chart: { 
        type: 'area', 
        toolbar: { show: false }, 
        fontFamily: 'Plus Jakarta Sans',
        zoom: { enabled: false },
        sparkline: { enabled: false }
      },
      colors: ['#007ACC'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth', width: 3, lineCap: 'round' },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.45,
          opacityTo: 0.05,
          stops: [0, 90, 100]
        }
      },
      xaxis: {
        categories: trendData.labels,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: '#94A3B8', fontSize: '11px', fontWeight: 600 } }
      },
      yaxis: { 
        show: true,
        tickAmount: 4,
        labels: { style: { colors: '#94A3B8', fontSize: '11px', fontWeight: 600 } } 
      },
      grid: { 
        borderColor: '#F1F5F9', 
        strokeDashArray: 4, 
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      tooltip: {
        theme: 'light',
        x: { show: false },
        y: { formatter: (val) => `${val} New Leads` },
        marker: { show: false }
      }
    }
  };

  const successRadialConfig = {
    series: [completionRate],
    options: {
      chart: { type: 'radialBar' },
      plotOptions: {
        radialBar: {
          startAngle: -135,
          endAngle: 135,
          hollow: { size: '65%' },
          track: { background: '#F8FAFC', strokeWidth: '100%' },
          dataLabels: {
            name: { offsetY: 20, color: '#64748B', fontSize: '11px', fontWeight: 700, label: 'COMPLETED' },
            value: { offsetY: -15, color: '#1E293B', fontSize: '26px', fontWeight: 800, formatter: (val) => `${val}%` }
          }
        }
      },
      colors: ['#10B981'],
      stroke: { lineCap: 'round' }
    }
  };

  return (
    <div className="space-y-6 pb-24 px-4 sm:px-6 lg:px-0 max-w-[1400px] mx-auto">
      
      {/* 1. RESPONSIVE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard label="Total Leads" value={stats.total} icon={<Users size={18}/>} color="text-blue-600" bg="bg-blue-50" trend="+12.5%" />
        <MetricCard label="Verified" value={stats.verified} icon={<CheckCircle2 size={18}/>} color="text-emerald-600" bg="bg-emerald-50" trend="Stable" />
        <MetricCard label="Working" value={stats.inProgress} icon={<Clock size={18}/>} color="text-amber-600" bg="bg-amber-50" trend="Active" />
        <MetricCard label="Rejected" value={stats.rejected} icon={<Activity size={18}/>} color="text-rose-600" bg="bg-rose-50" trend="Low" />
      </div>

      {/* 2. ANALYTICS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Lead Activity Trend</h3>
              <p className="text-[11px] text-slate-400 font-medium">Inquiry flow (Last 7 days)</p>
            </div>
            <div className="flex items-center gap-2 self-start text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <ArrowUpRight size={14} />
              <span className="text-[10px] font-bold uppercase tracking-tight">Growth Active</span>
            </div>
          </div>
          <div className="h-[280px] w-full">
            <Chart options={areaChartConfig.options} series={areaChartConfig.series} type="area" height="100%" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Efficiency</h3>
            <p className="text-[11px] text-slate-400 font-medium">Lead conversion rate</p>
          </div>
          <div className="h-60 w-full flex items-center justify-center">
            <Chart options={successRadialConfig.options} series={successRadialConfig.series} type="radialBar" height="100%" />
          </div>
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
             <span className="text-[10px] font-bold text-slate-500 uppercase">Target 80%</span>
             <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">On Track</span>
          </div>
        </div>
      </div>

      {/* 3. STATUS & PROTOCOL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-5 group transition-all hover:border-blue-200">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="text-[14px] font-extrabold text-slate-900 uppercase tracking-tight">Lead Processing Status</h4>
            <p className="text-[12px] text-slate-500 mt-2 leading-relaxed font-medium">
              System is currently monitoring all incoming leads. Verification protocols are active to ensure data integrity and maximize conversion probability.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Pulse</h4>
            <div className="flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[10px] font-black text-blue-600 uppercase">Live</span>
            </div>
          </div>
          <div className="space-y-4">
             <StatusLine label="Database Health" val="Stable" color="bg-emerald-500" />
             <StatusLine label="Sync Latency" val="0.4ms" color="bg-blue-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// --- HELPERS ---

const MetricCard = ({ label, value, icon, color, bg, trend }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col gap-4 group transition-all hover:shadow-md cursor-default"
  >
    <div className="flex justify-between items-center">
      <div className={`h-10 w-10 ${bg} ${color} rounded-xl flex items-center justify-center border border-transparent group-hover:border-current transition-all`}>
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-slate-50 rounded-md">{trend}</span>
    </div>
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

const StatusLine = ({ label, val, color }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-600 uppercase">
      <div className={`h-1.5 w-1.5 rounded-full ${color}`} />
      {label}
    </div>
    <span className="text-[11px] font-black text-slate-900">{val}</span>
  </div>
);

export default BusinessOverview;