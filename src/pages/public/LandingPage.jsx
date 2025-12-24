import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  Layers, ArrowRight, Wallet, CheckCircle, 
  Terminal, Filter, MessageCircle, Globe, Plus, Bell
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = ({ onEnterPortal }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ 
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Parallax effect for the dashboard mockups
    gsap.utils.toArray('.parallax-image').forEach((el) => {
      gsap.to(el, {
        y: -30,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1
        }
      });
    });

    // Reveal animations
    gsap.utils.toArray('.reveal-up').forEach((el) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 20 },
        { 
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out", 
          scrollTrigger: { trigger: el, start: "top 90%" }
        }
      );
    });

    return () => lenis.destroy();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#F8FAFC] text-[#1E1E1E] font-['Plus_Jakarta_Sans',sans-serif] selection:bg-blue-100 overflow-x-clip">
      
   {/* --- NAVBAR --- */}
<nav className="fixed top-0 w-full z-[100] border-b border-slate-200 bg-white/80 backdrop-blur-md">
  <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <div className="flex items-center gap-4 md:gap-10">
      
      {/* LOGO + NAME SECTION */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3.5 group cursor-pointer"
      >
        <motion.div
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className="w-9 h-9 bg-[#007ACC] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20"
        >
          <Layers size={20} strokeWidth={2.5} />
        </motion.div>
        <span className="text-base font-extrabold tracking-tight text-slate-900">
          Radix Holdings
        </span>
      </motion.div>

      {/* NAV LINKS WITH HOVER ANIMATIONS */}
      <div className="hidden md:flex items-center gap-8">
        {[
          { name: 'How to Earn', href: '#earn' },
          { name: 'Payouts', href: '#payouts' },
          { name: 'Support', href: '#support' }
        ].map((link) => (
          <motion.a
            key={link.name}
            href={link.href}
            whileHover={{ y: -2 }}
            className="relative text-[11px] text-slate-500 font-bold uppercase tracking-[0.12em] hover:text-[#007ACC] transition-colors duration-300"
          >
            {link.name}
            <motion.span 
              className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#007ACC] rounded-full"
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.3 }}
            />
          </motion.a>
        ))}
      </div>
    </div>
    
    {/* ENHANCED CTA BUTTON */}
    <motion.button 
      onClick={onEnterPortal}
      whileHover={{ 
        scale: 1.03, 
        backgroundColor: '#005fb8',
        boxShadow: "0 10px 20px -10px rgba(0, 122, 204, 0.4)" 
      }}
      whileTap={{ scale: 0.97 }}
      className="bg-[#007ACC] text-white px-6 py-2.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap"
    >
      Access Portal
    </motion.button>

  </div>
