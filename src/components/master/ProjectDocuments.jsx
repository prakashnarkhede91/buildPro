import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { createProjectDocument, deleteProjectDocument, getProjectDocuments } from "../../lib/projects";
import { Badge, Btn, Card, ConfirmModal, FG, FormGrid, Input, Modal, PageHead, Select, SummaryStat, TD, TR, Table, summaryGridClass } from "../ui";
import { DOCUMENT_TYPE, DOCUMENT_TYPE_OPTIONS } from "../../lib/enums";

// Use centralized enum for document type dropdown
const MAX_FILE_SIZE = 15 * 1024 * 1024;

const initialForm = {
  document_type: DOCUMENT_TYPE.PLAN,
  document_name: "",
  file: null,
};

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getApiErrorMessage(error, fallbackMessage) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallbackMessage;
}

function normalizeDocumentType(value = "") {
  return (
    value
      .split(/[\s_-]+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ") || "Other"
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatBytes(value) {
  const size = Number(value);
  if (!Number.isFinite(size) || size < 0) return "—";
  if (size === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const normalizedSize = size / 1024 ** unitIndex;

  return `${normalizedSize >= 10 || unitIndex === 0 ? normalizedSize.toFixed(unitIndex === 0 ? 0 : 0) : normalizedSize.toFixed(1)} ${units[unitIndex]}`;
}

function resolveFileUrl(value) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  try {
    return new URL(value, api.defaults.baseURL).toString();
  } catch {
    return value;
  }
}

function getDocumentTypeColor(value = "") {
  const type = String(value).toLowerCase();

  if (["plan", "photo"].includes(type)) return "blue";
  if (["agreement", "registry"].includes(type)) return "orange";
  if (type === "noc") return "purple";
  if (type === "receipt") return "green";
  return "grey";
}

function createFallbackDocument(projectId, projectName, form) {
  return {
    id: `temp-${Date.now()}`,
    project_id: projectId,
    document_type: form.document_type,
    document_name: form.document_name,
    file_url: "",
    file_size: form.file?.size || 0,
    uploaded_at: new Date().toISOString(),
    uploaded_by_name: "Current User",
    project_name: projectName,
  };
}

export default function ProjectDocuments() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
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

  const closeUploadModal = () => {
    if (submitting) return;
    setShowUploadModal(false);
    resetForm();
  };

  const openDeleteConfirmation = (document) => {
    setDeleteTarget(document);
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

    const loadDocuments = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getProjectDocuments(projectId);

        if (!active) return;

        setProject(response?.project || null);
        setDocuments(getItems(response));
      } catch (loadError) {
        if (!active) return;
        setError(getApiErrorMessage(loadError, "Failed to load project documents."));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    if (projectId) {
      loadDocuments();
    }

    return () => {
      active = false;
    };
  }, [projectId]);

  const summary = useMemo(() => {
    const totalSize = documents.reduce((sum, document) => sum + (Number(document?.file_size) || 0), 0);
    const planCount = documents.filter((document) => String(document?.document_type || "").toLowerCase() === "plan").length;
    const legalCount = documents.filter((document) => ["agreement", "registry", "noc"].includes(String(document?.document_type || "").toLowerCase())).length;
    const recentCount = documents.filter((document) => {
      if (!document?.uploaded_at) return false;
      const uploadedAt = new Date(document.uploaded_at);
      if (Number.isNaN(uploadedAt.getTime())) return false;

      const diff = Date.now() - uploadedAt.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      totalDocuments: documents.length,
      totalSize,
      planCount,
      legalCount,
      recentCount,
    };
  }, [documents]);

  const selectedFileName = form.file?.name || "";

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setField("file", null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFormError("File size must be 15 MB or less.");
      event.target.value = "";
      return;
    }

    const nextName = form.document_name.trim() || file.name.replace(/\.[^.]+$/, "");

    setFormError("");
    setForm((current) => ({
      ...current,
      file,
      document_name: nextName,
    }));
  };

  const handleUpload = async () => {
    if (!form.document_type) {
      setFormError("Document type is required.");
      return;
    }

    if (!form.file) {
      setFormError("Please select a file to upload.");
      return;
    }

    const payload = new FormData();
    payload.append("document_type", form.document_type);
    if (form.document_name.trim()) {
      payload.append("document_name", form.document_name.trim());
    }
    payload.append("file", form.file);

    setSubmitting(true);
    setFormError("");

    try {
      const response = await createProjectDocument(projectId, payload);
      const savedDocument = !Array.isArray(response?.data) && response?.data
        ? response.data
        : !Array.isArray(response?.document) && response?.document
          ? response.document
          : response?.id
            ? response
            : createFallbackDocument(projectId, project?.name, form);

      setDocuments((current) => [savedDocument, ...current]);
      setShowUploadModal(false);
      resetForm();
    } catch (uploadError) {
      setFormError(getApiErrorMessage(uploadError, "Failed to upload project document."));
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!deleteTarget?.id) {
      setDeleteError("Document id not found.");
      return;
    }

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteProjectDocument(projectId, deleteTarget.id);
      setDocuments((current) => current.filter((document) => String(document.id) !== String(deleteTarget.id)));
      setDeleteTarget(null);
      setDeleteLoading(false);
    } catch (requestError) {
      setDeleteError(getApiErrorMessage(requestError, "Failed to delete project document."));
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <PageHead
        title={`Project Documents${project?.name ? ` / ${project.name}` : ""}`}
        sub={project?.id ? `Manage documents uploaded for ${project.name}` : "Manage project documents"}
      >
        <Btn variant="outline" onClick={() => navigate("/master/projects")}>Back to Projects</Btn>
        <Btn onClick={() => setShowUploadModal(true)} disabled={loading}>+ Upload Document</Btn>
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
            <Btn variant="outline" onClick={() => navigate(`/master/projects/${projectId}/amenities`)}>Amenities</Btn>
            <Btn>Documents</Btn>
          </div>
        </div>
      </Card>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Documents" value={summary.totalDocuments} colorClass="text-violet-600" />
        <SummaryStat label="Plan Documents" value={summary.planCount} colorClass="text-blue-600" />
        <SummaryStat label="Agreement / NOC" value={summary.legalCount} colorClass="text-orange-600" />
        <SummaryStat label="Storage Used" value={formatBytes(summary.totalSize)} colorClass="text-emerald-600" sub={`${summary.recentCount} uploaded in last 7 days`} />
      </div>

      {loading ? (
        <Card>
          <div className="py-10 text-center text-sm text-neutral-500">Loading project documents...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="text-base font-semibold text-neutral-900">No documents found for this project.</div>
            <div className="max-w-md text-sm text-neutral-500">Upload layout plans, approvals, brochures, and legal files so the team can access everything from the project workspace.</div>
            <Btn onClick={() => setShowUploadModal(true)}>Upload First Document</Btn>
          </div>
        </Card>
      ) : (
        <Card>
          <Table headers={["#", "Document Name", "Type", "Size", "Uploaded By", "Uploaded At", "File", "Action"]}>
            {documents.map((document, index) => (
              <TR key={document.id || `${document.document_name || "document"}-${index}`}>
                <TD className="text-xs text-neutral-400">{index + 1}</TD>
                <TD>
                  <div className="font-semibold text-neutral-900">{document.document_name || "—"}</div>
                  <div className="mt-1 break-all text-xs text-neutral-500">{document.id || "No document id"}</div>
                </TD>
                <TD>
                  <Badge color={getDocumentTypeColor(document.document_type)}>{normalizeDocumentType(document.document_type)}</Badge>
                </TD>
                <TD className="text-xs text-neutral-500">{formatBytes(document.file_size)}</TD>
                <TD>
                  <div className="text-sm text-neutral-700">{document.uploaded_by_name || "—"}</div>
                  <div className="mt-1 break-all text-xs text-neutral-500">{document.uploaded_by || "—"}</div>
                </TD>
                <TD className="text-xs text-neutral-500">{formatDateTime(document.uploaded_at)}</TD>
                <TD>
                  {document.file_url ? (
                    <a
                      href={resolveFileUrl(document.file_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex text-xs font-semibold text-blue-600 transition hover:text-blue-700"
                    >
                      Open file
                    </a>
                  ) : (
                    <span className="text-xs text-neutral-400">Unavailable</span>
                  )}
                </TD>
                <TD>
                  <Btn variant="outline" size="sm" onClick={() => openDeleteConfirmation(document)}>Delete</Btn>
                </TD>
              </TR>
            ))}
          </Table>
        </Card>
      )}

      {showUploadModal ? (
        <Modal title="Upload Project Document" onClose={closeUploadModal} width="md">
          <div className="space-y-5">
            <div>
              <div className="text-sm font-semibold text-neutral-900">Document details</div>
              <div className="mt-1 text-xs text-neutral-500">Upload a file and tag it so the team can find it quickly from the project record.</div>
            </div>

            {formError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
            ) : null}

            <FormGrid cols={2}>
              <FG label="Document Name">
                <Input
                  placeholder="Optional. Original file name will be used"
                  value={form.document_name}
                  onChange={(event) => setField("document_name", event.target.value)}
                />
              </FG>

              <FG label="Document Type *">
                <Select value={form.document_type} onChange={(event) => setField("document_type", event.target.value)}>
                  {DOCUMENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </FG>

              <FG label="File *" span={2}>
                <Input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg" onChange={handleFileChange} />
                <div className="text-[11px] text-neutral-500">Maximum file size is 15 MB. If document name is empty, the original file name is used.</div>
                {selectedFileName ? (
                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
                    Selected file: <span className="font-semibold">{selectedFileName}</span>
                  </div>
                ) : null}
              </FG>
            </FormGrid>

            <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
              <Btn variant="outline" onClick={closeUploadModal} disabled={submitting}>Cancel</Btn>
              <Btn onClick={handleUpload} disabled={submitting}>{submitting ? "Uploading..." : "Upload Document"}</Btn>
            </div>
          </div>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="Delete Document"
          message={`Are you sure you want to delete ${deleteTarget.document_name || "this document"}? This action cannot be undone.`}
          confirmText="Delete Document"
          cancelText="Cancel"
          confirmClassName="border-red-700 bg-red-700 text-white hover:bg-red-800"
          onConfirm={handleDeleteDocument}
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
