import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { ActionBtns, Btn, Card, SectionHead, TR, TD, Table } from "./ui";

const salesData = [
  { month:"Jan", a:950000, b:330000 },
  { month:"Feb", a:580000, b:200000 },
  { month:"Mar", a:1100000, b:380000 },
  { month:"Apr", a:1300000, b:450000 },
  { month:"May", a:370000, b:120000 },
  { month:"Jun", a:580000, b:200000 },
  { month:"Jul", a:150000, b:60000 },
];

const payData = [
  { name:"Salary",           value:20000,  color:"#ef4444" },
  { name:"Contractor",       value:136000, color:"#3b82f6" },
  { name:"Project Expenses", value:82500,  color:"#ec4899" },
  { name:"Other Expenses",   value:65000,  color:"#f59e0b" },
];

const enquiries = [
  { date:"22 Nov 2025", project:"Kastury Courtyard", customer:"Ankit",         mobile:"9755408189", assign:"Pushpraj" },
  { date:"22 Nov 2025", project:"Kastury Courtyard", customer:"Ram Patel",     mobile:"8085134821", assign:"Aman"     },
  { date:"22 Nov 2025", project:"Kastury Courtyard", customer:"Keshav Singh",  mobile:"8103950632", assign:"Pushpraj" },
  { date:"22 Nov 2025", project:"Kastury Courtyard", customer:"Brijesh Gurjar",mobile:"7898711782", assign:"Aman"     },
  { date:"22 Nov 2025", project:"Kastury Courtyard", customer:"Adarsh Kumar",  mobile:"9993157262", assign:"Kumar"    },
  { date:"22 Nov 2025", project:"Kastury Courtyard", customer:"Prashant",      mobile:"7354982165", assign:"Pushpraj" },
];

const fmtL = v => v >= 100000 ? (v/1000)+"K" : v;
const iconBgClass = { "#eff6ff":"bg-blue-50", "#f0fdf4":"bg-emerald-50", "#fef9c3":"bg-yellow-100", "#fef2f2":"bg-red-50" };
const paymentDotClass = { "#ef4444":"bg-red-500", "#3b82f6":"bg-blue-500", "#ec4899":"bg-pink-500", "#f59e0b":"bg-amber-500" };

export default function Dashboard() {
  const [period, setPeriod] = useState("Monthly");
  const total = payData.reduce((s,d)=>s+d.value,0);

  const stats = [
    { label:"No. Of Projects",  value:"7",          icon:<ProjIcon />, iconBg:"#eff6ff" },
    { label:"No. Of Customers", value:"1,518",      icon:<CustIcon />, iconBg:"#f0fdf4" },
    { label:"Pending Task",     value:"3",          icon:<TaskIcon />, iconBg:"#fef9c3" },
    { label:"Total Expenses",   value:"₹1,47,500",  icon:<ExpIcon />,  iconBg:"#fef2f2", red:true },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s,i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconBgClass[s.iconBg] || "bg-neutral-100"}`}>
              {s.icon}
            </div>
            <div>
              <div className="text-[11px] font-medium text-neutral-500">{s.label}</div>
              <div className={`text-[22px] font-bold leading-tight ${s.red ? "text-red-700" : "text-neutral-900"}`}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">

        {/* Sales Revenue */}
        <Card>
          <SectionHead title="Sales Revenue">
            <div className="flex flex-wrap gap-1">
              {["Monthly","Quarterly","Yearly"].map(p => (
                <button key={p} onClick={()=>setPeriod(p)} className={`rounded-lg px-3 py-1 text-[11px] font-medium transition ${period===p ? "bg-red-50 text-red-700" : "text-neutral-500 hover:bg-neutral-100"}`}>{p}</button>
              ))}
            </div>
          </SectionHead>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={salesData} barSize={18} barGap={3}>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:"#aaa" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:"#aaa" }} axisLine={false} tickLine={false} tickFormatter={fmtL} width={42} />
              <Tooltip formatter={(v)=>["₹"+v.toLocaleString("en-IN")]} contentStyle={{ fontSize:12, borderRadius:8 }} cursor={{ fill:"#f9f9f9" }} />
              <Bar dataKey="a" fill="#cc0000" radius={[3,3,0,0]} />
              <Bar dataKey="b" fill="#ffbdbd" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Payment Made */}
        <Card>
          <SectionHead title="Payment Made">
            <button className="text-xs font-medium text-blue-600">See All</button>
          </SectionHead>
          <div className="flex justify-center">
            <div className="relative h-37.5 w-37.5">
              <PieChart width={150} height={150}>
                <Pie data={payData} cx={70} cy={70} innerRadius={44} outerRadius={68} dataKey="value" strokeWidth={2} stroke="white">
                  {payData.map((e,i)=><Cell key={i} fill={e.color}/>)}
                </Pie>
              </PieChart>
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-y-1/2 translate-x-[-52%] text-center">
                <div className="text-[10px] text-neutral-500">Made</div>
                <div className="text-[13px] font-bold text-neutral-900">₹{(total/1000).toFixed(0)}K</div>
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-col gap-2.5">
            {payData.map(d=>(
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${paymentDotClass[d.color] || "bg-neutral-400"}`} />
                  <span className="text-neutral-600">{d.name}</span>
                </div>
                <span className="font-semibold text-neutral-900">₹{d.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── Enquiry Follow-Ups ── */}
      <Card>
        <SectionHead title={
          <span className="flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
            Enquiry Follow- Ups
          </span>
        }>
          <Btn size="sm" variant="outline">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M9 18h6"/></svg> Sort
          </Btn>
          <Btn size="sm" variant="outline">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg> Filter
          </Btn>
        </SectionHead>
        <Table headers={["Follow Up Date","Project Name","Customer Name","Mobile No","Assign To","Action"]}>
          {enquiries.map((e,i)=>(
            <TR key={i}>
              <TD className="text-xs text-neutral-500">{e.date}</TD>
              <TD>{e.project}</TD>
              <TD className="font-medium text-neutral-900">{e.customer}</TD>
              <TD className="font-medium text-blue-600">{e.mobile}</TD>
              <TD>{e.assign}</TD>
              <TD><ActionBtns onWhatsApp={()=>{}} onEdit={()=>{}} /></TD>
            </TR>
          ))}
        </Table>
      </Card>
    </div>
  );
}

function ProjIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}
function CustIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
function TaskIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>}
function ExpIcon(){return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#cc0000" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
