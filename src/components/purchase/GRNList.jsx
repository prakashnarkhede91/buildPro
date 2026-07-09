import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, RefreshCw, Search, Truck } from "lucide-react";
import { getGRNs, getGRNById, getPurchaseOrders } from "../../lib/purchases";
import { getProjects } from "../../lib/projects";
import { Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, Select, TR, TD, Table } from "../ui";

// Helper to format Date
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

// Helper to format Labels
function formatLabel(value = "") {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export default function GRNList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Search parameters for pre-filtering
  const initialPOFilter = searchParams.get("po_number") || "";

  const [grns, setGrns] = useState([]);
  const [dbProjects, setDbProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Filters state
  const [searchQuery, setSearchQuery] = useState(initialPOFilter);
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal detail view state
  const [selectedGRN, setSelectedGRN] = useState(null);
  const [selectedGRNDetail, setSelectedGRNDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  // PO Chooser state
  const [showPOChooser, setShowPOChooser] = useState(false);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [poError, setPoError] = useState("");

  // Colors for badges
  const sColor = {
    pending: "orange",
    partial: "blue",
    complete: "green",
    approved: "green",
    rejected: "red",
  };

  // Load Projects for filter
  useEffect(() => {
    let active = true;
    async function loadProjects() {
      try {
        const response = await getProjects();
        const data = response?.data || response;
        if (active && Array.isArray(data)) {
          setDbProjects(data);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    loadProjects();
    return () => { active = false; };
  }, []);

  // Fetch GRNs
  useEffect(() => {
    let active = true;
    async function loadGRNs() {
      setLoading(true);
      setError("");
      try {
        const response = await getGRNs();
        if (!active) return;
        
        const dataField = response?.data;
        let loadedGRNs = [];
        
        if (Array.isArray(dataField)) {
          loadedGRNs = dataField;
        } else if (dataField && typeof dataField === "object") {
          if (dataField.id || dataField.grn_number) {
            loadedGRNs = [dataField];
          } else if (Array.isArray(dataField.items)) {
            loadedGRNs = [dataField];
          }
        } else if (Array.isArray(response)) {
          loadedGRNs = response;
        }

        setGrns(loadedGRNs);
      } catch (err) {
        if (!active) return;
        setGrns([]);
        setError(
          err?.response?.data?.error || 
          err?.response?.data?.message || 
          err?.message || 
          "Failed to load Goods Receipt Notes (GRNs)."
        );
      } finally {
        if (active) setLoading(false);
      }
    }
    loadGRNs();
    return () => { active = false; };
  }, [reloadKey]);

  // Filter local records dynamically
  const filteredGRNs = grns.filter((grn) => {
    const query = searchQuery.trim().toLowerCase();
    
    // Search query matching GRN No or PO No
    const matchesSearch = !query || 
      (grn.grn_number || "").toLowerCase().includes(query) ||
      (grn.po_number || "").toLowerCase().includes(query) ||
      (grn.driver_name || "").toLowerCase().includes(query) ||
      (grn.vehicle_number || "").toLowerCase().includes(query);

    // Project filter
    const matchesProject = !projectFilter || 
      String(grn.project_id) === String(projectFilter) ||
      String(grn.project_name || "").toLowerCase() === String(projectFilter).toLowerCase();

    // Status filter
    const matchesStatus = !statusFilter || 
      (grn.status || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesProject && matchesStatus;
  });

  const handleViewDetails = async (grn) => {
    setSelectedGRN(grn);
    setSelectedGRNDetail(null);
    setLoadingDetail(true);
    setDetailError("");
    try {
      const res = await getGRNById(grn.id);
      const detail = res?.data || res;
      if (detail) {
        setSelectedGRNDetail(detail);
      } else {
        setSelectedGRNDetail(grn);
      }
    } catch (err) {
      console.error("Failed to load GRN details:", err);
      setDetailError(
        err?.response?.data?.error || 
        err?.response?.data?.message || 
        err?.message || 
        "Failed to load GRN details."
      );
      setSelectedGRNDetail(grn); // Fallback to list object
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenPOChooser = async () => {
    setShowPOChooser(true);
    setLoadingPOs(true);
    setPoError("");
    try {
      const res = await getPurchaseOrders({ limit: 100 });
      const data = res?.data || res;
      if (Array.isArray(data)) {
        setPurchaseOrders(data);
      } else {
        setPurchaseOrders([]);
      }
    } catch (err) {
      console.error("Failed to load Purchase Orders:", err);
      setPoError(
        err?.response?.data?.error || 
        err?.response?.data?.message || 
        err?.message || 
        "Failed to load Purchase Orders."
      );
    } finally {
      setLoadingPOs(false);
    }
  };

  return (
    <div>
      <PageHead title="Goods Receipt Notes (GRN)" sub="Registry of all materials received at sites against Purchase Orders">
        <div className="flex items-center gap-2">
          <Btn variant="outline" onClick={() => navigate("/purchases/orders")}>
            <ArrowLeft size={16} />
            Back to Orders
          </Btn>
          <Btn onClick={handleOpenPOChooser}>
            <Truck size={16} />
            Record Goods Receipt (GRN)
          </Btn>
          <Btn variant="ghost" onClick={() => setReloadKey((k) => k + 1)}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Btn>
        </div>
      </PageHead>

      {/* Summary Cards */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Truck size={22} />
          </div>
          <div>
            <div className="text-[11px] font-medium text-neutral-500">Total GRN Logs</div>
            <div className="text-xl font-bold text-neutral-900">{filteredGRNs.length} Notes</div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-medium text-neutral-500">Completed Receipts</div>
            <div className="text-xl font-bold text-neutral-900">
              {filteredGRNs.filter((g) => g.status?.toLowerCase() === "complete" || g.status?.toLowerCase() === "approved").length} Logs
            </div>
          </div>
        </Card>
        <Card className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <div className="text-[11px] font-medium text-neutral-500">Pending Actions</div>
            <div className="text-xl font-bold text-neutral-900">
              {filteredGRNs.filter((g) => g.status?.toLowerCase() === "pending").length} Logs
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and List Card */}
      <Card>
        <div className="mb-5 space-y-4">
          <div className="text-sm font-semibold text-neutral-900">Goods Receipt Register</div>

          <div className="grid gap-3 md:grid-cols-3">
            <FG label="Search by GRN, PO No., or Driver/Vehicle">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-neutral-400" />
                <Input
                  className="pl-9"
                  placeholder="e.g. GRN-2026, PO-2026..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </FG>

            <FG label="Filter by Project">
              <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
                <option value="">All Projects</option>
                {dbProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name || p.project_name || p.label}
                  </option>
                ))}
              </Select>
            </FG>

            <FG label="Filter by Status">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="complete">Complete</option>
              </Select>
            </FG>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw size={20} className="animate-spin text-[blueviolet]" />
            <span>Loading receipt notes register...</span>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : filteredGRNs.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            No Goods Receipt Notes (GRN) found matching your search.
          </div>
        ) : (
          <Table headers={["GRN No.", "PO Reference", "Project Site", "Received Date", "Gatekeeper / Receiver", "Vehicle No.", "Status", "Action"]}>
            {filteredGRNs.map((g) => (
              <TR key={g.id}>
                <TD className="text-xs font-semibold text-indigo-600">{g.grn_number || "—"}</TD>
                <TD className="text-xs font-semibold text-blue-600">{g.po_number || "—"}</TD>
                <TD className="font-medium text-neutral-900">{g.project_name || "—"}</TD>
                <TD className="text-xs text-neutral-500">{formatDate(g.received_date)}</TD>
                <TD className="text-xs font-medium">{g.received_by_name || "Gate Officer"}</TD>
                <TD className="text-xs uppercase font-mono text-neutral-600">{g.vehicle_number || "—"}</TD>
                <TD>
                  <Badge color={sColor[(g.status || "").toLowerCase()] || "grey"}>
                    {formatLabel(g.status || "Pending")}
                  </Badge>
                </TD>
                <TD>
                  <button
                    title="View GRN Details"
                    onClick={() => handleViewDetails(g)}
                    className="rounded-xl p-2 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    <Eye size={16} />
                  </button>
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {/* Details Modal */}
      {selectedGRN && (
        <Modal title="Goods Receipt Note (GRN) Details" onClose={() => { setSelectedGRN(null); setSelectedGRNDetail(null); }} width="lg">
          {loadingDetail ? (
            <div className="py-12 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw size={24} className="animate-spin text-[blueviolet]" />
              <span>Fetching dynamic GRN details...</span>
            </div>
          ) : detailError && !selectedGRNDetail ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{detailError}</div>
          ) : !selectedGRNDetail ? (
            <div className="py-10 text-center text-sm text-neutral-500">Failed to load details.</div>
          ) : (
            <div>
              <style>{`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #printable-grn, #printable-grn * {
                    visibility: visible;
                  }
                  #printable-grn {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                }
              `}</style>

              <div className="p-5 border border-neutral-200 bg-white rounded-2xl shadow-sm text-neutral-800" id="printable-grn">
                {/* Header */}
                <div className="flex justify-between border-b border-neutral-200 pb-4 mb-4">
                  <div>
                    <div className="text-lg font-bold text-neutral-900 flex items-center gap-1.5">
                      <span className="text-[blueviolet] font-extrabold text-xl">★</span>
                      <span>ConstructPro</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">Material Inward Gate Entry Registry</div>
                    <div className="text-[10px] text-neutral-500">ConstructPro site log services</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold uppercase tracking-wider text-neutral-955">GOODS RECEIPT NOTE</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      GRN No: <span className="font-semibold text-neutral-800">{selectedGRNDetail.grn_number || "—"}</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      PO Ref: <span className="font-semibold text-neutral-800">{selectedGRNDetail.po_number || "—"}</span>
                    </div>
                    <div className="text-xs text-neutral-500">
                      Log Date: <span className="font-semibold text-neutral-800">{formatDate(selectedGRNDetail.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery and Receiver Info */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Delivery Information</div>
                    <div className="mt-1.5 text-xs grid grid-cols-3 gap-y-1">
                      <span className="text-neutral-500">Driver Name:</span>
                      <span className="col-span-2 font-semibold text-neutral-900">{selectedGRNDetail.driver_name || "—"}</span>
                      
                      <span className="text-neutral-500">Vehicle No:</span>
                      <span className="col-span-2 font-semibold text-neutral-900 uppercase font-mono">{selectedGRNDetail.vehicle_number || "—"}</span>
                      
                      <span className="text-neutral-500">Gate Notes:</span>
                      <span className="col-span-2 text-neutral-600 italic mt-0.5">{selectedGRNDetail.notes || "No extra delivery notes recorded."}</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3.5">
                    <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Gatekeeper Verification</div>
                    <div className="mt-1.5 text-xs grid grid-cols-3 gap-y-1">
                      <span className="text-neutral-500">Project Site:</span>
                      <span className="col-span-2 font-semibold text-neutral-900">{selectedGRNDetail.project_name || "—"}</span>
                      
                      <span className="text-neutral-500">Received By:</span>
                      <span className="col-span-2 font-semibold text-neutral-900">{selectedGRNDetail.received_by_name || "Gatekeeper Officer"}</span>
                      
                      <span className="text-neutral-500">Date Received:</span>
                      <span className="col-span-2 font-semibold text-neutral-900">{formatDate(selectedGRNDetail.received_date)}</span>

                      <span className="text-neutral-500">Status:</span>
                      <span className="col-span-2 font-semibold">
                        <Badge color={sColor[(selectedGRNDetail.status || "").toLowerCase()] || "grey"}>
                          {formatLabel(selectedGRNDetail.status || "Pending")}
                        </Badge>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Received Details */}
                <div className="mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-900 mb-2">Verified Materials Checklist</div>
                  <Table headers={["#", "Material Description / Code", "Ordered Qty", "Received Qty", "Rejected Qty", "Net Accepted", "Rejection Reason"]}>
                    {(selectedGRNDetail.items || []).map((item, idx) => {
                      const ordered = Number(item.ordered_quantity || 0);
                      const received = Number(item.received_quantity || 0);
                      const rejected = Number(item.rejected_quantity || 0);
                      const accepted = Math.max(0, received - rejected);
                      const uom = item.material_uom || "units";

                      return (
                        <TR key={item.id || idx}>
                          <TD className="text-xs text-neutral-400">{idx + 1}</TD>
                          <TD>
                            <div className="font-semibold text-neutral-900">{item.material_name || "Material Item"}</div>
                            <div className="text-[10px] text-neutral-400 mt-0.5">Code: {item.material_code || "N/A"}</div>
                          </TD>
                          <TD className="font-semibold text-neutral-500">{ordered} {uom}</TD>
                          <TD className="font-semibold text-neutral-800">{received} {uom}</TD>
                          <TD className="font-semibold text-red-600">{rejected} {uom}</TD>
                          <TD className="font-extrabold text-[blueviolet]">{accepted} {uom}</TD>
                          <TD className="text-xs text-neutral-500 max-w-[200px] truncate" title={item.rejection_reason}>
                            {item.rejection_reason || "—"}
                          </TD>
                        </TR>
                      );
                    })}
                  </Table>
                </div>

                {/* Declaration */}
                <div className="border-t border-neutral-150 pt-4 flex justify-between text-[11px] text-neutral-400">
                  <span>Verification logs are saved in ConstructPro Material Inward Ledger.</span>
                  <span className="text-right">Authorized Gatekeeper Officer Stamp & Sign</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex justify-end gap-2 border-t border-neutral-100 pt-4">
                <Btn variant="outline" onClick={() => { setSelectedGRN(null); setSelectedGRNDetail(null); }}>Close</Btn>
                <Btn onClick={() => window.print()}>Print Receipt</Btn>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* PO Chooser Modal */}
      {showPOChooser && (
        <Modal title="Select Purchase Order for Inward Gate Entry" onClose={() => setShowPOChooser(false)} width="lg">
          <div className="space-y-4">
            <div className="text-xs text-neutral-500 font-medium">
              Choose a generated Purchase Order to record incoming materials received at the site gate.
            </div>

            {loadingPOs ? (
              <div className="py-10 text-center text-sm text-neutral-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw size={20} className="animate-spin text-[blueviolet]" />
                <span>Fetching Purchase Orders...</span>
              </div>
            ) : poError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{poError}</div>
            ) : purchaseOrders.length === 0 ? (
              <div className="py-10 text-center text-sm text-neutral-500">No active Purchase Orders found.</div>
            ) : (
              <Table headers={["PO No.", "Vendor", "Associated Project", "Order Date", "Status", "Action"]}>
                {purchaseOrders.map((p) => (
                  <TR key={p.id}>
                    <TD className="text-xs font-semibold text-blue-600">{p.po_number || "—"}</TD>
                    <TD className="font-semibold text-neutral-900">{p.vendor_name || "—"}</TD>
                    <TD className="text-xs font-medium">{p.project_name || "—"}</TD>
                    <TD className="text-xs text-neutral-500">{formatDate(p.order_date)}</TD>
                    <TD>
                      <Badge color={p.status?.toLowerCase() === "ordered" || p.status?.toLowerCase() === "received" ? "green" : "orange"}>
                        {formatLabel(p.status)}
                      </Badge>
                    </TD>
                    <TD>
                      <Btn 
                        size="sm" 
                        onClick={() => {
                          setShowPOChooser(false);
                          navigate(`/purchases/orders/${p.id}/grn`);
                        }}
                        className="flex items-center gap-1 bg-[blueviolet] hover:bg-indigo-700 text-white border-none"
                      >
                        <Truck size={12} />
                        Select PO
                      </Btn>
                    </TD>
                  </TR>
                ))}
              </Table>
            )}
            
            <div className="mt-4 flex justify-end">
              <Btn variant="outline" onClick={() => setShowPOChooser(false)}>Cancel</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
