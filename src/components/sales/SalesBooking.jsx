import { Building2, Filter } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBookings } from "../../lib/bookings";
import { getProjects } from "../../lib/projects";
import { ActionBtns, Badge, Btn, Card, PageHead, Select, Table, TD, TR } from "../ui";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "cancelled", label: "Cancelled" },
];

function getProjectList(data) {
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

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getStatusColor(status = "") {
  switch (status.toLowerCase()) {
    case "active":
      return "green";
    case "cancelled":
    case "canceled":
      return "red";
    case "pending":
      return "orange";
    default:
      return "grey";
  }
}

export default function SalesBooking() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      try {
        const response = await getProjects();
        if (!active) return;

        const projectList = getProjectList(response);
        setProjects(projectList);

        if (projectList[0]?.id) {
          setSelectedProjectId((current) => current || projectList[0].id);
        }
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.response?.data?.message || loadError?.message || "Failed to load projects.");
      }
    };

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadBookings = async () => {
      if (!selectedProjectId) {
        setBookings([]);
        setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getBookings({
          page,
          limit: 10,
          project_id: selectedProjectId,
          status,
        });

        if (!active) return;

        setBookings(Array.isArray(response?.data) ? response.data : []);
        setPagination(response?.pagination || { total: 0, page, limit: 10, totalPages: 1 });
      } catch (loadError) {
        if (!active) return;
        setBookings([]);
        setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
        setError(loadError?.response?.data?.message || loadError?.message || "Failed to load bookings.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      active = false;
    };
  }, [page, selectedProjectId, status]);

  const handleProjectChange = (event) => {
    setSelectedProjectId(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handleStatusSelect = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  return (
    <div>
      <PageHead title="Sales – Booking" sub="Review booked customers and payment progress.">
        <Btn onClick={() => navigate("/sales/booking/create")}>+ Create Booking</Btn>
      </PageHead>

      <Card>
        <div className="mb-5 rounded-2xl border border-neutral-200 bg-linear-to-br from-neutral-50 to-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[blueviolet] shadow-sm ring-1 ring-neutral-200">
                  <Filter size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">Booking filters</div>
                  <div className="text-xs text-neutral-500">Choose a project and booking status to narrow results.</div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
                <label className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Project</span>
                  <div className="relative">
                    <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <Select value={selectedProjectId} onChange={handleProjectChange} className="min-w-0 pl-9">
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </Select>
                  </div>
                </label>

                <label className="space-y-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Status</span>
                  <Select value={status} onChange={handleStatusChange} className="min-w-0 lg:hidden">
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                  <div className="hidden flex-wrap gap-2 lg:flex">
                    {STATUS_OPTIONS.map((option) => {
                      const active = status === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleStatusSelect(option.value)}
                          className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${active ? "border-[blueviolet] bg-[blueviolet] text-white shadow-sm" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"}`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </label>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-72">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Total bookings</div>
                <div className="mt-1 text-2xl font-bold text-emerald-700">{pagination.total}</div>
                <div className="mt-1 text-xs text-emerald-600">Across selected filters</div>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-white px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">Current page</div>
                <div className="mt-1 text-2xl font-bold text-neutral-900">{pagination.page}</div>
                <div className="mt-1 text-xs text-neutral-500">of {pagination.totalPages || 1} pages</div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading bookings...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : bookings.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-500">No bookings found for the selected filters.</div>
        ) : (
          <>
            <Table headers={["#", "Customer", "Unit", "Project", "Total Amount", "Paid", "Pending", "Booking Date", "Action"]}>
              {bookings.map((booking, index) => {
                const pendingAmount = Number(booking.total_amount || 0) - Number(booking.paid_amount || 0);

                return (
                  <TR key={booking.id}>
                    <TD className="text-neutral-400">{(page - 1) * pagination.limit + index + 1}</TD>
                    <TD>
                      <div className="font-semibold text-neutral-900">{booking.customer_name || "—"}</div>
                      <div className="text-[11px] text-neutral-500">{booking.booking_number || "—"}</div>
                    </TD>
                    <TD>
                      <div className="font-medium text-blue-600">{booking.unit_number || "—"}</div>
                      <div className="text-[11px] text-neutral-500">Floor {booking.floor_number ?? "—"}</div>
                    </TD>
                    <TD>
                      <div className="text-xs text-neutral-700">{booking.project_name || "—"}</div>
                      <div className="mt-1"><Badge color={getStatusColor(booking.status)}>{booking.status || "unknown"}</Badge></div>
                    </TD>
                    <TD className="font-bold text-neutral-900">{formatCurrency(booking.total_amount)}</TD>
                    <TD className="font-semibold text-emerald-600">{formatCurrency(booking.paid_amount)}</TD>
                    <TD className="text-red-700">{formatCurrency(pendingAmount)}</TD>
                    <TD className="text-xs text-neutral-500">{formatDate(booking.booking_date)}</TD>
                    <TD>
                      <div className="flex flex-wrap items-center gap-2">
                        <Btn
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/sales/booking/${booking.id}/payment-stages`)}
                        >
                          Payment Stages
                        </Btn>
                        <ActionBtns onEdit={() => navigate(`/sales/booking/${booking.id}/edit`)} />
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </Table>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-500">
                Showing page {pagination.page} of {pagination.totalPages} · Total {pagination.total} bookings
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
    </div>
  );
}