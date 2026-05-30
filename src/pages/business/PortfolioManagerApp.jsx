import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Save, Loader2, Settings, Briefcase, 
  MapPin, Mail, Phone, Globe, Camera, X, UploadCloud, 
  Upload, Instagram, Facebook, Linkedin, Share2, AlertTriangle, ImagePlus
} from "lucide-react";

import { supabase } from "../../supabase/supabaseClient";
import { useTheme } from "../../context/ThemeContext";

const EMPTY_UNIT = {
  id: "", name: "", website: "", email: "", primary_phone: "",
  location: "", address: "", description: "", services: [],
  gallery: [], logo: "", instagram: "", facebook: "", linkedin: ""
};

const PortfolioManagerApp = () => {
  const [unit, setUnit] = useState(EMPTY_UNIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- THEME INTEGRATION ---
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const originalServices = useRef([]);
  const galleryItemsRef = useRef([]);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  /* =======================
     FETCH BUSINESS UNIT
  ======================= */
  useEffect(() => {
    const load = async () => {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error("Supabase auth error", authError);
          return;
        }

        const userId = authData?.user?.id;
        if (!userId) {
          console.error("No authenticated user found");
          return;
        }

        const { data, error } = await supabase
          .from('business_units')
          .select(`
            id, business_name, website, email, primary_phone,
            location, address, description, logo_url,
            instagram, facebook, linkedin,
            business_unit_services ( id, service_name, description ),
            business_unit_gallery ( id, image_url )
          `)
          .eq('manager_id', userId)
          .single();

        if (error) {
          console.error("Failed to load business unit", error);
          return;
        }

        const normalized = {
          id: data.id,
          name: data.business_name || '',
          website: data.website || '',
          email: data.email || '',
          primary_phone: data.primary_phone || '',
          location: data.location || '',
          address: data.address || '',
          description: data.description || '',
          services: data.business_unit_services?.map((s) => ({
              id: s.id, name: s.service_name, description: s.description
            })) || [],
          gallery: data.business_unit_gallery?.map((g) => g.image_url) || [],
          logo: data.logo_url || '',
          instagram: data.instagram || '',
          facebook: data.facebook || '',
          linkedin: data.linkedin || '',
        };

        galleryItemsRef.current = data.business_unit_gallery?.map((g) => ({
          id: g.id, url: g.image_url,
        })) || [];
        originalServices.current = normalized.services.map((service) => ({ ...service }));

        setUnit(normalized);
      } catch (e) {
        console.error("Failed to load business unit", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const saveServices = async () => {
    if (!unit.id) return unit.services;

    const currentIds = new Set(unit.services.filter((s) => s.id).map((s) => s.id));
    const deletedIds = originalServices.current
      .filter((s) => s.id && !currentIds.has(s.id))
      .map((s) => s.id);

    if (deletedIds.length) {
      const { error } = await supabase.from('business_unit_services').delete().in('id', deletedIds);
      if (error) console.error('Failed to delete services', error);
    }

    for (const service of unit.services.filter((s) => s.id)) {
      const { error } = await supabase
        .from('business_unit_services')
        .update({ service_name: service.name, description: service.description })
        .eq('id', service.id);
      if (error) console.error('Failed to update service', service.id, error);
    }

    let finalServices = unit.services;
    const newServices = unit.services.filter((s) => !s.id && (s.name || s.description));
    if (newServices.length) {
      const { data: insertedServices, error } = await supabase
        .from('business_unit_services')
        .insert(newServices.map((s) => ({
            business_unit_id: unit.id, service_name: s.name, description: s.description,
        })))
        .select();

      if (error) {
        console.error('Failed to insert new services', error);
      } else if (insertedServices?.length) {
        const updatedServices = [...unit.services];
        let insertOffset = 0;
        for (let i = 0; i < updatedServices.length; i += 1) {
          if (!updatedServices[i].id && insertOffset < insertedServices.length) {
            updatedServices[i] = { ...updatedServices[i], id: insertedServices[insertOffset].id };
            insertOffset += 1;
          }
        }
        finalServices = updatedServices;
        setUnit((prev) => ({ ...prev, services: updatedServices }));
      }
    }
    return finalServices;
  };

  const saveProfile = async () => {
    if (!unit.id) return;
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('business_units')
        .update({
          website: unit.website, primary_phone: unit.primary_phone,
          location: unit.location, address: unit.address, description: unit.description,
          instagram: unit.instagram, facebook: unit.facebook, linkedin: unit.linkedin,
          logo_url: unit.logo,
        })
        .eq('id', unit.id);

      if (updateError) {
        console.error('Failed to update business unit', updateError);
        return;
      }

      const finalServices = await saveServices();
      originalServices.current = finalServices.map((service) => ({ ...service }));
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSaving(false);
    }
  };

  /* =======================
     LOGO UPLOAD
  ======================= */
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !unit.id) return;

    const uploadPath = `logos/${unit.id}-${Date.now()}-${file.name}`;
    try {
      setLogoUploading(true);
      const { error: uploadError } = await supabase.storage.from('business-logos').upload(uploadPath, file);
      if (uploadError) throw uploadError;

      const { data: publicData, error: publicUrlError } = supabase.storage.from('business-logos').getPublicUrl(uploadPath);
      if (publicUrlError) throw publicUrlError;

      const logoUrl = publicData.publicUrl;
      const { error: updateError } = await supabase.from('business_units').update({ logo_url: logoUrl }).eq('id', unit.id);
      if (updateError) throw updateError;

      setUnit((prev) => ({ ...prev, logo: logoUrl }));
    } catch (err) {
      console.error('Logo upload failed', err);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  /* =======================
     SERVICES LOGIC
  ======================= */
  const addService = () => setUnit({ ...unit, services: [...unit.services, { id: "", name: "", description: "" }] });
  const updateService = (idx, field, value) => {
    const updated = [...unit.services];
    updated[idx] = { ...updated[idx], [field]: value };
    setUnit({ ...unit, services: updated });
  };
  const removeService = (idx) => setUnit({ ...unit, services: unit.services.filter((_, i) => i !== idx) });

  const removeGalleryImage = async (idx) => {
    const galleryItem = galleryItemsRef.current[idx];
    if (!galleryItem) return;

    const previousGallery = [...unit.gallery];
    const previousItems = [...galleryItemsRef.current];
    const updatedGallery = previousGallery.filter((_, i) => i !== idx);
    const updatedItems = previousItems.filter((_, i) => i !== idx);

    setUnit((prev) => ({ ...prev, gallery: updatedGallery }));
    galleryItemsRef.current = updatedItems;

    try {
      const { error } = await supabase.from('business_unit_gallery').delete().eq('id', galleryItem.id);
      if (error) {
        console.error('Failed to delete gallery image', error);
        setUnit((prev) => ({ ...prev, gallery: previousGallery }));
        galleryItemsRef.current = previousItems;
      }
    } catch (err) {
      console.error('Failed to delete gallery image', err);
      setUnit((prev) => ({ ...prev, gallery: previousGallery }));
      galleryItemsRef.current = previousItems;
    }
  };

  /* =======================
     GALLERY UPLOAD
  ======================= */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !unit.id) return;

    const uploadPath = `gallery/${unit.id}-${Date.now()}-${file.name}`;
    try {
      setUploading(true);
      const { error: uploadError } = await supabase.storage.from('business-gallery').upload(uploadPath, file);
      if (uploadError) throw uploadError;

      const { data: publicData, error: publicUrlError } = supabase.storage.from('business-gallery').getPublicUrl(uploadPath);
      if (publicUrlError) throw publicUrlError;

      const imageUrl = publicData.publicUrl;
      const { data: insertedRows, error: insertError } = await supabase.from('business_unit_gallery').insert({
          business_unit_id: unit.id, image_url: imageUrl,
        }).select();

      if (insertError) throw insertError;

      const galleryId = insertedRows?.[0]?.id;
      if (galleryId) {
        galleryItemsRef.current = [{ id: galleryId, url: imageUrl }, ...galleryItemsRef.current];
      }
      setUnit((prev) => ({ ...prev, gallery: [imageUrl, ...prev.gallery] }));
    } catch (err) {
      console.error('Upload failed', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className={`h-8 w-8 animate-spin mb-4 ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`} strokeWidth={2.5} />
        <p className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>

      {/* HEADER SECTION */}
      <div className="mb-4 px-1">
        <h2 className="text-2xl font-extrabold tracking-tight mb-4">Profile</h2>
        
        {/* Warning Card */}
        <div className={`rounded p-5 border border-red-500 flex items-center gap-3 transition-colors duration-200 ${
          isLight ? 'bg-amber-50/50 border-amber-100 text-amber-700' : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
        }`}>
          <AlertTriangle size={16} strokeWidth={2.5} className="shrink-0" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider leading-none">
            Remember to save your changes before leaving this page.
          </span>
        </div>
      </div>

      {/* BUSINESS OVERVIEW ROW */}
      <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
      }`}>
        <div className="flex items-center gap-5">
          
          {/* Logo Upload - Fully Rounded */}
          <div className="flex flex-col items-center gap-3">
            <div
              onClick={() => logoInputRef.current.click()}
              className={`relative w-20 h-20 rounded-full border flex items-center justify-center overflow-hidden cursor-pointer group shrink-0 transition-all ${
                isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
              }`}
            >
              {logoUploading ? (
                <Loader2 size={20} strokeWidth={2.5} className="text-[#81B398] animate-spin" />
              ) : unit.logo ? (
                <img src={unit.logo} alt="Business Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload size={20} strokeWidth={2.5} className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'} />
              )}

              {!logoUploading && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Upload size={14} strokeWidth={2.5} className="text-white mb-0.5" />
                  <span className="text-white text-[8px] font-bold uppercase tracking-wider">
                    {unit.logo ? "CHANGE" : "UPLOAD"}
                  </span>
                </div>
              )}
              <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
            </div>

            {/* Change Picture Button */}
            <button
              onClick={() => logoInputRef.current.click()}
              disabled={logoUploading}
              className={`px-4 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 ${
                isLight 
                  ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096] hover:border-[#81B398] hover:text-[#81B398]' 
                  : 'bg-[#131720] border-white/10 text-[#9CA3AF] hover:border-[#81B398] hover:text-[#81B398]'
              }`}
            >
              Change Logo
            </button>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-none">
              {unit.name || "Untitled Unit"}
            </h2>
            <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Business Profile</p>
          </div>
        </div>

        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
        >
          {saving ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT COLUMN: Info & Links */}
        <div className="space-y-4">
          <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <Section title="Business Info" icon={<Settings size={16} strokeWidth={2.5} />} isLight={isLight}>
              <Input label="Business Name" value={unit.name} onChange={v => setUnit({ ...unit, name: v })} placeholder="e.g. Acme Corp" disabled isLight={isLight} />
              <Input label="Website URL" value={unit.website} icon={<Globe size={16} strokeWidth={2.5} />} onChange={v => setUnit({ ...unit, website: v })} placeholder="https://..." isLight={isLight} />
              <Textarea label="About the Business" value={unit.description} onChange={v => setUnit({ ...unit, description: v })} placeholder="Tell us what makes your business unique..." isLight={isLight} />
            </Section>
          </div>

          <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <Section title="Contact & Location" icon={<MapPin size={16} strokeWidth={2.5} />} isLight={isLight}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Email Address" value={unit.email} icon={<Mail size={16} strokeWidth={2.5} />} onChange={v => setUnit({ ...unit, email: v })} disabled isLight={isLight} />
                <Input label="Phone Number" value={unit.primary_phone} icon={<Phone size={16} strokeWidth={2.5} />} onChange={v => setUnit({ ...unit, primary_phone: v })} isLight={isLight} />
              </div>
              <Input label="City / Location" value={unit.location} onChange={v => setUnit({ ...unit, location: v })} placeholder="e.g. Kochi, Kerala" isLight={isLight} />
              <Textarea label="Full Address" value={unit.address} onChange={v => setUnit({ ...unit, address: v })} isLight={isLight} />
            </Section>
          </div>

          <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <Section title="Social Media Links" icon={<Share2 size={16} strokeWidth={2.5} />} isLight={isLight}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Instagram URL" value={unit.instagram} icon={<Instagram size={16} strokeWidth={2.5} />} onChange={v => setUnit({ ...unit, instagram: v })} placeholder="https://instagram.com/..." isLight={isLight} />
                <Input label="Facebook URL" value={unit.facebook} icon={<Facebook size={16} strokeWidth={2.5} />} onChange={v => setUnit({ ...unit, facebook: v })} placeholder="https://facebook.com/..." isLight={isLight} />
                <Input className="md:col-span-2" label="LinkedIn URL" value={unit.linkedin} icon={<Linkedin size={16} strokeWidth={2.5} />} onChange={v => setUnit({ ...unit, linkedin: v })} placeholder="https://linkedin.com/in/..." isLight={isLight} />
              </div>
            </Section>
          </div>
        </div>

        {/* RIGHT COLUMN: Services & Gallery */}
        <div className="space-y-4">
          
          {/* SERVICES */}
          <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <h4 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 mb-5 pb-3 border-b ${isLight ? 'text-[#718096] border-[#E2E8F0]' : 'text-[#9CA3AF] border-white/10'}`}>
              <Briefcase size={16} strokeWidth={2.5} className="text-[#81B398]" /> Services Offered
            </h4>

            <div className="space-y-4 mb-5">
              <AnimatePresence>
                {unit.services.map((s, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    key={s.id || `new-${i}`}
                    className={`border rounded-2xl p-4 space-y-4 transition-colors ${
                      isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
                    }`}
                  >
                    <Input label="Service Name" value={s.name} onChange={v => updateService(i, "name", v)} placeholder="e.g. Consulting" className={isLight ? "bg-white" : "bg-[#222938]"} isLight={isLight} />
                    <Textarea label="Short Description" value={s.description} onChange={v => updateService(i, "description", v)} placeholder="Details..." className={isLight ? "bg-white" : "bg-[#222938]"} isLight={isLight} />
                    
                    <div className={`flex justify-end border-t pt-3 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                      <button onClick={() => removeService(i)} className="text-[#F0524F] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-opacity hover:opacity-70">
                        <Trash2 size={14} strokeWidth={2.5} /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={addService}
              className={`w-full py-4 border border-dashed rounded-2xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 active:scale-95 ${
                  isLight ? 'border-[#81B398] text-[#81B398] hover:bg-[#81B398]/5' : 'border-[#81B398] text-[#81B398] hover:bg-[#81B398]/10'
              }`}
            >
              <Plus size={16} strokeWidth={2.5} /> Add New Service
            </button>
          </div>

          {/* GALLERY */}
          <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <div className={`flex justify-between items-center mb-4 pb-3 border-b ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
              <div>
                <h4 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  <Camera size={16} strokeWidth={2.5} className="text-[#81B398]" /> Photo Gallery 
                </h4>
                <p className={`text-[8px] font-bold uppercase tracking-widest ${isLight ? 'text-[#A0AEC0]' : 'text-[#718096]'}`}>
                  Images must be under 10MB
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 active:scale-95 ${
                    isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398]'
                }`}
              >
                {uploading ? <Loader2 size={14} strokeWidth={2.5} className="animate-spin text-[#81B398]" /> : <UploadCloud size={14} strokeWidth={2.5} className="text-[#81B398]" />}
                {uploading ? "Uploading..." : "Add Image"}
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFile} />
            </div>

            {unit.gallery.length === 0 ? (
              <div className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]' : 'border-white/10 bg-[#131720]'}`}>
                <ImagePlus size={32} strokeWidth={2.5} className={`mb-3 ${isLight ? 'text-[#A0AEC0]' : 'text-[#718096]'}`} />
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <AnimatePresence>
                  {unit.gallery.map((img, i) => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={img} className="relative group aspect-square">
                      <img src={img} className={`rounded-2xl object-cover w-full h-full border ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`} alt={`Gallery ${i}`} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all rounded-2xl" />
                      <button
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-2 right-2 bg-white/90 p-2 rounded-xl text-[#F0524F] opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-105 border border-transparent hover:border-[#F0524F]/20"
                      >
                        <X size={14} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

/* =======================
    HELPER COMPONENTS
======================= */

const Section = ({ title, icon, children, isLight }) => (
  <div>
    <h4 className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 mb-5 pb-3 border-b ${isLight ? 'text-[#718096] border-[#E2E8F0]' : 'text-[#9CA3AF] border-white/10'}`}>
      <span className="text-[#81B398]">{icon}</span> {title}
    </h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, value, onChange, icon, className, isLight, ...props }) => (
  <div className="w-full">
    <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{label}</label>
    <div className="relative group">
      {icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-[#718096] group-focus-within:text-[#81B398]' : 'text-[#9CA3AF] group-focus-within:text-[#81B398]'}`}>
          {icon}
        </div>
      )}
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={props.disabled}
        className={`w-full border rounded-xl py-3.5 px-4 text-sm font-bold transition-all outline-none ${
          isLight 
            ? "bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]" 
            : "bg-[#131720] border-transparent text-white focus:border-[#81B398]"
        } ${icon ? "pl-11" : ""} ${className ?? ""} ${
          props.disabled ? (isLight ? "opacity-60 cursor-not-allowed" : "opacity-50 cursor-not-allowed") : ""
        }`}
        {...props}
      />
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, className, isLight, ...props }) => (
  <div className="w-full">
    <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{label}</label>
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={`w-full border rounded-xl p-4 text-sm font-bold transition-all resize-none outline-none ${
          isLight 
            ? "bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]" 
            : "bg-[#131720] border-transparent text-white focus:border-[#81B398]"
      } ${className ?? ""}`}
      {...props}
    />
  </div>
);

export default PortfolioManagerApp;