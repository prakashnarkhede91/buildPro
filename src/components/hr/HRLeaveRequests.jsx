import { Badge, Btn, Card, PageHead, SummaryStat, TD, TR, Table, summaryGridClass } from "../ui";
import { leaveRequests } from "./hrData";

export default function HRLeaveRequests() {
  const approvedCount = leaveRequests.filter((request) => request.status === "Approved").length;
  const pendingCount = leaveRequests.filter((request) => request.status === "Pending").length;
  const totalDays = leaveRequests.reduce((sum, request) => sum + request.days, 0);

  return (
    <div>
      <PageHead title="HR / Leave Requests" sub="Review approvals, leave balances and pending employee requests" />

      <div className={summaryGridClass}>
        <SummaryStat label="Total Requests" value={leaveRequests.length} />
        <SummaryStat label="Approved" value={approvedCount} colorClass="text-emerald-600" />
        <SummaryStat label="Pending" value={pendingCount} colorClass="text-orange-600" />
        <SummaryStat label="Leave Days" value={totalDays} colorClass="text-blue-600" />
      </div>

      <Card>
        <Table headers={["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status", "Action"]}>
          {leaveRequests.map((request, index) => (
            <TR key={`${request.emp}-${index}`}>
              <TD className="font-medium text-neutral-900">{request.emp}</TD>
              <TD><Badge color="blue">{request.type}</Badge></TD>
              <TD className="text-xs">{request.from}</TD>
              <TD className="text-xs">{request.to}</TD>
              <TD className="font-bold text-neutral-900">{request.days}</TD>
              <TD className="text-xs text-neutral-500">{request.reason}</TD>
              <TD><Badge color={request.status === "Approved" ? "green" : "orange"}>{request.status}</Badge></TD>
              <TD>
                {request.status === "Pending" && (
                  <div className="flex gap-2">
                    <Btn size="sm" className="border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100">✓</Btn>
                    <Btn size="sm" className="border-red-200 bg-red-50 text-red-700 hover:bg-red-100">✕</Btn>
                  </div>
                )}
              </TD>
            </TR>
          ))}
        </Table>
      </Card>
    </div>
  );
}
