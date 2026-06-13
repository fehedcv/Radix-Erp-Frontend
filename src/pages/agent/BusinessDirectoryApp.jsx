import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Info
} from 'lucide-react';

import { supabase } from '../../supabase/supabaseClient'; 
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// 1:1 STRUCTURAL SKELETON (BENTO STYLE)
// ==========================================
const DirectorySkeleton = ({ theme }) => {
  const isLight = theme === 'light';
  const pulseColor = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';
  const cardBg = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10';

  return (
    <div className="space-y-4 pb-24">
      {/* Separator to match the actual layout */}
      <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`} /> 

      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div className="space-y-2">
          <div className={`h-8 w-40 rounded-xl ${pulseColor} animate-pulse`} />
          <div className={`h-3 w-32 rounded-md ${pulseColor} animate-pulse`} />
        </div>
        <div className={`h-8 w-24 rounded-lg ${pulseColor} animate-pulse`} />
      </div>

      {/* List Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-2xl p-5 border flex flex-col justify-between animate-pulse ${cardBg}`}>
            <div className="flex gap-4">
              <div className={`w-16 h-16 rounded-xl shrink-0 ${pulseColor}`} />
              <div className="flex-1 space-y-3 pt-1">
                <div className={`h-4 w-20 rounded-md ${pulseColor}`} />
                <div className={`h-6 w-48 rounded-lg ${pulseColor}`} />
                <div className={`h-3 w-full rounded-md ${pulseColor}`} />
              </div>
            </div>
            <div className={`mt-5 pt-4 border-t flex justify-between items-center ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
              <div className={`h-3 w-24 rounded-md ${pulseColor}`} />
              <div className={`w-8 h-8 rounded-lg ${pulseColor}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const BusinessDirectoryApp = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); 
  const isLight = theme === 'light';
  
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(true);

        const { data, error } = await supabase
          .from('business_units')
          .select('id, business_name, description, location, logo_url')
          .eq('status', 'active');

        if (error) {
          console.error('Failed to load business units:', error);
          return;
        }

        // Transform data to match UI expectations
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
        setTimeout(() => setLoading(false), 500); 
      }
    };

    fetchUnits();
  }, []);

  // --- LOADING STATE TRIGGER ---
  if (loading) return <DirectorySkeleton theme={theme} />;

  return (
    <div className="space-y-5 pb-16">
      
      {/* PROFESSIONAL SEPARATOR */}
      <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>
        {/* Header Section */}
        <div className="flex justify-between items-end px-2">
          <div>
            <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
          Businesses
            </h1>
            <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
              Corporate Division
            </p>
          </div>
          
          {/* Neutral/Info Badge (Muted Indigo) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#48477A]/10 text-[#48477A] border border-[#48477A]/20">
            <Info size={14} strokeWidth={2.5} />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {businessUnits.length} Active Division 
            </span>
          </div>
        </div>
      </div>

      {/* Vertical Bento List */}
      <div className="space-y-4">
        {businessUnits.map((unit, index) => {
          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/agent/units/${unit.id}`)}
              className={`rounded-2xl p-5 relative overflow-hidden border transition-all duration-200 active:scale-95 cursor-pointer ${
                isLight 
                  ? 'bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#81B398]' 
                  : 'bg-[#222938] border-white/10 hover:border-[#81B398]'
              }`}
            >
              <div className="flex items-start gap-4">
                
                {/* Logo Wrapper */}
                {unit.logo_url ? (
                  <img
                    src={getFrappeImage(unit.logo_url)}
                    alt={`${unit.name} logo`}
                    className={`w-16 h-16 rounded-xl object-cover shrink-0 border ${
                      isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
                    }`}
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 border ${
                    isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#718096]' : 'bg-[#131720] border-white/10 text-[#9CA3AF]'
                  }`}>
                    <Briefcase size={24} />
                  </div>
                )}

                {/* Business Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center mb-1.5">
                    {/* Success/Verified Badge */}
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
                      <ShieldCheck size={10} strokeWidth={3} /> Verified
                    </span>
                  </div>
                  
                  <h3 className={`font-bold text-lg tracking-tight truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                    {unit.name}
                  </h3>
                  
                  <p className={`text-sm font-medium line-clamp-2 mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                    {unit.description || 'No description provided for this business unit.'}
                  </p>
                </div>
              </div>

              {/* Bento Footer Action Area */}
              <div className={`mt-5 pt-4 border-t flex items-center justify-between ${
                isLight ? 'border-[#E2E8F0]' : 'border-white/10'
              }`}>
                <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                  View Details
                </span>
                
                {/* Clickable Arrow Indicator */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${
                  isLight 
                    ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C]' 
                    : 'bg-[#131720] border-white/10 text-[#F4F5F7]'
                }`}>
                  <ArrowRight size={14} strokeWidth={2.5} />
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {/* Empty State Fallback */}
        {businessUnits.length === 0 && !loading && (
           <div className={`col-span-full py-20 flex flex-col items-center justify-center text-center rounded-2xl border ${isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'}`}>
              <Briefcase size={40} className={`mb-4 opacity-30 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`} />
              <p className={`text-base font-semibold ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>No Businesses Found</p>
              <p className={`text-sm mt-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>There are currently no active business units available.</p>
           </div>
        )}
      </div>
      
    </div>
  );
};

export default BusinessDirectoryApp;