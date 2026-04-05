import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import '../styles/dashboard.css';

//Edit/Dispatch Modal

function EditModal({ order, onClose, onSave }) {
  const [form, setForm] = useState({
    status: order.status || 'pending',
    dispatch_date: order.dispatch_date || '',
    lr_number: order.lr_number || '',
    transport_provider: order.transport_provider || '',
    discount_rate: order.discount_rate || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
  setSaving(true);

  // Clean empty strings to null so numeric fields don't crash Postgres
  const cleanedForm = Object.fromEntries(
    Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
  );

  const res = await fetch(`http://localhost:3000/api/dispatch/orders/${order.id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cleanedForm),  // send cleanedForm not form
  });
  const updated = await res.json();
  setSaving(false);
  onSave(updated);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
    }}>
      <div style={{
        background: '#fff', borderRadius: 10, padding: 28,
        width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.18)'
      }}>
        <h2 style={{ marginTop: 0 }}>Edit Order — {order.customers?.name}</h2>

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Status</label>
        <select
          style={{ width: '100%', padding: '8px', marginBottom: 14, borderRadius: 6, border: '1px solid #ccc' }}
          value={form.status}
          onChange={e => setForm({ ...form, status: e.target.value })}
        >
          {['pending', 'packed', 'shipped', 'delivered'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Dispatch Date</label>
        <input type="date" style={{ width: '100%', padding: '8px', marginBottom: 14, borderRadius: 6, border: '1px solid #ccc' }}
          value={form.dispatch_date}
          onChange={e => setForm({ ...form, dispatch_date: e.target.value })} />

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>LR / Consignment Number</label>
        <input type="text" placeholder="e.g. LR-4821" style={{ width: '100%', padding: '8px', marginBottom: 14, borderRadius: 6, border: '1px solid #ccc' }}
          value={form.lr_number}
          onChange={e => setForm({ ...form, lr_number: e.target.value })} />

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Transport Provider</label>
        <input type="text" placeholder="e.g. DTDC" style={{ width: '100%', padding: '8px', marginBottom: 14, borderRadius: 6, border: '1px solid #ccc' }}
          value={form.transport_provider}
          onChange={e => setForm({ ...form, transport_provider: e.target.value })} />

        <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>Discount %</label>
        <input type="number" style={{ width: '100%', padding: '8px', marginBottom: 20, borderRadius: 6, border: '1px solid #ccc' }}
          value={form.discount_rate}
          onChange={e => setForm({ ...form, discount_rate: e.target.value })} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '8px 18px', borderRadius: 6, border: '1px solid #ccc', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '8px 18px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

//Status Badge

function StatusBadge({ status }) {
  const colors = {
    pending:   { bg: '#f3f4f6', color: '#6b7280' },
    packed:    { bg: '#fef9c3', color: '#854d0e' },
    shipped:   { bg: '#dbeafe', color: '#1d4ed8' },
    delivered: { bg: '#dcfce7', color: '#15803d' },
  };
  const s = colors[status] || colors.pending;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 12, fontSize: 12,
      fontWeight: 600, background: s.bg, color: s.color
    }}>
      {status}
    </span>
  );
}

//Main Dashboard

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filters
  const [filterRep, setFilterRep] = useState('');
  const [filterBook, setFilterBook] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/dispatch/orders', { credentials: 'include' })
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = (updated) => {
    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
    setSelectedOrder(null);
  };

  // Client-side filtering
  const filtered = orders.filter(o => {
    if (filterRep && !o.users?.username?.toLowerCase().includes(filterRep.toLowerCase())) return false;
    if (filterBook && !o.order_items?.some(i => i.book_title?.toLowerCase().includes(filterBook.toLowerCase()))) return false;
    if (filterFrom && o.order_date < filterFrom) return false;
    if (filterTo && o.order_date > filterTo) return false;
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', color: '#fff', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>Publisher Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14 }}>{user?.username}</span>
          <button onClick={handleLogout}
            style={{ padding: '6px 14px', borderRadius: 6, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}>
            Logout
          </button>
        </div>
      </div>

      <div style={{ padding: '24px 28px' }}>
        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 14, flexWrap: 'wrap', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Rep Name</label>
            <input placeholder="Filter by rep..." value={filterRep} onChange={e => setFilterRep(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>Book Title</label>
            <input placeholder="Filter by book..." value={filterBook} onChange={e => setFilterBook(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>From Date</label>
            <input type="date" value={filterFrom} onChange={e => setFilterFrom(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 4 }}>To Date</label>
            <input type="date" value={filterTo} onChange={e => setFilterTo(e.target.value)}
              style={{ padding: '7px 10px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 13 }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={() => { setFilterRep(''); setFilterBook(''); setFilterFrom(''); setFilterTo(''); }}
              style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: 13 }}>
              Clear
            </button>
          </div>
        </div>

        {/* Orders count */}
        <p style={{ margin: '0 0 12px', color: '#6b7280', fontSize: 14 }}>
          Showing <strong>{filtered.length}</strong> of <strong>{orders.length}</strong> orders
        </p>

        {/* Table */}
        {loading ? (
          <p>Loading orders...</p>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  {['Date', 'Customer', 'Address', 'Rep', 'Books Ordered', 'Discount', 'Transport', 'Status', 'LR No.', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', fontWeight: 600, color: '#374151', borderBottom: '1px solid #e5e7eb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>No orders found</td></tr>
                ) : filtered.map(order => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '10px 14px' }}>{order.order_date}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 500 }}>{order.customers?.name}</td>
                    <td style={{ padding: '10px 14px', color: '#6b7280', fontSize: 13 }}>{order.customers?.address}</td>
                    <td style={{ padding: '10px 14px' }}>{order.users?.username}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13 }}>
                      {order.order_items?.map(i => `${i.book_title} ×${i.quantity}`).join(', ') || '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>{order.discount_rate ? `${order.discount_rate}%` : '—'}</td>
                    <td style={{ padding: '10px 14px' }}>{order.transport_provider || '—'}</td>
                    <td style={{ padding: '10px 14px' }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#6b7280' }}>{order.lr_number || '—'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => setSelectedOrder(order)}
                        style={{ padding: '5px 12px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12 }}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedOrder && (
        <EditModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}