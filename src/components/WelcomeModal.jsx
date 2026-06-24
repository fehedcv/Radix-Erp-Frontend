import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Loader2, Award } from 'lucide-react';

export default function WelcomeModal({ open, onClose }) {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [loading, setLoading] = useState(false);
  const [agent, setAgent] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error('Auth Error:', authError);
          return;
        }

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile Error:', profileError);
          return;
        }

        setAgent({
          name: profileData.full_name || '',
          email: user.email || '',
        });
      } catch (error) {
        console.error('Fetch User Error:', error);
      }
    };

    if (open) {
      fetchUserData();
    }
  }, [open]);

  const handleGetStarted = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.rpc('complete_first_login');

      if (error) {
        console.error('complete_first_login rpc error', error);
      }
    } catch (err) {
      console.error('complete_first_login failed', err);
    } finally {
      setLoading(false);
      try {
        onClose();
      } catch {}
    }
  };

  const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};
  // --- PDF Generation Logic ---
  const handleDownloadCertificate = async () => {
    // Initialize landscape A4 document
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // 1. Draw a clean border (Sage Green #81B398 -> RGB: 129, 179, 152)
    doc.setDrawColor(129, 179, 152);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // 2. Radix Logo Space
    // TODO: Add your Base64 Logo string here
    const logoUrl = "https://res.cloudinary.com/dmtzmgbkj/image/upload/v1775799844/Stylised__X__logo_on_black_background-removebg-preview_nnmney.png"; 
    const radixLogoBase64 = await getBase64FromUrl(logoUrl)
    if (radixLogoBase64) {
      doc.addImage(radixLogoBase64, 'PNG', 128.5, 20, 30, 30); // Adjust x, y, width, height as needed
    } else {
      doc.setFontSize(24);
      doc.setTextColor(129, 179, 152);
      doc.setFont('helvetica', 'bold');
      doc.text('RADIX NETWORKS', 148.5, 40, { align: 'center' });
    }

    // 3. Main Title
    doc.setFontSize(36);
    doc.setTextColor(26, 32, 44); // #1A202C
    doc.setFont('helvetica', 'bold');
    doc.text('Certificate of Partnership', 148.5, 75, { align: 'center' });

    // 4. Subtitle
    doc.setFontSize(16);
    doc.setTextColor(113, 128, 150); // #718096
    doc.setFont('helvetica', 'normal');
    doc.text('This proudly certifies that', 148.5, 105, { align: 'center' });

    // 5. Agent Name
    doc.setFontSize(32);
    doc.setTextColor(26, 32, 44);
    doc.setFont('helvetica', 'bold');
    doc.text(agent.name || 'Valued Partner', 148.5, 125, { align: 'center' });

    // 6. Certification Details
    doc.setFontSize(14);
    doc.setTextColor(113, 128, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'has successfully completed onboarding and is an official partner of the Radix network.',
      148.5,
      145,
      { align: 'center' }
    );

    // Slogan
    doc.setFontSize(14);
    doc.setTextColor(129, 179, 152); // Sage Green
    doc.setFont('helvetica', 'italic');
    doc.text('"Your network is your networth"', 148.5, 158, { align: 'center' });

    // 7. Date and Signature Lines
    const today = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.setTextColor(26, 32, 44);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${today}`, 50, 180);
    doc.line(45, 182, 95, 182); // Line under date

    // Signature Space
    // TODO: Add your Base64 Signature string here
    const signatureUrl = "https://res.cloudinary.com/dmtzmgbkj/image/upload/v1782316800/Narf_signature_s6tm0a.png";
    const signatureBase64 = await getBase64FromUrl(signatureUrl);
    if (signatureBase64) {
      doc.addImage(signatureBase64, 'PNG', 215, 160, 40, 20); // Adjust x, y, width, height as needed
    }
    // doc.text('Authorized Signature', 247, 180, { align: 'center' });
    doc.line(200, 182, 270, 182); // Line for signature

    // Trigger Download
    doc.save(`${(agent.name || 'Agent').replace(/\s+/g, '_')}_Radix_Certificate.pdf`);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm font-['Plus_Jakarta_Sans',sans-serif]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`w-full max-w-[520px] p-6 md:p-8 rounded-2xl shadow-2xl border flex flex-col items-center text-center transition-colors duration-300 ${
              isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
            }`}
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 ${isLight ? 'bg-[#81B398]/10 text-[#81B398]' : 'bg-[#81B398]/20 text-[#81B398]'}`}>
              <Award size={32} strokeWidth={2.5} />
            </div>

            <h2 className={`text-2xl font-extrabold tracking-tight mb-4 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
              Welcome to Radix
            </h2>

            <div className="mb-8 space-y-4">
              <p className={`text-sm md:text-base font-medium leading-relaxed ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Congratulations <strong className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}>{agent.name || 'Agent'}</strong>!<br />
                You are successfully an official partner of the Radix network.
              </p>
              
              <div className={`p-4 rounded-xl  ${isLight ? '' : 'bg-[#222938] border-transparent'}`}>
                <p className="text-md font-extrabold text-[#81B398] italic tracking-widest">
                  "Your network is your networth"
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={handleDownloadCertificate}
                disabled={!agent.name}
                className={`flex-1 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 border disabled:opacity-50 ${
                  isLight 
                    ? 'bg-transparent border-[#81B398] text-[#81B398] hover:bg-[#81B398]/5' 
                    : 'bg-transparent border-[#81B398] text-[#81B398] hover:bg-[#81B398]/10'
                }`}
              >
                Get Certificate
              </button>

              <button
                onClick={handleGetStarted}
                disabled={loading}
                className="flex-1 py-3.5 bg-[#81B398] hover:bg-[#6FA085] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : 'Get Started'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}