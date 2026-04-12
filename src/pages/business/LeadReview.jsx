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
  IndianRupee, ArrowRight, Wallet, X,
  CreditCard,
  Columns,
  ArrowRightCircle
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';
import { useTheme } from '../../context/ThemeContext'; // Using Theme Context

const LeadReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- THEME INTEGRATION ---
  const { theme } = useTheme(); 
  const isLight = theme === 'light';

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
        console.log(res.data.message);
        
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
          ledger_id: lead.ledger_id || lead.id, 
          commission: settleData.credits,
          total_sale_amount: settleData.totalAmount
        } 
      );
      setLead(prev=>({
        ...prev,
        paymentStatus: "Settled",
        commission: settleData.credits,
        totalSaleAmount: settleData.totalAmount
      }))
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
    if (!isLight) {
        switch (status) {
          case 'Pending':     return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
          case 'Verified':    return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
          case 'In Progress': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
          case 'Completed':   return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
          case 'Rejected':    return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
          default:            return 'text-slate-400 bg-white/5 border-white/10';
        }
    }
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
        <Loader2 className={`animate-spin ${isLight ? 'text-[#61D9DE]' : 'text-[#007ACC]'}`} size={32} />
        <p className={`text-[10px] font-black uppercase tracking-widest ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>Loading Lead Details...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center ${isLight ? 'bg-[#F8FAFB] text-[#9A9FA5]' : 'bg-slate-50 text-slate-300'}`}>
          <Info size={32} />
        </div>
        <div className="text-center">
          <p className={`text-lg font-black uppercase tracking-tight ${isLight ? 'text-[#1A1D1F]' : 'text-slate-700'}`}>Lead Unavailable</p>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>
            The requested ID could not be found.
          </p>
        </div>
        <button
          onClick={() => navigate('/business/leads')}
          className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLight ? 'bg-[#1A1D1F] text-white' : 'bg-slate-900 text-white hover:bg-black'}`}
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
      className={`max-w-[1000px] mx-auto space-y-4 pb-8 font-sans px-4 sm:px-6 transition-colors duration-300 ${isLight ? 'text-[#1A1D1F]' : 'text-[#E2E8F0]'}`}
    >

      {/* 1. TOP NAVIGATION & HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/business/leads')}
            className={`group   border-cyan-400 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors mb-2 ${isLight ? 'text-[#9A9FA5] hover:text-[#61D9DE]' : 'text-slate-400 hover:text-[#007ACC] '}`}
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to Registry
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter leading-none">
              {lead.clientName}
            </h2>
            {lead.status === 'Rejected' && <XCircle size={20} className="text-rose-500" />}
          </div>

          <div className={`flex flex-wrap items-center gap-3 mt-2 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={12} /> {formatDate(lead.date)}
            </span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${getStatusColor(lead.status)}`}>
          <Activity size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">{lead.status}</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* LEFT COLUMN: Customer & Project Info */}
        <div className="md:col-span-2 space-y-4">

      {/* Contact Card */}
<div className={`border rounded-xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 ${
  isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-white/5 border-white/10'
}`}>
  {/* Theme-Synced Accent Line */}
  <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${
    isLight ? 'bg-[#61D9DE]' : 'bg-[#007ACC]'
  }`} />

  <div className="flex justify-between items-start mb-6">
    <p className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors ${
      isLight ? 'text-[#9A9FA5]' : 'text-slate-400'
    }`}>
      <User size={12} className={isLight ? 'text-[#61D9DE]' : ''} /> Contact Client
    </p>
  </div>

  <div className="grid gap-6">
    {/* Client Phone + Actions */}
    <div className="flex items-start gap-4">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
        isLight ? 'bg-white border border-[#E8ECEF] text-[#61D9DE] shadow-sm' : 'bg-slate-50/10 text-slate-400'
      }`}>
        <Phone size={16} />
      </div>
      <div className="w-full">
        <p className={`text-[9px] font-bold uppercase tracking-widest mb-2 transition-colors ${
          isLight ? 'text-[#9A9FA5]' : 'text-slate-400'
        }`}>
          Mobile: {lead.clientPhone}
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${lead.clientPhone}`}
            className={`flex-1 min-w-[100px] py-2.5 px-3  rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isLight 
                 ? 'bg-blue-500 border-[#E8ECEF] text-white hover:bg-blue-800' 
                  : 'bg-blue-500 border-[#E8ECEF] text-white hover:bg-blue-800'
            }`}
          >
            <Phone size={12} /> Call
          </a>
          <a
            href={`https://wa.me/${cleanClientPhone}`}
            target="_blank"
            rel="noreferrer"
            className={`flex-1 min-w-[100px] py-2.5 px-3  rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
              isLight 
                ? 'bg-emerald-700 text-emerald-100 hover:bg-emerald-900' 
                  : 'bg-emerald-700  text-emerald-100 hover:bg-emerald-900'
            }`}
          >
            <MessageSquare size={12} /> WhatsApp
          </a>
        </div>
      </div>
    </div>

    {/* Client Location */}
    <div className={`flex items-start gap-4 pt-5 border-t transition-colors ${
      isLight ? 'border-[#E8ECEF]' : 'border-slate-50/10'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
        isLight ? 'bg-white border border-[#E8ECEF] text-[#61D9DE] shadow-sm' : 'bg-slate-50/10 text-slate-400'
      }`}>
        <MapPin size={16} />
      </div>
      <div>
        <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 transition-colors ${
          isLight ? 'text-[#9A9FA5]' : 'text-slate-400'
        }`}>
          Service Location
        </p>
        <p className="text-sm font-bold leading-tight">{lead.location || 'Not specified'}</p>
      </div>
    </div>

    {/* Agent Info */}
    <div className={`flex items-start gap-4 pt-5 border-t transition-colors ${
      isLight ? 'border-[#E8ECEF]' : 'border-slate-50/10'
    }`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
        isLight ? 'bg-white border border-[#E8ECEF] text-[#61D9DE] shadow-sm' : 'bg-slate-50/10 text-slate-400'
      }`}>
        <Mail size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 transition-colors ${
          isLight ? 'text-[#9A9FA5]' : 'text-slate-400'
        }`}>
          Handling Agent
        </p>
        <p className="text-sm font-bold break-all">{lead.agentId || 'Unassigned'}</p>
        
        {lead.agentPhone && (
          <div className="flex flex-wrap gap-2 mt-3">
            <a
              href={`tel:${lead.agentPhone}`}
              className={`flex-1 min-w-[100px] py-2.5 px-3  rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isLight 
                  ? 'bg-blue-500 border-[#E8ECEF] text-white hover:bg-blue-800' 
                  : 'bg-blue-500 border-[#E8ECEF] text-white hover:bg-blue-800'
              }`}
            >
              <Phone size={12} /> Call Agent
            </a>
            <a
              href={`https://wa.me/${lead.agentPhone?.replace(/\D/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className={`flex-1 min-w-[100px] py-2.5 px-3  rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 ${
                isLight 
                  ? 'bg-emerald-700 text-emerald-100 hover:bg-emerald-900' 
                  : 'bg-emerald-700  text-emerald-100 hover:bg-emerald-900'
              }`}
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
          <div className={`border rounded-xl p-4 shadow-sm transition-all ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck size={14} className={isLight ? 'text-[#61D9DE]' : 'text-[#007ACC]'} />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Requirement Details</h3>
            </div>

            <div className={`rounded-lg p-3 border mb-4 ${isLight ? 'bg-white border-[#E8ECEF]' : 'bg-slate-50/5 border-slate-700'}`}>
              <p className={`text-sm font-medium leading-relaxed italic ${isLight ? 'text-slate-600' : 'text-slate-700'}`}>
                "{lead.description || 'No description provided.'}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-2.5 border rounded-lg ${isLight ? 'bg-white border-[#E8ECEF]' : 'border-white/5'}`}>
                <div className={`flex items-center gap-1.5 mb-1 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>
                  <Briefcase size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Business Unit</span>
                </div>
                <p className="text-xs font-mono font-bold truncate">{lead.businessUnit}</p>
              </div>
              <div className={`p-2.5 border rounded-lg ${isLight ? 'bg-white border-[#E8ECEF]' : 'border-white/5'}`}>
                <div className={`flex items-center gap-1.5 mb-1 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>
                  <Layers size={10} />
                  <span className="text-[8px] font-bold uppercase tracking-widest">Service</span>
                </div>
                <p className="text-xs font-mono font-bold truncate">{lead.service}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Workflow & Actions */}
        <div className="space-y-4">

          {/* Progress Stepper */}
          <div className={`border rounded-xl p-4 shadow-sm transition-all ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-white/5 border-white/10'}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>
              <Activity size={12} /> Request Lifecycle
            </p>

            <div className="space-y-3 relative">
              <div className={`absolute left-[9px] top-2 bottom-2 w-0.5 z-0 ${isLight ? 'bg-[#E8ECEF]' : 'bg-white/5'}`} />

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
                        ? 'cursor-pointer hover:bg-white/50 ring-1 ring-transparent hover:ring-[#61D9DE]/20 active:scale-95'
                        : 'cursor-default'
                      }`}
                  >
                    <div className={`
                      w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                      ${isCompleted || isCurrent
                        ? (isLight ? 'bg-[#61D9DE] border-[#61D9DE] text-white shadow-sm' : 'bg-[#007ACC] border-[#007ACC] text-white shadow-sm shadow-blue-200')
                        : (isLight ? 'bg-white border-[#E8ECEF] text-[#9A9FA5]' : 'bg-white border-slate-200 text-slate-300')}
                    `}>
                      {isLoading
                        ? <Loader2 size={8} className="animate-spin" />
                        : isCompleted
                          ? <Check size={10} strokeWidth={4} />
                          : <div className="w-1 h-1 rounded-full bg-current" />
                      }
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-widest flex-1 ${
                      isCurrent   ? (isLight ? 'text-[#61D9DE]' : 'text-[#007ACC]') :
                      isCompleted ? (isLight ? 'text-[#1A1D1F]' : 'text-slate-800') :
                      isClickable ? (isLight ? 'text-[#9A9FA5]' : 'text-slate-500') :
                                    (isLight ? 'text-[#9A9FA5]/50' : 'text-slate-300')
                    }`}>
                      {step}
                    </span>

                    {isClickable && !isProcessing && (
                      <span className={`text-[8px] font-bold uppercase tracking-widest ${isLight ? 'text-[#61D9DE]' : 'text-slate-300'}`}>
                        Set →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION PANEL */}
          <div className={`border rounded-xl p-4 shadow-sm sticky top-4 transition-all ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-white/5 border-white/10'}`}>
            <p className={`text-[9px] font-black uppercase tracking-widest mb-3 flex items-center gap-2 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-400'}`}>
              <ShieldCheck size={12} /> Management Actions
            </p>

            <div className={`border rounded-lg p-3 text-[10px] flex gap-2 items-start leading-relaxed shadow-sm mb-4 ${isLight ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-amber-200 border-amber-300 text-red-600'}`}>
              <AlertTriangle size={14} className="text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold mb-0.5">Important Information</strong>
                Credits can only be approved if the assigned work is 100% completed.
              </div>
            </div>

            <div className="grid gap-2">
              {lead.status === 'Pending' && (
                <>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Verified' })}
                    className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 ${isLight ? 'bg-[#61D9DE] text-white hover:bg-[#49C5CB]' : 'bg-[#007ACC] text-white'}`}
                  >
                    <CheckCircle2 size={14} /> Approve Lead
                  </button>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Rejected' })}
                    className={`w-full py-2.5 bg-white border rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 ${isLight ? 'border-rose-100 text-rose-600 hover:bg-rose-50' : 'border-rose-100 text-rose-600'}`}
                  >
                    <XCircle size={14} /> Reject Request
                  </button>
                </>
              )}

              {lead.status === 'Verified' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'In Progress' })}
                  className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play size={14} /> Start Work
                </button>
              )}

              {lead.status === 'In Progress' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'Completed' })}
                  className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={14} /> Mark Complete
                </button>
              )}

              {lead.status === 'Completed' && lead.paymentStatus === 'Settled' ? (
                <div className={`border rounded-xl p-4 space-y-3 ${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-50 border-emerald-200'}`}>
                  <div className="flex items-center gap-2 mb-3 text-emerald-700 font-black text-[10px] uppercase tracking-widest">
                    <CheckCircle2 size={14} /> Settlement Details
                  </div>
                   <div className="space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-500">
                        <span>Agent Credit</span>
                        <span className="text-sm font-black text-slate-800 flex items-center gap-1"><CreditCard size={12} /> {lead.commission}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-500">
                        <span>Commission ({lead.commision}%)</span>
                        <span className="text-sm font-black text-slate-800">₹{(parseFloat(lead.totalSaleAmount || 0) * (parseFloat(lead.commision || 0) / 100)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-bold uppercase text-slate-500 pt-2 border-t border-emerald-100">
                        <span>Total Sale</span>
                        <span className="text-sm font-black text-slate-800">₹{lead.totalSaleAmount}</span>
                      </div>
                   </div>
                </div>
              ) : lead.status === 'Completed' ? (
                <button
                  onClick={() => setSettleModal({ show: true, step: 1 })}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Wallet size={16} /> Settle Agent Credit
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 md:p-8 rounded-2xl w-full max-w-sm shadow-2xl relative border ${isLight ? 'bg-white border-[#F0F2F5]' : 'border-cyan-800'}`}
            >
              <button onClick={() => setModal({ show: false })} className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${isLight ? 'text-[#9A9FA5] hover:bg-[#F0F2F5]' : 'text-slate-400 hover:bg-slate-50'}`}><X size={16} /></button>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-[#F0F2F5] text-[#61D9DE]' : 'bg-slate-50 text-[#007ACC]'}`}><AlertTriangle size={24} /></div>
              <h3 className="text-lg font-black uppercase text-center tracking-tight mb-2">Confirm Update</h3>
              <p className={`text-xs text-center font-medium mb-8 leading-relaxed ${isLight ? 'text-[#9A9FA5]' : 'text-slate-500'}`}>Change status to <strong>"{modal.targetStatus}"</strong>?</p>
              <div className="flex gap-3">
                <button onClick={() => setModal({ show: false })} className={`flex-1 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] text-[#9A9FA5]' : 'border-slate-200 text-slate-500'}`}>Cancel</button>
                <button onClick={() => updateStatus(modal.targetStatus)} disabled={isProcessing} className={`flex-1 py-2.5 text-white rounded-xl text-[10px] font-black uppercase shadow-sm transition-all flex items-center justify-center ${isLight ? 'bg-[#61D9DE] hover:bg-[#49C5CB]' : 'bg-[#007ACC] hover:bg-[#006bb3]'}`}>
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {settleModal.show && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-2xl w-full max-w-md shadow-2xl relative border ${isLight ? 'bg-white border-[#F0F2F5]' : ' border-cyan-800'}`}
            >
              <button onClick={() => setSettleModal({ show: false, step: 1 })} className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${isLight ? 'text-[#9A9FA5] hover:bg-[#F0F2F5]' : 'text-slate-400 hover:bg-slate-50'}`}><X size={16} /></button>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isLight ? 'bg-[#F0F2F5] text-purple-500' : 'bg-purple-50 text-cyan-600'}`}><Wallet size={24} /></div>
              <h3 className="text-lg font-black uppercase text-center tracking-tight mb-6">Settle Lead Credits</h3>

              {settleModal.step === 1 ? (
                <div className="space-y-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-500'}`}><IndianRupee size={12} /> Total Amount</label>
                    <input type="number" placeholder="e.g. 5000" value={settleData.totalAmount} onChange={(e) => setSettleData({ ...settleData, totalAmount: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] focus:border-[#61D9DE] focus:bg-white' : 'border-slate-200 focus:border-cyan-500'}`} />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5 ${isLight ? 'text-[#9A9FA5]' : 'text-slate-500'}`}><Wallet size={12} /> Agent Credits</label>
                    <input type="number" placeholder="e.g. 500" value={settleData.credits} onChange={(e) => setSettleData({ ...settleData, credits: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] focus:border-[#61D9DE] focus:bg-white' : 'border-slate-200 focus:border-cyan-500'}`} />
                  </div>
                 <div className="flex gap-3 pt-2 justify-center">
  
  <button
    onClick={() => setSettleModal({ show: false, step: 1 })}
    className={`flex-1 flex items-center justify-center py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest ${
      isLight
        ? 'bg-[#F8FAFB] border-[#E8ECEF] text-[#9A9FA5]'
        : 'border-slate-200 text-slate-500'
    }`}
  >
    Cancel
  </button>

  <button
    disabled={!settleData.totalAmount || !settleData.credits}
    onClick={() => setSettleModal({ ...settleModal, step: 2 })}
    className="flex-1 flex items-center justify-center gap-1 py-2.5 bg-cyan-600 text-white rounded-xl text-[10px] font-black uppercase shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Next
    <ArrowRight size={14} />
  </button>

</div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className={`p-4 rounded-xl border space-y-3 ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF]' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-center pb-3 border-b border-slate-200 text-xs font-bold uppercase text-slate-500"><span>Agent Credits</span><span className="text-sm font-black text-slate-800">{settleData.credits}</span></div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase text-slate-500"><span>Commission ({lead.commision}%)</span><span className="text-sm font-black text-emerald-600">₹{((parseFloat(settleData.totalAmount || 0) * (parseFloat(lead.commision || 0) / 100))).toFixed(2)}</span></div>
                  </div>
                  <div className={`rounded-xl p-3.5 text-xs flex gap-3 border ${isLight ? 'bg-blue-50 border-blue-100 text-blue-800' : 'bg-blue-50 border-blue-100 text-slate-600'}`}>
                    <ShieldCheck size={18} className="shrink-0" />
                    <p><strong className="block mb-0.5">Admin Verification</strong>Final amount may be modified by the admin.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setSettleModal({ ...settleModal, step: 1 })} className={`flex-1 py-3 rounded-xl text-[10px] font-black border uppercase tracking-widest ${isLight ? 'bg-[#F8FAFB] border-[#E8ECEF] text-[#9A9FA5]' : 'border-cyan-800 text-slate-100'}`}>Back</button>
                    <button onClick={handleSettleSubmit} disabled={isSettling} className="flex-[2] py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center justify-center gap-2">{isSettling ? <Loader2 size={14} className="animate-spin" /> : 'Submit to Admin'}</button>
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