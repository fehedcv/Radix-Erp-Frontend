import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, ShieldCheck, Star, 
  Edit3, Camera, Save, X, CheckCircle2, Briefcase,
  Activity, Settings, FileText, ExternalLink, Layers, 
  Info, Target, Zap, BarChart2
} from 'lucide-react';

const ProfilePage = () => {
  // --- 1. STATE MANAGEMENT (Logic Preserved) ---
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@radix.com",
    status: "Active",
    successRate: 64,
    totalLeads: 50,
    avatar: null 
  });

  const fileInputRef = useRef(null);

  // --- 2. HANDLERS (Logic Preserved) ---
  const handleImageClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, avatar: URL.createObjectURL(file) });
    }
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto space-y-6 pb-24 font-['Plus_Jakarta_Sans',sans-serif]"
    >
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">My Profile</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Verified Partner Management System</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-[#007ACC] px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest text-slate-600 shadow-sm"
            >
              <Edit3 size={14} className="text-[#007ACC]" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2.5 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-xl transition-all shadow-sm"
              >
                <X size={18} />
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-[#007ACC] text-white px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:bg-[#005fb8] transition-all"
              >
                <Save size={14} /> Commit Changes
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 2. LEFT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CORE IDENTITY CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <div 
                  onClick={handleImageClick}
                  className={`w-full h-full rounded-3xl overflow-hidden border-2 border-slate-100 flex items-center justify-center transition-all ${
                    isEditing ? 'cursor-pointer border-[#007ACC] border-dashed bg-blue-50/50' : 'bg-slate-50'
                  }`}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={54} className="text-slate-200" />
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#007ACC]/5 text-[#007ACC] backdrop-blur-[1px]">
                      <Camera size={24} />
                      <span className="text-[8px] font-black uppercase mt-1">Change</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{profile.name}</h3>
              <p className="text-[10px] font-bold text-[#007ACC] uppercase tracking-[0.2em] mt-1">Platinum Partner ID: PX-928</p>
              
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  <CheckCircle2 size={12} /> {profile.status} Registry
                </span>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <p className="text-xl font-black text-slate-900">{profile.totalLeads}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Leads Sent</p>
                 </div>
                 <div className="text-center border-l border-slate-100">
                    <p className="text-xl font-black text-[#007ACC]">{profile.successRate}%</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                 </div>
              </div>
            </div>
          </div>

          {/* SYSTEM PROTOCOLS CARD */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <Info size={18} className="text-[#007ACC]" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Partner Protocols</h4>
             </div>
             <div className="space-y-4">
                <StaticListItem icon={<CheckCircle2 size={14} />} text="Identity verification completed." />
                <StaticListItem icon={<CheckCircle2 size={14} />} text="Referral payout lines enabled." />
                <StaticListItem icon={<CheckCircle2 size={14} />} text="Data transmission encrypted." />
                <StaticListItem icon={<CheckCircle2 size={14} />} text="Multi-node access authorized." />
             </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT AREA */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ACCOUNT DATA FORM */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8 md:p-10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2 border-b border-slate-50 pb-4">
              <Settings size={14} className="text-[#007ACC]" /> Core Registry Data
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ProfileField isEditing={isEditing} label="Full Legal Name" value={profile.name} onChange={(v) => setProfile({...profile, name: v})} icon={<User size={16} />} />
              <ProfileField isEditing={isEditing} label="Direct Contact" value={profile.phone} onChange={(v) => setProfile({...profile, phone: v})} icon={<Phone size={16} />} />
              <div className="md:col-span-2">
                <ProfileField isEditing={isEditing} label="Primary Network Email" value={profile.email} onChange={(v) => setProfile({...profile, email: v})} icon={<Mail size={16} />} />
              </div>
            </div>
          </div>

          {/* DENSE GRID: PERFORMANCE & EXPERTISE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Efficiency Dashboard */}
             <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity size={16} className="text-[#007ACC]" /> Conversion Score
                   </h4>
                   <Zap size={14} className="text-amber-400 fill-amber-400" />
                </div>
                <div className="flex items-end justify-between mb-6">
                   <div>
                      <p className="text-5xl font-black text-slate-900 tracking-tighter">{profile.successRate}%</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Network Benchmark</p>
                   </div>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-100">
                   <motion.div initial={{ width: 0 }} animate={{ width: `${profile.successRate}%` }} transition={{ duration: 1.2 }} className="bg-[#007ACC] h-full rounded-full shadow-[0_0_10px_rgba(0,122,204,0.2)]" />
                </div>
             </div>

             {/* Industry Expertise */}
             <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                   <Layers size={16} className="text-[#007ACC]" />
                   <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">Target Expertise</h4>
                </div>
                <div className="flex flex-wrap gap-2.5">
                   <ExpertiseBadge text="Infrastructure" />
                   <ExpertiseBadge text="Legal Tech" />
                   <ExpertiseBadge text="Capital" />
                   <ExpertiseBadge text="Industrial" />
                </div>
             </div>
          </div>

          {/* STRATEGIC GOALS (NON-FUNCTIONAL CONTENT) */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-8">
             <div className="flex items-center gap-3 mb-8">
                <Target size={18} className="text-[#007ACC]" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Quarterly Objectives</h4>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <GoalTracker label="Lead Volume" progress={80} color="bg-blue-500" />
                <GoalTracker label="Verification Speed" progress={45} color="bg-emerald-500" />
                <GoalTracker label="Network Growth" progress={65} color="bg-indigo-500" />
             </div>
          </div>

          {/* NETWORK ASSETS (NON-FUNCTIONAL CONTENT) */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-50 bg-slate-50/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <BarChart2 size={16} className="text-[#007ACC]" />
                   <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Identity Documents</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Records: 03</span>
             </div>
             <div className="divide-y divide-slate-50">
                <StaticDocLink text="Partner Authorization Letter" date="OCT 12, 2025" />
                <StaticDocLink text="Tax Compliance Certificate" date="NOV 05, 2025" />
                <StaticDocLink text="Network Terms of Service" date="DEC 20, 2025" />
             </div>
          </div>
        </div>
      </div>

      <div className="pt-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-slate-200">
           <div className="h-px w-16 bg-slate-100" />
           <ShieldCheck size={24} className="text-slate-300" />
           <div className="h-px w-16 bg-slate-100" />
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
          Secured Business Infrastructure • Radix Enterprise Terminal v1.02
        </p>
      </div>
    </motion.div>
  );
};

// --- LIGHT THEME COMPONENT HELPERS ---

const ProfileField = ({ isEditing, label, value, onChange, icon }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">{label}</label>
    {isEditing ? (
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#007ACC]">{icon}</div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full pl-11 pr-5 py-4 bg-slate-50 border border-slate-200 focus:border-[#007ACC] rounded-2xl outline-none font-bold text-xs transition-all" />
      </div>
    ) : (
      <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
        <div className="text-[#007ACC] opacity-70">{icon}</div>
        <span className="text-xs font-extrabold text-slate-700 uppercase tracking-tight">{value}</span>
      </div>
    )}
  </div>
);

const ExpertiseBadge = ({ text }) => (
  <span className="px-4 py-2 bg-blue-50 text-[#007ACC] text-[10px] font-black uppercase tracking-widest rounded-xl border border-blue-100 shadow-sm">
    {text}
  </span>
);

const StaticListItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
    <div className="text-[#007ACC]">{icon}</div>
    <span>{text}</span>
  </div>
);

const GoalTracker = ({ label, progress, color }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
       <span className="text-[9px] font-black text-slate-900">{progress}%</span>
    </div>
    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
       <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`${color} h-full rounded-full`} />
    </div>
  </div>
);

const StaticDocLink = ({ text, date }) => (
  <div className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-default group">
    <div className="flex items-center gap-4">
      <div className="p-2 bg-slate-50 rounded-lg text-slate-300 group-hover:text-[#007ACC] transition-colors">
        <FileText size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{text}</p>
        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">{date}</p>
      </div>
    </div>
    <ExternalLink size={14} className="text-slate-200 group-hover:text-[#007ACC] transition-colors" />
  </div>
);

export default ProfilePage;