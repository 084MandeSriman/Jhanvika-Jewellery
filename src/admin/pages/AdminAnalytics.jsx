import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, IndianRupee, Users, Package } from "lucide-react";
import { AdminAPI } from "../../api/services";

const COLORS = ["#c9982f", "#5c1f18", "#123b2f", "#8f5f1c", "#a97722", "#0d2b22"];

export default function AdminAnalytics() {
  const [summary, setSummary] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [bestSellers, setBestSellers] = useState(null);
  const [categories, setCategories] = useState(null);
  const [monthly, setMonthly] = useState(null);

  useEffect(() => {
    AdminAPI.analytics.summary().then((r) => setSummary(r.data));
    AdminAPI.analytics.revenue(30).then((r) => setRevenue(r.data));
    AdminAPI.analytics.bestSellers(6).then((r) => setBestSellers(r.data));
    AdminAPI.analytics.topCategories().then((r) => setCategories(r.data));
    AdminAPI.analytics.monthly(6).then((r) => setMonthly(r.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Analytics</h1>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Revenue", value: `₹${summary.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-amber-50 text-amber-600" },
            { label: "Estimated Profit", value: `₹${summary.estimatedProfit.toLocaleString("en-IN")}`, icon: TrendingUp, color: "bg-green-50 text-green-600" },
            { label: "Total Customers", value: summary.totalCustomers, icon: Users, color: "bg-blue-50 text-blue-600" },
            { label: "Repeat Customers", value: summary.repeatCustomers, icon: Package, color: "bg-purple-50 text-purple-600" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                <c.icon size={18} />
              </div>
              <p className="text-xl font-semibold">{c.value}</p>
              <p className="text-sm text-gray-500">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Revenue — Last 30 Days</h3>
          {revenue && (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#c9982f" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Monthly Revenue (6 months)</h3>
          {monthly && (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="revenue" fill="#5c1f18" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Best Sellers</h3>
          {bestSellers && (
            <div className="space-y-2">
              {bestSellers.map((p) => (
                <div key={p.id} className="flex justify-between text-sm">
                  <span className="text-gray-700">{p.name}</span>
                  <span className="text-gray-500">{p.unitsSold} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Revenue by Category</h3>
          {categories && categories.length > 0 && (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categories} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {categories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
