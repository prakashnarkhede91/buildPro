import { useEffect, useState, useMemo } from "react";
import { getInvestors, createInvestor, updateInvestor, getInvestorById } from "../../lib/investors";
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
  ActionBtns,
  SummaryStat,
  summaryGridClass,
  Modal,
} from "../ui";
import { Mail, Phone, MapPin, CreditCard, FileText, Search, Plus, X, History } from "lucide-react";

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  pan_number: "",
  address: "",
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
            <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 text-sm text-neutral-500 transition hover:bg-neutral-200">
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AccountInvestors() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Drawer and Form states
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  // History modal states
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [investorDetails, setInvestorDetails] = useState(null);

  const openHistoryModal = async (investor) => {
    const investorId = investor.id || investor._id;
    setInvestorDetails(null);
    setDetailsError("");
    setLoadingDetails(true);
    setHistoryModalOpen(true);
    try {
      const res = await getInvestorById(investorId);
      if (res && res.success && res.data) {
        setInvestorDetails(res.data);
      } else if (res && res.data) {
        setInvestorDetails(res.data);
      } else {
        setInvestorDetails(res);
      }
    } catch (err) {
      setDetailsError(err?.response?.data?.message || err?.message || "Failed to load investor transaction history.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const loadInvestors = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getInvestors();
      // Handle array format or success wrapper
      if (Array.isArray(response)) {
        setInvestors(response);
      } else if (response && Array.isArray(response.data)) {
        setInvestors(response.data);
      } else {
        setInvestors([]);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load investors list.");
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestors();
  }, []);

  const openCreateDrawer = () => {
    setForm(INITIAL_FORM);
    setEditId(null);
    setFormError("");
    setDrawerOpen(true);
  };

  const openEditDrawer = (investor) => {
    const investorId = investor.id || investor._id;
    setForm({
      name: investor.name || "",
      email: investor.email || "",
      phone: investor.phone || "",
      pan_number: investor.pan_number || "",
      address: investor.address || "",
      notes: investor.notes || "",
    });
    setEditId(investorId);
    setFormError("");
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Investor Name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setFormError("Phone Number is required.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || null,
      phone: form.phone.trim(),
      pan_number: form.pan_number.trim().toUpperCase() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
    };

    try {
      if (editId) {
        await updateInvestor(editId, payload);
      } else {
        await createInvestor(payload);
      }
      setDrawerOpen(false);
      setForm(INITIAL_FORM);
      loadInvestors();
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to save investor details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Local Search Filtering
  const filteredInvestors = useMemo(() => {
    return investors.filter((item) => {
      const term = searchTerm.toLowerCase();
      return (
        item.name?.toLowerCase().includes(term) ||
        item.email?.toLowerCase().includes(term) ||
        item.phone?.toLowerCase().includes(term) ||
        item.pan_number?.toLowerCase().includes(term)
      );
    });
  }, [investors, searchTerm]);

  // Derived Statistics
  const totalCount = investors.length;
  const countWithPan = investors.filter((i) => i.pan_number).length;
  const countWithNotes = investors.filter((i) => i.notes).length;

  return (
    <div>
      <PageHead title="Account / Investors" sub="Manage funding partners, angel investors, and capital contributors">
        <div className="flex items-center gap-2">
          <Btn onClick={loadInvestors} variant="outline" size="sm">
            Refresh
          </Btn>
          <Btn onClick={openCreateDrawer} size="sm">
            <Plus size={16} /> Add Investor
          </Btn>
        </div>
      </PageHead>

      {/* Summary Statistics Grid */}
      <div className={summaryGridClass}>
        <SummaryStat label="Total Investors" value={totalCount} colorClass="text-neutral-900" />
        <SummaryStat label="Verified PAN" value={countWithPan} colorClass="text-emerald-600" sub={`${totalCount ? Math.round((countWithPan / totalCount) * 100) : 0}% of total`} />
        <SummaryStat label="Average Capital" value="₹45.0L" colorClass="text-amber-500" sub="Mock Contribution" />
        <SummaryStat label="Follow-ups Pending" value={countWithNotes} colorClass="text-purple-600" sub="With action notes" />
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <FormGrid cols={3}>
          <FG label="Search Investors" span={2}>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone or PAN number..."
                className="w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </FG>
          <FG label="Showing Results">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600 flex items-center justify-between h-[38px]">
              <span>Filtered count:</span>
              <span className="font-bold text-neutral-900">{filteredInvestors.length} / {totalCount}</span>
            </div>
          </FG>
        </FormGrid>
      </div>

      {/* Table Listing */}
      <Card>
        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-red-700 border-t-transparent mx-auto" />
            Loading investors...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : filteredInvestors.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            No investors found. Click "Add Investor" to create your first contact.
          </div>
        ) : (
          <Table headers={["#", "Investor Name", "Contact details", "PAN Number", "Address", "Notes", "Actions"]}>
            {filteredInvestors.map((item, index) => (
              <TR key={item.id || item._id || index}>
                <TD className="text-xs text-neutral-400">{index + 1}</TD>
                <TD>
                  <div className="font-semibold text-neutral-900">{item.name}</div>
                </TD>
                <TD>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-700">
                    <Mail size={12} className="text-neutral-400" />
                    <span>{item.email || "—"}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500">
                    <Phone size={12} className="text-neutral-400" />
                    <span>{item.phone || "—"}</span>
                  </div>
                </TD>
                <TD>
                  {item.pan_number ? (
                    <div className="flex items-center gap-1">
                      <CreditCard size={12} className="text-neutral-400" />
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
                        {item.pan_number}
                      </span>
                    </div>
                  ) : (
                    <span className="text-neutral-400 text-xs">—</span>
                  )}
                </TD>
                <TD className="max-w-xs truncate text-xs text-neutral-600" title={item.address}>
                  {item.address ? (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} className="text-neutral-400 shrink-0" />
                      <span className="truncate">{item.address}</span>
                    </div>
                  ) : (
                    "—"
                  )}
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
                <TD>
                  <div className="flex items-center gap-1.5">
                    <button
                      title="Investment History & Info"
                      onClick={() => openHistoryModal(item)}
                      className="rounded-md p-1 text-violet-600 transition hover:bg-violet-50 cursor-pointer"
                    >
                      <History size={14} />
                    </button>
                    <ActionBtns onEdit={() => openEditDrawer(item)} />
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {/* Slideout Drawer Form */}
      {drawerOpen && (
        <RightDrawer
          title={editId ? "Edit Investor" : "Add Investor"}
          subtitle={editId ? "Update existing investor compliance and contact details." : "Register a new investor profile in the system."}
          onClose={() => !submitting && setDrawerOpen(false)}
        >
          <div className="space-y-5">
            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <FG label="Investor Full Name *">
                <Input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  disabled={submitting}
                />
              </FG>

              <FormGrid cols={2}>
                <FG label="Phone Number *">
                  <Input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
                <FG label="PAN Number">
                  <Input
                    type="text"
                    placeholder="e.g. ABCDE1234F"
                    className="font-mono uppercase tracking-wider"
                    value={form.pan_number}
                    onChange={(e) => updateField("pan_number", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
              </FormGrid>

              <FG label="Email Address">
                <Input
                  type="email"
                  placeholder="e.g. john.doe@example.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  disabled={submitting}
                />
              </FG>

              <FG label="Address">
                <Input
                  type="text"
                  placeholder="e.g. 123 Capital Ave, Bhopal, MP"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  disabled={submitting}
                />
              </FG>

              <FG label="Internal Notes / Preferences">
                <Textarea
                  placeholder="e.g. Angel investor, interested in residential projects"
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
              <Btn onClick={handleSave} disabled={submitting}>
                {submitting ? "Saving..." : editId ? "Save Changes" : "Create Investor"}
              </Btn>
            </div>
          </div>
        </RightDrawer>
      )}

      {/* History Modal */}
      {historyModalOpen && (
        <Modal
          title="Investor Profile & History"
          onClose={() => setHistoryModalOpen(false)}
          width="lg"
        >
          {loadingDetails ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-red-700 border-t-transparent mx-auto" />
              Loading profile details...
            </div>
          ) : detailsError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {detailsError}
            </div>
          ) : investorDetails ? (
            <div className="space-y-6">
              {/* Profile Overview */}
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">Investor Details</div>
                <FormGrid cols={2}>
                  <div className="space-y-1">
                    <div className="text-[11px] text-neutral-400 font-medium">Full Name</div>
                    <div className="text-sm font-semibold text-neutral-900">{investorDetails.name || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-neutral-400 font-medium">PAN Number</div>
                    <div className="text-sm font-semibold font-mono text-neutral-900 uppercase">{investorDetails.pan_number || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-neutral-400 font-medium">Email Address</div>
                    <div className="text-sm text-neutral-700">{investorDetails.email || "—"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] text-neutral-400 font-medium">Phone Number</div>
                    <div className="text-sm text-neutral-700">{investorDetails.phone || "—"}</div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <div className="text-[11px] text-neutral-400 font-medium">Address</div>
                    <div className="text-sm text-neutral-700">{investorDetails.address || "—"}</div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <div className="text-[11px] text-neutral-400 font-medium">Notes</div>
                    <div className="text-sm text-neutral-600 italic">{investorDetails.notes || "No internal notes recorded."}</div>
                  </div>
                </FormGrid>
              </div>

              {/* Transactions / Investment History */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 font-semibold">Capital Investments</div>
                {!investorDetails.investments || investorDetails.investments.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-200 border-dashed p-6 text-center text-xs text-neutral-500 bg-white">
                    No capital investments have been recorded for this investor profile.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
                    <Table headers={["#", "Project", "Amount", "Date", "Mode", "Reference", "Notes"]}>
                      {investorDetails.investments.map((inv, idx) => (
                        <TR key={inv.id || idx}>
                          <TD className="text-xs text-neutral-400">{idx + 1}</TD>
                          <TD className="font-semibold text-neutral-900">{inv.project_name || "General Funding"}</TD>
                          <TD className="font-bold text-emerald-600 font-mono">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(Number(inv.amount) || 0)}
                          </TD>
                          <TD className="text-xs text-neutral-600">
                            {inv.investment_date ? new Date(inv.investment_date).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }) : "—"}
                          </TD>
                          <TD>
                            <Badge color={
                              inv.payment_mode === "bank_transfer" ? "blue" :
                              inv.payment_mode === "upi" ? "green" :
                              inv.payment_mode === "cheque" ? "purple" :
                              inv.payment_mode === "cash" ? "orange" : "grey"
                            }>
                              {inv.payment_mode === "bank_transfer" ? "Bank Transfer" :
                               inv.payment_mode === "upi" ? "UPI" :
                               inv.payment_mode === "cheque" ? "Cheque" :
                               inv.payment_mode === "cash" ? "Cash" : (inv.payment_mode || "—")}
                            </Badge>
                          </TD>
                          <TD className="font-mono text-xs text-neutral-500">{inv.bank_reference || "—"}</TD>
                          <TD className="max-w-[150px] truncate text-xs text-neutral-400" title={inv.notes}>{inv.notes || "—"}</TD>
                        </TR>
                      ))}
                    </Table>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Btn variant="outline" onClick={() => setHistoryModalOpen(false)}>Close</Btn>
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}
