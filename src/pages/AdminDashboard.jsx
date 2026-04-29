import { useState, useEffect } from 'react';
import { supabase, bookings } from '../supabase';

export function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    checkAdminAndLoadBookings();
  }, []);

  const checkAdminAndLoadBookings = async () => {
    setLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // In production, check if user is admin before loading all bookings
      // For now, load all bookings (add admin check later)
      const { data, error } = await bookings.getAll();
      if (data) {
        setAllBookings(data);
      } else {
        console.error('Error loading bookings:', error);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const { error } = await bookings.updateStatus(bookingId, newStatus);
    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      setAllBookings(
        allBookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Delete this booking?')) {
      const { error } = await bookings.delete(bookingId);
      if (error) {
        alert('Error deleting booking: ' + error.message);
      } else {
        setAllBookings(allBookings.filter(b => b.id !== bookingId));
      }
    }
  };

  const filteredBookings = filterStatus === 'all'
    ? allBookings
    : allBookings.filter(b => b.status === filterStatus);

  if (loading) return <div className="section"><p>Loading...</p></div>;

  return (
    <section className="section">
      <h2>Admin Dashboard - Manage Bookings</h2>
      {!user && <p>Please sign in as admin to access this page.</p>}

      {user && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <label>Filter by Status: </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ marginLeft: '10px', padding: '5px' }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ccc', backgroundColor: '#f5f5f5' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Price</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>
                      {new Date(booking.session_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px' }}>{booking.session_type}</td>
                    <td style={{ padding: '10px' }}>
                      ${(booking.price_cents / 100).toFixed(2)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        style={{ padding: '5px' }}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredBookings.length === 0 && (
            <p style={{ marginTop: '20px' }}>No bookings found.</p>
          )}
        </>
      )}
    </section>
  );
}