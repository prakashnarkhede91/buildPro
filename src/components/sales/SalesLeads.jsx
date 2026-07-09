import { useEffect, useMemo, useState } from "react";
import { createLead, createLeadFollowUp, deleteLead, getLeadById, getLeads, updateLead } from "../../lib/leads";
import { getEmployees } from "../../lib/hr";
import { getProjects } from "../../lib/projects";
import { ActionBtns, Badge, Btn, Card, ConfirmModal, FG, FormGrid, Input, Modal, PageHead, Select, Table, TD, Textarea, TR } from "../ui";
import { FOLLOW_UP_MODE_OPTIONS, LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS, UNIT_TYPE_OPTIONS } from "../../lib/enums";
import { getInitialLeadForm, scoreColorClass } from "./salesData";

// Use centralized enums from lib/enums.js
const STATUS_OPTIONS = LEAD_STATUS_OPTIONS;

const INTERESTED_UNIT_TYPE_OPTIONS = [
  { value: "", label: "Select unit type" },
  ...UNIT_TYPE_OPTIONS,
];

const BHK_OPTIONS = ["", "1RK", "1BHK", "2BHK", "2.5BHK", "3BHK", "3.5BHK", "4BHK", "5BHK", "Penthouse"];

const statusColorMap = {
  new: "grey",
  contacted: "blue",
  follow_up: "blue",
  site_visit: "purple",
  negotiation: "orange",
  won: "green",
  lost: "red",
  re_marketing: "yellow",
};

const statusTileClass = {
  All: { base: "border-blue-600", active: "bg-blue-600", muted: "text-blue-600" },
  New: { base: "border-neutral-300", active: "bg-neutral-500", muted: "text-neutral-500" },
  Contacted: { base: "border-sky-600", active: "bg-sky-600", muted: "text-sky-600" },
  "Follow-Up": { base: "border-blue-600", active: "bg-blue-600", muted: "text-blue-600" },
  "Site Visit": { base: "border-purple-600", active: "bg-purple-600", muted: "text-purple-600" },
  Negotiation: { base: "border-orange-600", active: "bg-orange-600", muted: "text-orange-600" },
  Won: { base: "border-emerald-600", active: "bg-emerald-600", muted: "text-emerald-600" },
  Lost: { base: "border-red-700", active: "bg-[blueviolet]", muted: "text-red-700" },
  "Re-Marketing": { base: "border-amber-500", active: "bg-amber-500", muted: "text-amber-600" },
};

const LEAD_EDITABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((status) => status.value);

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getApiErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
}

