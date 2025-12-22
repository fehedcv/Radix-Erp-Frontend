import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'; // 1. Router hooks ചേർത്തു
import { 
  ArrowLeft, Phone, MapPin, 
  CheckCircle2, XCircle, User, 
  AlertTriangle, Loader2, Calendar, 
  FileText, ShieldCheck, Star, Mail, Check,
  Briefcase, ChevronRight
} from 'lucide-react';

const LeadReview = () => {
  const { id } = useParams(); // URL-ൽ നിന്ന് ID എടുക്കുന്നു
  const navigate = useNavigate();
  
  // 2. BusinessHub-ൽ നിന്ന് context വഴി ഡാറ്റയും ഫങ്ക്ഷനും എടുക്കുന്നു
  const { leads, updateLeadStatus } = useOutletContext();

  // 3. ID ഉപയോഗിച്ച് കറക്റ്റ് ലീഡ് കണ്ടെത്തുന്നു
  const lead = useMemo(() => leads.find(l => l.id === id), [leads, id]);

  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '', confirmText: '', targetStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // ഡാറ്റ ലഭ്യമല്ലെങ്കിൽ (Fallback)
  if (!lead) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-bold uppercase tracking-widest">Lead Record Not Found</p>
        <button onClick={() => navigate('/business/leads')} className="mt-4 text-indigo-600 font-bold uppercase text-xs">Back to Registry</button>
      </div>
    );
  }

  // --- DATA CONFIG (Preserved Logic) ---
  const agentData = {
    id: lead.agentId || "AG-Unknown",
    name: lead.agentName || "System Agent",
    rating: 4.8,
    totalLeads: 42
  };

  const workflowSteps = ['Verified', 'Started', 'In Progress', 'Completed'];
  const normalizedStatus = (lead.status === 'Verfied' || lead.status === 'Verified') ? 'Verified' : lead.status;
  const currentStepIndex = workflowSteps.indexOf(normalizedStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': case 'Verfied': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Started': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress': return 'bg-slate-900 text-white border-slate-900';
      case 'Completed': return 'bg-indigo-600 text-white border-indigo-600';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-100';
      default: return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  // --- HANDLERS ---
  const confirmAction = (type, targetStatus = '') => {
    let config = {};
    if (type === 'verify') {
        config = { title: 'Confirm Verification', message: 'Authorize this lead and move to the project pipeline?', confirmText: 'Verify Entry', targetStatus: 'Verified' };
    } else if (type === 'reject') {
        config = { title: 'Reject Lead', message: 'Mark this lead as invalid? This operation cannot be reversed.', confirmText: 'Confirm Reject', targetStatus: 'Rejected' };
    } else if (type === 'statusChange') {
        config = { title: `Transition to ${targetStatus}`, message: `Update project lifecycle stage to "${targetStatus}"?`, confirmText: 'Execute Update', targetStatus: targetStatus };
    }
    setModal({ ...config, show: true, type });
  };

  const executeModalAction = async () => {
    setIsProcessing(true);
    try {
      // 4. Global state അപ്‌ഡേറ്റ് ചെയ്യുന്നു
      await updateLeadStatus(lead.id, modal.targetStatus);
      setModal(prev => ({ ...prev, show: false }));
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="space-y-4">
          <button 
            onClick={() => navigate('/business/leads')} 
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em]"
          >
            <ArrowLeft size={14} /> Registry Hub
          </button>
          <div className="flex items-center gap-4">
             <h2 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Audit File</h2>
             <span className="bg-slate-100 px-3 py-1 text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">{lead.id}</span>
          </div>
        </div>
        
        <div className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] border rounded-none shadow-sm ${getStatusColor(lead.status)}`}>
          {lead.status === 'Pending' ? 'Status: Awaiting Review' : `Stage: ${lead.status}`}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 2. LEFT: SPECIFICATIONS */}
        <div className="lg:col-span-8 space-y-10">
            <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-indigo-600">
                        <FileText size={18} />
                        <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Project Requirements</h3>
                    </div>
                </div>
                <div className="p-10 space-y-8">
                    <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Requested Deployment</p>
                        <h2 className="text-3xl font-bold text-slate-900 uppercase tracking-tight">{lead.service}</h2>
                    </div>
                    <div className="bg-slate-900 p-8 text-white border-l-8 border-indigo-600">
                        <p className="text-slate-300 text-sm leading-relaxed font-medium italic">
                            "{lead.description || "No project description logged."}"
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-slate-100 bg-slate-50 flex items-center gap-3 text-indigo-600">
                    <User size={18} />
                    <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest">Client Identity Dossier</h3>
                </div>
                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Legal Name</label>
                        <p className="text-xl font-bold text-slate-900 uppercase tracking-tight">{lead.clientName}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phone Extension</label>
                        <p className="text-xl font-bold text-slate-900">{lead.clientPhone}</p>
                    </div>
                    <div className="md:col-span-2 space-y-4 pt-6 border-t border-slate-50">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Physical Coordinates</label>
                        <div className="flex items-start gap-4">
                            <MapPin size={20} className="text-indigo-600 shrink-0 mt-1" />
                            <p className="text-sm text-slate-600 font-bold uppercase leading-relaxed tracking-wide">{lead.clientAddress}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. RIGHT: AGENT & CONTROLS */}
        <div className="lg:col-span-4 space-y-10">
            <div className="bg-slate-900 border border-slate-800 rounded-none shadow-2xl overflow-hidden group">
                 <div className="px-6 py-4 bg-white/5 flex items-center gap-3">
                    <ShieldCheck size={18} className="text-indigo-400" />
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Source Registry</h3>
                </div>
                <div className="p-8 space-y-8">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 bg-white flex items-center justify-center text-slate-900 font-black text-2xl border-b-4 border-indigo-600">
                            {agentData.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-white uppercase tracking-tight">{agentData.name}</h4>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase mt-1">
                                <span>{agentData.id}</span>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={12} fill="currentColor" /> {agentData.rating}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button className="w-full py-4 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all">Agent Record File</button>
                </div>
            </div>

            {/* Lifecycle Control */}
            <div className="bg-white border border-slate-200 rounded-none p-8 space-y-8">
                {lead.status !== 'Pending' && lead.status !== 'Rejected' ? (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                           <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifecycle Progression</h3>
                           <span className="text-[10px] font-black px-2 py-1 bg-indigo-50 text-indigo-600 uppercase border border-indigo-100">
                             {currentStepIndex > -1 ? Math.round(((currentStepIndex + 1) / workflowSteps.length) * 100) : 0}% Node Completion
                           </span>
                        </div>
                        
                        {/* Interactive Progress Map */}
                        <div className="flex justify-between relative px-2">
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-100 -translate-y-1/2" />
                            {workflowSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                return (
                                    <div key={step} className="relative z-10">
                                        <div className={`w-9 h-9 flex items-center justify-center border-2 transition-all duration-700 ${isCompleted ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                                            {isCompleted ? <Check size={16} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-3">
                             {['Started', 'In Progress', 'Completed'].map((stage) => {
                                const isActive = lead.status === stage;
                                const isPassed = workflowSteps.indexOf(stage) < currentStepIndex;
                                return (
                                    <button
                                        key={stage}
                                        onClick={() => confirmAction('statusChange', stage)}
                                        disabled={isActive || isPassed}
                                        className={`w-full flex items-center justify-between px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
                                            isActive 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' 
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                                        } ${isPassed ? 'opacity-20 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        {stage}
                                        {isActive && <div className="h-2 w-2 bg-white animate-pulse" />}
                                    </button>
                                );
                             })}
                        </div>
                    </div>
                ) : lead.status === 'Pending' && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em]">Authorize Entry</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Verify data integrity to deploy unit pipeline.</p>
                        </div>
                        <div className="space-y-4">
                            <button 
                                onClick={() => confirmAction('verify')} 
                                className="w-full py-5 bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-2xl flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={18} /> Authorize Registry
                            </button>
                            <button 
                                onClick={() => confirmAction('reject')} 
                                className="w-full py-5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3"
                            >
                                <XCircle size={18} /> Terminate Entry
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 4. MODAL PROTOCOL */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-sm rounded-none shadow-2xl overflow-hidden border border-slate-200">
                <div className="p-10 text-center space-y-6">
                    <div className={`mx-auto w-16 h-16 flex items-center justify-center border-2 ${modal.type === 'reject' ? 'border-red-100 text-red-500' : 'border-slate-100 text-slate-900'}`}>
                        {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <AlertTriangle size={32} />}
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{modal.title}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-wider">{modal.message}</p>
                    </div>
                </div>
                <div className="flex border-t border-slate-100">
                    <button onClick={() => setModal({ ...modal, show: false })} disabled={isProcessing} className="flex-1 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-colors">Abort</button>
                    <button onClick={executeModalAction} disabled={isProcessing} className={`flex-1 py-5 text-[10px] font-black text-white uppercase tracking-[0.2em] transition-all ${modal.type === 'reject' ? 'bg-red-600' : 'bg-slate-900 hover:bg-indigo-600'}`}>
                        {isProcessing ? "Transmitting..." : "Authorize"}
                    </button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LeadReview;