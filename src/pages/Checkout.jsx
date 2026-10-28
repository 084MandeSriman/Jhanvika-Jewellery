import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Plus, PartyPopper, ArrowRight, Home, Pencil } from "lucide-react";
import { useCart } from "../context/CartContext";
import { AddressAPI, OrderAPI, CouponAPI, PaymentAPI } from "../api/services";
import JewelArt from "../components/JewelArt";
import { resolveImageUrl } from "../utils/imageUrl";

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

/* =========================================================================
   Payment artwork — every logo is drawn here with SVG / text, so there are
   no image files to host. (Hand-drawn look-alikes; swap in the official brand
   assets from each company's brand kit before going live.)
   ========================================================================= */

/* ---- UPI apps ---- */
function GPayLogo() {
  return (
    <svg viewBox="0 0 72 40" className="h-[32px] w-[58px] shrink-0" role="img" aria-label="Google Pay">
      <defs>
        <linearGradient id="gpayBlob" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#62a0fa" />
          <stop offset="1" stopColor="#3b7de8" />
        </linearGradient>
      </defs>
      <g transform="translate(0 6) scale(1.15)">
        <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </g>
      <rect x="27" y="4" width="44" height="32" rx="16" fill="url(#gpayBlob)" />
      <text x="49" y="25.5" textAnchor="middle" fontSize="15" fontWeight="600" fill="#fff" fontFamily="Arial, Helvetica, sans-serif">
        Pay
      </text>
    </svg>
  );
}

function PhonePeLogo() {
  return (
    <span
      className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#5f259f] text-white"
      role="img"
      aria-label="PhonePe"
      style={{ fontFamily: "'Noto Sans Devanagari','Nirmala UI','Mangal',sans-serif" }}
    >
      <span className="text-[20px] font-bold leading-none">पे</span>
    </span>
  );
}

function PaytmLogo() {
  return (
    <span
      className="shrink-0 text-[22px] font-extrabold leading-none tracking-tight"
      role="img"
      aria-label="Paytm"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <span style={{ color: "#002e6e" }}>pay</span>
      <span style={{ color: "#00b9f1" }}>tm</span>
    </span>
  );
}

/* ---- Card networks ---- */
function VisaLogo() {
  return (
    <span
      className="shrink-0 text-[21px] font-black italic leading-none tracking-tight"
      role="img"
      aria-label="Visa"
      style={{ color: "#1434cb", fontFamily: "'Arial Black', Arial, Helvetica, sans-serif" }}
    >
      VISA
    </span>
  );
}

function MastercardLogo() {
  return (
    <svg viewBox="0 0 38 24" className="h-[24px] w-[38px] shrink-0" role="img" aria-label="Mastercard">
      <circle cx="13" cy="12" r="11" fill="#eb001b" />
      <circle cx="25" cy="12" r="11" fill="#f79e1b" />
      <path d="M19 2.78A11 11 0 0 1 19 21.22A11 11 0 0 1 19 2.78z" fill="#ff5f00" />
    </svg>
  );
}

