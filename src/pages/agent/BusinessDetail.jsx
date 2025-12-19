import React from 'react';
import { ArrowLeft, MapPin, Package, ShieldCheck, Star, Phone } from 'lucide-react';

const BusinessDetail = ({ unit, openModal, onBack }) => {
  if (!unit) return null;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <button onClick={onBack} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-6 hover:text-indigo-600 transition-all">
        <ArrowLeft size={16} /> Back to Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Portfolio Gallery & Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <div className="h-20 w-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600">
                <Package size={40} />
              </div>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-4 py-2 rounded-2xl font-black text-[10px] uppercase">
                <Star size={14} fill="currentColor" /> Premium Unit
              </div>
            </div>
            
            <h2 className="text-4xl font-black tracking-tighter mb-4">{unit.name}</h2>
            <p className="text-slate-500 leading-relaxed text-lg mb-8 italic">"{unit.description}"</p>

            <div className="grid grid-cols-2 gap-4 border-t pt-8 border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><MapPin size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                  <p className="font-bold text-sm">Dubai, UAE</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><ShieldCheck size={20} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified by HQ</p>
                  <p className="font-bold text-sm text-emerald-600">Active Vendor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
            <h4 className="font-black text-xs uppercase tracking-widest mb-6">Our Services & Products</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unit.products.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl font-bold text-slate-700">
                  <div className="h-2 w-2 rounded-full bg-indigo-400"></div> {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Action Card */}
        <div className="space-y-6">
          <div className="bg-indigo-600 p-10 rounded-[3rem] shadow-xl text-white">
            <h4 className="font-black text-xl mb-4 leading-tight">Ready to refer a client?</h4>
            <p className="text-indigo-100 text-sm mb-8 font-medium">Earn up to 50 credits for every verified lead sent to {unit.name}.</p>
            <button 
              onClick={() => openModal(unit.name)}
              className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-50 transition-all active:scale-95"
            >
              Submit Lead Now
            </button>
          </div>
          
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Support Contact</p>
            <div className="flex items-center justify-center gap-2 text-indigo-600 font-bold">
              <Phone size={16} /> +971 000 0000
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;