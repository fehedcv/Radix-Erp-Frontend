import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Wallet, X, Loader2, User,
  Phone, Info, MapPin, AlertTriangle,
  Zap, AlertCircle, Briefcase, IndianRupee,
  Activity, CreditCard, SearchX, CheckCircle2, MessageSquare, Calendar
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return url;
};

// ─── Mappers ─────────────────────────────────────────────────────────────────
const mapWithdrawal = (w) => ({
  id: w.id,
  agentName: w.agent_name || '—',
  agentPhone: w.agent_phone || '',
  agentEmail: w.agent_email || '', 
  agentAvatar: w.agent_avatar_url || '',
  amount: w.requested_credits || 0,
  status: (w.status || 'pending').toLowerCase(),
  remarks: w.remarks || '',
  date: w.requested_on || '—',
  userId: w.user_id,
});
// Module Cache
let creditSettlementCache = null;
let creditSettlementCacheTime = 0;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ─── Main Component ────────────────────────────────────────────────────────────
const CreditSettlement = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

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

  // ── Single API fetch ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (
  creditSettlementCache &&
  Date.now() - creditSettlementCacheTime < CACHE_DURATION
) {
  setLeads(creditSettlementCache.leads);
  setWithdrawals(creditSettlementCache.withdrawals);

  setLoadingLeads(false);
  setLoadingWD(false);

  return;

} 


    setLoadingLeads(true);
    setLoadingWD(true);
    setErrorLeads(null);
    setErrorWD(null);
    try {
      const { data, error } = await supabase.rpc('get_admin_credit_settlement_dashboard');

      if (error) {
        console.error('Failed to load settlement data:', error);
        setErrorLeads('Failed to load settlement data.');
        setErrorWD('Failed to load settlement data.');
        return;
      }

      const payload = data || {};

      const leadsData = (payload.paid_leads || []).map(l => ({
  ledgerId: l.ledger_id,
  id: l.lead_id,
  clientName: l.client_name,
  clientPhone: l.client_phone,
  clientAddress: l.client_address,
  businessUnit: l.business_unit,
  service: l.service,
  description: l.description,
  status: l.lead_status,
  agentName: l.agent_name,
  agentId: l.agent_id,
  agentAvatar: l.agent_avatar_url || '',
  agentEmail: l.agent_email || '',
  agentPhone: l.agent_phone,
  date: l.date,
  credits: l.credits,
  remarks: l.ledger_remarks,
  totalAmount: l.total_sale_amount,
  commission: l.commission_amount,
  agentCredit: l.agent_credit,
  creditStatus: (l.credit_status || 'pending').toLowerCase(),
}));



const withdrawalData =
(payload.withdrawals || []).map(mapWithdrawal);

setLeads(leadsData);
setWithdrawals(withdrawalData);
creditSettlementCache = {
  leads: leadsData,
  withdrawals: withdrawalData,
};

creditSettlementCacheTime = Date.now();
    } catch (err) {
      console.error('Error fetching settlement data:', err);
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
      const { error } = await supabase.rpc('verify_credits', {
        p_lead_id: selectedItem.id,
        p_credits: Number(settleAmount),
        p_admin_remarks: settleRemarks || null,
      });
      if (error) throw error;
      creditSettlementCache = null;
creditSettlementCacheTime = 0;
      closeAllModals();
      await fetchAll();
    } catch (err) {
      console.error('Error verifying credits:', err);
      alert('Failed to verify credits: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Approve Withdrawal ───────────────────────────────────────────────────────
  const confirmWithdrawal = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.rpc('process_agent_withdrawal', {
        p_withdrawal_id: selectedItem.id,
        p_admin_remarks: settleRemarks,
      });

      if (error) {
        console.error('Failed to approve withdrawal:', error);
        alert(error.message || 'Failed to approve withdrawal. Check permissions.');
        return;
      }
      creditSettlementCache = null;
creditSettlementCacheTime = 0;

      await fetchAll();
      closeAllModals();
      return data;
    } catch (err) {
      console.error('Error approving withdrawal:', err);
      alert(err.message || 'Failed to approve withdrawal. Check permissions.');
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
  const uniqueBUs = useMemo(() => [...new Set(leads.map(l => l.businessUnit))].filter(Boolean), [leads]);
  const uniqueRewardAgents = useMemo(() => [...new Set(leads.map(l => l.agentName))].filter(Boolean), [leads]);

  // ── Filtering & Splitting ────────────────────────────────────────────────────────────────
  const filteredRewards = useMemo(() => {
    const term = rewardSearch.toLowerCase();
    return leads.filter(l => {
      const matchesSearch = l.clientName.toLowerCase().includes(term) || l.id.toLowerCase().includes(term);
      const matchesBU     = rewardFilterBU    ? l.businessUnit === rewardFilterBU    : true;
      const matchesAgent  = rewardFilterAgent ? l.agentName    === rewardFilterAgent : true;
      return matchesSearch && matchesBU && matchesAgent;
    });
  }, [leads, rewardSearch, rewardFilterBU, rewardFilterAgent]);

  const pendingRewards = useMemo(() => filteredRewards.filter(l => l.creditStatus !== 'verified' && l.creditStatus !== 'approved'), [filteredRewards]);
  const historyRewards = useMemo(() => filteredRewards.filter(l => l.creditStatus === 'verified' || l.creditStatus === 'approved'), [filteredRewards]);

  const filteredPayouts = useMemo(() => {
    const term = payoutSearch.toLowerCase();
    return withdrawals.filter(w => w.agentName.toLowerCase().includes(term) || w.id.toLowerCase().includes(term));
  }, [withdrawals, payoutSearch]);

  const pendingPayouts = useMemo(() => filteredPayouts.filter(w => w.status === 'pending'), [filteredPayouts]);
  const historyPayouts = useMemo(() => filteredPayouts.filter(w => w.status === 'approved' || w.status === 'credited' || w.status === 'rejected'), [filteredPayouts]);

  // Calculate Total Paid Amount (excluding rejected payouts)
  const totalPaidAmount = useMemo(() => {
    return historyPayouts.reduce((sum, w) => {
      if (w.status === 'approved' || w.status === 'credited') {
        return sum + (Number(w.amount) || 0);
      }
      return sum;
    }, 0);
  }, [historyPayouts]);

  const getAgentTotalLeads = (agentId) => {
    return leads.filter(l => l.agentId === agentId).length;
  };

  // ── Charts ───────────────────────────────────────────────────────────────────
  const chartConfigs = useMemo(() => {
    const dateCounts = leads.reduce((acc, l) => {
      acc[l.date] = (acc[l.date] || 0) + 1;
      return acc;
    }, {});
    const sortedDates = Object.keys(dateCounts).sort().slice(-7);

    return {
      payouts: {
        series: [{ name: 'System Activity', data: sortedDates.length ? sortedDates.map(d => dateCounts[d]) : [0] }],
        options: {
          chart: { id: 'payout-chart', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          colors: ['#48477A'],
          stroke: { curve: 'smooth', width: 2 },
          xaxis: {
            categories: sortedDates.length ? sortedDates.map(d => d.split('-').slice(1).join('/')) : ['N/A'],
            labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } },
            axisBorder: { show: false }, axisTicks: { show: false }
          },
          yaxis: { labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } } },
          grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: { lines: { show: false } } },
          fill: { type: 'gradient', gradient: { opacityFrom: isLight ? 0.3 : 0.4, opacityTo: 0 } },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
      distribution: {
        series: [
          leads.length,
          withdrawals.filter(w => w.status === 'pending').length,
          withdrawals.filter(w => w.status === 'approved' || w.status === 'credited').length,
        ].some(v => v > 0) ? [
          leads.length,
          withdrawals.filter(w => w.status === 'pending').length,
          withdrawals.filter(w => w.status === 'approved' || w.status === 'credited').length,
        ] : [1],
        options: {
          chart: { id: 'dist-chart', fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          labels: [
            leads.length,
            withdrawals.filter(w => w.status === 'pending').length,
            withdrawals.filter(w => w.status === 'approved' || w.status === 'credited').length,
          ].some(v => v > 0) ? ['Total Rewards', 'Pending Withdrawals', 'Settled'] : ['No Data'],
          colors: ['#48477A', '#DAC18A', '#81B398'],
          legend: { position: 'bottom', fontSize: '11px', fontWeight: 600, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '75%' } } },
          stroke: { show: false },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
    };
  }, [leads, withdrawals, isLight]);

  const getStatusBadgeStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'verified' || s === 'approved' || s === 'credited') return 'bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20';
    if (s === 'rejected' || s === 'restricted') return 'bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20';
    if (s === 'pending') return 'bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20';
    if (s === 'in progress' || s === 'started') return 'bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20';
    return isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5';
  };

  if (loadingLeads || loadingWD) return (
    <div className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0`}>
      <div className="pt-2 mb-6">
        <div className={`h-10 w-64 rounded-md mb-2 ${pulseClass} animate-pulse`} />
        <div className={`h-4 w-48 rounded-md ${pulseClass} animate-pulse`} />
      </div>
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <Loader2 size={32} className={`animate-spin ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`} />
        <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Loading Settlement Data...</p>
      </div>
    </div>
  );

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-6 lg:space-y-8 pb-16 max-w-[1400px] mx-auto mt-2 lg:mt-4 px-4 lg:px-0 transition-colors duration-300 ${textPrimary}`}>

      {/* ── HEADER (Free/Borderless) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pt-2">
        <div className="space-y-1.5 w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            Credit & Settlements
          </h1>
          <p className={`text-sm font-medium ${textSecondary}`}>
            Active Management of Credits and Agent Payouts
          </p>
        </div>
      </div>

      {/* ── STATUS CARDS (Directly Below Header) ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
         <QuickStat label="Unpaid Rewards" count={leads.filter(l => l.creditStatus !== 'verified').length} isLight={isLight} color="bg-[#48477A]/10 text-[#48477A] border-[#48477A]/20" />
         <QuickStat label="Pending Payouts" count={pendingPayouts.length} isLight={isLight} color="bg-[#DAC18A]/10 text-[#DAC18A] border-[#DAC18A]/20" />
         <QuickStat label="Settled Payouts" count={historyPayouts.length} isLight={isLight} color="bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20" />
         {/* Replaced Total Processed with Total Amount Paid */}
         <QuickStat label="Total Paid Amount" count={`₹${totalPaidAmount.toLocaleString()}`} isLight={isLight} color="bg-[#718096]/10 text-[#718096] border-[#718096]/20" />
      </div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <ChartCard title="Daily Settlement Flow" subtitle="System inquiry volume analytics" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-8">
          <Chart options={chartConfigs.payouts.options} series={chartConfigs.payouts.series} type="line" height="100%" width="100%" />
        </ChartCard>
        <ChartCard title="Fund Status" subtitle="Breakdown of pending vs paid" isLight={isLight} surfaceClass={surfaceClass} className="lg:col-span-4">
          <Chart options={chartConfigs.distribution.options} series={chartConfigs.distribution.series} type="donut" height="100%" width="100%" />
        </ChartCard>
      </div>

      {/* ── REWARD QUEUE (VERIFY CREDITS) ── */}
      <section className="space-y-6 pt-4 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
        <h3 className="text-xl font-extrabold tracking-tight">Verify Credits</h3>

        {/* Filters */}
        <div className={`p-5 lg:p-6 rounded-2xl border flex flex-col md:flex-row gap-4 transition-all duration-300 ${surfaceClass}`}>
          <div className={`flex flex-1 items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
            <Search size={16} className={textSecondary} />
            <input
              type="text" placeholder="Search Client or Lead ID..."
              className={`w-full bg-transparent outline-none text-sm font-medium ${textPrimary} placeholder:${textSecondary}`}
              value={rewardSearch} onChange={e => setRewardSearch(e.target.value)}
            />
          </div>
          <div className={`flex flex-1 items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
            <Briefcase size={16} className={textSecondary} />
            <select
              className={`w-full bg-transparent outline-none text-sm font-semibold cursor-pointer ${textPrimary}`}
              value={rewardFilterBU} onChange={e => setRewardFilterBU(e.target.value)}
            >
              <option value="">All Branches</option>
              {uniqueBUs.map(bu => <option key={bu} value={bu}>{bu}</option>)}
            </select>
          </div>
          <div className={`flex flex-1 items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
            <User size={16} className={textSecondary} />
            <select
              className={`w-full bg-transparent outline-none text-sm font-semibold cursor-pointer ${textPrimary}`}
              value={rewardFilterAgent} onChange={e => setRewardFilterAgent(e.target.value)}
            >
              <option value="">All Agents</option>
              {uniqueRewardAgents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
            </select>
          </div>
        </div>

        {/* Pending Rewards Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {errorLeads ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#F0524F]">
              <AlertCircle size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">{errorLeads}</p>
            </div>
          ) : pendingRewards.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-20 gap-3 ${textSecondary}`}>
              <SearchX size={32} className="opacity-50" />
              <p className="text-xs font-bold uppercase tracking-widest">No pending credits found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRewards.map(item => (
                <div key={item.ledgerId ?? item.id} className={`rounded-2xl border p-6 flex flex-col h-full transition-all duration-300 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#222938] border-white/5 hover:border-[#81B398]'}`}>
                  <div className="flex justify-between items-start gap-4 mb-5">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold tracking-tight truncate">{item.clientName}</h4>
                      <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${textSecondary}`}>{item.businessUnit}</p>
                    </div>
                    <div className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                       {item.agentAvatar ? (
                         <img src={resolveUrl(item.agentAvatar)} alt={item.agentName} className="w-full h-full object-cover rounded-full" />
                       ) : (
                         <span className="font-bold text-sm uppercase">{item.agentName?.charAt(0) || '?'}</span>
                       )}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border mb-5 flex-1 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                    <div className="flex justify-between items-center text-xs font-semibold mb-3">
                      <span className={textSecondary}>Service</span>
                      <span className={`truncate max-w-[120px] ${textPrimary}`}>{item.service}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className={textSecondary}>Handling Agent</span>
                      <span className={`truncate max-w-[120px] ${textPrimary}`}>{item.agentName}</span>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border mb-6 ${isLight ? 'bg-[#81B398]/10 border-[#81B398]/20' : 'bg-[#81B398]/5 border-[#81B398]/10'}`}>
                   <div className="flex justify-between items-center mb-3">
  <span
    className={`text-[10px] font-bold uppercase tracking-wider ${
      isLight ? 'text-[#48477A]' : 'text-[#9CA3AF]'
    }`}
  >
    Admin Comm. ({item.commission || 0}%)
  </span>

  <span className="text-xs font-bold">
    ₹
    {(
      (item.totalAmount || 0) *
      ((item.commission || 0) / 100)
    ).toLocaleString()}
  </span>
</div>
                    <div className="flex justify-between items-center pt-3 border-t" style={{ borderColor: isLight ? 'rgba(129, 179, 152, 0.3)' : 'rgba(129, 179, 152, 0.1)' }}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                        <Wallet size={12} className="text-[#81B398]" /> Agent Credit
                      </span>
                      <span className="text-sm font-extrabold text-[#81B398]">
                        {item.agentCredit?.toLocaleString() ?? 'N/A'} CR
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3">
                    <button
                      onClick={() => { setSelectedItem(item); setActiveModal('case-review'); }}
                      className={`flex-[0.8] py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'}`}
                    >
                      <Info size={14} /> Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setSettleAmount(item.agentCredit);
                        setActiveModal('verify');
                      }}
                      className="flex-[1.2] py-2.5 bg-[#48477A] hover:bg-[#3d3c67] text-[#FFFFFF] text-xs font-semibold rounded-lg transition-all flex justify-center items-center gap-2"
                    >
                      Verify CR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* History List (Rewards) */}
        {historyRewards.length > 0 && (
          <div className="mt-8">
             <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Verified Credits History</h4>
             <div className="overflow-x-auto rounded-xl border" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className={`${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}>
                      {['Date', 'Customer', 'Agent', 'Credits', 'Status'].map(h => (
                        <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b ${textSecondary} ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-[#E2E8F0]' : 'divide-white/5'}`}>
                    {historyRewards.map(item => (
                      <tr key={item.ledgerId ?? item.id} className={`${isLight ? 'bg-[#FFFFFF]' : 'bg-[#222938]'}`}>
                        <td className="px-6 py-4 text-xs font-medium">{item.date}</td>
                        <td className="px-6 py-4 text-sm font-bold">{item.clientName}</td>
                        <td className="px-6 py-4 flex items-center gap-3">
                           <div className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                             {item.agentAvatar ? <img src={resolveUrl(item.agentAvatar)} alt={item.agentName} className="w-full h-full object-cover rounded-full" /> : <span className="font-bold text-xs uppercase">{item.agentName?.charAt(0) || '?'}</span>}
                           </div>
                           <span className="text-sm font-medium">{item.agentName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[#81B398]">{item.agentCredit} CR</td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusBadgeStyles(item.creditStatus)}`}>
                             {item.creditStatus}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </section>

      {/* ── AGENT PAYOUTS ── */}
      <section className="space-y-6 pt-8 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-extrabold tracking-tight">Agent Payouts</h3>
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors focus-within:border-[#81B398] w-full sm:w-80 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
            <Search size={16} className={textSecondary} />
            <input
              type="text" placeholder="Search Agent..."
              className={`w-full bg-transparent outline-none text-sm font-medium ${textPrimary} placeholder:${textSecondary}`}
              value={payoutSearch} onChange={e => setPayoutSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Pending Payouts Grid */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {errorWD ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#F0524F]">
               <AlertCircle size={32} />
               <p className="text-xs font-bold uppercase tracking-widest">{errorWD}</p>
             </div>
          ) : pendingPayouts.length === 0 ? (
             <div className={`flex flex-col items-center justify-center py-20 gap-3 ${textSecondary}`}>
               <Wallet size={32} className="opacity-50" />
               <p className="text-xs font-bold uppercase tracking-widest">No pending payouts</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingPayouts.map(item => {
                const rawDate = new Date(item.date);
                const isValid = !isNaN(rawDate.getTime());
                const displayDate = isValid ? rawDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : item.date;

                return (
                  <div key={item.id} className={`rounded-2xl border p-6 flex flex-col h-full transition-all duration-300 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#222938] border-white/5 hover:border-[#81B398]'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                         <div className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                           {item.agentAvatar ? (
                             <img src={resolveUrl(item.agentAvatar)} alt={item.agentName} className="w-full h-full object-cover rounded-full" />
                           ) : (
                             <span className="font-bold text-sm uppercase">{item.agentName?.charAt(0) || '?'}</span>
                           )}
                         </div>
                         <div>
                            <h4 className="text-base font-bold tracking-tight truncate">{item.agentName}</h4>
                            <p className={`text-xs font-medium mt-0.5 ${textSecondary}`}>{displayDate}</p>
                         </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border shrink-0 ${getStatusBadgeStyles(item.status)}`}>
                        {item.status}
                      </span>
                    </div>

                    <div className={`p-4 rounded-xl border flex justify-between items-center mb-6 flex-1 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                      <div>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${textSecondary}`}>Claim Amount</p>
                        <p className="text-2xl font-extrabold tracking-tight">
                          {item.amount?.toLocaleString()} <span className={`text-xs ${textSecondary}`}>CR</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${textSecondary}`}>Equivalent</p>
                        <p className="text-sm font-bold text-[#81B398]">₹{item.amount?.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-3">
                      <button
                        onClick={() => { setSelectedItem(item); setActiveModal('agent-payout-info'); }}
                        className={`flex-[0.8] py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'}`}
                      >
                        <Info size={14} /> Details
                      </button>
                      <button
                        onClick={() => { setSelectedItem(item); setActiveModal('payout'); }}
                        className="flex-[1.2] py-2.5 bg-[#81B398] hover:bg-[#6FA085] text-[#FFFFFF] text-xs font-semibold rounded-lg transition-all flex justify-center items-center gap-2"
                      >
                        Process
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* History List (Payouts) */}
        {historyPayouts.length > 0 && (
          <div className="mt-8">
             <h4 className="text-sm font-bold uppercase tracking-wider mb-4">Settled Payouts History</h4>
             <div className="overflow-x-auto rounded-xl border" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className={`${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`}>
                      {['Date', 'Agent', 'Amount', 'Equivalent', 'Status'].map(h => (
                        <th key={h} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b ${textSecondary} ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-[#E2E8F0]' : 'divide-white/5'}`}>
                    {historyPayouts.map(item => {
                       const rawDate = new Date(item.date);
                       const displayDate = !isNaN(rawDate.getTime()) ? rawDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : item.date;
                       return (
                        <tr key={item.id} className={`${isLight ? 'bg-[#FFFFFF]' : 'bg-[#222938]'}`}>
                          <td className="px-6 py-4 text-xs font-medium">{displayDate}</td>
                          <td className="px-6 py-4 flex items-center gap-3">
                             <div className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                               {item.agentAvatar ? <img src={resolveUrl(item.agentAvatar)} alt={item.agentName} className="w-full h-full object-cover rounded-full" /> : <span className="font-bold text-xs uppercase">{item.agentName?.charAt(0) || '?'}</span>}
                             </div>
                             <span className="text-sm font-bold">{item.agentName}</span>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold">{item.amount} CR</td>
                          <td className="px-6 py-4 text-sm font-bold text-[#81B398]">₹{item.amount}</td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${getStatusBadgeStyles(item.status)}`}>
                               {item.status}
                             </span>
                          </td>
                        </tr>
                       )
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </section>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {activeModal && selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full rounded-2xl relative border flex flex-col overflow-hidden ${
                activeModal === 'verify' ? 'max-w-3xl h-auto' :
                activeModal === 'payout' ? 'max-w-md max-h-[90vh]' :
                activeModal === 'agent-payout-info' ? 'max-w-3xl max-h-[90vh]' :
                'max-w-4xl max-h-[90vh]'
              } ${surfaceClass}`}
            >
              {/* Modal Header (Only for some modals, Case-Review and Verify handles it inside) */}
              {(activeModal === 'payout') && (
                <div className={`p-5 md:p-6 border-b flex justify-between items-center shrink-0 ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${textPrimary}`}>
                    <Info size={16} className="text-[#81B398]" />
                    {activeModal === 'payout'  ? 'Process Manual Payout' : ''}
                  </h3>
                  <button onClick={closeAllModals} className={`p-2 rounded-lg transition-colors ${isLight ? 'text-[#718096] hover:bg-[#E2E8F0]' : 'text-[#9CA3AF] hover:bg-[#131720]'}`}>
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Modal Body */}
              <div className={`flex-1 ${activeModal === 'verify' ? 'p-0' : 'overflow-y-auto p-6 md:p-8 custom-scrollbar'}`}>

                {/* ── Case Review ── */}
                {activeModal === 'case-review' && (
                  <>
                    <button onClick={closeAllModals} className={`absolute top-6 right-6 p-2 rounded-lg transition-colors z-10 ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-[#131720]'}`}>
                      <X size={20} />
                    </button>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                      {/* Top Identity Section */}
                      <div className="lg:col-span-2 flex flex-col md:flex-row gap-6 md:items-center justify-between pb-6 border-b" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                         <div>
                           <h3 className="text-3xl font-extrabold tracking-tight mb-2 pr-8">{selectedItem.clientName}</h3>
                           <p className={`text-sm font-semibold flex items-center gap-2 ${textSecondary}`}>
                             <Briefcase size={14} className="text-[#81B398]" /> {selectedItem.businessUnit}
                           </p>
                         </div>
                         <div className="flex items-center gap-3">
                           <div className={`px-4 py-2 rounded-lg border text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                             <p className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Service</p>
                             <p className="text-sm font-bold truncate max-w-[150px]">{selectedItem.service}</p>
                           </div>
                           <div className={`px-4 py-2 rounded-lg border text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                             <p className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Date</p>
<p className="text-sm font-bold truncate max-w-[150px]">
  {selectedItem.date?.split('T')[0] || '—'}
</p>                           </div>
                         </div>
                      </div>

                      {/* Left Column */}
                      <div className="space-y-6">
                        <section className={`p-6 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                          <h5 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-4 mb-5 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'} ${textPrimary}`}>
                             Client Contact
                          </h5>
                          <InfoItem label="Phone"  value={selectedItem.clientPhone || 'N/A'} textPrimary={textPrimary} textSecondary={textSecondary} />
                          <InfoItem label="Address" value={selectedItem.clientAddress || 'N/A'} textPrimary={textPrimary} textSecondary={textSecondary} />
                          {selectedItem.description && (
                            <div className={`p-4 rounded-xl border mt-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                               <p className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>Notes</p>
                               <p className="text-xs font-medium italic leading-relaxed">"{selectedItem.description}"</p>
                            </div>
                          )}
                        </section>

                        {/* Business Branch Communication */}
                        <section className={`p-6 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                           <h5 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4 ${textPrimary}`}>
                             Branch Coordination
                           </h5>
                           {selectedItem.clientPhone && selectedItem.clientPhone !== 'N/A' ? (
                             <div className="flex gap-3 mt-4">
                               <a 
                                  href={`tel:${selectedItem.clientPhone}`} 
                                  className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:bg-[#1A202C]'
                                  }`}
                                >
                                  <Phone size={14} /> Call Branch
                                </a>
                                <a 
                                  href={`https://wa.me/${selectedItem.clientPhone.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="flex-1 py-2.5 px-4 bg-[#81B398] text-[#FFFFFF] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#6FA085]"
                                >
                                  <MessageSquare size={14} /> WhatsApp
                                </a>
                             </div>
                           ) : (
                             <p className={`text-xs font-medium italic ${textSecondary}`}>No valid branch contact number provided.</p>
                           )}
                        </section>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-6">
                        <section className={`p-6 rounded-2xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                          <h5 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-4 mb-5 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'} ${textPrimary}`}>
                             Handling Agent
                          </h5>
                          <div className="flex items-center gap-4 mb-4">
                             <div className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/5 text-[#F4F5F7]'}`}>
                               {selectedItem.agentAvatar ? (
                                 <img src={resolveUrl(selectedItem.agentAvatar)} alt={selectedItem.agentName} className="w-full h-full object-cover rounded-full" />
                               ) : (
                                 <span className="font-bold text-sm uppercase">{selectedItem.agentName?.charAt(0) || '?'}</span>
                               )}
                             </div>
                             <div className="min-w-0">
                               <p className="text-base font-bold truncate">{selectedItem.agentName}</p>
                               <p className={`text-xs font-medium truncate mt-0.5 ${textSecondary}`}>{selectedItem.agentEmail}</p>
                             </div>
                          </div>
                          {selectedItem.agentPhone && selectedItem.agentPhone !== '—' && (
                             <div className="flex items-center justify-between mt-2">
                               <span className={`text-xs font-medium flex items-center gap-1.5 ${textSecondary}`}><Phone size={12}/> {selectedItem.agentPhone}</span>
                             </div>
                          )}
                        </section>

                        <section className={`p-6 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                          <h5 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-4 mb-5 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'} ${textPrimary}`}>
                             Financials
                          </h5>
                          <div className="space-y-2">
  <InfoItem
    label="Total Sale Amount"
    value={`₹${selectedItem.totalAmount?.toLocaleString() ?? '0'}`}
    textPrimary={textPrimary}
    textSecondary={textSecondary}
  />

  <InfoItem
    label={`Admin Commission (${selectedItem?.commission || 0}%)`}
    value={`₹${
      selectedItem.totalAmount
        ? (
            selectedItem.totalAmount *
            ((selectedItem?.commission || 0) / 100)
          ).toLocaleString()
        : '0'
    }`}
    textPrimary={textPrimary}
    textSecondary={textSecondary}
  />

  <div
    className="pt-3 mt-3 border-t flex justify-between items-center"
    style={{
      borderColor: isLight
        ? '#E2E8F0'
        : 'rgba(255,255,255,0.05)'
    }}
  >
    <span
      className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}
    >
      Agent Credit
    </span>

    <span className="text-xl font-extrabold text-[#81B398]">
      {selectedItem.agentCredit?.toLocaleString() ?? '0'} CR
    </span>
  </div>
</div>
                        </section>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Verify Credits (Two Columns Layout) ── */}
                {activeModal === 'verify' && (
                  <div className="flex flex-col md:flex-row h-full">
                    {/* Left: Identity Column */}
                    <div className={`p-8 md:w-[40%] flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720]/50 border-white/5'}`}>
                       <div className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 border shadow-sm mb-5 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/5 text-[#F4F5F7]'}`}>
                         {selectedItem.agentAvatar ? (
                            <img src={resolveUrl(selectedItem.agentAvatar)} alt={selectedItem.agentName} className="w-full h-full object-cover rounded-full" />
                         ) : (
                            <span className="font-bold text-3xl uppercase">{selectedItem.agentName?.charAt(0) || '?'}</span>
                         )}
                       </div>
                       <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>Verifying credits for</p>
                       <p className="text-xl font-extrabold tracking-tight mb-1 leading-tight">{selectedItem.clientName}</p>
                       <p className={`text-sm font-semibold mt-1 ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>via {selectedItem.agentName}</p>
                    </div>
                    
                    {/* Right: Input Column */}
                    <div className="p-8 md:w-[60%] flex flex-col justify-center space-y-6 relative">
                       <button onClick={closeAllModals} className={`absolute top-4 right-4 p-2 rounded-lg transition-colors z-10 ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-[#131720]'}`}>
                         <X size={20} />
                       </button>

                       <div>
                         <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${textSecondary}`}>Verify & Adjust Credit Points</p>
                         <div className={`p-6 rounded-2xl flex flex-col items-center justify-center border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                            <div className="flex items-center justify-center gap-3">
                              <input
                                type="number" autoFocus placeholder="000"
                                className={`bg-transparent text-5xl font-extrabold outline-none w-32 text-center border-b-2 border-transparent focus:border-[#81B398] transition-colors ${textPrimary} placeholder:${textSecondary}`}
                                value={settleAmount} onChange={e => setSettleAmount(e.target.value)}
                              />
                              <span className="text-3xl font-extrabold text-[#81B398]">CR</span>
                            </div>
                            <p className={`text-[10px] font-semibold uppercase tracking-wider mt-4 ${textSecondary}`}>One Credit = 1 INR</p>
                         </div>
                       </div>

                       <div className="space-y-1.5">
                         <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>Admin Remarks (optional)</label>
                         <textarea
                           rows={2} placeholder="Add a note or reason for modification..."
                           className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all resize-none border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent focus:bg-[#222938] focus:border-[#81B398]'}`}
                           value={settleRemarks} onChange={e => setSettleRemarks(e.target.value)}
                         />
                       </div>
                       
                       <button
                         disabled={isProcessing || !settleAmount}
                         onClick={handleLeadSettlement}
                         className="w-full py-3.5 bg-[#48477A] hover:bg-[#3d3c67] text-[#FFFFFF] rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                       >
                         {isProcessing ? <Loader2 size={16} className="animate-spin" /> : null}
                         {isProcessing ? 'Processing...' : 'Transfer to Wallet'}
                       </button>
                    </div>
                  </div>
                )}

                {/* ── Agent Payout Info (Two Columns Layout) ── */}
                {activeModal === 'agent-payout-info' && (
                  <>
                    <button onClick={closeAllModals} className={`absolute top-6 right-6 p-2 rounded-lg transition-colors z-10 ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-[#131720]'}`}>
                      <X size={20} />
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                      
                      {/* Left: Agent Profile */}
                      <div className="flex flex-col items-center text-center">
                        <div className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 border shadow-sm mb-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/5 text-[#F4F5F7]'}`}>
                          {selectedItem.agentAvatar ? (
                             <img src={resolveUrl(selectedItem.agentAvatar)} alt={selectedItem.agentName} className="w-full h-full object-cover rounded-full" />
                          ) : (
                             <span className="font-bold text-3xl uppercase">{selectedItem.agentName?.charAt(0) || '?'}</span>
                          )}
                        </div>
                        <h3 className="text-2xl font-extrabold tracking-tight mb-1">{selectedItem.agentName}</h3>
                        <p className={`text-sm font-medium ${textSecondary}`}>{selectedItem.agentEmail}</p>
                        
                        {selectedItem.agentPhone && (
                          <div className={`w-full mt-6 rounded-2xl border p-5 flex flex-col gap-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                            <div className="flex items-center justify-center gap-2 text-sm font-bold">
                              <Phone size={14} className={textSecondary} /> {selectedItem.agentPhone}
                            </div>
                            <div className="flex gap-3">
                              <a href={`tel:${selectedItem.agentPhone}`} className={`flex-1 py-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'}`}>
                                <Phone size={14} /> Call
                              </a>
                              <a href={`https://wa.me/${selectedItem.agentPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-[#81B398] text-[#FFFFFF] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#6FA085]">
                                <MessageSquare size={14} /> WhatsApp
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Request Details */}
                      <div className="space-y-6 flex flex-col justify-center">
                        <div className="grid grid-cols-2 gap-4">
                          <div className={`p-5 border rounded-2xl text-center flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>Requested Amount</p>
                            <p className="text-2xl font-extrabold text-[#81B398]">₹{selectedItem.amount?.toLocaleString()}</p>
                          </div>
                          <div className={`p-5 border rounded-2xl text-center flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>Lifetime Leads</p>
                            <p className="text-2xl font-extrabold">{getAgentTotalLeads(selectedItem.userId)}</p>
                          </div>
                        </div>
                        
                        <div className={`space-y-3 p-6 border rounded-2xl ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                           <InfoItem
                             label="Requested On"
                             value={
                               selectedItem.date && selectedItem.date !== '—'
                                 ? new Date(selectedItem.date).toLocaleString('en-IN', {
                                     day: '2-digit', month: 'short', year: 'numeric',
                                     hour: '2-digit', minute: '2-digit', hour12: true
                                   })
                                 : '—'
                             }
                             textPrimary={textPrimary} textSecondary={textSecondary}
                           />
                           <InfoItem label="Status" value={selectedItem.status} textPrimary={textPrimary} textSecondary={textSecondary} />
                           {selectedItem.remarks && (
                             <div className="pt-3 mt-3 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                               <span className={`text-[10px] font-semibold uppercase tracking-wider block mb-2 ${textSecondary}`}>Admin Remarks</span>
                               <p className="text-sm font-medium leading-relaxed italic">"{selectedItem.remarks}"</p>
                             </div>
                           )}
                        </div>
                      </div>

                    </div>
                  </>
                )}

                {/* ── Process Payout ── */}
                {activeModal === 'payout' && (
                  <div className="text-center space-y-6 max-w-sm mx-auto">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${isLight ? 'bg-[#81B398]/10 text-[#81B398]' : 'bg-[#81B398]/20 text-[#81B398]'}`}>
                      <Wallet size={32} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight">Process Manual Payout</h3>
                      <p className={`text-sm font-medium mt-2 leading-relaxed ${textSecondary}`}>
                        Please transfer <b className={textPrimary}>₹{selectedItem.amount?.toLocaleString()}</b> manually to <b className={textPrimary}>{selectedItem.agentName}</b> via GPay, WhatsApp, or Bank Transfer.
                      </p>
                    </div>

                    <div className={`rounded-xl border p-4 text-left ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-3 text-center ${textSecondary}`}>Agent Contact</p>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-sm font-bold flex items-center gap-2"><Phone size={14} className={textSecondary}/> {selectedItem.agentPhone || 'No Phone Available'}</span>
                      </div>
                      <div className="flex gap-3">
                        <a href={`tel:${selectedItem.agentPhone}`} className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'}`}>
                          Call
                        </a>
                        <a href={`https://wa.me/${selectedItem.agentPhone}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-[#81B398] hover:bg-[#6FA085] text-[#FFFFFF] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all">
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className={`border rounded-xl p-4 text-left ${isLight ? 'bg-[#DAC18A]/10 border-[#DAC18A]/20' : 'bg-[#DAC18A]/5 border-[#DAC18A]/10'}`}>
                      <p className="text-[10px] font-bold text-[#DAC18A] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <AlertCircle size={14} /> Admin Action Required
                      </p>
                      <p className={`text-xs font-medium leading-relaxed ${textSecondary}`}>
                        Ensure the payment is successfully completed before confirming. This action will permanently update the withdrawal status in the system.
                      </p>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>Transaction Reference (Optional)</label>
                      <input
                        type="text" placeholder="e.g. UTR or GPay Ref..."
                        className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent focus:bg-[#222938] focus:border-[#81B398]'}`}
                        value={settleRemarks} onChange={e => setSettleRemarks(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={confirmWithdrawal}
                      disabled={isProcessing}
                      className="w-full py-3.5 bg-[#81B398] hover:bg-[#6FA085] text-[#FFFFFF] rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                      {isProcessing ? <Loader2 size={16} className="animate-spin" /> : null}
                      {isProcessing ? 'Processing...' : 'Confirm Payment & Approve'}
                    </button>
                  </div>
                )}
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
      initial={{y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      className={`min-w-0 p-6 lg:p-8 rounded-2xl border flex flex-col transition-all duration-300 ${surfaceClass} ${className || ''}`}
    >
      <div className="mb-6 shrink-0">
        <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>{title}</h4>
        <p className={`text-xs font-medium mt-1 ${textSecondary}`}>{subtitle}</p>
      </div>
      <div className="w-full flex-1 relative h-[250px] overflow-hidden">
        {children}
      </div>
    </motion.div>
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

const InfoItem = ({ label, value, textSecondary, textPrimary }) => (
  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'rgba(156, 163, 175, 0.1)' }}>
    <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>{label}</span>
    <span className={`text-sm font-bold truncate max-w-[200px] text-right ${textPrimary}`}>{value}</span>
  </div>
);

export default CreditSettlement;