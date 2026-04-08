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
  BookUser, Search // <-- Added new icons for contacts
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    service: '',
    customer_location: '',
    notes: ''
  });

  // --- NEW STATES FOR CONTACT MODAL ---
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [allContacts, setAllContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  // ---------------- HELPER: Image URL Builder ----------------
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

  // ---------------- FETCH DATA ----------------
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

  // ---------------- HANDLERS ----------------
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
      alert('Referral submitted successfully!');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit referral');
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW LOGIC: FETCH AND OPEN CUSTOM CONTACTS LIST ---
  const handleOpenContactList = async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      const permission = await Contacts.requestPermissions();
      if (permission.contacts !== 'granted') {
        alert('Contact permission is required to view your contact list.');
        return;
      }

      setShowContactsModal(true);
      setIsLoadingContacts(true);

      const result = await Contacts.getContacts({
        projection: { name: true, phones: true }
      });

      const validContacts = result.contacts
        .filter(c => c.phones && c.phones.length > 0)
        .sort((a, b) => (a.name?.display || "").localeCompare(b.name?.display || ""));

      setAllContacts(validContacts);
    } catch (error) {
      console.error("Failed to load contacts:", error);
      alert(`Error: ${error.message || JSON.stringify(error)}`);
      setShowContactsModal(false);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  // --- NEW LOGIC: HANDLE CONTACT SELECTION ---
  const handleSelectContact = (contact) => {
    const pickedName = contact.name?.display || "";
    const rawPhone = contact.phones[0].number; 
    
    // Clean the phone number (remove +91, spaces, and dashes)
    const cleanPhone = rawPhone.replace(/^\+91/, '').replace(/[\s-]/g, '').trim();

    setFormData(prev => ({
      ...prev,
      client_name: prev.client_name || pickedName, 
      client_phone: cleanPhone 
    }));

    setShowContactsModal(false);
    setSearchQuery("");
  };

  const filteredContacts = allContacts.filter(contact => {
    const nameMatch = contact.name?.display?.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = contact.phones?.[0]?.number?.includes(searchQuery);
    return nameMatch || phoneMatch;
  });

  // ---------------- LOADERS ----------------
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#007ACC]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Business Profile...</p>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
          <Info size={32} />
        </div>
        <p className="text-lg font-black uppercase text-slate-700 tracking-tight">Team Profile Not Found</p>
        <button
          onClick={() => navigate('/agent/units')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1200px] mx-auto space-y-6 pb-16 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900 px-4 sm:px-6"
    >

      {/* 1. NAV & HEADER */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
        <button onClick={() => navigate('/agent/units')} className="hover:text-blue-600 transition-colors">
          Directory
        </button>
        <ChevronRight size={14} className="text-slate-400" />
        <span className="text-slate-800 font-semibold">{unit.name}</span>
      </nav>

      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 md:p-8 shadow-sm flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center">
        <div className="flex items-start md:items-center gap-5">
          {unit.logo ? (
            <img
              src={getFrappeImage(unit.logo)}
              alt={`${unit.name} logo`}
              className="h-16 w-16 rounded-md object-cover shrink-0 shadow-sm border border-slate-200"
            />
          ) : (
            <div className="h-16 w-16 bg-slate-900 text-white flex items-center justify-center rounded-md shrink-0 shadow-sm">
              <Briefcase size={28} />
            </div>
          )}

          <div className="space-y-1.5">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {unit.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Verified Unit
              </span>
              <span className="text-slate-500 text-sm font-medium flex items-center gap-1.5">
                <MapPin size={16} className="text-blue-600" /> {unit.location}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold text-sm flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap w-full lg:w-auto justify-center"
        >
          <Zap size={16} fill="currentColor" /> Submit New Referral
        </button>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Details */}
        <div className="lg:col-span-8 space-y-6">

          {/* Gallery / Featured Image */}
          <div className="h-64 md:h-80 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 relative">
            {unit.gallery && unit.gallery.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 h-full overflow-y-auto">
                {unit.gallery.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`gallery-${i}`}
                    className="w-full aspect-square object-cover rounded-md border border-slate-200 shadow-sm"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <ImageIcon size={40} className="mb-3 opacity-50" />
                <span className="text-sm font-medium tracking-wide">
                  No Imagery Available
                </span>
              </div>
            )}

            {unit.gallery && unit.gallery.length > 0 && (
              <div className="absolute bottom-4 left-4">
                <span className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide border border-white/10">
                  Gallery
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Info size={16} className="text-blue-600" /> About The Business
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              {unit.description || "No specific description provided for this business unit."}
            </p>
          </div>

          {/* Services */}
          <div className="bg-white p-6 md:p-8 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Star size={16} className="text-blue-600" /> Services Provided
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unit.services && unit.services.length > 0 ? unit.services.map((s, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <p className="font-semibold text-sm text-slate-900">{s.name}</p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.description}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500 italic">No services listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm sticky top-6">
            <h4 className="text-sm font-semibold text-slate-800 mb-5 border-b border-slate-100 pb-3">
              Contact Information
            </h4>

            <div className="space-y-1">
              {unit.website && (
                <a
                  href={unit.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex justify-between items-center group p-3 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <div>
                      <p className="text-xs font-medium text-slate-500">Website</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{unit.website}</p>
                    </div>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              )}

              <div className="flex items-center gap-3 p-3 rounded-md">
                <Mail size={18} className="text-slate-400" />
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-slate-500">Email Address</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">{unit.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-md">
                <Phone size={18} className="text-slate-400" />
                <div>
                  <p className="text-xs font-medium text-slate-500">Phone Number</p>
                  <p className="text-sm font-semibold text-slate-900">{unit.contact || 'N/A'}</p>
                </div>
              </div>

              {unit.contact && (
                <div className="flex gap-3 px-3 pt-2 pb-1">
                  <a
                    href={`tel:${unit.contact}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
                  >
                    <Phone size={16} />
                    Call Now
                  </a>
                  <a
                    href={`https://wa.me/${unit.contact.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-md text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
                  >
                    <MessageCircle size={16} />
                    WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* --- Social Media Links --- */}
            {(unit.facebook || unit.instagram || unit.linkedin) && (
              <div className="mt-6 pt-5 border-t border-slate-100 flex justify-center gap-4">
                {unit.instagram && (
                  <a 
                    href={unit.instagram} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-10 h-10 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 hover:bg-pink-500 hover:text-white hover:scale-110 transition-all shadow-sm"
                  >
                    <Instagram size={18} />
                  </a>
                )}
                {unit.facebook && (
                  <a 
                    href={unit.facebook} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all shadow-sm"
                  >
                    <Facebook size={18} />
                  </a>
                )}
                {unit.linkedin && (
                  <a 
                    href={unit.linkedin} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="w-10 h-10 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 hover:bg-sky-600 hover:text-white hover:scale-110 transition-all shadow-sm"
                  >
                    <Linkedin size={18} />
                  </a>
                )}
              </div>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-500 text-center">
                Need help? Contact +91 94009 87747.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REFERRAL FORM MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-white rounded-[1.5rem] w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* --- Header --- */}
              <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  New Referral
                </h3>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all active:scale-95"
                >
                  <X size={16} strokeWidth={2.5} />
                </button>
              </div>

              {/* --- Form --- */}
              <form onSubmit={handleSubmitReferral} className="p-6 space-y-4 overflow-y-auto scrollbar-hide">

                {/* Client Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                    Client Name *
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                </div>

                {/* Client Phone - UPDATED WITH CONTACT BUTTON */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                    Client Phone *
                  </label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-grow">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        required
                        type="tel"
                        name="client_phone"
                        value={formData.client_phone}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                        placeholder="98765 43210"
                      />
                    </div>
                    
                    {/* Contact Button */}
                    {Capacitor.isNativePlatform() && (
                      <button
                        type="button"
                        onClick={handleOpenContactList}
                        className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl text-slate-500 hover:bg-[#007ACC] hover:text-white hover:border-[#007ACC] transition-all shadow-sm active:scale-95 flex-shrink-0"
                        title="Import from Contacts"
                      >
                        <BookUser size={18} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Customer Location */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                    Customer Location
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      name="customer_location"
                      value={formData.customer_location}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                      placeholder="City or Area"
                    />
                  </div>
                </div>

                {/* Services Provided */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                    Services Required *
                  </label>
                  <div className="relative">
                    <select
                      required
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="text-slate-400">Select a service</option>
                      {unit.services && unit.services.map((s, i) => (
                        <option key={i} value={s.name || s}>{s.name || s}</option>
                      ))}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block ml-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                    placeholder="Any specific details or requirements..."
                  />
                </div>

                {/* --- Action Buttons --- */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-[#007ACC] text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-[#005fb8] transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><Loader2 size={16} className="animate-spin" /> Processing</>
                    ) : (
                      <>Submit <ChevronRight size={16} /></>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- IN-APP CONTACTS MODAL OVERLAY --- */}
      <AnimatePresence>
        {showContactsModal && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: "100%" }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="bg-white w-full max-w-md h-[80vh] md:h-[600px] rounded-t-[1.5rem] md:rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Contact Modal Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="font-bold text-slate-800">Select Contact</h3>
                  <button 
                    onClick={() => setShowContactsModal(false)}
                    className="p-2 bg-white border border-slate-200 text-slate-500 rounded-full hover:bg-slate-50 transition-colors active:scale-95"
                  >
                    <X size={16} strokeWidth={2.5} />
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
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all"
                  />
                </div>
              </div>

              {/* Contact List */}
              <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                {isLoadingContacts ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-sm font-medium">Loading Contacts...</p>
                  </div>
                ) : filteredContacts.length > 0 ? (
                  <ul className="space-y-1">
                    {filteredContacts.map((contact, index) => (
                      <li key={contact.contactId || index}>
                        <button
                          type="button"
                          onClick={() => handleSelectContact(contact)}
                          className="w-full text-left p-4 hover:bg-slate-50 rounded-xl transition-colors flex items-center justify-between border border-transparent hover:border-slate-200 active:bg-slate-100"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{contact.name?.display || "Unknown"}</p>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                              {contact.phones[0].number}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                            <User size={14} strokeWidth={2.5} />
                          </div>
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

    </motion.div>
  );
};

export default BusinessDetail;