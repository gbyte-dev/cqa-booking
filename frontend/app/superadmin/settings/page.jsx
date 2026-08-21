'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuperAdminSidebar from '@/components/SuperAdminSidebar';
import { storage } from '@/lib/storage';

export default function SuperAdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    platformName: 'CQA Booking',
    supportEmail: 'support@cqabooking.com',
    currency: 'USD',
    defaultTimezone: 'UTC',
    allowNewRegistrations: true,
    maintenanceMode: false,
  });

  const token = storage.getToken();
  const currentUser = storage.getUser();

  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'superadmin') {
      router.push('/superadmin/login');
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const local = localStorage.getItem('cqa-platform-settings');
      if (local) {
        setSettings({ ...settings, ...JSON.parse(local) });
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('cqa-platform-settings', JSON.stringify(settings));
      setTimeout(() => {
        setSaving(false);
        alert('✅ Settings saved successfully');
      }, 500);
    } catch (error) {
      setSaving(false);
      alert('❌ Error saving settings: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-layout">
        <SuperAdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="settings-main-wrapper">
          <Header title="Settings" onMenuClick={() => setSidebarOpen(true)} />

          <main className="settings-content">
            <div className="page-header">
              <div>
                <h2>Platform Settings</h2>
                <p>Configure global platform preferences.</p>
              </div>
            </div>

            {/* General */}
            <div className="panel">
              <div className="panel-header">
                <h3>General</h3>
                <span>Platform identity</span>
              </div>

              <div className="settings-body">
                <div className="form-group">
                  <label>Platform Name</label>
                  <input
                    type="text"
                    value={settings.platformName}
                    onChange={(e) => handleChange('platformName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Support Email</label>
                  <input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Regional */}
            <div className="panel">
              <div className="panel-header">
                <h3>Regional Preferences</h3>
                <span>Currency & timezone</span>
              </div>

              <div className="settings-body">
                <div className="form-group">
                  <label>Default Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="AUD">AUD — Australian Dollar</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Default Timezone</label>
                  <select
                    value={settings.defaultTimezone}
                    onChange={(e) => handleChange('defaultTimezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="Australia/Sydney">Australia/Sydney</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Platform Controls */}
            <div className="panel">
              <div className="panel-header">
                <h3>Platform Controls</h3>
                <span>Access & availability</span>
              </div>

              <div className="settings-body">
                <div className="toggle-row">
                  <div>
                    <strong>Allow New Registrations</strong>
                    <span>Let new organizations sign up</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.allowNewRegistrations}
                      onChange={(e) => handleChange('allowNewRegistrations', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-row">
                  <div>
                    <strong>Maintenance Mode</strong>
                    <span>Temporarily disable platform access</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            {/* Save */}
            <div className="save-bar">
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </main>

          <Footer />
        </div>
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }

        .settings-page {
          min-height: 100vh;
          background: var(--sa-bg, #f5f7fb);
          color: var(--sa-text, #171c2d);
          font-family: Inter, sans-serif;
        }

        .settings-layout { display: flex; min-height: 100vh; }

        .settings-main-wrapper {
          flex: 1;
          min-width: 0;
          margin-left: var(--sa-sidebar-width, 260px);
          display: flex;
          flex-direction: column;
        }

        .settings-content { flex: 1; padding: 28px; max-width: 900px; }

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

        .settings-body { padding: 22px; }

        .form-group { margin-bottom: 18px; }
        .form-group:last-child { margin-bottom: 0; }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--sa-text-secondary, #667085);
          font-size: 12px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select {
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

        .form-group input:focus,
        .form-group select:focus {
          border-color: var(--sa-primary, #667eea);
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid var(--sa-border-light, #edf0f4);
        }

        .toggle-row:last-child { border-bottom: none; }

        .toggle-row strong {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }

        .toggle-row span {
          color: var(--sa-text-muted, #98a2b3);
          font-size: 12px;
        }

        .switch {
          position: relative;
          width: 46px;
          height: 26px;
          flex-shrink: 0;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          background: var(--sa-border, #e5e7eb);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider::before {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          left: 3px;
          top: 3px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          transition: transform 0.2s ease;
        }

        .switch input:checked + .slider {
          background: var(--sa-primary, #667eea);
        }

        .switch input:checked + .slider::before {
          transform: translateX(20px);
        }

        .save-bar {
          display: flex;
          justify-content: flex-end;
        }

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

        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .settings-main-wrapper { margin-left: 220px; }
        }

        @media (max-width: 768px) {
          .settings-main-wrapper { margin-left: 0; }
          .settings-content { padding: 18px 14px; }
        }
      `}</style>
    </div>
  );
}
