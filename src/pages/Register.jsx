import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, Phone, ArrowRight, Gem } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 md:py-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="text-center mb-8">
          <Gem className="mx-auto text-gold-600 mb-3" size={32} strokeWidth={1.3} />
          <h1 className="font-display text-3xl text-maroon-900">Create Your Account</h1>
          <p className="text-maroon-900/60 font-body text-sm mt-1">Join the Jhanvika family</p>
        </div>

        <form onSubmit={onSubmit} className="bg-ivory-deep rounded-2xl border border-gold-200/50 p-6 md:p-8 space-y-5">
          {error && (
            <div className="text-sm text-maroon-700 bg-maroon-50 border border-maroon-200 rounded-xl px-4 py-2.5 font-body">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-wider text-maroon-900/60 font-body mb-1.5 block">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon-900/40" />
              <input
                name="name"
                required
                value={form.name}
                onChange={onChange}
                placeholder="Priya Sharma"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-300/60 bg-ivory outline-none focus:border-gold-500 font-body text-sm text-maroon-900"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-maroon-900/60 font-body mb-1.5 block">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon-900/40" />
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                placeholder="you@email.com"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-300/60 bg-ivory outline-none focus:border-gold-500 font-body text-sm text-maroon-900"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-maroon-900/60 font-body mb-1.5 block">Phone (optional)</label>
            <div className="relative">
              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon-900/40" />
              <input
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="98765 43210"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-300/60 bg-ivory outline-none focus:border-gold-500 font-body text-sm text-maroon-900"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-maroon-900/60 font-body mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-maroon-900/40" />
              <input
                name="password"
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={onChange}
                placeholder="At least 6 characters"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gold-300/60 bg-ivory outline-none focus:border-gold-500 font-body text-sm text-maroon-900"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-maroon-900 text-ivory font-body text-sm tracking-wide hover:bg-gold-600 hover:text-maroon-950 transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Account"} <ArrowRight size={16} />
          </button>
        </form>

        <p className="text-center text-sm text-maroon-900/60 font-body mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gold-700 hover:text-gold-600 font-medium">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
