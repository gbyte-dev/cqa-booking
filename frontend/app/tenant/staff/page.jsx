'use client';
import AppIcon from '@/components/AppIcon';
import { notify, confirmAction } from '@/lib/alerts';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function TenantStaffPage() {
  const router = useRouter();
  const mountedRef = useRef(false);

  const [activeTab, setActiveTab] = useState('managers'); // 'managers' | 'staff'

  const [staff, setStaff] = useState([]);
  const [managers, setManagers] = useState([]);
  const [venues, setVenues] = useState([]);

  const [managerFilter, setManagerFilter] = useState('');

  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [managerDetail, setManagerDetail] = useState(null);

  const [editTarget, setEditTarget] = useState(null); // the member being edited (has .role)
  const [editFormData, setEditFormData] = useState({ firstName: '', lastName: '', phone: '', outletId: '', managerId: '' });

  const [staffFormData, setStaffFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', managerId: ''
  });
  const [managerFormData, setManagerFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', outletId: ''
  });

  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = storage.getToken();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    if (!token) {
      router.replace('/login');
      return;
    }

    const currentUser = storage.getUser();
    if (currentUser && !['owner'].includes(currentUser.role)) {
      router.replace('/tenant/dashboard');
      return;
    }

    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStaff(), loadManagers(), loadVenues()]);
    setLoading(false);
  };

  const loadStaff = async (managerId) => {
    try {
      const url = managerId
        ? `${API_URL}/api/v1/staff?managerId=${managerId}`
        : `${API_URL}/api/v1/staff`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) setStaff(data.data || []);
    } catch (error) {}
  };

  const loadManagers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/staff/managers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setManagers(data.data || []);
    } catch (error) {}
  };

  const loadVenues = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setVenues(data.data || []);
    } catch (error) {}
  };

  const handleManagerFilterChange = (e) => {
    const value = e.target.value;
    setManagerFilter(value);
    loadStaff(value || undefined);
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffFormData.managerId) {
      notify('Please choose a manager to assign this staff member under.');
      return;
    }
    const manager = managers.find(m => m.id === staffFormData.managerId);
    if (!manager || !manager.outletId) {
      notify('Selected manager has no venue assigned.');
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: staffFormData.firstName,
          lastName: staffFormData.lastName,
          email: staffFormData.email,
          phone: staffFormData.phone,
          role: 'staff',
          outletId: manager.outletId,
          password: 'Staff@123'
        })
      });
      const data = await response.json();

      if (data.success) {
        notify('Staff member added successfully');
        setShowStaffForm(false);
        setStaffFormData({ firstName: '', lastName: '', email: '', phone: '', managerId: '' });
        loadStaff(managerFilter || undefined);
        loadManagers();
      } else {
        notify('Error: ' + (data.error || 'Failed to add staff'));
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCreateManager = async (e) => {
    e.preventDefault();
    if (!managerFormData.outletId) {
      notify('Please choose a venue for this manager.');
      return;
    }

    setFormLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: managerFormData.firstName,
          lastName: managerFormData.lastName,
          email: managerFormData.email,
          phone: managerFormData.phone,
          role: 'manager',
          outletId: managerFormData.outletId,
          password: 'Staff@123'
        })
      });
      const data = await response.json();

      if (data.success) {
        notify('Manager assigned successfully');
        setShowManagerForm(false);
        setManagerFormData({ firstName: '', lastName: '', email: '', phone: '', outletId: '' });
        loadManagers();
      } else {
        notify('Error: ' + (data.error || 'Failed to assign manager'));
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const openManagerDetail = async (manager) => {
    // Fetch fresh (unfiltered by whatever the Staff tab's manager-filter
    // is currently set to) so the drill-down always shows this manager's
    // real team, not whatever happens to be in the `staff` state.
    setManagerDetail({ ...manager, teamMembers: [] });
    try {
      const response = await fetch(`${API_URL}/api/v1/staff?managerId=${manager.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setManagerDetail({ ...manager, teamMembers: data.success ? data.data : [] });
    } catch (error) {
      setManagerDetail({ ...manager, teamMembers: [] });
    }
  };

  const handleEditClick = (member) => {
    setEditTarget(member);
    if (member.role === 'manager') {
      setEditFormData({ firstName: member.firstName || '', lastName: member.lastName || '', phone: member.phone || '', outletId: member.venueId || '', managerId: '' });
    } else {
      // Staff: reassignment happens by picking a manager (venue is derived
      // from that manager), same as at creation time.
      const currentManager = managers.find(m => m.fullName === member.managerName);
      setEditFormData({ firstName: member.firstName || '', lastName: member.lastName || '', phone: member.phone || '', outletId: '', managerId: currentManager?.id || '' });
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let outletId = editFormData.outletId;
      if (editTarget.role === 'staff') {
        const manager = managers.find(m => m.id === editFormData.managerId);
        if (!manager || !manager.outletId) {
          notify('Please choose a manager with an assigned venue.');
          setFormLoading(false);
          return;
        }
        outletId = manager.outletId;
      }

      const response = await fetch(`${API_URL}/api/v1/staff/${editTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          phone: editFormData.phone,
          outletId
        })
      });
      const data = await response.json();

      if (data.success) {
        notify('Updated successfully');
        setEditTarget(null);
        loadStaff(managerFilter || undefined);
        loadManagers();
      } else {
        notify('Error: ' + (data.error || 'Failed to update'));
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleSuspendToggle = async (member) => {
    const suspending = member.status === 'active';
    const confirmed = await confirmAction({
      title: `${suspending ? 'Suspend' : 'Reactivate'} ${member.firstName} ${member.lastName}?`,
      text: suspending
        ? 'They will no longer be able to log in until reactivated.'
        : 'They will be able to log in again.',
      confirmText: suspending ? 'Suspend' : 'Reactivate',
      danger: suspending
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/staff/${member.id}/${suspending ? 'suspend' : 'reactivate'}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        notify(suspending ? 'Suspended' : 'Reactivated');
        loadStaff(managerFilter || undefined);
        loadManagers();
      } else {
        notify('Error: ' + (data.error || 'Action failed'));
      }
    } catch (error) {
      notify('Error: ' + error.message);
    }
  };

  const handleDelete = async (member) => {
    const confirmed = await confirmAction({
      title: `Delete ${member.firstName} ${member.lastName}?`,
      text: 'This action cannot be undone.',
      confirmText: 'Delete',
      danger: true
    });
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/v1/staff/${member.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        notify('Deleted successfully');
        loadStaff(managerFilter || undefined);
        loadManagers();
      } else {
        notify('Error: ' + (data.error || 'Delete failed'));
      }
    } catch (error) {
      notify('Error: ' + error.message);
    }
  };

  const getInitial = (name = '') => name?.charAt(0)?.toUpperCase() || 'S';

  // The Staff tab shows only role='staff' rows — Managers get their own
  // tab, and Owner is never listed here. The `/api/v1/staff` endpoint
  // returns all of owner/manager/staff together, so this filter is what
  // actually separates the two tabs' content.
  const staffOnly = staff.filter(member => member.role === 'staff');

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
            <h2><AppIcon name="users" /> Manage Team</h2>
            <p>Assign venue managers and add staff under them.</p>
          </div>
          {activeTab === 'staff' ? (
            <button className="add-btn" onClick={() => setShowStaffForm(true)}>
              <AppIcon name="add" /> Add Staff
            </button>
          ) : (
            <button className="add-btn" onClick={() => setShowManagerForm(true)}>
              <AppIcon name="add" /> Assign Manager
            </button>
          )}
        </div>

        {/* TABS */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'managers' ? 'active' : ''}`}
            onClick={() => setActiveTab('managers')}
          >
            Managers
          </button>
          <button
            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            Staff
          </button>
        </div>

        {activeTab === 'staff' ? (
          <div className="panel">
            <div className="panel-header">
              <h3>Team Members</h3>
              <div className="panel-header-actions">
                <select
                  className="filter-select"
                  value={managerFilter}
                  onChange={handleManagerFilterChange}
                >
                  <option value="">All Staff</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName} — {m.venueName || 'No venue'}</option>
                  ))}
                </select>
                <span>{staffOnly.length} total</span>
              </div>
            </div>

            {staffOnly.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><AppIcon name="user" /></div>
                <p>No staff members found</p>
                <button className="add-btn" onClick={() => setShowStaffForm(true)}>
                  <AppIcon name="add" /> Add First Staff
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Venue</th>
                      <th>Manager</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staffOnly.map(member => (
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
                        <td>{member.venueName ? <span className="venue-badge">{member.venueName}</span> : '—'}</td>
                        <td>{member.managerName || (member.venueName ? <span style={{ color: 'var(--tenant-text-secondary, #667085)' }}>{member.venueName} (unmanaged)</span> : '—')}</td>
                        <td>
                          <span className={`status-badge ${member.status === 'active' ? 'active' : 'inactive'}`}>
                            {member.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{member.created_at ? new Date(member.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div className="row-actions">
                            <button className="view-btn" onClick={() => handleEditClick(member)} title="Edit">
                              <AppIcon name="edit" />
                            </button>
                            <button className="view-btn" onClick={() => handleSuspendToggle(member)} title={member.status === 'active' ? 'Suspend' : 'Reactivate'}>
                              <AppIcon name={member.status === 'active' ? 'lock' : 'checkCircle'} />
                            </button>
                            <button className="view-btn danger" onClick={() => handleDelete(member)} title="Delete">
                              <AppIcon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="panel">
            <div className="panel-header">
              <h3>Venue Managers</h3>
              <span>{managers.length} total</span>
            </div>

            {managers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><AppIcon name="user" /></div>
                <p>No managers assigned yet</p>
                <button className="add-btn" onClick={() => setShowManagerForm(true)}>
                  <AppIcon name="add" /> Assign First Manager
                </button>
              </div>
            ) : (
              <div className="table-container">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Venue</th>
                      <th>Team Size</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managers.map(manager => (
                      <tr key={manager.id}>
                        <td>
                          <div className="member-cell">
                            <div className="member-avatar">
                              {getInitial(manager.firstName || manager.fullName)}
                            </div>
                            <div>
                              <strong>{manager.firstName} {manager.lastName}</strong>
                            </div>
                          </div>
                        </td>
                        <td>{manager.email || 'N/A'}</td>
                        <td>{manager.venueName ? <span className="venue-badge">{manager.venueName}</span> : '—'}</td>
                        <td>{manager.teamSize || 0} Staff</td>
                        <td>
                          <span className={`status-badge ${manager.status === 'active' ? 'active' : 'inactive'}`}>
                            {manager.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>{manager.created_at ? new Date(manager.created_at).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div className="row-actions">
                            <button className="view-btn" onClick={() => openManagerDetail(manager)} title="View Details">
                              <AppIcon name="eye" />
                            </button>
                            <button className="view-btn" onClick={() => handleEditClick(manager)} title="Edit">
                              <AppIcon name="edit" />
                            </button>
                            <button className="view-btn" onClick={() => handleSuspendToggle(manager)} title={manager.status === 'active' ? 'Suspend' : 'Reactivate'}>
                              <AppIcon name={manager.status === 'active' ? 'lock' : 'checkCircle'} />
                            </button>
                            <button className="view-btn danger" onClick={() => handleDelete(manager)} title="Delete">
                              <AppIcon name="trash" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ADD STAFF MODAL */}
      {showStaffForm && (
        <div className="modal-overlay" onClick={() => setShowStaffForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><AppIcon name="add" /> Add Staff Member</h2>
              <button className="close-btn" onClick={() => setShowStaffForm(false)}><AppIcon name="close" /></button>
            </div>

            <form onSubmit={handleCreateStaff} className="staff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={staffFormData.firstName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={staffFormData.lastName}
                    onChange={(e) => setStaffFormData({ ...staffFormData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={staffFormData.email}
                  onChange={(e) => setStaffFormData({ ...staffFormData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={staffFormData.phone}
                  onChange={(e) => setStaffFormData({ ...staffFormData, phone: e.target.value })}
                  placeholder="+91..."
                />
              </div>

              <div className="form-group">
                <label>Assign under Manager *</label>
                <select
                  value={staffFormData.managerId}
                  onChange={(e) => setStaffFormData({ ...staffFormData, managerId: e.target.value })}
                  required
                >
                  <option value="">Select a manager</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>{m.fullName} — {m.venueName || 'No venue'}</option>
                  ))}
                </select>
                {managers.length === 0 && (
                  <small style={{ color: 'var(--tenant-danger, #dc3545)' }}>
                    No managers exist yet — assign a manager first.
                  </small>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowStaffForm(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={formLoading}>
                  {formLoading ? 'Adding...' : 'Add Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN MANAGER MODAL */}
      {showManagerForm && (
        <div className="modal-overlay" onClick={() => setShowManagerForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><AppIcon name="add" /> Assign Venue Manager</h2>
              <button className="close-btn" onClick={() => setShowManagerForm(false)}><AppIcon name="close" /></button>
            </div>

            <form onSubmit={handleCreateManager} className="staff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={managerFormData.firstName}
                    onChange={(e) => setManagerFormData({ ...managerFormData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={managerFormData.lastName}
                    onChange={(e) => setManagerFormData({ ...managerFormData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={managerFormData.email}
                  onChange={(e) => setManagerFormData({ ...managerFormData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={managerFormData.phone}
                  onChange={(e) => setManagerFormData({ ...managerFormData, phone: e.target.value })}
                  placeholder="+91..."
                />
              </div>

              <div className="form-group">
                <label>Venue *</label>
                <select
                  value={managerFormData.outletId}
                  onChange={(e) => setManagerFormData({ ...managerFormData, outletId: e.target.value })}
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowManagerForm(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={formLoading}>
                  {formLoading ? 'Assigning...' : 'Assign Manager'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGER DETAIL DRAWER */}
      {managerDetail && (
        <div className="modal-overlay" onClick={() => setManagerDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><AppIcon name="user" /> {managerDetail.fullName}</h2>
              <button className="close-btn" onClick={() => setManagerDetail(null)}><AppIcon name="close" /></button>
            </div>

            <div className="detail-block">
              <div className="detail-row"><span className="label">Email:</span><span className="value">{managerDetail.email}</span></div>
              <div className="detail-row"><span className="label">Venue:</span><span className="value">{managerDetail.venueName || 'N/A'}</span></div>
              <div className="detail-row"><span className="label">Team Size:</span><span className="value">{managerDetail.teamSize || 0} Staff</span></div>
            </div>

            <div className="detail-team-header">Staff under this manager ({managerDetail.teamMembers.length})</div>
            {managerDetail.teamMembers.length === 0 ? (
              <p style={{ color: 'var(--tenant-text-secondary, #667085)', fontSize: '13px' }}>No staff assigned yet.</p>
            ) : (
              <div className="team-list">
                {managerDetail.teamMembers.map((m) => (
                  <div className="team-row" key={m.id}>
                    <div className="member-avatar small">{getInitial(m.firstName)}</div>
                    <div>
                      <strong>{m.firstName} {m.lastName}</strong>
                      <div style={{ fontSize: '12px', color: 'var(--tenant-text-secondary, #667085)' }}>{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL (Staff or Manager) */}
      {editTarget && (
        <div className="modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><AppIcon name="edit" /> Edit {editTarget.role === 'manager' ? 'Manager' : 'Staff'}</h2>
              <button className="close-btn" onClick={() => setEditTarget(null)}><AppIcon name="close" /></button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="staff-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email (cannot be changed)</label>
                <input type="email" value={editTarget.email || ''} disabled />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  placeholder="+91..."
                />
              </div>

              {editTarget.role === 'manager' ? (
                <div className="form-group">
                  <label>Venue *</label>
                  <select
                    value={editFormData.outletId}
                    onChange={(e) => setEditFormData({ ...editFormData, outletId: e.target.value })}
                    required
                  >
                    <option value="">Select a venue</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>{venue.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="form-group">
                  <label>Assign under Manager *</label>
                  <select
                    value={editFormData.managerId}
                    onChange={(e) => setEditFormData({ ...editFormData, managerId: e.target.value })}
                    required
                  >
                    <option value="">Select a manager</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName} — {m.venueName || 'No venue'}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setEditTarget(null)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .staff-content { flex: 1; padding: 28px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--tenant-text-secondary, #667085); }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid var(--tenant-border, #e5e7eb); border-top-color: var(--tenant-primary, #667eea); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 20px; }
        .page-header h2 { margin: 0; font-size: 26px; color: var(--tenant-text, #171c2d); display: flex; align-items: center; gap: 8px; }
        .page-header p { margin: 6px 0 0; color: var(--tenant-text-secondary, #667085); font-size: 13px; }
        .add-btn { height: 42px; padding: 0 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--tenant-primary, #667eea) 0%, #764ba2 100%); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; gap: 6px; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35); }

        .tabs { display: flex; gap: 4px; margin-bottom: 18px; border-bottom: 1px solid var(--tenant-border, #e5e7eb); }
        .tab-btn { position: relative; padding: 10px 18px; border: none; background: transparent; color: var(--tenant-text-secondary, #667085); font-size: 13px; font-weight: 600; cursor: pointer; transition: color 0.2s ease; }
        .tab-btn:hover { color: var(--tenant-text, #171c2d); }
        .tab-btn.active { color: var(--tenant-primary, #667eea); }
        .tab-btn.active::after { content: ''; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--tenant-primary, #667eea); border-radius: 2px; animation: tabIn 0.18s ease; }
        @keyframes tabIn { from { opacity: 0; transform: scaleX(0.6); } to { opacity: 1; transform: scaleX(1); } }

        .panel { background: var(--tenant-surface, #fff); border: 1px solid var(--tenant-border-light, #edf0f4); border-radius: 12px; overflow: hidden; box-shadow: var(--tenant-shadow-sm, 0 2px 8px rgba(15,23,42,0.05)); }
        .panel-header { padding: 0 22px; min-height: 60px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--tenant-border, #e5e7eb); flex-wrap: wrap; gap: 10px; }
        .panel-header h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--tenant-text, #171c2d); }
        .panel-header span { color: var(--tenant-text-secondary, #667085); font-size: 12px; }
        .panel-header-actions { display: flex; align-items: center; gap: 12px; }
        .filter-select { height: 34px; padding: 0 10px; border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 7px; background: var(--tenant-surface, #fff); color: var(--tenant-text, #171c2d); font-size: 12px; cursor: pointer; transition: border-color 0.2s ease; }
        .filter-select:hover { border-color: var(--tenant-primary, #667eea); }

        .table-container { overflow-x: auto; }
        .staff-table { width: 100%; border-collapse: collapse; }
        .staff-table th { padding: 13px 18px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--tenant-text-secondary, #667085); background: var(--tenant-surface-2, #f8f9fc); border-bottom: 1px solid var(--tenant-border, #e5e7eb); }
        .staff-table td { padding: 14px 18px; color: var(--tenant-text, #171c2d); border-bottom: 1px solid var(--tenant-border-light, #edf0f4); }
        .staff-table tbody tr { transition: background 0.2s ease; }
        .staff-table tbody tr:hover td { background: var(--tenant-surface-hover, #f1f4f9); }
        .member-cell { display: flex; align-items: center; gap: 12px; }
        .member-avatar { width: 38px; height: 38px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 8px; background: linear-gradient(135deg, var(--tenant-primary, #667eea), #764ba2); color: #fff; font-weight: 700; }
        .member-avatar.small { width: 32px; height: 32px; font-size: 12px; }
        .venue-badge { padding: 4px 10px; border-radius: 12px; background: var(--tenant-primary-light, #eef1ff); color: var(--tenant-primary, #667eea); font-size: 11px; font-weight: 600; }
        .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; }
        .status-badge.active { background: var(--tenant-success-bg, #dcfce7); color: var(--tenant-success, #16a34a); }
        .status-badge.inactive { background: var(--tenant-danger-bg, #fee2e2); color: var(--tenant-danger, #dc3545); }
        .row-actions { display: flex; gap: 6px; }
        .view-btn { width: 32px; height: 32px; border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 7px; background: var(--tenant-surface, #fff); color: var(--tenant-text-secondary, #667085); cursor: pointer; transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; }
        .view-btn:hover { background: var(--tenant-primary-light, #eef1ff); color: var(--tenant-primary, #667eea); border-color: var(--tenant-primary, #667eea); }
        .view-btn.danger:hover { background: var(--tenant-danger-bg, #fee2e2); color: var(--tenant-danger, #dc3545); border-color: var(--tenant-danger, #dc3545); }
        .empty-state { padding: 60px 20px; text-align: center; color: var(--tenant-text-secondary, #667085); }
        .empty-icon { font-size: 34px; margin-bottom: 12px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.55); display: flex; align-items: center; justify-content: center; z-index: 300; backdrop-filter: blur(3px); }
        .modal { width: 100%; max-width: 480px; max-height: 85vh; overflow-y: auto; background: var(--tenant-surface, #fff); color: var(--tenant-text, #171c2d); border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 12px; padding: 24px; animation: modalIn 0.18s ease; }
        @keyframes modalIn { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 22px; }
        .modal-header h2 { margin: 0; font-size: 18px; color: var(--tenant-text, #171c2d); display: flex; align-items: center; gap: 8px; }
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

        .detail-block { display: flex; flex-direction: column; gap: 10px; padding: 14px; background: var(--tenant-surface-2, #f8f9fc); border-radius: 10px; margin-bottom: 18px; }
        .detail-row { display: flex; justify-content: space-between; font-size: 13px; }
        .detail-row .label { color: var(--tenant-text-secondary, #667085); }
        .detail-row .value { font-weight: 600; color: var(--tenant-text, #171c2d); }
        .detail-team-header { font-size: 13px; font-weight: 700; color: var(--tenant-text, #171c2d); margin-bottom: 10px; }
        .team-list { display: flex; flex-direction: column; gap: 8px; }
        .team-row { display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px; transition: background 0.15s ease; }
        .team-row:hover { background: var(--tenant-surface-hover, #f1f4f9); }

        @media (max-width: 900px) {
          .staff-content { padding: 18px 14px; }
          .page-header { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
          .panel-header { flex-direction: column; align-items: flex-start; }
        }
      `}</style>
    </>
  );
}
