import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, User, Building2, Calendar, 
  X, Activity, Phone, MapPin, 
  Sparkles, BarChart3, LayoutGrid, Globe, Info, Briefcase, Mail, ChevronRight, CheckCircle, FileText, AlertCircle, Loader2,
  TrainTrack,
  AlignVerticalJustifyStartIcon,
  VenusAndMarsIcon,
  TrendingUp,
  Target
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';

// Map API doc → internal lead shape
const mapDoc = (doc) => ({
  id: doc.id || doc.name,
  businessUnit: doc.business_unit_name || doc.business_unit || '—',
  agentName: doc.source_agent || 'System',
  agentId: doc.agent_id || doc.source_agent || 'VYNX-CORE',
  clientName: doc.customer_name || '—',
  clientPhone: doc.phone || '',
  clientEmail: doc.email || '',
  clientAddress: doc.client_address || '',
  description: doc.description || '',
  service: doc.service_name || doc.service || '—',
  status: doc.status || 'Pending',
  verifiedByAdmin: !!doc.verified_by_admin,
  verificationNotes: doc.verification_notes || '',
  date: doc.creation ? doc.creation.split(' ')[0] : '—',
});

const MasterLeadTracker = () => {
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await frappeApi.get('/method/business_chain.api.admin.get_leads_business_units_services');
      const payload = res.data?.message?.data || res.data?.data || res.data;

      const unitMap = {};
      const serviceMap = {};

      (payload?.business_units || []).forEach((unit) => {
        if (unit.id) unitMap[unit.id] = unit.name;
      });

      (payload?.services || []).forEach((service) => {
        if (service.id) serviceMap[service.id] = service.name;
      });

      const leadsWithNames = (payload?.leads || []).map((doc, index) => {
        const base = mapDoc(doc);
        return {
          ...base,
          displayId: `Lead-${index + 1}`,
          businessUnit:
            doc.business_unit_name ||
            unitMap[doc.business_unit_id] ||
            doc.business_unit_id ||
            base.businessUnit,
          service:
            doc.service_name ||
            serviceMap[doc.service_id] ||
            doc.service_id ||
            base.service,
        };
      });

      setLeads(leadsWithNames);
    } catch (err) {
      console.warn('Failed to load leads data', err);
      setError('Failed to load leads. Please check your connection or permissions.');
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
          chart: { type: 'area', toolbar: { show: false } },
          colors: ['#4F46E5'],
          stroke: { curve: 'smooth', width: 2 },
          xaxis: { categories: sortedDates.map((d) => d.split('-').slice(1).join('/')), labels: { style: { fontSize: '10px' } } },
          dataLabels: { enabled: false },
        },
      },
      status: {
        series: Object.values(statusCounts),
        options: {
          labels: Object.keys(statusCounts),
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#4F46E5'],
          legend: { position: 'bottom', fontFamily: 'Plus Jakarta Sans' },
        },
      },
      performance: {
        series: [{ name: 'Lead Count', data: Object.values(unitActivity).slice(0, 7) }],
        options: {
          chart: { toolbar: { show: false } },
          colors: ['#2563EB'],
          plotOptions: { bar: { borderRadius: 4, columnWidth: '40%' } },
          xaxis: { categories: Object.keys(unitActivity).slice(0, 7).map((u) => u.split(' ')[0]) },
        },
      },
    };
  }, [filteredLeads]);

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

  const statusStyles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-100',
    Verified: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Started: 'bg-blue-50 text-blue-700 border-blue-100',
    'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    Completed: 'bg-blue-50 text-blue-800 border-blue-200',
  };

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-6 max-w-[1600px] mx-auto md:px-0">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-4 md:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-[20px] font-black text-slate-900 uppercase tracking-tight">Lead Tracker</h2>
         
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          <button onClick={handleExport} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm flex justify-center">
            <Download size={18} />
          </button>
         
        </div>
      </motion.div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ChartCard title="Customer Inquiry Growth" subtitle="Monitoring our daily lead intake">
            <Chart options={chartConfigs.trend.options} series={chartConfigs.trend.series} type="area" height={280} />
          </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-7">
          <ChartCard title="Partners Activity" subtitle="Comparison of leads across different business units">
            <Chart options={chartConfigs.performance.options} series={chartConfigs.performance.series} type="bar" height={240} />
          </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-5">
          <ChartCard title="Work Status" subtitle="Breakdown of leads by current progress">
            <div className="flex justify-center pt-2">
              <Chart options={chartConfigs.status.options} series={chartConfigs.status.series} type="donut" width="100%" height={240} />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* TABLE */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* HEADER & FILTERS */}
        <div className="px-5 py-4 border-b border-slate-50 flex flex-col gap-4 bg-slate-50/20">
          
          {/* Top Row: Title & Record Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid size={14} className="text-indigo-600" /> Lead Management Table
            </h3>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
              {filteredLeads.length} Records found
            </span>
          </div>

          {/* Bottom Row: Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Status Filter (Existing) */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus-within:border-indigo-400 transition-colors">
              <Filter size={12} className="text-indigo-600 shrink-0" />
              <select 
                className="w-full bg-transparent text-[9px] font-black uppercase text-slate-700 outline-none cursor-pointer" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                {/* <option value="Started">Started</option> */}
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Business Unit Filter (New) */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus-within:border-indigo-400 transition-colors">
              <Briefcase size={12} className="text-indigo-600 shrink-0" />
              <select 
                className="w-full bg-transparent text-[9px] font-black uppercase text-slate-700 outline-none cursor-pointer" 
                value={unitFilter || "All"} 
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <option value="All">All Units</option>
                {/* Dynamically extract unique units, or replace with your unit list state */}
                {Array.from(new Set(leads.map(l => l.businessUnit).filter(Boolean))).map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            {/* Agent Filter (New) */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus-within:border-indigo-400 transition-colors">
              <User size={12} className="text-indigo-600 shrink-0" />
              <select 
                className="w-full bg-transparent text-[9px] font-black uppercase text-slate-700 outline-none cursor-pointer" 
                value={agentFilter || "All"} 
                onChange={(e) => setAgentFilter(e.target.value)}
              >
                <option value="All">All Agents</option>
                {/* Dynamically extract unique agents, or replace with your agent list state */}
                {Array.from(new Set(leads.map(l => l.agentName).filter(Boolean))).map(agent => (
                  <option key={agent} value={agent}>{agent}</option>
                ))}
              </select>
            </div>

            {/* Customer Search Filter (New) */}
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm focus-within:border-indigo-400 transition-colors">
              <Search size={12} className="text-indigo-600 shrink-0" />
              <input 
                type="text"
                placeholder="Search Customer..."
                className="w-full bg-transparent text-[9px] font-black uppercase text-slate-700 placeholder:text-slate-400 outline-none"
                value={customerSearch || ""}
                onChange={(e) => setCustomerSearch(e.target.value)}
              />
              {customerSearch && (
                <button onClick={() => setCustomerSearch("")} className="text-slate-400 hover:text-slate-600">
                   <X size={10} />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* TABLE CONTENT */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
              <Loader2 size={28} className="animate-spin text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading Leads...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-400">
              <AlertCircle size={28} />
              <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
              <button onClick={fetchData} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Retry</button>
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-2 text-slate-300">
              <LayoutGrid size={28} />
              <p className="text-[10px] font-black uppercase tracking-widest">No leads found</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-white">
                  {['Reference', 'Customer', 'Branch', 'Assigned To', 'Status', 'Action'].map((h, i) => (
                    <th key={h} className={`px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 ${i >= 4 ? 'text-center' : ''} ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-6 py-4">
                      <span className="font-mono text-[10px] text-indigo-600 font-bold bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">{lead.displayId || lead.id}</span>
                      <p className="text-[8px] text-slate-400 font-bold uppercase mt-1">{lead.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{lead.clientName}</p>
                      <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1 mt-0.5"><Phone size={9} /> {lead.clientPhone || 'No contact'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black text-slate-700 uppercase block leading-none">{lead.businessUnit}</span>
                      <span className="text-[8px] text-indigo-400 font-bold uppercase tracking-tight">{lead.service}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[9px] font-black text-indigo-600 uppercase">
                          {lead.agentName[0]}
                        </div>
                        <p className="text-[9px] font-black text-slate-800 uppercase">{lead.agentName}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${statusStyles[lead.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedLead(lead)} className="px-3 py-1.5 bg-white border border-slate-200 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        Full Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
      {/* DETAIL PANEL */}
<AnimatePresence>
  {selectedLead && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSelectedLead(null)}
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
      />
      
      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white w-full max-w-5xl max-h-[95vh] overflow-y-auto lg:overflow-hidden relative shadow-2xl border border-slate-100 rounded-md  p-6 md:p-10 flex flex-col"
      >
        <button
          onClick={() => setSelectedLead(null)}
          className="absolute top-5 right-5 md:top-7 md:right-7 p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <header className="mb-8 pr-12">
          <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
            {selectedLead.displayId || selectedLead.id}
          </h3>
          <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <Calendar size={14} className="text-indigo-500" /> Registration Date: {selectedLead.date}
          </div>
        </header>

        {/* TWO COLUMN GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 flex-1">
          
          {/* --- LEFT COLUMN --- */}
          <div className="space-y-6">
            
            {/* CLIENT INFO */}
            <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm h-full">
              <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User size={14} /> Client Information
              </h5>
              <div className="grid grid-cols-2 gap-y-5">
                <div>
                  <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">
                    Customer Name
                  </span>
                  <span className="text-xs font-black text-slate-900 uppercase">
                    {selectedLead.clientName}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">
                    Phone
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedLead.clientPhone || "Not Shared"}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">
                    Email
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {selectedLead.clientEmail || "Not Shared"}
                  </span>
                </div>
               
                {selectedLead.clientAddress && (
                  <div className="col-span-2 pt-2">
                    <span className="text-[8px] text-slate-400 font-black uppercase block mb-2">
                      Service Location
                    </span>
                    <div className="flex items-start gap-3 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                      <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                      <span className="text-[10px] text-indigo-900 leading-relaxed font-bold uppercase">
                        {selectedLead.clientAddress}
                      </span>
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
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[8px] text-slate-400 font-black uppercase mb-2">
                  Handling Branch
                </p>
                <div className="flex items-center gap-2">
                  <Building2 size={12} className="text-slate-600" />
                  <p className="text-[10px] font-black text-slate-900 uppercase">
                    {selectedLead.businessUnit}
                  </p>
                </div>
              </div>
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                <p className="text-[8px] text-indigo-400 font-black uppercase mb-2">
                  Current Stage
                </p>
                <span
                  className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border shadow-sm ${
                    statusStyles[selectedLead.status] ||
                    "bg-slate-50 text-slate-600 border-slate-100"
                  }`}
                >
                  {selectedLead.status}
                </span>
              </div>
            </section>

            {/* SERVICE REQUIRED */}
            <section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase size={14} className="text-indigo-600" />
                <p className="text-[9px] text-slate-400 font-black uppercase">
                  Service Required
                </p>
              </div>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {selectedLead.service}
              </p>
              {selectedLead.description && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-[10px] text-slate-500 font-medium leading-relaxed">
                  "{selectedLead.description}"
                </div>
              )}
            </section>

            {/* AGENT CARD */}
            <section className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-indigo-200 shadow-lg">
                  {selectedLead.agentName[0]}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-900 uppercase">
                    Case Handled By {selectedLead.agentName}
                  </p>
                  <p className="text-[8px] text-slate-400 font-mono tracking-widest mt-1 uppercase">
                    Partner Email: {selectedLead.agentId}
                  </p>
                </div>
              </div>
              {selectedLead.agentPhone && (
                <div className="flex items-center gap-2">
                   <div className="h-7 w-7 bg-indigo-50 rounded-md flex items-center justify-center text-indigo-600">
                    <Phone size={12} />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-900 hidden sm:block">
                    {selectedLead.agentPhone}
                  </span>
                </div>
              )}
            </section>

          </div>
        </div>

        {/* FOOTER BUTTON */}
        <div className="mt-auto">
          <button
            onClick={() => setSelectedLead(null)}
            className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 shadow-indigo-100"
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

const ChartCard = ({ title, subtitle, children }) => (
  <motion.div
    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
    className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full"
  >
    <div className="mb-6">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{title}</h4>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
    </div>
    <div className="w-full flex-1">{children}</div>
  </motion.div>
);

export default MasterLeadTracker;