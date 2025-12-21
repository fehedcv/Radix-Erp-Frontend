import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, ShieldCheck, Star, 
  Edit3, Camera, Save, X, CheckCircle2, Briefcase
} from 'lucide-react';

const ProfilePage = () => {
  // 1. STATE MANAGEMENT (Logic Preserved)
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@vynx.com",
    status: "Active",
    successRate: 64,
    totalLeads: 50,
    avatar: null 
  });

  const fileInputRef = useRef(null);

  // 2. HANDLERS (Logic Preserved)
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
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6 pb-20"
    >
      
      {/* --- PROFILE HEADER CARD --- */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm relative overflow-hidden">
        
        {/* Action Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identity Management</span>
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-600 px-4 py-2 rounded-none text-xs font-bold transition-all uppercase tracking-widest text-slate-600"
            >
              <Edit3 size={14} /> Edit Identity
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 bg-white border border-slate-200 text-red-600 hover:bg-red-50 rounded-none transition-all"
              >
                <X size={18} />
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-none text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
              >
                <Save size={14} /> Commit Changes
              </button>
            </div>
          )}
        </div>

        <div className="p-8 md:p-12">
          {/* PHOTO UPLOAD SECTION */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div 
              onClick={handleImageClick}
              className={`w-full h-full rounded-none overflow-hidden border-2 border-slate-100 flex items-center justify-center transition-all ${
                isEditing ? 'cursor-pointer border-indigo-600 border-dashed bg-indigo-50/30' : 'bg-slate-50'
              }`}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-200" />
              )}
              
              {isEditing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-600/10 text-indigo-600">
                  <Camera size={20} />
                  <span className="text-[8px] font-bold uppercase mt-1">Upload</span>
                </div>
              )}
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          {/* EDITABLE FIELDS */}
          <div className="space-y-6">
            {isEditing ? (
              <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Full Registry Name</label>
                  <input 
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-600 rounded-none outline-none font-bold text-sm text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Communication Line</label>
                  <input 
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-600 rounded-none outline-none font-bold text-sm text-center"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Access Email</label>
                  <input 
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-indigo-600 rounded-none outline-none font-bold text-sm text-center"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 uppercase">{profile.name}</h2>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-500 font-semibold text-sm">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-indigo-600" /> {profile.phone}
                  </div>
                  <div className="hidden sm:block w-1.5 h-1.5 bg-slate-200 rounded-none" />
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-indigo-600" /> {profile.email}
                  </div>
                </div>
                <div className="pt-4">
                  <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 border border-emerald-100 rounded-none text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 size={12} /> Account {profile.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- PERFORMANCE SECTION --- */}
      <div className="bg-white border border-slate-200 rounded-none shadow-sm p-8 md:p-10">
        <h4 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-8 border-b border-slate-50 pb-4">Performance Analytics</h4>
        
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <p className="text-5xl font-bold text-indigo-600 tracking-tighter">{profile.successRate}%</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion Efficiency</p>
          </div>
          <div className="p-4 bg-slate-900 text-white rounded-none">
            <Star size={24} fill="currentColor" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-none overflow-hidden mb-10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${profile.successRate}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="bg-indigo-600 h-full"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-8">
           <div className="space-y-1">
             <p className="text-2xl font-bold text-slate-900">{profile.totalLeads}</p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submissions</p>
           </div>
           <div className="space-y-1 border-l border-slate-100 pl-8">
             <p className="text-2xl font-bold text-emerald-600">
               {Math.round(profile.totalLeads * (profile.successRate/100))}
             </p>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Leads</p>
           </div>
        </div>
      </div>

      <div className="pt-6 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 text-slate-200">
           <div className="h-[1px] w-12 bg-slate-100" />
           <ShieldCheck size={20} />
           <div className="h-[1px] w-12 bg-slate-100" />
        </div>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.4em]">
          Secure Business Infrastructure
        </p>
      </div>
    </motion.div>
  );
};

export default ProfilePage;