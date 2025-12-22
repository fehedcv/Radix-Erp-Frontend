import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { 
  CheckCircle2, Clock, Calendar, 
  Briefcase, FileText, ShieldCheck, ChevronRight 
} from 'lucide-react';

const ManageLeads = () => {
  const navigate = useNavigate();
  
  // BusinessHub-ൽ നിന്ന് context വഴി ഡാറ്റ സ്വീകരിക്കുന്നു
  const { leads = [], businessName, updateLeadStatus } = useOutletContext();

  // ഈ ബിസിനസ് യൂണിറ്റിന് വേണ്ടിയുള്ള ലീഡുകൾ ഫിൽട്ടർ ചെയ്യുന്നു
  const myLeads = useMemo(() => {
    return leads.filter(l => l.businessUnit === businessName);
  }, [leads, businessName]);

  return (
    <div className="space-y-10 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div className="border-l-4 border-indigo-600 pl-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Incoming Pipeline</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">
            Active Verification Queue / {businessName}
          </p>
        </div>
        
        <div className="flex items-center gap-6">
            <div className="bg-slate-900 text-white px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em]">
              Registry Total: {myLeads.length}
            </div>
            <div className="flex items-center gap-2 text-emerald-500">
               <ShieldCheck size={16} />
               <span className="text-[9px] font-black uppercase tracking-widest">Node: Online</span>
            </div>
        </div>
      </div>

      {/* 2. LEADS REGISTRY LIST */}
      <div className="space-y-4">
        {myLeads.length > 0 ? (
          myLeads.map((lead, i) => (
            <motion.div 
              layout 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={lead.id} 
              className="bg-white rounded-none border border-slate-200 p-8 hover:border-indigo-600 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-8 group shadow-sm relative overflow-hidden"
            >
              {/* Left Side: Metadata */}
              <div className="flex-1 space-y-5 relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] border ${
                    lead.status === 'Verified' || lead.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : lead.status === 'Rejected'
                      ? 'bg-red-50 text-red-700 border-red-100'
                      : 'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {lead.status}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">REF_ID: {lead.id}</span>
                </div>
                
                <div>
                    <h4 className="text-2xl font-bold text-slate-900 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                      {lead.clientName}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-2 mt-3">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Calendar size={14} className="text-slate-300"/> Logged: {lead.date}
                        </p>
                        <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest flex items-center gap-2">
                          <Briefcase size={14} /> {lead.service}
                        </p>
                    </div>
                </div>
              </div>

              {/* Right Side: Operational Actions */}
              <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                
                {/* 💡 വിപുലമായ വിവരങ്ങൾ കാണാൻ (Navigation) */}
                <button 
                  onClick={() => navigate(`/business/leads/${lead.id}`)}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <FileText size={14} /> Audit Lead File
                </button>
                
                {/* 💡 ഇതാണ് വെരിഫിക്കേഷൻ ബട്ടൺ (Approve) */}
                {lead.status === 'Pending' && (
                  <button 
                    onClick={() => updateLeadStatus(lead.id, 'Verified')}
                    className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                  >
                    <CheckCircle2 size={14} /> Verify Submission
                  </button>
                )}
              </div>

              {/* Background Decoration */}
              <span className="absolute -right-4 -bottom-10 text-9xl font-black text-slate-50 opacity-0 group-hover:opacity-100 transition-all pointer-events-none select-none uppercase">
                {lead.id.slice(-3)}
              </span>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-32 bg-white border border-dashed border-slate-200 rounded-none">
            <div className="w-20 h-20 bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <Clock size={32} className="text-slate-200" />
            </div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Station Idle</h3>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mt-2">Zero incoming data detected.</p>
          </div>
        )}
      </div>

      {/* 3. SYSTEM LOG FOOTER */}
      <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-slate-100">
            <FileText size={12} className="text-slate-400" />
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em]">
             Lead Registry Sync: Live • Node: Active
          </p>
        </div>
        <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Radix ERP Infrastructure Layer</span>
      </div>
    </div>
  );
};

export default ManageLeads;