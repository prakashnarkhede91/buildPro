import { useState } from "react";
import { Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, PROJECTS, Select, SummaryStat, Table, Tabs, TR, TD, ActionBtns, summaryGridClass } from "./ui";

const files = [
  { id:1, name:"Kasturi_Courtyard_Approved_Map.pdf",   type:"PDF",  size:"4.2 MB",  project:"Kasturi Courtyard",    category:"Approved Map",    date:"15 Oct 2025", uploadedBy:"Admin" },
  { id:2, name:"Green_Valley_Land_Registry.pdf",        type:"PDF",  size:"2.8 MB",  project:"Green Valley Phase 2",  category:"Legal Document",  date:"20 Sep 2025", uploadedBy:"Admin" },
  { id:3, name:"Sunrise_Heights_Layout_Plan.dwg",       type:"CAD",  size:"12.5 MB", project:"Sunrise Heights",       category:"Layout Plan",     date:"05 Nov 2025", uploadedBy:"Ramesh K." },
  { id:4, name:"Kasturi_Booking_Form_Template.docx",    type:"DOCX", size:"0.3 MB",  project:"Kasturi Courtyard",    category:"Template",        date:"01 Nov 2025", uploadedBy:"Admin" },
  { id:5, name:"Q3_Sales_Report_2025.xlsx",             type:"XLSX", size:"1.1 MB",  project:"All Projects",          category:"Report",          date:"30 Sep 2025", uploadedBy:"Priya D." },
  { id:6, name:"RERA_Certificate_Kasturi.pdf",          type:"PDF",  size:"0.8 MB",  project:"Kasturi Courtyard",    category:"Legal Document",  date:"12 Aug 2025", uploadedBy:"Admin" },
  { id:7, name:"Site_Photo_Nov22_Floor3.jpg",           type:"Image",size:"3.6 MB",  project:"Kasturi Courtyard",    category:"Site Photo",      date:"22 Nov 2025", uploadedBy:"Ramesh K." },
  { id:8, name:"Contractor_Agreement_Mehta.pdf",        type:"PDF",  size:"1.4 MB",  project:"Kasturi Courtyard",    category:"Agreement",       date:"18 Oct 2025", uploadedBy:"Admin" },
];

const typeIcon = {
  PDF:   <span className="text-[10px] font-bold text-red-700">PDF</span>,
  DOCX:  <span className="text-[10px] font-bold text-blue-600">DOC</span>,
  XLSX:  <span className="text-[10px] font-bold text-emerald-600">XLS</span>,
  Image: <span className="text-[10px] font-bold text-orange-600">IMG</span>,
  CAD:   <span className="text-[10px] font-bold text-purple-600">CAD</span>,
};

const typeColor = { PDF:"red", DOCX:"blue", XLSX:"green", Image:"orange", CAD:"purple" };

export default function FileManager() {
  const [tab, setTab]   = useState("All Files");
  const [list, setList] = useState(files);
  const [showModal, setShowModal] = useState(false);
  const [filterCat, setFilterCat] = useState("All");
  const [form, setForm] = useState({ name:"", category:"Approved Map", project:PROJECTS[0], type:"PDF" });
  const f = (k,v) => setForm(p=>({...p,[k]:v}));

  const categories = ["All","Approved Map","Legal Document","Layout Plan","Template","Report","Site Photo","Agreement"];
  const shown = filterCat==="All" ? list : list.filter(x=>x.category===filterCat);

  return (
    <div>
      <PageHead title="File Manager" sub="Centrally manage all project documents, approvals, and media">
        <Btn onClick={()=>setShowModal(true)}>+ Upload File</Btn>
      </PageHead>

      {/* Stats */}
      <div className={summaryGridClass}>
        <SummaryStat label="Total Files" value={list.length} />
        <SummaryStat label="Legal Documents" value={list.filter((file) => file.category === "Legal Document").length} colorClass="text-red-700" />
        <SummaryStat label="Site Photos" value={list.filter((file) => file.category === "Site Photo").length} colorClass="text-blue-600" />
        <SummaryStat label="Total Size" value="26.7 MB" colorClass="text-neutral-500" />
      </div>

      {/* Category filter pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        {categories.map(c=>(
          <button key={c} onClick={()=>setFilterCat(c)} className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${filterCat===c ? "border-red-700 bg-red-50 text-red-700" : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"}`}>{c}</button>
        ))}
      </div>

      <Tabs tabs={["All Files","Project Folders","Recent"]} active={tab} onChange={setTab} />

      {tab === "All Files" && (
        <Card>
          <Table headers={["","File Name","Type","Size","Project","Category","Date","Uploaded By","Action"]}>
            {shown.map((f,i)=>(
              <TR key={f.id}>
                <TD className="w-9">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100">
                    {typeIcon[f.type]||typeIcon.PDF}
                  </div>
                </TD>
                <TD className="max-w-60 font-medium text-neutral-900">{f.name}</TD>
                <TD><Badge color={typeColor[f.type]||"grey"}>{f.type}</Badge></TD>
                <TD className="text-xs text-neutral-500">{f.size}</TD>
                <TD className="text-xs">{f.project}</TD>
                <TD><Badge color="grey">{f.category}</Badge></TD>
                <TD className="text-xs text-neutral-500">{f.date}</TD>
                <TD className="text-xs">{f.uploadedBy}</TD>
                <TD>
                  <div className="flex gap-1.5">
                    <button title="Download" className="rounded-md p-1 text-blue-600 transition hover:bg-blue-50">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <ActionBtns onDelete={()=>setList(l=>l.filter(x=>x.id!==f.id))} />
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Project Folders" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROJECTS.map(p=>{
            const count = list.filter(f=>f.project===p).length;
            return (
              <div key={p} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:border-red-700">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cc0000" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
                </div>
                <div className="text-sm font-semibold text-neutral-900">{p}</div>
                <div className="mt-1 text-xs text-neutral-500">{count} files</div>
              </div>
            );
          })}
          <button className="flex min-h-27.5 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-neutral-300 bg-white p-5 transition hover:border-red-300 hover:bg-red-50/30"
            onClick={()=>setShowModal(true)}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <span className="text-xs text-neutral-400">Upload New File</span>
          </button>
        </div>
      )}

      {tab === "Recent" && (
        <Card>
          <div className="flex flex-col gap-3">
            {[...list].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,6).map(f=>(
              <div key={f.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-100 px-3.5 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  {typeIcon[f.type]||typeIcon.PDF}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px] font-medium text-neutral-900">{f.name}</div>
                  <div className="mt-1 text-[11px] text-neutral-500">{f.project} · {f.size} · {f.date}</div>
                </div>
                <Badge color={typeColor[f.type]||"grey"}>{f.type}</Badge>
                <button title="Download" className="rounded-md p-1 text-blue-600 transition hover:bg-blue-50">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {showModal && (
        <Modal title="Upload File" onClose={()=>setShowModal(false)}>
          {/* Dropzone */}
          <div className="mb-4 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 px-5 py-8 text-center">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" className="mx-auto mb-2 block"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div className="text-[13px] text-neutral-500">Drag & drop or <span className="cursor-pointer font-semibold text-red-700">browse</span> to upload</div>
            <div className="mt-1.5 text-[11px] text-neutral-400">PDF, DOCX, XLSX, JPG, PNG, DWG — Max 50 MB</div>
          </div>
          <FormGrid cols={2}>
            <FG label="File Name"><Input placeholder="Document name" value={form.name} onChange={e=>f("name",e.target.value)} /></FG>
            <FG label="File Type"><Select value={form.type} onChange={e=>f("type",e.target.value)}><option>PDF</option><option>DOCX</option><option>XLSX</option><option>Image</option><option>CAD</option><option>Other</option></Select></FG>
            <FG label="Category"><Select value={form.category} onChange={e=>f("category",e.target.value)}><option>Approved Map</option><option>Legal Document</option><option>Layout Plan</option><option>Template</option><option>Report</option><option>Site Photo</option><option>Agreement</option></Select></FG>
            <FG label="Project"><Select value={form.project} onChange={e=>f("project",e.target.value)}>{[...PROJECTS,"All Projects"].map(p=><option key={p}>{p}</option>)}</Select></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={()=>setShowModal(false)}>Cancel</Btn>
            <Btn onClick={()=>setShowModal(false)}>Upload</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
