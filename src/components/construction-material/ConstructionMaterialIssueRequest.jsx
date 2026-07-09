import { Badge, Card, Table, TR, TD } from "../ui";
import { issueRequests } from "./constructionMaterialData";

export default function ConstructionMaterialIssueRequest() {
  return (
    <Card>
      <Table headers={["Request No.", "Material", "Qty Requested", "Requested By", "Project", "Date", "Status", "Action"]}>
        {issueRequests.map((row, index) => (
          <TR key={index}>
            <TD className="text-xs font-semibold text-blue-600">{row.req}</TD>
            <TD className="font-semibold text-neutral-900">{row.material}</TD>
            <TD>{row.qty}</TD>
            <TD>{row.requestedBy}</TD>
            <TD className="text-xs">{row.project}</TD>
            <TD className="text-xs text-neutral-500">{row.date}</TD>
            <TD><Badge color={row.status === "Approved" ? "green" : row.status === "Pending" ? "orange" : "red"}>{row.status}</Badge></TD>
            <TD>—</TD>
          </TR>
        ))}
      </Table>
    </Card>
  );
}
