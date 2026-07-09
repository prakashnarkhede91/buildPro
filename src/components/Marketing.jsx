import { useState } from "react";
import { ActionBtns, Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, PROJECTS, Select, SummaryStat, TR, TD, Table, Tabs, Textarea, summaryGridClass } from "./ui";
import { LEAD_SOURCE, LEAD_SOURCE_OPTIONS } from "../lib/enums";

// SOURCES kept for Lead Source Analysis display only
const SOURCES = ["Facebook","Instagram","99acres","Makaan.com","Housing.com","MagicBricks","Walk-in","Referral","Google Ads"];

const campaigns = [
  { id:1, name:"Kasturi Launch – FB",    channel:"Facebook",   budget:50000, spent:38000, leads:142, project:"Kasturi Courtyard",    status:"Active",   start:"01 Nov 2025" },
  { id:2, name:"Green Valley Instagram", channel:"Instagram",  budget:30000, spent:22000, leads:87,  project:"Green Valley Phase 2",  status:"Active",   start:"05 Nov 2025" },
  { id:3, name:"99acres Premium Listing",channel:"99acres",    budget:20000, spent:20000, leads:64,  project:"Sunrise Heights",       status:"Completed",start:"01 Oct 2025" },
  { id:4, name:"Google Search Ads",      channel:"Google Ads", budget:40000, spent:15000, leads:53,  project:"Royal Palms",            status:"Active",   start:"10 Nov 2025" },
  { id:5, name:"MagicBricks Featured",   channel:"MagicBricks",budget:25000, spent:25000, leads:98,  project:"Kasturi Courtyard",    status:"Completed",start:"01 Oct 2025" },
];

