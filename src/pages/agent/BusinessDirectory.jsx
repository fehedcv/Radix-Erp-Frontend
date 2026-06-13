import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  ShieldCheck,
  MapPin,
  ExternalLink
} from 'lucide-react';

import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const BusinessDirectory = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); 
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  const getFrappeImage = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    const baseUrl = import.meta.env.VITE_FRAPPE_URL.replace('/api', '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanPath}`;
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const { data, error } = await supabase
          .from('business_units')
          .select('id, business_name, description, location, logo_url')
          .eq('status', 'active');

        if (error) {
          console.error('Failed to load business units:', error);
          return;
        }

        // Transform data to UI format
        const mappedData = data.map(unit => ({
          id: unit.id,
          name: unit.business_name,
          description: unit.description,
          location: unit.location,
          logo_url: unit.logo_url
        }));

        setBusinessUnits(mappedData);
      } catch (err) {
        console.error('Failed to load business units:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] mt-2  lg:px-0">
        
        {/* Header Skeleton (Borderless) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-pulse ">
          <div className="space-y-3 w-full max-w-md">
            <div className={`h-10 w-64 rounded-md ${pulseClass}`} />
            <div className={`h-4 w-3/4 rounded-md ${pulseClass}`} />
          </div>
          <div className={`h-10 w-32 rounded-lg shrink-0 ${pulseClass}`} />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`rounded-2xl border h-[300px] flex flex-col justify-between animate-pulse ${surfaceClass}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div className={`h-14 w-14 rounded-xl ${pulseClass}`} />
                  <div className={`h-6 w-20 rounded-md ${pulseClass}`} />
                </div>
                <div className="space-y-3">
                  <div className={`h-5 w-3/4 rounded-md ${pulseClass}`} />
                  <div className={`h-3 w-1/3 rounded-md ${pulseClass}`} />
                  <div className={`h-3 w-full rounded-md mt-4 ${pulseClass}`} />
                  <div className={`h-3 w-4/5 rounded-md ${pulseClass}`} />
                </div>
              </div>
              <div className={`px-6 pb-6 flex gap-3`}>
                <div className={`h-11 flex-1 rounded-lg ${pulseClass}`} />
                <div className={`h-11 flex-1 rounded-lg ${pulseClass}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-[1400px] mx-auto space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2  px-0 lg:px-0 ${textPrimary}`}>
      
      {/* HEADER (Clean, Borderless Layout) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 ">
        <div className="space-y-1.5">
          <h1 className={`text-3xl md:text-4xl font-extrabold tracking-tight ${textPrimary}`}>
            Corporate Divisions
          </h1>
          <p className={`text-sm font-medium max-w-xl ${textSecondary}`}>
            Explore active execution divisions and route your client projects for fulfillment.
          </p>
        </div>

        <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border shrink-0 ${
          isLight ? 'bg-white border-[#E2E8F0]' : 'bg-[#222938] border-white/5'
        }`}>
          <Briefcase size={16} className={textSecondary} />
          <span className={`text-xs font-semibold ${textPrimary}`}>
            {businessUnits.length} Active Divisions
          </span>
        </div>
      </div>

      {/* DIRECTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessUnits.map((unit, index) => {
          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative z-0 h-full group"
            >
              <div 
                className={`rounded-2xl border flex flex-col justify-between h-full relative z-10 transition-all duration-300 ${
                  isLight 
                  ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:shadow-md hover:border-[#E2E8F0]' 
                  : 'bg-[#222938] border-white/5 hover:bg-[#2A3241] hover:border-[#81B398]/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
                }`}
              >
                {/* Content Area */}
                <div 
                  onClick={() => navigate(`/agent/units/${unit.id}`)}
                  className="p-6 flex-1 flex flex-col cursor-pointer"
                >
                  {/* Top: Logo & Badge */}
                  <div className="flex items-start justify-between mb-5">
                    {unit.logo_url ? (
                      <img
                        src={getFrappeImage(unit.logo_url)}
                        alt={`${unit.name} logo`}
                        className={`h-14 w-14 rounded-xl object-cover shrink-0 border ${
                          isLight ? 'border-[#E2E8F0] bg-white' : 'border-white/5 bg-[#131720]'
                        }`}
                      />
                    ) : (
                      <div className={`h-14 w-14 border flex items-center justify-center rounded-xl shrink-0 ${
                        isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/5 text-[#9CA3AF]'
                      }`}>
                        <Briefcase size={20} />
                      </div>
                    )}

                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#81B398] bg-[#81B398]/10 px-2.5 py-1 rounded-md border border-[#81B398]/20">
                      <ShieldCheck size={12} /> Active
                    </span>
                  </div>

                  {/* Body: Title, Location & Description */}
                  <div>
                    <h3 className={`font-bold text-xl tracking-tight transition-colors group-hover:text-[#81B398] ${textPrimary} truncate`}>
                      {unit.name}
                    </h3>
                    <div className={`flex items-center gap-1.5 mt-1 text-xs font-medium ${textSecondary}`}>
                      <MapPin size={12} className="text-[#81B398] shrink-0" /> 
                      <span className="truncate">{unit.location || 'Location not specified'}</span>
                    </div>
                    
                    <p className={`text-sm mt-4 line-clamp-2 leading-relaxed ${textSecondary}`}>
                      {unit.description || 'No description provided for this execution division.'}
                    </p>
                  </div>
                </div>

                {/* Bottom: Explicit User-Friendly Split Actions */}
                <div className="px-6 pb-6 pt-2">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => navigate(`/agent/units/${unit.id}`)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border transition-all duration-200 ${
                        isLight 
                        ? 'bg-[#FFFFFF] text-[#1A202C] border-[#E2E8F0] hover:bg-[#F4F5F7]' 
                        : 'bg-[#131720] text-[#F4F5F7] border-white/5 hover:bg-[#222938]'
                      }`}
                    >
                      <ExternalLink size={14} /> Details
                    </button>
                    
                    <button 
                      onClick={() => navigate(`/agent/units/${unit.id}`)}
                      className="flex-[1.5] py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 bg-[#81B398] text-[#FFFFFF] hover:bg-[#6FA085] transition-all duration-200 shadow-sm active:scale-95"
                    >
                      Route Project <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* Empty State */}
        {businessUnits.length === 0 && !loading && (
           <div className={`col-span-full py-20 flex flex-col items-center justify-center rounded-2xl border ${surfaceClass}`}>
              <Briefcase size={40} className={`mb-4 opacity-30 ${textSecondary}`} />
              <p className={`text-base font-semibold ${textPrimary}`}>No Divisions Found</p>
              <p className={`text-sm mt-1 ${textSecondary}`}>There are currently no active execution divisions available.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;