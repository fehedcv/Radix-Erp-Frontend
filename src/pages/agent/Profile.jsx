import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, Edit3, Camera, Save, X, 
  CheckCircle2, Settings, Loader2, Target
} from 'lucide-react';
import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

const ProfilePage = () => {
  const { theme } = useTheme(); 
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    email: "",
    status: "agent",
    totalLeads: 0,
    avatar: null,
    avatarFile: null 
  });

  const fileInputRef = useRef(null);
  const isLight = theme === 'light';

  // Design System Utility Classes
  const surfaceClass = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const pulseClass = isLight ? 'bg-[#E2E8F0]' : 'bg-[#334155]';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
          status: profileData.role || 'agent',
          totalLeads: count || 0,
          avatar: profileData.avatar_url || null,
          avatarFile: null
        });

      } catch (error) {
        console.error("Unexpected error:", error);
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
        avatarFile: file,
        avatar: URL.createObjectURL(file)
      }));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profile.avatar;

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
        avatarFile: null
      }));

      setIsEditing(false);
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setSaving(false);
    }
  };

  // SKELETON LOADER
  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 mt-2  lg:px-0">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-5  mb-8 animate-pulse">
          <div className="space-y-3">
            <div className={`h-10 w-48 rounded-md ${pulseClass}`} />
            <div className={`h-4 w-64 rounded-md ${pulseClass}`} />
          </div>
          <div className={`h-12 w-36 rounded-lg ${pulseClass}`} />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 animate-pulse">
          <div className={`lg:col-span-1 p-8 rounded-2xl border flex flex-col items-center justify-center min-h-[300px] ${surfaceClass}`}>
            <div className={`w-32 h-32 rounded-full mb-6 ${pulseClass}`} />
            <div className={`h-6 w-48 rounded-md mb-4 ${pulseClass}`} />
            <div className={`h-8 w-32 rounded-md ${pulseClass}`} />
          </div>
          
          <div className={`lg:col-span-2 p-8 rounded-2xl border ${surfaceClass}`}>
            <div className={`h-6 w-40 rounded-md mb-8 ${pulseClass}`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2"><div className={`h-4 w-24 rounded-md ${pulseClass}`} /><div className={`h-12 w-full rounded-lg ${pulseClass}`} /></div>
               <div className="space-y-2"><div className={`h-4 w-24 rounded-md ${pulseClass}`} /><div className={`h-12 w-full rounded-lg ${pulseClass}`} /></div>
               <div className="space-y-2 md:col-span-2"><div className={`h-4 w-32 rounded-md ${pulseClass}`} /><div className={`h-12 w-full rounded-lg ${pulseClass}`} /></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-[1400px] mx-auto space-y-6 lg:space-y-8 pb-16 font-['Plus_Jakarta_Sans',sans-serif] relative z-0 transition-colors duration-300 mt-2  lg:px-0 ${textPrimary}`}
    >
      {/* 1. HEADER (Borderless, Extracted from Card) */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-5  mb-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">My Profile</h1>
          <p className={`text-sm font-medium ${textSecondary}`}>Verified Partner Management System</p>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#1A202C] hover:bg-[#F4F5F7]' : 'bg-[#222938] border-white/5 text-[#F4F5F7] hover:bg-[#131720]'
              }`}
            >
              <Edit3 size={16} className="text-[#81B398]" /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setProfile(prev => ({ ...prev, avatarFile: null })); // Reset pending image
                }}
                className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border ${
                  isLight ? 'bg-[#FFFFFF] border-[#E2E8F0] text-[#F0524F] hover:bg-[#F0524F]/10' : 'bg-[#222938] border-white/5 text-[#F0524F] hover:bg-[#F0524F]/10'
                }`}
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-[#81B398] text-[#FFFFFF] px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#6FA085] disabled:opacity-50 transition-all shadow-sm flex-1 md:flex-none"
              >
                 {saving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Avatar & Stats */}
        <div className={`lg:col-span-1 p-8 rounded-2xl border flex flex-col items-center justify-center transition-all ${surfaceClass}`}>
          <div className="relative z-10 w-full flex flex-col items-center">
            
            {/* Interactive Avatar with Floating Stats Badge */}
            <div className="relative mb-6">
              <div 
                onClick={handleImageClick}
                className={`w-32 h-32 rounded-full overflow-hidden border-2 flex items-center justify-center transition-all group ${
                  isEditing 
                  ? `cursor-pointer border-dashed ${isLight ? 'border-[#81B398] bg-[#81B398]/5' : 'border-[#81B398] bg-[#81B398]/10'}` 
                  : (isLight ? 'border-[#E2E8F0] bg-[#F4F5F7]' : 'border-white/10 bg-[#131720]')
                }`}
              >
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className={textSecondary} />
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-[#FFFFFF] backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-wider mt-2">Update</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />

              {/* Floating Lead Count Badge */}
              <div className={`absolute -bottom-2 -right-2 px-3 py-1.5 rounded-lg border shadow-sm flex items-center gap-1.5 ${
                isLight ? 'bg-white border-[#E2E8F0] text-[#1A202C]' : 'bg-[#222938] border-white/10 text-[#F4F5F7]'
              }`}>
                <Target size={14} className="text-[#81B398]" />
                <span className="text-sm font-extrabold tracking-tight">{profile.totalLeads} <span className={`text-[10px] font-semibold uppercase tracking-wider ${textSecondary}`}>Leads</span></span>
              </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-center mt-2">{profile.name}</h3>
            
            <div className="mt-4 flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider border ${
                isLight ? 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20' : 'bg-[#81B398]/10 text-[#81B398] border-[#81B398]/20'
              }`}>
                <CheckCircle2 size={14} /> {profile.status} Partner
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Profile Data Form */}
        <div className={`lg:col-span-2 rounded-2xl p-8 border transition-all ${surfaceClass}`}>
          <h4 className={`text-sm font-bold uppercase tracking-wider mb-8 flex items-center gap-2 border-b pb-4 ${isLight ? 'border-[#E2E8F0] text-[#1A202C]' : 'border-white/5 text-[#F4F5F7]'}`}>
            <Settings size={18} className="text-[#81B398]" /> Partner Data
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <ProfileField 
              isLight={isLight} 
              isEditing={isEditing} 
              label="Full Legal Name" 
              value={profile.name} 
              onChange={(v) => setProfile({...profile, name: v})} 
              icon={<User size={18} />} 
            />
            <ProfileField 
              isLight={isLight} 
              isEditing={isEditing} 
              label="Direct Contact" 
              value={profile.phone} 
              onChange={(v) => setProfile({...profile, phone: v})} 
              icon={<Phone size={18} />} 
            />
            <div className="md:col-span-2">
              <ProfileField 
                isLight={isLight} 
                isEditing={false} 
                label="Primary Network Email" 
                value={profile.email} 
                onChange={() => {}} 
                icon={<Mail size={18} />} 
                readOnlyTag={true}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Extracted Subcomponent for cleaner rendering