export default function Marketing() {
  const [tab, setTab]   = useState("Campaigns");
  const [list, setList] = useState(campaigns);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:"", channel: LEAD_SOURCE.FACEBOOK, budget:"", project:PROJECTS[0], start:"", status:"Active", notes:"" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const save = () => {
    if (!form.name) return;
    setList(p=>[...p,{ id:Date.now(), ...form, budget:+form.budget||0, spent:0, leads:0 }]);
    setShowModal(false);
    setForm({ name:"", channel: LEAD_SOURCE.FACEBOOK, budget:"", project:PROJECTS[0], start:"", status:"Active", notes:"" });
  };

  const chColor = { Facebook:"blue", Instagram:"purple", "99acres":"orange", "Google Ads":"green", MagicBricks:"red", "Housing.com":"blue", "Makaan.com":"yellow", "Walk-in":"grey", Referral:"grey" };

  return (
    <div>
      <PageHead title="Marketing" sub="Manage campaigns, lead sources, and digital marketing spend">
        <Btn onClick={()=>setShowModal(true)}>+ New Campaign</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Active Campaigns" value={list.filter((c) => c.status === "Active").length} colorClass="text-emerald-600" />
        <SummaryStat label="Total Budget" value={`₹${(list.reduce((s,c)=>s+c.budget,0)/1000).toFixed(0)}K`} colorClass="text-red-700" />
        <SummaryStat label="Total Spent" value={`₹${(list.reduce((s,c)=>s+c.spent,0)/1000).toFixed(0)}K`} colorClass="text-orange-600" />
        <SummaryStat label="Total Leads" value={list.reduce((s,c)=>s+c.leads,0)} colorClass="text-blue-600" />
      </div>

      <Tabs tabs={["Campaigns","Lead Source Analysis","WhatsApp Broadcasts","Email Templates"]} active={tab} onChange={setTab} />

      {tab === "Campaigns" && (
        <Card>
          <Table headers={["#","Campaign","Channel","Budget","Spent","Leads","Project","Status","Action"]}>
            {list.map((c,i)=>{
              const roi = c.leads > 0 ? Math.round(c.budget/c.leads) : 0;
              return (
                <TR key={c.id}>
                  <TD className="text-xs text-neutral-400">{i+1}</TD>
                  <TD className="font-semibold text-neutral-900">{c.name}</TD>
                  <TD><Badge color={chColor[c.channel]||"grey"}>{c.channel}</Badge></TD>
                  <TD className="font-semibold text-neutral-900">₹{c.budget.toLocaleString("en-IN")}</TD>
                  <TD className="text-red-700">₹{c.spent.toLocaleString("en-IN")}</TD>
                  <TD className="font-bold text-blue-600">{c.leads}</TD>
                  <TD className="text-xs">{c.project}</TD>
                  <TD><Badge color={c.status==="Active"?"green":"grey"}>{c.status}</Badge></TD>
                  <TD><ActionBtns onEdit={()=>{}} onDelete={()=>setList(l=>l.filter(x=>x.id!==c.id))} /></TD>
                </TR>
              );
            })}
          </Table>
        </Card>
      )}

      {tab === "Lead Source Analysis" && (
        <Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {SOURCES.slice(0,6).map((s,i)=>{
              const leads = [142,87,64,53,98,35][i];
              const conv  = [12,8,6,5,9,4][i];
              return (
                <div key={s} className="rounded-2xl border border-neutral-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge color={chColor[s]||"grey"}>{s}</Badge>
                    <span className="text-xs text-neutral-500">Conv: {conv}%</span>
                  </div>
                  <div className="text-[26px] font-bold text-neutral-900">{leads}</div>
                  <div className="mt-1 text-[11px] text-neutral-500">Total Leads</div>
                  <div className="mt-3 h-1.5 rounded-full bg-neutral-200">
                    <div className="h-full rounded-full bg-[blueviolet]" style={{ width:`${(leads/142)*100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {tab === "WhatsApp Broadcasts" && (
        <Card>
          <div className="mb-4 flex justify-end">
            <Btn size="sm">+ New Broadcast</Btn>
          </div>
          <Table headers={["Date","Title","Recipients","Project","Status","Delivered","Failed"]}>
            {[
              { date:"20 Nov 2025", title:"Kasturi Courtyard – New Launch Offer", recipients:1200, proj:"Kasturi Courtyard", status:"Sent", delivered:1156, failed:44 },
              { date:"15 Nov 2025", title:"Green Valley – Last Few Plots!",       recipients:850,  proj:"Green Valley Phase 2", status:"Sent", delivered:822,  failed:28 },
              { date:"10 Nov 2025", title:"Diwali Special Payment Offer",         recipients:2000, proj:"All Projects",     status:"Sent", delivered:1943, failed:57 },
            ].map((r,i)=>(
              <TR key={i}>
                <TD className="text-xs text-neutral-500">{r.date}</TD>
                <TD className="font-medium text-neutral-900">{r.title}</TD>
                <TD className="font-bold text-neutral-900">{r.recipients}</TD>
                <TD className="text-xs">{r.proj}</TD>
                <TD><Badge color="green">{r.status}</Badge></TD>
                <TD className="font-semibold text-emerald-600">{r.delivered}</TD>
                <TD className="text-red-700">{r.failed}</TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Email Templates" && (
        <Card>
          <div className="grid gap-4 xl:grid-cols-2">
            {["Welcome New Lead","Follow-Up Reminder","Booking Confirmation","Payment Reminder","Site Visit Invitation","Possession Letter"].map(t=>(
              <div key={t} className="flex flex-col gap-4 rounded-2xl border border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-neutral-900">{t}</div>
                  <div className="mt-1 text-[11px] text-neutral-500">Email Template</div>
                </div>
                <div className="flex gap-2">
                  <Btn size="sm" variant="outline">Preview</Btn>
                  <Btn size="sm" variant="outline">Edit</Btn>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showModal && (
        <Modal title="Create New Campaign" onClose={()=>setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Campaign Name *" span={2}><Input placeholder="e.g. Kasturi Nov Launch – FB" value={form.name} onChange={e=>f("name",e.target.value)} /></FG>
            <FG label="Channel"><Select value={form.channel} onChange={e=>f("channel",e.target.value)}>{LEAD_SOURCE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FG>
            <FG label="Project"><Select value={form.project} onChange={e=>f("project",e.target.value)}>{PROJECTS.map(p=><option key={p}>{p}</option>)}</Select></FG>
            <FG label="Budget (₹)"><Input type="number" placeholder="0" value={form.budget} onChange={e=>f("budget",e.target.value)} /></FG>
            <FG label="Start Date"><Input type="date" value={form.start} onChange={e=>f("start",e.target.value)} /></FG>
            <FG label="Notes" span={2}><Textarea placeholder="Campaign objective, target audience..." value={form.notes} onChange={e=>f("notes",e.target.value)} /></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Create Campaign</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
