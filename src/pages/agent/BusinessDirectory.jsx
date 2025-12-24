import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Briefcase, ShieldCheck, Zap, Info, Plus } from 'lucide-react';
import { businessUnits } from '../../data/businessData.jsx'; 

const BusinessDirectory = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. HEADER SECTION - REFINED SPACING */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="reveal-up">
          <div className="flex items-center gap-2 mb-1.5">
             <Zap size={14} className="text-[#007ACC] fill-[#007ACC]" />
             <span className="text-[10px] font-bold text-[#007ACC] uppercase tracking-[0.2em]">Authorized Teams</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Team Directory</h2>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-xl">
            Select a specialized business team to manage your referrals and monitor project fulfillment.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
           <Info size={14} className="text-slate-400" />
           <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Units: {businessUnits.length}</span>
        </div>
      </div>

      {/* 2. UNITS GRID - PROFESSIONAL ARCHITECTURE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessUnits.map((unit, index) => (
          <motion.div 
            key={unit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.99 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            onClick={() => navigate(`/agent/units/${unit.id}`)} 
            className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#007ACC] transition-all group cursor-pointer shadow-sm flex flex-col justify-between h-full" 
          >
            <div>
              {/* CARD TOP: Identity */}
              <div className="flex items-start justify-between mb-6">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center transition-all duration-300 shadow-sm ${unit.bg || 'bg-slate-50'} ${unit.color || 'text-slate-600'} group-hover:bg-[#007ACC] group-hover:text-white`}>
                  {unit.icon ? React.cloneElement(unit.icon, { size: 22, strokeWidth: 2.5 }) : <Briefcase size={22} />}
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                    <ShieldCheck size={10} /> Verified
                  </span>
                </div>
              </div>

              {/* UNIT DETAILS */}
              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Department Team</p>
                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight group-hover:text-[#007ACC] transition-colors uppercase">
                  {unit.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2 italic">
                  "{unit.description || 'Access professional project management through this team.'}"
                </p>
              </div>
            </div>
            
            {/* ACTION FOOTER */}
            <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#007ACC] transition-colors">
                View Portfolio
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-50 group-hover:text-[#007ACC] transition-all">
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* 3. LIGHT THEMED HELP CARD (REPLACED DARK CARD) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4"
        >
           <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-100 shadow-sm text-[#007ACC]">
              <Plus size={20} strokeWidth={3} />
           </div>
           <div>
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">Missing a Team?</h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-1">If your business category isn't listed, please contact the network administrator.</p>
           </div>
           <button className="text-[10px] font-black text-[#007ACC] uppercase tracking-[0.2em] py-2 px-6 bg-white border border-blue-100 rounded-lg hover:bg-[#007ACC] hover:text-white transition-all shadow-sm">
             Contact HQ
           </button>
        </motion.div>
      </div>

      {/* FOOTER INFO LINE
      <div className="pt-4 flex items-center justify-center gap-4 text-slate-200">
         <div className="h-px w-12 bg-slate-200" />
         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.4em]">Radix Partner Network Infrastructure</span>
         <div className="h-px w-12 bg-slate-200" />
      </div> */}
    </div>
  );
};

export default BusinessDirectory;