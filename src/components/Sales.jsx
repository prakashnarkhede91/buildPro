import { useState } from "react";
import { ActionBtns, AGENTS, Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, PROJECTS, Select, Table, Tabs, Textarea, TR, TD } from "./ui";

const SOURCES = ["Facebook","Instagram","99acres","Makaan.com","Housing.com","MagicBricks","Walk-in","Referral"];

const initLeads = [
  { id:1,  name:"Ankit Sharma",   mobile:"9755408189", email:"ankit@gmail.com",    source:"Facebook",    project:"Kasturi Courtyard",  agent:"Pushpraj", status:"Follow-Up",  date:"22 Nov 2025", budget:"₹35L–₹45L", score:85 },
  { id:2,  name:"Ram Patel",      mobile:"8085134821", email:"ram.p@yahoo.com",    source:"99acres",     project:"Kasturi Courtyard",  agent:"Aman",     status:"Negotiation",date:"20 Nov 2025", budget:"₹50L–₹60L", score:92 },
  { id:3,  name:"Keshav Singh",   mobile:"8103950632", email:"keshav@hotmail.com", source:"MagicBricks", project:"Green Valley Phase 2",agent:"Pushpraj", status:"New",        date:"19 Nov 2025", budget:"₹25L–₹30L", score:60 },
  { id:4,  name:"Brijesh Gurjar", mobile:"7898711782", email:"brijesh@gmail.com",  source:"Walk-in",     project:"Sunrise Heights",    agent:"Aman",     status:"Booked",     date:"18 Nov 2025", budget:"₹70L–₹80L", score:98 },
  { id:5,  name:"Adarsh Kumar",   mobile:"9993157262", email:"adarsh@gmail.com",   source:"Housing.com", project:"Royal Palms",        agent:"Kumar",    status:"Lost",       date:"15 Nov 2025", budget:"₹40L–₹50L", score:30 },
  { id:6,  name:"Prashant Mishra",mobile:"7354982165", email:"prashant@gmail.com", source:"Instagram",   project:"City Square",        agent:"Pushpraj", status:"Follow-Up",  date:"14 Nov 2025", budget:"₹20L–₹25L", score:70 },
  { id:7,  name:"Deepak Verma",   mobile:"9876543210", email:"deepak@gmail.com",   source:"Referral",    project:"Kasturi Courtyard",  agent:"Ravi",     status:"New",        date:"13 Nov 2025", budget:"₹55L–₹65L", score:75 },
  { id:8,  name:"Neha Joshi",     mobile:"9012345678", email:"neha.j@gmail.com",   source:"Makaan.com",  project:"Green Valley Phase 2",agent:"Sneha",    status:"Negotiation",date:"12 Nov 2025", budget:"₹30L–₹35L", score:88 },
];

const sColor = { "Follow-Up":"blue","Negotiation":"orange","New":"grey","Booked":"green","Lost":"red" };
const scoreColorClass = { "#16a34a":"bg-emerald-600 text-emerald-600", "#ea580c":"bg-orange-600 text-orange-600", "#cc0000":"bg-[blueviolet] text-red-700" };
const statusTileClass = {
  All: { base:"border-blue-600", active:"bg-blue-600", muted:"text-blue-600" },
  New: { base:"border-neutral-300", active:"bg-neutral-500", muted:"text-neutral-500" },
  "Follow-Up": { base:"border-blue-600", active:"bg-blue-600", muted:"text-blue-600" },
  Negotiation: { base:"border-orange-600", active:"bg-orange-600", muted:"text-orange-600" },
  Booked: { base:"border-emerald-600", active:"bg-emerald-600", muted:"text-emerald-600" },
  Lost: { base:"border-red-700", active:"bg-[blueviolet]", muted:"text-red-700" },
};

function ScoreBar({ v }) {
  const c = v>=80?"#16a34a":v>=50?"#ea580c":"#cc0000";
  const colorClass = scoreColorClass[c];
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-neutral-200">
        <div className={`h-full rounded-full ${colorClass.split(" ")[0]}`} style={{ width:`${v}%` }} />
      </div>
      <span className={`text-[11px] font-bold ${colorClass.split(" ")[1]}`}>{v}</span>
    </div>
  );
}

