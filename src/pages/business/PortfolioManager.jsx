import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Trash2, Image as ImageIcon, Briefcase, 
  Save, Eye, CheckCircle2, X, Upload, Star, MapPin, 
  AlertCircle, Loader2, Package, ShieldCheck, Sparkles, Phone, Globe 
} from 'lucide-react';

const PortfolioManager = () => {
  // 1. STATE MANAGEMENT WITH SYNC LOGIC (Kept exactly the same)
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load initial data from LocalStorage if available
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

  // 2. HANDLERS (Kept exactly the same)
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
    <div className="animate-in fade-in duration-500 space-y-6 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Unit Portfolio</h2>
          <p className="text-sm text-slate-500 mt-1">Customize how your business appears to clients and agents.</p>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {saveSuccess && (
                <motion.span 
                    initial={{ opacity: 0, x: 10 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100"
                >
                    <CheckCircle2 size={14}/> Saved successfully
                </motion.span>
            )}
          </AnimatePresence>
          
          <button 
            onClick={() => setShowPreview(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-slate-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Eye size={16} /> 
            <span className="hidden sm:inline">Preview</span>
          </button>
          
          <button 
            onClick={() => setShowSaveConfirm(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Save size={16} /> 
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Services */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Briefcase size={18} className="text-slate-500" />
              <h4 className="font-semibold text-slate-900 text-sm">Offered Services</h4>
            </div>
            
            <div className="p-5">
                <form onSubmit={addService} className="relative mb-4">
                    <input 
                        type="text" 
                        value={newService} 
                        onChange={(e) => setNewService(e.target.value)} 
                        placeholder="Add a new service..." 
                        className="w-full pl-3 pr-10 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                    />
                    <button 
                        type="submit" 
                        className="absolute right-1.5 top-1.5 p-1 bg-gray-100 text-slate-600 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                        <Plus size={16} />
                    </button>
                </form>

                <div className="space-y-2">
                {unitData.services.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-100 group hover:border-gray-200 transition-all">
                        <span className="text-sm font-medium text-slate-700">{s}</span>
                        <button 
                            onClick={() => setUnitData({...unitData, services: unitData.services.filter((_, i) => i !== idx)})} 
                            className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                ))}
                {unitData.services.length === 0 && (
                    <p className="text-xs text-center text-slate-400 py-4 italic">No services listed yet.</p>
                )}
                </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Gallery */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-slate-500" />
                  <h4 className="font-semibold text-slate-900 text-sm">Project Showcase</h4>
              </div>
              
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="flex items-center gap-1.5 text-indigo-600 font-medium text-xs hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded border border-indigo-100 transition-colors"
              >
                <Upload size={14} /> Upload Image
              </button>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unitData.gallery.map((img, i) => (
                <div key={i} className="relative group aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Project" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setUnitData({...unitData, gallery: unitData.gallery.filter((_, idx)=> idx !== i)})} 
                        className="p-2 bg-white text-red-600 rounded-md shadow-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18}/>
                      </button>
                  </div>
                </div>
              ))}
              
              <button 
                onClick={() => fileInputRef.current.click()} 
                className="aspect-video rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-slate-50 transition-all"
              >
                <Plus size={24}/>
                <span className="text-xs font-medium">Add Project Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SAVE MODAL --- */}
      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => !isSaving && setShowSaveConfirm(false)} 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-white w-full max-w-sm rounded-lg shadow-xl relative overflow-hidden z-[501]"
            >
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                    <AlertCircle size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">Publish Changes?</h4>
                <p className="text-sm text-slate-500 mb-6">This will update your public profile for all connected agents immediately.</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowSaveConfirm(false)} 
                    className="flex-1 py-2.5 bg-white border border-gray-300 text-slate-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveProcess} 
                    disabled={isSaving} 
                    className="flex-1 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Publish"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- LIVE PREVIEW MODAL --- */}
      <AnimatePresence>
        {showPreview && (
          <div className="fixed inset-0 z-[400] overflow-y-auto">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowPreview(false)} 
                className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm" 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-w-6xl mx-auto my-8 bg-white rounded-xl overflow-hidden shadow-2xl min-h-[80vh] flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowPreview(false)} 
                className="absolute top-4 right-4 z-50 p-2 bg-white/10 backdrop-blur-md text-white rounded-full hover:bg-white hover:text-slate-900 transition-all border border-white/20"
              >
                <X size={20} />
              </button>

              {/* HERO SECTION */}
              <div className="relative h-[400px] w-full bg-slate-900">
                  <img 
                    src={unitData.gallery[0] || "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"} 
                    className="w-full h-full object-cover opacity-60" 
                    alt="Hero" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                      <div className="flex items-end gap-6">
                          <div className="hidden md:flex h-24 w-24 bg-white rounded-lg p-4 shadow-lg items-center justify-center shrink-0">
                              <Package size={48} className="text-slate-900" />
                          </div>
                          <div className="mb-2">
                              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{unitData.name}</h2>
                              <div className="flex flex-wrap items-center gap-4 mt-3">
                                  <span className="flex items-center gap-1.5 text-indigo-300 font-medium text-xs uppercase tracking-wide bg-white/10 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                                    <Star size={12} fill="currentColor" /> Premium Unit
                                  </span>
                                  <span className="flex items-center gap-1.5 text-emerald-300 font-medium text-xs uppercase tracking-wide bg-white/10 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                                    <ShieldCheck size={12} /> Verified Partner
                                  </span>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* CONTENT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-8 md:p-12 bg-gray-50 flex-1">
                
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                  <section>
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-indigo-600 rounded-full"></div> Unit Overview
                    </h4>
                    <p className="text-lg md:text-xl text-slate-700 leading-relaxed font-light">
                        "{unitData.description}"
                    </p>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-indigo-600 rounded-full"></div> Gallery
                        </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unitData.gallery.map((img, idx) => (
                        <div key={idx} className="rounded-lg overflow-hidden aspect-video shadow-sm border border-gray-200">
                            <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt={`Project ${idx}`} />
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-6">Service Portfolio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {unitData.services.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <CheckCircle2 size={18} className="text-emerald-500" />
                            <span className="font-medium text-slate-800 text-sm">{p}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  
                  {/* CTA Card */}
                  <div className="bg-slate-900 p-8 rounded-xl shadow-lg text-white relative overflow-hidden group">
                      <div className="relative z-10 text-center">
                          <h4 className="text-xl font-bold mb-3">Refer & Earn</h4>
                          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                              Refer a qualified lead to {unitData.name} and earn settlement credits upon verification.
                          </p>
                          <button className="w-full py-3 bg-white text-slate-900 rounded-lg font-bold text-sm shadow-md hover:bg-indigo-50 transition-colors">
                              Submit Lead Now
                          </button>
                      </div>
                      <Sparkles className="absolute -bottom-6 -right-6 text-white/5" size={120} />
                  </div>

                  {/* Info Card */}
                  <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm space-y-6">
                      <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location</p>
                          <div className="flex items-start gap-2 text-slate-800 text-sm">
                              <MapPin size={16} className="text-indigo-600 shrink-0 mt-0.5" /> 
                              {unitData.location}
                          </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-100 space-y-4">
                          <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Website</p>
                            <a href={unitData.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-indigo-600 font-medium text-sm hover:underline">
                              <Globe size={16} /> {unitData.website.replace('https://', '').replace('http://', '')}
                            </a>
                          </div>
                          <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact</p>
                             <div className="flex items-center gap-2 text-slate-800 font-medium text-sm">
                                 <Phone size={16} className="text-indigo-600" /> {unitData.contact}
                             </div>
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