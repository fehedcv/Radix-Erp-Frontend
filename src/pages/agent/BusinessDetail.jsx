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
  BookUser, Search, 
  Plus
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; // Import Theme Context

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme(); // Access Theme

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
    const baseUrl = import.meta.env.VITE_SUPABASE_STORAGE_PUBLIC_URL || '';
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#38BDF8]" size={32} />
        <p className={`text-[10px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-[#94A3B8]'}`}>Loading Business Profile...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[1200px] mx-auto space-y-10 pb-16 font-['Plus_Jakarta_Sans',sans-serif] px-4 sm:px-6 relative z-0 transition-colors duration-500 ${theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'}`}
    >
      {/* AMBIENT BLOBS - Only for Dark Mode */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[0%] left-[10%] w-[400px] h-[400px] bg-lime-400/10 rounded-full blur-[120px] pointer-events-none -z-20" />
          <div className="fixed top-[30%] left-[40%] w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[140px] pointer-events-none -z-20" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-[#4ADE80]/10 rounded-full blur-[130px] pointer-events-none -z-20" />
        </>
      )}

      {/* NAV & HEADER */}
      <nav className={`flex items-center gap-2 text-xs font-medium mb-4 relative z-10 ${theme === 'light' ? 'text-slate-400' : 'text-[#94A3B8]'}`}>
        <button onClick={() => navigate('/agent/units')} className="hover:text-[#38BDF8] transition-colors">Directory</button>
        <ChevronRight size={14} className="opacity-50" />
        <span className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-semibold`}>{unit.name}</span>
      </nav>

      <div className={`rounded-md p-8 lg:p-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center relative z-10 border transition-all ${
        theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
      }`}>
        <div className="flex items-start md:items-center gap-6">
          {unit.logo ? (
            <img
              src={getFrappeImage(unit.logo)}
              alt="logo"
              className={`h-20 w-20 rounded-md object-cover border ${theme === 'light' ? 'border-slate-300 bg-white' : 'border-white/10 bg-white/5'}`}
            />
          ) : (
            <div className={`h-20 w-20 flex items-center justify-center rounded-md border ${theme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-white/5 border-white/10 text-[#94A3B8]'}`}>
              <Briefcase size={32} />
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{unit.name}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <span className="bg-[#4ADE80]/10 text-[#4ADE80] px-3 py-1.5 rounded-md border border-[#4ADE80]/20 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Verified Unit
              </span>
              <span className={`text-sm font-medium flex items-center gap-1.5 ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                <MapPin size={16} className="text-[#38BDF8]" /> {unit.location}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`px-8 py-4 rounded-md font-semibold text-sm flex items-center gap-2 transition-all whitespace-nowrap w-full lg:w-auto justify-center ${
            theme === 'light' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
          }`}
        >
          <Plus size={16} className="text-[#38BDF8]" /> Submit New Referral
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <div className="lg:col-span-8 space-y-8">
          <div className={`h-72 md:h-96 rounded-md overflow-hidden border transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
            {unit.gallery?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 h-full overflow-y-auto">
                {unit.gallery.map((img, i) => (
                  <img key={i} src={img} alt="gallery" className={`w-full aspect-square object-cover rounded-md border ${theme === 'light' ? 'border-slate-300' : 'border-white/10'}`} />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                <ImageIcon size={48} className="mb-4" /><span className="text-sm font-medium">No Imagery Available</span>
              </div>
            )}
          </div>

          <div className={`p-8 md:p-10 rounded-md border transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
            <h4 className={`text-sm font-bold mb-6 flex items-center gap-2 border-b pb-4 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
              <Info size={18} className="text-[#38BDF8]" /> About The Business
            </h4>
            <p className={`text-sm leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-[#94A3B8]'}`}>{unit.description || "No specific description provided."}</p>
          </div>

          <div className={`p-8 md:p-10 rounded-md border transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] border-white/10'}`}>
            <h4 className={`text-sm font-bold mb-6 flex items-center gap-2 border-b pb-4 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
              <Star size={18} className="text-[#38BDF8]" /> Services Provided
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {unit.services?.length > 0 ? unit.services.map((s, i) => (
                <div key={i} className={`p-5 rounded-md border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/5'}`}>
                  <p className="font-bold text-sm">{s.name}</p>
                  <p className={`text-xs mt-2 leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>{s.description}</p>
                </div>
              )) : <p className="text-sm italic opacity-50">No services listed.</p>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className={`p-8 rounded-md border sticky top-6 transition-all ${theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.02] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'}`}>
            <h4 className={`text-sm font-bold mb-6 border-b pb-4 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>Contact Information</h4>
            <div className="space-y-3">
              {unit.website && (
                <a href={unit.website} target="_blank" rel="noreferrer" className="flex justify-between items-center group p-4 rounded-md transition-all">
                  <div className="flex items-center gap-4">
                    <Globe size={20} className="text-slate-400 group-hover:text-[#38BDF8]" />
                    <div><p className="text-xs font-medium opacity-50">Website</p><p className="text-sm font-bold truncate">{unit.website}</p></div>
                  </div>
                  <ExternalLink size={16} className="text-[#38BDF8] opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              )}
              <div className="flex items-center gap-4 p-4"><Mail size={20} className="text-slate-400" /><div><p className="text-xs font-medium opacity-50">Email Address</p><p className="text-sm font-bold truncate">{unit.email || 'N/A'}</p></div></div>
              <div className="flex items-center gap-4 p-4"><Phone size={20} className="text-slate-400" /><div><p className="text-xs font-medium opacity-50">Phone Number</p><p className="text-sm font-bold">{unit.contact || 'N/A'}</p></div></div>
              
              {unit.contact && (
                <div className="flex flex-col xl:flex-row gap-4 px-4 pt-4 pb-2">
                  <a href={`tel:${unit.contact}`} className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#38BDF8]/10 text-[#38BDF8] rounded-md text-sm font-bold hover:bg-[#38BDF8]/20 transition-all">
                    <Phone size={18} /> Call
                  </a>
                  <a href={`https://wa.me/${unit.contact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-2 py-3 bg-[#4ADE80]/10 text-[#4ADE80] rounded-md text-sm font-bold hover:bg-[#4ADE80]/20 transition-all">
                    <MessageCircle size={18} /> WhatsApp
                  </a>
                </div>
              )}
            </div>
            {/* Social Icons Section */}
            {(unit.facebook || unit.instagram || unit.linkedin) && (
              <div className={`mt-8 pt-6 border-t flex justify-center gap-5 ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
                {unit.instagram && <a href={unit.instagram} target="_blank" rel="noreferrer" className={`w-12 h-12 rounded-md flex items-center justify-center text-pink-500 border transition-all hover:scale-110 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}><Instagram size={20} /></a>}
                {unit.facebook && <a href={unit.facebook} target="_blank" rel="noreferrer" className={`w-12 h-12 rounded-md flex items-center justify-center text-[#38BDF8] border transition-all hover:scale-110 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}><Facebook size={20} /></a>}
                {unit.linkedin && <a href={unit.linkedin} target="_blank" rel="noreferrer" className={`w-12 h-12 rounded-md flex items-center justify-center text-blue-400 border transition-all hover:scale-110 ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'}`}><Linkedin size={20} /></a>}
              </div>
            )}
            <div className={`mt-8 pt-6 border-t text-center ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
              <p className="text-xs text-slate-400 font-medium">Need help? Contact <a className='text-green-500' href="https://wa.me/919400987747">+91 94009 87747</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`border rounded-md max-w-sm w-full p-8 text-center relative overflow-hidden transition-all ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xl' : 'bg-[#0F172A] border-[#4ADE80]/30 shadow-2xl'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-[#4ADE80]/10 border border-[#4ADE80]/20 rounded-full flex items-center justify-center mb-6"><CheckCircle2 size={40} className="text-[#4ADE80]" /></div>
                <h3 className={`text-2xl font-bold mb-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Success!</h3>
                <p className={`text-sm leading-relaxed mb-8 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Referral for <span className="font-semibold">{unit.name}</span> submitted.</p>
                <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#4ADE80] rounded-md text-[11px] font-black uppercase tracking-widest hover:bg-[#4ADE80] hover:text-white transition-all">Got it</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REFERRAL FORM MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className={`w-full max-w-md border rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-white/10'
              }`}
            >
              <form onSubmit={handleSubmitReferral} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                <div className="col-span-1">
                  <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-3 block">Client Name *</label>
                  <div className="relative"><User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                  <input required name="client_name" value={formData.client_name} onChange={handleInputChange} 
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-md text-sm outline-none transition-all ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#38BDF8]' : 'bg-white/5 border-white/10 text-white'
                    }`} placeholder="Enter client name" /></div>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-3 block">Client Phone *</label>
                  <div className="flex gap-3 items-center"><div className="relative flex-grow"><Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                  <input required type="tel" name="client_phone" value={formData.client_phone} onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-md text-sm outline-none transition-all ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#38BDF8]' : 'bg-white/5 border-white/10 text-white'
                    }`} placeholder="98765 43210" /></div>
                  {Capacitor.isNativePlatform() && (
                    <button type="button" onClick={handleOpenContactList} className="p-3.5 bg-slate-100 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-200 transition-all"><BookUser size={18} /></button>
                  )}</div>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-3 block">Location</label>
                  <div className="relative"><MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                  <input name="customer_location" value={formData.customer_location} onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3.5 border rounded-md text-sm outline-none transition-all ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`} placeholder="City/Area" /></div>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-3 block">Service *</label>
                  <div className="relative"><select required name="service" value={formData.service} onChange={handleInputChange}
                    className={`w-full pl-4 pr-10 py-3.5 border rounded-md text-sm outline-none transition-all appearance-none cursor-pointer ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`}><option value="" disabled>Select</option>
                    {unit.services?.map((s, i) => <option key={i} value={s.name} className="bg-slate-900">{s.name}</option>)}
                  </select><ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" /></div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold opacity-50 uppercase tracking-widest mb-3 block">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3}
                    className={`w-full px-4 py-3.5 border rounded-md text-sm outline-none transition-all resize-none ${
                      theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-white/5 border-white/10 text-white'
                    }`} placeholder="Requirements..." />
                </div>
                <div className="col-span-1 md:col-span-2 flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-md text-[11px] font-black uppercase tracking-widest">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-4 bg-slate-900 text-white rounded-md text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Submit <ChevronRight size={16} /></>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONTACTS PICKER MODAL */}
      <AnimatePresence>
        {showContactsModal && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-md">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={`w-full max-w-md h-[80vh] md:h-[600px] rounded-t-md md:rounded-md flex flex-col overflow-hidden border transition-all ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0F172A] border-white/10'
              }`}
            >
              <div className={`p-6 border-b flex flex-col gap-5 ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                <div className="flex justify-between items-center"><h3 className="font-bold">Select Contact</h3>
                <button onClick={() => setShowContactsModal(false)} className="p-2 opacity-50"><X size={16} /></button></div>
                <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 border rounded-md text-sm outline-none ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10'
                  }`} /></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {isLoadingContacts ? <div className="flex flex-col items-center justify-center h-full gap-3"><Loader2 className="animate-spin text-[#38BDF8]" size={32} /></div> : 
                filteredContacts.length > 0 ? <ul className="space-y-2">{filteredContacts.map((contact, index) => (
                  <li key={index}><button onClick={() => handleSelectContact(contact)} className={`w-full text-left p-5 rounded-md flex items-center justify-between border transition-all ${
                    theme === 'light' ? 'hover:bg-slate-50 border-transparent hover:border-slate-200' : 'hover:bg-white/10 border-transparent'
                  }`}><div><p className="font-bold text-sm">{contact.name?.display || "Unknown"}</p><p className="text-xs opacity-50 mt-1">{contact.phones[0].number}</p></div><User size={16} className="opacity-30" /></button></li>
                ))}</ul> : <div className="flex items-center justify-center h-full opacity-50 text-sm">No contacts found.</div>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BusinessDetail;