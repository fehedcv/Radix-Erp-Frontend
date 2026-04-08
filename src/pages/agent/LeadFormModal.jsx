import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import { 
  X, User, Phone, Building2, 
  Send, Briefcase, ChevronDown, CheckCircle2, 
  MapPin, ClipboardList, ArrowRight, Info,
  BookUser, Search, Loader2 // Added new icons here
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';

// businessUnits shape (from AgentHub):
// { "Interior Design": ["exterior designing", "Interior designing"], "Plumbing": ["pipe fix"] }

const LeadFormModal = ({ isOpen, onClose, initialUnit, businessUnits = {}, onSubmit }) => {
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

  // --- NEW STATES FOR CONTACT MODAL ---
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  useEffect(() => {
    if (initialUnit) setFormData(prev => ({ ...prev, category: initialUnit, service: "" }));
  }, [initialUnit]);

  // Unique category names = Object.keys
  const categories = Object.keys(businessUnits);

  // Services for the currently selected category
  const servicesForCategory = formData.category ? (businessUnits[formData.category] || []) : [];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Reset service when category changes
    if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value, service: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // --- NEW LOGIC: FETCH AND OPEN CUSTOM CONTACTS LIST ---
  const handleOpenContactList = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      // 1. Request Permission
      const permission = await Contacts.requestPermissions();
      if (permission.contacts !== 'granted') {
        alert('Contact permission is required to view your contact list.');
        return;
      }

      // 2. Open Modal & Show Loader
      setShowContactsModal(true);
      setIsLoadingContacts(true);

      // 3. Fetch All Contacts
      const result = await Contacts.getContacts({
        projection: { name: true, phones: true }
      });

      // 4. Filter and Sort (Only keep contacts with phone numbers, sort alphabetically)
      const validContacts = result.contacts
        .filter(c => c.phones && c.phones.length > 0)
        .sort((a, b) => (a.name?.display || "").localeCompare(b.name?.display || ""));

      setAllContacts(validContacts);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      alert("Could not load contacts.");
      alert(`Error: ${error.message || JSON.stringify(error)}`);
      setShowContactsModal(false);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // --- NEW LOGIC: HANDLE CONTACT SELECTION ---
  const handleSelectContact = (contact) => {
    const pickedName = contact.name?.display || "";
    const pickedPhone = contact.phones[0].number; // Take the first available number
    const cleanPhone = pickedPhone.replace(/^\+91/, '').replace(/[\s-]/g, '').trim();
    
    setFormData(prev => ({
      ...prev,
      client_name: prev.client_name || pickedName, // Only override if name is currently empty
      client_phone: cleanPhone // Fill phone number
    }));

    // Close modal and reset search
    setShowContactsModal(false);
    setSearchQuery("");
  };

  // Filter contacts based on search query
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
      await frappeApi.post(
        '/method/business_chain.api.leads.submit_lead',
        {
          business_unit: formData.category,
          client_name: formData.client_name,
          client_phone: formData.client_phone,
          service: formData.service,
          notes: formData.notes,
          location: formData.clientAddress,
        }
      );
      setStep('success');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit referral');
      setStep('form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAndClose = () => {
    const wasSuccess = step === 'success';
    if (wasSuccess && onSubmit) onSubmit();
    setStep('form');
    setFormData({ category: "", service: "", client_name: "", client_phone: "", clientAddress: "", notes: "" });
    setShowContactsModal(false); // Ensure contact modal closes too
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={resetAndClose} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 font-['Plus_Jakarta_Sans',sans-serif]"
        >
          {/* HEADER */}
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

            {/* ── STEP: FORM ── */}
            {step === 'form' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="mb-10">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Referral Details</h2>
                  <p className="text-sm text-slate-500 font-medium mt-1">Please provide the customer information and specific project requirements.</p>
                </div>
                <form onSubmit={proceedToConfirm} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* LEFT — Customer Info */}
                  <div className="lg:col-span-7 space-y-8">
                    <h4 className="text-[10px] font-black text-[#007ACC] uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3">
                      <User size={14} /> 01. Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      {/* Business Category */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Business Category</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <select
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleInputChange}
                            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-[#007ACC] appearance-none transition-all"
                          >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Customer Name</label>
                        <input
                          type="text" name="client_name" required
                          value={formData.client_name} onChange={handleInputChange}
                          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC] transition-all"
                          placeholder="Enter Full Name"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Phone - UPDATED WITH CONTACT BUTTON */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Phone Number</label>
                        <div className="flex gap-2 items-center">
                          <div className="relative flex-grow">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                            <input
                              type="tel" name="client_phone" required
                              value={formData.client_phone} onChange={handleInputChange}
                              className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC]"
                              placeholder="98475 12028"
                            />
                          </div>
                          
                          {/* Contact Button */}
                          {Capacitor.isNativePlatform() && (
                            <button
                              type="button"
                              onClick={handleOpenContactList}
                              className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 hover:bg-[#007ACC] hover:text-white hover:border-[#007ACC] transition-all shadow-sm active:scale-95 flex-shrink-0"
                              title="Import from Contacts"
                            >
                              <BookUser size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Location */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Service Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <input
                            type="text" name="clientAddress"
                            value={formData.clientAddress} onChange={handleInputChange}
                            className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC]"
                            placeholder="City, Area"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT — Project Details */}
                  <div className="lg:col-span-5 flex flex-col">
                    <h4 className="text-[10px] font-black text-[#007ACC] uppercase tracking-widest flex items-center gap-2 border-b border-slate-50 pb-3 mb-8">
                      <ClipboardList size={14} /> 02. Project Details
                    </h4>
                    <div className="space-y-6 flex-grow flex flex-col">

                      {/* Required Service — driven by selected category */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Required Service</label>
                        <div className="relative">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                          <select
                            name="service"
                            required
                            value={formData.service}
                            onChange={handleInputChange}
                            disabled={!formData.category || servicesForCategory.length === 0}
                            className="w-full pl-11 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs font-bold focus:border-[#007ACC] appearance-none disabled:opacity-40 transition-all"
                          >
                            <option value="">
                              {!formData.category
                                ? "Select Category First"
                                : servicesForCategory.length === 0
                                  ? "No Services Available"
                                  : "Select Service"}
                            </option>
                            {servicesForCategory.map(svc => (
                              <option key={svc} value={svc}>{svc}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2 flex-grow">
                        <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Additional Requirements</label>
                        <textarea
                          name="notes" value={formData.notes} onChange={handleInputChange}
                          className="w-full p-5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold focus:border-[#007ACC] min-h-[140px] h-full resize-none transition-all"
                          placeholder="Enter any specific notes or instructions for the team..."
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-8 w-full py-4 bg-[#0F172A] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:bg-[#007ACC] transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                      Verify Referral <ArrowRight size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── STEP: CONFIRM ── */}
            {step === 'confirm' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6 max-w-xl mx-auto">
                <div className="w-16 h-16 bg-blue-50 text-[#007ACC] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Info size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Review Details</h3>
                <p className="text-sm text-slate-500 mt-2 font-medium">Please double-check the referral information before submitting.</p>
                <div className="bg-slate-50 border border-slate-200 rounded-2xl my-10 text-left overflow-hidden shadow-inner">
                  <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200">
                    <div className="p-5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Category</p>
                      <p className="text-xs font-bold text-slate-900 uppercase">{formData.category}</p>
                    </div>
                    <div className="p-5">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Service</p>
                      <p className="text-xs font-bold text-[#007ACC] uppercase">{formData.service}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Customer Profile</p>
                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{formData.client_name}</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">{formData.client_phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setStep('form')} className="py-4 bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-slate-200 transition-all">
                    Go Back
                  </button>
                  <button
                    onClick={handleSubmitReferral}
                    disabled={isSubmitting}
                    className="py-4 bg-[#007ACC] text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-[#0F172A] transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Referral"} <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === 'success' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-16 max-w-md mx-auto">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-xl shadow-emerald-50">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Referral Sent!</h3>
                <p className="text-slate-500 mt-4 leading-relaxed font-medium text-sm px-4">
                  The referral for <span className="text-slate-900 font-bold">{formData.client_name}</span> has been successfully sent to the business team for review.
                </p>
                <button onClick={resetAndClose} className="mt-10 px-12 py-4 bg-[#0F172A] text-white rounded-xl font-bold text-[10px] tracking-widest uppercase hover:bg-blue-600 transition-all shadow-xl">
                  Back to Dashboard
                </button>
              </motion.div>
            )}

          </div>
        </motion.div>

        {/* --- IN-APP CONTACTS MODAL OVERLAY --- */}
        <AnimatePresence>
          {showContactsModal && (
            <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40">
              <motion.div 
                initial={{ opacity: 0, y: "100%" }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="bg-white w-full max-w-md h-[80vh] md:h-[600px] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]"
              >
                {/* Contact Modal Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Select Contact</h3>
                    <button 
                      onClick={() => setShowContactsModal(false)}
                      className="p-2 bg-slate-200 text-slate-500 rounded-full hover:bg-slate-300 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search name or number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm focus:border-[#007ACC] transition-all"
                    />
                  </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto p-2">
                  {isLoadingContacts ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <Loader2 className="animate-spin mb-2" size={32} />
                      <p className="text-sm font-medium">Loading Contacts...</p>
                    </div>
                  ) : filteredContacts.length > 0 ? (
                    <ul className="space-y-1">
                      {filteredContacts.map((contact, index) => (
                        <li key={contact.contactId || index}>
                          <button
                            onClick={() => handleSelectContact(contact)}
                            className="w-full text-left p-4 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between border border-transparent hover:border-slate-100"
                          >
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{contact.name?.display || "Unknown"}</p>
                              <p className="text-xs font-medium text-slate-500 mt-0.5">
                                {contact.phones[0].number}
                              </p>
                            </div>
                            <User className="text-slate-300" size={18} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                      <p className="text-sm font-medium">No contacts found.</p>
                    </div>
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