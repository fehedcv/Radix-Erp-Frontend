import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Save,
  Eye,
  Loader2,
  Layout,
  Settings,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Globe,
  Camera,
  X,
  UploadCloud,
  Image,
  Upload,
  Instagram,
  Facebook,
  Linkedin,
  Share2,
  AlertTriangle
} from "lucide-react";

import frappeApi from "../../api/frappeApi";
import { useTheme } from "../../context/ThemeContext"; // Theme Context

const SITE_URL = import.meta.env.VITE_FRAPPE_URL?.replace(/\/api$/, "") || "http://16.171.38.6:8000/";

const EMPTY_UNIT = {
  id: "",
  name: "",
  website: "",
  email: "",
  contact: "",
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

const resolveUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : SITE_URL + url;
};

const PortfolioManager = () => {
  const [unit, setUnit] = useState(EMPTY_UNIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // --- THEME INTEGRATION ---
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Frozen snapshot of the last-saved state — used to compute the diff
  const originalUnit = useRef(null);

  const fileInputRef = useRef(null);
  const logoInputRef = useRef(null);

  /* =======================
      FETCH BUSINESS UNIT
  ======================= */
  useEffect(() => {
    const load = async () => {
      try {
        const res = await frappeApi.get(
          "/method/business_chain.api.business_unit.get_my_business_unit"
        );

        const d = res.data.message;

        const normalized = {
          id: d.id,
          name: d.name ?? "",
          website: d.website ?? "",
          email: d.email ?? "",
          contact: d.contact ?? "",
          location: d.location ?? "",
          address: d.address ?? "",
          description: d.description ?? "",
          services: d.services ?? [],
          gallery: d.gallery ?? [],
          logo: d.logo ?? "",
          instagram: d.instagram ?? "",
          facebook: d.facebook ?? "",
          linkedin: d.linkedin ?? "",
        };

        setUnit(normalized);
        originalUnit.current = JSON.parse(JSON.stringify(normalized));
      } catch (e) {
        console.error("Failed to load business unit", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =======================
      DIFF / PATCH HELPERS
  ======================= */
  const computePatch = (original, current) => {
    const patch = {};
    const scalars = [
      "website", "contact", "location", "address",
      "description", "instagram", "facebook", "linkedin",
    ];
    for (const key of scalars) {
      if (original[key] !== current[key]) {
        patch[key] = current[key];
      }
    }

    const origById = Object.fromEntries(
      (original.services ?? []).map((s) => [s.id, s])
    );
    const currIds = new Set(current.services.map((s) => s.id).filter(Boolean));

    const upserted = current.services.filter((s) => {
      if (!s.id) return true;
      const o = origById[s.id];
      return !o || o.name !== s.name || o.description !== s.description;
    });

    const deletedIds = (original.services ?? [])
      .filter((s) => s.id && !currIds.has(s.id))
      .map((s) => s.id);

    if (upserted.length || deletedIds.length) {
      patch.services = { upserted, deleted_ids: deletedIds };
    }

    const origGallerySet = new Set(original.gallery ?? []);
    const currGallerySet = new Set(current.gallery ?? []);

    const addedGallery   = current.gallery.filter((u) => !origGallerySet.has(u));
    const removedGallery = (original.gallery ?? []).filter((u) => !currGallerySet.has(u));

    if (addedGallery.length || removedGallery.length) {
      patch.gallery = { added: addedGallery, removed: removedGallery };
    }

    return patch;
  };

  /* =======================
      SAVE PROFILE (diff-aware)
  ======================= */
  const saveProfile = async () => {
    if (!originalUnit.current) return;

    const patch = computePatch(originalUnit.current, unit);

    if (!Object.keys(patch).length) {
      return;
    }

    setSaving(true);
    try {
      await frappeApi.post(
        "/method/business_chain.api.business_unit.update_my_business_unit",
        { patch }
      );
      originalUnit.current = JSON.parse(JSON.stringify(unit));
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  /* =======================
      LOGO UPLOAD
  ======================= */
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("is_private", 0);

    try {
      setLogoUploading(true);
      const res = await frappeApi.post(
        "/method/business_chain.api.business_unit.upload_business_unit_logo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const fileUrl = res.data.message.file_url;
      setUnit((prev) => ({ ...prev, logo: fileUrl }));
      originalUnit.current = { ...originalUnit.current, logo: fileUrl };
    } catch (err) {
      console.error("Logo upload failed", err);
      alert("Failed to upload logo. Please try again.");
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  /* =======================
      SERVICES LOGIC
  ======================= */
  const addService = () => {
    setUnit({ ...unit, services: [...unit.services, { id: "", name: "", description: "" }] });
  };

  const updateService = (idx, field, value) => {
    const updated = [...unit.services];
    updated[idx] = { ...updated[idx], [field]: value };
    setUnit({ ...unit, services: updated });
  };

  const removeService = (idx) => {
    setUnit({ ...unit, services: unit.services.filter((_, i) => i !== idx) });
  };

  /* =======================
      GALLERY UPLOAD
  ======================= */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("is_private", 0);

    try {
      setUploading(true);
      const res = await frappeApi.post("/method/upload_file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = res.data.message.file_url;
      setUnit((prev) => ({ ...prev, gallery: [fileUrl, ...prev.gallery] }));
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader2 className={`h-10 w-10 animate-spin mb-4 ${isLight ? 'text-[#61D9DE]' : 'text-[#007ACC]'}`} />
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>
          Loading Profile...
        </p>
      </div>
    );
  }

  return (
    <div className={`max-w-[1400px] mx-auto pb-16 space-y-6 font-['Plus_Jakarta_Sans'] px-2 sm:px-0 transition-colors duration-300 ${isLight ? 'text-[#1A1D1F]' : 'text-[#E2E8F0]'}`}>

      {/* HEADER */}
      <div className={`border p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 rounded-2xl transition-all duration-300 ${
          isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10'
      }`}>
        <div className="flex items-start sm:items-center gap-4">

          {/* LOGO UPLOAD BUTTON */}
          <div
            onClick={() => logoInputRef.current.click()}
            className={`relative h-14 w-14 border flex items-center justify-center rounded-xl overflow-hidden cursor-pointer group shadow-sm shrink-0 transition-all ${
                isLight ? 'bg-white border-[#E8ECEF]' : 'bg-blue-50 border-blue-100'
            }`}
          >
            {logoUploading ? (
              <Loader2 size={20} className="text-[#61D9DE] animate-spin" />
            ) : unit.logo ? (
              <img
                src={resolveUrl(unit.logo)}
                alt="Business Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Upload size={20} className={isLight ? 'text-[#9A9FA5]' : 'text-slate-400'} />
            )}

            {!logoUploading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={16} className="text-white" />
                <span className="text-white text-[8px] font-bold mt-1 tracking-wider">
                  {unit.logo ? "CHANGE" : "UPLOAD"}
                </span>
              </div>
            )}

            <input
              type="file"
              ref={logoInputRef}
              hidden
              accept="image/*"
              onChange={handleLogoUpload}
            />
          </div>

          <div className="flex flex-col justify-center gap-2.5">
  {/* Title and Subtitle Section */}
  <div className="space-y-1">
    <h2 className={`text-xl font-black uppercase tracking-tight leading-none ${isLight ? 'text-[#1A1D1F]' : 'text-white'}`}>
      {unit.name || "Untitled Unit"}
    </h2>
    <p className={`text-[10px] uppercase font-extrabold tracking-[0.15em] ${isLight ? 'text-[#9A9FA5]' : 'text-slate-500'}`}>
      Business Profile
    </p>
  </div>

  {/* Warning Badge - Perfectly Aligned */}
  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit border transition-colors duration-300 ${
      isLight 
        ? 'bg-amber-50/50 border-amber-100 text-amber-700' 
        : 'bg-amber-500/5 border-amber-500/20 text-amber-500'
  }`}>
    <AlertTriangle size={12} className="shrink-0" />
    <span className="text-[9px] font-bold uppercase tracking-widest leading-none">
      Please save changes • Images must be under 10 MB
    </span>
  </div>
</div>

        </div>
        <div className="flex gap-3">
          <button
            onClick={saveProfile}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isLight ? 'bg-[#1A1D1F] text-white hover:bg-black' : 'bg-black text-white hover:bg-slate-800'
            }`}
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">

          <div className={`border p-6 rounded-2xl transition-all duration-300 ${
              isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10'
          }`}>
            <Section title="Business Info" icon={<Settings size={14} />} isLight={isLight}>
              <Input
                label="Business Name"
                value={unit.name}
                onChange={v => setUnit({ ...unit, name: v })}
                placeholder="e.g. FudyGo Headquarters"
                disabled
                isLight={isLight}
              />
              <Input
                label="Website URL"
                value={unit.website}
                icon={<Globe size={14} />}
                onChange={v => setUnit({ ...unit, website: v })}
                placeholder="https://..."
                isLight={isLight}
              />
              <Textarea
                label="About the Business"
                value={unit.description}
                onChange={v => setUnit({ ...unit, description: v })}
                placeholder="Tell us what makes your business unique..."
                isLight={isLight}
              />
            </Section>
          </div>

          <div className={`border p-6 rounded-2xl transition-all duration-300 ${
              isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10'
          }`}>
            <Section title="Contact & Location" icon={<MapPin size={14} />} isLight={isLight}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  value={unit.email}
                  icon={<Mail size={14} />}
                  onChange={v => setUnit({ ...unit, email: v })}
                  disabled
                  isLight={isLight}
                />
                <Input
                  label="Phone Number"
                  value={unit.contact}
                  icon={<Phone size={14} />}
                  onChange={v => setUnit({ ...unit, contact: v })}
                  isLight={isLight}
                />
              </div>
              <Input
                label="City / Location"
                value={unit.location}
                onChange={v => setUnit({ ...unit, location: v })}
                placeholder="e.g. Kochi, Kerala"
                isLight={isLight}
              />
              <Textarea
                label="Full Address"
                value={unit.address}
                onChange={v => setUnit({ ...unit, address: v })}
                isLight={isLight}
              />
            </Section>
          </div>

          {/* SOCIAL MEDIA LINKS */}
          <div className={`border p-6 rounded-2xl transition-all duration-300 ${
              isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10'
          }`}>
            <Section title="Social Media Links" icon={<Share2 size={14} />} isLight={isLight}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Instagram URL"
                  value={unit.instagram}
                  icon={<Instagram size={14} />}
                  onChange={v => setUnit({ ...unit, instagram: v })}
                  placeholder="https://instagram.com/..."
                  isLight={isLight}
                />
                <Input
                  label="Facebook URL"
                  value={unit.facebook}
                  icon={<Facebook size={14} />}
                  onChange={v => setUnit({ ...unit, facebook: v })}
                  placeholder="https://facebook.com/..."
                  isLight={isLight}
                />
                <Input
                  label="LinkedIn URL"
                  value={unit.linkedin}
                  icon={<Linkedin size={14} />}
                  onChange={v => setUnit({ ...unit, linkedin: v })}
                  placeholder="https://linkedin.com/in/..."
                  isLight={isLight}
                />
              </div>
            </Section>
          </div>

          {/* GALLERY */}
          <div className={`border p-6 rounded-2xl transition-all duration-300 ${
              isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black uppercase flex items-center gap-2">
                <Camera size={14} className={isLight ? 'text-[#61D9DE]' : ''} /> Photo Gallery 
              </h4>
              {/* <span>Hai</span> */}
              <button
                onClick={() => fileInputRef.current.click()}
                disabled={uploading}
                className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${
                    isLight ? 'bg-white border-[#E8ECEF] text-[#1A1D1F] hover:bg-[#F0F2F5]' : 'border-white/10 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
                {uploading ? "Uploading..." : "Add Image"}
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFile} />
            </div>

            {unit.gallery.length === 0 ? (
              <div className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center ${isLight ? 'border-[#E8ECEF] text-[#9A9FA5]' : 'border-slate-100 text-slate-400'}`}>
                <Camera size={32} className="mb-2 opacity-50" />
                <p className="text-xs font-medium">No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {unit.gallery.map((img, i) => (
                    <motion.div layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} key={img} className="relative group aspect-square">
                      <img
                        src={resolveUrl(img)}
                        className={`rounded-xl object-cover w-full h-full border shadow-sm ${isLight ? 'border-[#E8ECEF]' : 'border-slate-100'}`}
                        alt={`Gallery ${i}`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-xl" />
                      <button
                        onClick={() => setUnit({ ...unit, gallery: unit.gallery.filter((_, idx) => idx !== i) })}
                        className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-white hover:scale-110"
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

        {/* RIGHT COLUMN: SERVICES */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`border p-6 rounded-2xl transition-all duration-300 sticky top-6 ${
              isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] shadow-sm' : 'bg-white/5 border-white/10'
          }`}>
            <h4 className="text-[10px] font-black uppercase flex items-center gap-2 mb-4">
              <Briefcase size={14} className={isLight ? 'text-[#61D9DE]' : ''} /> Services Offered
            </h4>

            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {unit.services.map((s, i) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}
                    key={s.id || `new-${i}`}
                    className={`border rounded-xl p-3 space-y-3 transition-colors ${
                        isLight ? 'bg-white border-[#E8ECEF] hover:border-[#61D9DE]/30' : 'bg-slate-50/5 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-full space-y-2">
                        <Input
                          label="Service Name"
                          value={s.name}
                          onChange={v => updateService(i, "name", v)}
                          placeholder="e.g. Catering"
                          className={isLight ? "bg-[#F8FAFB]" : "bg-white"}
                          isLight={isLight}
                        />
                        <Textarea
                          label="Short Description"
                          value={s.description}
                          onChange={v => updateService(i, "description", v)}
                          placeholder="Details..."
                          className={isLight ? "bg-[#F8FAFB]" : "bg-white"}
                          isLight={isLight}
                        />
                      </div>
                    </div>
                    <div className={`flex justify-end border-t pt-2 ${isLight ? 'border-[#E8ECEF]' : 'border-slate-100'}`}>
                      <button
                        onClick={() => removeService(i)}
                        className="text-rose-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button
              onClick={addService}
              className={`w-full py-3 border border-dashed rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isLight ? 'border-[#61D9DE]/50 text-[#61D9DE] hover:bg-[#F0F2F5]' : 'border-slate-300 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Plus size={14} /> Add New Service
            </button>
          </div>
        </div>

      </div>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className={`rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-colors duration-300 ${isLight ? 'bg-white text-[#1A1D1F]' : 'bg-[#0F172A] text-white'}`}
            >
              <div className={`p-6 border-b sticky top-0 z-10 flex justify-between items-center ${isLight ? 'bg-white border-[#E8ECEF]' : 'bg-[#0F172A] border-white/10'}`}>
                <h2 className="text-lg font-black uppercase">Live Preview</h2>
                <button onClick={() => setShowPreview(false)} className={`p-2 rounded-full transition-colors ${isLight ? 'hover:bg-[#F0F2F5]' : 'hover:bg-white/5'}`}>
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                <h1 className="text-3xl font-black mb-2">{unit.name || "Business Name"}</h1>
                <p className={`mb-6 flex items-center gap-2 text-sm ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}><MapPin size={14} /> {unit.location || "Location not set"}</p>
                {unit.gallery.length > 0 && (<img src={resolveUrl(unit.gallery[0])} className="w-full h-64 object-cover rounded-2xl mb-8 border border-slate-100 shadow-sm" />)}
                <div className={`prose prose-sm max-w-none mb-8 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
                  <h3 className={`font-bold uppercase text-xs mb-2 ${isLight ? 'text-black' : 'text-white'}`}>About Us</h3>
                  <p>{unit.description || "No description provided."}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {unit.services.map((s, i) => (
                    <div key={s.id || i} className={`p-4 rounded-xl border transition-colors ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-white/5 border-white/10'}`}><h4 className="font-bold mb-1">{s.name}</h4><p className="text-xs opacity-70">{s.description}</p></div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* =======================
    HELPER COMPONENTS
======================= */

const Section = ({ title, icon, children, isLight }) => (
  <div>
    <h4 className={`text-[10px] font-black uppercase flex items-center gap-2 mb-4 tracking-wide border-b pb-2 ${isLight ? 'text-[#1A1D1F] border-[#E8ECEF]' : 'text-[#E2E8F0] border-white/5'}`}>
      <span className={isLight ? 'text-[#61D9DE]' : 'text-slate-400'}>{icon}</span> {title}
    </h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, value, onChange, icon, className, isLight, ...props }) => (
  <div className="w-full">
    <label className={`text-[9px] font-black uppercase mb-1.5 block tracking-wider ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>{label}</label>
    <div className="relative group">
      {icon && (
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isLight ? 'text-[#9A9FA5] group-focus-within:text-[#61D9DE]' : 'text-slate-400 group-focus-within:text-blue-500'}`}>
          {icon}
        </div>
      )}
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={props.disabled}
        className={`w-full border rounded-xl py-2.5 px-3 text-xs font-bold transition-all outline-none ${
          isLight 
            ? "bg-[#F8FAFB] border-[#E8ECEF] text-[#1A1D1F] placeholder:text-[#9A9FA5]/50 focus:bg-white focus:border-[#61D9DE] focus:shadow-[0_0_0_4px_rgba(97,217,222,0.1)]" 
            : "bg-white/5 border-white/10 text-white focus:border-blue-500"
        } ${icon ? "pl-10" : ""} ${className ?? ""} ${
          props.disabled ? (isLight ? "bg-[#F0F2F5] opacity-60 cursor-not-allowed border-[#E8ECEF]" : "bg-slate-100 cursor-not-allowed text-slate-400") : ""
        }`}
        {...props}
      />
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, className, isLight, ...props }) => (
  <div className="w-full">
    <label className={`text-[9px] font-black uppercase mb-1.5 block tracking-wider ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>{label}</label>
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={`w-full border rounded-xl p-3 text-sm font-medium transition-all resize-none outline-none ${
          isLight 
            ? "bg-[#F8FAFB] border-[#E8ECEF] text-[#1A1D1F] placeholder:text-[#9A9FA5]/50 focus:bg-white focus:border-[#61D9DE] focus:shadow-[0_0_0_4px_rgba(97,217,222,0.1)]" 
            : "bg-white/5 border-white/10 text-white focus:border-blue-500"
      } ${className ?? ""}`}
      {...props}
    />
  </div>
);

export default PortfolioManager;