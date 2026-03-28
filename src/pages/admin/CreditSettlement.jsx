import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Search, Wallet, X, Loader2, User,
  Phone, MessageSquare, ShieldAlert, Info, MapPin,
  Sparkles, FileImage, Shield, Zap, AlertCircle
} from 'lucide-react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import frappeApi from '../../api/frappeApi';

// ─── Field maps ────────────────────────────────────────────────────────────────
// Replace mapLead with this
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
  agentName:       doc.agent            || '—',
  amount:          doc.requested_credits || 0,
  status:          doc.status           || 'Pending',
  remarks:         doc.remarks          || '',
  date:            doc.requested_on     || '—',
});

// ─── Main Component ────────────────────────────────────────────────────────────
const CreditSettlement = () => {
  const [activeSubTab,  setActiveSubTab]  = useState('settlements');
  const [searchTerm,    setSearchTerm]    = useState('');

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
    // Step 1: Fetch all Pending Agent Credit Ledger records
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

    // Step 2: Fetch the linked Lead docs in parallel
    const leadIds = [...new Set(ledgers.map(l => l.lead).filter(Boolean))];

    const leadResults = await Promise.all(
      leadIds.map(id =>
        frappeApi.get(`/resource/Lead/${id}`, {
          params: { fields: JSON.stringify(['name','customer_name','phone','client_address','business_unit','service','description','status','source_agent']) }
        }).then(r => r.data?.data).catch(() => null)
      )
    );

    // Build a lookup map: lead id → lead doc
    const leadMap = {};
    leadResults.forEach(doc => { if (doc?.name) leadMap[doc.name] = doc; });

    // Step 3: Join and map
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
  useEffect(() => { fetchBusinessUnits(); }, [fetchBusinessUnits]);
  useEffect(() => { fetchLeads();       }, [fetchLeads]);
  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  // ── Assign Credits → find matching Agent Credit Ledger → PATCH ─────────────
  const handleLeadSettlement = async () => {
    if (!settleAmount) return;
    setIsProcessing(true);
    try {
      // Find the Agent Credit Ledger doc linked to this lead
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

      // PATCH credits + status = Approved
      await frappeApi.put(`/resource/Agent Credit Ledger/${ledgerName}`, {
        credits: parseInt(settleAmount),
        status:  'Approved',
        ...(settleRemarks ? { remarks: settleRemarks } : {}),
      });

      // Remove lead from local queue (credits now assigned)
      setLeads(prev => prev.filter(l => l.id !== selectedItem.id));
      closeAllModals();
    } catch {
      alert('Failed to assign credits. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Approve Withdrawal → PATCH Agent Withdrawal Request ────────────────────
  const confirmWithdrawal = async () => {
    setIsProcessing(true);
    try {
      await frappeApi.put(
        `/resource/Agent Withdrawal Request/${selectedItem.id}`,
        { status: 'Credited' }
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

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeSubTab === 'settlements') {
      return leads.filter(l =>
        l.clientName.toLowerCase().includes(term) ||
        l.id.toLowerCase().includes(term)
      );
    }
    return withdrawals.filter(w =>
      w.agentName.toLowerCase().includes(term) ||
      w.id.toLowerCase().includes(term)
    );
  }, [activeSubTab, searchTerm, leads, withdrawals]);

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

  const isLoading = activeSubTab === 'settlements' ? loadingLeads : loadingWD;
  const hasError  = activeSubTab === 'settlements' ? errorLeads   : errorWD;
  const onRetry   = activeSubTab === 'settlements' ? fetchLeads   : fetchWithdrawals;

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-6 pb-10 max-w-[1600px] mx-auto px-4 md:px-0">

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

      {/* ── CONTROL BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
          <button
            onClick={() => { setActiveSubTab('settlements'); setSearchTerm(''); }}
            className={`flex-1 sm:flex-none px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSubTab === 'settlements' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Reward Queue
          </button>
          <button
            onClick={() => { setActiveSubTab('withdrawals'); setSearchTerm(''); }}
            className={`flex-1 sm:flex-none px-6 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeSubTab === 'withdrawals' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
          >
            Agent Payouts
          </button>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 w-full md:w-80 shadow-sm focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search size={16} className="text-slate-400" />
          <input
            type="text" placeholder="FILTER RECORDS..."
            className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900"
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── TABLE ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
            <Loader2 size={26} className="animate-spin text-blue-400" />
            <p className="text-[10px] font-black uppercase tracking-widest">Loading Records...</p>
          </div>
        ) : hasError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-red-400">
            <AlertCircle size={26} />
            <p className="text-[10px] font-black uppercase tracking-widest">{hasError}</p>
            <button onClick={onRetry} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase">Retry</button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-300">
            <Wallet size={28} />
            <p className="text-[10px] font-black uppercase tracking-widest">No records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {activeSubTab === 'settlements' ? (
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    {['Lead ID','Client Name','Business Branch','Service Type','Staff Member','Action'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-all">
                      <td className="px-6 py-4 font-mono text-[10px] text-blue-600 font-black">{item.id}</td>
                      <td className="px-6 py-4 text-xs font-black text-slate-900 uppercase tracking-tight">{item.clientName}</td>
                      <td className="px-6 py-4 text-[9px] font-black text-slate-600 uppercase">{item.businessUnit}</td>
                      <td className="px-6 py-4 text-[9px] font-black text-blue-500 uppercase">{item.service}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-slate-900 text-white flex items-center justify-center text-[8px] font-black uppercase">
                            {item.agentName?.[0]}
                          </div>
                          <span className="text-[10px] font-black text-slate-700 uppercase">{item.agentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedItem(item); setActiveModal('case-review'); }}
                            className="px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-white flex items-center gap-1.5 transition-all"
                          >
                            <Info size={12}/> Info
                          </button>
                          <button
                            onClick={() => { setSelectedItem(item); setActiveModal('assign'); }}
                            className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-slate-900 transition-all shadow-md"
                          >
                            Assign CR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50/50">
                    {['Request ID','Agent','Requested On','Claim Amount','Status','Action'].map((h, i) => (
                      <th key={h} className={`px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-all">
                      <td className="px-6 py-4 font-mono text-[10px] text-blue-600 font-black">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded bg-slate-900 text-white flex items-center justify-center text-[9px] font-black uppercase">
                            {item.agentName?.[0]}
                          </div>
                          <span className="text-xs font-black text-slate-900 uppercase">{item.agentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-slate-500">{item.date}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900 tracking-tighter">
                        {item.amount?.toLocaleString()} CR
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : item.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setSelectedItem(item); setActiveModal('agent-payout-info'); }}
                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-50 transition-all flex items-center gap-1.5"
                          >
                            <Info size={12}/> Info
                          </button>
                          {item.status === 'Pending' ? (
                            <button
                              onClick={() => { setSelectedItem(item); setActiveModal('payout'); }}
                              className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-slate-900 transition-all shadow-md"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 text-emerald-600 text-[9px] font-black uppercase bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                              <CheckCircle2 size={12}/> Settled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </motion.div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {activeModal && selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white w-full max-w-4xl rounded-xl relative shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
            >
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 shrink-0">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-blue-600"/>
                  {activeModal === 'agent-payout-info' ? 'Agent Withdrawal Info'
                    : activeModal === 'assign'       ? 'Assign Credit Reward'
                    : activeModal === 'payout'       ? 'Approve Payout'
                    : 'Case Review Summary'}
                </h3>
                <button onClick={closeAllModals} className="p-1.5 bg-white rounded-lg hover:bg-slate-100 transition-colors"><X size={18}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

                {/* Case Review */}
                {activeModal === 'case-review' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <p className="text-[9px] text-blue-600 font-black uppercase mt-1 tracking-widest">REF: {selectedItem.id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Requested Credits</p>
                        <p className="text-base font-black text-blue-600">{selectedItem.amount?.toLocaleString()} CR</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Status</p>
                        <p className={`text-base font-black ${selectedItem.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedItem.status}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-left p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
                      <InfoItem label="Requested On" value={selectedItem.date} />
                      {selectedItem.remarks && <InfoItem label="Remarks" value={selectedItem.remarks} />}
                    </div>
                  </div>
                )}

                {/* Assign CR */}
                {activeModal === 'assign' && (
                  <div className="max-w-md mx-auto space-y-5">
                    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Assigning credits for</p>
                      <p className="text-sm font-black text-slate-900 uppercase">{selectedItem.clientName}</p>
                      <p className="text-[9px] text-blue-500 font-bold mt-0.5">via Agent: {selectedItem.agentName}</p>
                    </div>
                    <div className="p-6 bg-slate-900 rounded-2xl text-white text-center shadow-xl">
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Assign Credit Points</p>
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
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Remarks (optional)</label>
                      <textarea
                        rows={2} placeholder="Add a note..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none"
                        value={settleRemarks} onChange={(e) => setSettleRemarks(e.target.value)}
                      />
                    </div>
                    <button
                      disabled={isProcessing || !settleAmount}
                      onClick={handleLeadSettlement}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : 'Confirm Credits'}
                    </button>
                  </div>
                )}

                {/* Approve Payout */}
                {activeModal === 'payout' && (
                  <div className="text-center space-y-6 py-4 max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner"><ShieldAlert size={32}/></div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Approve Withdrawal</h3>
                      <p className="text-[11px] text-slate-500 font-medium mt-3 leading-relaxed px-4">
                        Confirm approving <b className="text-slate-900 font-black">{selectedItem.amount?.toLocaleString()} CR</b> for{' '}
                        <b className="text-blue-600 font-black uppercase">{selectedItem.agentName}</b>.
                      </p>
                      {selectedItem.remarks && (
                        <p className="text-[10px] text-slate-400 mt-2 italic">"{selectedItem.remarks}"</p>
                      )}
                    </div>
                    <button
                      onClick={confirmWithdrawal}
                      className="w-full py-4 bg-slate-900 text-white rounded-lg font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : 'Confirm Approval'}
                    </button>
                  </div>
                )}

                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-4">
                  <Shield size={20} className="text-blue-600 shrink-0 mt-0.5" />
                  <p className="text-[9px] text-blue-800 font-bold uppercase leading-relaxed">
                    All actions are logged in Frappe ERP. Changes are permanent and visible to system admins.
                  </p>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end">
                <button onClick={closeAllModals} className="px-10 py-3 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 transition-all active:scale-95 shadow-md">
                  Close Review
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