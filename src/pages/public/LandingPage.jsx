import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { 
  ArrowRight, Wallet, CheckCircle, 
  Send, MessageCircle, Globe, Plus,
  ShieldCheck, TrendingUp, Zap, Clock, Lock, ArrowUpRight
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import AppHomePage from './AppHomePage'; 

gsap.registerPlugin(ScrollTrigger);

const WebLandingPage = ({ onEnterPortal }) => {
  const containerRef = useRef(null);
  const flowLineRef = useRef(null);

  useEffect(() => {
    // 1. Smooth scrolling setup
    const lenis = new Lenis({ 
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // 2. Responsive GSAP Animations (Desktop only for complex parallax)
    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // General Parallax Elements
      gsap.utils.toArray('.parallax-element').forEach((el) => {
        gsap.to(el, {
          y: -50,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1 
          }
        });
      });

      // How It Works Cards
      gsap.utils.toArray('.parallax-card').forEach((el) => {
        gsap.fromTo(el, 
          { y: 80 },
          { 
            y: -80, 
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          }
        );
      });

      // Dashboard Screenshot Stack Effect
      gsap.to('.screen-2', {
        y: -180, // Slides up over the first screenshot
        ease: "power1.out",
        scrollTrigger: {
          trigger: '.screenshot-section',
          start: "top center",
          end: "bottom center",
          scrub: 1.5
        }
      });
    });

    // 3. Animations for ALL devices (Mobile + Desktop)
    
    // Fade up animations
    gsap.utils.toArray('.reveal-up').forEach((el) => {
      gsap.fromTo(el, 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, y: 0, duration: 1, ease: "power3.out", 
          scrollTrigger: { trigger: el, start: "top 85%" }
        }
      );
    });

    // Approvals Animated Flow Line
    if (flowLineRef.current) {
      gsap.to(flowLineRef.current, {
        x: "300%",
        duration: 2.5,
        repeat: -1,
        ease: "linear"
      });
    }

    return () => {
      lenis.destroy();
      mm.revert(); // Clean up matchMedia
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#07070A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#B282FE]/30 overflow-x-clip">
      
      {/* Google Fonts Import for Syne (Headings) and Plus Jakarta Sans (Body) */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@400;500;600;700;800&display=swap');
      `}} />

      {/* Background Glowing Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9D4EDD]/25 via-[#2A0A4A]/20 to-transparent blur-[120px] -z-10 pointer-events-none"></div>

      {/* --- NEW MODERN FLOATING NAVBAR --- */}
     {/* --- STANDARD FULL-WIDTH NAVBAR --- */}
      <header className="fixed top-0 left-0 w-full z-[100] bg-[#07070A]/80 backdrop-blur-xl border-b border-white/5">
        <nav className="max-w-[1400px] mx-auto px-6 sm:px-16 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-12">
            
            {/* LOGO */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 group cursor-pointer"
            >
             
              <span className="text-lg font-medium tracking-tight text-white">
                Radix Holdings
              </span>
            </motion.div>

            {/* NAV LINKS */}
            <div className="hidden md:flex items-center gap-8">
              {['How it Works', 'Dashboard', 'Contact Us'].map((item) => (
                <a
                  key={item}
                  href={`#${item.split(' ').pop().toLowerCase()}`}
                  className="text-xs font-medium text-white/50 hover:text-white transition-colors duration-300 uppercase tracking-widest"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
          
          {/* CTA BUTTON WITH BORDER FILL HOVER */}
          <button 
            onClick={onEnterPortal}
            className="group relative px-6 py-2.5 rounded-full overflow-hidden text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap text-white"
          >
            <span className="absolute inset-0 border border-white/20 rounded-full transition-colors duration-300 group-hover:border-transparent"></span>
            <span className="absolute inset-0 bg-white transition-transform duration-500 ease-out translate-y-full group-hover:translate-y-0 rounded-full"></span>
            <span className="relative z-10 transition-colors duration-300 group-hover:text-black">Let's Earn</span>
          </button>
        </nav>
      </header>

      <main className="pt-20">
        {/* --- HERO SECTION --- */}
        <section className="relative pt-24 md:pt-24 pb-20 md:pb-32 px-4 sm:px-6 max-w-[1200px] mx-auto min-h-[85vh] flex flex-col">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12 z-20 relative w-full">
            <div className="reveal-up lg:w-[60%] mt-8 lg:mt-0">
              <h1 className="font-['Syne',sans-serif] text-6xl sm:text-7xl lg:text-[5.5rem] font-medium tracking-tighter leading-[1.05] text-white">
                Share Deals. <br />
                Earn Cash.
              </h1>
            </div>
            
            <div className="reveal-up lg:w-[40%] flex flex-col items-start lg:pl-10 text-left relative">
              <p className="text-white/60 text-sm md:text-base leading-relaxed font-light mb-8 max-w-sm">
                Join our new partner program. Send us high-quality business leads, track them easily, and get paid fast when deals close.
              </p>

              <button 
                onClick={onEnterPortal} 
                className="group relative px-8 py-4 rounded-full overflow-hidden text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-2xl"
              >
                <span className="absolute inset-0 border border-white/20 rounded-full transition-colors duration-300 group-hover:border-transparent"></span>
                <span className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-[#B282FE] to-[#7038FF] transition-all duration-500 ease-out group-hover:h-full rounded-full"></span>
                <span className="relative flex items-center justify-center gap-3 z-10">
                   Start Earning Today <ArrowRight size={16} />
                </span>
              </button>
            </div>
          </div>

          {/* Value Proposition Cards (Replaced numbers with product value) */}
          <div className="parallax-element relative mt-24 lg:mt-32 w-full flex flex-col md:flex-row items-center lg:items-end justify-center lg:justify-end gap-6 z-10">
             
             <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[200%] -z-10 pointer-events-none opacity-20 hidden lg:block" viewBox="0 0 1000 500" fill="none">
                <path d="M-100,250 C200,250 300,50 500,250 C700,450 900,250 1100,250" stroke="white" strokeWidth="1" />
                <path d="M500,250 C500,100 800,0 1100,100" stroke="white" strokeWidth="1" strokeDasharray="4 4"/>
             </svg>

             {/* Left Card - Earning Potential */}
             <div className="bg-[#12121A]/90 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-black/80 w-full md:w-auto relative group transition-transform duration-500 hover:-translate-y-2">
                <div className="absolute left-0 top-[60%] -translate-x-full w-12 h-[1px] bg-white/20 hidden md:block group-hover:bg-[#B282FE]/50 transition-colors">
                   <div className="absolute left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[#B282FE]/50 transition-colors"></div>
                </div>
                
                <h2 className="font-['Syne',sans-serif] text-white/40 text-[10px] font-medium tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                  <Wallet size={14} className="text-[#B282FE]" /> Registered Businesses
                </h2>
                <p className="text-6xl md:text-7xl font-light tracking-tighter text-white mb-2">Seven</p>
                <p className="text-white/40 text-xs font-light tracking-wide">Verified Business Units.</p>
             </div>

             {/* Right Card - Easy Setup */}
             <div className="bg-[#12121A]/90 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-black/80 w-full md:w-auto relative group transition-transform duration-500 hover:-translate-y-2 lg:mb-8">
                <div className="absolute left-0 top-[40%] -translate-x-full w-12 h-[1px] bg-white/20 hidden md:block group-hover:bg-[#B282FE]/50 transition-colors"></div>

                <h2 className="font-['Syne',sans-serif] text-white/40 text-[10px] font-medium tracking-[0.2em] uppercase mb-4 text-left flex items-center gap-2">
                  <Lock size={14} className="text-[#B282FE]" /> Platform Access
                </h2>
                <p className="text-5xl md:text-6xl font-light tracking-tighter text-white text-left mb-2">Free</p>
                <p className="text-white/40 text-xs font-light tracking-wide mb-6">Zero hidden fees. Start submitting instantly.</p>
                
                <div className="absolute -bottom-4 right-10 flex items-center">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7038FF] to-[#B282FE] flex items-center justify-center text-[10px] font-bold border-4 border-[#07070A] shadow-lg z-30">HQ</div>
                   <div className="w-10 h-10 rounded-full bg-[#1A1A24] flex items-center justify-center text-emerald-400 text-[12px] border-4 border-[#07070A] -ml-4 shadow-lg z-20"><CheckCircle size={16}/></div>
                   <div className="w-10 h-10 rounded-full bg-[#2A2A3A] flex items-center justify-center text-white/50 border-4 border-[#07070A] -ml-4 shadow-lg hover:bg-white/10 transition-colors cursor-pointer z-10"><Plus size={14}/></div>
                </div>
             </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="works" className="py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5">
          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 relative">
            
            <div className="lg:col-span-5 lg:sticky lg:top-40 self-start reveal-up">
              
               <h3 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
                 Built for speed. <br/> Designed for you.
               </h3>
               <p className="text-white/50 text-lg leading-relaxed font-light mb-8 max-w-md">
                 Transform your professional network into a steady stream of income. Our streamlined process ensures you spend less time submitting, and more time earning.
               </p>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-8 md:gap-12 lg:pt-10">
               
               <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  {/* <div className="absolute top-0 right-0 p-8 text-white/5 font-bold text-8xl pointer-events-none">1</div> */}
                  <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                     <Send className="text-[#B282FE]" size={24} />
                  </div>
                  <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">Send us the details</h4>
                  <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                     Know a company that needs specific services? Simply log into your dashboard and fill out a quick, one-minute form to register your lead in our secure system.
                  </p>
               </div>

               <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  {/* <div className="absolute top-0 right-0 p-8 text-white/5 font-bold text-8xl pointer-events-none">2</div> */}
                  <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                     <ShieldCheck className="text-[#B282FE]" size={24} />
                  </div>
                  <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">We close the deal</h4>
                  <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                     Our professional sales team takes over immediately. They contact the business and negotiate the contract. You get live status updates directly in your dashboard.
                  </p>
               </div>

               <div className="parallax-card bg-[#12121A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                  {/* <div className="absolute top-0 right-0 p-8 text-white/5 font-bold text-8xl pointer-events-none">3</div> */}
                  <div className="w-14 h-14 bg-[#1A1A24] border border-white/10 rounded-2xl flex items-center justify-center mb-8 relative z-10">
                     <Wallet className="text-[#B282FE]" size={24} />
                  </div>
                  <h4 className="font-['Syne',sans-serif] text-2xl font-medium mb-4 text-white relative z-10">You get paid</h4>
                  <p className="text-white/50 leading-relaxed font-light text-lg relative z-10">
                     The moment the deal is signed and verified by headquarters, your commission is automatically calculated and deposited straight into your secure platform wallet.
                  </p>
               </div>

            </div>
          </div>
        </section>

        {/* --- DASHBOARD SCREENSHOTS (Desktop + Mobile Stack Parallax) --- */}
        <section id="dashboard" className="screenshot-section py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5 overflow-hidden">
           <div className="max-w-[1200px] mx-auto">
              
              <div className="text-center mb-16 md:mb-24 reveal-up">
                 {/* <h2 className="font-['Syne',sans-serif] text-xs font-medium text-[#B282FE] uppercase tracking-[0.2em] mb-4">Inside the Platform</h2> */}
                 <h3 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
                   Manage your business <br className="hidden md:block" />from anywhere.
                 </h3>
                 <p className="text-white/50 text-lg leading-relaxed font-light max-w-2xl mx-auto">
                   Track your submissions, monitor approval status, and watch your earnings grow from a clean, intuitive interface that works flawlessly on your computer and right from your pocket.
                 </p>
              </div>

              {/* Stacked Images Layout */}
              <div className="relative h-auto md:h-[550px] lg:h-[700px] w-full flex flex-col md:block gap-12 md:gap-0">
                 
                 {/* Desktop Screenshot (Base Layer) */}
                 <div className="screen-1 relative md:absolute md:top-0 md:left-0 md:w-[80%] w-full h-auto rounded-[2rem] border border-white/10 bg-[#12121A] shadow-2xl overflow-hidden z-10">
                    {/* Simulated Browser/App Header */}
                    <div className="w-full h-10 bg-white/5 flex items-center px-6 border-b border-white/5">
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#ff5f56] transition-colors"></div>
                          <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#ffbd2e] transition-colors"></div>
                          <div className="w-3 h-3 rounded-full bg-white/20 hover:bg-[#27c93f] transition-colors"></div>
                       </div>
                    </div>
                    
                    {/* DESKTOP IMAGE PLACEHOLDER: Put your <img> here */}
                    <div className="w-full aspect-[16/9] flex items-center justify-center bg-[#1A1A24] relative overflow-hidden">
                       {/* <img src="/your-desktop-screenshot.png" alt="Desktop Dashboard" className="w-full h-full object-cover" /> */}
                       <span className="text-white/20 font-medium tracking-widest uppercase text-sm">Desktop Dashboard (16:9)</span>
                    </div>
                 </div>

                 {/* Mobile Screenshot (Overlay Layer - Slides up on scroll via GSAP on Desktop) */}
                 <div className="screen-2 relative md:absolute md:top-[120px] lg:top-[150px] md:right-[5%] w-[65%] sm:w-[50%] md:w-[26%] mx-auto md:mx-0 h-auto rounded-[2.5rem] border-[6px] lg:border-[8px] border-[#1A1A24] bg-[#12121A] shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden z-20">
                    
                    {/* Simulated Phone Notch */}
                    <div className="absolute top-0 inset-x-0 h-5 flex justify-center z-30">
                       <div className="w-[40%] h-full bg-[#1A1A24] rounded-b-xl"></div>
                    </div>

                    {/* MOBILE IMAGE PLACEHOLDER: Put your <img> here */}
                    <div className="w-full aspect-[9/16] flex items-center justify-center bg-gradient-to-br from-[#1A1A24] to-[#0A0A0F] pt-6 relative overflow-hidden">
                       {/* <img src="/your-mobile-screenshot.png" alt="Mobile Dashboard" className="w-full h-full object-cover" /> */}
                       <span className="text-white/20 font-medium tracking-widest uppercase text-[10px] text-center px-4 leading-relaxed">
                          Mobile App <br/> (9:16)
                       </span>
                    </div>
                    
                    {/* Simulated Home Indicator */}
                    <div className="absolute bottom-2 inset-x-0 flex justify-center z-30">
                       <div className="w-1/3 h-1 bg-white/20 rounded-full"></div>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* --- FAST APPROVALS (Animated Flow Pipeline) --- */}
        <section id="approvals" className="py-24 md:py-32 px-4 sm:px-6 relative border-t border-white/5 bg-gradient-to-b from-[#07070A] to-[#0A0A0F]">
           <div className="max-w-[1200px] mx-auto text-center reveal-up mb-16 md:mb-24">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A1A24] border border-white/10 mb-6 shadow-[0_0_20px_rgba(178,130,254,0.15)]">
                 <Clock className="text-[#B282FE]" size={20} />
              </div>
              <h2 className="font-['Syne',sans-serif] text-4xl md:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
                 Approvals at the speed of light.
              </h2>
              <p className="text-white/50 text-lg max-w-2xl mx-auto font-light leading-relaxed">
                 We hate waiting just as much as you do. Our automated pipeline ensures your leads are processed smoothly and transparently.
              </p>
           </div>

           {/* Pipeline Visual Container */}
           <div className="max-w-[1000px] mx-auto relative reveal-up">
              
              {/* The Track (Horizontal on md, vertical on mobile) */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 hidden md:block -translate-y-1/2 rounded-full overflow-hidden">
                 {/* The Glowing Flow Line animated by GSAP */}
                 <div ref={flowLineRef} className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#B282FE] to-transparent opacity-80 filter blur-[1px]"></div>
              </div>

              {/* Mobile Track (Vertical) */}
              <div className="absolute left-[39px] top-0 bottom-0 w-1 bg-white/5 block md:hidden rounded-full overflow-hidden">
                 <div className="w-full h-1/3 bg-gradient-to-b from-transparent via-[#B282FE] to-transparent animate-[slideDown_3s_linear_infinite]"></div>
              </div>
              
              {/* Note: Inline style for mobile animation since GSAP is handling desktop */}
              <style>{`
                @keyframes slideDown {
                  0% { transform: translateY(-100%); }
                  100% { transform: translateY(300%); }
                }
              `}</style>

              {/* Nodes */}
              <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-4 relative z-10">
                 
                 {/* Node 1 */}
                 <div className="flex flex-row md:flex-col items-center md:text-center gap-6 md:gap-4 md:w-1/3">
                    <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#12121A] border border-[#B282FE]/50 shadow-[0_0_30px_rgba(178,130,254,0.2)] flex items-center justify-center relative">
                       <div className="absolute inset-2 border border-white/10 rounded-xl"></div>
                       <span className="text-2xl font-light text-white">01</span>
                    </div>
                    <div>
                       <h4 className="font-['Syne',sans-serif] text-lg font-medium text-white mb-2">System Check</h4>
                       <p className="text-sm text-white/40 font-light">Instant automated scan for lead validity.</p>
                    </div>
                 </div>

                 {/* Node 2 */}
                 <div className="flex flex-row md:flex-col items-center md:text-center gap-6 md:gap-4 md:w-1/3">
                    <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#12121A] border border-white/10 flex items-center justify-center relative">
                       <div className="absolute inset-2 border border-white/5 rounded-xl"></div>
                       <span className="text-2xl font-light text-white">02</span>
                    </div>
                    <div>
                       <h4 className="font-['Syne',sans-serif] text-lg font-medium text-white mb-2">Manager Review</h4>
                       <p className="text-sm text-white/40 font-light">Fast-tracked approval by operational teams.</p>
                    </div>
                 </div>

                 {/* Node 3 */}
                 <div className="flex flex-row md:flex-col items-center md:text-center gap-6 md:gap-4 md:w-1/3">
                    <div className="w-20 h-20 shrink-0 rounded-2xl bg-[#12121A] border border-white/10 flex items-center justify-center relative">
                       <div className="absolute inset-2 border border-white/5 rounded-xl"></div>
                       <span className="text-2xl font-light text-white">03</span>
                    </div>
                    <div>
                       <h4 className="font-['Syne',sans-serif] text-lg font-medium text-white mb-2">Instant Credit</h4>
                       <p className="text-sm text-white/40 font-light">Wallet funded immediately upon clearance.</p>
                    </div>
                 </div>

              </div>
           </div>
        </section>

        {/* --- MODERN SAAS CTA BANNER --- */}
        <section id="contact" className="py-24 px-4 sm:px-6 relative">
          <div className="max-w-[1200px] mx-auto reveal-up">
            <div className="bg-gradient-to-br from-[#161622] to-[#0A0A0F] border border-white/10 rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-black/50">
               
               {/* Background Orb */}
               <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#B282FE]/20 blur-[100px] rounded-full pointer-events-none"></div>

               <div className="md:w-3/5 relative z-10 text-center md:text-left">
                  <h2 className="font-['Syne',sans-serif] text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-6 leading-tight">
                    Ready to start earning?
                  </h2>
                  <p className="text-white/50 text-lg font-light max-w-md mx-auto md:mx-0">
                    Create your free account today and turn your professional network into a revenue stream in minutes.
                  </p>
               </div>

               <div className="md:w-2/5 relative z-10 flex flex-col items-center md:items-end gap-4 w-full">
                  <button 
                    onClick={onEnterPortal} 
                    className="w-full sm:w-auto group relative px-10 py-5 rounded-full overflow-hidden text-xs font-bold uppercase tracking-[0.2em] text-black bg-white shadow-2xl transition-transform hover:scale-105"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">Create Free Account <ArrowUpRight size={16}/></span>
                  </button>
                  
                  <a href="https://wa.me/yournumber" className="w-full sm:w-auto px-10 py-4 rounded-full border border-white/10 hover:bg-white/5 text-white text-xs font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2">
                     <MessageCircle size={16}/> Ask a Question
                  </a>
               </div>

            </div>
          </div>
        </section>
      </main>

      {/* --- NEW MODERN FOOTER --- */}
     <footer className="pt-24 pb-8 px-6 border-t border-white/5 bg-[#07070A] relative overflow-hidden flex flex-col items-center">
        
        {/* Giant Watermark Text */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full text-center overflow-hidden pointer-events-none select-none z-0 opacity-40">
           <h1 className="font-['Syne',sans-serif] text-[20vw] md:text-[15vw] font-bold text-white/[0.02] leading-none tracking-tighter">
             RADIX
           </h1>
        </div>

        <div className="max-w-[1400px] w-full mx-auto relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left mt-20 md:mt-32">
          
          <div className="flex flex-col items-center md:items-start gap-4">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg border border-white/10 bg-[#1A1A24] flex items-center justify-center shadow-lg">
                   <TrendingUp size={14} className="text-[#B282FE]" />
               </div>
               <span className="text-white/80 font-medium text-base tracking-wide">Radix Holdings</span>
             </div>
             <p className="text-white/40 text-xs font-light max-w-xs">
               The premier platform for business lead generation and professional networking payouts.
             </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-6">
             <nav className="flex flex-wrap justify-center gap-6 text-xs font-bold text-white/50 tracking-widest uppercase">
               <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
               <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
               <a href="mailto:hq@radixchain.com" className="hover:text-white transition-colors">Contact Support</a>
             </nav>
             
             {/* Updated Copyright & Developer Credit */}
             <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-[10px] text-white/30 font-medium tracking-[0.2em] uppercase">
                 <span>© {new Date().getFullYear()} Radix Holdings. All rights reserved.</span>
                 <span className="hidden md:block w-1 h-1 rounded-full bg-white/20"></span>
                 <span className="flex items-center gap-1.5">
                    Developed by 
                    <a href="https://vynxwebworks.com" target="_blank" rel="noopener noreferrer" className="text-transparent bg-clip-text bg-gradient-to-r from-[#7038FF] to-[#B282FE] font-bold tracking-[0.25em] hover:opacity-80 transition-opacity drop-shadow-[0_0_10px_rgba(178,130,254,0.3)]">
                        Vynx Webworks
                    </a>
                 </span>
             </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

// --- MAIN APP EXPORT ---
export default function LandingPage({ onEnterPortal }) {
  const isApp = Capacitor.isNativePlatform();

  if (isApp) {
    return <AppHomePage onEnterPortal={onEnterPortal} />;
  }
  
  return <WebLandingPage onEnterPortal={onEnterPortal} />;
}