import { useState } from "react";
import { ActionBtns, Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, Select, SummaryStat, TR, TD, Table, Tabs, summaryGridClass } from "./ui";

const loans = [
  { id:1, lender:"SBI Bank",       type:"Project Loan",    principal:10000000, rate:9.5,  emi:125000, paid:7, total:24, start:"Jan 2024", status:"Active" },
  { id:2, lender:"HDFC Bank",      type:"Land Loan",       principal:5000000,  rate:8.8,  emi:65000,  paid:12,total:36, start:"Jun 2023", status:"Active" },
  { id:3, lender:"Private Lender", type:"Short Term",      principal:2000000,  rate:14.0, emi:180000, paid:4, total:12, start:"Aug 2025", status:"Active" },
  { id:4, lender:"Aditya Birla",   type:"Construction OD", principal:3000000,  rate:11.5, emi:0,      paid:0, total:0,  start:"Oct 2025", status:"Active" },
];

const transactions = [
  { date:"22 Nov 2025", desc:"EMI – SBI Bank (Installment 7)",       type:"Outflow", amount:125000, project:"Kasturi Courtyard",   category:"Loan EMI" },
  { date:"20 Nov 2025", desc:"Plot Sale Receipt – Unit B7",           type:"Inflow",  amount:750000, project:"Sunrise Heights",     category:"Sale Proceeds" },
  { date:"18 Nov 2025", desc:"Private Lender Disbursement",           type:"Inflow",  amount:500000, project:"Kasturi Courtyard",   category:"Loan Receipt" },
  { date:"15 Nov 2025", desc:"EMI – HDFC Bank (Installment 12)",      type:"Outflow", amount:65000,  project:"Green Valley Phase 2",category:"Loan EMI" },
  { date:"10 Nov 2025", desc:"Customer Installment – Ram Patel",      type:"Inflow",  amount:300000, project:"Kasturi Courtyard",   category:"Sale Proceeds" },
];

