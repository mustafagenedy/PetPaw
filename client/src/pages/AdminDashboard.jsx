import axios from 'axios';
import React, { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [tab, setTab] = useState('services');
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMsgId, setResponseMsgId] = useState(null);
  const [responseText, setResponseText] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch services
  const fetchServices = async () => {
    try {
      const res = await axios.get('/api/services');
      setServices(res.data);
    } catch (err) { setError('Failed to load services'); }
  };

  // Fetch bookings
  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings', { headers });
      setBookings(res.data);
    } catch (err) { setError('Failed to load bookings'); }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const [bpm, tu, tb] = await Promise.all([
        axios.get('/api/analytics/bookings-per-month', { headers }),
        axios.get('/api/analytics/total-users', { headers }),
        axios.get('/api/analytics/total-bookings', { headers })
      ]);
      setAnalytics({
        bookingsPerMonth: bpm.data,
        totalUsers: tu.data.count,
        totalBookings: tb.data.count
      });
    } catch (err) { setError('Failed to load analytics'); }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get('/api/contact', { headers });
      setMessages(res.data);
    } catch (err) { setError('Failed to load messages'); }
  };

  useEffect(() => {
    if (tab === 'services') fetchServices();
    if (tab === 'bookings') fetchBookings();
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'messages') fetchMessages();
  }, [tab]);

  // Service CRUD (add/edit/delete)
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '' });
  const handleServiceChange = e => setNewService({ ...newService, [e.target.name]: e.target.value });
  const handleAddService = async e => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await axios.post('/api/services', newService, { headers });
      setMessage('Service added');
      setNewService({ name: '', description: '', price: '', duration: '' });
      fetchServices();
    } catch (err) { setError('Failed to add service'); }
  };
  const handleDeleteService = async id => {
    setError(''); setMessage('');
    try {
      await axios.delete(`/api/services/${id}`, { headers });
      setMessage('Service deleted');
      fetchServices();
    } catch (err) { setError('Failed to delete service'); }
  };

  // Admin: Update booking status
  const handleUpdateBooking = async (id, status) => {
    setError(''); setMessage('');
    try {
      await axios.put(`/api/bookings/admin/${id}`, { status }, { headers });
      setMessage(`Booking ${status === 'confirmed' ? 'confirmed' : 'cancelled'}`);
      fetchBookings();
    } catch (err) { setError('Failed to update booking'); }
  };

  // Delete message
  const handleDeleteMessage = async (id) => {
    setError(''); setMessage('');
    try {
      await axios.delete(`/api/contact/${id}`, { headers });
      setMessage('Message deleted');
      fetchMessages();
    } catch (err) { setError('Failed to delete message'); }
  };

  // Respond to message
  const handleOpenResponse = (msg) => {
    setResponseMsgId(msg._id);
    setResponseText(msg.response || '');
    setShowResponseModal(true);
  };
  const handleSubmitResponse = async () => {
    setError(''); setMessage('');
    try {
      await axios.put(`/api/contact/${responseMsgId}/response`, { response: responseText }, { headers });
      setMessage('Response sent');
      setShowResponseModal(false);
      fetchMessages();
    } catch (err) { setError('Failed to send response'); }
  };

  return (
    <div className="container">
      <h2 className="mb-4">Admin Dashboard</h2>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item"><button className={`nav-link${tab==='services'?' active':''}`} onClick={()=>setTab('services')}>Services</button></li>
        <li className="nav-item"><button className={`nav-link${tab==='bookings'?' active':''}`} onClick={()=>setTab('bookings')}>Bookings</button></li>
        <li className="nav-item"><button className={`nav-link${tab==='analytics'?' active':''}`} onClick={()=>setTab('analytics')}>Analytics</button></li>
        <li className="nav-item"><button className={`nav-link${tab==='messages'?' active':''}`} onClick={()=>setTab('messages')}>Messages</button></li>
      </ul>
      {tab === 'services' && (
        <div>
          <form className="mb-4" onSubmit={handleAddService}>
            <div className="row g-2">
              <div className="col"><input name="name" value={newService.name} onChange={handleServiceChange} className="form-control" placeholder="Name" required /></div>
              <div className="col"><input name="description" value={newService.description} onChange={handleServiceChange} className="form-control" placeholder="Description" /></div>
              <div className="col"><input name="price" type="number" value={newService.price} onChange={handleServiceChange} className="form-control" placeholder="Price" required /></div>
              <div className="col"><input name="duration" type="number" value={newService.duration} onChange={handleServiceChange} className="form-control" placeholder="Duration (min)" required /></div>
              <div className="col-auto"><button className="btn btn-success">Add</button></div>
            </div>
          </form>
          <table className="table table-bordered">
            <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Duration</th><th>Action</th></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s._id}>
                  <td>{s.name}</td><td>{s.description}</td><td>${s.price}</td><td>{s.duration} min</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>handleDeleteService(s._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'bookings' && (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead><tr><th>User</th><th>Service</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td>{b.user?.name}</td>
                  <td>{b.service?.name}</td>
                  <td>{new Date(b.date).toLocaleString()}</td>
                  <td>{b.status}</td>
                  <td>
                    {b.status === 'pending' && <>
                      <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdateBooking(b._id, 'confirmed')}>Confirm</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleUpdateBooking(b._id, 'cancelled')}>Cancel</button>
                    </>}
                    {b.status === 'confirmed' && <button className="btn btn-danger btn-sm" onClick={() => handleUpdateBooking(b._id, 'cancelled')}>Cancel</button>}
                    {b.status === 'cancelled' && <span className="text-muted">No actions</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'analytics' && (
        <div>
          <h5>Total Users: {analytics.totalUsers}</h5>
          <h5>Total Bookings: {analytics.totalBookings}</h5>
          <h5>Bookings Per Month:</h5>
          <ul>
            {analytics.bookingsPerMonth && analytics.bookingsPerMonth.map((bpm, i) => (
              <li key={i}>{bpm._id}: {bpm.count}</li>
            ))}
          </ul>
        </div>
      )}
      {tab === 'messages' && (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead><tr><th>Name</th><th>Email</th><th>Message</th><th>Response</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {messages.length === 0 && <tr><td colSpan="6" className="text-center">No messages found.</td></tr>}
              {messages.map(msg => (
                <tr key={msg._id}>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.message}</td>
                  <td>{msg.response ? <><span className="text-success">{msg.response}</span><br/><small className="text-muted">{msg.respondedAt ? new Date(msg.respondedAt).toLocaleString() : ''}</small></> : <span className="text-muted">No response</span>}</td>
                  <td>{new Date(msg.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-primary btn-sm me-2" onClick={() => handleOpenResponse(msg)}>Respond</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteMessage(msg._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Response Modal */}
          {showResponseModal && (
            <div className="modal show d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.3)'}}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Respond to Message</h5>
                    <button type="button" className="btn-close" onClick={()=>setShowResponseModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <textarea className="form-control" rows={4} value={responseText} onChange={e=>setResponseText(e.target.value)} placeholder="Type your response here..."></textarea>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={()=>setShowResponseModal(false)}>Cancel</button>
                    <button className="btn btn-success" onClick={handleSubmitResponse}>Send Response</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 