import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, MapPin, Package, LogOut, Plus, Trash2, Bell, RotateCcw, Clock, Download, ChevronRight, CalendarDays, Clock3, Headphones, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { AddressAPI, OrderAPI, ReturnAPI, NotificationAPI, RecentlyViewedAPI } from "../api/services";
import SectionHeading from "../components/SectionHeading";
import ProductCard from "../components/ProductCard";
import JewelArt from "../components/JewelArt";
import { resolveImageUrl } from "../utils/imageUrl";
import OrderProgress from "../components/OrderProgress";

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
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-10 py-7 sm:py-10 md:py-14">
      <SectionHeading eyebrow="My Account" title={`Hello, ${user?.name || "there"}`} align="center" />

      <div className="grid min-w-0 md:grid-cols-4 gap-5 md:gap-8">
        <aside className="min-w-0 md:col-span-1 md:self-start md:sticky md:top-[calc(var(--storefront-header-height,7rem)+1rem)]">
          <nav aria-label="Account sections" className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full md:rounded-xl text-xs sm:text-sm font-body whitespace-nowrap transition-colors ${
                  activeTab === t.id ? "bg-maroon-900 text-ivory" : "text-maroon-900 hover:bg-ivory-deep"
                }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full md:rounded-xl text-xs sm:text-sm font-body text-maroon-700 hover:bg-maroon-50 whitespace-nowrap"
            >
              <LogOut size={14} /> Log Out
            </button>
          </nav>
        </aside>

        <div className="min-w-0 md:col-span-3">
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

