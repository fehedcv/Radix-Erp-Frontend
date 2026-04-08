import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  HandCoins,
  CreditCard,
  ClockArrowDown,
  History
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader'
const STATUS_STYLES = {
  Pending:  'bg-amber-100 text-amber-700',
  Approved: 'bg-emerald-100 text-emerald-700',
  Rejected: 'bg-rose-100 text-rose-700',
  default:  'bg-slate-100 text-slate-600',
};

const WalletPage = () => {
  const [wallet, setWallet]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [requestsLoading, setRequestsLoading]  = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ---------------- FETCH WALLET ---------------- */
  useEffect(() => {
    fetchWallet();
    fetchWithdrawalRequests();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await frappeApi.get(
        '/method/business_chain.api.wallet.get_agent_wallet'
      );
      setWallet(res.data.message);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const res = await frappeApi.get(
        '/method/business_chain.api.wallet.get_withdrawal_requests'
      );
      setWithdrawalRequests(res.data.message ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setRequestsLoading(false);
    }
  };

  /* ---------------- REQUEST PAYOUT ---------------- */
  const handlePayout = async () => {
    setProcessing(true);
    try {
      await frappeApi.post(
        '/method/business_chain.api.wallet.request_withdrawal',
        {
          requested_credits: wallet.summary.available_cash
        }
      );
      await Promise.all([fetchWallet(), fetchWithdrawalRequests()]);
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !wallet) {
     return (
       <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
         {/* fullScreen={false} keeps it perfectly inside your dashboard container instead of taking over the whole screen */}
         <Loader fullScreen={false} text="Loading Wallet..." />
       </div>
     );
   }

  const { summary, ledger } = wallet;

  /* ---------------- DONUT CHART ---------------- */
  const donutSeries = [
    summary.available_cash,
    summary.cleared_cash,
    summary.credits_available
  ];

  const donutOptions = {
    labels: ['Available Cash', 'Cleared Cash', 'Credits'],
    colors: ['#007ACC', '#10b981', '#f59e0b'],
    dataLabels: { enabled: false },
    legend: {
      position: 'bottom',
      fontSize: '10px',
      fontWeight: 700
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* ================= WALLET HEADER ================= */}
    <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-sm relative flex flex-col">
  
  {/* --- Header --- */}
  <div className="flex justify-between items-start">
    <div className="w-12 h-12 bg-blue-50 text-[#007ACC] rounded-xl flex items-center justify-center">
      <Wallet size={24} />
    </div>
    <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
      Account Active
    </span>
  </div>

  {/* --- Balance Section --- */}
  <div className="mt-8">
    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">
      Available Balance
    </p>

    <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
      {/* Balance Amount */}
      <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-slate-900">
        <span className="text-3xl sm:text-4xl text-slate-400 mr-1">CR</span> 
        {summary.available_cash.toLocaleString()}
      </h2>
      
      {/* Conversion Rate Badge */}
      <div className="flex items-center gap-1.5 bg-blue-50 text-[#007ACC] px-3 py-1.5 rounded-lg border border-blue-100 sm:mb-2 w-fit">
        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
          1 Credit = ₹1 INR
        </span>
      </div>
    </div>
  </div>

  {/* --- Action Button --- */}
  <button
    disabled={summary.available_cash <= 0}
    onClick={() => setShowConfirm(true)}
    className="mt-8 w-full sm:w-fit bg-[#007ACC] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#0F172A] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
  >
    Request Payout <HandCoins size={18} />
  </button>

</div>

      {/* ================= DONUT ================= */}

      {/* ================= WITHDRAWAL REQUESTS ================= */}
     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
  {/* --- Header --- */}
  <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
    <ClockArrowDown size={18} className="text-[#007ACC]" />
    <span className="font-black uppercase tracking-wider text-xs text-slate-700">
      Current Withdrawal Requests
    </span>
  </div>

  {/* --- Content List --- */}
  <div className="flex flex-col">
    {requestsLoading ? (
      <div className="py-16 flex flex-col items-center justify-center gap-3">
        <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest animate-pulse">
          Loading requests...
        </span>
      </div>
    ) : withdrawalRequests.length > 0 ? (
      withdrawalRequests.map((req) => (
        <div
          key={req.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-slate-100 last:border-0 gap-4 hover:bg-slate-50/50 transition-colors"
        >
          {/* Left Side: Amount, Status, Remarks */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <p className="font-black text-lg sm:text-xl text-slate-900 tracking-tight">
                ₹{Number(req.requested_credits).toLocaleString()}
              </p>
              <span
                className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider ${
                  STATUS_STYLES[req.status] ?? STATUS_STYLES.default
                }`}
              >
                {req.status}
              </span>
            </div>

            {req.remarks && (
              <p className="text-xs font-medium text-slate-500 flex items-start gap-1.5 sm:max-w-md line-clamp-2">
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                {req.remarks}
              </p>
            )}
          </div>

          {/* Right Side: Date */}
          <div className="flex items-center sm:justify-end shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {req.date}
            </p>
          </div>
        </div>
      ))
    ) : (
      /* --- Empty State --- */
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-2">
          <ClockArrowDown size={20} className="text-slate-300" />
        </div>
        <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest">
          No withdrawal requests
        </span>
      </div>
    )}
  </div>
</div>

      {/* ================= LEDGER ================= */}
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
  
  {/* --- Header --- */}
  <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2.5">
    <History size={18} className="text-[#007ACC]" />
    <span className="font-black uppercase tracking-wider text-xs text-slate-700">
      Transaction History
    </span>
  </div>

  {/* --- Content List --- */}
  <div className="flex flex-col">
    {ledger.length > 0 ? (
      ledger.map((entry) => (
        <div
          key={entry.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 border-b border-slate-100 last:border-0 gap-4 hover:bg-slate-50/50 transition-colors"
        >
          {/* Left Side: Type, Status, Remarks */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <p className="font-black text-lg sm:text-xl text-slate-900 tracking-tight uppercase">
                {entry.type}
              </p>
              <span
                className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-md tracking-wider ${
                  entry.status === 'Credited'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {entry.status}
              </span>
            </div>

            {entry.remarks && (
              <p className="text-xs font-medium text-slate-500 flex items-start gap-1.5 sm:max-w-md line-clamp-2">
                <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0 mt-1.5"></span>
                {entry.remarks}
              </p>
            )}
          </div>

          {/* Right Side: Credits & Date (Bottom bar on mobile, Right aligned on desktop) */}
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-slate-100 sm:border-0 gap-2">
            <p
              className={`font-black text-xl tracking-tight ${
                entry.credits > 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {entry.credits > 0 ? '+' : ''}{entry.credits} CR
            </p>
            
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              {entry.date}
            </p>
          </div>
        </div>
      ))
    ) : (
      /* --- Empty State --- */
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-2">
          <History size={20} className="text-slate-300" />
        </div>
        <span className="text-slate-400 uppercase font-bold text-[10px] tracking-widest">
          No wallet activity
        </span>
      </div>
    )}
  </div>
</div>

      {/* ================= CONFIRM PAYOUT ================= */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[200]">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-10 rounded-2xl w-full max-w-sm text-center shadow-2xl"
            >
              <CreditCard size={36} className="mx-auto text-[#007ACC]" />

              <h3 className="mt-4 font-black uppercase text-lg">
                Confirm Payout
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Withdraw
                <span className="font-black text-slate-900">
                  {' '}₹{summary.available_cash.toLocaleString()}
                </span>
                ?
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="py-3 bg-slate-100 rounded-xl font-bold uppercase text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={handlePayout}
                  disabled={processing}
                  className="py-3 bg-[#007ACC] text-white rounded-xl font-bold uppercase text-xs"
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