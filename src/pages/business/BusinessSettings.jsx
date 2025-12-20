import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Phone, MapPin, Save, CheckCircle2, 
  AlertCircle, Loader2, Globe, MessageCircle, Info, User
} from 'lucide-react';

const BusinessSettings = ({ onUpdate }) => {
  // 1. DATA STATE (Managed Business Details - Kept logic same)
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
    <div className="animate-in fade-in duration-500 pb-20 space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-200 pb-6 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Manage your business profile and contact information.</p>
        </div>
        
        {/* Mobile Save Button (visible on small screens) */}
        <button 
            onClick={() => setShowConfirm(true)}
            className="sm:hidden w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-md text-sm font-medium hover:bg-slate-800 transition-colors shadow-sm"
        >
            <Save size={16} /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN FORM AREA */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION 1: CORE IDENTITY */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Building2 size={18} className="text-slate-500" />
              <h4 className="font-semibold text-slate-900 text-sm">Business Identity</h4>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Business Name</label>
                <input 
                    type="text" 
                    name="businessName" 
                    value={formData.businessName} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Category</label>
                <input 
                    type="text" 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                />
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Short Description</label>
                <textarea 
                    name="description" 
                    rows="3" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none" 
                    placeholder="Briefly describe your services..." 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: CONTACT & WEB */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Globe size={18} className="text-slate-500" />
              <h4 className="font-semibold text-slate-900 text-sm">Contact & Location</h4>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Website</label>
                <input 
                    type="url" 
                    name="website" 
                    value={formData.website} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Phone Number</label>
                <input 
                    type="tel" 
                    name="primaryPhone" 
                    value={formData.primaryPhone} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">WhatsApp Business</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="whatsappNumber" 
                    value={formData.whatsappNumber} 
                    onChange={handleChange} 
                    className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                  />
                  <MessageCircle className="absolute right-2.5 top-2.5 text-emerald-500 pointer-events-none" size={16} />
                </div>
              </div>
              
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Office Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                  <input 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: MANAGER & ACTIONS */}
        <div className="space-y-6">
          
          {/* Manager Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <User size={18} className="text-slate-500" />
              <h4 className="font-semibold text-slate-900 text-sm">Unit Manager</h4>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Full Name</label>
                <input 
                    type="text" 
                    name="managerName" 
                    value={formData.managerName} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact Number</label>
                <input 
                    type="tel" 
                    name="managerPhone" 
                    value={formData.managerPhone} 
                    onChange={handleChange} 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                />
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="hidden sm:block sticky top-6 space-y-4">
            <button 
              onClick={() => setShowConfirm(true)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-md text-sm font-medium shadow-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} /> Save Changes
            </button>
            
            <AnimatePresence>
              {saveSuccess && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }} 
                    className="flex items-center justify-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 py-2 px-3 rounded-md text-xs font-medium"
                >
                  <CheckCircle2 size={14} /> Settings updated successfully
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-4 bg-amber-50 rounded-md border border-amber-100 flex gap-3">
               <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
               <p className="text-xs text-amber-800 leading-relaxed">
                 Updating these details will immediately reflect on your public profile visible to all agents.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION POPUP */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => !isSaving && setShowConfirm(false)} 
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
                <h4 className="text-lg font-bold text-slate-900 mb-2">Save Changes?</h4>
                <p className="text-sm text-slate-500 mb-6">This will update your business profile across the platform.</p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowConfirm(false)} 
                    disabled={isSaving} 
                    className="flex-1 py-2 bg-white border border-gray-300 text-slate-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleFinalSave} 
                    disabled={isSaving} 
                    className="flex-1 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Confirm"}
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