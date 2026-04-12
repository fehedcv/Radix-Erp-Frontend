import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, Edit3, Camera, Save, X, 
  CheckCircle2, Settings, Loader2 
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader';
import { useTheme } from '../../context/ThemeContext'; // Import Global Theme

const ProfilePage = () => {
  const { theme } = useTheme(); // Access Theme
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@radix.com",
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
        setLoading(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
        <Loader fullScreen={false} text="Loading Profile..." />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[1400px] mx-auto space-y-8 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-500 ${theme === 'light' ? 'text-slate-900' : 'text-[#E2E8F0]'}`}
    >
      {/* AMBIENT BLOBS - Dark Mode Only */}
      {theme === 'dark' && (
        <>
          <div className="fixed top-[0%] left-[10%] w-[400px] h-[400px] bg-lime-400/10 rounded-full blur-[120px] pointer-events-none -z-20" />
          <div className="fixed top-[30%] left-[40%] w-[500px] h-[500px] bg-[#38BDF8]/10 rounded-full blur-[140px] pointer-events-none -z-20" />
          <div className="fixed bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-orange-400/10 rounded-full blur-[130px] pointer-events-none -z-20" />
        </>
      )}

      {/* 1. HEADER BAR */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 rounded-xl border transition-all ${
        theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-xl'
      }`}>
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">My Profile</h2>
          <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mt-2 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Verified Partner Management System</p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest border ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
              }`}
            >
              <Edit3 size={14} className="text-[#38BDF8]" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditing(false)}
                className={`p-3 rounded-xl border transition-all ${theme === 'light' ? 'bg-white border-slate-200 text-rose-500 hover:bg-rose-50' : 'bg-white/5 border-white/10 text-rose-400'}`}
              >
                <X size={18} />
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-3 bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-[#38BDF8]/20 disabled:opacity-50 transition-all"
              >
                 {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save</>}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 2. LEFT SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          <div className={`p-10 text-center relative overflow-hidden transition-all border rounded-xl ${
            theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-xl'
          }`}>
            <div className="relative z-10">
              <div className="relative w-40 h-40 mx-auto mb-8">
                <div 
                  onClick={handleImageClick}
                  className={`w-full h-full rounded-xl overflow-hidden border flex items-center justify-center transition-all ${
                    isEditing ? 'cursor-pointer border-[#38BDF8] border-dashed bg-[#38BDF8]/5' : (theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/5 border-white/10')
                  }`}
                >
                  {profile.avatar ? (
                    <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className={theme === 'light' ? 'text-slate-200' : 'text-slate-800'} />
                  )}
                  {isEditing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-[#38BDF8] backdrop-blur-[2px]">
                      <Camera size={28} />
                      <span className="text-[9px] font-black uppercase mt-2">Update</span>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
              </div>

              <h3 className="text-2xl font-black uppercase tracking-tight">{profile.name}</h3>
              
              <div className="mt-8 flex justify-center">
                <span className={`inline-flex items-center gap-2 px-5 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  theme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/20'
                }`}>
                  <CheckCircle2 size={12} /> {profile.status} Partner
                </span>
              </div>

              <div className={`mt-10 py-10 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/5'}`}>
                <p className="text-4xl font-black tracking-tighter">{profile.totalLeads}</p>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mt-2 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>Total Submissions</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN CONTENT AREA */}
        <div className="lg:col-span-8">
          <div className={`rounded-xl p-8 md:p-12 border transition-all ${
            theme === 'light' ? 'bg-[#F1F5F9] border-slate-200 shadow-sm' : 'bg-white/[0.02] backdrop-blur-3xl border-white/10 shadow-xl'
          }`}>
            <h4 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-10 flex items-center gap-3 border-b pb-6 ${theme === 'light' ? 'border-slate-200 text-slate-400' : 'border-white/5 text-slate-500'}`}>
              <Settings size={16} className="text-[#38BDF8]" /> Partner Data
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <ProfileField theme={theme} isEditing={isEditing} label="Full Legal Name" value={profile.name} onChange={(v) => setProfile({...profile, name: v})} icon={<User size={18} />} />
              <ProfileField theme={theme} isEditing={isEditing} label="Direct Contact" value={profile.phone} onChange={(v) => setProfile({...profile, phone: v})} icon={<Phone size={18} />} />
              <div className="md:col-span-2">
                <ProfileField theme={theme} isEditing={false} label="Primary Network Email (READ ONLY)" value={profile.email} onChange={() => {}} icon={<Mail size={18} />} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProfileField = ({ theme, isEditing, label, value, onChange, icon }) => (
  <div className="space-y-3">
    <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>
    {isEditing ? (
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#38BDF8]">{icon}</div>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          className={`w-full pl-12 pr-5 py-4 border rounded-xl outline-none font-bold text-sm transition-all ${
            theme === 'light' ? 'bg-white border-slate-300 text-slate-900 focus:border-[#38BDF8]' : 'bg-white/5 border-white/10 text-white focus:border-[#38BDF8]/50'
          }`} 
        />
      </div>
    ) : (
      <div className={`flex items-center gap-4 p-5 border rounded-xl transition-all ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-white/[0.03] border-white/5'
      }`}>
        <div className="text-[#38BDF8] opacity-60">{icon}</div>
        <span className="text-sm font-bold uppercase tracking-tight">{value}</span>
      </div>
    )}
  </div>
);

export default ProfilePage;