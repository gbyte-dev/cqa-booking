'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';

export default function TenantTablesPage() {
  const router = useRouter();
  const mountedRef = useRef(false);

  const [venues, setVenues] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    venueId: '',
    name: '',
    capacity: 4,
    location: '',
    minGuests: 1,
    maxGuests: 4,
    status: 'available'
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

    loadData();
  }, []); // ✅ Empty dependency array

  const loadData = async () => {
    setLoading(true);
    try {
      const venuesRes = await fetch(`${API_URL}/api/v1/venues`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const venuesData = await venuesRes.json();
      const loadedVenues = venuesData.success ? (venuesData.data || []) : [];
      setVenues(loadedVenues);

      // Backend only exposes tables scoped to a venue (no bare "list all" route),
      // so fetch each venue's tables in parallel and merge them.
      const tableResponses = await Promise.all(
        loadedVenues.map(venue =>
          fetch(`${API_URL}/api/v1/tables/venue/${venue.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          }).then(res => res.json()).catch(() => ({ success: false, data: [] }))
        )
      );

      const allTables = tableResponses.flatMap(res => (res.success ? res.data || [] : []));
      setTables(allTables);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      venueId: venues[0]?.id || '',
      name: '',
      capacity: 4,
      location: '',
      minGuests: 1,
      maxGuests: 4,
      status: 'available'
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/v1/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.success) {
        alert('✅ Table added successfully');
        setShowForm(false);
        setFormData({
          venueId: venues[0]?.id || '',
          name: '',
          capacity: 4,
          location: '',
          minGuests: 1,
          maxGuests: 4,
          status: 'available'
        });
        loadData();
      } else {
        alert('❌ Error: ' + (data.error || 'Failed to create table'));
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const filteredTables = selectedVenue === 'all'
    ? tables
    : tables.filter(t => t.venueId === selectedVenue);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Tables...</span>
      </div>
    );
  }

  return (
    <>
      <main className="tables-content">
            <div className="page-header">
              <div>
                <h2>🪑 Manage Tables</h2>
                <p>Add and organize tables across your venues.</p>
              </div>
              <button className="add-btn" onClick={handleAddClick}>
                ➕ Add Table
              </button>
            </div>

            <div className="filters-section">
              <select
                value={selectedVenue}
                onChange={(e) => setSelectedVenue(e.target.value)}
                className="venue-filter"
              >
                <option value="all">All Venues</option>
                {venues.map(venue => (
                  <option key={venue.id} value={venue.id}>{venue.name}</option>
                ))}
              </select>
              <span className="count-badge">{filteredTables.length} tables</span>
            </div>

            {filteredTables.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🪑</div>
                <p>No tables found</p>
                <button className="add-btn" onClick={handleAddClick}>
                  ➕ Add First Table
                </button>
              </div>
            ) : (
              <div className="tables-grid">
                {filteredTables.map(table => (
                  <div className="table-card" key={table.id}>
                    <div className="table-card-top">
                      <div className="table-avatar">
                        {table.name?.charAt(0)?.toUpperCase() || 'T'}
                      </div>
                      <span className={`table-status ${table.status || 'available'}`}>
                        {table.status || 'available'}
                      </span>
                    </div>

                    <h3>{table.name}</h3>
                    <div className="table-meta">
                      <div>
                        <strong>{table.capacity || table.maxGuests || 0}</strong>
                        <span>Seats</span>
                      </div>
                      <div>
                        <strong>{table.minGuests || 1}-{table.maxGuests || table.capacity || 4}</strong>
                        <span>Party size</span>
                      </div>
                    </div>

                    <div className="table-location">
                      📍 {table.location || 'Main floor'}
                    </div>

                    <div className="table-venue">
                      🏢 {table.Venue?.name || 'Venue'}
                    </div>
                  </div>
                ))}
              </div>
            )}
      </main>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Add Table</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="table-form">
              <div className="form-group">
                <label>Venue *</label>
                <select
                  value={formData.venueId}
                  onChange={(e) => setFormData({ ...formData, venueId: e.target.value })}
                  required
                >
                  <option value="">Select a venue</option>
                  {venues.map(venue => (
                    <option key={venue.id} value={venue.id}>{venue.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Table Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Table 5"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Window side"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Min Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minGuests}
                    onChange={(e) => setFormData({ ...formData, minGuests: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Max Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxGuests}
                    onChange={(e) => setFormData({ ...formData, maxGuests: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)} disabled={formLoading}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={formLoading}>
                  {formLoading ? '⏳ Adding...' : '➕ Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .tables-page { min-height: 100vh; background: var(--tenant-bg, #f5f7fb); color: var(--tenant-text, #171c2d); }
        .tables-layout { display: flex; min-height: 100vh; }
        .tables-main-wrapper { flex: 1; min-width: 0; margin-left: var(--tenant-sidebar-width, 260px); display: flex; flex-direction: column; }
        .tables-content { flex: 1; padding: 28px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: var(--tenant-text-secondary, #667085); }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid var(--tenant-border, #e5e7eb); border-top-color: var(--tenant-primary, #667eea); border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
        .page-header h2 { margin: 0; font-size: 26px; color: var(--tenant-text, #171c2d); }
        .page-header p { margin: 6px 0 0; color: var(--tenant-text-secondary, #667085); font-size: 13px; }
        .add-btn { height: 42px; padding: 0 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, var(--tenant-primary, #667eea) 0%, #764ba2 100%); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; }
        .add-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(102, 126, 234, 0.35); }
        .filters-section { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .venue-filter { height: 42px; padding: 0 12px; border: 1px solid var(--tenant-border, #e5e7eb); border-radius: 8px; background: var(--tenant-surface, #fff); color: var(--tenant-text, #171c2d); font-size: 13px; cursor: pointer; transition: all 0.2s ease; }
        .venue-filter:hover { border-color: var(--tenant-primary, #667eea); }
        .venue-filter:focus { outline: none; border-color: var(--tenant-primary, #667eea); box-shadow: 0 0 0 3px var(--tenant-primary-light, rgba(102,126,234,0.12)); }
        .count-badge { padding: 6px 12px; border-radius: 999px; background: var(--tenant-surface-2, #f8f9fc); color: var(--tenant-text-secondary, #667085); font-size: 12px; font-weight: 600; }
        .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
        .table-card { padding: 22px; background: var(--tenant-surface, #fff); border: 1px solid var(--tenant-border-light, #edf0f4); border-radius: 12px; transition: all 0.2s ease; }
        .table-card:hover { transform: translateY(-4px); box-shadow: var(--tenant-shadow-md, 0 8px 24px rgba(15, 23, 42, 0.08)); border-color: var(--tenant-primary, #667eea); }
        .table-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .table-avatar { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: var(--tenant-primary-light, #eef1ff); color: var(--tenant-primary, #667eea); font-size: 18px; font-weight: 800; transition: transform 0.2s ease; }
        .table-card:hover .table-avatar { transform: scale(1.08) rotate(-4deg); }
        .table-status { padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: var(--tenant-success-bg, #dcfce7); color: var(--tenant-success, #16a34a); }
        .table-card h3 { margin: 0 0 16px; font-size: 17px; color: var(--tenant-text, #171c2d); }
        .table-meta { display: flex; gap: 26px; padding: 14px 0; border-top: 1px solid var(--tenant-border-light, #edf0f4); border-bottom: 1px solid var(--tenant-border-light, #edf0f4); }
        .table-meta strong { display: block; font-size: 18px; color: var(--tenant-text, #171c2d); }
        .table-meta span { color: var(--tenant-text-muted, #98a2b3); font-size: 11px; }
        .table-location { margin-top: 12px; color: var(--tenant-text-secondary, #667085); font-size: 12px; }
        .table-venue { margin-top: 4px; color: var(--tenant-text-muted, #98a2b3); font-size: 11px; }
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
          .tables-main-wrapper { margin-left: 0; }
          .tables-content { padding: 18px 14px; }
          .page-header { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
          .tables-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
        }
      `}</style>
    </>
  );
}