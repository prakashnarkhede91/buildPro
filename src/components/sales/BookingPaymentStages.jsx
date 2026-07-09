import { ArrowLeft, CalendarDays, CircleDollarSign, Layers3, Plus, ReceiptText, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPaymentStages, deletePaymentStage, getPaymentStagesByBooking } from "../../lib/payments";
import { Badge, Btn, Card, ConfirmModal, FG, FormGrid, Input, PageHead, Progress, Table, TD, Textarea, TR } from "../ui";

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

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getStageBadgeColor(status = "") {
  switch (status.toLowerCase()) {
    case "paid":
      return "green";
    case "partial":
      return "orange";
    case "overdue":
      return "red";
    case "pending":
      return "grey";
    default:
      return "blue";
  }
}

function isStageOverdue(stage) {
  if (!stage?.due_date) return false;

  const normalizedStatus = String(stage.status || "").toLowerCase();
  if (!["pending", "partial"].includes(normalizedStatus)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(`${stage.due_date}T00:00:00`);
  return !Number.isNaN(dueDate.getTime()) && dueDate < today;
}

function getApiErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
}

function createEmptyStage() {
  return {
    stage_name: "",
    due_date: "",
    amount: "",
    percentage: "",
    description: "",
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

function SummaryCard({ title, value, sub, icon }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">{title}</div>
          <div className="mt-1 text-2xl font-bold text-neutral-900">{value}</div>
          {sub ? <div className="mt-1 text-xs text-neutral-500">{sub}</div> : null}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-[blueviolet]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function BookingPaymentStages() {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [summary, setSummary] = useState(null);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stageForm, setStageForm] = useState([createEmptyStage()]);
  const [stageFormError, setStageFormError] = useState("");
  const [submittingStages, setSubmittingStages] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadPaymentStages = async (active = true) => {
    if (!bookingId) {
      setError("Booking id is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getPaymentStagesByBooking(bookingId);

      if (!active) return;

      setBooking(response?.data?.booking || null);
      setSummary(response?.data?.summary || null);
      setStages(Array.isArray(response?.data?.stages) ? response.data.stages : []);
    } catch (loadError) {
      if (!active) return;

      setBooking(null);
      setSummary(null);
      setStages([]);
      setError(loadError?.response?.data?.message || loadError?.message || "Failed to load payment stages.");
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    let active = true;

    loadPaymentStages(active);

    return () => {
      active = false;
    };
  }, [bookingId]);

  const resetStageDrawer = () => {
    setDrawerOpen(false);
    setStageForm([createEmptyStage()]);
    setStageFormError("");
    setSubmittingStages(false);
  };

  const openStageDrawer = () => {
    setDrawerOpen(true);
    setStageForm([createEmptyStage()]);
    setStageFormError("");
    setSubmittingStages(false);
  };

  const closeStageDrawer = () => {
    if (submittingStages) return;
    resetStageDrawer();
  };

  const openDeleteConfirmation = (stage) => {
    setDeleteTarget(stage);
    setDeleteError("");
    setDeleteLoading(false);
  };

  const closeDeleteConfirmation = (force = false) => {
    if (deleteLoading && !force) return;
    setDeleteTarget(null);
    setDeleteError("");
    setDeleteLoading(false);
  };

  const updateStageField = (index, field, value) => {
    setStageForm((current) => current.map((stage, stageIndex) => (stageIndex === index ? { ...stage, [field]: value } : stage)));
  };

  const addStageRow = () => {
    setStageForm((current) => [...current, createEmptyStage()]);
  };

  const removeStageRow = (index) => {
    setStageForm((current) => (current.length <= 1 ? current : current.filter((_, stageIndex) => stageIndex !== index)));
  };

  const handleCreateStages = async () => {
    if (!bookingId) {
      setStageFormError("Booking details are missing.");
      return;
    }

    const sanitizedStages = stageForm.map((stage) => ({
      stage_name: stage.stage_name.trim(),
      due_date: stage.due_date,
      amount: stage.amount === "" ? "" : Number(stage.amount),
      percentage: stage.percentage === "" ? "" : Number(stage.percentage),
      description: stage.description.trim(),
    }));

    if (sanitizedStages.some((stage) => !stage.stage_name || !stage.due_date || stage.amount === "" || stage.percentage === "")) {
      setStageFormError("Stage name, due date, amount, and percentage are required for every stage.");
      return;
    }

    if (sanitizedStages.some((stage) => Number.isNaN(stage.amount) || Number(stage.amount) <= 0)) {
      setStageFormError("Each stage amount must be greater than zero.");
      return;
    }

    if (sanitizedStages.some((stage) => Number.isNaN(stage.percentage) || Number(stage.percentage) <= 0)) {
      setStageFormError("Each stage percentage must be greater than zero.");
      return;
    }

    setSubmittingStages(true);
    setStageFormError("");

    try {
      await createPaymentStages({
        booking_id: bookingId,
        stages: sanitizedStages,
      });

      resetStageDrawer();
      await loadPaymentStages(true);
    } catch (submitError) {
      setStageFormError(getApiErrorMessage(submitError, "Failed to create payment stages."));
      setSubmittingStages(false);
    }
  };

  const handleDeleteStage = async () => {
    if (!deleteTarget?.id) {
      setDeleteError("Payment stage details are missing.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deletePaymentStage(deleteTarget.id);
      closeDeleteConfirmation(true);
      await loadPaymentStages(true);
    } catch (deleteStageError) {
      setDeleteError(getApiErrorMessage(deleteStageError, "Failed to delete payment stage."));
      setDeleteLoading(false);
    }
  };

  const progressPct = useMemo(() => {
    const totalAmount = Number(summary?.total_amount || 0);
    const totalPaid = Number(summary?.total_paid || 0);

    if (!totalAmount) return 0;
    return Math.min((totalPaid / totalAmount) * 100, 100);
  }, [summary]);

  return (
    <div>
      <PageHead
        title="Payment Stages"
        sub={booking?.booking_number ? `Stage-wise payment tracking for ${booking.booking_number}.` : "Review stage-wise payment collection for this booking."}
      >
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="outline" onClick={() => navigate("/sales/booking")}>
            <ArrowLeft size={16} />
            Back to Bookings
          </Btn>
          <Btn onClick={openStageDrawer}>
            <Plus size={16} />
            Create Stages
          </Btn>
        </div>
      </PageHead>

      {loading ? (
        <Card>
          <div className="py-10 text-center text-sm text-neutral-500">Loading payment stages...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        </Card>
      ) : (
        <div className="space-y-5">
          <Card>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Booking Number</div>
                  <div className="mt-1 text-base font-bold text-neutral-900">{booking?.booking_number || "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Customer</div>
                  <div className="mt-1 text-base font-semibold text-neutral-900">{booking?.customer_name || "—"}</div>
                  <div className="text-xs text-neutral-500">{booking?.customer_phone || booking?.customer_email || "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Project / Unit</div>
                  <div className="mt-1 text-base font-semibold text-neutral-900">{booking?.project_name || "—"}</div>
                  <div className="text-xs text-neutral-500">Unit {booking?.unit_number || "—"}</div>
                </div>
              </div>

              <div className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4 xl:max-w-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Collection Progress</div>
                    <div className="mt-1 text-xl font-bold text-neutral-900">{progressPct.toFixed(0)}%</div>
                  </div>
                  <Badge color="blue">{summary?.paid_stages || 0} Paid Stages</Badge>
                </div>
                <Progress pct={progressPct} color="#2563eb" className="mt-3" />
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <Badge color="green">Paid: {summary?.paid_stages || 0}</Badge>
                  <Badge color="orange">Partial: {summary?.partial_stages || 0}</Badge>
                  <Badge color="grey">Pending: {summary?.pending_stages || 0}</Badge>
                  <Badge color="red">Overdue: {summary?.overdue_stages || 0}</Badge>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Stages"
              value={summary?.total_stages || 0}
              sub="Planned payment milestones"
              icon={<Layers3 size={18} />}
            />
            <SummaryCard
              title="Total Amount"
              value={formatCurrency(summary?.total_amount)}
              sub="Total stage value"
              icon={<CircleDollarSign size={18} />}
            />
            <SummaryCard
              title="Total Paid"
              value={formatCurrency(summary?.total_paid)}
              sub="Collected so far"
              icon={<ReceiptText size={18} />}
            />
            <SummaryCard
              title="Balance"
              value={formatCurrency(summary?.total_balance)}
              sub="Remaining receivable"
              icon={<CalendarDays size={18} />}
            />
          </div>

          <Card>
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-neutral-900">Stage Details</div>
                <div className="text-xs text-neutral-500">Track due dates, collected amount, and pending balance for each stage.</div>
              </div>
              <div className="text-xs text-neutral-500">
                {stages.length} stage{stages.length === 1 ? "" : "s"} available
              </div>
            </div>

            {stages.length === 0 ? (
              <div className="py-10 text-center text-sm text-neutral-500">No payment stages were found for this booking.</div>
            ) : (
              <Table headers={["#", "Stage", "Due Date", "Amount", "Paid", "Balance", "Status", "Payments", "Action"]}>
                {stages.map((stage) => {
                  const overdue = isStageOverdue(stage);
                  const statusLabel = overdue && String(stage.status || "").toLowerCase() !== "overdue" ? "overdue" : stage.status || "pending";

                  return (
                    <TR key={stage.id} className={overdue ? "bg-red-50/40 hover:bg-red-50" : ""}>
                      <TD className="font-medium text-neutral-500">{stage.stage_number || "—"}</TD>
                      <TD>
                        <div className="font-semibold text-neutral-900">{stage.stage_name || "—"}</div>
                        <div className="text-[11px] text-neutral-500">{stage.description || "No description"}</div>
                      </TD>
                      <TD className={overdue ? "font-medium text-red-700" : "text-neutral-600"}>{formatDate(stage.due_date)}</TD>
                      <TD className="font-semibold text-neutral-900">{formatCurrency(stage.amount)}</TD>
                      <TD className="font-semibold text-emerald-600">{formatCurrency(stage.paid_amount)}</TD>
                      <TD className="font-semibold text-red-700">{formatCurrency(stage.balance_amount)}</TD>
                      <TD>
                        <Badge color={getStageBadgeColor(statusLabel)} className="capitalize">{statusLabel}</Badge>
                      </TD>
                      <TD className="text-neutral-500">{stage.payment_count || 0}</TD>
                      <TD>
                        <button
                          type="button"
                          onClick={() => openDeleteConfirmation(stage)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                          title="Delete payment stage"
                        >
                          <Trash2 size={16} />
                        </button>
                      </TD>
                    </TR>
                  );
                })}
              </Table>
            )}
          </Card>
        </div>
      )}

      {drawerOpen ? (
        <RightDrawer
          title="Create Payment Stages"
          subtitle={booking?.booking_number ? `Add payment milestones for ${booking.booking_number}.` : "Add payment milestones for the selected booking."}
          onClose={closeStageDrawer}
        >
          <div className="space-y-5">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Customer</div>
                  <div className="mt-1 font-semibold text-neutral-900">{booking?.customer_name || "—"}</div>
                </div>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Project / Unit</div>
                  <div className="mt-1 font-semibold text-neutral-900">{booking?.project_name || "—"}</div>
                  <div className="text-xs text-neutral-500">Unit {booking?.unit_number || "—"}</div>
                </div>
              </div>
            </div>

            {stageFormError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{stageFormError}</div> : null}

            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-neutral-900">Stage entries</div>
                <div className="text-xs text-neutral-500">Add one or more stages and submit them together.</div>
              </div>
              <Btn variant="outline" size="sm" onClick={addStageRow}>
                <Plus size={16} />
                Add Stage
              </Btn>
            </div>

            <div className="space-y-4">
              {stageForm.map((stage, index) => (
                <div key={index} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-neutral-900">Stage {index + 1}</div>
                      <div className="text-xs text-neutral-500">Define milestone name, due date, amount, and percentage.</div>
                    </div>
                    {stageForm.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeStageRow(index)}
                        className="rounded-xl border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>

                  <FormGrid cols={2}>
                    <FG label="Stage Name *" span={2}>
                      <Input
                        value={stage.stage_name}
                        onChange={(event) => updateStageField(index, "stage_name", event.target.value)}
                        placeholder="Booking Amount"
                      />
                    </FG>
                    <FG label="Due Date *">
                      <Input
                        type="date"
                        value={stage.due_date}
                        onChange={(event) => updateStageField(index, "due_date", event.target.value)}
                      />
                    </FG>
                    <FG label="Amount *">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={stage.amount}
                        onChange={(event) => updateStageField(index, "amount", event.target.value)}
                        placeholder="200000"
                      />
                    </FG>
                    <FG label="Percentage *">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={stage.percentage}
                        onChange={(event) => updateStageField(index, "percentage", event.target.value)}
                        placeholder="10"
                      />
                    </FG>
                    <FG label="Description" span={2}>
                      <Textarea
                        value={stage.description}
                        onChange={(event) => updateStageField(index, "description", event.target.value)}
                        placeholder="Initial booking payment"
                      />
                    </FG>
                  </FormGrid>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
              <Btn variant="outline" onClick={closeStageDrawer} disabled={submittingStages}>Cancel</Btn>
              <Btn onClick={handleCreateStages} disabled={submittingStages}>
                {submittingStages ? "Creating..." : "Create Payment Stages"}
              </Btn>
            </div>
          </div>
        </RightDrawer>
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="Delete Payment Stage"
          message={`Are you sure you want to delete ${deleteTarget.stage_name || "this payment stage"}? This action cannot be undone.`}
          confirmText="Delete Stage"
          cancelText="Cancel"
          confirmClassName="border-red-700 bg-red-700 text-white hover:bg-red-800"
          onConfirm={handleDeleteStage}
          onClose={closeDeleteConfirmation}
          loading={deleteLoading}
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
              <div><span className="font-medium text-neutral-900">Booking:</span> {booking?.booking_number || "—"}</div>
              <div><span className="font-medium text-neutral-900">Stage:</span> {deleteTarget.stage_name || "—"}</div>
              <div><span className="font-medium text-neutral-900">Payments linked:</span> {deleteTarget.payment_count || 0}</div>
            </div>
            {deleteError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>
            ) : null}
          </div>
        </ConfirmModal>
      ) : null}
    </div>
  );
}