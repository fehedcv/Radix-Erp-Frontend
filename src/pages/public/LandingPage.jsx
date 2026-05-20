import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Capacitor } from '@capacitor/core';
import AppHomePage from './AppHomePage';

// Segment Components
import Navbar from '../../components/web/public/Navbar';
import HeroSection from '../../components/web/public/HeroSection';
import AppSection from '../../components/web/public/AppSection';
import HowItWorksSection from '../../components/web/public/HowItWorksSection';
import DashboardScreenshots from '../../components/web/public/DashboardScreenshots';
import ApprovalsSection from '../../components/web/public/ApprovalsSection';
import CtaBanner from '../../components/web/public/CtaBanner';
import Footer from '../../components/web/public/Footer';

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
        y: -180, 
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
      mm.revert();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[#07070A] text-white font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#B282FE]/30 overflow-x-clip">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Syne:wght@400;500;600;700;800&display=swap');
      `}} />

      {/* Background Glowing Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#9D4EDD]/25 via-[#2A0A4A]/20 to-transparent blur-[120px] -z-10 pointer-events-none"></div>

      <Navbar onEnterPortal={onEnterPortal} />

      <main className="pt-20">
        <HeroSection onEnterPortal={onEnterPortal} />
        <AppSection />
        <HowItWorksSection />
        <DashboardScreenshots />
        <ApprovalsSection flowLineRef={flowLineRef} />
        <CtaBanner onEnterPortal={onEnterPortal} />
      </main>

      <Footer />
    </div>
  );
};

export default function LandingPage({ onEnterPortal }) {
  const isApp = Capacitor.isNativePlatform();

  if (isApp) {
    return <AppHomePage onEnterPortal={onEnterPortal} />;
  }
  
  return <WebLandingPage onEnterPortal={onEnterPortal} />;
}