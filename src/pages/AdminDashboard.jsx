import { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import { supabase, bookings } from '../supabase';

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
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    setUser(currentUser);
    const { data, error } = await bookings.getAll();
    console.log("Bookings data:", data);
    console.log("Bookings error:", error);
    if (data) setAllBookings(data);
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

  const filtered = filterStatus === 'all' ? allBookings : allBookings.filter(b => b.status === filterStatus);
  const pendingCount = allBookings.filter(b => b.status === 'pending').length;

  if (loading) return <div className="section"><p>Loading...</p></div>;
  if (!user) return <div className="section"><p>Please sign in to access the admin dashboard.</p></div>;

  return (
    <>
      <section className="section" style={{ paddingBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ marginBottom: '6px' }}>Admin Dashboard</h2>
            <p style={{ margin: 0, color: '#475569' }}>Manage all booking requests and update session status.</p>
          </div>
          {pendingCount > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px', padding: '10px 18px', textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '800', color: '#92400e' }}>{pendingCount}</p>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: '700', color: '#92400e' }}>PENDING</p>
            </div>
          )}
        </div>

        {/* Summary counts */}
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
      </section>

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
    </>
  );
}
