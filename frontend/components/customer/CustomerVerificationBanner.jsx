'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { storage } from '@/lib/storage';
import { authAPI } from '@/lib/api';
import { notifySuccess, notifyError } from '@/lib/alerts';

// Non-intrusive banner shown ONLY for a logged-in CUSTOMER whose email is not
// yet verified. Derives "is this a customer, are they logged in" strictly
// from real auth state (storage token + user), never assumed — so it can
// never render for a guest or for a tenant/superadmin user.
export default function CustomerVerificationBanner() {
  const [user, setUser] = useState(null);
  const [resending, setResending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setUser(storage.getUser());

    const onUserUpdated = (e) => setUser(e.detail ?? null);
    window.addEventListener('cqa-user-updated', onUserUpdated);
    return () => window.removeEventListener('cqa-user-updated', onUserUpdated);
  }, []);

  const token = storage.getToken();
  const isLoggedInCustomer = !!token && !!user && user.role === 'customer';
  const isUnverified = isLoggedInCustomer && user.isEmailVerified === false;

  if (!isUnverified || dismissed) return null;

  const handleResend = async () => {
    if (resending || !user?.email) return;
    setResending(true);
    try {
      const result = await authAPI.resendVerification(user.email);
      if (result.success) {
        notifySuccess(result.message || 'Verification email sent. Please check your inbox.');
      } else {
        notifyError(result.error || 'Could not resend verification email.');
      }
    } catch {
      notifyError('Could not resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 border-b border-[#fbbf24]/30 bg-[#fffbeb] px-4 py-2.5 text-center text-[13px] text-[#92400e]">
      <span className="flex items-center gap-2">
        <AlertTriangle size={15} className="flex-shrink-0" />
        Please verify your email address to unlock all features.
      </span>
      <button
        type="button"
        onClick={handleResend}
        disabled={resending}
        className="inline-flex items-center gap-1.5 rounded-md bg-[#d97706] px-3 py-1 text-[12px] font-semibold text-white transition-colors hover:bg-[#b45309] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {resending ? <RefreshCw size={13} className="animate-spin" /> : <RefreshCw size={13} />}
        {resending ? 'Sending...' : 'Resend email'}
      </button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-[11px] font-medium text-[#92400e]/70 underline hover:text-[#92400e]"
      >
        Dismiss
      </button>
    </div>
  );
}
