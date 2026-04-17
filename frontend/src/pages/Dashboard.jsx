import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/dashboard.css';

const STATUS_OPTIONS = ['pending', 'packed', 'shipped', 'delivered'];

const badgeClass = (status) => {
  const map = { pending: 'badge-pending', packed: 'badge-packed', shipped: 'badge-shipped', delivered: 'badge-delivered' };
  return `badge ${map[status] || 'badge-pending'}`;
};

/* ── Edit Modal ── */
function EditModal({ order, onClose, onSave }) {
  const [form, setForm] = useState({
    status:             order.status || 'pending',
    dispatch_date:      order.dispatch_date || '',
    lr_number:          order.lr_number || '',
    transport_provider: order.transport_provider || '',
    discount_rate:      order.discount_rate || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    const cleaned = Object.fromEntries(
      Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
    );
    try {
      const res = await fetch(`http://localhost:3000/api/dispatch/orders/${order.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleaned),
      });
      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error);
      onSave(updated);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <div className="modal-header">
          <div>
            <h2>Edit / Dispatch Order</h2>
            <p>{order.customers?.name} · {order.order_date}</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>

        {/* Books summary */}
        <div className="modal-summary">
          <p className="modal-summary-title">Books in this order</p>
          {order.order_items?.map((item, i) => (
            <div key={i} className="modal-book-row">
              <span className="modal-book-name">{item.book_title}</span>
              <span className="modal-book-qty">×{item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="modal-fields">
          <div className="modal-field">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label>LR / Consignment Number</label>
            <input type="text" placeholder="e.g. LR-4821" value={form.lr_number}
              onChange={e => setForm({ ...form, lr_number: e.target.value })} />
          </div>
          <div className="modal-field">
            <label>Dispatch Date</label>
            <input type="date" value={form.dispatch_date}
              onChange={e => setForm({ ...form, dispatch_date: e.target.value })} />
          </div>
          <div className="modal-field">
            <label>Transport Provider</label>
            <input type="text" placeholder="e.g. DTDC" value={form.transport_provider}
              onChange={e => setForm({ ...form, transport_provider: e.target.value })} />
          </div>
          <div className="modal-field">
            <label>Discount %</label>
            <input type="number" placeholder="0" value={form.discount_rate}
              onChange={e => setForm({ ...form, discount_rate: e.target.value })} />
          </div>
        </div>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="modal-save-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedOrder, setSelected]  = useState(null);

  const [filterRep,  setFilterRep]  = useState('');
  const [filterBook, setFilterBook] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo,   setFilterTo]   = useState('');

  const handleLogout = async () => { await logout(); navigate('/login'); };

  useEffect(() => {
    fetch('http://localhost:3000/api/dispatch/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    setSelected(null);
  };

  const filtered = orders.filter(o => {
    if (filterRep  && !o.users?.username?.toLowerCase().includes(filterRep.toLowerCase()))  return false;
    if (filterBook && !o.order_items?.some(i => i.book_title?.toLowerCase().includes(filterBook.toLowerCase()))) return false;
    if (filterFrom && o.order_date < filterFrom) return false;
    if (filterTo   && o.order_date > filterTo)   return false;
    return true;
  });

  return (
    <div className="dash-page">

      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h1>Publisher Dashboard</h1>
          <p>Welcome back, {user?.username}</p>
        </div>
        <div className="dash-header-right">
          <Link to="/reports" className="dash-reports-btn">Reports</Link>
          <button className="dash-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dash-body">

        {/* Filters */}
        <div className="filter-card">
          <p className="filter-card-title">Filter Orders</p>
          <div className="filter-row">
            <div className="filter-field">
              <label>Rep Name</label>
              <input placeholder="Search rep..." value={filterRep} onChange={e => setFilterRep(e.target.value)} />
            </div>
            <div className="filter-field">
              <label>Book Title</label>
              <input placeholder="Search book..." value={filterBook} onChange={e => setFilterBook(e.target.value)} />
            </div>
            <div className="filter-field">
              <label>From Date</label>
              <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
            </div>
            <div className="filter-field">
              <label>To Date</label>
              <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)} />
            </div>
            <button className="filter-clear-btn"
              onClick={() => { setFilterRep(''); setFilterBook(''); setFilterFrom(''); setFilterTo(''); }}>
              Clear
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-card">
          <div className="orders-card-header">
            <h2>All Orders</h2>
            <span className="orders-count">Showing {filtered.length} of {orders.length}</span>
          </div>

          {loading ? (
            <p className="orders-loading">Loading orders...</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Rep</th>
                    <th>Books Ordered</th>
                    <th>Transport</th>
                    <th>Status</th>
                    <th>LR No.</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="no-orders">No orders found</td></tr>
                  ) : filtered.map(order => (
                    <tr key={order.id}>
                      <td className="td-date">{order.order_date}</td>
                      <td>
                        <div className="td-name">{order.customers?.name}</div>
                        <div className="td-addr">{order.customers?.address}</div>
                      </td>
                      <td className="td-rep">{order.users?.username}</td>
                      <td className="td-books">
                        {order.order_items?.map((i, idx) => (
                          <div key={idx}>{i.book_title} <strong>×{i.quantity}</strong></div>
                        )) || '—'}
                      </td>
                      <td>
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>{order.transport_provider || '—'}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{order.destination ? `→ ${order.destination}` : ''}</div>
                        {order.discount_rate > 0 && <div style={{ fontSize: 12, color: '#64748b' }}>{order.discount_rate}% off</div>}
                      </td>
                      <td><span className={badgeClass(order.status)}>{order.status}</span></td>
                      <td className="td-lr">{order.lr_number || '—'}</td>
                      <td>
                        <button className="edit-btn" onClick={() => setSelected(order)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {selectedOrder && (
        <EditModal order={selectedOrder} onClose={() => setSelected(null)} onSave={handleSave} />
      )}

    </div>
  );
}
