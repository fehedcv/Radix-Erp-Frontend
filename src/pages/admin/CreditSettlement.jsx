import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Search, Wallet, X, Loader2, User,
  Phone, MessageSquare, ShieldAlert, Info, MapPin,
  Sparkles, FileImage, Shield, Zap, AlertCircle,
  Briefcase, IndianRupee
} from 'lucide-react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import frappeApi from '../../api/frappeApi';

// ─── Field maps ────────────────────────────────────────────────────────────────
const mapLedger = (ledger, lead = {}) => ({
  ledgerId:     ledger.name,
  id:           lead.name        || ledger.lead || '—',
  clientName:   lead.customer_name || '—',
  clientPhone:  lead.phone         || '',
  clientAddress:lead.client_address|| '',
  businessUnit: lead.business_unit || '—',
  service:      lead.service       || '—',
  description:  lead.description   || '',
  status:       lead.status        || '',
  agentName:    ledger.agent       || lead.source_agent || 'System',
  agentId:      ledger.agent       || 'VYNX-CORE',
  date:         ledger.creation ? ledger.creation.split(' ')[0] : '—',
  credits:      ledger.credits     || 0,
  remarks:      ledger.remarks     || '',
});

const mapWithdrawal = (doc) => ({
  id:              doc.name,
  agentName:       doc.agent             || '—',
  amount:          doc.requested_credits || 0,
  status:          doc.status            || 'Pending',
  remarks:         doc.remarks           || '',
  date:            doc.requested_on      || '—',
});

