import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import api from '../api';

const BOOKING_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
const statusBadge = {
  pending: 'bg-warning text-dark',
  confirmed: 'bg-success',
  cancelled: 'bg-secondary',
  completed: 'bg-info text-dark',
};

/* --- Accessible modal helper --- */
function Modal({ open, onClose, titleId, title, children, footer }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    // Focus the first focusable in the dialog
    const first = dialogRef.current?.querySelector('input, textarea, button, [tabindex]:not([tabindex="-1"])');
    first?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      if (prevFocus instanceof HTMLElement) prevFocus.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-dialog modal-dialog-centered" ref={dialogRef}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id={titleId}>{title}</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('services');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // ---- Services ----
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: '', description: '', price: '', duration: '' });
  const [editingService, setEditingService] = useState(null);

  const fetchServices = useCallback(async () => {
    try {
      const res = await api.get('/services');
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch { setError('Failed to load services'); }
  }, []);

  const handleServiceChange = (e) => setNewService({ ...newService, [e.target.name]: e.target.value });

  const handleAddService = async (e) => {
    e.preventDefault();
    setError(''); setMessage('');
    try {
      await api.post('/services', newService);
      setMessage('Service added');
      setNewService({ name: '', description: '', price: '', duration: '' });
      fetchServices();
    } catch { setError('Failed to add service'); }
  };

  const handleDeleteService = async (s) => {
    if (!window.confirm(`Delete service "${s.name}"? Any existing bookings that reference it will be orphaned.`)) return;
    setError(''); setMessage('');
    try {
      await api.delete(`/services/${s._id}`);
      setMessage('Service deleted');
      fetchServices();
    } catch { setError('Failed to delete service'); }
  };

  const handleSaveEdit = async () => {
    setError(''); setMessage('');
    try {
      await api.put(`/services/${editingService._id}`, {
        name: editingService.name,
        description: editingService.description,
        price: editingService.price,
        duration: editingService.duration,
      });
      setMessage('Service updated');
      setEditingService(null);
      fetchServices();
    } catch { setError('Failed to update service'); }
  };

  // ---- Bookings (paginated, filter by status) ----
  const [bookings, setBookings] = useState([]);
  const [bookingsPage, setBookingsPage] = useState(1);
  const [bookingsPages, setBookingsPages] = useState(1);
  const [bookingsFilter, setBookingsFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      const params = { page: bookingsPage, limit: 25 };
      if (bookingsFilter) params.status = bookingsFilter;
      const res = await api.get('/bookings', { params });
      setBookings(res.data.items || []);
      setBookingsPages(res.data.pages || 1);
    } catch { setError('Failed to load bookings'); }
  }, [bookingsPage, bookingsFilter]);

  const handleUpdateBooking = async (id, status) => {
    setError(''); setMessage('');
    try {
      await api.put(`/bookings/admin/${id}`, { status });
      setMessage(`Booking marked as ${status}`);
      fetchBookings();
    } catch { setError('Failed to update booking'); }
  };

  const handleCancelBooking = (b) => {
    if (!window.confirm(`Cancel booking for ${b.user?.name || 'this customer'}?`)) return;
    handleUpdateBooking(b._id, 'cancelled');
  };

  // ---- Analytics ----
  const [analytics, setAnalytics] = useState({ bookingsPerMonth: [], totalUsers: 0, totalBookings: 0 });

  const fetchAnalytics = useCallback(async () => {
    try {
      const [bpm, tu, tb] = await Promise.all([
        api.get('/analytics/bookings-per-month'),
        api.get('/analytics/total-users'),
        api.get('/analytics/total-bookings'),
      ]);
      setAnalytics({
        bookingsPerMonth: Array.isArray(bpm.data) ? bpm.data : [],
        totalUsers: tu.data.count || 0,
        totalBookings: tb.data.count || 0,
      });
    } catch { setError('Failed to load analytics'); }
  }, []);

  // ---- Audit log (paginated) ----
  const [audit, setAudit] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPages, setAuditPages] = useState(1);

  const fetchAudit = useCallback(async () => {
    try {
      const res = await api.get('/audit', { params: { page: auditPage, limit: 50 } });
      setAudit(res.data.items || []);
      setAuditPages(res.data.pages || 1);
    } catch { setError('Failed to load audit log'); }
  }, [auditPage]);

  // ---- Messages (paginated) ----
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPages, setMessagesPages] = useState(1);
  const [messagesFilter, setMessagesFilter] = useState('');
  const [responseModal, setResponseModal] = useState({ open: false, id: null, text: '' });

  const fetchMessages = useCallback(async () => {
    try {
      const params = { page: messagesPage, limit: 25 };
      if (messagesFilter) params.responded = messagesFilter;
      const res = await api.get('/contact', { params });
      setMessages(res.data.items || []);
      setMessagesPages(res.data.pages || 1);
    } catch { setError('Failed to load messages'); }
  }, [messagesPage, messagesFilter]);

  const handleDeleteMessage = async (msg) => {
    if (!window.confirm(`Delete message from ${msg.name}?`)) return;
    setError(''); setMessage('');
    try {
      await api.delete(`/contact/${msg._id}`);
      setMessage('Message deleted');
      fetchMessages();
    } catch { setError('Failed to delete message'); }
  };

  const handleSubmitResponse = async () => {
    setError(''); setMessage('');
    try {
      await api.put(
        `/contact/${responseModal.id}/response`,
        { response: responseModal.text }
      );
      setMessage('Response sent');
      setResponseModal({ open: false, id: null, text: '' });
      fetchMessages();
    } catch { setError('Failed to send response'); }
  };

  // ---- Tab effects ----
  useEffect(() => {
    setError('');
    if (tab === 'services') fetchServices();
    if (tab === 'bookings') fetchBookings();
    if (tab === 'analytics') fetchAnalytics();
    if (tab === 'messages') fetchMessages();
    if (tab === 'audit') fetchAudit();
  }, [tab, fetchServices, fetchBookings, fetchAnalytics, fetchMessages, fetchAudit]);

  const setActiveTab = (t) => { setTab(t); setMessage(''); };

  return (
    <div className="container">
      <h2 className="mb-4">Admin Dashboard</h2>
      {message && <div className="alert alert-success" role="status">{message}</div>}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}

      <ul className="nav nav-tabs mb-4" role="tablist">
        {[
          ['services', 'Services'],
          ['bookings', 'Bookings'],
          ['analytics', 'Analytics'],
          ['messages', 'Messages'],
          ['audit', 'Audit'],
        ].map(([key, label]) => (
          <li className="nav-item" role="presentation" key={key}>
            <button
              id={`tab-${key}`}
              className={`nav-link${tab === key ? ' active' : ''}`}
              role="tab"
              aria-selected={tab === key}
              aria-controls={`panel-${key}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Services */}
      {tab === 'services' && (
        <div id="panel-services" role="tabpanel" aria-labelledby="tab-services">
          <form className="mb-4" onSubmit={handleAddService}>
            <div className="row g-2 align-items-start">
              <div className="col-12 col-md">
                <label htmlFor="svc-name" className="visually-hidden">Service name</label>
                <input id="svc-name" name="name" value={newService.name} onChange={handleServiceChange} className="form-control" placeholder="Name" required />
              </div>
              <div className="col-12 col-md">
                <label htmlFor="svc-desc" className="visually-hidden">Description</label>
                <input id="svc-desc" name="description" value={newService.description} onChange={handleServiceChange} className="form-control" placeholder="Description" />
              </div>
              <div className="col-6 col-md-2">
                <label htmlFor="svc-price" className="visually-hidden">Price</label>
                <input id="svc-price" name="price" type="number" min="0" step="0.01" value={newService.price} onChange={handleServiceChange} className="form-control" placeholder="Price" required />
              </div>
              <div className="col-6 col-md-2">
                <label htmlFor="svc-dur" className="visually-hidden">Duration in minutes</label>
                <input id="svc-dur" name="duration" type="number" min="15" step="5" value={newService.duration} onChange={handleServiceChange} className="form-control" placeholder="Min" required />
              </div>
              <div className="col-12 col-md-auto">
                <button className="btn btn-success w-100">Add</button>
              </div>
            </div>
          </form>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead><tr><th>Name</th><th>Description</th><th>Price</th><th>Duration</th><th>Actions</th></tr></thead>
              <tbody>
                {services.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted">No services yet.</td></tr>
                )}
                {services.map(s => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.description}</td>
                    <td>${s.price}</td>
                    <td>{s.duration} min</td>
                    <td>
                      <button className="btn btn-outline-primary btn-sm me-2" onClick={() => setEditingService({ ...s })}>Edit</button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteService(s)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div id="panel-bookings" role="tabpanel" aria-labelledby="tab-bookings">
          <div className="d-flex align-items-center gap-2 mb-3">
            <label htmlFor="bk-filter" className="mb-0">Status:</label>
            <select
              id="bk-filter"
              className="form-select"
              style={{ maxWidth: 200 }}
              value={bookingsFilter}
              onChange={e => { setBookingsPage(1); setBookingsFilter(e.target.value); }}
            >
              <option value="">All</option>
              {BOOKING_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted">No bookings match this filter.</td></tr>
                )}
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div className="fw-semibold">{b.user?.name || '—'}</div>
                      {b.user?.email && <div className="small"><a href={`mailto:${b.user.email}`}>{b.user.email}</a></div>}
                      {b.user?.phone && <div className="small"><a href={`tel:${b.user.phone}`}>{b.user.phone}</a></div>}
                    </td>
                    <td>{b.service?.name || '—'}</td>
                    <td>{new Date(b.date).toLocaleString()}</td>
                    <td><span className={`badge ${statusBadge[b.status] || 'bg-secondary'}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm me-2" onClick={() => handleUpdateBooking(b._id, 'confirmed')}>Confirm</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelBooking(b)}>Cancel</button>
                        </>
                      )}
                      {b.status === 'confirmed' && (
                        <>
                          <button className="btn btn-info btn-sm me-2" onClick={() => handleUpdateBooking(b._id, 'completed')}>Mark completed</button>
                          <button className="btn btn-outline-danger btn-sm" onClick={() => handleCancelBooking(b)}>Cancel</button>
                        </>
                      )}
                      {(b.status === 'cancelled' || b.status === 'completed') && (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookingsPages > 1 && (
            <Pagination page={bookingsPage} pages={bookingsPages} onChange={setBookingsPage} />
          )}
        </div>
      )}

      {/* Analytics */}
      {tab === 'analytics' && (
        <div id="panel-analytics" role="tabpanel" aria-labelledby="tab-analytics">
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-4">
              <StatCard label="Total users" value={analytics.totalUsers} />
            </div>
            <div className="col-6 col-md-4">
              <StatCard label="Total bookings" value={analytics.totalBookings} />
            </div>
          </div>
          <div className="card p-3" style={{ borderRadius: '1.25rem' }}>
            <h5 className="mb-3">Bookings per month (last 12 months)</h5>
            {analytics.bookingsPerMonth.length === 0 ? (
              <p className="text-muted">No bookings yet.</p>
            ) : (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.bookingsPerMonth} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ffb347" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {tab === 'messages' && (
        <div id="panel-messages" role="tabpanel" aria-labelledby="tab-messages">
          <div className="d-flex align-items-center gap-2 mb-3">
            <label htmlFor="msg-filter" className="mb-0">Show:</label>
            <select
              id="msg-filter"
              className="form-select"
              style={{ maxWidth: 220 }}
              value={messagesFilter}
              onChange={e => { setMessagesPage(1); setMessagesFilter(e.target.value); }}
            >
              <option value="">All</option>
              <option value="false">Unanswered</option>
              <option value="true">Answered</option>
            </select>
          </div>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Message</th><th>Response</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {messages.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-muted">No messages match this filter.</td></tr>
                )}
                {messages.map(msg => (
                  <tr key={msg._id}>
                    <td>{msg.name}</td>
                    <td><a href={`mailto:${msg.email}`}>{msg.email}</a></td>
                    <td style={{ maxWidth: 320, whiteSpace: 'pre-wrap' }}>{msg.message}</td>
                    <td style={{ maxWidth: 280 }}>
                      {msg.response ? (
                        <>
                          <span className="text-success">{msg.response}</span>
                          {msg.respondedAt && <div><small className="text-muted">{new Date(msg.respondedAt).toLocaleString()}</small></div>}
                        </>
                      ) : <span className="text-muted">No response</span>}
                    </td>
                    <td>{new Date(msg.createdAt).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm me-2"
                        onClick={() => setResponseModal({ open: true, id: msg._id, text: msg.response || '' })}
                      >
                        Respond
                      </button>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteMessage(msg)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {messagesPages > 1 && (
            <Pagination page={messagesPage} pages={messagesPages} onChange={setMessagesPage} />
          )}
        </div>
      )}

      {/* Audit log */}
      {tab === 'audit' && (
        <div id="panel-audit" role="tabpanel" aria-labelledby="tab-audit">
          <p className="text-muted small">Every admin mutation is recorded here. Entries are immutable.</p>
          <div className="table-responsive">
            <table className="table table-bordered align-middle">
              <thead>
                <tr><th>When</th><th>Who</th><th>Action</th><th>Target</th><th>Meta</th></tr>
              </thead>
              <tbody>
                {audit.length === 0 && (
                  <tr><td colSpan="5" className="text-center text-muted">No audit entries yet.</td></tr>
                )}
                {audit.map(a => (
                  <tr key={a._id}>
                    <td><small>{new Date(a.createdAt).toLocaleString()}</small></td>
                    <td>
                      <div className="small fw-semibold">{a.actorName || '—'}</div>
                      <div className="small text-muted">{a.actorEmail}</div>
                    </td>
                    <td><code className="small">{a.action}</code></td>
                    <td>
                      {a.target?.type && (
                        <>
                          <div className="small">{a.target.type}</div>
                          {a.target.label && <div className="small text-muted">{a.target.label}</div>}
                        </>
                      )}
                    </td>
                    <td><small className="text-muted">{a.meta ? JSON.stringify(a.meta) : ''}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {auditPages > 1 && (
            <Pagination page={auditPage} pages={auditPages} onChange={setAuditPage} />
          )}
        </div>
      )}

      {/* Service edit modal */}
      <Modal
        open={!!editingService}
        onClose={() => setEditingService(null)}
        titleId="edit-service-title"
        title="Edit service"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditingService(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSaveEdit}>Save</button>
          </>
        }
      >
        {editingService && (
          <div className="d-flex flex-column gap-3">
            <div>
              <label htmlFor="edit-name" className="form-label">Name</label>
              <input id="edit-name" className="form-control" value={editingService.name} onChange={e => setEditingService({ ...editingService, name: e.target.value })} />
            </div>
            <div>
              <label htmlFor="edit-desc" className="form-label">Description</label>
              <input id="edit-desc" className="form-control" value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} />
            </div>
            <div className="row g-2">
              <div className="col-6">
                <label htmlFor="edit-price" className="form-label">Price</label>
                <input id="edit-price" type="number" min="0" step="0.01" className="form-control" value={editingService.price} onChange={e => setEditingService({ ...editingService, price: e.target.value })} />
              </div>
              <div className="col-6">
                <label htmlFor="edit-dur" className="form-label">Duration (min)</label>
                <input id="edit-dur" type="number" min="15" step="5" className="form-control" value={editingService.duration} onChange={e => setEditingService({ ...editingService, duration: e.target.value })} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Response modal */}
      <Modal
        open={responseModal.open}
        onClose={() => setResponseModal({ open: false, id: null, text: '' })}
        titleId="respond-title"
        title="Respond to message"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setResponseModal({ open: false, id: null, text: '' })}>Cancel</button>
            <button className="btn btn-success" onClick={handleSubmitResponse} disabled={!responseModal.text.trim()}>Send response</button>
          </>
        }
      >
        <label htmlFor="response-text" className="form-label">Your response</label>
        <textarea
          id="response-text"
          className="form-control"
          rows={5}
          value={responseModal.text}
          onChange={e => setResponseModal({ ...responseModal, text: e.target.value })}
          placeholder="Type your response here..."
        />
      </Modal>
    </div>
  );
}

/* --- Small building blocks --- */

function StatCard({ label, value }) {
  return (
    <div className="card p-3 h-100" style={{ borderRadius: '1.25rem' }}>
      <div className="text-muted small">{label}</div>
      <div className="fw-bold" style={{ fontSize: '2rem' }}>{value}</div>
    </div>
  );
}

function Pagination({ page, pages, onChange }) {
  return (
    <nav aria-label="Page navigation" className="d-flex justify-content-center mt-3">
      <ul className="pagination mb-0">
        <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page - 1)} disabled={page <= 1}>Previous</button>
        </li>
        <li className="page-item disabled">
          <span className="page-link">Page {page} of {pages}</span>
        </li>
        <li className={`page-item${page >= pages ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => onChange(page + 1)} disabled={page >= pages}>Next</button>
        </li>
      </ul>
    </nav>
  );
}
