import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase } from 'lucide-react';
import { businessUnits } from '../../data/businessData.jsx'; // Core Data Model [cite: 58]

const BusinessDirectory = ({ onViewDetails }) => {
  return (
    <div className="space-y-8">
      {/* HEADER SECTION [cite: 9] */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Units Directory</h2>
        <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">Explore & Refer Leads to Network Units</p>
      </div>

      {/* UNITS GRID [cite: 13, 14, 15] */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {businessUnits.map((unit, index) => (
          <motion.div 
            key={unit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: index * 0.08 }}
            // [cite_start]// FIXED: Entire card acts as the trigger for the Portfolio detail view [cite: 30]
            onClick={() => onViewDetails(unit)} 
            className="bg-white rounded-none p-8 md:p-10 border border-slate-200 hover:border-indigo-600 transition-all group cursor-pointer shadow-sm relative overflow-hidden" 
          >
            {/* CARD TOP: Identity & Rewards [cite: 26, 44] */}
            <div className="flex items-start justify-between mb-8">
              {/* Unit Icon - Sharp Standard Design  */}
              <div className={`h-16 w-16 ${unit.bg || 'bg-slate-900'} ${unit.color || 'text-white'} rounded-none flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white shadow-sm`}>
                {unit.icon ? React.cloneElement(unit.icon, { size: 28 }) : <Briefcase size={28} />}
              </div>
              
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Referral Reward</p>
                {/* <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 border border-indigo-100 rounded-none uppercase tracking-widest">
                  Earn {unit.creditsPerDeal} Credits
                </span> */}
              </div>
            </div>

            {/* UNIT DETAILS [cite: 32, 62] */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-2xl tracking-tighter uppercase">{unit.name}</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium italic leading-relaxed line-clamp-2">
                "{unit.description || 'Access professional business services through this dedicated unit.'}"
              </p>
            </div>
            
            {/* INTERACTIVE FOOTER: Navigation Link  */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between group-hover:text-indigo-600 transition-colors">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">View Unit Portfolio</span>
              <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BusinessDirectory;