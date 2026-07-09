import { ActionBtns, Badge, Card, PageHead, TD, TR, Table } from "../ui";

const BROKERS = [
  { name: "Rajesh Sharma", mobile: "9876543210", city: "Bhopal", proj: 3, comm: "2%", status: "Active" },
  { name: "Priya Verma", mobile: "9765432109", city: "Indore", proj: 2, comm: "1.5%", status: "Active" },
  { name: "Anand Gupta", mobile: "9654321098", city: "Jabalpur", proj: 1, comm: "2%", status: "Inactive" },
];

export default function MasterBrokers() {
  return (
    <div>
      <PageHead title="Master / Brokers" sub="Manage broker master records and commissions" />
      <Card>
        <Table headers={["#", "Name", "Mobile", "City", "Projects", "Commission %", "Status", "Action"]}>
          {BROKERS.map((broker, index) => (
            <TR key={broker.mobile}>
              <TD className="text-xs text-neutral-400">{index + 1}</TD>
              <TD className="font-semibold text-neutral-900">{broker.name}</TD>
              <TD className="text-blue-600">{broker.mobile}</TD>
              <TD>{broker.city}</TD>
              <TD className="font-semibold text-neutral-900">{broker.proj}</TD>
              <TD className="font-semibold text-emerald-600">{broker.comm}</TD>
              <TD>
                <Badge color={broker.status === "Active" ? "green" : "grey"}>{broker.status}</Badge>
              </TD>
              <TD>
                <ActionBtns onEdit={() => {}} onDelete={() => {}} />
              </TD>
            </TR>
          ))}
        </Table>
      </Card>
    </div>
  );
}
