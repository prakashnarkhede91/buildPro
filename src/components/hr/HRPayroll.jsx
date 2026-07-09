import { Badge, Btn, Card, PageHead, SummaryStat, TD, TR, Table, summaryGridClass } from "../ui";
import { useHrEmployees } from "./hrData";

export default function HRPayroll() {
  const [employees] = useHrEmployees();
  const payrollTotal = employees.reduce((sum, employee) => sum + Number(employee.salary || 0), 0);
  const allowances = employees.reduce((sum, employee) => sum + Math.round(Number(employee.salary || 0) * 0.2), 0);
  const deductions = employees.reduce((sum, employee) => sum + Math.round(Number(employee.salary || 0) * 0.12), 0);

  return (
    <div>
      <PageHead title="HR / Payroll" sub="Review salary processing, allowances and monthly payouts">
        <Btn size="sm">Process Payroll</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Gross Payroll" value={`₹${payrollTotal.toLocaleString("en-IN")}`} />
        <SummaryStat label="Allowances" value={`₹${allowances.toLocaleString("en-IN")}`} colorClass="text-emerald-600" />
        <SummaryStat label="Deductions" value={`₹${deductions.toLocaleString("en-IN")}`} colorClass="text-red-700" />
        <SummaryStat label="Net Payable" value={`₹${(payrollTotal + allowances - deductions).toLocaleString("en-IN")}`} colorClass="text-blue-600" />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-neutral-900">Payroll – November 2025</span>
          <span className="text-xs text-neutral-500">Salary sheet for all active employees</span>
        </div>
        <Table headers={["Employee", "Basic Salary", "Allowances", "Deductions", "Net Pay", "Status"]}>
          {employees.map((employee, index) => {
            const basic = Number(employee.salary || 0);
            const allowance = Math.round(basic * 0.2);
            const deduction = Math.round(basic * 0.12);
            const net = basic + allowance - deduction;

            return (
              <TR key={employee.id}>
                <TD className="font-medium text-neutral-900">{employee.name}</TD>
                <TD>₹{basic.toLocaleString("en-IN")}</TD>
                <TD className="text-emerald-600">+₹{allowance.toLocaleString("en-IN")}</TD>
                <TD className="text-red-700">–₹{deduction.toLocaleString("en-IN")}</TD>
                <TD className="font-bold text-neutral-900">₹{net.toLocaleString("en-IN")}</TD>
                <TD><Badge color={index < 4 ? "green" : "orange"}>{index < 4 ? "Paid" : "Pending"}</Badge></TD>
              </TR>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
