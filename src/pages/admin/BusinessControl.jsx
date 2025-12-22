import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // റൂട്ടിംഗിനായി ചേർത്തു
import { 
  Plus, Building2, Trash2, X, 
  ShieldCheck, Globe, Phone, MapPin, 
  UserPlus, Key, Briefcase, Mail, Lock,
  User as LucideUser, BarChart3, Package, Layers, CheckCircle2,
  Info
} from 'lucide-react';

// Data Import
import { businessUnits as coreBusinessData } from '../../data/businessData';

const BusinessControl = () => {
  const navigate = useNavigate(); // Navigation hook
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  
  const [units, setUnits] = useState(() => {
    const saved = localStorage.getItem('vynx_units');
    return saved ? JSON.parse(saved) : [];
  });

  // --- HANDLERS (Logic Preserved) ---
  const handleCreateUnit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const newUnit = {
      id: `U-${Math.floor(Math.random() * 900) + 100}`,
      name: formData.get('name'),
      category: formData.get('category'),
      email: formData.get('email'), 
      password: formData.get('password'), 
      status: 'Active',
      managerName: formData.get('manager') || 'Pending Assignment',
      date: new Date().toISOString().split('T')[0]
    };

    const updatedUnits = [...units, newUnit];
    setUnits(updatedUnits);
    localStorage.setItem('vynx_units', JSON.stringify(updatedUnits));
    setShowAddModal(false);
  };

  const handleDelete = (id) => {
    if(window.confirm("Terminate this business unit access?")) {
      const updated = units.filter(u => u.id !== id);
      setUnits(updated);
      localStorage.setItem('vynx_units', JSON.stringify(updated));
    }
  };

  const getExtendedInfo = (unitName) => {
    return coreBusinessData.find(b => b.name === unitName) || {};
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      
      {/* 1. MASTER HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Unit Registry Hub</h2>
          <p className="text-sm font-medium text-slate-500 italic">Centralized infrastructure provisioning and account management.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-none text-xs font-bold uppercase tracking-widest transition-all shadow-lg active:scale-[0.98] w-full md:w-auto"
        >
          <Plus size={16} /> Provision New Node
        </button>
      </div>

      {/* 2. UNIT REGISTRY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <motion.div layout key={unit.id} className="bg-white border border-slate-200 rounded-none p-6 hover:border-indigo-600 transition-all group relative shadow-sm">
            <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-bold uppercase border-l border-b ${
              unit.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {unit.status}
            </div>

            <div className="flex items-center gap-5 mb-8 pt-2">
                <div className="h-12 w-12 bg-slate-900 text-white rounded-none flex items-center justify-center font-bold text-xl uppercase border-b-2 border-indigo-600">
                    {unit.name.charAt(0)}
                </div>
                <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-tight leading-none">{unit.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1.5 uppercase tracking-widest font-mono">ID: {unit.id}</p>
                </div>
            </div>

            <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between text-xs py-2 border-b border-slate-50">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Industry</span>
                    <span className="font-bold text-slate-700 uppercase">{unit.category}</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Auth_Manager</span>
                    <span className="font-bold text-slate-700 uppercase">{unit.managerName}</span>
                </div>
            </div>

            <div className="flex gap-2">
                <button 
                    onClick={() => setSelectedUnit(unit)}
                    className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest rounded-none transition-all flex items-center justify-center gap-2"
                >
                    <BarChart3 size={14}/> System Profile
                </button>
                <button 
                  onClick={() => handleDelete(unit.id)}
                  className="p-3 bg-slate-50 border border-slate-200 text-slate-300 hover:text-red-600 hover:border-red-100 rounded-none transition-all"
                >
                    <Trash2 size={16}/>
                </button>
            </div>
          </motion.div>
        ))}
        {units.length === 0 && (
           <div className="col-span-full py-32 text-center bg-white border border-dashed border-slate-200 rounded-none">
              <Building2 size={48} className="text-slate-100 mx-auto mb-4" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">No node data found in system registry.</p>
           </div>
        )}
      </div>

      {/* 3. PROVISIONING TERMINAL (MODAL) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-2xl rounded-none relative shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
                <div className="flex items-center gap-3 text-indigo-600">
                  <UserPlus size={18} />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest">Provision New Network Node</h3>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors p-1"><X size={20}/></button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <form id="unit-form" onSubmit={handleCreateUnit} className="p-8 md:p-10 space-y-10">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">01. Unit Identity</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Business Display Name</label>
                        <input name="name" required type="text" placeholder="e.g. VYNX SOLUTIONS" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-200" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Sector / Industry</label>
                        <input name="category" required type="text" placeholder="e.g. SOFTWARE DEV" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all uppercase placeholder:text-slate-200" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">02. Operational Authority</h5>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assigned Unit Manager</label>
                        <div className="relative">
                          <LucideUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                          <input name="manager" required type="text" placeholder="Full Identity Name" className="w-full px-4 py-3 pl-12 bg-white border border-slate-200 rounded-none text-sm font-semibold outline-none focus:border-indigo-600 transition-all placeholder:text-slate-200" />
                        </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">03. Security Authorization</h5>
                    <div className="p-8 bg-slate-900 border border-slate-800 rounded-none space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">System Email ID</label>
                            <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input name="email" required type="email" placeholder="unit@vynx.com" className="w-full bg-slate-950 border border-slate-800 rounded-none py-3 pl-12 pr-4 text-xs font-semibold text-white outline-none focus:border-indigo-600 placeholder:text-slate-700" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">System Access Key</label>
                            <div className="relative">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                              <input name="password" required type="password" placeholder="••••••••" className="w-full bg-slate-950 border border-slate-800 rounded-none py-3 pl-12 pr-4 text-xs font-semibold text-white outline-none focus:border-indigo-600 placeholder:text-slate-700" />
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50 shrink-0 flex flex-col md:flex-row gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-none text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all">Cancel</button>
                <button form="unit-form" type="submit" className="flex-[2] py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-none font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-[0.98]">
                    Authorize & Commit Registry Node
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CENTRAL UNIT DOSSIER */}
      <AnimatePresence>
        {selectedUnit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-5xl max-h-[90vh] rounded-none shadow-2xl relative overflow-hidden flex flex-col border border-slate-200"
            >
              <div className="p-8 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 bg-white text-slate-900 rounded-none flex items-center justify-center font-bold text-3xl border-b-8 border-indigo-600 shadow-xl">
                    {selectedUnit.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tighter uppercase leading-none">{selectedUnit.name}</h3>
                    <div className="flex items-center gap-4 mt-3">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Registry: {selectedUnit.id}</span>
                       <div className="h-1.5 w-1.5 bg-slate-600 rounded-none" />
                       <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{selectedUnit.status} NODE</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedUnit(null)} className="p-2 border border-white/20 text-white hover:bg-red-600 transition-all rounded-none"><X size={24}/></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                  <div className="space-y-12">
                     <section className="space-y-5">
                        <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                           <ShieldCheck size={14} /> Identity Authentication
                        </h5>
                        <div className="grid grid-cols-1 gap-4">
                           <div className="p-5 bg-slate-50 border border-slate-100 rounded-none">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Industry Classification</p>
                              <p className="text-base font-bold text-slate-900 uppercase">{selectedUnit.category}</p>
                           </div>
                           <div className="p-5 bg-slate-50 border border-slate-100 rounded-none">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Operational Authority</p>
                              <p className="text-base font-bold text-slate-900 uppercase">{selectedUnit.managerName}</p>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-5">
                        <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                           <Globe size={14} /> Communication Dossier
                        </h5>
                        <div className="space-y-3">
                           <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-none">
                              <Mail size={18} className="text-slate-400" />
                              <div className="truncate">
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Login Identity</p>
                                 <p className="text-sm font-bold text-slate-800 lowercase">{selectedUnit.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 p-5 border border-slate-200 rounded-none">
                              <Phone size={18} className="text-slate-400" />
                              <div>
                                 <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Contact Extension</p>
                                 <p className="text-sm font-bold text-slate-800">{getExtendedInfo(selectedUnit.name).phone || "+971 50 000 0000"}</p>
                              </div>
                           </div>
                        </div>
                     </section>
                  </div>

                  <div className="space-y-12">
                     <section className="space-y-5">
                        <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                           <MapPin size={14} /> Deployment Coordinates
                        </h5>
                        <div className="p-5 bg-slate-50 border border-slate-200 rounded-none flex items-start gap-4">
                           <MapPin size={22} className="text-indigo-600 mt-1 shrink-0" />
                           <div>
                              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">HQ Physical Location</p>
                              <p className="text-sm font-bold text-slate-900 uppercase leading-relaxed">{getExtendedInfo(selectedUnit.name).location || "Business Bay, Dubai, UAE"}</p>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-5">
                        <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.3em] border-b border-slate-100 pb-3 flex items-center gap-2">
                           <Layers size={14} /> Capability Portfolio
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                           {(getExtendedInfo(selectedUnit.name).products || ["Infrastructure Solutions", "Commercial Services"]).map((p, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-none group hover:border-indigo-600 transition-all">
                                 <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{p}</span>
                                 <CheckCircle2 size={16} className="text-emerald-500" />
                              </div>
                           ))}
                        </div>
                     </section>
                  </div>
                </div>

                <div className="p-6 bg-amber-50 border border-amber-100 flex gap-5 rounded-none">
                   <Info size={24} className="text-amber-600 shrink-0 mt-0.5" />
                   <p className="text-xs text-amber-800 leading-relaxed font-semibold uppercase tracking-tight">
                     Registry record synchronized with global HQ database. Identity modifications will propagate immediately.
                   </p>
                </div>
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-200 shrink-0">
                  <button onClick={() => setSelectedUnit(null)} className="w-full py-4 bg-slate-900 text-white rounded-none text-xs font-bold uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl">
                    Close Dossier Profile
                  </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BusinessControl;