import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Phone, Globe,
  CheckCircle2, Briefcase, ExternalLink,
  Info, Mail, Zap, ChevronRight,MessageCircle,
  Loader2, X, User, Image as ImageIcon
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
    notes: ''
  });

  // ---------------- HELPER: Image URL Builder ----------------
  const getFrappeImage = (path) => {
    if (!path) return null;
    // If it's already a full URL (http/https), return it
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    
    // Get Base URL from Axios instance, or fallback to window origin if proxying
    const baseUrl = "http://16.171.38.6:8000"; // Replace with your Frappe base URL
    
    // Ensure path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    
    // Remove trailing slash from base if present to avoid double slash
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
          services: (data.services || []).map(s =>({
            name:s.name,
            description:s.description || ""
          })),
          // Process images using the helper
          gallery: (data.gallery || []).map(img => getFrappeImage(img))
        });
        
        // Set default service for dropdown
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
          ...formData
        }
      );
      
      setShowModal(false);
      setFormData(prev => ({ ...prev, client_name: '', client_phone: '', notes: '' }));
      alert('Referral submitted successfully!');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Failed to submit referral');
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="h-16 w-16 bg-slate-900 text-white flex items-center justify-center rounded-md shrink-0 shadow-sm">
            <Briefcase size={28} />
          </div>

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
       {/* // Remember to import MessageCircle: */}
{/* // import { Globe, ExternalLink, Mail, Phone, MessageCircle } from 'lucide-react'; */}

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

        {/* --- NEW BUTTONS ADDED HERE --- */}
        {unit.contact && (
            <div className="flex gap-3 px-3 pt-2 pb-1">
               <a href={`tel:${unit.contact}`} 
               className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-md text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm"
               >
    <Phone size={16} /> {/* <-- React sees a rendered component */}
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
        {/* ------------------------------ */}

    </div>
    
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-lg w-full max-w-md border border-slate-200 shadow-xl overflow-hidden"
            >
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="text-base font-semibold text-slate-900">
                    New Referral Submission
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
                      <X size={20} />
                  </button>
              </div>
              
              <form onSubmit={handleSubmitReferral} className="p-6 space-y-5">
                <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Client Name</label>
                    <div className="relative">
                        <User size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                        <input 
                            required
                            name="client_name"
                            value={formData.client_name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                            placeholder="Enter client name"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Client Phone</label>
                    <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                        <input 
                            required
                            name="client_phone"
                            value={formData.client_phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Services Provided</label>
                    <div className="relative">
                        <select
                            required
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none shadow-sm"
                        >
                            <option value="" disabled>Select a service</option>
                            {unit.services && unit.services.map((s, i) => (
                                /* Assuming s is an object with a name property based on your services map above */
                                <option key={i} value={s.name || s}>{s.name || s}</option>
                            ))}
                        </select>
                        <ChevronRight size={16} className="absolute right-3.5 top-2.5 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">Notes (Optional)</label>
                    <textarea 
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none shadow-sm"
                        placeholder="Any specific details..."
                    />
                </div>

                <div className="pt-3 flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowModal(false)} 
                        className="flex-1 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                    Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <>Submit Referral <ChevronRight size={14} /></>}
                    </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default BusinessDetail;