const ProfileField = ({ isLight, isEditing, label, value, onChange, icon, readOnlyTag }) => {
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';
  const textPrimary = isLight ? 'text-[#1A202C]' : 'text-[#F4F5F7]';
  const inputSurface = isLight ? 'bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]' : 'bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]';
  const displaySurface = isLight ? 'bg-[#FFFFFF] border-[#E2E8F0]' : 'bg-[#222938] border-white/5';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center ml-1">
        <label className={`text-xs font-semibold ${textSecondary}`}>{label}</label>
        {readOnlyTag && <span className={`text-[10px] font-bold uppercase tracking-widest ${isLight ? 'text-[#F0524F]' : 'text-[#F0524F]/80'}`}>Read Only</span>}
      </div>

      {isEditing && !readOnlyTag ? (
        <div className="relative">
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${textSecondary}`}>{icon}</div>
          <input 
            type="text" 
            value={value} 
            onChange={(e) => onChange(e.target.value)} 
            className={`w-full pl-11 pr-4 py-3 border rounded-lg outline-none font-medium text-sm transition-all ${inputSurface}`} 
          />
        </div>
      ) : (
        <div className={`flex items-center gap-4 p-4 border rounded-lg transition-all ${displaySurface} ${readOnlyTag ? 'opacity-80' : ''}`}>
          <div className={`${textSecondary}`}>{icon}</div>
          <span className={`text-sm font-medium truncate ${textPrimary}`}>{value || 'Not provided'}</span>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;