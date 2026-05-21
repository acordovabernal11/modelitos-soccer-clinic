import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { supabase, bookings, feedback as feedbackApi, availability as availabilityApi } from '../supabase';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatTime = (t) => {
  const [h, m] = t.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

const EMAILJS_SERVICE_ID = 'service_4kbanym';
const EMAILJS_FEEDBACK_TEMPLATE_ID = 'template_feedback';
const EMAILJS_PUBLIC_KEY = '1IFdc2nRFvanhLDbW';

const STATUS_STYLES = {
  pending:   { bg: '#fef3c7', color: '#92400e', border: '#fcd34d', label: 'Pending' },
  confirmed: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7', label: 'Confirmed' },
  declined:  { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'Declined' },
  completed: { bg: '#dbeafe', color: '#1e3a8a', border: '#93c5fd', label: 'Completed' },
  cancelled: { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: 'Cancelled' }
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700'
    }}>{s.label}</span>
  );
}

function BookingCard({ booking, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const changeStatus = async (newStatus) => {
    setUpdating(true);
    await onStatusChange(booking.id, newStatus);
    setUpdating(false);
  };

  const handleRequestFeedback = async () => {
    if (!booking.client_email) {
      alert('No email on file for this booking.');
      return;
    }
    setSendingFeedback(true);
    const feedbackUrl = `${window.location.origin}/feedback?name=${encodeURIComponent(booking.player_name || 'Player')}&session=${encodeURIComponent(booking.session_type || 'Training Session')}&booking_id=${booking.id}`;
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_FEEDBACK_TEMPLATE_ID,
        {
          player_name: booking.player_name || 'Player',
          session_type: booking.session_type,
          feedback_url: feedbackUrl,
          to_email: booking.client_email
        },
        EMAILJS_PUBLIC_KEY
      );
      setFeedbackSent(true);
    } catch {
      alert('Could not send feedback email. Make sure the "template_feedback" template exists in your EmailJS dashboard.');
    }
    setSendingFeedback(false);
  };

  const price = booking.price_cents ? `$${(booking.price_cents / 100).toFixed(0)}` : 'N/A';
  const date = booking.session_date
    ? new Date(booking.session_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : 'No date';

  return (
    <div style={{
      background: 'white', border: '1px solid #bfdbfe', borderRadius: '16px',
      overflow: 'hidden', boxShadow: '0 4px 12px rgba(15,23,42,0.05)'
    }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <StatusBadge status={booking.status} />
          <div>
            <p style={{ margin: '0 0 2px', fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>
              {booking.player_name || 'Unknown Player'} — {booking.session_type}
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              {date} &nbsp;·&nbsp; {booking.preferred_time || 'Time flexible'} &nbsp;·&nbsp; <strong style={{ color: '#1d4ed8' }}>{price}</strong> cash at field
            </p>
          </div>
        </div>
        <span style={{ fontSize: '13px', color: '#2563eb', fontWeight: '600' }}>
          {expanded ? 'Hide details ▲' : 'View details ▼'}
        </span>
      </div>

      {/* Quick action buttons — always visible for pending */}
      {booking.status === 'pending' && (
        <div style={{ padding: '0 22px 16px', display: 'flex', gap: '10px' }}>
          <button
            onClick={() => changeStatus('confirmed')}
            disabled={updating}
            style={{ background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
          >
            ✓ Accept
          </button>
          <button
            onClick={() => changeStatus('declined')}
            disabled={updating}
            style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 18px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
          >
            ✕ Decline
          </button>
        </div>
      )}

      {/* Request feedback — always visible for completed */}
      {booking.status === 'completed' && (
        <div style={{ padding: '0 22px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={handleRequestFeedback}
            disabled={sendingFeedback || feedbackSent}
            style={{
              background: feedbackSent ? '#d1fae5' : '#2563eb',
              color: feedbackSent ? '#065f46' : 'white',
              border: 'none', borderRadius: '8px', padding: '8px 18px',
              fontWeight: '700', cursor: feedbackSent ? 'default' : 'pointer', fontSize: '14px'
            }}
          >
            {feedbackSent ? '✓ Feedback Request Sent' : sendingFeedback ? 'Sending...' : '✉ Request Feedback'}
          </button>
          {feedbackSent && (
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
              Sent to {booking.client_email}
            </p>
          )}
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: '1px solid #dbeafe', padding: '20px 22px', background: '#f8fbff' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            {[
              ['Player Name', booking.player_name],
              ['Player Age', booking.player_age],
              ['Position', booking.position],
              ['Skill Level', booking.skill_level],
              ['Contact Email', booking.client_email],
              ['Phone Number', booking.phone],
              ['Training Type', booking.session_type],
              ['Date Requested', date],
              ['Preferred Time', booking.preferred_time || 'Flexible'],
              ['Number of Players', booking.num_players || '1'],
              ['Total (cash)', price],
              ['Submitted', new Date(booking.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })]
            ].map(([label, val]) => val ? (
              <div key={label}>
                <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: '500' }}>{val}</p>
              </div>
            ) : null)}
          </div>

          {booking.goals && (
            <div style={{ marginBottom: '14px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Session Goals</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{booking.goals}</p>
            </div>
          )}

          {booking.notes && (
            <div style={{ marginBottom: '14px' }}>
              <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Additional Notes</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{booking.notes}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #dbeafe' }}>
            <p style={{ margin: '0 12px 0 0', fontWeight: '700', color: '#1e3a8a', fontSize: '14px', alignSelf: 'center' }}>Update Status:</p>
            {['pending', 'confirmed', 'completed', 'cancelled', 'declined'].map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={updating || booking.status === s}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: '1px solid #cbd5e1',
                  background: booking.status === s ? '#2563eb' : 'white',
                  color: booking.status === s ? 'white' : '#334155',
                  fontWeight: '600', cursor: booking.status === s ? 'default' : 'pointer', fontSize: '13px',
                  textTransform: 'capitalize'
                }}
              >
                {s}
              </button>
            ))}
            <button
              onClick={() => { if (window.confirm('Delete this booking permanently?')) onDelete(booking.id); }}
              style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeView, setActiveView] = useState('bookings');
  const [newSlot, setNewSlot] = useState({ day_of_week: 'Monday', start_time: '', end_time: '' });
  const [slotSaving, setSlotSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    const [bookingsResult, feedbackResult, availabilityResult] = await Promise.all([
      bookings.getAll(),
      feedbackApi.getAll(),
      availabilityApi.getAll()
    ]);
    if (bookingsResult.data) setAllBookings(bookingsResult.data);
    if (feedbackResult.data) setFeedbackData(feedbackResult.data);
    if (availabilityResult.data) setAvailabilitySlots(availabilityResult.data);
    setLoading(false);
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const { error } = await bookings.updateStatus(bookingId, newStatus);
    if (error) {
      alert('Error updating: ' + error.message);
    } else {
      setAllBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    }
  };

  const handleDelete = async (bookingId) => {
    const { error } = await bookings.delete(bookingId);
    if (!error) setAllBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  const handleAddSlot = async () => {
    if (!newSlot.start_time || !newSlot.end_time) { alert('Please set both a start and end time.'); return; }
    if (newSlot.start_time >= newSlot.end_time) { alert('End time must be after start time.'); return; }
    setSlotSaving(true);
    const { data, error } = await availabilityApi.create({ ...newSlot, is_active: true });
    if (error) alert('Error: ' + error.message);
    else setAvailabilitySlots(prev => [...prev, data[0]]);
    setSlotSaving(false);
  };

  const handleToggleSlot = async (slot) => {
    const { data, error } = await availabilityApi.update(slot.id, { is_active: !slot.is_active });
    if (!error) setAvailabilitySlots(prev => prev.map(s => s.id === slot.id ? data[0] : s));
  };

  const handleDeleteSlot = async (slotId) => {
    const { error } = await availabilityApi.delete(slotId);
    if (!error) setAvailabilitySlots(prev => prev.filter(s => s.id !== slotId));
  };

  const slotsByDay = DAYS_ORDER.reduce((acc, day) => {
    const slots = availabilitySlots.filter(s => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    if (slots.length) acc[day] = slots;
    return acc;
  }, {});

  const filtered = filterStatus === 'all' ? allBookings : allBookings.filter(b => b.status === filterStatus);
  const pendingCount = allBookings.filter(b => b.status === 'pending').length;
  const avgRating = feedbackData.length
    ? (feedbackData.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbackData.length).toFixed(1)
    : null;

  if (loading) return <div className="section"><p>Loading...</p></div>;
  if (!user) return <div className="section"><p>Please sign in to access the admin dashboard.</p></div>;

  return (
    <>
      <section className="section" style={{ paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ marginBottom: '6px' }}>Admin Dashboard</h2>
            <p style={{ margin: 0, color: '#475569' }}>Manage bookings and review player feedback.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            {pendingCount > 0 && (
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px', padding: '10px 18px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '800', color: '#92400e' }}>{pendingCount}</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#92400e' }}>PENDING</p>
              </div>
            )}
            {avgRating && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '10px 18px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '800', color: '#15803d' }}>{avgRating} ⭐</p>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#15803d' }}>AVG RATING</p>
              </div>
            )}
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
          {[
            { key: 'bookings', label: `Bookings (${allBookings.length})` },
            { key: 'feedback', label: `Feedback (${feedbackData.length})` },
            { key: 'availability', label: `Availability (${availabilitySlots.length})` }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveView(key)}
              style={{
                padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
                fontWeight: '700', fontSize: '14px',
                color: activeView === key ? '#2563eb' : '#94a3b8',
                borderBottom: activeView === key ? '2px solid #2563eb' : '2px solid transparent',
                marginBottom: '-2px', transition: '0.15s ease'
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Booking status filters */}
        {activeView === 'bookings' && (
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px' }}>
            {['all', 'pending', 'confirmed', 'completed', 'declined', 'cancelled'].map((s) => {
              const count = s === 'all' ? allBookings.length : allBookings.filter(b => b.status === s).length;
              return (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '8px 16px', borderRadius: '999px', border: '1px solid',
                    borderColor: filterStatus === s ? '#2563eb' : '#e2e8f0',
                    background: filterStatus === s ? '#eff6ff' : 'white',
                    color: filterStatus === s ? '#1d4ed8' : '#475569',
                    fontWeight: '700', cursor: 'pointer', fontSize: '13px', textTransform: 'capitalize'
                  }}
                >
                  {s === 'all' ? 'All' : s} ({count})
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Bookings view */}
      {activeView === 'bookings' && (
        <section className="section" style={{ paddingTop: '24px' }}>
          {filtered.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>No bookings found for this filter.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filtered.map(booking => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Availability view */}
      {activeView === 'availability' && (
        <section className="section" style={{ paddingTop: '24px' }}>
          <h3 style={{ marginBottom: '6px', color: '#1e3a8a' }}>Add Availability Window</h3>
          <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>
            Set the days and times you're available. Customers will see these as bookable time slots.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end', background: '#f8fbff', border: '1px solid #bfdbfe', borderRadius: '14px', padding: '20px', marginBottom: '32px' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#1e3a8a', marginBottom: '6px' }}>Day</label>
              <select
                value={newSlot.day_of_week}
                onChange={e => setNewSlot(s => ({ ...s, day_of_week: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a', background: 'white' }}
              >
                {DAYS_ORDER.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#1e3a8a', marginBottom: '6px' }}>Start Time</label>
              <input type="time" value={newSlot.start_time} onChange={e => setNewSlot(s => ({ ...s, start_time: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: '700', fontSize: '13px', color: '#1e3a8a', marginBottom: '6px' }}>End Time</label>
              <input type="time" value={newSlot.end_time} onChange={e => setNewSlot(s => ({ ...s, end_time: e.target.value }))}
                style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', color: '#0f172a' }} />
            </div>
            <button
              onClick={handleAddSlot}
              disabled={slotSaving}
              style={{ padding: '10px 24px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}
            >
              {slotSaving ? 'Adding...' : '+ Add Window'}
            </button>
          </div>

          {Object.keys(slotsByDay).length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>No availability set yet. Add your first window above.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {Object.entries(slotsByDay).map(([day, slots]) => (
                <div key={day}>
                  <h4 style={{ margin: '0 0 12px', color: '#1e3a8a', fontSize: '15px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{day}</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {slots.map(slot => (
                      <div key={slot.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
                        background: slot.is_active ? '#f0fdf4' : '#f8fafc',
                        border: `1px solid ${slot.is_active ? '#86efac' : '#e2e8f0'}`,
                        borderRadius: '10px', padding: '12px 16px'
                      }}>
                        <span style={{ fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>
                          {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                        </span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '999px',
                            background: slot.is_active ? '#d1fae5' : '#f1f5f9',
                            color: slot.is_active ? '#065f46' : '#94a3b8',
                            border: `1px solid ${slot.is_active ? '#6ee7b7' : '#cbd5e1'}`
                          }}>{slot.is_active ? 'Active' : 'Hidden'}</span>
                          <button onClick={() => handleToggleSlot(slot)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#475569' }}>
                            {slot.is_active ? 'Hide' : 'Show'}
                          </button>
                          <button onClick={() => handleDeleteSlot(slot.id)} style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#dc2626' }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Feedback view */}
      {activeView === 'feedback' && (
        <section className="section" style={{ paddingTop: '24px' }}>
          {feedbackData.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px 0' }}>No feedback received yet. Mark a booking as Completed and send a feedback request.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {feedbackData.map((f) => (
                <div key={f.id} style={{ background: 'white', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(15,23,42,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', fontWeight: '700', color: '#0f172a', fontSize: '15px' }}>{f.player_name}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                        {f.session_type} &nbsp;·&nbsp; {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span key={n} style={{ fontSize: '22px', opacity: n <= f.rating ? 1 : 0.2 }}>⭐</span>
                      ))}
                    </div>
                  </div>

                  {f.would_recommend !== null && (
                    <span style={{
                      display: 'inline-block', marginBottom: '16px',
                      background: f.would_recommend ? '#d1fae5' : '#fee2e2',
                      color: f.would_recommend ? '#065f46' : '#991b1b',
                      border: `1px solid ${f.would_recommend ? '#6ee7b7' : '#fca5a5'}`,
                      padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '700'
                    }}>
                      {f.would_recommend ? '👍 Would Recommend' : '👎 Would Not Recommend'}
                    </span>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {f.what_improved && (
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>What Improved</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{f.what_improved}</p>
                      </div>
                    )}
                    {f.next_goals && (
                      <div>
                        <p style={{ margin: '0 0 4px', fontSize: '11px', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Next Focus</p>
                        <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{f.next_goals}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </>
  );
}