function formatLabel(value = "") {
  return String(value || "")
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatSource(value = "") {
  if (!value) return "—";
  return formatLabel(value).replace("Walk In", "Walk-in");
}

function formatStatus(value = "") {
  if (!value) return "Unknown";
  return formatLabel(value).replace("Follow Up", "Follow-Up");
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  return value;
}

function getWhatsAppLink(phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";

  const normalized = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${normalized}`;
}

function toDateTimeLocalValue(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (part) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatCurrencyRange(minValue, maxValue) {
  const min = Number(minValue || 0);
  const max = Number(maxValue || 0);

  const formatAmount = (amount) => {
    if (Number.isNaN(amount) || amount <= 0) return "";

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const minLabel = formatAmount(min);
  const maxLabel = formatAmount(max);

  if (minLabel && maxLabel) return `${minLabel} – ${maxLabel}`;
  return minLabel || maxLabel || "—";
}

function getProjectOption(project, index) {
  return {
    id: project.id || project._id || `project-${index + 1}`,
    label: project.name || project.project_name || project.code || `Project ${index + 1}`,
  };
}

function getEmployeeOption(employee, index) {
  const fullName = [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim();

  return {
    id: employee.id || employee._id || employee.user_id || employee.employee_id || `employee-${index + 1}`,
    label: fullName || employee.name || employee.full_name || employee.employee_name || employee.email || `Employee ${index + 1}`,
  };
}

function mapLeadToRow(lead) {
  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ");
  const statusKey = String(lead.status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  return {
    id: lead.id || lead._id || crypto.randomUUID(),
    name: fullName || lead.name || "—",
    email: lead.email || "—",
    mobile: lead.phone || lead.mobile || "—",
    source: formatSource(lead.source),
    project: lead.project_name || "—",
    projectId: lead.project_id || "",
    budget: formatCurrencyRange(lead.budget_min, lead.budget_max),
    assignedTo: lead.assigned_to_name || "—",
    assignedToId: lead.assigned_to || "",
    score: Number(lead.score || 0),
    status: formatStatus(lead.status),
    statusKey,
    notes: lead.notes || "",
  };
}

function buildLeadUpdateForm(lead = {}) {
  return {
    first_name: lead.first_name || "",
    last_name: lead.last_name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    status: lead.status || "new",
    assigned_to: lead.assigned_to || "",
    notes: lead.notes || "",
    next_follow_up: toDateTimeLocalValue(lead.next_follow_up),
    budget_min: lead.budget_min || "",
    budget_max: lead.budget_max || "",
    interested_bhk: lead.interested_bhk || "",
    lost_reason: lead.lost_reason || "",
    score: lead.score ?? "",
  };
}

function buildFollowUpForm() {
  return {
    mode: "call",
    scheduled_at: "",
    notes: "",
    outcome: "",
    next_follow_up: "",
  };
}

function ScoreBar({ value }) {
  const color = value >= 80 ? "#16a34a" : value >= 50 ? "#ea580c" : "#cc0000";
  const colorClass = scoreColorClass[color];

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 rounded-full bg-neutral-200">
        <div className={`h-full rounded-full ${colorClass.split(" ")[0]}`} style={{ width: `${value}%` }} />
      </div>
      <span className={`text-[11px] font-bold ${colorClass.split(" ")[1]}`}>{value}</span>
    </div>
  );
}

function DetailRow({ label, value, valueClassName = "" }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-neutral-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-neutral-500">{label}</span>
      <span className={`text-right font-medium text-neutral-900 ${valueClassName}`}>{formatValue(value)}</span>
    </div>
  );
}

export default function SalesLeads() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(() => getInitialLeadForm());
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [leadDetail, setLeadDetail] = useState(null);
  const [leadDetailLoading, setLeadDetailLoading] = useState(false);
  const [leadDetailError, setLeadDetailError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState("");
  const [editForm, setEditForm] = useState(() => buildLeadUpdateForm());
  const [editLeadLoading, setEditLeadLoading] = useState(false);
  const [updatingLead, setUpdatingLead] = useState(false);
  const [updateLeadError, setUpdateLeadError] = useState("");
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  const [followUpForm, setFollowUpForm] = useState(() => buildFollowUpForm());
  const [followUpError, setFollowUpError] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateEditForm = (key, value) => setEditForm((current) => ({ ...current, [key]: value }));
  const updateFollowUpForm = (key, value) => setFollowUpForm((current) => ({ ...current, [key]: value }));
  const projectOptions = useMemo(() => getItems(projects).map(getProjectOption), [projects]);
  const employeeOptions = useMemo(() => getItems(employees).map(getEmployeeOption), [employees]);

  const fetchLeadDetail = async (leadId) => {
    const response = await getLeadById(leadId);
    return response?.data || null;
  };

  const counts = useMemo(
    () => Object.fromEntries(STATUS_OPTIONS.map((status) => [status.label, status.value === "" ? pagination.total : leads.filter((lead) => lead.statusKey === status.value).length])),
    [leads, pagination.total],
  );

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      try {
        const response = await getProjects();
        if (!active) return;
        setProjects(getItems(response));
      } catch {
        if (!active) return;
      }
    };

    const loadEmployees = async () => {
      try {
        const response = await getEmployees();
        if (!active) return;
        setEmployees(getItems(response));
      } catch {
        if (!active) return;
      }
    };

    loadProjects();
    loadEmployees();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadLeads = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getLeads({
          page,
          limit: 10,
          search: search.trim() || undefined,
          status: filter || undefined,
          source: source || undefined,
          project_id: projectId || undefined,
          assigned_to: assignedTo.trim() || undefined,
        });

        if (!active) return;

        setLeads(getItems(response).map(mapLeadToRow));
        setPagination(response?.pagination || { total: 0, page, limit: 10, totalPages: 1 });
      } catch (loadError) {
        if (!active) return;
        setLeads([]);
        setPagination({ total: 0, page: 1, limit: 10, totalPages: 1 });
        setError(getApiErrorMessage(loadError, "Failed to load leads."));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLeads();

    return () => {
      active = false;
    };
  }, [assignedTo, filter, page, projectId, reloadKey, search, source]);

  useEffect(() => {
    if (!selectedLeadId) return undefined;

    let active = true;

    const loadLeadDetail = async () => {
      setLeadDetailLoading(true);
      setLeadDetailError("");

      try {
        const detail = await fetchLeadDetail(selectedLeadId);
        if (!active) return;
        setLeadDetail(detail);
      } catch (loadError) {
        if (!active) return;
        setLeadDetail(null);
        setLeadDetailError(getApiErrorMessage(loadError, "Failed to load lead details."));
      } finally {
        if (active) {
          setLeadDetailLoading(false);
        }
      }
    };

    loadLeadDetail();

    return () => {
      active = false;
    };
  }, [selectedLeadId]);

  const closeModal = () => {
    setShowModal(false);
    setSaveError("");
    setForm(getInitialLeadForm(projectOptions));
  };

  const openLeadDetailDrawer = (leadId) => {
    setSelectedLeadId(leadId);
    setLeadDetail(null);
    setLeadDetailError("");
  };

  const closeLeadDetailDrawer = () => {
    setSelectedLeadId("");
    setLeadDetail(null);
    setLeadDetailError("");
    setLeadDetailLoading(false);
    setShowFollowUpModal(false);
    setFollowUpForm(buildFollowUpForm());
    setFollowUpError("");
    setSavingFollowUp(false);
  };

  const closeEditModal = () => {
    if (updatingLead) return;
    setShowEditModal(false);
    setEditingLeadId("");
    setEditForm(buildLeadUpdateForm());
    setEditLeadLoading(false);
    setUpdateLeadError("");
  };

  const openFollowUpModal = () => {
    setFollowUpForm(buildFollowUpForm());
    setFollowUpError("");
    setShowFollowUpModal(true);
  };

  const closeFollowUpModal = () => {
    if (savingFollowUp) return;
    setShowFollowUpModal(false);
    setFollowUpForm(buildFollowUpForm());
    setFollowUpError("");
  };

  const openDeleteConfirm = (lead) => {
    setDeleteTarget(lead);
    setDeleteError("");
    setDeleteLoading(false);
  };

  const closeDeleteConfirm = (force = false) => {
    if (deleteLoading && !force) return;
    setDeleteTarget(null);
    setDeleteError("");
    setDeleteLoading(false);
  };

  const openEditLeadModal = async (leadId) => {
    setShowEditModal(true);
    setEditingLeadId(leadId);
    setEditLeadLoading(true);
    setUpdateLeadError("");

    try {
      const detail = (await fetchLeadDetail(leadId)) || {};
      setEditForm(buildLeadUpdateForm(detail));
    } catch (loadError) {
      setUpdateLeadError(getApiErrorMessage(loadError, "Failed to load lead for editing."));
      setEditForm(buildLeadUpdateForm());
    } finally {
      setEditLeadLoading(false);
    }
  };

  const saveLead = async () => {
    if (!form.first_name.trim() || !form.phone.trim()) {
      setSaveError("First name and phone are required.");
      return;
    }

    setSaving(true);
    setSaveError("");

    const payload = {
      first_name: form.first_name.trim(),
      phone: form.phone.trim(),
    };

    const optionalFields = {
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      alternate_phone: form.alternate_phone.trim(),
      source: form.source,
      source_campaign: form.source_campaign.trim(),
      project_id: form.project_id,
      interested_unit_type: form.interested_unit_type,
      interested_bhk: form.interested_bhk,
      budget_min: form.budget_min,
      budget_max: form.budget_max,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      assigned_to: form.assigned_to.trim(),
      notes: form.notes.trim(),
      next_follow_up: form.next_follow_up ? new Date(form.next_follow_up).toISOString() : "",
    };

    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) return;
      if (["budget_min", "budget_max"].includes(key)) {
        const amount = Number(value);
        if (!Number.isNaN(amount)) {
          payload[key] = amount;
        }
        return;
      }
      payload[key] = value;
    });

    try {
      await createLead(payload);
      closeModal();
      setPage(1);
      setReloadKey((current) => current + 1);
    } catch (saveLeadError) {
      setSaveError(getApiErrorMessage(saveLeadError, "Failed to create lead."));
    } finally {
      setSaving(false);
    }
  };

  const saveLeadUpdate = async () => {
    if (!editingLeadId) return;

    if (!editForm.first_name.trim() || !editForm.phone.trim()) {
      setUpdateLeadError("First name and phone are required.");
      return;
    }

    setUpdatingLead(true);
    setUpdateLeadError("");

    const payload = {
      first_name: editForm.first_name.trim(),
      phone: editForm.phone.trim(),
      status: editForm.status,
    };

    const optionalFields = {
      last_name: editForm.last_name.trim(),
      email: editForm.email.trim(),
      assigned_to: editForm.assigned_to.trim(),
      notes: editForm.notes.trim(),
      next_follow_up: editForm.next_follow_up ? new Date(editForm.next_follow_up).toISOString() : "",
      budget_min: editForm.budget_min,
      budget_max: editForm.budget_max,
      interested_bhk: editForm.interested_bhk.trim(),
      lost_reason: editForm.lost_reason.trim(),
      score: editForm.score,
    };

    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) return;
      if (["budget_min", "budget_max", "score"].includes(key)) {
        const amount = Number(value);
        if (!Number.isNaN(amount)) {
          payload[key] = amount;
        }
        return;
      }
      payload[key] = value;
    });

    try {
      await updateLead(editingLeadId, payload);
      const nextDetail = await fetchLeadDetail(editingLeadId);

      if (selectedLeadId === editingLeadId) {
        setLeadDetail(nextDetail);
      }

      closeEditModal();
      setReloadKey((current) => current + 1);
    } catch (saveError) {
      setUpdateLeadError(getApiErrorMessage(saveError, "Failed to update lead."));
    } finally {
      setUpdatingLead(false);
    }
  };

  const saveFollowUp = async () => {
    if (!selectedLeadId) return;

    if (!followUpForm.mode || !followUpForm.scheduled_at) {
      setFollowUpError("Mode and scheduled date are required.");
      return;
    }

    setSavingFollowUp(true);
    setFollowUpError("");

    const payload = {
      mode: followUpForm.mode,
      scheduled_at: new Date(followUpForm.scheduled_at).toISOString(),
      notes: followUpForm.notes.trim(),
      outcome: followUpForm.outcome.trim(),
    };

    if (followUpForm.next_follow_up) {
      payload.next_follow_up = new Date(followUpForm.next_follow_up).toISOString();
    }

    try {
      await createLeadFollowUp(selectedLeadId, payload);
      const nextDetail = await fetchLeadDetail(selectedLeadId);
      setLeadDetail(nextDetail);
      closeFollowUpModal();
      setReloadKey((current) => current + 1);
    } catch (saveError) {
      setFollowUpError(getApiErrorMessage(saveError, "Failed to add follow-up."));
    } finally {
      setSavingFollowUp(false);
    }
  };

  const confirmDeleteLead = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteLead(deleteTarget.id);
      setLeads((current) => current.filter((item) => item.id !== deleteTarget.id));

      if (selectedLeadId === deleteTarget.id) {
        closeLeadDetailDrawer();
      }

      closeDeleteConfirm(true);
      setReloadKey((current) => current + 1);
    } catch (deleteLeadError) {
      setDeleteError(getApiErrorMessage(deleteLeadError, "Failed to delete lead."));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleStatusSelect = (nextStatus) => {
    setFilter(nextStatus);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleSourceChange = (event) => {
    setSource(event.target.value);
    setPage(1);
  };

  const handleProjectChange = (event) => {
    setProjectId(event.target.value);
    setPage(1);
  };

  const handleAssignedToChange = (event) => {
    setAssignedTo(event.target.value);
    setPage(1);
  };

  const handleWhatsAppClick = (phone) => {
    const link = getWhatsAppLink(phone);
    if (!link) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <div>
      <PageHead title="Sales – Leads" sub="Track sales enquiries from all lead sources in one place.">
        <Btn onClick={() => {
          setSaveError("");
          setForm(getInitialLeadForm(projectOptions));
          setShowModal(true);
        }}>+ Add Lead</Btn>
      </PageHead>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {STATUS_OPTIONS.map((statusOption) => {
          const active = filter === statusOption.value;
          const palette = statusTileClass[statusOption.label];

          return (
            <button
              key={statusOption.label}
              onClick={() => handleStatusSelect(statusOption.value)}
              className={`rounded-2xl border px-4 py-3 text-center shadow-sm transition ${active ? `${palette.active} ${palette.base} text-white` : `bg-white ${palette.base} ${palette.muted}`}`}
            >
              <div className={`text-[11px] font-semibold capitalize ${active ? "text-white/85" : ""}`}>{statusOption.label}</div>
              <div className="text-2xl font-bold leading-tight">{counts[statusOption.label] || 0}</div>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="mb-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold text-neutral-900">Leads ({pagination.total})</span>
            <div className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 sm:max-w-72">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              <input
                value={search}
                onChange={handleSearchChange}
                placeholder="Search leads..."
                className="w-full border-none bg-transparent text-xs text-neutral-700 outline-none"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FG label="Source">
              <Select value={source} onChange={handleSourceChange}>
                <option value="">All sources</option>
                {LEAD_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FG>

            <FG label="Project">
              <Select value={projectId} onChange={handleProjectChange}>
                <option value="">All projects</option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>{project.label}</option>
                ))}
              </Select>
            </FG>

            <FG label="Assigned To">
              <Select value={assignedTo} onChange={handleAssignedToChange}>
                <option value="">All employees</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.label}</option>
                ))}
              </Select>
            </FG>

            <FG label="Page Summary">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
                Page {pagination.page} of {pagination.totalPages || 1} · {leads.length} records
              </div>
            </FG>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading leads...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : leads.length === 0 ? (
          <div className="py-10 text-center text-sm text-neutral-500">No leads found for the selected filters.</div>
        ) : (
          <>
            <Table headers={["#", "Customer", "Mobile", "Source", "Project", "Budget", "Assigned", "Score", "Status", "Action"]}>
              {leads.map((lead, index) => (
                <TR key={lead.id}>
                  <TD className="text-xs text-neutral-400">{(page - 1) * pagination.limit + index + 1}</TD>
                  <TD>
                    <div className="font-semibold text-neutral-900">{lead.name}</div>
                    <div className="text-[11px] text-neutral-500">{lead.email}</div>
                  </TD>
                  <TD className="font-medium text-blue-600">{lead.mobile}</TD>
                  <TD><Badge color="grey">{lead.source}</Badge></TD>
                  <TD className="text-xs">{lead.project}</TD>
                  <TD className="text-xs text-neutral-600">{lead.budget}</TD>
                  <TD>{lead.assignedTo}</TD>
                  <TD><ScoreBar value={lead.score} /></TD>
                  <TD><Badge color={statusColorMap[lead.statusKey] || "grey"}>{lead.status}</Badge></TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Btn size="sm" variant="outline" onClick={() => openLeadDetailDrawer(lead.id)}>
                        View
                      </Btn>
                      <ActionBtns
                        onWhatsApp={() => handleWhatsAppClick(lead.mobile)}
                        onEdit={() => openEditLeadModal(lead.id)}
                        onDelete={() => openDeleteConfirm(lead)}
                      />
                    </div>
                  </TD>
                </TR>
              ))}
            </Table>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-neutral-500">
                Showing page {pagination.page} of {pagination.totalPages || 1} · Total {pagination.total} leads
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
        <Modal title="Add New Lead" onClose={saving ? undefined : closeModal} width="lg">
          <FormGrid cols={2}>
            <FG label="First Name *"><Input placeholder="Rahul" value={form.first_name} onChange={(event) => updateForm("first_name", event.target.value)} /></FG>
            <FG label="Last Name"><Input placeholder="Sharma" value={form.last_name} onChange={(event) => updateForm("last_name", event.target.value)} /></FG>
            <FG label="Phone *"><Input placeholder="9876543210" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} /></FG>
            <FG label="Alternate Phone"><Input placeholder="9123456780" value={form.alternate_phone} onChange={(event) => updateForm("alternate_phone", event.target.value)} /></FG>
            <FG label="Email"><Input type="email" placeholder="rahul@example.com" value={form.email} onChange={(event) => updateForm("email", event.target.value)} /></FG>
            <FG label="Source">
              <Select value={form.source} onChange={(event) => updateForm("source", event.target.value)}>
                {LEAD_SOURCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </FG>
            <FG label="Source Campaign"><Input placeholder="summer-campaign" value={form.source_campaign} onChange={(event) => updateForm("source_campaign", event.target.value)} /></FG>
            <FG label="Project">
              <Select value={form.project_id} onChange={(event) => updateForm("project_id", event.target.value)}>
                <option value="">Select project</option>
                {projectOptions.map((project) => (
                  <option key={project.id} value={project.id}>{project.label}</option>
                ))}
              </Select>
            </FG>
            <FG label="Interested Unit Type">
              <Select value={form.interested_unit_type} onChange={(event) => updateForm("interested_unit_type", event.target.value)}>
                {INTERESTED_UNIT_TYPE_OPTIONS.map((option) => <option key={option.value || "empty"} value={option.value}>{option.label}</option>)}
              </Select>
            </FG>
            <FG label="Interested BHK">
              <Select value={form.interested_bhk} onChange={(event) => updateForm("interested_bhk", event.target.value)}>
                {BHK_OPTIONS.map((option) => <option key={option || "empty"} value={option}>{option || "Select BHK"}</option>)}
              </Select>
            </FG>
            <FG label="Budget Min"><Input type="number" min="0" placeholder="5000000" value={form.budget_min} onChange={(event) => updateForm("budget_min", event.target.value)} /></FG>
            <FG label="Budget Max"><Input type="number" min="0" placeholder="7000000" value={form.budget_max} onChange={(event) => updateForm("budget_max", event.target.value)} /></FG>
            <FG label="Address" span={2}><Input placeholder="Vaishali Nagar" value={form.address} onChange={(event) => updateForm("address", event.target.value)} /></FG>
            <FG label="City"><Input placeholder="Jaipur" value={form.city} onChange={(event) => updateForm("city", event.target.value)} /></FG>
            <FG label="State"><Input placeholder="Rajasthan" value={form.state} onChange={(event) => updateForm("state", event.target.value)} /></FG>
            <FG label="Assigned To">
              <Select value={form.assigned_to} onChange={(event) => updateForm("assigned_to", event.target.value)}>
                <option value="">Select employee</option>
                {employeeOptions.map((employee) => (
                  <option key={employee.id} value={employee.id}>{employee.label}</option>
                ))}
              </Select>
            </FG>
            <FG label="Next Follow-Up"><Input type="datetime-local" value={form.next_follow_up} onChange={(event) => updateForm("next_follow_up", event.target.value)} /></FG>
            <FG label="Notes" span={2}><Textarea placeholder="Interested in park facing unit" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} /></FG>
          </FormGrid>
          {saveError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div> : null}
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={closeModal} disabled={saving}>Cancel</Btn>
            <Btn onClick={saveLead} disabled={saving}>{saving ? "Saving..." : "Save Lead"}</Btn>
          </div>
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Modify Lead" onClose={updatingLead ? undefined : closeEditModal} width="lg">
          {editLeadLoading ? (
            <div className="py-10 text-center text-sm text-neutral-500">Loading lead details...</div>
          ) : (
            <>
              <FormGrid cols={2}>
                <FG label="First Name *"><Input value={editForm.first_name} onChange={(event) => updateEditForm("first_name", event.target.value)} placeholder="Rahul" /></FG>
                <FG label="Last Name"><Input value={editForm.last_name} onChange={(event) => updateEditForm("last_name", event.target.value)} placeholder="Sharma" /></FG>
                <FG label="Email"><Input type="email" value={editForm.email} onChange={(event) => updateEditForm("email", event.target.value)} placeholder="rahul@example.com" /></FG>
                <FG label="Phone *"><Input value={editForm.phone} onChange={(event) => updateEditForm("phone", event.target.value)} placeholder="9876543210" /></FG>
                <FG label="Status">
                  <Select value={editForm.status} onChange={(event) => updateEditForm("status", event.target.value)}>
                    {LEAD_EDITABLE_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                </FG>
                <FG label="Assigned To">
                  <Select value={editForm.assigned_to} onChange={(event) => updateEditForm("assigned_to", event.target.value)}>
                    <option value="">Select employee</option>
                    {employeeOptions.map((employee) => (
                      <option key={employee.id} value={employee.id}>{employee.label}</option>
                    ))}
                  </Select>
                </FG>
                <FG label="Interested BHK"><Input value={editForm.interested_bhk} onChange={(event) => updateEditForm("interested_bhk", event.target.value)} placeholder="3 BHK" /></FG>
                <FG label="Score"><Input type="number" min="0" max="100" value={editForm.score} onChange={(event) => updateEditForm("score", event.target.value)} placeholder="85" /></FG>
                <FG label="Budget Min"><Input type="number" min="0" value={editForm.budget_min} onChange={(event) => updateEditForm("budget_min", event.target.value)} placeholder="5000000" /></FG>
                <FG label="Budget Max"><Input type="number" min="0" value={editForm.budget_max} onChange={(event) => updateEditForm("budget_max", event.target.value)} placeholder="7000000" /></FG>
                <FG label="Next Follow-Up"><Input type="datetime-local" value={editForm.next_follow_up} onChange={(event) => updateEditForm("next_follow_up", event.target.value)} /></FG>
                <FG label="Lost Reason"><Input value={editForm.lost_reason} onChange={(event) => updateEditForm("lost_reason", event.target.value)} placeholder="Reason if lead is lost" /></FG>
                <FG label="Notes" span={2}><Textarea value={editForm.notes} onChange={(event) => updateEditForm("notes", event.target.value)} placeholder="Client wants final price discussion" /></FG>
              </FormGrid>
              {updateLeadError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{updateLeadError}</div> : null}
              <div className="mt-5 flex justify-end gap-2">
                <Btn variant="outline" onClick={closeEditModal} disabled={updatingLead}>Cancel</Btn>
                <Btn onClick={saveLeadUpdate} disabled={updatingLead}>{updatingLead ? "Updating..." : "Update Lead"}</Btn>
              </div>
            </>
          )}
        </Modal>
      )}

      {showFollowUpModal && (
        <Modal title="Add Follow-Up" onClose={savingFollowUp ? undefined : closeFollowUpModal} width="md">
          <FormGrid cols={2}>
            <FG label="Mode *">
              <Select value={followUpForm.mode} onChange={(event) => updateFollowUpForm("mode", event.target.value)}>
                {FOLLOW_UP_MODE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FG>
            <FG label="Scheduled At *"><Input type="datetime-local" value={followUpForm.scheduled_at} onChange={(event) => updateFollowUpForm("scheduled_at", event.target.value)} /></FG>
            <FG label="Outcome"><Input value={followUpForm.outcome} onChange={(event) => updateFollowUpForm("outcome", event.target.value)} placeholder="Interested" /></FG>
            <FG label="Next Follow-Up"><Input type="datetime-local" value={followUpForm.next_follow_up} onChange={(event) => updateFollowUpForm("next_follow_up", event.target.value)} /></FG>
            <FG label="Notes" span={2}><Textarea value={followUpForm.notes} onChange={(event) => updateFollowUpForm("notes", event.target.value)} placeholder="Customer asked for pricing details" /></FG>
          </FormGrid>
          {followUpError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{followUpError}</div> : null}
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={closeFollowUpModal} disabled={savingFollowUp}>Cancel</Btn>
            <Btn onClick={saveFollowUp} disabled={savingFollowUp}>{savingFollowUp ? "Saving..." : "Add Follow-Up"}</Btn>
          </div>
        </Modal>
      )}

      {selectedLeadId && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-neutral-950/40" onClick={closeLeadDetailDrawer} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
              <div>
                <div className="text-lg font-bold text-neutral-900">Lead Information</div>
                <div className="mt-1 text-sm text-neutral-500">View complete lead details, follow-ups, and activity history.</div>
              </div>
              <div className="flex items-center gap-2">
                <Btn size="sm" variant="outline" onClick={() => openEditLeadModal(selectedLeadId)} disabled={leadDetailLoading || !leadDetail}>
                  Modify Lead
                </Btn>
                <button type="button" onClick={closeLeadDetailDrawer} className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50">
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {leadDetailLoading ? (
                <div className="py-12 text-center text-sm text-neutral-500">Loading lead information...</div>
              ) : leadDetailError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{leadDetailError}</div>
              ) : !leadDetail ? (
                <div className="py-12 text-center text-sm text-neutral-500">Lead information is not available.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card className="sm:col-span-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-xl font-bold text-neutral-900">{[leadDetail.first_name, leadDetail.last_name].filter(Boolean).join(" ") || "Unnamed Lead"}</div>
                        <div className="mt-1 text-sm text-neutral-500">{formatValue(leadDetail.project_name)} • Assigned to {formatValue(leadDetail.assigned_to_name)}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge color={statusColorMap[String(leadDetail.status || "").toLowerCase()] || "grey"}>{formatStatus(leadDetail.status)}</Badge>
                        <Badge color="blue">Score {Number(leadDetail.score || 0)}</Badge>
                        <Badge color="grey">{formatSource(leadDetail.source)}</Badge>
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Contact details</div>
                    <div className="mt-3 space-y-3 text-sm">
                      <DetailRow label="Phone" value={leadDetail.phone} valueClassName="text-blue-600" />
                      <DetailRow label="Alternate Phone" value={leadDetail.alternate_phone} />
                      <DetailRow label="Email" value={leadDetail.email} />
                      <DetailRow label="Address" value={leadDetail.address} />
                      <DetailRow label="City" value={leadDetail.city} />
                      <DetailRow label="State" value={leadDetail.state} />
                    </div>
                  </Card>

                  <Card>
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Lead profile</div>
                    <div className="mt-3 space-y-3 text-sm">
                      <DetailRow label="Lead ID" value={leadDetail.id} />
                      <DetailRow label="Project" value={leadDetail.project_name} />
                      <DetailRow label="Source" value={formatSource(leadDetail.source)} />
                      <DetailRow label="Campaign" value={leadDetail.source_campaign} />
                      <DetailRow label="Unit Type" value={formatLabel(leadDetail.interested_unit_type)} />
                      <DetailRow label="BHK" value={leadDetail.interested_bhk} />
                    </div>
                  </Card>

                  <Card>
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Budget & follow-up</div>
                    <div className="mt-3 space-y-3 text-sm">
                      <DetailRow label="Budget Range" value={formatCurrencyRange(leadDetail.budget_min, leadDetail.budget_max)} />
                      <DetailRow label="Last Follow-Up" value={formatDateTime(leadDetail.last_follow_up)} />
                      <DetailRow label="Next Follow-Up" value={formatDateTime(leadDetail.next_follow_up)} valueClassName="text-blue-600" />
                      <DetailRow label="Lost Reason" value={leadDetail.lost_reason} />
                      <DetailRow label="Created" value={formatDateTime(leadDetail.created_at)} />
                      <DetailRow label="Updated" value={formatDateTime(leadDetail.updated_at)} />
                    </div>
                  </Card>

                  <Card>
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Ownership</div>
                    <div className="mt-3 space-y-3 text-sm">
                      <DetailRow label="Company ID" value={leadDetail.company_id} />
                      <DetailRow label="Project ID" value={leadDetail.project_id} />
                      <DetailRow label="Assigned To" value={leadDetail.assigned_to_name || leadDetail.assigned_to} />
                      <DetailRow label="Created By" value={leadDetail.created_by} />
                      <DetailRow label="Created Date" value={formatDate(leadDetail.created_at)} />
                    </div>
                  </Card>

                  <Card className="sm:col-span-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Notes</div>
                    <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-700">
                      {leadDetail.notes ? leadDetail.notes : "No notes available for this lead."}
                    </div>
                  </Card>

                  <Card className="sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Follow-ups</div>
                      <div className="flex items-center gap-2">
                        <Badge color="grey">{Array.isArray(leadDetail.follow_ups) ? leadDetail.follow_ups.length : 0}</Badge>
                        <Btn size="sm" variant="outline" onClick={openFollowUpModal}>+ Add Follow-Up</Btn>
                      </div>
                    </div>

                    {Array.isArray(leadDetail.follow_ups) && leadDetail.follow_ups.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {leadDetail.follow_ups.map((followUp) => (
                          <div key={followUp.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-neutral-900">{formatLabel(followUp.mode)} • {formatValue(followUp.outcome)}</div>
                                <div className="mt-1 text-xs text-neutral-500">Scheduled {formatDateTime(followUp.scheduled_at)} • Completed {formatDateTime(followUp.completed_at)}</div>
                              </div>
                              <Badge color="blue">{formatValue(followUp.done_by_name)}</Badge>
                            </div>
                            <div className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
                              <DetailRow label="Next Follow-Up" value={formatDateTime(followUp.next_follow_up)} />
                              <DetailRow label="Created" value={formatDateTime(followUp.created_at)} />
                            </div>
                            <div className="mt-3 rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-700">
                              {followUp.notes ? followUp.notes : "No notes added for this follow-up."}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-sm text-neutral-500">No follow-ups recorded for this lead.</div>
                    )}
                  </Card>

                  <Card className="sm:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Activities</div>
                      <Badge color="grey">{Array.isArray(leadDetail.activities) ? leadDetail.activities.length : 0}</Badge>
                    </div>

                    {Array.isArray(leadDetail.activities) && leadDetail.activities.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {leadDetail.activities.map((activity) => (
                          <div key={activity.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-semibold text-neutral-900">{formatValue(activity.description)}</div>
                                <div className="mt-1 text-xs text-neutral-500">{formatLabel(activity.activity_type)} • {formatDateTime(activity.performed_at)}</div>
                              </div>
                              <Badge color="grey">{formatValue(activity.performed_by_name)}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-dashed border-neutral-200 px-4 py-6 text-sm text-neutral-500">No activities found for this lead.</div>
                    )}
                  </Card>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Lead"
          message={`Are you sure you want to delete ${deleteTarget.name || "this lead"}? This action cannot be undone.`}
          confirmText="Delete"
          confirmClassName="border border-red-700 bg-red-700 text-white hover:bg-red-800"
          onConfirm={confirmDeleteLead}
          onClose={closeDeleteConfirm}
          loading={deleteLoading}
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Phone: {deleteTarget.mobile || "—"}
            </div>
            {deleteError ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{deleteError}</div> : null}
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}