import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail,
  CheckCircle2, XCircle, User,
  AlertTriangle, Loader2, Calendar,
  ShieldCheck, Info, Activity,
  MessageSquare, ClipboardCheck,
  Play, Check, Briefcase, Layers
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';

const LeadReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, targetStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // ---------------- FETCH LEAD ----------------
  useEffect(() => {
    const fetchLead = async () => {
      try {
        const res = await frappeApi.get(
          '/method/business_chain.api.leads.get_business_lead_detail',
          { params: { lead_id: id } }
        );
        setLead(res.data.message);
      } catch (err) {
        console.error(err);
        setLead(null);
      } finally {
        setLoading(false);
      }
    };
    fetchLead();
  }, [id]);

  // ---------------- STATUS UPDATE ----------------
  const updateStatus = async (status) => {
    setIsProcessing(true);
    try {
      await frappeApi.post(
        '/method/business_chain.api.leads.update_lead_status',
        { lead_id: lead.id, status }
      );
      setLead(prev => ({ ...prev, status }));
      setModal({ show: false, targetStatus: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- HELPERS ----------------
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Verified': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'In Progress': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Completed': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Rejected': return 'text-rose-600 bg-rose-50 border-rose-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // ---------------- LOADING / ERROR STATES ----------------
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-[#007ACC]" size={32} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Lead Details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
           <Info size={32} />
        </div>
        <div className="text-center">
            <p className="text-lg font-black uppercase text-slate-700 tracking-tight">Lead Unavailable</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                The requested ID could not be found.
            </p>
        </div>
        <button
          onClick={() => navigate('/business/leads')}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
        >
          Return to Registry
        </button>
      </div>
    );
  }

  // Progress Logic
  const workflow = ['Pending', 'Verified', 'In Progress', 'Completed'];
  const currentStepIndex = workflow.indexOf(lead.status);
  const cleanPhone = lead.clientPhone?.replace(/\D/g, '') || '';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1000px] mx-auto space-y-6 pb-16 font-sans px-4 sm:px-6"
    >

      {/* 1. TOP NAVIGATION & HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate('/business/leads')} 
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#007ACC] transition-colors mb-3"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>
          
          <div className="flex items-center gap-3">
             <h2 className="text-3xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                {lead.clientName}
             </h2>
             {lead.status === 'Rejected' && <XCircle size={24} className="text-rose-500" />}
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-3">
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-[#007ACC]" /> Lead #{lead.id}
             </span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Calendar size={12} /> {formatDate(lead.date)}
             </span>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 ${getStatusColor(lead.status)}`}>
            <Activity size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">{lead.status}</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Customer & Project Info */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Contact Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#007ACC]" />
                
                <div className="flex justify-between items-start mb-6">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <User size={12} /> Contact Information
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Phone Actions */}
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                            <Phone size={16} />
                        </div>
                        <div className="w-full">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                                Mobile: {lead.clientPhone}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <a 
                                    href={`tel:${lead.clientPhone}`} 
                                    className="flex-1 min-w-[120px] py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Phone size={14} /> Call Now
                                </a>
                                <a 
                                    href={`https://wa.me/${cleanPhone}`} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex-1 min-w-[120px] py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <MessageSquare size={14} /> WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Agent Email */}
                    <div className="flex items-start gap-3 pt-4 border-t border-slate-50">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                            <Mail size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Handling Agent</p>
                            <p className="text-sm font-bold text-slate-700 leading-relaxed break-all">
                                {lead.agentId || "Unassigned"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Details */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                 <div className="flex items-center gap-2 mb-4">
                    <ClipboardCheck size={16} className="text-[#007ACC]" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Requirement Details</h3>
                 </div>
                 
                 <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 mb-6">
                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                        "{lead.description || "No description provided."}"
                    </p>
                 </div>

                 {/* Reference IDs Grid */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Briefcase size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Business Unit</span>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-700 truncate">{lead.businessUnit}</p>
                    </div>
                    <div className="p-3 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Layers size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest">Service ID</span>
                        </div>
                        <p className="text-xs font-mono font-bold text-slate-700 truncate">{lead.service}</p>
                    </div>
                 </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Workflow & Actions */}
        <div className="space-y-6">
            
            {/* Progress Stepper */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Activity size={12} /> Request Lifecycle
                </p>
                
                <div className="space-y-4 relative">
                    <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100 z-0" />
                    
                    {workflow.map((step, idx) => {
                        const isCompleted = idx < currentStepIndex || lead.status === 'Completed';
                        const isCurrent = step === lead.status;
                        
                        return (
                            <div key={step} className="relative z-10 flex items-center gap-3">
                                <div className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                    ${isCompleted || isCurrent 
                                        ? 'bg-[#007ACC] border-[#007ACC] text-white shadow-md shadow-blue-200' 
                                        : 'bg-white border-slate-200 text-slate-300'}
                                `}>
                                    {isCompleted ? <Check size={12} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-[#007ACC]' : isCompleted ? 'text-slate-800' : 'text-slate-300'}`}>
                                    {step}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ACTION PANEL */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm sticky top-6">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <ShieldCheck size={12} /> Management Actions
                </p>

                <div className="grid gap-2">
                    {lead.status === 'Pending' && (
                        <>
                            <button
                                onClick={() => setModal({ show: true, targetStatus: 'Verified' })}
                                className="w-full py-3 bg-[#007ACC] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#006bb3] active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={16} /> Approve Lead
                            </button>
                            <button
                                onClick={() => setModal({ show: true, targetStatus: 'Rejected' })}
                                className="w-full py-3 bg-white border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                <XCircle size={16} /> Reject Request
                            </button>
                        </>
                    )}

                    {lead.status === 'Verified' && (
                        <button
                            onClick={() => setModal({ show: true, targetStatus: 'In Progress' })}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Play size={16} /> Start Work
                        </button>
                    )}

                    {lead.status === 'In Progress' && (
                         <button
                            onClick={() => setModal({ show: true, targetStatus: 'Completed' })}
                            className="w-full py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            <Check size={16} /> Mark Complete
                        </button>
                    )}

                    {lead.status === 'Completed' && (
                        <div className="w-full py-3 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <CheckCircle2 size={16} /> No Actions Available
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* 3. CONFIRMATION MODAL */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm border border-slate-100 shadow-2xl"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#007ACC]">
                 <AlertTriangle size={24} />
              </div>
              
              <h3 className="text-lg font-black uppercase text-center text-slate-900 tracking-tight mb-2">
                Confirm Update
              </h3>
              <p className="text-xs text-center text-slate-500 font-medium mb-8 leading-relaxed">
                Are you sure you want to change the status of this lead to <span className="font-bold text-slate-800">"{modal.targetStatus}"</span>? This action is tracked.
              </p>
              
              <div className="flex gap-3">
                <button 
                    onClick={() => setModal({ show: false })} 
                    className="flex-1 py-3 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(modal.targetStatus)}
                  disabled={isProcessing}
                  className="flex-1 py-3 bg-[#007ACC] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006bb3] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
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