import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLands } from "../../lib/lands";
import { getProjectById, getProjectTowers, getProjectUnits } from "../../lib/projects";
import { Badge, Btn, Card, PageHead, SummaryStat, summaryGridClass } from "../ui";

const statusColor = { Active: "green", Planning: "blue", Completed: "grey", "On Hold": "orange", "Not Started": "blue", Inactive: "grey" };

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getDetails(data) {
  if (data?.data) return data.data;
  return data;
}

function formatProjectType(value = "") {
  return (
    value
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ") || "—"
  );
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

function formatDisplayDate(value) {
  if (!value) return "—";

  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
    const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  return value;
}

function formatNumber(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "—";
  return new Intl.NumberFormat("en-IN").format(numericValue);
}

function mapLandOptions(data) {
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

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-neutral-900">{value || "—"}</div>
    </div>
  );
}

export default function ProjectDetails() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [lands, setLands] = useState([]);
  const [towers, setTowers] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadProjectData = async () => {
      setLoading(true);
      setError("");

      try {
        const [projectResponse, towersResponse, unitsResponse, landsResponse] = await Promise.all([
          getProjectById(projectId),
          getProjectTowers(projectId),
          getProjectUnits(projectId),
          getLands(),
        ]);

        if (!active) return;

        setProject(getDetails(projectResponse));
        setTowers(getItems(towersResponse));
        setUnits(getItems(unitsResponse));
        setLands(mapLandOptions(landsResponse));
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.response?.data?.message || loadError?.message || "Failed to load project details.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (projectId) {
      loadProjectData();
    }

    return () => {
      active = false;
    };
  }, [projectId]);

  const landLabel = useMemo(() => lands.find((land) => String(land.id) === String(project?.land_id))?.label || "—", [lands, project?.land_id]);

  const summary = useMemo(() => {
    const availableUnits = units.filter((unit) => String(unit.status || "").toLowerCase() === "available").length;
    const soldUnits = units.filter((unit) => String(unit.status || "").toLowerCase() === "sold").length;

    return {
      totalTowers: towers.length,
      totalUnits: units.length,
      availableUnits,
      soldUnits,
    };
  }, [towers, units]);

  const infoRows = useMemo(() => {
    if (!project) return [];

    return [
      { label: "Project Name", value: project.name || "—" },
      { label: "Project Code", value: project.code || "—" },
      { label: "Project Type", value: formatProjectType(project.type) },
      { label: "Status", value: formatProjectStatus(project.status, project.is_active ?? true) },
      { label: "Land", value: landLabel },
      { label: "Total Area (sqft)", value: formatNumber(project.total_area_sqft) },
      { label: "Launch Date", value: formatDisplayDate(project.launch_date) },
      { label: "Possession Date", value: formatDisplayDate(project.possession_date) },
      { label: "RERA Number", value: project.rera_number || "—" },
      { label: "RERA Expiry", value: formatDisplayDate(project.rera_expiry_date) },
      { label: "Address", value: project.address || "—" },
      { label: "City", value: project.city || "—" },
      { label: "State", value: project.state || "—" },
      { label: "Pincode", value: project.pincode || "—" },
      { label: "Latitude", value: project.latitude ?? "—" },
      { label: "Longitude", value: project.longitude ?? "—" },
      { label: "Created On", value: formatDisplayDate(project.created_at) },
      { label: "Updated On", value: formatDisplayDate(project.updated_at) },
    ];
  }, [landLabel, project]);

  return (
    <div>
      <PageHead
        title={`Project Details${project?.name ? ` / ${project.name}` : ""}`}
        sub={project?.code ? `Review complete information for ${project.code}` : "Review complete project information"}
      >
        <Btn variant="outline" onClick={() => navigate("/master/projects")}>Back to Projects</Btn>
      </PageHead>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Project navigation</div>
            <div className="mt-1 text-xs text-neutral-500">Open project inventory, towers, units, amenities, and documents directly from here.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => navigate(`/master/projects/${projectId}`)}>Project Details</Btn>
            <Btn onClick={() => navigate(`/master/projects/${projectId}/towers`)}> Tower List</Btn>
            <Btn onClick={() => navigate(`/master/projects/${projectId}/units`)}>Unit List</Btn>
            <Btn onClick={() => navigate(`/master/projects/${projectId}/amenities`)}>Amenities</Btn>
            <Btn onClick={() => navigate(`/master/projects/${projectId}/documents`)}>Documents</Btn>
          </div>
        </div>
      </Card>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Towers" value={summary.totalTowers} colorClass="text-violet-600" />
        <SummaryStat label="Total Units" value={summary.totalUnits} colorClass="text-blue-600" />
        <SummaryStat label="Available Units" value={summary.availableUnits} colorClass="text-emerald-600" />
        <SummaryStat label="Sold Units" value={summary.soldUnits} colorClass="text-red-700" />
      </div>

      {loading ? (
        <Card>
          <div className="py-10 text-center text-sm text-neutral-500">Loading project details...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card>
            <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-xl font-bold text-neutral-900">{project?.name || "—"}</div>
                <div className="mt-1 text-sm text-neutral-500">{project?.description || "No description available."}</div>
              </div>
              <Badge color={statusColor[formatProjectStatus(project?.status, project?.is_active ?? true)] || "grey"}>
                {formatProjectStatus(project?.status, project?.is_active ?? true)}
              </Badge>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {infoRows.map((item) => (
                <DetailItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
