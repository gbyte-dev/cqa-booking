'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Building2, Shield, Camera, Loader2 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { notify } from '@/lib/alerts';

export default function TenantProfilePage() {
  const router = useRouter();
  const mountedRef = useRef(false);
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });

  const token = storage.getToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const ASSET_BASE = API_URL;

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!token) {
      router.replace('/login');
      return;
    }

    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setFormData({
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          phone: data.data.phone || ''
        });
      } else {
        notify(data.error || 'Failed to load profile');
      }
    } catch (error) {
      notify('Failed to load profile');
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/profile/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        const currentUser = storage.getUser();
        if (currentUser) {
          storage.setUser({ ...currentUser, firstName: data.data.firstName, lastName: data.data.lastName });
        }
        notify('Profile updated successfully');
      } else {
        notify(data.error || 'Failed to update profile');
      }
    } catch (error) {
      notify('Failed to update profile');
    }
    setSaving(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      notify('Only JPG, PNG, WEBP or GIF images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      notify('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append('avatar', file);
      const response = await fetch(`${API_URL}/api/v1/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body
      });
      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        notify('Profile photo updated');
      } else {
        notify(data.error || 'Failed to upload photo');
      }
    } catch (error) {
      notify('Failed to upload photo');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading || !profile) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--tenant-primary)]" size={28} />
      </main>
    );
  }

  const roleLabel = profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Team Member';
  const initial = (formData.firstName || profile.email || 'U').charAt(0).toUpperCase();

  return (
    <main className="p-[30px] max-[768px]:p-[15px]">
      <div className="mb-6">
        <h2 className="m-0 flex items-center gap-2 text-2xl font-bold text-[var(--tenant-text)]">
          <User size={22} /> My Profile
        </h2>
        <p className="mt-1 text-[13px] text-[var(--tenant-text-secondary)]">
          Manage your personal information and profile photo.
        </p>
      </div>

      <div className="max-w-[720px] rounded-[var(--tenant-radius-lg)] border border-[var(--tenant-border-light)] bg-[var(--tenant-surface)] shadow-sm">
        {/* Avatar + identity header */}
        <div className="flex items-center gap-5 border-b border-[var(--tenant-border-light)] p-6">
          <div className="group relative">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[var(--tenant-primary)] to-[#764ba2] text-2xl font-bold text-white shadow-md">
              {profile.avatarUrl ? (
                <img src={`${ASSET_BASE}${profile.avatarUrl}`} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              title="Change profile photo"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[var(--tenant-surface)] bg-[var(--tenant-primary)] text-white shadow-md transition-all duration-200 hover:bg-[var(--tenant-primary-dark)] hover:scale-105 disabled:opacity-60"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="min-w-0">
            <strong className="block text-lg font-bold text-[var(--tenant-text)]">
              {formData.firstName} {formData.lastName}
            </strong>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--tenant-primary-light)] px-3 py-1 text-[11px] font-bold text-[var(--tenant-primary)]">
              <Shield size={11} /> {roleLabel}
            </span>
          </div>
        </div>

        {/* Editable fields */}
        <div className="p-6">
          <div className="mb-5 grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--tenant-text-secondary)]">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className="h-11 w-full rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] px-3 text-sm text-[var(--tenant-text)] outline-none transition-all focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-light)]"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold text-[var(--tenant-text-secondary)]">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className="h-11 w-full rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] px-3 text-sm text-[var(--tenant-text)] outline-none transition-all focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-light)]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="mb-2 flex items-center gap-1 text-xs font-semibold text-[var(--tenant-text-secondary)]">
              <Phone size={12} /> Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Add a phone number"
              className="h-11 w-full rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface)] px-3 text-sm text-[var(--tenant-text)] outline-none transition-all focus:border-[var(--tenant-primary)] focus:ring-2 focus:ring-[var(--tenant-primary-light)]"
            />
          </div>

          <div className="mb-5">
            <label className="mb-2 flex items-center gap-1 text-xs font-semibold text-[var(--tenant-text-secondary)]">
              <Mail size={12} /> Email Address
            </label>
            <input
              type="email"
              value={profile.email || ''}
              disabled
              title="Email cannot be changed here"
              className="h-11 w-full cursor-not-allowed rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface-2)] px-3 text-sm text-[var(--tenant-text-muted)] outline-none"
            />
          </div>

          {profile.venueName && (
            <div className="mb-5">
              <label className="mb-2 flex items-center gap-1 text-xs font-semibold text-[var(--tenant-text-secondary)]">
                <Building2 size={12} /> Venue
              </label>
              <input
                type="text"
                value={profile.venueName}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface-2)] px-3 text-sm text-[var(--tenant-text-muted)] outline-none"
              />
            </div>
          )}

          {profile.role === 'staff' && (
            <div className="mb-5">
              <label className="mb-2 block text-xs font-semibold text-[var(--tenant-text-secondary)]">Reports To</label>
              <input
                type="text"
                value={profile.managerName || 'Unassigned'}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-[var(--tenant-radius-sm)] border border-[var(--tenant-border)] bg-[var(--tenant-surface-2)] px-3 text-sm text-[var(--tenant-text-muted)] outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-[var(--tenant-border-light)] p-5">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="h-11 rounded-[var(--tenant-radius-sm)] bg-[var(--tenant-primary)] px-7 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-px hover:bg-[var(--tenant-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </main>
  );
}
