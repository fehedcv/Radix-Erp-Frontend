import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, User, Building2, Calendar, 
  X, Activity, Phone, MapPin, 
  LayoutGrid, Briefcase, MessageSquare
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const MasterLeadTrackerApp = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAgentContact, setShowAgentContact] = useState(false);
  const [unitFilter, setUnitFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
  const [customerSearch, setCustomerSearch] = useState("");

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- THEME INTEGRATION ---
  const { theme } = useTheme();
  const isLight = theme === 'light';

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

  useEffect(() => {
    setShowAgentContact(false);
  }, [selectedLead]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // 1. Status Filter
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;

      // 2. Business Unit Filter
      const matchesUnit = unitFilter === 'All' || lead.businessUnit === unitFilter;

      // 3. Agent Filter
      const matchesAgent = agentFilter === 'All' || lead.agentName === agentFilter;

      // 4. Customer / Global Search Filter
      const search = customerSearch.toLowerCase().trim();
      const matchesSearch = !search || (
        (lead.clientName && lead.clientName.toLowerCase().includes(search)) ||
        ((lead.displayId || lead.id) && (lead.displayId || lead.id).toLowerCase().includes(search))
      );

      // Return true only if ALL conditions are met
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
        series: [{ name: 'Total Leads', data: sortedDates.map((d) => dailyCounts[d]) }],
        options: {
          chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          colors: ['#81B398'],
          stroke: { curve: 'smooth', width: 2 },
          fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: isLight ? 0.3 : 0.45, opacityTo: 0.05, stops: [0, 90, 100] } },
          xaxis: { categories: sortedDates.map((d) => d.split('-').slice(1).join('/')), labels: { style: { fontSize: '10px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } }, axisBorder: { show: false }, axisTicks: { show: false } },
          yaxis: { labels: { style: { fontSize: '10px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } } },
          grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
      status: {
        series: Object.values(statusCounts),
        options: {
          chart: { animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          labels: Object.keys(statusCounts),
          colors: ['#F59E0B', '#81B398', '#3B82F6', '#6366F1', '#4F46E5', '#F0524F'],
          legend: { position: 'bottom', fontSize: '10px', fontWeight: 800, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '70%' } }, stroke: { colors: isLight ? '#FFFFFF' : '#222938' } },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
      performance: {
        series: [{ name: 'Lead Count', data: Object.values(unitActivity).slice(0, 7) }],
        options: {
          chart: { type: 'bar', toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          colors: ['#81B398'],
          plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
          xaxis: { categories: Object.keys(unitActivity).slice(0, 7).map((u) => u.split(' ')[0]), labels: { style: { fontSize: '9px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } }, axisBorder: { show: false }, axisTicks: { show: false } },
          yaxis: { labels: { style: { fontSize: '10px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } } },
          grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
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

  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'verified') return 'text-[#81B398] bg-[#81B398]/10 border-[#81B398]/20';
    if (s === 'rejected') return 'text-[#F0524F] bg-[#F0524F]/10 border-[#F0524F]/20';
    if (s === 'in progress' || s === 'started') return 'text-[#48477A] bg-[#48477A]/10 border-[#48477A]/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20'; // Pending
  };

  if (loading) {
    return <SkeletonLoader isLight={isLight} />;
  }

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>

      {/* 1. FREE HEADING */}
      <div className="mb-4 px-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-1">Lead Tracker</h2>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Management Console</p>
        </div>
      </div>

      {/* 2. METRIC NODES (STATUS CARDS AT TOP) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <QuickStat label="Total Leads" count={filteredLeads.length} isLight={isLight} />
        <QuickStat label="Pending" count={filteredLeads.filter(l => l.status === 'Pending').length} isLight={isLight} />
        <QuickStat label="In Progress" count={filteredLeads.filter(l => l.status === 'In Progress' || l.status === 'Started').length} isLight={isLight} />
        <QuickStat label="Completed" count={filteredLeads.filter(l => l.status === 'Completed').length} isLight={isLight} />
      </div>

      {/* 3. ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-12">
          <ChartCard title="Customer Inquiry Growth" subtitle="Monitoring our daily lead intake" isLight={isLight}>
            <Chart options={chartConfigs.trend.options} series={chartConfigs.trend.series} type="area" height={260} />
          </ChartCard>
        </div>
        <div className="lg:col-span-7">
          <ChartCard title="Partners Activity" subtitle="Comparison of leads across business units" isLight={isLight}>
            <Chart options={chartConfigs.performance.options} series={chartConfigs.performance.series} type="bar" height={240} />
          </ChartCard>
        </div>
        <div className="lg:col-span-5">
          <ChartCard title="Work Status" subtitle="Breakdown of leads by current progress" isLight={isLight}>
            <div className="flex justify-center pt-2">
              <Chart options={chartConfigs.status.options} series={chartConfigs.status.series} type="donut" width="100%" height={240} />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* 4. TABLE */}
      <div className={`rounded-3xl border overflow-hidden transition-all duration-200 flex flex-col ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
      }`}>
        
        {/* FILTERS */}
        <div className={`p-4 md:p-5 border-b flex flex-col gap-4 ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]/50' : 'border-white/10 bg-[#1A1A24]/50'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid size={14} strokeWidth={2.5} className="text-[#81B398]" /> Lead Management Table
            </h3>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              {filteredLeads.length} Records found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Status Filter */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-white/10 focus-within:border-[#81B398]'}`}>
              <Filter size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
              <select className={`w-full bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Business Unit Filter */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-white/10 focus-within:border-[#81B398]'}`}>
              <Briefcase size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
              <select className={`w-full bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`} value={unitFilter || "All"} onChange={(e) => setUnitFilter(e.target.value)}>
                <option value="All">All Units</option>
                {Array.from(new Set(leads.map(l => l.businessUnit).filter(Boolean))).map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Agent Filter */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-white/10 focus-within:border-[#81B398]'}`}>
              <User size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
              <select className={`w-full bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`} value={agentFilter || "All"} onChange={(e) => setAgentFilter(e.target.value)}>
                <option value="All">All Agents</option>
                {Array.from(new Set(leads.map(l => l.agentName).filter(Boolean))).map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            {/* Customer Search */}
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-white/10 focus-within:border-[#81B398]'}`}>
              <Search size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
              <input type="text" placeholder="Search Customer..." className={`w-full bg-transparent text-[10px] font-bold uppercase tracking-wider outline-none ${isLight ? 'text-[#1A202C] placeholder:text-[#A0AEC0]' : 'text-[#F4F5F7] placeholder:text-[#718096]'}`} value={customerSearch || ""} onChange={(e) => setCustomerSearch(e.target.value)} />
              {customerSearch && (
                <button onClick={() => setCustomerSearch("")} className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>
                   <X size={12} strokeWidth={2.5} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          {error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#F0524F]">
              <Activity size={24} strokeWidth={2.5} />
              <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
              <button onClick={fetchData} className="mt-2 px-6 py-2.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Retry</button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-24 gap-3 ${isLight ? 'text-[#A0AEC0]' : 'text-[#718096]'}`}>
              <LayoutGrid size={28} strokeWidth={2.5} />
              <p className="text-[10px] font-bold uppercase tracking-wider">No leads found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className={isLight ? 'bg-[#FFFFFF]' : 'bg-[#222938]'}>
                  {['Reference', 'Customer', 'Branch', 'Assigned To', 'Status', 'Action'].map((h, i) => (
                    <th key={h} className={`px-5 py-4 text-[9px] font-bold uppercase tracking-wider border-b ${isLight ? 'text-[#718096] border-[#E2E8F0]' : 'text-[#9CA3AF] border-white/10'} ${i >= 4 ? 'text-center' : ''} ${i === 5 ? 'text-right' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isLight ? 'divide-[#E2E8F0]' : 'divide-white/5'}`}>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className={`transition-all group ${isLight ? 'hover:bg-[#F4F5F7]/50' : 'hover:bg-[#1A1A24]'}`}>
                    <td className="px-5 py-4">
                      <span className={`font-mono text-[10px] font-extrabold uppercase px-2 py-1 rounded-lg border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'}`}>
                        {lead.displayId || lead.id}
                      </span>
                      <p className={`text-[8px] font-bold uppercase tracking-wider mt-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{lead.date}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-extrabold uppercase tracking-tight">{lead.clientName}</p>
                      <p className={`text-[9px] font-bold flex items-center gap-1.5 mt-1 tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        <Phone size={10} strokeWidth={2.5} /> {lead.clientPhone || 'No contact'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] font-extrabold uppercase block mb-1 truncate max-w-[150px]">{lead.businessUnit}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wider truncate max-w-[150px] ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>{lead.service}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center text-[10px] font-extrabold uppercase shrink-0 ${
                          isLight ? 'bg-[#1A202C] text-white' : 'bg-[#F4F5F7] text-[#1A202C]'
                        }`}>
                          {lead.agentName?.[0] || 'U'}
                        </div>
                        <p className="text-[10px] font-extrabold uppercase truncate max-w-[120px]">{lead.agentName}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button 
                        onClick={() => setSelectedLead(lead)} 
                        className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'
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
      </div>

      {/* DETAIL MODAL (Bento Style) */}
      <AnimatePresence>
        {selectedLead && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border flex flex-col p-6 md:p-8 ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}
            >
              <button
                onClick={() => setSelectedLead(null)}
                className={`absolute top-6 right-6 p-2 rounded-full transition-colors z-10 ${
                  isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-white/10'
                }`}
              >
                <X size={20} strokeWidth={2.5} />
              </button>

              {/* HEADER */}
              <header className="mb-8 pr-10">
                <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {selectedLead.displayId || selectedLead.id}
                </h3>
                <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  <Calendar size={14} strokeWidth={2.5} /> Registration Date: {selectedLead.date}
                </div>
              </header>

              {/* TWO COLUMN GRID LAYOUT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                
                {/* --- LEFT COLUMN --- */}
                <div className="space-y-4">
                  
                  {/* CLIENT INFO */}
                  <div className={`border rounded-3xl p-5 md:p-6 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                    <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'text-[#718096] border-[#E2E8F0]' : 'text-[#9CA3AF] border-white/10'}`}>
                      <User size={14} strokeWidth={2.5} className="text-[#81B398]" /> Client Information
                    </h5>
                    <div className="grid gap-5">
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Customer Name</span>
                        <span className="text-base font-extrabold uppercase">{selectedLead.clientName}</span>
                      </div>
                      <div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Phone</span>
                        <span className="text-sm font-extrabold">{selectedLead.clientPhone || "Not Shared"}</span>
                      </div>
                      {selectedLead.clientAddress && (
                        <div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Service Location</span>
                          <span className="text-sm font-extrabold">{selectedLead.clientAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* --- RIGHT COLUMN --- */}
                <div className="space-y-4">
                  
                  {/* BRANCH & STATUS */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`border rounded-2xl p-5 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        <Building2 size={12} strokeWidth={2.5} className="text-[#81B398]" /> Branch
                      </p>
                      <p className="text-[11px] font-extrabold uppercase truncate">{selectedLead.businessUnit || 'Unknown'}</p>
                    </div>
                    <div className={`border rounded-2xl p-5 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                      <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        Current Stage
                      </p>
                      <span className={`inline-block px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </span>
                    </div>
                  </div>

                  {/* SERVICE REQUIRED */}
                  <div className={`border rounded-3xl p-5 md:p-6 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                    <div className={`text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                      <Briefcase size={14} strokeWidth={2.5} className="text-[#81B398]" /> Service Required
                    </div>
                    <p className="text-base font-extrabold uppercase tracking-tight">{selectedLead.service || 'Unknown'}</p>
                    {selectedLead.description && (
                      <div className={`mt-4 p-4 rounded-2xl border text-xs font-medium leading-relaxed italic ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        "{selectedLead.description}"
                      </div>
                    )}
                  </div>

                  {/* AGENT CARD */}
                  <div className={`border rounded-3xl p-5 md:p-6 transition-all duration-200 flex flex-col gap-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm uppercase shrink-0 ${
                        isLight ? 'bg-[#1A202C] text-white' : 'bg-[#F4F5F7] text-[#1A202C]'
                      }`}>
                        {selectedLead.agentName?.[0] || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Case Handled By</p>
                        <p className="text-sm font-extrabold uppercase truncate">{selectedLead.agentName}</p>
                      </div>
                    </div>
                    
                    {selectedLead.agentPhone && (
                      <div className="flex flex-wrap gap-2 w-full pt-2">
                        <a
                          href={`tel:${selectedLead.agentPhone}`}
                          className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398]'
                          }`}
                        >
                          <Phone size={14} strokeWidth={2.5} /> Call
                        </a>
                        <a
                          href={`https://wa.me/${selectedLead.agentPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 py-3 rounded-xl border border-transparent text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
                        >
                          <MessageSquare size={14} strokeWidth={2.5} /> WhatsApp
                        </a>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* FOOTER BUTTON */}
              <div className="mt-8">
                <button
                  onClick={() => setSelectedLead(null)}
                  className={`w-full py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                    isLight 
                      ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' 
                      : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'
                  }`}
                >
                  Close Details
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ---------------- SKELETON LOADER COMPONENT ----------------
const SkeletonLoader = ({ isLight }) => (
  <div className="space-y-4 pt-2 pb-6 px-4 w-full animate-pulse max-w-[1600px] mx-auto">
    {/* Header */}
    <div className="mb-4 px-1">
      <div className={`w-40 h-8 rounded-lg mb-2 ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
      <div className={`w-28 h-3 rounded ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
    </div>

    {/* Metrics Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`h-28 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-12 gap-3 lg:gap-4">
      <div className={`col-span-12 h-72 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      <div className={`col-span-12 lg:col-span-7 h-72 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      <div className={`col-span-12 lg:col-span-5 h-72 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
    </div>

    {/* Table Area */}
    <div className={`h-96 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
  </div>
);

const ChartCard = ({ title, subtitle, children, isLight }) => (
  <div className={`rounded-3xl p-5 md:p-6 border transition-all duration-200 h-full flex flex-col ${
    isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
  }`}>
    <div className="mb-5">
      <h4 className="text-sm font-extrabold uppercase tracking-tight">{title}</h4>
      <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{subtitle}</p>
    </div>
    <div className="w-full flex-1 flex flex-col justify-end">{children}</div>
  </div>
);

const QuickStat = ({ label, count, isLight }) => (
  <div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${
    isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
  }`}>
    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
      {label}
    </p>
    <h3 className="text-3xl font-extrabold tracking-tighter">
      {count}
    </h3>
  </div>
);

export default MasterLeadTrackerApp;