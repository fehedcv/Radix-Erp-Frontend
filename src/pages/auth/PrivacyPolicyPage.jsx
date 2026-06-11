import React, { useState } from 'react';
import { ShieldCheck, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  // Hardcoded Light Theme Utility Classes
  const bgClass = 'bg-[#FFFFFF]';
  const textPrimary = 'text-[#1A202C]';
  const textSecondary = 'text-[#718096]';
  const textMuted = 'text-[#A0AEC0]';
  const accentText = 'text-[#48477A]';

  const [activeSection, setActiveSection] = useState('information');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    {
      id: 'information',
      title: '1. Information We Collect',
      content: `To facilitate the Radix Partner Hub experience, we collect specific data points when you register and use the platform:\n\n• Agent Data: Your full name, email address, phone number, and account credentials.\n• Lead Data: Contact information and business requirements of the clients you refer to us.\n• Financial Data: Wallet balances, transaction history, and bank/UPI details provided for commission payouts.\n• Technical Data: Device information, IP addresses, and login timestamps for security monitoring.`
    },
    {
      id: 'usage',
      title: '2. How We Use Your Information',
      content: `The data we collect is strictly used to operate, secure, and improve the Partner Hub:\n\n• To process and assign the business leads you submit to the appropriate internal branches.\n• To calculate commissions, update your Wallet Balance, and process manual payouts.\n• To communicate with you regarding lead status updates, policy changes, or technical support.\n• To monitor platform usage, prevent fraudulent referrals, and maintain system integrity.`
    },
    {
      id: 'protection',
      title: '3. Data Protection & Security',
      content: `We prioritize the security of both your personal data and the client data you submit. Radix implements industry-standard encryption, role-based access controls, and secure database architectures to protect against unauthorized access, alteration, or data leaks. Financial and wallet records are strictly isolated and monitored for anomalies.`
    },
    {
      id: 'sharing',
      title: '4. Data Sharing & Third Parties',
      content: `Radix Networks does not sell, rent, or trade your personal information or lead data. Information is only shared under the following circumstances:\n\n• Internal Business Units: Lead details are shared with our verified business divisions to fulfill the requested services.\n• Payment Providers: Necessary details are shared with secure payment gateways or banking partners strictly to process your commission payouts.\n• Legal Compliance: We may disclose data if required by law, regulation, or valid governmental requests.`
    },
    {
      id: 'retention',
      title: '5. Data Retention',
      content: `We retain your Agent profile and financial records for as long as your account is active, and for a legally required period thereafter to comply with tax, accounting, and anti-fraud regulations. Submitted lead data is retained as part of our permanent business operational records.`
    },
    {
      id: 'cookies',
      title: '6. Cookies & Tracking',
      content: `The Partner Hub utilizes essential cookies and local storage mechanisms to keep you logged in, remember your UI preferences, and track the first-time welcome sequence. We may also use basic analytics to understand how agents interact with the dashboard to improve user experience.`
    },
    {
      id: 'rights',
      title: '7. Your User Rights',
      content: `You maintain the right to access, correct, or update your personal Agent profile information at any time via the Dashboard. You may also request the deletion of your account; however, please note that previously processed lead submissions and financial payout records cannot be erased due to compliance requirements.`
    },
    {
      id: 'updates',
      title: '8. Policy Updates',
      content: `Radix Networks reserves the right to modify this Privacy Policy as our platform evolves. We will notify active agents of any significant changes via the email associated with their account. Continued use of the platform constitutes your acknowledgment and acceptance of the updated policy.`
    },
    {
      id: 'contact',
      title: '9. Contact Information',
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or how your data is handled, please reach out to our administration team via the official Radix Networks support channels or through your designated branch manager.`
    }
  ];

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] ${bgClass}`}>
      
      {/* ── HEADER ── */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-10">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={20} className="text-[#81B398]" />
          <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${accentText}`}>
            Legal Documentation
          </span>
        </div>
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-3 ${textPrimary}`}>
          Privacy Policy
        </h1>
        <p className={`text-sm max-w-2xl leading-relaxed ${textSecondary}`}>
          Your privacy is paramount. This document outlines how Radix Networks collects, utilizes, and protects your personal data and the valuable lead information you entrust to our platform.
        </p>
        <p className={`text-[10px] font-bold uppercase tracking-wider mt-5 ${textMuted}`}>
          Last Updated: June 2026
        </p>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-5xl mx-auto px-6 pb-20 flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-8">
          <h3 className={`text-xs font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${textPrimary}`}>
            <FileText size={16} className="text-[#81B398]" /> Table of Contents
          </h3>
          <nav className="flex flex-col border-l-2 border-[#E2E8F0]">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-all -ml-[2px] border-l-2 ${
                  activeSection === section.id 
                    ? 'border-[#81B398] text-[#1A202C] bg-[#F4F5F7]/50'
                    : `border-transparent ${textSecondary} hover:text-[#81B398] hover:border-[#81B398]/30`
                }`}
              >
                {section.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Policy Content */}
        <div className="flex-1 space-y-10 w-full">
          {sections.map((section) => (
            <section 
              key={section.id} 
              id={section.id} 
              className="scroll-mt-8"
            >
              <h2 className={`text-lg md:text-xl font-bold tracking-tight mb-3 ${textPrimary}`}>
                {section.title}
              </h2>
              <div className={`space-y-4 text-sm leading-relaxed ${textSecondary}`}>
                {section.content.split('\n').map((paragraph, idx) => (
                  <p key={idx} className={paragraph.startsWith('•') ? 'pl-4' : ''}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}
          
          <div className="pt-12 border-t border-[#E2E8F0]">
            <p className={`text-[10px] font-bold uppercase tracking-wider ${textMuted}`}>
              End of Document • Radix Networks © {new Date().getFullYear()}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}