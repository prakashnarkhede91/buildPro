import { Card } from "../ui";
import { profitLossRows } from "./accountData";

export default function AccountProfitLoss() {
  return (
    <Card>
      <div className="mx-auto max-w-130">
        <div className="mb-5 text-center text-[15px] font-bold text-neutral-900">Profit & Loss – November 2025</div>
        {profitLossRows.map((row) => (
          <div
            key={row.label}
            className={`mb-2 flex items-center justify-between rounded-xl border px-4 py-3 ${row.type === "profit" ? "border-emerald-200 bg-emerald-50" : row.type === "income" ? "border-blue-200 bg-blue-50" : "border-neutral-200 bg-neutral-50"}`}
          >
            <span className={`text-[13px] ${row.type === "profit" ? "font-bold" : "font-medium"}`}>{row.label}</span>
            <span className={`font-bold ${row.type === "profit" ? "text-emerald-600" : row.type === "income" ? "text-blue-600" : "text-red-700"}`}>
              {row.type === "expense" ? "–" : ""}₹{(row.value / 100000).toFixed(1)}L
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
