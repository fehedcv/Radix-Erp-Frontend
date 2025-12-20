import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Phone, MessageSquare, Building2, 
  Sparkles, Send, MapPin, Briefcase, ChevronDown, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { businessUnits } from '../../data/businessData';

const LeadFormModal = ({ isOpen, onClose, initialUnit, onSubmitLead }) => {
  const [step, setStep] = useState('form'); 
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for UX
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
    // Simulation for better feel
    setTimeout(() => {
        if (onSubmitLead) {
            // Form data full aayi AgentHub-lekk ayaykkunnu
            onSubmitLead({
              ...formData,
              businessUnit: formData.category // Maps 'category' to 'businessUnit' in data
            }); 
          }
          setIsSubmitting(false);
          setStep('success');
    }, 800);
  };

  const resetAndClose = () => {
    setStep('form');
    // Clear form after success
    if (step === 'success') {
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetAndClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-white">
          <button onClick={resetAndClose} className="absolute top-6 right-6 z-30 p-3 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all">
            <X size={20} />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
            {step === 'form' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Sparkles size={24} /></div>
                    <h2 className="text-3xl font-black tracking-tight uppercase text-slate-900 leading-none">Submit Lead Entry</h2>
                  </div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Provide precise details for business owner verification.</p>
                </div>

                <form onSubmit={proceedToConfirm} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-2">01. Target Details</h4>
                    
                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Business Category</label>
                      <div className="relative">
                        <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                        <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 appearance-none transition-all">
                          <option value="">Select Unit</option>
                          {businessUnits.map(unit => (
                            <option key={unit.id} value={unit.name}>{unit.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Name</label>
                      <input type="text" name="clientName" required value={formData.clientName} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 transition-all shadow-sm" placeholder="Full Name" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Phone Number</label>
                      <input type="tel" name="clientPhone" required value={formData.clientPhone} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 transition-all shadow-sm" placeholder="+971..." />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Client Address</label>
                      <textarea name="clientAddress" required rows="2" value={formData.clientAddress} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 resize-none transition-all shadow-sm" placeholder="Location details..."></textarea>
                    </div>
                  </div>

                  <div className="space-y-6 flex flex-col">
                    <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] border-b border-indigo-50 pb-2">02. Service Specifications</h4>
                    
                    {/* Dynamic Service List */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Requested Service</label>
                      <div className="relative">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-500" size={18} />
                        <select name="service" required value={formData.service} onChange={handleInputChange} className="w-full pl-14 pr-10 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 appearance-none disabled:opacity-50 transition-all shadow-sm" disabled={!selectedBusiness}>
                          <option value="">{selectedBusiness ? "Select Service" : "Choose category first"}</option>
                          {selectedBusiness?.products.map((p, i) => (
                            <option key={i} value={p}>{p}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2 flex-grow">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Project Description</label>
                      <textarea name="description" required value={formData.description} onChange={handleInputChange} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none text-sm font-bold focus:border-indigo-600 h-[180px] resize-none transition-all shadow-sm" placeholder="Describe the scope..."></textarea>
                    </div>

                    <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-900 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                      Review Submission <Send size={16} className="group-hover:translate-x-1" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 max-w-lg mx-auto">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-6"><AlertCircle size={40} /></div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Confirm Referral</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Are you sure you want to refer <b>{formData.clientName}</b>?</p>
                <div className="bg-slate-50 p-6 rounded-[2rem] my-8 text-left space-y-2 border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Target Service</p>
                  <p className="font-bold text-slate-900">{formData.service} at {formData.category}</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep('form')} className="flex-1 py-4 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-900 transition-colors">Go Back</button>
                  <button 
                    onClick={finalizeSubmission} 
                    disabled={isSubmitting}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-100 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Sending..." : "Confirm & Send"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 max-w-md mx-auto">
                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm"><CheckCircle2 size={48} /></div>
                <h3 className="text-3xl font-black uppercase tracking-tight">Lead Sent!</h3>
                <p className="text-slate-500 mt-4 leading-relaxed font-medium">Your referral has been successfully sent to the <b>Business Owner</b> and <b>Vynx Admin</b>.</p>
                <button onClick={resetAndClose} className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all shadow-xl shadow-slate-200">Done</button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LeadFormModal;