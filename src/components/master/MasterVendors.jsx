import { useEffect, useState } from "react";
import { getVendors, createVendor } from "../../lib/vendors";
import {
  Badge,
  Btn,
  Card,
  FG,
  FormGrid,
  Modal,
  PageHead,
  Select,
  SummaryStat,
  TD,
  TR,
  Table,
  summaryGridClass,
} from "../ui";
import { Star, Mail, Phone, MapPin, Shield, Award, Calendar, FileText, Info } from "lucide-react";

function formatVendorType(value = "") {
  return (
    value
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ") || "—"
  );
}

function formatDisplayDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }
  return value;
}

function RightDrawer({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/30 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-full w-full flex-col border-l border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div className="text-lg font-bold text-neutral-900">{title}</div>
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

export default function MasterVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Drawer & Form States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState({
    name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    gst_number: "",
    pan_number: "",
    vendor_type: "material_supplier",
    specialization: "",
  });

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const resetForm = () => {
    setForm({
      name: "",
      contact_person: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      gst_number: "",
      pan_number: "",
      vendor_type: "material_supplier",
      specialization: "",
    });
    setFormError("");
  };

  const loadVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getVendors({ page, limit });
      if (response && response.success) {
        setVendors(response.data || []);
        setPagination(response.pagination || { total: (response.data || []).length, page, limit, totalPages: 1 });
      } else {
        setError("Failed to fetch vendors data.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [page]);

  // Derived Summary Statistics
  const totalCount = pagination.total;
  const activeCount = vendors.filter((v) => v.is_active).length;
  const averageRating = vendors.length 
    ? (vendors.reduce((sum, v) => sum + Number(v.rating || 0), 0) / vendors.length).toFixed(1)
    : "0.0";
  const uniqueSpecializations = Array.from(
    new Set(vendors.flatMap((v) => v.specialization || []))
  ).length;

  // Local filtering & searching
  const filteredVendors = vendors.filter((v) => {
    const matchesSearch = 
      v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.vendor_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || v.vendor_type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const vendorTypes = Array.from(new Set(vendors.map((v) => v.vendor_type).filter(Boolean)));

  const handleCreateVendor = async () => {
    if (!form.name.trim()) {
      setFormError("Vendor Name is required.");
      return;
    }
    if (!form.phone.trim()) {
      setFormError("Phone Number is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      contact_person: form.contact_person.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim(),
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      state: form.state.trim() || null,
      gst_number: form.gst_number.trim() || null,
      pan_number: form.pan_number.trim() || null,
      vendor_type: form.vendor_type || "material_supplier",
      specialization: form.specialization
        ? form.specialization.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    };

    setSubmitting(true);
    setFormError("");

    try {
      const response = await createVendor(payload);
      if (response && response.success) {
        // Reload list or prepend to show immediately
        setVendors((current) => [response.data || payload, ...current]);
        setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
        setDrawerOpen(false);
        resetForm();
      } else {
        setFormError("Failed to add vendor.");
      }
    } catch (err) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to create vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHead title="Master / Vendors" sub="Manage purchase vendors, suppliers, and ratings">
        <div className="flex items-center gap-2">
          <Btn onClick={loadVendors} variant="outline" size="sm">
            Refresh Data
          </Btn>
          <Btn onClick={() => { resetForm(); setDrawerOpen(true); }} size="sm">
            + Add Vendor
          </Btn>
        </div>
      </PageHead>

      {/* Summary Stats Grid */}
      <div className={summaryGridClass}>
        <SummaryStat label="Total Vendors" value={totalCount} colorClass="text-neutral-900" />
        <SummaryStat label="Active Vendors" value={activeCount} colorClass="text-emerald-600" />
        <SummaryStat label="Average Rating" value={`${averageRating} ★`} colorClass="text-amber-500" />
        <SummaryStat label="Specializations" value={uniqueSpecializations} colorClass="text-purple-600" />
      </div>

      {/* Filters Card */}
      <div className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
        <FormGrid cols={3}>
          <FG label="Search Vendors">
            <input
              type="text"
              placeholder="Search by code, name, contact or email..."
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </FG>
          <FG label="Filter by Vendor Type">
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              {vendorTypes.map((type) => (
                <option key={type} value={type}>
                  {formatVendorType(type)}
                </option>
              ))}
            </Select>
          </FG>
          <FG label="Page Summary">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-600">
              Page {pagination.page} of {pagination.totalPages || 1} · {vendors.length} records loaded
            </div>
          </FG>
        </FormGrid>
      </div>

      {/* Vendors Table Listing */}
      <Card>
        {loading ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-red-700 border-t-transparent mx-auto" />
            Loading vendors records...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="py-12 text-center text-sm text-neutral-500">
            No vendors found matching your criteria.
          </div>
        ) : (
          <>
            <Table headers={["#", "Vendor Code", "Company / Contact", "Communication", "City & State", "Type", "Specialization", "Rating", "Status", "Action"]}>
              {filteredVendors.map((v, i) => (
                <TR key={v.id ?? i}>
                  <TD className="text-xs text-neutral-400">
                    {(page - 1) * pagination.limit + i + 1}
                  </TD>
                  <TD className="font-mono text-xs font-semibold text-neutral-600">
                    {v.vendor_code}
                  </TD>
                  <TD>
                    <div className="font-semibold text-neutral-900">{v.name}</div>
                    <div className="text-[11px] text-neutral-500">CP: {v.contact_person || "—"}</div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-1 text-xs text-neutral-700">
                      <Mail size={12} className="text-neutral-400" />
                      <span>{v.email || "—"}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-1 text-[11px] text-neutral-500">
                      <Phone size={12} className="text-neutral-400" />
                      <span>{v.phone || "—"}</span>
                    </div>
                  </TD>
                  <TD className="text-xs text-neutral-600">
                    {v.city ? `${v.city}, ${v.state || ""}` : "—"}
                  </TD>
                  <TD>
                    <Badge color="blue">{formatVendorType(v.vendor_type)}</Badge>
                  </TD>
                  <TD>
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {v.specialization && v.specialization.length > 0 ? (
                        v.specialization.map((spec) => (
                          <span
                            key={spec}
                            className="inline-block rounded bg-purple-50 border border-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-600 uppercase"
                          >
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </div>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-1 font-semibold text-amber-600">
                      <Star size={13} className="fill-amber-500 text-amber-500" />
                      <span>{Number(v.rating || 0).toFixed(1)}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge color={v.is_active ? "green" : "grey"}>
                      {v.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TD>
                  <TD>
                    <Btn size="sm" variant="outline" onClick={() => setSelectedVendor(v)}>
                      View Details
                    </Btn>
                  </TD>
                </TR>
              ))}
            </Table>

            {/* Pagination Controls */}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-500">
                Showing page {pagination.page} of {pagination.totalPages || 1} · Total {pagination.total} vendors
              </div>
              <div className="flex items-center gap-2">
                <Btn
                  variant="outline"
                  onClick={() => setPage((current) => Math.max(current - 1, 1))}
                  disabled={page <= 1}
                >
                  Previous
                </Btn>
                <Btn
                  variant="outline"
                  onClick={() => setPage((current) => Math.min(current + 1, pagination.totalPages || 1))}
                  disabled={page >= (pagination.totalPages || 1)}
                >
                  Next
                </Btn>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Add Vendor Right Drawer */}
      {drawerOpen && (
        <RightDrawer title="Add Vendor" onClose={() => !submitting && setDrawerOpen(false)}>
          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Vendor Profile details</div>
              <div className="mt-1 text-xs text-neutral-500">Enter vendor company information, contact points, tax status and tags.</div>
            </div>

            {formError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <div className="space-y-4">
              <FG label="Vendor / Company Name *">
                <input
                  type="text"
                  placeholder="e.g. Acme Supplies"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  value={form.name}
                  onChange={(e) => f("name", e.target.value)}
                  disabled={submitting}
                />
              </FG>

              <FormGrid cols={2}>
                <FG label="Contact Person">
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    value={form.contact_person}
                    onChange={(e) => f("contact_person", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
                <FG label="Vendor Type">
                  <Select
                    value={form.vendor_type}
                    onChange={(e) => f("vendor_type", e.target.value)}
                    disabled={submitting}
                  >
                    <option value="material_supplier">Material Supplier</option>
                    <option value="service_provider">Service Provider</option>
                    <option value="subcontractor">Subcontractor</option>
                    <option value="machinery_vendor">Machinery Vendor</option>
                    <option value="consultant">Consultant</option>
                    <option value="other">Other Type</option>
                  </Select>
                </FG>
              </FormGrid>

              <FormGrid cols={2}>
                <FG label="Email Address">
                  <input
                    type="email"
                    placeholder="e.g. john@example.com"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    value={form.email}
                    onChange={(e) => f("email", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
                <FG label="Phone Number *">
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    value={form.phone}
                    onChange={(e) => f("phone", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
              </FormGrid>

              <FG label="Address Line">
                <input
                  type="text"
                  placeholder="e.g. 123 Market St"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  value={form.address}
                  onChange={(e) => f("address", e.target.value)}
                  disabled={submitting}
                />
              </FG>

              <FormGrid cols={2}>
                <FG label="City">
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    value={form.city}
                    onChange={(e) => f("city", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
                <FG label="State">
                  <input
                    type="text"
                    placeholder="e.g. Maharashtra"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                    value={form.state}
                    onChange={(e) => f("state", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
              </FormGrid>

              <FormGrid cols={2}>
                <FG label="GST Number">
                  <input
                    type="text"
                    placeholder="e.g. 27AADCB2230M1Z2"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 font-mono uppercase"
                    value={form.gst_number}
                    onChange={(e) => f("gst_number", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
                <FG label="PAN Number">
                  <input
                    type="text"
                    placeholder="e.g. AADCB2230M"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100 font-mono uppercase"
                    value={form.pan_number}
                    onChange={(e) => f("pan_number", e.target.value)}
                    disabled={submitting}
                  />
                </FG>
              </FormGrid>

              <FG label="Specialization (tags)">
                <input
                  type="text"
                  placeholder="e.g. cement, steel, bricks"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  value={form.specialization}
                  onChange={(e) => f("specialization", e.target.value)}
                  disabled={submitting}
                />
                <div className="flex items-center gap-1 mt-1 text-[11px] text-neutral-500">
                  <Info size={11} className="text-neutral-400" />
                  <span>Enter tags separated by commas.</span>
                </div>
              </FG>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
              <Btn
                variant="outline"
                onClick={() => !submitting && setDrawerOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Btn>
              <Btn onClick={handleCreateVendor} disabled={submitting}>
                {submitting ? "Saving Vendor..." : "Save Vendor"}
              </Btn>
            </div>
          </div>
        </RightDrawer>
      )}

      {/* Vendor Profile / Details Modal */}
      {selectedVendor && (
        <Modal title="Vendor Profile Details" onClose={() => setSelectedVendor(null)} width="lg">
          <div className="space-y-6">
            {/* Header info card */}
            <div className="rounded-2xl bg-neutral-50 p-4 border border-neutral-200">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded">
                    {selectedVendor.vendor_code || "N/A"}
                  </span>
                  <h3 className="mt-1.5 text-lg font-bold text-neutral-900">{selectedVendor.name}</h3>
                  <p className="text-xs text-neutral-500">Type: <span className="font-semibold text-neutral-700">{formatVendorType(selectedVendor.vendor_type)}</span></p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[11px] text-neutral-500">Overall Rating</div>
                    <div className="flex items-center justify-end gap-1 text-base font-bold text-amber-600">
                      <Star size={16} className="fill-amber-500 text-amber-500" />
                      <span>{Number(selectedVendor.rating || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-10 w-[1px] bg-neutral-200" />
                  <div>
                    <div className="text-[11px] text-neutral-500">Status</div>
                    <Badge color={selectedVendor.is_active ? "green" : "grey"} className="mt-1">
                      {selectedVendor.is_active ? "Active Supplier" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid contents */}
            <FormGrid cols={2}>
              <Card className="p-4 bg-white space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Phone size={13} className="text-neutral-500" /> Primary Contact Info
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Contact Person</span>
                    <span className="font-semibold text-neutral-800">{selectedVendor.contact_person || "—"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Email Address</span>
                    <span className="font-semibold text-neutral-800 text-blue-600">{selectedVendor.email || "—"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Phone Number</span>
                    <span className="font-semibold text-neutral-800">{selectedVendor.phone || "—"}</span>
                  </div>
                  {selectedVendor.alternate_phone && (
                    <div>
                      <span className="text-neutral-400 block">Alternate Phone</span>
                      <span className="font-semibold text-neutral-800">{selectedVendor.alternate_phone}</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-4 bg-white space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <MapPin size={13} className="text-neutral-500" /> Location Details
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block">Street Address</span>
                    <span className="font-semibold text-neutral-800">{selectedVendor.address || "—"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">City</span>
                    <span className="font-semibold text-neutral-800">{selectedVendor.city || "—"}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">State</span>
                    <span className="font-semibold text-neutral-800">{selectedVendor.state || "—"}</span>
                  </div>
                </div>
              </Card>
            </FormGrid>

            {/* Compliance details & Specialization */}
            <FormGrid cols={2}>
              <Card className="p-4 bg-white space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Shield size={13} className="text-neutral-500" /> Tax & Compliance
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-neutral-400 block">GST Number</span>
                    <span className="font-mono font-semibold text-neutral-800 uppercase tracking-wide">
                      {selectedVendor.gst_number || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">PAN Number</span>
                    <span className="font-mono font-semibold text-neutral-800 uppercase tracking-wide">
                      {selectedVendor.pan_number || "—"}
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="p-4 bg-white space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Award size={13} className="text-neutral-500" /> Specializations
                </h4>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedVendor.specialization && selectedVendor.specialization.length > 0 ? (
                    selectedVendor.specialization.map((spec) => (
                      <span
                        key={spec}
                        className="rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-semibold text-purple-700 uppercase"
                      >
                        {spec}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400 italic">No specialized tags associated.</span>
                  )}
                </div>
              </Card>
            </FormGrid>

            <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-100 pt-4 gap-2">
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>Onboarded: {formatDisplayDate(selectedVendor.created_at)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText size={12} />
                <span>Last Updated: {formatDisplayDate(selectedVendor.updated_at)}</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Btn onClick={() => setSelectedVendor(null)} variant="primary">
                Close Profile
              </Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