</nav>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 md:pt-48 pb-16 md:pb-24 px-4 sm:px-6 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="reveal-up z-10 text-center lg:text-left">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Share deals. <br />
              <span className="text-blue-600">Earn money.</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg lg:text-xl max-w-lg mx-auto lg:mx-0 mb-8 md:mb-10 leading-relaxed font-medium">
              The simplest platform for agents to submit business leads and get paid instantly. Verified by headquarters, built for your growth.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button onClick={onEnterPortal} className="w-full sm:w-auto bg-[#007ACC] text-white px-8 py-4 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-[#005fb8] transition-all shadow-lg shadow-blue-100">
                Start Submitting Leads <ArrowRight size={18} />
              </button>
              <div className="w-full sm:w-auto px-5 py-4 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-3">
                <Wallet size={18} className="text-emerald-500" />
                <span className="text-[13px] font-bold text-slate-600">Rate: 1.00 INR Per Credit</span>
              </div>
            </div>
          </div>

          {/* PARALLAX HERO MOCKUP */}
          <div className="parallax-image relative w-full max-w-2xl mx-auto lg:mx-0">
            <div className="absolute -inset-10 bg-blue-500/10 blur-3xl rounded-full"></div>
            <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden aspect-[16/10] flex flex-col">
               <div className="bg-slate-50 border-b border-slate-200 p-3 flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
               </div>
               <div className="flex-1 p-4 md:p-6 flex gap-4 md:gap-6 overflow-hidden">
                  <div className="w-1/4 space-y-4 hidden sm:block">
                    <div className="h-8 w-full bg-blue-50 rounded-lg"></div>
                    <div className="h-3 w-3/4 bg-slate-100 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-100 rounded"></div>
                  </div>
                  <div className="flex-1 space-y-4 md:space-y-6">
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="h-16 md:h-20 bg-blue-600 rounded-xl p-3 md:p-4 text-white">
                        <div className="h-2 w-1/2 bg-white/20 rounded mb-2"></div>
                        <div className="h-4 md:h-6 w-3/4 bg-white/40 rounded"></div>
                      </div>
                      <div className="h-16 md:h-20 bg-slate-900 rounded-xl p-3 md:p-4 text-white">
                        <div className="h-2 w-1/2 bg-white/20 rounded mb-2"></div>
                        <div className="h-4 md:h-6 w-1/3 bg-white/40 rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-2 md:space-y-3">
                      {[1,2,3].map(i => <div key={i} className="h-10 md:h-12 w-full border border-slate-100 rounded-lg flex items-center px-4 gap-4">
                        <div className="h-5 w-5 bg-slate-100 rounded-full shrink-0"></div>
                        <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                      </div>)}
                    </div>
                  </div>
               </div>
            </div>
            {/* Floating Label */}
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xl flex items-center gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white"><CheckCircle size={18}/></div>
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Success</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">+₹5,400 Earned</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- QUICK EXPLANATION GRID --- */}
      <section className="bg-white border-y border-slate-200 py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-[1400px] mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">How it works</h2>
          <h3 className="text-3xl md:text-4xl font-bold tracking-tight">One simple dashboard. <br className="sm:hidden" /> Infinite opportunities.</h3>
        </div>
        <div className="max-w-[1100px] mx-auto grid sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-20">
          <BenefitItem 
            icon={<Plus className="text-blue-600" />}
            title="Share Any Deal"
            desc="Submit clients, suppliers, or manpower needs. Everything is tracked in your personal portal."
          />
          <BenefitItem 
            icon={<Bell className="text-blue-600" />}
            title="Get Notified"
            desc="Know the moment your lead is accepted by a unit manager. No more guessing or calling for updates."
          />
          <BenefitItem 
            icon={<Wallet className="text-emerald-600" />}
            title="Secure Wallet"
            desc="Track every rupee you earn. Once the deal is done, the money is added to your credit balance."
          />
        </div>
      </section>

      {/* --- AGENT VIEW SHOWCASE --- */}
      <section id="earn" className="py-16 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="reveal-up order-2 lg:order-1 text-center lg:text-left">
            <h4 className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">Agent Terminal</h4>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 md:mb-8 leading-tight">Sharing is as easy as <br className="hidden md:block" /> sending a message.</h3>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8 md:mb-10 font-medium">
              We built a clean interface that lets you focus on what matters: finding business. Just fill in the details, click submit, and we handle the rest.
            </p>
            <div className="flex flex-col items-center lg:items-start gap-4">
               <div className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0" /> Real-time status tracking
               </div>
               <div className="flex items-center gap-3 font-bold text-slate-700 text-sm">
                  <CheckCircle size={18} className="text-emerald-500 shrink-0" /> Instant credit approvals
               </div>
            </div>
          </div>

          <div className="parallax-image order-1 lg:order-2 w-full max-w-xl mx-auto">
             <div className="bg-[#1E1E1E] rounded-2xl shadow-2xl p-6 sm:p-10 border border-slate-800">
                <div className="flex items-center justify-between mb-8 text-white/40 text-[10px] font-mono tracking-widest">
                   <span>// SUBMISSION_FORM.JS</span>
                   <Terminal size={14} />
                </div>
                <div className="space-y-4">
                   <div className="h-12 w-full bg-white/5 rounded-lg border border-white/10 px-4 flex items-center text-white/30 text-sm italic">Company Name...</div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="h-12 bg-white/5 rounded-lg border border-white/10 px-4 flex items-center text-white/30 text-sm italic">Type</div>
                      <div className="h-12 bg-white/5 rounded-lg border border-white/10 px-4 flex items-center text-white/30 text-sm italic">Potential CR</div>
                   </div>
                   <button className="w-full py-4 bg-blue-600 text-white font-bold rounded-lg uppercase tracking-[0.15em] text-xs hover:bg-blue-500 transition-colors">SUBMIT TO HQ</button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- MANAGER HUB SHOWCASE --- */}
      <section id="payouts" className="py-16 md:py-32 px-4 sm:px-6 bg-slate-50/50 border-t border-slate-200 overflow-hidden">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="parallax-image w-full max-w-xl mx-auto">
             <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incoming Deals</p>
                   <Filter size={14} className="text-slate-300" />
                </div>
                <div className="p-3 md:p-5 space-y-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xs">L</div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-900">Logistics Lead</p>
                            <p className="text-[9px] text-slate-400">2m ago</p>
                          </div>
                        </div>
                        <button className="bg-emerald-500 text-white text-[9px] font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors">ACCEPT</button>
                     </div>
                   ))}
                </div>
             </div>
          </div>
          <div className="reveal-up text-center lg:text-left">
            <h4 className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-4">Manager Suite</h4>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 md:mb-8 leading-tight">Review and Verify. <br />Keep the chain moving.</h3>
            <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8 md:mb-10 font-medium">
              Unit managers get notified instantly when a new lead is submitted. Accept projects, add details, and mark them as successful to release payouts.
            </p>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
               <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Lead Auditing</p>
                  <p className="text-xs md:text-sm font-bold text-slate-900">Fast Approval</p>
               </div>
               <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Team Sync</p>
                  <p className="text-xs md:text-sm font-bold text-slate-900">Shared Dashboard</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- WHATSAPP & SUPPORT --- */}
      <section id="support" className="py-20 md:py-32 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="reveal-up">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 md:mb-8 leading-tight text-[#0F172A]">Need help <br className="sm:hidden" /> getting started?</h2>
          <p className="text-slate-500 text-base md:text-lg mb-10 md:mb-12 font-medium max-w-xl mx-auto">Talk to our headquarters support team. We're here to help you register and start sharing leads today.</p>
          
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-12">
            <a href="https://wa.me/yournumber" className="flex items-center gap-4 p-5 md:p-6 bg-emerald-50 border border-emerald-100 rounded-2xl hover:bg-emerald-100 transition-all group">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shrink-0"><MessageCircle size={24}/></div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Direct Line</p>
                <p className="text-sm font-bold text-emerald-900">WhatsApp Now</p>
              </div>
            </a>
            <div className="flex items-center gap-4 p-5 md:p-6 bg-white border border-slate-200 rounded-2xl">
              <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white shrink-0"><Globe size={24}/></div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email Support</p>
                <p className="text-sm font-bold text-slate-900">hq@radixchain.com</p>
              </div>
            </div>
          </div>

          <button onClick={onEnterPortal} className="w-full sm:w-auto bg-[#1E1E1E] text-white px-10 md:px-12 py-5 rounded-full text-[13px] font-bold uppercase tracking-[0.2em] hover:bg-[#007ACC] transition-all shadow-2xl active:scale-95">
              Get Started
          </button>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-4 sm:px-6 border-t border-slate-200 bg-white">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8 text-[12px] text-slate-400 font-medium">
              <span className="text-slate-900 font-bold">RadixChain ERP</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-blue-600">Privacy</a>
                <a href="#" className="hover:text-blue-600">Terms</a>
              </div>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              © 2025 Radix Holdings • Developed by Vynx Webworks
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- HELPER COMPONENT ---

const BenefitItem = ({ icon, title, desc }) => (
  <div className="reveal-up group text-center sm:text-left">
    <div className="mb-6 flex justify-center sm:justify-start">
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300">
        {icon}
      </div>
    </div>
    <h4 className="text-lg font-bold mb-3 uppercase tracking-tight text-[#1E1E1E]">{title}</h4>
    <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);

export default LandingPage;