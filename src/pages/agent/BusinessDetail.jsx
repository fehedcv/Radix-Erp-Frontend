import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, MapPin, Package, ShieldCheck, Sparkles, Star, 
  Phone, Globe, Instagram, CheckCircle2, Image as ImageIcon 
} from 'lucide-react';

const BusinessDetail = ({ unit, openModal, onBack }) => {
  // Defensive Check: If unit is not passed, return null to prevent crashes [cite: 53-55]
  if (!unit) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-7xl mx-auto pb-20"
    >
      {/* 1. TOP NAVIGATION & HERO COVER */}
      <div className="relative mb-12">
        <button 
          onClick={onBack} 
          className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-xl border border-white/20 hover:bg-indigo-600 hover:text-white transition-all"
        >
          <ArrowLeft size={16} /> Back to Directory
        </button>

        <div className="h-[350px] md:h-[450px] w-full rounded-[3rem] overflow-hidden shadow-2xl relative">
          <img 
            src={unit?.coverImage || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"} 
            alt={unit?.name} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
          
          <div className="absolute bottom-10 left-10 flex items-end gap-6">
            <div className="h-24 w-24 md:h-32 md:w-32 bg-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-center border-4 border-white/10">
              <Package size={60} className="text-indigo-600" />
            </div>
            <div className="mb-2">
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter">{unit?.name}</h2>
              <div className="flex items-center gap-4 mt-2">
                <span className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs uppercase tracking-widest">
                  <Star size={14} fill="currentColor" /> Premium Unit
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-widest">
                  <ShieldCheck size={14} /> Verified Partner
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 px-4 md:px-0">
        
        {/* 2. LEFT COLUMN: PORTFOLIO & SERVICES */}
        <div className="lg:col-span-2 space-y-12">
          
          <section>
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-4 underline underline-offset-8">Unit Overview</h4>
            <p className="text-xl md:text-2xl text-slate-600 leading-relaxed font-medium italic">
              "{unit?.description || 'No description available for this unit.'}"
            </p>
          </section>

          {/* Gallery with optional chaining to fix the 'length' error */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em]">Project Gallery</h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={14} /> {(unit?.gallery?.length || 0)} Portfolio Images
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unit?.gallery?.map((img, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 0.98 }}
                  className="rounded-[2.5rem] overflow-hidden aspect-video shadow-lg border-2 border-slate-100"
                >
                  <img src={img} alt={`${unit?.name} project`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Services Checklist */}
          <section className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mb-8">Service Portfolio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unit?.products?.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-transparent hover:border-indigo-100 transition-all cursor-default">
                  <div className="bg-white p-2 rounded-lg shadow-sm text-indigo-500">
                    <CheckCircle2 size={18} />
                  </div>
                  <span className="font-bold text-slate-800 text-sm tracking-tight">{p}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 3. RIGHT COLUMN: DYNAMIC ACTION CARD */}
        <div className="space-y-6">
          <div className="sticky top-28 space-y-6">
            
            <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden group">
              <div className="relative z-10 text-center">
                <h4 className="text-2xl font-black mb-4 tracking-tight">Refer & Earn</h4>
                <p className="text-indigo-100 text-sm mb-10 font-medium leading-relaxed">
                  Refer a lead to {unit?.name} today. Upon successful verification, earn real amount based on internal credits.
                </p>
                <button 
                  onClick={() => openModal(unit?.name)}
                  className="w-full py-6 bg-white text-indigo-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-slate-900 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  Submit Lead Now
                </button>
              </div>
              <Sparkles className="absolute -bottom-6 -right-6 text-white/10 group-hover:rotate-12 transition-transform" size={150} />
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Unit HQ Location</p>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><MapPin size={16} /></div>
                  {unit?.location || 'Dubai, UAE'}
                </div>
              </div>
              <div className="pt-4 border-t border-slate-50">
                 <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Business Contact</p>
                 <div className="flex items-center gap-3 text-indigo-600 font-black text-sm">
                   <Phone size={16} /> {unit?.contact || '+971 00 000 0000'}
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