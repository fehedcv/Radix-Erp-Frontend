import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  HandCoins,
  CreditCard,
  ClockArrowDown,
  History,
  Loader2,
  X
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient'; 
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// 1:1 STRUCTURAL SKELETON (BENTO STYLE)
// ==========================================
const WalletSkeleton = ({ theme }) => {
  const isLight = theme === 'light';
  const pulseColor = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';
  const cardBg = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10';

  return (
    <div className="space-y-5  pb-32  w-full max-w-[1200px] mx-auto">
      {/* Separator */}
        <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`} />

      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div className="space-y-2">
          <div className={`h-8 w-32 rounded-xl ${pulseColor} animate-pulse`} />
          <div className={`h-3 w-24 rounded-md ${pulseColor} animate-pulse`} />
        </div>
        <div className={`h-8 w-20 rounded-lg ${pulseColor} animate-pulse`} />
      </div>

      <div className="space-y-5">
        {/* Hero Card Skeleton */}
        <div className={`rounded-3xl p-6 border flex flex-col space-y-6 animate-pulse ${cardBg}`}>
          <div className="flex justify-between items-start">
            <div className={`w-12 h-12 rounded-xl ${pulseColor}`} />
            <div className={`h-6 w-16 rounded-md ${pulseColor}`} />
          </div>
          <div className="space-y-3">
            <div className={`h-3 w-24 rounded-md ${pulseColor}`} />
            <div className={`h-12 w-48 rounded-xl ${pulseColor}`} />
          </div>
          <div className={`h-14 w-full rounded-xl ${pulseColor}`} />
        </div>

        {/* List Section Skeletons */}
        {[1, 2].map((section) => (
          <div key={section} className={`rounded-2xl p-6 space-y-5 border animate-pulse ${cardBg}`}>
            <div className={`h-4 w-32 rounded-md ${pulseColor} mb-2`} />
            <div className="flex gap-2 mb-2">
              <div className={`h-8 w-16 rounded-lg ${pulseColor}`} />
              <div className={`h-8 w-20 rounded-lg ${pulseColor}`} />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                <div className="flex justify-between">
                  <div className={`h-5 w-24 rounded-md ${pulseColor}`} />
                  <div className={`h-5 w-16 rounded-md ${pulseColor}`} />
                </div>
                <div className="flex justify-between items-end pt-2">
                  <div className={`h-3 w-32 rounded-md ${pulseColor}`} />
                  <div className={`h-3 w-12 rounded-md ${pulseColor}`} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const WalletApp = () => {
  const { theme } = useTheme(); 
  const isLight = theme === 'light';
  
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [ledgerFilter, setLedgerFilter] = useState('all');

  // Strict 10/100/20 Opacity Logic mapped to Semantic Colors
  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'bg-[#DAC18A]/10 text-[#DAC18A] border-[#DAC18A]/20'; // Mustard
    if (s === 'approved' || s === 'credited' || s === 'completed') return 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20'; // Sage Green
    if (s === 'rejected' || s === 'failed') return 'bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20'; // Coral Red
    return 'bg-[#48477A]/10 text-[#48477A] border-[#48477A]/20'; // Muted Indigo (Default)
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

      // App logic mapped directly from your web version
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

      const available_cash = ledgerData
        .filter(item => ['approved', 'credited'].includes(item.status?.toLowerCase()))
        .reduce((sum, item) => sum + item.credits, 0);

      const earned_credits = ledgerData
        .filter(item => ['approved', 'credited'].includes(item.status?.toLowerCase()) && item.credits > 0)
        .reduce((sum, item) => sum + item.credits, 0);

      const total_withdrawn = ledgerData
        .filter(item => item.status?.toLowerCase() === 'credited' && item.credits < 0)
        .reduce((sum, item) => sum + Math.abs(item.credits), 0);

      const mappedLedger = ledgerData.map(entry => ({
        id: entry.id,
        date: new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: entry.credits,
        type: entry.transaction_type,
        status: entry.status,
        description: entry.remarks || entry.transaction_type,
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
      setTimeout(() => setLoading(false), 500); 
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
        date: new Date(req.requested_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        amount: req.requested_credits,
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
        alert('No balance available for withdrawal.');
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

      // Check for pending request limits
      const { data: pendingRequests, error: pendingError } = await supabase
        .from('agent_withdrawals')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .limit(1);

      if (pendingError) {
        console.error('Failed to check pending withdrawal requests:', pendingError);
        alert('Unable to submit withdrawal request. Please try again.');
        return;
      }

      if (pendingRequests?.length > 0) {
        alert('A pending withdrawal request already exists.');
        return;
      }

      const { error: insertError } = await supabase
        .from('agent_withdrawals')
        .insert([{ user_id: userId, requested_credits: availableCash, status: 'pending' }]);

      if (insertError) {
        console.error('Failed to create withdrawal request:', insertError);
        alert('Unable to submit withdrawal request. Please try again.');
        return;
      }

      await refreshWalletData();
      setShowConfirm(false);
    } catch (err) {
      console.error('Error submitting withdrawal request:', err);
      alert('Unable to submit withdrawal request. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !wallet) {
    return <WalletSkeleton theme={theme} />;
  }

  const { summary, ledger } = wallet;

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] pb-16 transition-colors duration-200 ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      <main className="w-full max-w-[1200px] mx-auto ">
        
        {/* PROFESSIONAL SEPARATOR */}
        <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
          
          {/* Header Section */}
          <div className="flex justify-between items-end px-2 mb-6">
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                Wallet
              </h1>
              <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Financial Overview
              </p>
            </div>
            
            {/* Neutral Badge (Muted Indigo) */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20">
              <History size={14} strokeWidth={2.5} />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                {ledger.length} Transactions
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          
          {/* HERO BENTO CARD */}
          <div className={`rounded-3xl p-6 relative overflow-hidden border flex flex-col ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <div className="flex justify-between items-start mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'
              }`}>
                <Wallet size={20} />
              </div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
                1 CR = ₹1
              </span>
            </div>
            
            <div>
              <p className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Available Balance
              </p>
              <div className="flex items-baseline gap-2">
                <h3 className={`text-5xl font-extrabold tracking-tighter ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                  {summary.available_cash.toLocaleString()}
                </h3>
                <span className={`text-sm font-bold tracking-tight ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>CR</span>
              </div>
            </div>

            <button
              disabled={summary.available_cash <= 0}
              onClick={() => setShowConfirm(true)}
              className={`mt-8 w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
                isLight 
                  ? 'bg-[#81B398] text-white hover:bg-[#6FA085]' 
                  : 'bg-[#81B398] text-white hover:bg-[#6FA085]'
              }`}
            >
              Request Payout <HandCoins size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* WITHDRAWAL REQUESTS BENTO */}
          <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-5 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              <ClockArrowDown size={14} className="text-[#81B398]" /> Withdrawals
            </h4>

            {/* Filter Pills */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-5 pb-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'pending', label: 'Pending' },
                { value: 'credited', label: 'Credited' },
                { value: 'rejected', label: 'Rejected' }
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap active:scale-95 border ${
                    filterStatus === status.value 
                    ? (isLight ? 'bg-[#1A202C] text-[#FFFFFF] border-transparent' : 'bg-[#F4F5F7] text-[#1A202C] border-transparent')
                    : (isLight ? 'bg-[#F4F5F7] text-[#718096] border-transparent hover:border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-transparent hover:border-white/10')
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {(() => {
                if (requestsLoading) return (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#81B398]" size={24} /></div>
                );

                const filteredRequests = withdrawalRequests.filter(
                  req => filterStatus === 'all' || req.status?.toLowerCase() === filterStatus
                );

                if (filteredRequests.length === 0) {
                  return (
                    <div className={`text-center py-8 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                      <ClockArrowDown size={20} className={`mx-auto mb-2 ${isLight ? 'text-[#E2E8F0]' : 'text-white/10'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        No {filterStatus === 'all' ? 'requests' : filterStatus} found
                      </span>
                    </div>
                  );
                }

                return filteredRequests.map((req) => (
                  <div key={req.id} className={`p-4 rounded-xl border transition-all duration-200 hover:border-[#81B398] flex flex-col gap-2 ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className={`font-bold text-base tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                        ₹{Number(req.amount).toLocaleString()}
                      </p>
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${getStatusStyles(req.status)}`}>
                        {req.status}
                      </span>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      {req.remarks ? (
                         <p className={`text-[11px] font-medium leading-relaxed flex-1 pr-4 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                           {req.remarks}
                         </p>
                      ) : <div className="flex-1" />}
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        {req.date}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* LEDGER BENTO */}
          <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <div className="flex items-center justify-between mb-5 px-1">
              <h4 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                <History size={14} className="text-[#81B398]" /> Ledger
              </h4>
            </div>

            {/* Filter Pills */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-5 pb-1">
              {[
                { value: 'all', label: 'All' },
                { value: 'credited', label: 'Credited' },
                { value: 'approved', label: 'Approved' },
                { value: 'pending', label: 'Pending' },
                { value: 'withdrawal', label: 'Withdrawal' }
              ].map((filterOption) => (
                <button
                  key={filterOption.value}
                  onClick={() => setLedgerFilter(filterOption.value)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap active:scale-95 border ${
                    ledgerFilter === filterOption.value 
                    ? (isLight ? 'bg-[#1A202C] text-[#FFFFFF] border-transparent' : 'bg-[#F4F5F7] text-[#1A202C] border-transparent')
                    : (isLight ? 'bg-[#F4F5F7] text-[#718096] border-transparent hover:border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-transparent hover:border-white/10')
                  }`}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {(() => {
                const filteredLedger = ledger.filter(entry => {
                  if (ledgerFilter === 'all') return true;
                  const matchStatus = entry.status && entry.status.toLowerCase() === ledgerFilter;
                  const matchType = entry.type && entry.type.toLowerCase() === ledgerFilter;
                  return matchStatus || matchType;
                });

                if (filteredLedger.length === 0) {
                  return (
                    <div className={`text-center py-8 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                      <History size={20} className={`mx-auto mb-2 ${isLight ? 'text-[#E2E8F0]' : 'text-white/10'}`} />
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        No {ledgerFilter === 'all' ? 'transactions' : ledgerFilter} found
                      </span>
                    </div>
                  );
                }

                return filteredLedger.map((entry) => (
                  <div key={entry.id} className={`p-4 rounded-xl border transition-all duration-200 hover:border-[#81B398] flex flex-col gap-2 ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <p className={`font-bold text-sm tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                        {entry.description || entry.type}
                      </p>
                      <p className={`font-bold text-base tracking-tight ${entry.amount > 0 ? 'text-[#81B398]' : 'text-[#F0524F]'}`}>
                        {entry.amount > 0 ? '+' : ''}{entry.amount} <span className="text-[10px] font-bold">CR</span>
                      </p>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div className="flex-1 pr-4 space-y-2">
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border w-fit flex ${getStatusStyles(entry.status)}`}>
                          {entry.status || 'Completed'}
                        </span>
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-wider shrink-0 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        {entry.date}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

        </div>
      </main>

      {/* CENTERED POPUP MODAL (Confirm Payout) */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowConfirm(false)} /> 
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative w-full max-w-sm rounded-3xl p-8 shadow-sm flex flex-col items-center text-center border ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}
            >
              <button 
                onClick={() => setShowConfirm(false)} 
                className={`absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border ${
                  isLight 
                    ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' 
                    : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'
                }`}
              >
                <X size={18} strokeWidth={2.5} />
              </button>

              {/* Muted Indigo Badge Icon */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mt-2 mb-6 bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20">
                <CreditCard size={32} />
              </div>
              
              <h3 className={`text-xl font-bold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                Confirm Payout
              </h3>
              
              <p className={`text-sm font-medium leading-relaxed mb-8 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Withdraw <span className="font-bold text-[#81B398]">₹{summary.available_cash.toLocaleString()}</span> to your settled account?
              </p>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  disabled={processing}
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 border ${
                    isLight 
                      ? 'bg-[#F4F5F7] text-[#1A202C] border-transparent hover:border-[#E2E8F0]' 
                      : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:border-white/10'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePayout} 
                  disabled={processing}
                  className="flex-[2] py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 bg-[#81B398] text-white hover:bg-[#6FA085] disabled:opacity-50"
                >
                  {processing ? <Loader2 size={18} className="animate-spin" /> : 'Confirm'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default WalletApp;