function RuPayLogo() {
  return (
    <span
      className="inline-flex shrink-0 items-center text-[18px] font-extrabold italic leading-none tracking-tight"
      role="img"
      aria-label="RuPay"
      style={{ color: "#1b3a8f", fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      RuPay
      <svg viewBox="0 0 12 14" className="ml-0.5 h-[14px] w-[10px]" aria-hidden>
        <path d="M1 1L11 7L1 7z" fill="#f47b20" />
        <path d="M1 7L11 7L1 13z" fill="#1f9d55" />
      </svg>
    </span>
  );
}

function AmexLogo() {
  return (
    <svg viewBox="0 0 36 36" className="h-[34px] w-[34px] shrink-0 rounded-[3px]" role="img" aria-label="American Express">
      <rect width="36" height="36" fill="#1f72cd" />
      <text x="18" y="16" textAnchor="middle" fontSize="6.4" fontWeight="700" fill="#fff" fontFamily="Arial, Helvetica, sans-serif">
        AMERICAN
      </text>
      <text x="18" y="24.5" textAnchor="middle" fontSize="6.4" fontWeight="700" fill="#fff" fontFamily="Arial, Helvetica, sans-serif">
        EXPRESS
      </text>
    </svg>
  );
}

/* ---- Razorpay ---- */
function RazorpayLogo() {
  return (
    <span className="inline-flex items-center gap-1.5" role="img" aria-label="Razorpay">
      <svg viewBox="0 0 24 28" className="h-[22px] w-[19px]" aria-hidden>
        <path d="M8 1L1.5 19 7 17l2-6z" fill="#2b83ea" />
        <path d="M9 11l-2 6 5.5-2L5 27 21 8l-7.5 2.5L17 1z" fill="#3fa0ff" />
      </svg>
      <span className="text-[21px] font-extrabold italic leading-none tracking-tight" style={{ color: "#0b2a63", fontFamily: "Arial, Helvetica, sans-serif" }}>
        Razorpay
      </span>
    </span>
  );
}

/* ---- Illustrations / icons ---- */
function CashArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      <g transform="rotate(-12 32 34)">
        <rect x="7" y="19" width="46" height="26" rx="3.5" fill="#2e8f50" />
      </g>
      <g transform="rotate(-6 34 36)">
        <rect x="11" y="23" width="46" height="26" rx="3.5" fill="#b7e2c1" stroke="#1d7a41" strokeWidth="2" />
        <rect x="15" y="27" width="38" height="18" rx="2" fill="none" stroke="#1d7a41" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="34" cy="36" r="7" fill="#1d7a41" />
        <text x="34" y="39.6" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff" fontFamily="Arial, Helvetica, sans-serif">
          ₹
        </text>
      </g>
    </svg>
  );
}

function CardGlyph({ className = "" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" stroke="#2f1814" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <rect x="3" y="7" width="26" height="18" rx="4" />
      <path d="M3 13.5h26" strokeWidth="3" />
      <circle cx="9" cy="20" r="1" fill="#2f1814" stroke="none" />
      <circle cx="13.5" cy="20" r="1" fill="#2f1814" stroke="none" />
    </svg>
  );
}

function ShieldLock() {
  return (
    <svg viewBox="0 0 24 24" className="h-[30px] w-[30px] shrink-0" fill="none" stroke="#2a1a16" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
      <path d="M12 2.5l8 3v6c0 5-3.3 8.7-8 10-4.7-1.3-8-5-8-10v-6l8-3z" />
      <rect x="8.5" y="11" width="7" height="5.5" rx="1" fill="#2a1a16" />
      <path d="M9.8 11V9.6a2.2 2.2 0 0 1 4.4 0V11" />
    </svg>
  );
}

function Radio({ selected }) {
  return selected ? (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-[#17803d] bg-white">
      <span className="h-3 w-3 rounded-full bg-[#17803d]" />
    </span>
  ) : (
    <span className="h-6 w-6 shrink-0 rounded-full border-2 border-[#c99a3f] bg-transparent" />
  );
}

/* ---- One selectable payment card ---- */
function PaymentOption({ id, selected, onSelect }) {
  const state = selected
    ? "border-[#17803d] bg-[#eef8f0]"
    : "border-[#ead9b4] bg-[#fffaf2] hover:border-[#d6b46a]";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className={`flex min-h-[124px] w-full items-center gap-3 rounded-[14px] border-[1.5px] px-3.5 py-4 text-left font-body transition-colors ${state}`}
    >
      <Radio selected={selected} />

      {id === "cod" && (
        <>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#e4f4e7] p-1.5 xl:h-12 xl:w-12">
            <CashArt />
          </span>
          <span className="flex min-w-0 flex-col items-start gap-2">
            <span className="text-[0.95rem] font-semibold leading-tight text-[#2b1713]">Cash on Delivery</span>
            <span className="rounded-full border border-[#93d3a2] bg-[#e1f5e5] px-2.5 py-1 text-[0.72rem] leading-none text-[#17803d]">
              Pay at your doorstep
            </span>
          </span>
        </>
      )}

      {id === "upi" && (
        <span className="flex min-w-0 flex-col items-start gap-2 pl-1">
          <span className="text-[0.95rem] font-semibold leading-tight text-[#2b1713]">UPI</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <GPayLogo />
            <PhonePeLogo />
            <PaytmLogo />
          </span>
          <span className="text-[0.8rem] leading-tight text-[#8c7e75]">Pay using any UPI app</span>
        </span>
      )}

      {id === "card" && (
        <>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#fbeedd] xl:h-12 xl:w-12">
            <CardGlyph className="h-[60%] w-[60%]" />
          </span>
          <span className="flex min-w-0 flex-col items-start gap-2">
            <span className="text-[0.95rem] font-semibold leading-tight text-[#2b1713]">Card</span>
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <VisaLogo />
              <MastercardLogo />
              <RuPayLogo />
              <AmexLogo />
            </span>
            <span className="text-[0.8rem] leading-tight text-[#8c7e75]">Debit / Credit Card</span>
          </span>
        </>
      )}
    </button>
  );
}

