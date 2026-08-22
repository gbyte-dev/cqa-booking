'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function RegisterRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
      if (user.role === 'superadmin') {
        router.replace('/superadmin/dashboard');
      } else {
        router.replace('/tenant/dashboard');
      }
    } else {
      router.replace('/tenant/register');
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3.5 bg-[#f5f7fb] font-sans text-[13px] text-[#667085]">
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e5e7eb] border-t-[#667eea]" />
      <p>Redirecting...</p>
    </div>
  );
}
