import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  UserPlus, Send, ClipboardCheck, 
  CheckCircle2, Wallet, ArrowRight 
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const Workflow = () => {
  const lineRef = useRef(null);
  const workflowRef = useRef(null);

  useEffect(() => {
    // 1. Progress Line Animation (Fills as you scroll)
    gsap.to(lineRef.current, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: workflowRef.current,
        start: "top center",
        end: "bottom center",
        scrub: 1.2,
      }
    });

    // 2. Staggered Card Reveals
    const cards = gsap.utils.toArray('.workflow-card');
    cards.forEach((card, i) => {
      gsap.fromTo(card, 
        { 
          opacity: 0, 
          x: i % 2 === 0 ? -40 : 40 
        },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });
  }, []);

  return (
    <section 
      id="workflow" 
      ref={workflowRef} 
      className="relative z-10 py-24 sm:py-32 px-6 max-w-6xl mx-auto overflow-hidden"
    >
      {/* --- SECTION HEADER --- */}
      <div className="text-center mb-28 reveal">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.4em] text-indigo-500 mb-4">Partner Journey</h2>
        <h3 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#0F172A]">
          The Path to <span className="text-indigo-600">Success.</span>
        </h3>
        <p className="text-slate-500 mt-6 max-w-xl mx-auto font-medium text-lg">
          A transparent, step-by-step process designed for Agents to grow their business and earn verified credits.
        </p>
      </div>

      <div className="relative">
        {/* --- CENTRAL PIPELINE LINE --- */}
        {/* Gray Static Line */}
        <div className="absolute left-6 sm:left-1/2 top-0 w-[1px] h-full bg-slate-100 -translate-x-1/2 z-0" />
        
        {/* Animated Gradient Progress Line */}
        <div 
          ref={lineRef} 
          className="absolute left-6 sm:left-1/2 top-0 w-[3px] bg-gradient-to-b from-indigo-600 via-purple-500 to-rose-500 -translate-x-1/2 z-10 origin-top h-0 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
        />

        {/* --- STEP 01: ONBOARDING --- */}
        <div className="workflow-card relative z-20 mb-24 flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-0">
          <div className="w-full sm:w-1/2 sm:pr-24 pl-16 sm:pl-0 text-left sm:text-right">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Step 01 <ArrowRight size={12} className="hidden sm:block" />
            </span>
            <h4 className="text-2xl font-bold mb-3 tracking-tight text-[#0F172A]">Join the Chain</h4>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Create your partner profile and access the dashboard. This is where you’ll manage your leads and track your wallet growth.
            </p>
          </div>
          <div className="absolute left-0 sm:left-1/2 -translate-x-0 sm:-translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-indigo-100 rounded-2xl flex items-center justify-center shadow-2xl z-30 transition-transform duration-500 hover:scale-110">
            <UserPlus size={24} className="text-indigo-600" />
          </div>
          <div className="hidden sm:block w-1/2" />
        </div>

        {/* --- STEP 02: SUBMISSION --- */}
        <div className="workflow-card relative z-20 mb-24 flex flex-col sm:flex-row-reverse items-start sm:items-center gap-10 sm:gap-0">
          <div className="w-full sm:w-1/2 sm:pl-24 pl-16 text-left">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-purple-600 bg-purple-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
               Step 02 <ArrowRight size={12} />
            </span>
            <h4 className="text-2xl font-bold mb-3 tracking-tight text-[#0F172A]">Submit Business Leads</h4>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Share details for clients, suppliers, or manpower requirements. Our encrypted forms ensure your data is secure and sent directly to the right unit.
            </p>
          </div>
          <div className="absolute left-0 sm:left-1/2 -translate-x-0 sm:-translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-purple-100 rounded-2xl flex items-center justify-center shadow-2xl z-30 transition-transform duration-500 hover:scale-110">
            <Send size={24} className="text-purple-600" />
          </div>
          <div className="hidden sm:block w-1/2" />
        </div>

        {/* --- STEP 03: REVIEW --- */}
        <div className="workflow-card relative z-20 mb-24 flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-0">
          <div className="w-full sm:w-1/2 sm:pr-24 pl-16 sm:pl-0 text-left sm:text-right">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Step 03 <ArrowRight size={12} className="hidden sm:block" />
            </span>
            <h4 className="text-2xl font-bold mb-3 tracking-tight text-[#0F172A]">Real-Time Verification</h4>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Business managers review your submission instantly. Your lead status moves from <span className="text-amber-500 font-bold">Pending</span> to <span className="text-indigo-600 font-bold">Accepted</span> as the project begins.
            </p>
          </div>
          <div className="absolute left-0 sm:left-1/2 -translate-x-0 sm:-translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-indigo-100 rounded-2xl flex items-center justify-center shadow-2xl z-30 transition-transform duration-500 hover:scale-110">
            <ClipboardCheck size={24} className="text-indigo-600" />
          </div>
          <div className="hidden sm:block w-1/2" />
        </div>

        {/* --- STEP 04: EXECUTION/SUCCESS --- */}
        <div className="workflow-card relative z-20 mb-24 flex flex-col sm:flex-row-reverse items-start sm:items-center gap-10 sm:gap-0">
          <div className="w-full sm:w-1/2 sm:pl-24 pl-16 text-left">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
               Step 04 <ArrowRight size={12} />
            </span>
            <h4 className="text-2xl font-bold mb-3 tracking-tight text-[#0F172A]">Project Success</h4>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              Units execute the project. You can monitor progress milestones on your dashboard until the manager marks the deal as <span className="text-emerald-600 font-bold">Successful.</span>
            </p>
          </div>
          <div className="absolute left-0 sm:left-1/2 -translate-x-0 sm:-translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-rose-100 rounded-2xl flex items-center justify-center shadow-2xl z-30 transition-transform duration-500 hover:scale-110">
            <CheckCircle2 size={24} className="text-rose-600" />
          </div>
          <div className="hidden sm:block w-1/2" />
        </div>

        {/* --- STEP 05: PAYOUT --- */}
        <div className="workflow-card relative z-20 flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-0">
          <div className="w-full sm:w-1/2 sm:pr-24 pl-16 sm:pl-0 text-left sm:text-right">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest mb-4">
              Step 05 <ArrowRight size={12} className="hidden sm:block" />
            </span>
            <h4 className="text-2xl font-bold mb-3 tracking-tight text-[#0F172A]">Credit Settlement</h4>
            <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-medium">
              HQ approves the final milestone and adds credits directly to your digital wallet. View your earnings instantly—every credit is 1.00 INR.
            </p>
          </div>
          <div className="absolute left-0 sm:left-1/2 -translate-x-0 sm:-translate-x-1/2 w-12 h-12 sm:w-16 sm:h-16 bg-white border-2 border-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] z-30 transition-transform duration-500 hover:scale-110">
            <Wallet size={24} className="text-emerald-600" />
          </div>
          <div className="hidden sm:block w-1/2" />
        </div>
      </div>
    </section>
  );
};

export default Workflow;