const STATUS_COLORS = {
  pending: "bg-yellow-500",
  packed: "bg-blue-500",
  shipped: "bg-purple-500",
  delivered: "bg-green-500",
};

export default function CascadingOrders({ orders }) {
  if (!orders || orders.length === 0) {
    return <p className="text-gray-400 text-center py-8">No orders yet.</p>;
  }

  // Group orders by customer name
  const grouped = orders.reduce((acc, order) => {
    const name = order.customers?.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(order);
    return acc;
  }, {});

  return (
    <div className="space-y-6 p-4">
      {Object.entries(grouped).map(([customerName, customerOrders]) => (
        <div key={customerName} className="bg-gray-800 rounded-xl overflow-hidden">

          {/* Customer header */}
          <div className="bg-gray-700 px-4 py-3">
            <p className="font-semibold text-white">{customerName}</p>
            <p className="text-xs text-gray-400">{customerOrders[0].customers?.address}</p>
          </div>

          {/* Transactions under this customer */}
          <div className="divide-y divide-gray-700">
            {customerOrders.map((order) => (
              <div key={order.id} className="px-4 py-3 space-y-2">

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">{order.order_date}</span>
                  <span className={`text-xs text-white px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] || "bg-gray-500"}`}>
                    {order.status}
                  </span>
                </div>

                {/* Books */}
                <div className="space-y-1">
                  {order.order_items?.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.book_title}</span>
                      <span className="text-white font-medium">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Dispatch info if available */}
                {order.lr_number && (
                  <div className="text-xs text-gray-400 mt-1">
                    LR: {order.lr_number}
                    {order.dispatch_date && ` · Dispatched: ${order.dispatch_date}`}
                  </div>
                )}

                {/* Logistics */}
                <div className="text-xs text-gray-500">
                  {order.discount_rate > 0 && `Discount: ${order.discount_rate}%`}
                  {order.transport_provider && ` · ${order.transport_provider}`}
                  {order.destination && ` → ${order.destination}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
