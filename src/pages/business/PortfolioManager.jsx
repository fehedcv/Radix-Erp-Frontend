import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOutletContext } from 'react-router-dom'; // 1. Outlet context ചേർത്തു
import { 
  Plus, Trash2, Image as ImageIcon, Briefcase, 
  Save, Eye, CheckCircle2, X, Upload, Star, MapPin, 
  AlertCircle, Loader2, Package, ShieldCheck, Phone, Globe, ArrowRight
} from 'lucide-react';

const PortfolioManager = () => {
  // 2. BusinessHub-ൽ നിന്ന് context വഴി ബിസിനസ് പേര് എടുക്കുന്നു
  const { businessName } = useOutletContext();

  // 3. STATE & DATA SYNC (Specific to this businessName)
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [unitData, setUnitData] = useState(() => {
    const saved = localStorage.getItem(`portfolio_${businessName}`);
    return saved ? JSON.parse(saved) : {
      name: businessName,
      website: "https://vynx-network.com",
      description: `Official portfolio of ${businessName}. We deliver high-performance solutions integrated within the Radix infrastructure ecosystem.`,
      location: "Business Bay, Dubai, UAE",
      contact: "+971 50 000 0000",
      services: ["Infrastructure Build", "Node Maintenance", "Network Scaling"],
      gallery: [
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80"
      ]
    };
  });

  const [newService, setNewService] = useState("");
  const fileInputRef = useRef(null);

  // 4. HANDLERS
  const handleSaveProcess = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem(`portfolio_${businessName}`, JSON.stringify(unitData));
      setIsSaving(false);
      setShowSaveConfirm(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1800);
  };

  const addService = (e) => {
    e.preventDefault();
    if (newService.trim()) {
      setUnitData({ ...unitData, services: [...unitData.services, newService] });
      setNewService("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUnitData({ ...unitData, gallery: [imageUrl, ...unitData.gallery] });
    }
  };

  return (
    <div className="space-y-10 pb-24">
      
      {/* 1. HEADER OPERATIONAL BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="border-l-4 border-indigo-600 pl-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Asset Configuration</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1 italic">Registry Node: {businessName}</p>
        </div>

        <div className="flex items-center gap-4">
          <AnimatePresence>
            {saveSuccess && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="bg-emerald-50 text-emerald-600 px-4 py-2 border border-emerald-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={14} /> Registry Updated
                </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setShowPreview(true)} 
            className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-none text-[10px] font-black text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all uppercase tracking-widest shadow-sm"
          >
            <Eye size={16} /> Asset Preview
          </button>
          <button 
            onClick={() => setShowSaveConfirm(true)} 
            className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-none font-black text-[10px] hover:bg-indigo-600 transition-all uppercase tracking-[0.2em] shadow-2xl active:scale-[0.98]"
          >
            <Save size={16} /> Deploy Changes
          </button>
        </div>
      </div>

      {/* 2. PRIMARY WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* NODE 01: IDENTITY & DESCRIPTION */}
        <div className="lg:col-span-8 space-y-10">
           <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <ShieldCheck size={18} className="text-indigo-600" />
                <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Specifications Registry</h4>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Display Alias</label>
                      <input 
                        type="text"
                        value={unitData.name}
                        onChange={(e) => setUnitData({...unitData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 px-5 py-4 text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 rounded-none transition-all uppercase"
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Registry Domain (URL)</label>
                      <div className="relative group">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                        <input 
                          type="text"
                          value={unitData.website}
                          onChange={(e) => setUnitData({...unitData, website: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 pl-12 pr-5 py-4 text-xs font-bold text-indigo-600 outline-none focus:bg-white focus:border-indigo-600 rounded-none transition-all"
                        />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Node Mission Overview</label>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{unitData.description.length} / 500 LIMIT</span>
                  </div>
                  <textarea 
                    value={unitData.description}
                    onChange={(e) => setUnitData({...unitData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-8 text-base leading-relaxed font-medium text-slate-600 outline-none focus:bg-white focus:border-indigo-600 resize-none min-h-[300px] rounded-none transition-all"
                    placeholder="Document the professional capabilities and operational history of this node..."
                  />
                </div>
              </div>
           </div>
        </div>

        {/* NODE 02: CAPABILITY LIST */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 border border-slate-800 rounded-none shadow-2xl h-full flex flex-col">
            <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex items-center gap-3">
              <Briefcase size={18} className="text-indigo-400" />
              <h4 className="font-black text-white text-[10px] uppercase tracking-widest">Capabilities Registry</h4>
            </div>
            
            <div className="p-8 flex-1 flex flex-col gap-8">
                <form onSubmit={addService} className="flex gap-2">
                    <input 
                        type="text" 
                        value={newService} 
                        onChange={(e) => setNewService(e.target.value)} 
                        placeholder="New Capability..." 
                        className="flex-1 px-5 py-4 bg-white/5 border border-white/10 rounded-none text-xs font-bold text-white outline-none focus:border-indigo-500 transition-all uppercase placeholder:text-slate-600" 
                    />
                    <button type="submit" className="p-4 bg-indigo-600 text-white hover:bg-white hover:text-slate-900 transition-all rounded-none shadow-xl">
                        <Plus size={20} />
                    </button>
                </form>

                <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                  {unitData.services.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-none group hover:border-indigo-500/50 transition-all">
                          <div className="flex items-center gap-4">
                             <div className="w-1.5 h-1.5 bg-indigo-500" />
                             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{s}</span>
                          </div>
                          <button 
                              onClick={() => setUnitData({...unitData, services: unitData.services.filter((_, i) => i !== idx)})} 
                              className="text-slate-600 hover:text-rose-500 transition-colors"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
                </div>
            </div>
          </div>
        </div>

        {/* NODE 03: VISUAL ASSET GALLERY */}
        <div className="lg:col-span-12">
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <ImageIcon size={20} className="text-indigo-600" />
                  <h4 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Visual Infrastructure Gallery</h4>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="flex items-center gap-3 text-white font-black text-[9px] uppercase tracking-[0.2em] bg-slate-900 px-6 py-3 hover:bg-indigo-600 transition-all rounded-none shadow-lg"
              >
                <Upload size={14} /> Upload Asset
              </button>
            </div>

            <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {unitData.gallery.map((img, i) => (
                <div key={i} className="relative group aspect-square rounded-none overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                  <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt="Work" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <button 
                        onClick={() => setUnitData({...unitData, gallery: unitData.gallery.filter((_, idx)=> idx !== i)})} 
                        className="p-4 bg-rose-600 text-white rounded-none hover:bg-rose-700 transition-all shadow-2xl scale-90 group-hover:scale-100 duration-500"
                      >
                        <Trash2 size={24}/>
                      </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="aspect-square rounded-none border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 transition-all group bg-slate-50/50"
              >
                <Plus size={40} className="group-hover:rotate-90 transition-transform duration-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">Add Asset Node</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION & PREVIEW MODALS --- */}
      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-none shadow-2xl border border-slate-200 overflow-hidden">
              <div className="p-12 text-center space-y-8">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-none flex items-center justify-center mx-auto shadow-xl"><AlertCircle size={40} /></div>
                <div>
                   <h4 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Sync Registry?</h4>
                   <p className="text-xs text-slate-500 mt-3 font-medium uppercase leading-relaxed tracking-widest">Broadcast these updates to the live agent directory?</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowSaveConfirm(false)} className="py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                  <button onClick={handleSaveProcess} disabled={isSaving} className="py-4 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3">
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Authorize"} <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[400] overflow-y-auto bg-slate-950/90 backdrop-blur-xl p-4 md:p-12 flex justify-center items-start scroll-smooth">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-6xl bg-white rounded-none shadow-2xl flex flex-col border border-slate-200 my-10"
            >
              <div className="sticky top-0 z-50 bg-slate-900 px-8 py-4 flex justify-between items-center border-b border-white/5">
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Agent_View_Simulation_Mode</span>
                 <button onClick={() => setShowPreview(false)} className="text-white hover:text-rose-500 transition-colors">
                   <X size={24} />
                 </button>
              </div>
              
              <div className="p-8 md:p-16 space-y-16">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                   <div className="h-32 w-32 bg-slate-900 text-white flex items-center justify-center rounded-none shrink-0 border-b-8 border-indigo-600 shadow-2xl"><Package size={50} /></div>
                   <div className="space-y-5 text-center md:text-left">
                      <h2 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">{unitData.name}</h2>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                         <span className="px-5 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">Premium Network Node</span>
                         <span className="px-5 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black border border-emerald-100 uppercase tracking-[0.2em]">Verified Partner</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-slate-100 pt-16">
                   <div className="lg:col-span-8 space-y-16">
                      <div className="space-y-6 border-l-4 border-slate-900 pl-8">
                        <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Operational_Mission</h4>
                        <p className="text-2xl md:text-3xl text-slate-700 italic leading-relaxed font-light">"{unitData.description}"</p>
                      </div>

                      <div className="space-y-8">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Node_Asset_Display</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {unitData.gallery.map((img, i) => (
                              <div key={i} className="aspect-video overflow-hidden border border-slate-100 shadow-sm group">
                                <img src={img} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" alt="Work" />
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>

                   <div className="lg:col-span-4 space-y-10">
                      <div className="bg-slate-50 p-10 border border-slate-200 rounded-none shadow-sm space-y-10">
                         <h4 className="font-black text-slate-900 uppercase tracking-[0.3em] text-[10px] border-b border-slate-200 pb-5">Registry Coordinates</h4>
                         <div className="space-y-8">
                            <Coordinate label="Deployment_HQ" icon={<MapPin size={18} className="text-indigo-600" />} value={unitData.location} />
                            <Coordinate label="Digital_Registry" icon={<Globe size={18} className="text-indigo-600" />} value={unitData.website.replace('https://', '')} />
                            <Coordinate label="Secure_Line" icon={<Phone size={18} className="text-indigo-600" />} value={unitData.contact} />
                         </div>
                         <button className="w-full py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-600 transition-all">Simulate Lead Submission</button>
                      </div>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- SUB-COMPONENT ---
const Coordinate = ({ label, icon, value }) => (
  <div className="space-y-2">
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
    <div className="flex items-center gap-4 text-sm font-bold text-slate-700 uppercase tracking-tight">
      {icon} {value}
    </div>
  </div>
);

export default PortfolioManager;