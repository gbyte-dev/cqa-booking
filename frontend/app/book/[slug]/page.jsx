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
      setMessage('We could not check availability right now. Please try again.');
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
      setMessage('We could not complete your reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1ea] px-5 py-12 text-[#18231f]">
      <section className="mx-auto max-w-[720px] rounded-lg border border-[#d8d1c2] bg-[#fffdf8] p-8">
        <p className="text-xs tracking-[1.5px] text-[#a34f2b]">AVENTA CORE RESERVATIONS</p>
        <h1 className="mt-2 mb-7 font-serif text-[42px]">Reserve your table</h1>
        <form onSubmit={checkAvailability} className="grid gap-3.5">
          <label>Date<input required type="date" name="bookingDate" value={form.bookingDate} onChange={update} /></label>
          <div className="grid grid-cols-2 gap-3.5">
            <label>Start time<input required type="time" name="bookingStartTime" value={form.bookingStartTime} onChange={update} /></label>
            <label>End time<input required type="time" name="bookingEndTime" value={form.bookingEndTime} onChange={update} /></label>
          </div>
          <label>Guests<input required min="1" type="number" name="numGuests" value={form.numGuests} onChange={update} /></label>
          <button disabled={loading} type="submit">{loading ? 'Checking...' : 'Check availability'}</button>
        </form>
        {available.length > 0 && (
          <div className="mt-6">
            <p>Select a resource</p>
            <div className="grid gap-2">
              {available.map(table => (
                <button
                  type="button"
                  key={table.id}
                  onClick={() => setSelectedTable(table.id)}
                  className={`text-left ${selectedTable === table.id ? 'bg-[#dce8dc]' : 'bg-[#f6f2e8]'}`}
                >
                  {table.name} · up to {table.capacity}
                </button>
              ))}
            </div>
          </div>
        )}
        {available.length > 0 && (
          <form onSubmit={createBooking} className="mt-6 grid gap-3.5">
            <input required name="customerName" placeholder="Your name" value={form.customerName} onChange={update} />
            <input type="email" name="customerEmail" placeholder="Email" value={form.customerEmail} onChange={update} />
            <input name="customerPhone" placeholder="Phone" value={form.customerPhone} onChange={update} />
            <button disabled={loading || !selectedTable} type="submit">Create reservation</button>
          </form>
        )}
        {message && <p role="status" className="mt-5 text-[#a34f2b]">{message}</p>}
      </section>
    </main>
  );
}
