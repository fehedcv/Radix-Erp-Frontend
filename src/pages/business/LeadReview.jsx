import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Phone, MapPin, 
  CheckCircle2, XCircle, User, 
  AlertTriangle, Loader2, Calendar, 
  FileText, ShieldCheck, Star, Mail, Check,
  Briefcase
} from 'lucide-react';

const LeadReview = ({ lead, onBack, onVerify, onReject, onUpdateStatus }) => {
  // STATE MANAGEMENT
  const [modal, setModal] = useState({ show: false, type: '', title: '', message: '', confirmText: '', targetStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(lead.status);

  // Sync with prop changes
  useEffect(() => {
    setCurrentStatus(lead.status);
  }, [lead.status]);

  // DATA CONFIG
  const agentData = {
    id: "AG-884",
    name: "Arjun Nair",
    phone: "+91 98765 43210",
    email: "arjun.nair@vynx.com",
    rating: 4.8,
    totalLeads: 42
  };

  const workflowSteps = ['Verified', 'Started', 'In Progress', 'Completed'];

  // Normalize Status
  const normalizedStatus = (currentStatus === 'Verfied' || currentStatus === 'Verified') ? 'Verified' : currentStatus;
  const currentStepIndex = workflowSteps.indexOf(normalizedStatus);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Verified': case 'Verfied': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Started': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'In Progress': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  // 1. OPEN MODAL ACTION (Simplified Logic)
  const confirmAction = (type, targetStatus = '') => {
    let config = {};

    if (type === 'verify') {
        config = {
            title: 'Approve Lead',
            message: 'Verify lead and notify agent?',
            confirmText: 'Verify Lead',
            targetStatus: 'Verified'
        };
    } else if (type === 'reject') {
        config = {
            title: 'Reject Lead',
            message: 'Mark as invalid? This cannot be undone.',
            confirmText: 'Reject Lead',
            targetStatus: 'Rejected'
        };
    } else if (type === 'statusChange') {
        config = {
            title: `Update to ${targetStatus}?`,
            message: `Move project stage to "${targetStatus}"?`,
            confirmText: `Yes, Move to ${targetStatus}`,
            targetStatus: targetStatus
        };
    }

    setModal({ 
        ...config, 
        show: true, 
        type 
    });
  };

  // 2. EXECUTE ACTION (Fixed Button Click)
  const executeModalAction = async (e) => {
    if(e) e.preventDefault(); // Prevent form submission issues
    
    setIsProcessing(true);
    const newStatus = modal.targetStatus;

    try {
      if (newStatus === 'Verified') {
        if(onVerify) await onVerify(lead.id);
      } else if (newStatus === 'Rejected') {
        if(onReject) await onReject(lead.id);
      } else {
        // Handle Updates
        if(onUpdateStatus) await onUpdateStatus(lead.id, newStatus);
      }

      // INSTANT UI UPDATE
      setCurrentStatus(newStatus);
      
      // Close Modal
      setModal(prev => ({ ...prev, show: false }));

    } catch (err) {
      console.error("Action failed:", err);
      // Optional: Show error toast here
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <button 
          type="button"
          onClick={onBack} 
          className="group flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <div className="p-1.5 rounded-md bg-white border border-gray-200 group-hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Leads
        </button>
        
        <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">Ref: {lead.id}</span>
            <motion.span 
              key={currentStatus}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getStatusColor(currentStatus)}`}
            >
              {currentStatus === 'Pending' ? 'Verification Pending' : (currentStatus === 'Verfied' ? 'Verified' : currentStatus)}
            </motion.span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <FileText size={18} className="text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Project Details</h3>
                </div>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{lead.service}</h2>
                    <p className="text-slate-600 leading-relaxed text-sm mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        "{lead.description || "No specific description provided by the agent."}"
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-100 text-slate-600">
                             <Briefcase size={14} className="text-slate-400" />
                             <span className="font-semibold">Unit:</span> {lead.businessUnit}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-100 text-slate-600">
                             <Calendar size={14} className="text-slate-400" />
                             <span className="font-semibold">Date:</span> {lead.date}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <User size={18} className="text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Client Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase">Name</label>
                        <p className="text-base font-semibold text-slate-900">{lead.clientName}</p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-slate-400 uppercase">Phone</label>
                        <div className="flex items-center gap-2">
                            <p className="text-base font-semibold text-slate-900">{lead.clientPhone}</p>
                            <a href={`tel:${lead.clientPhone}`} className="p-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100">
                                <Phone size={14} />
                            </a>
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-xs font-medium text-slate-400 uppercase">Address</label>
                        <div className="flex items-start gap-2 mt-1">
                            <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                            <p className="text-sm text-slate-700">{lead.clientAddress}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                 <div className="p-5 border-b border-gray-100 bg-indigo-50/30 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Referral Agent</h3>
                </div>
                <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-10 w-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {agentData.name.charAt(0)}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900">{agentData.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>{agentData.id}</span>
                                <span className="flex items-center gap-1 text-amber-500 font-medium ml-1">
                                    <Star size={10} fill="currentColor" /> {agentData.rating}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <a href={`tel:${agentData.phone}`} className="flex items-center gap-3 text-xs text-slate-600 hover:text-indigo-600 transition-colors">
                            <Phone size={14} className="text-slate-300" /> {agentData.phone}
                        </a>
                        <a href={`mailto:${agentData.email}`} className="flex items-center gap-3 text-xs text-slate-600 hover:text-indigo-600 transition-colors">
                            <Mail size={14} className="text-slate-300" /> {agentData.email}
                        </a>
                    </div>
                </div>
            </div>

            {/* PROGRESS & ACTIONS */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 sticky top-6">
                {currentStatus !== 'Pending' && currentStatus !== 'Rejected' && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="text-sm font-bold text-slate-900">Project Progress</h3>
                           <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                             {currentStepIndex > -1 ? Math.round(((currentStepIndex + 1) / workflowSteps.length) * 100) : 0}%
                           </span>
                        </div>
                        
                        <div className="flex items-center w-full px-1">
                            {workflowSteps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex;
                                const isCurrent = index === currentStepIndex;
                                const isLast = index === workflowSteps.length - 1;

                                return (
                                    <React.Fragment key={step}>
                                        <div className="relative flex flex-col items-center">
                                            <div 
                                                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] border-2 transition-all duration-300 z-10 ${
                                                isCompleted 
                                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-md' 
                                                    : 'bg-white border-gray-200 text-gray-300'
                                                }`}
                                            >
                                                {isCompleted ? <Check size={14} strokeWidth={3} /> : (index + 1)}
                                            </div>
                                            
                                            <div className="absolute top-9 w-24 text-center">
                                                <span className={`text-[9px] font-bold uppercase transition-colors block leading-tight ${
                                                    isCurrent ? 'text-emerald-600' : isCompleted ? 'text-slate-500' : 'text-slate-300'
                                                }`}>
                                                    {step}
                                                </span>
                                            </div>
                                        </div>

                                        {!isLast && (
                                            <div className="flex-1 h-1 mx-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full bg-emerald-500 transition-all duration-500 ease-out ${
                                                        index < currentStepIndex ? 'w-full' : 'w-0'
                                                    }`} 
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                        <div className="h-6"></div>
                    </div>
                )}

                {/* UPDATE STAGE BUTTONS */}
                {currentStatus !== 'Pending' && currentStatus !== 'Rejected' ? (
                     <div className="mt-6 pt-6 border-t border-gray-50">
                         <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Update Stage</h3>
                         <div className="space-y-2">
                            {['Started', 'In Progress', 'Completed'].map((stage) => {
                                const isActive = currentStatus === stage;
                                const isPassed = workflowSteps.indexOf(stage) < currentStepIndex;

                                return (
                                    <button
                                        type="button"
                                        key={stage}
                                        onClick={() => confirmAction('statusChange', stage)}
                                        disabled={isActive}
                                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md border transition-all duration-200 ${
                                            isActive 
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg scale-[1.02]' 
                                            : 'bg-white border-gray-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                                        } ${isPassed ? 'opacity-50' : ''}`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                            {stage}
                                        </span>
                                        {isActive && <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded text-white font-bold tracking-wide">CURRENT</span>}
                                    </button>
                                );
                            })}
                         </div>
                    </div>
                ) : null}

                {/* VERIFICATION BUTTONS */}
                {currentStatus === 'Pending' && (
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 mb-4">Verification Required</h3>
                        <div className="space-y-3">
                            <button 
                                type="button"
                                onClick={() => confirmAction('verify')} 
                                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-md shadow-lg"
                            >
                                <CheckCircle2 size={16} /> Verify & Approve
                            </button>
                            <button 
                                type="button"
                                onClick={() => confirmAction('reject')} 
                                className="w-full py-3 px-4 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-md"
                            >
                                <XCircle size={16} /> Reject Lead
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL - UPDATED */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModal({ ...modal, show: false })} />
            
            {/* Modal Content - Z-Index 101 */}
            <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.95, opacity: 0 }} 
                className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative overflow-hidden z-[101]"
                onClick={(e) => e.stopPropagation()} 
            >
                <div className="p-6 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${modal.type === 'reject' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-900'}`}>
                        {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <AlertTriangle size={24} />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{modal.title}</h3>
                    <p className="text-sm text-slate-500 mt-2">{modal.message}</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex gap-3">
                    <button 
                        type="button"
                        onClick={() => setModal({ ...modal, show: false })} 
                        disabled={isProcessing} 
                        className="flex-1 py-2.5 text-sm font-bold text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="button"
                        onClick={executeModalAction} 
                        disabled={isProcessing} 
                        className={`flex-1 py-2.5 text-sm font-bold text-white rounded-lg shadow-sm transition-colors ${modal.type === 'reject' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                    >
                        {isProcessing ? "Processing..." : modal.confirmText}
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