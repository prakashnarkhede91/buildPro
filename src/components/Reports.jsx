import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Badge, Btn, Card, PageHead, SummaryStat, Tabs, wideSummaryGridClass, summaryGridClass } from "./ui";

const salesMonthly = [
  { m:"Jan", leads:42, bookings:8,  revenue:3200000 },
  { m:"Feb", leads:38, bookings:6,  revenue:2800000 },
  { m:"Mar", leads:55, bookings:11, revenue:4400000 },
  { m:"Apr", leads:67, bookings:14, revenue:5600000 },
  { m:"May", leads:29, bookings:5,  revenue:2000000 },
  { m:"Jun", leads:44, bookings:9,  revenue:3600000 },
  { m:"Jul", leads:51, bookings:10, revenue:4000000 },
  { m:"Aug", leads:63, bookings:13, revenue:5200000 },
  { m:"Sep", leads:48, bookings:9,  revenue:3600000 },
  { m:"Oct", leads:72, bookings:16, revenue:6400000 },
  { m:"Nov", leads:85, bookings:18, revenue:7200000 },
];

const sourceData = [
  { name:"Facebook",    value:142, color:"#3b82f6" },
  { name:"99acres",     value:98,  color:"#f59e0b" },
  { name:"Instagram",   value:87,  color:"#ec4899" },
  { name:"Walk-in",     value:65,  color:"#16a34a" },
  { name:"MagicBricks", value:53,  color:"#cc0000" },
  { name:"Referral",    value:35,  color:"#9333ea" },
];

const projectPerf = [
  { name:"Kasturi Courtyard",   sold:29, available:12, booked:7,  revenue:11600000 },
  { name:"Green Valley Ph. 2",  sold:18, available:14, booked:4,  revenue:7200000  },
  { name:"Sunrise Heights",     sold:8,  available:14, booked:2,  revenue:3200000  },
  { name:"Royal Palms",         sold:16, available:2,  booked:2,  revenue:6400000  },
  { name:"City Square",         sold:22, available:32, booked:6,  revenue:8800000  },
];

