import { useEffect, useMemo, useState } from "react";
import { createLand, getLands, getLandDocuments, uploadLandDocument } from "../lib/lands";
import { Btn, Card, FG, FormGrid, Input, Select, Modal, PageHead, SummaryStat, Table, TD, TR, Textarea, summaryGridClass } from "./ui";

const initialForm = {
  survey_number: "",
  khasra_number: "",
  village: "",
  tehsil: "",
  district: "",
  state: "",
  total_area_sqft: "",
  total_area_sqmt: "",
  purchase_price: "",
  purchase_date: "",
  seller_name: "",
  seller_contact: "",
  registry_number: "",
  registry_date: "",
  notes: "",
};

function getLandList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getLandDetails(data) {
  if (data?.data) return data.data;
  return data;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatNumber(value, options = {}) {
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return "—";

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    minimumFractionDigits: options.minimumFractionDigits ?? 0,
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

function mapLandToRow(land) {
  return {
    id: land.id || crypto.randomUUID(),
    surveyNumber: land.survey_number || "—",
    khasraNumber: land.khasra_number || "—",
    village: land.village || "—",
    tehsil: land.tehsil || "—",
    district: land.district || "—",
    state: land.state || "—",
    totalAreaSqft: Number(land.total_area_sqft || 0),
    totalAreaSqmt: Number(land.total_area_sqmt || 0),
    purchasePrice: Number(land.purchase_price || 0),
    purchaseDate: formatDate(land.purchase_date),
    sellerName: land.seller_name || "—",
    sellerContact: land.seller_contact || "—",
    registryNumber: land.registry_number || "—",
    registryDate: formatDate(land.registry_date),
    projectName: land.project_name || "—",
    isConverted: Boolean(land.is_converted),
    notes: land.notes || "—",
    createdByName: land.created_by_name || "—",
  };
}

function LandDocumentsModal({ land, onClose }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("");
  const [docName, setDocName] = useState("");

  const loadDocs = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getLandDocuments(land.id);
      let docs = [];
      if (Array.isArray(res)) docs = res;
      else if (Array.isArray(res?.data)) docs = res.data;
      else if (Array.isArray(res?.items)) docs = res.items;
      setDocuments(docs);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load documents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocs();
  }, [land.id]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !docType || !docName) {
      setUploadError("Please fill all fields and select a file.");
      return;
    }
    
    setUploading(true);
    setUploadError("");
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);
    formData.append("document_name", docName);
    
    try {
      await uploadLandDocument(land.id, formData);
      setFile(null);
      setDocType("");
      setDocName("");
      const fileInput = document.getElementById("doc-file-upload");
      if (fileInput) fileInput.value = "";
      
      await loadDocs();
    } catch (err) {
      setUploadError(err?.response?.data?.message || err?.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal title={`Documents - ${land.surveyNumber}`} onClose={onClose} width="lg">
      <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <div className="mb-3 text-sm font-semibold text-neutral-900">Upload Document</div>
        <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FG label="Document Type *">
            <Select value={docType} onChange={e => setDocType(e.target.value)}>
              <option value="">Select Type</option>
              <option value="agreement">Agreement</option>
              <option value="receipt">Receipt</option>
              <option value="noc">NOC</option>
              <option value="registry">Registry</option>
              <option value="plan">Plan</option>
              <option value="photo">Photo</option>
              <option value="other">Other</option>
            </Select>
          </FG>
          <FG label="Document Name *">
            <Input value={docName} onChange={e => setDocName(e.target.value)} placeholder="e.g. Registry 2024" />
          </FG>
          <FG label="File (Max 15MB) *" span={2}>
            <input 
              id="doc-file-upload"
              type="file" 
              onChange={e => setFile(e.target.files[0])} 
              className="block w-full text-sm text-neutral-500 file:mr-4 file:cursor-pointer file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" 
            />
          </FG>
          {uploadError && <div className="md:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{uploadError}</div>}
          <div className="flex justify-end md:col-span-2">
            <Btn type="submit" disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Btn>
          </div>
        </form>
      </div>

      <div>
        <div className="mb-3 text-sm font-semibold text-neutral-900">Document List</div>
        {loading ? (
          <div className="py-4 text-center text-sm text-neutral-500">Loading documents...</div>
        ) : error ? (
           <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500">No documents found.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200">
             <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr className="border-b border-neutral-200">
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-500">Type</th>
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-500">Name</th>
                    <th className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-500">Date</th>
                    <th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.04em] text-neutral-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {documents.map(doc => (
                    <tr key={doc.id || Math.random()} className="transition-colors hover:bg-neutral-50">
                      <td className="px-4 py-3 text-[13px] capitalize text-neutral-700">{doc.document_type || doc.documentType}</td>
                      <td className="px-4 py-3 text-[13px] font-medium text-neutral-900">{doc.document_name || doc.documentName}</td>
                      <td className="px-4 py-3 text-[13px] text-neutral-500">{formatDate(doc.created_at || doc.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        {doc.file_url || doc.fileUrl ? (
                          <a 
                            href={doc.file_url || doc.fileUrl} 
                            target="_blank" 
                            rel="noreferrer" 
                            title="View Document"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-blue-600 transition hover:bg-blue-50"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </a>
                        ) : (
                          <span className="text-xs text-neutral-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default function Land() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [documentModalLand, setDocumentModalLand] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    let active = true;

    const loadLands = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getLands();
        if (!active) return;
        setLands(getLandList(response).map(mapLandToRow));
      } catch (loadError) {
        if (!active) return;
        setError(loadError?.response?.data?.message || loadError?.message || "Failed to load lands.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadLands();

    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(() => ({
    totalLands: lands.length,
    converted: lands.filter((land) => land.isConverted).length,
    totalAreaSqft: lands.reduce((sum, land) => sum + land.totalAreaSqft, 0),
    totalPurchaseValue: lands.reduce((sum, land) => sum + land.purchasePrice, 0),
  }), [lands]);

  const closeModal = () => {
    setShowModal(false);
    setForm(initialForm);
    setFormError("");
    setSubmitting(false);
  };

  const handleSave = async () => {
    if (!form.survey_number || !form.village || !form.district || !form.state || !form.total_area_sqft || !form.purchase_price || !form.purchase_date) {
      setFormError("Please fill all required fields.");
      return;
    }

    const payload = {
      survey_number: form.survey_number,
      khasra_number: form.khasra_number,
      village: form.village,
      tehsil: form.tehsil,
      district: form.district,
      state: form.state,
      total_area_sqft: Number(form.total_area_sqft) || 0,
      total_area_sqmt: form.total_area_sqmt === "" ? 0 : Number(form.total_area_sqmt) || 0,
      purchase_price: Number(form.purchase_price) || 0,
      purchase_date: form.purchase_date,
      seller_name: form.seller_name,
      seller_contact: form.seller_contact,
      registry_number: form.registry_number,
      registry_date: form.registry_date,
      notes: form.notes,
    };

    setSubmitting(true);
    setFormError("");

    try {
      const response = await createLand(payload);
      const savedLand = getLandDetails(response) || payload;
      setLands((current) => [mapLandToRow(savedLand), ...current]);
      closeModal();
    } catch (saveError) {
      setFormError(saveError?.response?.data?.message || saveError?.message || "Failed to save land details.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHead title="Land" sub="Manage land masters and registry details">
        <Btn onClick={() => setShowModal(true)}>+ Add Land</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Lands" value={summary.totalLands} />
        <SummaryStat label="Converted Lands" value={summary.converted} colorClass="text-emerald-600" />
        <SummaryStat label="Total Area (sqft)" value={formatNumber(summary.totalAreaSqft, { maximumFractionDigits: 0 })} colorClass="text-blue-600" />
        <SummaryStat label="Purchase Value" value={formatCurrency(summary.totalPurchaseValue)} colorClass="text-red-700" />
      </div>

      <Card>
        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading lands...</div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : (
          <Table headers={["#", "Survey No.", "Khasra No.", "Village", "Tehsil", "District", "Area (sqft)", "Purchase Price", "Seller", "Registry", "Project", "Actions"]}>
            {lands.map((land, index) => (
              <TR key={land.id}>
                <TD className="text-xs text-neutral-400">{index + 1}</TD>
                <TD className="font-semibold text-neutral-900">{land.surveyNumber}</TD>
                <TD>{land.khasraNumber}</TD>
                <TD>{land.village}</TD>
                <TD>{land.tehsil}</TD>
                <TD>{land.district}</TD>
                <TD className="font-semibold text-neutral-900">{formatNumber(land.totalAreaSqft, { maximumFractionDigits: 0 })}</TD>
                <TD className="font-semibold text-emerald-600">{formatCurrency(land.purchasePrice)}</TD>
                <TD>
                  <div className="font-medium text-neutral-900">{land.sellerName}</div>
                  <div className="text-xs text-neutral-500">{land.sellerContact}</div>
                </TD>
                <TD>
                  <div className="font-medium text-neutral-900">{land.registryNumber}</div>
                  <div className="text-xs text-neutral-500">{land.registryDate}</div>
                </TD>
                <TD>
                  <div className="font-medium text-neutral-900">{land.projectName}</div>
                  <div className="text-xs text-neutral-500">{land.state}</div>
                </TD>
                <TD>
                  <Btn variant="outline" size="sm" onClick={() => setDocumentModalLand(land)}>Docs</Btn>
                </TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {showModal && (
        <Modal title="Add Land" onClose={submitting ? undefined : closeModal} width="lg">
          <FormGrid cols={3}>
            <FG label="Survey Number *"><Input placeholder="e.g. SN-123/A" value={form.survey_number} onChange={(event) => updateField("survey_number", event.target.value)} /></FG>
            <FG label="Khasra Number"><Input placeholder="e.g. KH-456" value={form.khasra_number} onChange={(event) => updateField("khasra_number", event.target.value)} /></FG>
            <FG label="Village *"><Input placeholder="e.g. Indrapuri" value={form.village} onChange={(event) => updateField("village", event.target.value)} /></FG>
            <FG label="Tehsil"><Input placeholder="e.g. Huzur" value={form.tehsil} onChange={(event) => updateField("tehsil", event.target.value)} /></FG>
            <FG label="District *"><Input placeholder="e.g. Bhopal" value={form.district} onChange={(event) => updateField("district", event.target.value)} /></FG>
            <FG label="State *"><Input placeholder="e.g. Madhya Pradesh" value={form.state} onChange={(event) => updateField("state", event.target.value)} /></FG>
            <FG label="Total Area (sqft) *"><Input type="number" placeholder="e.g. 50000" value={form.total_area_sqft} onChange={(event) => updateField("total_area_sqft", event.target.value)} /></FG>
            <FG label="Total Area (sqmt)"><Input type="number" step="any" placeholder="e.g. 4645.15" value={form.total_area_sqmt} onChange={(event) => updateField("total_area_sqmt", event.target.value)} /></FG>
            <FG label="Purchase Price *"><Input type="number" placeholder="e.g. 5000000" value={form.purchase_price} onChange={(event) => updateField("purchase_price", event.target.value)} /></FG>
            <FG label="Purchase Date *"><Input type="date" value={form.purchase_date} onChange={(event) => updateField("purchase_date", event.target.value)} /></FG>
            <FG label="Seller Name"><Input placeholder="e.g. Ramesh Patel" value={form.seller_name} onChange={(event) => updateField("seller_name", event.target.value)} /></FG>
            <FG label="Seller Contact"><Input placeholder="e.g. 9876543210" value={form.seller_contact} onChange={(event) => updateField("seller_contact", event.target.value)} /></FG>
            <FG label="Registry Number"><Input placeholder="e.g. REG-2024-001" value={form.registry_number} onChange={(event) => updateField("registry_number", event.target.value)} /></FG>
            <FG label="Registry Date"><Input type="date" value={form.registry_date} onChange={(event) => updateField("registry_date", event.target.value)} /></FG>
            <FG label="Notes" span={3}><Textarea placeholder="Prime land parcel near township road" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} /></FG>
          </FormGrid>

          {formError && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={closeModal} disabled={submitting}>Cancel</Btn>
            <Btn onClick={handleSave} disabled={submitting}>{submitting ? "Saving..." : "Save Land"}</Btn>
          </div>
        </Modal>
      )}

      {documentModalLand && (
        <LandDocumentsModal land={documentModalLand} onClose={() => setDocumentModalLand(null)} />
      )}
    </div>
  );
}
