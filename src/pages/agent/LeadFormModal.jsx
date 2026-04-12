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

const LeadFormModal = ({ isOpen, onClose, initialUnit, businessUnits = {}, onSubmit, theme }) => {
  const [step, setStep] = useState('form'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: initialUnit || "",
    service: "",
    client_name: "",
    client_phone: "",
    clientAddress: "",
    notes: "",
    location: "",
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
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 overflow-hidden transition-colors duration-300">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetAndClose} 
          className={`absolute inset-0 ${isLight ? 'bg-[#1A1D1F]/20' : 'bg-[#020617]/80'} backdrop-blur-md`} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 20 }} 
          className={`w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col h-auto max-h-[95vh] border transition-colors duration-300 ${
            isLight ? 'bg-white border-[#F0F2F5] text-[#1A1D1F]' : 'bg-[#0F172A]/90 backdrop-blur-3xl border-white/10 text-[#E2E8F0]'
          }`}
        >
          {/* HEADER */}
          <div className={`px-6 py-4 flex justify-between items-center border-b shrink-0 ${isLight ? 'bg-[#F8FAFB]/50 border-[#F0F2F5]' : 'bg-white/5 border-white/5'}`}>
            <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>New Referral Portal</span>
            <button onClick={resetAndClose} className={`p-1 rounded-md transition-all ${isLight ? 'hover:bg-[#F0F2F5] text-[#9A9FA5]' : 'hover:bg-white/10 text-[#64748B]'}`}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto md:overflow-hidden">
            {step === 'form' && (
              <form onSubmit={proceedToConfirm} className="flex flex-col md:flex-row h-full">
                
                {/* LEFT COLUMN: Customer Info */}
                <div className={`flex-1 p-6 lg:p-10 border-r space-y-6 ${isLight ? 'border-[#F0F2F5]' : 'border-white/5'}`}>
                  <div>
                    <h2 className="text-2xl lg:text-3xl font-black tracking-tight uppercase leading-none">Referral Details</h2>
                    <p className={`text-xs font-medium mt-2 ${isLight ? 'text-[#9A9FA5]' : 'text-[#94A3B8]'}`}>Personal and Contact Information</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Client Name</label>
                      <input type="text" name="client_name" required value={formData.client_name} onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl outline-none text-sm font-bold transition-all border ${
                          isLight ? 'bg-[#F8FAFB] border-[#F0F2F5] text-[#1A1D1F] focus:bg-white focus:border-[#61D9DE]' : 'bg-white/5 border-white/10 text-[#E2E8F0] focus:border-[#38BDF8]/50'
                        }`}
                        placeholder="Full Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Phone Number</label>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-grow">
                          <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]/60'}`} size={16} />
                          <input type="tel" name="client_phone" required value={formData.client_phone} onChange={handleInputChange}
                            className={`w-full pl-11 pr-5 py-3 rounded-xl outline-none text-sm font-bold transition-all border ${
                              isLight ? 'bg-[#F8FAFB] border-[#F0F2F5] text-[#1A1D1F] focus:bg-white focus:border-[#61D9DE]' : 'bg-white/5 border-white/10 text-[#E2E8F0] focus:border-[#38BDF8]/50'
                            }`}
                            placeholder="Mobile Number"
                          />
                        </div>
                        {Capacitor.isNativePlatform() && (
                          <button type="button" onClick={handleOpenContactList} className={`p-3 rounded-xl transition-all active:scale-95 flex-shrink-0 border ${
                            isLight ? 'bg-[#F8FAFB] border-[#F0F2F5] text-[#61D9DE] hover:bg-white' : 'bg-white/5 border-white/10 text-[#38BDF8] hover:bg-[#38BDF8]/10'
                          }`}>
                            <BookUser size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Service Location</label>
                      <div className="relative">
                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]/60'}`} size={16} />
                        <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleInputChange}
                          className={`w-full pl-11 pr-5 py-3 rounded-xl outline-none text-sm font-bold transition-all border ${
                            isLight ? 'bg-[#F8FAFB] border-[#F0F2F5] text-[#1A1D1F] focus:bg-white focus:border-[#61D9DE]' : 'bg-white/5 border-white/10 text-[#E2E8F0] focus:border-[#38BDF8]/50'
                          }`}
                          placeholder="City, Area"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Project Info */}
                <div className={`w-full md:w-[400px] lg:w-[450px] p-6 lg:p-10 flex flex-col justify-between transition-colors ${isLight ? 'bg-[#F8FAFB]' : 'bg-white/[0.02]'}`}>
                  <div className="space-y-6">
                    <div>
                      <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 mb-1 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]'}`}>
                        <ClipboardList size={14} /> Service Data
                      </h4>
                      <p className={`text-[10px] font-bold uppercase ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Configure project requirements</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Category</label>
                        <div className="relative">
                          <Building2 className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]/60'}`} size={16} />
                          <select name="category" required value={formData.category} onChange={handleInputChange}
                            className={`w-full pl-11 pr-10 py-3 rounded-xl outline-none text-xs font-bold appearance-none border ${
                              isLight ? 'bg-white border-[#F0F2F5] text-[#1A1D1F]' : 'bg-white/5 border-white/10 text-[#E2E8F0]'
                            }`}
                          >
                            <option value="" className={isLight ? '' : 'bg-[#0F172A]'}>Select Category</option>
                            {categories.map(cat => ( <option key={cat} value={cat} className={isLight ? '' : 'bg-[#0F172A]'}>{cat}</option> ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9A9FA5]" size={14} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Service</label>
                        <div className="relative">
                          <Briefcase className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]/60'}`} size={16} />
                          <select name="service" required value={formData.service} onChange={handleInputChange} disabled={!formData.category}
                            className={`w-full pl-11 pr-10 py-3 rounded-xl outline-none text-xs font-bold appearance-none disabled:opacity-30 border ${
                              isLight ? 'bg-white border-[#F0F2F5] text-[#1A1D1F]' : 'bg-white/5 border-white/10 text-[#E2E8F0]'
                            }`}
                          >
                            <option value="" className={isLight ? '' : 'bg-[#0F172A]'}>Select Service</option>
                            {servicesForCategory.map(svc => ( <option key={svc} value={svc} className={isLight ? '' : 'bg-[#0F172A]'}>{svc}</option> ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-1 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Additional Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                          className={`w-full p-4 rounded-xl outline-none text-xs font-bold min-h-[100px] lg:min-h-[140px] resize-none transition-all border ${
                            isLight ? 'bg-white border-[#F0F2F5] text-[#1A1D1F] focus:border-[#61D9DE]' : 'bg-white/5 border-white/10 text-[#E2E8F0] focus:border-[#38BDF8]/50'
                          }`}
                          placeholder="Project details..."
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={`mt-8 w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm ${
                    isLight ? 'bg-[#61D9DE] text-white hover:bg-[#49C5CB]' : 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 hover:bg-[#38BDF8]/20'
                  }`}>
                    Proceed to Review <ArrowRight size={16} strokeWidth={3} />
                  </button>
                </div>
              </form>
            )}

            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full p-10 text-center max-w-2xl mx-auto">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 border ${isLight ? 'bg-[#F8FAFB] border-[#F0F2F5] text-[#61D9DE]' : 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20'}`}>
                  <Info size={32} />
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase">Confirm Submission</h3>
                <div className={`w-full rounded-2xl my-8 text-left grid grid-cols-2 divide-x border transition-all ${
                  isLight ? 'bg-[#F8FAFB] border-[#F0F2F5] divide-[#F0F2F5]' : 'bg-white/[0.03] border-white/10 divide-white/5'
                }`}>
                  <div className="p-6">
                    <p className={`text-[9px] font-black uppercase mb-2 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Lead Info</p>
                    <p className="text-sm font-bold truncate">{formData.client_name}</p>
                    <p className={`text-[10px] font-bold ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]'}`}>{formData.client_phone}</p>
                  </div>
                  <div className="p-6">
                    <p className={`text-[9px] font-black uppercase mb-2 ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>Category</p>
                    <p className="text-xs font-bold truncate">{formData.category}</p>
                    <p className={`text-[10px] font-bold ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]'}`}>{formData.service}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={() => setStep('form')} className={`py-4 font-black uppercase text-[10px] rounded-xl border ${isLight ? 'bg-white text-[#9A9FA5] border-[#F0F2F5]' : 'bg-white/5 text-[#94A3B8] border-white/5'}`}>Back</button>
                  <button onClick={handleSubmitReferral} disabled={isSubmitting} className={`py-4 rounded-xl font-black text-[10px] shadow-sm transition-all ${
                    isLight ? 'bg-[#1A1D1F] text-white hover:bg-black' : 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30'
                  }`}>
                    {isSubmitting ? "Sending..." : "Confirm & Send"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full p-10 text-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-8 border shadow-sm ${isLight ? 'bg-[#F8FAFB] border-[#61D9DE]/20 text-[#61D9DE]' : 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20 shadow-[0_0_30px_rgba(74,222,128,0.2)]'}`}>
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black tracking-tight uppercase">Sent!</h3>
                <p className={`mt-4 font-medium max-w-xs ${isLight ? 'text-[#9A9FA5]' : 'text-[#94A3B8]'}`}>The referral for {formData.client_name} is now being processed.</p>
                <button onClick={resetAndClose} className={`mt-8 px-10 py-4 rounded-xl font-black text-[10px] uppercase border ${isLight ? 'bg-[#F0F2F5] border-[#F0F2F5] text-[#1A1D1F]' : 'bg-white/[0.05] border-white/10 text-[#E2E8F0]'}`}>Back to Dashboard</button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CONTACTS MODAL */}
        <AnimatePresence>
          {showContactsModal && (
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 ${isLight ? 'bg-[#1A1D1F]/40' : 'bg-[#020617]/90'}`}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} 
                className={`w-full max-w-md h-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden border transition-colors ${
                  isLight ? 'bg-white border-[#F0F2F5]' : 'bg-[#0F172A] border-white/10'
                }`}
              >
                <div className={`p-4 border-b flex flex-col gap-4 ${isLight ? 'bg-[#F8FAFB] border-[#F0F2F5]' : 'bg-white/5 border-white/5'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`font-black uppercase text-xs ${isLight ? 'text-[#1A1D1F]' : 'text-[#E2E8F0]'}`}>Select Contact</h3>
                    <button onClick={() => setShowContactsModal(false)} className="text-[#9A9FA5] hover:text-[#1A1D1F]"><X size={18} /></button>
                  </div>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]'}`} size={14} />
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2 rounded-xl outline-none text-sm border ${
                        isLight ? 'bg-white border-[#F0F2F5] text-[#1A1D1F]' : 'bg-white/5 border-white/10 text-white'
                      }`} />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {isLoadingContacts ? <div className="flex justify-center p-10"><Loader2 className={`animate-spin ${isLight ? 'text-[#61D9DE]' : 'text-[#38BDF8]'}`} /></div> :
                    filteredContacts.map((contact, i) => (
                      <button key={i} onClick={() => handleSelectContact(contact)} className={`w-full text-left p-4 rounded-xl flex justify-between items-center group transition-all ${isLight ? 'hover:bg-[#F8FAFB]' : 'hover:bg-white/5'}`}>
                        <div>
                          <p className={`font-bold text-sm transition-colors ${isLight ? 'text-[#1A1D1F] group-hover:text-[#61D9DE]' : 'text-white group-hover:text-[#38BDF8]'}`}>{contact.name?.display || "Unknown"}</p>
                          <p className={`text-[10px] ${isLight ? 'text-[#9A9FA5]' : 'text-[#64748B]'}`}>{contact.phones[0].number}</p>
                        </div>
                        <User size={14} className={`transition-colors ${isLight ? 'text-[#F0F2F5] group-hover:text-[#61D9DE]' : 'text-white/10 group-hover:text-[#38BDF8]'}`} />
                      </button>
                    ))
                  }
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default LeadFormModal;