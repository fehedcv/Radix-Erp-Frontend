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
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 overflow-hidden transition-colors duration-300 font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={resetAndClose} 
          className={`absolute inset-0 backdrop-blur-sm transition-colors ${
            isLight ? 'bg-[#1A202C]/40' : 'bg-[#000000]/60'
          }`} 
        />
        
        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.98, y: 20 }} 
          className={`w-full max-w-[900px] rounded-xl shadow-2xl relative flex flex-col h-auto max-h-[95vh] border transition-colors duration-300 overflow-hidden ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'
          }`}
        >
          {/* HEADER */}
          <div className={`px-6 py-4 flex justify-between items-center border-b shrink-0 ${
            isLight ? 'border-[#E2E8F0]' : 'border-white/5'
          }`}>
            <span className={`text-xs font-semibold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              New Referral Portal
            </span>
            <button onClick={resetAndClose} className={`p-1.5 rounded-md transition-all ${
              isLight ? 'hover:bg-[#F4F5F7] text-[#718096]' : 'hover:bg-[#222938] text-[#9CA3AF]'
            }`}>
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto md:overflow-hidden">
            {step === 'form' && (
              <form onSubmit={proceedToConfirm} className="flex flex-col md:flex-row h-full">
                
                {/* LEFT COLUMN: Customer Info */}
                <div className={`flex-1 p-6 lg:p-8 border-b md:border-b-0 md:border-r space-y-6 ${
                  isLight ? 'border-[#E2E8F0]' : 'border-white/5'
                }`}>
                  <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                      Referral Details
                    </h2>
                    <p className={`text-sm font-normal mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                      Personal and Contact Information
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Client Name</label>
                      <input type="text" name="client_name" required value={formData.client_name} onChange={handleInputChange}
                        className={`w-full px-4 py-2.5 rounded-md text-sm transition-all border outline-none ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:bg-[#1A202C] focus:border-[#81B398]'
                        }`}
                        placeholder="Full Name"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Phone Number</label>
                      <div className="flex gap-2 items-center">
                        <div className="relative flex-grow">
                          <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                          <input type="tel" name="client_phone" required value={formData.client_phone} onChange={handleInputChange}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-md text-sm transition-all border outline-none ${
                              isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:bg-[#1A202C] focus:border-[#81B398]'
                            }`}
                            placeholder="Mobile Number"
                          />
                        </div>
                        {Capacitor.isNativePlatform() && (
                          <button type="button" onClick={handleOpenContactList} className={`p-2.5 rounded-md transition-all active:scale-95 flex-shrink-0 border ${
                            isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#81B398] hover:bg-[#E2E8F0]' : 'bg-[#222938] border-transparent text-[#81B398] hover:bg-[#1A202C]'
                          }`}>
                            <BookUser size={18} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Service Location</label>
                      <div className="relative">
                        <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                        <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-2.5 rounded-md text-sm transition-all border outline-none ${
                            isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:bg-[#1A202C] focus:border-[#81B398]'
                          }`}
                          placeholder="City, Area"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: Project Info */}
                <div className={`w-full md:w-[360px] lg:w-[400px] p-6 lg:p-8 flex flex-col justify-between transition-colors ${
                  isLight ? 'bg-[#F4F5F7]/50' : 'bg-[#1A202C]/30'
                }`}>
                  <div className="space-y-5">
                    <div>
                      <h4 className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-2 mb-1 text-[#81B398]`}>
                        <ClipboardList size={14} /> Service Data
                      </h4>
                      <p className={`text-sm font-normal ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Configure project requirements</p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Category</label>
                        <div className="relative">
                          <Building2 className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                          <select name="category" required value={formData.category} onChange={handleInputChange}
                            className={`w-full pl-10 pr-10 py-2.5 rounded-md text-sm appearance-none border outline-none transition-colors ${
                              isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:border-[#81B398]'
                            }`}
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => ( <option key={cat} value={cat}>{cat}</option> ))}
                          </select>
                          <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Service</label>
                        <div className="relative">
                          <Briefcase className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                          <select name="service" required value={formData.service} onChange={handleInputChange} disabled={!formData.category}
                            className={`w-full pl-10 pr-10 py-2.5 rounded-md text-sm appearance-none disabled:opacity-50 border outline-none transition-colors ${
                              isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:border-[#81B398]'
                            }`}
                          >
                            <option value="">Select Service</option>
                            {servicesForCategory.map(svc => ( <option key={svc} value={svc}>{svc}</option> ))}
                          </select>
                          <ChevronDown className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={`text-xs font-medium ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Additional Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                          className={`w-full p-3.5 rounded-md text-sm min-h-[100px] resize-none border outline-none transition-colors ${
                            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:border-[#81B398]'
                          }`}
                          placeholder="Project details..."
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="mt-8 w-full py-3 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-sm bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] active:scale-95">
                    Proceed to Review <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            )}

            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full p-8 lg:p-12 text-center max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-lg flex items-center justify-center mb-6 bg-[#81B398]/10 text-[#81B398]">
                  <Info size={28} />
                </div>
                <h3 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Confirm Submission</h3>
                
                <div className={`w-full rounded-lg my-8 text-left grid grid-cols-2 divide-x border ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] divide-[#E2E8F0]' : 'bg-[#222938] border-white/5 divide-white/5'
                }`}>
                  <div className="p-5">
                    <p className={`text-xs font-medium mb-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Lead Info</p>
                    <p className={`text-sm font-semibold truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{formData.client_name}</p>
                    <p className="text-sm font-normal text-[#81B398] mt-0.5">{formData.client_phone}</p>
                  </div>
                  <div className="p-5">
                    <p className={`text-xs font-medium mb-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Category</p>
                    <p className={`text-sm font-semibold truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{formData.category}</p>
                    <p className="text-sm font-normal text-[#81B398] mt-0.5">{formData.service}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  <button onClick={() => setStep('form')} className={`py-3 rounded-md font-medium text-sm transition-colors ${
                    isLight ? 'bg-[#F4F5F7] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#222938] text-[#F4F5F7] hover:bg-[#1A202C]'
                  }`}>
                    Back
                  </button>
                  <button onClick={handleSubmitReferral} disabled={isSubmitting} className="py-3 rounded-md font-medium text-sm transition-all shadow-sm bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] disabled:opacity-50">
                    {isSubmitting ? "Sending..." : "Confirm & Send"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full p-8 lg:p-12 text-center max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-[#81B398]/10 text-[#81B398]">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Sent!</h3>
                <p className={`mt-3 text-sm font-normal ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  The referral for <span className="font-semibold text-[#81B398]">{formData.client_name}</span> is now being processed.
                </p>
                <button onClick={resetAndClose} className={`mt-8 px-8 py-3 rounded-md font-medium text-sm transition-colors ${
                  isLight ? 'bg-[#F4F5F7] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#222938] text-[#F4F5F7] hover:bg-[#1A202C]'
                }`}>
                  Back to Dashboard
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CONTACTS MODAL */}
        <AnimatePresence>
          {showContactsModal && (
            <div className={`fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-sm ${
              isLight ? 'bg-[#1A202C]/40' : 'bg-[#000000]/60'
            }`}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} 
                className={`w-full max-w-md h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden border transition-colors ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'
                }`}
              >
                <div className={`p-4 border-b flex flex-col gap-4 shrink-0 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`font-semibold text-sm ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Select Contact</h3>
                    <button onClick={() => setShowContactsModal(false)} className={`p-1.5 rounded-md transition-all ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-[#222938]'}`}>
                      <X size={18} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                    <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-9 pr-4 py-2.5 rounded-md outline-none text-sm border transition-colors ${
                        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:border-[#81B398]'
                      }`} 
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2">
                  {isLoadingContacts ? (
                    <div className="flex justify-center p-10">
                      <Loader2 className="animate-spin text-[#81B398]" />
                    </div>
                  ) : filteredContacts.length === 0 ? (
                    <div className={`text-center p-10 text-sm ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No contacts found.</div>
                  ) : (
                    filteredContacts.map((contact, i) => (
                      <button key={i} onClick={() => handleSelectContact(contact)} className={`w-full text-left p-3.5 rounded-md flex justify-between items-center group transition-all ${
                        isLight ? 'hover:bg-[#F4F5F7]' : 'hover:bg-[#222938]'
                      }`}>
                        <div>
                          <p className={`font-medium text-sm transition-colors ${
                            isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'
                          }`}>{contact.name?.display || "Unknown"}</p>
                          <p className={`text-xs mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{contact.phones[0].number}</p>
                        </div>
                        <User size={16} className={isLight ? 'text-[#E2E8F0] group-hover:text-[#81B398]' : 'text-[#48477A] group-hover:text-[#81B398]'} />
                      </button>
                    ))
                  )}
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