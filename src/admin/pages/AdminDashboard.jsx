import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Users, IndianRupee, AlertTriangle } from "lucide-react";
import { AdminAPI } from "../../api/services";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    AdminAPI.dashboard().then((res) => setStats(res.data)).catch(() => setStats(null));
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />)}
      </div>
    );
  }

  const cards = [
    { label: "Total Products", value: stats.products, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Total Orders", value: stats.orders, icon: ShoppingCart, color: "bg-green-50 text-green-600" },
    { label: "Registered Users", value: stats.users, icon: Users, color: "bg-purple-50 text-purple-600" },
    { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon size={18} />
            </div>
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Recent Orders</h3>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((o) => (
                <div key={o.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{o.order_number}</span>
                  <span className="text-gray-500 capitalize">{o.order_status}</span>
                  <span className="font-medium">₹{Number(o.total_amount).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
          <Link to="/admin/orders" className="text-sm text-gold-700 hover:underline mt-4 inline-block">View all orders →</Link>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" /> Low Stock
          </h3>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="text-red-600 font-medium">{p.stock_qty} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
