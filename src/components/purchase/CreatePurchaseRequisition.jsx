import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { getProjects } from "../../lib/projects";
import { createPurchaseRequisition } from "../../lib/purchases";
import { Badge, Btn, Card, FG, FormGrid, Input, PageHead, Select, Textarea, Table, TR, TD } from "../ui";

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function CreatePurchaseRequisition() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  const [projectId, setProjectId] = useState("");
  const [requiredDate, setRequiredDate] = useState("");
  const [notes, setNotes] = useState("");
  
  const [items, setItems] = useState([
    { material_id: "", description: "", quantity: 1, unit_of_measure: "Bags", estimated_cost: 0 }
  ]);
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load Projects and Materials on mount
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoadingInitial(true);
      try {
        const [projRes, matRes] = await Promise.all([
          getProjects(),
          api.get("/purchase/materials")
        ]);
        
        if (!active) return;
        setProjects(getItems(projRes));
        if (matRes.data?.success) {
          setMaterials(matRes.data.data);
        }
      } catch (err) {
        console.error("Error loading resources:", err);
        if (active) setFormError("Failed to load projects or materials.");
      } finally {
        if (active) setLoadingInitial(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, []);

  // Update item field
  const updateItem = (index, field, value) => {
    setFormError("");
    setItems((curr) =>
      curr.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        
        // If material changes, pre-populate description and unit_of_measure
        if (field === "material_id") {
          const selectedMat = materials.find((m) => m.id === value);
          if (selectedMat) {
            updated.description = selectedMat.name;
            updated.unit_of_measure = selectedMat.unit_of_measure || "Bags";
          }
        }
        
        return updated;
      })
    );
  };

  // Add empty item row
  const addItemRow = () => {
    setItems((curr) => [...curr, { material_id: "", description: "", quantity: 1, unit_of_measure: "Bags", estimated_cost: 0 }]);
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (items.length <= 1) {
      setFormError("Purchase Requisition must contain at least one item.");
      return;
    }
    setItems((curr) => curr.filter((_, idx) => idx !== index));
  };

  // Dynamically calculate total estimated cost
  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + Number(item.estimated_cost || 0), 0);
  }, [items]);

  // Form Validation and Submission
  const handleSave = async () => {
    setFormError("");
    setSuccessMessage("");

    if (!projectId) {
      setFormError("Project is required.");
      return;
    }
    if (!requiredDate) {
      setFormError("Required Date is required.");
      return;
    }

    // Items validation
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.material_id) {
        setFormError(`Please select a material for item ${i + 1}.`);
        return;
      }
      if (Number(item.quantity) <= 0) {
        setFormError(`Quantity for item ${i + 1} must be greater than 0.`);
        return;
      }
      if (Number(item.estimated_cost) < 0) {
        setFormError(`Estimated cost for item ${i + 1} cannot be negative.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        project_id: projectId,
        required_date: requiredDate,
        notes: notes.trim() || null,
        items: items.map((item) => ({
          material_id: item.material_id,
          description: item.description?.trim() || undefined,
          quantity: Number(item.quantity),
          unit_of_measure: item.unit_of_measure || "Bags",
          estimated_cost: parseFloat(Number(item.estimated_cost).toFixed(2))
        }))
      };

      await createPurchaseRequisition(payload);
      setSuccessMessage("Purchase Requisition created successfully!");
      setTimeout(() => {
        navigate("/purchases/requisitions");
      }, 1500);
    } catch (err) {
      setFormError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to create Purchase Requisition.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHead title="Create Purchase Requisition" sub="Create a new purchase requisition from the site to request material procurement.">
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="outline" onClick={() => navigate("/purchases/requisitions")}>
            <ArrowLeft size={16} />
            Back to Requisitions
          </Btn>
          <Btn onClick={handleSave} disabled={submitting || loadingInitial}>
            <Save size={16} />
            {submitting ? "Submitting..." : "Submit Requisition"}
          </Btn>
        </div>
      </PageHead>

      {loadingInitial ? (
        <Card className="py-10 text-center text-sm text-neutral-500">Loading resources...</Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="space-y-4">
            <Card>
              <div className="mb-4 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Requisition Info</div>
              {formError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
              {successMessage && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}

              <FormGrid cols={2}>
                <FG label="Project *">
                  <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                    <option value="">Select project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name || p.project_name || p.label}</option>
                    ))}
                  </Select>
                </FG>

                <FG label="Required Date *">
                  <Input type="date" value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} />
                </FG>

                <FG label="Notes / Special Instructions" span={2}>
                  <Textarea placeholder="Describe the purpose, brand preferences, or casting schedule details..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </FG>
              </FormGrid>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-sm font-semibold text-neutral-900">Requested Items Checklist</span>
                <Btn size="sm" variant="outline" onClick={addItemRow}>
                  <Plus size={14} /> Add Item
                </Btn>
              </div>

              <Table headers={["Material *", "Description", "Qty *", "Unit of Measure *", "Est. Cost (₹) *", "Action"]}>
                {items.map((item, idx) => (
                  <TR key={idx}>
                    <TD className="min-w-48">
                      <Select value={item.material_id} onChange={(e) => updateItem(idx, "material_id", e.target.value)}>
                        <option value="">Select material</option>
                        {materials.map((m) => (
                          <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                        ))}
                      </Select>
                    </TD>
                    <TD className="min-w-40">
                      <Input placeholder="Purpose or spec" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} />
                    </TD>
                    <TD className="w-20">
                      <Input type="number" min="1" placeholder="1" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                    </TD>
                    <TD className="w-28">
                      <Select value={item.unit_of_measure} onChange={(e) => updateItem(idx, "unit_of_measure", e.target.value)}>
                        <option>Bags</option>
                        <option>Ton</option>
                        <option>Nos</option>
                        <option>Meter</option>
                        <option>Litre</option>
                        <option>Sqft</option>
                        <option>Kg</option>
                        <option>CuM</option>
                      </Select>
                    </TD>
                    <TD className="w-28">
                      <Input type="number" min="0" placeholder="0.00" value={item.estimated_cost} onChange={(e) => updateItem(idx, "estimated_cost", e.target.value)} />
                    </TD>
                    <TD className="w-12">
                      <button type="button" onClick={() => removeItemRow(idx)} className="rounded-md p-1 text-red-700 transition hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </TD>
                  </TR>
                ))}
              </Table>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <div className="mb-3 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Cost Aggregate Summary</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Total Estimated Budget</span>
                  <span className="font-bold text-[blueviolet] text-lg">₹{totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-3 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Quick Requisition Helpers</div>
              <div className="space-y-2 text-xs text-neutral-500">
                <p>💡 <strong>Requisitions</strong> are submitted by site engineers to seek procurement approval.</p>
                <p>💡 **UoM (Unit of Measure)** matches stock registers automatically when a material is chosen.</p>
                <p>💡 **Est. Cost** should reflect local market surveys to aid procurement budget approvals.</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
