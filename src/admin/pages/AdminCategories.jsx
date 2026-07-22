import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { CategoryAPI, AdminAPI } from "../../api/services";
import { resolveImageUrl } from "../../utils/imageUrl";

const artTypes = ["necklace", "earring", "ring", "bangle", "mangalsutra", "nosepin"];
const emptyForm = { id: "", name: "", tagline: "", art_type: "necklace", sort_order: 0, image_url: "" };

export default function AdminCategories() {
  const [categories, setCategories] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const load = () => CategoryAPI.list().then((res) => setCategories(res.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(""); };
  const openEdit = (c) => { setForm({ id: c.id, name: c.name, tagline: c.tagline || "", art_type: c.type, sort_order: c.sort_order ?? 0, image_url: c.image_url || "" }); setEditingId(c.id); setShowForm(true); setError(""); setImageError(""); };

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onImageSelected = async (e) => {
    if (!editingId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setImageError("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await AdminAPI.categories.uploadImage(editingId, formData);
      setForm((prev) => ({ ...prev, image_url: res.data.image_url }));
      load();
    } catch (err) {
      setImageError(err.response?.data?.message || "Image upload failed");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await AdminAPI.categories.update(editingId, { name: form.name, tagline: form.tagline, art_type: form.art_type });
      } else {
        await AdminAPI.categories.create(form);
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Deactivate this category?")) return;
    await AdminAPI.categories.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-600 transition-colors">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {categories === null ? (
        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4 flex justify-between items-start gap-4">
              {c.image_url && (
                <img src={resolveImageUrl(c.image_url)} alt={c.name} className="h-20 w-20 rounded-xl object-cover border border-gray-200" />
              )}
              <div className="flex-1">
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-gray-500">{c.tagline}</p>
                <p className="text-xs text-gray-400 mt-1">art_type: {c.type} · id: {c.id}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(c)} className="text-gray-500 hover:text-maroon-900"><Pencil size={15} /></button>
                <button onClick={() => onDelete(c.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Edit Category" : "New Category"}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <form onSubmit={onSubmit} className="space-y-3">
              {!editingId && <input name="id" required placeholder="Category ID (e.g. anklets)" value={form.id} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />}
              <input name="name" required placeholder="Display name" value={form.name} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input name="tagline" placeholder="Tagline" value={form.tagline} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <select name="art_type" value={form.art_type} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {artTypes.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {editingId && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    {form.image_url ? (
                      <img src={resolveImageUrl(form.image_url)} alt={form.name} className="h-20 w-20 rounded-lg object-cover border border-gray-200" />
                    ) : (
                      <div className="h-20 w-20 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">No image</div>
                    )}
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:border-gold-500 transition-colors">
                      <Upload size={16} />
                      <span>{uploadingImage ? "Uploading…" : "Upload image"}</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onImageSelected} disabled={uploadingImage} />
                    </label>
                  </div>
                  {imageError && <p className="text-sm text-red-600">{imageError}</p>}
                </div>
              )}
              <button type="submit" className="w-full bg-maroon-900 text-white py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-colors">
                {editingId ? "Save Changes" : "Create Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
