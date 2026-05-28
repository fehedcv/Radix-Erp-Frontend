import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Phone,
  Mail,
  Edit3,
  Camera,
  Save,
  CheckCircle2,
  Settings,
  Loader2,
  Target
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
    name: '',
    phone: '',
    email: '',
    status: 'agent',
    totalLeads: 0,
    avatar: null,
    avatarFile: null
  });

  const fileInputRef = useRef(null);

  const isLight = theme === 'light';

  // Theme classes
  const surfaceClass = isLight
    ? 'bg-[#FFFFFF] border-[#E2E8F0]'
    : 'bg-[#222938] border-white/5';

  const textPrimary = isLight
    ? 'text-[#1A202C]'
    : 'text-[#F4F5F7]';

  const textSecondary = isLight
    ? 'text-[#718096]'
    : 'text-[#9CA3AF]';

  // FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);

        // Get auth user
        const {
          data: { user: authUser },
          error: authError
        } = await supabase.auth.getUser();

        if (authError || !authUser) {
          console.error(authError);
          return;
        }

        setUser(authUser);

        // Get user profile
        const { data, error } = await supabase
          .from('users')
          .select(`
            full_name,
            phone,
            role,
            avatar_url
          `)
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Profile fetch error:', error);
          return;
        }

        // Get total leads
        const { count } = await supabase
          .from('leads')
          .select('*', {
            count: 'exact',
            head: true
          })
          .eq('source_user_id', authUser.id);

        setProfile({
          name: data?.full_name || '',
          phone: data?.phone || '',
          email: authUser.email || '',
          status: data?.role || 'agent',
          totalLeads: count || 0,
          avatar: data?.avatar_url || null,
          avatarFile: null
        });

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // CLEANUP BLOB URL
  useEffect(() => {
    return () => {
      if (profile.avatar?.startsWith('blob:')) {
        URL.revokeObjectURL(profile.avatar);
      }
    };
  }, [profile.avatar]);

  // IMAGE PICKER
  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  // IMAGE CHANGE
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowed = [
      'image/png',
      'image/jpeg',
      'image/webp'
    ];

    if (!allowed.includes(file.type)) {
      alert('Only PNG, JPEG, and WEBP are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be below 2MB.');
      return;
    }

    const preview = URL.createObjectURL(file);

    setProfile(prev => ({
      ...prev,
      avatarFile: file,
      avatar: preview
    }));
  };

  // SAVE PROFILE
  const handleSave = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

      let avatarUrl = profile.avatar;

      // Upload avatar if changed
      if (profile.avatarFile) {

        const extension = profile.avatarFile.name
          .split('.')
          .pop()
          ?.toLowerCase();

        const filePath = `${user.id}/avatar.${extension}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(
            filePath,
            profile.avatarFile,
            {
              upsert: true
            }
          );

        if (uploadError) {
          console.error(uploadError);
          alert(uploadError.message);
          return;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData.publicUrl;
      }

      // Update users table
      const { error: updateError } = await supabase
        .from('users')
        .update({
          full_name: profile.name,
          phone: profile.phone,
          avatar_url: avatarUrl
        })
        .eq('id', user.id);

      if (updateError) {
        console.error(updateError);
        alert(updateError.message);
        return;
      }

      setProfile(prev => ({
        ...prev,
        avatar: avatarUrl,
        avatarFile: null
      }));

      setIsEditing(false);

      alert('Profile updated successfully.');

    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // LOADING
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-[#81B398]" size={32} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`max-w-[1400px] mx-auto pb-16 ${textPrimary}`}
    >

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold">
            My Profile
          </h1>

          <p className={`text-sm mt-1 ${textSecondary}`}>
            Verified Partner Management System
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#81B398] text-white font-semibold"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#81B398] text-white font-semibold disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}

            Save
          </button>
        )}
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT */}
        <div className={`rounded-2xl border p-8 flex flex-col items-center ${surfaceClass}`}>

          {/* AVATAR */}
          <div className="relative mb-6">

            <div
              onClick={handleImageClick}
              className={`
                w-32 h-32 rounded-full overflow-hidden
                flex items-center justify-center
                border-2 transition-all
                ${isEditing
                  ? 'cursor-pointer border-dashed border-[#81B398]'
                  : 'border-white/10'
                }
              `}
            >

              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={48} />
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Camera size={24} className="text-white" />
                </div>
              )}

            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />

            {/* LEADS BADGE */}
            <div className="absolute -bottom-2 -right-2 bg-[#81B398] text-white px-3 py-1 rounded-lg flex items-center gap-1">
              <Target size={12} />
              <span className="text-xs font-bold">
                {profile.totalLeads} Leads
              </span>
            </div>
          </div>

          {/* NAME */}
          <h2 className="text-2xl font-bold">
            {profile.name}
          </h2>

          {/* ROLE */}
          <div className="mt-4 px-4 py-2 rounded-lg bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20 flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span className="text-xs font-semibold uppercase">
              {profile.status} Partner
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`lg:col-span-2 rounded-2xl border p-8 ${surfaceClass}`}>

          <div className="flex items-center gap-2 mb-8">
            <Settings size={18} className="text-[#81B398]" />
            <h3 className="font-bold uppercase tracking-wider">
              Partner Data
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NAME */}
            <ProfileField
              label="Full Name"
              value={profile.name}
              onChange={(v) =>
                setProfile(prev => ({
                  ...prev,
                  name: v
                }))
              }
              icon={<User size={18} />}
              editable={isEditing}
            />

            {/* PHONE */}
            <ProfileField
              label="Phone"
              value={profile.phone}
              onChange={(v) =>
                setProfile(prev => ({
                  ...prev,
                  phone: v
                }))
              }
              icon={<Phone size={18} />}
              editable={isEditing}
            />

            {/* EMAIL */}
            <div className="md:col-span-2">
              <ProfileField
                label="Email"
                value={profile.email}
                icon={<Mail size={18} />}
                editable={false}
                readonly
              />
            </div>

          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProfileField = ({
  label,
  value,
  onChange,
  icon,
  editable,
  readonly,
  isLight
}) => {
  return (
    <div className="space-y-2">

      <div className="flex justify-between">
        <label className="text-sm font-semibold text-gray-400">
          {label}
        </label>

        {readonly && (
          <span className="text-xs text-red-400 font-bold uppercase">
            Read Only
          </span>
        )}
      </div>

      {editable && !readonly ? (
        <div className="relative">

          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`
  w-full
  pl-12
  pr-4
  py-3
  rounded-xl
  border
  outline-none
  transition-all

  ${isLight
    ? "bg-white border-gray-200 text-gray-900 focus:border-[#81B398]"
    : "bg-[#1f2937] border-white/10 text-white focus:border-[#81B398]"
  }
`}
          />
        </div>
      ) : (
        <div className={`
  flex items-center gap-3 px-4 py-3 rounded-xl border
  transition-all

  ${isLight
    ? "bg-gray-100 border-gray-200 text-gray-800"
    : "bg-[#111827] border-white/10 text-gray-200"
  }
`}>
          {icon}

          <span className="font-medium truncate">
            {value || 'Not provided'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;