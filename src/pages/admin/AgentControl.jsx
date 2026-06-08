import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Mail, Wallet, X,
  Download, ArrowRight, Briefcase,
  UserX, UserCheck, AlertTriangle, Loader2, AlertCircle, Phone, MessageSquare, Calendar
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

// ─── Mappers ──────────────────────────────────────────────────────────────────
const mapAgent = (a) => ({
  id: a.id,
  name: a.full_name || 'Unknown User',
  email: a.email || '',
  phone: a.phone || '—',
  joined: a.created_at
    ? new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—',
  status: a.status || 'active',
  balance: a.wallet_balance || 0,
  totalLeads: a.total_leads || 0,
  avatar: a.avatar_url || '',
});

const mapLead = (l) => ({
  id: l.id,
  clientName: l.customer_name || '—',
  // Attempt to grab the business unit name, fallback to service if not directly joined
  businessUnit: l.business_name || l.business_units?.business_name || l.service || l.business_unit_services?.service_name || 'Unknown Unit',
  status: l.status || 'pending',
  agentId: l.source_user_id,
});

let agentDashboardCache = null;
let agentDashboardCacheTime = 0;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
// ─── Main Component ───────────────────────────────────────────────────────────
const AgentControl = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  const navigate = useNavigate();
  const [searchTerm,     setSearchTerm]     = useState('');
  const [selectedAgent,  setSelectedAgent]  = useState(null);
  const [agents,         setAgents]         = useState([]);
  const [leads,          setLeads]          = useState([]);
  const [loading,        setLoading]        = useState(!agentDashboardCache);
  const [error,          setError]          = useState(null);
  const [togglingId,     setTogglingId]     = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
  const now = Date.now();

  // Use cache first
  if (
    agentDashboardCache &&
    now - agentDashboardCacheTime < CACHE_DURATION
  ) {
    setAgents(agentDashboardCache.agents);
    setLeads(agentDashboardCache.leads);
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);

  try {
    const { data, error } = await supabase.rpc(
      'get_admin_agents_dashboard'
    );

    if (error) {
      setError('Failed to load team data.');
      return;
    }

    const payload = data || {};

    const mappedAgents = (payload.agents || []).map(mapAgent);
    const mappedLeads = (payload.leads || []).map(mapLead);

    // Save cache
    agentDashboardCache = {
      agents: mappedAgents,
      leads: mappedLeads,
    };

    agentDashboardCacheTime = now;

    setAgents(mappedAgents);
    setLeads(mappedLeads);
  } catch (err) {
    setError('Failed to load team data.');
  } finally {
    setLoading(false);
  }
}, []);

 useEffect(() => {
  if (agentDashboardCache) {
    setAgents(agentDashboardCache.agents);
    setLeads(agentDashboardCache.leads);
  }

  fetchData();
}, [fetchData]);

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

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Joined', 'Status', 'Ledger Balance'];
    const rows = agents.map(a =>
      [a.id, a.name, a.email, a.phone, a.joined, a.status, a.balance].join(',')
    );
    const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Radix_IBP_Manifest_${new Date().toLocaleDateString()}.csv`;
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

  // Calculate Top Agent
  const topAgent = useMemo(() => {
    if (agents.length === 0) return null;
    return agents.reduce((prev, current) => (prev.totalLeads > current.totalLeads) ? prev : current);
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
        series:  [activeCount, restrictedCount].some(v => v > 0) ? [activeCount, restrictedCount] : [1],
        options: {
          chart:       { type: 'donut', fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
          labels:      [activeCount, restrictedCount].some(v => v > 0) ? ['Active', 'Restricted'] : ['No Data'],
          colors:      ['#81B398', '#F0524F', '#718096'], // Sage Green, Coral Red
          legend:      { position: 'bottom', fontSize: '11px', fontWeight: 600, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '75%' } } },
          dataLabels:  { enabled: false },
          stroke:      { show: false },
          tooltip:     { theme: isLight ? 'light' : 'dark' }
        },
      },
      performance: {
        series:  [{ name: 'Total Projects', data: leadCountByAgent.length ? leadCountByAgent.map(d => d.y) : [0] }],
        options: {
          chart:        { type: 'bar', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
          colors:       ['#48477A'], // Muted Indigo
          plotOptions:  { bar: { borderRadius: 4, columnWidth: '35%' } },
          xaxis:        { 
            categories: leadCountByAgent.length ? leadCountByAgent.map(d => d.x) : ['N/A'], 
            labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 600 } },
            axisBorder: { show: false }, axisTicks: { show: false } 
          },
          yaxis:        { labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } } },
          grid:         { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: { lines: { show: false } }, padding: {left: 10, right: 0, bottom: 0, top: 0} },
          dataLabels:   { enabled: false },
          tooltip:      { theme: isLight ? 'light' : 'dark' }
        },
      },
    };
  }, [agents, leads, isLight]);

  const getStatusBadgeStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'verified' || s === 'approved') return 'bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20';
    if (s === 'rejected' || s === 'restricted') return 'bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20';
    if (s === 'pending') return 'bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20';
    if (s === 'active') return 'bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20';
    if (s === 'in progress' || s === 'started') return 'bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20';
    return isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5';
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0`}>
      <div className="pt-2 mb-6">
        <div className={`h-10 w-64 rounded-md mb-2 ${pulseClass} animate-pulse`} />
        <div className={`h-4 w-48 rounded-md ${pulseClass} animate-pulse`} />
      </div>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={32} className={`animate-spin ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`} />
        <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Loading Partner Network Data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 gap-4 text-[#F0524F] font-['Plus_Jakarta_Sans',sans-serif]">
      <AlertCircle size={32} />
      <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
      <button onClick={fetchData} className="mt-2 px-6 py-2 bg-[#F0524F] text-[#FFFFFF] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D44846]">Retry</button>
    </div>
  );

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-6 lg:space-y-8 max-w-[1400px] mx-auto pb-16 transition-colors duration-300 mt-2 lg:mt-4 px-4 lg:px-0 ${textPrimary}`}>

      {/* ── HEADER (Free/Borderless) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pt-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            Global Partner Network
          </h1>
          <p className={`text-sm font-medium ${textSecondary}`}>
            Manage IBP access, portfolio performance, and capital distributions.
          </p>
        </div>
        <button 
          onClick={handleExport} 
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'
          }`}
        >
          <Download size={16} /> Export Partner Ledger
        </button>
      </div>

      {/* ── TOP STATS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className={`p-6 rounded-2xl border flex flex-col justify-between h-[120px] transition-all duration-300 min-w-0 ${surfaceClass}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider truncate mr-2 ${textSecondary}`}>Active IBPs</p>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'text-[#48477A] bg-[#48477A]/10' : 'text-[#81B398] bg-[#131720]'}`}>
              <Users size={18}/>
            </div>
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight truncate">{agents.length}</h3>
        </div>

        {topAgent && (
          <div className={`p-6 rounded-2xl border flex items-center justify-between h-[120px] transition-all duration-300 min-w-0 ${surfaceClass}`}>
             <div className="min-w-0 flex-1 pr-4">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>Top Performing Partner</p>
                <h3 className="text-xl lg:text-2xl font-bold tracking-tight truncate w-full">{topAgent.name}</h3>
                <p className={`text-sm font-semibold mt-1 ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>{topAgent.totalLeads} Projects Initiated</p>
             </div>
             <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 overflow-hidden border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                {topAgent.avatar ? (
                   <img src={topAgent.avatar} alt={topAgent.name} className="w-full h-full object-cover" />
                ) : (
                   <span className="font-bold text-xl uppercase">{topAgent.name.charAt(0)}</span>
                )}
             </div>
          </div>
        )}
      </div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <ChartCard title="Partner Project Volume" subtitle="Client projects initiated by each partner." isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-8">
          <Chart options={chartConfigs.performance.options} series={chartConfigs.performance.series} type="bar" height="100%" width="100%" />
        </ChartCard>
        
        <ChartCard title="Account Clearance" subtitle="Active vs Restricted accounts" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-4">
          <Chart options={chartConfigs.status.options} series={chartConfigs.status.series} type="donut" height="100%" width="100%" />
        </ChartCard>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border transition-colors focus-within:border-[#81B398] ${surfaceClass}`}>
        <Search size={18} className={textSecondary} />
        <input
          type="text"
          placeholder="Search partner by name or IBP ID..."
          className={`w-full bg-transparent text-sm font-medium outline-none ${textPrimary} placeholder:${textSecondary}`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm("")} className={`hover:text-[#F0524F] transition-colors ${textSecondary}`}><X size={16} /></button>
        )}
      </div>

      {/* ── AGENT GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredAgents.map((agent, idx) => (
            <motion.div
              layout key={agent.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.03 }}
              className={`rounded-2xl border p-5 transition-all duration-300 relative flex flex-col ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#222938] border-white/5 hover:border-[#81B398]'
              }`}
            >
              <div className={`absolute top-4 right-4 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusBadgeStyles(agent.status)}`}>
                {agent.status}
              </div>

              <div className="flex flex-col items-center text-center mt-2 mb-5">
                <div className={`h-16 w-16 rounded-full mb-4 flex items-center justify-center shrink-0 overflow-hidden border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                  {agent.avatar
                    ? <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    : <div className="w-full h-full flex items-center justify-center font-bold text-xl uppercase">
                        {agent.name.charAt(0)}
                      </div>
                  }
                </div>
                <h3 className="text-sm font-bold tracking-tight px-2">{agent.name}</h3>
                <p className={`text-xs font-medium mt-1 truncate w-full px-4 ${textSecondary}`}>{agent.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className={`p-3 rounded-xl border text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>Projects</p>
                  <p className="text-sm font-bold">{agent.totalLeads}</p>
                </div>
                <div className={`p-3 rounded-xl border text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>Ledger</p>
                  <p className="text-sm font-bold text-[#81B398]">₹{agent.balance}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(agent)}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border mt-auto ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720] hover:border-[#81B398] hover:text-[#81B398]'
                }`}
              >
                View Partner Portfolio <ArrowRight size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col border ${surfaceClass}`}
            >
              {/* Modal Header */}
              <div className={`p-6 md:p-8 border-b flex justify-between items-center shrink-0 ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
                <div className="flex items-center gap-5">
                  <div className={`h-16 w-16 rounded-full shrink-0 overflow-hidden flex items-center justify-center border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/5 text-[#F4F5F7]'}`}>
                    {selectedAgent.avatar
                      ? <img src={selectedAgent.avatar} alt={selectedAgent.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                      : <div className="w-full h-full flex items-center justify-center font-bold text-2xl uppercase">
                          {selectedAgent.name.charAt(0)}
                        </div>
                    }
                  </div>
                  <div>
                    <h3 className={`text-2xl font-extrabold tracking-tight mb-1 ${textPrimary}`}>{selectedAgent.name}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${textSecondary}`}>
                      <Calendar size={14}/> Joined {selectedAgent.joined}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className={`p-2 rounded-lg transition-colors ${isLight ? 'text-[#718096] hover:bg-[#E2E8F0]' : 'text-[#9CA3AF] hover:bg-[#131720]'}`}>
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                  {/* Left Column */}
                  <div className="space-y-6">
                    
                    <DossierSection title="Contact Information" icon={<Mail size={16}/>} isLight={isLight} textPrimary={textPrimary} textSecondary={textSecondary}>
                      <InfoItem label="Email" value={selectedAgent.email} textPrimary={textPrimary} textSecondary={textSecondary} />
                      <div className="pt-2 mt-2 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                         <InfoItem label="Primary Phone" value={selectedAgent.phone} textPrimary={textPrimary} textSecondary={textSecondary} />
                         {selectedAgent.phone !== '—' && (
                           <div className="flex gap-3 mt-4">
                             <a 
                                href={`tel:${selectedAgent.phone}`} 
                                className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'
                                }`}
                              >
                                <Phone size={14} /> Call
                              </a>
                              <a 
                                href={`https://wa.me/${selectedAgent.phone.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex-1 py-2.5 px-4 bg-[#81B398] text-[#FFFFFF] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#6FA085]"
                              >
                                <MessageSquare size={14} /> WhatsApp
                              </a>
                           </div>
                         )}
                      </div>
                    </DossierSection>

                    <section className={`p-6 rounded-2xl border ${selectedAgent.status === 'active' ? (isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5') : (isLight ? 'bg-[#F0524F]/5 border-[#F0524F]/20' : 'bg-[#F0524F]/10 border-white/5')}`}>
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={18} className={selectedAgent.status === 'active' ? textSecondary : 'text-[#F0524F]'} />
                          <h5 className={`text-sm font-bold uppercase tracking-wider ${selectedAgent.status === 'active' ? textPrimary : 'text-[#F0524F]'}`}>
                            Security Controls
                          </h5>
                        </div>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusBadgeStyles(selectedAgent.status)}`}>
                          {selectedAgent.status}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => toggleAgentStatus(selectedAgent)}
                        disabled={togglingId === selectedAgent.id}
                        className={`w-full py-3 rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 ${
                          selectedAgent.status === 'active'
                            ? 'bg-[#F0524F] text-white hover:bg-[#D44846]'
                            : 'bg-[#81B398] text-white hover:bg-[#6FA085]'
                        }`}
                      >
                        {togglingId === selectedAgent.id
                          ? <><Loader2 size={16} className="animate-spin"/> Updating...</>
                          : selectedAgent.status === 'active'
                            ? <><UserX size={16}/> Restrict Profile</>
                            : <><UserCheck size={16}/> Restore Access</>
                        }
                      </button>
                    </section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    
                    <section className={`p-6 rounded-2xl relative overflow-hidden flex flex-col justify-center items-center text-center border ${isLight ? 'bg-[#48477A] border-[#48477A] text-[#FFFFFF]' : 'bg-[#48477A]/20 border-[#48477A]/30 text-[#FFFFFF]'}`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12"><Wallet size={120} /></div>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isLight ? 'text-[#E2E8F0]' : 'text-[#9CA3AF]'}`}>Ledger Balance</p>
                      <h4 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 z-10">
                        ₹{selectedAgent.balance?.toLocaleString()}
                      </h4>
                      <button
                        onClick={() => navigate('/admin/credits')}
                        className={`relative z-10 px-6 py-2.5 rounded-lg text-xs font-semibold transition-all ${isLight ? 'bg-[#FFFFFF] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#48477A] text-[#FFFFFF] hover:bg-[#3d3c67]'}`}
                      >
                        Manage Settlements
                      </button>
                    </section>

                    <DossierSection title={`Assigned Projects (${agentLeads.length})`} icon={<Briefcase size={16}/>} isLight={isLight} textPrimary={textPrimary} textSecondary={textSecondary}>
                      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {agentLeads.length > 0 ? agentLeads.map((l) => (
                          <div key={l.id} className={`p-4 rounded-xl border flex flex-col gap-2 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                            <div className="flex justify-between items-start">
                              <p className={`text-sm font-bold truncate pr-2 ${textPrimary}`}>{l.clientName}</p>
                              <span className={`shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase border ${getStatusBadgeStyles(l.status)}`}>
                                {l.status}
                              </span>
                            </div>
                            <p className={`text-xs font-medium truncate ${textSecondary}`}>{l.businessUnit}</p>
                          </div>
                        )) : (
                          <div className={`flex items-center justify-center py-6 border-2 border-dashed rounded-xl ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]/50' : 'border-white/5 bg-[#131720]/50'}`}>
                            <p className={`text-xs font-medium ${textSecondary}`}>No projects assigned yet.</p>
                          </div>
                        )}
                      </div>
                    </DossierSection>

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
const ChartCard = ({ title, subtitle, children, isLight, surfaceClass, className }) => {
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';

  return (
    <motion.div 
      initial={{ y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`min-w-0 p-6 lg:p-8 rounded-2xl border flex flex-col transition-all duration-300 ${surfaceClass} ${className || ''}`}
    >
      <div className="mb-6 shrink-0">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>{title}</h4>
        <p className={`text-xs font-medium mt-1 ${textSecondary}`}>{subtitle}</p>
      </div>
      <div className="w-full h-[250px] relative">
        {children}
      </div>
    </motion.div>
  );
};

const DossierSection = ({ title, icon, children, isLight, textPrimary, textSecondary }) => (
  <section className={`p-6 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
    <h5 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-4 mb-5 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'} ${textPrimary}`}>
      <span className="text-[#81B398]">{icon}</span> {title}
    </h5>
    <div className="space-y-4">{children}</div>
  </section>
);

const InfoItem = ({ label, value, textSecondary, textPrimary }) => (
  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'rgba(156, 163, 175, 0.1)' }}>
    <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>{label}</span>
    <span className={`text-sm font-bold truncate max-w-[200px] text-right ${textPrimary}`}>{value}</span>
  </div>
);

export default AgentControl;