import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import {
  ArrowLeft, Phone, Mail, MapPin,
  CheckCircle2, XCircle, User,
  AlertTriangle, Loader2, Calendar,
  ShieldCheck, Info, Activity,
  MessageSquare, ClipboardCheck,
  Play, Check, Briefcase, Layers,
  IndianRupee, ArrowRight, Wallet, X,
  CreditCard
} from 'lucide-react';

import { supabase } from '../../supabase/supabaseClient';

const LeadReviewApp = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // --- THEME INTEGRATION ---
  const { theme } = useOutletContext(); 
  const isLight = theme === 'light';

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, targetStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Settlement Flow
  const [settleModal, setSettleModal] = useState({ show: false, step: 1 });
  const [settleData, setSettleData] = useState({ totalAmount: '', credits: '' });
  const [isSettling, setIsSettling] = useState(false);

  // Helper: Normalize lead status
  const normalizeStatus = (dbStatus) => {
    const statusMap = {
      'pending': 'Pending',
      'verified': 'Verified',
      'in progress': 'In Progress',
      'completed': 'Completed',
      'rejected': 'Rejected'
    };
    return statusMap[dbStatus?.toLowerCase()] || dbStatus || 'Pending';
  };

  // ---------------- FETCH LEAD ----------------
  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('leads')
          .select(`
            id,
            customer_name,
            phone,
            email,
            description,
            location,
            status,
            payment_status,
            credit_status,
            total_sale_amount,
            approved_credits,
            created_at,
            source_user_id,
            business_units (
              business_name,
              commission
            ),
            business_unit_services (
              service_name
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('Failed to load lead details:', error);
          setLead(null);
          return;
        }

        let agentData = null;

        if (data?.source_user_id) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select(`
              full_name,
              phone
            `)
            .eq('id', data.source_user_id)
            .single();

          if (userError) {
            console.error('Failed to load agent details:', userError);
          }

          if (userData) {
            agentData = userData;
          }
        }

        // Safely extract relationships
        const businessUnit = Array.isArray(data.business_units) ? data.business_units[0] : data.business_units;
        const serviceData = Array.isArray(data.business_unit_services) ? data.business_unit_services[0] : data.business_unit_services;

        const mappedLead = {
          id: data.id,
          clientName: data.customer_name,
          clientPhone: data.phone,
          clientEmail: data.email,
          description: data.description,
          location: data.location,
          status: normalizeStatus(data.status),
          paymentStatus: String(data.payment_status).toLowerCase() === 'settled' ? 'Settled' : 'Pending',
          creditStatus: data.credit_status || '',
          totalSaleAmount: data.total_sale_amount || 0,
          commission: data.approved_credits || 0,
          businessUnit: businessUnit?.business_name || 'Unknown',
          commisionPercent: businessUnit?.commission || 0,
          service: serviceData?.service_name || 'Unknown',
          agentId: agentData?.full_name || 'Unknown',
          agentPhone: agentData?.phone || '',
          date: data.created_at
        };

        setLead(mappedLead);

      } catch (err) {
        console.error('Failed to load lead details:', err);
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
      const { error } = await supabase.rpc('update_lead_status', {
        p_lead_id: lead.id,
        p_status: status.toLowerCase()
      });

      if (error) {
        console.error('Failed to update lead status:', error);
        return;
      }

      setLead((prev) => ({ ...prev, status }));
      setModal({ show: false, targetStatus: '' });
    } catch (err) {
      console.error('Failed to update lead status:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------------- SETTLEMENT UPDATE ----------------
  const handleSettleSubmit = async () => {
    setIsSettling(true);
    try {
      const { error } = await supabase.rpc('settle_agent_credit', {
        p_lead_id: lead.id,
        p_total_sale_amount: Number(settleData.totalAmount),
        p_approved_credits: Number(settleData.credits)
      });

      if (error) {
        console.error('Failed to settle agent credit:', error);
        return;
      }

      setLead((prev) => ({
        ...prev,
        paymentStatus: 'Settled',
        commission: Number(settleData.credits),
        totalSaleAmount: Number(settleData.totalAmount)
      }));
      setSettleModal({ show: false, step: 1 });
      setSettleData({ totalAmount: '', credits: '' });
    } catch (err) {
      console.error('Failed to settle agent credit:', err);
    } finally {
      setIsSettling(false);
    }
  };

  // ---------------- HELPERS ----------------
  const getStatusColor = (status) => {
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'verified') return 'text-[#81B398] bg-[#81B398]/10 border-[#81B398]/20';
    if (s === 'rejected') return 'text-[#F0524F] bg-[#F0524F]/10 border-[#F0524F]/20';
    if (s === 'in progress') return 'text-[#48477A] bg-[#48477A]/10 border-[#48477A]/20';
    return 'text-amber-500 bg-amber-500/10 border-amber-500/20'; // Pending
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
    return <SkeletonLoader isLight={isLight} />;
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 pt-2 pb-6">
        <div className={`h-16 w-16 rounded-3xl border flex items-center justify-center ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#718096]' : 'bg-[#222938] border-white/10 text-[#9CA3AF]'}`}>
          <Info size={32} strokeWidth={2.5} />
        </div>
        <div className="text-center">
          <p className={`text-xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>Lead Unavailable</p>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
            The requested ID could not be found.
          </p>
        </div>
        <button
          onClick={() => navigate('/business/leads')}
          className="px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all bg-[#81B398] text-white hover:bg-[#6FA085]"
        >
          Return to Leads
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`font-['Plus_Jakarta_Sans',sans-serif] space-y-4 pt-2 pb-6 transition-colors duration-200 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}
    >
      {/* 1. TOP NAVIGATION & HEADER */}
      <div className="mb-4 px-1">
        <button
          onClick={() => navigate('/business/leads')}
          className={`group flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-colors mb-4 ${isLight ? 'text-[#718096] hover:text-[#1A202C]' : 'text-[#9CA3AF] hover:text-[#F4F5F7]'}`}
        >
          <ArrowLeft size={14} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          Back to Leads
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Lead Details</h2>
          {lead.status === 'Rejected' && <XCircle size={24} strokeWidth={2.5} className="text-[#F0524F]" />}
        </div>
      </div>

      {/* TOP ROW: Date & Status Card + Warning Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
        {/* Status & Date */}
        <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 flex flex-col justify-center gap-4 ${
          isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
        }`}>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              Current Status
            </span>
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 transition-all ${getStatusColor(lead.status)}`}>
              <Activity size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">{lead.status}</span>
            </div>
          </div>
          <div className={`h-px w-full ${isLight ? 'bg-[#F4F5F7]' : 'bg-white/5'}`}></div>
          <div className="flex justify-between items-center">
            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              <Calendar size={14} strokeWidth={2.5} /> Submitted On
            </span>
            <span className="text-sm font-extrabold tracking-tight">{formatDate(lead.date)}</span>
          </div>
        </div>

        {/* Warning/Note Card */}
        <div className={`rounded-3xl border p-5 md:p-6 transition-all duration-200 flex flex-col justify-center gap-2 ${
          isLight ? 'bg-[#F0524F]/5 border-[#F0524F]/10' : 'bg-[#F0524F]/10 border-[#F0524F]/20'
        }`}>
          <div className="flex items-center gap-2 text-[#F0524F]">
            <AlertTriangle size={16} strokeWidth={2.5} />
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Important Information</span>
          </div>
          <p className="text-sm font-medium text-[#F0524F]">
            Credits can only be approved and settled if the assigned work is 100% completed by the operations team.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">

        {/* LEFT COLUMN: Customer & Project Info */}
        <div className="md:col-span-2 space-y-3 lg:space-y-4">

          {/* Contact Card */}
          <div className={`border rounded-3xl p-5 md:p-6 relative overflow-hidden transition-all duration-200 ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-200 bg-[#81B398]`} />

            <div className="flex justify-between items-start mb-6">
              <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
                isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
              }`}>
                <User size={14} strokeWidth={2.5} className="text-[#81B398]" /> Client Information
              </p>
            </div>

            <div className="grid gap-6">
              {/* Client Name & Phone */}
              <div className="flex items-start gap-4">
                <div className="w-full">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Client Name
                  </p>
                  <h3 className="text-2xl font-extrabold tracking-tight mb-4">{lead.clientName}</h3>
                  
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 transition-colors ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Mobile: <span className={isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}>{lead.clientPhone}</span>
                  </p>
                  
                  <div className="flex flex-wrap gap-3 w-full max-w-sm">
                    <a
                      href={`tel:${lead.clientPhone}`}
                      className={`flex-1 py-3.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                        isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398]'
                      }`}
                    >
                      <Phone size={14} strokeWidth={2.5} /> Call
                    </a>
                    <a
                      href={`https://wa.me/${cleanClientPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-3.5 rounded-xl border border-transparent text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
                    >
                      <MessageSquare size={14} strokeWidth={2.5} /> WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              {/* Client Location */}
              <div className={`flex items-center gap-4 pt-5 border-t transition-colors ${
                isLight ? 'border-[#E2E8F0]' : 'border-white/10'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#81B398]' : 'bg-[#131720] border-white/10 text-[#81B398]'
                }`}>
                  <MapPin size={16} strokeWidth={2.5} />
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Service Location
                  </p>
                  <p className="text-sm font-extrabold">{lead.location || 'Not specified'}</p>
                </div>
              </div>

              {/* Agent Info */}
              <div className={`flex items-start gap-4 pt-5 border-t transition-colors ${
                isLight ? 'border-[#E2E8F0]' : 'border-white/10'
              }`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#81B398]' : 'bg-[#131720] border-white/10 text-[#81B398]'
                }`}>
                  <Briefcase size={16} strokeWidth={2.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 transition-colors ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    Handling Agent
                  </p>
                  <p className="text-sm font-extrabold break-all">{lead.agentId || 'Unassigned'}</p>
                  
                  {lead.agentPhone && (
                    <div className="flex flex-wrap gap-3 mt-3 w-full max-w-sm">
                      <a
                        href={`tel:${lead.agentPhone}`}
                        className={`flex-1 py-3.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 ${
                          isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-[#81B398]'
                        }`}
                      >
                        <Phone size={14} strokeWidth={2.5} /> Call Agent
                      </a>
                      <a
                        href={`https://wa.me/${lead.agentPhone?.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-3.5 rounded-xl border border-transparent text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085]"
                      >
                        <MessageSquare size={14} strokeWidth={2.5} /> WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className={`border rounded-3xl p-5 md:p-6 transition-all ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck size={16} strokeWidth={2.5} className="text-[#81B398]" />
              <h3 className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Requirement Details</h3>
            </div>

            <div className={`rounded-2xl p-4 border mb-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
              <p className={`text-sm font-medium leading-relaxed italic ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                "{lead.description || 'No description provided.'}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className={`p-4 border rounded-2xl ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                <div className={`flex items-center gap-2 mb-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  <Briefcase size={12} strokeWidth={2.5} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Business Unit</span>
                </div>
                <p className="text-sm font-extrabold truncate">{lead.businessUnit}</p>
              </div>
              <div className={`p-4 border rounded-2xl ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
                <div className={`flex items-center gap-2 mb-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  <Layers size={12} strokeWidth={2.5} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Service</span>
                </div>
                <p className="text-sm font-extrabold truncate">{lead.service}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Workflow & Actions */}
        <div className="space-y-3 lg:space-y-4">

          {/* Progress Stepper */}
          <div className={`border rounded-3xl p-5 md:p-6 transition-all ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              <Activity size={14} strokeWidth={2.5} /> Request Lifecycle
            </p>

            <div className="space-y-4 relative">
              <div className={`absolute left-[11px] top-3 bottom-3 w-0.5 z-0 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`} />

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
                      setModal({ show: true, targetStatus: step });
                    }}
                    className={`relative z-10 flex items-center gap-4 rounded-xl px-2 py-1.5 -mx-2 transition-all
                      ${isClickable && !isProcessing
                        ? 'cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 active:scale-95'
                        : 'cursor-default'
                      }`}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-[3px] flex items-center justify-center transition-all shrink-0
                      ${isCompleted || isCurrent
                        ? 'bg-[#81B398] border-[#81B398] text-white'
                        : (isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#718096]' : 'bg-[#222938] border-white/10 text-[#9CA3AF]')}
                    `}>
                      {isLoading
                        ? <Loader2 size={10} strokeWidth={3} className="animate-spin" />
                        : isCompleted
                          ? <Check size={12} strokeWidth={4} />
                          : <div className="w-1.5 h-1.5 rounded-full bg-current" />
                      }
                    </div>

                    <span className={`text-[11px] font-bold uppercase tracking-wider flex-1 ${
                      isCurrent   ? (isLight ? 'text-[#81B398]' : 'text-[#81B398]') :
                      isCompleted ? (isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]') :
                      isClickable ? (isLight ? 'text-[#718096]' : 'text-[#9CA3AF]') :
                                    (isLight ? 'text-[#718096]/50' : 'text-[#9CA3AF]/50')
                    }`}>
                      {step}
                    </span>

                    {isClickable && !isProcessing && (
                      <span className={`text-[9px] font-bold uppercase tracking-wider text-[#81B398]`}>
                        Set →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION PANEL */}
          <div className={`border rounded-3xl p-5 md:p-6 sticky top-4 transition-all ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wider mb-5 flex items-center gap-2 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              <ShieldCheck size={14} strokeWidth={2.5} /> Actions
            </p>

            <div className="grid gap-3">
              {lead.status === 'Pending' && (
                <>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Verified' })}
                    className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 bg-[#81B398] text-white hover:bg-[#6FA085]"
                  >
                    <CheckCircle2 size={16} strokeWidth={2.5} /> Approve Lead
                  </button>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Rejected' })}
                    className={`w-full py-3.5 border rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 ${
                      isLight ? 'border-transparent bg-[#F4F5F7] text-[#F0524F] hover:border-[#F0524F]' : 'border-transparent bg-[#131720] text-[#F0524F] hover:border-[#F0524F]'
                    }`}
                  >
                    <XCircle size={16} strokeWidth={2.5} /> Reject Request
                  </button>
                </>
              )}

              {lead.status === 'Verified' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'In Progress' })}
                  className="w-full py-3.5 bg-[#48477A] text-white rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#3d3c67]"
                >
                  <Play size={16} strokeWidth={2.5} /> Start Work
                </button>
              )}

              {lead.status === 'In Progress' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'Completed' })}
                  className="w-full py-3.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#6FA085]"
                >
                  <Check size={16} strokeWidth={2.5} /> Mark Complete
                </button>
              )}

              {lead.status === 'Completed' && (lead.creditStatus === 'credited' || lead.paymentStatus === 'Settled') ? (
                <div className={`border rounded-2xl p-5 space-y-4 ${isLight ? 'bg-[#81B398]/5 border-[#81B398]/20' : 'bg-[#81B398]/10 border-[#81B398]/20'}`}>
                  <div className="flex items-center gap-2 mb-1 text-[#81B398] font-bold text-[10px] uppercase tracking-wider">
                    <CheckCircle2 size={16} strokeWidth={2.5} /> Settlement Details
                  </div>
                  <div className="space-y-3">
                    <div className={`flex justify-between items-center text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                      <span>Agent Credit</span>
                      <span className={`text-sm font-extrabold flex items-center gap-1.5 ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}><CreditCard size={14} /> {lead.commission}</span>
                    </div>
                    <div className={`flex justify-between items-center text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                      <span>Commission ({lead.commisionPercent}%)</span>
                      <span className={`text-sm font-extrabold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>₹{(parseFloat(lead.totalSaleAmount || 0) * (parseFloat(lead.commisionPercent || 0) / 100)).toLocaleString('en-IN')}</span>
                    </div>
                    <div className={`flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-3 border-t ${isLight ? 'border-[#81B398]/20 text-[#718096]' : 'border-[#81B398]/20 text-[#9CA3AF]'}`}>
                      <span>Total Sale</span>
                      <span className={`text-sm font-extrabold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>₹{lead.totalSaleAmount}</span>
                    </div>
                  </div>
                </div>
              ) : lead.status === 'Completed' ? (
                <button
                  onClick={() => setSettleModal({ show: true, step: 1 })}
                  className="w-full py-3.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-[#6FA085]"
                >
                  <Wallet size={16} strokeWidth={2.5} /> Settle Agent Credit
                </button>
              ) : null}

              {lead.status !== 'Completed' && lead.status !== 'Pending' && lead.status !== 'Rejected' && (
                <div className={`mt-2 text-center text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  Action required by Admin
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* STATUS UPDATE MODAL */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-8 rounded-3xl w-full max-w-sm text-center border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' : 'bg-[#131720] border-white/10 text-[#F4F5F7]'}`}><AlertTriangle size={32} strokeWidth={2.5} /></div>
              <h3 className="text-xl font-extrabold tracking-tight mb-2">Confirm Update</h3>
              <p className={`text-sm font-medium mb-8 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>Change status to <strong>"{modal.targetStatus}"</strong>?</p>
              
              <div className="flex gap-3">
                <button onClick={() => setModal({ show: false, targetStatus: '' })} className={`flex-1 py-3.5 border rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C] hover:border-[#E2E8F0]' : 'bg-[#131720] border-transparent text-[#F4F5F7] hover:border-white/10'}`}>Cancel</button>
                <button onClick={() => updateStatus(modal.targetStatus)} disabled={isProcessing} className="flex-1 py-3.5 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center bg-[#81B398] hover:bg-[#6FA085]">
                  {isProcessing ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SETTLEMENT MODAL */}
      <AnimatePresence>
        {settleModal.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`p-8 rounded-3xl w-full max-w-md border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}
            >
              <button onClick={() => setSettleModal({ show: false, step: 1 })} className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-white/10'}`}><X size={20} strokeWidth={2.5} /></button>
              
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${isLight ? 'bg-[#81B398]/10 border-[#81B398]/20 text-[#81B398]' : 'bg-[#81B398]/10 border-[#81B398]/20 text-[#81B398]'}`}>
                <Wallet size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-extrabold text-center tracking-tight mb-8">Settle Credits</h3>

              {settleModal.step === 1 ? (
                <div className="space-y-5">
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}><IndianRupee size={14} strokeWidth={2.5}/> Total Amount</label>
                    <input type="number" placeholder="e.g. 5000" value={settleData.totalAmount} onChange={(e) => setSettleData({ ...settleData, totalAmount: e.target.value })}
                      className={`w-full px-5 py-4 rounded-xl border text-sm font-bold outline-none transition-all ${isLight ? 'bg-[#F4F5F7] border-transparent focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-transparent focus:border-[#81B398] text-[#F4F5F7]'}`} />
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}><Wallet size={14} strokeWidth={2.5}/> Agent Credits</label>
                    <input type="number" placeholder="e.g. 500" value={settleData.credits} onChange={(e) => setSettleData({ ...settleData, credits: e.target.value })}
                      className={`w-full px-5 py-4 rounded-xl border text-sm font-bold outline-none transition-all ${isLight ? 'bg-[#F4F5F7] border-transparent focus:border-[#81B398] text-[#1A202C]' : 'bg-[#131720] border-transparent focus:border-[#81B398] text-[#F4F5F7]'}`} />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setSettleModal({ show: false, step: 1 })}
                      className={`flex-1 py-3.5 border rounded-xl text-xs font-bold uppercase tracking-wider ${isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C]' : 'bg-[#131720] border-transparent text-[#F4F5F7]'}`}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!settleData.totalAmount || !settleData.credits}
                      onClick={() => setSettleModal({ ...settleModal, step: 2 })}
                      className="flex-1 py-3.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 active:scale-95"
                    >
                      Next <ArrowRight size={16} strokeWidth={2.5}/>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-5 rounded-2xl border space-y-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'}`}>
                    <div className={`flex justify-between items-center pb-4 border-b text-[10px] font-bold uppercase tracking-wider ${isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'}`}>
                      <span>Agent Credits</span>
                      <span className={`text-base font-extrabold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>{settleData.credits}</span>
                    </div>
                    <div className={`flex justify-between items-center text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                      <span>Commission ({lead.commisionPercent}%)</span>
                      <span className="text-base font-extrabold text-[#81B398]">₹{((parseFloat(settleData.totalAmount || 0) * (parseFloat(lead.commisionPercent || 0) / 100))).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className={`rounded-2xl p-4 text-xs font-medium flex gap-3 border ${isLight ? 'bg-[#48477A]/5 border-[#48477A]/10 text-[#48477A]' : 'bg-[#48477A]/10 border-[#48477A]/20 text-[#81B398]'}`}>
                    <ShieldCheck size={20} strokeWidth={2.5} className="shrink-0" />
                    <p><strong className="block mb-1 font-extrabold">Admin Verification</strong>Final amount may be modified by the admin.</p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button onClick={() => setSettleModal({ ...settleModal, step: 1 })} className={`flex-1 py-3.5 rounded-xl text-xs font-bold border uppercase tracking-wider ${isLight ? 'bg-[#F4F5F7] border-transparent text-[#1A202C]' : 'bg-[#131720] border-transparent text-[#F4F5F7]'}`}>Back</button>
                    <button onClick={handleSettleSubmit} disabled={isSettling} className="flex-[2] py-3.5 bg-[#81B398] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95">
                      {isSettling ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : 'Submit to Admin'}
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

// ---------------- SKELETON LOADER COMPONENT ----------------
const SkeletonLoader = ({ isLight }) => (
  <div className="max-w-[1000px] mx-auto space-y-4 pt-2 pb-6 px-4 sm:px-6 w-full">
    {/* Header Skeleton */}
    <div className="mb-4 px-1">
      <div className={`w-24 h-4 mb-4 rounded ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'} animate-pulse`} />
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className={`w-48 h-8 rounded-lg ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'} animate-pulse`} />
          <div className={`w-32 h-4 rounded ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'} animate-pulse`} />
        </div>
        <div className={`w-28 h-8 rounded-xl ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'} animate-pulse`} />
      </div>
    </div>

    {/* Top Row Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
      <div className={`rounded-3xl border p-6 h-28 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} animate-pulse`} />
      <div className={`rounded-3xl border p-6 h-28 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} animate-pulse`} />
    </div>

    {/* Main Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 lg:gap-4">
      <div className="md:col-span-2 space-y-3 lg:space-y-4">
        <div className={`rounded-3xl border p-6 h-64 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} animate-pulse`} />
        <div className={`rounded-3xl border p-6 h-48 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} animate-pulse`} />
      </div>
      <div className="space-y-3 lg:space-y-4">
        <div className={`rounded-3xl border p-6 h-56 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} animate-pulse`} />
        <div className={`rounded-3xl border p-6 h-48 ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'} animate-pulse`} />
      </div>
    </div>
  </div>
);

export default LeadReviewApp;