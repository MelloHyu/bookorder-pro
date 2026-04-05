import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import CascadingOrders from "./CascadingOrders";

export default function StatusTab({ orders, setOrders }) {
  const [liveUpdate, setLiveUpdate] = useState(null);

  // Subscribe to real-time dispatch updates from publisher
  useEffect(() => {
    const channel = supabase
      .channel("dispatch-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "transactions" },
        (payload) => {
          setLiveUpdate(payload.new);
          // Update the specific order in state
          setOrders((prev) =>
            prev.map((order) =>
              order.id === payload.new.id ? { ...order, ...payload.new } : order
            )
          );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [setOrders]);

  return (
    <div>
      {liveUpdate && (
        <div className="mx-4 mt-4 bg-blue-900 border border-blue-500 text-blue-200 text-sm px-4 py-2 rounded-lg">
          Status updated for an order — scroll down to see it.
        </div>
      )}
      <CascadingOrders orders={orders} />
    </div>
  );
}
