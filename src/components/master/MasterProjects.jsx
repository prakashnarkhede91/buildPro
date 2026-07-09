import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, deleteProject, getProjectById, getProjects, updateProject } from "../../lib/projects";
import { getLands } from "../../lib/lands";
import {
  ActionBtns,
  Badge,
  Btn,
  Card,
  ConfirmModal,
  FG,
  FormGrid,
  Input,
  Modal,
  PageHead,
  Select,
  SummaryStat,
  TD,
  TR,
  Table,
  Textarea,
  summaryGridClass,
} from "../ui";
import { PROJECT_TYPE, PROJECT_TYPE_OPTIONS } from "../../lib/enums";

const statusColor = { Active: "green", Planning: "blue", Completed: "grey", "On Hold": "orange", "Not Started": "blue", Inactive: "grey" };
const initialForm = {
  name: "",
  code: "",
  type: PROJECT_TYPE.RESIDENTIAL,
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  rera_number: "",
  rera_expiry_date: "",
  land_id: "",
  total_area_sqft: "",
  launch_date: "",
  possession_date: "",
  latitude: "",
  longitude: "",
};

function formatProjectType(value = "") {
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

  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
    const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
  }

  return value;
}

function toDateInputValue(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function formatProjectStatus(status = "", isActive = true) {
  if (!isActive) return "Inactive";
  if (!status) return "Planning";

  return status
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getProjectList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getProjectDetails(data) {
  if (data?.data) return data.data;
  return data;
}

function mapProjectToRow(project) {
  return {
    id: project.id ?? Date.now(),
    name: project.name || "—",
    code: project.code || "—",
    type: formatProjectType(project.type),
    location: project.location || [project.city, project.state].filter(Boolean).join(", ") || project.address || "—",
    totalAreaSqft: Number(project.total_area_sqft ?? project.units ?? 0),
    isActive: project.is_active ?? true,
    status: formatProjectStatus(project.status, project.is_active ?? true),
    start: formatDisplayDate(project.launch_date || project.start),
    reraNumber: project.rera_number || "—",
  };
}

function mapProjectToForm(project) {
  return {
    name: project?.name || "",
    code: project?.code || "",
    type: project?.type || "residential",
    description: project?.description || "",
    address: project?.address || "",
    city: project?.city || "",
    state: project?.state || "",
    pincode: project?.pincode || "",
    rera_number: project?.rera_number || "",
    rera_expiry_date: toDateInputValue(project?.rera_expiry_date),
    land_id: project?.land_id || "",
    total_area_sqft: project?.total_area_sqft == null ? "" : String(Number(project.total_area_sqft) || 0),
    launch_date: toDateInputValue(project?.launch_date),
    possession_date: toDateInputValue(project?.possession_date),
    latitude: project?.latitude == null ? "" : String(project.latitude),
    longitude: project?.longitude == null ? "" : String(project.longitude),
  };
}

function getLandOptions(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];

  return list.map((land, index) => ({
    id: land.id || land._id || land.land_id || String(index),
    label:
      land.survey_number ||
      land.title ||
      land.code ||
      land.survey_no ||
      [land.location, land.city].filter(Boolean).join(", ") ||
      `Land ${index + 1}`,
  }));
}

export default function MasterProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [lands, setLands] = useState([]);
  const [landsLoading, setLandsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      setProjectsLoading(true);
      setProjectsError("");

      try {
        const response = await getProjects();
        if (!active) return;
        setProjects(getProjectList(response).map(mapProjectToRow));
      } catch (error) {
        if (!active) return;
        setProjectsError(error?.response?.data?.message || error?.message || "Failed to load projects.");
      } finally {
        if (active) {
          setProjectsLoading(false);
        }
      }
    };

    loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!showModal || lands.length) return;

    let active = true;

    const loadLands = async () => {
      setLandsLoading(true);

      try {
        const response = await getLands();
        if (!active) return;
        setLands(getLandOptions(response));
      } catch (error) {
        if (!active) return;
        setFormError(error?.response?.data?.message || error?.message || "Failed to load lands.");
      } finally {
        if (active) {
          setLandsLoading(false);
        }
      }
    };

    loadLands();

    return () => {
      active = false;
    };
  }, [showModal, lands.length]);

  const closeModal = () => {
    setShowModal(false);
    setEditingProjectId("");
    setModalLoading(false);
    setSubmitting(false);
    setFormError("");
    setForm(initialForm);
  };

  const openCreateModal = () => {
    setEditingProjectId("");
    setForm(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const handleEdit = async (projectId) => {
    setShowModal(true);
    setEditingProjectId(projectId);
    setModalLoading(true);
    setFormError("");

    try {
      const response = await getProjectById(projectId);
      const project = getProjectDetails(response);
      setForm(mapProjectToForm(project));
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || "Failed to load project details.");
    } finally {
      setModalLoading(false);
    }
  };

  const save = async () => {
    if (!form.name || !form.code || !form.city || !form.launch_date || !form.land_id) {
      setFormError("Please fill all required fields.");
      return;
    }

    const payload = {
      ...form,
      total_area_sqft: Number(form.total_area_sqft) || 0,
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
    };

    setSubmitting(true);
    setFormError("");

    try {
      const response = editingProjectId ? await updateProject(editingProjectId, payload) : await createProject(payload);
      const savedProject = getProjectDetails(response) || payload;

      setProjects((current) => {
        const nextRow = mapProjectToRow(savedProject);

        if (editingProjectId) {
          return current.map((project) => (project.id === editingProjectId ? nextRow : project));
        }

        return [...current, nextRow];
      });

      closeModal();
    } catch (error) {
      setFormError(error?.response?.data?.message || error?.message || `Failed to ${editingProjectId ? "update" : "create"} project. Please try again.`);
      setSubmitting(false);
    }
  };

  const askDelete = (project) => {
    setDeleteTarget(project);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    setDeleting(true);

    try {
      const response = await deleteProject(deleteTarget.id);
      const deletedProject = getProjectDetails(response);

      setProjects((current) =>
        current.map((project) => {
          if (project.id !== deleteTarget.id) return project;
          if (deletedProject?.id) return mapProjectToRow(deletedProject);

          return {
            ...project,
            isActive: false,
            status: "Inactive",
          };
        })
      );

      setDeleteTarget(null);
    } catch (error) {
      setProjectsError(error?.response?.data?.message || error?.message || "Failed to deactivate project.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHead title="Master / Projects" sub="Manage project master records and configurations">
        <Btn onClick={openCreateModal}>+ Add Project</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Active Projects" value={projects.filter((p) => p.isActive).length} colorClass="text-emerald-600" />
        <SummaryStat label="Planning Phase" value={projects.filter((p) => p.status === "Planning" || p.status === "Not Started").length} colorClass="text-blue-600" />
        <SummaryStat label="Completed" value={projects.filter((p) => p.status === "Completed").length} colorClass="text-neutral-600" />
        <SummaryStat label="Total Area (sqft)" value={projects.reduce((sum, project) => sum + project.totalAreaSqft, 0)} colorClass="text-red-700" />
      </div>

      <Card>
        {projectsLoading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading projects...</div>
        ) : projectsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{projectsError}</div>
        ) : (
          <Table headers={["#", "Project Name", "Code", "Type", "Location", "Area (sqft)", "Status", "Launch", "Action"]}>
            {projects.map((p, i) => (
              <TR key={p.id}>
                <TD className="text-xs text-neutral-400">{i + 1}</TD>
                <TD className="font-semibold text-neutral-900">{p.name}</TD>
                <TD className="font-mono text-xs text-neutral-500">{p.code}</TD>
                <TD>
                  <Badge color="blue">{p.type}</Badge>
                </TD>
                <TD>{p.location}</TD>
                <TD className="font-semibold text-neutral-900">{p.totalAreaSqft}</TD>
                <TD>
                  <Badge color={statusColor[p.status] || "grey"}>{p.status}</Badge>
                </TD>
                <TD className="text-xs text-neutral-500">{p.start}</TD>
                <TD>
                  <div className="flex flex-wrap items-center gap-2">
                    <Btn size="sm" variant="outline" onClick={() => navigate(`/master/projects/${p.id}`)}>Project Details</Btn>
                    <ActionBtns onAddTower={() => navigate(`/master/projects/${p.id}/towers`)} onAddUnit={() => navigate(`/master/projects/${p.id}/units`)} onEdit={() => handleEdit(p.id)} onDelete={() => askDelete(p)} />
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {showModal && (
        <Modal title={editingProjectId ? "Edit Project" : "Add New Project"} onClose={closeModal} width="lg">
          {modalLoading ? (
            <div className="py-10 text-center text-sm text-neutral-500">Loading project details...</div>
          ) : (
            <FormGrid cols={3}>
              <FG label="Project Name *"><Input placeholder="e.g. Kastury Courtyard Phase 2" value={form.name} onChange={(e) => f("name", e.target.value)} /></FG>
              <FG label="Project Code *"><Input placeholder="e.g. KC-2026-P2" value={form.code} onChange={(e) => f("code", e.target.value)} /></FG>
              <FG label="Project Type"><Select value={form.type} onChange={(e) => f("type", e.target.value)}>{PROJECT_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</Select></FG>
              <FG label="Description" span={3}><Textarea placeholder="Premium residential township project" value={form.description} onChange={(e) => f("description", e.target.value)} /></FG>
              <FG label="Address"><Input placeholder="e.g. Indrapuri Extension" value={form.address} onChange={(e) => f("address", e.target.value)} /></FG>
              <FG label="City *"><Input placeholder="e.g. Bhopal" value={form.city} onChange={(e) => f("city", e.target.value)} /></FG>
              <FG label="State"><Input placeholder="e.g. Madhya Pradesh" value={form.state} onChange={(e) => f("state", e.target.value)} /></FG>
              <FG label="Pincode"><Input inputMode="numeric" placeholder="e.g. 462021" value={form.pincode} onChange={(e) => f("pincode", e.target.value)} /></FG>
              <FG label="RERA Number"><Input placeholder="e.g. MP/02/2026/002" value={form.rera_number} onChange={(e) => f("rera_number", e.target.value)} /></FG>
              <FG label="RERA Expiry Date"><Input type="date" value={form.rera_expiry_date} onChange={(e) => f("rera_expiry_date", e.target.value)} /></FG>
              <FG label="Land *">
                <Select value={form.land_id} onChange={(e) => f("land_id", e.target.value)} disabled={landsLoading || !lands.length}>
                  <option value="">{landsLoading ? "Loading lands..." : lands.length ? "Select land" : "No lands available"}</option>
                  {lands.map((land) => (
                    <option key={land.id} value={land.id}>{land.label}</option>
                  ))}
                </Select>
              </FG>
              <FG label="Total Area (sqft)"><Input type="number" placeholder="e.g. 85000" value={form.total_area_sqft} onChange={(e) => f("total_area_sqft", e.target.value)} /></FG>
              <FG label="Launch Date *"><Input type="date" value={form.launch_date} onChange={(e) => f("launch_date", e.target.value)} /></FG>
              <FG label="Possession Date"><Input type="date" value={form.possession_date} onChange={(e) => f("possession_date", e.target.value)} /></FG>
              <FG label="Latitude"><Input type="number" step="any" placeholder="e.g. 23.259933" value={form.latitude} onChange={(e) => f("latitude", e.target.value)} /></FG>
              <FG label="Longitude"><Input type="number" step="any" placeholder="e.g. 77.412615" value={form.longitude} onChange={(e) => f("longitude", e.target.value)} /></FG>
            </FormGrid>
          )}
          {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={closeModal} disabled={submitting || modalLoading}>Cancel</Btn>
            <Btn onClick={save} disabled={submitting || modalLoading}>{submitting ? "Saving..." : editingProjectId ? "Update Project" : "Save Project"}</Btn>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Deactivate Project"
          message={`Are you sure you want to deactivate ${deleteTarget.name}?`}
          confirmText="Deactivate"
          confirmClassName="border-red-700 bg-red-700 hover:bg-red-800"
          loading={deleting}
          onClose={() => !deleting && setDeleteTarget(null)}
          onConfirm={confirmDelete}
        >
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
            This will call the deactivate API and mark the project as inactive.
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
