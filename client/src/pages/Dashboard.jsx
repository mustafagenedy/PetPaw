import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const statusClass = {
  pending: 'bg-warning text-dark',
  confirmed: 'bg-success',
  cancelled: 'bg-secondary',
  completed: 'bg-info text-dark',
};

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBookings = useCallback(async () => {
    setError('');
    setBookingsLoading(true);
    try {
      const res = await api.get('/bookings/me');
      setBookings(res.data);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    setMessagesLoading(true);
    try {
      const res = await api.get('/contact/user');
      setMessages(res.data);
    } catch {
      // Non-fatal — messages are secondary
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchMessages();
  }, [fetchBookings, fetchMessages]);

  const handleCancel = async (b) => {
    const when = new Date(b.date).toLocaleString();
    if (!window.confirm(`Cancel your ${b.service?.name || 'booking'} on ${when}?`)) return;
    setError(''); setMessage('');
    try {
      await api.delete(`/bookings/${b._id}`);
      setMessage('Booking cancelled');
      fetchBookings();
    } catch {
      setError('Failed to cancel booking');
    }
  };

  return (
    <div className="container">
      <h2 className="mb-4">My Bookings</h2>
      {message && <div className="alert alert-success" role="status">{message}</div>}
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center" role="alert">
          <span>{error}</span>
          <button className="btn btn-sm btn-outline-dark" onClick={fetchBookings}>Retry</button>
        </div>
      )}

      {bookingsLoading && (
        <div className="text-center py-5">
          <span className="spinner-border" role="status" aria-label="Loading bookings" />
        </div>
      )}

      {!bookingsLoading && bookings.length === 0 && (
        <div className="card p-5 text-center animate-fadein" style={{ borderRadius: '1.5rem' }}>
          <div style={{ fontSize: '3rem' }} aria-hidden="true">🐾</div>
          <h4 className="fw-bold mt-2">No bookings yet</h4>
          <p className="text-muted">Schedule your pet's first grooming appointment.</p>
          <div>
            <Link to="/booking" className="btn btn-primary">Book an appointment</Link>
          </div>
        </div>
      )}

      {!bookingsLoading && bookings.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered align-middle">
            <thead>
              <tr>
                <th>Service</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => {
                const cancelled = b.status === 'cancelled';
                return (
                  <tr key={b._id} style={cancelled ? { opacity: 0.55 } : undefined}>
                    <td>{b.service?.name || '—'}</td>
                    <td style={cancelled ? { textDecoration: 'line-through' } : undefined}>
                      {new Date(b.date).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${statusClass[b.status] || 'bg-secondary'}`}>{b.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleCancel(b)}
                        disabled={cancelled || b.status === 'completed'}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-5">
        <h4>My Messages</h4>
        {messagesLoading && (
          <div className="text-center py-4">
            <span className="spinner-border spinner-border-sm" role="status" aria-label="Loading messages" />
          </div>
        )}
        {!messagesLoading && messages.length === 0 && (
          <p className="text-muted">You haven't sent any messages yet.</p>
        )}
        {!messagesLoading && messages.length > 0 && (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr><th>Message</th><th>Sent</th><th>Admin Response</th><th>Responded</th></tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg._id}>
                    <td>{msg.message}</td>
                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                    <td>{msg.response ? <span className="text-success">{msg.response}</span> : <span className="text-muted">No response yet</span>}</td>
                    <td>{msg.respondedAt ? new Date(msg.respondedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