export default function Checkout() {
  const { items, subtotal, clearCartLocal } = useCart();
  const [addresses, setAddresses] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
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
    setError("");
    try {
      if (editingAddressId) {
        await AddressAPI.update(editingAddressId, form);
      } else {
        const res = await AddressAPI.create(form);
        setSelectedAddress(res.data.id);
      }
      const list = await AddressAPI.list();
      setAddresses(list.data);
      setShowForm(false);
      setEditingAddressId(null);
      setForm({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
    } catch (saveError) {
      setError(saveError.response?.data?.message || "Could not save address. Please try again.");
    }
  };

  const editAddress = (address) => {
    setEditingAddressId(address.id);
    setForm({
      fullName: address.full_name,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
    });
    setShowForm(true);
    setError("");
  };

  const startNewAddress = () => {
    setEditingAddressId(null);
    setForm({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
    setShowForm(true);
    setError("");
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
    <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-10 md:px-10 md:py-14">
      <h1 className="mb-6 font-display text-3xl text-maroon-900 sm:mb-8 md:text-4xl">Checkout</h1>

      <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
        <div className="min-w-0 space-y-8 sm:space-y-10">
          {/* Address selection */}
          <div>
            <h3 className="mb-4 flex items-center gap-3 font-body text-base font-semibold uppercase tracking-wide text-maroon-900 sm:mb-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-maroon-900 sm:h-12 sm:w-12">
                <MapPin size={19} />
              </span>
              Delivery Address
            </h3>
            {addresses === null ? (
              <div className="h-20 rounded-2xl bg-ivory-deep animate-pulse" />
            ) : (
              <div className="space-y-3">
                {addresses.map((a) => {
                  const isSelected = selectedAddress === a.id;
                  return (
                    <div
                      key={a.id}
                      className={`flex min-w-0 items-center gap-2.5 rounded-2xl border p-3.5 transition-colors sm:gap-3 sm:p-4 md:p-5 ${
                        isSelected ? "border-gold-500 bg-[#fffaf1]" : "border-gold-200/70 bg-ivory-deep/40"
                      }`}
                    >
                      <label htmlFor={`address-${a.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 sm:gap-3 md:gap-4">
                        <input
                          id={`address-${a.id}`}
                          type="radio"
                          name="address"
                          checked={isSelected}
                          onChange={() => setSelectedAddress(a.id)}
                          className="h-4 w-4 shrink-0 accent-gold-600 sm:h-[18px] sm:w-[18px]"
                        />
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-50 text-maroon-900 sm:h-11 sm:w-11">
                          <Home size={19} strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0 break-words text-xs font-body text-maroon-900 sm:text-sm">
                          <span className="block font-semibold">{a.full_name} · {a.phone}</span>
                          <span className="mt-1 block leading-relaxed text-maroon-900/60">
                            {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} - {a.pincode}
                          </span>
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => editAddress(a)}
                        className="flex shrink-0 items-center gap-1.5 border-l border-gold-200 pl-2.5 text-xs font-body text-gold-700 transition-colors hover:text-maroon-900 sm:gap-2 sm:pl-3 sm:text-sm md:pl-5"
                        aria-label={`Edit address for ${a.full_name}`}
                      >
                        <Pencil size={16} /> <span className="hidden sm:inline">Edit</span>
                      </button>
                    </div>
                  );
                })}
                {!showForm && (
                  <button onClick={startNewAddress} className="flex items-center gap-2 py-1 text-sm font-body text-gold-700 hover:text-gold-600">
                    <Plus size={18} /> Add new address
                  </button>
                )}
              </div>
            )}

            {showForm && (
              <form onSubmit={saveAddress} className="bg-ivory-deep border border-gold-200/50 rounded-2xl p-5 space-y-3 mt-3">
                <p className="font-body text-sm font-medium text-maroon-900">{editingAddressId ? "Edit delivery address" : "Add delivery address"}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <input name="fullName" required placeholder="Full name" value={form.fullName} onChange={onAddressFormChange} className="min-w-0 px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                  <input name="phone" required placeholder="Phone" value={form.phone} onChange={onAddressFormChange} className="min-w-0 px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                </div>
                <input name="line1" required placeholder="Address line 1" value={form.line1} onChange={onAddressFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                <input name="line2" placeholder="Address line 2 (optional)" value={form.line2} onChange={onAddressFormChange} className="w-full px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input name="city" required placeholder="City" value={form.city} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                  <input name="state" required placeholder="State" value={form.state} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                  <input name="pincode" required placeholder="Pincode" value={form.pincode} onChange={onAddressFormChange} className="px-4 py-2.5 rounded-xl border border-gold-300/60 bg-ivory outline-none font-body text-sm" />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="px-5 py-2.5 rounded-full bg-maroon-900 text-ivory text-sm font-body">
                    {editingAddressId ? "Save Address" : "Save & Use This Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingAddressId(null);
                      setForm({ fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
                    }}
                    className="px-5 py-2.5 rounded-full border border-gold-300 text-maroon-900 text-sm font-body"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ------------------------- Payment method ------------------------- */}
          <div>
            <div className="mb-5 flex items-center gap-3 sm:gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fcebd6] sm:h-14 sm:w-14">
                <CardGlyph className="h-6 w-6 sm:h-7 sm:w-7" />
              </span>
              <div>
                <h3 className="font-body text-lg font-medium uppercase leading-tight tracking-[0.08em] text-[#3a1c14] sm:text-[1.3rem]">
                  Payment Method
                </h3>
                <p className="mt-1 text-xs font-body leading-relaxed text-[#8b7b72] sm:text-[0.95rem]">Choose a payment method to complete your purchase</p>
              </div>
            </div>

            <div role="radiogroup" aria-label="Payment method" className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {["cod", "upi", "card"].map((id) => (
                <PaymentOption key={id} id={id} selected={paymentMethod === id} onSelect={setPaymentMethod} />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[#efe1c8] pt-4 font-body text-[0.92rem] text-[#5c4a43]">
              <ShieldLock />
              <span>100% Secure Payments</span>
              <span className="text-[#d9b870]">|</span>
              <span>Powered by</span>
              <RazorpayLogo />
            </div>

            {paymentMethod !== "cod" && (
              <p className="text-xs text-maroon-900/50 font-body mt-2">Opens Razorpay's secure checkout. Falls back to a pending-payment order if the gateway isn't yet configured with live keys.</p>
            )}
          </div>
        </div>

        {/* Order summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-fit bg-maroon-900 text-ivory rounded-2xl p-6 md:p-7 lg:sticky lg:top-28">
          <h3 className="font-display text-xl mb-5">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-3 text-sm font-body text-ivory/75">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ivory">
                  {product.image ? (
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-1">
                      <JewelArt type={product.categoryType} theme={product.theme} className="h-full w-full" animated={false} />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-ivory">{product.name}</p>
                    <p className="text-xs text-ivory/55">Qty: {qty}</p>
                  </div>
                  <span className="shrink-0">₹{(product.price * qty).toLocaleString("en-IN")}</span>
                </div>
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