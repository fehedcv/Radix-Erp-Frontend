import React, { useState } from 'react';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  // Hardcoded Light Theme Utility Classes
  const bgClass = 'bg-[#FFFFFF]';
  const textPrimary = 'text-[#1A202C]';
  const textSecondary = 'text-[#718096]';
  const textMuted = 'text-[#A0AEC0]';
  const accentText = 'text-[#48477A]';

  const [activeSection, setActiveSection] = useState('acceptance');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By registering as an agent, accessing, or using the Radix Partner Hub ("Platform"), you agree to be bound by these Terms & Conditions. This agreement forms a legally binding contract between you ("Partner" or "Agent") and Radix Networks. If you do not agree to these terms, you must immediately discontinue your use of the platform.`
    },
    {
      id: 'accounts',
      title: '2. Partner Accounts & Access',
      content: `Partners are strictly responsible for maintaining the confidentiality of their login credentials. Your account is non-transferable. Radix reserves the right to implement Security Controls, including restricting, suspending, or permanently banning accounts that exhibit suspicious activity, unauthorized access attempts, or shared credential usage.`
    },
    {
      id: 'lead-submission',
      title: '3. Lead Submission Guidelines',
      content: `As a Radix Partner, you agree to submit only genuine, high-quality business leads. You confirm that you have the right to share the client's contact information. Submission of fake, duplicated, or unauthorized leads is strictly prohibited and will result in the immediate forfeiture of all pending credits and permanent account termination.`
    },
    {
      id: 'commissions',
      title: '4. Commissions, Credits & Settlements',
      content: `Radix operates on a proprietary credit system where 1 Credit (CR) equals 1 INR. \n\n• Verification: Credits are only awarded after a submitted lead is successfully converted and the internal transaction is verified by Radix Administration.\n• Commission Rates: Standard admin commissions (e.g., 10%) are deducted prior to calculating the final Agent Credit, unless explicitly stated otherwise.\n• Payouts: Partners may request withdrawals of their Wallet Balance. Payouts are manually processed via bank transfer, UPI, or designated payment gateways. Radix reserves the right to withhold payouts pending fraud investigation.`
    },
    {
      id: 'confidentiality',
      title: '5. Confidentiality & Data Privacy',
      content: `You will have access to sensitive client and business data. You agree to adhere strictly to local data protection laws (e.g., GDPR, DPDP Act). You must not copy, export, sell, or misuse any client contact information or internal business unit details outside of the Radix platform.`
    },
    {
      id: 'prohibited',
      title: '6. Prohibited Activities',
      content: `Partners must not engage in:\n• Fraudulent lead manipulation or self-referrals to game the credit system.\n• Impersonating Radix administration, other agents, or business unit managers.\n• Attempting to reverse-engineer, decompile, or disrupt the platform's infrastructure.\n• Using the platform for any illegal or unauthorized purpose.`
    },
    {
      id: 'intellectual',
      title: '7. Intellectual Property',
      content: `All software, algorithms, UI/UX designs, trademarks, logos, and proprietary data models associated with the Radix Partner Hub remain the exclusive intellectual property of Radix Networks. No license is granted to use our branding without explicit written consent.`
    },
    {
      id: 'liability',
      title: '8. Limitation of Liability',
      content: `Radix Networks shall not be held liable for any indirect, incidental, special, or consequential damages—including loss of potential profits or data—arising from platform downtime, technical failures, or rejected lead submissions.`
    },
    {
      id: 'modifications',
      title: '9. Modifications to Terms',
      content: `Radix reserves the right to update or modify these Terms & Conditions, including commission structures and payout thresholds, at any time. Continued use of the Partner Hub following any updates constitutes your acceptance of the revised terms.`
    }
  ];

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] ${bgClass}`}>
      
      {/* ── HEADER ── */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8 md:pt-16 md:pb-10">
        <span className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-4 block ${accentText}`}>
          Legal Documentation
        </span>
        <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight mb-3 ${textPrimary}`}>
          Terms & Conditions
        </h1>
        <p className={`text-sm max-w-2xl leading-relaxed ${textSecondary}`}>
          Please read these terms carefully before using the Radix Partner Hub. These rules ensure a secure, transparent, and profitable environment for all our agents and business units.
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

        {/* Terms Content */}
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