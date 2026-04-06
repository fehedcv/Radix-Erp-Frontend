import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Building2, Trash2, X, ShieldCheck,
  MapPin, User, BarChart3, CheckCircle2,
  Info, TrendingUp, LayoutGrid, Package,
  Activity, Loader2, AlertCircle, Globe, Image,
  Pencil, Save, XCircle
} from 'lucide-react';
import Chart from 'react-apexcharts';
import frappeApi from '../../api/frappeApi';

// ─── Field map ────────────────────────────────────────────────────────────────
const mapDoc = (doc) => ({
  id:          doc.name,
  name:        doc.business_name   || doc.name,
  category:    doc.category        || '—',
  status:      doc.status          || 'Active',
  managerName: doc.manager_name    || '—',
  phone:       doc.primary_phone   || '',
  whatsapp:    doc.whatsapp_number || '',
  email:       doc.email           || '',
  website:     doc.website         || '',
  cityArea:    doc.location        || '',
  address:     doc.address         || '',
  description: doc.description     || '',
  services:    Array.isArray(doc.services) ? doc.services : [],
  gallery:     Array.isArray(doc.gallery)  ? doc.gallery  : [],
  date:        doc.creation ? doc.creation.split(' ')[0] : '—',
});

const BU_LIST_FIELDS = [
  'name','business_name','category','status','manager_name',
  'primary_phone','whatsapp_number','email','website',
  'location','address','description','creation'
];

const CATEGORIES = ['Technology','Real Estate','Finance','Healthcare','Retail','Construction','Other'];
const STATUSES   = ['Active','Inactive','Suspended'];

