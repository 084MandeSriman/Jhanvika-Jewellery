import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, MapPin, Package, LogOut, Plus, Trash2, Bell, RotateCcw, Clock, Download, Tag } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AddressAPI, OrderAPI, ReturnAPI, NotificationAPI, RecentlyViewedAPI } from "../api/services";
import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/ProductCard";

const tabs = [
  { id: "orders", label: "Orders", icon: Package },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "recent", label: "Recently Viewed", icon: Clock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "profile", label: "Profile", icon: User },
];

export default function Account() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <SectionHeading eyebrow="My Account" title={`Hello, ${user?.name?.split(" ")[0] || "there"}`} align="left" />

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex md:flex-col gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full md:rounded-xl text-sm font-body whitespace-nowrap transition-colors ${
                  activeTab === t.id ? "bg-maroon-900 text-ivory" : "text-maroon-900 hover:bg-ivory-deep"
                }`}
              >
                <t.icon size={15} /> {t.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full md:rounded-xl text-sm font-body text-maroon-700 hover:bg-maroon-50 whitespace-nowrap"
            >
              <LogOut size={15} /> Log Out
            </button>
          </nav>
        </aside>

        <div className="md:col-span-3">
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "returns" && <ReturnsTab />}
          {activeTab === "addresses" && <AddressesTab />}
          {activeTab === "recent" && <RecentlyViewedTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "profile" && <ProfileTab user={user} />}
        </div>
      </div>
    </div>
  );
}

const TIMELINE_STEPS = ["confirmed", "processing", "shipped", "delivered"];

function OrderTimeline({ status }) {
  if (status === "cancelled" || status === "returned") {
    return <p className="text-xs font-body text-maroon-700 mt-2 capitalize">Order {status}</p>;
  }
  const currentIndex = TIMELINE_STEPS.indexOf(status);
  return (
    <div className="flex items-center gap-1 mt-3 mb-1">
      {TIMELINE_STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i <= currentIndex ? "bg-gold-500" : "bg-gold-200"}`} />
          {i < TIMELINE_STEPS.length - 1 && <div className={`h-0.5 flex-1 ${i < currentIndex ? "bg-gold-500" : "bg-gold-200"}`} />}
        </div>
      ))}
    </div>
  );
}