export default function Sales() {
  const [tab, setTab]   = useState("All Leads");
  const [leads, setLeads] = useState(initLeads);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name:"", mobile:"", email:"", source:"Facebook", project:PROJECTS[0], agent:AGENTS[0], budget:"", notes:"" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const statuses = ["All","New","Follow-Up","Negotiation","Booked","Lost"];
  const counts   = Object.fromEntries(statuses.map(s=>[s, s==="All"?leads.length:leads.filter(l=>l.status===s).length]));
  const shown    = filter==="All" ? leads : leads.filter(l=>l.status===filter);

  const save = () => {
    if (!form.name||!form.mobile) return;
    setLeads(p=>[{ id:Date.now(), ...form, status:"New", date:new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}), score:Math.floor(Math.random()*40)+50 }, ...p]);
    setShowModal(false);
    setForm({ name:"", mobile:"", email:"", source:"Facebook", project:PROJECTS[0], agent:AGENTS[0], budget:"", notes:"" });
  };

  return (
    <div>
      <PageHead title="Sales – Lead Tracking & CRM" sub="All enquiries from Facebook, Instagram, 99acres, MagicBricks and more">
        <Btn onClick={()=>setShowModal(true)}>+ Add Lead</Btn>
      </PageHead>

      {/* Status filter pills */}
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {statuses.map(s=>{
          const active = filter===s;
          const palette = statusTileClass[s];
          return (
            <button key={s} onClick={()=>setFilter(s)} className={`rounded-2xl border px-4 py-3 text-center shadow-sm transition ${active ? `${palette.active} ${palette.base} text-white` : `bg-white ${palette.base} ${palette.muted}`}`}>
              <div className={`text-[11px] font-semibold capitalize ${active ? "text-white/85" : ""}`}>{s}</div>
              <div className="text-2xl font-bold leading-tight">{counts[s]}</div>
            </button>
          );
        })}
      </div>

      <Tabs tabs={["All Leads","Sales Pipeline","Bookings","Follow-Up Schedule"]} active={tab} onChange={setTab} />

      {tab === "All Leads" && (
        <Card>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-neutral-900">Leads ({shown.length})</span>
            <div className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 sm:max-w-55">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input placeholder="Search leads..." className="w-full border-none bg-transparent text-xs text-neutral-700 outline-none" />
            </div>
          </div>
          <Table headers={["#","Customer","Mobile","Source","Project","Budget","Assigned","Score","Status","Action"]}>
            {shown.map((l,i)=>(
              <TR key={l.id}>
                <TD className="text-xs text-neutral-400">{i+1}</TD>
                <TD>
                  <div className="font-semibold text-neutral-900">{l.name}</div>
                  <div className="text-[11px] text-neutral-500">{l.email}</div>
                </TD>
                <TD className="font-medium text-blue-600">{l.mobile}</TD>
                <TD><Badge color="grey">{l.source}</Badge></TD>
                <TD className="text-xs">{l.project}</TD>
                <TD className="text-xs text-neutral-600">{l.budget}</TD>
                <TD>{l.agent}</TD>
                <TD><ScoreBar v={l.score} /></TD>
                <TD><Badge color={sColor[l.status]||"grey"}>{l.status}</Badge></TD>
                <TD><ActionBtns onWhatsApp={()=>{}} onEdit={()=>{}} onDelete={()=>setLeads(ls=>ls.filter(x=>x.id!==l.id))} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Sales Pipeline" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {["New","Follow-Up","Negotiation","Booked","Lost"].map(st=>(
            <div key={st} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex justify-between">
                <Badge color={sColor[st]||"grey"}>{st}</Badge>
                <span className="text-base font-bold text-neutral-900">{leads.filter(l=>l.status===st).length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {leads.filter(l=>l.status===st).map(l=>(
                  <div key={l.id} className="rounded-xl border border-neutral-100 p-3">
                    <div className="text-xs font-semibold text-neutral-900">{l.name}</div>
                    <div className="mt-1 text-[11px] text-neutral-500">{l.project}</div>
                    <div className="mt-1 text-[11px] text-neutral-600">{l.budget}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Bookings" && (
        <Card>
          <Table headers={["#","Customer","Unit","Project","Total Amount","Paid","Pending","Booking Date","Action"]}>
            {leads.filter(l=>l.status==="Booked").map((l,i)=>(
              <TR key={l.id}>
                <TD className="text-neutral-400">{i+1}</TD>
                <TD className="font-semibold text-neutral-900">{l.name}</TD>
                <TD><Badge color="blue">A{i+3}</Badge></TD>
                <TD className="text-xs">{l.project}</TD>
                <TD className="font-bold text-neutral-900">₹45,00,000</TD>
                <TD className="font-semibold text-emerald-600">₹9,00,000</TD>
                <TD className="text-red-700">₹36,00,000</TD>
                <TD className="text-xs text-neutral-500">{l.date}</TD>
                <TD><ActionBtns onEdit={()=>{}} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Follow-Up Schedule" && (
        <Card>
          <Table headers={["Date","Customer","Mobile","Project","Agent","Type","Notes","Action"]}>
            {leads.filter(l=>l.status==="Follow-Up").map((l,i)=>(
              <TR key={l.id}>
                <TD className="text-xs text-neutral-500">{l.date}</TD>
                <TD className="font-semibold text-neutral-900">{l.name}</TD>
                <TD className="text-blue-600">{l.mobile}</TD>
                <TD className="text-xs">{l.project}</TD>
                <TD>{l.agent}</TD>
                <TD><Badge color="blue">Call</Badge></TD>
                <TD className="text-xs text-neutral-500">Discuss plot options</TD>
                <TD><ActionBtns onWhatsApp={()=>{}} onEdit={()=>{}} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {showModal && (
        <Modal title="Add New Lead" onClose={()=>setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Full Name *"><Input placeholder="e.g. Rahul Sharma" value={form.name} onChange={e=>f("name",e.target.value)} /></FG>
            <FG label="Mobile No *"><Input placeholder="10-digit number" value={form.mobile} onChange={e=>f("mobile",e.target.value)} /></FG>
            <FG label="Email"><Input type="email" placeholder="email@example.com" value={form.email} onChange={e=>f("email",e.target.value)} /></FG>
            <FG label="Lead Source"><Select value={form.source} onChange={e=>f("source",e.target.value)}>{SOURCES.map(s=><option key={s}>{s}</option>)}</Select></FG>
            <FG label="Project Interest"><Select value={form.project} onChange={e=>f("project",e.target.value)}>{PROJECTS.map(p=><option key={p}>{p}</option>)}</Select></FG>
            <FG label="Assign To"><Select value={form.agent} onChange={e=>f("agent",e.target.value)}>{AGENTS.map(a=><option key={a}>{a}</option>)}</Select></FG>
            <FG label="Budget Range" span={2}><Input placeholder="e.g. ₹35L–₹45L" value={form.budget} onChange={e=>f("budget",e.target.value)} /></FG>
            <FG label="Notes" span={2}><Textarea placeholder="Any additional details about this lead..." value={form.notes} onChange={e=>f("notes",e.target.value)} /></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save Lead</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
