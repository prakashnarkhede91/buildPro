import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPurchaseRequisitions } from "../../lib/purchases";
import { getProjects } from "../../lib/projects";
import { ActionBtns, Badge, Btn, Card, ConfirmModal, FG, FormGrid, Input, Modal, PageHead, PROJECTS, Select, SummaryStat, TR, TD, Table, Textarea, summaryGridClass } from "../ui";
import { approvePurchaseRequisition, getPurchaseRequisitionById, rejectPurchaseRequisition } from "../../lib/purchases";

const statusColor = {
  approved: "green",
  pending: "orange",
  rejected: "red"
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

export default function PurchaseRequisitions() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [reqs, setReqs] = useState([]);
  const [manuallyAddedReqs, setManuallyAddedReqs] = useState([]);
  const [dbProjects, setDbProjects] = useState([]);
  
  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [form, setForm] = useState({ by: "", notes: "", proj: PROJECTS[0], date: new Date().toISOString().slice(0, 10) });
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const [approvalTarget, setApprovalTarget] = useState(null);
  const [approving, setApproving] = useState(false);
  const [approvalError, setApprovalError] = useState("");

  const [rejectionTarget, setRejectionTarget] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectionError, setRejectionError] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleViewClick = async (r) => {
    setViewTarget(null);
    setLoadingDetail(true);
    setShowViewModal(true);
    try {
      const res = await getPurchaseRequisitionById(r.id);
      const detail = res?.data || res;
      if (detail) {
        setViewTarget(detail);
      } else {
        setViewTarget(r);
      }
    } catch (err) {
      console.error("Error loading requisition detail:", err);
      setViewTarget(r);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleApproveClick = (r) => {
    setApprovalTarget(r);
    setApprovalError("");
    setApproving(false);
  };

  const confirmApproval = async () => {
    if (!approvalTarget?.id) return;
    setApproving(true);
    setApprovalError("");
    try {
      if (manuallyAddedReqs.some(m => m.id === approvalTarget.id)) {
        setManuallyAddedReqs(curr => curr.map(x => x.id === approvalTarget.id ? { ...x, status: "approved" } : x));
      } else {
        await approvePurchaseRequisition(approvalTarget.id);
        setReloadKey(k => k + 1);
      }
      setApprovalTarget(null);
    } catch (err) {
      setApprovalError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to approve purchase requisition.");
    } finally {
      setApproving(false);
    }
  };

  const handleRejectClick = (r) => {
    setRejectionTarget(r);
    setRejectionError("");
    setRejecting(false);
  };

  const confirmRejection = async () => {
    if (!rejectionTarget?.id) return;
    setRejecting(true);
    setRejectionError("");
    try {
      if (manuallyAddedReqs.some(m => m.id === rejectionTarget.id)) {
        setManuallyAddedReqs(curr => curr.map(x => x.id === rejectionTarget.id ? { ...x, status: "rejected" } : x));
      } else {
        await rejectPurchaseRequisition(rejectionTarget.id);
        setReloadKey(k => k + 1);
      }
      setRejectionTarget(null);
    } catch (err) {
      setRejectionError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to reject purchase requisition.");
    } finally {
      setRejecting(false);
    }
  };

  // Load Projects for dynamic filters
  useEffect(() => {
    let active = true;
    async function loadProjects() {
      try {
        const res = await getProjects();
        if (active) setDbProjects(getItems(res));
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    loadProjects();
    return () => { active = false; };
  }, []);

  // Fetch Purchase Requisitions
  useEffect(() => {
    let active = true;
    async function loadReqs() {
      setLoading(true);
      setError("");
      try {
        const response = await getPurchaseRequisitions({
          page,
          limit: 10,
          status: statusFilter || undefined,
          project_id: projectFilter || undefined,
        });
        if (!active) return;
        setReqs(getItems(response));
        const meta = response?.meta || response?.pagination;
        setPagination({
          total: meta?.total ?? getItems(response).length,
          page: meta?.page ?? page,
          limit: meta?.limit ?? 10,
          totalPages: meta?.totalPages ?? 1
        });
      } catch (err) {
        if (!active) return;
        setReqs([]);
        setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load purchase requisitions.");
      } finally {
        if (active) setLoading(false);
      }
    }
    loadReqs();
    return () => { active = false; };
  }, [page, statusFilter, projectFilter, reloadKey]);

  const save = () => {
    if (!form.by || !form.notes) return;
    const newReq = {
      id: Date.now().toString(),
      pr_number: "PR-202606-0" + (92 + manuallyAddedReqs.length + reqs.length),
      requested_by_name: form.by,
      notes: form.notes,
      project_name: form.proj,
      required_date: form.date,
      status: "pending"
    };
    setManuallyAddedReqs(curr => [newReq, ...curr]);
    setShowModal(false);
    setForm({ by: "", notes: "", proj: PROJECTS[0], date: new Date().toISOString().slice(0, 10) });
  };

  const mergedReqs = [...manuallyAddedReqs, ...reqs];

  // Dynamic Statistics
  const totalCount = pagination.total + manuallyAddedReqs.length;

  const approvedCount = mergedReqs.filter(
    (r) => r.status?.toLowerCase() === "approved"
  ).length;

  const pendingCount = mergedReqs.filter(
    (r) => r.status?.toLowerCase() === "pending"
  ).length;

  const rejectedCount = mergedReqs.filter(
    (r) => r.status?.toLowerCase() === "rejected"
  ).length;

  return (
    <div>
      <PageHead title="Purchase Requisitions" sub="Review and approve material issue and purchase requisitions from site engineers.">
        <Btn onClick={() => navigate("/purchases/requisitions/create")}>+ New Requisition</Btn>
      </PageHead>

      {/* Summary Stats */}
      <div className={summaryGridClass}>
        <SummaryStat label="Total Requisitions" value={totalCount} />
        <SummaryStat label="Approved" value={approvedCount} colorClass="text-emerald-600" />
        <SummaryStat label="Pending Approval" value={pendingCount} colorClass="text-orange-600" />
        <SummaryStat label="Rejected" value={rejectedCount} colorClass="text-red-700" />
      </div>

      <Card>
        <div className="mb-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-neutral-900">Requisitions Checklist ({pagination.total})</span>
            <Btn size="sm" variant="ghost" onClick={() => setReloadKey(k => k + 1)}>Refresh List</Btn>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <FG label="Filter by Status">
              <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
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
                Page {pagination.page} of {pagination.totalPages || 1} · {reqs.length} records on page
              </div>
            </FG>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading purchase requisitions...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : mergedReqs.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-500">No purchase requisitions found.</div>
        ) : (
          <>
            <Table headers={["PR No.", "Requested By", "Notes / Purpose", "Project", "Required Date", "Status", "Action"]}>
              {mergedReqs.map((r) => (
                <TR key={r.id}>
                  <TD className="text-xs font-semibold text-blue-600">{r.pr_number || "—"}</TD>
                  <TD className="font-medium text-neutral-900">{r.requested_by_name || "—"}</TD>
                  <TD className="font-semibold text-neutral-800">{r.notes || "—"}</TD>
                  <TD className="text-xs">{r.project_name || "—"}</TD>
                  <TD className="text-xs text-neutral-500">{formatDate(r.required_date)}</TD>
                  <TD><Badge color={statusColor[r.status?.toLowerCase()] || "grey"}>{formatStatus(r.status)}</Badge></TD>
                  <TD>
                    <div className="flex items-center gap-1.5">
                      <button
                        title="View Requisition Details"
                        onClick={() => handleViewClick(r)}
                        className="rounded-xl p-2 text-sky-600 hover:bg-sky-50 hover:text-sky-700 transition"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      {(r.status?.toLowerCase() !== "approved" && r.status?.toLowerCase() !== "rejected") && (
                        <>
                          <Btn size="sm" variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100" onClick={() => handleApproveClick(r)}>Approve</Btn>
                          <Btn size="sm" variant="outline" className="text-red-700 border-red-200 bg-red-50 hover:bg-red-100" onClick={() => handleRejectClick(r)}>Reject</Btn>
                        </>
                      )}
                      <ActionBtns onDelete={() => {
                        if (manuallyAddedReqs.some(m => m.id === r.id)) {
                          setManuallyAddedReqs(curr => curr.filter(x => x.id !== r.id));
                        } else {
                          setReqs(curr => curr.filter(x => x.id !== r.id));
                        }
                      }} />
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-500">
                Showing page {pagination.page} of {pagination.totalPages || 1} · Total {pagination.total} purchase requisitions
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

      {showModal && (
        <Modal title="Create Purchase Requisition" onClose={() => setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Requested By *">
              <Input placeholder="e.g. Ramesh K. (Site Engineer)" value={form.by} onChange={e => f("by", e.target.value)} />
            </FG>
            <FG label="Project *">
              <Select value={form.proj} onChange={e => f("proj", e.target.value)}>
                {dbProjects.length > 0 ? (
                  dbProjects.map(p => <option key={p.id} value={p.name || p.project_name || p.label}>{p.name || p.project_name || p.label}</option>)
                ) : (
                  PROJECTS.map(p => <option key={p} value={p}>{p}</option>)
                )}
              </Select>
            </FG>
            <FG label="Material Details / Purpose *" span={2}>
              <Textarea placeholder="e.g. Need Cement OPC 53 - 500 bags for casting slab" value={form.notes} onChange={e => f("notes", e.target.value)} />
            </FG>
            <FG label="Required Date *">
              <Input type="date" value={form.date} onChange={e => f("date", e.target.value)} />
            </FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={save}>Create Request</Btn>
          </div>
        </Modal>
      )}

      {approvalTarget && (
        <ConfirmModal
          title="Approve Purchase Requisition"
          message={`Are you sure you want to approve purchase requisition ${approvalTarget.pr_number || "this PR"}?`}
          confirmText={approving ? "Approving..." : "Approve"}
          confirmClassName="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 focus:ring-emerald-250"
          onConfirm={confirmApproval}
          onClose={() => setApprovalTarget(null)}
          loading={approving}
        >
          {approvalError && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {approvalError}
            </div>
          )}
        </ConfirmModal>
      )}

      {rejectionTarget && (
        <ConfirmModal
          title="Reject Purchase Requisition"
          message={`Are you sure you want to reject purchase requisition ${rejectionTarget.pr_number || "this PR"}?`}
          confirmText={rejecting ? "Rejecting..." : "Reject"}
          confirmClassName="bg-red-700 hover:bg-red-800 text-white border-red-700 focus:ring-red-250"
          onConfirm={confirmRejection}
          onClose={() => setRejectionTarget(null)}
          loading={rejecting}
        >
          {rejectionError && (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              {rejectionError}
            </div>
          )}
        </ConfirmModal>
      )}

      {showViewModal && (
        <Modal title="Purchase Requisition Details" onClose={() => setShowViewModal(false)} width="lg">
          {loadingDetail ? (
            <div className="py-10 text-center text-sm text-neutral-500">Loading requisition details...</div>
          ) : !viewTarget ? (
            <div className="py-10 text-center text-sm text-red-700">Failed to load requisition details.</div>
          ) : (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="flex justify-between border-b border-neutral-100 pb-4">
                <div>
                  <div className="text-base font-bold text-neutral-900">{viewTarget.pr_number || "PR Request"}</div>
                  <div className="text-xs text-neutral-500 mt-1">Requested on: {formatDate(viewTarget.created_at || new Date())}</div>
                </div>
                <div>
                  <Badge color={statusColor[viewTarget.status?.toLowerCase()] || "grey"}>{formatStatus(viewTarget.status)}</Badge>
                </div>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 p-4 text-xs">
                <div>
                  <div className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Project Info</div>
                  <div className="mt-1 font-bold text-neutral-900">{viewTarget.project_name || "—"}</div>
                  {viewTarget.project_id && (
                    <div className="text-[9px] text-neutral-400 font-mono mt-0.5 select-all">Project ID: {viewTarget.project_id}</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Requested By</div>
                  <div className="mt-1 font-bold text-neutral-900">{viewTarget.requested_by_name || "—"}</div>
                  {viewTarget.requested_by && (
                    <div className="text-[9px] text-neutral-400 font-mono mt-0.5 select-all">User ID: {viewTarget.requested_by}</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Required Procurement Date</div>
                  <div className="mt-1 font-bold text-neutral-900">{formatDate(viewTarget.required_date)}</div>
                </div>
                <div>
                  <div className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Requisition System ID</div>
                  <div className="mt-1 font-bold font-mono text-neutral-900 select-all text-[11px]">{viewTarget.id || "—"}</div>
                </div>
                {(viewTarget.approved_by || viewTarget.approved_by_name) && (
                  <div>
                    <div className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Approved By</div>
                    <div className="mt-1 font-bold text-neutral-900">{viewTarget.approved_by_name || viewTarget.approved_by}</div>
                    {viewTarget.approved_at && (
                      <div className="text-[10px] text-neutral-500 mt-0.5">at {formatDate(viewTarget.approved_at)}</div>
                    )}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">Audit Timestamps</div>
                  <div className="mt-1 space-y-0.5 text-[11px] text-neutral-700">
                    <div><span className="text-neutral-400">Created:</span> {viewTarget.created_at ? new Date(viewTarget.created_at).toLocaleString("en-IN") : "—"}</div>
                    <div><span className="text-neutral-400">Updated:</span> {viewTarget.updated_at ? new Date(viewTarget.updated_at).toLocaleString("en-IN") : "—"}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">Requisition Notes / Purpose</div>
                <div className="rounded-xl border border-neutral-100 p-3 text-xs bg-white text-neutral-700 min-h-12 leading-relaxed">
                  {viewTarget.notes || "No additional notes provided."}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-2">Requested Material Items List</div>
                <Table headers={["#", "Material Name / Code / ID", "Description / Line ID", "Qty Required", "UoM", "Estimated Cost"]}>
                  {viewTarget.items && viewTarget.items.length > 0 ? (
                    viewTarget.items.map((item, idx) => {
                      const qty = Number(item.quantity || 0);
                      const cost = Number(item.estimated_cost || 0);
                      return (
                        <TR key={item.id || idx}>
                          <TD className="text-xs text-neutral-400">{idx + 1}</TD>
                          <TD>
                            <div className="font-semibold text-neutral-900">{item.material_name || "Material Item"}</div>
                            {item.material_code && <div className="text-[10px] text-neutral-500">Code: {item.material_code}</div>}
                            {item.material_id && <div className="text-[9px] text-neutral-400 font-mono mt-0.5 select-all">Mat ID: {item.material_id}</div>}
                          </TD>
                          <TD className="text-xs text-neutral-500">
                            <div>{item.description || "—"}</div>
                            {item.id && <div className="text-[9px] text-neutral-400 font-mono mt-0.5 select-all">Item ID: {item.id}</div>}
                          </TD>
                          <TD className="font-medium">{qty}</TD>
                          <TD className="text-xs text-neutral-500">{item.unit_of_measure || item.material_uom || "Units"}</TD>
                          <TD className="font-bold text-neutral-900">₹{cost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</TD>
                        </TR>
                      );
                    })
                  ) : (
                    <TR>
                      <TD colSpan={6} className="text-center py-4 text-neutral-500">No specific line items attached to this requisition request.</TD>
                    </TR>
                  )}
                </Table>
              </div>

              {/* Total Summary */}
              {viewTarget.items && viewTarget.items.length > 0 && (
                <div className="flex justify-end pt-2 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500 flex items-center gap-2">
                    <span>Aggregated Requisition Estimate:</span>
                    <span className="font-bold text-[blueviolet] text-sm">
                      ₹{viewTarget.items.reduce((s, i) => s + Number(i.estimated_cost || 0), 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex justify-end gap-2 border-t border-neutral-100 pt-4 mt-6">
                <Btn variant="outline" onClick={() => setShowViewModal(false)}>Close</Btn>
                {viewTarget.status?.toLowerCase() === "pending" && (
                  <>
                    <Btn className="bg-red-700 hover:bg-red-800 text-white border-red-700" onClick={() => {
                      setShowViewModal(false);
                      handleRejectClick(viewTarget);
                    }}>Reject Requisition</Btn>
                    <Btn className="bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600" onClick={() => {
                      setShowViewModal(false);
                      handleApproveClick(viewTarget);
                    }}>Approve Requisition</Btn>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
