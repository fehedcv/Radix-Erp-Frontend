import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // 1. useNavigate ഇമ്പോർട്ട് ചെയ്തു
import { ArrowRight, Briefcase } from 'lucide-react';
import { businessUnits } from '../../data/businessData.jsx'; 

const BusinessDirectory = () => {
  const navigate = useNavigate(); // 2. നാവിഗേഷൻ ഫങ്ക്ഷൻ ഇനിഷ്യലൈസ് ചെയ്തു

  return (
    <div className="space-y-10">
      {/* HEADER SECTION */}
      <div className="border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">Units Directory</h2>
        <p className="text-sm font-medium text-slate-500 mt-2 italic">Explore & Refer Leads to Network Infrastructure Nodes</p>
      </div>

      {/* UNITS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {businessUnits.map((unit, index) => (
          <motion.div 
            key={unit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ delay: index * 0.08 }}
            // 3. ക്ലിക്ക് ചെയ്യുമ്പോൾ യൂണിറ്റ് ID സഹിതം സബ്-റൂട്ടിലേക്ക് പോകുന്നു
            onClick={() => navigate(`/agent/units/${unit.id}`)} 
            className="bg-white rounded-none p-8 md:p-10 border border-slate-200 hover:border-indigo-600 transition-all group cursor-pointer shadow-sm relative overflow-hidden" 
          >
            {/* CARD TOP: Identity */}
            <div className="flex items-start justify-between mb-8">
              <div className={`h-16 w-16 ${unit.bg || 'bg-slate-900'} ${unit.color || 'text-white'} rounded-none flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-600 group-hover:text-white shadow-sm`}>
                {unit.icon ? React.cloneElement(unit.icon, { size: 28 }) : <Briefcase size={28} />}
              </div>
              
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Asset Node</p>
                <span className="text-[9px] font-black text-indigo-600 border border-indigo-100 px-2 py-1 uppercase">Verified</span>
              </div>
            </div>

            {/* UNIT DETAILS */}
            <div className="space-y-3">
              <h3 className="font-bold text-slate-900 text-2xl tracking-tighter uppercase">{unit.name}</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium italic leading-relaxed line-clamp-2">
                "{unit.description || 'Access professional business services through this dedicated unit.'}"
              </p>
            </div>
            
            {/* INTERACTIVE FOOTER */}
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