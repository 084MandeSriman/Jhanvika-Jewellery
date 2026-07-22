import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { AdminAPI } from "../../api/services";

const themes = ["gold", "kundan", "emerald", "ruby", "pearl", "diamond", "rosegold", "polki"];
const artTypes = ["necklace", "earring", "ring", "bangle", "mangalsutra", "nosepin"];
const emptyForm = { eyebrow: "", title: "", subtitle: "", cta_text: "", cta_link: "/shop", theme: "gold", art_type: "necklace", sort_order: 0 };

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = () => AdminAPI.heroSlides.list().then((res) => setSlides(res.data));
  useEffect(() => { load(); }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    await AdminAPI.heroSlides.create(form);
    setForm(emptyForm);
    setShowForm(false);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this hero slide?")) return;
    await AdminAPI.heroSlides.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Hero Slides</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-600 transition-colors">
          <Plus size={16} /> Add Slide
        </button>
      </div>

      {slides === null ? (
        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="space-y-3">
          {slides.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{s.eyebrow}</p>
                <p className="font-medium whitespace-pre-line">{s.title}</p>
                <p className="text-sm text-gray-500">{s.subtitle}</p>
                <p className="text-xs text-gray-400 mt-1">{s.theme} · {s.art_type} · {s.cta_text} → {s.cta_link}</p>
              </div>
              <button onClick={() => onDelete(s.id)} className="text-gray-500 hover:text-red-600 shrink-0"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Hero Slide</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <input name="eyebrow" required placeholder="Eyebrow text" value={form.eyebrow} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <textarea name="title" required placeholder="Title (use \n for line break)" value={form.title} onChange={onChange} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input name="subtitle" placeholder="Subtitle" value={form.subtitle} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="cta_text" placeholder="Button text" value={form.cta_text} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input name="cta_link" placeholder="Button link" value={form.cta_link} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="theme" value={form.theme} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {themes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select name="art_type" value={form.art_type} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {artTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <button type="submit" className="w-full bg-maroon-900 text-white py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-colors">Create Slide</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
