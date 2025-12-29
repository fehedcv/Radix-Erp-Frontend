import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  HandCoins,
  CreditCard
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';

const WalletPage = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ---------------- FETCH WALLET ---------------- */
  useEffect(() => {
    fetchWallet();
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

  /* ---------------- REQUEST PAYOUT ---------------- */
  const handlePayout = async () => {
    setProcessing(true);
    try {
      await frappeApi.post(
        '/method/business_chain.api.wallet.request_withdrawal',
        {
          amount: wallet.summary.available_cash
        }
      );
      await fetchWallet();
      setShowConfirm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !wallet) {
    return (
      <div className="py-32 text-center font-black uppercase text-slate-400">
        Loading wallet…
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
      <div className="bg-white p-10 rounded-2xl border shadow-sm relative">
        <div className="flex justify-between items-start">
          <Wallet size={28} className="text-[#007ACC]" />
          <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black uppercase">
            Account Active
          </span>
        </div>

        <p className="mt-6 text-slate-400 text-xs uppercase tracking-widest">
          Available Balance
        </p>

        <h2 className="text-6xl font-black tracking-tight">
          ₹{summary.available_cash.toLocaleString()}
        </h2>

        <button
          disabled={summary.available_cash <= 0}
          onClick={() => setShowConfirm(true)}
          className="mt-8 bg-[#007ACC] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#0F172A] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Request Payout <HandCoins size={18} />
        </button>
      </div>

      {/* ================= DONUT ================= */}
      <div className="bg-white p-6 rounded-2xl border">
        <Chart
          type="donut"
          height={260}
          series={donutSeries}
          options={donutOptions}
        />
      </div>

      {/* ================= LEDGER ================= */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-6 border-b font-black uppercase text-xs">
          Transaction History
        </div>

        {ledger.length > 0 ? (
          ledger.map(entry => (
            <div
              key={entry.id}
              className="flex justify-between items-center p-6 border-b last:border-0"
            >
              <div>
                <p className="font-black uppercase text-sm">
                  {entry.type}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                      entry.status === 'Credited'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {entry.status}
                  </span>

                  {entry.remarks && (
                    <p className="text-xs text-slate-400 truncate max-w-xs">
                      {entry.remarks}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p
                  className={`font-black ${
                    entry.credits > 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {entry.credits > 0 ? '+' : ''}
                  {entry.credits} CR
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {entry.date}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 uppercase font-bold text-xs">
            No wallet activity
          </div>
        )}
      </div>

      {/* ================= CONFIRM PAYOUT ================= */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]">
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
