import { useEffect, useState, useMemo } from "react";
import { getInvestors, getInvestments, createInvestment } from "../../lib/investors";
import { getProjects } from "../../lib/projects";
import {
  Badge,
  Btn,
  Card,
  FG,
  FormGrid,
  Input,
  PageHead,
  Table,
  TD,
  TR,
  Textarea,
  Select,
  SummaryStat,
  summaryGridClass,
} from "../ui";
import { Search, Plus, Calendar, DollarSign, CreditCard, FileText } from "lucide-react";

const INITIAL_FORM = {
  investor_id: "",
  project_id: "",
  amount: "",
  investment_date: new Date().toISOString().split("T")[0],
  payment_mode: "bank_transfer",
  bank_reference: "",
  notes: "",
};

function RightDrawer({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/30 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-full w-full flex-col border-l border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <div>
              <div className="text-lg font-bold text-neutral-900">{title}</div>
              {subtitle && <div className="mt-1 text-xs text-neutral-500">{subtitle}</div>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-500 transition hover:bg-neutral-200"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

function formatCurrency(amount) {
  const num = Number(amount);
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

const getModeColor = (mode) => {
  switch (mode) {
    case "bank_transfer": return "blue";
    case "upi": return "green";
    case "cheque": return "purple";
    case "cash": return "orange";
    default: return "grey";
  }
};

const getModeLabel = (mode) => {
  switch (mode) {
    case "bank_transfer": return "Bank Transfer";
    case "upi": return "UPI";
    case "cheque": return "Cheque";
    case "cash": return "Cash";
    default: return mode || "—";
  }
};

export default function AccountCapitalInvestment() {
  const [investments, setInvestments] = useState([]);
  const [investors, setInvestors] = useState([]);
  const [projects, setProjects] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Drawer & Form States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(INITIAL_FORM);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadInvestments = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getInvestments();
      if (Array.isArray(response)) {
        setInvestments(response);
      } else if (response && Array.isArray(response.data)) {
        setInvestments(response.data);
      } else {
        setInvestments([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load capital investments.");
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDropdownFilters = async () => {
    try {
      const invRes = await getInvestors();
      if (Array.isArray(invRes)) {
        setInvestors(invRes);
      } else if (invRes && Array.isArray(invRes.data)) {
        setInvestors(invRes.data);
      }

      const projRes = await getProjects();
      if (Array.isArray(projRes)) {
        setProjects(projRes);
      } else if (projRes && Array.isArray(projRes.data)) {
        setProjects(projRes.data);
      }
    } catch (err) {
      console.error("Failed to load drop-down lists", err);
    }
  };

  useEffect(() => {
    loadInvestments();
    loadDropdownFilters();
  }, []);

  const openCreateDrawer = () => {
    setForm({
      ...INITIAL_FORM,
      investor_id: investors[0]?.id || investors[0]?._id || "",
      project_id: projects[0]?.id || projects[0]?._id || "",
    });
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.investor_id) {
      setFormError("Please select an Investor.");
      return;
    }
    const parsedAmount = Number(form.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Amount must be a positive number.");
      return;
    }
    if (!form.payment_mode) {
      setFormError("Please select a Payment Mode.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      project_id: form.project_id || null,
      amount: parsedAmount,
      investment_date: form.investment_date || null,
      payment_mode: form.payment_mode,
      bank_reference: form.bank_reference.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      await createInvestment(form.investor_id, payload);
      setDrawerOpen(false);
      setForm(INITIAL_FORM);
      loadInvestments();
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to record capital investment.");
    } finally {
      setSubmitting(false);
    }
  };

  // Search filtering
  const filteredInvestments = useMemo(() => {
    return investments.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.investor_name?.toLowerCase().includes(term) ||
        item.project_name?.toLowerCase().includes(term) ||
        item.bank_reference?.toLowerCase().includes(term) ||
        item.payment_mode?.toLowerCase().includes(term)
      );
    });
  }, [investments, searchTerm]);

  // Summary statistics calculation
  const stats = useMemo(() => {
    let total = 0;
    const modeCounts = {};
    let latestAmt = 0;
    let latestInvestor = "—";
    let latestDate = null;

    investments.forEach((item) => {
      const amt = Number(item.amount) || 0;
      total += amt;

      const mode = item.payment_mode || "other";
      modeCounts[mode] = (modeCounts[mode] || 0) + 1;

      const itemDate = new Date(item.investment_date || item.created_at);
      if (!latestDate || itemDate > latestDate) {
        latestDate = itemDate;
        latestAmt = amt;
        latestInvestor = item.investor_name || "—";
      }
    });

    let primaryMode = "—";
    let maxCount = 0;
    Object.entries(modeCounts).forEach(([mode, count]) => {
      if (count > maxCount) {
        maxCount = count;
        primaryMode = mode;
      }
    });

    return {
      totalCapital: total,
      totalCount: investments.length,
      primaryMode: getModeLabel(primaryMode),
      latestAmount: latestAmt,
      latestInvestor: latestInvestor,
    };
  }, [investments]);

  return (
    <div>
      <PageHead title="Account / Capital Investment" sub="Track equity investments, capital contributions, and payment receipts from funding partners">
        <div className="flex items-center gap-2">
          <Btn onClick={loadInvestments} variant="outline" size="sm">
            Refresh
          </Btn>
          <Btn onClick={openCreateDrawer} size="sm">
            <Plus size={16} /> Record Capital
          </Btn>
        </div>
      </PageHead>

      {/* Summary statistics grid */}
      <div className={summaryGridClass}>
        <SummaryStat label="Total Capital Infused" value={formatCurrency(stats.totalCapital)} colorClass="text-neutral-900" />
        <SummaryStat label="Transactions Count" value={stats.totalCount} colorClass="text-emerald-600" />
        <SummaryStat label="Preferred Mode" value={stats.primaryMode} colorClass="text-purple-600" />
        <SummaryStat label="Recent Investment" value={formatCurrency(stats.latestAmount)} colorClass="text-amber-500" sub={`From: ${stats.latestInvestor}`} />
      </div>

      {/* Search Bar */}
      <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <FormGrid cols={3}>
          <FG label="Search Capital Investments" span={2}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by investor name, project, payment mode, or bank reference..."
                className="w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </FG>
          <FG label="Showing Results">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 flex items-center justify-between h-[38px]">
              <span>Filtered count:</span>
              <span className="font-bold text-neutral-900">{filteredInvestments.length} / {stats.totalCount}</span>
            </div>
          </FG>
        </FormGrid>
      </div>

      {/* Table Listing */}
      <Card>
        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-red-700 border-t-transparent mx-auto" />
            Loading investments list...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            No capital investments recorded yet. Click "Record Capital" to create your first entry.
          </div>
        ) : (
          <Table headers={["#", "Investor Name", "Project Associated", "Amount Infused", "Date of Investment", "Payment Details", "Notes"]}>
            {filteredInvestments.map((item, index) => (
              <TR key={item.id || index}>
                <TD className="text-xs text-neutral-400">{index + 1}</TD>
                <TD>
                  <div className="font-semibold text-neutral-900">{item.investor_name}</div>
                </TD>
                <TD>
                  <div className="text-neutral-700 font-medium">{item.project_name || "General Funding"}</div>
                </TD>
                <TD>
                  <div className="font-bold text-emerald-600 font-mono">{formatCurrency(item.amount)}</div>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                    <Calendar size={12} className="text-neutral-400" />
                    <span>{formatDate(item.investment_date)}</span>
                  </div>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5">
                    <Badge color={getModeColor(item.payment_mode)}>
                      {getModeLabel(item.payment_mode)}
                    </Badge>
                    {item.bank_reference && (
                      <span className="font-mono text-xs text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {item.bank_reference}
                      </span>
                    )}
                  </div>
                </TD>
                <TD className="max-w-xs truncate text-xs text-neutral-500" title={item.notes}>
                  {item.notes ? (
                    <div className="flex items-center gap-1">
                      <FileText size={12} className="text-neutral-400 shrink-0" />
                      <span className="truncate">{item.notes}</span>
                    </div>
                  ) : (
                    "—"
                  )}
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {/* Right Drawer Form */}
      {drawerOpen && (
        <RightDrawer
          title="Record Capital Investment"
          subtitle="Add a new capital contribution from an investor to the ledger."
          onClose={() => !submitting && setDrawerOpen(false)}
        >
          <div className="space-y-5">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <FG label="Investor Profile *">
                <Select
                  value={form.investor_id}
                  onChange={(e) => updateField("investor_id", e.target.value)}
                  disabled={submitting || investors.length === 0}
                >
                  {investors.length === 0 ? (
                    <option value="">No investors available — create one first</option>
                  ) : (
                    investors.map((inv) => (
                      <option key={inv.id || inv._id} value={inv.id || inv._id}>
                        {inv.name} {inv.pan_number ? `(${inv.pan_number})` : ""}
                      </option>
                    ))
                  )}
                </Select>
              </FG>

              <FG label="Associated Project (Optional)">
                <Select
                  value={form.project_id}
                  onChange={(e) => updateField("project_id", e.target.value)}
                  disabled={submitting}
                >
                  <option value="">General Funding (No Project)</option>
                  {projects.map((proj) => (
                    <option key={proj.id || proj._id} value={proj.id || proj._id}>
                      {proj.name}
                    </option>
                  ))}
                </Select>
              </FG>

              <FormGrid cols={2}>
                <FG label="Investment Amount (₹) *">
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g. 500000"
                    value={form.amount}
                    onChange={(e) => updateField("amount", e.target.value)}
                    disabled={submitting}
                  />
                </FG>

                <FG label="Investment Date *">
                  <Input
                    type="date"
                    value={form.investment_date}
                    onChange={(e) => updateField("investment_date", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
              </FormGrid>

              <FormGrid cols={2}>
                <FG label="Payment Mode *">
                  <Select
                    value={form.payment_mode}
                    onChange={(e) => updateField("payment_mode", e.target.value)}
                    disabled={submitting}
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                    <option value="upi">UPI / Instant Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                  </Select>
                </FG>

                <FG label="Bank Reference / Cheque No.">
                  <Input
                    type="text"
                    placeholder="e.g. TXN123456789"
                    value={form.bank_reference}
                    onChange={(e) => updateField("bank_reference", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
              </FormGrid>

              <FG label="Investment Description / Notes">
                <Textarea
                  placeholder="e.g. Initial seed funding for Project X construction phase."
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  disabled={submitting}
                />
              </FG>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4 mt-6">
              <Btn
                variant="outline"
                onClick={() => setDrawerOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Btn>
              <Btn onClick={handleSave} disabled={submitting || investors.length === 0}>
                {submitting ? "Saving..." : "Record Investment"}
              </Btn>
            </div>
          </div>
        </RightDrawer>
      )}
    </div>
  );
}
