import { useEffect, useMemo, useState } from "react";
import { createEmployee, getEmployees } from "../../lib/hr";
import { ActionBtns, Badge, Btn, Card, FG, FormGrid, Input, Modal, PageHead, SummaryStat, TD, TR, Table, summaryGridClass, Select } from "../ui";
import { deptColor } from "./hrData";
import { USER_ROLE, USER_ROLE_OPTIONS } from "../../lib/enums";

// Use centralized enum for role options
const ROLE_OPTIONS = USER_ROLE_OPTIONS;
const EMPLOYMENT_TYPE_OPTIONS = [
  { value: "full_time",  label: "Full Time" },
  { value: "part_time",  label: "Part Time" },
  { value: "contract",   label: "Contract" },
];
const initialForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone: "",
  role: USER_ROLE.MANAGER,
  designation: "",
  department_id: "",
  joining_date: "",
  employment_type: "full_time",
  basic_salary: "",
  bank_account: "",
  bank_ifsc: "",
  bank_name: "",
  pf_number: "",
  esi_number: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
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

function formatLabel(value = "") {
  return String(value || "")
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function formatJoinDate(value) {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
    const date = new Date(value.includes("T") ? value : `${value}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    }
  }

  return value;
}

function getEmployeeName(employee) {
  const fullName = [employee.first_name, employee.last_name].filter(Boolean).join(" ").trim();
  return fullName || employee.name || employee.full_name || employee.employee_name || employee.email || "—";
}

function mapEmployeeToRow(employee, index) {
  const department = formatLabel(employee.department || employee.department_name || employee.dept || "Admin") || "Admin";
  const status = formatLabel(employee.status || employee.employment_status || employee.employee_status || "Active") || "Active";
  const role = employee.role || employee.designation || employee.job_title || employee.position || "—";
  const salary = Number(employee.salary ?? employee.monthly_salary ?? employee.ctc ?? employee.payroll_amount ?? 0) || 0;

  return {
    id: employee.id || employee._id || employee.user_id || employee.employee_id || `employee-${index + 1}`,
    name: getEmployeeName(employee),
    dept: department,
    role,
    mobile: employee.mobile || employee.phone || employee.phone_number || employee.contact_number || "—",
    join: formatJoinDate(employee.joining_date || employee.date_of_joining || employee.join_date || employee.created_at),
    salary,
    status,
  };
}

function getStatusColor(status = "") {
  const normalized = String(status).trim().toLowerCase();

  if (["active", "confirmed", "present"].includes(normalized)) return "green";
  if (["on leave", "leave", "probation", "pending"].includes(normalized)) return "orange";
  if (["inactive", "terminated", "resigned", "absent"].includes(normalized)) return "red";
  return "grey";
}

export default function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const payrollTotal = useMemo(
    () => employees.reduce((sum, employee) => sum + Number(employee.salary || 0), 0),
    [employees],
  );

  useEffect(() => {
    let active = true;

    const loadEmployees = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getEmployees();
        if (!active) return;
        setEmployees(getItems(response).map(mapEmployeeToRow));
      } catch (loadError) {
        if (!active) return;
        setEmployees([]);
        setError(getApiErrorMessage(loadError, "Failed to load employees."));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEmployees();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const closeModal = () => {
    setShowModal(false);
    setSaveError("");
    setSaving(false);
    setForm(initialForm);
  };

  const openModal = () => {
    setSaveError("");
    setForm(initialForm);
    setShowModal(true);
  };

  const saveEmployee = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim() || !form.password.trim() || !form.role || !form.designation.trim() || !form.joining_date) {
      setSaveError("Fill all required fields before saving.");
      return;
    }

    setSaving(true);
    setSaveError("");

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      designation: form.designation.trim(),
      joining_date: form.joining_date,
    };

    const optionalFields = {
      phone: form.phone.trim(),
      department_id: form.department_id.trim(),
      employment_type: form.employment_type,
      basic_salary: form.basic_salary,
      bank_account: form.bank_account.trim(),
      bank_ifsc: form.bank_ifsc.trim(),
      bank_name: form.bank_name.trim(),
      pf_number: form.pf_number.trim(),
      esi_number: form.esi_number.trim(),
      emergency_contact_name: form.emergency_contact_name.trim(),
      emergency_contact_phone: form.emergency_contact_phone.trim(),
    };

    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) return;
      if (key === "basic_salary") {
        const amount = Number(value);
        if (!Number.isNaN(amount)) {
          payload[key] = amount;
        }
        return;
      }
      payload[key] = value;
    });

    try {
      await createEmployee(payload);
      closeModal();
      setReloadKey((current) => current + 1);
    } catch (saveEmployeeError) {
      setSaveError(getApiErrorMessage(saveEmployeeError, "Failed to create employee."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHead title="HR / Employees" sub="Manage employee records, teams and hiring details">
        <Btn onClick={openModal}>+ Add Employee</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Total Employees" value={employees.length} />
        <SummaryStat label="Active Employees" value={employees.filter((employee) => String(employee.status).trim().toLowerCase() === "active").length} colorClass="text-emerald-600" />
        <SummaryStat label="Departments" value={new Set(employees.map((employee) => employee.dept)).size} colorClass="text-orange-600" />
        <SummaryStat label="Monthly Payroll" value={`₹${(payrollTotal / 1000).toFixed(0)}K`} colorClass="text-red-700" />
      </div>

      <Card>
        {loading ? (
          <div className="py-10 text-center text-sm text-neutral-500">Loading employees...</div>
        ) : error ? (
          <div className="space-y-3 py-10 text-center">
            <div className="text-sm text-red-700">{error}</div>
            <Btn size="sm" onClick={() => setReloadKey((current) => current + 1)}>Retry</Btn>
          </div>
        ) : !employees.length ? (
          <div className="py-10 text-center text-sm text-neutral-500">No employees found.</div>
        ) : (
          <Table headers={["#", "Name", "Department", "Role", "Mobile", "Joining Date", "Salary", "Status", "Action"]}>
            {employees.map((employee, index) => (
              <TR key={employee.id}>
                <TD className="text-xs text-neutral-400">{index + 1}</TD>
                <TD>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-red-700">{employee.name.charAt(0)}</div>
                    <span className="font-semibold text-neutral-900">{employee.name}</span>
                  </div>
                </TD>
                <TD><Badge color={deptColor[employee.dept] || "grey"}>{employee.dept}</Badge></TD>
                <TD className="text-xs">{employee.role}</TD>
                <TD className="text-blue-600">{employee.mobile}</TD>
                <TD className="text-xs text-neutral-500">{employee.join}</TD>
                <TD className="font-bold text-neutral-900">₹{Number(employee.salary).toLocaleString("en-IN")}</TD>
                <TD><Badge color={getStatusColor(employee.status)}>{employee.status}</Badge></TD>
                <TD><ActionBtns onEdit={() => {}} onDelete={() => setEmployees((current) => current.filter((item) => item.id !== employee.id))} /></TD>
              </TR>
            ))}
          </Table>
        )}
      </Card>

      {showModal && (
        <Modal title="Add New Employee" onClose={saving ? undefined : closeModal} width="lg">
          <FormGrid cols={2}>
            <FG label="First Name *"><Input placeholder="Rahul" value={form.first_name} onChange={(event) => updateForm("first_name", event.target.value)} /></FG>
            <FG label="Last Name *"><Input placeholder="Sharma" value={form.last_name} onChange={(event) => updateForm("last_name", event.target.value)} /></FG>
            <FG label="Email *"><Input type="email" placeholder="rahul.sharma@example.com" value={form.email} onChange={(event) => updateForm("email", event.target.value)} /></FG>
            <FG label="Password *"><Input type="password" placeholder="Rahul@123" value={form.password} onChange={(event) => updateForm("password", event.target.value)} /></FG>
            <FG label="Phone"><Input placeholder="9876543210" value={form.phone} onChange={(event) => updateForm("phone", event.target.value)} /></FG>
            <FG label="Role *">
              <Select value={form.role} onChange={(event) => updateForm("role", event.target.value)}>
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FG>
            <FG label="Designation *"><Input placeholder="HR Manager" value={form.designation} onChange={(event) => updateForm("designation", event.target.value)} /></FG>
            <FG label="Department ID"><Input placeholder="7d5c0d3d-0b0e-4a30-a94d-6b0b1e8f1111" value={form.department_id} onChange={(event) => updateForm("department_id", event.target.value)} /></FG>
            <FG label="Joining Date *"><Input type="date" value={form.joining_date} onChange={(event) => updateForm("joining_date", event.target.value)} /></FG>
            <FG label="Employment Type">
              <Select value={form.employment_type} onChange={(event) => updateForm("employment_type", event.target.value)}>
                {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </Select>
            </FG>
            <FG label="Basic Salary (₹)"><Input type="number" placeholder="45000" value={form.basic_salary} onChange={(event) => updateForm("basic_salary", event.target.value)} /></FG>
            <FG label="Bank Account"><Input placeholder="123456789012" value={form.bank_account} onChange={(event) => updateForm("bank_account", event.target.value)} /></FG>
            <FG label="Bank IFSC"><Input placeholder="SBIN0001234" value={form.bank_ifsc} onChange={(event) => updateForm("bank_ifsc", event.target.value)} /></FG>
            <FG label="Bank Name"><Input placeholder="State Bank of India" value={form.bank_name} onChange={(event) => updateForm("bank_name", event.target.value)} /></FG>
            <FG label="PF Number"><Input placeholder="PF123456" value={form.pf_number} onChange={(event) => updateForm("pf_number", event.target.value)} /></FG>
            <FG label="ESI Number"><Input placeholder="ESI123456" value={form.esi_number} onChange={(event) => updateForm("esi_number", event.target.value)} /></FG>
            <FG label="Emergency Contact Name"><Input placeholder="Amit Sharma" value={form.emergency_contact_name} onChange={(event) => updateForm("emergency_contact_name", event.target.value)} /></FG>
            <FG label="Emergency Contact Phone"><Input placeholder="9988776655" value={form.emergency_contact_phone} onChange={(event) => updateForm("emergency_contact_phone", event.target.value)} /></FG>
          </FormGrid>
          {saveError ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div> : null}
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={closeModal} disabled={saving}>Cancel</Btn>
            <Btn onClick={saveEmployee} disabled={saving}>{saving ? "Saving..." : "Add Employee"}</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
