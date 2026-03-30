import React from 'react';
import { motion } from 'framer-motion';
import { 
  Layers, ArrowRight, Wallet, CheckCircle, 
  Plus, Bell, MessageCircle, Globe, LogIn
} from 'lucide-react';

const AppHomePage = ({ onEnterPortal }) => {
  // Simple animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  // Smooth scroll helper for mobile anchors
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] text-[#1E1E1E] font-['Plus_Jakarta_Sans',sans-serif] pb-28 selection:bg-blue-100">
      
      {/* --- MOBILE HEADER & NAV --- */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#007ACC] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers size={20} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            Radix Holdings
          </span>
        </div>

        {/* Scrollable Pill Navigation */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          <button onClick={() => scrollToSection('earn')} className="whitespace-nowrap px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[12px] font-bold text-slate-600 transition-colors">
            How to Earn
          </button>
          <button onClick={() => scrollToSection('payouts')} className="whitespace-nowrap px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[12px] font-bold text-slate-600 transition-colors">
            Payouts
          </button>
          <button onClick={() => scrollToSection('support')} className="whitespace-nowrap px-4 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-[12px] font-bold text-slate-600 transition-colors">
            Support
          </button>
        </div>
      </header>

      <main className="px-4 pt-6 space-y-12">
        
        {/* --- HERO SECTION --- */}
        <motion.section 
          initial="hidden" animate="visible" variants={fadeUp}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-full mb-6 shadow-sm">
            <Wallet size={16} className="text-emerald-500" />
            <span className="text-[12px] font-bold text-slate-700">Rate: 1.00 INR Per Credit</span>
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-4">
            Share deals. <br />
            <span className="text-blue-600">Earn money.</span>
          </h1>
          
          <p className="text-slate-500 text-sm leading-relaxed font-medium mb-8 px-2">
            The easiest way to submit business leads and get paid instantly. Verified by headquarters, built for you.
          </p>

          <button 
            onClick={onEnterPortal} 
            className="w-full bg-[#007ACC] text-white px-6 py-4 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 active:bg-[#005fb8] transition-colors shadow-lg shadow-blue-500/30"
          >
            Start Submitting Leads <ArrowRight size={18} />
          </button>
        </motion.section>

        {/* --- HOW TO EARN SECTION --- */}
        <motion.section 
          id="earn"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          className="scroll-mt-24"
        >
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">How It Works</h2>
          <div className="space-y-3">
            <ActionCard 
              icon={<Plus className="text-blue-600" />}
              title="1. Share Any Deal"
              desc="Submit clients, suppliers, or jobs easily through your dashboard."
            />
            <ActionCard 
              icon={<Bell className="text-amber-500" />}
              title="2. Get Notified"
              desc="We tell you the exact moment your lead is reviewed and accepted."
            />
            <ActionCard 
              icon={<Wallet className="text-emerald-500" />}
              title="3. Earn Credits"
              desc="Money is added securely to your wallet as soon as the deal is done."
            />
          </div>
        </motion.section>

        {/* --- PAYOUTS & APPROVALS SECTION --- */}
        <motion.section 
          id="payouts"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm scroll-mt-24"
        >
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Payouts & Approvals</h2>
          <h3 className="text-2xl font-bold mb-4 tracking-tight">Fast, simple reviews.</h3>
          <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
            When you submit a lead, our managers review it instantly. No complicated forms, no waiting around. If the lead is good, it gets approved, and your payout is unlocked.
          </p>
          <div className="flex items-center gap-3 font-bold text-slate-700 text-sm mb-3">
            <CheckCircle size={18} className="text-emerald-500 shrink-0" /> Fast Auditing
          </div>
          <div className="flex items-center gap-3 font-bold text-slate-700 text-sm">
            <CheckCircle size={18} className="text-emerald-500 shrink-0" /> Clear Status Tracking
          </div>
        </motion.section>

        {/* --- SUPPORT SECTION --- */}
        <motion.section 
          id="support"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-3 text-center">Need help?</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium text-center">
            Talk to our headquarters support team. We're here to help you get registered.
          </p>
          
          <div className="space-y-3">
            <a href="https://wa.me/yournumber" className="flex items-center p-4 bg-emerald-50 border border-emerald-100 rounded-2xl active:bg-emerald-100 transition-colors">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 mr-4 shadow-sm">
                <MessageCircle size={20}/>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Direct Line</p>
                <p className="text-sm font-bold text-emerald-900">WhatsApp Now</p>
              </div>
              <ArrowRight size={16} className="text-emerald-500" />
            </a>

            <div className="flex items-center p-4 bg-white border border-slate-200 rounded-2xl">
              <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white shrink-0 mr-4 shadow-sm">
                <Globe size={20}/>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Support</p>
                <p className="text-sm font-bold text-slate-900">hq@radixchain.com</p>
              </div>
            </div>
          </div>
        </motion.section>

      </main>

      {/* --- FLOATING BOTTOM CTA (Access Portal / Login) --- */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white/95 to-transparent pb-6 z-50">
        <button 
          onClick={onEnterPortal}
          className="w-full bg-[#1E1E1E] text-white py-4 rounded-full text-[14px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-xl shadow-slate-900/20"
        >
          <LogIn size={18} /> Login / Access Portal
        </button>
      </div>

    </div>
  );
};

// Helper Component for Mobile Action Cards
const ActionCard = ({ icon, title, desc }) => {
  const itemVars = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div variants={itemVars} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100">
        {icon}
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
};

export default AppHomePage;