import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Mail, Wallet, X,
  ArrowUpRight, Briefcase,
  ShieldCheck, UserX, UserCheck,
  AlertTriangle, Loader2, AlertCircle, Phone, MessageSquare, Activity, Trophy
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Mappers ──────────────────────────────────────────────────────────────────
const mapAgent = (a) => ({
  id: a.id,
  name: a.full_name || 'Unknown User',
  email: a.email || '',
  phone: a.phone || '—',
  joined: a.created_at
    ? new Date(a.created_at).toLocaleDateString()
    : '—',
  status: a.status || 'active',
  balance: a.wallet_balance || 0,
  totalLeads: a.total_leads || 0,
  avatar: a.avatar_url || '',
});

const mapLead = (l) => ({
  id: l.id,
  clientName: l.customer_name || '—',
  status: l.status || 'pending',
  agentId: l.source_user_id,
  unitName: l.business_unit?.business_name || l.business_unit_name || l.businessUnit || '—',
});

// ─── Main Component ───────────────────────────────────────────────────────────
const AgentControlApp = () => {
  const navigate = useNavigate();
  const [searchTerm,     setSearchTerm]    = useState('');
  const [selectedAgent,  setSelectedAgent] = useState(null);
  const [agents,         setAgents]        = useState([]);
  const [leads,          setLeads]         = useState([]);
  const [loading,        setLoading]       = useState(true);
  const [error,          setError]         = useState(null);
  const [togglingId,     setTogglingId]    = useState(null);

  // --- THEME INTEGRATION ---
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('get_admin_agents_dashboard');

      if (error) {
        console.error('Failed to load team data:', error);
        setError('Failed to load team data. Check your connection.');
        return;
      }

      const payload = data || {};
      setAgents((payload.agents || []).map(mapAgent));
      setLeads((payload.leads || []).map(mapLead));
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError('Failed to load team data. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Toggle active/restricted ─────────────────────────────────────────────
  const toggleAgentStatus = async (agent) => {
    const newStatus = agent.status === 'active' ? 'restricted' : 'active';
    setTogglingId(agent.id);
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', agent.id);

      if (error) {
        console.error('Failed to update agent status:', error);
        alert('Failed to update agent status. Check permissions.');
        return;
      }

      const displayStatus = newStatus === 'active' ? 'active' : 'restricted';
      setAgents(prev =>
        prev.map(a => a.id === agent.id ? { ...a, status: displayStatus } : a)
      );
      if (selectedAgent?.id === agent.id) {
        setSelectedAgent(prev => ({ ...prev, status: displayStatus }));
      }
    } catch (err) {
      console.error('Error toggling agent status:', err);
      alert('Failed to update agent status. Check permissions.');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Export CSV (Logic Kept, Button Removed per instructions) ───────────────
  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Joined', 'Status', 'Wallet Balance'];
    const rows = agents.map(a =>
      [a.id, a.name, a.email, a.phone, a.joined, a.status, a.balance].join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Radix_Agent_Report_${new Date().toLocaleDateString()}.csv`;
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

  const topAgent = useMemo(() => {
    if (!agents || agents.length === 0) return null;
    return [...agents].sort((a, b) => b.totalLeads - a.totalLeads)[0];
  }, [agents]);

  // ── Charts ────────────────────────────────────────────────────────────────
  const chartConfigs = useMemo(() => {
    const activeCount     = agents.filter(a => a.status === 'active').length;
    const restrictedCount = agents.filter(a => a.status === 'restricted').length;

    const leadCountByAgent = agents.map(a => ({
      x: a.name.split(' ')[0],
      y: leads.filter(l => l.agentId === a.id).length,
    }));

    return {
      status: {
        series:  [activeCount, restrictedCount],
        options: {
          chart:       { id: 'status-donut', animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          labels:      ['Active', 'Restricted'],
          colors:      ['#81B398', '#F0524F'],
          legend:      { position: 'bottom', fontSize: '10px', fontWeight: 800, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '70%' } }, stroke: { colors: isLight ? '#FFFFFF' : '#222938' } },
          dataLabels:  { enabled: false },
          tooltip:     { theme: isLight ? 'light' : 'dark' }
        },
      },
      performance: {
        series:  [{ name: 'Total Leads', data: leadCountByAgent.map(d => d.y) }],
        options: {
          chart:        { id: 'performance-bar', toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          colors:       ['#81B398'],
          plotOptions:  { bar: { borderRadius: 4, columnWidth: '50%' } },
          xaxis:        { categories: leadCountByAgent.map(d => d.x), labels: { style: { fontSize: '9px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } }, axisBorder: { show: false }, axisTicks: { show: false } },
          yaxis:        { labels: { style: { fontSize: '10px', fontWeight: 800, colors: isLight ? '#718096' : '#9CA3AF' } } },
          grid:         { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
          dataLabels:   { enabled: false },
          tooltip:      { theme: isLight ? 'light' : 'dark' }
        },
      },
    };
  }, [agents, leads, isLight]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <SkeletonLoader isLight={isLight} />;

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-3 text-[#F0524F] font-['Plus_Jakarta_Sans',sans-serif]">
      <AlertCircle size={28} strokeWidth={2.5} />
      <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
      <button onClick={fetchData} className="mt-2 px-6 py-2.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Retry</button>
    </div>
  );

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>

      {/* ── HEADER (FREE) ── */}
      <div className="mb-4 px-1">
        <h2 className="text-2xl font-extrabold tracking-tight mb-1">Team Directory</h2>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Active Management System</p>
      </div>

      {/* ── STATUS CARDS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
        {/* Total Agents */}
        <div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <div className="flex justify-between items-start mb-2">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Total Agents</p>
            <Users size={16} strokeWidth={2.5} className="text-[#81B398]" />
          </div>
          <h3 className="text-3xl font-extrabold tracking-tighter">{agents.length}</h3>
        </div>

        {/* Top Partner */}
        <div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <div className="flex justify-between items-start mb-3">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Top Leading Agent</p>
            <Trophy size={16} strokeWidth={2.5} className="text-[#81B398]" />
          </div>
          {topAgent ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center overflow-hidden border shrink-0 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'}`}>
                  {topAgent.avatar ? (
                    <img src={topAgent.avatar} className="w-full h-full object-cover" alt="Logo" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  ) : null}
                  <span className={`font-extrabold text-sm ${topAgent.avatar ? 'hidden' : 'flex'}`}>{topAgent.name.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold uppercase truncate">{topAgent.name}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 truncate ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{topAgent.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-extrabold text-[#81B398]">{topAgent.totalLeads}</p>
                <p className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Total Leads</p>
              </div>
            </div>
          ) : (
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No data yet</p>
          )}
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className={`p-4 rounded-3xl border flex items-center gap-3 transition-colors duration-200 mb-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Search Staff by Name or ID..."
            className={`w-full pl-12 pr-10 py-3.5 rounded-xl outline-none text-sm font-bold transition-all border ${
              isLight 
                ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]' 
                : 'bg-[#131720] border-transparent text-white placeholder:text-[#718096] focus:border-[#81B398]'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-8">
          <ChartCard title="Lead Performance" subtitle="Leads generated by each member" isLight={isLight}>
            <Chart options={chartConfigs.performance.options} series={chartConfigs.performance.series} type="bar" height={260} />
          </ChartCard>
        </div>
        <div className="lg:col-span-4">
          <ChartCard title="Security Status" subtitle="Active vs Restricted accounts" isLight={isLight}>
            <div className="flex justify-center">
              <Chart options={chartConfigs.status.options} series={chartConfigs.status.series} type="donut" width="100%" height={260} />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── AGENT GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={`border rounded-3xl p-5 transition-all duration-200 group relative flex flex-col ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#222938] border-white/10 hover:border-[#81B398]'
              }`}
            >
              <div className={`absolute top-4 right-4 px-2 py-1 text-[8px] font-bold uppercase tracking-wider rounded-lg border ${
                agent.status === 'active'
                  ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20'
                  : 'bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20'
              }`}>
                {agent.status === 'active' ? 'Active' : 'Restricted'}
              </div>

              <div className="flex flex-col items-center text-center mb-5 mt-2">
                <div className={`h-16 w-16 rounded-full mb-3 shrink-0 overflow-hidden border flex items-center justify-center font-extrabold text-xl uppercase transition-transform group-hover:scale-105 ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'
                }`}>
                  {agent.avatar ? (
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                  ) : null}
                  <span className={`${agent.avatar ? 'hidden' : 'flex'}`}>{agent.name.charAt(0)}</span>
                </div>
                <h3 className="text-sm font-extrabold uppercase tracking-tight">{agent.name}</h3>
                <p className={`text-[9px] font-bold mt-1 uppercase tracking-wider truncate max-w-full px-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{agent.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className={`p-3 rounded-2xl border text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                  <p className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Leads</p>
                  <p className="text-sm font-extrabold">{agent.totalLeads}</p>
                </div>
                <div className={`p-3 rounded-2xl border text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                  <p className={`text-[8px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Wallet</p>
                  <p className="text-sm font-extrabold text-[#81B398]">{agent.balance}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(agent)}
                className={`w-full py-3.5 border text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 mt-auto ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'
                }`}
              >
                <ArrowUpRight size={14} strokeWidth={2.5} /> View Profile
              </button>
            </div>
          ))}
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-14 w-14 rounded-full overflow-hidden border flex items-center justify-center font-extrabold text-xl uppercase ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'}`}>
                    {selectedAgent.avatar ? (
                      <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    ) : null}
                    <span className={`${selectedAgent.avatar ? 'hidden' : 'flex'}`}>{selectedAgent.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight mb-1">{selectedAgent.name}</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{selectedAgent.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className={`p-2 rounded-full transition-colors ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-white/10'}`}>
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">

                  {/* Left */}
                  <div className="space-y-6">
                    <section className={`border rounded-3xl p-5 md:p-6 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                      <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                        <Mail size={14} strokeWidth={2.5} className="text-[#81B398]" /> Personal Details
                      </h5>
                      <div className="space-y-4 mb-6">
                        <InfoItem label="Email"  value={<span className="lowercase normal-case">{selectedAgent.email}</span>} isLight={isLight} />
                        <InfoItem label="Phone"  value={selectedAgent.phone} isLight={isLight} />
                        <InfoItem label="Joined" value={selectedAgent.joined} isLight={isLight} />
                        <InfoItem label="Status" value={selectedAgent.status === 'active' ? 'Active' : 'Restricted'} isLight={isLight} />
                      </div>

                      {/* Contact Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E2E8F0] dark:border-white/10">
                        <a
                           href={`tel:${selectedAgent.phone}`}
                           className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                             isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] hover:border-[#81B398]'
                           }`}
                         >
                           <Phone size={14} strokeWidth={2.5} /> Call Now
                         </a>
                         <a
                           href={`https://wa.me/${selectedAgent.phone?.replace(/\D/g, '')}`}
                           target="_blank"
                           rel="noreferrer"
                           className="py-3 rounded-xl border border-transparent text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
                         >
                           <MessageSquare size={14} strokeWidth={2.5} /> WhatsApp
                         </a>
                      </div>
                    </section>

                    <section className={`border rounded-3xl p-5 md:p-6 ${selectedAgent.status === 'active' ? (isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10') : (isLight ? 'bg-[#F0524F]/5 border-[#F0524F]/20' : 'bg-[#F0524F]/10 border-[#F0524F]/20')}`}>
                      <div className="flex items-center gap-2 mb-5">
                        <AlertTriangle size={14} strokeWidth={2.5} className={selectedAgent.status === 'active' ? (isLight ? 'text-[#718096]' : 'text-[#9CA3AF]') : 'text-[#F0524F]'} />
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedAgent.status === 'active' ? (isLight ? 'text-[#718096]' : 'text-[#9CA3AF]') : 'text-[#F0524F]'}`}>
                          Security Controls
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAgentStatus(selectedAgent)}
                        disabled={togglingId === selectedAgent.id}
                        className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95 ${
                          selectedAgent.status === 'active'
                            ? 'bg-[#F0524F] text-white hover:bg-[#D94A48]'
                            : 'bg-[#81B398] text-white hover:bg-[#6FA085]'
                        }`}
                      >
                        {togglingId === selectedAgent.id
                          ? <><Loader2 size={16} strokeWidth={2.5} className="animate-spin"/> Updating...</>
                          : selectedAgent.status === 'active'
                            ? <><UserX size={16} strokeWidth={2.5}/> Restrict Profile</>
                            : <><UserCheck size={16} strokeWidth={2.5}/> Restore Access</>
                        }
                      </button>
                    </section>
                  </div>

                  {/* Right */}
                  <div className="space-y-6">
                    <section className={`border rounded-3xl p-5 md:p-6 relative overflow-hidden flex flex-col items-center text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#1A1A24] border-white/10'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Wallet Balance</p>
                      <h4 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-[#81B398] mb-6">
                        {selectedAgent.balance?.toLocaleString()} CR
                      </h4>
                      <button
                        onClick={() => navigate('/admin/credits')}
                        className={`w-full py-3.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 ${
                          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'
                        }`}
                      >
                        Settlement Details
                      </button>
                    </section>

                    <section className={`border rounded-3xl p-5 md:p-6 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                      <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                        <Briefcase size={14} strokeWidth={2.5} className="text-[#81B398]" /> Assigned Leads ({agentLeads.length})
                      </h5>
                      <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 no-scrollbar">
                        {agentLeads.length > 0 ? agentLeads.map((l) => (
                          <div key={l.id} className={`p-4 border rounded-2xl flex justify-between items-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#1A1A24] border-white/10'}`}>
                            <div>
                              <p className="text-xs font-extrabold uppercase tracking-tight">{l.clientName}</p>
                              <p className={`text-[9px] font-bold mt-1 uppercase tracking-wider truncate max-w-[140px] ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{l.unitName}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                              l.status === 'Verified'  ? 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20' :
                              l.status === 'Completed' ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20' :
                              l.status === 'Rejected'  ? 'bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                            }`}>
                              {l.status}
                            </span>
                          </div>
                        )) : (
                          <p className={`text-[10px] font-bold uppercase tracking-wider text-center py-4 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No customers assigned</p>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, isLight }) => (
  <div className={`rounded-3xl p-5 md:p-6 border transition-all duration-200 h-full flex flex-col ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
    <div className="mb-5">
      <h4 className="text-sm font-extrabold uppercase tracking-tight">{title}</h4>
      <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{subtitle}</p>
    </div>
    <div className="w-full flex-1 flex flex-col justify-end">{children}</div>
  </div>
);

const InfoItem = ({ label, value, isLight }) => (
  <div className={`flex justify-between items-center border-b pb-3 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{label}</span>
    <span className="text-xs font-extrabold uppercase tracking-tight">{value}</span>
  </div>
);

// ─── SKELETON LOADER ───
const SkeletonLoader = ({ isLight }) => (
  <div className="space-y-4 pt-2 pb-6 px-4 w-full animate-pulse max-w-[1600px] mx-auto">
    <div className="mb-4 px-1">
      <div className={`w-40 h-8 rounded-lg mb-2 ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
      <div className={`w-28 h-3 rounded ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4">
      <div className={`h-32 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      <div className={`h-32 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
    </div>

    <div className={`h-14 rounded-3xl border mb-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
      <div className={`col-span-12 lg:col-span-8 h-72 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      <div className={`col-span-12 lg:col-span-4 h-72 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mt-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`h-48 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      ))}
    </div>
  </div>
);

export default AgentControlApp; 