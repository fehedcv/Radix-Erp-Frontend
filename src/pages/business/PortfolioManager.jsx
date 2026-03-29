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
  UploadCloud
} from "lucide-react";

import frappeApi from "../../api/frappeApi";

const SITE_URL = import.meta.env.VITE_FRAPPE_URL || "http://localhost:8000";

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
  gallery: []
};

const PortfolioManager = () => {
  const [unit, setUnit] = useState(EMPTY_UNIT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false); // New state for image upload
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef(null);

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

        setUnit({
          id: d.id,
          name: d.name ?? "",
          website: d.website ?? "",
          email: d.email ?? "",
          contact: d.contact ?? "",
          location: d.location ?? "",
          address: d.address ?? "",
          description: d.description ?? "",
          services: d.services ?? [],
          gallery: d.gallery ?? []
        });
      } catch (e) {
        console.error("Failed to load business unit", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* =======================
     SAVE PROFILE
  ======================= */
  const saveProfile = async () => {
    setSaving(true);
    try {
      await frappeApi.post(
        "/method/business_chain.api.business_unit.update_my_business_unit",
        {data: unit}
      );
      // Optional: Add a toast notification here
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  };

  /* =======================
     SERVICES LOGIC
  ======================= */
  const addService = () => {
    setUnit({
      ...unit,
      services: [...unit.services, { name: "", description: "" }]
    });
  };

  const updateService = (idx, field, value) => {
    const updated = [...unit.services];
    updated[idx] = { ...updated[idx], [field]: value };
    setUnit({ ...unit, services: updated });
  };

  const removeService = (idx) => {
    setUnit({
      ...unit,
      services: unit.services.filter((_, i) => i !== idx)
    });
  };

  /* =======================
     REAL FILE UPLOAD (FRAPPE)
  ======================= */
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("is_private", 0); // Public file so it can be seen on portfolio

    try {
      setUploading(true);
      
      const res = await frappeApi.post("/method/upload_file", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const fileUrl = res.data.message.file_url;

      setUnit((prev) => ({
        ...prev,
        gallery: [fileUrl, ...prev.gallery],
      }));

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
      <div className="h-96 flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto pb-16 space-y-6 font-['Plus_Jakarta_Sans']">

      {/* HEADER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl border border-blue-100">
            <Layout size={20} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Business Profile</h2>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {unit.name || "Untitled Unit"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowPreview(true)} 
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
          >
            <Eye size={14} /> Preview
          </button>
          <button 
            onClick={saveProfile} 
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: INFO & CONTACT */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <Section title="Business Info" icon={<Settings size={14} />}>
              <Input 
                label="Business Name" 
                value={unit.name} 
                onChange={v => setUnit({ ...unit, name: v })} 
                placeholder="e.g. FudyGo Headquarters"
              />
              <Input 
                label="Website URL" 
                value={unit.website} 
                icon={<Globe size={14} />} 
                onChange={v => setUnit({ ...unit, website: v })} 
                placeholder="https://..."
              />
              <Textarea 
                label="About the Business" 
                value={unit.description} 
                onChange={v => setUnit({ ...unit, description: v })} 
                placeholder="Tell us what makes your business unique..."
              />
            </Section>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <Section title="Contact & Location" icon={<MapPin size={14} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Email Address" 
                  value={unit.email} 
                  icon={<Mail size={14} />} 
                  onChange={v => setUnit({ ...unit, email: v })} 
                />
                <Input 
                  label="Phone Number" 
                  value={unit.contact} 
                  icon={<Phone size={14} />} 
                  onChange={v => setUnit({ ...unit, contact: v })} 
                />
              </div>
              <Input 
                label="City / Location" 
                value={unit.location} 
                onChange={v => setUnit({ ...unit, location: v })} 
                placeholder="e.g. Kochi, Kerala"
              />
              <Textarea 
                label="Full Address" 
                value={unit.address} 
                onChange={v => setUnit({ ...unit, address: v })} 
              />
            </Section>
          </div>

           {/* GALLERY SECTION */}
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-[10px] font-black uppercase flex items-center gap-2 text-slate-800">
                <Camera size={14} /> Photo Gallery
              </h4>
              <button 
                onClick={() => fileInputRef.current.click()} 
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} 
                {uploading ? "Uploading..." : "Add Image"}
              </button>
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFile} />
            </div>

            {unit.gallery.length === 0 ? (
              <div className="border-2 border-dashed border-slate-100 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400">
                <Camera size={32} className="mb-2 opacity-50" />
                <p className="text-xs font-medium">No images uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {unit.gallery.map((img, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={i} 
                      className="relative group aspect-square"
                    >
                      <img
                        src={img.startsWith("http") ? img : SITE_URL + img}
                        className="rounded-xl object-cover w-full h-full border border-slate-100 shadow-sm"
                        alt={`Gallery ${i}`}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-xl" />
                      <button
                        onClick={() =>
                          setUnit({
                            ...unit,
                            gallery: unit.gallery.filter((_, idx) => idx !== i)
                          })
                        }
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
            <h4 className="text-[10px] font-black uppercase flex items-center gap-2 mb-4 text-slate-800">
              <Briefcase size={14} /> Services Offered
            </h4>

            <div className="space-y-3 mb-4">
              <AnimatePresence>
                {unit.services.map((s, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    key={i} 
                    className="border border-slate-100 bg-slate-50/50 rounded-xl p-3 space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-full space-y-2">
                        <Input
                          label="Service Name"
                          value={s.name}
                          onChange={v => updateService(i, "name", v)}
                          placeholder="e.g. Catering"
                          className="bg-white"
                        />
                        <Textarea
                          label="Short Description"
                          value={s.description}
                          onChange={v => updateService(i, "description", v)}
                          placeholder="Details..."
                          className="bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end border-t border-slate-100 pt-2">
                        <button onClick={() => removeService(i)} className="text-rose-500 text-[10px] font-bold uppercase flex items-center gap-1 hover:text-rose-600">
                            <Trash2 size={12} /> Remove
                        </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button 
              onClick={addService} 
              className="w-full py-3 border border-dashed border-slate-300 text-slate-500 rounded-xl text-xs font-bold hover:bg-slate-50 hover:border-slate-400 transition-all flex items-center justify-center gap-2"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={() => setShowPreview(false)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
                <h2 className="text-lg font-black uppercase">Live Preview</h2>
                <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X size={20} />
                </button>
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">{unit.name || "Business Name"}</h1>
                <p className="text-slate-600 mb-6 flex items-center gap-2 text-sm">
                   <MapPin size={14} /> {unit.location || "Location not set"}
                </p>

                {unit.gallery.length > 0 && (
                   <img 
                    src={unit.gallery[0].startsWith("http") ? unit.gallery[0] : SITE_URL + unit.gallery[0]} 
                    className="w-full h-64 object-cover rounded-2xl mb-8"
                   />
                )}

                <div className="prose prose-sm max-w-none text-slate-600 mb-8">
                    <h3 className="text-black font-bold uppercase text-xs mb-2">About Us</h3>
                    <p>{unit.description || "No description provided."}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unit.services.map((s, i) => (
                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-1">{s.name}</h4>
                            <p className="text-xs text-slate-500">{s.description}</p>
                        </div>
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

const Section = ({ title, icon, children }) => (
  <div>
    <h4 className="text-[10px] font-black uppercase flex items-center gap-2 mb-4 text-slate-800 tracking-wide border-b border-slate-100 pb-2">
      <span className="text-slate-400">{icon}</span> {title}
    </h4>
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, value, onChange, icon, className, ...props }) => (
  <div className="w-full">
    <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block tracking-wider">{label}</label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
      )}
      <input
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
          icon ? "pl-10" : ""
        } ${className}`}
        {...props}
      />
    </div>
  </div>
);

const Textarea = ({ label, value, onChange, className, ...props }) => (
  <div className="w-full">
    <label className="text-[9px] font-black uppercase text-slate-400 mb-1.5 block tracking-wider">{label}</label>
    <textarea
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className={`w-full border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none ${className}`}
      {...props}
    />
  </div>
);

export default PortfolioManager;