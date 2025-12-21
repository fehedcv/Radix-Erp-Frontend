import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Phone, MapPin, 
  CheckCircle2, XCircle, User, 
  AlertTriangle, Loader2, Calendar, 
  FileText, ShieldCheck, Star, Mail, Check,
  Briefcase, ChevronRight
} from 'lucide-react';

const LeadReview = ({ lead, onBack, onVerify, onReject, onUpdateStatus }) => {
  // --- STATE MANAGEMENT (Logic Preserved) ---
  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '', confirmText: '', targetStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(lead.status);

  useEffect(() => {
    setCurrentStatus(lead.status);
  }, [lead.status]);

  // --- DATA CONFIG (Logic Preserved) ---
  const agentData = {
    id: "AG-884",
    name: "Arjun Nair",
    phone: "+91 98765 43210",
    email: "arjun.nair@vynx.com",
    rating: 4.8,
    totalLeads: 42
  };

  const workflowSteps = ['Verified', 'Started', 'In Progress', 'Completed'];
  const normalizedStatus = (currentStatus === 'Verfied' || currentStatus === 'Verified') ? 'Verified' : currentStatus;
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

  // --- HANDLERS (Logic Preserved) ---
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

  const executeModalAction = async (e) => {
    if(e) e.preventDefault();
    setIsProcessing(true);
    const newStatus = modal.targetStatus;
    try {
      if (newStatus === 'Verified') {
        if(onVerify) await onVerify(lead.id);
      } else if (newStatus === 'Rejected') {
        if(onReject) await onReject(lead.id);
      } else {
        if(onUpdateStatus) await onUpdateStatus(lead.id, newStatus);
      }
      setCurrentStatus(newStatus);
      setModal(prev => ({ ...prev, show: false }));
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="max-w-6xl mx-auto space-y-8 pb-20"
    >
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-4">
          <button 
            type="button"
            onClick={onBack} 
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </button>
          <div className="flex items-center gap-4">
             <h2 className="text-3xl font-bold text-slate-900 tracking-tight uppercase">Review Lead Registry</h2>
             <span className="text-xs font-mono text-slate-400">ID: {lead.id}</span>
          </div>
        </div>
        
        <motion.div 
          key={currentStatus}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className={`px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest border rounded-none shadow-sm ${getStatusColor(currentStatus)}`}
        >
          {currentStatus === 'Pending' ? 'Status: Pending Review' : `Stage: ${currentStatus}`}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. LEFT COLUMN: CORE INFORMATION */}
        <div className="lg:col-span-2 space-y-8">
            
            {/* Project Specifications */}
            <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Project Specifications</h3>
                </div>
                <div className="p-8 space-y-6">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Requested Service</p>
                        <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">{lead.service}</h2>
                    </div>
                    <div className="bg-slate-50 p-6 border-l-2 border-indigo-600 rounded-none">
                        <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                            "{lead.description || "No specific requirement details logged by the referring agent."}"
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Assignment</span>
                            <p className="text-sm font-bold text-slate-700 uppercase">{lead.businessUnit}</p>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submission Date</span>
                            <p className="text-sm font-bold text-slate-700">{lead.date}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Identity */}
            <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                    <User size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Client Identity Registry</h3>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Contact Name</label>
                        <p className="text-lg font-bold text-slate-900 uppercase tracking-tight">{lead.clientName}</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Phone</label>
                        <div className="flex items-center gap-3">
                            <p className="text-lg font-bold text-slate-900">{lead.clientPhone}</p>
                            <a href={`tel:${lead.clientPhone}`} className="p-2 bg-slate-900 text-white hover:bg-indigo-600 transition-colors rounded-none">
                                <Phone size={14} />
                            </a>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-2 pt-4 border-t border-slate-50">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deployment Location</label>
                        <div className="flex items-start gap-3 mt-1">
                            <MapPin size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-slate-600 font-semibold leading-relaxed">{lead.clientAddress}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. RIGHT COLUMN: LIFECYCLE & ACTIONS */}
        <div className="space-y-8">
            
            {/* Referral Node Information */}
            <div className="bg-white border border-slate-200 rounded-none shadow-sm overflow-hidden">
                 <div className="px-6 py-4 bg-slate-900 flex items-center gap-3">
                    <ShieldCheck size={18} className="text-indigo-400" />
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Referral Source</h3>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 font-bold text-lg rounded-none">
                            {agentData.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase">{agentData.name}</h4>
                            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase">
                                <span>{agentData.id}</span>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={10} fill="currentColor" /> {agentData.rating}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-400">Total Referrals</span>
                            <span className="text-slate-900">{agentData.totalLeads}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-400">Agent Email</span>
                            <span className="text-indigo-600 lowercase">{agentData.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lifecycle Control */}
            <div className="bg-white border border-slate-200 rounded-none p-6 space-y-8">
                {currentStatus !== 'Pending' && currentStatus !== 'Rejected' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                           <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Project Lifecycle</h3>
                           <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                             {currentStepIndex > -1 ? Math.round(((currentStepIndex + 1) / workflowSteps.length) * 100) : 0}% Done
                           </span>
                        </div>
                        
                        <div className="flex justify-between relative px-1">
                            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-100 -translate-y-1/2" />
                            {workflowSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                return (
                                    <div key={step} className="relative z-10">
                                        <div className={`w-8 h-8 rounded-none flex items-center justify-center border-2 transition-all duration-500 ${isCompleted ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-200 text-slate-200'}`}>
                                            {isCompleted ? <Check size={14} /> : <span className="text-[10px] font-bold">{index + 1}</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Lifecycle Update Buttons */}
                        <div className="space-y-2 pt-4 border-t border-slate-50">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Execute Stage Transition</p>
                             {['Started', 'In Progress', 'Completed'].map((stage) => {
                                const isActive = currentStatus === stage;
                                const isPassed = workflowSteps.indexOf(stage) < currentStepIndex;
                                return (
                                    <button
                                        type="button" key={stage}
                                        onClick={() => confirmAction('statusChange', stage)}
                                        disabled={isActive || isPassed}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest border transition-all rounded-none ${
                                            isActive 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                            : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                                        } ${isPassed ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                                    >
                                        {stage}
                                        {isActive && <div className="h-2 w-2 bg-white animate-pulse" />}
                                    </button>
                                );
                             })}
                        </div>
                    </div>
                )}

                {/* Initial Authorization Control */}
                {currentStatus === 'Pending' && (
                    <div className="space-y-6">
                        <div className="space-y-2 text-center">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Authorization Required</h3>
                            <p className="text-[10px] font-medium text-slate-400 leading-relaxed uppercase">Verify the lead data to authorize unit deployment.</p>
                        </div>
                        <div className="space-y-3">
                            <button 
                                type="button"
                                onClick={() => confirmAction('verify')} 
                                className="w-full py-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-none shadow-xl flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 size={18} /> Authorize Lead
                            </button>
                            <button 
                                type="button"
                                onClick={() => confirmAction('reject')} 
                                className="w-full py-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold uppercase tracking-[0.2em] transition-all rounded-none flex items-center justify-center gap-3"
                            >
                                <XCircle size={18} /> Terminate Entry
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 4. CONFIRMATION PROTOCOL MODAL */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setModal({ ...modal, show: false })} />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 20 }} 
                className="bg-white w-full max-w-sm rounded-none shadow-2xl relative overflow-hidden z-[101] border border-slate-200"
            >
                <div className="p-10 text-center space-y-4">
                    <div className={`mx-auto w-16 h-16 flex items-center justify-center rounded-none border-2 ${modal.type === 'reject' ? 'border-red-100 text-red-500' : 'border-slate-100 text-slate-900'}`}>
                        {isProcessing ? <Loader2 size={32} className="animate-spin" /> : <AlertTriangle size={32} />}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{modal.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">{modal.message}</p>
                </div>
                <div className="flex border-t border-slate-100">
                    <button 
                        type="button"
                        onClick={() => setModal({ ...modal, show: false })} 
                        disabled={isProcessing} 
                        className="flex-1 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                        Abort
                    </button>
                    <button 
                        type="button"
                        onClick={executeModalAction} 
                        disabled={isProcessing} 
                        className={`flex-1 py-5 text-xs font-bold text-white uppercase tracking-widest transition-all ${modal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-indigo-600'}`}
                    >
                        {isProcessing ? "Processing..." : "Confirm"}
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