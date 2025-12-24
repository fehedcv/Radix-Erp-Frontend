import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, CheckCircle, Clock, IndianRupee, 
  History, TrendingUp, ShieldCheck, Activity, 
  CreditCard, HelpCircle, FileText, PieChart, Info, HandCoins
} from 'lucide-react';
import Chart from 'react-apexcharts';

const WalletPage = () => {
  const navigate = useNavigate();
  // LOGIC PRESERVED: Data from AgentHub context
  const { myLeads = [], currentUser = {} } = useOutletContext();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  // LOGIC PRESERVED: Load withdrawal history
  useEffect(() => {
    const savedWithdrawals = localStorage.getItem('vynx_withdrawals');
    if (savedWithdrawals) {
      const allWithdrawals = JSON.parse(savedWithdrawals);
      setWithdrawalHistory(allWithdrawals.filter(w => w.agentId === currentUser.id));
    }
  }, [currentUser.id]);

  // --- WALLET CALCULATIONS (PRESERVED) ---
  const walletData = useMemo(() => {
    const totalCredits = myLeads.reduce((sum, item) => sum + (item.credits || 0), 0);
    const withdrawnAmount = withdrawalHistory
      .filter(w => w.status === 'Approved')
      .reduce((sum, w) => sum + w.amount, 0);
    const pendingAmount = withdrawalHistory
      .filter(w => w.status === 'Pending')
      .reduce((sum, w) => sum + w.amount, 0);

    const totalCashEarned = totalCredits * 10; 
    const availableCash = totalCashEarned - withdrawnAmount - pendingAmount;

    return { totalCredits, availableCash, withdrawnAmount, pendingAmount, totalCashEarned };
  }, [myLeads, withdrawalHistory]);

  const handleFinalConfirm = () => {
    if (walletData.availableCash <= 0) return;
    setIsProcessing(true);

    setTimeout(() => {
      const newRequest = {
        id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
        agentId: currentUser.id,
        agentName: currentUser.name,
        amount: walletData.availableCash,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0],
        timestamp: new Date().getTime()
      };

      const globalWithdrawals = JSON.parse(localStorage.getItem('vynx_withdrawals') || "[]");
      const updatedGlobal = [newRequest, ...globalWithdrawals];
      localStorage.setItem('vynx_withdrawals', JSON.stringify(updatedGlobal));

      setWithdrawalHistory(updatedGlobal.filter(w => w.agentId === currentUser.id));
      setIsProcessing(false);
      setShowConfirm(false);
    }, 1500);
  };

  // --- APEX CHARTS CONFIGURATIONS ---
  const areaOptions = {
    chart: { type: 'area', toolbar: { show: false }, sparkline: { enabled: true } },
    colors: ['#007ACC'],
    stroke: { curve: 'smooth', width: 2 },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.3, opacityTo: 0 } },
    tooltip: { theme: 'light', x: { show: false } }
  };
  
  const donutOptions = {
    chart: { type: 'donut' },
    labels: ['Available', 'Cleared', 'Pending'],
    colors: ['#007ACC', '#10b981', '#f59e0b'],
    legend: { position: 'bottom', fontSize: '10px', fontWeight: 700, fontFamily: 'Plus Jakarta Sans' },
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '75%' } } },
    stroke: { show: false }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] pb-24">
      
      {/* 1. ANALYTICS GRID (NOW AT TOP) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earnings History Area Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TrendingUp size={14} className="text-blue-500" /> Earning Trajectory
              </h4>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Live Activity</span>
           </div>
           <div className="h-[180px] w-full">
              <Chart options={areaOptions} series={[{ name: 'Earnings', data: myLeads.slice(-10).map(l => l.credits * 10) }]} type="area" height="100%" />
           </div>
        </div>

        {/* Funds Allocation Donut Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
           <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <PieChart size={14} className="text-blue-500" /> Resource Split
              </h4>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Allocation</span>
           </div>
           <div className="h-[180px] w-full flex items-center justify-center">
              <Chart options={donutOptions} series={[walletData.availableCash, walletData.withdrawnAmount, walletData.pendingAmount]} type="donut" height="100%" width="100%" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2. MAIN WALLET (PREMIUM LIGHT CARD) */}
        <div className="lg:col-span-8">
          <div className="bg-white border-2 border-blue-50 p-8 sm:p-10 rounded-[2rem] shadow-xl shadow-blue-500/5 relative overflow-hidden group h-full">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-[#007ACC]">
                  <IndianRupee size={24} strokeWidth={2.5} />
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Status</p>
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">ACCOUNT READY</span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Current Liquid Balance</p>
                <h3 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter">
                  <span className="text-2xl sm:text-4xl text-slate-300 mr-2 italic font-bold">₹</span>
                  {walletData.availableCash.toLocaleString()}
                </h3>
              </div>

              <div className="flex flex-wrap gap-4 mt-10">
                 <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Verified Credits</p>
                    <p className="text-sm font-bold text-slate-700">{walletData.totalCredits} CR</p>
                 </div>
                 <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
                    <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Total Value</p>
                    <p className="text-sm font-bold text-slate-700">₹{walletData.totalCashEarned.toLocaleString()}</p>
                 </div>
              </div>

              <button 
                disabled={walletData.availableCash <= 0}
                onClick={() => setShowConfirm(true)}
                className="mt-12 w-full sm:w-auto bg-[#007ACC] text-white px-10 py-4 rounded-xl font-bold text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#0F172A] transition-all shadow-lg active:scale-95 disabled:opacity-30"
              >
                Manual Payout Request <HandCoins size={16} strokeWidth={3} />
              </button>
            </div>
            <Wallet size={240} className="absolute -bottom-12 -right-12 text-slate-100 opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
          </div>
        </div>

        {/* 3. SIDEBAR STATS (RIGHT) */}
        <div className="lg:col-span-4 space-y-6">
          <StatBox icon={<CheckCircle size={18}/>} color="text-emerald-500" label="Cleared" value={`₹${walletData.withdrawnAmount.toLocaleString()}`} />
          <StatBox icon={<Clock size={18}/>} color="text-amber-500" label="Processing" value={`₹${walletData.pendingAmount.toLocaleString()}`} />

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
             <div className="flex items-center gap-2">
                <HelpCircle size={16} className="text-[#007ACC]" />
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900">Settlement Info</h5>
             </div>
             <div className="space-y-4">
                <PolicyItem text="Minimum payout: ₹100" />
                <PolicyItem text="Manual review: 24-48 hours" />
                <PolicyItem text="Collection at central office" />
             </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden mt-6">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <FileText size={18} className="text-[#007ACC]" />
              <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-tight">Recent Payouts</h4>
           </div>
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logs: {withdrawalHistory.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Request ID</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {withdrawalHistory.length > 0 ? withdrawalHistory.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5 text-xs font-bold text-slate-900 uppercase tracking-tight">{txn.id}</td>
                  <td className="px-6 py-5 text-xs text-slate-500 font-medium">{txn.date} • <span className="font-black text-slate-900">₹{txn.amount.toLocaleString()}</span></td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${txn.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                      {txn.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="3" className="py-16 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest">No past records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-2xl p-10 shadow-2xl border border-slate-100 text-center">
                <div className="w-16 h-16 bg-blue-50 text-[#007ACC] rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm"><CreditCard size={32} /></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Authorize Payout</h3>
                <p className="text-[11px] text-slate-500 mb-8 font-medium leading-relaxed px-4">Requesting manual settlement of verified credits. Our finance desk will review this entry.</p>
                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100 mb-10 text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Settlement Amount</p>
                  <p className="text-4xl font-black text-[#007ACC] tracking-tighter">₹{walletData.availableCash.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowConfirm(false)} className="py-4 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-widest">Back</button>
                  <button onClick={handleFinalConfirm} disabled={isProcessing} className="py-4 bg-[#0F172A] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#007ACC] transition-all">
                    {isProcessing ? "Transmitting..." : "Confirm"}
                  </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- HELPERS ---
const PolicyItem = ({ text }) => (
  <div className="flex gap-3 text-[10px] text-slate-500 font-medium leading-tight">
    <div className="h-1.5 w-1.5 bg-[#007ACC] rounded-full mt-1 shrink-0" />
    <span>{text}</span>
  </div>
);

const StatBox = ({ icon, color, label, value }) => (
  <div className="bg-white border border-slate-200 p-6 rounded-xl flex items-center gap-5 group hover:border-blue-400 transition-all shadow-sm">
    <div className={`p-4 bg-slate-50 rounded-xl border border-slate-100 ${color} group-hover:bg-white transition-colors shadow-sm`}>{icon}</div>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{value}</p>
    </div>
  </div>
);

export default WalletPage;