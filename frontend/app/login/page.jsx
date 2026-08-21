'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function LoginRedirectPage() {
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
      router.replace('/tenant/login');
    }
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f7fb',
      color: '#667085',
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
      gap: '14px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid #e5e7eb',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p>Redirecting...</p>
    </div>
  );
}
