import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target,
  Trash2,
  Bell,
  BellOff,
  BellRing,
} from 'lucide-react';

import { supabase } from '../../supabase/supabaseClient';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { requestWebPushPermission } from '../../services/webPush';

const ProfilePage = () => {
  const { theme } = useTheme();
  const { showToast } = useNotification();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [notifPermission, setNotifPermission] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [notifLoading, setNotifLoading] = useState(false);

  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    email: '',
    status: 'agent',
    totalLeads: 0,
    avatar: null,
    avatarFile: null,
    removeAvatar: false
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

  const pulseClass = isLight 
    ? 'bg-[#E2E8F0]' 
    : 'bg-[#334155]';

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
          avatarFile: null,
          removeAvatar: false
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
      avatar: preview,
      removeAvatar: false
    }));
  };

  // REMOVE AVATAR
  const handleDeleteAvatar = () => {
    setProfile(prev => ({
      ...prev,
      avatar: null,
      avatarFile: null,
      removeAvatar: true
    }));
  };

  // SAVE PROFILE
  const handleSave = async () => {
    if (!user || saving) return;

    try {
      setSaving(true);

      let avatarUrl = profile.avatar;

      // Check if we need to remove the avatar completely
      if (profile.removeAvatar) {
        avatarUrl = null;
      } 
      // Upload avatar if changed
      else if (profile.avatarFile) {
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
        avatarFile: null,
        removeAvatar: false
      }));

      setIsEditing(false);

      // Trigger the success popup
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000); // Auto-hide after 3 seconds

    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Must be wired to a button onClick — Notification.requestPermission() is
  // only allowed inside a short-lived user gesture, not useEffect or timers.
  const handleEnableNotifications = async () => {
    setNotifLoading(true);
    try {
      const result = await requestWebPushPermission(showToast);
      setNotifPermission(result === 'unsupported' ? 'denied' : result);
    } finally {
      setNotifLoading(false);
    }
  };

  // SKELETON LOADING
  if (loading) {
    return (
      <div className={`max-w-[1400px] mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif]`}>
        <div className="flex justify-between items-center mb-8 animate-pulse">
          <div>
            <div className={`h-10 w-48 rounded-md mb-2 ${pulseClass}`} />
            <div className={`h-4 w-64 rounded-md ${pulseClass}`} />
          </div>
          <div className={`h-12 w-36 rounded-xl ${pulseClass}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
          <div className={`rounded-2xl border p-8 flex flex-col items-center ${surfaceClass}`}>
            <div className={`w-32 h-32 rounded-full mb-6 ${pulseClass}`} />
            <div className={`h-8 w-40 rounded-md mb-4 ${pulseClass}`} />
            <div className={`h-8 w-32 rounded-lg ${pulseClass}`} />
          </div>
          <div className={`lg:col-span-2 rounded-2xl border p-8 ${surfaceClass}`}>
            <div className={`h-6 w-32 rounded-md mb-8 ${pulseClass}`} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className={`h-4 w-24 rounded-md ${pulseClass}`} />
                <div className={`h-12 w-full rounded-xl ${pulseClass}`} />
              </div>
              <div className="space-y-2">
                <div className={`h-4 w-24 rounded-md ${pulseClass}`} />
                <div className={`h-12 w-full rounded-xl ${pulseClass}`} />
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className={`h-4 w-24 rounded-md ${pulseClass}`} />
                <div className={`h-12 w-full rounded-xl ${pulseClass}`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`max-w-[1400px] mx-auto pb-16 font-['Plus_Jakarta_Sans',sans-serif] ${textPrimary}`}
    >

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            My Profile
          </h1>

          <p className={`text-sm mt-1 font-medium ${textSecondary}`}>
            Verified Partner Management System
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#81B398] text-white font-semibold hover:bg-[#6FA085] transition-colors shadow-sm"
          >
            <Edit3 size={16} />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#81B398] text-white font-semibold disabled:opacity-60 hover:bg-[#6FA085] transition-colors shadow-sm"
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
        <div className={`rounded-2xl border p-8 flex flex-col items-center transition-all ${surfaceClass}`}>

          {/* AVATAR */}
          <div className="relative mb-6 flex flex-col items-center">

            <div
              onClick={handleImageClick}
              className={`
                w-32 h-32 rounded-full overflow-hidden
                flex items-center justify-center
                border-2 transition-all relative group
                ${isEditing
                  ? 'cursor-pointer border-dashed border-[#81B398] hover:bg-[#81B398]/5'
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
                <User size={48} className={textSecondary} />
              )}

              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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

            {/* DELETE AVATAR OPTION */}
            {isEditing && profile.avatar && (
              <button 
                onClick={handleDeleteAvatar}
                className="mt-4 text-xs font-bold uppercase tracking-wider text-[#F0524F] hover:text-[#D44846] flex items-center gap-1.5 transition-colors"
              >
                <Trash2 size={14} /> Remove Picture
              </button>
            )}

            {/* LEADS BADGE */}
            <div className="absolute top-0 -right-2 bg-[#81B398] text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm">
              <Target size={12} />
              <span className="text-xs font-bold tracking-wide">
                {profile.totalLeads} Leads
              </span>
            </div>
          </div>

          {/* NAME */}
          <h2 className="text-2xl font-bold tracking-tight">
            {profile.name}
          </h2>

          {/* ROLE */}
          <div className="mt-4 px-4 py-2 rounded-lg bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20 flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Radix Partner
            </span>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`lg:col-span-2 rounded-2xl border p-8 transition-all ${surfaceClass}`}>

          <div className={`flex items-center gap-2 mb-8 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
            <Settings size={18} className="text-[#81B398]" />
            <h3 className="font-bold uppercase tracking-wider text-sm">
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
              isLight={isLight}
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
              isLight={isLight}
            />

            {/* EMAIL */}
            <div className="md:col-span-2">
              <ProfileField
                label="Email"
                value={profile.email}
                icon={<Mail size={18} />}
                editable={false}
                readonly
                isLight={isLight}
              />
            </div>

          </div>
        </div>
      </div>

      {/* NOTIFICATIONS CARD */}
      {'Notification' in window && (
        <div className={`mt-8 rounded-2xl border p-8 transition-all ${surfaceClass}`}>
          <div className={`flex items-center gap-2 mb-6 border-b pb-4 ${isLight ? 'border-[#E2E8F0]' : 'border-white/5'}`}>
            <Bell size={18} className="text-[#81B398]" />
            <h3 className="font-bold uppercase tracking-wider text-sm">Notifications</h3>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className={`font-semibold ${textPrimary}`}>Push Notifications</p>
              <p className={`text-sm mt-1 ${textSecondary}`}>
                {notifPermission === 'granted' && 'You will receive alerts for new leads and payments.'}
                {notifPermission === 'denied' && 'Blocked in browser settings. Click the lock icon in your address bar to re-enable.'}
                {notifPermission === 'default' && 'Get instant alerts for new leads and payment updates.'}
              </p>
            </div>

            {notifPermission === 'granted' && (
              <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#81B398]/10 text-[#81B398] border border-[#81B398]/20">
                <BellRing size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Enabled</span>
              </div>
            )}

            {notifPermission === 'denied' && (
              <div className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                <BellOff size={16} />
                <span className="text-xs font-semibold uppercase tracking-wider">Blocked</span>
              </div>
            )}

            {notifPermission === 'default' && (
              <button
                onClick={handleEnableNotifications}
                disabled={notifLoading}
                className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#81B398] text-white font-semibold disabled:opacity-60 hover:bg-[#6FA085] transition-colors shadow-sm"
              >
                {notifLoading ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />}
                Enable Notifications
              </button>
            )}
          </div>
        </div>
      )}

      {/* SUCCESS POPUP MODAL */}
      <AnimatePresence>
        {showSuccessPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-sm w-full p-8 text-center relative overflow-hidden transition-all ${surfaceClass}`}
            >
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-[#81B398]/10 border border-[#81B398]/20 rounded-full flex items-center justify-center mb-5">
                  <CheckCircle2 size={32} className="text-[#81B398]" />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${textPrimary}`}>Success!</h3>
                <p className={`text-sm leading-relaxed mb-6 ${textSecondary}`}>
                  Your profile has been updated successfully.
                </p>
                <button 
                  onClick={() => setShowSuccessPopup(false)} 
                  className={`w-full py-3 rounded-lg text-sm font-semibold transition-colors ${
                    isLight ? 'bg-[#F4F5F7] border border-[#E2E8F0] text-[#1A202C] hover:bg-[#E2E8F0]' : 'bg-[#131720] border border-white/5 text-[#F4F5F7] hover:bg-[#1A202C]'
                  }`}
                >
                  Okay
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
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
  const textSecondary = isLight ? 'text-[#718096]' : 'text-[#9CA3AF]';

  return (
    <div className="space-y-2">

      <div className="flex justify-between items-center px-1">
        <label className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>
          {label}
        </label>

        {readonly && (
          <span className="text-[10px] text-[#F0524F] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F0524F]/10 border border-[#F0524F]/20">
            Read Only
          </span>
        )}
      </div>

      {editable && !readonly ? (
        <div className="relative group">

          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${textSecondary} group-focus-within:text-[#81B398]`}>
            {icon}
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`
              w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all
              ${isLight
                ? "bg-[#F4F5F7] border-[#E2E8F0] text-[#1A202C] focus:bg-[#FFFFFF] focus:border-[#81B398]"
                : "bg-[#131720] border-transparent text-[#F4F5F7] focus:bg-[#222938] focus:border-[#81B398]"
              }
            `}
          />
        </div>
      ) : (
        <div className={`
          flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-sm font-medium
          ${isLight
            ? "bg-[#F4F5F7] border-[#E2E8F0] text-[#718096] opacity-80"
            : "bg-[#131720] border-white/5 text-[#9CA3AF] opacity-80"
          }
        `}>
          <div className={textSecondary}>
            {icon}
          </div>

          <span className="truncate">
            {value || 'Not provided'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;