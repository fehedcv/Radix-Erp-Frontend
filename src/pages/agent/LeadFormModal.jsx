import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Phone, Building2, 
  Plus, Send, Briefcase, ChevronDown, CheckCircle2, AlertCircle, 
  MapPin, ClipboardList, Sparkles, ArrowRight, Info
} from 'lucide-react';

// Data Import
import { businessUnits } from '../../data/businessData';

const LeadFormModal = ({ isOpen, onClose, initialUnit, onSubmitLead }) => {
  // --- LOGIC PRESERVED EXACTLY ---
  const [step, setStep] = useState('form'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: initialUnit || "",
    service: "",
    clientName: "",
    clientPhone: "",
    clientAddress: "",
    description: ""
  });

  useEffect(() => {
    if (initialUnit) setFormData(prev => ({ ...prev, category: initialUnit }));
  }, [initialUnit]);

  const selectedBusiness = businessUnits.find(u => u.name === formData.category);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const proceedToConfirm = (e) => {
    e.preventDefault();
    setStep('confirm');
  };

  const finalizeSubmission = async () => {
    setIsSubmitting(true);
    setTimeout(() => {
        if (onSubmitLead) {
            onSubmitLead({
              clientName: formData.clientName,
              clientPhone: formData.clientPhone,
              clientAddress: formData.clientAddress,
              category: formData.category,
              service: formData.service,
              description: formData.description
            }); 
          }
          setIsSubmitting(false);
          setStep('success');
    }, 1200); 
  };

  const resetAndClose = () => {
    const wasSuccess = step === 'success';
    setStep('form');
    if (wasSuccess) {
        setFormData({
            category: "", service: "", clientName: "", 
            clientPhone: "", clientAddress: "", description: ""
        });
    }
    onClose();
  };
  // --- END PRESERVED LOGIC ---

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
        {/* Modern Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={resetAndClose} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 font-['Plus_Jakarta_Sans',sans-serif]"
        >
          {/* Top Status Header */}
          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-b border-slate-200 shrink-0">
             <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Referral Form</span>
             </div>
             <button onClick={resetAndClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400">
               <X size={18} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-12">
            
            {/* STEP 1: INPUT FORM */}
            {step === 'form' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-10">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Referral Details</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Please provide the customer information and specific project requirements.</p>
                </div>

                <form onSubmit={proceedToConfirm} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Left Section: Customer Info */}
                  <div className="lg:col-span-7 space-y-8">
                    <h4 className="text-[10px] font-black text-[#007ACC] uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
                       <User size={14} /> 01. Customer Information
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Business Category</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-[#007ACC] appearance-none transition-all">
                            <option value="">Select Category</option>
                            {businessUnits.map(unit => (
                              <option key={unit.id} value={unit.name}>{unit.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Customer Name</label>
                        <input type="text" name="clientName" required value={formData.clientName} onChange={handleInputChange} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC] transition-all" placeholder="Enter Full Name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="tel" name="clientPhone" required value={formData.clientPhone} onChange={handleInputChange} className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC]" placeholder="+91 00000 00000" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Service Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input type="text" name="clientAddress" required value={formData.clientAddress} onChange={handleInputChange} className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC]" placeholder="City, Area" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section: Requirement Details */}
                  <div className="lg:col-span-5 flex flex-col">
                    <h4 className="text-[10px] font-black text-[#007ACC] uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3 mb-8">
                       <ClipboardList size={14} /> 02. Project Details
                    </h4>
                    
                    <div className="space-y-6 flex-grow flex flex-col">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Required Service</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <select name="service" required value={formData.service} onChange={handleInputChange} className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-[#007ACC] appearance-none disabled:opacity-40 transition-all" disabled={!selectedBusiness}>
                            <option value="">{selectedBusiness ? "Select Project Type" : "Select Category First"}</option>
                            {selectedBusiness?.products.map((p, i) => (
                              <option key={i} value={p}>{p}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                        </div>
                      </div>

                      <div className="space-y-2 flex-grow">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Additional Requirements</label>
                        <textarea name="description" required value={formData.description} onChange={handleInputChange} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC] min-h-[140px] h-full resize-none transition-all" placeholder="Enter any specific notes or instructions for the team..."></textarea>
                      </div>
                    </div>

                    <button type="submit" className="mt-8 w-full py-4 bg-[#0F172A] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-[#007ACC] transition-all flex items-center justify-center gap-3 active:scale-95">
                      Verify Referral <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: REVIEW / CONFIRMATION */}
            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6 max-w-xl mx-auto">
                <div className="w-16 h-16 bg-blue-50 text-[#007ACC] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm"><Info size={28} /></div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Review Details</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Please double-check the referral information before submitting.</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-2xl my-10 text-left overflow-hidden shadow-inner">
                   <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                      <div className="p-5"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Team</p><p className="text-xs font-bold text-slate-900 uppercase">{formData.category}</p></div>
                      <div className="p-5"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service</p><p className="text-xs font-bold text-[#007ACC] uppercase">{formData.service}</p></div>
                   </div>
                   <div className="p-5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Profile</p>
                      <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{formData.clientName}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-1">{formData.clientPhone} • {formData.clientAddress}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setStep('form')} className="py-4 bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-200 transition-all">Go Back</button>
                  <button onClick={finalizeSubmission} disabled={isSubmitting} className="py-4 bg-[#007ACC] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-[#0F172A] transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? "Submitting..." : "Submit Referral"} <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS STATE */}
            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 max-w-md mx-auto">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-xl shadow-emerald-50"><CheckCircle2 size={40} /></div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Referral Sent!</h3>
                <p className="text-slate-500 mt-4 leading-relaxed font-medium text-sm px-4">The referral for <span className="text-slate-900 font-bold">{formData.clientName}</span> has been successfully sent to the business team for review.</p>
                <button onClick={resetAndClose} className="mt-10 px-12 py-4 bg-[#0F172A] text-white rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-blue-600 transition-all shadow-xl">Back to Dashboard</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadFormModal;