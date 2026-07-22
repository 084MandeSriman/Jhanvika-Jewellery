import { useEffect, useState } from "react";
import { Plus, Trash2, X, Star } from "lucide-react";
import { AdminAPI } from "../../api/services";

const emptyForm = { name: "", location: "", text_content: "", rating: 5 };

export default function AdminTestimonials() {
  const [items, setItems] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => AdminAPI.testimonials.list().then((res) => setItems(res.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await AdminAPI.testimonials.create(form);
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    await AdminAPI.testimonials.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Testimonials</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-600 transition-colors">
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {items === null ? (
        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < t.rating ? "fill-gold-500 text-gold-500" : "text-gray-200"} />)}
                </div>
                <p className="text-sm text-gray-600">{t.text_content}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{t.name} · {t.location}</p>
              </div>
              <button onClick={() => onDelete(t.id)} className="text-gray-500 hover:text-red-600 shrink-0"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Testimonial</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input name="name" required placeholder="Customer name" value={form.name} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input name="location" placeholder="Location" value={form.location} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <textarea name="text_content" required placeholder="Testimonial text" value={form.text_content} onChange={onChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <select name="rating" value={form.rating} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} stars</option>)}
              </select>
              <button type="submit" className="w-full bg-maroon-900 text-white py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-colors">Create Testimonial</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
