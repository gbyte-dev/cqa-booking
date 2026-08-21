'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import './staff.css';

export default function TenantStaffPage() {
  const router = useRouter();
  const mountedRef = useRef(false);

  const [staff, setStaff] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'staff',
    phone: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = storage.getToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // ✅ Load once on mount only
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!token) {
      router.replace('/tenant/login');
      return;
    }

    loadStaff();
  }, []); // ✅ Empty dependency array

  const loadStaff = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();

      if (data.success) {
        setStaff(data.data || []);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/staff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, password: 'Staff@123' })
      });
      const data = await response.json();

      if (data.success) {
        alert('✅ Staff member added successfully');
        setShowForm(false);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          role: 'staff',
          phone: ''
        });
        loadStaff();
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to add staff'));
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const getInitial = (name = '') => name?.charAt(0)?.toUpperCase() || 'S';

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Staff...</span>
      </div>
    );
  }

  return (
    <>

          <main className="staff-content">
            <div className="page-header">
              <div>
                <h2>👥 Manage Staff</h2>
                <p>Add and manage your team members.</p>
              </div>
              <button className="add-btn" onClick={() => setShowForm(true)}>
                ➕ Add Staff
              </button>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Team Members</h3>
                <span>{staff.length} total</span>
              </div>

              {staff.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👤</div>
                  <p>No staff members found</p>
                  <button className="add-btn" onClick={() => setShowForm(true)}>
                    ➕ Add First Staff
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(member => (
                        <tr key={member.id}>
                          <td>
                            <div className="member-cell">
                              <div className="member-avatar">
                                {getInitial(member.firstName || member.name)}
                              </div>
                              <div>
                                <strong>{member.firstName} {member.lastName}</strong>
                              </div>
                            </div>
                          </td>
                          <td>{member.email || 'N/A'}</td>
                          <td>
                            <span className="role-badge">
                              {member.role || 'staff'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${member.status === 'active' ? 'active' : 'inactive'}`}>
                              {member.status === 'active' ? '✅ Active' : '⛔ Inactive'}
                            </span>
                          </td>
                          <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
      </main>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add Staff Member</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="staff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="host">Host</option>
                    <option value="waiter">Waiter</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={formLoading}>
                  {formLoading ? '⏳ Adding...' : '➕ Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .staff-page { min-height: 100vh; background: var(--tenant-bg, #f5f7fb); color: var(--tenant-text, #171c2d); }
        .staff-layout { display: flex; min-height: 100vh; }
        .staff-main-wrapper { flex: 1; min-width: 0; margin-left: var(--tenant-sidebar-width, 260px); display: flex; flex-direction: column; }
        .staff-content { flex: 1; padding: 28px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--tenant-text-secondary, #667085); }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid var(--tenant-border, #e5e7eb); border-top-color: var(--tenant-primary, #667eea); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
        .page-header h2 { margin: 0; font-size: 26px; color: var(--tenant-text, #171c2d); }
        .page-header p { margin: 6px 0 0; color: var(--tenant-text-secondary, #667085); font-size: 13px; }
        .add-btn { height: 42px; padding: 0 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--tenant-primary, #667eea) 0%, #764ba2 100%); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35); }
        .panel { background: var(--tenant-surface, #fff); border: 1px solid var(--tenant-border-light, #edf0f4); border-radius: 12px; overflow: hidden; box-shadow: var(--tenant-shadow-sm, 0 2px 8px rgba(15,23,42,0.05)); }
        .panel-header { padding: 0 22px; min-height: 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--tenant-border, #e5e7eb); }
        .panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--tenant-text, #171c2d); }
        .panel-header span { color: var(--tenant-text-secondary, #667085); font-size: 12px; }
        .table-container { overflow-x: auto; }
        .staff-table { width: 100%; border-collapse: collapse; }
        .staff-table th { padding: 13px 18px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--tenant-text-secondary, #667085); background: var(--tenant-surface-2, #f8f9fc); border-bottom: 1px solid var(--tenant-border, #e5e7eb); }
        .staff-table td { padding: 14px 18px; color: var(--tenant-text, #171c2d); border-bottom: 1px solid var(--tenant-border-light, #edf0f4); }
        .staff-table tbody tr { transition: background 0.2s ease; }
        .staff-table tbody tr:hover td { background: var(--tenant-surface-hover, #f1f4f9); }
        .member-cell { display: flex; align-items: center; gap: 12px; }
        .member-avatar { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: linear-gradient(135deg, var(--tenant-primary, #667eea), #764ba2); color: #fff; font-weight: 700; }
        .role-badge { padding: 4px 10px; border-radius: 12px; background: var(--tenant-primary-light, #eef1ff); color: var(--tenant-primary, #667eea); font-size: 11px; font-weight: 600; }
        .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .status-badge.active { background: var(--tenant-success-bg, #dcfce7); color: var(--tenant-success, #16a34a); }
        .status-badge.inactive { background: var(--tenant-danger-bg, #fee2e2); color: var(--tenant-danger, #dc3545); }
        .empty-state { padding: 60px 20px; text-align: center; color: var(--tenant-text-secondary, #667085); }
        .empty-icon { font-size: 34px; margin-bottom: 12px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); display: flex; align-items: center; justify-content: center; z-index: 300; backdrop-filter: blur(3px); }
        .modal { width: 100%; max-width: 480px; background: var(--tenant-surface, #fff); color: var(--tenant-text, #171c2d); border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 12px; padding: 24px; animation: modalIn 0.18s ease; }
        @keyframes modalIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
        .modal-header h2 { margin: 0; font-size: 18px; color: var(--tenant-text, #171c2d); }
        .close-btn { width: 32px; height: 32px; border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 8px; background: var(--tenant-surface-2, #f8f9fc); color: var(--tenant-text-secondary, #667085); cursor: pointer; transition: all 0.2s ease; }
        .close-btn:hover { background: var(--tenant-surface-hover, #f1f4f9); color: var(--tenant-text, #171c2d); border-color: var(--tenant-primary, #667eea); }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 7px; color: var(--tenant-text-secondary, #667085); font-size: 12px; font-weight: 600; }
        .form-group input, .form-group select { width: 100%; height: 42px; padding: 0 12px; border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 8px; background: var(--tenant-surface, #fff); color: var(--tenant-text, #171c2d); font-size: 13px; font-family: inherit; transition: all 0.2s ease; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: var(--tenant-primary, #667eea); box-shadow: 0 0 0 3px var(--tenant-primary-light, rgba(102,126,234,0.12)); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn-cancel { height: 42px; padding: 0 16px; border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 8px; background: var(--tenant-surface, #fff); color: var(--tenant-text, #171c2d); cursor: pointer; transition: all 0.2s ease; }
        .btn-cancel:hover { background: var(--tenant-surface-hover, #f8f9fc); }
        .btn-submit { height: 42px; padding: 0 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--tenant-primary, #667eea) 0%, #764ba2 100%); color: #fff; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35); }
        .btn-submit:disabled, .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 900px) {
          .staff-main-wrapper { margin-left: 0; }
          .staff-content { padding: 18px 14px; }
          .page-header { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}