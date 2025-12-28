import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Zap,
  Info,
  Plus
} from 'lucide-react';

import frappeApi from '../../api/frappeApi';

const BusinessDirectory = () => {
  const navigate = useNavigate();
  const [businessUnits, setBusinessUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1️⃣ FETCH BUSINESS UNITS (PATH A – DIRECT RESOURCE API)
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await frappeApi.get('/resource/Business Unit', {
          params: {
            fields: JSON.stringify([
              'name',
              'business_name',
              'description',
              'location'
            ])
          }
        });

        // Normalize data for React safety
        const normalized = (res.data.data || []).map(unit => ({
          id: unit.name,
          name: unit.business_name,
          description: unit.description || '',
          location: unit.location || ''
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
      <div className="text-center py-24 text-slate-400 font-black uppercase text-xs">
        Loading Business Units…
      </div>
    );
  }

  return (
    <div className="space-y-8 font-['Plus_Jakarta_Sans',sans-serif]">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Zap size={14} className="text-[#007ACC]" />
            <span className="text-[10px] font-bold text-[#007ACC] uppercase tracking-[0.2em]">
              Authorized Teams
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
            Team Directory
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1 max-w-xl">
            Select a business unit to submit or track referrals.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <Info size={14} className="text-slate-400" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
            Total Units: {businessUnits.length}
          </span>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessUnits.map((unit, index) => (
          <motion.div
            key={unit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => navigate(`/agent/units/${unit.id}`)}
            className="bg-white rounded-xl p-6 border border-slate-200 hover:border-[#007ACC] cursor-pointer shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-6">
                <div className="h-12 w-12 rounded-lg flex items-center justify-center bg-slate-50 text-slate-600 group-hover:bg-[#007ACC] group-hover:text-white transition-all">
                  <Briefcase size={22} />
                </div>

                <span className="flex items-center gap-1 text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-widest">
                  <ShieldCheck size={10} /> Verified
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Business Unit
                </p>
                <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight group-hover:text-[#007ACC]">
                  {unit.name}
                </h3>
                <p className="text-xs text-slate-500 italic line-clamp-2">
                  {unit.description || 'No description provided.'}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                View Portfolio
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 hover:bg-blue-50 hover:text-[#007ACC] transition-all">
                <ArrowRight size={14} />
              </div>
            </div>
          </motion.div>
        ))}

        {/* HELP CARD */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-blue-50/50 border border-dashed border-blue-200 rounded-xl p-6 flex flex-col justify-center items-center text-center space-y-4"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-blue-100 text-[#007ACC]">
            <Plus size={20} />
          </div>
          <h4 className="text-sm font-extrabold uppercase">
            Missing a Team?
          </h4>
          <p className="text-[10px] text-slate-500">
            Contact the administrator to add a new business unit.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default BusinessDirectory;
