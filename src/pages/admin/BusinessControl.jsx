import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Building2, Trash2, X, MapPin, User, CheckCircle2, AlertTriangle,
  Image as ImageIcon, Search, Phone, MessageSquare, Briefcase, Globe, Loader2, AlertCircle, Activity,
  Facebook, Instagram, Linkedin
} from 'lucide-react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

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
  logo: doc.logo_url || doc.logo || '',
  facebook: doc.facebook || '',
  instagram: doc.instagram || '',
  linkedin: doc.linkedin || '',
  services: Array.isArray(doc.services) ? doc.services : [],
  gallery: Array.isArray(doc.gallery) ? doc.gallery : [],
  created_at: doc.created_at || '',
  date: doc.created_at ? doc.created_at.split('T')[0] : '—',
});

const CATEGORIES = ['Technology','Real Estate','Finance','Healthcare','Retail','Construction','Other'];
const STATUSES   = ['Active','Inactive','Suspended'];

let businessUnitsCache = null;
let lastFetchTime = null;

// ─── Main Component ───────────────────────────────────────────────────────────
const BusinessHub = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  const [units, setUnits] = useState(
  businessUnitsCache || []
);
 const [loading, setLoading] = useState(
  !businessUnitsCache
);
  const [error,         setError]         = useState(null);
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [selectedUnit,  setSelectedUnit]  = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  
  const [searchQuery,   setSearchQuery]   = useState("");

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
      const formattedUnits = (data || []).map(normalizeBusinessUnit);
      setUnits(formattedUnits);
      businessUnitsCache = formattedUnits;
      lastFetchTime = Date.now();
      
    } catch (err) {
      console.error('Failed to load business units:', err);
      setError('Failed to load business units. Check your connection or permissions.');
    } finally { setLoading(false); }
  }, []);

