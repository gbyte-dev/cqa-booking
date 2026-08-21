'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/TenantHeader';
import Footer from '@/components/Footer';
import TenantSidebar from '@/components/TenantSidebar';
import { storage } from '@/lib/storage';

export default function TenantTablesPage() {
  const router = useRouter();
  const mountedRef = useRef(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
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
      const [venuesRes, tablesRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/venues`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/v1/tables`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const venuesData = await venuesRes.json();
      const tablesData = await tablesRes.json();

      if (venuesData.success) setVenues(venuesData.data || []);
      if (tablesData.success) setTables(tablesData.data || []);
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
      <div className="tables-page">
        <div className="loading-state">
          <div className="loading-spinner" />
          <span>Loading Tables...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="tables-page">
      <div className="tables-layout">
        <TenantSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="tables-main-wrapper">
          <Header title="Tables" onMenuClick={() => setSidebarOpen(true)} />

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

          <Footer />
        </div>
      </div>

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
        .tables-page { min-height: 100vh; background: #f5f7fb; }
        .tables-layout { display: flex; min-height: 100vh; }
        .tables-main-wrapper { flex: 1; min-width: 0; margin-left: 260px; display: flex; flex-direction: column; }
        .tables-content { flex: 1; padding: 28px; overflow-y: auto; }
        .loading-state { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
        .loading-spinner { width: 36px; height: 36px; border: 4px solid #e5e7eb; border-top-color: #667eea; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
        .page-header h2 { margin: 0; font-size: 26px; }
        .page-header p { margin: 6px 0 0; color: #667085; font-size: 13px; }
        .add-btn { height: 42px; padding: 0 18px; border: none; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 13px; font-weight: 700; cursor: pointer; }
        .add-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3); }
        .filters-section { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .venue-filter { height: 42px; padding: 0 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; cursor: pointer; }
        .venue-filter:focus { outline: none; border-color: #667eea; }
        .count-badge { padding: 6px 12px; border-radius: 999px; background: #f8f9fc; color: #667085; font-size: 12px; font-weight: 600; }
        .tables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 18px; }
        .table-card { padding: 22px; background: #fff; border: 1px solid #edf0f4; border-radius: 12px; transition: all 0.2s; }
        .table-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); }
        .table-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .table-avatar { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: linear-gradient(135deg, #eef1ff 0%, #f3e8ff 100%); color: #667eea; font-size: 18px; font-weight: 800; }
        .table-status { padding: 4px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; background: #dcfce7; color: #16a34a; }
        .table-card h3 { margin: 0 0 16px; font-size: 17px; }
        .table-meta { display: flex; gap: 26px; padding: 14px 0; border-top: 1px solid #edf0f4; border-bottom: 1px solid #edf0f4; }
        .table-meta strong { display: block; font-size: 18px; }
        .table-meta span { color: #98a2b3; font-size: 11px; }
        .table-location { margin-top: 12px; color: #667085; font-size: 12px; }
        .table-venue { margin-top: 4px; color: #98a2b3; font-size: 11px; }
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
          .tables-main-wrapper { margin-left: 0; }
          .tables-content { padding: 18px 14px; }
          .page-header { flex-direction: column; }
          .form-row { grid-template-columns: 1fr; }
          .tables-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
        }
      `}</style>
    </div>
  );
}