import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Phone, Building2, 
  Plus, Send, Briefcase, ChevronDown, CheckCircle2, AlertCircle, 
  MapPin, ClipboardList, Sparkles, ArrowRight
} from 'lucide-react';

// Data Import
import { businessUnits } from '../../data/businessData';

const LeadFormModal = ({ isOpen, onClose, initialUnit, onSubmitLead }) => {
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
    }, 1200); // അല്പം കൂടി പ്രൊഫഷണൽ ആയ ഡിലേ
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={resetAndClose} 
          className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" 
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="bg-white w-full max-w-5xl rounded-none shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
        >
          {/* Top Info Bar */}
          <div className="bg-slate-900 px-8 py-3 flex justify-between items-center shrink-0">
             <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Lead_Transmission_Protocol_v2.0</span>
             <button onClick={resetAndClose} className="text-slate-500 hover:text-white transition-colors">
               <X size={18} />
             </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-14">
            
            {/* STEP 1: FORM */}
            {step === 'form' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-12 border-l-4 border-indigo-600 pl-6">
                  <h2 className="text-4xl font-bold tracking-tight text-slate-900 uppercase">New Submission</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Registry Entry for Authorized Units</p>
                </div>

                <form onSubmit={proceedToConfirm} className="grid grid-cols-1 lg:grid-cols-12 gap-14">
                  {/* Left Column: Client Data */}
                  <div className="lg:col-span-7 space-y-8">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                       <User size={14} /> 01. Client Identity
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Business Unit</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-none outline-none text-xs font-bold uppercase tracking-widest focus:border-indigo-600 appearance-none transition-all">
                            <option value="">Select Target Node</option>
                            {businessUnits.map(unit => (
                              <option key={unit.id} value={unit.name}>{unit.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Client Name</label>
                        <input type="text" name="clientName" required value={formData.clientName} onChange={handleInputChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-bold focus:border-indigo-600 transition-all uppercase placeholder:text-slate-200" placeholder="Full Identity Name" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Phone Extension</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input type="tel" name="clientPhone" required value={formData.clientPhone} onChange={handleInputChange} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-bold focus:border-indigo-600 transition-all" placeholder="+91 00000 00000" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Physical Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-4 text-slate-400" size={16} />
                          <textarea name="clientAddress" required rows="1" value={formData.clientAddress} onChange={handleInputChange} className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-bold focus:border-indigo-600 resize-none transition-all uppercase placeholder:text-slate-200" placeholder="Area, City"></textarea>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Service Details */}
                  <div className="lg:col-span-5 space-y-8 flex flex-col">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                       <ClipboardList size={14} /> 02. Requirements
                    </h4>
                    
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Operational Service</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select name="service" required value={formData.service} onChange={handleInputChange} className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-none outline-none text-xs font-bold uppercase tracking-widest focus:border-indigo-600 appearance-none disabled:opacity-30 transition-all" disabled={!selectedBusiness}>
                          <option value="">{selectedBusiness ? "Select Project Type" : "Awaiting Unit Select"}</option>
                          {selectedBusiness?.products.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                      </div>
                    </div>

                    <div className="space-y-2 flex-grow">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Project Summary</label>
                      <textarea name="description" required value={formData.description} onChange={handleInputChange} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-bold focus:border-indigo-600 h-full min-h-[120px] resize-none transition-all" placeholder="Enter detailed client requirements and urgency status..."></textarea>
                    </div>

                    <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-none font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                      Validate Submission <ArrowRight size={16} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: CONFIRMATION */}
            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10 max-w-xl mx-auto">
                <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-none flex items-center justify-center mx-auto mb-8 border border-indigo-100 shadow-xl shadow-indigo-50"><Sparkles size={32} /></div>
                <h3 className="text-3xl font-bold uppercase tracking-tight text-slate-900">Audit Details</h3>
                <p className="text-sm text-slate-500 mt-3 font-medium uppercase tracking-wide">Review the parameters before finalizing entry</p>
                
                <div className="bg-slate-50 border border-slate-200 rounded-none my-10 text-left overflow-hidden">
                   <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                      <div className="p-6"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Node</p><p className="text-xs font-bold text-slate-900 uppercase">{formData.category}</p></div>
                      <div className="p-6"><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Type</p><p className="text-xs font-bold text-indigo-600 uppercase">{formData.service}</p></div>
                   </div>
                   <div className="p-6">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Client Profile</p>
                      <p className="text-sm font-bold text-slate-900 uppercase">{formData.clientName}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{formData.clientPhone} • {formData.clientAddress}</p>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep('form')} className="flex-1 py-4 bg-slate-100 text-slate-500 font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Abort</button>
                  <button onClick={finalizeSubmission} disabled={isSubmitting} className="flex-[2] py-4 bg-indigo-600 text-white rounded-none font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                    {isSubmitting ? "Transmitting..." : "Initialize Entry"} <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS */}
            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 max-w-md mx-auto">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-none flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-xl shadow-emerald-50"><CheckCircle2 size={48} /></div>
                <h3 className="text-4xl font-bold uppercase tracking-tight text-slate-900">Transmitted</h3>
                <p className="text-slate-500 mt-6 leading-relaxed font-medium uppercase text-xs tracking-widest px-4">Registry entry for <span className="text-slate-900 font-black">{formData.clientName}</span> has been broadcasted to the unit terminal successfully.</p>
                <button onClick={resetAndClose} className="mt-12 px-14 py-5 bg-slate-900 text-white rounded-none font-black uppercase text-[10px] tracking-[0.3em] hover:bg-indigo-600 transition-all shadow-2xl">Return to Terminal</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadFormModal;