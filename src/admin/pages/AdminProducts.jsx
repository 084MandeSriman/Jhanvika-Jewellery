import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Image as ImageIcon } from "lucide-react";
import { AdminAPI } from "../../api/services";
import { resolveImageUrl } from "../../utils/imageUrl";
import ProductImageManager from "../components/ProductImageManager";

const emptyForm = {
  id: "", name: "", category_id: "necklaces", metal: "", gemstone: "", theme: "gold", price: "", mrp: "", badge: "", description: "", stock_qty: 100,
  sku: "", hsn_code: "", gold_purity: "", gold_weight: "", net_weight: "", gross_weight: "", diamond_weight: "",
  diamond_clarity: "", diamond_color: "", stone_weight: "", hallmark_number: "", bis_hallmark: false, certificate_number: "",
  making_charges: "", gst_percent: 3, size_type: "none", available_sizes: "",
};
const themes = ["gold", "kundan", "emerald", "ruby", "pearl", "diamond", "rosegold", "polki"];
const categories = ["necklaces", "earrings", "rings", "bangles", "mangalsutra", "nosepins"];

export default function AdminProducts() {
  const [products, setProducts] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [imageManagerProductId, setImageManagerProductId] = useState(null);

  const load = () => AdminAPI.products.list().then((res) => setProducts(res.data));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(""); };
  const openEdit = (p) => {
    setForm({
      id: p.id, name: p.name, category_id: p.category_id, metal: p.metal || "", gemstone: p.gemstone || "", theme: p.theme,
      price: p.price, mrp: p.mrp, badge: p.badge || "", description: p.description || "", stock_qty: p.stock_qty,
      sku: p.sku || "", hsn_code: p.hsn_code || "", gold_purity: p.gold_purity || "", gold_weight: p.gold_weight || "",
      net_weight: p.net_weight || "", gross_weight: p.gross_weight || "", diamond_weight: p.diamond_weight || "",
      diamond_clarity: p.diamond_clarity || "", diamond_color: p.diamond_color || "", stone_weight: p.stone_weight || "",
      hallmark_number: p.hallmark_number || "", bis_hallmark: !!p.bis_hallmark, certificate_number: p.certificate_number || "",
      making_charges: p.making_charges || "", gst_percent: p.gst_percent ?? 3, size_type: p.size_type || "none",
      available_sizes: p.available_sizes || "",
    });
    setEditingId(p.id);
    setShowForm(true);
    setError("");
  };

  const onChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await AdminAPI.products.update(editingId, { ...form, badge: form.badge || null });
      } else {
        await AdminAPI.products.create({ ...form, badge: form.badge || null });
      }
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Deactivate this product?")) return;
    await AdminAPI.products.remove(id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-600 transition-colors">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {products === null ? (
        <div className="h-64 rounded-xl bg-gray-100 animate-pulse" />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p.id} className={!p.is_active ? "opacity-40" : ""}>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                      {p.primary_image ? (
                        <img src={resolveImageUrl(p.primary_image)} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={16} className="text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category_name}</td>
                  <td className="px-4 py-3">₹{Number(p.price).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{p.stock_qty}</td>
                  <td className="px-4 py-3">{p.is_active ? <span className="text-green-600">Active</span> : <span className="text-gray-400">Inactive</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setImageManagerProductId(p.id)} className="text-gray-500 hover:text-gold-600 mr-3"><ImageIcon size={15} /></button>
                    <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-maroon-900 mr-3"><Pencil size={15} /></button>
                    <button onClick={() => onDelete(p.id)} className="text-gray-500 hover:text-red-600"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editingId ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
            <form onSubmit={onSubmit} className="space-y-3">
              {!editingId && (
                <input name="id" required placeholder="Product ID (e.g. p26)" value={form.id} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              )}
              <input name="name" required placeholder="Product name" value={form.name} onChange={onChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select name="category_id" value={form.category_id} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select name="theme" value={form.theme} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  {themes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="metal" placeholder="Metal" value={form.metal} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input name="gemstone" placeholder="Gemstone" value={form.gemstone} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="price" type="number" required placeholder="Price" value={form.price} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input name="mrp" type="number" required placeholder="MRP" value={form.mrp} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select name="badge" value={form.badge} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">No badge</option>
                  <option value="New">New</option>
                  <option value="Bestseller">Bestseller</option>
                  <option value="Sale">Sale</option>
                </select>
                <input name="stock_qty" type="number" placeholder="Stock" value={form.stock_qty} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <textarea name="description" placeholder="Description" value={form.description} onChange={onChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />

              <details className="border border-gray-200 rounded-lg">
                <summary className="px-3 py-2 text-sm font-medium cursor-pointer">Jewellery Specifications (optional)</summary>
                <div className="p-3 space-y-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <input name="sku" placeholder="SKU" value={form.sku} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="hsn_code" placeholder="HSN Code" value={form.hsn_code} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input name="gold_purity" placeholder="Gold Purity (22K)" value={form.gold_purity} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="gold_weight" type="number" step="0.001" placeholder="Gold Wt (g)" value={form.gold_weight} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="net_weight" type="number" step="0.001" placeholder="Net Wt (g)" value={form.net_weight} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input name="gross_weight" type="number" step="0.001" placeholder="Gross Wt (g)" value={form.gross_weight} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="diamond_weight" type="number" step="0.001" placeholder="Diamond Wt (ct)" value={form.diamond_weight} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="stone_weight" type="number" step="0.001" placeholder="Stone Wt (g)" value={form.stone_weight} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="diamond_clarity" placeholder="Diamond Clarity (VVS1)" value={form.diamond_clarity} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="diamond_color" placeholder="Diamond Color (D-Z)" value={form.diamond_color} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="hallmark_number" placeholder="Hallmark Number" value={form.hallmark_number} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="certificate_number" placeholder="Certificate Number" value={form.certificate_number} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="making_charges" type="number" placeholder="Making Charges (₹)" value={form.making_charges} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                    <input name="gst_percent" type="number" step="0.01" placeholder="GST %" value={form.gst_percent} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select name="size_type" value={form.size_type} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option value="none">No sizing</option>
                      <option value="ring">Ring size</option>
                      <option value="chain">Chain length</option>
                      <option value="bracelet">Bracelet length</option>
                    </select>
                    <input name="available_sizes" placeholder="Sizes (comma separated)" value={form.available_sizes} onChange={onChange} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="bis_hallmark" checked={form.bis_hallmark} onChange={onChange} />
                    BIS Hallmarked
                  </label>
                </div>
              </details>

              <button type="submit" className="w-full bg-maroon-900 text-white py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-colors">
                {editingId ? "Save Changes" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {imageManagerProductId && (
        <ProductImageManager
          productId={imageManagerProductId}
          onClose={() => {
            setImageManagerProductId(null);
            load();
          }}
        />
      )}
    </div>
  );
}
