import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Package, ShieldCheck, Sparkles, Star, 
  Phone, Globe, CheckCircle2, Image as ImageIcon, Briefcase,
  ExternalLink 
} from 'lucide-react';

const BusinessDetail = ({ unit, openModal, onBack }) => {
  // [cite_start]// Defensive Check: Prevents runtime errors if unit data is missing [cite: 54, 58]
  if (!unit) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* 1. NAVIGATION & HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Back to Directory
          </button>
          
          <div className="flex items-start gap-5">
            <div className="h-20 w-20 bg-slate-900 flex items-center justify-center text-white rounded-none shrink-0 shadow-lg shadow-slate-200">
              <Briefcase size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-4xl font-bold text-slate-900 tracking-tight">{unit?.name}</h2>
                <div className="bg-emerald-50 text-emerald-600 px-2 py-1 flex items-center gap-1.5 rounded-none border border-emerald-100">
                  <ShieldCheck size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Verified Unit [cite: 33]</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPin size={14} /> {unit?.location || 'Dubai, UAE'}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                  <Star size={14} fill="currentColor" /> Premium Partner
                </span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={() => openModal(unit?.name)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-none font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
        >
         Submit New Lead 
        </button>
      </div>

      {/* 2. HERO IMAGE */}
      <div className="h-64 md:h-80 w-full overflow-hidden rounded-none border border-slate-200 shadow-sm relative">
        <img 
          src={unit?.coverImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"} 
          alt={unit?.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. CORE INFORMATION */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white p-8 border border-slate-200 rounded-none shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">About This Unit</h4>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {unit?.description || 'No description available for this business unit.'}
            </p>
          </section>

          {/* [cite_start]Service Portfolio Checklist [cite: 32] */}
          <section className="bg-white p-8 border border-slate-200 rounded-none shadow-sm">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Available Services</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit?.products?.map((product, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-none">
                  <CheckCircle2 size={18} className="text-indigo-600" />
                  <span className="font-bold text-slate-800 text-sm">{product}</span>
                </div>
              ))}
            </div>
          </section>

          {/* [cite_start]Project Gallery [cite: 32] */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Portfolio</h4>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-2">
                <ImageIcon size={14} /> {(unit?.gallery?.length || 0)} PROJECT_IMAGES
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit?.gallery?.map((img, idx) => (
                <div key={idx} className="aspect-video bg-slate-100 border border-slate-200 rounded-none overflow-hidden group">
                  <img src={img} alt="Portfolio item" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 4. SIDEBAR ACTIONS & CONTACT */}
        <div className="space-y-6">
          <div className="bg-indigo-600 p-8 rounded-none shadow-2xl text-white space-y-6">
            <div className="space-y-2">
             <h4 className="text-xl font-bold tracking-tight">Lead Rewards [cite: 44]</h4>
              <p className="text-indigo-100 text-xs font-medium leading-relaxed">
                Submit a valid lead for {unit?.name}. Earn business credits and track your payout status in your wallet dashboard[cite: 26, 45].
              </p>
            </div>
            <button 
              onClick={() => openModal(unit?.name)}
              className="w-full py-4 bg-white text-indigo-600 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={16} /> Submit Proposal
            </button>
          </div>

          <div className="bg-white p-8 border border-slate-200 rounded-none shadow-sm space-y-6">
            <div className="space-y-4">
              {/* WEBSITE LINK SECTION */}
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Digital Identity</p>
                <a 
                  href={unit?.website || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group p-3 bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                    <Globe size={16} className="text-indigo-600" />
                    <span>Visit Website</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </a>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location Identity</p>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <MapPin size={16} className="text-slate-400" />
                  <span>{unit?.location || 'Dubai, United Arab Emirates'}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Contact</p>
                <div className="flex items-center gap-3 text-indigo-600 font-bold text-sm">
                  <Phone size={16} />
                  <span>{unit?.contact || '+971 00 000 0000'}</span>
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