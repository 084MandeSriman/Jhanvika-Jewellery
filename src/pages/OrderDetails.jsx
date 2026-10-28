import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Download, MapPin, Package, RotateCcw } from "lucide-react";
import { OrderAPI, ProductAPI, ReturnAPI } from "../api/services";
import JewelArt from "../components/JewelArt";
import OrderProgress from "../components/OrderProgress";
import { resolveImageUrl } from "../utils/imageUrl";

export default function OrderDetails() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await OrderAPI.get(orderId);
      const orderPreview = location.state?.orderPreview;
      const items = await Promise.all(response.data.items.map(async (item) => {
        const previewItem = orderPreview?.id === response.data.id
          ? orderPreview.items.find((preview) => preview.productId === item.productId)
          : null;
        let image = item.image || previewItem?.image || null;
        let theme = item.theme || previewItem?.theme || "gold";
        let categoryType = item.categoryType || previewItem?.categoryType || "necklace";

        if (!image && item.productId) {
          try {
            const productResponse = await ProductAPI.get(item.productId);
            const product = productResponse.data;
            image = product?.image || null;
            theme = product?.theme || theme;
            categoryType = product?.categoryType || categoryType;
          } catch (productError) {
            console.error(`Failed to load image for order product ${item.productId}`, productError);
          }
        }

        return { ...item, image, theme, categoryType };
      }));
      setOrder({ ...response.data, items });
    } catch {
      setError("We couldn’t load this order. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderId, location.state]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  if (loading) {
    return (
      <div className="mx-auto min-h-[50vh] w-full max-w-5xl space-y-4 px-4 py-10 sm:px-6 md:px-10">
        <div className="h-8 w-48 animate-pulse rounded bg-ivory-deep" />
        <div className="h-56 animate-pulse rounded-2xl bg-ivory-deep" />
        <div className="h-40 animate-pulse rounded-2xl bg-ivory-deep" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <section className="mx-auto flex min-h-[50vh] w-full max-w-5xl flex-col items-center justify-center px-4 py-12 text-center sm:px-6 md:px-10">
        <Package className="mb-3 text-gold-500" size={34} />
        <p className="font-display text-xl text-maroon-900">{error || "Order not found"}</p>
        {error && (
          <button onClick={loadOrder} className="mt-4 rounded-full bg-maroon-900 px-5 py-2.5 text-sm font-body text-ivory">
            Try again
          </button>
        )}
        <Link to="/account" className="mt-4 text-sm font-body text-gold-700 hover:text-gold-600">Back to my orders</Link>
      </section>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 md:px-10">
      <button
        onClick={() => navigate("/account")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-body text-gold-700 hover:text-gold-600"
      >
        <ArrowLeft size={16} /> Back to my orders
      </button>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-body uppercase tracking-[0.25em] text-gold-700">Order details</p>
          <h1 className="mt-1 font-display text-2xl text-maroon-900 sm:text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm font-body text-maroon-900/55">
            Placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <button
          onClick={() => OrderAPI.downloadInvoice(order.id, order.orderNumber)}
          className="inline-flex items-center gap-2 rounded-full border border-gold-300 px-4 py-2 text-sm font-body text-gold-700 hover:bg-gold-100"
        >
          <Download size={15} /> Download invoice
        </button>
      </div>

      <section className="mb-5 rounded-2xl border border-gold-200/70 bg-ivory-deep p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-maroon-900">Order status</h2>
          <span className="rounded-full bg-emerald-800/10 px-3 py-1 text-xs font-body capitalize text-emerald-800">{order.status}</span>
        </div>
        <OrderProgress status={order.status} />
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-gold-200/70 bg-ivory-deep p-4 sm:p-6">
          <h2 className="mb-4 font-display text-xl text-maroon-900">Items ordered</h2>
          <div className="divide-y divide-gold-200/70">
            {order.items.map((item) => {
              const productContent = (
                <>
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#f1e3ce] sm:h-20 sm:w-20">
                    {item.image ? (
                      <img src={resolveImageUrl(item.image)} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full p-2">
                        <JewelArt type={item.categoryType} theme={item.theme} className="h-full w-full" animated={false} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm font-medium text-maroon-900 transition-colors group-hover:text-gold-700 sm:text-base">{item.name}</p>
                    <p className="mt-1 text-xs font-body text-maroon-900/60 sm:text-sm">Quantity: {item.qty}</p>
                  </div>
                </>
              );

              return (
                <div key={item.orderItemId || item.productId} className="space-y-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {item.productId ? (
                      <Link to={`/product/${item.productId}`} aria-label={`View ${item.name}`} className="group flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                        {productContent}
                      </Link>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">{productContent}</div>
                    )}
                    <p className="shrink-0 font-display text-base text-gold-700 sm:text-lg">₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                  </div>
                  {order.status === "delivered" && item.orderItemId && (
                    <ReturnRequestAction
                      item={item}
                      onStatusChange={(returnStatus) => {
                        setOrder((current) => ({
                          ...current,
                          items: current.items.map((currentItem) => (
                            currentItem.orderItemId === item.orderItemId
                              ? { ...currentItem, returnStatus }
                              : currentItem
                          )),
                        }));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-5">
          {order.address && (
            <section className="rounded-2xl border border-gold-200/70 bg-ivory-deep p-4 sm:p-6">
              <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-maroon-900"><MapPin size={18} /> Delivery address</h2>
              <p className="text-sm font-body font-medium text-maroon-900">{order.address.full_name}</p>
              <p className="text-sm font-body text-maroon-900/70">{order.address.phone}</p>
              <p className="mt-1 text-sm font-body text-maroon-900/70">
                {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </section>
          )}

          <section className="rounded-2xl border border-gold-200/70 bg-ivory-deep p-4 sm:p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-maroon-900"><CreditCard size={18} /> Payment summary</h2>
            {order.paymentMethod && <p className="mb-3 text-sm font-body capitalize text-maroon-900/60">{order.paymentMethod.replaceAll("_", " ")}</p>}
            <div className="space-y-2 text-sm font-body text-maroon-900/70">
              <p className="flex justify-between gap-4"><span>Subtotal</span><span>₹{order.subtotal.toLocaleString("en-IN")}</span></p>
              {order.discount > 0 && <p className="flex justify-between gap-4"><span>Discount</span><span>−₹{order.discount.toLocaleString("en-IN")}</span></p>}
              <p className="flex justify-between gap-4"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : `₹${order.shipping.toLocaleString("en-IN")}`}</span></p>
              <p className="flex justify-between gap-4 border-t border-gold-300/60 pt-2 font-medium text-maroon-900"><span>Total</span><span>₹{order.total.toLocaleString("en-IN")}</span></p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function ReturnRequestAction({ item, onStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const submitReturn = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await ReturnAPI.create({ orderItemId: item.orderItemId, reason });
      onStatusChange(response.data.status || "requested");
      setIsOpen(false);
      setReason("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not submit the return request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (item.returnStatus) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-body text-maroon-900/65">
        <RotateCcw size={13} />
        Return request: <span className="font-medium capitalize text-gold-700">{item.returnStatus}</span>
      </p>
    );
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold-300 px-3 py-1.5 text-xs font-body text-gold-700 transition-colors hover:bg-gold-100"
      >
        <RotateCcw size={13} /> Request return
      </button>
    );
  }

  return (
    <form onSubmit={submitReturn} className="space-y-2 rounded-xl border border-gold-200/70 bg-ivory/70 p-3">
      <label htmlFor={`return-reason-${item.orderItemId}`} className="block text-xs font-body font-medium text-maroon-900">
        Tell us why you’d like to return this item
      </label>
      <textarea
        id={`return-reason-${item.orderItemId}`}
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        required
        maxLength={255}
        rows={3}
        placeholder="Share a short reason (up to 255 characters)"
        className="w-full resize-y rounded-lg border border-gold-300/70 bg-white px-3 py-2 text-sm font-body text-maroon-900 outline-none focus:border-gold-500"
      />
      {error && <p role="alert" className="text-xs font-body text-red-800">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting || !reason.trim()}
          className="rounded-full bg-maroon-900 px-4 py-2 text-xs font-body text-ivory transition-colors hover:bg-maroon-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit return request"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsOpen(false);
            setError("");
          }}
          disabled={submitting}
          className="rounded-full border border-gold-300 px-4 py-2 text-xs font-body text-maroon-900 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