useEffect(() => {
  const CACHE_DURATION =
    5 * 60 * 1000;

  if (
    businessUnitsCache &&
    lastFetchTime &&
    Date.now() - lastFetchTime < CACHE_DURATION
  ) {
    return;
  }

  fetchUnits();
}, []);

  // ── Search & Filter ───────────────────────────────────────────────────────
  const filteredUnits = useMemo(() => {
    if (!searchQuery) return units;
    const query = searchQuery.toLowerCase();
    return units.filter(u => 
      (u.name && u.name.toLowerCase().includes(query)) ||
      (u.managerName && u.managerName.toLowerCase().includes(query)) ||
      (u.category && u.category.toLowerCase().includes(query))
    );
  }, [units, searchQuery]);

  // ── Open detail ───────────────────────────────────────────────────────────
  const handleOpenDetail = useCallback(async (unit) => {
    setLoadingDetail(true);
    setSelectedUnit({ ...unit, _loading: true });

    try {
      const { data, error } = await supabase.rpc('get_business_unit_profile', { p_business_unit_id: unit.id });
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
      setSelectedUnit({ ...unit, _loading: false });
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // ── Delete flow ───────────────────────────────────────────────────────────
  const initiateDelete = async (unit) => {
    try {
      const { data, error } = await supabase.from('leads').select('id').eq('business_unit_id', unit.id).limit(100);
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
      const { error } = await supabase.from('business_units').delete().eq('id', deleteTarget.id);
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
        facebook:    formData.facebook,
        instagram:   formData.instagram,
        linkedin:    formData.linkedin,
        cityArea:    formData.cityArea,
        address:     formData.address,
        description: formData.description,
        manager:     formData.manager,
      };

      const { data, error } = await supabase.functions.invoke('create-business-unit', { body: payload });
      if (error) throw error;
      if (data?.success === false) throw new Error(data?.error || 'Edge function returned a failure response.');

      const tempPassword = data?.temporary_password ?? data?.temporaryPassword ?? '(check server logs)';
      alert(`Business unit registered successfully!\n\nManager Login Credentials\nEmail: ${formData.email}\nTemporary Password: ${tempPassword}\n\nShare these credentials with the manager.`);

      setShowAddModal(false);
      await fetchUnits();
    } catch (err) {
      console.error('Failed to create business unit:', err);
      const detail = err?.message || 'Unknown error. Check console for details.';
      alert(`Failed to register business unit:\n${detail}`);
    } finally { setSubmitting(false); }
  };

  // ── Charts Data ───────────────────────────────────────────────────────────
  const chartConfigs = useMemo(() => {
    const cats = units.reduce((acc, u) => { acc[u.category] = (acc[u.category] || 0) + 1; return acc; }, {});
    const hasCatSeries = Object.keys(cats).length > 0;

    const dailyCounts = units.reduce((acc, u) => { 
      if (u.date !== '—') acc[u.date] = (acc[u.date] || 0) + 1; 
      return acc; 
    }, {});
    const sortedDates = Object.keys(dailyCounts).sort().slice(-10);
    const hasTrendSeries = sortedDates.length > 0;

    return {
      distribution: {
        series:  hasCatSeries ? Object.values(cats) : [1],
        options: {
          chart: { type: 'donut', fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
          labels:  hasCatSeries ? Object.keys(cats) : ['No Data'],
          colors:  ['#81B398', '#DAC18A', '#48477A', '#718096', '#E2E8F0'], // Earth-Tech Palette
          legend:  { position: 'bottom', fontSize: '11px', fontWeight: 600, labels: { colors: isLight ? '#718096' : '#9CA3AF' } },
          plotOptions: { pie: { donut: { size: '75%' } } },
          dataLabels:  { enabled: false },
          stroke:  { show: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        },
      },
      trend: {
        series: [{ name: 'New Registrations', data: hasTrendSeries ? sortedDates.map(d => dailyCounts[d]) : [0] }],
        options: {
          chart: { type: 'area', toolbar: { show: false }, fontFamily: 'Plus Jakarta Sans', background: 'transparent', parentHeightOffset: 0 },
          colors: ['#48477A'],
          stroke: { curve: 'smooth', width: 2 },
          fill: { type: 'gradient', gradient: { opacityFrom: isLight ? 0.3 : 0.4, opacityTo: 0 } },
          xaxis: { 
            categories: hasTrendSeries ? sortedDates.map(d => d.split('-').slice(1).join('/')) : ['N/A'],
            labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } },
            axisBorder: { show: false }, axisTicks: { show: false }
          },
          yaxis: { labels: { style: { colors: isLight ? '#718096' : '#9CA3AF', fontSize: '11px', fontWeight: 500 } } },
          grid: { borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)', strokeDashArray: 4, xaxis: { lines: { show: false } }, padding: {left: 10, right: 0, bottom: 0, top: 0} },
          dataLabels: { enabled: false },
          tooltip: { theme: isLight ? 'light' : 'dark' }
        }
      }
    };
  }, [units, isLight]);

  // ── SKELETON ──
  if (loading && units.length === 0) {
    return (
      <div className="max-w-[1400px]  mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0">
        <div className="pt-2 mb-6">
          <div className={`h-10 w-64 rounded-md mb-2 ${pulseClass} animate-pulse`} />
          <div className={`h-4 w-48 rounded-md ${pulseClass} animate-pulse`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 mb-8">
           <div className={`h-[120px] rounded-2xl ${pulseClass} animate-pulse`} />
           <div className={`h-[120px] rounded-2xl ${pulseClass} animate-pulse`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
           <div className={`h-[280px] rounded-2xl ${pulseClass} animate-pulse`} />
           <div className={`h-[280px] rounded-2xl ${pulseClass} animate-pulse`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className={`h-[200px] rounded-2xl ${pulseClass} animate-pulse`} />)}
        </div>
      </div>
    );
  }

  return (
    <div className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-6 lg:space-y-8 max-w-[1400px] mx-auto pb-16 transition-colors duration-300 mt-2 lg:mt-4 px-4 lg:px-0 ${textPrimary}`}>

      {/* ── HEADER (Free/Borderless) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 pt-2">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
            Business Units
          </h1>
          <p className={`text-sm font-medium ${textSecondary}`}>
            Authorized Business Management and Onboarding.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'
          }`}
        >
          <Plus size={16} /> Add Business Unit
        </button>
      </div>

      {/* ── ANALYTICS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        <div className={`p-5 lg:p-6 rounded-2xl border flex flex-col justify-between h-[120px] lg:h-[140px] transition-all duration-300 min-w-0 ${surfaceClass}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider truncate mr-2 ${textSecondary}`}>Total Units</p>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'text-[#48477A] bg-[#48477A]/10' : 'text-[#81B398] bg-[#131720]'}`}>
              <Building2 size={18}/>
            </div>
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight truncate">{units.length}</h3>
        </div>
        
        <div className={`p-5 lg:p-6 rounded-2xl border flex flex-col justify-between h-[120px] lg:h-[140px] transition-all duration-300 min-w-0 ${surfaceClass}`}>
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold uppercase tracking-wider truncate mr-2 ${textSecondary}`}>Active Sectors</p>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isLight ? 'text-[#81B398] bg-[#F4F5F7]' : 'text-[#81B398] bg-[#81B398]/10'}`}>
              <Activity size={18}/>
            </div>
          </div>
          <h3 className="text-3xl lg:text-4xl font-bold tracking-tight truncate">{[...new Set(units.map(u => u.category))].length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className={`min-w-0 p-6 lg:p-8 rounded-2xl border flex flex-col transition-all duration-300 ${surfaceClass}`}>
          <div className="mb-6 shrink-0">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>Sectors Representation</h4>
            <p className={`text-xs font-medium mt-1 ${textSecondary}`}>Distribution of units across industries</p>
          </div>
          <div className="w-full flex-1 relative h-[250px] overflow-hidden">
            <Chart options={chartConfigs.distribution.options} series={chartConfigs.distribution.series} type="donut" height="100%" width="100%" />
          </div>
        </div>

        <div className={`min-w-0 p-6 lg:p-8 rounded-2xl border flex flex-col transition-all duration-300 ${surfaceClass}`}>
          <div className="mb-6 shrink-0">
            <h4 className={`text-sm font-bold uppercase tracking-wider ${textPrimary}`}>Onboarding Trend</h4>
            <p className={`text-xs font-medium mt-1 ${textSecondary}`}>New business unit registrations</p>
          </div>
          <div className="w-full flex-1 relative h-[250px] overflow-hidden">
            <Chart options={chartConfigs.trend.options} series={chartConfigs.trend.series} type="area" height="100%" width="100%" />
          </div>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className={`flex items-center gap-2 px-5 py-3.5 rounded-xl border transition-colors focus-within:border-[#81B398] ${surfaceClass}`}>
        <Search size={18} className={textSecondary} />
        <input 
          type="text"
          placeholder="Search by business name, manager, or category..."
          className={`w-full bg-transparent text-sm font-medium outline-none ${textPrimary} placeholder:${textSecondary}`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className={`hover:text-[#F0524F] transition-colors ${textSecondary}`}><X size={16} /></button>
        )}
      </div>

      {/* ── UNITS GRID ── */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#F0524F]">
          <AlertCircle size={32} />
          <p className="text-xs font-bold uppercase tracking-widest">{error}</p>
          <button onClick={fetchUnits} className="mt-2 px-6 py-2 bg-[#F0524F] text-[#FFFFFF] rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#D44846]">Retry</button>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className={`flex flex-col items-center justify-center py-24 gap-2 ${textSecondary}`}>
          <Building2 size={32} className="opacity-50" />
          <p className="text-xs font-bold uppercase tracking-widest mt-2">{searchQuery ? "No matching business units found" : "No business units registered yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredUnits.map((unit, idx) => (
              <motion.div
                layout key={unit.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                className={`border rounded-2xl p-6 transition-all duration-300 flex flex-col ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' : 'bg-[#222938] border-white/5 hover:border-[#81B398]'}`}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className={`h-14 w-14 rounded-full overflow-hidden flex items-center justify-center shrink-0 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/5 text-[#F4F5F7]'}`}>
                    {unit.logo ? (
                       <img src={resolveUrl(unit.logo)} alt={unit.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="font-bold text-lg uppercase">{unit.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-bold tracking-tight truncate ${textPrimary}`}>{unit.name}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider mt-1 ${textSecondary}`}>{unit.category}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${unit.status === 'Active' ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20' : 'bg-[#DAC18A]/10 text-[#DAC18A] border-[#DAC18A]/20'}`}>
                    {unit.status}
                  </span>
                </div>

                <div className={`space-y-3 mb-6 p-4 rounded-xl border flex-1 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className={textSecondary}>Manager</span>
                    <span className={`truncate max-w-[120px] ${textPrimary}`}>{unit.managerName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className={textSecondary}>Email</span>
                    <span className={`truncate max-w-[140px] ${textPrimary}`}>{unit.email || '—'}</span>
                  </div>
                  {unit.cityArea && (
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className={textSecondary}>Location</span>
                      <span className={`truncate max-w-[120px] ${textPrimary}`}>{unit.cityArea}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-auto shrink-0">
                  <button
                    onClick={() => handleOpenDetail(unit)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 border ${
                      isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7] hover:border-[#81B398] hover:text-[#81B398]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720] hover:border-[#81B398] hover:text-[#81B398]'
                    }`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => initiateDelete(unit)}
                    className={`p-2.5 rounded-lg transition-all border flex items-center justify-center ${
                       isLight ? 'bg-[#FFFFFF] border-[#F0524F]/30 text-[#F0524F] hover:bg-[#F0524F]/10' : 'bg-[#222938] border-[#F0524F]/30 text-[#F0524F] hover:bg-[#F0524F]/20'
                    }`}
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── DOSSIER MODAL ── */}
      <AnimatePresence>
        {selectedUnit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border rounded-2xl ${surfaceClass}`}
            >
              {/* Header */}
              <div className={`p-6 md:p-8 border-b flex justify-between items-center shrink-0 transition-colors duration-300 ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
                <div className="flex items-center gap-4">
                  <div className={`h-16 w-16 rounded-full overflow-hidden flex items-center justify-center font-bold text-lg uppercase shrink-0 border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/5 text-[#F4F5F7]'}`}>
                    {selectedUnit.logo ? (
                      <img src={resolveUrl(selectedUnit.logo)} alt={selectedUnit.name} className="w-full h-full object-cover" />
                    ) : (
                      selectedUnit.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h3 className={`text-2xl font-extrabold tracking-tight mb-1 ${textPrimary}`}>{selectedUnit.name}</h3>
                    <p className={`text-xs font-semibold uppercase tracking-wider text-[#81B398]`}>
                      {selectedUnit.category}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedUnit(null)}
                    className={`p-2 rounded-lg transition-colors ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-[#131720]'}`}
                  >
                    <X size={20}/>
                  </button>
                </div>
              </div>

              {/* Body */}
              {selectedUnit._loading || loadingDetail ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
                  <Loader2 size={32} className={`animate-spin ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`} />
                  <p className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Loading Full Profile...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    <div className="space-y-8">
                      <DossierSection title="Unit Identity" icon={<User size={16}/>} isLight={isLight} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <InfoItem label="Manager"      value={selectedUnit.managerName} textPrimary={textPrimary} textSecondary={textSecondary} />
                        <InfoItem label="Commission"   value={`${selectedUnit.commission}%`} textPrimary={textPrimary} textSecondary={textSecondary} />
                        <InfoItem label="Onboarded"    value={selectedUnit.date} textPrimary={textPrimary} textSecondary={textSecondary} />
                        <InfoItem label="Status"       value={selectedUnit.status} textPrimary={textPrimary} textSecondary={textSecondary} />
                        
                        {selectedUnit.phone && (
                          <div className="pt-4 mt-4 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                             <InfoItem label="Primary Phone" value={selectedUnit.phone} textPrimary={textPrimary} textSecondary={textSecondary} />
                             <div className="flex gap-3 mt-3">
                               <a 
                                  href={`tel:${selectedUnit.phone}`} 
                                  className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all border ${
                                    isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'
                                  }`}
                                >
                                  <Phone size={14} /> Call
                                </a>
                                <a 
                                  href={`https://wa.me/${selectedUnit.phone.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="flex-1 py-2.5 px-4 bg-[#81B398] text-[#FFFFFF] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#6FA085]"
                                >
                                  <MessageSquare size={14} /> WhatsApp
                                </a>
                             </div>
                          </div>
                        )}
                        
                        {selectedUnit.email && (
                          <div className="flex justify-between items-center border-b pb-2 pt-2 mt-2" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Email</span>
                            <span className={`text-sm font-bold lowercase ${textPrimary}`}>{selectedUnit.email}</span>
                          </div>
                        )}
                        {selectedUnit.website && (
                          <div className="flex justify-between items-center border-b pb-2 pt-2 mt-2" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Website</span>
                            <a href={selectedUnit.website} target="_blank" rel="noreferrer" className={`text-sm font-bold flex items-center gap-1 hover:underline ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>
                              <Globe size={14}/> Link
                            </a>
                          </div>
                        )}
                        {selectedUnit.facebook && (
                          <div className="flex justify-between items-center border-b pb-2 pt-2 mt-2" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Facebook</span>
                            <a href={selectedUnit.facebook} target="_blank" rel="noreferrer" className={`text-sm font-bold flex items-center gap-1 hover:underline ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>
                              <Facebook size={14}/> Link
                            </a>
                          </div>
                        )}
                        {selectedUnit.instagram && (
                          <div className="flex justify-between items-center border-b pb-2 pt-2 mt-2" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Instagram</span>
                            <a href={selectedUnit.instagram} target="_blank" rel="noreferrer" className={`text-sm font-bold flex items-center gap-1 hover:underline ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>
                              <Instagram size={14}/> Link
                            </a>
                          </div>
                        )}
                        {selectedUnit.linkedin && (
                          <div className="flex justify-between items-center border-b pb-2 pt-2 mt-2" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                            <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>LinkedIn</span>
                            <a href={selectedUnit.linkedin} target="_blank" rel="noreferrer" className={`text-sm font-bold flex items-center gap-1 hover:underline ${isLight ? 'text-[#81B398]' : 'text-[#81B398]'}`}>
                              <Linkedin size={14}/> Link
                            </a>
                          </div>
                        )}
                      </DossierSection>

                      <DossierSection title="HQ Coordinates" icon={<MapPin size={16}/>} isLight={isLight} textPrimary={textPrimary} textSecondary={textSecondary}>
                        <div className={`p-4 rounded-xl border flex items-start gap-3 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                          <MapPin size={20} className="text-[#81B398] shrink-0 mt-0.5" />
                          <div className="space-y-1 min-w-0">
                            {selectedUnit.cityArea && <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>{selectedUnit.cityArea}</p>}
                            <p className={`text-sm font-bold leading-relaxed ${textPrimary}`}>{selectedUnit.address || 'No address on file'}</p>
                          </div>
                        </div>
                        {selectedUnit.description && (
                          <div className={`p-4 rounded-xl border mt-4 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                            <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>About</p>
                            <p className={`text-sm font-medium leading-relaxed italic ${textSecondary}`}>{selectedUnit.description}</p>
                          </div>
                        )}
                      </DossierSection>
                    </div>

                    <div className="space-y-8">
                      <DossierSection title="Service Portfolio" icon={<Briefcase size={16}/>} isLight={isLight} textPrimary={textPrimary} textSecondary={textSecondary}>
                        {selectedUnit.services.length > 0 ? (
                          <div className="space-y-3">
                            {selectedUnit.services.map((s, i) => (
                              <div key={i} className={`p-4 rounded-xl border transition-all ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-sm font-bold tracking-tight ${textPrimary}`}>{s.service_name}</span>
                                  <CheckCircle2 size={16} className="text-[#81B398] shrink-0" />
                                </div>
                                {s.description && <p className={`text-xs font-medium leading-relaxed ${textSecondary}`}>{s.description}</p>}
                              </div>
                            ))}
                          </div>
                        ) : <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>No services listed</p>}
                      </DossierSection>

                      <DossierSection title="Gallery" icon={<ImageIcon size={16}/>} isLight={isLight} textPrimary={textPrimary} textSecondary={textSecondary}>
                        {selectedUnit.gallery.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {selectedUnit.gallery.map((g, i) => (
                              <div key={i} className={`aspect-video rounded-xl overflow-hidden border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/5'}`}>
                                {g.image
                                  ? <img src={resolveUrl(g.image)} alt={g.caption || `Gallery ${i+1}`} className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; }} />
                                  : <div className={`w-full h-full flex items-center justify-center ${textSecondary}`}><ImageIcon size={24}/></div>
                                }
                              </div>
                            ))}
                          </div>
                        ) : <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>No gallery items</p>}
                      </DossierSection>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── DELETE CONFIRM MODAL ── */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md rounded-2xl shadow-xl border overflow-hidden ${surfaceClass}`}
            >
              <div className={`p-6 border-b flex items-center gap-4 ${isLight ? 'bg-[#F0524F]/5 border-[#E2E8F0]' : 'bg-[#F0524F]/10 border-white/5'}`}>
                <div className="h-12 w-12 bg-[#F0524F] rounded-xl flex items-center justify-center shrink-0">
                  <Trash2 size={20} className="text-white"/>
                </div>
                <div>
                  <h3 className={`text-lg font-bold tracking-tight ${textPrimary}`}>Disconnect Unit</h3>
                  <p className="text-xs font-semibold text-[#F0524F] uppercase tracking-wider mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <p className={`text-sm font-medium leading-relaxed ${textPrimary}`}>
                  You are about to permanently delete <strong className="font-bold">"{deleteTarget.name}"</strong>.
                </p>
                {deleteTarget.linkedLeads.length > 0 ? (
                  <div className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-[#DAC18A]/10 border-[#DAC18A]/20' : 'bg-[#DAC18A]/5 border-[#DAC18A]/10'}`}>
                    <p className="text-xs font-bold text-[#DAC18A] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle size={14} /> {deleteTarget.linkedLeads.length} linked lead(s) detected
                    </p>
                    <p className={`text-xs font-medium leading-relaxed ${textSecondary}`}>
                      These leads reference this business unit. Their unit association will be cleared — the leads themselves will not be deleted.
                    </p>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>No linked leads found. Safe to delete.</p>
                  </div>
                )}
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:bg-[#1A202C]'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-[2] py-3 bg-[#F0524F] hover:bg-[#D44846] text-[#FFFFFF] rounded-lg text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin"/> : <Trash2 size={16}/>}
                  {deleting ? "Processing..." : "Confirm Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── ADD MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden border max-h-[90vh] flex flex-col ${surfaceClass}`}
            >
              <div className={`px-6 py-5 border-b flex justify-between items-center shrink-0 ${isLight ? 'bg-[#F4F5F7]/40 border-[#E2E8F0]' : 'bg-[#131720]/30 border-white/5'}`}>
                <h3 className={`text-lg font-bold tracking-tight ${textPrimary}`}>Register New Unit</h3>
                <button onClick={() => setShowAddModal(false)} className={`transition-colors ${isLight ? 'text-[#718096] hover:text-[#1A202C]' : 'text-[#9CA3AF] hover:text-[#F4F5F7]'}`}>
                  <X size={20}/>
                </button>
              </div>
              <AddUnitForm onSubmit={handleCreate} onCancel={() => setShowAddModal(false)} submitting={submitting} isLight={isLight} textSecondary={textSecondary} textPrimary={textPrimary} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Add Unit Form ────────────────────────────────────────────────────────────
const AddUnitForm = ({ onSubmit, onCancel, submitting, isLight, textSecondary, textPrimary }) => {
  const [form, setForm] = useState({
    name: '', category: '', manager: '', phone: '',
    whatsapp: '', email: '', website: '', facebook: '', instagram: '', linkedin: '', cityArea: '', address: '', description: '', commision: 10
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
    <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormInput label="Business Name *"   value={form.name}      onChange={set('name')}      placeholder="e.g. SKYLINE TECH"        required isLight={isLight} />
        <FormInput label="Market Category *" value={form.category}  onChange={set('category')}  placeholder="Enter Category"           required isLight={isLight} />
        <FormInput label="Commission (%) *"  type="number" value={form.commision} onChange={set('commision')} placeholder="e.g. 10" required isLight={isLight} />
        <FormInput label="Unit Manager *"    value={form.manager}   onChange={set('manager')}   placeholder="e.g. ABHISHEK"       required isLight={isLight} />
        <FormInput label="Primary Phone *"   value={form.phone}     onChange={set('phone')}     placeholder="98475 12025"          required isLight={isLight} />
        <FormInput label="WhatsApp Number *" value={form.whatsapp}  onChange={set('whatsapp')}  placeholder="98475 12025"          required isLight={isLight} />
        <FormInput label="Email *"           value={form.email}     onChange={set('email')}     placeholder="unit@example.com"          required type="email" isLight={isLight} />
        <FormInput label="Website"           value={form.website}   onChange={set('website')}   placeholder="https://example.com"       type="url" isLight={isLight} />
        <FormInput label="Facebook URL"      value={form.facebook}  onChange={set('facebook')}  placeholder="https://facebook.com/..."  type="url" isLight={isLight} />
        <FormInput label="Instagram URL"     value={form.instagram} onChange={set('instagram')} placeholder="https://instagram.com/..." type="url" isLight={isLight} />
        <FormInput label="LinkedIn URL"      value={form.linkedin}  onChange={set('linkedin')}  placeholder="https://linkedin.com/in/..." type="url" isLight={isLight} />
        <FormInput label="City / Area"       value={form.cityArea}  onChange={set('cityArea')}  placeholder="e.g. Business Bay, Dubai" isLight={isLight} />
      </div>
      <FormInput label="Address *"     value={form.address}     onChange={set('address')}     placeholder="Full address..."                                  required isTextarea isLight={isLight} />
      <FormInput label="Description *" value={form.description} onChange={set('description')} placeholder="Brief overview of this business unit..." required isTextarea isLight={isLight} />
      
      <div className="flex gap-3 pt-4 border-t" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
        <button type="button" onClick={onCancel} className={`flex-1 py-3 rounded-lg text-sm font-semibold transition-all border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:bg-[#1A202C]'}`}>
          Cancel
        </button>
        <button type="submit" disabled={submitting} className="flex-[2] py-3 bg-[#81B398] hover:bg-[#6FA085] text-[#FFFFFF] rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <Loader2 size={16} className="animate-spin"/> : null}
          {submitting ? 'Registering...' : 'Register Unit'}
        </button>
      </div>
    </form>
  );
};

// ─── Helper Components ────────────────────────────────────────────────────────

const DossierSection = ({ title, icon, children, isLight, textPrimary, textSecondary }) => (
  <section className={`p-6 rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
    <h5 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-4 mb-5 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'} ${textPrimary}`}>
      <span className="text-[#81B398]">{icon}</span> {title}
    </h5>
    <div className="space-y-4">{children}</div>
  </section>
);

const InfoItem = ({ label, value, textSecondary, textPrimary }) => (
  <div className="flex justify-between items-center border-b pb-2" style={{ borderColor: 'rgba(156, 163, 175, 0.1)' }}>
    <span className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>{label}</span>
    <span className={`text-sm font-bold ${textPrimary}`}>{value}</span>
  </div>
);

const FormInput = ({ label, value, onChange, placeholder, type = 'text', required, isTextarea, isSelect, options = [], isLight }) => {
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const inputBg = isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent focus:bg-[#222938] focus:border-[#81B398]';

  return (
    <div className="space-y-1.5">
      <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>{label}</label>
      {isTextarea ? (
        <textarea value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3}
          className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all resize-none border ${inputBg}`}
        />
      ) : isSelect ? (
        <select value={value} onChange={onChange} required={required}
          className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none cursor-pointer transition-all border ${inputBg}`}
        >
          <option value="">Select category...</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
          className={`w-full px-4 py-3 rounded-lg text-sm font-medium outline-none transition-all border ${inputBg}`}
        />
      )}
    </div>
  );
};

export default BusinessHub;