'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Trash2, Sparkles, ArrowLeft } from 'lucide-react';

import { storage } from '@/lib/storage';
import { customerAPI } from '@/lib/api';
import { notifySuccess, notifyError } from '@/lib/alerts';
import { buildLoginUrl } from '@/lib/redirect';
import UserAvatar from '@/components/UserAvatar';
import CustomerVerificationBanner from '@/components/customer/CustomerVerificationBanner';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export default function CustomerProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const token = storage.getToken();
    const stored = storage.getUser();

    // Route guard: only a logged-in CUSTOMER may reach this page. Anyone
    // else is bounced to /login with the original path preserved.
    if (!token || !stored) {
      router.replace(buildLoginUrl('/account/profile'));
      return;
    }
    if (stored.role !== 'customer') {
      router.replace('/login');
      return;
    }

    setUser(stored);
    setFullName(stored.fullName || stored.firstName || '');
    setPhone(stored.phone || '');
    setChecking(false);
  }, [router]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const token = storage.getToken();
      const result = await customerAPI.updateMe(token, { fullName, phone });
      if (result.success) {
        const updated = { ...storage.getUser(), fullName, firstName: fullName.split(' ')[0], phone };
        storage.setUser(updated);
        setUser(updated);
        notifySuccess('Profile updated successfully.');
      } else {
        notifyError(result.error || 'Could not update profile.');
      }
    } catch {
      notifyError('Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarPick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > MAX_AVATAR_BYTES) {
      notifyError('Image is too large. Maximum size is 2MB.');
      return;
    }
    if (!/^image\//.test(file.type)) {
      notifyError('Please choose an image file.');
      return;
    }

    setUploading(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const token = storage.getToken();
      const result = await customerAPI.uploadAvatar(token, dataUrl);

      if (result.success) {
        const updated = { ...storage.getUser(), avatarUrl: result.data.avatarUrl };
        storage.setUser(updated);
        setUser(updated);
        notifySuccess('Avatar updated successfully.');
      } else {
        notifyError(result.error || 'Could not upload avatar.');
      }
    } catch {
      notifyError('Could not upload avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (uploading) return;
    setUploading(true);
    try {
      const token = storage.getToken();
      const result = await customerAPI.removeAvatar(token);
      if (result.success) {
        const updated = { ...storage.getUser(), avatarUrl: null };
        storage.setUser(updated);
        setUser(updated);
        notifySuccess('Avatar removed.');
      } else {
        notifyError(result.error || 'Could not remove avatar.');
      }
    } catch {
      notifyError('Could not remove avatar. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf6ef] text-[13px] text-[#8a6d3b]">
        <Sparkles className="h-6 w-6 animate-pulse text-[#b45309]" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf6ef] font-sans text-[#2b2118]">
      <CustomerVerificationBanner />

      <div className="mx-auto max-w-[560px] px-5 py-12">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="mb-6 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#7d6f5c] hover:text-[#b45309]"
        >
          <ArrowLeft size={14} /> Back home
        </button>

        <div className="rounded-2xl border border-[#eadfc8] bg-[#fffdf8] p-8">
          <h1 className="mb-6 text-[22px] font-extrabold tracking-[-0.5px]">My profile</h1>

          <div className="mb-8 flex items-center gap-5">
            <UserAvatar user={user} size={72} />
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={uploading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#1f2937] px-3.5 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#b45309] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Camera size={14} /> {uploading ? 'Uploading...' : 'Change avatar'}
                </button>
                {user?.avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#e4d5b8] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#7d6f5c] transition-colors hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#8a7b66]">PNG, JPG or WEBP. Max 2MB.</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="grid gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#6b5d4b]">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-[44px] w-full rounded-lg border border-[#e4d5b8] bg-white px-3.5 text-[13px] outline-none focus:border-[#b45309]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#6b5d4b]">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-[44px] w-full rounded-lg border border-[#e4d5b8] bg-white px-3.5 text-[13px] outline-none focus:border-[#b45309]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-[#6b5d4b]">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="h-[44px] w-full rounded-lg border border-[#e4d5b8] bg-[#f4ecdd] px-3.5 text-[13px] text-[#8a7b66] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="mt-2 h-[46px] rounded-lg bg-[#d97706] text-[13px] font-bold text-white transition-colors hover:bg-[#b45309] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
