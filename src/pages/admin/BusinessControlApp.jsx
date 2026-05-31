import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Save, Loader2, Settings, Briefcase, 
  MapPin, Mail, Phone, Globe, Camera, X, UploadCloud, 
  Upload, Instagram, Facebook, Linkedin, Share2, AlertTriangle, Activity, Search, XCircle, Building2, User, Trophy, LayoutGrid, CheckCircle2, Package, Image, MessageSquare
} from "lucide-react";

import { supabase } from "../../supabase/supabaseClient";
import { useTheme } from "../../context/ThemeContext";

const resolveUrl = (url) => {
  if (!url) return "";
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return url;
};

const normalizeBusinessUnit = (doc) => ({
  id: doc.id,
  name: doc.business_name || 'Unnamed Unit',
  business_name: doc.business_name || 'Unnamed Unit',
  category: doc.category || '—',
  status: doc.status || 'Active',
  commission: doc.commission ?? 0,
  managerName: doc.manager_name || '—',
  managerEmail: doc.manager_email || '',
  managerPhone: doc.manager_phone || '',
  phone: doc.primary_phone || '',
  whatsapp: doc.whatsapp_number || '',
  email: doc.email || '',
  website: doc.website || '',
  cityArea: doc.location || '',
  address: doc.address || '',
  description: doc.description || '',
  logo: doc.logo || '',
  facebook: doc.facebook || '',
  instagram: doc.instagram || '',
  linkedin: doc.linkedin || '',
  services: Array.isArray(doc.services) ? doc.services : [],
  gallery: Array.isArray(doc.gallery) ? doc.gallery : [],
  created_at: doc.created_at || '',
  date: doc.created_at ? doc.created_at.split(' ')[0] : '—',
});

const CATEGORIES = ['Technology','Real Estate','Finance','Healthcare','Retail','Construction','Other'];
const STATUSES   = ['Active','Inactive','Suspended'];

