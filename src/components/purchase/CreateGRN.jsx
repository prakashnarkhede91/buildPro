import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, PackageCheck, Save } from "lucide-react";
import { getPurchaseOrderById, createGRN } from "../../lib/purchases";
import { Badge, Btn, Card, FG, FormGrid, Input, PageHead, Textarea, Table, TR, TD } from "../ui";

export default function CreateGRN() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [po, setPO] = useState(null);
  const [loadingPO, setLoadingPO] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().slice(0, 10));
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverName, setDriverName] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([]);

  // Load Purchase Order on mount
  useEffect(() => {
    let active = true;
    async function loadPO() {
      setLoadingPO(true);
      setFormError("");
      try {
        const res = await getPurchaseOrderById(id);
        const detail = res?.data || res;
        if (!active) return;
        if (detail) {
          setPO(detail);
          // Initialize items mapping po_items to grn_items format
          const mappedItems = (detail.items || []).map((item) => ({
            po_item_id: item.id,
            material_id: item.material_id,
            material_name: item.material_name || item.description || "Material Item",
            material_code: item.material_code || "—",
            ordered_quantity: Number(item.quantity || 0),
            received_quantity: Number(item.quantity || 0),
            rejected_quantity: 0,
            rejection_reason: "",
          }));
          setItems(mappedItems);
        } else {
          setFormError("Purchase Order details not found.");
        }
      } catch (err) {
        console.error("Failed to load PO:", err);
        if (active) {
          setFormError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to load Purchase Order details.");
        }
      } finally {
        if (active) setLoadingPO(false);
      }
    }
    loadPO();
    return () => { active = false; };
  }, [id]);

  // Update specific item properties
  const updateItem = (index, field, value) => {
    setFormError("");
    setItems((curr) =>
      curr.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        
        // Ensure numbers are non-negative and do not exceed logical bounds
        if (field === "received_quantity" || field === "rejected_quantity") {
          const numVal = Math.max(0, Number(value) || 0);
          updated[field] = numVal;
        }

        return updated;
      })
    );
  };

  // Cost and Item Aggregates
  const stats = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.totalOrdered += item.ordered_quantity;
        acc.totalReceived += item.received_quantity;
        acc.totalRejected += item.rejected_quantity;
        return acc;
      },
      { totalOrdered: 0, totalReceived: 0, totalRejected: 0 }
    );
  }, [items]);

  // Form Validation & Save
  const handleSave = async () => {
    setFormError("");
    setSuccessMessage("");

    if (!po) {
      setFormError("Purchase Order is required.");
      return;
    }

    if (items.length === 0) {
      setFormError("No items available to receive against this Purchase Order.");
      return;
    }

    // Validate quantities
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.received_quantity <= 0 && item.rejected_quantity <= 0) {
        setFormError(`Item ${i + 1} (${item.material_name}) must have either a received or a rejected quantity.`);
        return;
      }
      if (item.rejected_quantity > 0 && !item.rejection_reason?.trim()) {
        setFormError(`Please specify a rejection reason for item ${i + 1} (${item.material_name}) since quantity is rejected.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        po_id: po.id,
        project_id: po.project_id,
        received_date: receivedDate || undefined,
        vehicle_number: vehicleNumber.trim() || undefined,
        driver_name: driverName.trim() || undefined,
        notes: notes.trim() || undefined,
        items: items.map((item) => ({
          po_item_id: item.po_item_id,
          material_id: item.material_id,
          ordered_quantity: Number(item.ordered_quantity),
          received_quantity: Number(item.received_quantity),
          rejected_quantity: Number(item.rejected_quantity),
          rejection_reason: item.rejected_quantity > 0 ? item.rejection_reason.trim() : undefined,
        })),
      };

      await createGRN(payload);
      setSuccessMessage("Goods Receipt Note (GRN) submitted successfully!");
      setTimeout(() => {
        navigate("/purchases/orders");
      }, 1500);
    } catch (err) {
      setFormError(err?.response?.data?.error || err?.response?.data?.message || err?.message || "Failed to submit Goods Receipt Note.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHead title="Create Goods Receipt Note (GRN)" sub="Record inward materials received at site against a generated Purchase Order.">
        <div className="flex flex-wrap items-center gap-2">
          <Btn variant="outline" onClick={() => navigate("/purchases/orders")}>
            <ArrowLeft size={16} />
            Back to Orders
          </Btn>
          <Btn onClick={handleSave} disabled={submitting || loadingPO}>
            <Save size={16} />
            {submitting ? "Submitting GRN..." : "Record Goods Receipt"}
          </Btn>
        </div>
      </PageHead>

      {loadingPO ? (
        <Card className="py-10 text-center text-sm text-neutral-500">Loading Purchase Order details...</Card>
      ) : formError && !po ? (
        <Card className="py-8 text-center text-sm border-red-200 bg-red-50 text-red-700">{formError}</Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="space-y-4">
            <Card>
              <div className="mb-4 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">GRN Delivery Details</div>
              {formError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
              {successMessage && <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>}

              <FormGrid cols={2}>
                <FG label="Purchase Order Ref">
                  <Input value={po.po_number || "—"} disabled className="bg-neutral-50 cursor-not-allowed font-semibold text-blue-600" />
                </FG>

                <FG label="Associated Project">
                  <Input value={po.project_name || "—"} disabled className="bg-neutral-50 cursor-not-allowed font-medium text-neutral-800" />
                </FG>

                <FG label="Date Received *">
                  <Input type="date" value={receivedDate} onChange={(e) => setReceivedDate(e.target.value)} />
                </FG>

                <FG label="Delivery Vehicle No. plate">
                  <Input placeholder="e.g. KA-01-AB-1234" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
                </FG>

                <FG label="Driver Name">
                  <Input placeholder="e.g. John Doe" value={driverName} onChange={(e) => setDriverName(e.target.value)} />
                </FG>

                <FG label="Delivery Remarks / Notes" span={2}>
                  <Textarea placeholder="e.g. Materials delivered in good condition, unloaded safely at Block B yard." value={notes} onChange={(e) => setNotes(e.target.value)} />
                </FG>
              </FormGrid>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between border-b border-neutral-100 pb-2">
                <span className="text-sm font-semibold text-neutral-900">Line Items Inward Register Checklist</span>
                <span className="text-xs text-neutral-500 font-medium">Verify actual quantities delivered against PO estimations</span>
              </div>

              <Table headers={["Material Name / Code", "Ordered Qty", "Received Qty *", "Rejected Qty", "Rejection Reason (if rejected)", "Net Accepted"]}>
                {items.map((item, idx) => {
                  const netAccepted = Math.max(0, item.received_quantity - item.rejected_quantity);
                  return (
                    <TR key={idx}>
                      <TD className="min-w-40">
                        <div className="font-semibold text-neutral-900">{item.material_name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">Code: {item.material_code}</div>
                        <div className="text-[9px] text-neutral-400 font-mono mt-0.5 select-all">ID: {item.po_item_id}</div>
                      </TD>
                      <TD className="w-24 text-center font-bold text-neutral-500">{item.ordered_quantity}</TD>
                      <TD className="w-28">
                        <Input
                          type="number"
                          min="0"
                          value={item.received_quantity}
                          onChange={(e) => updateItem(idx, "received_quantity", e.target.value)}
                          className="text-center font-bold text-neutral-900 border-neutral-300 focus:border-[blueviolet]"
                        />
                      </TD>
                      <TD className="w-28">
                        <Input
                          type="number"
                          min="0"
                          value={item.rejected_quantity}
                          onChange={(e) => updateItem(idx, "rejected_quantity", e.target.value)}
                          className="text-center font-bold text-red-600 border-neutral-300 focus:border-red-500"
                        />
                      </TD>
                      <TD className="min-w-44">
                        <Input
                          placeholder="e.g. Broken or wet bags"
                          value={item.rejection_reason}
                          disabled={item.rejected_quantity === 0}
                          onChange={(e) => updateItem(idx, "rejection_reason", e.target.value)}
                          className={`text-xs ${item.rejected_quantity === 0 ? "bg-neutral-50 text-neutral-400 cursor-not-allowed" : "border-red-200 focus:border-red-400"}`}
                        />
                      </TD>
                      <TD className="w-28 text-center font-extrabold text-[blueviolet]">
                        {netAccepted}
                      </TD>
                    </TR>
                  );
                })}
              </Table>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <div className="mb-3 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Material Inward Summary</div>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Total Ordered Quantity</span>
                  <span className="font-semibold text-neutral-800">{stats.totalOrdered} units</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Total Received Quantity</span>
                  <span className="font-semibold text-emerald-600">{stats.totalReceived} units</span>
                </div>
                <div className="flex items-center justify-between text-neutral-600 border-b border-neutral-100 pb-2">
                  <span>Total Rejected Quantity</span>
                  <span className="font-semibold text-red-600">{stats.totalRejected} units</span>
                </div>
                <div className="flex items-center justify-between text-neutral-700 pt-1 text-sm">
                  <span className="font-bold">Net Accepted Quantity</span>
                  <span className="font-extrabold text-[blueviolet] text-base">{Math.max(0, stats.totalReceived - stats.totalRejected)} units</span>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-3 text-sm font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Goods Receipt Info</div>
              <div className="space-y-2 text-xs text-neutral-500">
                <p>💡 **GRN (Goods Receipt Note)** generates a unique tracking number sequentially on success.</p>
                <p>💡 Site engineers use this inward log to reconcile supplier deliveries against procurement bills.</p>
                <p>💡 Quantity rejected will automatically prompt for a rejection reason before saving.</p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
