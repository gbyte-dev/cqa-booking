'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function TenantSettingsPage() {
  const router = useRouter();
  const mountedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    businessName: '',
    contactEmail: '',
    defaultTimezone: 'UTC',
    bookingConfirmationEmails: true,
    smsReminders: false
  });

  const token = storage.getToken();

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!token) {
      router.replace('/tenant/login');
      return;
    }

    try {
      const local = localStorage.getItem('cqa-tenant-settings');
      if (local) {
        setSettings(prev => ({ ...prev, ...JSON.parse(local) }));
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSaving(true);
    try {
      localStorage.setItem('cqa-tenant-settings', JSON.stringify(settings));
      setTimeout(() => {
        setSaving(false);
        alert('✅ Settings saved successfully');
      }, 400);
    } catch (error) {
      setSaving(false);
      alert('❌ Error saving settings: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Settings...</span>
      </div>
    );
  }

  return (
    <>
      <main className="settings-content">
            <div className="page-header">
              <h2>⚙️ Settings</h2>
              <p>Manage your business preferences.</p>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Business Details</h3>
              </div>
              <div className="settings-body">
                <div className="form-group">
                  <label>Business Name</label>
                  <input
                    type="text"
                    value={settings.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    placeholder="e.g. Pizza Palace"
                  />
                </div>
                <div className="form-group">
                  <label>Contact Email</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    placeholder="you@business.com"
                  />
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
                  </select>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Notifications</h3>
              </div>
              <div className="settings-body">
                <div className="toggle-row">
                  <div>
                    <strong>Booking Confirmation Emails</strong>
                    <span>Email customers when a booking is confirmed</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.bookingConfirmationEmails}
                      onChange={(e) => handleChange('bookingConfirmationEmails', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="toggle-row">
                  <div>
                    <strong>SMS Reminders</strong>
                    <span>Send SMS reminders before a booking</span>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.smsReminders}
                      onChange={(e) => handleChange('smsReminders', e.target.checked)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="save-bar">
              <button className="save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
      </main>

      <style jsx>{`
        .settings-page { min-height: 100vh; background: var(--tenant-bg, #f5f7fb); color: var(--tenant-text, #171c2d); }
        .settings-layout { display: flex; min-height: 100vh; }
        .settings-main-wrapper { flex: 1; min-width: 0; margin-left: var(--tenant-sidebar-width, 260px); display: flex; flex-direction: column; }
        .settings-content { flex: 1; padding: 28px; max-width: 700px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--tenant-text-secondary, #667085); }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid var(--tenant-border, #e5e7eb); border-top-color: var(--tenant-primary, #667eea); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { margin-bottom: 24px; }
        .page-header h2 { margin: 0; font-size: 26px; color: var(--tenant-text, #171c2d); }
        .page-header p { margin: 6px 0 0; color: var(--tenant-text-secondary, #667085); font-size: 13px; }
        .panel { background: var(--tenant-surface, #fff); border: 1px solid var(--tenant-border-light, #edf0f4); border-radius: 12px; margin-bottom: 20px; overflow: hidden; box-shadow: var(--tenant-shadow-sm, 0 2px 8px rgba(15,23,42,0.05)); transition: box-shadow 0.2s ease; }
        .panel:hover { box-shadow: var(--tenant-shadow-md, 0 8px 24px rgba(15,23,42,0.08)); }
        .panel-header { padding: 0 22px; min-height: 56px; display: flex; align-items: center; border-bottom: 1px solid var(--tenant-border, #e5e7eb); }
        .panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--tenant-text, #171c2d); }
        .settings-body { padding: 22px; }
        .form-group { margin-bottom: 16px; }
        .form-group:last-child { margin-bottom: 0; }
        .form-group label { display: block; margin-bottom: 7px; color: var(--tenant-text-secondary, #667085); font-size: 12px; font-weight: 600; }
        .form-group input, .form-group select { width: 100%; height: 42px; padding: 0 12px; border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 8px; background: var(--tenant-surface, #fff); color: var(--tenant-text, #171c2d); font-size: 13px; font-family: inherit; transition: all 0.2s ease; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--tenant-primary, #667eea); box-shadow: 0 0 0 3px var(--tenant-primary-light, rgba(102,126,234,0.12)); }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 14px 0; border-bottom: 1px solid var(--tenant-border-light, #edf0f4); }
        .toggle-row:last-child { border-bottom: none; }
        .toggle-row strong { display: block; font-size: 14px; margin-bottom: 4px; color: var(--tenant-text, #171c2d); }
        .toggle-row span { color: var(--tenant-text-muted, #98a2b3); font-size: 12px; }
        .switch { position: relative; width: 46px; height: 26px; flex-shrink: 0; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; inset: 0; border-radius: 999px; background: var(--tenant-border, #e5e7eb); cursor: pointer; transition: all 0.2s ease; }
        .slider::before { content: ""; position: absolute; width: 20px; height: 20px; left: 3px; top: 3px; border-radius: 50%; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: transform 0.2s ease; }
        .switch input:checked + .slider { background: var(--tenant-primary, #667eea); }
        .switch input:checked + .slider::before { transform: translateX(20px); }
        .save-bar { display: flex; justify-content: flex-end; }
        .save-btn { height: 46px; padding: 0 28px; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--tenant-primary, #667eea) 0%, #764ba2 100%); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
        .save-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35); }
        .save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 900px) {
          .settings-main-wrapper { margin-left: 0; }
          .settings-content { padding: 18px 14px; }
        }
      `}</style>
    </>
  );
}
