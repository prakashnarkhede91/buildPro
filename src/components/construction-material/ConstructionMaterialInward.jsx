import { Badge, Card, Table, TR, TD } from "../ui";
import { inwardEntries } from "./constructionMaterialData";

export default function ConstructionMaterialInward() {
  return (
    <Card>
      <Table headers={["Date", "Material", "Quantity", "Vendor", "Project", "GRN No.", "Action"]}>
        {inwardEntries.map((row, index) => (
          <TR key={index}>
            <TD className="text-xs text-neutral-500">{row.date}</TD>
            <TD className="font-semibold text-neutral-900">{row.material}</TD>
            <TD className="font-semibold text-emerald-600">{row.qty}</TD>
            <TD>{row.vendor}</TD>
            <TD className="text-xs">{row.project}</TD>
            <TD className="text-xs text-blue-600">{row.grn}</TD>
            <TD><Badge color="grey">View</Badge></TD>
          </TR>
        ))}
      </Table>
    </Card>
  );
}
