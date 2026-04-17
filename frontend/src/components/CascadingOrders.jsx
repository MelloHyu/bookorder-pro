export default function CascadingOrders({ orders }) {
  if (!orders || orders.length === 0) {
    return <p className="orders-empty">No orders yet. Submit your first order!</p>;
  }

  const grouped = orders.reduce((acc, order) => {
    const name = order.customers?.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(order);
    return acc;
  }, {});

  const statusClass = (status) => {
    const map = { pending: "status-pending", packed: "status-packed", shipped: "status-shipped", delivered: "status-delivered" };
    return map[status] || "status-pending";
  };

  return (
    <div className="orders-list">
      {Object.entries(grouped).map(([customerName, customerOrders]) => (
        <div key={customerName} className="customer-card">

          {/* Customer header */}
          <div className="customer-card-header">
            <div className="customer-name">{customerName}</div>
            <div className="customer-address">{customerOrders[0].customers?.address}</div>
          </div>

          {/* Orders under this customer */}
          {customerOrders.map((order) => (
            <div key={order.id} className="order-entry">

              <div className="order-entry-top">
                <span className="order-date">{order.order_date}</span>
                <span className={`status-badge ${statusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-books">
                {order.order_items?.map((item, i) => (
                  <div key={i} className="order-book-row">
                    <span className="order-book-title">{item.book_title}</span>
                    <span className="order-book-qty">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              {order.lr_number && (
                <div className="order-dispatch-info">
                  LR: {order.lr_number}
                  {order.dispatch_date && ` · Dispatched: ${order.dispatch_date}`}
                </div>
              )}

              {(order.transport_provider || order.destination || order.discount_rate > 0) && (
                <div className="order-logistics">
                  {order.discount_rate > 0 && `${order.discount_rate}% discount`}
                  {order.transport_provider && ` · ${order.transport_provider}`}
                  {order.destination && ` → ${order.destination}`}
                </div>
              )}

            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
