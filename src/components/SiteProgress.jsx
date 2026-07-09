import { useState } from "react";
import { ActionBtns, Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, Progress, PROJECTS, Select, SummaryStat, TR, TD, Table, Tabs, summaryGridClass } from "./ui";
import { TASK_STATUS, TASK_STATUS_OPTIONS } from "../lib/enums";

const tasks = [
  { id:1, task:"Foundation & Excavation",   site:"Kasturi Courtyard",    contractor:"Mehta & Sons",        start:"01 Oct 2025", end:"20 Oct 2025", pct:100, status:"Completed", priority:"High" },
  { id:2, task:"Column & RCC Work",         site:"Kasturi Courtyard",    contractor:"Patel Constructions", start:"21 Oct 2025", end:"30 Nov 2025", pct:78,  status:"In Progress",priority:"High" },
  { id:3, task:"Brick Masonry – Floor 1",   site:"Kasturi Courtyard",    contractor:"Sharma Works",        start:"01 Dec 2025", end:"20 Dec 2025", pct:45,  status:"In Progress",priority:"Medium" },
  { id:4, task:"Electrical Conduit Work",   site:"Kasturi Courtyard",    contractor:"R.K. Electricals",   start:"15 Dec 2025", end:"10 Jan 2026", pct:20,  status:"In Progress",priority:"Medium" },
  { id:5, task:"Boundary Wall",             site:"Green Valley Phase 2", contractor:"Gupta Construction", start:"01 Nov 2025", end:"15 Nov 2025", pct:100, status:"Completed",  priority:"Low" },
  { id:6, task:"Plumbing Rough-in",         site:"Sunrise Heights",      contractor:"Singh Plumbers",      start:"01 Jan 2026", end:"31 Jan 2026", pct:0,   status:"Pending",    priority:"Medium" },
];

const dprs = [
  { date:"22 Nov 2025", site:"Kasturi Courtyard",    workers:42, material:"Cement: 80 bags, Steel: 2 ton", work:"RCC column shuttering 3rd floor", supervisor:"Ramesh K.", photos:"Uploaded" },
  { date:"21 Nov 2025", site:"Kasturi Courtyard",    workers:38, material:"Cement: 60 bags, Bricks: 2000", work:"Brick masonry 2nd floor", supervisor:"Ramesh K.", photos:"Uploaded" },
  { date:"22 Nov 2025", site:"Green Valley Phase 2", workers:25, material:"Sand: 10 ton, Cement: 40 bags", work:"Boundary wall plaster completion", supervisor:"Vikram S.", photos:"Uploaded" },
  { date:"21 Nov 2025", site:"Sunrise Heights",      workers:18, material:"Steel: 1 ton, Cement: 30 bags", work:"Foundation excavation", supervisor:"Anil P.", photos:"Missing" },
];

const sColor = { completed:"green", in_progress:"blue", pending:"grey", overdue:"red", cancelled:"red" };
const pColor = { High:"red", Medium:"orange", Low:"grey" };