function OrdersTab() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    OrderAPI.list().then((res) => setOrders(res.data)).catch(() => setOrders([]));
  }, []);

  if (orders === null) {
    return <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-ivory-deep animate-pulse" />)}</div>;
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 bg-ivory-deep rounded-2xl border border-gold-200/50">
        <Package className="mx-auto text-gold-400 mb-3" size={32} strokeWidth={1.3} />
        <p className="font-display text-xl text-maroon-900 mb-1">No orders yet</p>
        <p className="text-maroon-900/60 font-body text-sm">Your placed orders will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((o, i) => (
        <motion.div
          key={o.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-5"
        >
          <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
            <div>
              <p className="font-display text-lg text-maroon-900">{o.orderNumber}</p>
              <p className="text-xs text-maroon-900/50 font-body">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
            </div>
            <span className="text-xs font-body px-3 py-1 rounded-full bg-emerald-800/10 text-emerald-800 capitalize">{o.status}</span>
          </div>
          <OrderTimeline status={o.status} />
          <div className="space-y-1 mb-3 mt-3">
            {o.items.map((it) => (
              <p key={it.productId} className="text-sm text-maroon-900/70 font-body">
                {it.name} × {it.qty}
              </p>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="font-display text-lg text-maroon-900">₹{o.total.toLocaleString("en-IN")}</p>
            <button
              onClick={() => OrderAPI.downloadInvoice(o.id, o.orderNumber)}
              className="flex items-center gap-1.5 text-xs font-body text-gold-700 hover:text-gold-600"
            >
              <Download size={13} /> Invoice
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });

  const load = () => AddressAPI.list().then((res) => setAddresses(res.data)).catch(() => setAddresses([]));

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await AddressAPI.create(form);
    setForm({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
    setShowForm(false);
    load();
  };

  const onDelete = async (id) => {
    await AddressAPI.remove(id);
    load();
  };

  if (addresses === null) {
    return <div className="space-y-3">{[...Array(2)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-ivory-deep animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-4">
      {addresses.map((a) => (
        <div key={a.id} className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-5 flex justify-between items-start gap-3">
          <div>
            <p className="font-body text-sm font-medium text-maroon-900">{a.full_name} · {a.phone}</p>
            <p className="text-sm text-maroon-900/60 font-body mt-1">
              {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}
            </p>
          </div>
          <button onClick={() => onDelete(a.id)} className="text-maroon-900/40 hover:text-maroon-700 shrink-0">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={onSubmit} className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input name="fullName" required placeholder="Full name" value={form.fullName} onChange={onChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
            <input name="phone" required placeholder="Phone" value={form.phone} onChange={onChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
          </div>
          <input name="line1" required placeholder="Address line 1" value={form.line1} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
          <input name="line2" placeholder="Address line 2 (optional)" value={form.line2} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
          <div className="grid grid-cols-3 gap-3">
            <input name="city" required placeholder="City" value={form.city} onChange={onChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
            <input name="state" required placeholder="State" value={form.state} onChange={onChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
            <input name="pincode" required placeholder="Pincode" value={form.pincode} onChange={onChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-full bg-maroon-900 text-ivory text-sm font-body">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-full border border-gold-300 text-maroon-900 text-sm font-body">Cancel</button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm font-body text-gold-700 hover:text-gold-600">
          <Plus size={16} /> Add new address
        </button>
      )}
    </div>
  );
}

function ProfileTab({ user }) {
  return (
    <div className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-maroon-900/50 font-body">Name</p>
        <p className="font-body text-maroon-900">{user?.name}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-maroon-900/50 font-body">Email</p>
        <p className="font-body text-maroon-900">{user?.email}</p>
      </div>
      {user?.phone && (
        <div>
          <p className="text-xs uppercase tracking-wider text-maroon-900/50 font-body">Phone</p>
          <p className="font-body text-maroon-900">{user.phone}</p>
        </div>
      )}
    </div>
  );
}

function ReturnsTab() {
  const [returns, setReturns] = useState(null);

  useEffect(() => {
    ReturnAPI.list().then((res) => setReturns(res.data)).catch(() => setReturns([]));
  }, []);

  if (returns === null) return <div className="h-24 rounded-2xl bg-ivory-deep animate-pulse" />;

  if (returns.length === 0) {
    return (
      <div className="text-center py-16 bg-ivory-deep rounded-2xl border border-gold-200/50">
        <RotateCcw className="mx-auto text-gold-400 mb-3" size={32} strokeWidth={1.3} />
        <p className="font-display text-xl text-maroon-900 mb-1">No return requests</p>
        <p className="text-maroon-900/60 font-body text-sm">Return requests can be raised from your order history once delivered.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {returns.map((r) => (
        <div key={r.id} className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-4 flex justify-between items-center">
          <div>
            <p className="font-body text-sm text-maroon-900 font-medium">{r.product_name}</p>
            <p className="text-xs text-maroon-900/50 font-body">{r.order_number} · {r.reason}</p>
          </div>
          <span className="text-xs font-body px-3 py-1 rounded-full bg-gold-100 text-gold-700 capitalize">{r.status}</span>
        </div>
      ))}
    </div>
  );
}

function RecentlyViewedTab() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    RecentlyViewedAPI.list().then((res) => setItems(res.data)).catch(() => setItems([]));
  }, []);

  if (items === null) return <div className="h-24 rounded-2xl bg-ivory-deep animate-pulse" />;
  if (items.length === 0) return <p className="text-sm text-maroon-900/50 font-body">Products you view will appear here.</p>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
    </div>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState(null);

  const load = () => NotificationAPI.list().then((res) => setNotifications(res.data)).catch(() => setNotifications([]));
  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    await NotificationAPI.markAllRead();
    load();
  };

  if (notifications === null) return <div className="h-24 rounded-2xl bg-ivory-deep animate-pulse" />;

  if (notifications.length === 0) {
    return (
      <div className="text-center py-16 bg-ivory-deep rounded-2xl border border-gold-200/50">
        <Bell className="mx-auto text-gold-400 mb-3" size={32} strokeWidth={1.3} />
        <p className="font-display text-xl text-maroon-900 mb-1">No notifications</p>
        <p className="text-maroon-900/60 font-body text-sm">Order and account updates will show up here.</p>
      </div>
    );
  }

  return (
    <div>
      <button onClick={markAllRead} className="text-xs font-body text-gold-700 hover:text-gold-600 mb-3">Mark all as read</button>
      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 rounded-xl border font-body text-sm ${n.is_read ? "bg-ivory border-gold-200/40 text-maroon-900/60" : "bg-ivory-deep border-gold-300 text-maroon-900"}`}>
            <p className="font-medium">{n.title}</p>
            {n.message && <p className="text-xs mt-0.5 opacity-70">{n.message}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
