import { Badge, Btn, Card, PageHead, SummaryStat, TD, TR, Table, summaryGridClass } from "../ui";
import { deptColor, useHrEmployees } from "./hrData";

export default function HRAttendance() {
  const [employees] = useHrEmployees();

  return (
    <div>
      <PageHead title="HR / Attendance" sub="Track daily check-ins, check-outs and team presence">
        <Btn size="sm">Mark Today's Attendance</Btn>
      </PageHead>

      <div className={summaryGridClass}>
        <SummaryStat label="Present Today" value={Math.max(employees.length - 1, 0)} colorClass="text-emerald-600" />
        <SummaryStat label="Absent Today" value={employees.length ? 1 : 0} colorClass="text-red-700" />
        <SummaryStat label="Late Check-ins" value={2} colorClass="text-orange-600" />
        <SummaryStat label="Attendance Rate" value={`${employees.length ? Math.round(((employees.length - 1) / employees.length) * 100) : 0}%`} />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-semibold text-neutral-900">Attendance – 22 Nov 2025</span>
          <span className="text-xs text-neutral-500">Live roll-call overview by department</span>
        </div>
        <Table headers={["Employee", "Department", "Check In", "Check Out", "Hours", "Status"]}>
          {employees.map((employee, index) => {
            const statuses = ["Present", "Present", "Present", "Absent", "Present", "Present", "Present"];
            const status = statuses[index % statuses.length];

            return (
              <TR key={employee.id}>
                <TD className="font-medium text-neutral-900">{employee.name}</TD>
                <TD><Badge color={deptColor[employee.dept] || "grey"}>{employee.dept}</Badge></TD>
                <TD className="font-medium text-emerald-600">{status === "Absent" ? "–" : "09:15 AM"}</TD>
                <TD className="text-neutral-500">{status === "Absent" ? "–" : "06:30 PM"}</TD>
                <TD className="font-semibold text-neutral-900">{status === "Absent" ? "–" : "9h 15m"}</TD>
                <TD><Badge color={status === "Present" ? "green" : "red"}>{status}</Badge></TD>
              </TR>
            );
          })}
        </Table>
      </Card>
    </div>
  );
}
