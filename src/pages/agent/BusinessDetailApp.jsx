import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import {
  MapPin, Star, Phone, Globe,
  CheckCircle2, Briefcase, ExternalLink,
  Info, Mail, Zap, ChevronRight, MessageCircle,
  Loader2, X, User, ChevronDown, Image as ImageIcon,
  Instagram, Facebook, Linkedin,
  BookUser, Search, ChevronLeft,
  Plus
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; 

const BusinessDetailApp = () => {
  // ==========================================
  // EXACT SAME LOGIC & STATE
  // ==========================================
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme(); 

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    service: '',
    customer_location: '',
    notes: ''
  });

  const [showContactsModal, setShowContactsModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getFrappeImage = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    const baseUrl = import.meta.env.VITE_FRAPPE_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanPath}`;
  };

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const res = await frappeApi.get(
          '/method/business_chain.api.api.get_business_unit',
          { params: { business_unit: id } }
        );
        const data = res.data.message;

        setUnit({
          id: data.id,
          name: data.name,
          website: data.website || '',
          email: data.email || '',
          contact: data.contact || '',
          location: data.location || '',
          address: data.address || "",
          description: data.description || '',
          logo: data.logo || '',
          facebook: data.facebook || '',
          instagram: data.instagram || '',
          linkedin: data.linkedin || '',
          services: (data.services || []).map(s => ({
            name: s.name,
            description: s.description || ""
          })),
          gallery: (data.gallery || []).map(img => getFrappeImage(img))
        });

        if (data.services && data.services.length > 0) {
          setFormData(prev => ({ ...prev, service: data.services[0].name }));
        }
      } catch (err) {
        console.error("Failed to fetch unit:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUnit();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitReferral = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      await frappeApi.post(
        '/method/business_chain.api.leads.submit_lead',
        {
          business_unit: unit.id,
          ...formData,
          location: formData.customer_location
        }
      );

      setShowModal(false);
      setFormData(prev => ({ ...prev, client_name: '', client_phone: '', customer_location: '', notes: '' }));
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit referral');
    } finally {
      setSubmitting(false);
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
    const rawPhone = contact.phones[0].number; 
    const cleanPhone = rawPhone.replace(/^\+91/, '').replace(/[\s-]/g, '').trim();
    setFormData(prev => ({ ...prev, client_name: prev.client_name || pickedName, client_phone: cleanPhone }));
    setShowContactsModal(false);
    setSearchQuery("");
  };

  const filteredContacts = allContacts.filter(contact => {
    const nameMatch = contact.name?.display?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = contact.phones?.[0]?.number?.includes(searchQuery);
    return nameMatch || phoneMatch;
  });

  // ==========================================
  // REFINED NATIVE UI 
  // ==========================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-[80vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader2 className={`animate-spin mb-4 ${theme === 'light' ? 'text-black' : 'text-white'}`} size={32} />
        <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] flex flex-col transition-colors duration-300 ${
      theme === 'light' ? 'bg-[#F4F5F9] text-black' : 'bg-[#09090B] text-white'
    }`}>
      
      {/* NATIVE APP BAR */}
      <header className="flex items-center gap-3 px-4  pb-4 z-50 sticky top-0 bg-transparent shrink-0 backdrop-blur-md">
        <button 
          onClick={() => navigate('/agent/units')}
          className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-transform ${
            theme === 'light' ? 'bg-white text-black' : 'bg-white/10 text-white'
          }`}
        >
          <ChevronLeft size={20} strokeWidth={3} />
        </button>
        <h1 className="text-sm mb-2 font-extrabold tracking-tight uppercase truncate flex-1">
          {unit.name}
        </h1>
      </header>

      {/* MATCHED PADDING WRAPPER (px-4) */}
      <main className="flex-1 w-full overflow-y-auto no-scrollbar px-0 space-y-5 pb-32">
        
        {/* Hero Bento Card */}
        <div className={`rounded-[2rem] p-5 relative overflow-hidden shadow-sm ${
          theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
        }`}>
          <div className="flex items-center gap-4 mb-5">
            {unit.logo ? (
              <img
                src={getFrappeImage(unit.logo)}
                alt="logo"
                className={`h-16 w-16 rounded-[1.25rem] object-cover shrink-0 shadow-sm ${
                  theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'
                }`}
              />
            ) : (
              <div className={`h-16 w-16 flex items-center justify-center rounded-[1.25rem] shrink-0 ${
                theme === 'light' ? 'bg-[#F4F5F9] text-gray-400' : 'bg-white/5 text-gray-500'
              }`}>
                <Briefcase size={24} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-extrabold tracking-tight uppercase truncate">{unit.name}</h2>
              <p className={`text-[10px] font-bold mt-1 uppercase tracking-widest flex items-center gap-1 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-400'
              }`}>
                <MapPin size={12} className="text-[#38BDF8]" /> {unit.location}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-6">
             <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1 ${
                theme === 'light' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#4ADE80]/10 text-[#4ADE80]'
             }`}>
                <CheckCircle2 size={12} /> Verified
             </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className={`w-full py-4 rounded-[1.25rem] font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md ${
              theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            <Plus size={16} /> Submit Lead
          </button>
        </div>

        {/* Gallery Bento */}
        <div className={`rounded-[2rem] p-5 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 px-1">Gallery</h4>
          {unit.gallery?.length > 0 ? (
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-1 px-1">
              {unit.gallery.map((img, i) => (
                <img key={i} src={img} alt="gallery" className="h-32 w-32 rounded-2xl object-cover shrink-0 shadow-sm" />
              ))}
            </div>
          ) : (
            <div className={`h-24 rounded-2xl flex flex-col items-center justify-center ${theme === 'light' ? 'bg-[#F4F5F9] text-gray-400' : 'bg-white/5 text-gray-500'}`}>
              <ImageIcon size={24} className="mb-2 opacity-50" />
              <span className="text-[9px] font-black uppercase tracking-widest">No Imagery</span>
            </div>
          )}
        </div>

        {/* About Bento */}
        <div className={`rounded-[2rem] p-5 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <Info size={14} className="text-[#38BDF8]" /> About
          </h4>
          <p className={`text-xs leading-relaxed font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            {unit.description || "No specific description provided."}
          </p>
        </div>

        {/* Services Bento */}
        <div className={`rounded-[2rem] p-5 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-1.5">
            <Star size={14} className="text-[#38BDF8]" /> Services
          </h4>
          <div className="space-y-3">
            {unit.services?.length > 0 ? unit.services.map((s, i) => (
              <div key={i} className={`p-4 rounded-[1.25rem] ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}>
                <p className="font-extrabold text-sm uppercase tracking-tight">{s.name}</p>
                {s.description && <p className={`text-[10px] mt-1.5 font-medium leading-relaxed ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>{s.description}</p>}
              </div>
            )) : <p className="text-[10px] italic font-bold uppercase tracking-widest opacity-50">No services listed.</p>}
          </div>
        </div>

        {/* Contact Bento */}
        <div className={`rounded-[2rem] p-5 shadow-sm ${theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'}`}>
          <h4 className="text-[10px] font-black uppercase tracking-widest mb-4">Contact Info</h4>
          <div className="space-y-4">
            {unit.website && (
              <div className="flex items-center gap-3">
                <Globe size={18} className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
                <div className="flex-1 min-w-0">
                  <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Website</p>
                  <a href={unit.website} target="_blank" rel="noreferrer" className="text-xs font-extrabold truncate block text-[#38BDF8]">{unit.website}</a>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <Mail size={18} className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
              <div className="flex-1 min-w-0">
                <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                <p className="text-xs font-extrabold truncate">{unit.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone size={18} className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
              <div className="flex-1 min-w-0">
                <p className={`text-[8px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                <p className="text-xs font-extrabold">{unit.contact || 'N/A'}</p>
              </div>
            </div>

            {unit.contact && (
              <div className="flex gap-3 pt-3">
                <a href={`tel:${unit.contact}`} className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  theme === 'light' ? 'bg-[#F4F5F9] text-black' : 'bg-white/10 text-white'
                }`}>
                  <Phone size={14} /> Call
                </a>
                <a href={`https://wa.me/${unit.contact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                  theme === 'light' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#4ADE80]/20 text-[#4ADE80]'
                }`}>
                  <MessageCircle size={14} /> Chat
                </a>
              </div>
            )}
          </div>

          {(unit.facebook || unit.instagram || unit.linkedin) && (
            <div className={`mt-5 pt-5 border-t flex justify-center gap-4 ${theme === 'light' ? 'border-gray-100' : 'border-white/5'}`}>
              {unit.instagram && <a href={unit.instagram} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center text-pink-500 shadow-sm active:scale-90 transition-transform ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}><Instagram size={18} /></a>}
              {unit.facebook && <a href={unit.facebook} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center text-[#38BDF8] shadow-sm active:scale-90 transition-transform ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}><Facebook size={18} /></a>}
              {unit.linkedin && <a href={unit.linkedin} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full flex items-center justify-center text-blue-400 shadow-sm active:scale-90 transition-transform ${theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'}`}><Linkedin size={18} /></a>}
            </div>
          )}
        </div>
      </main>

      {/* =========================================
          NATIVE STICKY FOOTER BOTTOM SHEETS
          ========================================= */}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex flex-col justify-end">
            <div className="flex-1" onClick={() => setShowModal(false)} /> 
            
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`w-full rounded-t-[2rem] flex flex-col max-h-[85vh] shadow-2xl ${
                theme === 'light' ? 'bg-white' : 'bg-[#18181B] border-t border-white/10'
              }`}
            >
              {/* Drag Handle & Header with Close Button */}
              <div className="shrink-0 px-4 pt-3 pb-2 relative">
                <div className={`w-10 h-1.5 rounded-full mx-auto mb-4 ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'}`} />
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight uppercase text-left">New Lead</h3>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 text-left ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>For {unit.name}</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>

              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 space-y-5">
                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Client Name *</label>
                  <div className="relative">
                    <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input required name="client_name" value={formData.client_name} onChange={handleInputChange} 
                      className={`w-full pl-11 pr-4 py-4 rounded-[1.25rem] text-sm font-bold outline-none transition-all shadow-inner ${
                        theme === 'light' ? 'bg-[#F4F5F9] focus:ring-2 focus:ring-black' : 'bg-[#09090B] text-white focus:ring-2 focus:ring-white'
                      }`} placeholder="Enter client name" />
                  </div>
                </div>

                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Client Phone *</label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-grow">
                      <Phone size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <input required type="tel" name="client_phone" value={formData.client_phone} onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-4 rounded-[1.25rem] text-sm font-bold outline-none transition-all shadow-inner ${
                          theme === 'light' ? 'bg-[#F4F5F9] focus:ring-2 focus:ring-black' : 'bg-[#09090B] text-white focus:ring-2 focus:ring-white'
                        }`} placeholder="98765 43210" />
                    </div>
                    {Capacitor.isNativePlatform() && (
                      <button type="button" onClick={handleOpenContactList} className={`p-4 rounded-[1.25rem] shrink-0 active:scale-95 transition-transform ${
                        theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                      }`}>
                        <BookUser size={18} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Location</label>
                  <div className="relative">
                    <MapPin size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                    <input name="customer_location" value={formData.customer_location} onChange={handleInputChange}
                      className={`w-full pl-11 pr-4 py-4 rounded-[1.25rem] text-sm font-bold outline-none transition-all shadow-inner ${
                        theme === 'light' ? 'bg-[#F4F5F9] focus:ring-2 focus:ring-black' : 'bg-[#09090B] text-white focus:ring-2 focus:ring-white'
                      }`} placeholder="City/Area" />
                  </div>
                </div>

                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Service *</label>
                  <div className="relative">
                    <select required name="service" value={formData.service} onChange={handleInputChange}
                      className={`w-full pl-4 pr-11 py-4 rounded-[1.25rem] text-sm font-bold outline-none transition-all appearance-none shadow-inner ${
                        theme === 'light' ? 'bg-[#F4F5F9] focus:ring-2 focus:ring-black' : 'bg-[#09090B] text-white focus:ring-2 focus:ring-white'
                      }`}>
                      <option value="" disabled>Select a service</option>
                      {unit.services?.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                    </select>
                    <ChevronDown size={16} className={`absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                </div>

                <div>
                  <label className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3}
                    className={`w-full px-4 py-4 rounded-[1.25rem] text-sm font-bold outline-none transition-all resize-none shadow-inner ${
                      theme === 'light' ? 'bg-[#F4F5F9] focus:ring-2 focus:ring-black' : 'bg-[#09090B] text-white focus:ring-2 focus:ring-white'
                    }`} placeholder="Any special requirements..." />
                </div>
              </div>

              {/* SAFE AREA FOOTER - Button is pinned above bottom nav */}
              <div className={`shrink-0 px-4 pt-4 pb-28 border-t ${
                theme === 'light' ? 'border-gray-100 bg-white' : 'border-white/5 bg-[#18181B]'
              }`}>
                <button 
                  onClick={handleSubmitReferral} 
                  disabled={submitting} 
                  className={`w-full py-5 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                    theme === 'light' ? 'bg-[#38BDF8] text-white shadow-lg' : 'bg-[#38BDF8] text-black shadow-lg'
                  }`}
                >
                  {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Submission <ChevronRight size={16} /></>}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Contacts Picker Bottom Sheet */}
      <AnimatePresence>
        {showContactsModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex flex-col justify-end">
            <div className="flex-1" onClick={() => setShowContactsModal(false)} />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`w-full rounded-t-[2rem] flex flex-col max-h-[85vh] shadow-2xl ${
                theme === 'light' ? 'bg-white' : 'bg-[#18181B] border-t border-white/10'
              }`}
            >
              <div className="shrink-0 px-4 pt-4 pb-2 flex flex-col gap-4 border-b border-transparent">
                <div className="w-10 h-1.5 rounded-full mx-auto mb-2 bg-gray-300 dark:bg-gray-600" />
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-extrabold tracking-tight uppercase">Phonebook</h3>
                  <button onClick={() => setShowContactsModal(false)} className={`w-8 h-8 rounded-full flex items-center justify-center ${theme === 'light' ? 'bg-gray-100' : 'bg-white/10'}`}>
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
                <div className="relative">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                  <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-[1rem] text-sm font-bold outline-none shadow-inner ${
                      theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-[#09090B] text-white'
                    }`} />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto px-2 no-scrollbar pb-28">
                {isLoadingContacts ? (
                   <div className="flex flex-col items-center justify-center h-full gap-3 pt-10">
                     <Loader2 className="animate-spin text-[#38BDF8]" size={24} />
                   </div>
                ) : filteredContacts.length > 0 ? (
                  <ul className="space-y-1 px-2 mt-2">
                    {filteredContacts.map((contact, index) => (
                      <li key={index}>
                        <button onClick={() => handleSelectContact(contact)} className={`w-full text-left p-4 rounded-[1rem] flex items-center justify-between active:scale-[0.98] transition-transform ${
                          theme === 'light' ? 'hover:bg-[#F4F5F9]' : 'hover:bg-white/5'
                        }`}>
                          <div>
                            <p className="font-extrabold text-sm">{contact.name?.display || "Unknown"}</p>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                              {contact.phones[0].number}
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex items-center justify-center h-full pt-10">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-600'}`}>No contacts found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-xs rounded-[2rem] p-8 text-center shadow-2xl ${
                theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
              }`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                theme === 'light' ? 'bg-[#4ADE80]/10' : 'bg-[#4ADE80]/10'
              }`}>
                <CheckCircle2 size={40} className="text-[#4ADE80]" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Success!</h3>
              <p className={`text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-8 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                Lead for <span className={theme === 'light' ? 'text-black' : 'text-white'}>{unit.name}</span> has been submitted.
              </p>
              <button 
                onClick={() => setShowSuccessModal(false)} 
                className={`w-full py-4 rounded-[1.25rem] text-[11px] font-black uppercase tracking-widest active:scale-95 transition-transform ${
                  theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default BusinessDetailApp;