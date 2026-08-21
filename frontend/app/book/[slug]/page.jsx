'use client';

import { useState } from 'react';
import { coreAPI } from '@/lib/core';

export default function PublicBookingPage({ params }) {
  const [form, setForm] = useState({ bookingDate: '', bookingStartTime: '', bookingEndTime: '', numGuests: 2, customerName: '', customerEmail: '', customerPhone: '' });
  const [available, setAvailable] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const slug = params.slug;

  const update = event => setForm({ ...form, [event.target.name]: event.target.value });

  async function checkAvailability(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const result = await coreAPI.publicAvailability(slug, form);
      setAvailable(result.data?.available || []);
      setMessage(`${result.data?.available?.length || 0} resources available`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function createBooking(event) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const result = await coreAPI.publicBooking(slug, { ...form, tableId: selectedTable || undefined });
      setMessage(`Reservation created: ${result.data.bookingId}`);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', padding: '48px 20px', background: '#f4f1ea', color: '#18231f' }}>
      <section style={{ maxWidth: 720, margin: '0 auto', background: '#fffdf8', padding: 32, border: '1px solid #d8d1c2', borderRadius: 8 }}>
        <p style={{ color: '#a34f2b', letterSpacing: 1.5, fontSize: 12 }}>AVENTA CORE RESERVATIONS</p>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 42, margin: '8px 0 28px' }}>Reserve your table</h1>
        <form onSubmit={checkAvailability} style={{ display: 'grid', gap: 14 }}>
          <label>Date<input required type="date" name="bookingDate" value={form.bookingDate} onChange={update} /></label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <label>Start time<input required type="time" name="bookingStartTime" value={form.bookingStartTime} onChange={update} /></label>
            <label>End time<input required type="time" name="bookingEndTime" value={form.bookingEndTime} onChange={update} /></label>
          </div>
          <label>Guests<input required min="1" type="number" name="numGuests" value={form.numGuests} onChange={update} /></label>
          <button disabled={loading} type="submit">{loading ? 'Checking...' : 'Check availability'}</button>
        </form>
        {available.length > 0 && <div style={{ marginTop: 24 }}><p>Select a resource</p><div style={{ display: 'grid', gap: 8 }}>{available.map(table => <button type="button" key={table.id} onClick={() => setSelectedTable(table.id)} style={{ textAlign: 'left', background: selectedTable === table.id ? '#dce8dc' : '#f6f2e8' }}>{table.name} · up to {table.capacity}</button>)}</div></div>}
        {available.length > 0 && <form onSubmit={createBooking} style={{ display: 'grid', gap: 14, marginTop: 24 }}><input required name="customerName" placeholder="Your name" value={form.customerName} onChange={update} /><input type="email" name="customerEmail" placeholder="Email" value={form.customerEmail} onChange={update} /><input name="customerPhone" placeholder="Phone" value={form.customerPhone} onChange={update} /><button disabled={loading || !selectedTable} type="submit">Create reservation</button></form>}
        {message && <p role="status" style={{ marginTop: 20, color: '#a34f2b' }}>{message}</p>}
      </section>
    </main>
  );
}
