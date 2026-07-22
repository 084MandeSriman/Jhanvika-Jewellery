import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Plus, PartyPopper, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { AddressAPI, OrderAPI, CouponAPI, PaymentAPI } from "../api/services";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Checkout() {
  const { items, subtotal, clearCartLocal } = useCart();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    AddressAPI.list().then((res) => {
      setAddresses(res.data);
      const def = res.data.find((a) => a.is_default) || res.data[0];
      if (def) setSelectedAddress(def.id);
      else setShowForm(true);
    });
  }, []);

  const shipping = subtotal - discount >= 2999 || subtotal === 0 ? 0 : 149;
  const total = subtotal - discount + shipping;

  const onAddressFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveAddress = async (e) => {
    e.preventDefault();
    const res = await AddressAPI.create(form);
    const list = await AddressAPI.list();
    setAddresses(list.data);
    setSelectedAddress(res.data.id);
    setShowForm(false);
  };

  const applyPromo = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await CouponAPI.validate(promo.trim().toUpperCase(), subtotal);
      setDiscount(res.data.discount);
      setPromoApplied(true);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid coupon code");
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) {
      setError("Please select or add a delivery address");
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const res = await OrderAPI.create({
        addressId: selectedAddress,
        paymentMethod,
        couponCode: promoApplied ? promo.trim().toUpperCase() : undefined,
      });

      if (paymentMethod === "cod") {
        setPlacedOrder(res.data);
        clearCartLocal();
      } else {
        // Real Razorpay checkout flow: create a gateway order, open the widget,
        // then verify the signature server-side once payment succeeds.
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setError("Could not load payment gateway. Your order was placed — you can retry payment from Order History.");
          setPlacedOrder(res.data);
          clearCartLocal();
          return;
        }

        try {
          const rzpOrderRes = await PaymentAPI.createRazorpayOrder(res.data.totalAmount, res.data.orderNumber);
          const rzp = new window.Razorpay({
            key: rzpOrderRes.data.keyId,
            amount: rzpOrderRes.data.amount,
            currency: rzpOrderRes.data.currency,
            order_id: rzpOrderRes.data.orderId,
            name: "Jhanvika Jewelleries",
            description: `Order ${res.data.orderNumber}`,
            theme: { color: "#5c1f18" },
            handler: async (response) => {
              await PaymentAPI.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                localOrderId: res.data.orderId,
              });
              setPlacedOrder(res.data);
              clearCartLocal();
            },
            modal: {
              ondismiss: () => {
                setError("Payment was not completed. Your order is saved as pending — you can retry from Order History.");
                setPlacing(false);
              },
            },
          });
          rzp.open();
        } catch (gatewayErr) {
          // Razorpay isn't configured (no API keys yet) — order is still placed,
          // just without live payment processing.
          setError(gatewayErr.response?.data?.message || "Payment gateway not configured. Order placed — payment marked pending.");
          setPlacedOrder(res.data);
          clearCartLocal();
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not place order. Please try again.");
    } finally {
      if (paymentMethod === "cod") setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-xl mx-auto px-6 py-28 text-center">
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <PartyPopper className="mx-auto text-gold-600 mb-5" size={48} strokeWidth={1.3} />
          <h1 className="font-display text-3xl md:text-4xl text-maroon-900 mb-2">Order confirmed!</h1>
          <p className="text-maroon-900/60 font-body mb-1">Order number</p>
          <p className="font-display text-2xl text-gold-700 mb-6">{placedOrder.orderNumber}</p>
          <p className="text-maroon-900/60 font-body mb-8">Total paid: ₹{placedOrder.totalAmount.toLocaleString("en-IN")}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/account" className="inline-flex items-center gap-2 bg-maroon-900 text-ivory px-7 py-3 rounded-full font-body text-sm hover:bg-gold-600 hover:text-maroon-950 transition-colors">
              View My Orders <ArrowRight size={16} />
            </Link>
            <Link to="/shop" className="inline-flex items-center gap-2 border border-maroon-900 text-maroon-900 px-7 py-3 rounded-full font-body text-sm">
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-28 text-center">
        <p className="font-display text-2xl text-maroon-900 mb-3">Your bag is empty</p>
        <Link to="/shop" className="text-gold-700 underline font-body text-sm">Go shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 md:py-14">
      <h1 className="font-display text-3xl md:text-4xl text-maroon-900 mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-6">
          {/* Address selection */}
          <div>
            <h3 className="font-body text-sm font-medium text-maroon-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <MapPin size={15} /> Delivery Address
            </h3>
            {addresses === null ? (
              <div className="h-20 rounded-2xl bg-ivory-deep animate-pulse" />
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex gap-3 p-4 rounded-2xl border cursor-pointer transition-colors ${
                      selectedAddress === a.id ? "border-gold-500 bg-gold-50" : "border-gold-200/50 bg-ivory-deep"
                    }`}
                  >
                    <input type="radio" name="address" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} className="mt-1 accent-gold-600" />
                    <div className="text-sm font-body text-maroon-900">
                      <p className="font-medium">{a.full_name} · {a.phone}</p>
                      <p className="text-maroon-900/60 mt-0.5">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}</p>
                    </div>
                  </label>
                ))}
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className="flex items-center gap-2 text-sm font-body text-gold-700 hover:text-gold-600">
                    <Plus size={16} /> Add new address
                  </button>
                )}
              </div>
            )}

            {showForm && (
              <form onSubmit={saveAddress} className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-5 space-y-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <input name="fullName" required placeholder="Full name" value={form.fullName} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                  <input name="phone" required placeholder="Phone" value={form.phone} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                </div>
                <input name="line1" required placeholder="Address line 1" value={form.line1} onChange={onAddressFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                <input name="line2" placeholder="Address line 2 (optional)" value={form.line2} onChange={onAddressFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                <div className="grid grid-cols-3 gap-3">
                  <input name="city" required placeholder="City" value={form.city} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                  <input name="state" required placeholder="State" value={form.state} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                  <input name="pincode" required placeholder="Pincode" value={form.pincode} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                </div>
                <button type="submit" className="px-5 py-2.5 rounded-full bg-maroon-900 text-ivory text-sm font-body">Save & Use This Address</button>
              </form>
            )}
          </div>

          {/* Payment method */}
          <div>
            <h3 className="font-body text-sm font-medium text-maroon-900 uppercase tracking-wide mb-3">Payment Method</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{ id: "cod", label: "Cash on Delivery" }, { id: "upi", label: "UPI" }, { id: "card", label: "Card" }].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={`py-3 rounded-xl border text-sm font-body transition-colors ${
                    paymentMethod === m.id ? "border-gold-500 bg-gold-50 text-maroon-900" : "border-gold-200/60 text-maroon-900/60"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {paymentMethod !== "cod" && (
              <p className="text-xs text-maroon-900/50 font-body mt-2">Opens Razorpay's secure checkout. Falls back to a pending-payment order if the gateway isn't yet configured with live keys.</p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-fit bg-maroon-900 text-ivory rounded-2xl p-6 md:p-7 sticky top-28">
          <h3 className="font-display text-xl mb-5">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between text-sm font-body text-ivory/75">
                <span className="truncate pr-2">{product.name} × {qty}</span>
                <span className="shrink-0">₹{(product.price * qty).toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-ivory/15 pt-4 space-y-2 text-sm font-body text-ivory/75">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
            {promoApplied && <div className="flex justify-between text-gold-300"><span>Discount</span><span>-₹{discount.toLocaleString("en-IN")}</span></div>}
          </div>

          <form onSubmit={applyPromo} className="flex gap-2 mt-4">
            <input value={promo} onChange={(e) => setPromo(e.target.value)} disabled={promoApplied} placeholder="Promo code" className="flex-1 bg-ivory/10 border border-ivory/20 rounded-full px-4 py-2 text-sm outline-none placeholder:text-ivory/40" />
            <button type="submit" disabled={promoApplied} className="px-4 py-2 rounded-full bg-gold-500 text-maroon-950 text-sm font-body disabled:opacity-50">
              {promoApplied ? "Applied" : "Apply"}
            </button>
          </form>

          <div className="border-t border-ivory/15 mt-5 pt-4 flex justify-between font-display text-xl">
            <span>Total</span><span>₹{total.toLocaleString("en-IN")}</span>
          </div>

          {error && <p className="text-sm text-gold-300 font-body mt-3">{error}</p>}

          <button
            onClick={placeOrder}
            disabled={placing}
            className="w-full mt-6 py-3.5 rounded-full bg-gold-500 text-maroon-950 font-body text-sm tracking-wide hover:bg-gold-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {placing ? "Placing order…" : "Place Order"} <CheckCircle2 size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