function OrdersTab() {
  const navigate = useNavigate();
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
          role="button"
          tabIndex={0}
          aria-label={`View details for order ${o.orderNumber}`}
          onClick={() => navigate(`/account/orders/${o.id}`, { state: { orderPreview: o } })}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              navigate(`/account/orders/${o.id}`, { state: { orderPreview: o } });
            }
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="cursor-pointer bg-ivory-deep border border-gold-200/50 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold-500"
        >
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="h-[76px] w-[76px] sm:h-[88px] sm:w-[88px] shrink-0 overflow-hidden rounded-lg bg-[#f1e3ce]">
              {o.items[0]?.image ? (
                <img src={resolveImageUrl(o.items[0].image)} alt={o.items[0].name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full p-2">
                  <JewelArt type={o.items[0]?.categoryType || "necklace"} theme={o.items[0]?.theme || "gold"} className="h-full w-full" animated={false} />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-sm sm:text-base leading-tight text-maroon-900">{o.orderNumber}</p>
                  <p className="text-[10px] sm:text-xs text-maroon-900/50 font-body">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-800/10 px-3 py-1 text-[9px] sm:text-[10px] font-body text-emerald-800 capitalize">{o.status}</span>
              </div>
              <p className="mt-1 line-clamp-1 text-xs sm:text-sm text-maroon-900/80 font-body">
                {o.items[0]?.name} × {o.items[0]?.qty}
                {o.items.length > 1 && ` + ${o.items.length - 1} more`}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                <p className="font-display text-sm sm:text-base text-gold-700">₹{o.total.toLocaleString("en-IN")}</p>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    OrderAPI.downloadInvoice(o.id, o.orderNumber);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-gold-300/80 px-2.5 py-1 text-[10px] sm:text-xs font-body text-gold-700 hover:bg-gold-100"
                >
                  <Download size={12} /> Invoice
                </button>
              </div>
              <OrderProgress status={o.status} className="mt-4" />
            </div>
            <ChevronRight size={18} className="mt-1 shrink-0 text-gold-700" />
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
        <div key={a.id} className="bg-ivory-deep border border-gold-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 flex justify-between items-start gap-3">
          <div className="min-w-0">
            <p className="font-body text-sm font-medium text-maroon-900">{a.full_name} · {a.phone}</p>
            <p className="text-xs sm:text-sm text-maroon-900/60 font-body mt-1 break-words">
              {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}
            </p>
          </div>
          <button onClick={() => onDelete(a.id)} className="text-maroon-900/40 hover:text-maroon-700 shrink-0">
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={onSubmit} className="bg-ivory-deep border border-gold-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input name="fullName" required placeholder="Full name" value={form.fullName} onChange={onChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
            <input name="phone" required placeholder="Phone" value={form.phone} onChange={onChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
          </div>
          <input name="line1" required placeholder="Address line 1" value={form.line1} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
          <input name="line2" placeholder="Address line 2 (optional)" value={form.line2} onChange={onChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
    <div className="bg-ivory-deep border border-gold-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wider text-maroon-900/50 font-body">Name</p>
        <p className="font-body text-maroon-900">{user?.name}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-maroon-900/50 font-body">Email</p>
        <p className="font-body text-maroon-900">{user?.email}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-maroon-900/50 font-body">Phone</p>
        <p className="font-body text-maroon-900">{user?.phone || "Not provided"}</p>
      </div>
    </div>
  );
}

function ReturnsTab() {
  const [returns, setReturns] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    ReturnAPI.list().then((res) => setReturns(res.data)).catch(() => setReturns([]));
  }, []);

  if (returns === null) return <div className="h-24 rounded-2xl bg-ivory-deep animate-pulse" />;

  const filteredReturns = statusFilter === "all"
    ? returns
    : returns.filter((request) => request.status === statusFilter);

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
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 font-display text-2xl text-maroon-900 sm:text-3xl">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-100 text-gold-700"><RotateCcw size={20} /></span>
            Returns
          </h2>
          <p className="mt-2 text-sm font-body text-maroon-900/60">View and manage your return requests.</p>
        </div>
        <label className="relative">
          <span className="sr-only">Filter returns by status</span>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 min-w-44 appearance-none rounded-xl border border-gold-300 bg-ivory px-4 pr-10 text-sm font-body text-maroon-900 outline-none focus:border-gold-500"
          >
            <option value="all">All Returns</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-maroon-900/60" />
        </label>
      </div>

      {filteredReturns.length === 0 ? (
        <div className="rounded-2xl border border-gold-200/60 bg-ivory-deep px-5 py-10 text-center">
          <p className="font-display text-lg text-maroon-900">No {statusFilter} return requests</p>
          <p className="mt-1 text-sm font-body text-maroon-900/60">Try another status filter to see your requests.</p>
        </div>
      ) : (
        filteredReturns.map((request) => (
          <div key={request.id} className="rounded-xl border border-gold-300/70 bg-ivory-deep p-3 sm:rounded-2xl sm:p-5">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-5">
              <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <Link
                  to={`/product/${request.product_id}`}
                  aria-label={`View ${request.product_name}`}
                  className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-xl bg-[#f1e3ce] sm:h-[92px] sm:w-[92px]"
                >
                  {request.product_image ? (
                    <img src={resolveImageUrl(request.product_image)} alt={request.product_name} className="h-full w-full object-cover transition-transform hover:scale-105" />
                  ) : (
                    <div className="h-full w-full p-2">
                      <JewelArt type={request.category_type || "necklace"} theme={request.theme || "gold"} className="h-full w-full" animated={false} />
                    </div>
                  )}
                </Link>
                <div className="min-w-0">
                  <Link to={`/product/${request.product_id}`} className="font-body text-sm font-medium text-maroon-900 hover:text-gold-700 sm:text-base">
                    {request.product_name}
                  </Link>
                  <p className="mt-1 font-display text-base text-maroon-900 sm:text-lg">₹{Number(request.unit_price).toLocaleString("en-IN")}</p>
                  <p className="mt-1 inline-flex max-w-full rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-body text-red-800 sm:text-xs">
                    <span className="truncate">{request.reason}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-gold-200/70 pt-3 text-sm font-body text-maroon-900/60 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                <CalendarDays size={19} className="mt-0.5 shrink-0 text-maroon-900" />
                <div className="space-y-3">
                  <div>
                    <p className="text-xs">Return Request ID</p>
                    <p className="break-all text-maroon-900">{request.order_number}-{request.id}</p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-xs"><Clock3 size={14} /> Requested On</p>
                    <p className="text-maroon-900">{new Date(request.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 md:flex-col md:items-end">
                <span className={`rounded-full px-3.5 py-2 text-xs font-body capitalize ${
                  request.status === "approved" || request.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : request.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-amber-100 text-amber-800"
                }`}>{request.status}</span>
                <Link
                  to={`/account/orders/${request.order_id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-gold-400 px-4 py-2 text-xs font-body text-gold-700 hover:bg-gold-100 sm:text-sm"
                >
                  View Details <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        ))
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-gold-200/60 bg-ivory-deep p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h3 className="font-body font-medium text-maroon-900">Need Help?</h3>
          <p className="mt-1 text-xs font-body text-maroon-900/60 sm:text-sm">For return or refund queries, please contact our support team.</p>
        </div>
        <Link to="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-gold-400 px-4 py-2.5 text-sm font-body text-gold-700 hover:bg-gold-100">
          <Headphones size={16} /> Contact Support
        </Link>
      </div>
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
