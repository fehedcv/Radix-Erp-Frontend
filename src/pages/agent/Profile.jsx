import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Phone, Mail, ShieldCheck, Star, 
  Edit3, Camera, Save, X, CheckCircle2, Briefcase,
  Activity, Settings, FileText, ExternalLink, Layers, 
  Info, Target, Zap, BarChart2
} from 'lucide-react';
import frappeApi from '../../api/frappeApi';
import Loader from '../../components/Loader'
const ProfilePage = () => {
  // --- 1. STATE MANAGEMENT ---
  const [isEditing, setIsEditing] = useState(false);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    phone: "+91 9876543210",
    email: "john.doe@radix.com",
    status: "Active",
    // successRate: 64,
    totalLeads: 50,
    avatar: null, // URL for display
    avatarFile: null // File object for upload
  });

  const fileInputRef = useRef(null);

  // Effect to fetch initial data
  useEffect(() => {
  const fetchData = async () => {
    try {
      // 1. Get profile
      setLoading(true);
      const profileRes = await frappeApi.get('/method/business_chain.api.agent.get_agent_profile');
      const agentData = profileRes.data.message;

      // 2. Get dashboard (for leads count)
      const dashboardRes = await frappeApi.get('/method/business_chain.api.agent.get_agent_dashboard_data');
      const dashboardData = dashboardRes.data.message;

      // 3. Calculate total leads
      const totalLeads = dashboardData.recentActivity.length;

      // 4. Set profile
      setProfile(prevProfile => ({
        ...prevProfile,
        name: agentData.fullName,
        phone: agentData.phone,
        email: agentData.email,
        avatar: agentData.profilePicture,
        totalLeads: totalLeads, // ✅ THIS IS THE FIX
        avatarFile: null
      }));

    } catch (error) {
      console.error("Error fetching data:", error);
    }finally {
      setLoading(false)
    }
  };

  fetchData();
}, []);
  // Effect to clean up blob URLs
  useEffect(() => {
    const avatar = profile.avatar;
    return () => {
      if (avatar && avatar.startsWith('blob:')) {
        URL.revokeObjectURL(avatar);
      }
    };
  }, [profile.avatar]);


  // --- 2. HANDLERS ---
  const handleImageClick = () => {
    if (isEditing) fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prevProfile => {
        // If there's an old blob URL, revoke it to prevent memory leaks
        if (prevProfile.avatar && prevProfile.avatar.startsWith('blob:')) {
          URL.revokeObjectURL(prevProfile.avatar);
        }
        return {
          ...prevProfile,
          avatar: URL.createObjectURL(file), // Create a new blob URL for preview
          avatarFile: file // Store the actual file for upload
        };
      });
    }
  };

  const handleSave = () => {
    setSaving(true);
    const formData = new FormData();
    formData.append('full_name', profile.name);
    formData.append('phone', profile.phone);

    // Handle profile picture
    if (profile.avatarFile) {
      // If a new file is staged, append it
      formData.append('profile_picture', profile.avatarFile);
    } else if (profile.avatar) {
      // If no new file, but an existing avatar URL is there, send that
      formData.append('profile_picture', profile.avatar);
    } else {
      // If no image at all, send an empty string to satisfy the backend requirement
      formData.append('profile_picture', '');
    }

    frappeApi.post('/method/business_chain.api.agent.update_agent_profile', formData, {
      // Axios will automatically set 'Content-Type': 'multipart/form-data'
    })
    .then(response => {
      console.log("Profile updated successfully", response.data);
      
        // Optionally, refetch profile data to get new image URL from server
        // For now, just exit editing mode
        setIsEditing(false);
        setProfile(p => ({...p, avatarFile: null})); // Clear staged file
      
    })
    .catch(error => {
      console.error("Error updating profile:", error);
      // You might want to show an error to the user here
      setIsEditing(false); // Exit editing mode even on error for this example
    }).finally(()=>{
      setSaving(false);

    })
    
  };
  if (loading) {
     return (
       <div className="flex items-center justify-center w-full min-h-[70vh] font-['Plus_Jakarta_Sans',sans-serif]">
         {/* fullScreen={false} keeps it perfectly inside your dashboard container instead of taking over the whole screen */}
         <Loader fullScreen={false} text="Loading Profile..." />
       </div>
     );
   }
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className="max-w-[1400px] mx-auto space-y-6  font-['Plus_Jakarta_Sans',sans-serif]"
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
                 {saving ? (
    <>
      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Saving...
    </>
  ) : (
    <>
      <Save size={14} /> Save Changes
    </>
  )}
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
              {/* <p className="text-[10px] font-bold text-[#007ACC] uppercase tracking-[0.2em] mt-1">Partner ID: PX-928</p> */}
              
              <div className="mt-6 flex justify-center">
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  <CheckCircle2 size={12} /> {profile.status} Partner
                </span>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-0 gap-4">
                 <div className="text-center">
                    <p className="text-xl font-black text-slate-900">{profile.totalLeads}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Leads Sent</p>
                 </div>
                
              </div>
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
                <ProfileField isEditing={false} label="Primary Network Email" value={profile.email} onChange={(v) => setProfile({...profile, email: v})} icon={<Mail size={16} />} />
              </div>
            </div>
          </div>

          {/* DENSE GRID: PERFORMANCE & EXPERTISE */}
       

          {/* STRATEGIC GOALS (NON-FUNCTIONAL CONTENT) */}
          

          {/* NETWORK ASSETS (NON-FUNCTIONAL CONTENT) */}
         
        </div>
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