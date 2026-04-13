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
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// SKELETON COMPONENT (MATCHED LAYOUT)
// ==========================================
const WalletSkeleton = ({ theme }) => {
  const bgColor = theme === 'light' ? 'bg-gray-200' : 'bg-white/5';
  const pulseClass = "animate-pulse";

  return (
    <div className="space-y-6 px-2 ">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <div className={`h-8 w-32 rounded-lg ${bgColor} ${pulseClass}`} />
          <div className={`h-3 w-40 rounded-lg ${bgColor} ${pulseClass}`} />
        </div>
        <div className={`h-10 w-24 rounded-full ${bgColor} ${pulseClass}`} />
      </div>

      <div className="space-y-4">
        {/* Hero Card Skeleton */}
        <div className={`rounded-[2rem] p-5 flex flex-col space-y-6 ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
          <div className="flex justify-between">
            <div className={`w-12 h-12 rounded-[1.25rem] ${bgColor} ${pulseClass}`} />
            <div className={`h-6 w-16 rounded-full ${bgColor} ${pulseClass}`} />
          </div>
          <div className="space-y-2">
            <div className={`h-3 w-24 rounded-lg ${bgColor} ${pulseClass}`} />
            <div className={`h-12 w-48 rounded-lg ${bgColor} ${pulseClass}`} />
          </div>
          <div className={`h-14 w-full rounded-[1.25rem] ${bgColor} ${pulseClass}`} />
        </div>

        {/* List Section Skeletons (Withdrawals & Ledger) */}
        {[1, 2].map((section) => (
          <div key={section} className={`rounded-[2rem] p-5 space-y-4 ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
            <div className={`h-4 w-32 rounded-lg ${bgColor} ${pulseClass} mb-2`} />
            <div className="flex gap-2 mb-4">
              <div className={`h-10 w-16 rounded-full ${bgColor} ${pulseClass}`} />
              <div className={`h-10 w-20 rounded-full ${bgColor} ${pulseClass}`} />
            </div>
            {[1, 2].map((i) => (
              <div key={i} className={`p-4 rounded-[1.25rem] space-y-3 ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                <div className="flex justify-between">
                  <div className={`h-5 w-24 rounded-lg ${bgColor} ${pulseClass}`} />
                  <div className={`h-5 w-16 rounded-full ${bgColor} ${pulseClass}`} />
                </div>
                <div className="flex justify-between items-end pt-2">
                  <div className={`h-3 w-32 rounded-lg ${bgColor} ${pulseClass}`} />
                  <div className={`h-3 w-12 rounded-lg ${bgColor} ${pulseClass}`} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const WalletApp = () => {
  // ==========================================
  // EXACT SAME LOGIC & STATE
  // ==========================================
  const { theme } = useTheme(); 
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [ledgerFilter, setLedgerFilter] = useState('All');

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase();
    if (s === 'pending') return 'bg-amber-500/10 text-amber-500';
    if (s === 'approved' || s === 'credited') return 'bg-[#4ADE80]/10 text-[#4ADE80]';
    if (s === 'rejected') return 'bg-rose-500/10 text-rose-500';
    return theme === 'light' ? 'bg-[#F4F5F9] text-gray-500' : 'bg-white/5 text-gray-400';
  };

  useEffect(() => {
    fetchWallet();
    fetchWithdrawalRequests();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await frappeApi.get('/method/business_chain.api.wallet.get_agent_wallet');
      setWallet(res.data.message);
    } catch (err) { console.error(err); }
    finally { 
      // Small timeout for smooth skeleton transition
      setTimeout(() => setLoading(false), 800); 
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const res = await frappeApi.get('/method/business_chain.api.wallet.get_withdrawal_requests');
      setWithdrawalRequests(res.data.message ?? []);
    } catch (err) { console.error(err); }
    finally { setRequestsLoading(false); }
  };

  const handlePayout = async () => {
    setProcessing(true);
    try {
      await frappeApi.post('/method/business_chain.api.wallet.request_withdrawal', {
        requested_credits: wallet.summary.available_cash
      });
      await Promise.all([fetchWallet(), fetchWithdrawalRequests()]);
      setShowConfirm(false);
    } catch (err) { console.error(err); }
    finally { setProcessing(false); }
  };

  // --- LOADING STATE TRIGGER ---
  if (loading || !wallet) {
    return <WalletSkeleton theme={theme} />;
  }

  const { summary, ledger } = wallet;

  return (
    <div className={`space-y-6 font-['Plus_Jakarta_Sans',sans-serif] pb-14 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      
      {/* Header Section (Matched Directory) */}
      <div className="flex justify-between items-end px-2 ">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">Wallet</h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
            Financial Overview
          </p>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm ${
          theme === 'light' ? 'bg-white text-black' : 'bg-[#18181B] text-white border border-white/5'
        }`}>
          <History size={12} className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {ledger.length} TXN
          </span>
        </div>
      </div>

      <div className="space-y-4 ">
        {/* HERO BENTO CARD */}
        <div className={`rounded-[2rem] p-5 relative overflow-hidden shadow-sm flex flex-col ${
          theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
        }`}>
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center shadow-inner ${
              theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'
            }`}>
              <Wallet size={20} className={theme === 'light' ? 'text-black' : 'text-white'} />
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
              theme === 'light' ? 'bg-[#F4F5F9] text-gray-500' : 'bg-white/5 text-gray-400'
            }`}>1 CR = ₹1</span>
          </div>
          
          <div>
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Available Balance</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#4ADE80]">
                {summary.available_cash.toLocaleString()}
              </h3>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`}>CR</span>
            </div>
          </div>

          <button
            disabled={summary.available_cash <= 0}
            onClick={() => setShowConfirm(true)}
            className={`mt-6 w-full py-4 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 ${
              theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            Request Payout <HandCoins size={14} />
          </button>
        </div>

        {/* WITHDRAWAL REQUESTS BENTO */}
        <div className={`rounded-[2rem] p-5 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <div className="flex items-center justify-between mb-4 px-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <ClockArrowDown size={14} className="text-[#38BDF8]" /> Withdrawals
            </h4>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-2 mb-4 pb-1">
            {['All', 'Pending', 'Credited', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-[1rem] text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                  filterStatus === status 
                  ? (theme === 'light' ? 'bg-black text-white' : 'bg-white text-black')
                  : (theme === 'light' ? 'bg-[#F4F5F9] text-gray-500' : 'bg-white/5 text-gray-400')
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {(() => {
              if (requestsLoading) return (
                <div className="flex justify-center py-6"><Loader2 className="animate-spin text-[#38BDF8]" size={20} /></div>
              );

              const filteredRequests = withdrawalRequests.filter(
                req => filterStatus === 'All' || req.status === filterStatus
              );

              if (filteredRequests.length === 0) {
                return (
                  <div className={`text-center py-6 rounded-[1.25rem] ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                    <ClockArrowDown size={20} className={`mx-auto mb-2 ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No {filterStatus === 'All' ? 'requests' : filterStatus} found
                    </span>
                  </div>
                );
              }

              return filteredRequests.map((req) => (
                <div key={req.id} className={`p-4 rounded-[1.25rem] flex flex-col gap-2 ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-lg tracking-tight">₹{Number(req.requested_credits).toLocaleString()}</p>
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${getStatusStyles(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    {req.remarks ? (
                       <p className={`text-[9px] font-bold leading-snug flex-1 pr-4 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                         {req.remarks}
                       </p>
                    ) : <div className="flex-1" />}
                    <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {req.date}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* LEDGER BENTO */}
        <div className={`rounded-[2rem] p-5 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <div className="flex items-center justify-between mb-4 px-1">
            <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
              <History size={14} className="text-[#38BDF8]" /> Ledger
            </h4>
          </div>

          <div className="flex overflow-x-auto no-scrollbar gap-2 mb-4 pb-1">
            {['All', 'Credited', 'Approved', 'Pending', 'Withdrawal'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setLedgerFilter(filterOption)}
                className={`px-4 py-2 rounded-[1rem] text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                  ledgerFilter === filterOption 
                  ? (theme === 'light' ? 'bg-black text-white' : 'bg-white text-black')
                  : (theme === 'light' ? 'bg-[#F4F5F9] text-gray-500' : 'bg-white/5 text-gray-400')
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {(() => {
              const filteredLedger = ledger.filter(entry => {
                if (ledgerFilter === 'All') return true;
                const matchStatus = entry.status && entry.status.toLowerCase() === ledgerFilter.toLowerCase();
                const matchType = entry.type && entry.type.toLowerCase() === ledgerFilter.toLowerCase();
                return matchStatus || matchType;
              });

              if (filteredLedger.length === 0) {
                return (
                  <div className={`text-center py-6 rounded-[1.25rem] ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                    <History size={20} className={`mx-auto mb-2 ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`} />
                    <span className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No {ledgerFilter === 'All' ? 'transactions' : ledgerFilter} found
                    </span>
                  </div>
                );
              }

              return filteredLedger.map((entry) => (
                <div key={entry.id} className={`p-4 rounded-[1.25rem] flex flex-col gap-2 ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-xs uppercase tracking-tight">{entry.type}</p>
                    <p className={`font-black text-lg tracking-tighter ${entry.credits > 0 ? 'text-[#4ADE80]' : 'text-rose-500'}`}>
                      {entry.credits > 0 ? '+' : ''}{entry.credits} <span className="text-[8px]">CR</span>
                    </p>
                  </div>
                  
                  <div className="flex items-end justify-between">
                    <div className="flex-1 pr-4 space-y-1.5">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full w-fit flex ${getStatusStyles(entry.status || 'default')}`}>
                        {entry.status || 'Completed'}
                      </span>
                      {entry.remarks && (
                        <p className={`text-[9px] font-bold leading-snug ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                          {entry.remarks}
                        </p>
                      )}
                    </div>
                    <p className={`text-[8px] font-black uppercase tracking-widest shrink-0 ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {entry.date}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

      </div>

      {/* CENTERED POPUP MODAL (Confirm Payout) */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0" onClick={() => setShowConfirm(false)} /> 
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`relative w-full max-w-[320px] rounded-[2rem] p-6 shadow-2xl flex flex-col items-center text-center ${
                theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/10'
              }`}
            >
              <button 
                onClick={() => setShowConfirm(false)} 
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                  theme === 'light' ? 'bg-gray-100 text-gray-500' : 'bg-white/10 text-gray-400'
                }`}
              >
                <X size={14} strokeWidth={3} />
              </button>

              <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center mt-2 mb-5 shadow-inner ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                <CreditCard size={28} className="text-[#38BDF8]" />
              </div>
              
              <h3 className="text-lg font-extrabold tracking-tight uppercase mb-2">Confirm Payout</h3>
              
              <p className={`text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-6 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                Withdraw <span className="font-black text-[#38BDF8] text-sm">₹{summary.available_cash.toLocaleString()}</span> to your settled account?
              </p>

              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  disabled={processing}
                  className={`flex-1 py-4 rounded-[1.25rem] text-[9px] font-black uppercase tracking-widest transition-all active:scale-[0.98] ${
                    theme === 'light' ? 'bg-[#F4F5F9] text-gray-500' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handlePayout} 
                  disabled={processing}
                  className={`flex-[1.5] py-4 rounded-[1.25rem] text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all shadow-md ${
                    theme === 'light' ? 'bg-[#38BDF8] text-white' : 'bg-[#38BDF8] text-black'
                  }`}
                >
                  {processing ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
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