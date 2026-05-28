import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import { 
  X, User, Phone, Building2, 
  Briefcase, ChevronDown, CheckCircle2, 
  MapPin, ClipboardList, ArrowRight, Info,
  BookUser, Search, Loader2, 
  Contact,
  Contact2,
  Contact2Icon,
  ContactRound,
  Users
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';

const LeadFormAppModal = ({ isOpen, onClose, initialUnit, onSubmit, theme }) => {
  const [step, setStep] = useState('form'); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  
  const [businessUnits, setBusinessUnits] = useState([]);
  const [services, setServices] = useState([]);

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

  // Fetch business units on modal open
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchBusinessUnits = async () => {
      setIsLoadingUnits(true);
      try {
        const { data, error } = await supabase
          .from('business_units')
          .select('id, business_name, category')
          .eq('status', 'active')
          .order('business_name');
        
        if (error) throw error;
        setBusinessUnits(data || []);
        
        if (initialUnit) {
          setFormData(prev => ({ ...prev, category: initialUnit, service: "" }));
        }
      } catch (error) {
        console.error('Error fetching business units:', error.message);
        alert('Failed to load business units');
      } finally {
        setIsLoadingUnits(false);
      }
    };

    fetchBusinessUnits();
  }, [isOpen, initialUnit]);

  // Fetch services when category changes
  useEffect(() => {
    if (!formData.category) {
      setServices([]);
      return;
    }

    const fetchServices = async () => {
      setIsLoadingServices(true);
      try {
        const { data, error } = await supabase
          .from('business_unit_services')
          .select('id, service_name')
          .eq('business_unit_id', formData.category)
          .order('service_name');
        
        if (error) throw error;
        setServices(data || []);
        setFormData(prev => ({ ...prev, service: "" }));
      } catch (error) {
        console.error('Error fetching services:', error.message);
        alert('Failed to load services');
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, [formData.category]);
  
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
      
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        alert('User not authenticated');
        setStep('form');
        return;
      }

      const { error } = await supabase
        .from('leads')
        .insert({
          business_unit_id: formData.category,
          source_user_id: user.id,
          service_id: formData.service,
          customer_name: formData.client_name,
          phone: formData.client_phone,
          description: formData.notes,
          location: formData.clientAddress,
          status: 'pending',
          verified_by_admin: false,
          total_sale_amount: 0,
          approved_credits: 0,
          payment_status: 'pending',
          credit_status: 'waiting'
        });

      if (error) throw error;

      setStep('success');
    } catch (err) {
      console.error('Error submitting lead:', err.message);
      alert(`Failed to submit referral: ${err.message}`);
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
      {/* OUTER WRAPPER - Centered Modal Layout */}
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        
        {/* Backdrop (Dark blur per design system) */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={resetAndClose} 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        />
        
        {/* MAIN MODAL BENTO CONTAINER */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className={`w-full max-w-lg max-h-[90vh] rounded-3xl relative flex flex-col overflow-hidden border shadow-sm ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}
        >
          {/* FIXED HEADER */}
          <div className={`shrink-0 px-6 py-5 flex justify-between items-center border-b ${
            isLight ? 'border-[#E2E8F0]' : 'border-white/10'
          }`}>
            <div>
              <h2 className={`text-xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                {step === 'form' ? 'New Referral' : step === 'confirm' ? 'Confirm Details' : 'Success'}
              </h2>
              <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Agent Portal
              </p>
            </div>
            
            {/* Flat Neutral Close Button */}
            <button 
              onClick={resetAndClose} 
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border ${
                isLight 
                  ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' 
                  : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'
              }`}
            >
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-6">
            {step === 'form' && (
              <form id="referral-form" onSubmit={proceedToConfirm} className="space-y-6">
                
                {/* Section 1: Client Info (Nested Bento Card) */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                }`}>
                   {/* 10/100/20 Badge Header */}
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20">
                     <User size={14} /> 
                     <span className="text-[11px] font-bold uppercase tracking-wider">Client Info</span>
                   </div>
                   
                   <div className="space-y-3">
                     <input type="text" name="client_name" required value={formData.client_name} onChange={handleInputChange}
                        placeholder="Full Name"
                        className={`w-full px-4 py-3.5 rounded-xl outline-none text-sm font-medium border transition-all ${
                          isLight 
                            ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                            : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                        }`}
                      />

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                           <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                           <input type="tel" name="client_phone" required value={formData.client_phone} onChange={handleInputChange}
                            placeholder="Phone Number"
                            className={`w-full pl-11 pr-4 py-3.5 rounded-xl outline-none text-sm font-medium border transition-all ${
                              isLight 
                                ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                                : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                            }`}
                          />
                        </div>
                        {Capacitor.isNativePlatform() && (
                          <button type="button" onClick={handleOpenContactList} className={`w-12 shrink-0 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border ${
                            isLight 
                              ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398]' 
                              : 'bg-[#131720] border-white/10 text-[#F4F5F7] hover:border-[#81B398]'
                          }`}>
                            <Users size={18} />
                          </button>
                        )}
                      </div>

                      <div className="relative">
                         <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                         <input type="text" name="clientAddress" value={formData.clientAddress} onChange={handleInputChange}
                          placeholder="Service Location (City, Area)"
                          className={`w-full pl-11 pr-4 py-3.5 rounded-xl outline-none text-sm font-medium border transition-all ${
                            isLight 
                              ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                              : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                          }`}
                        />
                      </div>
                   </div>
                </div>

                {/* Section 2: Service Info (Nested Bento Card) */}
                <div className={`p-5 rounded-2xl border space-y-4 ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                }`}>
                   {/* 10/100/20 Badge Header */}
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20">
                     <ClipboardList size={14} /> 
                     <span className="text-[11px] font-bold uppercase tracking-wider">Requirements</span>
                   </div>

                   <div className="space-y-3">
                      <div className="relative">
                        <select name="category" required value={formData.category} onChange={handleInputChange} disabled={isLoadingUnits}
                          className={`w-full px-4 py-3.5 rounded-xl outline-none text-sm font-medium appearance-none border transition-all disabled:opacity-50 ${
                            isLight 
                              ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                              : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                          }`}
                        >
                          <option value="">{isLoadingUnits ? 'Loading...' : 'Select Category'}</option>
                          {businessUnits.map(unit => ( 
                            <option key={unit.id} value={unit.id}>{unit.category}</option> 
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
                      </div>

                      <div className="relative">
                        <select name="service" required value={formData.service} onChange={handleInputChange} disabled={!formData.category || isLoadingServices}
                          className={`w-full px-4 py-3.5 rounded-xl outline-none text-sm font-medium appearance-none border transition-all disabled:opacity-50 ${
                            isLight 
                              ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                              : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                          }`}
                        >
                          <option value="">{isLoadingServices ? 'Loading...' : 'Select Service'}</option>
                          {services.map(svc => ( 
                            <option key={svc.id} value={svc.id}>{svc.service_name}</option> 
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
                      </div>

                      <textarea name="notes" value={formData.notes} onChange={handleInputChange}
                        placeholder="Additional Details or Remarks..."
                        className={`w-full p-4 rounded-xl outline-none text-sm font-medium min-h-[100px] resize-none border transition-all ${
                          isLight 
                            ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                            : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                        }`}
                      />
                   </div>
                </div>
              </form>
            )}

            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col space-y-6">
                
                {/* Warning/Review Badge using Sand/Mustard */}
                <div className="flex flex-col items-center justify-center text-center py-4">
                   <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20">
                      <Info size={32} />
                   </div>
                   <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Review Referral</h3>
                   <p className={`text-sm font-medium mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Please verify the details below</p>
                </div>

                <div className={`rounded-2xl border overflow-hidden ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                   <div className={`p-5 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Customer</p>
                      <p className="text-base font-bold">{formData.client_name}</p>
                      <p className="text-sm font-medium text-[#81B398]">{formData.client_phone}</p>
                   </div>
                   <div className="p-5">
                      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Service Request</p>
                      <p className="text-sm font-semibold">{businessUnits.find(u => u.id === formData.category)?.category || ''}</p>
                      <p className="text-sm font-medium text-[#81B398]">{services.find(s => s.id === formData.service)?.service_name || ''}</p>
                   </div>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-10 text-center">
                {/* Success Badge using Sage Green */}
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className={`text-2xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Sent Successfully!</h3>
                <p className={`mt-3 text-sm font-medium leading-relaxed max-w-xs ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                   Referral for <span className="text-[#81B398] font-bold">{formData.client_name}</span> has been processed.
                </p>
              </motion.div>
            )}
          </div>

          {/* FIXED STICKY FOOTER */}
          <div className={`shrink-0 px-6 py-4 border-t ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            {step === 'form' && (
              <button 
                type="submit" 
                form="referral-form" 
                className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 bg-[#81B398] text-white hover:bg-[#6FA085]"
              >
                Review Submission <ArrowRight size={18} />
              </button>
            )}

            {step === 'confirm' && (
              <div className="flex gap-3">
                 <button 
                  onClick={() => setStep('form')} 
                  className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 border ${
                    isLight 
                      ? 'bg-[#F4F5F7] text-[#1A202C] border-transparent hover:border-[#E2E8F0]' 
                      : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:border-white/10'
                  }`}
                 >
                   Back
                 </button>
                 <button 
                  onClick={handleSubmitReferral} 
                  disabled={isSubmitting} 
                  className="flex-[2] py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 flex items-center justify-center bg-[#81B398] text-white hover:bg-[#6FA085] disabled:opacity-50"
                 >
                   {isSubmitting ? "Processing..." : "Confirm & Send"}
                 </button>
              </div>
            )}

            {step === 'success' && (
              <button 
                onClick={resetAndClose} 
                className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 border ${
                  isLight 
                    ? 'bg-[#F4F5F7] text-[#1A202C] border-transparent hover:border-[#E2E8F0]' 
                    : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:border-white/10'
                }`}
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </motion.div>

        {/* CONTACTS SELECTION OVERLAY (Nested Bento Modal) */}
        <AnimatePresence>
          {showContactsModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
            >
              <div className={`w-full max-w-md h-[80vh] flex flex-col rounded-3xl overflow-hidden border shadow-sm ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}>
                {/* Contacts Header */}
                <div className={`shrink-0 p-5 border-b space-y-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg tracking-tight">Select Contact</h3>
                    <button 
                      onClick={() => setShowContactsModal(false)} 
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 border ${
                        isLight 
                          ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' 
                          : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'
                      }`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                    <input type="text" placeholder="Search by name or number..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3 rounded-xl outline-none text-sm font-medium border transition-all ${
                        isLight 
                          ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                          : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                      }`} 
                    />
                  </div>
                </div>
                
                {/* Contacts Body */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-4 space-y-2">
                  {isLoadingContacts ? (
                    <div className="flex flex-col items-center justify-center pt-20 gap-4">
                      <Loader2 className="animate-spin text-[#81B398]" size={32} />
                      <p className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                        Fetching Contacts...
                      </p>
                    </div>
                  ) : (
                    filteredContacts.map((contact, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleSelectContact(contact)} 
                        className={`w-full min-w-0 text-left p-4 rounded-2xl flex justify-between items-center transition-all duration-200 active:scale-95 border ${
                          isLight 
                            ? 'bg-[#F4F5F7] border-transparent hover:border-[#81B398]' 
                            : 'bg-[#131720] border-white/10 hover:border-[#81B398]'
                        }`}
                      >
                        <div className='min-w-0 flex-1'>
                          <p className="font-bold text-sm truncate">{contact.name?.display || "Unknown"}</p>
                          <p className={`text-xs font-medium mt-0.5 truncate ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                            {contact.phones[0].number}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                        }`}>
                          <User size={16} className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'} />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

export default LeadFormAppModal;