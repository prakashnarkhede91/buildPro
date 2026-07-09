import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "../ui";
import { catColors, catDotClass, monthData } from "./accountData";
import { useAccountSection } from "./useAccountSection";

export default function AccountOverview() {
  const { catTotals, totalExp } = useAccountSection();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Card>
        <div className="mb-4 text-sm font-semibold text-neutral-900">Income vs Expenses (Monthly)</div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={monthData} barSize={16} barGap={4}>
            <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#aaa" }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${(value / 100000).toFixed(0)}L`} width={46} />
            <Tooltip formatter={(value) => [`₹${(value / 100000).toFixed(1)}L`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} cursor={{ fill: "#f9f9f9" }} />
            <Bar dataKey="inc" fill="#cc0000" radius={[3, 3, 0, 0]} name="Income" />
            <Bar dataKey="exp" fill="#e8e8e8" radius={[3, 3, 0, 0]} name="Expense" />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex flex-wrap gap-4">
          {[{ c: "#cc0000", l: "Income" }, { c: "#e8e8e8", l: "Expense" }].map((item) => (
            <div key={item.l} className="flex items-center gap-1.5 text-xs">
              <div className={`h-2.5 w-2.5 rounded-sm ${item.c === "#e8e8e8" ? "border border-neutral-300 bg-neutral-200" : "bg-[blueviolet]"}`} />
              {item.l}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <div className="mb-4 text-sm font-semibold text-neutral-900">Expense Breakdown</div>
        {Object.entries(catTotals).map(([cat, amount]) => {
          const pct = totalExp ? Math.round((amount / totalExp) * 100) : 0;
          return (
            <div key={cat} className="mb-3 last:mb-0">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-sm ${catDotClass[cat] || "bg-neutral-500"}`} />
                  <span className="text-neutral-600">{cat}</span>
                </div>
                <span className="font-semibold text-neutral-900">₹{amount.toLocaleString("en-IN")} ({pct}%)</span>
              </div>
              <div className="h-1.5 rounded-full bg-neutral-200">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: catColors[cat] || "#888" }} />
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}
