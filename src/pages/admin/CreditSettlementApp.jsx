import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Search, Wallet, X, Loader2, User,
  Phone, Info, MapPin,
  Sparkles, FileImage, Zap, AlertCircle,
  Briefcase, IndianRupee,
  Activity,
  CreditCard,
  SearchX,
  MessageSquare,
  LayoutGrid
} from 'lucide-react';
import Chart from 'react-apexcharts';
import ApexCharts from 'apexcharts';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

// ─── Field map ─────────────────────────────────────────────────────────────────
const mapWithdrawal = (w) => ({
  id: w.id,
  agentName: w.agent_name || '—',
  agentPhone: w.agent_phone || '',
  agentAvatar: w.agent_avatar_url || '',
  amount: w.requested_credits || 0,
  status: w.status || 'pending',
  remarks: w.remarks || '',
  date: w.requested_on || '—',
  userId: w.user_id,
});

// ─── Main Component ────────────────────────────────────────────────────────────
const CreditSettlementApp = () => {

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

  // ── Theme context ─────────────────────────────────────────────────────────────
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const resolveUrl = (url) => {
    if (!url) return "";
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    return url;
  };

  // ── Single API fetch ─────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
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

      setLeads((payload.paid_leads || []).map(l => ({
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
        agentPhone: l.agent_phone,
        agentEmail: l.agent_email,
        agentAvatar: l.agent_avatar_url || '',
        date: l.date,
        credits: l.credits,
        remarks: l.ledger_remarks,
        totalAmount: l.total_sale_amount,
        commission: l.commission_amount,
        agentCredit: l.agent_credit,
        creditStatus: l.credit_status || '',
      })));

      setWithdrawals((payload.withdrawals || []).map(mapWithdrawal));
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
      alert('Credits verified and transferred to agent wallet successfully!');
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
      if (l.creditStatus !== 'paid') return false;
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

  const pendingPayouts = useMemo(() => withdrawals.filter(w => w.status === 'pending'), [withdrawals]);
  const settledPayouts = useMemo(() => withdrawals.filter(w => w.status === 'approved' || w.status === 'credited'), [withdrawals]);
  const totalPaidAmount = useMemo(() => settledPayouts.reduce((sum, w) => sum + (Number(w.amount) || 0), 0), [settledPayouts]);

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
          chart: { id: 'payout-chart', toolbar: { show: false }, animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          colors: ['#81B398'],
          stroke: { curve: 'smooth', width: 3 },
          xaxis: {
            categories: sortedDates.length ? sortedDates.map(d => d.split('-').slice(1).join('/')) : ['N/A'],
            labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } },
            axisBorder: { show: false }, axisTicks: { show: false }
          },
          yaxis: { labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } } },
          grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: { lines: { show: false } } },
          fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: isLight ? 0.3 : 0.4, opacityTo: 0 } },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
      distribution: {
        series: [
          leads.length,
          pendingPayouts.length,
          settledPayouts.length,
        ].some(v => v > 0) ? [
          leads.length,
          pendingPayouts.length,
          settledPayouts.length,
        ] : [1],
        options: {
          chart: { id: 'dist-chart', animations: { enabled: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent' },
          labels: [
            leads.length,
            pendingPayouts.length,
            settledPayouts.length,
          ].some(v => v > 0) ? ['Total Rewards', 'Pending Withdrawals', 'Settled'] : ['No Data'],
          colors: ['#48477A', '#F59E0B', '#81B398'],
          legend: { position: 'bottom', fontSize: '11px', fontWeight: 600, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '75%' } } },
          stroke: { show: false },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
    };
  }, [leads, pendingPayouts, settledPayouts, isLight]);

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'credited' || s === 'completed') return 'bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20';
    if (s === 'rejected' || s === 'failed') return 'bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20';
    if (s === 'pending') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    if (s === 'in progress' || s === 'started') return 'bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20';
    return isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5';
  };

  if (loadingLeads || loadingWD) return <SkeletonLoader isLight={isLight} />;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>

      {/* ── HEADER (FREE) ── */}
      <div className="px-1 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight mb-1">Credit & Payment Settlement</h2>
          <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Active Settlement Management</p>
        </div>
      </div>

      {/* ── STATUS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
        <QuickStat label="Unpaid Rewards" count={leads.filter(l => l.creditStatus !== 'verified' && l.creditStatus !== 'approved').length} isLight={isLight} />
        <QuickStat label="Pending Payouts" count={pendingPayouts.length} isLight={isLight} />
        <QuickStat label="Settled Payouts" count={settledPayouts.length} isLight={isLight} />
        <QuickStat label="Total Paid Amount" count={`₹${totalPaidAmount.toLocaleString()}`} isLight={isLight} />
      </div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 mb-4">
        <div className="lg:col-span-8">
          <ChartCard title="Daily Settlement Flow" subtitle="System inquiry volume analytics" isLight={isLight} onDownload={() => ApexCharts.exec('payout-chart', 'downloadPNG')}>
            <Chart options={chartConfigs.payouts.options} series={chartConfigs.payouts.series} type="area" height={260} />
          </ChartCard>
        </div>
        <div className="lg:col-span-4">
          <ChartCard title="Fund Status" subtitle="Breakdown of pending vs paid" isLight={isLight} onDownload={() => ApexCharts.exec('dist-chart', 'downloadPNG')}>
            <div className="flex justify-center pt-2">
              <Chart options={chartConfigs.distribution.options} series={chartConfigs.distribution.series} type="donut" width="100%" height={260} />
            </div>
          </ChartCard>
        </div>
      </div>

      {/* ── REWARD QUEUE ── */}
      <div className={`rounded-3xl border overflow-hidden transition-all duration-200 flex flex-col ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
        <div className={`p-4 md:p-5 border-b flex flex-col md:flex-row items-center justify-between gap-4 ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]/50' : 'border-white/10 bg-[#1A1A24]/50'}`}>
          <h3 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid size={14} strokeWidth={2.5} className="text-[#81B398]" /> Verify Credits
          </h3>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-white/10 focus-within:border-[#81B398]'}`}>
              <Search size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
              <input type="text" placeholder="Search Client or ID..." className={`bg-transparent outline-none text-[10px] font-bold uppercase tracking-wider w-full ${isLight ? 'text-[#1A202C] placeholder:text-[#A0AEC0]' : 'text-[#F4F5F7] placeholder:text-[#718096]'}`} value={rewardSearch} onChange={e => setRewardSearch(e.target.value)} />
            </div>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-white/10 focus-within:border-[#81B398]'}`}>
              <Briefcase size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
              <select className={`w-full bg-transparent outline-none text-[10px] font-bold uppercase tracking-wider cursor-pointer ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`} value={rewardFilterBU} onChange={e => setRewardFilterBU(e.target.value)}>
                <option value="">All Branches</option>
                {uniqueBUs.map(bu => <option key={bu} value={bu}>{bu}</option>)}
              </select>
            </div>
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-white/10 focus-within:border-[#81B398]'}`}>
              <User size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
              <select className={`w-full bg-transparent outline-none text-[10px] font-bold uppercase tracking-wider cursor-pointer ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`} value={rewardFilterAgent} onChange={e => setRewardFilterAgent(e.target.value)}>
                <option value="">All Agents</option>
                {uniqueRewardAgents.map(agent => <option key={agent} value={agent}>{agent}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {errorLeads ? (
            <div className={`flex flex-col items-center justify-center py-20 gap-3 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#F0524F]' : 'bg-[#222938] border-white/10 text-[#F0524F]'}`}>
              <AlertCircle size={26} strokeWidth={2.5} />
              <p className="text-[10px] font-bold uppercase tracking-wider">{errorLeads}</p>
              <button onClick={fetchAll} className="mt-2 px-6 py-2.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all">Retry</button>
            </div>
          ) : filteredRewards.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-24 gap-3 ${isLight ? 'text-[#A0AEC0]' : 'text-[#718096]'}`}>
              <SearchX size={28} strokeWidth={2.5} />
              <p className="text-[10px] font-bold uppercase tracking-wider">No pending requests found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
              {filteredRewards.map(item => {
                const commissionVal = item.commission || (item.totalAmount ? item.totalAmount * 0.10 : 0);
                
                return (
                  <div key={item.ledgerId} className={`border rounded-3xl p-5 transition-all duration-200 flex flex-col group ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#131720] border-white/10 hover:border-[#81B398]'}`}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-extrabold uppercase tracking-tight truncate">{item.clientName}</h4>
                        <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                          <Briefcase size={10} className="text-[#81B398]"/> {item.businessUnit}
                        </p>
                        <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                          <User size={10} className="text-[#81B398]"/> {item.agentName}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-sm uppercase shrink-0 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/10 text-[#F4F5F7]'}`}>
                        {item.agentAvatar ? (
                           <img src={resolveUrl(item.agentAvatar)} alt={item.agentName} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                        ) : (
                           <span>{item.agentName?.charAt(0) || '?'}</span>
                        )}
                        {item.agentAvatar && <span className="hidden">{item.agentName?.charAt(0)}</span>}
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className={`rounded-2xl p-4 border mb-4 flex-1 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-2.5">
                        <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>Service</span>
                        <span className={`text-right truncate max-w-[120px] ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>{item.service}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-2.5">
                        <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>Admin Commission</span>
                        <span className="text-right font-extrabold">₹{commissionVal.toLocaleString()}</span>
                      </div>
                      <div className={`flex justify-between items-center pt-3 mt-3 border-t text-[10px] font-bold uppercase tracking-wider ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                        <span className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}>Agent Credit</span>
                        <span className="text-sm font-extrabold text-[#81B398]">{item.agentCredit?.toLocaleString() ?? 'N/A'} CR</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedItem(item); setActiveModal('case-review'); }}
                        className={`flex-1 py-3.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'}`}
                      >
                        <Info size={14} strokeWidth={2.5} /> Info
                      </button>
                      <button
                        onClick={() => { setSelectedItem(item); setSettleAmount(item.agentCredit); setActiveModal('verify'); }}
                        className="flex-[1.2] py-3.5 bg-[#81B398] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-[#6FA085]"
                      >
                        Verify CR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── AGENT PAYOUTS ── */}
      <div className={`rounded-3xl border overflow-hidden transition-all duration-200 mt-6 flex flex-col ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
        <div className={`p-4 md:p-5 border-b flex flex-col md:flex-row items-center justify-between gap-4 ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]/50' : 'border-white/10 bg-[#1A1A24]/50'}`}>
          <h3 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid size={14} strokeWidth={2.5} className="text-[#81B398]" /> Agent Payouts
          </h3>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors w-full md:w-auto ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] focus-within:border-[#81B398]' : 'bg-[#131720] border-transparent focus-within:border-[#81B398]'}`}>
            <Search size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
            <input
              type="text" placeholder="Search Agent..."
              className={`w-full bg-transparent outline-none text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#1A202C] placeholder:text-[#A0AEC0]' : 'text-[#F4F5F7] placeholder:text-[#718096]'}`}
              value={payoutSearch} onChange={e => setPayoutSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 md:p-6">
          {errorWD ? (
             <div className={`flex flex-col items-center justify-center py-20 gap-3 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#F0524F]' : 'bg-[#222938] border-white/10 text-[#F0524F]'}`}>
               <AlertCircle size={26} strokeWidth={2.5} />
               <p className="text-[10px] font-bold uppercase tracking-wider">{errorWD}</p>
               <button onClick={fetchAll} className="mt-2 px-6 py-2.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase active:scale-95 transition-all">Retry</button>
             </div>
          ) : pendingPayouts.length === 0 ? (
             <div className={`flex flex-col items-center justify-center py-24 gap-3 ${isLight ? 'text-[#A0AEC0]' : 'text-[#718096]'}`}>
               <Wallet size={28} strokeWidth={2.5} className="opacity-50" />
               <p className="text-[10px] font-bold uppercase tracking-wider">No pending payouts found</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {pendingPayouts.map(item => {
                const rawDate = new Date(item.date);
                const displayDate = !isNaN(rawDate.getTime()) ? rawDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : item.date;

                return (
                  <div key={item.id} className={`border rounded-3xl p-5 md:p-6 transition-all duration-200 flex flex-col h-full group ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#131720] border-white/10 hover:border-[#81B398]'}`}>
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-12 w-12 rounded-full overflow-hidden flex items-center justify-center font-extrabold text-sm uppercase shrink-0 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/5 text-[#F4F5F7]'}`}>
                          {item.agentAvatar ? (
                             <img src={resolveUrl(item.agentAvatar)} alt={item.agentName} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                          ) : (
                             <span>{item.agentName?.charAt(0) || '?'}</span>
                          )}
                          {item.agentAvatar && <span className="hidden">{item.agentName?.charAt(0)}</span>}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-sm font-extrabold uppercase tracking-tight truncate">{item.agentName}</h4>
                           <p className={`text-[9px] font-bold mt-1 uppercase tracking-wider truncate ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{displayDate}</p>
                        </div>
                      </div>
                    </div>

                    <div className={`p-4 rounded-2xl border mb-5 flex-1 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-transparent'}`}>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider mb-2.5">
                        <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>Claim Amount</span>
                        <span className="text-lg font-extrabold">{item.amount?.toLocaleString()} <span className="text-[10px]">CR</span></span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-2 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                        <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>Equivalent</span>
                        <span className="text-sm font-extrabold text-[#81B398]">₹{item.amount?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <button
                        onClick={() => { setSelectedItem(item); setActiveModal('agent-payout-info'); }}
                        className={`flex-[0.8] py-3.5 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'}`}
                      >
                        <Info size={14} strokeWidth={2.5} /> Info
                      </button>
                      <button
                        onClick={() => { setSelectedItem(item); setActiveModal('payout'); }}
                        className="flex-[1.2] py-3.5 bg-[#81B398] text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-[#6FA085]"
                      >
                        Process
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Settled History List */}
        {settledPayouts.length > 0 && (
          <div className="p-4 md:p-6 pt-0">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className={`border-b ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                      {['Date', 'Agent', 'Amount (CR)', 'Equivalent (₹)', 'Status'].map((h, i) => (
                        <th key={h} className={`px-5 py-4 text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'} ${i === 4 ? 'text-center' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? 'divide-[#E2E8F0]' : 'divide-white/5'}`}>
                    {settledPayouts.map(w => {
                      const rawDate = new Date(w.date);
                      const displayDate = !isNaN(rawDate.getTime()) ? rawDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : w.date;
                      return (
                        <tr key={w.id} className={`transition-colors ${isLight ? 'hover:bg-[#F4F5F7]/50' : 'hover:bg-[#1A1A24]'}`}>
                          <td className="px-5 py-4 text-xs font-extrabold uppercase tracking-tight">{displayDate}</td>
                          <td className="px-5 py-4 flex items-center gap-3">
                             <div className={`h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                               {w.agentAvatar ? <img src={resolveUrl(w.agentAvatar)} alt={w.agentName} className="w-full h-full object-cover rounded-full" /> : <span className="font-extrabold text-xs uppercase">{w.agentName?.charAt(0) || '?'}</span>}
                             </div>
                             <span className="text-xs font-extrabold uppercase">{w.agentName}</span>
                          </td>
                          <td className="px-5 py-4 text-xs font-extrabold uppercase tracking-tight">{w.amount}</td>
                          <td className="px-5 py-4 text-xs font-extrabold uppercase text-[#81B398] tracking-tight">₹{w.amount}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${getStatusStyles(w.status)}`}>
                              {w.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        )}
      </div>

      {/* ── MODALS (Bento Style) ── */}
      <AnimatePresence>
        {activeModal && selectedItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border shadow-2xl ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                <h3 className="text-lg font-extrabold uppercase tracking-tight flex items-center gap-2">
                  <Info size={18} strokeWidth={2.5} className="text-[#81B398]" />
                  {activeModal === 'agent-payout-info' ? 'Agent Withdrawal Info'
                    : activeModal === 'verify'  ? 'Verify Agent Credits'
                    : activeModal === 'payout'  ? 'Process Manual Payout'
                    : 'Lead Details'}
                </h3>
                <button onClick={closeAllModals} className={`p-2 rounded-full transition-colors ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-white/10'}`}>
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 no-scrollbar">

                {/* ── Case Review ── */}
                {activeModal === 'case-review' && (
                  <div className="space-y-6">
                    <section className={`p-6 border rounded-3xl flex flex-col gap-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                        <IndianRupee size={14} strokeWidth={2.5} className="text-[#81B398]" /> Financial Breakdown
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                          <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Total Sale Amount</p>
                          <p className="text-xl font-extrabold">₹{selectedItem.totalAmount?.toLocaleString() ?? 'N/A'}</p>
                        </div>
                      <div
  className={`p-4 rounded-2xl border ${
    isLight
      ? 'bg-[#FFFFFF] border-[#E2E8F0]'
      : 'bg-[#222938] border-white/10'
  }`}
>
  <p
    className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${
      isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
    }`}
  >
    Admin Commission
  </p>

  <p className="text-xl font-extrabold">
    ₹
    {(
      ((selectedItem.totalAmount || 0) *
        (selectedItem.commission || 10)) /
      100
    ).toLocaleString()}
  </p>

  <p
    className={`text-xs mt-1 ${
      isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
    }`}
  >
    {selectedItem.commission || 10}% Commission
  </p>
</div>
                        <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                          <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 text-[#81B398] dark:text-[#81B398]`}>Agent Credit</p>
                          <p className="text-xl font-extrabold text-[#81B398]">{selectedItem.agentCredit?.toLocaleString() ?? 'N/A'} CR</p>
                        </div>
                      </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <section className={`p-6 border rounded-3xl space-y-4 flex flex-col ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider border-b pb-3 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>Client Details</p>
                        <p className="text-sm font-extrabold uppercase">{selectedItem.clientName}</p>
                        <div className={`flex items-center gap-2 text-[10px] font-bold tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                          <Phone size={12} strokeWidth={2.5} /> {selectedItem.clientPhone || 'N/A'}
                        </div>
                        <div className={`flex items-start gap-2 text-[10px] font-bold tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                          <MapPin size={12} strokeWidth={2.5} className="shrink-0" /> {selectedItem.clientAddress || 'N/A'}
                        </div>
                        {selectedItem.description && (
                          <div className={`p-4 mt-auto rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-transparent'}`}>
                             <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Notes</p>
                             <p className="text-xs font-medium italic leading-relaxed">"{selectedItem.description}"</p>
                          </div>
                        )}
                      </section>

                      <section className={`p-6 border rounded-3xl space-y-4 flex flex-col ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider border-b pb-3 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>Business Branch</p>
                        <p className="text-sm font-extrabold uppercase">{selectedItem.businessUnit}</p>
                        <p className="text-[10px] font-extrabold text-[#81B398] uppercase tracking-wider">{selectedItem.service}</p>
                        <div className="flex gap-2 w-full pt-2 mt-auto border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                          <a
                            href={`tel:${selectedItem.agentPhone}`} // Fallback to agentPhone if branch phone unavailable
                            className={`flex-1 py-3 mt-4 rounded-xl border text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                              isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] hover:border-[#81B398]'
                            }`}
                          >
                            <Phone size={14} strokeWidth={2.5} /> Call
                          </a>
                          <a
                            href={`https://wa.me/${selectedItem.agentPhone?.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-3 mt-4 rounded-xl border border-transparent text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
                          >
                            <MessageSquare size={14} strokeWidth={2.5} /> WhatsApp
                          </a>
                        </div>
                      </section>

                      <section className={`p-6 border rounded-3xl md:col-span-2 space-y-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider border-b pb-3 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>Handled By</p>
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center font-extrabold text-sm uppercase shrink-0 border overflow-hidden ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/10 text-[#F4F5F7]'}`}>
                            {selectedItem.agentAvatar ? (
                               <img src={resolveUrl(selectedItem.agentAvatar)} alt={selectedItem.agentName} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                            ) : (
                               <span>{selectedItem.agentName?.charAt(0) || '?'}</span>
                            )}
                            {selectedItem.agentAvatar && <span className="hidden">{selectedItem.agentName?.charAt(0)}</span>}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold uppercase tracking-tight">{selectedItem.agentName}</p>
                            <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Email: {selectedItem.agentEmail || 'Email not available'}</p>
                          </div>
                        </div>
                      </section>
                    </div>
                  </div>
                )}

                {/* ── Agent Payout Info ── */}
                {activeModal === 'agent-payout-info' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left: Agent Profile */}
                    <div className="flex flex-col items-center text-center">
                      <div className={`h-24 w-24 rounded-full overflow-hidden flex items-center justify-center shrink-0 border mb-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                        {selectedItem.agentAvatar ? (
                           <img src={resolveUrl(selectedItem.agentAvatar)} alt={selectedItem.agentName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                           <span className="font-extrabold text-3xl uppercase">{selectedItem.agentName?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight mb-1 uppercase">{selectedItem.agentName}</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        Total Leads Handled: <span className="font-extrabold">{leads.filter(l => l.agentId === selectedItem.userId).length}</span>
                      </p>
                      
                      {selectedItem.agentPhone && (
                        <div className={`w-full mt-6 rounded-3xl border p-5 flex flex-col gap-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                          <div className={`flex items-center justify-center gap-2 text-xs font-bold ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                            <Phone size={14} strokeWidth={2.5} /> {selectedItem.agentPhone}
                          </div>
                          <div className="flex gap-3">
                            <a href={`tel:${selectedItem.agentPhone}`} className={`flex-1 py-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'}`}>
                              Call
                            </a>
                            <a href={`https://wa.me/${selectedItem.agentPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-3.5 bg-[#81B398] text-[#FFFFFF] rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:bg-[#6FA085]">
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Request Details */}
                    <div className="space-y-4 flex flex-col justify-center">
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-5 border rounded-3xl text-center flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                          <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Requested Amount</p>
                          <p className="text-2xl font-extrabold text-[#81B398]">₹{selectedItem.amount?.toLocaleString()}</p>
                        </div>
                        <div className={`p-5 border rounded-3xl text-center flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                          <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Status</p>
                          <p className="text-xl font-extrabold capitalize">{selectedItem.status}</p>
                        </div>
                      </div>

                      <div className={`space-y-3 p-6 border rounded-3xl ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
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
                           isLight={isLight}
                         />
                         {selectedItem.remarks && (
                           <div className="pt-3 mt-3 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                             <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Admin Remarks</span>
                             <p className="text-xs font-medium leading-relaxed italic">"{selectedItem.remarks}"</p>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Verify Credits ── */}
                {activeModal === 'verify' && (
                  <div className="max-w-md mx-auto space-y-6">
                    <div className={`p-6 rounded-3xl border text-center ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#1A1A24] border-white/10'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Verifying credits for</p>
                      <p className="text-lg font-extrabold uppercase tracking-tight">{selectedItem.clientName}</p>
                      <p className={`text-[9px] font-bold uppercase tracking-wider mt-2 text-[#81B398]`}>via Agent: {selectedItem.agentName}</p>
                    </div>

                    <div className={`p-8 rounded-3xl border text-center bg-[#81B398] border-transparent text-white`}>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider mb-6">Verify & Adjust Credit Points</p>
                      <div className="flex items-center justify-center gap-4">
                        <input
                          type="number" autoFocus placeholder="000"
                          className="bg-transparent text-5xl font-extrabold outline-none w-48 text-center placeholder:text-white/40"
                          value={settleAmount} onChange={e => setSettleAmount(e.target.value)}
                        />
                        <span className="text-3xl font-extrabold">CR</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Admin Remarks (optional)</label>
                      <textarea
                        rows={3} placeholder="Add a note or reason for modification..."
                        className={`w-full px-4 py-3 border rounded-xl text-sm font-bold outline-none resize-none transition-all ${
                          isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-white placeholder:text-[#718096] focus:border-[#81B398]'
                        }`}
                        value={settleRemarks} onChange={e => setSettleRemarks(e.target.value)}
                      />
                    </div>

                    <button
                      disabled={isProcessing || !settleAmount}
                      onClick={handleLeadSettlement}
                      className="w-full py-4 bg-[#81B398] text-white rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:bg-[#6FA085]"
                    >
                      {isProcessing
                        ? <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> Processing...</>
                        : 'Verify & Transfer to Agent Wallet'}
                    </button>
                  </div>
                )}

                {/* ── Process Payout ── */}
                {activeModal === 'payout' && (
                  <div className="text-center space-y-6 max-w-sm mx-auto">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto border bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20`}>
                      <Wallet size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold uppercase tracking-tight">Process Manual Payout</h3>
                      <p className={`text-xs font-medium mt-3 leading-relaxed ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        Please transfer <b className={isLight ? 'text-[#1A202C] font-extrabold' : 'text-[#F4F5F7] font-extrabold'}>₹{selectedItem.amount?.toLocaleString()}</b> manually to <b className="text-[#81B398] font-extrabold uppercase">{selectedItem.agentName}</b> via GPay, WhatsApp, or Bank Transfer.
                      </p>
                    </div>

                    <div className={`border rounded-3xl p-5 text-left ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-3 flex justify-center ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Agent Contact</p>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-sm font-extrabold flex items-center gap-2">
                          <Phone size={14} strokeWidth={2.5} className="text-[#81B398]"/> {selectedItem.agentPhone || 'No Phone Available'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${selectedItem.agentPhone}`} className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase text-center flex items-center justify-center gap-1.5 transition-all active:scale-95 ${isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] hover:border-[#81B398]'}`}>
                          Call Now
                        </a>
                        <a href={`https://wa.me/${selectedItem.agentPhone?.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 py-3 bg-[#81B398] text-white rounded-xl text-[10px] font-bold uppercase text-center hover:bg-[#6FA085] transition-all flex items-center justify-center gap-1.5 active:scale-95">
                          WhatsApp
                        </a>
                      </div>
                    </div>

                    <div className={`rounded-2xl border p-5 text-left ${isLight ? 'bg-[#F0524F]/5 border-[#F0524F]/10' : 'bg-[#F0524F]/10 border-[#F0524F]/20'}`}>
                      <p className="text-[10px] font-bold text-[#F0524F] uppercase flex items-center gap-1.5 mb-2">
                        <AlertCircle size={14} strokeWidth={2.5} /> Admin Action Required
                      </p>
                      <p className="text-xs font-medium text-[#F0524F] leading-relaxed">
                        Ensure the payment is successfully completed before confirming. This action will permanently update the withdrawal status.
                      </p>
                    </div>

                    <div className="space-y-2 text-left">
                      <label className={`text-[10px] font-bold uppercase tracking-wider pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        Transaction Reference (Optional)
                      </label>
                      <input
                        type="text" placeholder="e.g. UTR or GPay Ref..."
                        className={`w-full px-4 py-3.5 border rounded-xl text-sm font-bold outline-none transition-all ${
                          isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] placeholder:text-[#718096] focus:border-[#81B398]'
                        }`}
                        value={settleRemarks} onChange={e => setSettleRemarks(e.target.value)}
                      />
                    </div>

                    <button
                      onClick={confirmWithdrawal}
                      disabled={isProcessing}
                      className="w-full py-4 bg-[#81B398] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#6FA085] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isProcessing
                        ? <><Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> Processing...</>
                        : 'Confirm Payment & Approve'}
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

// ─── Helper Components ─────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, onDownload, isLight, className }) => (
  <div className={`rounded-3xl p-5 md:p-6 border transition-all duration-200 h-full flex flex-col relative group ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} ${className || ''}`}>
    <div className="mb-5 flex justify-between items-start">
      <div>
        <h4 className="text-sm font-extrabold uppercase tracking-tight">{title}</h4>
        <p className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{subtitle}</p>
      </div>
      <button
        onClick={onDownload}
        className={`p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${isLight ? 'text-[#718096] bg-[#F4F5F7] hover:text-[#81B398]' : 'text-[#9CA3AF] bg-[#131720] hover:text-[#81B398]'}`}
      >
        <FileImage size={14} strokeWidth={2.5} />
      </button>
    </div>
    <div className="w-full flex-1 flex flex-col justify-end min-h-[250px]">{children}</div>
  </div>
);

const QuickStat = ({ label, count, isLight, className = '' }) => (
  <div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} ${className}`}>
    <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
      {label}
    </p>
    <h3 className="text-3xl font-extrabold tracking-tighter">
      {count}
    </h3>
  </div>
);

const InfoItem = ({ label, value, isLight }) => (
  <div className={`flex justify-between items-end border-b pb-3 pt-1 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{label}</span>
    <span className="text-xs font-extrabold uppercase tracking-tight text-right">{value}</span>
  </div>
);

// ─── SKELETON LOADER ───
const SkeletonLoader = ({ isLight }) => (
  <div className="space-y-4 pt-2 pb-6 w-full animate-pulse">
    <div className="mb-4 px-1">
      <div className={`w-48 h-8 rounded-lg mb-2 ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
      <div className={`w-32 h-3 rounded ${isLight ? 'bg-[#E2E8F0]' : 'bg-[#222938]'}`} />
    </div>

    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`h-28 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 mb-4">
      <div className={`col-span-12 lg:col-span-8 h-72 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
      <div className={`col-span-12 lg:col-span-4 h-72 rounded-3xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
    </div>

    <div className={`h-96 rounded-3xl border mt-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`} />
  </div>
);

export default CreditSettlementApp;

