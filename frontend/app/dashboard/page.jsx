'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { getRoleRedirectPath } from '@/lib/roleRedirect';

export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (!token || !user) {
      router.replace('/login');
      return;
    }

    router.replace(getRoleRedirectPath(user.role));
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3.5 bg-[#f5f7fb] font-sans text-[13px] text-[#667085]">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e5e7eb] border-t-[#667eea]" />
      <p>Redirecting to your dashboard...</p>
    </div>
  );
}
