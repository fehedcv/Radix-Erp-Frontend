import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Contacts } from '@capacitor-community/contacts';
import {
  MapPin, Star, Phone, Globe,
  CheckCircle2, Briefcase, ExternalLink,
  Info, Mail, ChevronRight, MessageCircle,
  Loader2, X, User, ChevronDown, Image as ImageIcon,
  Instagram, Facebook, Linkedin,
  BookUser, Search, 
  Plus
} from 'lucide-react';

import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

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

  const isLight = theme === 'light';

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
        setLoading(true);

        const { data: unitData, error: unitError } = await supabase
          .from('business_units')
          .select(`
            id, business_name, website, email, primary_phone, location, 
            address, description, logo_url, facebook, instagram, linkedin
          `)
          .eq('id', id)
          .single();

        if (unitError) {
          console.error('Failed to fetch business unit:', unitError);
          return;
        }

        const { data: servicesData, error: servicesError } = await supabase
          .from('business_unit_services')
          .select('service_name, description')
          .eq('business_unit_id', id);

        if (servicesError) {
          console.error('Failed to fetch services:', servicesError);
          return;
        }

        const { data: galleryData, error: galleryError } = await supabase
          .from('business_unit_gallery')
          .select('image_url')
          .eq('business_unit_id', id);

        if (galleryError) {
          console.error('Failed to fetch gallery:', galleryError);
          return;
        }

        setUnit({
          id: unitData.id,
          name: unitData.business_name,
          website: unitData.website || '',
          email: unitData.email || '',
          contact: unitData.primary_phone || '',
          location: unitData.location || '',
          address: unitData.address || '',
          description: unitData.description || '',
          logo_url: unitData.logo_url || '',
          facebook: unitData.facebook || '',
          instagram: unitData.instagram || '',
          linkedin: unitData.linkedin || '',
          services: (servicesData || []).map(s => ({
            name: s.service_name,
            description: s.description || ''
          })),
          gallery: (galleryData || []).map(g => g.image_url)
        });

        if (servicesData && servicesData.length > 0) {
          setFormData(prev => ({ ...prev, service: servicesData[0].service_name }));
        }
      } catch (err) {
        console.error('Failed to fetch unit:', err);
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

    if (!formData.client_name.trim() || !formData.client_phone.trim() || !formData.service) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const { data: userData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        alert('Authentication error. Please log in again.');
        return;
      }
      
      if (!userData.user) {
        console.error('No authenticated user');
        alert('Please log in to submit referrals.');
        return;
      }

      const { data: serviceData, error: serviceError } = await supabase
        .from('business_unit_services')
        .select('id')
        .eq('business_unit_id', unit.id)
        .eq('service_name', formData.service)
        .single();

      if (serviceError) {
        console.error('Failed to fetch service ID:', serviceError);
        alert('Failed to validate service. Please try again.');
        return;
      }

      if (!serviceData) {
        console.error('Service not found');
        alert('Selected service is not available. Please select a different service.');
        return;
      }

      const { data, error } = await supabase
        .from('leads')
        .insert([{
          business_unit_id: unit.id,
          source_user_id: userData.user.id,
          service_id: serviceData.id,
          customer_name: formData.client_name,
          phone: formData.client_phone,
          location: formData.customer_location,
          description: formData.notes,
        }]);

      if (error) {
        console.error('Failed to submit referral:', error);
        alert('Failed to submit referral: ' + error.message);
        return;
      }

      setShowModal(false);
      setFormData(prev => ({ ...prev, client_name: '', client_phone: '', customer_location: '', notes: '' }));
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Failed to submit referral');
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

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  // SKELETON LOADER (Bento Grid)
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 mt-4 px-4 lg:px-0">
        <div className={`h-4 w-48 rounded-md mb-2 ${pulseClass} animate-pulse`} />
        
        {/* Header Card Skeleton */}
        <div className={`rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center border animate-pulse ${surfaceClass}`}>
          <div className="flex items-center gap-6 w-full lg:w-auto">
            <div className={`h-20 w-20 rounded-xl shrink-0 ${pulseClass}`} />
            <div className="space-y-3 w-full">
              <div className={`h-8 w-48 md:w-64 rounded-md ${pulseClass}`} />
              <div className="flex gap-3">
                <div className={`h-6 w-24 rounded-md ${pulseClass}`} />
                <div className={`h-6 w-32 rounded-md ${pulseClass}`} />
              </div>
            </div>
          </div>
          <div className={`h-12 w-full lg:w-48 rounded-lg ${pulseClass}`} />
        </div>

        {/* Content Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-pulse">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            <div className={`h-72 md:h-96 rounded-2xl border ${surfaceClass}`} />
            <div className={`h-48 rounded-2xl border ${surfaceClass}`} />
            <div className={`h-64 rounded-2xl border ${surfaceClass}`} />
          </div>
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <div className={`h-96 rounded-2xl border ${surfaceClass}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2 lg:mt-4 px-4 lg:px-0 ${textPrimary}`}
    >
      {/* NAV */}
      <nav className={`flex items-center gap-2 text-xs font-medium mb-2 ${textSecondary}`}>
        <button onClick={() => navigate('/agent/units')} className="hover:text-[#81B398] transition-colors">Directory</button>
        <ChevronRight size={14} className="opacity-50" />
        <span className={`font-semibold ${textPrimary}`}>{unit.name}</span>
      </nav>

      {/* HEADER CARD (App-Like layout) */}
      <div className={`rounded-2xl p-6 lg:p-8 flex flex-col lg:flex-row justify-between gap-6 items-start lg:items-center border transition-all ${surfaceClass}`}>
        <div className="flex flex-row items-center gap-5 w-full lg:w-auto">
          {unit.logo_url ? (
            <img
              src={getFrappeImage(unit.logo_url)}
              alt="logo"
              className={`h-20 w-20 lg:h-24 lg:w-24 rounded-xl object-cover border shrink-0 ${isLight ? 'border-[#E2E8F0] bg-white' : 'border-white/5 bg-[#131720]'}`}
            />
          ) : (
            <div className={`h-20 w-20 lg:h-24 lg:w-24 shrink-0 flex items-center justify-center rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'}`}>
              <Briefcase size={32} />
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight leading-none">{unit.name}</h1>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <span className="bg-[#81B398]/10 text-[#81B398] px-2.5 py-1 rounded-md border border-[#81B398]/20 text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Verified
              </span>
              <span className={`text-xs font-medium flex items-center gap-1 ${textSecondary}`}>
                <MapPin size={14} className="text-[#81B398]" /> {unit.location}
              </span>
            </div>
          </div>
        </div>
        
        {/* Referral Button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all w-full lg:w-auto bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] active:scale-95 shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} /> Submit New Referral
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-8">
          
          {/* Gallery Card */}
          <div className={`h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden border transition-all ${surfaceClass}`}>
            {unit.gallery?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 h-full overflow-y-auto no-scrollbar">
                {unit.gallery.map((img, i) => (
                  <img key={i} src={img} alt="gallery" className={`w-full aspect-square object-cover rounded-xl border ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`} />
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center opacity-50">
                <ImageIcon size={48} className={`mb-3 ${textSecondary}`} />
                <span className={`text-sm font-medium ${textSecondary}`}>No Imagery Available</span>
              </div>
            )}
          </div>

          {/* About Card */}
          <div className={`p-6 lg:p-8 rounded-2xl border transition-all ${surfaceClass}`}>
            <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
              <Info size={18} className="text-[#81B398]" /> About The Business
            </h4>
            <p className={`text-sm leading-relaxed ${textSecondary}`}>{unit.description || "No specific description provided."}</p>
          </div>

          {/* Services Card */}
          <div className={`p-6 lg:p-8 rounded-2xl border transition-all ${surfaceClass}`}>
            <h4 className={`text-sm font-bold mb-4 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
              <Star size={18} className="text-[#81B398]" /> Services Provided
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {unit.services?.length > 0 ? unit.services.map((s, i) => (
                <div key={i} className={`p-5 rounded-xl border transition-colors ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'}`}>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className={`text-xs mt-1.5 leading-relaxed ${textSecondary}`}>{s.description}</p>
                </div>
              )) : <p className={`text-sm italic ${textSecondary}`}>No services listed.</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-1 space-y-6 lg:space-y-8">
          <div className={`p-6 lg:p-8 rounded-2xl border sticky top-6 transition-all ${surfaceClass}`}>
            <h4 className={`text-sm font-bold mb-4 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>Contact Information</h4>
            
            <div className="space-y-2">
              {unit.website && (
                <a href={unit.website} target="_blank" rel="noreferrer" className={`flex justify-between items-center group p-4 rounded-xl transition-all border border-transparent ${isLight ? 'hover:bg-[#F4F5F7] hover:border-[#E2E8F0]' : 'hover:bg-[#131720] hover:border-white/5'}`}>
                  <div className="flex items-center gap-4">
                    <Globe size={18} className={`${textSecondary} group-hover:text-[#81B398] transition-colors`} />
                    <div><p className={`text-xs font-medium ${textSecondary}`}>Website</p><p className="text-sm font-semibold truncate max-w-[150px] md:max-w-[200px]">{unit.website}</p></div>
                  </div>
                  <ExternalLink size={16} className="text-[#81B398] opacity-0 group-hover:opacity-100 transition-all" />
                </a>
              )}
              
              <div className="flex items-center gap-4 p-4">
                <Mail size={18} className={textSecondary} />
                <div><p className={`text-xs font-medium ${textSecondary}`}>Email Address</p><p className="text-sm font-semibold truncate max-w-[150px] md:max-w-[200px]">{unit.email || 'N/A'}</p></div>
              </div>
              
              <div className="flex items-center gap-4 p-4">
                <Phone size={18} className={textSecondary} />
                <div><p className={`text-xs font-medium ${textSecondary}`}>Phone Number</p><p className="text-sm font-semibold">{unit.contact || 'N/A'}</p></div>
              </div>
              
              {unit.contact && (
                <div className="flex flex-col gap-3 px-4 pt-4 pb-2">
                  <a href={`tel:${unit.contact}`} className="w-full flex items-center justify-center gap-2 py-3 bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20 rounded-xl text-sm font-semibold hover:bg-[#81B398]/20 transition-all">
                    <Phone size={16} /> Call Business
                  </a>
                  <a href={`https://wa.me/${unit.contact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-[#DAC18A]/10 text-[#DAC18A] border border-[#DAC18A]/20 rounded-xl text-sm font-semibold hover:bg-[#DAC18A]/20 transition-all">
                    <MessageCircle size={16} /> Send WhatsApp
                  </a>
                </div>
              )}
            </div>

            {/* Social Icons Section */}
            {(unit.facebook || unit.instagram || unit.linkedin) && (
              <div className={`mt-6 pt-6 border-t flex justify-center gap-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
                {unit.instagram && <a href={unit.instagram} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all hover:scale-105 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-white/5 text-[#F4F5F7] hover:border-[#81B398]'}`}><Instagram size={18} /></a>}
                {unit.facebook && <a href={unit.facebook} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all hover:scale-105 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-white/5 text-[#F4F5F7] hover:border-[#81B398]'}`}><Facebook size={18} /></a>}
                {unit.linkedin && <a href={unit.linkedin} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all hover:scale-105 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-white/5 text-[#F4F5F7] hover:border-[#81B398]'}`}><Linkedin size={18} /></a>}
              </div>
            )}
            
            <div className={`mt-6 pt-6 border-t text-center ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
              <p className={`text-xs font-medium ${textSecondary}`}>Need help? Contact <a className='text-[#81B398] hover:underline' href="https://wa.me/919400987747">+91 94009 87747</a></p>
            </div>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-sm w-full p-8 text-center relative overflow-hidden transition-all ${surfaceClass}`}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#81B398]/10 border border-[#81B398]/20 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle2 size={32} className="text-[#81B398]" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Success!</h3>
                <p className={`text-sm leading-relaxed mb-6 ${textSecondary}`}>
                  Referral for <span className="font-semibold text-[#81B398]">{unit.name}</span> has been submitted.
                </p>
                <button 
                  onClick={() => setShowSuccessModal(false)} 
                  className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isLight ? 'bg-[#F4F5F7] border border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#131720] border border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'
                  }`}
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REFERRAL FORM MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }}
              className={`w-full max-w-lg border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${surfaceClass}`}
            >
              {/* FIXED MODAL HEADER */}
              <div className={`px-6 py-5 flex justify-between items-center border-b shrink-0 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
                <span className={`text-base font-bold ${textPrimary}`}>New Referral</span>
                <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-md transition-all ${isLight ? 'hover:bg-[#F4F5F7] text-[#718096]' : 'hover:bg-[#131720] text-[#9CA3AF]'}`}>
                  <X size={20} />
                </button>
              </div>

              {/* FORM WRAPPER - Flex Column */}
              <form onSubmit={handleSubmitReferral} className="flex flex-col flex-1 min-h-0">
                
                {/* SCROLLABLE INPUTS BODY */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto no-scrollbar">
                  <div className="col-span-1 md:col-span-2">
                    <label className={`text-xs font-medium mb-1.5 block ${textSecondary}`}>Client Name *</label>
                    <div className="relative">
                      <User size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                      <input required name="client_name" value={formData.client_name} onChange={handleInputChange} 
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]'
                        }`} placeholder="Enter client name" />
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className={`text-xs font-medium mb-1.5 block ${textSecondary}`}>Client Phone *</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-grow">
                        <Phone size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                        <input required type="tel" name="client_phone" value={formData.client_phone} onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all ${
                            isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]'
                          }`} placeholder="98765 43210" />
                      </div>
                      {Capacitor.isNativePlatform() && (
                        <button type="button" onClick={handleOpenContactList} className={`p-3 border rounded-lg transition-all flex-shrink-0 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#81B398] hover:bg-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#81B398] hover:bg-[#1A202C]'}`}>
                          <BookUser size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1">
                    <label className={`text-xs font-medium mb-1.5 block ${textSecondary}`}>Location</label>
                    <div className="relative">
                      <MapPin size={16} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                      <input name="customer_location" value={formData.customer_location} onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm outline-none transition-all ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]'
                        }`} placeholder="City/Area" />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className={`text-xs font-medium mb-1.5 block ${textSecondary}`}>Service *</label>
                    <div className="relative">
                      <select required name="service" value={formData.service} onChange={handleInputChange}
                        className={`w-full pl-4 pr-10 py-3 border rounded-lg text-sm outline-none transition-all appearance-none cursor-pointer ${
                          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#131720] border-white/5 text-[#F4F5F7] focus:border-[#81B398]'
                        }`}>
                        <option value="" disabled>Select</option>
                        {unit.services?.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                      </select>
                      <ChevronDown size={16} className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${textSecondary} pointer-events-none`} />
                    </div>
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className={`text-xs font-medium mb-1.5 block ${textSecondary}`}>Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3}
                      className={`w-full px-4 py-3 border rounded-lg text-sm outline-none transition-all resize-none ${
                        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]'
                      }`} placeholder="Requirements..." />
                  </div>
                </div>

                {/* FIXED MODAL FOOTER */}
                <div className={`p-4 md:p-6 border-t flex gap-3 shrink-0 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
                  <button type="button" onClick={() => setShowModal(false)} className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-colors ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:bg-[#1A202C]'
                  }`}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 py-3 bg-[#81B398] text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#6FA085] transition-colors disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Submit Referral'}
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
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={`w-full max-w-md h-[80vh] md:h-[600px] rounded-t-2xl md:rounded-2xl flex flex-col overflow-hidden border transition-all ${surfaceClass}`}
            >
              <div className={`p-4 border-b flex flex-col gap-4 shrink-0 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`font-semibold text-sm ${textPrimary}`}>Select Contact</h3>
                  <button onClick={() => setShowContactsModal(false)} className={`p-1.5 rounded-md transition-all ${isLight ? 'text-[#718096] hover:bg-[#FFFFFF]' : 'text-[#9CA3AF] hover:bg-[#222938]'}`}>
                    <X size={18} />
                  </button>
                </div>
                <div className="relative">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${textSecondary}`} size={16} />
                  <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm outline-none transition-colors ${
                      isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] focus:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] focus:border-[#81B398]'
                    }`} 
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {isLoadingContacts ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="animate-spin text-[#81B398]" size={28} />
                  </div>
                ) : filteredContacts.length > 0 ? (
                  <ul className="space-y-1.5">
                    {filteredContacts.map((contact, index) => (
                      <li key={index}>
                        <button onClick={() => handleSelectContact(contact)} className={`w-full text-left p-4 rounded-xl flex items-center justify-between border border-transparent transition-all group ${
                          isLight ? 'hover:bg-[#F4F5F7] hover:border-[#E2E8F0]' : 'hover:bg-[#131720] hover:border-white/5'
                        }`}>
                          <div>
                            <p className={`font-semibold text-sm ${textPrimary}`}>{contact.name?.display || "Unknown"}</p>
                            <p className={`text-xs mt-1 font-medium ${textSecondary}`}>{contact.phones[0].number}</p>
                          </div>
                          <User size={16} className={`${isLight ? 'text-[#E2E8F0]' : 'text-[#48477A]'} group-hover:text-[#81B398] transition-colors`} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className={`flex items-center justify-center h-full text-sm font-medium ${textSecondary}`}>No contacts found.</div>
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