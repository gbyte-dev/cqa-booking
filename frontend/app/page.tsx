'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { storage } from '@/lib/storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = storage.getToken();
    if (token) {
      router.push('/dashboard');
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        🎯 CQA Booking Platform
      </h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '30px' }}>
        Multi-tenant Restaurant & Venue Booking System
      </p>

      <div style={{ display: 'flex', gap: '20px' }}>
        <button
          onClick={() => router.push('/login')}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔐 Login
        </button>
        <button
          onClick={() => router.push('/register')}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📝 Register
        </button>
      </div>

      <div style={{
        marginTop: '60px',
        maxWidth: '600px',
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px'
      }}>
        <h2>✨ Features</h2>
        <ul style={{ textAlign: 'left', fontSize: '16px', lineHeight: '2' }}>
          <li>✅ Multi-tenant Architecture</li>
          <li>✅ User Registration & Login</li>
          <li>✅ Venue Management</li>
          <li>✅ Table Management</li>
          <li>✅ Booking System</li>
          <li>✅ Availability Checking</li>
          <li>✅ Check-in/Check-out</li>
        </ul>
      </div>
    </div>
  );
}