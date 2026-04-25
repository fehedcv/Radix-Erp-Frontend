import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Info
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// SKELETON COMPONENT (MATCHED LAYOUT)
// ==========================================
const DirectorySkeleton = ({ theme }) => {
  const bgColor = theme === 'light' ? 'bg-gray-200' : 'bg-white/5';
  const pulseClass = "animate-pulse";

  return (
    <div className="space-y-6 px-2">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <div className={`h-8 w-40 rounded-lg ${bgColor} ${pulseClass}`} />
          <div className={`h-3 w-32 rounded-lg ${bgColor} ${pulseClass}`} />
        </div>
        <div className={`h-8 w-20 rounded-full ${bgColor} ${pulseClass}`} />
      </div>

      {/* List Skeletons */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`rounded-[2rem] p-5 h-48 flex flex-col justify-between ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
            <div className="flex gap-5">
              <div className={`w-16 h-16 rounded-[1.25rem] ${bgColor} ${pulseClass}`} />
              <div className="flex-1 space-y-3 pt-1">
                <div className={`h-3 w-16 rounded-full ${bgColor} ${pulseClass}`} />
                <div className={`h-5 w-32 rounded-lg ${bgColor} ${pulseClass}`} />
                <div className={`h-3 w-full rounded-lg ${bgColor} ${pulseClass}`} />
              </div>
            </div>
            <div className={`pt-4 border-t ${theme === 'light' ? 'border-gray-100' : 'border-white/5'} flex justify-between items-center`}>
              <div className={`h-2 w-20 rounded-lg ${bgColor} ${pulseClass}`} />
              <div className={`w-8 h-8 rounded-full ${bgColor} ${pulseClass}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BusinessDirectoryApp = () => {
  // ==========================================
  // EXACT SAME LOGIC & STATE AS WEB VERSION
  // ==========================================
  const navigate = useNavigate();
  const { theme } = useTheme(); 
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  const getFrappeImage = (path) => {
    if (!path) return null;
    if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) {
      return path;
    }
    const baseUrl = import.meta.env.VITE_SUPABASE_STORAGE_PUBLIC_URL || '';
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanPath}`;
  };

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await frappeApi.get('/resource/Business Unit', {
          params: {
            fields: JSON.stringify(['name', 'business_name', 'description', 'location','email','logo']),
            filters: JSON.stringify([['status', '=', 'Active']]), 
          }
        });

        const normalized = (res.data.data || []).map(unit => ({
          id: unit.name,
          name: unit.business_name,
          description: unit.description || '',
          location: unit.location || '',
          logo:unit.logo || "",
          email: unit.email || ""
        }));
        setBusinessUnits(normalized);
      } catch (err) {
        console.error('Failed to load business units', err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Smooth skeleton transition
      }
    };

    fetchUnits();
  }, []);

  // --- LOADING STATE TRIGGER ---
  if (loading) return <DirectorySkeleton theme={theme} />;

  return (
    <div className={`space-y-6 font-['Plus_Jakarta_Sans',sans-serif] pb-16 ${theme === 'light' ? 'text-black' : 'text-white'}`}>
      
      {/* Header Section */}
      <div className="flex justify-between items-end px-2 ">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">Directory</h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
            Registered Businesses
          </p>
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-sm ${
          theme === 'light' ? 'bg-white text-black' : 'bg-[#18181B] text-white border border-white/5'
        }`}>
          <Info size={12} className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'} />
          <span className="text-[9px] font-black uppercase tracking-widest">
            {businessUnits.length} Units
          </span>
        </div>
      </div>

      {/* Vertical Bento List */}
      <div className="space-y-4 ">
        {businessUnits.map((unit, index) => {
          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/agent/units/${unit.id}`)}
              className={`rounded-[2rem] p-5 relative overflow-hidden shadow-sm active:scale-[0.98] transition-all cursor-pointer ${
                theme === 'light' 
                  ? 'bg-white' 
                  : 'bg-[#18181B] border border-white/5'
              }`}
            >
              <div className="flex items-start gap-5">
                {/* Logo Wrapper */}
                {unit.logo ? (
                  <img
                    src={getFrappeImage(unit.logo)}
                    alt={`${unit.name} logo`}
                    className={`w-16 h-16 rounded-[1.25rem] object-cover shrink-0 shadow-sm ${
                      theme === 'light' ? 'bg-[#F4F5F9]' : 'bg-white/5'
                    }`}
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shrink-0 shadow-inner ${
                    theme === 'light' ? 'bg-[#F4F5F9] text-gray-400' : 'bg-white/5 text-gray-500'
                  }`}>
                    <Briefcase size={24} />
                  </div>
                )}

                {/* Business Info */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      theme === 'light' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#4ADE80]/10 text-[#4ADE80]'
                    } flex items-center gap-1`}>
                      <ShieldCheck size={10} /> Verified
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-lg uppercase tracking-tight truncate">
                    {unit.name}
                  </h3>
                  
                  <p className={`text-[11px] leading-snug line-clamp-2 mt-1.5 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                    {unit.description || 'No description provided for this business unit.'}
                  </p>
                </div>
              </div>

              {/* Native-style Action Button Area */}
              <div className={`mt-5 pt-4 border-t flex items-center justify-between ${
                theme === 'light' ? 'border-gray-100' : 'border-white/5'
              }`}>
                <span className={`text-[9px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Explore Portfolio
                </span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
                }`}>
                  <ArrowRight size={14} strokeWidth={3} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
    </div>
  );
};

export default BusinessDirectoryApp;