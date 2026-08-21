'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';
import { storage } from '@/lib/storage';
import './staff.css';

export default function TenantStaffPage() {
  const router = useRouter();
  const mountedRef = useRef(false);
  
  const [staff, setStaff] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      const response = await fetch(`${API_URL}/api/v1/users`, {
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
      const response = await fetch(`${API_URL}/api/v1/users`, {
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
      <div className="staff-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Staff...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-page">
      <div className="staff-layout">
        <TenantSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="staff-main-wrapper">
          <Header title="Staff" onMenuClick={() => setSidebarOpen(true)} />

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

          <Footer />
        </div>
      </div>

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
        .staff-page { min-height: 100vh; background: var(--t-bg, #f5f7fb); }
        .staff-layout { display: flex; min-height: 100vh; }
        .staff-main-wrapper { flex: 1; min-width: 0; margin-left: 260px; display: flex; flex-direction: column; }
        .staff-content { flex: 1; padding: 28px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid #e5e7eb; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
        .page-header h2 { margin: 0; font-size: 26px; }
        .page-header p { margin: 6px 0 0; color: #667085; font-size: 13px; }
        .add-btn { height: 42px; padding: 0 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
        .panel { background: #fff; border: 1px solid #edf0f4; border-radius: 12px; overflow: hidden; }
        .panel-header { padding: 0 22px; min-height: 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e5e7eb; }
        .panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
        .table-container { overflow-x: auto; }
        .staff-table { width: 100%; border-collapse: collapse; }
        .staff-table th { padding: 13px 18px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #e5e7eb; }
        .staff-table td { padding: 14px 18px; border-bottom: 1px solid #edf0f4; }
        .member-cell { display: flex; align-items: center; gap: 12px; }
        .member-avatar { width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: linear-gradient(135deg, #eef1ff 0%, #f3e8ff 100%); color: #667eea; font-weight: 700; }
        .role-badge { padding: 4px 10px; border-radius: 12px; background: #eef1ff; color: #667eea; font-size: 11px; font-weight: 600; }
        .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .status-badge.active { background: #dcfce7; color: #16a34a; }
        .status-badge.inactive { background: #fee2e2; color: #dc3545; }
        .empty-state { padding: 60px 20px; text-align: center; }
        .empty-icon { font-size: 34px; margin-bottom: 12px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 300; }
        .modal { width: 100%; max-width: 480px; background: #fff; border-radius: 12px; padding: 24px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
        .modal-header h2 { margin: 0; font-size: 18px; }
        .close-btn { width: 32px; height: 32px; border: none; border-radius: 8px; background: #f8f9fc; cursor: pointer; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 7px; color: #667085; font-size: 12px; font-weight: 600; }
        .form-group input, .form-group select { width: 100%; height: 42px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-family: inherit; }
        .form-group input:focus, .form-group select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
        .btn-cancel { height: 42px; padding: 0 16px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; cursor: pointer; }
        .btn-cancel:hover { background: #f8f9fc; }
        .btn-submit { height: 42px; padding: 0 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-weight: 700; cursor: pointer; }
        .btn-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
        .btn-submit:disabled, .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
        @media (max-width: 900px) {
          .staff-main-wrapper { margin-left: 0; }
          .staff-content { padding: 18px 14px; }
          .page-header { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}