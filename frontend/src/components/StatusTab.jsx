import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import CascadingOrders from "./CascadingOrders";

export default function StatusTab({ orders, setOrders }) {
  const [liveUpdate, setLiveUpdate] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel("dispatch-updates")
      .on("postgres_changes",
        { event: "UPDATE", schema: "public", table: "transactions" },
        (payload) => {
          setLiveUpdate(true);
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          );
          setTimeout(() => setLiveUpdate(false), 4000);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [setOrders]);

  return (
    <div>
      {liveUpdate && (
        <div className="live-banner">
          ✦ Status updated — your order status has changed
        </div>
      )}
      <CascadingOrders orders={orders} />
    </div>
  );
}
