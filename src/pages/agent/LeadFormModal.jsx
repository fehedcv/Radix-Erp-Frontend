import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Phone, Building2, 
  Plus, Send, Briefcase, ChevronDown, CheckCircle2, AlertCircle 
} from 'lucide-react';

// Data Import - Used to populate the dynamic service dropdown
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

  // Sync category if modal is opened from a specific business unit profile
  useEffect(() => {
    if (initialUnit) setFormData(prev => ({ ...prev, category: initialUnit }));
  }, [initialUnit]);

  // Find the selected unit to display its specific products/services
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
    
    // Slight delay for professional UI feedback
    setTimeout(() => {
        if (onSubmitLead) {
            // EXECUTING: Passing data to AgentHub which triggers LocalStorage save 
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
    }, 800);
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
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={resetAndClose} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        />

        {/* Modal Container - Sharp Edges */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: 20 }} 
          className="bg-white w-full max-w-4xl rounded-none shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-slate-200"
        >
          {/* Close Button */}
          <button onClick={resetAndClose} className="absolute top-6 right-6 z-30 p-2 bg-slate-50 hover:bg-slate-900 hover:text-white transition-all rounded-none text-slate-400">
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto p-8 md:p-12">
            
            {/* STEP 1: LEAD SUBMISSION FORM [cite: 25, 83] */}
            {step === 'form' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">New Lead Submission</h2>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Client Referral System Entry</p>
                </div>

                <form onSubmit={proceedToConfirm} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">01. Client Information</h4>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Target Business Unit</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-semibold focus:border-indigo-600 appearance-none transition-all">
                          <option value="">Select Unit</option>
                          {businessUnits.map(unit => (
                            <option key={unit.id} value={unit.name}>{unit.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Client Full Name</label>
                      <input type="text" name="clientName" required value={formData.clientName} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-semibold focus:border-indigo-600 transition-all" placeholder="Enter Full Name" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Contact Number</label>
                      <input type="tel" name="clientPhone" required value={formData.clientPhone} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-semibold focus:border-indigo-600 transition-all" placeholder="+91 00000 00000" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Primary Address</label>
                      <textarea name="clientAddress" required rows="2" value={formData.clientAddress} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-semibold focus:border-indigo-600 resize-none transition-all" placeholder="Enter Client Location Details"></textarea>
                    </div>
                  </div>

                  <div className="space-y-6 flex flex-col">
                    <h4 className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">02. Lead Requirements</h4>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Requested Service</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select name="service" required value={formData.service} onChange={handleInputChange} className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-semibold focus:border-indigo-600 appearance-none disabled:opacity-50 transition-all" disabled={!selectedBusiness}>
                          <option value="">{selectedBusiness ? "Select Service" : "Select Unit First"}</option>
                          {selectedBusiness?.products.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2 flex-grow">
                      <label className="text-[10px] font-bold uppercase text-slate-500">Additional Details</label>
                      <textarea name="description" required value={formData.description} onChange={handleInputChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-none outline-none text-sm font-semibold focus:border-indigo-600 h-[150px] md:h-full resize-none transition-all" placeholder="Detail the client's specific needs and project urgency..."></textarea>
                    </div>

                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-none text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2 group">
                      Review Submission <Send size={16} className="group-hover:translate-x-1" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 2: CONFIRMATION REVIEW */}
            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-6 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-none flex items-center justify-center mx-auto mb-6 border border-amber-100"><AlertCircle size={32} /></div>
                <h3 className="text-2xl font-bold uppercase tracking-tight text-slate-900">Verify Details</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Please confirm the referral information for <span className="text-slate-900 font-bold">{formData.clientName}</span>.</p>
                
                <div className="bg-slate-50 p-6 rounded-none my-8 text-left space-y-3 border border-slate-200">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Assigned Unit</p>
                    <p className="text-xs font-bold text-slate-900">{formData.category}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Service Category</p>
                    <p className="text-xs font-bold text-indigo-600">{formData.service}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep('form')} className="flex-1 py-4 text-slate-400 font-bold uppercase text-xs hover:text-slate-900">Back</button>
                  <button 
                    onClick={finalizeSubmission} 
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-none font-bold uppercase text-xs tracking-widest shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Submission"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SUCCESS STATE [cite: 49] */}
            {step === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 max-w-md mx-auto">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-none flex items-center justify-center mx-auto mb-6 border border-emerald-100"><CheckCircle2 size={40} /></div>
                <h3 className="text-3xl font-bold uppercase tracking-tight text-slate-900">Success!</h3>
                <p className="text-slate-500 mt-4 leading-relaxed font-medium">The lead has been successfully submitted to <span className="text-slate-900 font-bold">{formData.category}</span>. You can track its progress in your dashboard[cite: 25, 49].</p>
                <button onClick={resetAndClose} className="mt-10 px-12 py-4 bg-slate-900 text-white rounded-none font-bold uppercase text-xs tracking-widest hover:bg-indigo-600 transition-all">Return to Dashboard</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadFormModal;