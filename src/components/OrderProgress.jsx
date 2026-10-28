const STEPS = ["confirmed", "processing", "shipped", "delivered"];
const LABELS = ["Order Placed", "Processing", "Shipped", "Delivered"];

export default function OrderProgress({ status, className = "" }) {
  if (status === "cancelled" || status === "returned") {
    return <p className={`text-xs font-body text-maroon-700 capitalize ${className}`}>Order {status}</p>;
  }

  const currentIndex = Math.max(0, STEPS.indexOf(status));
  return (
    <div className={`grid grid-cols-4 ${className}`}>
      {STEPS.map((step, index) => (
        <div key={step} className="relative flex flex-col items-center text-center">
          {index > 0 && <span className={`absolute right-1/2 top-[5px] h-0.5 w-full ${index <= currentIndex ? "bg-gold-500" : "bg-gold-200"}`} />}
          <span className={`relative z-10 h-2.5 w-2.5 rounded-full ${index <= currentIndex ? "bg-gold-600" : "bg-gold-200"}`} />
          <span className={`mt-1.5 text-[9px] leading-tight sm:text-[10px] font-body ${index <= currentIndex ? "text-gold-700" : "text-maroon-900/45"}`}>
            {LABELS[index]}
          </span>
        </div>
      ))}
    </div>
  );
}
