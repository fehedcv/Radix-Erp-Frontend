import React from 'react';
import { User, Phone, ShieldCheck, TrendingUp, Star } from 'lucide-react';

const ProfilePage = () => {
  const agent = {
    name: "John Doe",
    phone: "+91 9876543210",
    status: "Active",
    successRate: 64,
    totalLeads: 50
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-2xl mx-auto">
        {/* Info Card */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm text-center mb-8">
          <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-400">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-black tracking-tight">{agent.name}</h2>
          <p className="text-slate-500 font-medium flex items-center justify-center gap-2 mt-1">
            <Phone size={14} /> {agent.phone}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={14} /> Account {agent.status}
          </div>
        </div>

        {/* Performance Section */}
        <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm">
          <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-8">Performance Score</h4>
          
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-4xl font-black text-indigo-600">{agent.successRate}%</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Lead Success Rate</p>
            </div>
            <Star className="text-amber-400" fill="currentColor" size={32} />
          </div>

          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all" style={{ width: `${agent.successRate}%` }}></div>
          </div>
          
          <p className="text-center text-[10px] text-slate-400 mt-6 font-bold uppercase tracking-tighter">
            Based on {agent.totalLeads} submitted leads
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;