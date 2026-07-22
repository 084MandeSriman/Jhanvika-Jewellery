import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, User, Pencil, Trash2 } from "lucide-react";
import { ReviewAPI } from "../api/services";
import { useAuth } from "../context/AuthContext";

export default function ProductReviews({ productId }) {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, title: "", comment: "" });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const load = () => ReviewAPI.list(productId).then((res) => setData(res.data));
  useEffect(() => { load(); }, [productId]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      if (editingId) {
        await ReviewAPI.update(editingId, form);
        setMessage("Review updated — pending re-approval.");
      } else {
        await ReviewAPI.create(productId, form);
        setMessage("Thanks! Your review is pending approval.");
      }
      setForm({ rating: 5, title: "", comment: "" });
      setShowForm(false);
      setEditingId(null);
      load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Could not submit review");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete your review?")) return;
    await ReviewAPI.remove(id);
    load();
  };

  if (!data) return <div className="h-32 rounded-2xl bg-ivory-deep animate-pulse" />;

  const { reviews, summary } = data;
  const myReview = reviews.find((r) => r.userName === user?.name);

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h3 className="font-display text-2xl text-maroon-900">Customer Reviews</h3>
          {summary.total > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(summary.average) ? "fill-gold-500 text-gold-500" : "text-gold-200"} />
                ))}
              </div>
              <span className="text-sm text-maroon-900/60 font-body">{summary.average} out of 5 ({summary.total} reviews)</span>
            </div>
          )}
        </div>
        {isAuthenticated && !myReview && (
          <button onClick={() => setShowForm(true)} className="text-sm font-body px-5 py-2.5 rounded-full bg-maroon-900 text-ivory hover:bg-gold-600 hover:text-maroon-950 transition-colors">
            Write a Review
          </button>
        )}
      </div>

      {message && <p className="text-sm text-gold-700 font-body mb-4">{message}</p>}

      {showForm && (
        <form onSubmit={onSubmit} className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-5 mb-6 space-y-3">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })}>
                <Star size={22} className={n <= form.rating ? "fill-gold-500 text-gold-500" : "text-gold-200"} />
              </button>
            ))}
          </div>
          <input
            placeholder="Review title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm"
          />
          <textarea
            placeholder="Share your experience..."
            required
            rows={3}
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm resize-none"
          />
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-full bg-maroon-900 text-ivory text-sm font-body">Submit Review</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-5 py-2.5 rounded-full border border-gold-300 text-maroon-900 text-sm font-body">Cancel</button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-maroon-900/50 font-body">No reviews yet — be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-gold-200/40 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center">
                    <User size={14} className="text-gold-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-maroon-900 font-body">{r.userName}</p>
                    <div className="flex">{[...Array(5)].map((_, s) => <Star key={s} size={11} className={s < r.rating ? "fill-gold-500 text-gold-500" : "text-gold-200"} />)}</div>
                  </div>
                </div>
                {r.userName === user?.name && (
                  <button onClick={() => onDelete(r.id)} className="text-maroon-900/40 hover:text-maroon-700">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              {r.title && <p className="font-body text-sm font-medium text-maroon-900 mt-2">{r.title}</p>}
              <p className="font-body text-sm text-maroon-900/70 mt-1">{r.comment}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
