import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Mail, Wallet, X,
  Download, ArrowUpRight, Briefcase,
  ShieldCheck, UserX, UserCheck,
  AlertTriangle, Loader2, AlertCircle
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';

// ─── Mappers ──────────────────────────────────────────────────────────────────
const mapAgent = (a) => ({
  id:      a.name,                          // email is the doc name/key
  name:    a.full_name || a.name,
  email:   a.email     || a.name,
  phone:   a.phone     || '—',
  joined:  a.creation  ? a.creation.split(' ')[0] : '—',
  status:  a.enabled === 1 ? 'Active' : 'Restricted',
  balance: a.wallet_balance || 0,
});

const mapLead = (l) => ({
  id:         l.name,
  clientName: l.customer_name || '—',
  status:     l.status        || '—',
  agentId:    l.source_agent  || '',   // matches agent.id (email)
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AgentControl = () => {
  const navigate = useNavigate();
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedAgent,  setSelectedAgent]  = useState(null);
  const [agents,         setAgents]         = useState([]);
  const [leads,          setLeads]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [togglingId,     setTogglingId]     = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await frappeApi.get('/method/business_chain.api.admin.get_team_data');
      const payload = res.data?.message || {};
      setAgents((payload.agents || []).map(mapAgent));
      setLeads((payload.leads   || []).map(mapLead));
    } catch {
      setError('Failed to load team data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Toggle enabled/restricted ─────────────────────────────────────────────
  const toggleAgentStatus = async (agent) => {
    const newEnabled = agent.status === 'Active' ? 0 : 1;
    setTogglingId(agent.id);
    try {
      await frappeApi.put(`/resource/User/${encodeURIComponent(agent.id)}`, {
        enabled: newEnabled,
      });
      const newStatus = newEnabled === 1 ? 'Active' : 'Restricted';
      setAgents(prev =>
        prev.map(a => a.id === agent.id ? { ...a, status: newStatus } : a)
      );
      if (selectedAgent?.id === agent.id) {
        setSelectedAgent(prev => ({ ...prev, status: newStatus }));
      }
    } catch {
      alert('Failed to update agent status. Check permissions.');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Joined', 'Status', 'Wallet Balance'];
    const rows = agents.map(a =>
      [a.id, a.name, a.email, a.phone, a.joined, a.status, a.balance].join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Staff_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const filteredAgents = useMemo(() =>
    agents.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  [agents, searchTerm]);

  const agentLeads = useMemo(() =>
    selectedAgent ? leads.filter(l => l.agentId === selectedAgent.id) : [],
  [selectedAgent, leads]);

  // ── Charts ────────────────────────────────────────────────────────────────
  const chartConfigs = useMemo(() => {
    const activeCount     = agents.filter(a => a.status === 'Active').length;
    const restrictedCount = agents.filter(a => a.status === 'Restricted').length;

    const leadCountByAgent = agents.map(a => ({
      x: a.name.split(' ')[0],
      y: leads.filter(l => l.agentId === a.id).length,
    }));

    return {
      status: {
        series:  [activeCount, restrictedCount],
        options: {
          chart:       { id: 'status-donut' },
          labels:      ['Active', 'Restricted'],
          colors:      ['#2563EB', '#EF4444'],
          legend:      { position: 'bottom', fontSize: '10px', fontWeight: 700 },
          plotOptions: { pie: { donut: { size: '70%' } } },
          dataLabels:  { enabled: false },
          stroke:      { width: 0 },
        },
      },
      performance: {
        series:  [{ name: 'Total Leads', data: leadCountByAgent.map(d => d.y) }],
        options: {
          chart:        { id: 'performance-bar', toolbar: { show: false } },
          colors:       ['#4F46E5'],
          plotOptions:  { bar: { borderRadius: 4, columnWidth: '50%' } },
          xaxis:        { categories: leadCountByAgent.map(d => d.x), labels: { style: { fontSize: '10px', fontWeight: 700 } } },
          grid:         { borderColor: '#F1F5F9' },
        },
      },
    };
  }, [agents, leads]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-slate-400 font-['Plus_Jakarta_Sans',sans-serif]">
      <Loader2 size={28} className="animate-spin text-blue-400" />
      <p className="text-[10px] font-black uppercase tracking-widest">Loading Team Data...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-red-400 font-['Plus_Jakarta_Sans',sans-serif]">
      <AlertCircle size={28} />
      <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
      <button onClick={fetchData} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Retry</button>
    </div>
  );

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-5 max-w-[1600px] mx-auto">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">Team Directory</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-blue-500" /> Active Management System
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg flex items-center gap-3 flex-1 md:w-64">
            <Search size={14} className="text-slate-400" />
            <input
              type="text" placeholder="SEARCH STAFF..."
              className="bg-transparent outline-none text-[9px] font-black uppercase tracking-widest w-full text-slate-900 placeholder:text-slate-300"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={handleExport} className="bg-blue-600 hover:bg-slate-900 text-white p-2.5 rounded-lg shadow-md transition-all active:scale-95 shrink-0">
            <Download size={16} />
          </button>
        </div>
      </motion.div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <ChartCard title="Lead Performance" subtitle="Leads generated by each member">
            <Chart options={chartConfigs.performance.options} series={chartConfigs.performance.series} type="bar" height={220} />
          </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ChartCard title="Security Status" subtitle="Active vs Restricted accounts">
            <div className="flex justify-center">
              <Chart options={chartConfigs.status.options} series={chartConfigs.status.series} type="donut" width="100%" height={220} />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── AGENT GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence>
          {filteredAgents.map((agent, idx) => (
            <motion.div
              layout key={agent.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-500 transition-all group relative shadow-sm"
            >
              <div className={`absolute top-3 right-3 px-2 py-0.5 text-[7px] font-black uppercase rounded border ${
                agent.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>
                {agent.status}
              </div>

              <div className="flex flex-col items-center text-center mb-4">
                <div className="h-14 w-14 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-xl mb-3 shadow-md group-hover:bg-blue-600 transition-colors">
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{agent.name}</h3>
                <p className="text-[8px] text-slate-400 font-bold mt-0.5 uppercase tracking-widest truncate max-w-full px-2">{agent.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                  <p className="text-[7px] text-slate-400 font-black uppercase mb-0.5">Leads</p>
                  <p className="text-xs font-black text-slate-900">
                    {leads.filter(l => l.agentId === agent.id).length}
                  </p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 text-center">
                  <p className="text-[7px] text-slate-400 font-black uppercase mb-0.5">Wallet</p>
                  <p className="text-xs font-black text-blue-600">{agent.balance} CR</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(agent)}
                className="w-full py-2.5 bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <ArrowUpRight size={12} /> Profile Details
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/50">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-lg md:text-xl shadow-md shrink-0">
                    {selectedAgent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tighter leading-none">{selectedAgent.name}</h3>
                    <p className="text-[8px] md:text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">{selectedAgent.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all shadow-sm">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Left */}
                  <div className="space-y-6">
                    <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h5 className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Mail size={12} /> Personal Details
                      </h5>
                      <div className="space-y-3">
                        <InfoItem label="Email"  value={selectedAgent.email} />
                        <InfoItem label="Phone"  value={selectedAgent.phone} />
                        <InfoItem label="Joined" value={selectedAgent.joined} />
                        <InfoItem label="Status" value={selectedAgent.status} />
                      </div>
                    </section>

                    <section className={`p-5 rounded-xl border ${selectedAgent.status === 'Active' ? 'bg-slate-50 border-slate-200' : 'bg-red-50 border-red-100'}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <AlertTriangle size={16} className={selectedAgent.status === 'Active' ? 'text-slate-600' : 'text-red-600'} />
                        <p className={`text-[9px] font-black uppercase tracking-widest ${selectedAgent.status === 'Active' ? 'text-slate-600' : 'text-red-600'}`}>
                          Security Controls
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAgentStatus(selectedAgent)}
                        disabled={togglingId === selectedAgent.id}
                        className={`w-full py-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60 ${
                          selectedAgent.status === 'Active'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {togglingId === selectedAgent.id
                          ? <><Loader2 size={14} className="animate-spin"/> Updating...</>
                          : selectedAgent.status === 'Active'
                            ? <><UserX size={14}/> Restrict Profile</>
                            : <><UserCheck size={14}/> Restore Access</>
                        }
                      </button>
                    </section>
                  </div>

                  {/* Right */}
                  <div className="space-y-6">
                    <section className="p-5 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Wallet size={100} /></div>
                      <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Wallet Balance</p>
                      <h4 className="text-2xl md:text-3xl font-black text-white tracking-tighter mb-8">
                        {selectedAgent.balance?.toLocaleString()} CR
                      </h4>
                      <button
                        onClick={() => navigate('/admin/credits')}
                        className="w-full relative z-10 py-2.5 bg-white text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
                      >
                        Settlement Details
                      </button>
                    </section>

                    <section className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                      <h5 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Briefcase size={12} className="text-blue-600" /> Customers ({agentLeads.length})
                      </h5>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {agentLeads.length > 0 ? agentLeads.map((l) => (
                          <div key={l.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-900 uppercase">{l.clientName}</p>
                            <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase border ${
                              l.status === 'Verified'  ? 'bg-blue-50 text-blue-600 border-blue-100' :
                              l.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              l.status === 'Rejected'  ? 'bg-red-50 text-red-600 border-red-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                        )) : (
                          <p className="text-[9px] text-slate-400 italic py-4 text-center">No customers assigned</p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="w-full md:w-auto px-10 py-3 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                >
                  Close HUB
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full">
    <div className="mb-4">
      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{title}</h4>
      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{subtitle}</p>
    </div>
    <div className="w-full flex-1">{children}</div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-end border-b border-slate-50 pb-1.5">
    <span className="text-[8px] text-slate-400 font-black uppercase">{label}</span>
    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate ml-4">{value}</span>
  </div>
);

export default AgentControl;