import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; // Import Global Theme

const BusinessDirectory = () => {
  const navigate = useNavigate();
  const { theme } = useTheme(); // Access Theme
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
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader fullScreen={false} text="Loading Businesses..." />
      </div>
    );
  }

  return (
    <div className={`space-y-10 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-500 ${theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'}`}>
      
      {/* --- AMBIENT BACKGROUND BLOBS (Hidden in Light Mode) --- */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[0%] left-[10%] w-[400px] h-[400px] bg-lime-400/10 rounded-full blur-[120px] pointer-events-none -z-20" />
          <div className="fixed top-[30%] left-[40%] w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[140px] pointer-events-none -z-20" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-[#4ADE80]/10 rounded-full blur-[130px] pointer-events-none -z-20" />
        </>
      )}

      {/* HEADER */}
      <div className="relative z-0">
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 lg:p-10 rounded-xl border shadow-sm relative z-10 transition-all ${
          theme === 'light' ? 'bg-[#F1F5F9] border-slate-200' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
        }`}>
          <div className="space-y-2">
            <h2 className="text-3xl font-black tracking-tight uppercase">
              Registered Businesses
            </h2>
            <p className={`text-sm font-medium max-w-xl ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
              Select a business unit to submit or track referrals.
            </p>
          </div>

          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm ${
            theme === 'light' ? 'bg-slate-200/50 border-slate-300' : 'bg-white/5 border-white/5'
          }`}>
            <Info size={16} className={theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
              Total Units: {businessUnits.length}
            </span>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
        {businessUnits.map((unit, index) => {
          return (
            <motion.div
              key={unit.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative z-0 h-full group"
            >
              <div 
                onClick={() => navigate(`/agent/units/${unit.id}`)}
                className={`rounded-xl p-8 border cursor-pointer flex flex-col justify-between h-full relative z-10 transition-all duration-500 ${
                  theme === 'light' 
                  ? 'bg-[#F1F5F9] border-slate-200 hover:bg-slate-200/50 hover:border-slate-300 shadow-sm hover:shadow-md' 
                  : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:bg-white/[0.04] hover:border-white/20 hover:shadow-[0_16px_48px_rgba(0,0,0,0.5)]'
                } hover:-translate-y-2`}
              >
                <div>
                  <div className="flex items-start justify-between mb-8">
                    {unit.logo ? (
                      <img
                        src={getFrappeImage(unit.logo)}
                        alt={`${unit.name} logo`}
                        className={`h-20 w-20 rounded-xl object-cover shrink-0 shadow-sm border ${
                          theme === 'light' ? 'border-slate-300 bg-white' : 'border-white/10 bg-white/5 backdrop-blur-md'
                        }`}
                      />
                    ) : (
                      <div className={`h-20 w-20 border flex items-center justify-center rounded-xl shrink-0 shadow-sm ${
                        theme === 'light' ? 'bg-slate-200 border-slate-300 text-slate-400' : 'bg-white/5 border-white/10 text-[#94A3B8]'
                      }`}>
                        <Briefcase size={32} />
                      </div>
                    )}

                    <span className="flex items-center gap-1.5 text-[9px] font-black text-[#4ADE80] bg-[#4ADE80]/10 px-3 py-1.5 rounded-xl border border-[#4ADE80]/20 uppercase tracking-widest">
                      <ShieldCheck size={12} /> Verified
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>
                      Business Unit
                    </p>
                    <h3 className={`font-extrabold text-xl uppercase tracking-tight transition-colors group-hover:text-[#38BDF8] ${
                      theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'
                    }`}>
                      {unit.name}
                    </h3>
                    <p className={`text-sm italic line-clamp-3 leading-relaxed ${theme === 'light' ? 'text-slate-500' : 'text-[#94A3B8]'}`}>
                      {unit.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className={`mt-10 pt-6 border-t flex items-center justify-between ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'light' ? 'text-slate-400' : 'text-[#64748B]'}`}>
                    View Portfolio
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:bg-[#38BDF8] group-hover:text-[#020617] group-hover:scale-105 ${
                    theme === 'light' ? 'bg-slate-200 text-slate-400' : 'bg-white/5 text-[#64748B]'
                  }`}>
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BusinessDirectory;