export default function Reports() {
  const [tab, setTab] = useState("Sales Report");
  const [period, setPeriod] = useState("This Year");
  const sourceDotClass = { "#3b82f6":"bg-blue-500", "#f59e0b":"bg-amber-500", "#ec4899":"bg-pink-500", "#16a34a":"bg-emerald-600", "#cc0000":"bg-[blueviolet]", "#9333ea":"bg-purple-600" };
  const expenseBarClass = { Construction:"text-red-700", Marketing:"text-blue-600", Salary:"text-emerald-600", Admin:"text-purple-600", Other:"text-neutral-500" };

  return (
    <div>
      <PageHead title="Reports & Analytics" sub="Comprehensive insights across sales, construction, finance and marketing">
        <Btn variant="outline">↓ Export PDF</Btn>
        <Btn variant="outline">↓ Export Excel</Btn>
      </PageHead>

      {/* KPI Summary */}
      <div className={wideSummaryGridClass}>
        <SummaryStat label="Total Bookings (YTD)" value="119" colorClass="text-emerald-600" />
        <SummaryStat label="Total Revenue (YTD)" value="₹4.74Cr" colorClass="text-red-700" />
        <SummaryStat label="Total Leads (YTD)" value="594" colorClass="text-blue-600" />
        <SummaryStat label="Conversion Rate" value="20%" colorClass="text-orange-600" />
        <SummaryStat label="Avg. Deal Value" value="₹39.8L" colorClass="text-purple-600" />
      </div>

      <Tabs tabs={["Sales Report","Lead Analysis","Project Performance","Finance Report","Construction Report"]} active={tab} onChange={setTab} />

      {tab === "Sales Report" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
            <Card>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-neutral-900">Monthly Leads & Bookings</span>
                <div className="flex flex-wrap gap-1">
                  {["This Year","Last Year"].map(p=>(
                    <button key={p} onClick={()=>setPeriod(p)} className={`rounded-lg px-3 py-1 text-[11px] font-medium transition ${period===p ? "bg-red-50 text-red-700" : "text-neutral-500 hover:bg-neutral-100"}`}>{p}</button>
                  ))}
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesMonthly} barSize={12} barGap={3}>
                  <XAxis dataKey="m" tick={{ fontSize:11, fill:"#aaa" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:"#aaa" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize:12, borderRadius:8 }} cursor={{ fill:"#f9f9f9" }} />
                  <Bar dataKey="leads"    fill="#fecaca" radius={[3,3,0,0]} name="Leads" />
                  <Bar dataKey="bookings" fill="#cc0000" radius={[3,3,0,0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 flex flex-wrap gap-4">
                {[{c:"#fecaca",l:"Leads"},{c:"#cc0000",l:"Bookings"}].map(x=>(
                  <div key={x.l} className="flex items-center gap-1.5 text-xs">
                    <div className={`h-2.5 w-2.5 rounded-sm ${x.c === "#fecaca" ? "bg-red-200" : "bg-[blueviolet]"}`} />{x.l}
                  </div>
                ))}
              </div>
            </Card>
            <Card>
              <div className="mb-4 text-sm font-semibold text-neutral-900">Lead Sources</div>
              <div className="flex justify-center">
                <PieChart width={150} height={150}>
                  <Pie data={sourceData} cx={70} cy={70} outerRadius={65} dataKey="value" strokeWidth={2} stroke="white">
                    {sourceData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                </PieChart>
              </div>
              <div className="mt-2 flex flex-col gap-2">
                {sourceData.map(d=>(
                  <div key={d.name} className="flex justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2.5 w-2.5 rounded-full ${sourceDotClass[d.color] || "bg-neutral-500"}`} />
                      <span className="text-neutral-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-neutral-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <div className="mb-4 text-sm font-semibold text-neutral-900">Revenue Trend (Monthly ₹)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={salesMonthly}>
                <XAxis dataKey="m" tick={{ fontSize:11, fill:"#aaa" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"#aaa" }} axisLine={false} tickLine={false} tickFormatter={v=>"₹"+(v/100000).toFixed(0)+"L"} width={46} />
                <Tooltip formatter={(v)=>["₹"+(v/100000).toFixed(1)+"L","Revenue"]} contentStyle={{ fontSize:12, borderRadius:8 }} cursor={{ stroke:"#f0f0f0" }} />
                <Line type="monotone" dataKey="revenue" stroke="#cc0000" strokeWidth={2.5} dot={{ fill:"#cc0000", r:4 }} activeDot={{ r:6 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {tab === "Lead Analysis" && (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            <SummaryStat label="Total Leads" value="594" colorClass="text-blue-600" sub="Jan–Nov 2025" />
            <SummaryStat label="Converted" value="119" colorClass="text-emerald-600" sub="20% conversion" />
            <SummaryStat label="Avg. Response" value="2.4h" colorClass="text-orange-600" sub="Time to first contact" />
          </div>
          <Card>
            <div className="mb-4 text-sm font-semibold text-neutral-900">Lead Source Performance</div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sourceData.map(s=>{
                const conv = Math.round((s.value * 0.18));
                const cpl  = Math.round(30000 / s.value * 100);
                return (
                  <div key={s.name} className="rounded-2xl border border-neutral-100 p-4">
                    <div className="mb-3 flex justify-between">
                      <span className="text-[13px] font-semibold text-neutral-900">{s.name}</span>
                      <div className={`mt-1 h-2.5 w-2.5 rounded-full ${sourceDotClass[s.color] || "bg-neutral-500"}`} />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div><div className="text-neutral-400">Leads</div><div className="text-[15px] font-bold text-neutral-900">{s.value}</div></div>
                      <div><div className="text-neutral-400">Conv.</div><div className="text-[15px] font-bold text-emerald-600">{conv}</div></div>
                      <div><div className="text-neutral-400">CPL</div><div className="text-[15px] font-bold text-orange-600">₹{cpl}</div></div>
                    </div>
                    <div className="mt-3 h-1 rounded-full bg-neutral-200">
                      <div className="h-full rounded-full" style={{ width:`${(s.value/142)*100}%`, background:s.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {tab === "Project Performance" && (
        <Card>
          <div className="mb-4 text-sm font-semibold text-neutral-900">Project-wise Sales Performance</div>
          <div className="flex flex-col gap-4">
            {projectPerf.map((p,i)=>{
              const total = p.sold + p.available + p.booked;
              return (
                <div key={i} className="rounded-2xl border border-neutral-100 p-4">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">{p.name}</div>
                      <div className="mt-1 text-[11px] text-neutral-500">Total Units: {total}</div>
                    </div>
                    <div className="text-base font-bold text-red-700">₹{(p.revenue/100000).toFixed(0)}L</div>
                  </div>
                  <div className="mb-3 flex h-2.5 gap-1 overflow-hidden rounded-full">
                    <div style={{ flex:p.sold, background:"#cc0000" }} />
                    <div style={{ flex:p.booked, background:"#f59e0b" }} />
                    <div style={{ flex:p.available, background:"#dcfce7" }} />
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    {[{c:"#cc0000",l:"Sold",v:p.sold},{c:"#f59e0b",l:"Booked",v:p.booked},{c:"#dcfce7",l:"Available",v:p.available,border:"1px solid #d1fae5"}].map(x=>(
                      <div key={x.l} className="flex items-center gap-1.5">
                        <div className={`h-2.5 w-2.5 rounded-sm ${x.c === "#cc0000" ? "bg-[blueviolet]" : x.c === "#f59e0b" ? "bg-amber-500" : "bg-emerald-100"}`} style={x.border ? { border:x.border } : undefined} />
                        <span className="text-neutral-600">{x.l}: <strong>{x.v}</strong></span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "Finance Report" && (
        <div className="flex flex-col gap-4">
          <div className={summaryGridClass}>
            <SummaryStat label="Total Revenue" value="₹4.74Cr" colorClass="text-emerald-600" />
            <SummaryStat label="Total Expenses" value="₹2.12Cr" colorClass="text-red-700" />
            <SummaryStat label="Gross Profit" value="₹2.62Cr" colorClass="text-blue-600" />
            <SummaryStat label="Profit Margin" value="55.3%" colorClass="text-purple-600" />
          </div>
          <Card>
            <div className="mb-4 text-sm font-semibold text-neutral-900">Expense Category Breakdown (YTD)</div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {[
                { cat:"Construction", amt:15000000, color:"#cc0000" },
                { cat:"Marketing",    amt:1200000,  color:"#3b82f6" },
                { cat:"Salary",       amt:3000000,  color:"#16a34a" },
                { cat:"Admin",        amt:800000,   color:"#9333ea" },
                { cat:"Other",        amt:1200000,  color:"#888"    },
              ].map(e=>(
                <div key={e.cat} className="rounded-2xl border border-neutral-100 p-4 text-center">
                  <div className="text-[11px] text-neutral-500">{e.cat}</div>
                  <div className={`mt-1 text-lg font-bold ${expenseBarClass[e.cat] || "text-neutral-500"}`}>₹{(e.amt/100000).toFixed(1)}L</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "Construction Report" && (
        <div className="flex flex-col gap-4">
          <div className={summaryGridClass}>
            <SummaryStat label="Active Sites" value="3" colorClass="text-emerald-600" />
            <SummaryStat label="Tasks Completed" value="12" colorClass="text-blue-600" />
            <SummaryStat label="Tasks In Progress" value="8" colorClass="text-orange-600" />
            <SummaryStat label="Overall Completion" value="64%" colorClass="text-red-700" />
          </div>
          <Card>
            <div className="mb-4 text-sm font-semibold text-neutral-900">Site-wise Completion Progress</div>
            {[
              { site:"Kasturi Courtyard",   pct:68, budget:15000000, spent:10200000 },
              { site:"Green Valley Phase 2",pct:45, budget:8000000,  spent:3600000  },
              { site:"Sunrise Heights",     pct:22, budget:12000000, spent:2640000  },
            ].map((s,i)=>(
              <div key={i} className="mb-5 last:mb-0">
                <div className="mb-2 flex flex-col gap-2 text-[13px] sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-neutral-900">{s.site}</span>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="text-neutral-500">Budget: <strong>₹{(s.budget/100000).toFixed(0)}L</strong></span>
                    <span className="text-red-700">Spent: <strong>₹{(s.spent/100000).toFixed(0)}L</strong></span>
                    <span className="font-bold text-emerald-600">{s.pct}% done</span>
                  </div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full rounded-full transition-[width] duration-300" style={{ width:`${s.pct}%`, background: s.pct>60?"#16a34a":s.pct>30?"#2563eb":"#ea580c" }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
