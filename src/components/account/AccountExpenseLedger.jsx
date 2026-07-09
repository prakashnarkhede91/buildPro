import { ActionBtns, Badge, Card, Table, TD, TR } from "../ui";
import { catDotClass } from "./accountData";
import { useAccountSection } from "./useAccountSection";

export default function AccountExpenseLedger() {
  const { expList, deleteExpense } = useAccountSection();

  return (
    <Card>
      <Table headers={["Date", "Category", "Description", "Project", "Mode", "Invoice", "Amount", "Action"]}>
        {expList.map((expense) => (
          <TR key={expense.id}>
            <TD className="text-xs text-neutral-500">{expense.date}</TD>
            <TD>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                <div className={`h-2 w-2 rounded-sm ${catDotClass[expense.cat] || "bg-neutral-500"}`} />
                {expense.cat}
              </span>
            </TD>
            <TD className="font-medium text-neutral-900">{expense.desc}</TD>
            <TD className="text-xs text-neutral-600">{expense.proj}</TD>
            <TD><Badge color="grey">{expense.mode}</Badge></TD>
            <TD className="text-xs text-blue-600">{expense.inv}</TD>
            <TD className="font-bold text-red-700">₹{expense.amount.toLocaleString("en-IN")}</TD>
            <TD><ActionBtns onEdit={() => {}} onDelete={() => deleteExpense(expense.id)} /></TD>
          </TR>
        ))}
      </Table>
    </Card>
  );
}
