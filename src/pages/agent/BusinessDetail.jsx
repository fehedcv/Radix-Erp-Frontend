import React from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, ShieldCheck, Sparkles, Star, 
  Phone, Globe, CheckCircle2, Image as ImageIcon, Briefcase,
  ExternalLink, Info, Plus, Mail, MessageSquare, Clock, Zap
} from 'lucide-react';

// Import business data
import { businessUnits } from '../../data/businessData.jsx';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // LOGIC PRESERVED: Functions from AgentHub context
  const { setIsModalOpen, setSelectedBusiness } = useOutletContext();

  const unit = businessUnits.find(u => u.id === id);

  if (!unit) {
    return (
      <div className="py-32 text-center font-['Plus_Jakarta_Sans',sans-serif] bg-[#F8FAFC]">
        <div className="w-16 h-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center mx-auto mb-6 text-slate-400 shadow-sm">
          <Info size={32} />
        </div>
        <p className="text-slate-500 font-bold uppercase tracking-widest">Team Profile Not Found</p>
        <button onClick={() => navigate('/agent/units')} className="mt-4 text-[#007ACC] font-bold uppercase text-xs hover:underline">Return to Directory</button>
      </div>
    );
  }

  const handleOpenModal = () => {
    setSelectedBusiness(unit.name);
    setIsModalOpen(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto space-y-6  font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* 1. BREADCRUMBS & NAVIGATION */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <button onClick={() => navigate('/agent/units')} className="hover:text-[#007ACC] transition-colors">Directory</button>
        <ChevronRight size={10} />
        <span className="text-slate-900">{unit.name}</span>
      </nav>

      {/* 2. EXECUTIVE PROFILE HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-8">
            <div className={`h-24 w-24 ${unit.bg || 'bg-slate-900'} ${unit.color || 'text-white'} flex items-center justify-center rounded-2xl shadow-xl shadow-blue-500/10 shrink-0 border border-white/20`}>
              {unit.icon ? React.cloneElement(unit.icon, { size: 42, strokeWidth: 2 }) : <Briefcase size={42} />}
            </div>
            
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase">{unit.name}</h1>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck size={14} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Verified Team</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-slate-400">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <MapPin size={14} className="text-[#007ACC]" /> {unit.location}
                </span>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                  <Globe size={14} className="text-[#007ACC]" /> Global Partner
                </span>
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#007ACC] bg-blue-50 px-2 py-0.5 rounded">
                  <Star size={14} className="fill-current" /> Premium Tier
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleOpenModal}
            className="w-full lg:w-auto bg-[#007ACC] text-white px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-[#005fb8] transition-all flex items-center justify-center gap-3 active:scale-95 group"
          >
            <Zap size={18} className="fill-current group-hover:animate-pulse" /> Submit New Referral
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDE: THE OVERVIEW --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* VISUAL COVER */}
          <div className="relative h-72 md:h-[450px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <img 
              src={unit.coverImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80"} 
              alt={unit.name} 
              className="w-full h-full object-cover rounded-xl grayscale hover:grayscale-0 transition-all duration-1000"
            />
            <div className="absolute top-6 left-6 flex gap-2">
               <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm border border-slate-200 flex items-center gap-2">
                 <ImageIcon size={12} /> HQ Gallery
               </span>
            </div>
          </div>

          {/* TEAM BIO */}
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
              <Info size={14} className="text-[#007ACC]" /> Team Overview
            </h4>
            <p className="text-xl text-slate-600 leading-relaxed font-medium">
              {unit.description || "This specialized business team provides comprehensive project management and resource coordination for the partner network, ensuring high-speed fulfillment and verified results."}
            </p>
          </div>

          {/* CAPABILITIES GRID */}
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
               <Briefcase size={14} className="text-[#007ACC]" /> Service Capabilities
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit.products?.map((product, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-xl group hover:bg-white hover:border-[#007ACC] hover:shadow-md transition-all">
                  <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <CheckCircle2 size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-extrabold text-slate-800 text-sm uppercase tracking-tight">{product}</span>
                </div>
              ))}
            </div>
          </div>

          {/* PROJECT LIFECYCLE (NON-FUNCTIONAL DENSITY) */}
          <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Fulfillment Lifecycle</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                <LifecycleStep icon={<Plus size={18}/>} title="Submission" desc="Referral entry into system" />
                <LifecycleStep icon={<Clock size={18}/>} title="Audit" desc="Project scope verification" />
                <LifecycleStep icon={<CheckCircle2 size={18}/>} title="Payout" desc="Credit release to wallet" />
             </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: ACTION PANEL --- */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* QUICK LINKS & INFO */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-10 sticky top-24">
            
            <section>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5">Digital Access</p>
              <div className="space-y-3">
                <a 
                  href={unit.website || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#007ACC] hover:bg-white transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-[#007ACC]" />
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Team Website</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-[#007ACC] transition-all" />
                </a>
                
                <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                   <Mail size={18} className="text-[#007ACC]" />
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">support@radix.team</span>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Communication Lines</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl group hover:border-[#007ACC] transition-colors">
                  <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-[#007ACC]">
                    <Phone size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Head Office</span>
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-tighter">{unit.contact || '+971 00 000 0000'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-xl group hover:border-[#007ACC] transition-colors">
                  <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-[#007ACC]">
                    <MapPin size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Location Hub</span>
                    <span className="text-[11px] font-extrabold text-slate-700 uppercase tracking-tighter">{unit.location}</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="pt-4">
               <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-4">
                  <Sparkles size={20} className="text-[#007ACC] shrink-0 mt-1" />
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed uppercase">
                    Referring a new lead to this team increases your <span className="font-black text-slate-900">Success Score</span> in the network database.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- HELPER COMPONENTS ---

const LifecycleStep = ({ icon, title, desc }) => (
  <div className="relative z-10 flex flex-col items-center text-center md:items-start md:text-left space-y-3">
    <div className="h-12 w-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-[#007ACC] shadow-sm">
      {icon}
    </div>
    <div>
      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{title}</h5>
      <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{desc}</p>
    </div>
  </div>
);

const ChevronRight = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default BusinessDetail;