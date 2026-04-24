import React, { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Link } from 'react-router-dom';
import api from '../api';

// Business hours: Sat–Thu (closed Friday), 10:00 through midnight.
// Last bookable slot is 23:30 (last 30-min slot before close).
const BUSINESS_HOURS_MIN = { hour: 10, minute: 0 };
const BUSINESS_HOURS_MAX = { hour: 23, minute: 30 };
const CLOSED_WEEKDAY = 5; // 0 Sun, 1 Mon, 2 Tue, 3 Wed, 4 Thu, 5 Fri, 6 Sat

function makeTime(hour, minute) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

function LoginPromptCard() {
  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4 shadow-lg animate-pop text-center" style={{ maxWidth: 420, width: '100%', borderRadius: '2rem' }}>
        <div className="mb-3">
          <span style={{ fontSize: '3rem' }} role="img" aria-label="paw">🐾</span>
        </div>
        <h2 className="fw-bold mb-2">Log in to book</h2>
        <p className="text-muted mb-4">
          You'll need a PetPaw account to schedule a grooming appointment. It takes less than a minute.
        </p>
        <Link to="/login" className="btn btn-primary w-100 mb-2 animate-rise">Login</Link>
        <Link to="/register" className="btn btn-light w-100">Create an account</Link>
      </div>
    </div>
  );
}

export default function Booking({ user, authReady }) {
  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/services')
      .then(res => {
        if (cancelled) return;
        const list = Array.isArray(res.data?.services) ? res.data.services
          : Array.isArray(res.data) ? res.data : [];
        setServices(list);
      })
      .catch(() => { if (!cancelled) setError('Failed to load services'); })
      .finally(() => { if (!cancelled) setServicesLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const minTime = useMemo(() => makeTime(BUSINESS_HOURS_MIN.hour, BUSINESS_HOURS_MIN.minute), []);
  const maxTime = useMemo(() => makeTime(BUSINESS_HOURS_MAX.hour, BUSINESS_HOURS_MAX.minute), []);
  const isOpenDay = (d) => d.getDay() !== CLOSED_WEEKDAY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (!serviceId) { setError('Please choose a service.'); return; }
    if (!date) { setError('Please pick a date and time.'); return; }
    if (!isOpenDay(date)) { setError('We\'re closed on Fridays. Please choose another day.'); return; }
    setLoading(true);
    try {
      await api.post('/bookings', { serviceId, date });
      setMessage('Booking confirmed! You can track it from your dashboard.');
      setServiceId('');
      setDate(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!authReady) return null;
  if (!user) return <LoginPromptCard />;

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div className="text-center my-4">
        <span style={{ fontSize: '2.5rem' }} role="img" aria-label="calendar">📅</span>
        <h2 className="fw-bold mt-2 animate-fadein">Book a Grooming Appointment</h2>
        <p className="text-muted animate-fadein">Treat your pet to a spa day.</p>
      </div>

      {message && <div className="alert alert-success animate-fadein" role="status">{message}</div>}
      {error && <div className="alert alert-danger animate-fadein" role="alert">{error}</div>}

      <form onSubmit={handleSubmit} className="animate-fadein" noValidate>
        <fieldset className="mb-4">
          <legend className="form-label">Choose a service</legend>
          {servicesLoading && (
            <div className="row g-3">
              {[1, 2, 3].map(i => (
                <div className="col-12 col-md-6" key={`sksrv-${i}`}>
                  <div className="gallery-skeleton" style={{ aspectRatio: '4 / 2', borderRadius: '1rem' }} />
                </div>
              ))}
            </div>
          )}
          {!servicesLoading && services.length === 0 && (
            <div className="alert alert-info">No services available right now. Please check back soon.</div>
          )}
          {!servicesLoading && services.length > 0 && (
            <div className="row g-3" role="radiogroup" aria-label="Grooming service">
              {services.map(s => {
                const selected = serviceId === s._id;
                return (
                  <div className="col-12 col-md-6" key={s._id}>
                    <label
                      className={`card service-card h-100 p-3${selected ? ' service-card--selected' : ''}`}
                      htmlFor={`service-${s._id}`}
                    >
                      <input
                        id={`service-${s._id}`}
                        type="radio"
                        name="service"
                        value={s._id}
                        checked={selected}
                        onChange={() => setServiceId(s._id)}
                        className="visually-hidden"
                      />
                      <div className="d-flex justify-content-between align-items-start">
                        <h5 className="mb-1">{s.name}</h5>
                        <span className="badge bg-light text-dark">${s.price}</span>
                      </div>
                      {s.description && <p className="text-muted small mb-2">{s.description}</p>}
                      <div className="text-muted small">⏱ {s.duration} min</div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </fieldset>

        <div className="mb-4">
          <label htmlFor="booking-date" className="form-label">Date &amp; time</label>
          <DatePicker
            id="booking-date"
            selected={date}
            onChange={setDate}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={30}
            dateFormat="EEE, MMM d yyyy — h:mm aa"
            minDate={new Date()}
            minTime={minTime}
            maxTime={maxTime}
            filterDate={isOpenDay}
            placeholderText="Pick an open slot"
            className="form-control"
            required
          />
          <div className="form-text">Open Saturday–Thursday, 10:00 AM – midnight (Cairo time). Closed Fridays.</div>
        </div>

        <button
          type="submit"
          className="btn btn-primary w-100 animate-rise"
          disabled={loading || servicesLoading}
        >
          {loading ? <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> : 'Book Now'}
          {loading ? ' Booking...' : ''}
        </button>
      </form>
    </div>
  );
}
