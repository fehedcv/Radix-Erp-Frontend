import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import { 
  X, User, Phone, Building2, 
  Briefcase, ChevronDown, CheckCircle2, 
  MapPin, ClipboardList, ArrowRight, Info,
  BookUser, Search, Loader2 
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';

const LeadFormAppModal = ({ isOpen, onClose, initialUnit, businessUnits = {}, onSubmit, theme }) => {
  const [step, setStep] = useState('form'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: initialUnit || "",
    service: "",
    client_name: "",
    client_phone: "",
    clientAddress: "",
    notes: "",
  });

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const isLight = theme === 'light';

  useEffect(() => {
    if (initialUnit) setFormData(prev => ({ ...prev, category: initialUnit, service: "" }));
  }, [initialUnit]);

  const categories = Object.keys(businessUnits);
  const servicesForCategory = formData.category ? (businessUnits[formData.category] || []) : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value, service: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOpenContactList = async () => {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const permission = await Contacts.requestPermissions();
      if (permission.contacts !== 'granted') return;
      setShowContactsModal(true);
      setIsLoadingContacts(true);
      const result = await Contacts.getContacts({ projection: { name: true, phones: true } });
      const validContacts = result.contacts
        .filter(c => c.phones && c.phones.length > 0)
        .sort((a, b) => (a.name?.display || "").localeCompare(b.name?.display || ""));
      setAllContacts(validContacts);
    } catch (error) {
      console.error(error);
      setShowContactsModal(false);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleSelectContact = (contact) => {
    const pickedName = contact.name?.display || "";
    const pickedPhone = contact.phones[0].number;
    const cleanPhone = pickedPhone.replace(/^\+91/, '').replace(/[\s-]/g, '').trim();
    setFormData(prev => ({ ...prev, client_name: prev.client_name || pickedName, client_phone: cleanPhone }));
    setShowContactsModal(false);
    setSearchQuery("");
  };

  const filteredContacts = allContacts.filter(contact => {
    const nameMatch = contact.name?.display?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = contact.phones?.[0]?.number?.includes(searchQuery);
    return nameMatch || phoneMatch;
  });

  const proceedToConfirm = (e) => {
    e.preventDefault();
    setStep('confirm');
  };

  const handleSubmitReferral = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await frappeApi.post('/method/business_chain.api.leads.submit_lead', {
        business_unit: formData.category, client_name: formData.client_name,
        client_phone: formData.client_phone, service: formData.service,
        notes: formData.notes, location: formData.clientAddress,
      });
      setStep('success');
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to submit referral');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    if (step === 'success' && onSubmit) onSubmit();
    setStep('form');
    setFormData({ category: "", service: "", client_name: "", client_phone: "", clientAddress: "", notes: "" });
    setShowContactsModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex flex-col justify-end overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={resetAndClose} 
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm`} 
        />
        
        {/* Main Sheet Container */}
        <motion.div 
          initial={{ y: "100%" }} 
          animate={{ y: 0 }} 
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`w-full h-[92vh] rounded-t-[2.5rem] shadow-2xl relative flex flex-col overflow-hidden border-t transition-colors ${
            isLight ? 'bg-[#F4F5F9] border-white' : 'bg-[#09090B] border-white/5'
          }`}
        >
          {/* Native Grabber Bar */}
          <div className="w-full flex justify-center py-3">
            <div className={`w-12 h-1.5 rounded-full ${isLight ? 'bg-gray-300' : 'bg-white/10'}`} />
          </div>

          {/* Header */}
          <div className="px-6 pb-4 flex justify-between items-center">
            <div>
              <h2 className={`text-xl font-black uppercase tracking-tight ${isLight ? 'text-black' : 'text-white'}`}>
                {step === 'form' ? 'New Referral' : step === 'confirm' ? 'Confirm' : 'Success'}
              </h2>
              <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                Agent Referral Portal
              </p>
            </div>
            <button onClick={resetAndClose} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLight ? 'bg-white text-black' : 'bg-white/5 text-white'}`}>
              <X size={20} strokeWidth={3} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-10">
            {step === 'form' && (
              <form onSubmit={proceedToConfirm} className="space-y-4">
                
                {/* Section 1: Client Info */}
                <div className={`p-5 rounded-[2rem] space-y-4 ${isLight ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8] flex items-center gap-2">
                     <User size={14} /> Client Information
                   </p>
                   
                   <div className="space-y-3">
                     <input type="text" name="client_name" required value={formData.client_name} onChange={handleInputChange}
                        placeholder="Full Name"
                        className={`w-full px-5 py-4 rounded-[1.25rem] outline-none text-sm font-bold border transition-all ${
                          isLight ? 'bg-[#F4F5F9] border-transparent focus:border-black' : 'bg-[#09090B] border-white/5 text-white focus:border-white'
                        }`}
                      />

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                           <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                           <input type="tel" name="client_phone" required value={formData.client_phone} onChange={handleInputChange}
                            placeholder="Phone Number"
                            className={`w-full pl-11 pr-4 py-4 rounded-[1.25rem] outline-none text-sm font-bold border transition-all ${
                              isLight ? 'bg-[#F4F5F9] border-transparent focus:border-black' : 'bg-[#09090B] border-white/5 text-white focus:border-white'
                            }`}
                          />
                        </div>
                        {Capacitor.isNativePlatform() && (
                          <button type="button" onClick={handleOpenContactList} className={`w-14 rounded-[1.25rem] flex items-center justify-center transition-all active:scale-95 border ${
                            isLight ? 'bg-[#F4F5F9] border-transparent text-black' : 'bg-white/5 border-white/5 text-white'
                          }`}>
                            <BookUser size={20} />
                          </button>
                        )}
                      </div>

                      <div className="relative">
                         <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                         <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleInputChange}
                          placeholder="Service Location (City, Area)"
                          className={`w-full pl-11 pr-4 py-4 rounded-[1.25rem] outline-none text-sm font-bold border transition-all ${
                            isLight ? 'bg-[#F4F5F9] border-transparent focus:border-black' : 'bg-[#09090B] border-white/5 text-white focus:border-white'
                          }`}
                        />
                      </div>
                   </div>
                </div>

                {/* Section 2: Service Info */}
                <div className={`p-5 rounded-[2rem] space-y-4 ${isLight ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
                   <p className="text-[10px] font-black uppercase tracking-widest text-[#4ADE80] flex items-center gap-2">
                     <ClipboardList size={14} /> Project Requirements
                   </p>

                   <div className="space-y-3">
                      <div className="relative">
                        <select name="category" required value={formData.category} onChange={handleInputChange}
                          className={`w-full px-5 py-4 rounded-[1.25rem] outline-none text-xs font-black uppercase appearance-none border transition-all ${
                            isLight ? 'bg-[#F4F5F9] border-transparent text-black' : 'bg-[#09090B] border-white/5 text-white'
                          }`}
                        >
                          <option value="">Select Category</option>
                          {categories.map(cat => ( <option key={cat} value={cat}>{cat}</option> ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
                      </div>

                      <div className="relative">
                        <select name="service" required value={formData.service} onChange={handleInputChange} disabled={!formData.category}
                          className={`w-full px-5 py-4 rounded-[1.25rem] outline-none text-xs font-black uppercase appearance-none border transition-all disabled:opacity-30 ${
                            isLight ? 'bg-[#F4F5F9] border-transparent text-black' : 'bg-[#09090B] border-white/5 text-white'
                          }`}
                        >
                          <option value="">Select Service</option>
                          {servicesForCategory.map(svc => ( <option key={svc} value={svc}>{svc}</option> ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
                      </div>

                      <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                        placeholder="Additional Details or Remarks..."
                        className={`w-full p-5 rounded-[1.25rem] outline-none text-sm font-bold min-h-[120px] resize-none border transition-all ${
                          isLight ? 'bg-[#F4F5F9] border-transparent focus:border-black' : 'bg-[#09090B] border-white/5 text-white focus:border-white'
                        }`}
                      />
                   </div>
                </div>

                <button type="submit" className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg ${
                  isLight ? 'bg-black text-white' : 'bg-[#38BDF8] text-black'
                }`}>
                  Review Submission <ArrowRight size={18} strokeWidth={3} />
                </button>
              </form>
            )}

            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full pt-4">
                <div className={`p-8 rounded-[2.5rem] text-center mb-6 ${isLight ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
                   <div className={`w-16 h-16 rounded-[1.25rem] mx-auto flex items-center justify-center mb-5 ${isLight ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                      <Info size={32} className="text-[#38BDF8]" />
                   </div>
                   <h3 className="text-xl font-black uppercase tracking-tight">Review Referral</h3>
                   <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>Verify details before sending</p>
                </div>

                <div className={`rounded-[2rem] divide-y overflow-hidden mb-8 border ${isLight ? 'bg-white border-white divide-[#F4F5F9]' : 'bg-[#18181B] border-white/5 divide-white/5'}`}>
                   <div className="p-6">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Customer</p>
                      <p className="text-lg font-black uppercase">{formData.client_name}</p>
                      <p className="text-xs font-bold text-[#38BDF8]">{formData.client_phone}</p>
                   </div>
                   <div className="p-6">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 mb-2">Service Request</p>
                      <p className="text-xs font-black uppercase">{formData.category}</p>
                      <p className="text-xs font-bold text-[#38BDF8] uppercase">{formData.service}</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button onClick={() => setStep('form')} className={`flex-1 py-5 font-black uppercase text-[11px] rounded-[1.5rem] border ${isLight ? 'bg-white text-black' : 'bg-white/5 text-white border-white/5'}`}>Back</button>
                   <button onClick={handleSubmitReferral} disabled={isSubmitting} className={`flex-[2] py-5 rounded-[1.5rem] font-black text-[11px] uppercase transition-all shadow-lg ${
                     isLight ? 'bg-black text-white' : 'bg-[#38BDF8] text-black'
                   }`}>
                     {isSubmitting ? "Processing..." : "Confirm & Send"}
                   </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-8 border shadow-inner ${isLight ? 'bg-white text-[#4ADE80]' : 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20 shadow-[0_0_40px_rgba(74,222,128,0.2)]'}`}>
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black tracking-tight uppercase">Sent!</h3>
                <p className={`mt-4 text-xs font-bold uppercase tracking-widest leading-relaxed ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                   Referral for <span className="text-[#38BDF8]">{formData.client_name}</span> has been submitted successfully.
                </p>
                <button onClick={resetAndClose} className={`mt-10 w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase border tracking-[0.2em] ${isLight ? 'bg-black text-white' : 'bg-white text-black'}`}>Back to Dashboard</button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CONTACTS SELECTION OVERLAY */}
        <AnimatePresence>
          {showContactsModal && (
            <motion.div 
              initial={{ opacity: 0, y: 100 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 100 }}
              className={`fixed inset-0 z-[200] flex flex-col ${isLight ? 'bg-[#F4F5F9]' : 'bg-[#09090B]'}`}
            >
              <div className={`p-6 border-b flex flex-col gap-5 ${isLight ? 'bg-white' : 'bg-[#18181B] border-white/5'}`}>
                <div className="flex justify-between items-center">
                  <h3 className="font-black uppercase text-sm tracking-widest">Select Contact</h3>
                  <button onClick={() => setShowContactsModal(false)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-gray-100' : 'bg-white/5'}`}><X size={20} /></button>
                </div>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-gray-400' : 'text-gray-600'}`} size={16} />
                  <input type="text" placeholder="Search by name or number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-11 pr-5 py-4 rounded-[1.25rem] outline-none text-sm font-bold border ${
                      isLight ? 'bg-[#F4F5F9] border-transparent focus:border-black' : 'bg-[#09090B] border-white/5 text-white'
                    }`} />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {isLoadingContacts ? (
                  <div className="flex flex-col items-center justify-center pt-20 gap-4">
                    <Loader2 className={`animate-spin ${isLight ? 'text-black' : 'text-[#38BDF8]'}`} size={32} />
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Fetching Contacts...</p>
                  </div>
                ) : (
                  filteredContacts.map((contact, i) => (
                    <button key={i} onClick={() => handleSelectContact(contact)} className={`w-full text-left p-5 rounded-[1.5rem] flex justify-between items-center transition-all active:scale-[0.98] ${isLight ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
                      <div>
                        <p className="font-black text-sm uppercase tracking-tight">{contact.name?.display || "Unknown"}</p>
                        <p className={`text-[10px] font-bold ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>{contact.phones[0].number}</p>
                      </div>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLight ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                        <User size={16} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default LeadFormAppModal;