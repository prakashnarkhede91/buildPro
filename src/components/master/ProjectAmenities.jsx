import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { createProjectAmenity, deleteProjectAmenity, getProjectAmenities } from "../../lib/projects";
import { Badge, Btn, Card, ConfirmModal, Input, PageHead, SummaryStat, Textarea, summaryGridClass } from "../ui";

const MAX_ICON_SIZE = 5 * 1024 * 1024;

const initialForm = {
  name: "",
  description: "",
  icon: null,
};

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function formatDisplayText(value) {
  return value || "—";
}

function resolveMediaUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  try {
    return new URL(value, api.defaults.baseURL).toString();
  } catch {
    return value;
  }
}

function getApiErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
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

function AmenityIcon({ name, iconUrl }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = String(name || "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 text-sm font-bold text-neutral-600 shadow-sm">
      {iconUrl && !imageFailed ? (
        <img src={resolveMediaUrl(iconUrl)} alt={name || "Amenity icon"} className="h-full w-full object-cover" onError={() => setImageFailed(true)} />
      ) : (
        <span>{initials || "AM"}</span>
      )}
    </div>
  );
}

export default function ProjectAmenities() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [form, setForm] = useState(initialForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setFormError("");
    setSubmitting(false);
  };

  const openCreateDrawer = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    if (submitting) return;
    setDrawerOpen(false);
    resetForm();
  };

  const openDeleteConfirmation = (amenity) => {
    setDeleteTarget(amenity);
    setDeleteError("");
    setDeleteLoading(false);
  };

  const closeDeleteConfirmation = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
    setDeleteError("");
  };

  useEffect(() => {
    let active = true;

    const loadAmenities = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getProjectAmenities(projectId);

        if (!active) return;

        setProject(response?.project || null);
        setAmenities(getItems(response));
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.response?.data?.message || loadError?.message || "Failed to load project amenities.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (projectId) {
      loadAmenities();
    }

    return () => {
      active = false;
    };
  }, [projectId]);

  const summary = useMemo(() => ({
    totalAmenities: amenities.length,
    withDescriptions: amenities.filter((item) => item?.description).length,
    withIcons: amenities.filter((item) => item?.icon_url).length,
  }), [amenities]);

  const selectedFileName = form.icon?.name || "";

  const handleIconChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setField("icon", null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Only image files are allowed for the amenity icon.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_ICON_SIZE) {
      setFormError("Icon size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    setFormError("");
    setField("icon", file);
  };

  const handleCreateAmenity = async () => {
    if (!form.name.trim()) {
      setFormError("Amenity name is required.");
      return;
    }

    const payload = new FormData();
    payload.append("name", form.name.trim());

    if (form.description.trim()) {
      payload.append("description", form.description.trim());
    }

    if (form.icon) {
      payload.append("icon", form.icon);
    }

    setSubmitting(true);
    setFormError("");

    try {
      const response = await createProjectAmenity(projectId, payload);
      const savedAmenity = response?.data || response;

      setAmenities((current) => [savedAmenity, ...current]);
      setDrawerOpen(false);
      resetForm();
    } catch (saveError) {
      setFormError(getApiErrorMessage(saveError, "Failed to create amenity."));
      setSubmitting(false);
    }
  };

  const handleDeleteAmenity = async () => {
    if (!deleteTarget?.id) {
      setDeleteError("Amenity id not found.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteProjectAmenity(projectId, deleteTarget.id);
      setAmenities((current) => current.filter((amenity) => String(amenity.id) !== String(deleteTarget.id)));
      setDeleteTarget(null);
      setDeleteLoading(false);
    } catch (deleteRequestError) {
      setDeleteError(getApiErrorMessage(deleteRequestError, "Failed to delete amenity."));
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHead
        title={`Project Amenities${project?.name ? ` / ${project.name}` : ""}`}
        sub={project?.id ? `View amenities configured for project ${project.name}` : "View project amenities"}
      >
        <Btn variant="outline" onClick={() => navigate("/master/projects")}>Back to Projects</Btn>
        <Btn onClick={openCreateDrawer}>+ Add Amenity</Btn>
      </PageHead>

      <Card className="mb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-sm font-semibold text-neutral-900">Project navigation</div>
            <div className="mt-1 text-xs text-neutral-500">Move between project details, towers, units, amenities, and documents.</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Btn variant="ghost" onClick={() => navigate(`/master/projects/${projectId}`)}>Project Details</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/towers`)}>Tower List</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/units`)}>Unit List</Btn>
            <Btn>Amenities</Btn>
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/documents`)}>Documents</Btn>
          </div>
        </div>
      </Card>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Amenities" value={summary.totalAmenities} colorClass="text-violet-600" />
        <SummaryStat label="With Description" value={summary.withDescriptions} colorClass="text-blue-600" />
        <SummaryStat label="With Icon" value={summary.withIcons} colorClass="text-emerald-600" />
        <SummaryStat label="Without Icon" value={Math.max(summary.totalAmenities - summary.withIcons, 0)} colorClass="text-orange-600" />
      </div>

      {loading ? (
        <Card>
          <div className="py-10 text-center text-sm text-neutral-500">Loading project amenities...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        </Card>
      ) : amenities.length === 0 ? (
        <Card>
          <div className="py-10 text-center text-sm text-neutral-500">No amenities found for this project.</div>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {amenities.map((amenity, index) => (
            <Card key={amenity.id || `${amenity.name || "amenity"}-${index}`} className="h-full">
              <div className="flex items-start gap-4">
                <AmenityIcon name={amenity.name} iconUrl={amenity.icon_url} />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-base font-semibold text-neutral-900">{formatDisplayText(amenity.name)}</div>
                      <Badge color={amenity.icon_url ? "green" : "grey"}>{amenity.icon_url ? "Icon" : "No Icon"}</Badge>
                    </div>

                    <Btn variant="outline" size="sm" onClick={() => openDeleteConfirmation(amenity)}>Delete</Btn>
                  </div>

                  <div className="mt-2 text-sm leading-6 text-neutral-600">{formatDisplayText(amenity.description)}</div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                      <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">Amenity ID</div>
                      <div className="mt-1 break-all text-xs font-medium text-neutral-700">{formatDisplayText(amenity.id)}</div>
                    </div>
                    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                      <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-neutral-500">Project ID</div>
                      <div className="mt-1 break-all text-xs font-medium text-neutral-700">{formatDisplayText(amenity.project_id || project?.id)}</div>
                    </div>
                  </div>

                  {amenity.icon_url ? (
                    <a
                      href={resolveMediaUrl(amenity.icon_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Open icon
                    </a>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {drawerOpen ? (
        <RightDrawer title="Create Amenity" onClose={closeCreateDrawer}>
          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Amenity details</div>
              <div className="mt-1 text-xs text-neutral-500">Add a new project amenity with optional description and image icon.</div>
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
            ) : null}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Amenity Name *</label>
                <Input
                  placeholder="e.g. Club House"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Description</label>
                <Textarea
                  placeholder="e.g. Premium clubhouse with indoor games"
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-600">Icon</label>
                <Input type="file" accept="image/*" onChange={handleIconChange} />
                <div className="text-[11px] text-neutral-500">Only image files are allowed. Maximum upload size is 5 MB.</div>
                {selectedFileName ? (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                    Selected file: <span className="font-semibold">{selectedFileName}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
              <Btn variant="outline" onClick={closeCreateDrawer} disabled={submitting}>Cancel</Btn>
              <Btn onClick={handleCreateAmenity} disabled={submitting}>{submitting ? "Saving..." : "Create Amenity"}</Btn>
            </div>
          </div>
        </RightDrawer>
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="Delete Amenity"
          message={`Are you sure you want to delete ${deleteTarget.name || "this amenity"}? This action cannot be undone.`}
          confirmText="Delete Amenity"
          cancelText="Cancel"
          confirmClassName="border-red-700 bg-red-700 text-white hover:bg-red-800"
          onConfirm={handleDeleteAmenity}
          onClose={closeDeleteConfirmation}
          loading={deleteLoading}
        >
          {deleteError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{deleteError}</div>
          ) : null}
        </ConfirmModal>
      ) : null}
    </div>
  );
}