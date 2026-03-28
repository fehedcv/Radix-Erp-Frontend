import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, User, Building2, Calendar, 
  X, Activity, Phone, MapPin, 
  Sparkles, BarChart3, LayoutGrid, Globe, Info, Briefcase, Mail, ChevronRight, CheckCircle, FileText, AlertCircle, Loader2
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';

const LEAD_FIELDS = [
  'name', 'naming_series', 'business_unit', 'source_agent',
  'customer_name', 'phone', 'email', 'description',
  'service', 'status', 'verified_by_admin', 'verification_notes',
  'creation'
].join(',');

// Map Frappe doc → internal lead shape
const mapDoc = (doc) => ({
  id: doc.name,
  businessUnit: doc.business_unit || '—',
  agentName: doc.source_agent || 'System',
  agentId: doc.source_agent || 'VYNX-CORE',
  clientName: doc.customer_name || '—',
  clientPhone: doc.phone || '',
  clientEmail: doc.email || '',
  clientAddress: doc.client_address || '',
  description: doc.description || '',
  service: doc.service || '—',
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

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [businessUnitMap, setBusinessUnitMap] = useState({});
  const [serviceMap, setServiceMap] = useState({});

  const getBusinessUnitName = useCallback(
    (unitId) => businessUnitMap[unitId] || unitId || '—',
    [businessUnitMap]
  );

  const getBusinessServiceName = useCallback(
    (serviceId) => serviceMap[serviceId] || serviceId || '—',
    [serviceMap]
  );

  // Fetch business units and services in parallel.
  // - Business Unit list API:       name (unit doc ID) → business_name
  // - Business Unit Service list API: name (service row ID) → service_name
  const fetchBusinessUnits = useCallback(async () => {
  try {
    // Single call — Frappe returns one denormalized row per service child.
    // Each row has: name (service row ID), business_name (unit display name),
    // service_name (service display name), services.parent (unit doc ID)
    const res = await frappeApi.get('/resource/Business Unit', {
      params: {
        fields: JSON.stringify([
          'name',           // unit doc ID  (present when no child rows expand it)
          'business_name',  // unit display name
          'services.name',        // service row ID
          'services.service_name', // service display name
          'services.parent',       // parent unit doc ID (key fix)
        ]),
        limit_page_length: 0,
      },
    });

    const unitMap = {};
    const svcMap = {};

    (res.data?.data || []).forEach((row) => {
      // row.name           = service row ID  (e.g. "m5g07m83qr")
      // row.business_name  = unit display name (e.g. "Archi Zaid")
      // row['services.parent'] = unit doc ID  (e.g. "f4cpjpb41i")
      // row['services.name']   = same as row.name when child fields included
      // row.service_name   = service display name

      const unitId = row['services.parent'] || row.parent;
      const unitName = row.business_name;
      const serviceRowId = row['services.name'] || row.name;
      const serviceName = row.service_name;

      if (unitId && unitName) {
        unitMap[unitId] = unitName;
      }

      if (serviceRowId && serviceName) {
        svcMap[serviceRowId] = serviceName;
      }
    });

    setBusinessUnitMap(unitMap);
    setServiceMap(svcMap);
  } catch (err) {
    console.warn('Failed to fetch business units/services', err);
  }
}, []);
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await frappeApi.get('/resource/Lead', {
        params: {
          fields: `["${LEAD_FIELDS.split(',').join('","')}"]`,
          limit_page_length: 0,
          order_by: 'creation desc',
        },
      });
      const leadsWithNames = (res.data?.data || []).map((doc) => {
        const base = mapDoc(doc);
        return {
          ...base,
          businessUnit: getBusinessUnitName(doc.business_unit),
          service: getBusinessServiceName(doc.service),
        };
      });
      setLeads(leadsWithNames);
    } catch (err) {
      setError('Failed to load leads. Please check your connection or permissions.');
    } finally {
      setLoading(false);
    }
  }, [getBusinessUnitName, getBusinessServiceName]);

  useEffect(() => {
    fetchBusinessUnits();
  }, [fetchBusinessUnits]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setShowAgentContact(false);
  }, [selectedLead]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const s = searchTerm.toLowerCase();
      const matchesSearch =
        lead.clientName.toLowerCase().includes(s) ||
        lead.id.toLowerCase().includes(s) ||
        lead.agentName.toLowerCase().includes(s) ||
        lead.businessUnit.toLowerCase().includes(s);
      const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [leads, searchTerm, statusFilter]);

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
      [l.id, l.clientName, l.businessUnit, l.agentName, l.status, l.date].join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'Vynx_Master_Report.csv'; a.click();
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
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Main Lead Tracker</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
              <Activity size={12} className="text-emerald-500" /> Active Business Overview
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl flex items-center gap-3 flex-1 md:w-80 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100">
            <Search size={16} className="text-slate-400" />
            <input
              type="text" placeholder="SEARCH CUSTOMERS OR LEADS..."
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900 placeholder:text-slate-400"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleExport} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm flex justify-center">
            <Download size={18} />
          </button>
          <button onClick={fetchLeads} className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-95 shadow-sm flex justify-center" title="Refresh">
            <BarChart3 size={18} />
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
          <ChartCard title="Branch Activity" subtitle="Comparison of leads across different locations">
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
        <div className="px-5 py-4 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/20">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <LayoutGrid size={14} className="text-indigo-600" /> Lead Management Table
          </h3>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{filteredLeads.length} Records found</span>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <Filter size={10} className="text-indigo-600" />
              <select className="bg-transparent text-[9px] font-black uppercase outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Leads</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Started">Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

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
              <button onClick={fetchLeads} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Retry</button>
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
                      <span className="font-mono text-[10px] text-indigo-600 font-bold bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100">{lead.id}</span>
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
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)} className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-lg h-full relative shadow-2xl border-l border-slate-100 p-6 md:p-8 flex flex-col"
            >
              <button onClick={() => setSelectedLead(null)} className="absolute top-6 right-6 p-2 bg-slate-50 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <X size={20} />
              </button>

              <div className="space-y-6 pt-10 flex-1 overflow-y-auto pr-1">
                <header>
                  <div className="inline-flex items-center gap-2 px-2 py-1 bg-indigo-50 rounded border border-indigo-100 text-indigo-600 mb-3">
                    <Info size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Customer Profile Overview</span>
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{selectedLead.id}</h3>
                  <div className="flex items-center gap-3 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} className="text-indigo-500" /> Registration Date: {selectedLead.date}
                  </div>
                </header>

                <div className="space-y-4">
                  {/* CLIENT INFO */}
                  <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                    <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                      <User size={14} /> Client Information
                    </h5>
                    <div className="grid grid-cols-2 gap-y-4">
                      <div>
                        <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">Customer Name</span>
                        <span className="text-xs font-black text-slate-900 uppercase">{selectedLead.clientName}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">Phone</span>
                        <span className="text-xs font-bold text-slate-900">{selectedLead.clientPhone || 'Not Shared'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-400 font-black uppercase block mb-1">Email</span>
                        <span className="text-xs font-bold text-slate-900">{selectedLead.clientEmail || 'Not Shared'}</span>
                      </div>
                      {selectedLead.clientAddress && (
                        <div className="col-span-2 pt-2">
                          <span className="text-[8px] text-slate-400 font-black uppercase block mb-2">Service Location</span>
                          <div className="flex items-start gap-3 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                            <MapPin size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                            <span className="text-[10px] text-indigo-900 leading-relaxed font-bold uppercase">{selectedLead.clientAddress}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* BRANCH & STATUS */}
                  <section className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-[8px] text-slate-400 font-black uppercase mb-2">Handling Branch</p>
                      <div className="flex items-center gap-2">
                        <Building2 size={12} className="text-slate-600" />
                        <p className="text-[10px] font-black text-slate-900 uppercase">{selectedLead.businessUnit}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                      <p className="text-[8px] text-indigo-400 font-black uppercase mb-2">Current Stage</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase border shadow-sm ${statusStyles[selectedLead.status] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                        {selectedLead.status}
                      </span>
                    </div>
                  </section>

                  {/* SERVICE DATA */}
                  <section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Briefcase size={14} className="text-indigo-600" />
                      <p className="text-[9px] text-slate-400 font-black uppercase">Service Required</p>
                    </div>
                    <p className="text-sm font-black text-slate-900 uppercase mb-3 tracking-tight">{selectedLead.service}</p>
                    {selectedLead.description && (
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 italic text-[10px] text-slate-500 font-medium leading-relaxed">
                        "{selectedLead.description}"
                      </div>
                    )}
                  </section>

                  {/* VERIFICATION STATUS (read-only) */}
                  <section className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <CheckCircle size={14} className={selectedLead.verifiedByAdmin ? 'text-emerald-500' : 'text-slate-300'} />
                      <p className="text-[9px] text-slate-400 font-black uppercase">Admin Verification</p>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${selectedLead.verifiedByAdmin ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                        {selectedLead.verifiedByAdmin ? '✓ Verified by Admin' : 'Not Yet Verified'}
                      </div>
                    </div>
                    {selectedLead.verificationNotes && (
                      <div className="flex items-start gap-2 mt-3">
                        <FileText size={12} className="text-slate-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[8px] text-slate-400 font-black uppercase mb-1">Verification Notes</p>
                          <p className="text-[10px] text-slate-600 leading-relaxed">{selectedLead.verificationNotes}</p>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* AGENT CARD */}
                  <section className="relative overflow-hidden">
                    <motion.div
                      onClick={() => setShowAgentContact(!showAgentContact)}
                      className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between cursor-pointer hover:border-indigo-500 transition-all shadow-sm group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow-indigo-200 shadow-lg">
                          {selectedLead.agentName[0]}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase flex items-center gap-2">
                            Case Handled By {selectedLead.agentName}
                            <ChevronRight size={10} className={`text-indigo-500 transition-transform ${showAgentContact ? 'rotate-90' : ''}`} />
                          </p>
                          <p className="text-[8px] text-slate-400 font-mono tracking-widest mt-1 uppercase">Staff Ref: {selectedLead.agentId}</p>
                        </div>
                      </div>
                      <Globe size={16} className="text-slate-200 group-hover:text-indigo-400 transition-colors" />
                    </motion.div>
                    <AnimatePresence>
                      {showAgentContact && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="bg-indigo-50 border-x border-b border-indigo-100 rounded-b-xl overflow-hidden"
                        >
                          <div className="p-4 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="h-7 w-7 bg-white rounded-md flex items-center justify-center text-indigo-600 shadow-sm"><Mail size={14} /></div>
                              <span className="text-[10px] font-bold text-indigo-900 lowercase tracking-tight">
                                {selectedLead.agentName?.toLowerCase().replace(' ', '.')}@vynxweb.com
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-7 w-7 bg-white rounded-md flex items-center justify-center text-indigo-600 shadow-sm"><Phone size={14} /></div>
                              <span className="text-[10px] font-bold text-indigo-900">+971 00 000 0000</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </section>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <button onClick={() => setSelectedLead(null)} className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 shadow-indigo-100">
                  Return to Dashboard
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