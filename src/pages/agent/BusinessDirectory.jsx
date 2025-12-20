import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { businessUnits } from '../../data/businessData.jsx'; // Import shared data

const BusinessDirectory = ({ onViewDetails }) => {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black tracking-tight uppercase text-slate-900 leading-none">Units Directory</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Explore & Refer Leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {businessUnits.map((unit, index) => (
          <motion.div 
            key={unit.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden" 
            onClick={() => onViewDetails(unit)} // Passes the FULL object to the portfolio page
          >
            {/* Required: Icon [cite: 62] */}
            <div className={`h-16 w-16 ${unit.bg} ${unit.color} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white mb-6 shadow-sm`}>
              {React.cloneElement(unit.icon, { size: 28 })}
            </div>

            {/* Required: Name & Short Desc [cite: 62] */}
            <h3 className="font-black text-slate-900 text-2xl tracking-tighter mb-2">{unit.name}</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium italic leading-relaxed line-clamp-2">
              "{unit.description}"
            </p>
            
            {/* Required: Credits Info (Added for motivation) [cite: 26] */}
            <div className="flex items-center gap-2 mb-8">
               <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                 Earn {unit.creditsPerDeal} Credits
               </span>
            </div>

            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] pt-4 border-t border-slate-50">
              View Portfolio <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BusinessDirectory;