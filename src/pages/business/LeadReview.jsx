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
  CreditCard,Building2
} from 'lucide-react';

import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const LeadReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { theme } = useTheme(); 
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ show: false, targetStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const [settleModal, setSettleModal] = useState({ show: false, step: 1 });
  const [settleData, setSettleData] = useState({ totalAmount: '', credits: '' });
  const [isSettling, setIsSettling] = useState(false);

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

  useEffect(() => {
    const fetchLead = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('leads')
          .select(`
            id, customer_name, phone, email, description, location, status, payment_status,
            credit_status, total_sale_amount, approved_credits, created_at, source_user_id,
            business_units ( business_name, commission ),
            business_unit_services ( service_name )
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
            .select(`full_name, phone`)
            .eq('id', data.source_user_id)
            .single();

          if (userError) console.error('Failed to load agent details:', userError);
          if (userData) agentData = userData;
        }

        const mappedLead = {
          id: data.id,
          clientName: data.customer_name,
          clientPhone: data.phone,
          clientEmail: data.email,
          description: data.description,
          location: data.location,
          status: normalizeStatus(data.status),
          paymentStatus: data.payment_status === 'settled' ? 'Settled' : 'Pending',
          creditStatus: data.credit_status || '',
          totalSaleAmount: data.total_sale_amount || 0,
          commission: data.approved_credits || 0,
          businessUnit: data.business_units?.business_name || 'Unknown',
          commision: data.business_units?.commission || 0,
          service: data.business_unit_services?.service_name || 'Unknown',
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

  // Semantic Colors for Earth-Tech
  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'approved' || s === 'completed' || s === 'settled' || s === 'credited') {
      return 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20';
    }
    if (s === 'rejected') {
      return 'bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20';
    }
    if (s === 'pending') {
      return 'bg-[#DAC18A]/10 text-[#DAC18A] border-[#DAC18A]/20';
    }
    if (s === 'in progress' || s === 'verified') {
      return 'bg-[#48477A]/10 text-[#48477A] border-[#48477A]/20';
    }
    return isLight ? 'bg-[#F4F5F7] text-[#718096] border-[#E2E8F0]' : 'bg-[#131720] text-[#9CA3AF] border-white/5';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // STRUCTURAL SKELETON LOADER
  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2 lg:mt-4 px-4 lg:px-0">
        {/* Header Skeleton */}
        <div className="pt-2 mb-2">
          <div className={`h-10 w-64 rounded-md mb-2 ${pulseClass} animate-pulse`} />
          <div className={`h-4 w-48 rounded-md mb-6 ${pulseClass} animate-pulse`} />
          <div className={`h-4 w-24 rounded-md ${pulseClass} animate-pulse`} />
        </div>

        {/* Top Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
           <div className={`h-[100px] rounded-2xl  ${pulseClass} animate-pulse`} />
           <div className={`h-[100px] rounded-2xl  ${pulseClass} animate-pulse`} />
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="md:col-span-2 space-y-6">
             <div className={`h-[350px] rounded-2xl  ${pulseClass} animate-pulse`} />
             <div className={`h-[200px] rounded-2xl  ${pulseClass} animate-pulse`} />
          </div>
          <div className="space-y-6">
             <div className={`h-[350px] rounded-2xl ${pulseClass} animate-pulse`} />
             <div className={`h-[200px] rounded-2xl ${pulseClass} animate-pulse`} />
          </div>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className={`h-16 w-16 rounded-2xl flex items-center justify-center border ${surfaceClass}`}>
          <Info size={32} className={textSecondary} />
        </div>
        <div className="text-center">
          <p className={`text-xl font-bold tracking-tight ${textPrimary}`}>Lead Unavailable</p>
          <p className={`text-sm mt-1 ${textSecondary}`}>The requested ID could not be found.</p>
        </div>
        <button
          onClick={() => navigate('/business/leads')}
          className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'
          }`}
        >
          Return to Registry
        </button>
      </div>
    );
  }

  const workflow = ['Pending', 'Verified', 'In Progress', 'Completed'];
  const currentStepIndex = workflow.indexOf(lead.status);
  const cleanClientPhone = lead.clientPhone?.replace(/\D/g, '') || '';
  const cleanAgentPhone = lead.agentPhone?.replace(/\D/g, '') || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[1200px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2 lg:mt-4 px-4 lg:px-0 ${textPrimary}`}
    >
      {/* 1. TOP NAVIGATION & HEADER (Free/Borderless) */}
      <div className="pt-2">
        <h1 className={`text-[32px] lg:text-[40px] font-extrabold tracking-tight leading-none mb-2 ${textPrimary}`}>
          Lead Details
        </h1>
        <p className={`text-sm font-medium ${textSecondary}`}>
          Review and manage client requirements and status.
        </p>
      </div>

      <button
        onClick={() => navigate('/business/leads')}
        className={`group flex items-center gap-2 text-xs font-semibold transition-colors mt-6 mb-2 ${textSecondary} hover:text-[#81B398] w-fit`}
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      {/* 2. TOP HIGHLIGHT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Status Card */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-center transition-all duration-300 ${surfaceClass}`}>
          <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${textSecondary}`}>
            Current Status
          </p>
          <div className="flex items-center justify-between">
            <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-all ${getStatusColor(lead.status)}`}>
              <Activity size={16} />
              <span className="text-sm font-bold uppercase tracking-wider">{lead.status}</span>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${textSecondary}`}>
              <Calendar size={14} /> {formatDate(lead.date)}
            </div>
          </div>
        </div>

        {/* Important Note Card */}
        <div className={`p-6 rounded-2xl border flex items-start gap-4 transition-all duration-300 ${
          isLight ? 'bg-[#DAC18A]/10 border-[#DAC18A]/20' : 'bg-[#DAC18A]/5 border-[#DAC18A]/10'
        }`}>
          <AlertTriangle size={24} className="text-[#DAC18A] shrink-0" />
          <div>
            <h4 className={`text-sm font-bold mb-1 ${textPrimary}`}>Important Notice</h4>
            <p className={`text-xs font-medium leading-relaxed ${isLight ? 'text-[#1A202C]/80' : 'text-[#F4F5F7]/80'}`}>
              Credits can only be settled if the assigned work is 100% completed and verified by the administration.
            </p>
          </div>
        </div>

      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

        {/* LEFT COLUMN: Customer & Project Info */}
        <div className="md:col-span-2 space-y-6 lg:space-y-8">

          {/* Contact Card */}
          <div className={`rounded-2xl p-6 lg:p-8 border transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0] text-[#1A202C]' : 'border-white/5 text-[#F4F5F7]'}`}>
              <User size={18} className="text-[#81B398]" /> Client Information
            </h4>

            <div className="space-y-6 lg:space-y-8">
              
              {/* Added Client Name Section */}
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${textSecondary}`}>
                  Client Name
                </p>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    {lead.clientName}
                  </h2>
                  {lead.status === 'Rejected' && <XCircle size={20} className="text-[#F0524F]" />}
                </div>
              </div>

              <div className={`h-px w-full ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/5'}`} />

              {/* Client Phone + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
                }`}>
                  <Phone size={20} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>
                    Client Mobile
                  </p>
                  <p className="text-base font-bold">{lead.clientPhone}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  <a
                    href={`tel:${lead.clientPhone}`}
                    className={`flex-1 sm:flex-none py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all border ${
                      isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'
                    }`}
                  >
                    <Phone size={16} /> Call
                  </a>
                  <a
                    href={`https://wa.me/${cleanClientPhone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-none py-2.5 px-4 bg-[#81B398] text-[#FFFFFF] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#6FA085]"
                  >
                    <MessageSquare size={16} /> WhatsApp
                  </a>
                </div>
              </div>

              <div className={`h-px w-full ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/5'}`} />

              {/* Agent Info + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
                }`}>
                  <Briefcase size={20} />
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>
                    Handling Agent
                  </p>
                  <p className="text-base font-bold">{lead.agentId || 'Unassigned'}</p>
                </div>
                {lead.agentPhone && (
                  <div className="flex gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <a
                      href={`tel:${lead.agentPhone}`}
                      className={`flex-1 sm:flex-none py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all border ${
                        isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'
                      }`}
                    >
                      <Phone size={16} /> Call
                    </a>
                    <a
                      href={`https://wa.me/${cleanAgentPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-none py-2.5 px-4 bg-[#81B398] text-[#FFFFFF] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:bg-[#6FA085]"
                    >
                      <MessageSquare size={16} /> WhatsApp
                    </a>
                  </div>
                )}
              </div>

              <div className={`h-px w-full ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/5'}`} />

              {/* Client Location */}
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
                }`}>
                  <MapPin size={20} />
                </div>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${textSecondary}`}>
                    Service Location
                  </p>
                  <p className="text-base font-bold">{lead.location || 'Not specified'}</p>
                </div>
              </div>

            </div>
          </div>

          {/* Project Details */}
          <div className={`rounded-2xl p-6 lg:p-8 border transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0] text-[#1A202C]' : 'border-white/5 text-[#F4F5F7]'}`}>
              <ClipboardCheck size={18} className="text-[#81B398]" /> Requirement Details
            </h4>

            <div className={`rounded-xl p-5 border mb-6 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
              <p className={`text-sm font-medium leading-relaxed ${textSecondary}`}>
                "{lead.description || 'No description provided.'}"
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-4 border rounded-xl ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                <div className={`flex items-center gap-2 mb-1.5 ${textSecondary}`}>
                  <Building2 size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Business Unit</span>
                </div>
                <p className="text-sm font-bold truncate">{lead.businessUnit}</p>
              </div>
              <div className={`p-4 border rounded-xl ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5'}`}>
                <div className={`flex items-center gap-2 mb-1.5 ${textSecondary}`}>
                  <Layers size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">Service</span>
                </div>
                <p className="text-sm font-bold truncate">{lead.service}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Workflow & Actions */}
        <div className="space-y-6 lg:space-y-8">

          {/* Progress Stepper */}
          <div className={`rounded-2xl p-6 border transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0] text-[#1A202C]' : 'border-white/5 text-[#F4F5F7]'}`}>
              <Activity size={18} className="text-[#81B398]" /> Lifecycle
            </h4>

            <div className="space-y-4 relative ml-2">
              {/* Vertical connecting line */}
              <div className={`absolute left-[11px] top-3 bottom-3 w-px z-0 ${isLight ? 'bg-[#E2E8F0]' : 'bg-white/10'}`} />

              {workflow.map((step, idx) => {
                const isCompleted = idx < currentStepIndex || lead.status === 'Completed';
                const isCurrent   = step === lead.status;
                const isClickable = idx > currentStepIndex && lead.status !== 'Completed';
                const isLoading   = isProcessing && modal.targetStatus === step;

                return (
                  <div
                    key={step}
                    role={isClickable ? 'button' : undefined}
                    onClick={() => {
                      if (!isClickable || isProcessing) return;
                      setModal({ show: true, targetStatus: step });
                    }}
                    className={`relative z-10 flex items-center gap-4 group ${
                      isClickable && !isProcessing ? 'cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Circle Node */}
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                      ${isCompleted || isCurrent
                        ? `bg-[#81B398] border-[#81B398] text-[#FFFFFF]`
                        : (isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-transparent' : 'bg-[#222938] border-white/10 text-transparent')}
                      ${isClickable && !isProcessing && isLight ? 'group-hover:border-[#81B398]' : ''}
                      ${isClickable && !isProcessing && !isLight ? 'group-hover:border-[#81B398]' : ''}
                    `}>
                      {isLoading
                        ? <Loader2 size={12} className="animate-spin text-[#FFFFFF]" />
                        : isCompleted
                          ? <Check size={12} strokeWidth={3} />
                          : <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-[#FFFFFF]' : 'bg-transparent'}`} />
                      }
                    </div>

                    <span className={`text-xs font-bold uppercase tracking-wider flex-1 transition-colors ${
                      isCurrent   ? 'text-[#81B398]' :
                      isCompleted ? textPrimary :
                      isClickable ? `${textSecondary} group-hover:text-[#81B398]` :
                                    (isLight ? 'text-[#E2E8F0]' : 'text-white/20')
                    }`}>
                      {step}
                    </span>

                    {isClickable && !isProcessing && (
                      <span className={`text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity ${textSecondary}`}>
                        Set
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTION PANEL (Sticky) */}
          <div className={`rounded-2xl p-6 border sticky top-6 shadow-sm transition-all duration-300 ${surfaceClass}`}>
            <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0] text-[#1A202C]' : 'border-white/5 text-[#F4F5F7]'}`}>
              <ShieldCheck size={18} className="text-[#81B398]" /> Management
            </h4>

            <div className="grid gap-3">
              {lead.status === 'Pending' && (
                <>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Verified' })}
                    className="w-full py-3 bg-[#81B398] text-[#FFFFFF] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#6FA085] transition-all shadow-sm"
                  >
                    <CheckCircle2 size={16} /> Approve Lead
                  </button>
                  <button
                    onClick={() => setModal({ show: true, targetStatus: 'Rejected' })}
                    className={`w-full py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all border ${
                      isLight ? 'bg-[#FFFFFF] border-[#F0524F]/30 text-[#F0524F] hover:bg-[#F0524F]/5' : 'bg-[#222938] border-[#F0524F]/30 text-[#F0524F] hover:bg-[#F0524F]/10'
                    }`}
                  >
                    <XCircle size={16} /> Reject Request
                  </button>
                </>
              )}

              {lead.status === 'Verified' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'In Progress' })}
                  className="w-full py-3 bg-[#48477A] text-[#FFFFFF] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3d3c67] transition-all shadow-sm"
                >
                  <Play size={16} /> Start Work
                </button>
              )}

              {lead.status === 'In Progress' && (
                <button
                  onClick={() => setModal({ show: true, targetStatus: 'Completed' })}
                  className="w-full py-3 bg-[#81B398] text-[#FFFFFF] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#6FA085] transition-all shadow-sm"
                >
                  <Check size={16} /> Mark Complete
                </button>
              )}

              {lead.status === 'Completed' && (lead.creditStatus === 'credited' || lead.paymentStatus === 'Settled') ? (
                <div className={`border rounded-xl p-5 space-y-4 ${isLight ? 'bg-[#81B398]/5 border-[#81B398]/20' : 'bg-[#81B398]/10 border-[#81B398]/20'}`}>
                  <div className="flex items-center gap-2 text-[#81B398] font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 size={16} /> Settlement Details
                  </div>
                   <div className="space-y-3">
                      <div className={`flex justify-between items-center text-xs font-semibold ${textSecondary}`}>
                        <span>Agent Credit</span>
                        <span className={`text-sm font-bold flex items-center gap-1 ${textPrimary}`}><CreditCard size={14} /> {lead.commission}</span>
                      </div>
                      <div className={`flex justify-between items-center text-xs font-semibold ${textSecondary}`}>
                        <span>Commission ({lead.commision}%)</span>
                        <span className={`text-sm font-bold ${textPrimary}`}>₹{(parseFloat(lead.totalSaleAmount || 0) * (parseFloat(lead.commision || 0) / 100)).toLocaleString('en-IN')}</span>
                      </div>
                      <div className={`flex justify-between items-center text-xs font-semibold pt-3 border-t ${isLight ? 'border-[#81B398]/20' : 'border-[#81B398]/30'} ${textSecondary}`}>
                        <span>Total Sale</span>
                        <span className={`text-sm font-bold ${textPrimary}`}>₹{lead.totalSaleAmount}</span>
                      </div>
                   </div>
                </div>
              ) : lead.status === 'Completed' ? (
                <button
                  onClick={() => setSettleModal({ show: true, step: 1 })}
                  className="w-full py-3 bg-[#48477A] text-[#FFFFFF] rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3d3c67] transition-all shadow-sm"
                >
                  <Wallet size={16} /> Settle Credits
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {modal.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[600] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-8 rounded-2xl w-full max-w-sm shadow-xl relative border ${surfaceClass}`}
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 ${
                modal.targetStatus === 'Rejected' 
                ? 'bg-[#F0524F]/10 text-[#F0524F]' 
                : 'bg-[#81B398]/10 text-[#81B398]'
              }`}>
                <AlertTriangle size={28} />
              </div>
              <h3 className={`text-xl font-bold text-center tracking-tight mb-2 ${textPrimary}`}>Confirm Update</h3>
              <p className={`text-sm text-center font-medium mb-8 ${textSecondary}`}>
                Change status to <strong className={textPrimary}>"{modal.targetStatus}"</strong>?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setModal({ show: false, targetStatus: '' })} 
                  className={`py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                    isLight ? 'bg-[#F4F5F7] text-[#1A202C] border-[#E2E8F0] hover:bg-[#E2E8F0]' : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:bg-[#1A202C]'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={() => updateStatus(modal.targetStatus)} 
                  disabled={isProcessing} 
                  className={`py-2.5 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center justify-center ${
                    modal.targetStatus === 'Rejected' ? 'bg-[#F0524F] hover:bg-[#D44846]' : 'bg-[#81B398] hover:bg-[#6FA085]'
                  }`}
                >
                  {isProcessing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
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
              className={`p-8 rounded-2xl w-full max-w-md shadow-xl relative border ${surfaceClass}`}
            >
              <button 
                onClick={() => setSettleModal({ show: false, step: 1 })} 
                className={`absolute top-5 right-5 p-1.5 rounded-lg transition-colors ${
                  isLight ? 'text-[#718096] hover:bg-[#F4F5F7]' : 'text-[#9CA3AF] hover:bg-[#131720]'
                }`}
              >
                <X size={18} />
              </button>
              
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-5 ${
                isLight ? 'bg-[#48477A]/10 text-[#48477A]' : 'bg-[#48477A]/20 text-[#81B398]'
              }`}>
                <Wallet size={28} />
              </div>
              <h3 className={`text-xl font-bold text-center tracking-tight mb-8 ${textPrimary}`}>Settle Lead Credits</h3>

              {settleModal.step === 1 ? (
                <div className="space-y-5">
                  <div>
                    <label className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${textSecondary}`}>
                      <IndianRupee size={14} /> Total Sale Amount
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 5000" 
                      value={settleData.totalAmount} 
                      onChange={(e) => setSettleData({ ...settleData, totalAmount: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border text-sm font-medium outline-none transition-all ${
                        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]'
                      }`} 
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-2 flex items-center gap-1.5 ${textSecondary}`}>
                      <Wallet size={14} /> Approved Credits
                    </label>
                    <input 
                      type="number" 
                      placeholder="e.g. 500" 
                      value={settleData.credits} 
                      onChange={(e) => setSettleData({ ...settleData, credits: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border text-sm font-medium outline-none transition-all ${
                        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]'
                      }`} 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                      onClick={() => setSettleModal({ show: false, step: 1 })}
                      className={`py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                        isLight ? 'bg-[#F4F5F7] text-[#1A202C] border-[#E2E8F0] hover:bg-[#E2E8F0]' : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:bg-[#1A202C]'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      disabled={!settleData.totalAmount || !settleData.credits}
                      onClick={() => setSettleModal({ ...settleModal, step: 2 })}
                      className="flex items-center justify-center gap-2 py-2.5 bg-[#48477A] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[#3d3c67] disabled:opacity-50"
                    >
                      Next <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className={`p-5 rounded-xl border space-y-4 ${isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-transparent'}`}>
                    <div className="flex justify-between items-center pb-4 border-b border-inherit" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.05)' }}>
                      <span className={`text-xs font-semibold ${textSecondary}`}>Agent Credits</span>
                      <span className={`text-base font-bold ${textPrimary}`}>{settleData.credits}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-semibold ${textSecondary}`}>Commission ({lead.commision}%)</span>
                      <span className="text-base font-bold text-[#81B398]">₹{((parseFloat(settleData.totalAmount || 0) * (parseFloat(lead.commision || 0) / 100))).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <div className={`rounded-xl p-4 text-xs flex gap-3 items-start border ${
                    isLight ? 'bg-[#48477A]/10 border-[#48477A]/20 text-[#1A202C]' : 'bg-[#48477A]/20 border-[#48477A]/30 text-[#F4F5F7]'
                  }`}>
                    <ShieldCheck size={16} className="text-[#48477A] shrink-0 mt-0.5" />
                    <p className="leading-relaxed"><strong className="block mb-1">Admin Verification</strong>Final amount may be modified by the admin during processing.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => setSettleModal({ ...settleModal, step: 1 })} 
                      className={`col-span-1 py-2.5 rounded-lg text-sm font-semibold transition-colors border ${
                        isLight ? 'bg-[#F4F5F7] text-[#1A202C] border-[#E2E8F0] hover:bg-[#E2E8F0]' : 'bg-[#131720] text-[#F4F5F7] border-transparent hover:bg-[#1A202C]'
                      }`}
                    >
                      Back
                    </button>
                    <button 
                      onClick={handleSettleSubmit} 
                      disabled={isSettling} 
                      className="col-span-2 py-2.5 bg-[#81B398] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[#6FA085] flex items-center justify-center gap-2"
                    >
                      {isSettling ? <Loader2 size={16} className="animate-spin" /> : 'Submit to Admin'}
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