// ─── Main Component ────────────────────────────────────────────────────────────
const CreditSettlement = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Section Filters
  const [rewardSearch, setRewardSearch] = useState('');
  const [rewardFilterBU, setRewardFilterBU] = useState('');
  const [rewardFilterAgent, setRewardFilterAgent] = useState('');
  
  const [payoutSearch, setPayoutSearch] = useState('');

  // Data
  const [leads,         setLeads]         = useState([]);
  const [withdrawals,   setWithdrawals]   = useState([]);
  const [loadingLeads,  setLoadingLeads]  = useState(true);
  const [loadingWD,     setLoadingWD]     = useState(true);
  const [errorLeads,    setErrorLeads]    = useState(null);
  const [errorWD,       setErrorWD]       = useState(null);

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

  const fetchBusinessUnits = useCallback(async () => {
    try {
      const res = await frappeApi.get('/resource/Business Unit', {
        params: {
          fields: JSON.stringify(['name', 'business_name', 'services.service_name', 'services.name']),
          limit_page_length: 0,
        },
      });
      const unitMap = {};
      const svcMap = {};
      (res.data?.data || []).forEach((unit) => {
        if (unit.name) {
          unitMap[unit.name] = unit.business_name || unit.name;
        }

        const serviceId = unit['services.name'] || unit.services?.name;
        const serviceName = unit['services.service_name'] || unit.service_name || unit.services?.service_name;

        if (serviceId && serviceName) {
          svcMap[serviceId] = serviceName;
          svcMap[serviceName] = serviceName;
        } else if (serviceName) {
          svcMap[serviceName] = serviceName;
        }
      });
      setBusinessUnitMap(unitMap);
      setServiceMap(svcMap);
    } catch (err) {
      console.warn('Failed to fetch business units', err);
    }
  }, []);

  // Modal state
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [activeModal,   setActiveModal]   = useState(null);
  const [settleAmount,  setSettleAmount]  = useState('');
  const [settleRemarks, setSettleRemarks] = useState('');
  const [isProcessing,  setIsProcessing]  = useState(false);

  // ── Fetch Leads (Verified + Completed, credits not yet assigned) ────────────
  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    setErrorLeads(null);
    try {
      const ledgerRes = await frappeApi.get('/resource/Agent Credit Ledger', {
        params: {
          fields: JSON.stringify(['name', 'agent', 'lead', 'credits', 'status', 'remarks', 'creation']),
          filters: JSON.stringify([['status', '=', 'Pending']]),
          limit_page_length: 0,
          order_by: 'creation desc',
        },
      });

      const ledgers = ledgerRes.data?.data || [];
      if (ledgers.length === 0) { setLeads([]); return; }

      const leadIds = [...new Set(ledgers.map(l => l.lead).filter(Boolean))];

      const leadResults = await Promise.all(
        leadIds.map(id =>
          frappeApi.get(`/resource/Lead/${id}`, {
            params: { fields: JSON.stringify(['name','customer_name','phone','client_address','business_unit','service','description','status','source_agent']) }
          }).then(r => r.data?.data).catch(() => null)
        )
      );

      const leadMap = {};
      leadResults.forEach(doc => { if (doc?.name) leadMap[doc.name] = doc; });

      const all = ledgers.map(ledger => {
        const lead = leadMap[ledger.lead] || {};
        const mapped = mapLedger(ledger, lead);
        return {
          ...mapped,
          businessUnit: getBusinessUnitName(lead.business_unit),
          service:      getBusinessServiceName(lead.service),
        };
      });

      setLeads(all);
    } catch {
      setErrorLeads('Failed to load reward queue.');
    } finally {
      setLoadingLeads(false);
    }
  }, [getBusinessUnitName, getBusinessServiceName]);

  // ── Fetch Withdrawal Requests ───────────────────────────────────────────────
  const fetchWithdrawals = useCallback(async () => {
    setLoadingWD(true);
    setErrorWD(null);
    try {
      const res = await frappeApi.get('/resource/Agent Withdrawal Request', {
        params: {
          fields: JSON.stringify([
            'name','agent','requested_credits',
            'status','remarks','requested_on'
          ]),
          limit_page_length: 0,
          order_by: 'requested_on desc',
        },
      });
      setWithdrawals((res.data?.data || []).map(mapWithdrawal));
    } catch {
      setErrorWD('Failed to load withdrawal requests.');
    } finally {
      setLoadingWD(false);
    }
  }, []);

  useEffect(() => { fetchBusinessUnits(); }, [fetchBusinessUnits]);
  useEffect(() => { fetchLeads();       }, [fetchLeads]);
  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  // ── Assign Credits ──────────────────────────────────────────────────────────
  const handleLeadSettlement = async () => {
    if (!settleAmount) return;
    setIsProcessing(true);
    try {
      const searchRes = await frappeApi.get('/resource/Agent Credit Ledger', {
        params: {
          fields: JSON.stringify(['name','lead','credits','status']),
          filters: JSON.stringify([['lead', '=', selectedItem.id]]),
          limit_page_length: 1,
        },
      });

      const ledgerDocs = searchRes.data?.data || [];
      if (ledgerDocs.length === 0) {
        alert('No Agent Credit Ledger record found for this lead. Please check Frappe.');
        setIsProcessing(false);
        return;
      }

      const ledgerName = ledgerDocs[0].name;

      await frappeApi.put(`/resource/Agent Credit Ledger/${ledgerName}`, {
        credits: parseInt(settleAmount),
        status:  'Approved',
        ...(settleRemarks ? { remarks: settleRemarks } : {}),
      });

      setLeads(prev => prev.filter(l => l.id !== selectedItem.id));
      closeAllModals();
    } catch {
      alert('Failed to assign credits. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Approve Withdrawal ──────────────────────────────────────────────────────
  const confirmWithdrawal = async () => {
    setIsProcessing(true);
    try {
      await frappeApi.put(
        `/resource/Agent Withdrawal Request/${selectedItem.id}`,
        { 
          status: 'Credited',
          ...(settleRemarks ? { remarks: settleRemarks } : {}) 
        }
      );
      setWithdrawals(prev =>
        prev.map(w => w.id === selectedItem.id ? { ...w, status: 'Approved' } : w)
      );
      closeAllModals();
    } catch {
      alert('Failed to approve withdrawal. Check permissions.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeAllModals = () => {
    setSelectedItem(null);
    setActiveModal(null);
    setSettleAmount('');
    setSettleRemarks('');
  };

  // ── Unique Filters Extraction ───────────────────────────────────────────────
  const uniqueBUs = useMemo(() => [...new Set(leads.map(l => l.businessUnit))].filter(Boolean), [leads]);
  const uniqueRewardAgents = useMemo(() => [...new Set(leads.map(l => l.agentName))].filter(Boolean), [leads]);

  // ── Filtering Logic ─────────────────────────────────────────────────────────
  const filteredRewards = useMemo(() => {
    const term = rewardSearch.toLowerCase();
    return leads.filter(l => {
      const matchesSearch = l.clientName.toLowerCase().includes(term) || l.id.toLowerCase().includes(term);
      const matchesBU = rewardFilterBU ? l.businessUnit === rewardFilterBU : true;
      const matchesAgent = rewardFilterAgent ? l.agentName === rewardFilterAgent : true;
      return matchesSearch && matchesBU && matchesAgent;
    });
  }, [leads, rewardSearch, rewardFilterBU, rewardFilterAgent]);

  const filteredPayouts = useMemo(() => {
    const term = payoutSearch.toLowerCase();
    return withdrawals.filter(w => 
      w.agentName.toLowerCase().includes(term) || w.id.toLowerCase().includes(term)
    );
  }, [withdrawals, payoutSearch]);

  // ── Charts ──────────────────────────────────────────────────────────────────
  const chartConfigs = useMemo(() => {
    const dateCounts = leads.reduce((acc, l) => {
      acc[l.date] = (acc[l.date] || 0) + 1;
      return acc;
    }, {});
    const sortedDates = Object.keys(dateCounts).sort().slice(-7);

    return {
      payouts: {
        series: [{ name: 'System Activity', data: sortedDates.map(d => dateCounts[d]) }],
        options: {
          chart: { id: 'payout-chart', toolbar: { show: false } },
          colors: ['#2563EB'],
          stroke: { curve: 'smooth', width: 3 },
          xaxis: {
            categories: sortedDates.map(d => d.split('-').slice(1).join('/')),
            labels: { style: { fontSize: '10px' } },
          },
          fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0 } },
        },
      },
      distribution: {
        series: [
          leads.length,
          withdrawals.filter(w => w.status === 'Pending').length,
          withdrawals.filter(w => w.status === 'Approved').length,
        ],
        options: {
          chart: { id: 'dist-chart' },
          labels: ['Unpaid Rewards', 'Pending Withdrawals', 'Settled'],
          colors: ['#3B82F6', '#F59E0B', '#10B981'],
          legend: { position: 'bottom', fontFamily: 'Plus Jakarta Sans', fontSize: '10px', fontWeight: 600 },
          plotOptions: { pie: { donut: { size: '75%' } } },
        },
      },
    };
  }, [leads, withdrawals]);

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-8 pb-10 max-w-[1600px] mx-auto px-4 md:px-0">

      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white border border-slate-200 p-4 md:p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Credit Hub</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
              <Sparkles size={12} className="text-blue-500" /> Active Settlement Management
            </p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <StatPill
            label="Unpaid Rewards"
            value={loadingLeads ? '…' : leads.length}
            color="text-blue-600" bg="bg-blue-50"
          />
          <StatPill
            label="Withdrawals"
            value={loadingWD ? '…' : withdrawals.filter(w => w.status === 'Pending').length}
            color="text-amber-600" bg="bg-amber-50"
          />
        </div>
      </motion.div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-8">
          <ChartCard
            title="Daily Settlement Flow" subtitle="System inquiry volume analytics"
            onDownload={() => ApexCharts.exec('payout-chart', 'downloadPNG')}
          >
            <Chart options={chartConfigs.payouts.options} series={chartConfigs.payouts.series} type="area" height={220} />
          </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ChartCard
            title="Fund Status" subtitle="Breakdown of pending vs paid"
            onDownload={() => ApexCharts.exec('dist-chart', 'downloadPNG')}
          >
            <div className="flex justify-center pt-2">
              <Chart options={chartConfigs.distribution.options} series={chartConfigs.distribution.series} type="donut" width="100%" height={220} />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── REWARD QUEUE SECTION ── */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600" size={20} />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Reward Queue</h3>
          </div>
        </div>

        {/* Reward Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 focus-within:border-blue-300 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text" placeholder="Search Client or Lead ID..."
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900"
              value={rewardSearch} onChange={(e) => setRewardSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 focus-within:border-blue-300 transition-all">
            <Briefcase size={14} className="text-slate-400" />
            <select
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900 cursor-pointer"
              value={rewardFilterBU} onChange={(e) => setRewardFilterBU(e.target.value)}
            >
              <option value="">All Branches</option>
              {uniqueBUs.map(bu => <option key={bu} value={bu}>{bu}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 focus-within:border-blue-300 transition-all">
            <User size={14} className="text-slate-400" />
            <select
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900 cursor-pointer"
              value={rewardFilterAgent} onChange={(e) => setRewardFilterAgent(e.target.value)}
            >
              <option value="">All Agents</option>
              {uniqueRewardAgents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
            </select>
          </div>
        </div>

        {/* Reward Cards Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loadingLeads ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 bg-white border border-slate-200 rounded-xl">
              <Loader2 size={26} className="animate-spin text-blue-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading Queue...</p>
            </div>
          ) : errorLeads ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400 bg-white border border-red-100 rounded-xl">
              <AlertCircle size={26} />
              <p className="text-[10px] font-black uppercase tracking-widest">{errorLeads}</p>
              <button onClick={fetchLeads} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Retry</button>
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-300 bg-white border border-slate-200 rounded-xl">
              <Sparkles size={28} />
              <p className="text-[10px] font-black uppercase tracking-widest">No pending rewards found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRewards.map((item) => {
                // Hardcoded Dummy Financial Data as requested
                const dummyTotal = 10000;
                const dummyCommission = 1000;
                const dummyAgentCredit = 9000;

                return (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-blue-200 transition-all group">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase tracking-widest">{item.id}</span>
                        <h4 className="mt-2.5 text-sm font-black text-slate-900 uppercase tracking-tight">{item.clientName}</h4>
                      </div>
                      <div className="h-8 w-8 rounded bg-slate-900 text-white flex items-center justify-center text-xs font-black uppercase shrink-0 shadow-sm">
                        {item.agentName?.[0]}
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3 border border-slate-100">
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Briefcase size={10}/> Branch</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase truncate" title={item.businessUnit}>{item.businessUnit}</p>
                      </div>
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap size={10}/> Service</p>
                        <p className="text-[10px] font-black text-blue-500 uppercase truncate" title={item.service}>{item.service}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><User size={10}/> Staff Member</p>
                        <p className="text-[10px] font-black text-slate-700 uppercase truncate">{item.agentName}</p>
                      </div>
                    </div>

                    {/* Financial Breakdown Section - Card View (Hidden Total Amount for Admin) */}
                    <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Admin Commission</span>
                        <span className="text-[10px] font-black text-amber-600">₹{dummyCommission.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-emerald-200/50">
                        <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                          <Wallet size={10}/> Agent Credit (1 CR = 1 INR)
                        </span>
                        <span className="text-[11px] font-black text-emerald-600">{dummyAgentCredit.toLocaleString()} CR</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-1 flex justify-end gap-2">
                      <button
                        onClick={() => { 
                          setSelectedItem({ ...item, dummyTotal, dummyCommission, dummyAgentCredit }); 
                          setActiveModal('case-review'); 
                        }}
                        className="flex-1 py-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white flex justify-center items-center gap-1.5 transition-all"
                      >
                        <Info size={12}/> Info
                      </button>
                      <button
                        onClick={() => { 
                          setSelectedItem({ ...item, dummyTotal, dummyCommission, dummyAgentCredit }); 
                          setSettleAmount(dummyAgentCredit); 
                          setActiveModal('verify'); 
                        }}
                        className="flex-1 py-2.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
                      >
                        Verify CR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── AGENT PAYOUTS SECTION ── */}
      <section className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="text-emerald-600" size={20} />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Agent Payouts</h3>
          </div>
          
          {/* Payout Filters */}
          <div className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl flex items-center gap-3 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text" placeholder="Search Agent or Request ID..."
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900"
              value={payoutSearch} onChange={(e) => setPayoutSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Payout Cards Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {loadingWD ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400 bg-white border border-slate-200 rounded-xl">
              <Loader2 size={26} className="animate-spin text-emerald-400" />
              <p className="text-[10px] font-black uppercase tracking-widest">Loading Payouts...</p>
            </div>
          ) : errorWD ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400 bg-white border border-red-100 rounded-xl">
              <AlertCircle size={26} />
              <p className="text-[10px] font-black uppercase tracking-widest">{errorWD}</p>
              <button onClick={fetchWithdrawals} className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase">Retry</button>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-300 bg-white border border-slate-200 rounded-xl">
              <Wallet size={28} />
              <p className="text-[10px] font-black uppercase tracking-widest">No withdrawal requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPayouts.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4 hover:shadow-md hover:border-emerald-200 transition-all">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded text-[9px] font-black uppercase tracking-widest">{item.id}</span>
                      <h4 className="mt-2.5 text-sm font-black text-slate-900 uppercase tracking-tight">{item.agentName}</h4>
                    </div>
                    <span className={`px-2 py-1 rounded text-[8px] font-black uppercase border ${item.status === 'Approved' || item.status === 'Credited' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : item.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-3 border border-slate-100 items-center">
                    <div>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Sparkles size={10}/> Claim Amount</p>
                      <p className="text-lg font-black text-slate-900 tracking-tighter leading-none">{item.amount?.toLocaleString()} CR</p>
                      <p className="text-[8px] font-bold text-emerald-600 tracking-widest mt-1">(= ₹{item.amount?.toLocaleString()})</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Requested On</p>
                       <p className="text-[10px] font-bold text-slate-600">{item.date}</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-1 flex justify-end gap-2">
                    <button
                      onClick={() => { setSelectedItem(item); setActiveModal('agent-payout-info'); }}
                      className="flex-1 py-2.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white flex justify-center items-center gap-1.5 transition-all"
                    >
                      <Info size={12}/> Info
                    </button>
                    {item.status === 'Pending' ? (
                      <button
                        onClick={() => { setSelectedItem(item); setActiveModal('payout'); }}
                        className="flex-1 py-2.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20"
                      >
                        Process
                      </button>
                    ) : (
                      <div className="flex-1 py-2.5 text-emerald-600 text-[9px] font-black uppercase tracking-widest bg-emerald-50 rounded-lg border border-emerald-100 flex justify-center items-center gap-1.5">
                        <CheckCircle2 size={12}/> Settled
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {activeModal && selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-xl relative shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 shrink-0">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-blue-600"/>
                  {activeModal === 'agent-payout-info' ? 'Agent Withdrawal Info'
                    : activeModal === 'verify'       ? 'Verify Agent Credits'
                    : activeModal === 'payout'       ? 'Process Manual Payout'
                    : 'Case Review Summary'}
                </h3>
                <button onClick={closeAllModals} className="p-1.5 bg-white rounded-lg hover:bg-slate-100 transition-colors"><X size={18}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

                {/* Case Review - Full details including Financials */}
                {activeModal === 'case-review' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Financial Breakdown - Shows Full Details on Info click */}
                    <section className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3 md:col-span-3">
                       <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2 border-emerald-100 flex items-center gap-1.5"><IndianRupee size={12}/> Financial Breakdown</p>
                       <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Total Lead Amount</p>
                            <p className="text-lg font-black text-slate-900">₹{selectedItem.dummyTotal?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div className="border-x border-emerald-200/50">
                            <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Admin Commission</p>
                            <p className="text-lg font-black text-amber-600">₹{selectedItem.dummyCommission?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[8px] text-emerald-700 font-bold uppercase mb-1">Agent Credit</p>
                            <p className="text-lg font-black text-emerald-600">{selectedItem.dummyAgentCredit?.toLocaleString() || 'N/A'} CR</p>
                          </div>
                       </div>
                    </section>

                    <section className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                      <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">Client Details</p>
                      <p className="text-xs font-black text-slate-900 uppercase">{selectedItem.clientName}</p>
                      <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold"><Phone size={10}/> {selectedItem.clientPhone || 'N/A'}</div>
                      <div className="flex items-start gap-2 text-[9px] text-slate-500 font-bold"><MapPin size={10} className="shrink-0"/> {selectedItem.clientAddress || 'N/A'}</div>
                    </section>

                    <section className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                      <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2">Business Branch</p>
                      <p className="text-xs font-black text-slate-900 uppercase">{selectedItem.businessUnit}</p>
                      <p className="text-[9px] font-bold text-emerald-600 uppercase">{selectedItem.service}</p>
                      <p className="text-[9px] text-slate-400 italic leading-relaxed">"{selectedItem.description}"</p>
                    </section>

                    <section className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                      <p className="text-[7px] font-black text-blue-400 uppercase tracking-widest border-b pb-2 border-blue-100">Sourced By</p>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-600 text-white rounded flex items-center justify-center font-black text-xs uppercase">{selectedItem.agentName?.[0]}</div>
                        <div>
                          <p className="text-[10px] font-black text-blue-900 uppercase">{selectedItem.agentName}</p>
                          <p className="text-[7px] font-bold text-blue-400 uppercase">ID: {selectedItem.agentId}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <a href={`tel:${selectedItem.clientPhone}`} className="flex-1 py-1.5 bg-white rounded text-[7px] font-black uppercase text-center border border-blue-200">Call</a>
                        <a href={`https://wa.me/${selectedItem.clientPhone}`} target="_blank" rel="noreferrer" className="flex-1 py-1.5 bg-emerald-500 text-white rounded text-[7px] font-black uppercase text-center">WhatsApp</a>
                      </div>
                    </section>
                  </div>
                )}

                {/* Agent Payout Info */}
                {activeModal === 'agent-payout-info' && (
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-lg mb-4 uppercase">{selectedItem.agentName?.[0]}</div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedItem.agentName}</h3>
                      <p className="text-[9px] text-emerald-600 font-black uppercase mt-1 tracking-widest">REF: {selectedItem.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Requested Amount</p>
                        <p className="text-base font-black text-emerald-600">₹{selectedItem.amount?.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Status</p>
                        <p className={`text-base font-black ${selectedItem.status === 'Approved' || selectedItem.status === 'Credited' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedItem.status}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-left p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                      <InfoItem label="Requested On" value={selectedItem.date} />
                      {selectedItem.remarks && <InfoItem label="Admin Remarks / Ref" value={selectedItem.remarks} />}
                    </div>
                  </div>
                )}

                {/* Assign CR / Verify Credit */}
                {activeModal === 'verify' && (
                  <div className="max-w-md mx-auto space-y-5">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Verifying credits for</p>
                      <p className="text-sm font-black text-slate-900 uppercase">{selectedItem.clientName}</p>
                      <p className="text-[9px] text-blue-500 font-bold mt-0.5">via Agent: {selectedItem.agentName}</p>
                    </div>
                    <div className="p-6 bg-slate-900 rounded-2xl text-white text-center shadow-xl">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Verify & Adjust Credit Points</p>
                      <div className="flex items-center justify-center gap-4">
                        <input
                          type="number" autoFocus placeholder="000"
                          className="bg-transparent text-5xl font-black text-white outline-none w-48 text-center placeholder:text-slate-700"
                          value={settleAmount} onChange={(e) => setSettleAmount(e.target.value)}
                        />
                        <span className="text-3xl font-black text-blue-400">CR</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin Remarks (optional)</label>
                      <textarea
                        rows={2} placeholder="Add a note or reason for modification..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none"
                        value={settleRemarks} onChange={(e) => setSettleRemarks(e.target.value)}
                      />
                    </div>
                    <button
                      disabled={isProcessing || !settleAmount}
                      onClick={handleLeadSettlement}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : 'Verify & Transfer to Agent Wallet'}
                    </button>
                  </div>
                )}

                {/* Process Manual Payout */}
                {activeModal === 'payout' && (
                  <div className="text-center space-y-5 py-2 max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner"><Wallet size={32}/></div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Process Manual Payout</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed px-2">
                        Please transfer <b className="text-slate-900 font-black">₹{selectedItem.amount?.toLocaleString()}</b> manually to <b className="text-emerald-600 font-black uppercase">{selectedItem.agentName}</b> via GPay, WhatsApp, or Bank Transfer.
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                       <p className="text-[9px] font-black text-amber-800 uppercase flex items-center gap-1.5 mb-2"><AlertCircle size={12}/> Admin Action Required</p>
                       <p className="text-[10px] text-amber-700 leading-relaxed">Ensure the payment is successfully completed before confirming. This action will permanently update the withdrawal status in the system.</p>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Transaction Reference (Optional)</label>
                      <input
                        type="text" placeholder="e.g. UTR or GPay Ref..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                        value={settleRemarks} onChange={(e) => setSettleRemarks(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={confirmWithdrawal}
                      className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
                    >
                      {isProcessing ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : 'Confirm Payment & Approve'}
                    </button>
                  </div>
                )}

              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
                <button onClick={closeAllModals} className="px-10 py-3 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 transition-all active:scale-95 shadow-md">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, onDownload }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full relative group">
    <div className="mb-4 flex justify-between items-start">
      <div>
        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{title}</h4>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{subtitle}</p>
      </div>
      <button onClick={onDownload} className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all">
        <FileImage size={14}/>
      </button>
    </div>
    <div className="w-full flex-1">{children}</div>
  </div>
);

const StatPill = ({ label, value, color, bg }) => (
  <div className={`${bg} border border-current/5 px-5 py-2.5 rounded-xl text-center min-w-[120px] shadow-sm`}>
    <p className={`text-[7px] font-black uppercase tracking-widest ${color}`}>{label}</p>
    <p className="text-lg font-black leading-none mt-1.5 text-slate-900 tracking-tighter">{value}</p>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-end border-b border-slate-50 pb-1.5 pt-1">
    <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">{label}</span>
    <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate ml-2">{value}</span>
  </div>
);

export default CreditSettlement;