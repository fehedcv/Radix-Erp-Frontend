import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Image as ImageIcon, Briefcase, 
  Save, Eye, CheckCircle2, X, Upload, Star, MapPin, 
  AlertCircle, Loader2, Package, ShieldCheck, Phone, Globe,
} from 'lucide-react';

const PortfolioManager = () => {
  // 1. STATE & DATA SYNC (Logic Preserved)
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [unitData, setUnitData] = useState(() => {
    const savedSettings = localStorage.getItem('vynx_business_settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    
    return {
      name: settings.businessName || "Interior Design Unit",
      website: settings.website || "https://vynx-interiors.com",
      description: "We provide high-end luxury interior solutions for modern homes and commercial spaces in Dubai.",
      location: settings.address || "Business Bay, Dubai, UAE",
      contact: settings.phone || "+971 50 123 4567",
      services: ["Modular Kitchen", "Living Room Decor", "Office Fit-out", "Lighting Design"],
      gallery: [
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1616489953149-864c29928a07?auto=format&fit=crop&w=800&q=80"
      ]
    };
  });

  const [newService, setNewService] = useState("");
  const fileInputRef = useRef(null);

  // 2. HANDLERS (Logic Preserved)
  const handleSaveProcess = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('vynx_portfolio_data', JSON.stringify(unitData));
      setIsSaving(false);
      setShowSaveConfirm(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 2000);
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
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* 1. HEADER OPERATIONAL BAR */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Unit Asset Management</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 italic">Configure the visual and service registry for your business unit.</p>
        </div>

        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-emerald-50 text-emerald-600 px-4 py-2 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <CheckCircle2 size={14} /> Registry Updated
                </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setShowPreview(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-none text-xs font-bold text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all uppercase tracking-widest shadow-sm"
          >
            <Eye size={16} /> Asset Preview
          </button>
          <button 
            onClick={() => setShowSaveConfirm(true)} 
            className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-none text-xs font-bold hover:bg-indigo-600 transition-all uppercase tracking-widest shadow-lg active:scale-[0.98]"
          >
            <Save size={16} /> Publish Changes
          </button>
        </div>
      </div>

      {/* 2. PRIMARY WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* NODE 01: IDENTITY & EXPANDED DESCRIPTION */}
        <div className="lg:col-span-2 space-y-8">
           <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <ShieldCheck size={18} className="text-indigo-600" />
                <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">Business Specification & Overview</h4>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Display Identity</label>
                      <input 
                        type="text"
                        value={unitData.name}
                        onChange={(e) => setUnitData({...unitData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-lg font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-600 rounded-none transition-all uppercase"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Connection (URL)</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text"
                          value={unitData.website}
                          onChange={(e) => setUnitData({...unitData, website: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 text-sm font-semibold text-indigo-600 outline-none focus:bg-white focus:border-indigo-600 rounded-none transition-all"
                        />
                      </div>
                   </div>
                </div>

                {/* LARGE DESCRIPTION AREA - High Density, Non-Scrollable fitting */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Executive Unit Summary</label>
                    <span className="text-[10px] font-bold text-slate-300 uppercase">{unitData.description.length} CHARS</span>
                  </div>
                  <textarea 
                    value={unitData.description}
                    onChange={(e) => setUnitData({...unitData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-6 text-base leading-relaxed font-medium text-slate-600 outline-none focus:bg-white focus:border-indigo-600 resize-none min-h-[320px] rounded-none transition-all"
                    placeholder="Provide a professional overview of business capabilities, target markets, and project history..."
                  />
                </div>
              </div>
           </div>
        </div>

        {/* NODE 02: CAPABILITY REGISTRY */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Briefcase size={18} className="text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">Service Registry</h4>
            </div>
            
            <div className="p-6 flex-1">
                <form onSubmit={addService} className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        value={newService} 
                        onChange={(e) => setNewService(e.target.value)} 
                        placeholder="Register Capability..." 
                        className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all uppercase" 
                    />
                    <button type="submit" className="p-3 bg-slate-900 text-white hover:bg-indigo-600 transition-colors rounded-none">
                        <Plus size={20} />
                    </button>
                </form>

                <div className="space-y-2">
                  {unitData.services.map((s, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-none group hover:bg-white hover:border-indigo-600 transition-all">
                          <div className="flex items-center gap-3">
                             <div className="w-1.5 h-1.5 bg-indigo-600" />
                             <span className="text-[11px] font-bold text-slate-700 uppercase tracking-tight">{s}</span>
                          </div>
                          <button 
                              onClick={() => setUnitData({...unitData, services: unitData.services.filter((_, i) => i !== idx)})} 
                              className="text-slate-300 hover:text-red-600 transition-colors"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
                  {unitData.services.length === 0 && (
                    <div className="py-12 text-center border border-dashed border-slate-200">
                       <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Active Capabilities</p>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </div>

        {/* NODE 03: VISUAL ASSET REGISTRY */}
        <div className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <ImageIcon size={18} className="text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-[10px] uppercase tracking-widest">Visual Asset Gallery</h4>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest hover:text-white hover:bg-indigo-600 bg-indigo-50 px-5 py-2.5 border border-indigo-100 transition-all rounded-none"
              >
                <Upload size={14} /> Add Project Asset
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {unitData.gallery.map((img, i) => (
                <div key={i} className="relative group aspect-video rounded-none overflow-hidden border border-slate-200 bg-slate-100">
                  <img src={img} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" alt="Work Item" />
                  <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                      <button 
                        onClick={() => setUnitData({...unitData, gallery: unitData.gallery.filter((_, idx)=> idx !== i)})} 
                        className="p-3 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors shadow-2xl"
                      >
                        <Trash2 size={20}/>
                      </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="aspect-video rounded-none border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-50 transition-all group"
              >
                <Plus size={32} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Deploy New Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONFIRMATION & PREVIEW MODALS --- */}
      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSaving && setShowSaveConfirm(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-sm rounded-none shadow-2xl relative overflow-hidden z-[501] border border-slate-200">
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-slate-900 text-white rounded-none flex items-center justify-center mx-auto mb-6 border border-slate-800"><AlertCircle size={32} /></div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Sync Changes?</h4>
                <p className="text-sm text-slate-500 mb-8 font-medium">Propagate updates to the live agent network immediately?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setShowSaveConfirm(false)} className="py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all rounded-none">Cancel</button>
                  <button onClick={handleSaveProcess} disabled={isSaving} className="py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 rounded-none shadow-lg">
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Authorize"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[400] overflow-y-auto bg-slate-900/90 backdrop-blur-md p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="relative max-w-6xl mx-auto bg-white rounded-none overflow-hidden shadow-2xl flex flex-col border border-slate-200"
            >
              <button onClick={() => setShowPreview(false)} className="absolute top-6 right-6 z-50 p-2 bg-slate-900 text-white rounded-none hover:bg-red-600 transition-all shadow-xl"><X size={24} /></button>
              
              <div className="p-12 space-y-12">
                <div className="flex items-start gap-8">
                   <div className="h-32 w-32 bg-slate-900 text-white flex items-center justify-center rounded-none shrink-0"><Package size={48} /></div>
                   <div className="space-y-4">
                      <h2 className="text-5xl font-bold text-slate-900 uppercase tracking-tight leading-none">{unitData.name}</h2>
                      <div className="flex gap-4">
                         <span className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest">Premium Unit Node</span>
                         <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200 uppercase tracking-widest">Active Partner</span>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-16 border-t border-slate-100 pt-12">
                   <div className="col-span-2 space-y-12">
                      <div className="space-y-4">
                        <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.4em]">Unit_Mission_Statement</h4>
                        <p className="text-2xl text-slate-700 italic leading-relaxed font-light">"{unitData.description}"</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        {unitData.gallery.map((img, i) => (
                          <img key={i} src={img} className="w-full aspect-video object-cover border border-slate-100 grayscale hover:grayscale-0 transition-all duration-700 shadow-sm" alt="Work" />
                        ))}
                      </div>
                   </div>
                   <div className="col-span-1 space-y-8 bg-slate-50 p-10 border border-slate-100 h-fit">
                      <h4 className="font-bold text-slate-900 uppercase tracking-widest text-xs border-b border-slate-200 pb-4">Secure Contact Profile</h4>
                      <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Location_HQ</p>
                          <div className="flex items-center gap-3 text-sm font-bold text-slate-700 uppercase"><MapPin size={16} className="text-indigo-600" /> {unitData.location}</div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Digital_Link</p>
                          <div className="flex items-center gap-3 text-sm font-bold text-indigo-600"><Globe size={16} /> {unitData.website.replace('https://', '')}</div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Direct_Comms</p>
                          <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><Phone size={16} className="text-indigo-600" /> {unitData.contact}</div>
                        </div>
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

export default PortfolioManager;