export default function SelfFinance() {
  const [tab, setTab] = useState("Loans & Liabilities");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ lender:"", type:"Project Loan", principal:"", rate:"", emi:"", total:"", start:"", status:"Active" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const totalPrincipal = loans.reduce((s,l)=>s+l.principal,0);
  const totalEMI       = loans.reduce((s,l)=>s+l.emi,0);

  return (
    <div>
      <PageHead title="Self Finance" sub="Manage loans, liabilities, personal investments and cash flow">
        <Btn onClick={()=>setShowModal(true)}>+ Add Loan</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Loans" value={loans.length} />
        <SummaryStat label="Total Principal" value={`₹${(totalPrincipal/10000000).toFixed(1)}Cr`} colorClass="text-red-700" />
        <SummaryStat label="Monthly EMI" value={`₹${(totalEMI/1000).toFixed(0)}K`} colorClass="text-orange-600" />
        <SummaryStat label="Net Cash Flow" value="₹4.2L ↑" colorClass="text-emerald-600" />
      </div>

      <Tabs tabs={["Loans & Liabilities","Cash Flow","Investments","Personal Assets"]} active={tab} onChange={setTab} />

      {tab === "Loans & Liabilities" && (
        <Card>
          <Table headers={["#","Lender","Type","Principal","Rate %","EMI","Progress","Status","Action"]}>
            {loans.map((l,i)=>{
              const pct = l.total>0?Math.round((l.paid/l.total)*100):0;
              return (
                <TR key={l.id}>
                  <TD className="text-xs text-neutral-400">{i+1}</TD>
                  <TD className="font-semibold text-neutral-900">{l.lender}</TD>
                  <TD><Badge color="blue">{l.type}</Badge></TD>
                  <TD className="font-bold text-neutral-900">₹{(l.principal/100000).toFixed(1)}L</TD>
                  <TD className="font-semibold text-orange-600">{l.rate}%</TD>
                  <TD className="font-semibold text-neutral-900">{l.emi>0?"₹"+l.emi.toLocaleString("en-IN"):"OD A/C"}</TD>
                  <TD className="min-w-32">
                    {l.total>0 && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-neutral-200">
                          <div className="h-full rounded-full bg-emerald-600" style={{ width:`${pct}%` }} />
                        </div>
                        <span className="text-[11px] text-neutral-500">{l.paid}/{l.total}</span>
                      </div>
                    )}
                  </TD>
                  <TD><Badge color="green">{l.status}</Badge></TD>
                  <TD><ActionBtns onEdit={()=>{}} onDelete={()=>{}} /></TD>
                </TR>
              );
            })}
          </Table>
        </Card>
      )}

      {tab === "Cash Flow" && (
        <Card>
          <Table headers={["Date","Description","Type","Amount","Project","Category"]}>
            {transactions.map((t,i)=>(
              <TR key={i}>
                <TD className="text-xs text-neutral-500">{t.date}</TD>
                <TD className="font-medium text-neutral-900">{t.desc}</TD>
                <TD><Badge color={t.type==="Inflow"?"green":"red"}>{t.type}</Badge></TD>
                <TD className={t.type==="Inflow" ? "font-bold text-emerald-600" : "font-bold text-red-700"}>
                  {t.type==="Inflow"?"+":"–"}₹{t.amount.toLocaleString("en-IN")}
                </TD>
                <TD className="text-xs">{t.project}</TD>
                <TD><Badge color="grey">{t.category}</Badge></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Investments" && (
        <Card>
          <div className="grid gap-4 xl:grid-cols-2">
            {[
              { name:"Mutual Fund – SBI Bluechip", invested:500000, current:620000, returns:"+24%" },
              { name:"FD – SBI Bank",              invested:1000000,current:1085000,returns:"+8.5%" },
              { name:"PPF Account",                invested:200000, current:230000, returns:"+15%" },
              { name:"Gold ETF",                   invested:300000, current:348000, returns:"+16%" },
            ].map((inv,i)=>(
              <div key={i} className="rounded-2xl border border-neutral-200 p-4">
                <div className="mb-3 text-[13px] font-semibold text-neutral-900">{inv.name}</div>
                <div className="grid gap-3 text-xs sm:grid-cols-3">
                  <div><div className="text-neutral-500">Invested</div><div className="font-bold text-neutral-900">₹{(inv.invested/100000).toFixed(1)}L</div></div>
                  <div><div className="text-neutral-500">Current</div><div className="font-bold text-emerald-600">₹{(inv.current/100000).toFixed(1)}L</div></div>
                  <div><div className="text-neutral-500">Returns</div><div className="font-bold text-emerald-600">{inv.returns}</div></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "Personal Assets" && (
        <Card>
          <Table headers={["Asset","Type","Purchase Value","Current Value","Date","Status"]}>
            {[
              { asset:"Plot – Sector 12, Bhopal", type:"Land",     purchase:2000000,current:3200000,date:"Mar 2020",status:"Owned" },
              { asset:"Flat – Indrapuri",          type:"Property", purchase:3500000,current:4800000,date:"Jan 2018",status:"Owned" },
              { asset:"Mahindra Scorpio",          type:"Vehicle",  purchase:1400000,current:900000, date:"Aug 2022",status:"Owned" },
              { asset:"Office Space – C-Sector",   type:"Property", purchase:4000000,current:5500000,date:"Jun 2021",status:"Owned" },
            ].map((a,i)=>(
              <TR key={i}>
                <TD className="font-semibold text-neutral-900">{a.asset}</TD>
                <TD><Badge color="blue">{a.type}</Badge></TD>
                <TD>₹{(a.purchase/100000).toFixed(1)}L</TD>
                <TD className="font-bold text-emerald-600">₹{(a.current/100000).toFixed(1)}L</TD>
                <TD className="text-xs text-neutral-500">{a.date}</TD>
                <TD><Badge color="green">{a.status}</Badge></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {showModal && (
        <Modal title="Add Loan / Liability" onClose={()=>setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Lender Name *"><Input placeholder="e.g. SBI Bank" value={form.lender} onChange={e=>f("lender",e.target.value)} /></FG>
            <FG label="Loan Type"><Select value={form.type} onChange={e=>f("type",e.target.value)}><option>Project Loan</option><option>Land Loan</option><option>Short Term</option><option>Construction OD</option><option>Personal Loan</option></Select></FG>
            <FG label="Principal Amount (₹)"><Input type="number" placeholder="0" value={form.principal} onChange={e=>f("principal",e.target.value)} /></FG>
            <FG label="Interest Rate (%)"><Input type="number" placeholder="0.0" step="0.1" value={form.rate} onChange={e=>f("rate",e.target.value)} /></FG>
            <FG label="EMI Amount (₹)"><Input type="number" placeholder="0" value={form.emi} onChange={e=>f("emi",e.target.value)} /></FG>
            <FG label="Total Instalments"><Input type="number" placeholder="0" value={form.total} onChange={e=>f("total",e.target.value)} /></FG>
            <FG label="Start Date"><Input placeholder="e.g. Jan 2024" value={form.start} onChange={e=>f("start",e.target.value)} /></FG>
            <FG label="Status"><Select value={form.status} onChange={e=>f("status",e.target.value)}><option>Active</option><option>Closed</option><option>Overdue</option></Select></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn>
            <Btn onClick={()=>setShowModal(false)}>Save Loan</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
