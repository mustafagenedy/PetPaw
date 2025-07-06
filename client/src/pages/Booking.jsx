import axios from 'axios';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Booking() {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    axios.get('/api/services')
      .then(res => {
        if (Array.isArray(res.data.services)) {
          setServices(res.data.services);
        } else if (Array.isArray(res.data)) {
          setServices(res.data);
        } else {
          setServices([]);
        }
      })
      .catch(() => setError('Failed to load services'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    if (!isLoggedIn) {
      setError('You must be logged in to book.');
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/bookings', {
        serviceId,
        date,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Booking successful!');
      setServiceId('');
      setDate(null);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4 shadow-lg animate-pop" style={{ maxWidth: 480, width: '100%', borderRadius: '2rem' }}>
        <div className="text-center mb-3">
          <span style={{ fontSize: '2.5rem' }} role="img" aria-label="calendar">📅</span>
          <h2 className="fw-bold mt-2 animate-fadein">Book a Grooming Appointment</h2>
          <p className="text-muted animate-fadein">Treat your pet to a spa day!</p>
        </div>
        {message && <div className="alert alert-success animate-fadein">{message}</div>}
        {error && <div className="alert alert-danger animate-fadein">{error}</div>}
        <form onSubmit={handleSubmit} className="mb-3 animate-fadein">
          <div className="mb-3">
            <label className="form-label">Service</label>
            <select className="form-select" value={serviceId} onChange={e => setServiceId(e.target.value)} required disabled={!isLoggedIn}>
              <option value="">Select a service</option>
              {Array.isArray(services) && services.map(s => (
                <option key={s._id} value={s._id}>{s.name} (${s.price})</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label">Date & Time</label>
            <div>
              <DatePicker
                selected={date}
                onChange={setDate}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="form-control"
                required
                disabled={!isLoggedIn}
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary w-100 animate-bounce" disabled={loading || !isLoggedIn}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : 'Book Now'}
            {loading ? ' Booking...' : ''}
          </button>
          {!isLoggedIn && <div className="alert alert-warning mt-3">You must be logged in to book a service.</div>}
        </form>
        <div className="text-center animate-fadein" style={{fontSize:'1.2rem'}}>
          <span role="img" aria-label="dog">🐶</span> <span role="img" aria-label="cat">🐱</span> <span role="img" aria-label="paw">🐾</span>
        </div>
      </div>
    </div>
  );
} 