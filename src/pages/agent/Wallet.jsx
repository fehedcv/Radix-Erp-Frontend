import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  HandCoins,
  CreditCard,
  ClockArrowDown,
  History,
  Loader2
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; // Import Global Theme

const WalletPage = () => {
  const { theme } = useTheme(); // Access Theme
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [ledgerFilter, setLedgerFilter] = useState('All');

  // Status Styles adjusted for light/dark
  const getStatusStyles = (status) => {
    const styles = {
      Pending: theme === 'light' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-amber-400/10 text-amber-400 border-amber-400/20',
      Approved: theme === 'light' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20',
      Rejected: theme === 'light' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-rose-400/10 text-rose-400 border-rose-400/20',
      default: theme === 'light' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white/5 text-[#94A3B8] border-white/10',
    };
    return styles[status] || styles.default;
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
    finally { setLoading(false); }
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

  if (loading || !wallet) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader fullScreen={false} text="Loading Wallet..." />
      </div>
    );
  }

  const { summary, ledger } = wallet;

  return (
    <div className={`space-y-8 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-500 ${theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'}`}>
      
      {/* AMBIENT BLOBS - Dark Mode Only */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[0%] left-[10%] w-[400px] h-[400px] bg-lime-400/10 rounded-full blur-[120px] pointer-events-none -z-20" />
          <div className="fixed top-[30%] left-[40%] w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[140px] pointer-events-none -z-20" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-orange-400/10 rounded-full blur-[130px] pointer-events-none -z-20" />
        </>
      )}

      {/* ================= WALLET HEADER ================= */}
      <div className={`p-8 sm:p-12 rounded-xl border shadow-sm relative flex flex-col transition-all ${
        theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
      }`}>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${
          theme === 'light' ? 'bg-white border-slate-200 text-[#38BDF8]' : 'bg-white/5 border-white/5 text-[#38BDF8]'
        }`}>
          <Wallet size={28} />
        </div>

        <div className="mt-10">
          <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-3 ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
            Available Balance
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <h2 className={`text-6xl sm:text-7xl font-black tracking-tighter ${theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]'}`}>
              <span className={`text-3xl sm:text-4xl mr-2 ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>CR</span> 
              {summary.available_cash.toLocaleString()}
            </h2>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border sm:mb-3 w-fit backdrop-blur-md ${
              theme === 'light' ? 'bg-white border-slate-200 text-[#38BDF8]' : 'bg-white/5 border-white/10 text-[#38BDF8]'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-widest">1 Credit = ₹1 INR</span>
            </div>
          </div>
        </div>

        <button
          disabled={summary.available_cash <= 0}
          onClick={() => setShowConfirm(true)}
          className={`mt-10 w-full sm:w-fit px-10 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] border shadow-lg transition-all disabled:opacity-20 flex items-center justify-center gap-3 ${
            theme === 'light' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white/5 border-white/10 text-[#E2E8F0] hover:bg-white/10 hover:border-[#38BDF8]/50'
          }`}
        >
          Request Payout <HandCoins size={18} className="text-[#38BDF8]" />
        </button>
      </div>

      {/* ================= WITHDRAWAL REQUESTS ================= */}
   <div className={`rounded-xl border shadow-sm overflow-hidden transition-all ${
    theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
  }`}>
    
    {/* HEADER & FILTERS */}
    <div className={`p-6 sm:p-8 border-b bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
      <div className="flex items-center gap-3 shrink-0">
        <ClockArrowDown size={20} className="text-[#38BDF8]" />
        <span className="font-black uppercase tracking-[0.15em] text-xs">Current Withdrawal Requests</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {['All', 'Pending', 'Credited', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
              filterStatus === status 
              ? 'bg-[#38BDF8] text-white border-[#38BDF8] shadow-sm' 
              : (theme === 'light' ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10')
            }`}
          >
            {status}
          </button>
        ))}
      </div>
    </div>

    {/* LIST SECTION */}
    <div className="flex flex-col">
      {(() => {
        // 1. If loading, show nothing (or add a spinner here)
        if (requestsLoading) return null;

        // 2. Filter the data
        const filteredRequests = withdrawalRequests.filter(
          req => filterStatus === 'All' || req.status === filterStatus
        );

        // 3. If no data matches the filter, show EXACTLY ONE empty state
        if (filteredRequests.length === 0) {
          return (
            <div className="py-24 text-center">
              <ClockArrowDown size={40} className="text-slate-400 mx-auto mb-4 opacity-20" />
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest">
                No {filterStatus === 'All' ? 'withdrawal' : filterStatus} requests found
              </span>
            </div>
          );
        }

        // 4. Otherwise, map through the filtered results
        return filteredRequests.map((req) => (
          <div key={req.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-8 border-b last:border-0 gap-6 transition-colors ${
            theme === 'light' ? 'border-slate-200 hover:bg-slate-200/50' : 'border-white/5 hover:bg-white/[0.02]'
          }`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <p className="font-black text-xl sm:text-2xl tracking-tight">₹{Number(req.requested_credits).toLocaleString()}</p>
                <span className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest border ${getStatusStyles(req.status)}`}>
                  {req.status}
                </span>
              </div>
              {req.remarks && (
                <p className={`text-xs font-medium flex items-start gap-2 max-w-xl ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                  <span className="w-1 h-1 rounded-full bg-[#38BDF8] shrink-0 mt-1.5"></span>{req.remarks}
                </p>
              )}
            </div>
            <div className="shrink-0">
              <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${theme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-white/5 border-white/5 text-[#64748B]'}`}>
                {req.date}
              </p>
            </div>
          </div>
        ));
      })()}
    </div>
