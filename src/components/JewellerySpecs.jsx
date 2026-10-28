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

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === "") return null;
    if (WEIGHT_FIELDS.has(key)) return `${value} g`;
    if (CARAT_FIELDS.has(key)) return `${value} ct`;
    return value;
  };
  const columns = [
    ["sku", "goldPurity", "netWeight", "diamondWeight", "diamondColor", "hallmarkNumber"],
    ["hsnCode", "goldWeight", "grossWeight", "diamondClarity", "stoneWeight", "certificateNumber"],
  ].map((keys) => keys
    .map((key) => ({ key, label: LABELS[key], value: formatValue(key, specs[key]) }))
    .filter((row) => row.value !== null));
  const rows = columns.flat();

  if (rows.length === 0 && !specs.bisHallmark) return null;

  return (
    <div className="mt-3 rounded-xl border border-gold-200/70 p-4 md:p-5">
      <h4 className="font-body text-xs font-medium text-maroon-900 uppercase tracking-wide mb-3 flex items-center gap-2">
        <Award size={16} className="text-gold-600" /> Specifications
      </h4>
      <div className="grid grid-cols-2">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className={`space-y-1.5 ${columnIndex === 1 ? "border-l border-gold-200/70 pl-4 md:pl-8" : "pr-3 md:pr-6"}`}>
            {column.map((r) => (
              <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-[11px] md:text-xs font-body">
                <span className="text-maroon-900/50">{r.label}:</span>
                <span className="text-maroon-900 font-medium text-right">{r.value}</span>
              </div>
            ))}
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
