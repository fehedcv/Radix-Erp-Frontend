import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  HandCoins,
  CreditCard,
  ClockArrowDown,
  History,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  IndianRupee
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext'; 

const WalletPage = () => {
  const { theme } = useTheme(); 
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [ledgerFilter, setLedgerFilter] = useState('all');

  const isLight = theme === 'light';

  // Earth-Tech Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  // Earth-Tech Semantic Status Styles
  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'credited' || s === 'completed' || s === 'allocated' || s === 'cleared') {
      return 'bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20';
    }
    if (s === 'rejected') {
      return 'bg-[#F0524F]/10 text-[#F0524F] border border-[#F0524F]/20';
    }
    if (s === 'pending') {
      return 'bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20';
    }
    return isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5';
  };

  // Terminology Formatters
  const formatTransactionType = (type) => {
    if (!type) return 'Transaction';
    const t = type.toLowerCase();
    if (t === 'lead reward') return 'Profit Allocation';
    if (t === 'withdrawal') return 'Capital Distribution';
    return type;
  };

  const formatTransactionStatus = (status) => {
    if (!status) return 'Cleared';
    const s = status.toLowerCase();
    if (s === 'credited' || s === 'approved') return 'Allocated';
    return status;
  };

  const formatRemarks = (remarks) => {
    if (!remarks) return '';
    let r = remarks;
    r = r.replace(/lead reward for/i, 'Profit share allocated for project:');
    r = r.replace(/withdrawal/i, 'Distribution');
    return r;
  };

  useEffect(() => {
    fetchWallet();
    fetchWithdrawalRequests();
  }, []);

  const fetchWallet = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Failed to fetch authenticated user:', authError);
        return;
      }
      const userId = authData?.user?.id;
      if (!userId) {
        console.error('No authenticated user available');
        return;
      }

      // Fetch Ledger
      const { data: ledgerData, error: ledgerError } = await supabase
        .from('agent_credit_ledger')
        .select('id, credits, transaction_type, status, remarks, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ledgerError) {
        console.error('Failed to fetch wallet ledger:', ledgerError);
        return;
      }

      if (!ledgerData) {
        console.error('No ledger data returned from Supabase');
        return;
      }

      // 1. Fetch pending withdrawal requests to subtract from the available balance
      const { data: pendingData } = await supabase
        .from('agent_withdrawals')
        .select('requested_credits')
        .eq('user_id', userId)
        .eq('status', 'pending');

      const totalPending = pendingData?.reduce((sum, item) => sum + Number(item.requested_credits), 0) || 0;

      // 2. Calculate the raw balance before pending requests
      const raw_available = ledgerData
        .filter(item => ['approved', 'credited'].includes(item.status?.toLowerCase()))
        .reduce((sum, item) => sum + item.credits, 0);

      // 3. Deduct pending withdrawal requests from the raw available cash
      const available_cash = Math.max(0, raw_available - totalPending);

      const earned_credits = ledgerData
        .filter(item => ['approved', 'credited'].includes(item.status?.toLowerCase()) && item.credits > 0)
        .reduce((sum, item) => sum + item.credits, 0);

      const total_withdrawn = ledgerData
        .filter(item => item.status?.toLowerCase() === 'credited' && item.credits < 0)
        .reduce((sum, item) => sum + Math.abs(item.credits), 0);

      const mappedLedger = ledgerData.map(entry => ({
        id: entry.id,
        date: entry.created_at,
        credits: entry.credits,
        type: entry.transaction_type,
        status: entry.status,
        remarks: entry.remarks
      }));

      setWallet({
        summary: {
          available_cash,
          earned_credits,
          total_withdrawn
        },
        ledger: mappedLedger
      });
    } catch (err) {
      console.error('Unexpected error while fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Failed to fetch authenticated user:', authError);
        return;
      }
      const userId = authData?.user?.id;
      if (!userId) {
        console.error('No authenticated user available');
        return;
      }

      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('agent_withdrawals')
        .select('id, requested_credits, status, remarks, requested_on')
        .eq('user_id', userId)
        .order('requested_on', { ascending: false });

      if (withdrawalError) {
        console.error('Failed to fetch withdrawal requests:', withdrawalError);
        return;
      }

      if (!withdrawalData) {
        console.error('No withdrawal request data returned from Supabase');
        return;
      }

      const mappedWithdrawals = withdrawalData.map(req => ({
        id: req.id,
        date: req.requested_on,
        requested_credits: req.requested_credits,
        status: req.status,
        remarks: req.remarks
      }));

      setWithdrawalRequests(mappedWithdrawals);
    } catch (err) {
      console.error('Unexpected error while fetching withdrawal requests:', err);
    } finally {
      setRequestsLoading(false);
    }
  };

  const refreshWalletData = async () => {
    await Promise.all([fetchWallet(), fetchWithdrawalRequests()]);
  };

  const handlePayout = async () => {
    setProcessing(true);
    try {
      if (!wallet?.summary) {
        alert('Unable to determine current balance. Please try again.');
        return;
      }

      const availableCash = wallet.summary.available_cash;
      if (!availableCash || availableCash <= 0) {
        alert('No capital available for distribution.');
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Failed to fetch authenticated user:', authError);
        alert('Unable to verify user. Please sign in again.');
        return;
      }

      const userId = authData?.user?.id;
      if (!userId) {
        alert('Unable to verify user. Please sign in again.');
        return;
      }

      const { data: pendingRequests, error: pendingError } = await supabase
        .from('agent_withdrawals')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .limit(1);

      if (pendingError) {
        console.error('Failed to check pending withdrawal requests:', pendingError);
        alert('Unable to submit distribution request. Please try again.');
        return;
      }

      if (pendingRequests?.length > 0) {
        alert('A pending distribution request already exists.');
        return;
      }

      const { error: insertError } = await supabase
        .from('agent_withdrawals')
        .insert([{ user_id: userId, requested_credits: availableCash, status: 'pending' }]);

      if (insertError) {
        console.error('Failed to create withdrawal request:', insertError);
        alert('Unable to submit distribution request. Please try again.');
        return;
      }

      await refreshWalletData();
      setShowConfirm(false);
    } catch (err) {
      console.error('Error submitting withdrawal request:', err);
      alert('Unable to submit distribution request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // SKELETON LOADER
  if (loading || !wallet) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2  px-0 lg:px-0">
        
        {/* Wallet Header Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className={`lg:col-span-2 p-8 lg:p-10 rounded-2xl border flex flex-col justify-between ${surfaceClass}`}>
             <div className={`h-14 w-14 rounded-xl mb-10 ${pulseClass}`} />
             <div className="space-y-4">
               <div className={`h-4 w-32 rounded-md ${pulseClass}`} />
               <div className={`h-12 w-64 rounded-lg ${pulseClass}`} />
             </div>
             <div className={`h-12 w-48 rounded-lg mt-8 ${pulseClass}`} />
          </div>
          <div className="flex flex-col gap-6">
            <div className={`flex-1 p-6 rounded-2xl border ${surfaceClass}`}>
              <div className={`h-4 w-24 rounded-md mb-4 ${pulseClass}`} />
              <div className={`h-8 w-32 rounded-md ${pulseClass}`} />
            </div>
            <div className={`flex-1 p-6 rounded-2xl border ${surfaceClass}`}>
              <div className={`h-4 w-24 rounded-md mb-4 ${pulseClass}`} />
              <div className={`h-8 w-32 rounded-md ${pulseClass}`} />
            </div>
          </div>
        </div>

        {/* List Skeleton */}
        <div className={`rounded-2xl border animate-pulse ${surfaceClass}`}>
          <div className={`p-6 border-b flex justify-between ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
            <div className={`h-6 w-48 rounded-md ${pulseClass}`} />
            <div className={`h-8 w-64 rounded-md ${pulseClass}`} />
          </div>
          {[1,2,3].map(i => (
            <div key={i} className={`p-6 border-b flex justify-between items-center ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
               <div className="space-y-3">
                 <div className={`h-6 w-32 rounded-md ${pulseClass}`} />
                 <div className={`h-4 w-64 rounded-md ${pulseClass}`} />
               </div>
               <div className={`h-8 w-24 rounded-md ${pulseClass}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { summary, ledger } = wallet;

  return (
    <div className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2 px-0 lg:px-0 ${textPrimary}`}>
      
      {/* HEADER */}
      <div className="space-y-1.5 ">
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
          Partner Ledger
        </h1>
        <p className={`text-sm font-medium ${textSecondary}`}>
          Manage your profit shares, track financial allocations, and request capital distributions.
        </p>
      </div>

      {/* ================= WALLET SUMMARY (Bento Grid) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Balance Card */}
        <div className={`lg:col-span-2 p-8 lg:p-10 rounded-2xl border flex flex-col justify-between transition-all ${surfaceClass}`}>
          <div className="flex justify-between items-start mb-8 lg:mb-12">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'
            }`}>
              <Wallet size={24} />
            </div>
          </div>

          <div>
            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
              Available Capital
            </p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
                ₹{summary.available_cash.toLocaleString()}
              </h2>
            </div>
          </div>

          <button
            disabled={summary.available_cash <= 0}
            onClick={() => setShowConfirm(true)}
            className="mt-8 lg:mt-10 w-full sm:w-fit px-8 py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] active:scale-95 shadow-sm"
          >
            Withdraw Capital <HandCoins size={18} />
          </button>
        </div>

        {/* Secondary Stats */}
        <div className="flex flex-col gap-6">
          <div className={`flex-1 p-6 lg:p-8 rounded-2xl border flex flex-col justify-center transition-all ${surfaceClass}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-[#81B398]/10 text-[#81B398]' : 'bg-[#81B398]/20 text-[#81B398]'}`}>
                <ArrowUpRight size={16} />
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Total Profit Share</p>
            </div>
            <h3 className="text-3xl font-bold tracking-tight">
              ₹{summary.earned_credits.toLocaleString()}
            </h3>
          </div>

       <div className={`flex-1 p-6 lg:p-8 rounded-2xl border flex flex-col justify-center transition-all ${surfaceClass}`}>
  <div className="flex items-center gap-3 mb-3">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isLight ? 'bg-[#48477A]/10 text-[#48477A]' : 'bg-[#48477A]/20 text-[#81B398]'}`}>
      <ArrowDownLeft size={16} />
    </div>
    <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
      Total Distributed
    </p>
  </div>

  <h3 className="text-3xl font-bold tracking-tight flex items-center ">
    <IndianRupee size={24} />
    {summary.total_withdrawn.toLocaleString()}
  </h3>
</div>
        </div>
      </div>

      {/* ================= PENDING CLEARANCES ================= */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${surfaceClass}`}>
        
        {/* HEADER & FILTERS */}
        <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
          <div className="flex items-center gap-3 shrink-0">
            <ClockArrowDown size={20} className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'} />
            <h3 className="font-bold text-lg tracking-tight">Pending Clearances</h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'approved', label: 'Cleared' },
            
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilterStatus(status.value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  filterStatus === status.value 
                  ? 'bg-[#81B398] text-[#FFFFFF]' 
                  : (isLight ? 'bg-[#F4F5F7] text-[#718096] hover:bg-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] hover:bg-[#1A202C]')
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="flex flex-col divide-y transition-colors divide-inherit" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
          {(() => {
            if (requestsLoading) return null;

            const filteredRequests = withdrawalRequests.filter(
              req => filterStatus === 'all' || req.status === filterStatus
            );

            if (filteredRequests.length === 0) {
              return (
                <div className="py-16 text-center">
                  <ClockArrowDown size={32} className={`mx-auto mb-3 opacity-30 ${textSecondary}`} />
                  <span className={`text-sm font-medium ${textSecondary}`}>
                    No {filterStatus === 'all' ? 'pending' : `${filterStatus.charAt(0).toUpperCase()}${filterStatus.slice(1)}`} clearances found.
                  </span>
                </div>
              );
            }

            return filteredRequests.map((req) => (
              <div key={req.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 transition-colors ${
                isLight ? 'hover:bg-[#F4F5F7]/50' : 'hover:bg-[#131720]/30'
              }`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg tracking-tight">₹{Number(req.requested_credits).toLocaleString()}</p>
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider border ${getStatusStyles(req.status)}`}>
                      {formatTransactionStatus(req.status)}
                    </span>
                  </div>
                  {req.remarks && (
                    <p className={`text-sm font-medium line-clamp-1 ${textSecondary}`}>
                      {formatRemarks(req.remarks)}
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <p className={`text-xs font-medium px-3 py-1.5 rounded-lg border ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
                  }`}>
                    {new Date(req.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* ================= LEDGER ================= */}
      <div className={`rounded-2xl border overflow-hidden transition-all ${surfaceClass}`}>
        
        {/* HEADER & FILTERS */}
        <div className={`p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
          <div className="flex items-center gap-3 shrink-0">
            <History size={20} className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'} />
            <h3 className="font-bold text-lg tracking-tight">Ledger History</h3>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {[
              { value: 'all', label: 'All' },
              { value: 'credited', label: 'Allocated' },
              { value: 'withdrawal', label: 'Distributed' }
            ].map((filterOption) => (
              <button
                key={filterOption.value}
                onClick={() => setLedgerFilter(filterOption.value)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  ledgerFilter === filterOption.value 
                  ? 'bg-[#81B398] text-[#FFFFFF]' 
                  : (isLight ? 'bg-[#F4F5F7] text-[#718096] hover:bg-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] hover:bg-[#1A202C]')
                }`}
              >
                {filterOption.label}
              </button>
            ))}
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="flex flex-col divide-y transition-colors divide-inherit" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
          {(() => {
            const filteredLedger = ledger.filter(entry => {
              if (ledgerFilter === 'all') return true;
              const matchStatus = entry.status && entry.status.toLowerCase() === ledgerFilter;
              const matchType = entry.type && entry.type.toLowerCase() === ledgerFilter;
              return matchStatus || matchType;
            });

            if (filteredLedger.length === 0) {
              return (
                <div className="py-16 text-center">
                  <History size={32} className={`mx-auto mb-3 opacity-30 ${textSecondary}`} />
                  <span className={`text-sm font-medium ${textSecondary}`}>
                    No {ledgerFilter === 'all' ? 'ledger' : `${ledgerFilter.charAt(0).toUpperCase()}${ledgerFilter.slice(1)}`} activity found.
                  </span>
                </div>
              );
            }

            return filteredLedger.map((entry) => (
              <div key={entry.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 transition-colors ${
                isLight ? 'hover:bg-[#F4F5F7]/50' : 'hover:bg-[#131720]/30'
              }`}>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-base tracking-tight capitalize">{formatTransactionType(entry.type)}</p>
                    <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider border ${
                      entry.status === 'Credited' || entry.status === 'Approved' || !entry.status 
                      ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20' 
                      : getStatusStyles(entry.status)
                    }`}>
                      {formatTransactionStatus(entry.status)}
                    </span>
                  </div>
                  {entry.remarks && (
                    <p className={`text-sm font-medium line-clamp-1 ${textSecondary}`}>
                      {formatRemarks(entry.remarks)}
                    </p>
                  )}
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <p className={`font-bold text-xl tracking-tight ${entry.credits > 0 ? 'text-[#81B398]' : textPrimary}`}>
                    {entry.credits > 0 ? '+' : ''}₹{Math.abs(entry.credits).toLocaleString()}
                  </p>
                  <p className={`text-xs font-medium ${textSecondary}`}>
                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* ================= CONFIRM PAYOUT MODAL ================= */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[500] bg-black/50 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`p-8 rounded-2xl w-full max-w-sm text-center border shadow-xl relative overflow-hidden transition-all ${surfaceClass}`}
            >
              <div className="w-16 h-16 rounded-xl mx-auto flex items-center justify-center mb-5 bg-[#81B398]/10 text-[#81B398]">
                 <CreditCard size={32} />
              </div>
              <h3 className={`font-bold text-xl tracking-tight mb-2 ${textPrimary}`}>Confirm Distribution</h3>
              <p className={`text-sm font-medium leading-relaxed mb-8 ${textSecondary}`}>
                Distribute <span className="font-bold text-[#81B398]">₹{summary.available_cash.toLocaleString()}</span> to your linked account?
              </p>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className={`py-2.5 rounded-lg font-semibold text-sm transition-colors border ${
                    isLight ? 'bg-[#F4F5F7] text-[#1A202C] border-[#E2E8F0] hover:bg-[#E2E8F0]' : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:bg-[#1A202C]'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePayout} 
                  disabled={processing} 
                  className="py-2.5 rounded-lg font-semibold text-sm transition-colors bg-[#81B398] text-white hover:bg-[#6FA085] disabled:opacity-50"
                >
                  {processing ? 'Processing…' : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPage;