import { useState } from "react";
import { Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, Select, SummaryStat, Tabs, summaryGridClass } from "./ui";
import { USER_ROLE_OPTIONS } from "../lib/enums";

const tools = [
  { id:1,  name:"WhatsApp Integration",   desc:"Auto-send messages to leads and customers",       status:"Active",   category:"Communication", icon:"💬" },
  { id:2,  name:"Email Notifications",    desc:"Automated email alerts for follow-ups and payments", status:"Active", category:"Communication", icon:"📧" },
  { id:3,  name:"SMS Gateway",            desc:"Send SMS reminders for payments and visits",        status:"Inactive",category:"Communication", icon:"📱" },
  { id:4,  name:"Google Maps",            desc:"Embed project location maps in brochures",          status:"Active",  category:"Maps",          icon:"🗺️" },
  { id:5,  name:"Facebook Lead Ads",      desc:"Auto-import leads from Facebook campaigns",        status:"Active",   category:"Marketing",     icon:"📘" },
  { id:6,  name:"99acres API",            desc:"Sync property listings with 99acres portal",        status:"Active",  category:"Marketing",     icon:"🏠" },
  { id:7,  name:"MagicBricks API",        desc:"Auto-update listings on MagicBricks",              status:"Inactive",category:"Marketing",     icon:"✨" },
  { id:8,  name:"Housing.com API",        desc:"Sync with Housing.com real estate portal",         status:"Inactive",category:"Marketing",     icon:"🏡" },
  { id:9,  name:"Tally Sync",             desc:"Export accounting data to Tally ERP",              status:"Inactive",category:"Accounting",    icon:"📊" },
  { id:10, name:"DPR Mobile App",         desc:"Field team daily progress reporting app",          status:"Active",  category:"Site",          icon:"📲" },
  { id:11, name:"Digital Signature",      desc:"e-Sign booking forms and agreements",              status:"Active",  category:"Legal",         icon:"✍️" },
  { id:12, name:"Cloud Backup",           desc:"Automatic daily backup of all project data",       status:"Active",  category:"System",        icon:"☁️" },
];

const users = [
  { id:1, name:"Pushpraj Tiwari", role:"Sales Executive", email:"pushpraj@easycolonizer.in", access:["Sales","CRM","Reports"],            status:"Active" },
  { id:2, name:"Aman Verma",      role:"Sales Executive", email:"aman@easycolonizer.in",     access:["Sales","CRM"],                       status:"Active" },
  { id:3, name:"Kumar Singh",     role:"Sales Manager",   email:"kumar@easycolonizer.in",    access:["Sales","CRM","Reports","HR"],         status:"Active" },
  { id:4, name:"Ramesh Keshari",  role:"Site Engineer",   email:"ramesh@easycolonizer.in",   access:["Site Progress","Construction","DPR"], status:"Active" },
  { id:5, name:"Priya Dubey",     role:"Accountant",      email:"priya@easycolonizer.in",    access:["Account","Reports","Purchases"],      status:"Active" },
  { id:6, name:"Admin",           role:"Administrator",   email:"admin@easycolonizer.in",    access:["All Modules"],                        status:"Active" },
];

