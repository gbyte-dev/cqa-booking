'use client';
import { notify } from '@/lib/alerts';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function SuperAdminProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'superadmin',
  });

  const token = storage.getToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const currentUser = storage.getUser();
    if (!token || !currentUser || currentUser.role !== 'superadmin') {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/api/v1/profile/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile({
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            email: data.data.email || '',
            role: data.data.role || 'superadmin',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/profile/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName })
      });
      const data = await response.json();
      if (data.success) {
        const currentUser = storage.getUser();
        if (currentUser) {
          storage.setUser({ ...currentUser, firstName: data.data.firstName, lastName: data.data.lastName });
        }
        // Header lives outside this page and only reads the stored user once
        // on mount, so it needs an explicit nudge to pick up the new name.
        window.dispatchEvent(new Event('app-profile-updated'));
        notify('Profile updated successfully');
      } else {
        notify(data.error || 'Failed to update profile');
      }
    } catch (error) {
      notify('Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="profile-content">
        <div className="page-header">
          <div>
            <h2>My Profile</h2>
            <p>Manage your administrator account details.</p>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Account Information</h3>
            <span>Personal details</span>
          </div>

          <div className="profile-body">
            <div className="avatar-row">
              <div className="avatar-large">
                {profile.firstName?.charAt(0)?.toUpperCase() || 'S'}
              </div>
              <div>
                <strong>{profile.firstName} {profile.lastName}</strong>
                <span className="role-badge">Super Administrator</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
                title="Email cannot be changed here"
              />
            </div>

            <div className="form-group">
              <label>Role</label>
              <input type="text" value="Super Administrator" disabled />
            </div>
          </div>
        </div>

        <div className="save-bar">
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </main>

      <style jsx>{`
        * { box-sizing: border-box; }

        .profile-page {
          min-height: 100vh;
          background: var(--sa-bg, #f5f7fb);
          color: var(--sa-text, #171c2d);
          font-family: Inter, sans-serif;
        }

        .profile-layout { display: flex; min-height: 100vh; }

        .profile-main-wrapper {
          flex: 1;
          min-width: 0;
          margin-left: var(--sa-sidebar-width, 260px);
          display: flex;
          flex-direction: column;
        }

        .profile-content { flex: 1; padding: 28px; max-width: 800px; }

        .loading-state {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: var(--sa-text-secondary, #667085);
          font-size: 13px;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 4px solid var(--sa-border, #e5e7eb);
          border-top-color: var(--sa-primary, #667eea);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .page-header { margin-bottom: 24px; }

        .page-header h2 {
          margin: 0;
          font-size: 26px;
          letter-spacing: -0.5px;
        }

        .page-header p {
          margin: 6px 0 0;
          color: var(--sa-text-secondary, #667085);
          font-size: 13px;
        }

        .panel {
          background: var(--sa-surface, #fff);
          border: 1px solid var(--sa-border-light, #edf0f4);
          border-radius: var(--sa-radius-lg, 14px);
          box-shadow: var(--sa-shadow-sm, 0 2px 8px rgba(15,23,42,0.05));
          margin-bottom: 22px;
          overflow: hidden;
        }

        .panel-header {
          min-height: 60px;
          padding: 0 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--sa-border, #e5e7eb);
        }

        .panel-header h3 { margin: 0; font-size: 15px; }
        .panel-header span { color: var(--sa-text-muted, #98a2b3); font-size: 11px; }

        .profile-body { padding: 24px 22px; }

        .avatar-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 26px;
          padding-bottom: 22px;
          border-bottom: 1px solid var(--sa-border-light, #edf0f4);
        }

        .avatar-large {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: linear-gradient(135deg, var(--sa-primary, #667eea), #764ba2);
          color: #fff;
          font-size: 24px;
          font-weight: 800;
        }

        .avatar-row strong {
          display: block;
          font-size: 17px;
          margin-bottom: 6px;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 999px;
          background: var(--sa-primary-light, #eef1ff);
          color: var(--sa-primary, #667eea);
          font-size: 11px;
          font-weight: 700;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group { margin-bottom: 18px; }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--sa-text-secondary, #667085);
          font-size: 12px;
          font-weight: 600;
        }

        .form-group input {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border: 1px solid var(--sa-border, #e5e7eb);
          border-radius: var(--sa-radius-sm, 7px);
          background: var(--sa-surface, #fff);
          color: var(--sa-text, #171c2d);
          font-size: 13px;
          outline: none;
          transition: all 0.2s;
        }

        .form-group input:focus {
          border-color: var(--sa-primary, #667eea);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group input:disabled {
          background: var(--sa-surface-2, #f8f9fc);
          color: var(--sa-text-muted, #98a2b3);
        }

        .save-bar { display: flex; justify-content: flex-end; }

        .save-btn {
          height: 46px;
          padding: 0 28px;
          border: none;
          border-radius: var(--sa-radius-sm, 7px);
          background: var(--sa-primary, #667eea);
          color: #fff;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-btn:hover:not(:disabled) {
          background: var(--sa-primary-dark, #5568d9);
          transform: translateY(-1px);
        }

        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        @media (max-width: 900px) {
          .profile-main-wrapper { margin-left: 220px; }
        }

        @media (max-width: 768px) {
          .profile-main-wrapper { margin-left: 0; }
          .profile-content { padding: 18px 14px; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
