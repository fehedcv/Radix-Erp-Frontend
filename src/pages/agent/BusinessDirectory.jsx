import React from 'react';
import { Building2, Briefcase, ArrowRight } from 'lucide-react';

const BusinessDirectory = ({ onViewDetails }) => {
  const units = [
    {
      id: 1,
      name: "Interior Design Unit",
      description: "Premium interior solutions for homes and luxury villas.",
      products: ["Modular Kitchen", "Living Room Decor", "Lighting", "Flooring"],
      icon: <Building2 />,
    },
    {
      id: 2,
      name: "Manpower Solutions",
      description: "Skilled labor and industrial staff supply services.",
      products: ["Construction Labor", "Safety Staff", "Security", "Cleaning"],
      icon: <Briefcase />,
    }
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black tracking-tight uppercase">Units Directory</h2>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Select a unit to view portfolio & refer leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 hover:shadow-xl transition-all group cursor-pointer" onClick={() => onViewDetails(unit)}>
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 mb-6">
              {unit.icon}
            </div>
            <h3 className="font-black text-slate-900 text-2xl tracking-tighter mb-2">{unit.name}</h3>
            <p className="text-sm text-slate-500 mb-8 font-medium italic">"{unit.description}"</p>
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
              View Portfolio <ArrowRight size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BusinessDirectory;