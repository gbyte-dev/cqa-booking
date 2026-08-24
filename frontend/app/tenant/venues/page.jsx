'use client';
import AppIcon from '@/components/AppIcon';
import { confirmAction, notify } from '@/lib/alerts';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import {
  getTenantVenues,
  createTenantVenue,
  updateTenantVenue,
  deleteTenantVenue
} from '@/lib/tenant-venues';

export default function TenantVenuesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
    venueType: 'restaurant',
    openingTime: '',
    closingTime: '',
    capacity: '',
    timezone: 'UTC',
    logoUrl: '',
    coverImageUrl: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const token = storage.getToken();
  const currentUser = storage.getUser();

  useEffect(() => {
    if (!token || !currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      const response = await getTenantVenues(token);
      if (response.success) {
        setVenues(response.data || []);
      } else {
        notify('Failed to load venues');
      }
    } catch (error) {    } finally {
      setLoading(false);
    }
  };

  const handleAddVenue = () => {
    setSelectedVenue(null);
    setFormData({
      name: '',
      description: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      venueType: 'restaurant',
      openingTime: '',
      closingTime: '',
      capacity: '',
      timezone: 'UTC',
      logoUrl: '',
      coverImageUrl: ''
    });
    setShowForm(true);
  };

  const handleEditVenue = (venue) => {
    setSelectedVenue(venue);
    setFormData({
      name: venue.name || '',
      description: venue.description || '',
      address: venue.address || '',
      city: venue.city || '',
      state: venue.state || '',
      postalCode: venue.postalCode || '',
      country: venue.country || '',
      phone: venue.phone || '',
      email: venue.email || '',
      website: venue.website || '',
      venueType: venue.venueType || 'restaurant',
      openingTime: venue.openingTime || '',
      closingTime: venue.closingTime || '',
      capacity: venue.capacity || '',
      timezone: venue.timezone || 'UTC',
      logoUrl: venue.logoUrl || '',
      coverImageUrl: venue.coverImageUrl || ''
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      let response;
      if (selectedVenue) {
        response = await updateTenantVenue(selectedVenue.id, formData, token);
      } else {
        response = await createTenantVenue(formData, token);
      }

      if (response.success) {
        notify('Venue ' + (selectedVenue ? 'updated' : 'created') + ' successfully');
        setShowForm(false);
        await loadVenues();
      } else {
        notify('Error: ' + response.error);
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (venueId) => {
    if (!(await confirmAction({
      title: 'Delete venue?',
      text: 'This venue will be permanently removed.',
      confirmText: 'Delete venue',
      danger: true,
    }))) return;

    setDeleteConfirm(venueId);
    try {
      const response = await deleteTenantVenue(venueId, token);
      if (response.success) {
        notify('Venue deleted successfully');
        await loadVenues();
      } else {
        notify('Error: ' + response.error);
      }
    } catch (error) {
      notify('Error: ' + error.message);
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <span>Loading Venues...</span>
      </div>
    );
  }

  return (
    <>
      <main className="venues-content">
            <div className="venues-header">
              <div>
                <h2><AppIcon name="building" /> Manage Your Venues</h2>
                <p>Add, edit, and manage your restaurant venues</p>
              </div>
              <button className="btn-add-venue" onClick={handleAddVenue}>
                <AppIcon name="add" /> Add Venue
              </button>
            </div>

            {venues.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><AppIcon name="building" /></div>
                <p>No venues yet. Create your first venue!</p>
                <button className="btn-add-venue" onClick={handleAddVenue}>
                  <AppIcon name="add" /> Create Venue
                </button>
              </div>
            ) : (
              <div className="venues-grid">
                {venues.map(venue => (
                  <div className="venue-card" key={venue.id}>
                    <div className="venue-image">
                      {venue.coverImageUrl ? (
                        <img src={venue.coverImageUrl} alt={venue.name} />
                      ) : (
                        <div className="no-image"><AppIcon name="camera" /></div>
                      )}
                    </div>

                    <div className="venue-body">
                      <div className="venue-name">{venue.name}</div>
                      
                      <div className="venue-info">
                        <div className="info-item">
                          <span className="label">City:</span>
                          <span className="value">{venue.city || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Type:</span>
                          <span className="value">{venue.venueType || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Capacity:</span>
                          <span className="value">{venue.capacity || 'N/A'}</span>
                        </div>
                        <div className="info-item">
                          <span className="label">Status:</span>
                          <span className={`status ${venue.status}`}>
                            {venue.status}
                          </span>
                        </div>
                      </div>

                      {venue.description && (
                        <div className="venue-description">
                          {venue.description}
                        </div>
                      )}

                      <div className="venue-actions">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditVenue(venue)}
                        >
                          <AppIcon name="edit" /> Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(venue.id)}
                          disabled={deleteConfirm === venue.id}
                        >
                          {deleteConfirm === venue.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
      </main>

      {/* FORM MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal venues-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedVenue ? 'Edit Venue' : 'Add New Venue'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}><AppIcon name="close" /></button>
            </div>

            <form onSubmit={handleSubmit} className="venue-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Venue Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter venue name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Venue Type</label>
                  <select name="venueType" value={formData.venueType} onChange={handleInputChange}>
                    <option value="restaurant">Restaurant</option>
                    <option value="cafe">Cafe</option>
                    <option value="bar">Bar</option>
                    <option value="lounge">Lounge</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your venue..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="Postal code"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </div>
                <div className="form-group">
                  <label>Timezone</label>
                  <select name="timezone" value={formData.timezone} onChange={handleInputChange}>
                    <option value="UTC">UTC</option>
                    <option value="IST">IST (India)</option>
                    <option value="PST">PST</option>
                    <option value="EST">EST</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91..."
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="contact@venue.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Opening Time</label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Closing Time</label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="Total capacity"
                  />
                </div>
                <div className="form-group">
                  <label>Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : (selectedVenue ? 'Update Venue' : 'Create Venue')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
