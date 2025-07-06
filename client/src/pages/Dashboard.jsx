import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showMessages, setShowMessages] = useState(false);

  const fetchBookings = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/bookings/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookings(res.data);
    } catch (err) {
      setError('Failed to load bookings');
    }
  };

  const fetchMessages = async () => {
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/contact/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      setError('Failed to load messages');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    setError('');
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Booking cancelled');
      fetchBookings();
    } catch (err) {
      setError('Failed to cancel booking');
    }
  };

  const handleShowMessages = () => {
    setShowMessages(!showMessages);
    if (!showMessages) fetchMessages();
  };

  return (
    <div className="container">
      <h2 className="mb-4">My Bookings</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Service</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 && (
              <tr><td colSpan="4" className="text-center">No bookings found.</td></tr>
            )}
            {bookings.map(b => (
              <tr key={b._id}>
                <td>{b.service?.name}</td>
                <td>{new Date(b.date).toLocaleString()}</td>
                <td>{b.status}</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)} disabled={b.status === 'cancelled'}>
                    Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5">
        <button className="btn btn-primary" onClick={handleShowMessages}>
          {showMessages ? 'Hide' : 'Show'} My Messages
        </button>
        {showMessages && (
          <div className="table-responsive mt-4">
            <h4>My Messages &amp; Admin Responses</h4>
            <table className="table table-bordered">
              <thead>
                <tr><th>Message</th><th>Sent</th><th>Admin Response</th><th>Responded</th></tr>
              </thead>
              <tbody>
                {messages.length === 0 && <tr><td colSpan="4" className="text-center">No messages found.</td></tr>}
                {messages.map(msg => (
                  <tr key={msg._id}>
                    <td>{msg.message}</td>
                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                    <td>{msg.response ? <span className="text-success">{msg.response}</span> : <span className="text-muted">No response yet</span>}</td>
                    <td>{msg.respondedAt ? new Date(msg.respondedAt).toLocaleString() : '-'}</td>
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