import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AdminAPI } from "../../api/services";

const emptyForm = { code: "", description: "", discount_type: "percent", discount_value: "", min_order_value: 0, valid_until: "" };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => AdminAPI.coupons.list().then((res) => setCoupons(res.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await AdminAPI.coupons.create(form);
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    await AdminAPI.coupons.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Coupons</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-600 transition-colors">
          <Plus size={16} /> Add Coupon
        </button>
      </div>

      {coupons === null ? (
        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Code</th>
                <th className="px-4 py-3 font-medium">Discount</th>
                <th className="px-4 py-3 font-medium">Min Order</th>
                <th className="px-4 py-3 font-medium">Used</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono">{c.code}</td>
                  <td className="px-4 py-3">{c.discount_type === "percent" ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                  <td className="px-4 py-3">₹{Number(c.min_order_value).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{c.used_count}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onDelete(c.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Coupon</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <input name="code" required placeholder="CODE10" value={form.code} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase" />
              <input name="description" placeholder="Description" value={form.description} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select name="discount_type" value={form.discount_type} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="percent">Percent %</option>
                  <option value="flat">Flat ₹</option>
                </select>
                <input name="discount_value" type="number" required placeholder="Value" value={form.discount_value} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <input name="min_order_value" type="number" placeholder="Minimum order value" value={form.min_order_value} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input name="valid_until" type="date" value={form.valid_until} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button type="submit" className="w-full bg-maroon-900 text-white py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-colors">Create Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
