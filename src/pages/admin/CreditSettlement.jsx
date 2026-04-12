import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Search, Wallet, X, Loader2, User,
  Phone, Info, MapPin,
  Sparkles, FileImage, Zap, AlertCircle,
  Briefcase, IndianRupee,
  Activity,
  CreditCard,
  SearchX
} from 'lucide-react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import frappeApi from '../../api/frappeApi';

// ─── Field map ─────────────────────────────────────────────────────────────────
const mapWithdrawal = (doc,phoneMap = {}) => ({
  id:        doc.name,
  agentName: doc.agent             || '—',
  agentPhone: phoneMap[doc.agent]  || '', // <--- ADD THIS LINE
  amount:    doc.requested_credits || 0,
  status:    doc.status            || 'Pending',
  remarks:   doc.remarks           || '',
  date:      doc.requested_on      || '—',
});

// ─── Main Component ────────────────────────────────────────────────────────────
const CreditSettlement = () => {

  // ── Section Filters ─────────────────────────────────────────────────────────
  const [rewardSearch,      setRewardSearch]      = useState('');
  const [rewardFilterBU,    setRewardFilterBU]    = useState('');
  const [rewardFilterAgent, setRewardFilterAgent] = useState('');
  const [payoutSearch,      setPayoutSearch]      = useState('');

  // ── Data ────────────────────────────────────────────────────────────────────
  const [leads,        setLeads]        = useState([]);
  const [withdrawals,  setWithdrawals]  = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingWD,    setLoadingWD]    = useState(true);
  const [errorLeads,   setErrorLeads]   = useState(null);
  const [errorWD,      setErrorWD]      = useState(null);

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [selectedItem,  setSelectedItem]  = useState(null);
  const [activeModal,   setActiveModal]   = useState(null);
  const [settleAmount,  setSettleAmount]  = useState('');
  const [settleRemarks, setSettleRemarks] = useState('');
  const [isProcessing,  setIsProcessing]  = useState(false);

  const [agentPhones, setAgentPhones] = useState({});

  // ── Single API fetch ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoadingLeads(true);
    setLoadingWD(true);
    setErrorLeads(null);
    setErrorWD(null);
    try {
      const res = await frappeApi.get(
        '/method/business_chain.api.admin.get_credit_settlement_data'
      );
      const { leads: rawLeads, withdrawals: rawWD } = res.data.message;
const userRes = await frappeApi.get('/resource/User', {
      params: { 
        fields: JSON.stringify(['name', 'mobile_no', 'phone']), 
        limit_page_length: 0 
      }
    });
    // console.log("API FULL RESPONSE:", userRes.data.message);
    const phoneMap = {};
    if (userRes.data?.data) {
      userRes.data.data.forEach(user => {
        phoneMap[user.name] = user.mobile_no || user.phone || "";
      });
    }
    console.log("RAW LEADS FROM API:", rawLeads);
console.log("FIRST LEAD:", rawLeads?.[0]);
    setAgentPhones(phoneMap);
      setLeads(rawLeads.map(l => ({
        ledgerId:     l.ledger_id,
        id:           l.id,
        clientName:   l.client_name,
        clientPhone:  l.client_phone,
        clientAddress:l.client_address,
        businessUnit: l.business_unit,
        service:      l.service,
        description:  l.description,
        status:       l.lead_status,
        agentName:    l.agent_name,
        agentId:      l.agent_id,
        agentPhone:   phoneMap[l.agent_name] || phoneMap[l.agent_id] || '',
        date:         l.date,
        credits:      l.credits,
        remarks:      l.ledger_remarks,
        totalAmount:  l.total_sale_amount,
        commission:   l.commission_amount,
        agentCredit:  l.agent_credit,
      })));

setWithdrawals(rawWD.map(doc => mapWithdrawal(doc, phoneMap)));
    } catch {
      setErrorLeads('Failed to load settlement data.');
      setErrorWD('Failed to load settlement data.');
    } finally {
      setLoadingLeads(false);
      setLoadingWD(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Assign Credits ───────────────────────────────────────────────────────────
  const handleLeadSettlement = async () => {
    if (!settleAmount) return;
    setIsProcessing(true);
    try {
      await frappeApi.put(`/resource/Agent Credit Ledger/${selectedItem.ledgerId}`, {
        credits: parseInt(settleAmount),
        status:  'Approved',
        ...(settleRemarks ? { remarks: settleRemarks } : {}),
      });
     setLeads(prev => prev.filter(l => l.ledgerId !== selectedItem.ledgerId));
      closeAllModals();
    } catch {
      alert('Failed to assign credits. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Approve Withdrawal ───────────────────────────────────────────────────────
  const confirmWithdrawal = async () => {
    setIsProcessing(true);
    try {
      await frappeApi.put(
        `/resource/Agent Withdrawal Request/${selectedItem.id}`,
        {
          status: 'Credited',
          ...(settleRemarks ? { remarks: settleRemarks } : {}),
        }
      );
      setWithdrawals(prev =>
        prev.map(w => w.id === selectedItem.id ? { ...w, status: 'Credited' } : w)
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

  // ── Unique filter options ────────────────────────────────────────────────────
  const uniqueBUs = useMemo(
    () => [...new Set(leads.map(l => l.businessUnit))].filter(Boolean),
    [leads]
  );
  const uniqueRewardAgents = useMemo(
    () => [...new Set(leads.map(l => l.agentName))].filter(Boolean),
    [leads]
  );

  // ── Filtering ────────────────────────────────────────────────────────────────
  const filteredRewards = useMemo(() => {
    const term = rewardSearch.toLowerCase();
    return leads.filter(l => {
      const matchesSearch =
        l.clientName.toLowerCase().includes(term) ||
        l.id.toLowerCase().includes(term);
      const matchesBU    = rewardFilterBU    ? l.businessUnit === rewardFilterBU    : true;
      const matchesAgent = rewardFilterAgent ? l.agentName    === rewardFilterAgent : true;
      return matchesSearch && matchesBU && matchesAgent;
    });
  }, [leads, rewardSearch, rewardFilterBU, rewardFilterAgent]);

  const filteredPayouts = useMemo(() => {
    const term = payoutSearch.toLowerCase();
    return withdrawals.filter(w =>
      w.agentName.toLowerCase().includes(term) ||
      w.id.toLowerCase().includes(term)
    );
  }, [withdrawals, payoutSearch]);

  // ── Charts ───────────────────────────────────────────────────────────────────
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
          withdrawals.filter(w => w.status === 'Approved' || w.status === 'Credited').length,
        ],
        options: {
          chart: { id: 'dist-chart' },
          labels: ['Unpaid Rewards', 'Pending Withdrawals', 'Settled'],
          colors: ['#3B82F6', '#F59E0B', '#10B981'],
          legend: {
            position: 'bottom',
            fontFamily: 'Plus Jakarta Sans',
            fontSize: '10px',
            fontWeight: 600,
          },
          plotOptions: { pie: { donut: { size: '75%' } } },
        },
      },
    };
  }, [leads, withdrawals]);

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-8 pb-10 max-w-[1600px] mx-auto px-4 md:px-0">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="bg-white border border-slate-200 p-4 md:p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Credit & Payment Settlement</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
              Active Settlement Management
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
            <Chart
              options={chartConfigs.payouts.options}
              series={chartConfigs.payouts.series}
              type="line" height={220}
            />
          </ChartCard>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <ChartCard
            title="Fund Status" subtitle="Breakdown of pending vs paid"
            onDownload={() => ApexCharts.exec('dist-chart', 'downloadPNG')}
          >
            <div className="flex justify-center pt-2">
              <Chart
                options={chartConfigs.distribution.options}
                series={chartConfigs.distribution.series}
                type="donut" width="100%" height={220}
              />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── REWARD QUEUE ── */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          {/* <Sparkles className="text-blue-600" size={20} /> */}
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Verify Credits</h3>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 focus-within:border-blue-300 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text" placeholder="Search Client or Lead ID..."
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900"
              value={rewardSearch} onChange={e => setRewardSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 focus-within:border-blue-300 transition-all">
            <Briefcase size={14} className="text-slate-400" />
            <select
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900 cursor-pointer"
              value={rewardFilterBU} onChange={e => setRewardFilterBU(e.target.value)}
            >
              <option value="">All Branches</option>
              {uniqueBUs.map(bu => <option key={bu} value={bu}>{bu}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-100 focus-within:border-blue-300 transition-all">
            <User size={14} className="text-slate-400" />
            <select
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900 cursor-pointer"
              value={rewardFilterAgent} onChange={e => setRewardFilterAgent(e.target.value)}
            >
              <option value="">All Agents</option>
              {uniqueRewardAgents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
            </select>
          </div>
        </div>

        {/* Cards */}
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
      <button
        onClick={fetchAll}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase shadow-sm active:scale-95 transition-transform"
      >
        Retry
      </button>
    </div>
  ) : filteredRewards.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-300 bg-white border border-slate-200 rounded-xl">
      <SearchX size={28} />
      <p className="text-[10px] font-black uppercase tracking-widest">No pending requests found</p>
    </div>
  ) : (
   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
  {filteredRewards.map(item => (
    <div
      key={item.ledgerId}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col h-full hover:shadow-lg hover:border-blue-400 transition-all group"
    >

      {/* Header */}
      <div className="flex justify-between items-start gap-4 mb-5">
        <div className="flex-1 min-w-0">
        
          <h4 className="text-base font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2">
            {item.clientName}
          </h4>
        </div>

        <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black uppercase shrink-0 shadow-md border border-slate-700">
          {item.agentName?.[0] || '?'}
        </div>
      </div>

      {/* Info Grid */}
      <div className="bg-slate-50/60 rounded-xl p-4 grid grid-cols-2 gap-y-4 gap-x-3 border border-slate-100 mb-5 flex-1">

        <div className="min-w-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Briefcase size={11} className="text-slate-400" /> Branch
          </p>
          <p className="text-[11px] font-black text-slate-700 uppercase truncate">
            {item.businessUnit}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <Zap size={11} className="text-blue-400" /> Service
          </p>
          <p className="text-[11px] font-black text-blue-600 uppercase truncate">
            {item.service}
          </p>
        </div>

        <div className="col-span-2 pt-3 border-t border-slate-200/60">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <User size={11} className="text-slate-400" /> Handling Agent
          </p>
          <p className="text-[11px] font-black text-slate-700 uppercase truncate">
            {item.agentName}
          </p>
        </div>

      </div>

      {/* Financial */}
      <div className="bg-gradient-to-br from-emerald-50/80 to-emerald-50/30 rounded-xl p-4 border border-emerald-100/60 mb-6">

        <div className="flex justify-between items-center mb-3">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Admin Commission.
          </span>
          <span className="text-[11px] font-black text-amber-600">
            ₹{item.commission?.toLocaleString() ?? 'N/A'}
          </span>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-emerald-200/50">
          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1.5">
            <Wallet size={11} className="text-emerald-500" /> Agent Credit
          </span>
          <span className="text-sm font-black text-emerald-600">
            {item.agentCredit?.toLocaleString() ?? 'N/A'} CR
          </span>
        </div>

      </div>

      {/* Actions */}
      <div className="mt-auto flex gap-3">
        <button
          onClick={() => { setSelectedItem(item); setActiveModal('case-review'); }}
          className="flex-1 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 flex justify-center items-center gap-2 transition-all shadow-sm"
        >
          <Info size={13} /> Info
        </button>

        <button
          onClick={() => {
            setSelectedItem(item);
            setSettleAmount(item.agentCredit);
            setActiveModal('verify');
          }}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md shadow-blue-500/20 flex justify-center items-center gap-2 active:scale-95"
        >
          Verify CR
        </button>
      </div>

    </div>
  ))}
</div>
  )}
</motion.div>
      </section>

      {/* ── AGENT PAYOUTS ── */}
      <section className="space-y-4 pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wallet className="text-emerald-600" size={20} />
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Agent Payouts</h3>
          </div>
          <div className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl flex items-center gap-3 w-full sm:w-80 shadow-sm focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <Search size={14} className="text-slate-400" />
            <input
              type="text" placeholder="Search Agent or Request ID..."
              className="bg-transparent outline-none text-[10px] font-black uppercase tracking-widest w-full text-slate-900"
              value={payoutSearch} onChange={e => setPayoutSearch(e.target.value)}
            />
          </div>
        </div>

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
              <button
                onClick={fetchAll}
                className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase"
              >
                Retry
              </button>
            </div>
          ) : filteredPayouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2 text-slate-300 bg-white border border-slate-200 rounded-xl">
              <Wallet size={28} />
              <p className="text-[10px] font-black uppercase tracking-widest">No withdrawal requests found</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {filteredPayouts.map(item => {
    // Determine Status Styles dynamically
    const isSuccess = item.status === 'Approved' || item.status === 'Credited';
    const isRejected = item.status === 'Rejected';

    // Format Date and Time separately
    const rawDate = new Date(item.date);
    const isValid = !isNaN(rawDate.getTime());
    const displayDate = isValid 
      ? rawDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) 
      : item.date;
    const displayTime = isValid 
      ? rawDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) 
      : '';

    return (
      <div
        key={item.id}
        className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col h-full hover:shadow-md hover:border-emerald-300 transition-all duration-300 group"
      >
        {/* Header Row: ID, Agent Name & Status Pill */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 pr-4">
            
            <h4 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight line-clamp-2">
              {item.agentName}
            </h4>
          </div>
          <span
            className={`px-2.5 py-1.5 rounded-md text-[9px] font-black uppercase border shrink-0 shadow-sm ${
              isSuccess
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : isRejected
                ? 'bg-red-50 text-red-600 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {item.status}
          </span>
        </div>

        {/* Info Block: Claim Amount & Date */}
        <div className="bg-slate-50/70 rounded-xl p-4 flex flex-wrap sm:flex-nowrap justify-between items-center border border-slate-100 mb-6 flex-1 gap-4">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
             Claim Amount
            </p>
            <div className="flex items-baseline gap-1.5">
              <p className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                {item.amount?.toLocaleString()} <span className="text-[11px] text-slate-400 tracking-normal font-bold">CR</span>
              </p>
            </div>
            <p className="text-[10px] font-bold text-emerald-600 tracking-widest mt-1.5">
              ₹{item.amount?.toLocaleString()}
            </p>
          </div>
          <div className="text-left sm:text-right flex flex-col items-start sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Requested On
            </p>
            <div className="flex flex-col items-start sm:items-end gap-1.5">
              <p className="text-[11px] font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm whitespace-nowrap">
                {displayDate}
              </p>
              {displayTime && (
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-100/50 px-2 py-0.5 rounded border border-slate-200/60 whitespace-nowrap">
                  {displayTime}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={() => { setSelectedItem(item); setActiveModal('agent-payout-info'); }}
            className="flex-[0.8] py-3 bg-white text-slate-600 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 flex justify-center items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Info size={14} /> Details
          </button>
          
          {item.status === 'Pending' ? (
            <button
              onClick={() => { setSelectedItem(item); setActiveModal('payout'); }}
              className="flex-[1.2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md shadow-emerald-500/20 flex justify-center items-center gap-2 active:scale-95"
            >
              Process Payout
            </button>
          ) : (
            <div 
              className={`flex-[1.2] py-3 text-[10px] font-black uppercase tracking-widest rounded-lg border flex justify-center items-center gap-2 ${
                isSuccess 
                  ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                  : 'text-red-600 bg-red-50 border-red-100'
              }`}
            >
              {isSuccess ? <CheckCircle2 size={14} /> : <XCircle size={14} />} 
              {item.status}
            </div>
          )}
        </div>
      </div>
    );
  })}
</div>
          )}
        </motion.div>
      </section>

      {/* ── MODALS ── */}
     <AnimatePresence>
  {activeModal && selectedItem && (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="bg-white w-full max-w-4xl rounded-xl relative shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 shrink-0">
          <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <Info size={14} className="text-blue-600" />
            {activeModal === 'agent-payout-info' ? 'Agent Withdrawal Info'
              : activeModal === 'verify'  ? 'Verify Agent Credits'
              : activeModal === 'payout'  ? 'Process Manual Payout'
              : 'Lead Details'}
          </h3>
          <button onClick={closeAllModals} className="p-1.5 bg-white rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">

          {/* ── Case Review ── */}
          {activeModal === 'case-review' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <section className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-3 md:col-span-3">
                <p className="text-[12px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2 border-emerald-100 flex items-center gap-1.5">
                  <IndianRupee size={12} /> Financial Breakdown
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Total Lead Amount</p>
                    <p className="text-lg font-black text-slate-900">
                      ₹{selectedItem.totalAmount?.toLocaleString() ?? 'N/A'}
                    </p>
                  </div>
                  <div className="border-x border-emerald-200/50">
                    <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Admin Commission</p>
                    <p className="text-lg font-black text-amber-600">
                      ₹{selectedItem.commission?.toLocaleString() ?? 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[8px] text-emerald-700 font-bold uppercase mb-1">Agent Credit</p>
                    <p className="text-lg font-black text-emerald-600">
                      {selectedItem.agentCredit?.toLocaleString() ?? 'N/A'} CR
                    </p>
                  </div>
                </div>
              </section>

              <section className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                <p className="text-[12px] font-black text-blue-600 uppercase tracking-widest border-b pb-2">Client Details</p>
                <p className="text-xs font-black text-slate-900 uppercase">{selectedItem.clientName}</p>
                <div className="flex items-center gap-2 text-[9px] text-slate-500 font-bold">
                  <Phone size={10} /> {selectedItem.clientPhone || 'N/A'}
                </div>
                <div className="flex items-start gap-2 text-[9px] text-slate-500 font-bold">
                  <MapPin size={10} className="shrink-0" /> {selectedItem.clientAddress || 'N/A'}
                </div>
              </section>

              <section className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3">
                <p className="text-[12px] font-black text-emerald-600 uppercase tracking-widest border-b pb-2">Business Branch</p>
                <p className="text-xs font-black text-slate-900 uppercase">{selectedItem.businessUnit}</p>
                <p className="text-[9px] font-bold text-emerald-600 uppercase">{selectedItem.service}</p>
                <p className="text-[9px] text-slate-400 italic leading-relaxed">"{selectedItem.description}"</p>
              </section>

              <section className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-3">
                <p className="text-[12px] font-black text-blue-400 uppercase tracking-widest border-b pb-2 border-blue-500">Handled By</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-600 text-white rounded flex items-center justify-center font-black text-xs uppercase">
                    {selectedItem.agentName?.[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-900 uppercase">{selectedItem.agentName}</p>
                    <p className="text-[7px] font-bold text-blue-400 uppercase">ID: {selectedItem.agentId}</p>
                  </div>
                </div>
                  {console.log(`It's from the mate model${selectedItem.agentPhone}`)}
                <div className="flex gap-2 pt-1">
                  <a href={`tel:${selectedItem.agentPhone}`}
                    className="flex-1 py-1.5 bg-white rounded text-[7px] font-black uppercase text-center border border-blue-200">
                    Call
                  </a>
                  <a href={`https://wa.me/${selectedItem.agentPhone}`} target="_blank" rel="noreferrer"
                    className="flex-1 py-1.5 bg-emerald-500 text-white rounded text-[7px] font-black uppercase text-center">
                    WhatsApp
                  </a>
                </div>
              </section>
            </div>
          )}

          {/* ── Agent Payout Info ── */}
          {activeModal === 'agent-payout-info' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-xl bg-slate-900 text-white flex items-center justify-center text-3xl font-black shadow-lg mb-4 uppercase">
                  {selectedItem.agentName?.[0]}
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{selectedItem.agentName}</h3>
                {/* <p className="text-[9px] text-emerald-600 font-black uppercase mt-1 tracking-widest">REF: {selectedItem.id}</p> */}
                
                {/* AGENT CONTACT CTA SECTION */}
                <div className="w-full mt-5 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-700 font-bold mb-3">
                    <Phone size={14} className="text-slate-400" /> {selectedItem.agentPhone || 'No Phone Available'}
                  </div>
                  {console.log(selectedItem.agentPhone)}
                  <div className="flex gap-2">
                    <a href={`tel:${selectedItem.agentPhone}`} className="flex-1 py-2.5 bg-white rounded-lg text-[9px] font-black uppercase text-center border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                      <Phone size={12} /> Call Now
                    </a>
                    <a href={`https://wa.me/${selectedItem.agentPhone}`} target="_blank" rel="noreferrer" className="flex-1 py-2.5 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase text-center hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                      WhatsApp Now
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Requested Amount</p>
                  <p className="text-base font-black text-emerald-600">₹{selectedItem.amount?.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                  <p className="text-[7px] font-black text-slate-400 uppercase mb-1">Status</p>
                  <p className={`text-base font-black ${
                    selectedItem.status === 'Approved' || selectedItem.status === 'Credited'
                      ? 'text-emerald-600' : 'text-amber-600'
                  }`}>{selectedItem.status}</p>
                </div>
              </div>
             <div className="space-y-2 text-left p-4 border border-slate-100 rounded-xl bg-white shadow-sm">
  <InfoItem
    label="Requested On"
    value={
      selectedItem.date
        ? new Date(selectedItem.date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })
        : '—'
    }
  />

  {selectedItem.remarks && (
    <InfoItem
      label="Admin Remarks / Ref"
      value={selectedItem.remarks}
    />
  )}
</div>
            </div>
          )}

          {/* ── Verify Credits ── */}
          {activeModal === 'verify' && (
            <div className="max-w-md mx-auto space-y-5">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Verifying credits for</p>
                <p className="text-sm font-black text-slate-900 uppercase">{selectedItem.clientName}</p>
                <p className="text-[9px] text-blue-500 font-bold mt-0.5">via Agent: {selectedItem.agentName}</p>
              </div>
              <div className="p-6 bg-slate-900 rounded-2xl text-white text-center shadow-xl">
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Verify & Adjust Credit Points</p>
                <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">One Credit = 1 INR</p>
                <div className="flex items-center justify-center gap-4">
                  <input
                    type="number" autoFocus placeholder="000"
                    className="bg-transparent text-5xl font-black text-white outline-none w-48 text-center placeholder:text-slate-700"
                    value={settleAmount} onChange={e => setSettleAmount(e.target.value)}
                  />
                  <span className="text-3xl font-black text-blue-400">CR</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Admin Remarks (optional)</label>
                <textarea
                  rows={2} placeholder="Add a note or reason for modification..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-blue-500 resize-none"
                  value={settleRemarks} onChange={e => setSettleRemarks(e.target.value)}
                />
              </div>
              <button
                disabled={isProcessing || !settleAmount}
                onClick={handleLeadSettlement}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isProcessing
                  ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  : 'Verify & Transfer to Agent Wallet'}
              </button>
            </div>
          )}

          {/* ── Process Payout ── */}
          {activeModal === 'payout' && (
            <div className="text-center space-y-5 py-2 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <Wallet size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Process Manual Payout</h3>
                <p className="text-[11px] text-slate-500 font-medium mt-2 leading-relaxed px-2">
                  Please transfer{' '}
                  <b className="text-slate-900 font-black">₹{selectedItem.amount?.toLocaleString()}</b>
                  {' '}manually to{' '}
                  <b className="text-emerald-600 font-black uppercase">{selectedItem.agentName}</b>
                  {' '}via GPay, WhatsApp, or Bank Transfer.
                </p>
              </div>

              {/* PAYOUT AGENT CONTACT CTA */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mt-4 text-left">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-center">Agent Contact</p>
                <div className="flex items-center justify-center mb-3">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Phone size={12} className="text-slate-400"/> {selectedItem.agentPhone || 'No Phone Available'}</span>
                </div>
                <div className="flex gap-2">
                  <a href={`tel:${selectedItem.agentPhone}`} className="flex-1 py-2 bg-white rounded-lg text-[9px] font-black uppercase text-center border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">Call Now</a>
                  <a href={`https://wa.me/${selectedItem.agentPhone}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[9px] font-black uppercase text-center hover:bg-emerald-600 transition-colors shadow-sm">WhatsApp Now</a>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-left">
                <p className="text-[9px] font-black text-amber-800 uppercase flex items-center gap-1.5 mb-2">
                  <AlertCircle size={12} /> Admin Action Required
                </p>
                <p className="text-[10px] text-amber-700 leading-relaxed">
                  Ensure the payment is successfully completed before confirming. This action will permanently update the withdrawal status in the system.
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  Transaction Reference (Optional)
                </label>
                <input
                  type="text" placeholder="e.g. UTR or GPay Ref..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500"
                  value={settleRemarks} onChange={e => setSettleRemarks(e.target.value)}
                />
              </div>

              <button
                onClick={confirmWithdrawal}
                disabled={isProcessing}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {isProcessing
                  ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                  : 'Confirm Payment & Approve'}
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-end rounded-b-xl">
          <button
            onClick={closeAllModals}
            className="px-10 py-3 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase hover:bg-blue-600 transition-all active:scale-95 shadow-md"
          >
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

// ─── Helper Components ─────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, onDownload }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col h-full relative group">
    <div className="mb-4 flex justify-between items-start">
      <div>
        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">{title}</h4>
        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{subtitle}</p>
      </div>
      <button
        onClick={onDownload}
        className="p-1.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-all"
      >
        <FileImage size={14} />
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