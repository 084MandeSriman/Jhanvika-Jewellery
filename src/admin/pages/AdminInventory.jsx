import { useEffect, useState } from "react";
import { AlertTriangle, PackageX, PlusCircle, History } from "lucide-react";
import { AdminAPI } from "../../api/services";

export default function AdminInventory() {
  const [lowStock, setLowStock] = useState(null);
  const [outOfStock, setOutOfStock] = useState(null);
  const [showPurchase, setShowPurchase] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({ productId: "", quantity: "", costPrice: "", supplierName: "", invoiceRef: "" });
  const [adjustForm, setAdjustForm] = useState({ productId: "", changeQty: "", reason: "" });
  const [historyProductId, setHistoryProductId] = useState("");
  const [history, setHistory] = useState(null);

  const load = () => {
    AdminAPI.inventory.lowStock(10).then((r) => setLowStock(r.data));
    AdminAPI.inventory.outOfStock().then((r) => setOutOfStock(r.data));
  };
  useEffect(() => { load(); }, []);

  const submitPurchase = async (e) => {
    e.preventDefault();
    await AdminAPI.inventory.purchase({ ...purchaseForm, quantity: Number(purchaseForm.quantity), costPrice: Number(purchaseForm.costPrice) || null });
    setPurchaseForm({ productId: "", quantity: "", costPrice: "", supplierName: "", invoiceRef: "" });
    setShowPurchase(false);
    load();
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    await AdminAPI.inventory.adjust({ ...adjustForm, changeQty: Number(adjustForm.changeQty) });
    setAdjustForm({ productId: "", changeQty: "", reason: "" });
    load();
  };

  const viewHistory = async (productId) => {
    setHistoryProductId(productId);
    const res = await AdminAPI.inventory.history(productId);
    setHistory(res.data);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <button onClick={() => setShowPurchase(true)} className="flex items-center gap-2 bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-600 transition-colors">
          <PlusCircle size={16} /> Record Purchase
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Low Stock (&lt;10)</h3>
          {lowStock === null ? <div className="h-24 bg-gray-100 rounded animate-pulse" /> : lowStock.length === 0 ? (
            <p className="text-sm text-gray-400">All good — nothing running low.</p>
          ) : (
            <div className="space-y-2">
              {lowStock.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm">
                  <span>{p.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 font-medium">{p.stock_qty} left</span>
                    <button onClick={() => viewHistory(p.id)} className="text-gray-400 hover:text-maroon-900"><History size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4 flex items-center gap-2"><PackageX size={16} className="text-red-500" /> Out of Stock</h3>
          {outOfStock === null ? <div className="h-24 bg-gray-100 rounded animate-pulse" /> : outOfStock.length === 0 ? (
            <p className="text-sm text-gray-400">Nothing out of stock.</p>
          ) : (
            <div className="space-y-2">
              {outOfStock.map((p) => <div key={p.id} className="text-sm text-gray-700">{p.name}</div>)}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="font-medium mb-4">Quick Stock Adjustment</h3>
        <form onSubmit={submitAdjust} className="flex flex-wrap gap-3 items-end">
          <input placeholder="Product ID (e.g. p1)" value={adjustForm.productId} onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          <input type="number" placeholder="Change (+/-)" value={adjustForm.changeQty} onChange={(e) => setAdjustForm({ ...adjustForm, changeQty: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32" />
          <input placeholder="Reason" value={adjustForm.reason} onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-[150px]" />
          <button type="submit" className="bg-maroon-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-gold-600 transition-colors">Apply</button>
        </form>
      </div>

      {historyProductId && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-medium mb-4">Stock History — {historyProductId}</h3>
          {history === null ? <div className="h-20 bg-gray-100 rounded animate-pulse" /> : (
            <div className="space-y-2 text-sm">
              {history.map((h) => (
                <div key={h.id} className="flex justify-between">
                  <span className={h.change_qty >= 0 ? "text-green-600" : "text-red-600"}>{h.change_qty >= 0 ? "+" : ""}{h.change_qty}</span>
                  <span className="text-gray-500">{h.reason}</span>
                  <span className="text-gray-400 text-xs">{new Date(h.created_at).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showPurchase && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowPurchase(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Record Purchase Entry</h3>
            <form onSubmit={submitPurchase} className="space-y-3">
              <input placeholder="Product ID" required value={purchaseForm.productId} onChange={(e) => setPurchaseForm({ ...purchaseForm, productId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Quantity" required value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                <input type="number" placeholder="Cost price" value={purchaseForm.costPrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, costPrice: e.target.value })} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <input placeholder="Supplier name" value={purchaseForm.supplierName} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input placeholder="Invoice reference" value={purchaseForm.invoiceRef} onChange={(e) => setPurchaseForm({ ...purchaseForm, invoiceRef: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <button type="submit" className="w-full bg-maroon-900 text-white py-2.5 rounded-lg text-sm hover:bg-gold-600 transition-colors">Record Purchase</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
