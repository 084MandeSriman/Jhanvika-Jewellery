import { ShieldCheck, Award } from "lucide-react";

const LABELS = {
  sku: "SKU",
  hsnCode: "HSN Code",
  goldPurity: "Gold Purity",
  goldWeight: "Gold Weight",
  netWeight: "Net Weight",
  grossWeight: "Gross Weight",
  diamondWeight: "Diamond Weight",
  diamondClarity: "Diamond Clarity",
  diamondColor: "Diamond Color",
  stoneWeight: "Stone Weight",
  hallmarkNumber: "Hallmark No.",
  certificateNumber: "Certificate No.",
};

const WEIGHT_FIELDS = new Set(["goldWeight", "netWeight", "grossWeight", "stoneWeight"]);
const CARAT_FIELDS = new Set(["diamondWeight"]);

export default function JewellerySpecs({ specs }) {
  if (!specs) return null;

  const rows = Object.entries(LABELS)
    .map(([key, label]) => {
      let value = specs[key];
      if (value === null || value === undefined || value === "") return null;
      if (WEIGHT_FIELDS.has(key)) value = `${value} g`;
      if (CARAT_FIELDS.has(key)) value = `${value} ct`;
      return { key, label, value };
    })
    .filter(Boolean);

  if (rows.length === 0 && !specs.bisHallmark) return null;

  return (
    <div className="mt-10 pt-6 border-t border-gold-200/60">
      <h4 className="font-body text-sm font-medium text-maroon-900 uppercase tracking-wide mb-4 flex items-center gap-2">
        <Award size={16} className="text-gold-600" /> Specifications
      </h4>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        {rows.map((r) => (
          <div key={r.key} className="text-sm font-body">
            <span className="text-maroon-900/50">{r.label}: </span>
            <span className="text-maroon-900 font-medium">{r.value}</span>
          </div>
        ))}
      </div>
      {specs.bisHallmark && (
        <div className="flex items-center gap-2 mt-4 text-xs font-body text-emerald-800 bg-emerald-800/10 rounded-full px-3 py-1.5 w-fit">
          <ShieldCheck size={13} /> BIS Hallmarked
        </div>
      )}
      {specs.makingCharges > 0 && (
        <p className="text-xs text-maroon-900/50 font-body mt-3">
          Includes making charges of ₹{specs.makingCharges.toLocaleString("en-IN")} + {specs.gstPercent}% GST
        </p>
      )}
    </div>
  );
}