export default function SiteProgress() {
  const [tab, setTab] = useState("Task Schedule");
  const [taskList, setTaskList] = useState(tasks);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ task:"", site:PROJECTS[0], contractor:"", start:"", end:"", pct:"0", status: TASK_STATUS.PENDING, priority:"Medium" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const save = () => {
    if (!form.task) return;
    setTaskList(p=>[...p, { id:Date.now(), ...form, pct:+form.pct }]);
    setShowModal(false);
    setForm({ task:"", site:PROJECTS[0], contractor:"", start:"", end:"", pct:"0", status: TASK_STATUS.PENDING, priority:"Medium" });
  };

  return (
    <div>
      <PageHead title="Site Progress" sub="Track construction tasks, DPR, and milestone completion">
        <Btn onClick={()=>setShowModal(true)}>+ Add Task</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Tasks" value={taskList.length} />
        <SummaryStat label="Completed" value={taskList.filter((t) => t.status === "Completed").length} colorClass="text-emerald-600" />
        <SummaryStat label="In Progress" value={taskList.filter((t) => t.status === "In Progress").length} colorClass="text-blue-600" />
        <SummaryStat label="Pending" value={taskList.filter((t) => t.status === "Pending").length} colorClass="text-neutral-500" />
      </div>

      <Tabs tabs={["Task Schedule","Daily Progress Report","Milestones"]} active={tab} onChange={setTab} />

      {tab === "Task Schedule" && (
        <Card>
          <Table headers={["#","Task","Site","Contractor","Start","End","Progress","Priority","Status","Action"]}>
            {taskList.map((t,i)=>(
              <TR key={t.id}>
                <TD className="text-xs text-neutral-400">{i+1}</TD>
                <TD className="max-w-40 font-semibold text-neutral-900">{t.task}</TD>
                <TD className="text-xs text-neutral-600">{t.site}</TD>
                <TD className="text-xs">{t.contractor}</TD>
                <TD className="text-xs text-neutral-500">{t.start}</TD>
                <TD className="text-xs text-neutral-500">{t.end}</TD>
                <TD className="min-w-28">
                  <div className="flex items-center gap-2">
                    <Progress pct={t.pct} color={t.pct===100?"#16a34a":t.pct>50?"#2563eb":"#ea580c"} />
                    <span className="text-[11px] font-semibold">{t.pct}%</span>
                  </div>
                </TD>
                <TD><Badge color={pColor[t.priority]||"grey"}>{t.priority}</Badge></TD>
                <TD><Badge color={sColor[t.status]||"grey"}>{t.status}</Badge></TD>
                <TD><ActionBtns onEdit={()=>{}} onDelete={()=>setTaskList(ts=>ts.filter(x=>x.id!==t.id))} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Daily Progress Report" && (
        <Card>
          <div className="mb-4 flex justify-end">
            <Btn size="sm">+ Submit DPR</Btn>
          </div>
          <Table headers={["Date","Site","Workers","Material Used","Work Done","Supervisor","Photos"]}>
            {dprs.map((r,i)=>(
              <TR key={i}>
                <TD className="font-medium text-neutral-900">{r.date}</TD>
                <TD className="text-xs text-neutral-600">{r.site}</TD>
                <TD className="font-bold text-neutral-900">{r.workers}</TD>
                <TD className="max-w-50 text-xs">{r.material}</TD>
                <TD className="max-w-50 text-xs">{r.work}</TD>
                <TD>{r.supervisor}</TD>
                <TD><Badge color={r.photos==="Uploaded"?"green":"red"}>{r.photos}</Badge></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Milestones" && (
        <Card>
          <div className="flex flex-col gap-4">
            {[
              { name:"Land Acquisition & Approval",   done:true,  date:"Jan 2024" },
              { name:"Foundation Completion",          done:true,  date:"Oct 2025" },
              { name:"Slab – Floor 1 & 2",            done:true,  date:"Nov 2025" },
              { name:"Brick Work – All Floors",        done:false, date:"Dec 2025" },
              { name:"Plaster & Flooring",             done:false, date:"Feb 2026" },
              { name:"Electrical & Plumbing Finish",   done:false, date:"Mar 2026" },
              { name:"Painting & Interior",            done:false, date:"Apr 2026" },
              { name:"Possession",                     done:false, date:"Jun 2026" },
            ].map((m,i)=>(
              <div key={i} className={`flex flex-wrap items-center gap-3 rounded-xl border px-4 py-3 ${m.done ? "border-emerald-200 bg-emerald-50" : "border-neutral-200 bg-white"}`}>
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.done ? "bg-emerald-600" : "bg-neutral-200"}`}>
                  {m.done ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span className="text-[10px] font-bold text-neutral-400">{i+1}</span>}
                </div>
                <div className={`min-w-0 flex-1 ${m.done ? "font-semibold text-emerald-600" : "text-neutral-600"}`}>{m.name}</div>
                <div className="text-xs text-neutral-500">{m.date}</div>
                <Badge color={m.done?"green":"grey"}>{m.done?"Done":"Upcoming"}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showModal && (
        <Modal title="Add Construction Task" onClose={()=>setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Task Name *" span={2}><Input placeholder="e.g. Brick Masonry – Floor 2" value={form.task} onChange={e=>f("task",e.target.value)} /></FG>
            <FG label="Site / Project"><Select value={form.site} onChange={e=>f("site",e.target.value)}>{PROJECTS.map(p=><option key={p}>{p}</option>)}</Select></FG>
            <FG label="Contractor"><Input placeholder="Contractor name" value={form.contractor} onChange={e=>f("contractor",e.target.value)} /></FG>
            <FG label="Start Date"><Input type="date" value={form.start} onChange={e=>f("start",e.target.value)} /></FG>
            <FG label="End Date"><Input type="date" value={form.end} onChange={e=>f("end",e.target.value)} /></FG>
            <FG label="Priority"><Select value={form.priority} onChange={e=>f("priority",e.target.value)}><option>High</option><option>Medium</option><option>Low</option></Select></FG>
            <FG label="Status"><Select value={form.status} onChange={e=>f("status",e.target.value)}>{TASK_STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Save Task</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
