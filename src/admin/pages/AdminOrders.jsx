import { useEffect, useState } from "react";
import { AdminAPI } from "../../api/services";

const statuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [filter, setFilter] = useState("");

  const load = () => AdminAPI.orders.list(filter || undefined).then((res) => setOrders(res.data));
  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    await AdminAPI.orders.updateStatus(id, status);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {orders === null ? (
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      ) : orders.length === 0 ? (
        <p className="text-sm text-gray-400">No orders found</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <p>{o.customer_name}</p>
                    <p className="text-xs text-gray-400">{o.customer_email}</p>
                  </td>
                  <td className="px-4 py-3">₹{Number(o.total_amount).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 uppercase text-xs">{o.payment_method}</td>
                  <td className="px-4 py-3">
                    <select
                      value={o.order_status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded-lg text-xs"
                    >
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