export default function ManageTools() {
  const [tab, setTab]   = useState("Integrations");
  const [list, setList] = useState(tools);
  const [showModal, setShowModal] = useState(false);

  const toggle = (id) => setList(l=>l.map(t=>t.id===id?{...t, status:t.status==="Active"?"Inactive":"Active"}:t));
  const notificationDotClass = { Payment:"bg-blue-600", Lead:"bg-emerald-600", Site:"bg-orange-600", Stock:"bg-[blueviolet]", Purchase:"bg-purple-600", Report:"bg-neutral-500" };

  return (
    <div>
      <PageHead title="Manage Tools" sub="Enable integrations, manage user access and system settings">
        <Btn onClick={()=>setShowModal(true)}>+ Add User</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Active Tools" value={list.filter((tool) => tool.status === "Active").length} colorClass="text-emerald-600" />
        <SummaryStat label="Inactive Tools" value={list.filter((tool) => tool.status === "Inactive").length} colorClass="text-neutral-500" />
        <SummaryStat label="Total Users" value={users.length} colorClass="text-blue-600" />
        <SummaryStat label="System Health" value="98.5%" colorClass="text-emerald-600" />
      </div>

      <Tabs tabs={["Integrations","User Access","System Settings","Notifications"]} active={tab} onChange={setTab} />

      {tab === "Integrations" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map(t=>(
            <div key={t.id} className={`rounded-2xl border bg-white p-5 shadow-sm ${t.status === "Active" ? "border-emerald-200" : "border-neutral-200"}`}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-[22px]">{t.icon}</span>
                  <div>
                    <div className="text-[13px] font-semibold text-neutral-900">{t.name}</div>
                    <Badge color="grey">{t.category}</Badge>
                  </div>
                </div>
                <button onClick={()=>toggle(t.id)} className={`relative mt-0.5 h-5 w-10 shrink-0 rounded-full transition ${t.status === "Active" ? "bg-[blueviolet]" : "bg-neutral-300"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${t.status === "Active" ? "left-5" : "left-0.5"}`} />
                </button>
              </div>
              <p className="text-xs leading-5 text-neutral-500">{t.desc}</p>
              <div className="mt-3">
                <Badge color={t.status==="Active"?"green":"grey"}>{t.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "User Access" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="border-b border-neutral-200">
                  {["#","Name","Role","Email","Module Access","Status","Action"].map(h=>(
                    <th key={h} className="px-3.5 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={u.id} className="border-b border-neutral-100">
                    <td className="px-3.5 py-3 text-[13px] text-neutral-400">{i+1}</td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-red-50 text-[11px] font-bold text-red-700">{u.name.charAt(0)}</div>
                        <span className="text-[13px] font-semibold text-neutral-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-3"><Badge color="blue">{u.role}</Badge></td>
                    <td className="px-3.5 py-3 text-xs text-blue-600">{u.email}</td>
                    <td className="px-3.5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.access.map(a=><span key={a} className="rounded-md bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">{a}</span>)}
                      </div>
                    </td>
                    <td className="px-3.5 py-3"><Badge color="green">{u.status}</Badge></td>
                    <td className="px-3.5 py-3">
                      <button className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs text-neutral-600 transition hover:bg-neutral-50">Edit Access</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {tab === "System Settings" && (
        <div className="grid gap-4 xl:grid-cols-2">
          {[
            {
              title:"General Settings",
              fields:[
                { label:"Company Name", value:"ConstructPro Pvt. Ltd." },
                { label:"Primary Language", value:"English" },
                { label:"Date Format", value:"DD MMM YYYY" },
                { label:"Currency", value:"INR (₹)" },
                { label:"Timezone", value:"IST (UTC+5:30)" },
              ]
            },
            {
              title:"Notification Settings",
              fields:[
                { label:"Payment Due Reminder", value:"3 days before" },
                { label:"Follow-Up Reminder", value:"1 day before" },
                { label:"Low Stock Alert", value:"When stock < minimum" },
                { label:"DPR Submission Reminder", value:"Daily at 7:00 PM" },
                { label:"Monthly Report Email", value:"1st of every month" },
              ]
            }
          ].map(sec=>(
            <Card key={sec.title}>
              <div className="mb-4 text-sm font-semibold text-neutral-900">{sec.title}</div>
              {sec.fields.map(field=>(
                <div key={field.label} className="flex flex-col gap-2 border-b border-neutral-100 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-[13px] text-neutral-600">{field.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium text-neutral-900">{field.value}</span>
                    <button className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-[11px] text-neutral-500 transition hover:bg-neutral-50">Edit</button>
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {tab === "Notifications" && (
        <Card>
          <div className="flex flex-col gap-3">
            {[
              { time:"22 Nov 2025 – 10:30 AM", msg:"Payment reminder sent to Ram Patel for ₹6,75,000 (Stage 4)",  type:"Payment",   read:false },
              { time:"22 Nov 2025 – 09:15 AM", msg:"New lead added: Deepak Verma from Facebook campaign",           type:"Lead",      read:false },
              { time:"21 Nov 2025 – 06:45 PM", msg:"DPR submitted by Ramesh K. for Kasturi Courtyard",              type:"Site",      read:true  },
              { time:"21 Nov 2025 – 03:00 PM", msg:"Low stock alert: Cement at Kasturi Courtyard below minimum",    type:"Stock",     read:true  },
              { time:"20 Nov 2025 – 11:00 AM", msg:"Purchase Order PO-2025-058 approved and sent to vendor",        type:"Purchase",  read:true  },
              { time:"19 Nov 2025 – 09:00 AM", msg:"Monthly report generated for October 2025 – view in Reports",   type:"Report",    read:true  },
            ].map((n,i)=>{
              return (
                <div key={i} className={`flex gap-3 rounded-xl border px-3.5 py-3 ${n.read ? "border-neutral-100 bg-white" : "border-red-100 bg-red-50/50"}`}>
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notificationDotClass[n.type]}`} />
                  <div className="flex-1">
                    <div className={`text-[13px] ${n.read ? "text-neutral-600" : "font-medium text-neutral-900"}`}>{n.msg}</div>
                    <div className="mt-1 text-[11px] text-neutral-400">{n.time}</div>
                  </div>
                  <Badge color={n.read?"grey":"red"}>{n.type}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {showModal && (
        <Modal title="Add New User" onClose={()=>setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Full Name *"><Input placeholder="e.g. Ravi Sharma" /></FG>
            <FG label="Mobile"><Input placeholder="10-digit mobile" /></FG>
            <FG label="Email *"><Input type="email" placeholder="user@easycolonizer.in" /></FG>
            <FG label="Role"><Select>{USER_ROLE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FG>
            <FG label="Department"><Select><option>Sales</option><option>Site</option><option>Marketing</option><option>Accounts</option><option>Admin</option></Select></FG>
            <FG label="Module Access"><Select><option>Sales Only</option><option>Site Only</option><option>Accounts Only</option><option>All Modules</option></Select></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn>
            <Btn onClick={()=>setShowModal(false)}>Create User</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
