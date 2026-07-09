import { Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getBookings } from "../../lib/bookings";
import { getCustomers } from "../../lib/customers";
import { createPayment, getPaymentStagesByBooking, getPayments } from "../../lib/payments";
import { getProjects } from "../../lib/projects";
import { Badge, Btn, Card, FG, FormGrid, Input, Select, Table, TD, Textarea, TR } from "../ui";

const PAGE_LIMIT = 20;

const INITIAL_PAYMENT_FORM = {
  customer_id: "",
  booking_id: "",
  payment_stage_id: "",
  amount: "",
  payment_date: "",
  payment_mode: "upi",
  transaction_reference: "",
  notes: "",
};

const PAYMENT_MODE_OPTIONS = [
  { value: "upi", label: "UPI" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
  { value: "rtgs", label: "RTGS" },
  { value: "neft", label: "NEFT" },
];

function getProjectList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  if (Number.isNaN(amount)) {
    return "₹0";
  }

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatPaymentMode(value = "") {
  if (!value) return "—";

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getModeColor(mode = "") {
  switch (mode.toLowerCase()) {
    case "upi":
    case "bank_transfer":
    case "rtgs":
    case "neft":
      return "blue";
    case "cheque":
      return "orange";
    case "cash":
      return "green";
    default:
      return "grey";
  }
}

function getApiErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
}

function getCustomerOption(customer, index) {
  const fullName = [customer.first_name, customer.last_name].filter(Boolean).join(" ");

  return {
    id: customer.id || customer._id || customer.customer_id || `customer-${index + 1}`,
    label: fullName || customer.name || customer.customer_name || customer.mobile || customer.phone || `Customer ${index + 1}`,
    subLabel: customer.phone || customer.mobile || customer.email || "",
  };
}

function getBookingOption(booking, index) {
  const id = booking.id || booking._id || booking.booking_id || `booking-${index + 1}`;
  const towerLabel = booking.tower_name || booking.tower_number || booking.tower || "Tower —";
  const floorLabel = booking.floor_number != null ? `Floor ${booking.floor_number}` : "Floor —";
  const unitLabel = booking.unit_number || booking.unit_name || "Unit —";

  return {
    id,
    customerId: booking.customer_id || "",
    label: booking.booking_number || `Booking ${index + 1}`,
    subLabel: [unitLabel, floorLabel, towerLabel].filter(Boolean).join(" • "),
    projectName: booking.project_name || "",
  };
}

function getStageOption(stage, index) {
  return {
    id: stage.id || stage._id || stage.payment_stage_id || `stage-${index + 1}`,
    label: stage.stage_name || `Stage ${index + 1}`,
    subLabel: [formatDate(stage.due_date), formatCurrency(stage.amount)].filter(Boolean).join(" • "),
  };
}

function RightDrawer({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/30 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-full w-full flex-col border-l border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <div>
              <div className="text-lg font-bold text-neutral-900">{title}</div>
              {subtitle ? <div className="mt-1 text-sm text-neutral-500">{subtitle}</div> : null}
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function AccountIncomeLedger() {
  const [projects, setProjects] = useState([]);
  const [payments, setPayments] = useState([]);
  const [page, setPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [paymentStages, setPaymentStages] = useState([]);
  const [paymentForm, setPaymentForm] = useState(INITIAL_PAYMENT_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const customerOptions = useMemo(() => customers.map(getCustomerOption), [customers]);
  const bookingOptions = useMemo(() => bookings.map(getBookingOption), [bookings]);
  const filteredBookingOptions = useMemo(() => {
    if (!paymentForm.customer_id) return bookingOptions;
    return bookingOptions.filter((booking) => booking.customerId === paymentForm.customer_id);
  }, [bookingOptions, paymentForm.customer_id]);
  const stageOptions = useMemo(() => paymentStages.map(getStageOption), [paymentStages]);

  const loadPayments = async (active = true) => {
    setLoading(true);
    setError("");

    try {
      const response = await getPayments({
        page,
        limit: PAGE_LIMIT,
        ...(selectedProjectId ? { project_id: selectedProjectId } : {}),
        ...(fromDate ? { from_date: fromDate } : {}),
        ...(toDate ? { to_date: toDate } : {}),
      });

      if (!active) return;

      setPayments(Array.isArray(response?.data) ? response.data : []);
      setPagination(response?.pagination || { total: 0, page, limit: PAGE_LIMIT, totalPages: 1 });
    } catch (loadError) {
      if (!active) return;

      setPayments([]);
      setPagination({ total: 0, page: 1, limit: PAGE_LIMIT, totalPages: 1 });
      setError(loadError?.response?.data?.message || loadError?.message || "Failed to load payments.");
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      try {
        const response = await getProjects();
        if (!active) return;
        setProjects(getProjectList(response));
      } catch {
        if (!active) return;
        setProjects([]);
      }
    };

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadPayments(active);

    return () => {
      active = false;
    };
  }, [fromDate, page, selectedProjectId, toDate]);

  useEffect(() => {
    let active = true;

    const loadDrawerData = async () => {
      if (!drawerOpen) return;

      setFormLoading(true);
      setFormError("");

      try {
        const [customersResponse, bookingsResponse] = await Promise.all([
          getCustomers({ page: 1, limit: 100 }),
          getBookings({ page: 1, limit: 200, ...(selectedProjectId ? { project_id: selectedProjectId } : {}) }),
        ]);

        if (!active) return;

        setCustomers(getItems(customersResponse));
        setBookings(getItems(bookingsResponse));
      } catch (loadError) {
        if (!active) return;
        setCustomers([]);
        setBookings([]);
        setFormError(getApiErrorMessage(loadError, "Failed to load payment form data."));
      } finally {
        if (active) {
          setFormLoading(false);
        }
      }
    };

    loadDrawerData();

    return () => {
      active = false;
    };
  }, [drawerOpen, selectedProjectId]);

  useEffect(() => {
    let active = true;

    const loadStages = async () => {
      if (!drawerOpen || !paymentForm.booking_id) {
        setPaymentStages([]);
        setStagesLoading(false);
        return;
      }

      setStagesLoading(true);

      try {
        const response = await getPaymentStagesByBooking(paymentForm.booking_id);
        if (!active) return;
        setPaymentStages(Array.isArray(response?.data?.stages) ? response.data.stages : []);
      } catch (loadError) {
        if (!active) return;
        setPaymentStages([]);
        setFormError(getApiErrorMessage(loadError, "Failed to load payment stages."));
      } finally {
        if (active) {
          setStagesLoading(false);
        }
      }
    };

    loadStages();

    return () => {
      active = false;
    };
  }, [drawerOpen, paymentForm.booking_id]);

  const resetPaymentForm = () => {
    setPaymentForm(INITIAL_PAYMENT_FORM);
    setPaymentStages([]);
    setFormError("");
    setFormLoading(false);
    setStagesLoading(false);
    setSubmittingPayment(false);
  };

  const openPaymentDrawer = () => {
    resetPaymentForm();
    setDrawerOpen(true);
  };

  const closePaymentDrawer = () => {
    if (submittingPayment) return;
    setDrawerOpen(false);
    resetPaymentForm();
  };

  const setPaymentField = (field, value) => {
    setPaymentForm((current) => ({ ...current, [field]: value }));
  };

  const handleCustomerChange = (customerId) => {
    setPaymentForm((current) => {
      const currentBooking = bookingOptions.find((booking) => booking.id === current.booking_id);
      const shouldResetBooking = current.booking_id && currentBooking?.customerId !== customerId;

      return {
        ...current,
        customer_id: customerId,
        booking_id: shouldResetBooking ? "" : current.booking_id,
        payment_stage_id: shouldResetBooking ? "" : current.payment_stage_id,
      };
    });
    setFormError("");
  };

  const handleBookingChange = (bookingId) => {
    const selectedBooking = bookingOptions.find((booking) => booking.id === bookingId);

    setPaymentForm((current) => ({
      ...current,
      booking_id: bookingId,
      customer_id: selectedBooking?.customerId || current.customer_id,
      payment_stage_id: "",
    }));
    setFormError("");
  };

  const handleCreatePayment = async () => {
    if (!paymentForm.customer_id || !paymentForm.booking_id || !paymentForm.payment_stage_id || !paymentForm.amount || !paymentForm.payment_date || !paymentForm.payment_mode) {
      setFormError("Customer, booking, payment stage, amount, payment date, and payment mode are required.");
      return;
    }

    const amount = Number(paymentForm.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      setFormError("Payment amount must be greater than zero.");
      return;
    }

    setSubmittingPayment(true);
    setFormError("");

    try {
      await createPayment({
        booking_id: paymentForm.booking_id,
        customer_id: paymentForm.customer_id,
        payment_stage_id: paymentForm.payment_stage_id,
        amount,
        payment_date: paymentForm.payment_date,
        payment_mode: paymentForm.payment_mode,
        transaction_reference: paymentForm.transaction_reference.trim(),
        notes: paymentForm.notes.trim(),
      });

      setDrawerOpen(false);
      resetPaymentForm();
      await loadPayments(true);
    } catch (submitError) {
      setFormError(getApiErrorMessage(submitError, "Failed to create payment."));
      setSubmittingPayment(false);
    }
  };

  const resetFilters = () => {
    setSelectedProjectId("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <>
      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="grid flex-1 gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))_auto]">
            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Project</span>
              <Select
                value={selectedProjectId}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                  setPage(1);
                }}
              >
                <option value="">All projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </Select>
            </label>

            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">From date</span>
              <Input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">To date</span>
              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
              />
            </label>

            <div className="flex items-end">
              <Btn variant="outline" className="w-full lg:w-auto" onClick={resetFilters}>Reset</Btn>
            </div>
          </div>

          <Btn onClick={openPaymentDrawer} className="shrink-0">
            <Plus size={16} />
            Create Payment
          </Btn>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading income ledger...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-200 px-4 py-10 text-center text-sm text-neutral-500">
            No payments found for the selected filters.
          </div>
        ) : (
          <>
            <Table headers={["Date", "Receipt No.", "Customer", "Booking", "Project", "Mode", "Reference", "Amount"]}>
              {payments.map((record) => (
                <TR key={record.id}>
                  <TD className="text-xs text-neutral-500">{formatDate(record.payment_date)}</TD>
                  <TD>
                    <div className="font-semibold text-neutral-900">{record.receipt_number || record.payment_number || "—"}</div>
                    <div className="text-[11px] text-neutral-500">{record.unit_number || "—"}</div>
                  </TD>
                  <TD>
                    <div className="font-semibold text-neutral-900">{record.customer_name || "—"}</div>
                    <div className="text-[11px] text-neutral-500">{record.customer_id || "—"}</div>
                  </TD>
                  <TD>
                    <div className="font-medium text-blue-600">{record.booking_number || "—"}</div>
                    <div className="text-[11px] text-neutral-500">{record.payment_number || "—"}</div>
                  </TD>
                  <TD className="text-xs">{record.project_name || "—"}</TD>
                  <TD><Badge color={getModeColor(record.payment_mode)}>{formatPaymentMode(record.payment_mode)}</Badge></TD>
                  <TD>
                    <div className="text-xs text-blue-600">{record.transaction_reference || record.cheque_number || "—"}</div>
                    <div className="text-[11px] text-neutral-500">{record.bank_name || "—"}</div>
                  </TD>
                  <TD className="font-bold text-emerald-600">{formatCurrency(record.amount)}</TD>
                </TR>
              ))}
            </Table>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-500">
                Showing page {pagination.page} of {pagination.totalPages || 1} · Total {pagination.total || 0} payments
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="outline" onClick={() => setPage((current) => Math.max(current - 1, 1))} disabled={page <= 1}>
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

      {drawerOpen ? (
        <RightDrawer
          title="Create Payment"
          subtitle="Record customer payment against a booking stage."
          onClose={closePaymentDrawer}
        >
          <div className="space-y-5">
            {formError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div> : null}

            {formLoading ? (
              <div className="py-10 text-center text-sm text-neutral-500">Loading form data...</div>
            ) : (
              <>
                <FormGrid cols={2}>
                  <FG label="Customer *" span={2}>
                    <Select value={paymentForm.customer_id} onChange={(event) => handleCustomerChange(event.target.value)}>
                      <option value="">Select customer</option>
                      {customerOptions.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.subLabel ? `${customer.label} • ${customer.subLabel}` : customer.label}
                        </option>
                      ))}
                    </Select>
                  </FG>

                  <FG label="Booking *" span={2}>
                    <Select value={paymentForm.booking_id} onChange={(event) => handleBookingChange(event.target.value)}>
                      <option value="">Select booking</option>
                      {filteredBookingOptions.map((booking) => (
                        <option key={booking.id} value={booking.id}>
                          {[booking.label, booking.subLabel, booking.projectName].filter(Boolean).join(" • ")}
                        </option>
                      ))}
                    </Select>
                  </FG>

                  <FG label="Payment Stage *" span={2}>
                    <Select
                      value={paymentForm.payment_stage_id}
                      onChange={(event) => setPaymentField("payment_stage_id", event.target.value)}
                      disabled={!paymentForm.booking_id || stagesLoading}
                    >
                      <option value="">{stagesLoading ? "Loading stages..." : "Select payment stage"}</option>
                      {stageOptions.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.subLabel ? `${stage.label} • ${stage.subLabel}` : stage.label}
                        </option>
                      ))}
                    </Select>
                  </FG>

                  <FG label="Amount *">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={paymentForm.amount}
                      onChange={(event) => setPaymentField("amount", event.target.value)}
                      placeholder="250000"
                    />
                  </FG>

                  <FG label="Payment Date *">
                    <Input
                      type="date"
                      value={paymentForm.payment_date}
                      onChange={(event) => setPaymentField("payment_date", event.target.value)}
                    />
                  </FG>

                  <FG label="Payment Mode *">
                    <Select value={paymentForm.payment_mode} onChange={(event) => setPaymentField("payment_mode", event.target.value)}>
                      {PAYMENT_MODE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  </FG>

                  <FG label="Transaction Reference">
                    <Input
                      value={paymentForm.transaction_reference}
                      onChange={(event) => setPaymentField("transaction_reference", event.target.value)}
                      placeholder="UPI123456789"
                    />
                  </FG>

                  <FG label="Notes" span={2}>
                    <Textarea
                      value={paymentForm.notes}
                      onChange={(event) => setPaymentField("notes", event.target.value)}
                      placeholder="First installment received"
                    />
                  </FG>
                </FormGrid>

                <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
                  <Btn variant="outline" onClick={closePaymentDrawer} disabled={submittingPayment}>Cancel</Btn>
                  <Btn onClick={handleCreatePayment} disabled={submittingPayment}>
                    {submittingPayment ? "Saving..." : "Create Payment"}
                  </Btn>
                </div>
              </>
            )}
          </div>
        </RightDrawer>
      ) : null}
    </>
  );
}
