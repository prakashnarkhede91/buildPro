import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProjectUnit, deleteProjectUnit, getProjectById, getProjectTowers, getProjectUnits, updateProjectUnit } from "../../lib/projects";
import { ActionBtns, Badge, Btn, Card, ConfirmModal, FG, FormGrid, Input, Modal, PageHead, Select, SummaryStat, Table, TD, TR, Textarea, summaryGridClass } from "../ui";
import { UNIT_STATUS, UNIT_STATUS_OPTIONS, UNIT_TYPE, UNIT_TYPE_OPTIONS } from "../../lib/enums";

const unitStatusColor = {
  available: "green",
  sold: "red",
  booked: "orange",
  hold: "yellow",
  on_hold: "yellow",
  blocked: "grey",
  reserved: "purple",
};

const unitStatusTone = {
  available: "border-emerald-300 bg-emerald-50 text-emerald-700",
  sold: "border-red-300 bg-red-50 text-red-700",
  booked: "border-amber-300 bg-amber-50 text-amber-700",
  hold: "border-yellow-300 bg-yellow-50 text-yellow-700",
  on_hold: "border-yellow-300 bg-yellow-50 text-yellow-700",
  blocked: "border-neutral-300 bg-neutral-100 text-neutral-600",
  reserved: "border-purple-300 bg-purple-50 text-purple-700",
};

const statusLegend = [
  { key: UNIT_STATUS.AVAILABLE, label: "Available" },
  { key: UNIT_STATUS.ON_HOLD,   label: "On Hold" },
  { key: UNIT_STATUS.SOLD,      label: "Sold" },
  { key: UNIT_STATUS.BLOCKED,   label: "Blocked" },
];

// Use centralized enum for unit status dropdown
const unitStatusOptions = UNIT_STATUS_OPTIONS;

const initialForm = {
  tower_id: "",
  unit_number: "",
  floor_number: "",
  unit_type: UNIT_TYPE.APARTMENT,
  bhk_type: "",
  super_area_sqft: "",
  carpet_area_sqft: "",
  built_up_area_sqft: "",
  facing: "",
  base_price: "",
  current_price: "",
  status: UNIT_STATUS.AVAILABLE,
  is_corner: false,
  is_park_facing: false,
  floor_plan_url: "",
  notes: "",
};

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

function getApiErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
}

function getValue(data, ...keys) {
  for (const key of keys) {
    if (data?.[key] !== null && data?.[key] !== undefined) {
      return data[key];
    }
  }

  return undefined;
}

function getTowerOptions(data) {
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];

  return list.map((tower, index) => ({
    id: tower.id || tower._id || `tower-${index + 1}`,
    label: tower.name || tower.tower_name || `Tower ${index + 1}`,
  }));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNumber(value, digits = 0) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "—";

  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(numericValue);
}

function formatCurrency(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
}

