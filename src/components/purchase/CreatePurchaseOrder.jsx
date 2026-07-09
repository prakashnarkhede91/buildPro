import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { getProjects } from "../../lib/projects";
import { getVendors } from "../../lib/vendors";
import { createPurchaseOrder, getPurchaseOrderById, updatePurchaseOrder } from "../../lib/purchases";
import { Badge, Btn, Card, FG, FormGrid, Input, PageHead, Select, Textarea, Table, TR, TD } from "../ui";
import { PURCHASE_STATUS_OPTIONS } from "../../lib/enums";

function toInputDate(value) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function getItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  const [projectId, setProjectId] = useState("");
  const [vendorId, setVendorId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [terms, setTerms] = useState("Net 30 days");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("draft");
  
  const [items, setItems] = useState([
    { material_id: "", description: "", quantity: 1, unit_price: 0, gst_percent: 18 }
  ]);
  
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Load Projects, Vendors, Materials, and Purchase Order if in Edit Mode
  useEffect(() => {
    let active = true;
    async function loadData() {
      setLoadingInitial(true);
      setFormError("");
      try {
        const [projRes, vendRes, matRes] = await Promise.all([
          getProjects(),
          getVendors(),
          api.get("/purchase/materials")
        ]);
        
        if (!active) return;
        setProjects(getItems(projRes));
        setVendors(getItems(vendRes));
        if (matRes.data?.success) {
          setMaterials(matRes.data.data);
        }

        if (isEditMode) {
          const poRes = await getPurchaseOrderById(id);
          if (!active) return;
          const po = poRes?.data || poRes;
          if (po) {
            setProjectId(po.project_id || "");
            setVendorId(po.vendor_id || "");
            setQuotationId(po.quotation_id || "");
            setDeliveryDate(toInputDate(po.delivery_date));
            setDeliveryAddress(po.delivery_address || "");
            setTerms(po.terms || "Net 30 days");
            setNotes(po.notes || "");
            setStatus(po.status || "draft");
            if (po.items && Array.isArray(po.items)) {
              setItems(po.items.map(item => ({
                id: item.id,
                material_id: item.material_id || "",
                description: item.description || "",
                quantity: item.quantity || 1,
                unit_price: Number(item.unit_price) || 0,
                gst_percent: Number(item.gst_percent) || 18
              })));
            }
          }
        }
      } catch (err) {
        console.error("Error loading form dependencies:", err);
        if (active) setFormError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load purchase order details.");
      } finally {
        if (active) setLoadingInitial(false);
      }
    }
    loadData();
    return () => { active = false; };
  }, [id, isEditMode]);

  // Update item field
  const updateItem = (index, field, value) => {
    setFormError("");
    setItems((curr) =>
      curr.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        
        // If material changes, we can pre-populate description with the material name
        if (field === "material_id") {
          const selectedMat = materials.find((m) => m.id === value);
          if (selectedMat) {
            updated.description = selectedMat.name;
          }
        }
        
        return updated;
      })
    );
  };

  // Add empty item row
  const addItemRow = () => {
    setItems((curr) => [...curr, { material_id: "", description: "", quantity: 1, unit_price: 0, gst_percent: 18 }]);
  };

  // Remove item row
  const removeItemRow = (index) => {
    if (items.length <= 1) {
      setFormError("Purchase Order must contain at least one item.");
      return;
    }
    setItems((curr) => curr.filter((_, idx) => idx !== index));
  };

  // Dynamically calculate subtotals & totals
  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_price || 0)), 0);
  }, [items]);

  const gstAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const amt = Number(item.quantity || 0) * Number(item.unit_price || 0);
      return sum + (amt * (Number(item.gst_percent || 0) / 100));
    }, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return subtotal + gstAmount;
  }, [subtotal, gstAmount]);

  // Form Validation and Submission
  const handleSave = async () => {
    setFormError("");
    setSuccessMessage("");

    if (!projectId) {
      setFormError("Project is required.");
      return;
    }
    if (!vendorId) {
      setFormError("Vendor is required.");
      return;
    }
    if (!deliveryDate) {
      setFormError("Delivery Date is required.");
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError("Delivery Address is required.");
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
      if (Number(item.unit_price) < 0) {
        setFormError(`Unit price for item ${i + 1} cannot be negative.`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const payload = {
        project_id: projectId,
        vendor_id: vendorId,
        quotation_id: quotationId || null,
        delivery_date: deliveryDate,
        delivery_address: deliveryAddress.trim(),
        subtotal: parseFloat(subtotal.toFixed(2)),
        gst_amount: parseFloat(gstAmount.toFixed(2)),
        total_amount: parseFloat(totalAmount.toFixed(2)),
        terms: terms.trim() || null,
        notes: notes.trim() || null,
        status: status,
        items: items.map((item) => {
          const itemPayload = {
            material_id: item.material_id,
            description: item.description?.trim() || undefined,
            quantity: Number(item.quantity),
            unit_price: parseFloat(Number(item.unit_price).toFixed(2)),
            gst_percent: Number(item.gst_percent),
            amount: parseFloat((Number(item.quantity) * Number(item.unit_price)).toFixed(2))
          };
          if (item.id) {
            itemPayload.id = item.id;
          }
          return itemPayload;
        })
      };

      if (isEditMode) {
        await updatePurchaseOrder(id, payload);
        setSuccessMessage("Purchase Order updated successfully!");
      } else {
        await createPurchaseOrder(payload);
        setSuccessMessage("Purchase Order created successfully!");
      }
      setTimeout(() => {
        navigate("/purchases");
      }, 1500);
    } catch (err) {
      setFormError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to save Purchase Order.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHead title={isEditMode ? "Edit Purchase Order" : "Create Purchase Order"} sub={isEditMode ? "Update purchase order details, status, and material item rows." : "Create a new purchase order with materials, vendors, and delivery details."}>
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="outline" onClick={() => navigate("/purchases")}>
            <ArrowLeft size={16} />
            Back to Purchases
          </Btn>
          <Btn onClick={handleSave} disabled={submitting || loadingInitial}>
            <Save size={16} />
            {submitting ? "Saving..." : isEditMode ? "Update Purchase Order" : "Save Purchase Order"}
          </Btn>
        </div>
      </PageHead>

      {loadingInitial ? (
        <Card className="py-10 text-center text-sm text-neutral-500">Loading resources...</Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="space-y-4">
            <Card>
              <div className="mb-4 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">PO Details</div>
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

                <FG label="Vendor *">
                  <Select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                    <option value="">Select vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </Select>
                </FG>

                <FG label="Expected Delivery Date *">
                  <Input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} />
                </FG>

                <FG label="Quotation ID (optional)">
                  <Input placeholder="e.g. QUO-12345" value={quotationId} onChange={(e) => setQuotationId(e.target.value)} />
                </FG>

                <FG label="Delivery Address *" span={2}>
                  <Input placeholder="123 Construction Site, Building A" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} />
                </FG>

                <FG label="Payment Terms">
                  <Input placeholder="e.g. Net 30 days" value={terms} onChange={(e) => setTerms(e.target.value)} />
                </FG>

                {isEditMode && (
                  <FG label="Status">
                    <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                      {PURCHASE_STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </Select>
                  </FG>
                )}

                <FG label="Notes" span={isEditMode ? 2 : 1}>
                  <Textarea placeholder="Additional notes for vendor..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </FG>
              </FormGrid>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-sm font-semibold text-neutral-900">Materials / Items</span>
                <Btn size="sm" variant="outline" onClick={addItemRow}>
                  <Plus size={14} /> Add Item
                </Btn>
              </div>

              <Table headers={["Material *", "Description", "Qty *", "Unit Price *", "GST %", "Total (₹)", "Action"]}>
                {items.map((item, idx) => {
                  const lineTotal = Number(item.quantity || 0) * Number(item.unit_price || 0);
                  return (
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
                        <Input placeholder="Item details" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} />
                      </TD>
                      <TD className="w-20">
                        <Input type="number" min="1" placeholder="1" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                      </TD>
                      <TD className="w-28">
                        <Input type="number" min="0" placeholder="0.00" value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", e.target.value)} />
                      </TD>
                      <TD className="w-20">
                        <Select value={item.gst_percent} onChange={(e) => updateItem(idx, "gst_percent", Number(e.target.value))}>
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </Select>
                      </TD>
                      <TD className="font-semibold text-neutral-900 w-24">
                        ₹{lineTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </TD>
                      <TD className="w-12">
                        <button type="button" onClick={() => removeItemRow(idx)} className="rounded-md p-1 text-red-700 transition hover:bg-red-50">
                          <Trash2 size={16} />
                        </button>
                      </TD>
                    </TR>
                  );
                })}
              </Table>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <div className="mb-3 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Amount Summary</div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-900">₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>GST Amount</span>
                  <span className="font-semibold text-neutral-900">₹{gstAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-neutral-150 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-900">Total Amount</span>
                    <span className="text-lg font-bold text-[blueviolet]">₹{totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-3 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Quick Helpers</div>
              <div className="space-y-2 text-xs text-neutral-500">
                <p>💡 <strong>Subtotal</strong> is calculated as <code>Quantity * Unit Price</code> for all materials.</p>
                <p>💡 <strong>GST Amount</strong> is the aggregate of material line values calculated by their individual tax rates.</p>
                <p>💡 <strong>Total Amount</strong> is the complete payable sum (Subtotal + GST).</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
