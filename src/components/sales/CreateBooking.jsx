import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Building2, Home, Plus, Save, UserRound, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { createBooking, getBookingById, updateBooking } from "../../lib/bookings";
import { createCustomer, getCustomers } from "../../lib/customers";
import { getLeads } from "../../lib/leads";
import { getProjects, getProjectUnits } from "../../lib/projects";
import { Badge, Btn, Card, FG, FormGrid, Input, PageHead, Select, Textarea } from "../ui";

const initialForm = {
  customer_id: "",
  unit_id: "",
  project_id: "",
  base_amount: "",
  discount_amount: "0",
  other_charges: "0",
  gst_amount: "0",
  booking_amount: "",
  agreement_date: "",
  possession_date: "",
  status: "active",
  cancellation_date: "",
  cancellation_reason: "",
  notes: "",
};

const BOOKING_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

const initialCustomerForm = {
  lead_id: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  alternate_phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  pan_number: "",
  aadhar_number: "",
  date_of_birth: "",
  occupation: "",
  annual_income: "",
};

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function formatCurrencyPreview(value) {
  const amount = Number(value || 0);

  if (Number.isNaN(amount) || amount <= 0) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function normalizeStatus(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getProjectOption(project, index) {
  return {
    id: project.id || project._id || `project-${index + 1}`,
    label: project.name || project.project_name || project.code || `Project ${index + 1}`,
  };
}

function getCustomerOption(customer, index) {
  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
  return {
    id: customer.id || customer._id || customer.customer_id || `customer-${index + 1}`,
    label: fullName || customer.name || customer.customer_name || customer.mobile || customer.phone || `Customer ${index + 1}`,
    subLabel: customer.phone || customer.mobile || customer.email || "",
  };
}

function getUnitOption(unit, index) {
  return {
    id: unit.id || unit._id || unit.unit_id || `unit-${index + 1}`,
    label: unit.unit_number || unit.name || `Unit ${index + 1}`,
    subLabel: [unit.tower_name, unit.floor_number != null ? `Floor ${unit.floor_number}` : "", unit.unit_type].filter(Boolean).join(" • "),
    basePrice: unit.current_price || unit.base_price || "",
    status: normalizeStatus(unit.status),
  };
}

function getLeadOption(lead, index) {
  const label = lead.name || [lead.first_name, lead.last_name].filter(Boolean).join(" ") || lead.customer_name || `Lead ${index + 1}`;
  return {
    id: lead.id || lead._id || lead.lead_id || `lead-${index + 1}`,
    label,
    subLabel: lead.phone || lead.mobile || lead.email || "",
  };
}

function getEntity(data) {
  if (data?.data) return data.data;
  return data;
}

function toInputDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function mapBookingToForm(booking) {
  return {
    customer_id: booking?.customer_id || "",
    unit_id: booking?.unit_id || "",
    project_id: booking?.project_id || "",
    base_amount: booking?.base_amount == null ? "" : String(Number(booking.base_amount) || 0),
    discount_amount: booking?.discount_amount == null ? "0" : String(Number(booking.discount_amount) || 0),
    other_charges: booking?.other_charges == null ? "0" : String(Number(booking.other_charges) || 0),
    gst_amount: booking?.gst_amount == null ? "0" : String(Number(booking.gst_amount) || 0),
    booking_amount: booking?.booking_amount == null ? "" : String(Number(booking.booking_amount) || 0),
    agreement_date: toInputDate(booking?.agreement_date),
    possession_date: toInputDate(booking?.possession_date),
    status: booking?.status || "active",
    cancellation_date: toInputDate(booking?.cancellation_date),
    cancellation_reason: booking?.cancellation_reason || "",
    notes: booking?.notes || "",
  };
}

export default function CreateBooking() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const isEditMode = Boolean(bookingId);
  const [form, setForm] = useState(initialForm);
  const [customerForm, setCustomerForm] = useState(initialCustomerForm);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCustomerDrawer, setShowCustomerDrawer] = useState(false);
  const [submittingCustomer, setSubmittingCustomer] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [customerFormError, setCustomerFormError] = useState("");

  const projectOptions = useMemo(() => getItems(projects).map(getProjectOption), [projects]);
  const customerOptions = useMemo(() => getItems(customers).map(getCustomerOption), [customers]);
  const leadOptions = useMemo(() => getItems(leads).map(getLeadOption), [leads]);
  const allUnitOptions = useMemo(() => getItems(units).map(getUnitOption), [units]);
  const unitOptions = useMemo(
    () => allUnitOptions.filter((unit) => unit.id === form.unit_id || !["sold", "booked", "blocked"].includes(unit.status)),
    [allUnitOptions, form.unit_id],
  );

  const selectedCustomer = customerOptions.find((customer) => customer.id === form.customer_id);
  const selectedUnit = allUnitOptions.find((unit) => unit.id === form.unit_id);

  useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
      setLoadingInitial(true);
      setFormError("");

      try {
        const requests = [
          getProjects(),
          getCustomers({ page: 1, limit: 100 }),
          getLeads({ page: 1, limit: 100 }),
        ];

        if (isEditMode) {
          requests.push(getBookingById(bookingId));
        }

        const [projectsResponse, customersResponse, leadsResponse, bookingResponse] = await Promise.all(requests);

        if (!active) return;

        const nextProjects = getItems(projectsResponse);
        const nextCustomers = getItems(customersResponse);
        const nextLeads = getItems(leadsResponse);

        setProjects(nextProjects);
        setCustomers(nextCustomers);
        setLeads(nextLeads);

        if (isEditMode) {
          const booking = getEntity(bookingResponse);
          setForm(mapBookingToForm(booking));
        } else {
          setForm((current) => ({
            ...current,
            project_id: current.project_id || nextProjects[0]?.id || nextProjects[0]?._id || "",
            customer_id: current.customer_id || nextCustomers[0]?.id || nextCustomers[0]?._id || nextCustomers[0]?.customer_id || "",
          }));
        }
      } catch (error) {
        if (!active) return;
        setFormError(error?.response?.data?.message || error?.message || "Failed to load booking form data.");
      } finally {
        if (active) {
          setLoadingInitial(false);
        }
      }
    };

    loadInitialData();

    return () => {
      active = false;
    };
  }, [bookingId, isEditMode]);

  useEffect(() => {
    let active = true;

    const loadUnits = async () => {
      if (!form.project_id) {
        setUnits([]);
        setForm((current) => ({ ...current, unit_id: "" }));
        return;
      }

      setLoadingUnits(true);
      setFormError("");

      try {
        const response = await getProjectUnits(form.project_id);
        if (!active) return;

        const nextUnits = getItems(response);

        setUnits(nextUnits);
        setForm((current) => {
          const eligibleUnits = nextUnits
            .map(getUnitOption)
            .filter((unit) => unit.id === current.unit_id || !["sold", "booked", "blocked"].includes(unit.status));
          const nextUnitId = eligibleUnits.some((unit) => unit.id === current.unit_id) ? current.unit_id : eligibleUnits[0]?.id || "";
          const nextBaseAmount = current.base_amount || eligibleUnits.find((unit) => unit.id === nextUnitId)?.basePrice || "";

          return {
            ...current,
            unit_id: nextUnitId,
            base_amount: String(nextBaseAmount || ""),
          };
        });
      } catch (error) {
        if (!active) return;
        setUnits([]);
        setForm((current) => ({ ...current, unit_id: "" }));
        setFormError(error?.response?.data?.message || error?.message || "Failed to load units.");
      } finally {
        if (active) {
          setLoadingUnits(false);
        }
      }
    };

    loadUnits();

    return () => {
      active = false;
    };
  }, [form.project_id]);

  useEffect(() => {
    if (!selectedUnit?.basePrice) return;

    setForm((current) => {
      if (!current.unit_id || current.unit_id !== selectedUnit.id) {
        return current;
      }

      if (current.base_amount) {
        return current;
      }

      return {
        ...current,
        base_amount: String(selectedUnit.basePrice || current.base_amount || ""),
      };
    });
  }, [selectedUnit]);

  const setField = (key, value) => {
    setSuccessMessage("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setCustomerField = (key, value) => {
    setCustomerFormError("");
    setCustomerForm((current) => ({ ...current, [key]: value }));
  };

  const handleProjectChange = (event) => {
    setField("project_id", event.target.value);
  };

  const handleUnitChange = (event) => {
    const nextUnitId = event.target.value;
    const nextUnit = unitOptions.find((unit) => unit.id === nextUnitId);

    setForm((current) => ({
      ...current,
      unit_id: nextUnitId,
      base_amount: nextUnit?.basePrice ? String(nextUnit.basePrice) : current.base_amount,
    }));
  };

  const totalAmountPreview = useMemo(() => {
    const baseAmount = Number(form.base_amount || 0);
    const discountAmount = Number(form.discount_amount || 0);
    const otherCharges = Number(form.other_charges || 0);
    const gstAmount = Number(form.gst_amount || 0);

    return baseAmount - discountAmount + otherCharges + gstAmount;
  }, [form.base_amount, form.discount_amount, form.other_charges, form.gst_amount]);

  const saveBooking = async () => {
    if (!form.customer_id || !form.unit_id || !form.project_id || !form.base_amount || !form.booking_amount || !form.possession_date) {
      setFormError("Please fill all required fields before saving the booking.");
      return;
    }

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      const payload = {
        customer_id: form.customer_id,
        unit_id: form.unit_id,
        project_id: form.project_id,
        base_amount: Number(form.base_amount || 0),
        discount_amount: Number(form.discount_amount || 0),
        other_charges: Number(form.other_charges || 0),
        gst_amount: Number(form.gst_amount || 0),
        booking_amount: Number(form.booking_amount || 0),
        possession_date: form.possession_date,
        notes: form.notes,
      };

      if (isEditMode) {
        await updateBooking(bookingId, {
          ...payload,
          agreement_date: form.agreement_date || null,
          status: form.status,
          cancellation_date: form.cancellation_date || null,
          cancellation_reason: form.cancellation_reason || null,
        });
      } else {
        await createBooking(payload);
      }

      setSuccessMessage(isEditMode ? "Booking updated successfully." : "Booking created successfully.");
      navigate("/sales/booking", { replace: true });
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || `Failed to ${isEditMode ? "update" : "create"} booking.`);
    } finally {
      setSubmitting(false);
    }
  };

  const openCustomerDrawer = () => {
    setCustomerFormError("");
    setCustomerForm(initialCustomerForm);
    setShowCustomerDrawer(true);
  };

  const closeCustomerDrawer = (force = false) => {
    if (submittingCustomer && !force) return;
    setShowCustomerDrawer(false);
    setCustomerFormError("");
    setCustomerForm(initialCustomerForm);
  };

  const saveCustomer = async () => {
    if (!customerForm.first_name || !customerForm.phone) {
      setCustomerFormError("First name and phone are required.");
      return;
    }

    setSubmittingCustomer(true);
    setCustomerFormError("");

    try {
      const response = await createCustomer({
        lead_id: customerForm.lead_id || undefined,
        first_name: customerForm.first_name,
        last_name: customerForm.last_name,
        email: customerForm.email,
        phone: customerForm.phone,
        alternate_phone: customerForm.alternate_phone,
        address: customerForm.address,
        city: customerForm.city,
        state: customerForm.state,
        pincode: customerForm.pincode,
        pan_number: customerForm.pan_number,
        aadhar_number: customerForm.aadhar_number,
        date_of_birth: customerForm.date_of_birth || undefined,
        occupation: customerForm.occupation,
        annual_income: customerForm.annual_income ? Number(customerForm.annual_income) : undefined,
      });

      const createdCustomer = getEntity(response);
      const createdCustomerId = createdCustomer?.id || createdCustomer?._id || createdCustomer?.customer_id;

      setCustomers((current) => [createdCustomer, ...current]);
      if (createdCustomerId) {
        setForm((current) => ({ ...current, customer_id: createdCustomerId }));
      }

      closeCustomerDrawer(true);
    } catch (error) {
      setCustomerFormError(error?.response?.data?.message || error?.message || "Failed to create customer.");
    } finally {
      setSubmittingCustomer(false);
    }
  };

  return (
    <>
      <div>
      <PageHead title={isEditMode ? "Sales – Edit Booking" : "Sales – Create Booking"} sub={isEditMode ? "Update booking details, pricing, and status." : "Create a new booking with customer, project, unit, and pricing details."}>
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="outline" onClick={() => navigate("/sales/booking")}>
            <ArrowLeft size={16} />
            Back to Booking
          </Btn>
          <Btn onClick={saveBooking} disabled={submitting || loadingInitial || loadingUnits}>
            <Save size={16} />
            {submitting ? "Saving..." : isEditMode ? "Update Booking" : "Save Booking"}
          </Btn>
        </div>
      </PageHead>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <Card>
          {loadingInitial ? (
            <div className="py-10 text-center text-sm text-neutral-500">Loading booking form...</div>
          ) : (
            <>
              {formError ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div> : null}
              {successMessage ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div> : null}

              <FormGrid cols={2}>
                <FG label="Project *">
                  <Select value={form.project_id} onChange={handleProjectChange}>
                    <option value="">Select project</option>
                    {projectOptions.map((project) => (
                      <option key={project.id} value={project.id}>{project.label}</option>
                    ))}
                  </Select>
                </FG>

                <FG label="Customer *">
                  <div className="flex gap-2">
                    <Select value={form.customer_id} onChange={(event) => setField("customer_id", event.target.value)} className="flex-1">
                      <option value="">Select customer</option>
                      {customerOptions.map((customer) => (
                        <option key={customer.id} value={customer.id}>{customer.subLabel ? `${customer.label} • ${customer.subLabel}` : customer.label}</option>
                      ))}
                    </Select>
                    <Btn type="button" variant="outline" className="shrink-0" onClick={openCustomerDrawer}>
                      <Plus size={16} />
                      New Customer
                    </Btn>
                  </div>
                </FG>

                <FG label="Unit *" span={2}>
                  <Select value={form.unit_id} onChange={handleUnitChange} disabled={loadingUnits || !form.project_id}>
                    <option value="">{loadingUnits ? "Loading units..." : "Select unit"}</option>
                    {unitOptions.map((unit) => (
                      <option key={unit.id} value={unit.id}>{unit.subLabel ? `${unit.label} • ${unit.subLabel}` : unit.label}</option>
                    ))}
                  </Select>
                </FG>

                <FG label="Base Amount *">
                  <Input type="number" min="0" placeholder="e.g. 5000000" value={form.base_amount} onChange={(event) => setField("base_amount", event.target.value)} />
                </FG>

                <FG label="Booking Amount *">
                  <Input type="number" min="0" placeholder="e.g. 500000" value={form.booking_amount} onChange={(event) => setField("booking_amount", event.target.value)} />
                </FG>

                <FG label="Agreement Date">
                  <Input type="date" value={form.agreement_date} onChange={(event) => setField("agreement_date", event.target.value)} />
                </FG>

                <FG label="Status">
                  <Select value={form.status} onChange={(event) => setField("status", event.target.value)}>
                    {BOOKING_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </FG>

                <FG label="Discount Amount">
                  <Input type="number" min="0" placeholder="e.g. 100000" value={form.discount_amount} onChange={(event) => setField("discount_amount", event.target.value)} />
                </FG>

                <FG label="Other Charges">
                  <Input type="number" min="0" placeholder="e.g. 50000" value={form.other_charges} onChange={(event) => setField("other_charges", event.target.value)} />
                </FG>

                <FG label="GST Amount">
                  <Input type="number" min="0" placeholder="e.g. 250000" value={form.gst_amount} onChange={(event) => setField("gst_amount", event.target.value)} />
                </FG>

                <FG label="Possession Date *">
                  <Input type="date" value={form.possession_date} onChange={(event) => setField("possession_date", event.target.value)} />
                </FG>

                {(isEditMode || form.status === "cancelled") && (
                  <>
                    <FG label="Cancellation Date">
                      <Input type="date" value={form.cancellation_date} onChange={(event) => setField("cancellation_date", event.target.value)} />
                    </FG>

                    <FG label="Cancellation Reason">
                      <Input value={form.cancellation_reason} onChange={(event) => setField("cancellation_reason", event.target.value)} placeholder="Reason for cancellation" />
                    </FG>
                  </>
                )}

                <FG label="Notes" span={2}>
                  <Textarea placeholder="Priority customer or internal notes" value={form.notes} onChange={(event) => setField("notes", event.target.value)} />
                </FG>
              </FormGrid>
            </>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="mb-3 text-sm font-semibold text-neutral-900">Selection summary</div>
            <div className="space-y-3 text-sm text-neutral-600">
              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                <Building2 size={16} className="mt-0.5 text-[blueviolet]" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Project</div>
                  <div className="mt-1 font-medium text-neutral-900">{projectOptions.find((project) => project.id === form.project_id)?.label || "—"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                <UserRound size={16} className="mt-0.5 text-[blueviolet]" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Customer</div>
                  <div className="mt-1 font-medium text-neutral-900">{selectedCustomer?.label || "—"}</div>
                  {selectedCustomer?.subLabel ? <div className="text-xs text-neutral-500">{selectedCustomer.subLabel}</div> : null}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3">
                <Home size={16} className="mt-0.5 text-[blueviolet]" />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Unit</div>
                  <div className="mt-1 font-medium text-neutral-900">{selectedUnit?.label || "—"}</div>
                  {selectedUnit?.subLabel ? <div className="text-xs text-neutral-500">{selectedUnit.subLabel}</div> : null}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-neutral-900">Amount preview</div>
              <Badge color="blue">Auto summary</Badge>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-neutral-600"><span>Base amount</span><span className="font-medium text-neutral-900">{formatCurrencyPreview(form.base_amount)}</span></div>
              <div className="flex items-center justify-between text-neutral-600"><span>Discount</span><span className="font-medium text-red-700">- {formatCurrencyPreview(form.discount_amount)}</span></div>
              <div className="flex items-center justify-between text-neutral-600"><span>Other charges</span><span className="font-medium text-neutral-900">{formatCurrencyPreview(form.other_charges)}</span></div>
              <div className="flex items-center justify-between text-neutral-600"><span>GST amount</span><span className="font-medium text-neutral-900">{formatCurrencyPreview(form.gst_amount)}</span></div>
              <div className="border-t border-neutral-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">Estimated total</span>
                  <span className="text-lg font-bold text-[blueviolet]">{formatCurrencyPreview(totalAmountPreview)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      </div>

      {showCustomerDrawer && (
        <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-neutral-950/40" onClick={closeCustomerDrawer} />
        <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
            <div>
              <div className="text-lg font-bold text-neutral-900">Create Customer</div>
              <div className="mt-1 text-sm text-neutral-500">Add a new customer and optionally link a lead as won.</div>
            </div>
            <button type="button" onClick={closeCustomerDrawer} className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-5">
            {customerFormError ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{customerFormError}</div> : null}

            <FormGrid cols={2}>
              <FG label="Lead (optional)" span={2}>
                <Select value={customerForm.lead_id} onChange={(event) => setCustomerField("lead_id", event.target.value)}>
                  <option value="">Select lead</option>
                  {leadOptions.map((lead) => (
                    <option key={lead.id} value={lead.id}>{lead.subLabel ? `${lead.label} • ${lead.subLabel}` : lead.label}</option>
                  ))}
                </Select>
              </FG>

              <FG label="First Name *"><Input value={customerForm.first_name} onChange={(event) => setCustomerField("first_name", event.target.value)} placeholder="Rahul" /></FG>
              <FG label="Last Name"><Input value={customerForm.last_name} onChange={(event) => setCustomerField("last_name", event.target.value)} placeholder="Sharma" /></FG>
              <FG label="Phone *"><Input value={customerForm.phone} onChange={(event) => setCustomerField("phone", event.target.value)} placeholder="9876543210" /></FG>
              <FG label="Alternate Phone"><Input value={customerForm.alternate_phone} onChange={(event) => setCustomerField("alternate_phone", event.target.value)} placeholder="9123456780" /></FG>
              <FG label="Email" span={2}><Input type="email" value={customerForm.email} onChange={(event) => setCustomerField("email", event.target.value)} placeholder="rahul.sharma@example.com" /></FG>
              <FG label="Address" span={2}><Textarea value={customerForm.address} onChange={(event) => setCustomerField("address", event.target.value)} placeholder="123 MG Road" /></FG>
              <FG label="City"><Input value={customerForm.city} onChange={(event) => setCustomerField("city", event.target.value)} placeholder="Bengaluru" /></FG>
              <FG label="State"><Input value={customerForm.state} onChange={(event) => setCustomerField("state", event.target.value)} placeholder="Karnataka" /></FG>
              <FG label="Pincode"><Input value={customerForm.pincode} onChange={(event) => setCustomerField("pincode", event.target.value)} placeholder="560001" /></FG>
              <FG label="Occupation"><Input value={customerForm.occupation} onChange={(event) => setCustomerField("occupation", event.target.value)} placeholder="Software Engineer" /></FG>
              <FG label="PAN Number"><Input value={customerForm.pan_number} onChange={(event) => setCustomerField("pan_number", event.target.value)} placeholder="ABCDE1234F" /></FG>
              <FG label="Aadhar Number"><Input value={customerForm.aadhar_number} onChange={(event) => setCustomerField("aadhar_number", event.target.value)} placeholder="123412341234" /></FG>
              <FG label="Date of Birth"><Input type="date" value={customerForm.date_of_birth} onChange={(event) => setCustomerField("date_of_birth", event.target.value)} /></FG>
              <FG label="Annual Income"><Input type="number" min="0" value={customerForm.annual_income} onChange={(event) => setCustomerField("annual_income", event.target.value)} placeholder="1200000" /></FG>
            </FormGrid>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-4">
            <Btn variant="outline" onClick={closeCustomerDrawer} disabled={submittingCustomer}>Cancel</Btn>
            <Btn onClick={saveCustomer} disabled={submittingCustomer}>{submittingCustomer ? "Saving..." : "Create Customer"}</Btn>
          </div>
        </div>
        </div>
      )}
    </>
  );
}