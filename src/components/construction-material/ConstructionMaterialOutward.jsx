import { Card, Table, TR, TD } from "../ui";
import { outwardEntries } from "./constructionMaterialData";

export default function ConstructionMaterialOutward() {
  return (
    <Card>
      <Table headers={["Date", "Material", "Quantity", "Issued To", "Purpose", "Project", "Action"]}>
        {outwardEntries.map((row, index) => (
          <TR key={index}>
            <TD className="text-xs text-neutral-500">{row.date}</TD>
            <TD className="font-semibold text-neutral-900">{row.material}</TD>
            <TD className="font-semibold text-red-700">{row.qty}</TD>
            <TD>{row.issuedTo}</TD>
            <TD className="text-xs">{row.purpose}</TD>
            <TD className="text-xs">{row.project}</TD>
            <TD>—</TD>
          </TR>
        ))}
      </Table>
    </Card>
  );
}
