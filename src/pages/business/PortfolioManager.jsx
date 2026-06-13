import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Save, Loader2, Settings, Briefcase, 
  MapPin, Mail, Phone, Globe, Camera, X, UploadCloud, 
  Instagram, Facebook, Linkedin, Share2, AlertTriangle, User , Image
} from "lucide-react";

import { supabase } from "../../supabase/supabaseClient";
import { useTheme } from "../../context/ThemeContext"; 

const EMPTY_UNIT = {
  id: "",
  name: "",
  website: "",
  email: "",
  primary_phone: "",
  location: "",
  address: "",
  description: "",
  services: [],
  gallery: [],
  logo: "",
  instagram: "",
  facebook: "",
  linkedin: ""
};

const PortfolioManager = () => {
  const [unit, setUnit] = useState(EMPTY_UNIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

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
            id, business_name, website, email, primary_phone, location, 
            address, description, logo_url, instagram, facebook, linkedin,
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
      const { error } = await supabase.from('business_unit_services').update({
          service_name: service.name, description: service.description,
        }).eq('id', service.id);
      if (error) console.error('Failed to update service', service.id, error);
    }

    let finalServices = unit.services;
    const newServices = unit.services.filter((s) => !s.id && (s.name || s.description));
    if (newServices.length) {
      const { data: insertedServices, error } = await supabase.from('business_unit_services').insert(
          newServices.map((s) => ({ business_unit_id: unit.id, service_name: s.name, description: s.description }))
        ).select();

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
      const { error: updateError } = await supabase.from('business_units').update({
          website: unit.website, primary_phone: unit.primary_phone,
          location: unit.location, address: unit.address,
          description: unit.description, instagram: unit.instagram,
          facebook: unit.facebook, linkedin: unit.linkedin,
          logo_url: unit.logo,
        }).eq('id', unit.id);

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
     SERVICES & GALLERY
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
    setUnit((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
    galleryItemsRef.current = previousItems.filter((_, i) => i !== idx);

    try {
      const { error } = await supabase.from('business_unit_gallery').delete().eq('id', galleryItem.id);
      if (error) throw error;
    } catch (err) {
      console.error('Failed to delete gallery image', err);
      setUnit((prev) => ({ ...prev, gallery: previousGallery }));
      galleryItemsRef.current = previousItems;
    }
  };

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

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 mb-8">
           <div className="space-y-3">
             <div className={`h-10 w-64 rounded-md ${pulseClass} animate-pulse`} />
             <div className={`h-4 w-48 rounded-md ${pulseClass} animate-pulse`} />
           </div>
           <div className={`h-12 w-32 rounded-lg ${pulseClass} animate-pulse`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
           <div className="lg:col-span-8 space-y-6">
              {/* Removed borders from skeletons */}
              <div className={`h-[400px] rounded-2xl ${pulseClass} animate-pulse`} />
              <div className={`h-[300px] rounded-2xl ${pulseClass} animate-pulse`} />
           </div>
           <div className="lg:col-span-4">
              <div className={`h-[600px] rounded-2xl ${pulseClass} animate-pulse`} />
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-[1400px] mx-auto pb-16 space-y-6 lg:space-y-8 font-['Plus_Jakarta_Sans',sans-serif] px-4 lg:px-0 mt-2 lg:mt-4 transition-colors duration-300 ${textPrimary}`}>

      {/* HEADER & GLOBAL SAVE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            Division Configuration
          </h1>
          <p className={`text-sm font-medium ${textSecondary}`}>
            Configure your division's market identity, service verticals, and execution portfolio.
          </p>
        </div>
        <button
          onClick={saveProfile}
          disabled={saving}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg text-sm font-semibold transition-all shadow-sm bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] disabled:opacity-50"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* WARNING BANNER */}
      <div className={`p-4 rounded-xl border flex gap-3 items-start ${
        isLight ? 'bg-[#DAC18A]/10 border-[#DAC18A]/20' : 'bg-[#DAC18A]/5 border-[#DAC18A]/10'
      }`}>
        <AlertTriangle size={16} className="text-[#DAC18A] shrink-0 mt-0.5" />
        <div>
          <h4 className={`text-sm font-bold mb-1 ${textPrimary}`}>Important Notice</h4>
          <p className={`text-xs font-medium leading-relaxed ${textSecondary}`}>
            Remember to save your changes. High-resolution images are recommended for the portfolio, keeping each file under 5MB for optimal load times.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-6 lg:space-y-8">

          {/* BUSINESS INFO CARD */}
          <div className={`p-6 lg:p-8 rounded-2xl border transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
              <Settings size={18} className="text-[#81B398]" /> Division Overview
            </h4>
            
            <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* Circular Logo Upload */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div
                  onClick={() => logoInputRef.current.click()}
                  className={`relative w-24 h-24 rounded-full border-2 overflow-hidden cursor-pointer group shadow-sm flex items-center justify-center transition-all ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'
                  }`}
                >
                  {logoUploading ? (
                    <Loader2 size={24} className="text-[#81B398] animate-spin" />
                  ) : unit.logo ? (
                    <img src={unit.logo} alt="Business Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Briefcase size={28} className={textSecondary} />
                  )}

                  {!logoUploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <Camera size={20} className="text-white" />
                    </div>
                  )}
                  <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={handleLogoUpload} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Brand Logo</span>
              </div>

              {/* Inputs */}
              <div className="flex-1 space-y-4">
                <Input
                  label="Division Name"
                  value={unit.name}
                  onChange={v => setUnit({ ...unit, name: v })}
                  placeholder="e.g. Vynx"
                  disabled
                  isLight={isLight}
                />
                <Input
                  label="Website URL"
                  value={unit.website}
                  icon={<Globe size={16} />}
                  onChange={v => setUnit({ ...unit, website: v })}
                  placeholder="https://..."
                  isLight={isLight}
                />
              </div>
            </div>

            <div className="mt-4">
               <Textarea
                 label="Executive Summary"
                 value={unit.description}
                 onChange={v => setUnit({ ...unit, description: v })}
                 placeholder="e.g. Vynx delivers enterprise-grade software architecture and comprehensive digital solutions for high-tier commercial infrastructure."
                 isLight={isLight}
                 rows={4}
               />
            </div>
          </div>

          {/* CONTACT & LOCATION CARD */}
          <div className={`p-6 lg:p-8 rounded-2xl border transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
              <MapPin size={18} className="text-[#81B398]" /> Contact & Location
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  value={unit.email}
                  icon={<Mail size={16} />}
                  onChange={v => setUnit({ ...unit, email: v })}
                  disabled
                  isLight={isLight}
                />
                <Input
                  label="Primary Phone"
                  value={unit.primary_phone}
                  icon={<Phone size={16} />}
                  onChange={v => setUnit({ ...unit, primary_phone: v })}
                  isLight={isLight}
                />
              </div>
              <Input
                label="City / Location"
                value={unit.location}
                onChange={v => setUnit({ ...unit, location: v })}
                placeholder="e.g. Bengaluru, Karnataka"
                isLight={isLight}
              />
              <Textarea
                label="Full Address"
                value={unit.address}
                onChange={v => setUnit({ ...unit, address: v })}
                isLight={isLight}
                rows={2}
              />
            </div>
          </div>

          {/* SOCIAL MEDIA LINKS */}
          <div className={`p-6 lg:p-8 rounded-2xl border transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
              <Share2 size={18} className="text-[#81B398]" /> Social Media Links
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Instagram URL"
                value={unit.instagram}
                icon={<Instagram size={16} />}
                onChange={v => setUnit({ ...unit, instagram: v })}
                placeholder="https://instagram.com/..."
                isLight={isLight}
              />
              <Input
                label="Facebook URL"
                value={unit.facebook}
                icon={<Facebook size={16} />}
                onChange={v => setUnit({ ...unit, facebook: v })}
                placeholder="https://facebook.com/..."
                isLight={isLight}
              />
              <Input
                label="LinkedIn URL"
                value={unit.linkedin}
                icon={<Linkedin size={16} />}
                onChange={v => setUnit({ ...unit, linkedin: v })}
                placeholder="https://linkedin.com/in/..."
                isLight={isLight}
              />
            </div>
          </div>

          {/* GALLERY CARD */}
          <div className={`p-6 lg:p-8 rounded-2xl border transition-all duration-300 ${surfaceClass}`}>
            <div className="flex justify-between items-center mb-6 border-b pb-4" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
              <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Camera size={18} className="text-[#81B398]" /> Execution Portfolio
              </h4>
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-xs font-semibold transition-all disabled:opacity-50 ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#131720] border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'
                }`}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                {uploading ? "Uploading..." : "Add Image"}
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFile} />
            </div>

            {unit.gallery.length === 0 ? (
              <div className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center ${isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]/50' : 'border-white/5 bg-[#131720]/50'}`}>
                <Image size={32} className={`mb-3 opacity-30 ${textSecondary}`} />
                <p className={`text-sm font-medium ${textSecondary}`}>No portfolio assets uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {unit.gallery.map((img, i) => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={img} className="relative group aspect-square">
                      <img
                        src={img}
                        className={`rounded-xl object-cover w-full h-full border shadow-sm ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}
                        alt={`Gallery ${i}`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl" />
                      <button
                        onClick={() => removeGalleryImage(i)}
                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-[#F0524F] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all shadow-sm hover:bg-white hover:scale-110"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN (4 cols) - Sticky Services */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`p-6 lg:p-8 rounded-2xl border sticky top-6 transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
              <Briefcase size={18} className="text-[#81B398]" /> Core Service Verticals
            </h4>

            <div className="space-y-4 mb-6">
              <AnimatePresence>
                {unit.services.map((s, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    key={s.id || `new-${i}`}
                    className={`border rounded-xl p-4 space-y-3 transition-colors ${
                        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#131720] border-transparent hover:border-[#81B398]'
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <Input
                        label="Vertical Name"
                        value={s.name}
                        onChange={v => updateService(i, "name", v)}
                        placeholder="e.g. Enterprise Web Platforms"
                        isLight={isLight}
                      />
                      <Textarea
                        label="Short Description"
                        value={s.description}
                        onChange={v => updateService(i, "description", v)}
                        placeholder="e.g. Development of high-performance, immersive digital architecture..."
                        isLight={isLight}
                        rows={2}
                      />
                    </div>
                    <div className={`flex justify-end border-t pt-3 mt-2 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
                      <button
                        onClick={() => removeService(i)}
                        className="text-[#F0524F] text-xs font-bold uppercase flex items-center gap-1.5 hover:text-[#D44846] transition-colors"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={addService}
              className={`w-full py-3 border border-dashed rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  isLight ? 'border-[#81B398] text-[#81B398] hover:bg-[#81B398]/5' : 'border-[#81B398] text-[#81B398] hover:bg-[#81B398]/10'
              }`}
            >
              <Plus size={16} /> Add New Vertical
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

/* =======================
   HELPER COMPONENTS
======================= */

const Input = ({ label, value, onChange, icon, isLight, disabled, ...props }) => {
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const inputBg = isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent focus:bg-[#222938] focus:border-[#81B398]';
  const disabledBg = isLight ? 'bg-[#E2E8F0] opacity-70 cursor-not-allowed' : 'bg-[#1A202C] opacity-70 cursor-not-allowed text-[#718096]';

  return (
    <div className="w-full space-y-1.5">
      <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>{label}</label>
      <div className="relative group">
        {icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${textSecondary}`}>
            {icon}
          </div>
        )}
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full rounded-lg py-2.5 px-4 text-sm font-medium outline-none transition-all border ${inputBg} ${icon ? "pl-11" : ""} ${disabled ? disabledBg : ""}`}
          {...props}
        />
      </div>
      </div>
  );
};

const Textarea = ({ label, value, onChange, isLight, ...props }) => {
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const inputBg = isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent focus:bg-[#222938] focus:border-[#81B398]';

  return (
    <div className="w-full space-y-1.5">
      <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg p-4 text-sm font-medium outline-none resize-none transition-all border ${inputBg}`}
        {...props}
      />
    </div>
  );
};

export default PortfolioManager;