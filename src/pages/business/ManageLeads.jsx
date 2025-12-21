import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, User, Eye, Clock, Calendar, 
  BarChart3, ShieldCheck, Briefcase, FileText, ChevronRight
} from 'lucide-react';
import { initialLeads } from '../../data/leadHistoryData';
import LeadReview from './LeadReview'; 

const ManageLeads = ({ businessName }) => {
  // 1. DATA INITIALIZATION (Logic Preserved)
  const [leads, setLeads] = useState(() => {
    const saved = localStorage.getItem('vynx_leads');
    const allLeads = saved ? JSON.parse(saved) : initialLeads;
    return allLeads.filter(l => l.businessUnit === businessName);
  });
  
  const [selectedLead, setSelectedLead] = useState(null); 

  // 2. SYNC LOGIC (Logic Preserved)
  useEffect(() => {
    const syncData = () => {
      const saved = localStorage.getItem('vynx_leads');
      if (saved) {
        const allLeads = JSON.parse(saved);
        setLeads(allLeads.filter(l => l.businessUnit === businessName));
      }
    };
    window.addEventListener('storage', syncData);
    return () => window.removeEventListener('storage', syncData);
  }, [businessName]);

  // 3. GLOBAL UPDATE HANDLER (Logic Preserved)
  const updateStatus = (id, newStatus) => {
    const masterSaved = JSON.parse(localStorage.getItem('vynx_leads') || "[]");
    const updatedMasterLeads = masterSaved.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    );
    localStorage.setItem('vynx_leads', JSON.stringify(updatedMasterLeads));
    setLeads(updatedMasterLeads.filter(l => l.businessUnit === businessName));

    if (selectedLead && selectedLead.id === id) {
      setSelectedLead({ ...selectedLead, status: newStatus });
    }
  };

  const handleBack = () => setSelectedLead(null);

  if (selectedLead) {
    return (
      <LeadReview 
        lead={selectedLead} 
        onBack={handleBack} 
        onVerify={(id) => { updateStatus(id, 'Verified'); }}
        onReject={(id) => { updateStatus(id, 'Rejected'); }}
        onUpdateStatus={updateStatus}
      />
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Incoming Pipeline</h2>
          <p className="text-sm font-medium text-slate-500 mt-1 italic">Active verification queue for {businessName}</p>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-none">
              Registry Total: {leads.length}
            </div>
            <div className="flex items-center gap-2 text-emerald-600">
               <ShieldCheck size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Node: Active</span>
            </div>
        </div>
      </div>

      {/* 2. LEADS REGISTRY LIST */}
      <div className="space-y-4">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <motion.div 
              layout 
              key={lead.id} 
              className="bg-white rounded-none border border-slate-200 p-6 hover:border-indigo-600 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6 group shadow-sm"
            >
              {/* Left Side: Identity Metadata */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 text-[9px] font-bold uppercase tracking-widest border rounded-none ${
                    lead.status === 'Verified' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : lead.status === 'Rejected'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {lead.status}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID Reference: <span className="text-slate-900 font-mono">{lead.id}</span></span>
                </div>
                
                <div>
                    <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                      {lead.clientName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                        <p className="text-xs text-slate-500 font-semibold uppercase flex items-center gap-2">
                           <Calendar size={14} className="text-slate-400"/> Received: {lead.date}
                        </p>
                        <p className="text-xs text-indigo-600 font-bold uppercase flex items-center gap-2">
                          <Briefcase size={14} /> {lead.service}
                        </p>
                    </div>
                </div>
              </div>

              {/* Right Side: Operational Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button 
                  onClick={() => setSelectedLead(lead)}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-none border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all flex items-center justify-center gap-2"
                >
                  <BarChart3 size={14} /> Analyze Lead File
                </button>
                
                {lead.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(lead.id, 'Verified')}
                    className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-none hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Approve Submission
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-24 bg-white border border-dashed border-slate-200 rounded-none">
            <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <Clock size={28} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Station Idle</h3>
            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400 mt-2">No incoming lead data detected in registry</p>
          </div>
        )}
      </div>

      {/* 3. SYSTEM LOG FOOTER */}
      <div className="pt-6 border-t border-slate-100 flex items-center gap-3 opacity-40">
        <FileText size={14} className="text-slate-400" />
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
           Lead Registry linked to Vynx Network Central DB • December 2025
        </p>
      </div>
    </div>
  );
};

export default ManageLeads;