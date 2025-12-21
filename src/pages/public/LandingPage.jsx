import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight, Terminal, Users, Building2, Briefcase, 
  Wallet, ChevronRight, Globe, ShieldCheck, 
  MessageCircle, Send, Database, Activity, Cpu, Code2
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = ({ onEnterPortal }) => {
  const scrollRef = useRef(null);
  const workflowRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach((el) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%" }
        }
      );
    });

    gsap.to(lineRef.current, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: workflowRef.current,
        start: "top center", 
        end: "bottom center",
        scrub: 1, 
      }
    });

    const nodes = gsap.utils.toArray('.node-circle');
    nodes.forEach((node) => {
      gsap.fromTo(node, 
        { borderColor: "#f1f5f9", backgroundColor: "#ffffff", color: "#94a3b8" },
        { 
          borderColor: "#4f46e5", 
          backgroundColor: "#f8fafc",
          color: "#4f46e5",
          scrollTrigger: {
            trigger: node,
            start: "top center",
            end: "bottom center",
            toggleActions: "play reverse play reverse",
            scrub: 0.5
          }
        }
      );
    });

    return () => lenis.destroy();
  }, []);

  return (
    <div ref={scrollRef} className="bg-white text-slate-800 font-sans antialiased selection:bg-indigo-600 selection:text-white">
      
      {/* --- NAVBAR: RESPONSIVE --- */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-16 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-indigo-600" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-900">Radix</span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <div className="hidden md:flex items-center gap-8">
              {['Process', 'Ecosystem', 'Contact'].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <button 
              onClick={onEnterPortal}
              className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white px-4 sm:px-5 py-2 hover:bg-indigo-600 transition-all active:scale-95"
            >
              Partner Portal
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO: RESPONSIVE TYPOGRAPHY --- */}
      <section className="pt-32 sm:pt-[120px] pb-20 px-6 max-w-5xl mx-auto text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-indigo-600 mb-6 block">Unified Infrastructure</span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-slate-900 leading-[1.2] sm:leading-[1.1] mb-8">
            The central intelligence for <br className="hidden sm:block" /> modern business operations.
          </h1>
          <p className="text-slate-500 text-sm sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed px-4">
            Managing multiple business nodes, agents, and credit ledgers through a single, high-performance headquarters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onEnterPortal} className="w-full sm:w-auto group flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3.5 text-[11px] font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all">
              Initialize Onboarding <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="w-full sm:w-auto text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 px-6 py-3.5">
              1 Credit = 1 INR
            </span>
          </div>
        </motion.div>
      </section>

      {/* --- ECOSYSTEM: RESPONSIVE GRID --- */}
      <section id="ecosystem" className="py-10 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto reveal">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-px bg-slate-100 border border-slate-100 shadow-sm">
          <EcoCard icon={<Building2 size={20}/>} title="Construction" desc="Agent-led sourcing for infrastructure projects." />
          <EcoCard icon={<Briefcase size={20}/>} title="Events Mgmt" desc="Full-scale coordination for enterprise events." />
          <EcoCard icon={<Wallet size={20}/>} title="Digital Ledger" desc="Instant credit settlements for all network partners." />
          <EcoCard icon={<Database size={20}/>} title="HQ Systems" desc="Centralized data and deal verification." />
          <EcoCard icon={<Users size={20}/>} title="Agent Network" desc="A unified portal for verified business agents." />
          <EcoCard icon={<Activity size={20}/>} title="Live Metrics" desc="Real-time monitoring of all ecosystem nodes." />
        </div>
      </section>

      {/* --- WORKFLOW: RESPONSIVE STACKING --- */}
      <section id="process" ref={workflowRef} className="py-20 sm:py-32 px-6 max-w-5xl mx-auto reveal">
        <div className="flex flex-col items-center text-center mb-16 sm:mb-24">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mb-4">Operational Architecture</h2>
          <h3 className="text-2xl sm:text-4xl font-bold text-slate-900 uppercase tracking-tighter">The Radix Workflow</h3>
        </div>

        <div className="relative">
          {/* Static Track Line (Responsive positioning) */}
          <div className="absolute left-[23px] md:left-1/2 top-0 w-[1px] h-full bg-slate-100 -translate-x-1/2 z-0" />
          
          {/* Animated Progress Line */}
          <div 
            ref={lineRef}
            className="absolute left-[23px] md:left-1/2 top-0 w-[2px] bg-indigo-600 -translate-x-1/2 z-10 origin-top h-0 shadow-[0_0_15px_rgba(79,70,229,0.3)]" 
          />

          <DetailedStep 
            side="left"
            num="01" 
            title="Sourcing & Ingestion" 
            desc="Registered agents transmit business nodes through the Radix encrypted portal."
            icon={<Database size={18} />}
          />
          <DetailedStep 
            side="right"
            num="02" 
            title="HQ Validation" 
            desc="The central audit engine reviews parameters and verifies agent credentials within 24 hours."
            icon={<ShieldCheck size={18} />}
          />
          <DetailedStep 
            side="left"
            num="03" 
            title="Ledger Settlement" 
            desc="Upon deal confirmation, the system executes an automated credit dispatch to the agent's ledger."
            icon={<Activity size={18} />}
          />
        </div>
      </section>

      {/* --- CONTACT SECTION: RESPONSIVE --- */}
      <section id="contact" className="py-20 sm:py-32 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 sm:gap-20 items-center reveal">
          <div>
            <h3 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 sm:mb-8 tracking-tighter uppercase leading-none">Connect <br /> to HQ.</h3>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium text-base sm:text-lg">Inquire about partnership opportunities or technical integration.</p>
            <div className="flex flex-col gap-6">
               <ContactLink icon={<MessageCircle size={18}/>} label="WhatsApp Business" sub="Direct line to support" />
               <ContactLink icon={<Globe size={18}/>} label="Global Support" sub="hq@radixgroup.com" />
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="bg-white p-6 sm:p-10 border border-slate-100 shadow-sm"
          >
            <form className="space-y-6">
              <div className="group space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Legal Name</label>
                <input type="text" className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-indigo-600 transition-all text-sm font-bold" />
              </div>
              <div className="group space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Business Email</label>
                <input type="email" className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-indigo-600 transition-all text-sm font-bold" />
              </div>
              <div className="group space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Message</label>
                <textarea rows="3" className="w-full bg-transparent border-b border-slate-200 py-3 outline-none focus:border-indigo-600 transition-all text-sm font-bold resize-none" />
              </div>
              <button className="w-full bg-slate-900 text-white py-5 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                Transmit Inquiry <Send size={14} />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER: SIMPLE & CLEAN --- */}
      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
          <div className="flex flex-col md:flex-row justify-between w-full items-center gap-6">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-slate-900" />
              <span className="text-[10px] font-black uppercase tracking-widest">Radix Holdings</span>
            </div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
              © 2025 Infrastructure Layer • All Rights Reserved
            </div>
            <div className="flex gap-4">
              <ShieldCheck size={16} className="text-slate-300" />
              <Globe size={16} className="text-slate-300" />
            </div>
          </div>
          
          <div className="w-full h-px bg-slate-50" />

          <div className="flex flex-col items-center gap-4">
            <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">Engineered by</span>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Vynx Webworks</span>
              <div className="h-3 w-px bg-slate-200" />
              <a href="#" className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">Contact Developer</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// --- SUB COMPONENTS ---

const EcoCard = ({ icon, title, desc }) => (
  <div className="bg-white p-8 sm:p-10 group hover:bg-slate-50/50 transition-colors cursor-default">
    <div className="text-slate-900 mb-6 sm:mb-8 p-3 border border-slate-100 inline-block group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all rounded-lg">
      {icon}
    </div>
    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 mb-3">{title}</h4>
    <p className="text-[11px] text-slate-400 leading-relaxed font-bold">{desc}</p>
  </div>
);

const DetailedStep = ({ num, title, desc, icon, side }) => (
  <div className={`flex flex-row items-start md:items-center gap-6 md:gap-0 relative z-20 py-10 sm:py-16 ${side === 'right' ? 'md:flex-row-reverse' : ''}`}>
    {/* Content */}
    <div className="w-full md:w-1/2 md:px-10 pl-14 pr-4">
      <div className={`${side === 'right' ? 'text-left' : 'text-left md:text-right'} space-y-2`}>
        <div className={`flex items-center gap-3 ${side === 'right' ? 'justify-start' : 'justify-start md:justify-end'}`}>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{num}</span>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-tight">{title}</h4>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed font-bold max-w-sm ml-0 md:ml-auto md:mr-0">{desc}</p>
      </div>
    </div>
    
    {/* Node Circle */}
    <div className="absolute left-0 md:relative md:left-auto flex-shrink-0 w-12 h-12 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center z-30 shadow-sm transition-transform duration-500 node-circle">
      {icon}
    </div>

    <div className="hidden md:block w-1/2" />
  </div>
);

const ContactLink = ({ icon, label, sub }) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-600 transition-all rounded-xl shadow-sm">
      {icon}
    </div>
    <div>
      <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</p>
      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
    </div>
  </div>
);

export default LandingPage;