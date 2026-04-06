import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin,
  CheckCircle2, XCircle, User,
  AlertTriangle, Loader2, Calendar,
  ShieldCheck, Info, Activity,
  MessageSquare, ClipboardCheck,
  Play, Check, Briefcase, Layers,
  IndianRupee, ArrowRight, Wallet, X
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';

const LeadReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, targetStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // New states for Settlement Flow
  const [settleModal, setSettleModal] = useState({ show: false, step: 1 });
  const [settleData, setSettleData] = useState({ totalAmount: '', credits: '' });
  const [isSettling, setIsSettling] = useState(false);

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

  // ---------------- SETTLEMENT UPDATE ----------------
  const handleSettleSubmit = async () => {
    setIsSettling(true);
    try {
      // Replace with your actual settlement endpoint
      await frappeApi.post(
        '/method/business_chain.api.leads.settle_agent_credit',
        { 
          lead_id: lead.id, 
          total_amount: settleData.totalAmount, 
          credits: settleData.credits,
          admin_commission: parseFloat(settleData.totalAmount || 0) * 0.10
        }
      );
      setSettleModal({ show: false, step: 1 });
      setSettleData({ totalAmount: '', credits: '' });
      // Optional: Refresh lead data or show a success message here
    } catch (err) {
      console.error(err);
    } finally {
      setIsSettling(false);
    }
  };

  // ---------------- HELPERS ----------------
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':     return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Verified':    return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'In Progress': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'Completed':   return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Rejected':    return 'text-rose-600 bg-rose-50 border-rose-100';
      default:            return 'text-slate-500 bg-slate-50 border-slate-100';
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
  const cleanClientPhone = lead.clientPhone?.replace(/\D/g, '') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1000px] mx-auto space-y-4 pb-8 font-sans px-4 sm:px-6"
    >

      {/* 1. TOP NAVIGATION & HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/business/leads')}
            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#007ACC] transition-colors mb-2"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {lead.clientName}
            </h2>
            {lead.status === 'Rejected' && <XCircle size={20} className="text-rose-500" />}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#007ACC]" /> Lead #{lead.id}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Calendar size={12} /> {formatDate(lead.date)}
            </span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${getStatusColor(lead.status)}`}>
          <Activity size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">{lead.status}</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* LEFT COLUMN: Customer & Project Info */}
        <div className="md:col-span-2 space-y-4">

          {/* Contact Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#007ACC]" />

            <div className="flex justify-between items-start mb-4">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <User size={12} /> Contact Information
              </p>
            </div>

            <div className="grid gap-4">

              {/* Client Phone + Actions */}
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-1">
                  <Phone size={14} />
                </div>
                <div className="w-full">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
                    Mobile: {lead.clientPhone}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={`tel:${lead.clientPhone}`}
                      className="flex-1 min-w-[100px] py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Phone size={12} /> Call
                    </a>
                    <a
                      href={`https://wa.me/${cleanClientPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 min-w-[100px] py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <MessageSquare size={12} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Client Location (Hardcoded to Tirur) */}
              <div className="flex items-start gap-3 pt-3 border-t border-slate-50">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Service Location</p>
                  <p className="text-sm font-bold text-slate-700 leading-tight">Tirur</p>
                </div>
              </div>

              {/* Agent Info */}
              <div className="flex items-start gap-3 pt-3 border-t border-slate-50">
                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 mt-0.5">
                  <Mail size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Handling Agent</p>
                  <p className="text-sm font-bold text-slate-700 break-all">{lead.agentId || 'Unassigned'}</p>
                  {lead.agentPhone && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <a
                        href={`tel:${lead.agentPhone}`}
                        className="flex-1 min-w-[100px] py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <Phone size={12} /> Call Agent
                      </a>
                      <a
                        href={`https://wa.me/${lead.agentPhone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 min-w-[100px] py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-700 flex items-center justify-center gap-2 transition-all active:scale-95"
                      >
                        <MessageSquare size={12} /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Project Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck size={14} className="text-[#007ACC]" />
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-800">Requirement Details</h3>
            </div>

            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                "{lead.description || 'No description provided.'}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-2.5 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Briefcase size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Business Unit</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-700 truncate">{lead.businessUnit}</p>
              </div>
              <div className="p-2.5 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Layers size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Service</span>
                </div>
                <p className="text-xs font-mono font-bold text-slate-700 truncate">{lead.service}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Workflow & Actions */}
        <div className="space-y-4">

          {/* Progress Stepper */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <Activity size={12} /> Request Lifecycle
            </p>

            <div className="space-y-3 relative">
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-100 z-0" />

              {workflow.map((step, idx) => {
                const isCompleted = idx < currentStepIndex || lead.status === 'Completed';
                const isCurrent   = step === lead.status;
                const isClickable = idx > currentStepIndex && lead.status !== 'Completed';
                const isLoading   = isProcessing && modal.targetStatus === step;

                return (
                  <div
                    key={step}
                    role={isClickable ? 'button' : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={() => {
                      if (!isClickable || isProcessing) return;
                      setModal({ show: false, targetStatus: step });
                      updateStatus(step);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && isClickable && !isProcessing) {
                        setModal({ show: false, targetStatus: step });
                        updateStatus(step);
                      }
                    }}
                    className={`relative z-10 flex items-center gap-3 rounded-lg px-1.5 py-1 -mx-1.5 transition-all
                      ${isClickable && !isProcessing
                        ? 'cursor-pointer hover:bg-slate-50 ring-1 ring-transparent hover:ring-slate-200 active:scale-95'
                        : 'cursor-default'
                      }`}
                  >
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                      ${isCompleted || isCurrent
                        ? 'bg-[#007ACC] border-[#007ACC] text-white shadow-sm shadow-blue-200'
                        : isClickable
                          ? 'bg-white border-slate-300 text-slate-400'
                          : 'bg-white border-slate-200 text-slate-300'}
                    `}>
                      {isLoading
                        ? <Loader2 size={8} className="animate-spin" />
                        : isCompleted
                          ? <Check size={10} strokeWidth={4} />
                          : <div className="w-1 h-1 rounded-full bg-current" />
                      }
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-widest flex-1 ${
                      isCurrent   ? 'text-[#007ACC]' :
                      isCompleted ? 'text-slate-800'  :
                      isClickable ? 'text-slate-500'  :
                                    'text-slate-300'
                    }`}>
                      {step}
                    </span>

                    {isClickable && !isProcessing && (
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                        Set →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION PANEL */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm sticky top-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
              <ShieldCheck size={12} /> Management Actions
            </p>

            {/* Always Visible Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[10px] text-amber-800 flex gap-2 items-start leading-relaxed shadow-sm mb-4">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Important Information</strong>
                Credits can only be approved if the assigned work is 100% completed. Please provide truthful and accurate details.
              </div>
            </div>

            <div className="grid gap-2">
              {lead.status === 'Pending' && (
                <>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Verified' })}
                    className="w-full py-2.5 bg-[#007ACC] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#006bb3] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Approve Lead
                  </button>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Rejected' })}
                    className="w-full py-2.5 bg-white border border-rose-100 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} /> Reject Request
                  </button>
                </>
              )}

              {lead.status === 'Verified' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'In Progress' })}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={14} /> Start Work
                </button>
              )}

              {lead.status === 'In Progress' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'Completed' })}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Mark Complete
                </button>
              )}

              {lead.status === 'Completed' && (
                <button
                  onClick={() => setSettleModal({ show: true, step: 1 })}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 hover:bg-purple-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Wallet size={16} /> Settle Agent Credit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. STATUS CONFIRMATION MODAL */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 md:p-8 rounded-2xl w-full max-w-sm border border-slate-100 shadow-2xl relative"
            >
              <button 
                onClick={() => setModal({ show: false })}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#007ACC]">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-lg font-black uppercase text-center text-slate-900 tracking-tight mb-2">
                Confirm Update
              </h3>
              <p className="text-xs text-center text-slate-500 font-medium mb-8 leading-relaxed">
                Are you sure you want to change the status of this lead to{' '}
                <span className="font-bold text-slate-800">"{modal.targetStatus}"</span>? This action is tracked.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setModal({ show: false })}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateStatus(modal.targetStatus)}
                  disabled={isProcessing}
                  className="flex-1 py-2.5 bg-[#007ACC] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#006bb3] shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. SETTLEMENT MODAL */}
      <AnimatePresence>
        {settleModal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-2xl w-full max-w-md border border-slate-100 shadow-2xl relative"
            >
              <button 
                onClick={() => setSettleModal({ show: false, step: 1 })}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>

              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                <Wallet size={24} />
              </div>

              <h3 className="text-lg font-black uppercase text-center text-slate-900 tracking-tight mb-6">
                Settle Lead Credits
              </h3>

              {settleModal.step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                      <IndianRupee size={12} /> Total Amount Earned
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={settleData.totalAmount}
                      onChange={(e) => setSettleData({ ...settleData, totalAmount: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 flex items-center gap-1.5">
                      <Wallet size={12} /> Credits Approved
                    </label>
                    <p className="text-[9px] text-slate-400 mb-2">1 Credit = 1 INR</p>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={settleData.credits}
                      onChange={(e) => setSettleData({ ...settleData, credits: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setSettleModal({ show: false, step: 1 })}
                      className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!settleData.totalAmount || !settleData.credits}
                      onClick={() => setSettleModal({ ...settleModal, step: 2 })}
                      className="flex-1 py-2.5 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Agent Credits</span>
                      <span className="text-sm font-black text-slate-800">{settleData.credits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin Commission (10%)</span>
                      <span className="text-sm font-black text-emerald-600 flex items-center gap-1">
                        <IndianRupee size={12} />
                        {(parseFloat(settleData.totalAmount || 0) * 0.10).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Informational Section */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3.5 text-xs text-slate-600 space-y-2.5 leading-relaxed">
                    <div className="flex gap-2.5">
                      <ShieldCheck size={14} className="text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-800 block mb-0.5">Admin Verification</strong>
                        These credits will be passed to the admin for review. The admin decides and finalizes the exact approved credit amount, which may be modified.
                      </p>
                    </div>
                    <div className="flex gap-2.5 pt-2.5 border-t border-blue-100/50">
                      <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-slate-800 block mb-0.5">Commission Details</strong>
                        The 10% commission is deducted to cover system running, platform maintenance, and other ongoing operational costs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSettleModal({ ...settleModal, step: 1 })}
                      className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSettleSubmit}
                      disabled={isSettling}
                      className="flex-[2] py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      {isSettling ? <Loader2 size={14} className="animate-spin" /> : 'Submit to Admin'}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default LeadReview;