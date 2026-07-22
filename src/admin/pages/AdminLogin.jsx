import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gem, ArrowRight } from "lucide-react";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-maroon-900 flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-ivory rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <Gem className="mx-auto text-gold-600 mb-3" size={30} strokeWidth={1.3} />
          <h1 className="font-display text-2xl text-maroon-900">Jhanvika Admin</h1>
          <p className="text-maroon-900/50 font-body text-xs mt-1">Management Panel</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="text-sm text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-lg px-3 py-2 font-body">{error}</div>}
          <input
            type="email"
            required
            placeholder="admin@jhanvika.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gold-300/60 bg-ivory-deep outline-none font-body text-sm text-maroon-900"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gold-300/60 bg-ivory-deep outline-none font-body text-sm text-maroon-900"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-maroon-900 text-ivory font-body text-sm hover:bg-gold-600 hover:text-maroon-950 transition-colors disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Log In"} <ArrowRight size={15} />
          </button>
        </form>
        <p className="text-center text-[11px] text-maroon-900/40 font-body mt-5">
          Demo credentials: admin@jhanvika.in / Admin@123
        </p>
      </div>
    </div>
  );
}
