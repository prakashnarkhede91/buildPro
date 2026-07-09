import { useMemo, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { Btn, FG, FormGrid, Input, Modal, PageHead, PROJECTS, Select, SummaryStat, summaryGridClass } from "./ui";
import { accountSections, catColors, createDefaultExpenseForm, initialExpenses } from "./account/accountData";

function AccountSubnav() {
  const location = useLocation();

  return (
    <div className="mb-5 flex w-full flex-wrap gap-2 rounded-2xl bg-neutral-100 p-1.5 sm:w-fit">
      {accountSections.map((section) => {
        const isActive = location.pathname === section.path;
        return (
          <NavLink
            key={section.id}
            to={section.path}
            className={`rounded-xl px-4 py-2 text-xs font-medium transition sm:text-[13px] ${isActive ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:bg-white/70"}`}
          >
            {section.label}
          </NavLink>
        );
      })}
    </div>
  );
}

export default function Account() {
  const location = useLocation();
  const [expList, setExpList] = useState(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(() => createDefaultExpenseForm(PROJECTS));
  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const totalExp = useMemo(() => expList.reduce((sum, expense) => sum + expense.amount, 0), [expList]);
  const totalInc = 9100000;
  const net = totalInc - totalExp;
  const catTotals = useMemo(() => {
    const totals = {};
    expList.forEach((expense) => {
      totals[expense.cat] = (totals[expense.cat] || 0) + expense.amount;
    });
    return totals;
  }, [expList]);

  const saveExpense = () => {
    if (!form.desc || !form.amount) return;

    setExpList((current) => [{ id: Date.now(), ...form, amount: Number(form.amount) }, ...current]);
    setShowModal(false);
    setForm(createDefaultExpenseForm(PROJECTS));
  };

  const deleteExpense = (expenseId) => {
    setExpList((current) => current.filter((item) => item.id !== expenseId));
  };

  if (location.pathname === "/account") {
    return <Navigate to="/account/overview" replace />;
  }

  return (
    <div>
      {/* <PageHead title="Account & Financial Reports" sub="Real-time dashboards, expense tracking, and multi-project consolidation">
        {/* <Btn variant="outline">↓ Export</Btn>
        <Btn onClick={() => setShowModal(true)}>+ Add Expense</Btn> 
      </PageHead> */}

      {/* <div className={summaryGridClass}>
        <SummaryStat label="Revenue (Nov)" value="₹91.0L" sub="+12% vs Oct" subClass="text-emerald-600" />
        <SummaryStat label="Expenses (Nov)" value={`₹${(totalExp / 1000).toFixed(0)}K`} colorClass="text-red-700" sub="+5% vs Oct" subClass="text-orange-600" />
        <SummaryStat label="Net Profit" value={`₹${(net / 100000).toFixed(1)}L`} sub="Margin 61%" subClass="text-emerald-600" />
        <SummaryStat label="Pending Recv." value="₹28.4L" colorClass="text-red-700" sub="5 customers" subClass="text-orange-600" />
      </div> */}

      {/* <AccountSubnav /> */}

      <Outlet context={{ expList, totalExp, totalInc, net, catTotals, deleteExpense }} />

      {showModal && (
        <Modal title="Add Expense Entry" onClose={() => setShowModal(false)}>
          <FormGrid cols={2}>
            <FG label="Date *"><Input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} /></FG>
            <FG label="Category"><Select value={form.cat} onChange={(event) => updateForm("cat", event.target.value)}>{Object.keys(catColors).map((category) => <option key={category}>{category}</option>)}</Select></FG>
            <FG label="Description *" span={2}><Input placeholder="Brief description of expense" value={form.desc} onChange={(event) => updateForm("desc", event.target.value)} /></FG>
            <FG label="Amount (₹) *"><Input type="number" placeholder="0" value={form.amount} onChange={(event) => updateForm("amount", event.target.value)} /></FG>
            <FG label="Payment Mode"><Select value={form.mode} onChange={(event) => updateForm("mode", event.target.value)}><option>Bank Transfer</option><option>Cheque</option><option>Cash</option><option>Online</option><option>UPI</option></Select></FG>
            <FG label="Project"><Select value={form.proj} onChange={(event) => updateForm("proj", event.target.value)}>{[...PROJECTS, "All Projects"].map((project) => <option key={project}>{project}</option>)}</Select></FG>
            <FG label="Invoice / Ref No."><Input placeholder="INV-2025-XXX" value={form.inv} onChange={(event) => updateForm("inv", event.target.value)} /></FG>
          </FormGrid>
          <div className="mt-5 flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={saveExpense}>Save Expense</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}
