import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, FolderTree, Image, MessageSquareQuote, Tag, ShoppingCart, LogOut, Gem, BarChart3, Boxes,
} from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/hero-slides", label: "Hero Slides", icon: Image },
  { to: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
];

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900 font-body">
      <aside className="w-64 shrink-0 bg-maroon-900 text-ivory flex flex-col">
        <div className="flex items-center gap-2 px-6 py-6 border-b border-ivory/10">
          <Gem className="text-gold-400" size={22} strokeWidth={1.5} />
          <div>
            <p className="font-display text-lg leading-none">Jhanvika</p>
            <p className="text-[10px] tracking-widest text-gold-300 uppercase">Admin</p>
          </div>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive ? "bg-gold-500 text-maroon-950 font-medium" : "text-ivory/70 hover:bg-ivory/10 hover:text-ivory"
                }`
              }
            >
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-ivory/10">
          <p className="text-xs text-ivory/50 mb-2 truncate">{admin?.email}</p>
          <button onClick={onLogout} className="flex items-center gap-2 text-sm text-ivory/70 hover:text-ivory">
            <LogOut size={15} /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
