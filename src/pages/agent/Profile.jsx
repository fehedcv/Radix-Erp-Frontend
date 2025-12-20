import React, { useState, useRef } from 'react';
import { 
  User, Phone, Mail, ShieldCheck, TrendingUp, Star, 
  Edit3, Camera, Save, X, CheckCircle2 
} from 'lucide-react';

const ProfilePage = () => {
  // 1. STATE MANAGEMENT
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@vynx.com", // പുതുതായി ചേർത്തത്
    status: "Active",
    successRate: 64,
    totalLeads: 50,
    avatar: null 
  });

  const fileInputRef = useRef(null);

  // 2. HANDLERS
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
    // API Call logic ഇവിടെ വരും
    setIsEditing(false);
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto pb-24 md:pb-10 px-4 md:px-0">
      
      {/* --- PROFILE HEADER CARD --- */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-sm mb-6 md:mb-8 relative overflow-hidden transition-all">
        
        {/* Edit/Action Buttons */}
        <div className="flex justify-end mb-6 md:absolute md:top-8 md:right-8 md:mb-0">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-indigo-600 hover:text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
            >
              <Edit3 size={14} /> <span className="hidden sm:inline">Edit Profile</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 md:p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
              >
                <Save size={14} /> Save
              </button>
            </div>
          )}
        </div>

        {/* PHOTO UPLOAD SECTION */}
        <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto mb-6 md:mb-8 group">
          <div 
            onClick={handleImageClick}
            className={`w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl flex items-center justify-center transition-all ${
              isEditing ? 'cursor-pointer ring-4 ring-indigo-50 group-hover:opacity-80' : 'bg-slate-50'
            }`}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-slate-300 md:size-12" />
            )}
            
            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={24} />
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
        <div className="text-center space-y-3 md:space-y-4">
          {isEditing ? (
            <div className="space-y-3 max-w-sm mx-auto">
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Full Name</label>
                <input 
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-4 py-2.5 md:px-6 md:py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl md:rounded-2xl outline-none text-center font-bold text-sm transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Mobile</label>
                <input 
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-2.5 md:px-6 md:py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl md:rounded-2xl outline-none text-center font-bold text-sm transition-all"
                />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Email Address</label>
                <input 
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-2.5 md:px-6 md:py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-600 rounded-xl md:rounded-2xl outline-none text-center font-bold text-sm transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">{profile.name}</h2>
              <div className="flex flex-col sm:flex-row sm:gap-4 mt-2 text-slate-500 text-xs md:text-sm font-medium">
                <p className="flex items-center justify-center gap-2">
                  <Phone size={14} className="text-indigo-600" /> {profile.phone}
                </p>
                <p className="flex items-center justify-center gap-2 mt-1 sm:mt-0">
                  <Mail size={14} className="text-indigo-600" /> {profile.email}
                </p>
              </div>
            </div>
          )}

          <div className="pt-2 md:pt-4">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-sm">
              <CheckCircle2 size={14} /> Account {profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* --- PERFORMANCE SECTION --- */}
      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden group">
        <h4 className="font-black text-slate-400 uppercase tracking-widest text-[9px] md:text-[10px] mb-6 md:mb-8">Performance Analytics</h4>
        
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-4xl md:text-5xl font-black text-indigo-600 leading-none">{profile.successRate}%</p>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Conversion Rate</p>
          </div>
          <div className="p-3 md:p-4 bg-amber-50 rounded-xl md:rounded-2xl text-amber-500 transition-transform group-hover:rotate-12">
            <Star size={28} md:size={32} fill="currentColor" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 md:h-3 rounded-full overflow-hidden mb-6">
          <div 
            className="bg-indigo-600 h-full transition-all duration-1000" 
            style={{ width: `${profile.successRate}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6 md:pt-8">
           <div className="text-center">
             <p className="text-lg md:text-xl font-black text-slate-900">{profile.totalLeads}</p>
             <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Submitted</p>
           </div>
           <div className="text-center border-l border-slate-50">
             <p className="text-lg md:text-xl font-black text-indigo-600">
               {Math.round(profile.totalLeads * (profile.successRate/100))}
             </p>
             <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Verified</p>
           </div>
        </div>
      </div>

      <p className="text-center text-[8px] md:text-[9px] text-slate-300 mt-8 md:mt-10 font-bold uppercase tracking-[0.2em]">
        Vynx Webworks © 2025
      </p>
    </div>
  );
};

export default ProfilePage;