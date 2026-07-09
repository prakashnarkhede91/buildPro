import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import api from "../../lib/api";
import { ActionBtns, Btn, Card, FG, FormGrid, Input, Textarea, Select, TR, TD, Table, Badge } from "../ui";

function RightDrawer({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/30 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-y-0 right-0 flex w-full max-w-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex h-full w-full flex-col border-l border-neutral-200 bg-white shadow-2xl">
          <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4">
            <div>
              <div className="text-lg font-bold text-neutral-900">{title}</div>
              {subtitle ? <div className="mt-1 text-sm text-neutral-500">{subtitle}</div> : null}
            </div>
            <button type="button" onClick={onClose} className="rounded-xl border border-neutral-200 p-2 text-neutral-500 transition hover:bg-neutral-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default function ConstructionMaterialStock() {
  const { setMats } = useOutletContext();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: "", category: "General", unit_of_measure: "Bags", description: "", reorder_level: "", is_active: true });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await api.get("/purchase/materials");
      if (res.data?.success) {
        setMaterials(res.data.data);
        // Map to layout mats format if possible to keep layout stats working (optional)
        setMats(res.data.data.map((m) => ({ ...m, stock: 0, min: m.reorder_level || 0 })));
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditId(null);
    setForm({ name: "", category: "General", unit_of_measure: "Bags", description: "", reorder_level: "", is_active: true });
    setShowDrawer(true);
  };

  const handleEdit = (m) => {
    setEditId(m.id);
    setForm({
      name: m.name || "",
      category: m.category || "General",
      unit_of_measure: m.unit_of_measure || "Bags",
      description: m.description || "",
      reorder_level: m.reorder_level !== null ? m.reorder_level : "",
      is_active: m.is_active !== undefined ? m.is_active : true
    });
    setShowDrawer(true);
  };

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      try {
        const res = await api.delete(`/purchase/materials/${id}`);
        if (res.data?.success) {
          fetchMaterials();
        }
      } catch (error) {
        console.error("Error deleting material:", error);
      }
    }
  };

  const save = async () => {
    if (!form.name || !form.category || !form.unit_of_measure) return;

    try {
      setSubmitting(true);
      const payload = {
        name: form.name,
        category: form.category,
        unit_of_measure: form.unit_of_measure,
        is_active: form.is_active,
      };

      if (form.description) payload.description = form.description;
      if (form.reorder_level !== "") payload.reorder_level = Number(form.reorder_level);

      if (editId) {
        const res = await api.put(`/purchase/materials/${editId}`, payload);
        if (res.data?.success) {
          fetchMaterials();
          setShowDrawer(false);
          setForm({ name: "", category: "General", unit_of_measure: "Bags", description: "", reorder_level: "", is_active: true });
          setEditId(null);
        }
      } else {
        const res = await api.post("/purchase/materials", payload);
        if (res.data?.success) {
          fetchMaterials();
          setShowDrawer(false);
          setForm({ name: "", category: "General", unit_of_measure: "Bags", description: "", reorder_level: "", is_active: true });
          setEditId(null);
        }
      }
    } catch (error) {
      console.error("Error saving material:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-900">Stock register</div>
          <div className="mt-1 text-xs text-neutral-500">Add new materials and review current stock levels.</div>
        </div>
        <Btn onClick={handleAdd}>+ Add Material</Btn>
      </div>

      <Table headers={["#", "Code", "Material Name", "Category", "Unit", "Current Stock", "Reorder Level", "Status", "Created At", "Action"]}>
        {loading ? (
          <TR>
            <TD colSpan={10} className="text-center py-4 text-neutral-500">Loading materials...</TD>
          </TR>
        ) : materials.length === 0 ? (
          <TR>
            <TD colSpan={10} className="text-center py-4 text-neutral-500">No materials found.</TD>
          </TR>
        ) : (
          materials.map((m, i) => (
            <TR key={m.id}>
              <TD className="text-xs text-neutral-400">{i + 1}</TD>
              <TD className="font-semibold text-blue-600">{m.code}</TD>
              <TD className="font-semibold text-neutral-900">{m.name}</TD>
              <TD className="text-xs text-neutral-500">{m.category}</TD>
              <TD className="text-xs text-neutral-500">{m.unit_of_measure}</TD>
              <TD className="font-bold text-neutral-900">{m.reorder_level}</TD>
              <TD>
                <Badge color={m.is_active ? "green" : "red"}>{m.is_active ? "Active" : "Inactive"}</Badge>
              </TD>
              <TD className="text-xs text-neutral-500">{m.created_at ? new Date(m.created_at).toLocaleDateString("en-IN") : "N/A"}</TD>
              <TD><ActionBtns onEdit={() => handleEdit(m)} onDelete={() => handleDelete(m.id)} /></TD>
            </TR>
          ))
        )}
      </Table>

      {showDrawer && (
        <RightDrawer title={editId ? "Edit Material" : "Add Material to Stock"} onClose={() => setShowDrawer(false)}>
          <FormGrid cols={1} className="gap-5">
            <FG label="Material Name *">
              <Input placeholder="e.g. Cement OPC 53" value={form.name} onChange={(e) => updateField("name", e.target.value)} />
            </FG>
            <FG label="Category *">
              <Select value={form.category} onChange={(e) => updateField("category", e.target.value)}>
                <option>General</option>
                <option>Cement</option>
                <option>Steel</option>
                <option>Sand</option>
                <option>Aggregate</option>
                <option>Bricks</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Wood</option>
                <option>Hardware</option>
              </Select>
            </FG>
            <FG label="Unit of Measure *">
              <Select value={form.unit_of_measure} onChange={(e) => updateField("unit_of_measure", e.target.value)}>
                <option>Bags</option>
                <option>Ton</option>
                <option>Nos</option>
                <option>Meter</option>
                <option>Litre</option>
                <option>Sqft</option>
                <option>Kg</option>
                <option>CuM</option>
              </Select>
            </FG>
            <FG label="Reorder Level">
              <Input type="number" placeholder="0" value={form.reorder_level} onChange={(e) => updateField("reorder_level", e.target.value)} />
            </FG>
            <FG label="Description">
              <Textarea placeholder="Material details, brand, etc." value={form.description} onChange={(e) => updateField("description", e.target.value)} />
            </FG>
            {editId && (
              <FG label="Status">
                <label className="flex items-center gap-2 text-sm text-neutral-900 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => updateField("is_active", e.target.checked)} className="h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-600" />
                  Active
                </label>
              </FG>
            )}
          </FormGrid>
          <div className="mt-8 flex justify-end gap-3">
            <Btn variant="outline" onClick={() => setShowDrawer(false)} disabled={submitting}>Cancel</Btn>
            <Btn onClick={save} disabled={submitting}>{submitting ? "Saving..." : "Save Material"}</Btn>
          </div>
        </RightDrawer>
      )}
    </Card>
  );
}