function formatStatus(value = "") {
  if (!value) return "Unknown";

  return value
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function normalizeStatusKey(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function getStatusPresentation(statusKey = "") {
  if (["hold", "on_hold", "booked", "reserved"].includes(statusKey)) {
    return { badgeColor: unitStatusColor[statusKey] || "yellow", tileClass: unitStatusTone[statusKey] || unitStatusTone.hold };
  }

  return {
    badgeColor: unitStatusColor[statusKey] || "grey",
    tileClass: unitStatusTone[statusKey] || unitStatusTone.blocked,
  };
}

function getFloorLabel(value) {
  const floor = Number(value);

  if (Number.isNaN(floor)) return "Unknown Floor";
  if (floor === 0) return "Ground Floor";
  if (floor < 0) return `Basement ${Math.abs(floor)}`;

  const mod10 = floor % 10;
  const mod100 = floor % 100;
  let suffix = "th";

  if (mod10 === 1 && mod100 !== 11) suffix = "st";
  else if (mod10 === 2 && mod100 !== 12) suffix = "nd";
  else if (mod10 === 3 && mod100 !== 13) suffix = "rd";

  return `${floor}${suffix} Floor`;
}

function formatFieldLabel(key = "") {
  const labelMap = {
    id: "Unit ID",
    _id: "Unit ID",
    unit_id: "Unit ID",
    tower_id: "Tower ID",
    tower_name: "Tower Name",
    unit_number: "Unit Number",
    floor_number: "Floor Number",
    unit_type: "Unit Type",
    bhk_type: "BHK Type",
    super_area_sqft: "Super Area",
    carpet_area_sqft: "Carpet Area",
    built_up_area_sqft: "Built-up Area",
    base_price: "Base Price",
    current_price: "Current Price",
    is_corner: "Corner Unit",
    is_park_facing: "Park Facing",
    created_at: "Created On",
    updated_at: "Updated On",
  };

  if (labelMap[key]) return labelMap[key];

  return String(key || "")
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDetailValue(key, value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";

  const normalizedKey = normalizeStatusKey(key);
  const numericValue = Number(value);
  const isNumeric = value !== "" && !Number.isNaN(numericValue);

  if (normalizedKey.includes("price") || normalizedKey.includes("amount")) {
    return isNumeric ? formatCurrency(numericValue) : String(value);
  }

  if (normalizedKey.includes("area") || normalizedKey.includes("sqft")) {
    return isNumeric ? `${formatNumber(numericValue)} sqft` : String(value);
  }

  if (normalizedKey.endsWith("_at") || normalizedKey.includes("date")) {
    return formatDate(value);
  }

  return String(value);
}

function getAdditionalUnitDetails(unit) {
  const raw = unit?.raw || {};
  const excludedKeys = new Set([
    "id",
    "_id",
    "unit_id",
    "tower_id",
    "tower_name",
    "unit_number",
    "floor_number",
    "unit_type",
    "bhk_type",
    "super_area_sqft",
    "carpet_area_sqft",
    "built_up_area_sqft",
    "facing",
    "base_price",
    "current_price",
    "status",
    "is_corner",
    "is_park_facing",
    "floor_plan_url",
    "notes",
    "created_at",
    "updated_at",
  ]);

  return Object.entries(raw)
    .filter(([key, value]) => !excludedKeys.has(key) && value !== null && value !== undefined && value !== "")
    .map(([key, value]) => ({
      key,
      label: formatFieldLabel(key),
      value: formatDetailValue(key, value),
    }));
}

function DetailRow({ label, value, valueClassName = "text-neutral-900" }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className={`text-right font-medium ${valueClassName}`}>{value}</span>
    </div>
  );
}

function getFormFromUnit(unit) {
  const source = unit?.raw || unit || {};

  return {
    tower_id: getValue(source, "tower_id", "towerId") || "",
    unit_number: getValue(source, "unit_number", "unitNumber") || "",
    floor_number: getValue(source, "floor_number", "floorNumber") ?? "",
    unit_type: getValue(source, "unit_type", "unitType") || UNIT_TYPE.APARTMENT,
    bhk_type: getValue(source, "bhk_type", "bhkType") || "",
    super_area_sqft: getValue(source, "super_area_sqft", "superAreaSqft") ?? "",
    carpet_area_sqft: getValue(source, "carpet_area_sqft", "carpetAreaSqft") ?? "",
    built_up_area_sqft: getValue(source, "built_up_area_sqft", "builtUpAreaSqft") ?? "",
    facing: getValue(source, "facing") || "",
    base_price: getValue(source, "base_price", "basePrice") ?? "",
    current_price: getValue(source, "current_price", "currentPrice") ?? "",
    status: normalizeStatusKey(getValue(source, "status", "statusKey") || "available") || "available",
    is_corner: Boolean(getValue(source, "is_corner", "isCorner")),
    is_park_facing: Boolean(getValue(source, "is_park_facing", "isParkFacing")),
    floor_plan_url: getValue(source, "floor_plan_url", "floorPlanUrl") || "",
    notes: getValue(source, "notes") && getValue(source, "notes") !== "—" ? getValue(source, "notes") : "",
  };
}

function buildUnitPayload(form) {
  return {
    tower_id: form.tower_id,
    unit_number: form.unit_number,
    floor_number: Number(form.floor_number),
    unit_type: form.unit_type,
    bhk_type: form.bhk_type || null,
    super_area_sqft: form.super_area_sqft === "" ? null : Number(form.super_area_sqft),
    carpet_area_sqft: form.carpet_area_sqft === "" ? null : Number(form.carpet_area_sqft),
    built_up_area_sqft: form.built_up_area_sqft === "" ? null : Number(form.built_up_area_sqft),
    facing: form.facing || null,
    base_price: form.base_price === "" ? null : Number(form.base_price),
    current_price: form.current_price === "" ? null : Number(form.current_price),
    status: form.status || "available",
    is_corner: Boolean(form.is_corner),
    is_park_facing: Boolean(form.is_park_facing),
    floor_plan_url: form.floor_plan_url || null,
    notes: form.notes || null,
  };
}

function mapUnitToRow(unit) {
  const statusKey = normalizeStatusKey(unit.status);

  return {
    id: unit.id || unit._id || unit.unit_id || crypto.randomUUID(),
    rawId: unit.id || unit._id || unit.unit_id || "—",
    towerId: unit.tower_id || unit.towerId || "",
    towerName: unit.tower_name || "—",
    unitNumber: unit.unit_number || "—",
    floorNumber: unit.floor_number ?? "—",
    unitType: unit.unit_type || "—",
    bhkType: unit.bhk_type || "—",
    superAreaSqft: Number(unit.super_area_sqft || 0),
    carpetAreaSqft: Number(unit.carpet_area_sqft || 0),
    builtUpAreaSqft: Number(unit.built_up_area_sqft || 0),
    facing: unit.facing || "—",
    basePrice: Number(unit.base_price || 0),
    currentPrice: Number(unit.current_price || 0),
    status: formatStatus(unit.status),
    statusKey,
    isCorner: Boolean(unit.is_corner),
    isParkFacing: Boolean(unit.is_park_facing),
    floorPlanUrl: unit.floor_plan_url || "—",
    notes: unit.notes || "—",
    createdAt: formatDate(unit.created_at),
    updatedAt: formatDate(unit.updated_at),
    raw: unit,
  };
}

export default function ProjectUnits() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [units, setUnits] = useState([]);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [viewMode, setViewMode] = useState("table");
  const [activeTowerId, setActiveTowerId] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [editingUnitId, setEditingUnitId] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const [projectResponse, unitsResponse, towersResponse] = await Promise.all([
          getProjectById(projectId),
          getProjectUnits(projectId),
          getProjectTowers(projectId),
        ]);

        if (!active) return;

        setProject(getDetails(projectResponse));
        setUnits(getItems(unitsResponse).map(mapUnitToRow));
        setTowers(getTowerOptions(towersResponse));
      } catch (loadError) {
        if (!active) return;
        setError(getApiErrorMessage(loadError, "Failed to load project units."));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (projectId) {
      loadData();
    }

    return () => {
      active = false;
    };
  }, [projectId]);

  const summary = useMemo(() => ({
    totalUnits: units.length,
    availableUnits: units.filter((unit) => unit.statusKey === "available").length,
    soldUnits: units.filter((unit) => unit.statusKey === "sold").length,
    averagePrice: units.length ? Math.round(units.reduce((sum, unit) => sum + unit.currentPrice, 0) / units.length) : 0,
  }), [units]);

  const unitsByTower = useMemo(() => {
    const towerMap = new Map(towers.map((tower) => [tower.id, tower.label]));
    const grouped = new Map();

    units.forEach((unit) => {
      const towerId = unit.towerId || unit.towerName;
      const fallbackLabel = unit.towerName || towerMap.get(towerId) || "Untitled Tower";

      if (!grouped.has(towerId)) {
        grouped.set(towerId, {
          id: towerId,
          label: towerMap.get(towerId) || fallbackLabel,
          floors: new Map(),
        });
      }

      const towerGroup = grouped.get(towerId);
      const floorKey = Number(unit.floorNumber);
      const safeFloorKey = Number.isNaN(floorKey) ? unit.floorNumber : floorKey;

      if (!towerGroup.floors.has(safeFloorKey)) {
        towerGroup.floors.set(safeFloorKey, []);
      }

      towerGroup.floors.get(safeFloorKey).push(unit);
    });

    return Array.from(grouped.values())
      .map((tower) => ({
        ...tower,
        floors: Array.from(tower.floors.entries())
          .sort((a, b) => {
            if (typeof a[0] === "number" && typeof b[0] === "number") return b[0] - a[0];
            return String(a[0]).localeCompare(String(b[0]));
          })
          .map(([floorKey, floorUnits]) => ({
            floorKey,
            floorLabel: getFloorLabel(floorKey),
            units: [...floorUnits].sort((left, right) => String(left.unitNumber).localeCompare(String(right.unitNumber), undefined, { numeric: true, sensitivity: "base" })),
          })),
      }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
  }, [towers, units]);

  const filteredTowerGroups = useMemo(() => {
    if (activeTowerId === "all") return unitsByTower;
    return unitsByTower.filter((tower) => tower.id === activeTowerId);
  }, [activeTowerId, unitsByTower]);

  const closeModal = () => {
    setShowModal(false);
    setSubmitting(false);
    setFormError("");
    setSuccessMessage("");
    setForm(initialForm);
    setEditingUnitId("");
  };

  const openCreateModal = () => {
    setForm(initialForm);
    setFormError("");
    setSuccessMessage("");
    setEditingUnitId("");
    setShowModal(true);
  };

  const openEditModal = (unit) => {
    setForm(getFormFromUnit(unit));
    setFormError("");
    setSuccessMessage("");
    setEditingUnitId(unit.id);
    setShowModal(true);
  };

  const openUnitDrawer = (unit) => {
    setSelectedUnit(unit);
  };

  const closeUnitDrawer = () => {
    setSelectedUnit(null);
  };

  const openDeleteConfirm = (unit) => {
    setDeleteTarget(unit);
  };

  const closeDeleteConfirm = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  useEffect(() => {
    if (!selectedUnit) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeUnitDrawer();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedUnit]);

  const saveUnit = async () => {
    if (!form.tower_id || !form.unit_number || form.floor_number === "" || !form.unit_type) {
      setFormError("Please fill all required fields.");
      return;
    }

    const payload = buildUnitPayload(form);
    const towerName = towers.find((tower) => tower.id === form.tower_id)?.label || "—";

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      if (editingUnitId) {
        const response = await updateProjectUnit(projectId, editingUnitId, payload);
        const updatedUnit = mapUnitToRow({
          ...(getDetails(response) || payload),
          id: getDetails(response)?.id || editingUnitId,
          tower_name: getDetails(response)?.tower_name || towerName,
        });

        setUnits((current) => current.map((unit) => (unit.id === editingUnitId ? updatedUnit : unit)));
        setSelectedUnit((current) => (current?.id === editingUnitId ? updatedUnit : current));
        closeModal();
      } else {
        const response = await createProjectUnit(projectId, payload);
        const savedUnit = getDetails(response) || { ...payload, tower_name: towerName };

        setUnits((current) => [
          mapUnitToRow({ ...savedUnit, tower_name: savedUnit.tower_name || towerName }),
          ...current,
        ]);
        setForm((current) => ({
          ...current,
          tower_id: current.tower_id,
          unit_number: "",
        }));
        setSuccessMessage("Unit saved successfully.");
      }
    } catch (saveError) {
      setFormError(getApiErrorMessage(saveError, `Failed to ${editingUnitId ? "update" : "create"} unit.`));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteUnit = async () => {
    if (!deleteTarget?.id) return;

    setDeleteLoading(true);

    try {
      await deleteProjectUnit(projectId, deleteTarget.id);
      setUnits((current) => current.filter((unit) => unit.id !== deleteTarget.id));
      setSelectedUnit((current) => (current?.id === deleteTarget.id ? null : current));
      setDeleteTarget(null);
    } catch (deleteError) {
      setFormError(getApiErrorMessage(deleteError, "Failed to delete unit."));
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHead
        title={`Project Units${project?.name ? ` / ${project.name}` : ""}`}
        sub={project?.code ? `Manage inventory for ${project.code}` : "View unit inventory for the selected project"}
      >
        <Btn variant="outline" onClick={() => navigate("/master/projects")}>Back to Projects</Btn>
        <Btn onClick={openCreateModal} disabled={loading}>+ Add Unit</Btn>
      </PageHead>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Project navigation</div>
            <div className="mt-1 text-xs text-neutral-500">Move between project details, towers, units, amenities, and documents.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => navigate(`/master/projects/${projectId}`)}>Project Details</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/towers`)}>Add Tower</Btn>
            <Btn onClick={openCreateModal} disabled={loading}>Add Unit</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/amenities`)}>Amenities</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/documents`)}>Documents</Btn>
          </div>
        </div>
      </Card>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Units" value={summary.totalUnits} />
        <SummaryStat label="Available Units" value={summary.availableUnits} colorClass="text-emerald-600" />
        <SummaryStat label="Sold Units" value={summary.soldUnits} colorClass="text-red-700" />
        <SummaryStat label="Avg. Current Price" value={formatCurrency(summary.averagePrice)} colorClass="text-blue-600" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Unit inventory</div>
            <div className="mt-1 text-xs text-neutral-500">Switch between the flat list and tower-wise floor layout.</div>
            <div className="mt-1 text-xs text-blue-600">Click any row or unit block to open full unit details.</div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select value={activeTowerId} onChange={(event) => setActiveTowerId(event.target.value)} className="min-w-40">
              <option value="all">All Towers</option>
              {unitsByTower.map((tower) => (
                <option key={tower.id} value={tower.id}>{tower.label}</option>
              ))}
            </Select>

            <div className="inline-flex rounded-xl border border-neutral-200 bg-neutral-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${viewMode === "table" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >
                Table View
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tower")}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${viewMode === "tower" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
              >
                Tower View
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading units...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : viewMode === "table" ? (
          <Table headers={["#", "Tower", "Unit", "Floor", "Type", "BHK", "Super Area", "Current Price", "Facing", "Status", "Flags", "Created", "Action"]}>
            {(activeTowerId === "all" ? units : units.filter((unit) => unit.towerId === activeTowerId || unit.towerName === filteredTowerGroups[0]?.label)).map((unit, index) => (
              <TR key={unit.id} onClick={() => openUnitDrawer(unit)}>
                <TD className="text-xs text-neutral-400">{index + 1}</TD>
                <TD className="font-medium text-neutral-900">{unit.towerName}</TD>
                <TD className="font-semibold text-neutral-900">{unit.unitNumber}</TD>
                <TD>{unit.floorNumber}</TD>
                <TD>{unit.unitType}</TD>
                <TD>{unit.bhkType}</TD>
                <TD>
                  <div className="font-medium text-neutral-900">{formatNumber(unit.superAreaSqft)} sqft</div>
                  <div className="text-xs text-neutral-500">Carpet {formatNumber(unit.carpetAreaSqft)} sqft</div>
                </TD>
                <TD className="font-semibold text-emerald-600">{formatCurrency(unit.currentPrice)}</TD>
                <TD>{unit.facing}</TD>
                <TD>
                  <Badge color={getStatusPresentation(unit.statusKey).badgeColor}>{unit.status}</Badge>
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {unit.isCorner && <Badge color="blue">Corner</Badge>}
                    {unit.isParkFacing && <Badge color="green">Park Facing</Badge>}
                    {!unit.isCorner && !unit.isParkFacing && <span className="text-xs text-neutral-400">—</span>}
                  </div>
                </TD>
                <TD className="text-xs text-neutral-500">{unit.createdAt}</TD>
                <TD>
                  <div onClick={(event) => event.stopPropagation()}>
                    <ActionBtns
                      onEdit={() => openEditModal(unit)}
                      onDelete={() => openDeleteConfirm(unit)}
                    />
                  </div>
                </TD>
              </TR>
            ))}
          </Table>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {statusLegend.map((item) => (
                <div key={item.key} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${getStatusPresentation(item.key).tileClass}`}>
                  <span className="h-2.5 w-2.5 rounded-full bg-current opacity-80" />
                  {item.label}
                </div>
              ))}
            </div>

            {!filteredTowerGroups.length ? (
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-4 py-10 text-center text-sm text-neutral-500">
                No units found for the selected tower.
              </div>
            ) : (
              filteredTowerGroups.map((tower) => (
                <div key={tower.id} className="rounded-3xl border border-neutral-200 bg-neutral-50/70 p-4 sm:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-neutral-900">{tower.label}</div>
                      <div className="mt-1 text-xs text-neutral-500">{tower.floors.length} floor section{tower.floors.length === 1 ? "" : "s"}</div>
                    </div>
                    <Badge color="blue">{tower.floors.reduce((count, floor) => count + floor.units.length, 0)} Units</Badge>
                  </div>

                  <div className="space-y-4">
                    {tower.floors.map((floor) => (
                      <div key={`${tower.id}-${floor.floorKey}`} className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-dashed border-neutral-200 pb-3">
                          <div className="text-sm font-semibold text-sky-600">{floor.floorLabel}</div>
                          <div className="text-xs text-neutral-500">{floor.units.length} unit{floor.units.length === 1 ? "" : "s"}</div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                          {floor.units.map((unit) => {
                            const statusPresentation = getStatusPresentation(unit.statusKey);

                            return (
                              <div
                                key={unit.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => openUnitDrawer(unit)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    openUnitDrawer(unit);
                                  }
                                }}
                                className={`rounded-xl border px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 ${statusPresentation.tileClass}`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="text-base font-bold">{unit.unitNumber}</div>
                                    <div className="text-[11px] font-medium opacity-80">{unit.unitType}</div>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]">
                                      {unit.status}
                                    </span>
                                    <div onClick={(event) => event.stopPropagation()}>
                                      <ActionBtns
                                        onEdit={() => openEditModal(unit)}
                                        onDelete={() => openDeleteConfirm(unit)}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="mt-3 space-y-1 text-[11px] font-medium opacity-90">
                                  <div>{unit.bhkType !== "—" ? unit.bhkType : "Layout pending"}</div>
                                  <div>{formatNumber(unit.superAreaSqft)} sqft</div>
                                  <div>{unit.currentPrice > 0 ? formatCurrency(unit.currentPrice) : "Price on request"}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {showModal && (
        <Modal title={editingUnitId ? "Edit Unit" : "Add Unit"} onClose={submitting ? undefined : closeModal} width="lg">
          <FormGrid cols={3}>
            <FG label="Tower *">
              <Select value={form.tower_id} onChange={(event) => setField("tower_id", event.target.value)} disabled={!towers.length || submitting}>
                <option value="">{towers.length ? "Select tower" : "No towers available"}</option>
                {towers.map((tower) => (
                  <option key={tower.id} value={tower.id}>{tower.label}</option>
                ))}
              </Select>
            </FG>
            <FG label="Unit Number *">
              <Input placeholder="e.g. A-101" value={form.unit_number} onChange={(event) => setField("unit_number", event.target.value)} />
            </FG>
            <FG label="Floor Number *">
              <Input type="number" placeholder="e.g. 1" value={form.floor_number} onChange={(event) => setField("floor_number", event.target.value)} />
            </FG>

            <FG label="Unit Type *">
              <Select value={form.unit_type} onChange={(event) => setField("unit_type", event.target.value)}>
                {UNIT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FG>
            <FG label="BHK Type">
              <Input placeholder="e.g. 3 BHK" value={form.bhk_type} onChange={(event) => setField("bhk_type", event.target.value)} />
            </FG>
            <FG label="Facing">
              <Input placeholder="e.g. East" value={form.facing} onChange={(event) => setField("facing", event.target.value)} />
            </FG>

            <FG label="Super Area (sqft)">
              <Input type="number" placeholder="e.g. 1250" value={form.super_area_sqft} onChange={(event) => setField("super_area_sqft", event.target.value)} />
            </FG>
            <FG label="Carpet Area (sqft)">
              <Input type="number" placeholder="e.g. 980" value={form.carpet_area_sqft} onChange={(event) => setField("carpet_area_sqft", event.target.value)} />
            </FG>
            <FG label="Built-up Area (sqft)">
              <Input type="number" placeholder="e.g. 1100" value={form.built_up_area_sqft} onChange={(event) => setField("built_up_area_sqft", event.target.value)} />
            </FG>

            <FG label="Base Price">
              <Input type="number" placeholder="e.g. 4500000" value={form.base_price} onChange={(event) => setField("base_price", event.target.value)} />
            </FG>
            <FG label="Current Price">
              <Input type="number" placeholder="e.g. 4750000" value={form.current_price} onChange={(event) => setField("current_price", event.target.value)} />
            </FG>
            <FG label="Status">
              <Select value={form.status} onChange={(event) => setField("status", event.target.value)}>
                {unitStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
            </FG>

            <FG label="Floor Plan URL" span={2}>
              <Input placeholder="https://example.com/floorplans/unit.pdf" value={form.floor_plan_url} onChange={(event) => setField("floor_plan_url", event.target.value)} />
            </FG>
            <FG label="Flags" className="justify-end">
              <div className="flex flex-wrap gap-4 rounded-xl border border-neutral-200 px-3 py-2.5">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={form.is_corner} onChange={(event) => setField("is_corner", event.target.checked)} />
                  Corner Unit
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input type="checkbox" checked={form.is_park_facing} onChange={(event) => setField("is_park_facing", event.target.checked)} />
                  Park Facing
                </label>
              </div>
            </FG>

            <FG label="Notes" span={3}>
              <Textarea placeholder="Add internal notes for this unit" value={form.notes} onChange={(event) => setField("notes", event.target.value)} />
            </FG>
          </FormGrid>

          {successMessage && <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{successMessage}</div>}
          {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={closeModal} disabled={submitting}>Cancel</Btn>
            <Btn onClick={saveUnit} disabled={submitting || !towers.length}>{submitting ? (editingUnitId ? "Updating..." : "Saving...") : (editingUnitId ? "Update Unit" : "Save Unit")}</Btn>
          </div>
        </Modal>
      )}

      {selectedUnit && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-neutral-950/40" onClick={closeUnitDrawer} />
          <aside className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
              <div>
                <div className="text-lg font-bold text-neutral-900">Unit Details</div>
                <div className="mt-1 text-sm text-neutral-500">View complete information for unit {selectedUnit.unitNumber}.</div>
              </div>
              <button type="button" onClick={closeUnitDrawer} className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50">
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="sm:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-xl font-bold text-neutral-900">{selectedUnit.unitNumber}</div>
                      <div className="mt-1 text-sm text-neutral-500">{selectedUnit.towerName} • {getFloorLabel(selectedUnit.floorNumber)}</div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={getStatusPresentation(selectedUnit.statusKey).badgeColor}>{selectedUnit.status}</Badge>
                      <ActionBtns
                        onEdit={() => openEditModal(selectedUnit)}
                        onDelete={() => openDeleteConfirm(selectedUnit)}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Reference</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <DetailRow label="Unit ID" value={selectedUnit.rawId} />
                    <DetailRow label="Tower ID" value={selectedUnit.towerId || "—"} />
                    <DetailRow label="Tower Name" value={selectedUnit.towerName} />
                    <DetailRow label="Floor" value={getFloorLabel(selectedUnit.floorNumber)} />
                    <DetailRow label="Created" value={selectedUnit.createdAt} />
                    <DetailRow label="Updated" value={selectedUnit.updatedAt} />
                  </div>
                </Card>

                <Card>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Unit profile</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <DetailRow label="Unit Number" value={selectedUnit.unitNumber} />
                    <DetailRow label="Unit Type" value={selectedUnit.unitType} />
                    <DetailRow label="BHK Type" value={selectedUnit.bhkType} />
                    <DetailRow label="Facing" value={selectedUnit.facing} />
                    <DetailRow label="Status" value={selectedUnit.status} />
                  </div>
                </Card>

                <Card>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Areas</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <DetailRow label="Super Area" value={`${formatNumber(selectedUnit.superAreaSqft)} sqft`} />
                    <DetailRow label="Carpet Area" value={`${formatNumber(selectedUnit.carpetAreaSqft)} sqft`} />
                    <DetailRow label="Built-up Area" value={`${formatNumber(selectedUnit.builtUpAreaSqft)} sqft`} />
                  </div>
                </Card>

                <Card>
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Pricing & flags</div>
                  <div className="mt-3 space-y-3 text-sm">
                    <DetailRow label="Base Price" value={formatCurrency(selectedUnit.basePrice)} />
                    <DetailRow label="Current Price" value={formatCurrency(selectedUnit.currentPrice)} valueClassName="text-emerald-600" />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-neutral-200 pt-4">
                    {selectedUnit.isCorner && <Badge color="blue">Corner Unit</Badge>}
                    {selectedUnit.isParkFacing && <Badge color="green">Park Facing</Badge>}
                    {!selectedUnit.isCorner && !selectedUnit.isParkFacing && <span className="text-sm text-neutral-500">No special flags</span>}
                  </div>
                </Card>

                <Card className="sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Notes</div>
                  <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-700">
                    {selectedUnit.notes && selectedUnit.notes !== "—" ? selectedUnit.notes : "No notes available for this unit."}
                  </div>
                </Card>

                <Card className="sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Floor plan</div>
                  <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm text-neutral-700">
                    {selectedUnit.floorPlanUrl && selectedUnit.floorPlanUrl !== "—" ? (
                      <a href={selectedUnit.floorPlanUrl} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                        Open floor plan
                      </a>
                    ) : (
                      "No floor plan available for this unit."
                    )}
                  </div>
                </Card>

                <Card className="sm:col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">Additional information</div>
                  {getAdditionalUnitDetails(selectedUnit).length ? (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {getAdditionalUnitDetails(selectedUnit).map((item) => (
                        <div key={item.key} className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-3 text-sm">
                          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-500">{item.label}</div>
                          <div className="mt-1 font-medium text-neutral-900">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-3 py-4 text-sm text-neutral-500">
                      No additional information is available for this unit.
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </aside>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Delete Unit"
          message={`Are you sure you want to delete unit ${deleteTarget.unitNumber}? This action cannot be undone.`}
          confirmText="Delete"
          confirmClassName="border border-red-700 bg-red-700 text-white hover:bg-red-800"
          onConfirm={confirmDeleteUnit}
          onClose={closeDeleteConfirm}
          loading={deleteLoading}
        >
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Tower: {deleteTarget.towerName || "—"}
          </div>
        </ConfirmModal>
      )}
    </div>
  );
}