// ─── Main Component ───────────────────────────────────────────────────────────
const BusinessControlApp = () => {
  const [units,         setUnits]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [selectedUnit,  setSelectedUnit]  = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [editMode,      setEditMode]      = useState(false);
  const [editForm,      setEditForm]      = useState({});
  const [saving,        setSaving]        = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  
  // New UI States
  const [searchQuery, setSearchQuery] = useState("");

  // --- THEME INTEGRATION ---
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const originalServices = useRef([]);
  const galleryItemsRef = useRef([]);

  // ── Fetch list ────────────────────────────────────────────────────────────
  const fetchUnits = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const { data, error } = await supabase.rpc('get_admin_business_units');
      if (error) {
        console.error('Failed to load business units:', error);
        setError('Failed to load business units. Check your connection or permissions.');
        return;
      }
      setUnits((data || []).map(normalizeBusinessUnit));
    } catch (err) {
      console.error('Failed to load business units:', err);
      setError('Failed to load business units. Check your connection or permissions.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUnits(); }, [fetchUnits]);

  // ── Open detail ───────────────────────────────────────────────────────────
  const handleOpenDetail = useCallback(async (unit) => {
    setEditMode(false);
    setLoadingDetail(true);
    setSelectedUnit({ ...unit, _loading: true });

    try {
      const { data, error } = await supabase
        .rpc('get_business_unit_profile', {
          p_business_unit_id: unit.id
        });

      if (error) throw error;

      setSelectedUnit(normalizeBusinessUnit({
        ...data,
        manager_name: data?.manager?.full_name || '—',
        manager_email: data?.manager?.email || '',
        manager_phone: data?.manager?.phone || '',
        services: data?.services || [],
        gallery: data?.gallery || [],
      }));

    } catch (err) {
      console.error('Failed to load business unit detail:', err);
      setSelectedUnit({
        ...unit,
        _loading: false
      });
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ── Enter edit mode ───────────────────────────────────────────────────────
  const enterEdit = () => {
    setEditForm({
      name:        selectedUnit.name,
      category:    selectedUnit.category === '—' ? '' : selectedUnit.category,
      status:      selectedUnit.status,
      commision:   selectedUnit.commission,
      manager:     selectedUnit.managerName === '—' ? '' : selectedUnit.managerName,
      phone:       selectedUnit.phone,
      whatsapp:    selectedUnit.whatsapp,
      email:       selectedUnit.email,
      website:     selectedUnit.website,
      cityArea:    selectedUnit.cityArea,
      address:     selectedUnit.address,
      description: selectedUnit.description,
    });
    setEditMode(true);
  };

  const setField = (k) => (e) => setEditForm(prev => ({ ...prev, [k]: e.target.value }));

  // ── Save edits ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('business_units')
        .update({
          business_name:   editForm.name,
          category:        editForm.category,
          status:          editForm.status,
          commission:      Number(editForm.commision) || 0,
          primary_phone:   editForm.phone,
          whatsapp_number: editForm.whatsapp,
          email:           editForm.email,
          website:         editForm.website,
          location:        editForm.cityArea,
          address:         editForm.address,
          description:     editForm.description,
        })
        .eq('id', selectedUnit.id);

      if (error) throw error;

      const { data: updatedData, error: fetchError } = await supabase
        .from('business_units')
        .select('*')
        .eq('id', selectedUnit.id)
        .single();

      if (fetchError) throw fetchError;

      const updated = normalizeBusinessUnit({
        ...updatedData,
        services: selectedUnit.services,
        gallery:  selectedUnit.gallery,
      });

      setSelectedUnit(updated);
      setUnits(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      setEditMode(false);
    } catch (err) {
      console.error('Failed to save business unit:', err);
      alert('Failed to save changes. Check permissions.');
    } finally { setSaving(false); }
  };

  // ── Delete flow ───────────────────────────────────────────────────────────
  const initiateDelete = async (unit) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id')
        .eq('business_unit_id', unit.id)
        .limit(100);

      if (error) throw error;

      const linkedLeads = (data || []).map((lead) => ({ name: lead.id }));
      setDeleteTarget({ id: unit.id, name: unit.name, linkedLeads });
    } catch (err) {
      console.error('Failed to fetch linked leads:', err);
      setDeleteTarget({ id: unit.id, name: unit.name, linkedLeads: [] });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from('business_units')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;

      setUnits(prev => prev.filter(u => u.id !== deleteTarget.id));
      if (selectedUnit?.id === deleteTarget.id) setSelectedUnit(null);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete business unit. Please try again.');
    } finally { setDeleting(false); }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      const payload = {
        name:        formData.name,
        category:    formData.category,
        commission:  Number(formData.commision) || 0,
        phone:       formData.phone,
        whatsapp:    formData.whatsapp,
        email:       formData.email,
        website:     formData.website,
        cityArea:    formData.cityArea,
        address:     formData.address,
        description: formData.description,
        manager:     formData.manager,
      };

      const { data, error } = await supabase.functions.invoke('create-business-unit', {
        body: payload,
      });

      if (error) throw error;

      if (data?.success === false) {
        throw new Error(data?.error || 'Edge function returned a failure response.');
      }

      const tempPassword = data?.temporary_password ?? data?.temporaryPassword ?? '(check server logs)';
      alert(
        `Business unit registered successfully!\n\nManager Login Credentials\n` +
        `Email: ${formData.email}\n` +
        `Temporary Password: ${tempPassword}\n\n` +
        `Share these credentials with the manager.`
      );

      setShowAddModal(false);
      await fetchUnits();
    } catch (err) {
      console.error('Failed to create business unit:', err);
      const detail = err?.message || 'Unknown error. Check console for details.';
      alert(`Failed to register business unit:\n${detail}`);
    } finally { setSubmitting(false); }
  };

  // UI Helpers
  const filteredUnits = units.filter(u => 
    !searchQuery || 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.managerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topUnit = units.length > 0 ? units[0] : null;

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>

      {/* ── TOP SECTION: Header, Button, Top Partner, and Stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        
        {/* Left Side: Header & Status Cards */}
        <div className="lg:col-span-2 flex flex-col justify-between gap-4">
          <div className="px-1">
            <h2 className="text-2xl font-extrabold tracking-tight mb-1">Business Units</h2>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Authorized Partners Management</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 lg:gap-4 mt-auto">
            {/* Total Units */}
            <div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
              <div className="flex justify-between items-start mb-2">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Total Units</p>
                <Building2 size={16} strokeWidth={2.5} className="text-[#81B398]" />
              </div>
              <h3 className="text-3xl font-extrabold tracking-tighter">{units.length}</h3>
            </div>

            {/* Active Units */}
            {/* Active Sectors (Second Card) */}
<div className={`rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
  <div className="flex justify-between items-start mb-2">
    <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
      Active Sectors
    </p>
    <Activity size={16} strokeWidth={2.5} className="text-[#81B398]" />
  </div>
  <h3 className="text-3xl font-extrabold tracking-tighter">
    {[...new Set(units.map(u => u.category))].length}
  </h3>
</div>
          </div>
        </div>

        {/* Right Side: Add Button & Top Partner */}
        <div className="lg:col-span-1 flex flex-col gap-3 lg:gap-4">
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
          >
            <Plus size={16} strokeWidth={2.5} /> Add Business Unit
          </button>
          
          <div className={`flex-1 rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <div className="flex justify-between items-start mb-3">
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Top Partner</p>
              <Trophy size={16} strokeWidth={2.5} className="text-[#81B398]" />
            </div>
            {topUnit ? (
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border shrink-0 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                  {topUnit.logo ? (
                    <img src={resolveUrl(topUnit.logo)} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <span className="font-extrabold text-xs text-[#81B398]">{topUnit.name.charAt(0)}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold truncate">{topUnit.name}</p>
                  <p className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 truncate ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{topUnit.category}</p>
                </div>
              </div>
            ) : (
              <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No data yet</p>
            )}
          </div>
        </div>

      </div>

      {/* ── SEARCH BAR ── */}
      <div className={`p-4 rounded-3xl border flex items-center gap-3 transition-colors duration-200 mb-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} size={16} strokeWidth={2.5} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by business name, manager, or email..." 
            className={`w-full pl-12 pr-10 py-3.5 rounded-xl outline-none text-sm font-bold transition-all border ${
              isLight 
                ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]' 
                : 'bg-[#131720] border-transparent text-white placeholder:text-[#718096] focus:border-[#81B398]'
            }`}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className={`absolute right-4 top-1/2 -translate-y-1/2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              <XCircle size={16} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* ── UNITS GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} isLight={isLight} />)}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#F0524F]">
          <AlertTriangle size={24} strokeWidth={2.5} />
          <p className="text-[10px] font-bold uppercase tracking-wider">{error}</p>
          <button onClick={fetchUnits} className="mt-2 px-6 py-2.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Retry</button>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 gap-3 ${isLight ? 'text-[#A0AEC0]' : 'text-[#718096]'}`}>
          <LayoutGrid size={28} strokeWidth={2.5} />
          <p className="text-[10px] font-bold uppercase tracking-wider">No business units found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
            {filteredUnits.map((unit) => (
              <div
                key={unit.id}
                className={`border rounded-3xl p-5 md:p-6 transition-all duration-200 flex flex-col group ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#222938] border-white/10 hover:border-[#81B398]'
                }`}
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className={`h-14 w-14 rounded-full flex items-center justify-center font-extrabold text-lg uppercase shrink-0 border overflow-hidden ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'
                  }`}>
                    {unit.logo ? (
                      <img src={resolveUrl(unit.logo)} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      unit.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-extrabold uppercase tracking-tight truncate">{unit.name}</h3>
                    <p className={`text-[9px] font-bold mt-1 uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{unit.category}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                    unit.status === 'Active' ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20' : 'bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20'
                  }`}>
                    {unit.status}
                  </span>
                </div>

                {/* Body Details */}
                <div className={`space-y-3 mb-5 p-4 rounded-2xl border flex-1 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>Manager</span>
                    <span className="text-right truncate max-w-[120px]">{unit.managerName}</span>
                  </div>
                  {unit.cityArea && (
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                      <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>Location</span>
                      <span className="text-right truncate max-w-[120px]">{unit.cityArea}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                    <span className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}>Email</span>
                    <span className={`text-right truncate max-w-[140px] lowercase ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>{unit.email || '—'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDetail(unit)}
                    className={`flex-1 py-3.5 border text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 ${
                      isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]'
                    }`}
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => initiateDelete(unit)}
                    className={`p-3.5 rounded-xl transition-all active:scale-95 border border-transparent ${
                      isLight ? 'bg-[#F0524F]/10 text-[#F0524F] hover:bg-[#F0524F] hover:text-white' : 'bg-[#F0524F]/10 text-[#F0524F] hover:bg-[#F0524F] hover:text-white'
                    }`}
                  >
                    <Trash2 size={16} strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* ── DOSSIER / VIEW MODAL ── */}
      <AnimatePresence>
        {selectedUnit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col border ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
              }`}
            >
              {/* Header */}
              <div className={`p-6 border-b flex justify-between items-center shrink-0 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center font-extrabold text-xl overflow-hidden shrink-0 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'}`}>
                    {selectedUnit.logo ? (
                      <img src={resolveUrl(selectedUnit.logo)} alt={selectedUnit.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                    ) : (
                      selectedUnit.name.charAt(0)
                    )}
                    {selectedUnit.logo && (
                      <div style={{ display: 'none' }} className="w-full h-full items-center justify-center">{selectedUnit.name.charAt(0)}</div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight mb-1">{selectedUnit.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{selectedUnit.category}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider border ${selectedUnit.status === 'Active' ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20' : 'bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20'}`}>
                        {selectedUnit.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => { setSelectedUnit(null); }}
                  className={`p-2 rounded-full transition-colors ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-white/10'}`}
                >
                  <X size={20} strokeWidth={2.5}/>
                </button>
              </div>

              {/* Body */}
              {selectedUnit._loading || loadingDetail ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
                  <Loader2 size={32} strokeWidth={2.5} className="animate-spin text-[#81B398]" />
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Loading Profile...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                  
                  {/* TWO COLUMN LAYOUT */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    
                    {/* LEFT COLUMN: Identity & Contact */}
                    <div className="space-y-6">
                      
                      {/* Identity Card */}
                      <div className={`border rounded-3xl p-5 md:p-6 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                          <User size={14} strokeWidth={2.5} className="text-[#81B398]"/> Unit Identity
                        </h5>
                        <div className="space-y-4">
                          <InfoItem label="Manager" value={selectedUnit.managerName} isLight={isLight} />
                          <InfoItem label="Commission" value={`${selectedUnit.commission}%`} isLight={isLight} />
                          <InfoItem label="Onboarded" value={selectedUnit.created_at ? new Date(selectedUnit.created_at).toLocaleDateString() : '—'} isLight={isLight} />
                        </div>
                      </div>

                      {/* Contact & Social Card */}
                      <div className={`border rounded-3xl p-5 md:p-6 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                          <Globe size={14} strokeWidth={2.5} className="text-[#81B398]"/> Contact & Web
                        </h5>
                        <div className="space-y-4 mb-6">
                          {selectedUnit.phone && <InfoItem label="Primary Phone" value={selectedUnit.phone} isLight={isLight} />}
                          {selectedUnit.email && <InfoItem label="Email" value={<span className="lowercase normal-case font-bold">{selectedUnit.email}</span>} isLight={isLight} />}
                          {selectedUnit.website && <InfoItem label="Website" value={<a href={selectedUnit.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-[#81B398]"><Globe size={10}/> Link</a>} isLight={isLight} />}
                          {selectedUnit.instagram && <InfoItem label="Instagram" value={<a href={selectedUnit.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-[#81B398]"><Instagram size={10}/> Link</a>} isLight={isLight} />}
                          {selectedUnit.facebook && <InfoItem label="Facebook" value={<a href={selectedUnit.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-[#81B398]"><Facebook size={10}/> Link</a>} isLight={isLight} />}
                          {selectedUnit.linkedin && <InfoItem label="LinkedIn" value={<a href={selectedUnit.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline text-[#81B398]"><Linkedin size={10}/> Link</a>} isLight={isLight} />}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E2E8F0] dark:border-white/10">
                           <a
                             href={`tel:${selectedUnit.phone}`}
                             className={`py-3 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                               isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#222938] border-transparent text-[#F4F5F7] hover:border-[#81B398]'
                             }`}
                           >
                             <Phone size={14} strokeWidth={2.5} /> Call Now
                           </a>
                           <a
                             href={`https://wa.me/${selectedUnit.whatsapp?.replace(/\D/g, '')}`}
                             target="_blank"
                             rel="noreferrer"
                             className="py-3 rounded-xl border border-transparent text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
                           >
                             <MessageSquare size={14} strokeWidth={2.5} /> WhatsApp
                           </a>
                        </div>
                      </div>

                    </div>

                    {/* RIGHT COLUMN: Location, Services & Gallery */}
                    <div className="space-y-6">
                      
                      {/* Location & About */}
                      <div className={`border rounded-3xl p-5 md:p-6 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                          <MapPin size={14} strokeWidth={2.5} className="text-[#81B398]"/> HQ Coordinates
                        </h5>
                        <div className={`p-4 rounded-2xl border flex items-start gap-3 mb-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                          <MapPin size={16} strokeWidth={2.5} className="text-[#81B398] shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            {selectedUnit.cityArea && <p className={`text-[9px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{selectedUnit.cityArea}</p>}
                            <p className="text-xs font-extrabold leading-relaxed">{selectedUnit.address || 'No address on file'}</p>
                          </div>
                        </div>
                        {selectedUnit.description && (
                          <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                            <p className={`text-[9px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>About</p>
                            <p className="text-xs font-medium leading-relaxed italic">"{selectedUnit.description}"</p>
                          </div>
                        )}
                      </div>

                      {/* Services */}
                      <div className={`border rounded-3xl p-5 md:p-6 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                          <Package size={14} strokeWidth={2.5} className="text-[#81B398]"/> Service Portfolio
                        </h5>
                        {selectedUnit.services.length > 0 ? (
                          <div className="space-y-3">
                            {selectedUnit.services.map((s, i) => (
                              <div key={i} className={`p-4 border rounded-2xl ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider">{s.service_name}</span>
                                  <CheckCircle2 size={14} strokeWidth={2.5} className="text-[#81B398] shrink-0" />
                                </div>
                                {s.description && <p className={`text-[10px] font-medium leading-relaxed ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{s.description}</p>}
                              </div>
                            ))}
                          </div>
                        ) : <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No services listed</p>}
                      </div>

                      {/* Gallery */}
                      <div className={`border rounded-3xl p-5 md:p-6 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                        <h5 className={`text-[10px] font-bold uppercase tracking-wider mb-5 pb-3 border-b flex items-center gap-2 ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                          <Image size={14} strokeWidth={2.5} className="text-[#81B398]"/> Gallery
                        </h5>
                        {selectedUnit.gallery.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {selectedUnit.gallery.map((g, i) => (
                              <div key={i} className={`aspect-square rounded-2xl overflow-hidden border ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                                {g.image
                                  ? <img src={resolveUrl(g.image)} alt={`Gallery ${i+1}`} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                                  : <div className={`w-full h-full flex items-center justify-center ${isLight ? 'bg-[#F4F5F7] text-[#A0AEC0]' : 'bg-[#222938] text-[#718096]'}`}><Image size={24} strokeWidth={2.5}/></div>
                                }
                              </div>
                            ))}
                          </div>
                        ) : <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No gallery items</p>}
                      </div>

                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL (Bento Style) ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm rounded-3xl border overflow-hidden p-8 text-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}
            >
              <div className="w-16 h-16 bg-[#F0524F]/10 text-[#F0524F] rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#F0524F]/20">
                <Trash2 size={32} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-xl font-extrabold tracking-tight uppercase mb-2">Disconnect Unit</h3>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-6 ${isLight ? 'text-[#F0524F]' : 'text-[#F0524F]'}`}>This action cannot be undone</p>
              
              <p className={`text-sm font-medium mb-6 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                You are about to permanently delete <strong className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}>"{deleteTarget.name}"</strong>.
              </p>

              {deleteTarget.linkedLeads.length > 0 ? (
                <div className={`p-4 rounded-2xl border text-left mb-8 ${isLight ? 'bg-[#F0524F]/5 border-[#F0524F]/10' : 'bg-[#F0524F]/10 border-[#F0524F]/20'}`}>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#F0524F] mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} strokeWidth={2.5} /> {deleteTarget.linkedLeads.length} linked lead(s)
                  </p>
                  <p className="text-[10px] font-medium text-[#F0524F]">
                    Their unit field will be cleared — leads will <strong>not</strong> be deleted.
                  </p>
                </div>
              ) : (
                <div className={`p-4 rounded-2xl border text-center mb-8 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>No linked leads. Safe to delete.</p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className={`flex-1 py-3.5 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-[1.5] py-3.5 bg-[#F0524F] hover:bg-[#D94A48] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin"/> : <Trash2 size={16} strokeWidth={2.5}/> }
                  {deleting ? "Processing" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-3xl border overflow-hidden max-h-[90vh] flex flex-col ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}
            >
              <div className={`px-6 py-5 border-b flex justify-between items-center shrink-0 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
                <h3 className="text-xs font-extrabold uppercase tracking-wider">Register New Unit</h3>
                <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-full transition-colors ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-white/10'}`}><X size={16} strokeWidth={2.5}/></button>
              </div>
              <AddUnitForm onSubmit={handleCreate} onCancel={() => setShowAddModal(false)} submitting={submitting} isLight={isLight} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Add Unit Form ────────────────────────────────────────────────────────────
const AddUnitForm = ({ onSubmit, onCancel, submitting, isLight }) => {
  const [form, setForm] = useState({
    name: '', category: '', manager: '', phone: '',
    whatsapp: '', email: '', website: '', cityArea: '', address: '', description: '', commision: 10
  });
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const COUNTRY_CODE = "+91";

  const handleSubmit = (e) => {
    e.preventDefault();
    const formattedData = {
      ...form,
      phone: form.phone ? COUNTRY_CODE + form.phone : "",
      whatsapp: form.whatsapp ? COUNTRY_CODE + form.whatsapp : "",
    };
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Business Name *"   value={form.name}      onChange={set('name')}      placeholder="e.g. SKYLINE TECH"        required isLight={isLight}/>
        <FormInput label="Market Category *" value={form.category}  onChange={set('category')}  placeholder="Enter Category"           required isLight={isLight} />
        <FormInput label="Commission (%) *"  type="number" value={form.commision} onChange={set('commision')} placeholder="e.g. 10" required isLight={isLight}/>
        <FormInput label="Unit Manager *"    value={form.manager}   onChange={set('manager')}   placeholder="e.g. ABHISHEK"       required isLight={isLight}/>
        <FormInput label="Primary Phone *"   value={form.phone}     onChange={set('phone')}     placeholder="98475 12025"          required isLight={isLight}/>
        <FormInput label="WhatsApp Number *" value={form.whatsapp}  onChange={set('whatsapp')}  placeholder="98475 12025"          required isLight={isLight}/>
        <FormInput label="Email *"           value={form.email}     onChange={set('email')}     placeholder="unit@example.com"          required type="email" isLight={isLight}/>
        <FormInput label="Website"           value={form.website}   onChange={set('website')}   placeholder="https://example.com"       type="url" isLight={isLight}/>
        <FormInput label="City / Area"       value={form.cityArea}  onChange={set('cityArea')}  placeholder="e.g. Business Bay" isLight={isLight}/>
      </div>
      <FormInput label="Address *"     value={form.address}     onChange={set('address')}     placeholder="Full address..."                                  required isTextarea isLight={isLight}/>
      <FormInput label="Description *" value={form.description} onChange={set('description')} placeholder="Brief overview of this business unit..." required isTextarea isLight={isLight}/>
      
      <div className={`flex gap-3 pt-4 border-t ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
        <button type="button" onClick={onCancel} className={`flex-1 py-3.5 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'}`}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-[2] py-3.5 bg-[#81B398] hover:bg-[#6FA085] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
          {submitting ? <><Loader2 size={16} strokeWidth={2.5} className="animate-spin"/> Registering...</> : 'Register Unit'}
        </button>
      </div>
    </form>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────

const InfoItem = ({ label, value, isLight }) => (
  <div className={`flex justify-between items-center border-b pb-3 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
    <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{label}</span>
    <span className="text-xs font-extrabold uppercase">{value}</span>
  </div>
);

const FormInput = ({ label, value, onChange, placeholder, type = 'text', required, isTextarea, isSelect, options = [], isLight }) => (
  <div className="w-full">
    <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 block pl-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{label}</label>
    {isTextarea ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3}
        className={`w-full border rounded-xl p-4 text-sm font-bold transition-all resize-none outline-none ${
          isLight ? "bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]" : "bg-[#131720] border-transparent text-white focus:border-[#81B398]"
        }`}
      />
    ) :  (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className={`w-full px-4 py-3.5 border rounded-xl text-sm font-bold transition-all outline-none ${
          isLight ? "bg-[#F4F5F7] border-transparent text-[#1A202C] placeholder:text-[#A0AEC0] focus:border-[#81B398]" : "bg-[#131720] border-transparent text-white focus:border-[#81B398]"
        }`}
      />
    )}
  </div>
);

// ─── SKELETON LOADER ───
const SkeletonCard = ({ isLight }) => (
  <div className={`rounded-3xl border p-6 flex flex-col gap-5 animate-pulse ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
    <div className="flex items-center gap-4">
      <div className={`h-14 w-14 rounded-full shrink-0 ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`} />
      <div className="space-y-2 flex-1">
        <div className={`h-4 w-3/4 rounded ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`} />
        <div className={`h-3 w-1/2 rounded ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`} />
      </div>
    </div>
    <div className={`h-24 rounded-2xl w-full ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`} />
    <div className="flex gap-2">
      <div className={`h-10 flex-1 rounded-xl ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`} />
      <div className={`h-10 w-12 rounded-xl shrink-0 ${isLight ? 'bg-[#F4F5F7]' : 'bg-[#131720]'}`} />
    </div>
  </div>
);

export default BusinessControlApp;