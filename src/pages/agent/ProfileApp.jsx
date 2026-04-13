import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, Edit3, Camera, Save, X, 
  CheckCircle2, Settings, Loader2 
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// SKELETON COMPONENT (MATCHED LAYOUT)
// ==========================================
const ProfileSkeleton = ({ theme }) => {
  const bgColor = theme === 'light' ? 'bg-gray-200' : 'bg-white/5';
  const pulseClass = "animate-pulse";

  return (
    <div className="space-y-6 px-2 ">
      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-8">
        <div className="space-y-2">
          <div className={`h-8 w-32 rounded-lg ${bgColor} ${pulseClass}`} />
          <div className={`h-3 w-24 rounded-lg ${bgColor} ${pulseClass}`} />
        </div>
        <div className={`h-10 w-20 rounded-full ${bgColor} ${pulseClass}`} />
      </div>

      {/* Hero Card Skeleton */}
      <div className={`rounded-[2rem] p-8 flex flex-col items-center space-y-4 ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
        <div className={`w-32 h-32 rounded-[2.5rem] ${bgColor} ${pulseClass}`} />
        <div className={`h-6 w-40 rounded-lg ${bgColor} ${pulseClass}`} />
        <div className={`h-8 w-32 rounded-full ${bgColor} ${pulseClass}`} />
      </div>

      {/* Stats Card Skeleton */}
      <div className={`rounded-[2rem] p-6 flex justify-between items-center ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
        <div className="space-y-2">
          <div className={`h-3 w-20 rounded-lg ${bgColor} ${pulseClass}`} />
          <div className={`h-8 w-28 rounded-lg ${bgColor} ${pulseClass}`} />
        </div>
        <div className={`w-12 h-12 rounded-[1.25rem] ${bgColor} ${pulseClass}`} />
      </div>

      {/* Data Card Skeleton */}
      <div className={`rounded-[2rem] p-6 space-y-6 ${theme === 'light' ? 'bg-white' : 'bg-[#18181B]'}`}>
        <div className={`h-4 w-full border-b pb-4 ${theme === 'light' ? 'border-gray-50' : 'border-white/5'}`}>
          <div className={`h-3 w-24 rounded-lg ${bgColor} ${pulseClass}`} />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className={`h-2 w-16 rounded-lg ${bgColor} ${pulseClass} ml-1`} />
            <div className={`h-14 w-full rounded-[1.25rem] ${bgColor} ${pulseClass}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

const ProfilePageApp = () => {
  const { theme } = useTheme(); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    status: "Active",
    totalLeads: 0,
    avatar: null,
    avatarFile: null 
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profileRes = await frappeApi.get('/method/business_chain.api.agent.get_agent_profile');
        const agentData = profileRes.data.message;

        const dashboardRes = await frappeApi.get('/method/business_chain.api.agent.get_agent_dashboard_data');
        const dashboardData = dashboardRes.data.message;

        setProfile(prev => ({
          ...prev,
          name: agentData.fullName,
          phone: agentData.phone,
          email: agentData.email,
          avatar: agentData.profilePicture,
          totalLeads: dashboardData.recentActivity.length,
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setLoading(false), 800); // Slight delay for smooth skeleton transition
      }
    };
    fetchData();
  }, []);

  const handleImageClick = () => { if (isEditing) fileInputRef.current.click(); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({
        ...prev,
        avatar: URL.createObjectURL(file),
        avatarFile: file
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await frappeApi.post('/method/business_chain.api.agent.update_agent_profile', {
        full_name: profile.name,
        phone: profile.phone
      });

      if (profile.avatarFile) {
        const imgData = new FormData();
        imgData.append("profile_picture", profile.avatarFile);
        await frappeApi.post('/method/business_chain.api.agent.upload_profile_picture', imgData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton theme={theme} />;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className={`space-y-6 font-['Plus_Jakarta_Sans',sans-serif] pb-16 ${theme === 'light' ? 'text-black' : 'text-white'}`}
    >
      
      {/* Header Section */}
      <div className="flex justify-between items-end px-2 ">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">Profile</h1>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
            Partner Identity
          </p>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-sm text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
              theme === 'light' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            <Edit3 size={12} /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setIsEditing(false)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                theme === 'light' ? 'bg-rose-500/10 text-rose-500' : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              <X size={16} strokeWidth={3} />
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                theme === 'light' ? 'bg-[#38BDF8] text-white shadow-lg' : 'bg-[#38BDF8] text-black shadow-lg'
              }`}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            </button>
          </div>
        )}
      </div>

      <div className=" space-y-4">
        
        {/* HERO CARD */}
        <div className={`rounded-[2rem] p-8 text-center relative overflow-hidden shadow-sm flex flex-col items-center ${
          theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
        }`}>
          <div className="relative w-32 h-32 mb-5">
            <div 
              onClick={handleImageClick}
              className={`w-full h-full rounded-[2.5rem] overflow-hidden border-2 flex items-center justify-center transition-all ${
                isEditing 
                ? 'border-[#38BDF8] border-dashed bg-[#38BDF8]/10' 
                : (theme === 'light' ? 'bg-[#F4F5F9] border-white' : 'bg-white/5 border-white/5')
              }`}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className={theme === 'light' ? 'text-gray-300' : 'text-gray-600'} />
              )}
              
              {isEditing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white backdrop-blur-[2px]">
                  <Camera size={24} />
                  <span className="text-[8px] font-black uppercase mt-1">Change</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>

          <h3 className="text-xl font-black uppercase tracking-tight">{profile.name}</h3>
          
          <div className="mt-4 flex justify-center">
            <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[8px] font-black uppercase tracking-widest ${
              theme === 'light' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#4ADE80]/10 text-[#4ADE80]'
            }`}>
              <CheckCircle2 size={12} /> {profile.status} Partner
            </span>
          </div>
        </div>

        {/* STATS CARD */}
        <div className={`rounded-[2rem] p-6 shadow-sm flex items-center justify-between ${
          theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
        }`}>
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500">Activity Level</h4>
            <p className="text-2xl font-black tracking-tighter mt-1">
              {profile.totalLeads} <span className="text-[10px] text-[#38BDF8]">Submissions</span>
            </p>
          </div>
          <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center ${
            theme === 'light' ? 'bg-[#F4F5F9] text-[#38BDF8]' : 'bg-white/5 text-[#38BDF8]'
          }`}>
            <Settings size={20} />
          </div>
        </div>

        {/* FIELDS CARD */}
        <div className={`rounded-[2rem] p-6 shadow-sm space-y-6 ${
          theme === 'light' ? 'bg-white' : 'bg-[#18181B] border border-white/5'
        }`}>
          <h4 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b pb-4 ${
            theme === 'light' ? 'border-gray-50 text-gray-400' : 'border-white/5 text-gray-500'
          }`}>
            <User size={14} className="text-[#38BDF8]" /> Personal Data
          </h4>

          <div className="space-y-5">
            <ProfileField 
              theme={theme} 
              isEditing={isEditing} 
              label="Legal Name" 
              value={profile.name} 
              onChange={(v) => setProfile({...profile, name: v})} 
              icon={<User size={16} />} 
            />
            <ProfileField 
              theme={theme} 
              isEditing={isEditing} 
              label="Contact Number" 
              value={profile.phone} 
              onChange={(v) => setProfile({...profile, phone: v})} 
              icon={<Phone size={16} />} 
            />
            <ProfileField 
              theme={theme} 
              isEditing={false} 
              label="Email Address (Locked)" 
              value={profile.email} 
              onChange={() => {}} 
              icon={<Mail size={16} />} 
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProfileField = ({ theme, isEditing, label, value, onChange, icon }) => (
  <div className="space-y-2">
    <label className={`text-[8px] font-black uppercase tracking-widest ml-1 ${
      theme === 'light' ? 'text-gray-400' : 'text-gray-500'
    }`}>{label}</label>
    
    {isEditing && label !== "Email Address (Locked)" ? (
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
          theme === 'light' ? 'text-gray-300' : 'text-gray-600'
        }`}>{icon}</div>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className={`w-full pl-11 pr-4 py-4 rounded-[1.25rem] text-xs font-bold outline-none transition-all shadow-inner ${
            theme === 'light' ? 'bg-[#F4F5F9] focus:ring-1 focus:ring-black' : 'bg-[#09090B] text-white focus:ring-1 focus:ring-white'
          }`} 
        />
      </div>
    ) : (
      <div className={`flex items-center gap-3 p-4 rounded-[1.25rem] border transition-all ${
        theme === 'light' ? 'bg-[#F4F5F9] border-transparent' : 'bg-white/5 border-transparent'
      }`}>
        <div className={`shrink-0 ${theme === 'light' ? 'text-gray-300' : 'text-gray-600'}`}>{icon}</div>
        <span className="text-[11px] font-bold tracking-tight uppercase truncate">{value}</span>
      </div>
    )}
  </div>
);

export default ProfilePageApp;