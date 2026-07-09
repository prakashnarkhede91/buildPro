import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createProjectTower, getProjectTowerById, getProjectTowers, updateProjectTower } from "../../lib/projects";
import { Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, SummaryStat, Table, TD, TR, ActionBtns, summaryGridClass } from "../ui";

const initialForm = {
  name: "",
  floors: "",
  units_per_floor: "",
};

function getTowerList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getTowerDetails(data) {
  if (data?.data) return data.data;
  return data;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNumber(value) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return 0;
  return numericValue;
}

function mapTowerToRow(tower) {
  return {
    id: tower.id || crypto.randomUUID(),
    name: tower.name || "—",
    floors: formatNumber(tower.floors),
    unitsPerFloor: formatNumber(tower.units_per_floor),
    totalUnits: formatNumber(tower.total_units),
    availableUnits: formatNumber(tower.available_units),
    bookedUnits: formatNumber(tower.booked_units),
    soldUnits: formatNumber(tower.sold_units),
    onHoldUnits: formatNumber(tower.on_hold_units),
    blockedUnits: formatNumber(tower.blocked_units),
    createdAt: formatDate(tower.created_at),
  };
}

function mapTowerToForm(tower) {
  return {
    name: tower?.name || "",
    floors: tower?.floors == null ? "" : String(tower.floors),
    units_per_floor: tower?.units_per_floor == null ? "" : String(tower.units_per_floor),
  };
}

export default function ProjectTowers() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [towers, setTowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTowerId, setEditingTowerId] = useState("");
  const [modalLoading, setModalLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(initialForm);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    let active = true;

    const loadTowers = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getProjectTowers(projectId);
        if (!active) return;
        setProject(response?.project || null);
        setTowers(getTowerList(response).map(mapTowerToRow));
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.response?.data?.message || loadError?.message || "Failed to load towers.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (projectId) {
      loadTowers();
    }

    return () => {
      active = false;
    };
  }, [projectId]);

  const summary = useMemo(() => ({
    totalTowers: towers.length,
    totalUnits: towers.reduce((sum, tower) => sum + tower.totalUnits, 0),
    availableUnits: towers.reduce((sum, tower) => sum + tower.availableUnits, 0),
    soldUnits: towers.reduce((sum, tower) => sum + tower.soldUnits, 0),
  }), [towers]);

  const closeModal = () => {
    setShowModal(false);
    setEditingTowerId("");
    setModalLoading(false);
    setSubmitting(false);
    setFormError("");
    setForm(initialForm);
  };

  const openCreateModal = () => {
    setEditingTowerId("");
    setForm(initialForm);
    setFormError("");
    setShowModal(true);
  };

  const handleEdit = async (towerId) => {
    setShowModal(true);
    setEditingTowerId(towerId);
    setModalLoading(true);
    setFormError("");

    try {
      const response = await getProjectTowerById(projectId, towerId);
      const tower = getTowerDetails(response);
      setForm(mapTowerToForm(tower));
    } catch (loadError) {
      setFormError(loadError?.response?.data?.message || loadError?.message || "Failed to load tower details.");
    } finally {
      setModalLoading(false);
    }
  };

  const saveTower = async () => {
    if (!form.name || !form.floors || !form.units_per_floor) {
      setFormError("Please fill all required fields.");
      return;
    }

    const payload = {
      ...(editingTowerId ? { id: editingTowerId } : {}),
      project_id: projectId,
      name: form.name,
      floors: Number(form.floors) || 0,
      units_per_floor: Number(form.units_per_floor) || 0,
    };

    setSubmitting(true);
    setFormError("");

    try {
      const response = editingTowerId
        ? await updateProjectTower(projectId, editingTowerId, payload)
        : await createProjectTower(projectId, payload);
      const savedTower = mapTowerToRow(getTowerDetails(response) || payload);

      setTowers((current) => {
        if (editingTowerId) {
          return current.map((tower) => (tower.id === editingTowerId ? savedTower : tower));
        }

        return [savedTower, ...current];
      });

      closeModal();
    } catch (saveError) {
      setFormError(saveError?.response?.data?.message || saveError?.message || `Failed to ${editingTowerId ? "update" : "create"} tower.`);
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHead
        title={`Project Towers${project?.name ? ` / ${project.name}` : ""}`}
        sub={project?.id ? `Manage tower inventory for project ${project.name}` : "Manage project towers"}
      >
        <Btn variant="outline" onClick={() => navigate("/master/projects")}>Back to Projects</Btn>
        <Btn onClick={openCreateModal}>+ Add Tower</Btn>
      </PageHead>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Project navigation</div>
            <div className="mt-1 text-xs text-neutral-500">Move between project details, towers, units, amenities, and documents.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => navigate(`/master/projects/${projectId}`)}>Project Details</Btn>
            <Btn onClick={openCreateModal}>Add Tower</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/units`)}>Add Unit</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/amenities`)}>Amenities</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/documents`)}>Documents</Btn>
          </div>
        </div>
      </Card>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Towers" value={summary.totalTowers} />
        <SummaryStat label="Total Units" value={summary.totalUnits} colorClass="text-blue-600" />
        <SummaryStat label="Available Units" value={summary.availableUnits} colorClass="text-emerald-600" />
        <SummaryStat label="Sold Units" value={summary.soldUnits} colorClass="text-red-700" />
      </div>

      <Card>
        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading towers...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : (
          <Table headers={["#", "Tower", "Floors", "Units / Floor", "Total Units", "Available", "Booked", "Sold", "Hold", "Blocked", "Created", "Action"]}>
            {towers.map((tower, index) => (
              <TR key={tower.id}>
                <TD className="text-xs text-neutral-400">{index + 1}</TD>
                <TD className="font-semibold text-neutral-900">{tower.name}</TD>
                <TD>{tower.floors}</TD>
                <TD>{tower.unitsPerFloor}</TD>
                <TD className="font-medium text-neutral-900">{tower.totalUnits}</TD>
                <TD><Badge color="green">{tower.availableUnits}</Badge></TD>
                <TD><Badge color="orange">{tower.bookedUnits}</Badge></TD>
                <TD><Badge color="red">{tower.soldUnits}</Badge></TD>
                <TD><Badge color="yellow">{tower.onHoldUnits}</Badge></TD>
                <TD><Badge color="grey">{tower.blockedUnits}</Badge></TD>
                <TD className="text-xs text-neutral-500">{tower.createdAt}</TD>
                <TD><ActionBtns onEdit={() => handleEdit(tower.id)} /></TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {showModal && (
        <Modal title={editingTowerId ? "Edit Tower" : "Add Tower"} onClose={submitting ? undefined : closeModal} width="md">
          {modalLoading ? (
            <div className="py-10 text-center text-sm text-neutral-500">Loading tower details...</div>
          ) : (
            <FormGrid cols={3}>
              <FG label="Tower Name *" span={3}><Input placeholder="e.g. Tower A" value={form.name} onChange={(event) => setField("name", event.target.value)} /></FG>
              <FG label="Floors *"><Input type="number" placeholder="e.g. 10" value={form.floors} onChange={(event) => setField("floors", event.target.value)} /></FG>
              <FG label="Units Per Floor *"><Input type="number" placeholder="e.g. 4" value={form.units_per_floor} onChange={(event) => setField("units_per_floor", event.target.value)} /></FG>
            </FormGrid>
          )}

          {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={closeModal} disabled={submitting || modalLoading}>Cancel</Btn>
            <Btn onClick={saveTower} disabled={submitting || modalLoading}>{submitting ? "Saving..." : editingTowerId ? "Update Tower" : "Save Tower"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