</div>
     {/* ================= LEDGER ================= */}
{/* ================= LEDGER ================= */}
<div className={`rounded-xl border shadow-sm overflow-hidden transition-all ${
    theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
  }`}>
    
    {/* HEADER & FILTERS */}
    <div className={`p-6 sm:p-8 border-b bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
      <div className="flex items-center gap-3 shrink-0">
        <History size={20} className="text-[#38BDF8]" />
        <span className="font-black uppercase tracking-[0.15em] text-xs">Transaction History</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
        {/* Updated Filter Buttons: "Credits" changed to "Pending" */}
        {['All', 'Credited', 'Approved', 'Pending', 'Withdrawal'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setLedgerFilter(filterOption)}
            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border whitespace-nowrap ${
              ledgerFilter === filterOption 
              ? 'bg-[#38BDF8] text-white border-[#38BDF8] shadow-sm' 
              : (theme === 'light' ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10')
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>
    </div>

    {/* LIST SECTION */}
    <div className="flex flex-col">
      {(() => {
        // 1. Filter the data based on the entry status OR type
        const filteredLedger = ledger.filter(entry => {
          if (ledgerFilter === 'All') return true;
          // Check both fields just in case the backend returns these terms in either field
          const matchStatus = entry.status && entry.status.toLowerCase() === ledgerFilter.toLowerCase();
          const matchType = entry.type && entry.type.toLowerCase() === ledgerFilter.toLowerCase();
          return matchStatus || matchType;
        });

        // 2. If no data matches the filter, show EXACTLY ONE empty state
        if (filteredLedger.length === 0) {
          return (
            <div className="py-24 text-center">
              <History size={40} className="text-slate-400 mx-auto mb-4 opacity-20" />
              <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest">
                No {ledgerFilter === 'All' ? 'transaction' : ledgerFilter} activity
              </span>
            </div>
          );
        }

        // 3. Otherwise, map through the filtered results
        return filteredLedger.map((entry) => (
          <div key={entry.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-8 border-b last:border-0 gap-6 transition-colors ${
            theme === 'light' ? 'border-slate-200 hover:bg-slate-200/50' : 'border-white/5 hover:bg-white/[0.02]'
          }`}>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-4">
                <p className="font-black text-lg sm:text-xl tracking-tight uppercase">{entry.type}</p>
                <span className={`text-[9px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest border ${entry.status === 'Credited' || entry.status === 'Approved' ? (theme === 'light' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20') : getStatusStyles(entry.status || 'default')}`}>
                  {entry.status || 'Completed'}
                </span>
              </div>
              {entry.remarks && (
                <p className={`text-xs font-medium flex items-start gap-2 max-w-xl ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                  <span className="w-1 h-1 rounded-full bg-[#38BDF8] shrink-0 mt-1.5"></span>{entry.remarks}
                </p>
              )}
            </div>
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-4">
              <p className={`font-black text-2xl tracking-tighter ${entry.credits > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {entry.credits > 0 ? '+' : ''}{entry.credits} <span className="text-sm">CR</span>
              </p>
              <p className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${theme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-500' : 'bg-white/5 border-white/5 text-[#64748B]'}`}>
                {entry.date}
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
          <div className="fixed inset-0 flex items-center justify-center z-[500] bg-black/40 backdrop-blur-md p-6">
            <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className={`p-10 rounded-xl w-full max-w-sm text-center border shadow-2xl relative overflow-hidden transition-all ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-white/10'
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#38BDF8] to-[#4ADE80]" />
              <CreditCard size={48} className="mx-auto text-[#38BDF8] mb-6" />
              <h3 className="font-black uppercase tracking-widest text-lg">Confirm Payout</h3>
              <p className={`text-sm mt-4 font-medium ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                Withdraw <span className="font-black text-[#38BDF8]">₹{summary.available_cash.toLocaleString()}</span> to your settled account?
              </p>
              <div className="grid grid-cols-2 gap-4 mt-10">
                <button onClick={() => setShowConfirm(false)} className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] border transition-all ${theme === 'light' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white/5 text-[#94A3B8] border-white/5'}`}>Cancel</button>
                <button onClick={handlePayout} disabled={processing} className="py-4 bg-[#38BDF8]/10 text-[#38BDF8] rounded-xl font-black uppercase tracking-widest text-[10px] border border-[#38BDF8]/20 hover:bg-[#38BDF8]/20 transition-all shadow-sm">
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