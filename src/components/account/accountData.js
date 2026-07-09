export const monthData = [
  { m: "May", inc: 5200000, exp: 2800000 },
  { m: "Jun", inc: 4800000, exp: 3100000 },
  { m: "Jul", inc: 6200000, exp: 2600000 },
  { m: "Aug", inc: 7100000, exp: 3400000 },
  { m: "Sep", inc: 5900000, exp: 2900000 },
  { m: "Oct", inc: 8200000, exp: 3200000 },
  { m: "Nov", inc: 9100000, exp: 3500000 },
];

export const catColors = {
  Contractor: "#cc0000",
  "Project Expenses": "#2563eb",
  Salary: "#16a34a",
  Marketing: "#ea580c",
  Other: "#888",
};

export const catDotClass = {
  Contractor: "bg-[blueviolet]",
  "Project Expenses": "bg-blue-600",
  Salary: "bg-emerald-600",
  Marketing: "bg-orange-600",
  Other: "bg-neutral-500",
};

export const initialExpenses = [
  { id: 1, date: "22 Nov 2025", cat: "Contractor", desc: "RCC Work – Kasturi Courtyard", amount: 138000, proj: "Kasturi Courtyard", mode: "Bank Transfer", inv: "INV-2025-089" },
  { id: 2, date: "21 Nov 2025", cat: "Project Expenses", desc: "Cement & Steel Purchase", amount: 82500, proj: "Green Valley Phase 2", mode: "Cheque", inv: "INV-2025-088" },
  { id: 3, date: "20 Nov 2025", cat: "Salary", desc: "Sales Team Salary – Nov", amount: 20000, proj: "All Projects", mode: "Bank Transfer", inv: "PAY-NOV-2025" },
  { id: 4, date: "19 Nov 2025", cat: "Marketing", desc: "Facebook & Instagram Ads", amount: 25000, proj: "All Projects", mode: "Online", inv: "ADS-2025-011" },
  { id: 5, date: "18 Nov 2025", cat: "Other", desc: "Site Office Maintenance", amount: 65000, proj: "Sunrise Heights", mode: "Cash", inv: "EXP-2025-034" },
];

export const income = [
  { id: 1, date: "21 Nov 2025", customer: "Brijesh Gurjar", type: "Booking Amount", amount: 750000, proj: "Sunrise Heights", mode: "Cheque", ref: "BK-2025-041" },
  { id: 2, date: "19 Nov 2025", customer: "Adarsh Kumar", type: "Installment 2", amount: 300000, proj: "Royal Palms", mode: "Bank Transfer", ref: "INST-2025-089" },
  { id: 3, date: "17 Nov 2025", customer: "Ram Patel", type: "Agreement Amount (20%)", amount: 900000, proj: "Kasturi Courtyard", mode: "RTGS", ref: "INST-2025-088" },
];

export const profitLossRows = [
  { label: "Total Revenue", value: 9100000, type: "income" },
  { label: "Cost of Construction", value: 3200000, type: "expense" },
  { label: "Gross Profit", value: 5900000, type: "profit" },
  { label: "Operating Expenses", value: 305000, type: "expense" },
  { label: "Marketing Expenses", value: 120000, type: "expense" },
  { label: "Admin & HR", value: 247000, type: "expense" },
  { label: "Net Profit", value: 5228000, type: "profit" },
];

export const accountSections = [
  { id: "accountoverview", label: "Overview", path: "/account/overview" },
  { id: "accountexpenseledger", label: "Expense Ledger", path: "/account/expense-ledger" },
  { id: "accountincomeledger", label: "Income Ledger", path: "/account/income-ledger" },
  { id: "investors", label: "Investors", path: "/account/investors" },
  { id: "capitalinvestment", label: "Capital Investment", path: "/account/capital-investment" },
  { id: "accountprofitloss", label: "P&L Report", path: "/account/profit-loss" },
];

export function createDefaultExpenseForm(projects = []) {
  return {
    date: "",
    cat: "Contractor",
    desc: "",
    amount: "",
    proj: projects[0] || "",
    mode: "Bank Transfer",
    inv: "",
  };
}