// ─── Main Component ───────────────────────────────────────────────────────────
const BusinessHub = () => {
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

  // ── Fetch list ────────────────────────────────────────────────────────────
  const fetchUnits = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await frappeApi.get('/resource/Business Unit', {
        params: { fields: JSON.stringify(BU_LIST_FIELDS), limit_page_length: 0, order_by: 'creation desc' },
      });
      setUnits((res.data?.data || []).map(mapDoc));
    } catch {
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
      const res = await frappeApi.get(`/resource/Business Unit/${unit.id}`);
      setSelectedUnit(mapDoc(res.data?.data || {}));
    } catch {
      setSelectedUnit({ ...unit, _loading: false });
    } finally { setLoadingDetail(false); }
  }, []);

  // ── Enter edit mode ───────────────────────────────────────────────────────
  const enterEdit = () => {
    setEditForm({
      name:        selectedUnit.name,
      category:    selectedUnit.category === '—' ? '' : selectedUnit.category,
      status:      selectedUnit.status,
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
      await frappeApi.put(`/resource/Business Unit/${selectedUnit.id}`, {
        business_name:   editForm.name,
        category:        editForm.category,
        status:          editForm.status,
        manager_name:    editForm.manager,
        primary_phone:   editForm.phone,
        whatsapp_number: editForm.whatsapp,
        email:           editForm.email,
        website:         editForm.website,
        location:        editForm.cityArea,
        address:         editForm.address,
        description:     editForm.description,
      });
      const res = await frappeApi.get(`/resource/Business Unit/${selectedUnit.id}`);
      const updated = mapDoc(res.data?.data || {});
      setSelectedUnit(updated);
      setUnits(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
      setEditMode(false);
    } catch {
      alert('Failed to save changes. Check permissions.');
    } finally { setSaving(false); }
  };

  // ── Delete flow: pre-check linked leads ───────────────────────────────────
  const initiateDelete = async (unit) => {
    try {
      const res = await frappeApi.get('/resource/Lead', {
        params: {
          filters: JSON.stringify([['business_unit', '=', unit.id]]),
          fields:  JSON.stringify(['name']),
          limit_page_length: 0,
        },
      });
      setDeleteTarget({ id: unit.id, name: unit.name, linkedLeads: res.data?.data || [] });
    } catch {
      // field may not exist on Lead — proceed without unlinking
      setDeleteTarget({ id: unit.id, name: unit.name, linkedLeads: [] });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.linkedLeads.length > 0) {
        await Promise.all(
          deleteTarget.linkedLeads.map(lead =>
            frappeApi.put(`/resource/Lead/${lead.name}`, { business_unit: null })
          )
        );
      }
      await frappeApi.delete(`/resource/Business Unit/${deleteTarget.id}`);
      setUnits(prev => prev.filter(u => u.id !== deleteTarget.id));
      if (selectedUnit?.id === deleteTarget.id) setSelectedUnit(null);
      setDeleteTarget(null);
    } catch {
      alert('Failed to delete. Check permissions.');
    } finally { setDeleting(false); }
  };

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await frappeApi.post('/resource/Business Unit', {
        business_name:         formData.name,
        category:              formData.category,
        status:                'Active',
        manager_name:          formData.manager,
        primary_phone:         formData.phone,
        whatsapp_number:       formData.whatsapp,
        email:                 formData.email,
        website:               formData.website,
        location:              formData.cityArea,
        address:               formData.address,
        description:           formData.description,
        commission_percentage: formData.commission // Passed the new commission value to API
      });
      setShowAddModal(false);
      await fetchUnits();
    } catch {
      alert('Failed to create business unit. Please try again.');
    } finally { setSubmitting(false); }
  };

  // ── Charts ────────────────────────────────────────────────────────────────
  const chartConfigs = useMemo(() => {
    const cats = units.reduce((acc, u) => { acc[u.category] = (acc[u.category] || 0) + 1; return acc; }, {});
    const hasSeries = Object.keys(cats).length > 0;
    return {
      distribution: {
        series:  hasSeries ? Object.values(cats) : [1],
        options: {
          labels:      hasSeries ? Object.keys(cats) : ['No Data'],
          colors:      ['#2563EB','#3B82F6','#60A5FA','#93C5FD','#BFDBFE'],
          legend:      { position: 'bottom', fontFamily: 'Plus Jakarta Sans', fontSize: '10px', fontWeight: 600 },
          plotOptions: { pie: { donut: { size: '75%' } } },
          dataLabels:  { enabled: false },
          stroke:      { width: 0 },
        },
      },
    };
  }, [units]);

  return (
    <div className="font-['Plus_Jakarta_Sans',sans-serif] space-y-6 max-w-[1600px] mx-auto">

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 shrink-0">
            <Building2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none">Partner Registry Hub</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
              <ShieldCheck size={12} className="text-blue-500" /> Authorized Business Management
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchUnits} className="p-3 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm" title="Refresh">
            <BarChart3 size={18} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-slate-900 text-white px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            <Plus size={16} /> Add Business Unit
          </button>
        </div>
      </motion.div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard label="Total Business Units" value={units.length} icon={<LayoutGrid size={18}/>} color="text-blue-600" bg="bg-blue-50" />
          <StatCard label="Active Connections" value={units.filter(u => u.status === 'Active').length} icon={<Activity size={18}/>} color="text-emerald-600" bg="bg-emerald-50" />
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-blue-600"/>
              <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Network Distribution Status</h4>
            </div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              System is managing <span className="text-blue-600 font-bold">{units.length} business units</span>{' '}
              across <span className="text-blue-600 font-bold">{[...new Set(units.map(u => u.category))].length} industry sector(s)</span>.
              All node connections are optimized.
            </p>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm min-h-[250px] flex flex-col">
          <h4 className="text-[9px] font-black text-slate-900 uppercase tracking-widest mb-4">Sectors Representation</h4>
          <div className="flex-1 flex items-center justify-center">
            <Chart options={chartConfigs.distribution.options} series={chartConfigs.distribution.series} type="donut" width="100%" height={200} />
          </div>
        </div>
      </div>

      {/* ── UNITS GRID ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 size={28} className="animate-spin text-blue-400" />
          <p className="text-[10px] font-black uppercase tracking-widest">Loading Business Units...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-red-400">
          <AlertCircle size={28} />
          <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
          <button onClick={fetchUnits} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Retry</button>
        </div>
      ) : units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-2 text-slate-300">
          <Building2 size={32} />
          <p className="text-[10px] font-black uppercase tracking-widest">No business units registered yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {units.map((unit, idx) => (
              <motion.div
                layout key={unit.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-500 transition-all group relative shadow-sm"
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="h-12 w-12 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xl uppercase group-hover:bg-blue-600 transition-colors shadow-md">
                    {unit.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{unit.name}</h3>
                    <p className="text-[8px] text-slate-400 font-black mt-0.5 uppercase tracking-widest">{unit.category}</p>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${unit.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {unit.status}
                  </span>
                </div>
                <div className="space-y-2 mb-5 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                    <span className="text-slate-400 tracking-tighter">Manager</span>
                    <span className="text-slate-900">{unit.managerName}</span>
                  </div>
                  {unit.cityArea && (
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                      <span className="text-slate-400 tracking-tighter">City / Area</span>
                      <span className="text-slate-700">{unit.cityArea}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-[9px] font-bold uppercase">
                    <span className="text-slate-400 tracking-tighter">Registry ID</span>
                    <span className="text-blue-600 font-mono tracking-tighter">{unit.id}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDetail(unit)}
                    className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 hover:border-blue-600 hover:text-blue-600 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <BarChart3 size={14}/> System Profile
                  </button>
                  <button
                    onClick={() => initiateDelete(unit)}
                    className="p-2.5 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── DOSSIER / EDIT MODAL ── */}
      <AnimatePresence>
        {selectedUnit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            >
              {/* Header */}
              <div className={`p-6 border-b border-slate-100 flex justify-between items-center shrink-0 transition-colors duration-300 ${editMode ? 'bg-amber-50/70' : 'bg-blue-50/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 text-white rounded-lg flex items-center justify-center font-black text-xl shadow-lg transition-colors duration-300 ${editMode ? 'bg-amber-500' : 'bg-slate-900'}`}>
                    {editMode ? <Pencil size={20}/> : selectedUnit.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">{selectedUnit.name}</h3>
                    <p className={`text-[9px] font-black uppercase tracking-widest transition-colors duration-300 ${editMode ? 'text-amber-600' : 'text-blue-600'}`}>
                      {editMode ? 'Admin Edit Mode — Changes sync to Frappe' : selectedUnit.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!editMode && !loadingDetail && !selectedUnit._loading && (
                    <button
                      onClick={enterEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                    >
                      <Pencil size={13}/> Edit
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedUnit(null); setEditMode(false); }}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
                  >
                    <X size={18}/>
                  </button>
                </div>
              </div>

              {/* Body */}
              {selectedUnit._loading || loadingDetail ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 py-24">
                  <Loader2 size={28} className="animate-spin text-blue-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Loading Full Profile...</p>
                </div>
              ) : editMode ? (
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EditField label="Business Name *" value={editForm.name}        onChange={setField('name')}        placeholder="e.g. SKYLINE TECH" />
                    <EditField label="Market Category" value={editForm.category}    onChange={setField('category')}    />
                    <EditField label="Status"          value={editForm.status}      onChange={setField('status')}      isSelect options={STATUSES} />
                    <EditField label="Unit Manager"    value={editForm.manager}     onChange={setField('manager')}     placeholder="Manager name" />
                    <EditField label="Primary Phone"   value={editForm.phone}       onChange={setField('phone')}       placeholder="+971 50 000 0000" />
                    <EditField label="WhatsApp Number" value={editForm.whatsapp}    onChange={setField('whatsapp')}   placeholder="+971 50 000 0000" />
                    <EditField label="Email"           value={editForm.email}       onChange={setField('email')}       placeholder="unit@example.com" type="email" />
                    <EditField label="Website"         value={editForm.website}     onChange={setField('website')}     placeholder="https://example.com" />
                    <EditField label="City / Area"     value={editForm.cityArea}    onChange={setField('cityArea')}   placeholder="e.g. Business Bay" />
                  </div>
                  <EditField label="Address"     value={editForm.address}     onChange={setField('address')}     placeholder="Full address..." isTextarea />
                  <EditField label="Description" value={editForm.description} onChange={setField('description')} placeholder="About this business unit..." isTextarea />
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-[9px] text-amber-700 font-bold uppercase tracking-wide">
                      ⚠ Services and Gallery rows can only be managed via Frappe Desk. This form updates all other fields.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-8">
                      <DossierSection title="Unit Identity" icon={<User size={12}/>}>
                        <InfoItem label="Manager"      value={selectedUnit.managerName} />
                        <InfoItem label="Onboarded"    value={selectedUnit.date} />
                        <InfoItem label="Status"       value={selectedUnit.status} />
                        {selectedUnit.phone    && <InfoItem label="Primary Phone" value={selectedUnit.phone} />}
                        {selectedUnit.whatsapp && <InfoItem label="WhatsApp"      value={selectedUnit.whatsapp} />}
                        {selectedUnit.email && (
                          <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Email</span>
                            <span className="text-xs font-bold text-blue-600 lowercase">{selectedUnit.email}</span>
                          </div>
                        )}
                        {selectedUnit.website && (
                          <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">Website</span>
                            <a href={selectedUnit.website} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                              <Globe size={10}/> {selectedUnit.website}
                            </a>
                          </div>
                        )}
                      </DossierSection>
                      <DossierSection title="HQ Coordinates" icon={<MapPin size={12}/>}>
                        <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg flex items-start gap-3">
                          <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            {selectedUnit.cityArea && <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">{selectedUnit.cityArea}</p>}
                            <p className="text-xs font-bold text-slate-900 uppercase leading-relaxed">{selectedUnit.address || 'No address on file'}</p>
                          </div>
                        </div>
                        {selectedUnit.description && (
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <p className="text-[8px] text-slate-400 font-black uppercase mb-1">About</p>
                            <p className="text-[10px] text-slate-600 leading-relaxed">{selectedUnit.description}</p>
                          </div>
                        )}
                      </DossierSection>
                    </div>
                    <div className="space-y-8">
                      <DossierSection title="Service Portfolio" icon={<Package size={12}/>}>
                        {selectedUnit.services.length > 0 ? (
                          <div className="space-y-2">
                            {selectedUnit.services.map((s, i) => (
                              <div key={i} className="p-3 bg-white border border-slate-100 rounded-lg hover:border-blue-400 transition-all">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{s.service_name}</span>
                                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                                </div>
                                {s.description && <p className="text-[9px] text-slate-400 font-medium leading-relaxed">{s.description}</p>}
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-[9px] text-slate-300 font-black uppercase">No services listed</p>}
                      </DossierSection>
                      <DossierSection title="Gallery" icon={<Image size={12}/>}>
                        {selectedUnit.gallery.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {selectedUnit.gallery.map((g, i) => (
                              <div key={i} className="aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                                {g.image
                                  ? <img src={g.image} alt={g.caption || `Gallery ${i+1}`} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                                  : <div className="w-full h-full flex items-center justify-center text-slate-300"><Image size={20}/></div>
                                }
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-[9px] text-slate-300 font-black uppercase">No gallery items</p>}
                      </DossierSection>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-4">
                    <Info size={18} className="text-blue-600 shrink-0" />
                    <p className="text-[10px] text-blue-800 font-bold uppercase leading-relaxed tracking-tight">
                      Registry ID: {selectedUnit.id} — Last synced from Frappe ERP. Use the Edit button to modify this record.
                    </p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 shrink-0 bg-slate-50 flex justify-between items-center gap-3">
                {editMode ? (
                  <>
                    <button
                      onClick={() => setEditMode(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                      <XCircle size={14}/> Discard
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-10 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-md disabled:opacity-60"
                    >
                      {saving
                        ? <><Loader2 size={14} className="animate-spin"/> Saving...</>
                        : <><Save size={14}/> Save Changes</>
                      }
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setSelectedUnit(null); setEditMode(false); }}
                    className="ml-auto px-10 py-3 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-md"
                  >
                    Return to HUB
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            >
              <div className="p-6 bg-red-50 border-b border-red-100 flex items-center gap-4">
                <div className="h-10 w-10 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                  <Trash2 size={18} className="text-white"/>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Disconnect Unit</h3>
                  <p className="text-[9px] text-red-500 font-black uppercase tracking-widest mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-[11px] text-slate-700 font-bold leading-relaxed">
                  You are about to permanently delete{' '}
                  <span className="text-slate-900 font-black uppercase">"{deleteTarget.name}"</span>.
                </p>
                {deleteTarget.linkedLeads.length > 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-2">
                    <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest">
                      ⚠ {deleteTarget.linkedLeads.length} linked lead(s) detected
                    </p>
                    <p className="text-[10px] text-amber-600 font-medium leading-relaxed">
                      These leads reference this business unit. Their <code className="bg-amber-100 px-1 rounded text-amber-800">business_unit</code> field will be cleared — the leads themselves will <strong>not</strong> be deleted.
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {deleteTarget.linkedLeads.map(l => (
                        <span key={l.name} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[8px] font-black font-mono">{l.name}</span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">No linked leads found. Safe to delete.</p>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-[2] py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {deleting
                    ? <><Loader2 size={13} className="animate-spin"/> Processing...</>
                    : deleteTarget.linkedLeads.length > 0
                      ? <><Trash2 size={13}/> Unlink & Delete</>
                      : <><Trash2 size={13}/> Confirm Delete</>
                  }
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center bg-slate-50 shrink-0">
                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Register New Unit</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900"><X size={18}/></button>
              </div>
              <AddUnitForm onSubmit={handleCreate} onCancel={() => setShowAddModal(false)} submitting={submitting} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Add Unit Form ────────────────────────────────────────────────────────────
const AddUnitForm = ({ onSubmit, onCancel, submitting }) => {
  const [form, setForm] = useState({
    name: '', category: '', manager: '', phone: '',
    whatsapp: '', email: '', website: '', cityArea: '', address: '', description: '', commission: 10
  });
  const set = (k) => (e) => setForm(prev => ({ ...prev, [k]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput label="Business Name *"   value={form.name}      onChange={set('name')}      placeholder="e.g. SKYLINE TECH"        required />
        <FormInput label="Market Category *" value={form.category}  onChange={set('category')}  placeholder="Enter Category"                required  />
        <FormInput label="Commission Percentage (%) *" type="number" value={form.commission} onChange={set('commission')} placeholder="e.g. 10" required />
        <FormInput label="Unit Manager *"    value={form.manager}   onChange={set('manager')}   placeholder="e.g. ZAID AL-FARSI"       required />
        <FormInput label="Primary Phone *"   value={form.phone}     onChange={set('phone')}     placeholder="+971 50 000 0000"          required />
        <FormInput label="WhatsApp Number *" value={form.whatsapp}  onChange={set('whatsapp')}  placeholder="+971 50 000 0000"          required />
        <FormInput label="Email *"           value={form.email}     onChange={set('email')}     placeholder="unit@example.com"          required type="email" />
        <FormInput label="Website"           value={form.website}   onChange={set('website')}   placeholder="https://example.com"       type="url" />
        <FormInput label="City / Area"       value={form.cityArea}  onChange={set('cityArea')}  placeholder="e.g. Business Bay, Dubai" />
      </div>
      <FormInput label="Address *"     value={form.address}     onChange={set('address')}     placeholder="Full address..."                                  required isTextarea />
      <FormInput label="Description *" value={form.description} onChange={set('description')} placeholder="Brief overview of this business unit..." required isTextarea />
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase">Cancel</button>
        <button type="submit" disabled={submitting}
          className="flex-[2] py-3 bg-blue-600 hover:bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? <><Loader2 size={14} className="animate-spin"/> Registering...</> : 'Register Node'}
        </button>
      </div>
    </form>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, bg }) => (
  <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:border-blue-500 transition-all group">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 border ${bg} ${color} border-current/10 group-hover:scale-110 transition-transform`}>
      {icon}
    </div>
    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
    <h3 className="text-xl font-black text-slate-900 tracking-tight">{value}</h3>
  </div>
);

const DossierSection = ({ title, icon, children }) => (
  <section className="space-y-4">
    <h5 className="text-[9px] font-black text-blue-600 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
      {icon} {title}
    </h5>
    <div className="space-y-3">{children}</div>
  </section>
);

const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-end border-b border-slate-50 pb-1.5">
    <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter">{label}</span>
    <span className="text-xs font-bold text-slate-900 uppercase">{value}</span>
  </div>
);

const EditField = ({ label, value, onChange, placeholder, type = 'text', isTextarea, isSelect, options = [] }) => (
  <div className="space-y-1.5">
    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    {isTextarea ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
        className="w-full px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-slate-300 resize-none"
      />
    ) : isSelect ? (
      <select value={value} onChange={onChange}
        className="w-full px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-amber-500 transition-all"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-amber-500 transition-all placeholder:text-slate-300"
      />
    )}
  </div>
);

const FormInput = ({ label, value, onChange, placeholder, type = 'text', required, isTextarea, isSelect, options = [] }) => (
  <div className="space-y-1.5">
    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    {isTextarea ? (
      <textarea value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300 resize-none"
      />
    ) : isSelect ? (
      <select value={value} onChange={onChange} required={required}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-blue-600 transition-all"
      >
        <option value="">Select category...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-blue-600 transition-all placeholder:text-slate-300"
      />
    )}
  </div>
);

export default BusinessHub;