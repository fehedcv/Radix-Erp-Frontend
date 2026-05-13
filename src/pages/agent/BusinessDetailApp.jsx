import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

// ==========================================
// 1:1 STRUCTURAL SKELETON (BENTO STYLE)
// ==========================================
const DirectorySkeleton = ({ theme }) => {
  const isLight = theme === 'light';
  const pulseColor = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';
  const cardBg = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10';

  return (
    <div className={` space-y-5   border-t  ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'} pb-32 pt-4 `}>
                  {/* <div className={`w-full border-t pb-28 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`} />  */}

      {/* HERO BENTO SKELETON */}
      <div className={`rounded-3xl p-6 border relative overflow-hidden animate-pulse ${cardBg}`}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`h-16 w-16 rounded-xl shrink-0 ${pulseColor}`} />
          <div className="flex-1 pt-0.5 space-y-2">
            <div className={`h-6 w-3/4 rounded-lg ${pulseColor}`} />
            <div className={`h-3 w-1/2 rounded-md ${pulseColor}`} />
          </div>
        </div>
        <div className={`h-6 w-24 rounded-lg mb-6 ${pulseColor}`} />
        <div className={`h-12 w-full rounded-xl ${pulseColor}`} />
      </div>

      {/* GALLERY BENTO SKELETON */}
      <div className={`rounded-2xl p-6 border animate-pulse ${cardBg}`}>
        <div className={`h-3 w-16 rounded-md mb-4 ${pulseColor}`} />
        <div className="flex gap-3 overflow-hidden">
          <div className={`h-32 w-32 rounded-xl shrink-0 ${pulseColor}`} />
          <div className={`h-32 w-32 rounded-xl shrink-0 ${pulseColor}`} />
          <div className={`h-32 w-32 rounded-xl shrink-0 ${pulseColor}`} />
        </div>
      </div>

      {/* ABOUT BENTO SKELETON */}
      <div className={`rounded-2xl p-6 border animate-pulse ${cardBg}`}>
        <div className={`h-3 w-20 rounded-md mb-3 ${pulseColor}`} />
        <div className="space-y-2">
          <div className={`h-3 w-full rounded-md ${pulseColor}`} />
          <div className={`h-3 w-5/6 rounded-md ${pulseColor}`} />
          <div className={`h-3 w-4/6 rounded-md ${pulseColor}`} />
        </div>
      </div>

      {/* SERVICES BENTO SKELETON */}
      <div className={`rounded-2xl p-6 border animate-pulse ${cardBg}`}>
        <div className={`h-3 w-24 rounded-md mb-4 ${pulseColor}`} />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className={`p-4 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
              <div className={`h-4 w-1/3 rounded-md mb-2 ${pulseColor}`} />
              <div className={`h-2 w-2/3 rounded-md ${pulseColor}`} />
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT INFO BENTO SKELETON */}
      <div className={`rounded-2xl p-6 border animate-pulse ${cardBg}`}>
        <div className={`h-3 w-24 rounded-md mb-5 ${pulseColor}`} />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg shrink-0 ${pulseColor}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-2 w-16 rounded-md ${pulseColor}`} />
                <div className={`h-3 w-1/2 rounded-md ${pulseColor}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const BusinessDetailApp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme(); 
  const isLight = theme === 'light';
  const isBrowser = typeof document !== 'undefined'; // Safe check for React Portal

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
  
  const [selectedImage, setSelectedImage] = useState(null);

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
        await new Promise(resolve => setTimeout(resolve, 600));

        const dummyData = {
          id: id || 'unit_001',
          name: 'Premium Real Estate Solutions',
          website: 'https://example.com',
          email: 'contact@realestate.com',
          contact: '+91 9876543210',
          location: 'Mumbai, Maharashtra',
          address: '123 Business Park, Mumbai, MH 400001',
          description: 'We provide comprehensive real estate solutions including residential, commercial and industrial properties with professional consultation and support.',
          logo: 'https://api.dicebear.com/7.x/business/svg?seed=realestate',
          facebook: 'https://facebook.com/example',
          instagram: 'https://instagram.com/example',
          linkedin: 'https://linkedin.com/company/example',
          services: [
            { name: 'Residential Properties', description: 'Luxury apartments and villas' },
            { name: 'Commercial Spaces', description: 'Office spaces and retail locations' },
            { name: 'Industrial Properties', description: 'Manufacturing and warehouse spaces' },
            { name: 'Property Management', description: 'Full property management services' }
          ],
          gallery: [
            'https://images.unsplash.com/photo-1545654711-cd4628902c4d?w=800',
            'https://images.unsplash.com/photo-1560518883-b1e6e4fcd3b0?w=800',
            'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800'
          ]
        };

        setUnit({
          id: dummyData.id,
          name: dummyData.name,
          website: dummyData.website || '',
          email: dummyData.email || '',
          contact: dummyData.contact || '',
          location: dummyData.location || '',
          address: dummyData.address || "",
          description: dummyData.description || '',
          logo: dummyData.logo || '',
          facebook: dummyData.facebook || '',
          instagram: dummyData.instagram || '',
          linkedin: dummyData.linkedin || '',
          services: (dummyData.services || []).map(s => ({
            name: s.name,
            description: s.description || ""
          })),
          gallery: dummyData.gallery || []
        });

        if (dummyData.services && dummyData.services.length > 0) {
          setFormData(prev => ({ ...prev, service: dummyData.services[0].name }));
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
      await new Promise(resolve => setTimeout(resolve, 800));

      console.log('Lead submitted successfully (DUMMY):', {
        business_unit: unit.id,
        ...formData,
        location: formData.customer_location
      });

      setShowModal(false);
      setFormData(prev => ({ ...prev, client_name: '', client_phone: '', customer_location: '', notes: '' }));
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
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

  if (loading) return <DirectorySkeleton theme={theme} />;

  return (
    <div className={`min-h-screen border-t ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'} font-['Plus_Jakarta_Sans',sans-serif] flex flex-col transition-colors duration-200 overflow-x-hidden ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      
      {/* NATIVE APP BAR */}
      <header className={`flex items-center gap-3 mt-8 pb-2 z-50 sticky top-0 shrink-0 transition-colors ${
        isLight ? 'bg-[#F4F5F7]/90 backdrop-blur-md' : 'bg-[#131720]/90 backdrop-blur-md'
      }`}>
        <button 
          onClick={() => navigate('/agent/units')}
          className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 active:scale-95 ${
            isLight 
              ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398] text-[#1A202C]' 
              : 'bg-[#222938] border-white/10 hover:border-[#81B398] text-[#F4F5F7]'
          }`}
        >
          <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <h1 className="text-base font-extrabold tracking-tight truncate flex-1">
          {unit.name}
        </h1>
      </header>

      {/* MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto overflow-y-auto no-scrollbar space-y-5 py-4 pb-16">
        
        {/* PROFESSIONAL SEPARATOR */}
        <div className={`w-full  ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
          
          {/* HERO BENTO CARD */}
          <div className={`rounded-3xl p-6 border relative overflow-hidden ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <div className="flex items-start gap-4 mb-6">
              {unit.logo ? (
                <img
                  src={getFrappeImage(unit.logo)}
                  alt="logo"
                  className={`h-16 w-16 rounded-xl object-cover shrink-0 border ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
                  }`}
                />
              ) : (
                <div className={`h-16 w-16 flex items-center justify-center rounded-xl shrink-0 border ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/10 text-[#9CA3AF]'
                }`}>
                  <Briefcase size={24} />
                </div>
              )}
              <div className="flex-1 min-w-0 pt-0.5">
                <h2 className={`text-xl font-extrabold tracking-tight truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{unit.name}</h2>
                <p className={`text-[11px] font-bold mt-1 uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
                }`}>
                  <MapPin size={12} className="text-[#81B398]" /> {unit.location}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-6">
               <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
                  <CheckCircle2 size={12} strokeWidth={3} /> Verified
               </span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
            >
              <Plus size={18} strokeWidth={2.5} /> Submit Lead
            </button>
          </div>
        </div>

        {/* GALLERY BENTO */}
        <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-4 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Gallery</h4>
          {unit.gallery?.length > 0 ? (
            <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar -mx-2 px-2">
              {unit.gallery.map((img, i) => (
                <img 
                  key={i} 
                  src={img} 
                  alt="gallery" 
                  onClick={() => setSelectedImage(img)}
                  className={`h-32 w-32 rounded-xl object-cover shrink-0 border cursor-pointer hover:opacity-80 transition-opacity active:scale-95 ${
                    isLight ? 'border-[#E2E8F0]' : 'border-white/10'
                  }`} 
                />
              ))}
            </div>
          ) : (
            <div className={`h-24 rounded-xl flex flex-col items-center justify-center border ${
              isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/10 text-[#9CA3AF]'
            }`}>
              <ImageIcon size={24} className="mb-2 opacity-50" />
              <span className="text-[10px] font-bold uppercase tracking-wider">No Imagery</span>
            </div>
          )}
        </div>

        {/* ABOUT BENTO */}
        <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            <Info size={14} className="text-[#81B398]" /> About
          </h4>
          <p className={`text-sm font-medium leading-relaxed ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
            {unit.description || "No specific description provided."}
          </p>
        </div>

        {/* SERVICES BENTO */}
        <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-4 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            <Star size={14} className="text-[#81B398]" /> Services
          </h4>
          <div className="space-y-3">
            {unit.services?.length > 0 ? unit.services.map((s, i) => (
              <div key={i} className={`p-4 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                <p className={`font-bold text-sm tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{s.name}</p>
                {s.description && <p className={`text-[11px] font-medium mt-1.5 leading-relaxed ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{s.description}</p>}
              </div>
            )) : <p className={`text-[11px] font-bold uppercase tracking-wider opacity-50 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No services listed.</p>}
          </div>
        </div>

        {/* CONTACT INFO BENTO */}
        <div className={`rounded-2xl p-6 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
          <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Contact Info</h4>
          <div className="space-y-4">
            {unit.website && (
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/10 text-[#9CA3AF]'}`}>
                  <Globe size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Website</p>
                  <a href={unit.website} target="_blank" rel="noreferrer" className="text-sm font-bold truncate block text-[#81B398] hover:underline">{unit.website}</a>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-4">
               <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/10 text-[#9CA3AF]'}`}>
                <Mail size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Email</p>
                <p className={`text-sm font-bold truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{unit.email || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/10 text-[#9CA3AF]'}`}>
                <Phone size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Phone</p>
                <p className={`text-sm font-bold truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{unit.contact || 'N/A'}</p>
              </div>
            </div>

            {unit.contact && (
              <div className="flex gap-3 pt-4 mt-2 border-t border-transparent">
                <a href={`tel:${unit.contact}`} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 border ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'
                }`}>
                  <Phone size={14} /> Call
                </a>
                <a href={`https://wa.me/${unit.contact.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]">
                  <MessageCircle size={14} /> Chat
                </a>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(unit.facebook || unit.instagram || unit.linkedin) && (
            <div className={`mt-5 pt-5 border-t flex justify-center gap-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
              {unit.instagram && <a href={unit.instagram} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 text-pink-500 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}><Instagram size={18} /></a>}
              {unit.facebook && <a href={unit.facebook} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 text-blue-500 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}><Facebook size={18} /></a>}
              {unit.linkedin && <a href={unit.linkedin} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-95 text-blue-700 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}><Linkedin size={18} /></a>}
            </div>
          )}
        </div>
      </main>

      {/* =========================================
          PORTALS: Modals Break Out of Stacking Context
          ========================================= */}
      
      {/* 1. FULL SCREEN GALLERY LIGHTBOX */}
      {/* 1. FULL SCREEN GALLERY LIGHTBOX (WITH SLIDER) */}
      {isBrowser && createPortal(
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65"
              onClick={() => setSelectedImage(null)} // Click background to close
            >
              <motion.div 
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 10 }}
                className="relative w-full max-w-5xl flex items-center justify-center"
                onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
              >
                
                {/* PREVIOUS BUTTON */}
                {unit?.gallery?.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = unit.gallery.indexOf(selectedImage);
                      const prevIndex = (currentIndex - 1 + unit.gallery.length) % unit.gallery.length;
                      setSelectedImage(unit.gallery[prevIndex]);
                    }}
                    className="absolute left-2 md:-left-12 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/50 border border-white/20 text-white hover:bg-black/80 active:scale-95 transition-all backdrop-blur-md"
                  >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                  </button>
                )}

                {/* IMAGE & CLOSE BUTTON WRAPPER */}
                <div className="relative inline-flex items-center justify-center max-w-full max-h-[85vh]">
                  
                  {/* CLOSE BUTTON (Inside Image Top-Right) */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(null);
                    }}
                    className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full flex items-center justify-center bg-black/50 border border-white/20 text-white hover:bg-black/80 active:scale-95 transition-all backdrop-blur-md"
                  >
                    <X size={16} strokeWidth={3} />
                  </button>

                  <img 
                    src={selectedImage} 
                    alt="Enlarged gallery view" 
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                  />
                </div> 

                {/* NEXT BUTTON */}
                {unit?.gallery?.length > 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIndex = unit.gallery.indexOf(selectedImage);
                      const nextIndex = (currentIndex + 1) % unit.gallery.length;
                      setSelectedImage(unit.gallery[nextIndex]);
                    }}
                    className="absolute right-2 md:-right-12 z-50 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-black/50 border border-white/20 text-white hover:bg-black/80 active:scale-95 transition-all backdrop-blur-md"
                  >
                    <ChevronRight size={24} strokeWidth={2.5} />
                  </button>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 2. SUBMIT LEAD MODAL */}
      {isBrowser && createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden box-border">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowModal(false)} 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className={`w-full max-w-lg max-h-[90vh] rounded-3xl relative flex flex-col overflow-x-hidden border shadow-sm ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                }`}
              >
                <div className={`shrink-0 px-6 py-5 flex justify-between items-center border-b ${
                  isLight ? 'border-[#E2E8F0]' : 'border-white/10'
                }`}>
                  <div>
                    <h3 className={`text-xl font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>New Lead</h3>
                    <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>For {unit.name}</p>
                  </div>
                  <button 
                    onClick={() => setShowModal(false)} 
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95 border ${
                      isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'
                    }`}
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>

                <form id="lead-form" onSubmit={handleSubmitReferral} className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-6 space-y-5">
                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Client Name *</label>
                    <div className="relative">
                      <User size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} />
                      <input required name="client_name" value={formData.client_name} onChange={handleInputChange} 
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none border transition-all box-border ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                        }`} placeholder="Enter client name" />
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Client Phone *</label>
                    <div className="flex gap-2 items-center">
                      <div className="relative flex-grow min-w-0">
                        <Phone size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} />
                        <input required type="tel" name="client_phone" value={formData.client_phone} onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none border transition-all box-border ${
                            isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                          }`} placeholder="98765 43210" />
                      </div>
                      {Capacitor.isNativePlatform() && (
                        <button type="button" onClick={handleOpenContactList} className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center active:scale-95 transition-all border ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-white/10 text-[#F4F5F7] hover:border-[#81B398]'
                        }`}>
                          <BookUser size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Location</label>
                    <div className="relative">
                      <MapPin size={16} className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} />
                      <input name="customer_location" value={formData.customer_location} onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none border transition-all box-border ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                        }`} placeholder="City/Area" />
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Service *</label>
                    <div className="relative">
                      <select required name="service" value={formData.service} onChange={handleInputChange}
                        className={`w-full pl-4 pr-11 py-3.5 rounded-xl text-sm font-medium appearance-none outline-none border transition-all box-border ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                        }`}>
                        <option value="" disabled>Select a service</option>
                        {unit.services?.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                      </select>
                      <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} />
                    </div>
                  </div>

                  <div>
                    <label className={`text-[11px] font-bold uppercase tracking-wider mb-2 block ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3}
                      className={`w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none resize-none border transition-all box-border ${
                        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                      }`} placeholder="Any special requirements..." />
                  </div>
                </form>

                <div className={`shrink-0 px-6 py-4 border-t ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                  <button 
                    type="submit" 
                    form="lead-form"
                    disabled={submitting} 
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all bg-[#81B398] text-white hover:bg-[#6FA085] disabled:opacity-50"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <>Confirm Submission <ChevronRight size={16} /></>}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 3. CONTACTS PICKER MODAL */}
      {isBrowser && createPortal(
        <AnimatePresence>
          {showContactsModal && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden box-border">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setShowContactsModal(false)} 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-md max-h-[85vh] rounded-3xl relative flex flex-col overflow-x-hidden border shadow-sm ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                }`}
              >
                <div className={`shrink-0 p-5 border-b space-y-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <h3 className={`text-lg font-bold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Phonebook</h3>
                    <button onClick={() => setShowContactsModal(false)} className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 ${
                      isLight ? 'bg-[#F4F5F7] border-transparent hover:border-[#E2E8F0]' : 'bg-[#131720] border-transparent hover:border-white/10'
                    }`}>
                      <X size={16} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div className="relative">
                    <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} />
                    <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none border transition-all box-border ${
                        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
                      }`} />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar p-4 space-y-2">
                  {isLoadingContacts ? (
                     <div className="flex flex-col items-center justify-center h-full gap-3 py-10">
                       <Loader2 className="animate-spin text-[#81B398]" size={24} />
                       <p className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Fetching Contacts</p>
                     </div>
                  ) : filteredContacts.length > 0 ? (
                    filteredContacts.map((contact, index) => (
                      <button key={index} onClick={() => handleSelectContact(contact)} className={`w-full text-left p-4 rounded-2xl flex items-center justify-between border transition-all active:scale-95 ${
                        isLight ? 'bg-[#FFFFFF] border-transparent hover:border-[#81B398]' : 'bg-[#131720] border-white/10 hover:border-[#81B398]'
                      }`}>
                        {/* Fix: min-w-0 and truncate stops the text from expanding the container horizontally */}
                        <div className="flex-1 min-w-0 pr-3">
                          <p className={`font-bold text-sm truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{contact.name?.display || "Unknown"}</p>
                          <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 truncate ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                            {contact.phones[0].number}
                          </p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center border ${
                          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                        }`}>
                           <User size={16} className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'} />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="flex items-center justify-center py-10">
                      <p className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No contacts found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* 4. SUCCESS MODAL */}
      {isBrowser && createPortal(
        <AnimatePresence>
          {showSuccessModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-6 box-border">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className={`w-full max-w-sm rounded-3xl p-8 text-center border shadow-sm ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
                }`}
              >
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className={`text-2xl font-bold tracking-tight mb-2 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Success!</h3>
                <p className={`text-sm font-medium leading-relaxed mb-8 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Lead for <span className={`font-bold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{unit.name}</span> has been submitted.
                </p>
                <button 
                  onClick={() => setShowSuccessModal(false)} 
                  className={`w-full py-3.5 rounded-xl font-bold text-sm active:scale-95 transition-all border ${
                    isLight ? 'bg-[#F4F5F7] text-[#1A202C] border-transparent hover:border-[#E2E8F0]' : 'bg-[#131720] text-[#F4F5F7] border-white/10 hover:bg-[#222938]'
                  }`}
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default BusinessDetailApp;