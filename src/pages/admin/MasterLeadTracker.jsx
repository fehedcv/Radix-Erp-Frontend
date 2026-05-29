import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Download, User, Building2, Calendar, 
  X, Activity, Phone, MapPin, BarChart3, LayoutGrid,
  Briefcase, Mail, CheckCircle, AlertCircle, Loader2, Target, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext'; 

const STATUSES = [
  'All',
  'Pending',
  'Verified',
  'In Progress',
  'Completed',
  'Rejected'
];

const MasterLeadTracker = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); 
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  // --- STATE MANAGEMENT ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [unitFilter, setUnitFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
  const [customerSearch, setCustomerSearch] = useState("");

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- API CALLS ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('get_admin_leads_dashboard');

      if (error) {
        console.error('Failed to load admin leads:', error);
        setError('Failed to load leads.');
        return;
      }

      const normalizeStatus = (s) => {
        const map = {
          'pending': 'Pending',
          'verified': 'Verified',
          'in progress': 'In Progress',
          'completed': 'Completed',
          'rejected': 'Rejected',
          'started': 'Started',
        };
        return map[(s || '').toLowerCase()] || s || 'Pending';
      };

      const normalized = (data?.leads || []).map((lead, index) => ({
        ...lead,
        displayId: `Lead-${index + 1}`,
        status: normalizeStatus(lead.status),
        date: (lead.date || '').split('T')[0],
      }));

      setLeads(normalized);
    } catch (err) {
      console.error('Failed to load admin leads:', err);
      setError('Failed to load leads.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- DERIVATIONS ---
  const summary = useMemo(() => {
    return {
      total: leads.length,
      pending: leads.filter((l) => l.status?.toLowerCase() === 'pending').length,
      in_progress: leads.filter((l) => l.status?.toLowerCase() === 'in progress' || l.status?.toLowerCase() === 'started').length,
      completed: leads.filter((l) => l.status?.toLowerCase() === 'completed').length
    };
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      const matchesUnit = unitFilter === 'All' || lead.businessUnit === unitFilter;
      const matchesAgent = agentFilter === 'All' || lead.agentName === agentFilter;
      const search = customerSearch.toLowerCase().trim();
      const matchesSearch = !search || (
        (lead.clientName && lead.clientName.toLowerCase().includes(search)) ||
        ((lead.displayId || lead.id) && (lead.displayId || lead.id).toLowerCase().includes(search))
      );
      return matchesStatus && matchesUnit && matchesAgent && matchesSearch;
    });
  }, [leads, statusFilter, unitFilter, agentFilter, customerSearch]);

  const chartConfigs = useMemo(() => {
    const statusCounts = filteredLeads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
    const unitActivity = filteredLeads.reduce((acc, l) => { acc[l.businessUnit] = (acc[l.businessUnit] || 0) + 1; return acc; }, {});
    const dailyCounts = filteredLeads.reduce((acc, l) => { acc[l.date] = (acc[l.date] || 0) + 1; return acc; }, {});
    const sortedDates = Object.keys(dailyCounts).sort().slice(-10);

    return {
      trend: {
        series: [{ name: 'Total Leads', data: sortedDates.length ? sortedDates.map((d) => dailyCounts[d]) : [0] }],
        options: {
          chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
          colors: ['#48477A'], // Earth-Tech Indigo
          stroke: { curve: 'smooth', width: 2 },
          fill: { type: 'gradient', gradient: { opacityFrom: isLight ? 0.3 : 0.4, opacityTo: 0 } },
          xaxis: { 
            categories: sortedDates.length ? sortedDates.map((d) => d.split('-').slice(1).join('/')) : ['N/A'], 
            labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } },
            axisBorder: { show: false }, axisTicks: { show: false }
          },
          yaxis: { labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } } },
          grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: { lines: { show: false } }, padding: {left: 10, right: 0, bottom: 0, top: 0} },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
      status: {
        series: Object.values(statusCounts).length ? Object.values(statusCounts) : [1],
        options: {
          chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
          labels: Object.keys(statusCounts).length ? Object.keys(statusCounts) : ['No Data'],
          colors: ['#DAC18A', '#81B398', '#48477A', '#F0524F', '#718096'],
          legend: { position: 'bottom', fontSize: '11px', fontWeight: 600, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '75%' } } },
          dataLabels: { enabled: false },
          stroke: { show: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
      performance: {
        series: [{ name: 'Lead Count', data: Object.values(unitActivity).length ? Object.values(unitActivity).slice(0, 7) : [0] }],
        options: {
          chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
          colors: ['#81B398'],
          plotOptions: { bar: { borderRadius: 4, columnWidth: '35%' } },
          xaxis: { 
            categories: Object.keys(unitActivity).length ? Object.keys(unitActivity).slice(0, 7).map((u) => u.split(' ')[0]) : ['N/A'],
            labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 600 } },
            axisBorder: { show: false }, axisTicks: { show: false }
          },
          yaxis: { labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } } },
          grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: { lines: { show: false } }, padding: {left: 10, right: 0, bottom: 0, top: 0} },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
    };
  }, [filteredLeads, isLight]);

  const handleExport = () => {
    const headers = ['ID', 'Customer', 'Unit', 'Agent', 'Status', 'Date'];
    const rows = filteredLeads.map((l) =>
      [l.displayId || l.id, l.clientName, l.businessUnit, l.agentName, l.status, l.date].join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Radix_Master_Leads_Report.csv'; a.click();
  };

  // --- UI HELPERS ---
  const getStatusBadgeStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'verified' || s === 'approved') return 'bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20';
    if (s === 'rejected') return 'bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20';
    if (s === 'pending') return 'bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20';
    if (s === 'in progress' || s === 'started') return 'bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20';
    return isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5';
  };

  // SKELETON LOADER
  if (loading && leads.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0">
        <div className="pt-2 mb-6">
          <div className={`h-10 w-64 rounded-md mb-2 ${pulseClass} animate-pulse`} />
          <div className={`h-4 w-48 rounded-md ${pulseClass} animate-pulse`} />
        </div>
        
        {/* Top Summary Stats Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
           {[1,2,3,4].map(i => (
             <div key={i} className={`h-[120px] rounded-2xl ${pulseClass} animate-pulse`} />
           ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
           <div className={`lg:col-span-12 h-[320px] rounded-2xl ${pulseClass} animate-pulse`} />
        </div>
      </div>
    );
  }

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-6 lg:space-y-8 max-w-[1400px] mx-auto pb-16 transition-colors duration-300 ${textPrimary}`}>

      {/* 1. HEADER (Free/Borderless) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pt-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            Master Lead Tracker
          </h1>
          <p className={`text-sm font-medium ${textSecondary}`}>
            Global overview of all inquiries across the network.
          </p>
        </div>
        <button 
          onClick={handleExport} 
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'
          }`}
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* 2. TOP SUMMARY STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
         <QuickStat label="Total Leads" count={summary.total || 0} isLight={isLight} color="bg-[#48477A]/10 text-[#48477A] border-[#48477A]/20" />
         <QuickStat label="Pending" count={summary.pending || 0} isLight={isLight} color="bg-[#DAC18A]/10 text-[#DAC18A] border-[#DAC18A]/20" />
         <QuickStat label="In Progress" count={summary.in_progress || 0} isLight={isLight} color="bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20" />
         <QuickStat label="Completed" count={summary.completed || 0} isLight={isLight} color="bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20" />
      </div>

      {/* 3. ANALYTICS SUITE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <ChartCard title="Inquiry Growth" subtitle="Monitoring daily lead intake" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-12">
          <Chart options={chartConfigs.trend.options} series={chartConfigs.trend.series} type="area" height="100%" width="100%" />
        </ChartCard>
        
        <ChartCard title="Partner Activity" subtitle="Leads across business units" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-7">
          <Chart options={chartConfigs.performance.options} series={chartConfigs.performance.series} type="bar" height="100%" width="100%" />
        </ChartCard>
        
        <ChartCard title="Work Status" subtitle="Breakdown of current progress" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-5">
          <Chart options={chartConfigs.status.options} series={chartConfigs.status.series} type="donut" height="100%" width="100%" />
        </ChartCard>
      </div>

      {/* 4. TABLE / LEAD MANAGEMENT */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`rounded-2xl border overflow-hidden flex flex-col transition-all duration-300 ${surfaceClass}`}>
        
        {/* FILTERS HEADER */}
        <div className={`p-5 lg:p-6 border-b space-y-5 ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid size={18} className="text-[#81B398]" /> Lead Registry
            </h3>
            <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#718096]' : 'bg-[#1A202C] border-white/5 text-[#9CA3AF]'}`}>
              {filteredLeads.length} Records found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Customer Search */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
              <Search size={16} className={textSecondary} />
              <input 
                type="text"
                placeholder="Search Customer..."
                className={`w-full bg-transparent text-sm font-medium outline-none ${textPrimary} placeholder:${textSecondary}`}
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {customerSearch && (
                <button onClick={() => setCustomerSearch("")} className={`hover:text-[#F0524F] ${textSecondary}`}><X size={14} /></button>
              )}
            </div>

            {/* Status Filter */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
              <Filter size={16} className={textSecondary} />
              <select 
                className={`w-full bg-transparent text-sm font-semibold outline-none cursor-pointer ${textPrimary}`} 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Business Unit Filter */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
              <Briefcase size={16} className={textSecondary} />
              <select 
                className={`w-full bg-transparent text-sm font-semibold outline-none cursor-pointer ${textPrimary}`} 
                value={unitFilter} 
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <option value="All">All Units</option>
                {Array.from(new Set(leads.map(l => l.businessUnit).filter(Boolean))).map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Agent Filter */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
              <User size={16} className={textSecondary} />
              <select 
                className={`w-full bg-transparent text-sm font-semibold outline-none cursor-pointer ${textPrimary}`} 
                value={agentFilter} 
                onChange={(e) => setAgentFilter(e.target.value)}
              >
                <option value="All">All Agents</option>
                {Array.from(new Set(leads.map(l => l.agentName).filter(Boolean))).map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className={`animate-spin ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`} />
              <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Loading Leads...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-[#F0524F]">
              <AlertCircle size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
              <button onClick={fetchData} className="mt-2 px-6 py-2 bg-[#F0524F] text-[#FFFFFF] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D44846]">Retry</button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-24 gap-4 ${textSecondary}`}>
              <LayoutGrid size={32} className="opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">No leads found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className={`${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}>
                  {['Reference', 'Customer', 'Branch', 'Assigned To', 'Status', 'Action'].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b ${textSecondary} ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'} ${i >= 4 ? 'text-center' : ''} ${i === 5 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-[#E2E8F0]' : 'divide-white/5'}`}>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className={`transition-colors ${isLight ? 'hover:bg-[#F4F5F7]/50' : 'hover:bg-[#1A202C]/50'}`}>
                    <td className="px-6 py-4">
                      <span className={`font-mono text-xs font-bold px-2 py-1 rounded-md border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                        {lead.displayId || lead.id}
                      </span>
                      <p className={`text-xs font-medium mt-2 ${textSecondary}`}>{lead.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold">{lead.clientName}</p>
                      <p className={`text-xs font-medium flex items-center gap-1 mt-1 ${textSecondary}`}>
                        <Phone size={12} /> {lead.clientPhone || 'No contact'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold block">{lead.businessUnit}</span>
                      <span className={`text-xs font-semibold mt-1 block ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>{lead.service}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold uppercase ${isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'}`}>
                          {lead.agentName[0]}
                        </div>
                        <p className="text-sm font-bold">{lead.agentName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyles(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLead(lead)} 
                        className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720] hover:border-[#81B398] hover:text-[#81B398]'
                        }`}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* DETAIL MODAL PANEL */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 ">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedLead(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar relative border rounded-2xl p-6 md:p-8 flex flex-col ${surfaceClass}`}
            >
              <button
                onClick={() => setSelectedLead(null)}
                className={`absolute top-6 right-6 p-2 rounded-lg transition-colors ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-[#131720]'}`}
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <header className="mb-8 pr-12 border-b pb-6" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                <h3 className="text-3xl font-extrabold tracking-tight">
                  {selectedLead.displayId || selectedLead.id}
                </h3>
                <div className={`flex items-center gap-2 mt-3 text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
                  <Calendar size={14} /> Registered: {selectedLead.date}
                </div>
              </header>

              {/* Two Column Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 flex-1">
                
                {/* --- LEFT COLUMN --- */}
                <div className="space-y-6">
                  {/* CLIENT INFO */}
                  <section className={`rounded-xl p-5 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                    <h5 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2 border-b pb-3" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                      <User size={16} className="text-[#81B398]" /> Client Information
                    </h5>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                      <div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${textSecondary}`}>Customer Name</span>
                        <span className="text-sm font-bold">{selectedLead.clientName}</span>
                      </div>
                      <div>
                        <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-1 ${textSecondary}`}>Phone</span>
                        <span className="text-sm font-medium">{selectedLead.clientPhone || "Not Shared"}</span>
                      </div>
                    
                      {selectedLead.clientAddress && (
                        <div className="col-span-2 pt-2">
                          <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-2 ${textSecondary}`}>Service Location</span>
                          <div className={`flex items-start gap-3 p-4 rounded-lg border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                            <MapPin size={16} className="text-[#81B398] shrink-0 mt-0.5" />
                            <span className="text-xs font-bold leading-relaxed">{selectedLead.clientAddress}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="space-y-6">
                  
                  {/* BRANCH & STATUS */}
                  <section className="grid grid-cols-2 gap-4">
                    <div className={`p-4 border rounded-xl ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>Handling Branch</p>
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#81B398]" />
                        <p className="text-sm font-bold truncate">{selectedLead.businessUnit}</p>
                      </div>
                    </div>
                    <div className={`p-4 border rounded-xl ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>Current Stage</p>
                      <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getStatusBadgeStyles(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>
                  </section>

                  {/* SERVICE REQUIRED */}
                  <section className={`p-5 border rounded-xl ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase size={16} className="text-[#81B398]" />
                      <p className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Service Required</p>
                    </div>
                    <p className="text-sm font-bold mb-3">{selectedLead.service}</p>
                    {selectedLead.description && (
                      <div className={`p-4 rounded-lg border text-sm font-medium leading-relaxed italic ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-transparent text-[#9CA3AF]'}`}>
                        "{selectedLead.description}"
                      </div>
                    )}
                  </section>

                  {/* AGENT CARD */}
                  <section className={`p-5 border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm uppercase shrink-0 ${isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'}`}>
                        {selectedLead.agentName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>Handled By</p>
                        <p className="text-sm font-bold truncate">{selectedLead.agentName}</p>
                        <p className={`text-xs font-medium truncate mt-0.5 ${textSecondary}`}>{selectedLead.agentId}</p>
                      </div>
                    </div>
                    {selectedLead.agentPhone && (
                      <div className="flex items-center gap-2 sm:ml-auto">
                         <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-[#F4F5F7] text-[#718096]' : 'bg-[#131720] text-[#9CA3AF]'}`}>
                          <Phone size={14} />
                        </div>
                        <span className="text-xs font-bold">{selectedLead.agentPhone}</span>
                      </div>
                    )}
                  </section>

                </div>
              </div>


            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QuickStat = ({ label, count, color, isLight }) => {
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  
  return (
    <div className={`p-5 rounded-2xl border flex flex-col justify-center items-center text-center transition-colors ${surfaceClass}`}>
      <div className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border mb-3 ${color}`}>
        {label}
      </div>
      <p className={`text-3xl lg:text-4xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
        {count}
      </p>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, isLight, surfaceClass, className }) => {
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`min-w-0 p-5 lg:p-6 rounded-2xl border flex flex-col transition-all duration-300 ${surfaceClass} ${className || ''}`}
    >
      <div className="mb-6 shrink-0">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>{title}</h4>
        <p className={`text-xs font-medium mt-1 ${textSecondary}`}>{subtitle}</p>
      </div>
      {/* Explicit height constraint for ApexCharts */}
      <div className="w-full flex-1 h-[260px] relative overflow-hidden">
        {children}
      </div>
    </motion.div>
  );
};

export default MasterLeadTracker;