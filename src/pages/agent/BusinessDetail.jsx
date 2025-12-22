import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'; // റൂട്ടിംഗ് ഹുക്കുകൾ
import { 
  ArrowLeft, MapPin, Package, ShieldCheck, Sparkles, Star, 
  Phone, Globe, CheckCircle2, Image as ImageIcon, Briefcase,
  ExternalLink 
} from 'lucide-react';

// ബിസിനസ് ഡാറ്റ ഇമ്പോർട്ട് ചെയ്യുന്നു
import { businessUnits } from '../../data/businessData.jsx';

const BusinessDetail = () => {
  const { id } = useParams(); // URL-ൽ നിന്ന് ID എടുക്കുന്നു (e.g., U-101)
  const navigate = useNavigate();
  
  // AgentHub-ൽ നിന്ന് context വഴി ലഭിക്കുന്ന ഫങ്ക്ഷനുകൾ
  const { setIsModalOpen, setSelectedBusiness } = useOutletContext();

  // ID ഉപയോഗിച്ച് കൃത്യമായ യൂണിറ്റ് കണ്ടെത്തുന്നു
  const unit = businessUnits.find(u => u.id === id);

  // ഡാറ്റ ലഭ്യമല്ലെങ്കിൽ
  if (!unit) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest">Unit Registry Not Found</p>
        <button onClick={() => navigate('/agent/units')} className="mt-4 text-indigo-600 font-bold uppercase text-xs">Return to Directory</button>
      </div>
    );
  }

  // ലീഡ് ഫോം തുറക്കാനുള്ള ഫങ്ക്ഷൻ
  const handleOpenModal = () => {
    setSelectedBusiness(unit.name);
    setIsModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* 1. NAVIGATION & HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/agent/units')} 
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Back to Directory
          </button>
          
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 bg-slate-900 flex items-center justify-center text-white rounded-none shrink-0 border-b-4 border-indigo-600 shadow-xl">
              {unit.icon ? React.cloneElement(unit.icon, { size: 32 }) : <Briefcase size={32} />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight uppercase">{unit.name}</h2>
                <div className="bg-emerald-50 text-emerald-600 px-2 py-1 flex items-center gap-1.5 border border-emerald-100">
                  <ShieldCheck size={12} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Verified Node</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                  <MapPin size={14} className="text-indigo-600" /> {unit.location}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                  <Star size={14} fill="currentColor" /> Premium Partner
                </span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={handleOpenModal}
          className="bg-slate-900 text-white px-8 py-4 rounded-none font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3"
        >
          Initialize Lead Submission
        </button>
      </div>

      {/* 2. HERO IMAGE / COVER */}
      <div className="h-64 md:h-96 w-full overflow-hidden border border-slate-200 shadow-sm relative bg-slate-100">
        <img 
          src={unit.coverImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"} 
          alt={unit.name} 
          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-slate-900/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 3. CORE INFORMATION (Left Column) */}
        <div className="lg:col-span-8 space-y-10">
          
          <section className="bg-white p-10 border border-slate-200 rounded-none shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 border-b border-slate-50 pb-4">Infrastructure Overview</h4>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {unit.description}
            </p>
          </section>

          <section className="bg-white p-10 border border-slate-200 rounded-none shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 border-b border-slate-50 pb-4">Service Capabilities</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit.products?.map((product, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 group hover:border-indigo-200 transition-all">
                  <CheckCircle2 size={18} className="text-indigo-600" />
                  <span className="font-bold text-slate-800 text-xs uppercase tracking-tight">{product}</span>
                </div>
              ))}
            </div>
          </section>

          {/* PROJECT GALLERY */}
          {unit.gallery && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Operational Portfolio</h4>
                <span className="text-[9px] font-bold text-slate-400 flex items-center gap-2 uppercase tracking-widest">
                  <ImageIcon size={14} /> {unit.gallery.length} Registry_Images
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unit.gallery.map((img, idx) => (
                  <div key={idx} className="aspect-video bg-slate-100 border border-slate-200 overflow-hidden group">
                    <img src={img} alt="Portfolio" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-105" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 4. SIDEBAR (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-indigo-600 p-10 rounded-none shadow-2xl text-white space-y-6 relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <h4 className="text-xl font-bold uppercase tracking-tight leading-none">Network<br/>Referral Program</h4>
              <p className="text-indigo-100 text-[11px] font-medium leading-relaxed">
                Submit a verified lead for this unit. Track your settlement status and credit accumulation in the live ledger dashboard.
              </p>
            </div>
            <button 
              onClick={handleOpenModal}
              className="relative z-10 w-full py-4 bg-white text-indigo-600 rounded-none font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all shadow-xl"
            >
              <Sparkles size={14} /> Submit Registry Entry
            </button>
            <ShieldCheck size={120} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
          </div>

          <div className="bg-white p-10 border border-slate-200 rounded-none shadow-sm space-y-8">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Node Identity</p>
              <a 
                href={unit.website || "#"} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-between group p-4 bg-slate-50 border border-slate-100 hover:border-indigo-600 transition-all"
              >
                <div className="flex items-center gap-3 text-slate-700 font-bold text-xs uppercase tracking-widest">
                  <Globe size={16} className="text-indigo-600" />
                  <span>Visit Domain</span>
                </div>
                <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
              </a>
            </div>

            <div className="space-y-4">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Registry Contacts</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-slate-700 font-bold text-xs uppercase tracking-widest">
                  <MapPin size={16} className="text-slate-300" />
                  <span>{unit.location}</span>
                </div>
                <div className="flex items-center gap-3 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                  <Phone size={16} />
                  <span>{unit.contact || '+971 00 000 0000'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BusinessDetail;