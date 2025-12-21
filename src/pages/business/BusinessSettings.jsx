import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Phone, MapPin, Save, CheckCircle2, 
  AlertCircle, Loader2, Globe, MessageCircle, Info, User,
  Briefcase
} from 'lucide-react';

const BusinessSettings = ({ onUpdate }) => {
  // 1. DATA STATE (Logic Preserved: Managed Business Details)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('vynx_business_settings');
    return saved ? JSON.parse(saved) : {
      businessName: "Interior Design Unit",
      category: "Home Interiors",
      website: "https://vynx-interiors.com",
      description: "We provide high-end luxury interior solutions for modern homes and commercial spaces in Dubai.",
      address: "Office 402, Business Bay Tower, Dubai, UAE",
      primaryPhone: "+971 50 123 4567",
      whatsappNumber: "+971 50 123 4567",
      managerName: "Sarah Ahmed",
      managerPhone: "+971 55 888 9999"
    };
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFinalSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('vynx_business_settings', JSON.stringify(formData));
      if (onUpdate) onUpdate(formData); // Sync with Dashboard Header
      setIsSaving(false);
      setShowConfirm(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-20">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-slate-200 pb-6 gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Unit Configuration</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 italic">Manage your business profile and communication channels.</p>
        </div>
        
        {/* Mobile Save Button */}
        <button 
            onClick={() => setShowConfirm(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
        >
            <Save size={16} /> Update Registry
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MAIN FORM AREA [cite: 63] */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* SECTION 1: CORE IDENTITY */}
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Building2 size={18} className="text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-widest">Business Identity</h4>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Business Name</label>
                <input 
                    type="text" 
                    name="businessName" 
                    value={formData.businessName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all uppercase" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Category</label>
                <input 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all uppercase" 
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Core Mission / Description</label>
                <textarea 
                    name="description" 
                    rows="3" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all resize-none" 
                    placeholder="Briefly describe your services..." 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT & WEB */}
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <Globe size={18} className="text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-widest">Communication Channels</h4>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Public Website</label>
                <input 
                    type="url" 
                    name="website" 
                    value={formData.website} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Support Line</label>
                <input 
                    type="tel" 
                    name="primaryPhone" 
                    value={formData.primaryPhone} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">WhatsApp Business</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="whatsappNumber" 
                    value={formData.whatsappNumber} 
                    onChange={handleChange} 
                    className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all" 
                  />
                  <MessageCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered HQ Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: MANAGER & ACTIONS */}
        <div className="space-y-8">
          
          {/* Manager Details Card */}
          <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
              <User size={18} className="text-indigo-600" />
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-widest">Primary Contact</h4>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Manager Identity</label>
                <input 
                    type="text" 
                    name="managerName" 
                    value={formData.managerName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 uppercase" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direct Extension</label>
                <input 
                    type="tel" 
                    name="managerPhone" 
                    value={formData.managerPhone} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600" 
                />
              </div>
            </div>
          </div>

          {/* Persistent Action Area */}
          <div className="hidden sm:block sticky top-24 space-y-4">
            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full py-4 bg-slate-900 text-white rounded-none text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Save size={18} /> Commit Configuration
            </button>
            
            <AnimatePresence>
              {saveSuccess && (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 py-3 px-4 rounded-none text-xs font-bold uppercase tracking-tight"
                >
                  <CheckCircle2 size={16} /> System Registry Updated
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-5 bg-amber-50 border border-amber-100 flex gap-4 rounded-none">
               <Info size={20} className="text-amber-600 shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-800 leading-relaxed font-semibold uppercase tracking-tight">
                 Identity modifications are immediately propagated to the network directory visible to all field agents[cite: 6].
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION OVERLAY */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => !isSaving && setShowConfirm(false)} 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
            />
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-white w-full max-w-sm rounded-none shadow-2xl relative overflow-hidden z-[501] border border-slate-200"
            >
              <div className="p-10 text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-none flex items-center justify-center mx-auto mb-6 border border-amber-100">
                  <AlertCircle size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">Save Changes?</h4>
                <p className="text-sm text-slate-500 mb-8 font-medium">This operation will modify your business profile across the network.</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setShowConfirm(false)} 
                    disabled={isSaving} 
                    className="py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all rounded-none"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleFinalSave} 
                    disabled={isSaving} 
                    className="py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2 rounded-none"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Authorize"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessSettings;