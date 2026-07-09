import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionBtns, Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, PROJECTS, Select, SummaryStat, TR, TD, Table, Tabs, Textarea, summaryGridClass } from "./ui";
import { PURCHASE_STATUS, PURCHASE_STATUS_OPTIONS } from "../lib/enums";
import { getPurchaseOrders, getPurchaseOrderById } from "../lib/purchases";
import { getProjects } from "../lib/projects";
import { getVendors } from "../lib/vendors";

const sColor = {
  draft: "grey",
  pending_approval: "orange",
  approved: "green",
  rejected: "red",
  ordered: "blue",
  received: "green",
  invoiced: "blue",
  delivered: "green",
  pending: "orange",
  transit: "blue",
  cancelled: "red",
};

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function formatLabel(value = "") {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatStatus(value = "") {
  if (!value) return "—";
  return formatLabel(value);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

export default function Purchases() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("Purchase Orders");
  const [pos, setPOs] = useState([]);
  const [manuallyAddedPOs, setManuallyAddedPOs] = useState([]);
  const [dbProjects, setDbProjects] = useState([]);
  const [dbVendors, setDbVendors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ po: "", vendor: "", item: "", amount: "", project: PROJECTS[0], date: "", status: PURCHASE_STATUS.PENDING_APPROVAL, notes: "" });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoicePO, setInvoicePO] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handleGenerateInvoice = async (po) => {
    setInvoicePO(null);
    setLoadingInvoice(true);
    setShowInvoiceModal(true);
    try {
      const poRes = await getPurchaseOrderById(po.id);
      const fullPO = poRes?.data || poRes;
      if (fullPO) {
        setInvoicePO(fullPO);
      } else {
        setInvoicePO(po);
      }
    } catch (err) {
      console.error("Error generating invoice:", err);
      setInvoicePO(po);
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Load Projects and Vendors for selects/filters
  useEffect(() => {
    let active = true;
    async function loadResources() {
      try {
        const projRes = await getProjects();
        if (active) setDbProjects(getItems(projRes));
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
      try {
        const vendRes = await getVendors();
        if (active) setDbVendors(getItems(vendRes));
      } catch (err) {
        console.error("Failed to load vendors:", err);
      }
    }
    loadResources();
    return () => { active = false; };
  }, []);

  // Fetch Purchase Orders
  useEffect(() => {
    let active = true;
    async function loadPOs() {
      setLoading(true);
      setError("");
      try {
        const response = await getPurchaseOrders({
          page,
          limit: 10,
          status: statusFilter || undefined,
          project_id: projectFilter || undefined,
        });
        if (!active) return;
        setPOs(getItems(response));
        setPagination(response?.pagination || {
          total: response?.total ?? getItems(response).length,
          page: response?.page ?? page,
          limit: response?.limit ?? 10,
          totalPages: response?.totalPages ?? 1
        });
      } catch (err) {
        if (!active) return;
        setPOs([]);
        setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load purchase orders.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadPOs();
    return () => { active = false; };
  }, [page, statusFilter, projectFilter, reloadKey]);

  const save = () => {
    if (!form.vendor || !form.item) return;
    const newPO = {
      id: Date.now().toString(),
      po_number: "PO-2026-0" + (60 + manuallyAddedPOs.length + pos.length),
      vendor_name: form.vendor,
      notes: form.item,
      total_amount: Number(form.amount) || 0,
      project_name: form.project,
      order_date: form.date || new Date().toISOString(),
      delivery_date: form.date || new Date().toISOString(),
      status: form.status,
    };
    setManuallyAddedPOs(p => [newPO, ...p]);
    setShowModal(false);
    setForm({ po: "", vendor: "", item: "", amount: "", project: PROJECTS[0], date: "", status: PURCHASE_STATUS.PENDING_APPROVAL, notes: "" });
  };

  const vendors = ["Mehta Cement Store", "Steel King Traders", "Bhopal Brick Works", "Sharma Sand Suppliers", "R.K. Hardware", "Gupta Paints", "Marble Palace Tiles"];

  // Merge loaded POs with locally added ones for listing
  const mergedPOs = [...manuallyAddedPOs, ...pos];

  // Dynamic Summary Stats calculations
  const totalCount = pagination.total + manuallyAddedPOs.length;
  
  const receivedCount = mergedPOs.filter(
    (p) => p.status?.toLowerCase() === "received" || p.status?.toLowerCase() === "delivered" || p.status?.toLowerCase() === "approved"
  ).length;

  const pendingCount = mergedPOs.filter(
    (p) => p.status?.toLowerCase() === "pending_approval" || p.status?.toLowerCase() === "ordered" || p.status?.toLowerCase() === "pending"
  ).length;

  const totalValueSum = mergedPOs.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
  const totalValueStr = totalValueSum >= 100000 
    ? `₹${(totalValueSum / 100000).toFixed(1)}L` 
    : `₹${(totalValueSum / 1000).toFixed(0)}K`;

  return (
    <div>
      <PageHead title="Purchases" sub="Manage purchase orders, vendors, and invoices">
        <div className="flex gap-2">
          <Btn variant="outline" onClick={() => navigate("/purchases/grn")}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            Goods Receipt Notes (GRN)
          </Btn>
          <Btn onClick={() => navigate("/purchases/create")}>+ New Purchase Order</Btn>
        </div>
      </PageHead>

      {/* Summary */}
      <div className={summaryGridClass}>
        <SummaryStat label="Total POs" value={totalCount} />
        <SummaryStat label="Received / Approved" value={receivedCount} colorClass="text-emerald-600" />
        <SummaryStat label="Pending" value={pendingCount} colorClass="text-orange-600" />
        <SummaryStat label="Total Value" value={totalValueStr} colorClass="text-red-700" />
      </div>

      <Tabs tabs={["Purchase Orders", "Vendors", "Invoices"]} active={tab} onChange={setTab} />

      {tab === "Purchase Orders" && (
        <Card>
          <div className="mb-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-neutral-900">Purchase Orders ({pagination.total})</span>
              <Btn size="sm" variant="ghost" onClick={() => setReloadKey(k => k + 1)}>Refresh List</Btn>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <FG label="Filter by Status">
                <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                  <option value="">All statuses</option>
                  {PURCHASE_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </FG>

              <FG label="Filter by Project">
                <Select value={projectFilter} onChange={(e) => { setProjectFilter(e.target.value); setPage(1); }}>
                  <option value="">All projects</option>
                  {dbProjects.map((proj) => (
                    <option key={proj.id} value={proj.id}>{proj.name || proj.project_name || proj.label}</option>
                  ))}
                </Select>
              </FG>

              <FG label="Page Summary">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                  Page {pagination.page} of {pagination.totalPages || 1} · {pos.length} records on page
                </div>
              </FG>
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-neutral-500">Loading purchase orders...</div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          ) : mergedPOs.length === 0 ? (
            <div className="py-10 text-center text-sm text-neutral-500">No purchase orders found.</div>
          ) : (
            <>
              <Table headers={["PO No.", "Vendor", "Project", "Amount", "Order Date", "Delivery Date", "Status", "Action"]}>
                {mergedPOs.map((p, i) => (
                  <TR key={p.id}>
                    <TD className="text-xs font-semibold text-blue-600">{p.po_number || "—"}</TD>
                    <TD className="font-medium text-neutral-900">{p.vendor_name || "—"}</TD>
                    <TD className="text-xs">{p.project_name || "—"}</TD>
                    <TD className="font-bold text-neutral-900">₹{p.total_amount ? Number(p.total_amount).toLocaleString("en-IN") : "0"}</TD>
                    <TD className="text-xs text-neutral-500">{formatDate(p.order_date)}</TD>
                    <TD className="text-xs text-neutral-500">{formatDate(p.delivery_date)}</TD>
                    <TD><Badge color={sColor[p.status?.toLowerCase()] || "grey"}>{formatStatus(p.status)}</Badge></TD>
                    <TD>
                      <div className="flex items-center gap-2">
                        <button
                          title="View GRNs"
                          onClick={() => navigate(`/purchases/grn?po_number=${p.po_number || ""}`)}
                          className="rounded-xl p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button
                          title="Generate Invoice Copy"
                          onClick={() => handleGenerateInvoice(p)}
                          className="rounded-xl p-2 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                          </svg>
                        </button>
                        <ActionBtns onEdit={() => navigate(`/purchases/${p.id}/edit`)} onDelete={() => {
                          if (manuallyAddedPOs.some(m => m.id === p.id)) {
                            setManuallyAddedPOs(ps => ps.filter(x => x.id !== p.id));
                          } else {
                            setPOs(ps => ps.filter(x => x.id !== p.id));
                          }
                        }} />
                      </div>
                    </TD>
                  </TR>
                ))}
              </Table>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-neutral-500">
                  Showing page {pagination.page} of {pagination.totalPages || 1} · Total {pagination.total} purchase orders
                </div>
                <div className="flex items-center gap-2">
                  <Btn variant="outline" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1}>
                    Previous
                  </Btn>
                  <Btn variant="outline" onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages || 1))} disabled={page >= (pagination.totalPages || 1)}>
                    Next
                  </Btn>
                </div>
              </div>
            </>
          )}
        </Card>
      )}



      {tab === "Vendors" && (
        <Card>
          <Table headers={["#", "Vendor Name", "Contact", "Mobile", "Category", "City", "Status", "Action"]}>
            {vendors.map((v, i) => (
              <TR key={i}>
                <TD className="text-xs text-neutral-400">{i + 1}</TD>
                <TD className="font-semibold text-neutral-900">{v}</TD>
                <TD className="text-xs text-neutral-500">Owner</TD>
                <TD className="text-blue-600">98765{String(i).padStart(5, "0")}</TD>
                <TD><Badge color="blue">{["Cement", "Steel", "Masonry", "Sand", "Hardware", "Paints", "Tiles"][i]}</Badge></TD>
                <TD>Bhopal</TD>
                <TD><Badge color="green">Active</Badge></TD>
                <TD><ActionBtns onEdit={() => { }} onDelete={() => { }} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {tab === "Invoices" && (
        <Card>
          <Table headers={["Invoice No.", "PO Ref", "Vendor", "Amount", "GRN", "Date", "Status", "Action"]}>
            {[
              { inv: "INV-2025-089", po: "PO-2025-055", vendor: "Mehta Cement", amt: 175000, grn: "GRN-055", date: "20 Nov 2025", status: "Paid" },
              { inv: "INV-2025-088", po: "PO-2025-053", vendor: "Steel King", amt: 195000, grn: "GRN-053", date: "19 Nov 2025", status: "Pending" },
              { inv: "INV-2025-087", po: "PO-2025-051", vendor: "R.K. Hardware", amt: 44000, grn: "GRN-051", date: "18 Nov 2025", status: "Paid" },
            ].map((inv, i) => (
              <TR key={i}>
                <TD className="text-xs font-semibold text-blue-600">{inv.inv}</TD>
                <TD className="text-xs text-neutral-500">{inv.po}</TD>
                <TD>{inv.vendor}</TD>
                <TD className="font-bold text-neutral-900">₹{inv.amt.toLocaleString("en-IN")}</TD>
                <TD className="text-xs">{inv.grn}</TD>
                <TD className="text-xs text-neutral-500">{inv.date}</TD>
                <TD><Badge color={inv.status === "Paid" ? "green" : "orange"}>{inv.status}</Badge></TD>
                <TD><ActionBtns onEdit={() => { }} onDelete={() => { }} /></TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {showModal && (
        <Modal title="New Purchase Order" onClose={() => setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Vendor Name *">
              <Select value={form.vendor} onChange={e => f("vendor", e.target.value)}>
                <option value="">Select vendor</option>
                {dbVendors.length > 0 ? (
                  dbVendors.map(v => <option key={v.id} value={v.name}>{v.name}</option>)
                ) : (
                  vendors.map(v => <option key={v} value={v}>{v}</option>)
                )}
              </Select>
            </FG>
            <FG label="Project">
              <Select value={form.project} onChange={e => f("project", e.target.value)}>
                {dbProjects.length > 0 ? (
                  dbProjects.map(p => <option key={p.id} value={p.name || p.project_name || p.label}>{p.name || p.project_name || p.label}</option>)
                ) : (
                  PROJECTS.map(p => <option key={p} value={p}>{p}</option>)
                )}
              </Select>
            </FG>
            <FG label="Item / Material *" span={2}><Input placeholder="e.g. Cement – 500 bags" value={form.item} onChange={e => f("item", e.target.value)} /></FG>
            <FG label="Amount (₹)"><Input type="number" placeholder="0" value={form.amount} onChange={e => f("amount", e.target.value)} /></FG>
            <FG label="Expected Date"><Input type="date" value={form.date} onChange={e => f("date", e.target.value)} /></FG>
            <FG label="Status"><Select value={form.status} onChange={e => f("status", e.target.value)}>{PURCHASE_STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FG>
            <FG label="Notes"><Textarea placeholder="Additional notes..." value={form.notes} onChange={e => f("notes", e.target.value)} /></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Create PO</Btn>
          </div>
        </Modal>
      )}

      {showInvoiceModal && (
        <Modal title="Invoice Copy Preview" onClose={() => setShowInvoiceModal(false)} width="lg">
          {loadingInvoice ? (
            <div className="py-10 text-center text-sm text-neutral-500">Generating proper invoice copy...</div>
          ) : !invoicePO ? (
            <div className="py-10 text-center text-sm text-red-700">Failed to load invoice details.</div>
          ) : (
            <div>
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-invoice, #printable-invoice * {
                    visibility: visible;
                  }
                  #printable-invoice {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }
              `}</style>
              
              <div className="p-5 border border-neutral-200 bg-white rounded-2xl shadow-sm text-neutral-800" id="printable-invoice">
                {/* Header */}
                <div className="flex justify-between border-b border-neutral-200 pb-5 mb-5">
                  <div>
                    <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5">
                      <span className="text-[blueviolet] font-extrabold text-xl">★</span>
                      <span>ConstructPro</span>
                      {/* <span className="text-neutral-400 font-normal">| </span> */}
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">Plot No. 12, Commercial Zone, Nashik, MH - 462001</div>
                    <div className="text-[11px] text-neutral-500">GSTIN: 23AAAAA1111A1Z1</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold uppercase tracking-wider text-neutral-950">TAX INVOICE</div>
                    <div className="text-xs text-neutral-500 mt-1">Invoice No: <span className="font-semibold text-neutral-800">INV-{invoicePO.po_number?.replace("PO-", "") || Date.now()}</span></div>
                    <div className="text-xs text-neutral-500">Date: <span className="font-semibold text-neutral-800">{formatDate(new Date())}</span></div>
                    <div className="text-xs text-neutral-500">PO Ref: <span className="font-semibold text-neutral-800">{invoicePO.po_number || "—"}</span></div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-2 gap-5 mb-5">
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Vendor Billing Details</div>
                    <div className="mt-2 font-bold text-neutral-900">{invoicePO.vendor_name || "ABC Suppliers"}</div>
                    <div className="text-xs text-neutral-600 mt-1">Vendor Reference: {invoicePO.vendor_id ? `VND-${invoicePO.vendor_id.slice(0, 8)}...` : "N/A"}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">Bhopal Division</div>
                  </div>
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Delivery / Project Site</div>
                    <div className="mt-2 font-bold text-neutral-900">{invoicePO.project_name || "Luxury Villas Phase 1"}</div>
                    <div className="text-xs text-neutral-600 mt-1">{invoicePO.delivery_address || "123 Construction Site, Building A"}</div>
                    <div className="text-xs text-neutral-500 mt-0.5">Expected Delivery: {formatDate(invoicePO.delivery_date)}</div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Invoice Line Items</div>
                  <Table headers={["#", "Material / Item Description", "Qty", "Unit Price (₹)", "GST %", "Taxable Amt", "GST Amt", "Line Total (₹)"]}>
                    {invoicePO.items && invoicePO.items.length > 0 ? (
                      invoicePO.items.map((item, idx) => {
                        const qty = Number(item.quantity || 0);
                        const price = Number(item.unit_price || 0);
                        const lineTotal = qty * price;
                        const gstPct = Number(item.gst_percent || 0);
                        const lineGst = lineTotal * (gstPct / 100);
                        const netTotal = lineTotal + lineGst;
                        
                        return (
                          <TR key={item.id || idx}>
                            <TD className="text-xs text-neutral-400">{idx + 1}</TD>
                            <TD>
                              <div className="font-semibold text-neutral-900">{item.description || "Material Line Item"}</div>
                              {item.material_name && <div className="text-[10px] text-neutral-400">{item.material_name}</div>}
                            </TD>
                            <TD className="font-medium">{qty}</TD>
                            <TD>₹{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                            <TD className="text-xs text-neutral-500">{gstPct}%</TD>
                            <TD>₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                            <TD className="text-xs text-neutral-500">₹{lineGst.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                            <TD className="font-bold text-neutral-955">₹{netTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                          </TR>
                        );
                      })
                    ) : (
                      <TR>
                        <TD className="text-xs text-neutral-400">1</TD>
                        <TD>
                          <div className="font-semibold text-neutral-900">{invoicePO.notes || "PO Material Delivery"}</div>
                        </TD>
                        <TD className="font-medium">1</TD>
                        <TD>₹{Number(invoicePO.subtotal || invoicePO.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                        <TD className="text-xs text-neutral-500">18%</TD>
                        <TD>₹{Number(invoicePO.subtotal || invoicePO.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                        <TD className="text-xs text-neutral-500">₹{Number(invoicePO.gst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                        <TD className="font-bold text-neutral-955">₹{Number(invoicePO.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                      </TR>
                    )}
                  </Table>
                </div>

                {/* Amount Totals */}
                <div className="flex justify-end mb-6">
                  <div className="w-80 space-y-2 border-t border-neutral-100 pt-3">
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>Taxable Value (Subtotal)</span>
                      <span className="font-semibold text-neutral-900">₹{Number(invoicePO.subtotal || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-xs text-neutral-600">
                      <span>CGST + SGST (GST Amount)</span>
                      <span className="font-semibold text-neutral-900">₹{Number(invoicePO.gst_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm">
                      <span className="font-bold text-neutral-955">Grand Total (Net)</span>
                      <span className="font-bold text-[blueviolet]">₹{Number(invoicePO.total_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Footnote / Terms */}
                <div className="grid grid-cols-2 gap-5 border-t border-neutral-150 pt-4 text-xs text-neutral-500">
                  <div>
                    <div className="font-bold uppercase text-[9px] tracking-wider text-neutral-400">Payment Terms</div>
                    <div className="mt-1">{invoicePO.terms || "Net 30 days"}</div>
                  </div>
                  <div>
                    <div className="font-bold uppercase text-[9px] tracking-wider text-neutral-400">Notes & Declaration</div>
                    <div className="mt-1">{invoicePO.notes || "This is a computer generated copy and does not require signature."}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-2 border-t border-neutral-100 pt-4">
                <Btn variant="outline" onClick={() => setShowInvoiceModal(false)}>Close</Btn>
                <Btn onClick={() => window.print()}>Print Invoice Copy</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

