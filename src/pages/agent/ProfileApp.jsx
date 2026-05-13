import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, Edit3, Camera, Save, X, 
  CheckCircle2, Settings, Loader2 
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient'; // Added Supabase Client
import { useTheme } from '../../context/ThemeContext'; 

// ==========================================
// 1:1 STRUCTURAL SKELETON (BENTO STYLE)
// ==========================================
const ProfileSkeleton = ({ theme }) => {
  const isLight = theme === 'light';
  const pulseColor = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';
  const cardBg = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10';

  return (
    <div className="w-full max-w-[1200px] mx-auto  space-y-5 pb-16 pt-4">
      {/* Separator */}
             <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`} />


      {/* Header Skeleton */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div className="space-y-2">
          <div className={`h-8 w-32 rounded-xl ${pulseColor} animate-pulse`} />
          <div className={`h-3 w-24 rounded-md ${pulseColor} animate-pulse`} />
        </div>
        <div className={`h-10 w-24 rounded-xl ${pulseColor} animate-pulse`} />
      </div>

      {/* Hero Card Skeleton */}
      <div className={`rounded-3xl p-8 border flex flex-col items-center space-y-5 animate-pulse ${cardBg}`}>
        <div className={`w-32 h-32 rounded-2xl ${pulseColor}`} />
        <div className={`h-6 w-48 rounded-lg ${pulseColor}`} />
        <div className={`h-8 w-36 rounded-lg ${pulseColor}`} />
      </div>

      {/* Stats Card Skeleton */}
      <div className={`rounded-2xl p-6 border flex justify-between items-center animate-pulse ${cardBg}`}>
        <div className="space-y-2">
          <div className={`h-3 w-24 rounded-md ${pulseColor}`} />
          <div className={`h-8 w-32 rounded-lg ${pulseColor}`} />
        </div>
        <div className={`w-12 h-12 rounded-xl ${pulseColor}`} />
      </div>

      {/* Data Card Skeleton */}
      <div className={`rounded-2xl p-6 border space-y-6 animate-pulse ${cardBg}`}>
        <div className={`h-4 w-32 rounded-md ${pulseColor} mb-6`} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className={`h-3 w-20 rounded-md ${pulseColor}`} />
            <div className={`h-14 w-full rounded-xl ${pulseColor}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// MAIN COMPONENT
// ==========================================
const ProfilePageApp = () => {
  const { theme } = useTheme(); 
  const isLight = theme === 'light';
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null); // Added user state for Supabase Auth
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

        // Supabase Logic replacing Dummy Data
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('Auth error:', authError);
          return;
        }
        if (!authData.user) {
          console.error('No authenticated user');
          return;
        }
        setUser(authData.user);

        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('full_name, phone, role, avatar_url')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          return;
        }

        const { count, error: countError } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        if (countError) {
          console.error('Lead count error:', countError);
          return;
        }

        setProfile({
          name: profileData.full_name || '',
          phone: profileData.phone || '',
          email: authData.user.email || '',
          status: profileData.role || 'Active',
          totalLeads: count || 0,
          avatar: profileData.avatar_url || null,
          avatarFile: null
        });

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setLoading(false), 800); 
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
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar;

      // Supabase Avatar Upload Logic
      if (profile.avatarFile) {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${user.id}.jpg`, profile.avatarFile, {
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(`${user.id}.jpg`);

        avatarUrl = publicUrlData?.publicUrl || profile.avatar;
      }

      // Supabase Profile Update Logic
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profile.name,
          phone: profile.phone,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Update error:', updateError);
        return;
      }

      setProfile(prev => ({
        ...prev,
        avatarFile: null,
        avatar: avatarUrl
      }));
      
      setIsEditing(false);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ProfileSkeleton theme={theme} />;

  return (
    <div className={`min-h-screen font-['Plus_Jakarta_Sans',sans-serif] pb-16 transition-colors duration-200 overflow-x-hidden ${
      isLight ? 'bg-[#F4F5F7] text-[#1A202C]' : 'bg-[#131720] text-[#F4F5F7]'
    }`}>
      <main className="w-full max-w-[1200px] mx-auto  space-y-5 ">
        
        {/* PROFESSIONAL SEPARATOR */}
                <div className={`w-full border-t pt-6 ${isLight ? 'border-[#E2E8F0]' : 'border-white/10'}`}>

          {/* Header Section */}
          <div className="flex justify-between items-end px-2 mb-2">
            <div>
              <h1 className={`text-3xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                Profile
              </h1>
              <p className={`text-[11px] font-bold uppercase tracking-wider mt-0.5 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Partner Identity
              </p>
            </div>
            
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 active:scale-95 ${
                  isLight 
                    ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] hover:border-[#81B398]' 
                    : 'bg-[#131720] border-white/10 text-[#F4F5F7] hover:border-[#81B398]'
                }`}
              >
                <Edit3 size={14} strokeWidth={2.5} /> Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 active:scale-95 bg-[#F0524F]/10 text-[#F0524F] border-[#F0524F]/20 hover:bg-[#F0524F]/20"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 active:scale-95 bg-[#81B398] text-white hover:bg-[#6FA085] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} strokeWidth={2.5} />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          
          {/* HERO CARD BENTO */}
          <div className={`rounded-3xl p-8 text-center relative overflow-hidden border flex flex-col items-center transition-colors ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <div className="relative w-32 h-32 mb-5">
              <div 
                onClick={handleImageClick}
                className={`w-full h-full rounded-2xl overflow-hidden border flex items-center justify-center transition-all ${
                  isEditing 
                  ? (isLight ? 'border-[#81B398] border-dashed bg-[#81B398]/10 cursor-pointer' : 'border-[#81B398] border-dashed bg-[#81B398]/10 cursor-pointer') 
                  : (isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10')
                }`}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className={isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'} />
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white backdrop-blur-[2px]">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-1.5">Change</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
            </div>

            <h3 className={`text-2xl font-extrabold tracking-tight ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
              {profile.name}
            </h3>
            
            <div className="mt-4 flex justify-center">
               <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
                 <CheckCircle2 size={12} strokeWidth={3} /> {profile.status} Partner
               </span>
            </div>
          </div>

          {/* STATS CARD BENTO */}
          <div className={`rounded-2xl p-6 border flex items-center justify-between ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <div>
              <h4 className={`text-[11px] font-bold uppercase tracking-wider mb-1 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>
                Activity Level
              </h4>
              <p className={`text-3xl font-extrabold tracking-tighter ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
                {profile.totalLeads} <span className="text-[11px] font-bold tracking-tight text-[#81B398]">Submissions</span>
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#81B398]' : 'bg-[#131720] border-white/10 text-[#81B398]'
            }`}>
              <Settings size={20} />
            </div>
          </div>

          {/* FIELDS CARD BENTO */}
          <div className={`rounded-2xl p-6 border space-y-6 ${
            isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/10'
          }`}>
            <h4 className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border-b pb-4 ${
              isLight ? 'border-[#E2E8F0] text-[#718096]' : 'border-white/10 text-[#9CA3AF]'
            }`}>
              <User size={14} className="text-[#81B398]" /> Personal Data
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
                label="Email Address (No Editable)" 
                value={profile.email} 
                onChange={() => {}} 
                icon={<Mail size={16} />} 
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// ==========================================
// BENTO PROFILE FIELD
// ==========================================
const ProfileField = ({ theme, isEditing, label, value, onChange, icon }) => {
  const isLight = theme === 'light';
  
  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-bold uppercase tracking-wider block ${
        isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
      }`}>{label}</label>
      
      {isEditing && !label.includes("Locked") && !label.includes("No Editable") ? (
        <div className="relative">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
            isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'
          }`}>{icon}</div>
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className={`w-full pl-11 pr-4 py-3.5 rounded-xl text-sm font-medium outline-none border transition-all ${
              isLight 
                ? 'bg-[#F4F5F7] border-[#E2E8F0] focus:border-[#81B398] text-[#1A202C]' 
                : 'bg-[#131720] border-white/10 focus:border-[#81B398] text-[#F4F5F7]'
            }`} 
          />
        </div>
      ) : (
        <div className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
          isLight ? 'bg-[#F4F5F7] border-[#E2E8F0]' : 'bg-[#131720] border-white/10'
        }`}>
          <div className={`shrink-0 ${isLight ? 'text-[#718096]' : 'text-[#9CA3AF]'}`}>{icon}</div>
          <span className={`text-sm font-bold tracking-tight truncate ${isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]'}`}>
            {value}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfilePageApp;