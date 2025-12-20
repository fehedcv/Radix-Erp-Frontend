import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, XCircle, User, Phone, MapPin, 
  MessageSquare, Filter, Eye, MessageCircle, Clock, Calendar 
} from 'lucide-react';
import { initialLeads } from '../../data/leadHistoryData';
import LeadReview from './LeadReview'; 

const ManageLeads = ({ businessName }) => {
  const [leads, setLeads] = useState(initialLeads.filter(l => l.businessUnit === businessName));
  const [selectedLead, setSelectedLead] = useState(null); 

  const updateStatus = (id, newStatus) => {
    // 1. Update main list
    const updatedLeads = leads.map(l => 
      l.id === id ? { ...l, status: newStatus } : l
    );
    setLeads(updatedLeads);
    localStorage.setItem('vynx_leads', JSON.stringify(updatedLeads));

    // 2. Update selected lead if active
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
      />
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Incoming Leads</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and verify agent submissions for {businessName}</p>
        </div>
        
        {/* Optional: You could add a filter button here later */}
        <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total: {leads.length}</span>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-3">
        {leads.length > 0 ? (
          leads.map((lead) => (
            <motion.div 
              layout 
              key={lead.id} 
              className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 hover:border-gray-300 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
            >
              {/* Left Side: Lead Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                    lead.status === 'Verified' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : lead.status === 'Rejected'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {lead.status === 'Verified' && <CheckCircle2 size={12} className="mr-1"/>}
                    {lead.status === 'Rejected' && <XCircle size={12} className="mr-1"/>}
                    {lead.status === 'Pending' && <Clock size={12} className="mr-1"/>}
                    {lead.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#{lead.id}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={12} /> {lead.date}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                    <h4 className="text-base font-semibold text-slate-900 truncate flex items-center gap-2">
                      {lead.clientName}
                    </h4>
                    <span className="hidden sm:inline text-slate-300">|</span>
                    <p className="text-sm text-indigo-600 font-medium truncate">
                      {lead.service}
                    </p>
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button 
                  onClick={() => setSelectedLead(lead)}
                  className="flex-1 md:flex-none items-center justify-center px-4 py-2 bg-white border border-gray-300 text-slate-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors flex gap-2"
                >
                  <Eye size={16} className="text-slate-500" /> 
                  Review
                </button>
                
                {lead.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(lead.id, 'Verified')}
                    className="flex-1 md:flex-none items-center justify-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    Verify
                  </button>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg border-dashed">
            <p className="text-slate-500 text-sm">No leads found for this unit.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLeads;