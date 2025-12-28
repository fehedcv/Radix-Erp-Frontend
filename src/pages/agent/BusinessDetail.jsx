import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Star, Phone, Globe,
  CheckCircle2, Briefcase, ExternalLink,
  Info, Mail, Zap, ChevronRight,
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
    const baseUrl = "http://business-chain.local:8000"; // Replace with your Frappe base URL
    
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
          description: data.description || '',
          services: (data.services || []).map(s => s.name),
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
      className="max-w-[1200px] mx-auto space-y-6 pb-16 font-sans px-4 sm:px-6"
    >

      {/* 1. NAV & HEADER */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
        <button onClick={() => navigate('/agent/units')} className="hover:text-[#007ACC] transition-colors">
          Directory
        </button>
        <ChevronRight size={10} />
        <span className="text-slate-900">{unit.name}</span>
      </nav>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <Briefcase size={120} />
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 bg-slate-900 text-white flex items-center justify-center rounded-2xl shrink-0 shadow-lg shadow-slate-200">
              <Briefcase size={32} />
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                {unit.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded border border-emerald-100 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 size={10} /> Verified Unit
                </span>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                  <MapPin size={12} className="text-[#007ACC]" /> {unit.location}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="h-14 px-8 bg-[#007ACC] text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-[#006bb3] active:scale-95 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap lg:self-center"
          >
            <Zap size={16} fill="currentColor" /> Submit New Referral
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Gallery / Featured Image */}
          <div className="h-64 md:h-80 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
            {unit.gallery && unit.gallery.length > 0 ? (
               <img
               src={unit.gallery[0]}
               alt={unit.name}
               onError={(e) => {
                 e.target.style.display = 'none'; // Hide if broken
                 e.target.parentElement.classList.add('bg-slate-200'); // Add fallback background
               }}
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <ImageIcon size={48} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest">No Imagery Available</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 text-white">
                <span className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    Top Rated Provider
                </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <Info size={12} /> About The Team
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              {unit.description || "No specific description provided for this business unit."}
            </p>
          </div>

          {/* Services */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <Star size={12} /> Service Capabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unit.services.length > 0 ? unit.services.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">{s}</span>
                </div>
              )) : (
                <p className="text-xs text-slate-400 italic">No services listed.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Contact */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6">
              Contact Information
            </h4>
            
            <div className="space-y-4">
                {unit.website && (
                    <a
                    href={unit.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex justify-between items-center group p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                    >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#007ACC] flex items-center justify-center">
                            <Globe size={14} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase text-slate-400">Website</p>
                            <p className="text-xs font-bold text-slate-800">Visit Link</p>
                        </div>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-[#007ACC]" />
                    </a>
                )}

                <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Mail size={14} />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-[9px] font-bold uppercase text-slate-400">Email Address</p>
                        <p className="text-xs font-bold text-slate-800 truncate">{unit.email || 'N/A'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-transparent">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Phone size={14} />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase text-slate-400">Phone Number</p>
                        <p className="text-xs font-bold text-slate-800">{unit.contact || 'N/A'}</p>
                    </div>
                </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-100">
                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Need help? Contact support if this information is incorrect.
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. REFERRAL FORM MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
                    New Referral
                  </h3>
                  <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                      <X size={18} />
                  </button>
              </div>
              
              <form onSubmit={handleSubmitReferral} className="p-6 space-y-4">
                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Client Name</label>
                    <div className="relative">
                        <User size={14} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                            required
                            name="client_name"
                            value={formData.client_name}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] transition-all"
                            placeholder="Enter client name"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Client Phone</label>
                    <div className="relative">
                        <Phone size={14} className="absolute left-3 top-3.5 text-slate-400" />
                        <input 
                            required
                            name="client_phone"
                            value={formData.client_phone}
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] transition-all"
                            placeholder="Enter phone number"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Service Required</label>
                    <div className="relative">
                        <select
                            required
                            name="service"
                            value={formData.service}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] transition-all appearance-none"
                        >
                            <option value="" disabled>Select a service</option>
                            {unit.services.map((s, i) => (
                                <option key={i} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronRight size={14} className="absolute right-3 top-3.5 text-slate-400 rotate-90" />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Notes (Optional)</label>
                    <textarea 
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] transition-all resize-none"
                        placeholder="Any specific details..."
                    />
                </div>

                <div className="pt-2 flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setShowModal(false)} 
                        className="flex-1 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                    Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 bg-[#007ACC] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006bb3] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : <>Submit <ChevronRight size={10} /></>}
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