import { useEffect, useState } from "react";
import { X, Upload, Star, Trash2, GripVertical } from "lucide-react";
import { AdminAPI, ProductAPI } from "../../api/services";
import { resolveImageUrl } from "../../utils/imageUrl";

export default function ProductImageManager({ productId, onClose }) {
  const [images, setImages] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = () => ProductAPI.images(productId).then((res) => setImages(res.data));
  useEffect(() => { load(); }, [productId]);

  const onFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      await AdminAPI.productImages.upload(productId, formData);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const setPrimary = async (imageId) => {
    await AdminAPI.productImages.setPrimary(productId, imageId);
    load();
  };

  const remove = async (imageId) => {
    await AdminAPI.productImages.remove(productId, imageId);
    load();
  };

  const moveImage = async (index, direction) => {
    if (!images) return;
    const newOrder = [...images];
    const target = index + direction;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];
    setImages(newOrder);
    await AdminAPI.productImages.reorder(productId, newOrder.map((img) => img.id));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Manage Images — {productId}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-gold-400 transition-colors mb-5">
          <Upload size={22} className="text-gray-400" />
          <span className="text-sm text-gray-500">{uploading ? "Uploading & compressing…" : "Click to upload images (JPG/PNG/WEBP, up to 8 at once)"}</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onFilesSelected} disabled={uploading} />
        </label>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        {images === null ? (
          <div className="h-32 rounded-xl bg-gray-100 animate-pulse" />
        ) : images.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No images uploaded yet. This product currently falls back to the procedural jewel-art illustration.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((img, i) => (
              <div key={img.id} className="relative border border-gray-200 rounded-lg overflow-hidden group">
                <img src={resolveImageUrl(img.image_url)} alt={img.alt_text || ""} className="w-full h-32 object-cover" />
                {img.is_primary ? (
                  <span className="absolute top-1.5 left-1.5 bg-gold-500 text-maroon-950 text-[10px] px-2 py-0.5 rounded-full font-medium">Primary</span>
                ) : (
                  <button onClick={() => setPrimary(img.id)} className="absolute top-1.5 left-1.5 bg-white/90 text-gray-500 text-[10px] px-2 py-0.5 rounded-full hover:text-gold-600 flex items-center gap-1">
                    <Star size={10} /> Set primary
                  </button>
                )}
                <button onClick={() => remove(img.id)} className="absolute top-1.5 right-1.5 bg-white/90 text-gray-500 hover:text-red-600 rounded-full p-1">
                  <Trash2 size={12} />
                </button>
                <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                  <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="bg-white/90 rounded p-1 disabled:opacity-30 text-gray-600">
                    <GripVertical size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
