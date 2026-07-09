import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Master from "./components/Master";
import MasterAmenities from "./components/master/MasterAmenities";
import MasterBrokers from "./components/master/MasterBrokers";
import MasterProjects from "./components/master/MasterProjects";
import ProjectAmenities from "./components/master/ProjectAmenities";
import ProjectDetails from "./components/master/ProjectDetails";
import ProjectDocuments from "./components/master/ProjectDocuments";
import MasterPropertyTypes from "./components/master/MasterPropertyTypes";
import ProjectTowers from "./components/master/ProjectTowers";
import ProjectUnits from "./components/master/ProjectUnits";
import MasterVendors from "./components/master/MasterVendors";
import Land from "./components/Land";
import Purchases from "./components/Purchases";
import CreatePurchaseOrder from "./components/purchase/CreatePurchaseOrder";
import PurchaseRequisitions from "./components/purchase/PurchaseRequisitions";
import CreatePurchaseRequisition from "./components/purchase/CreatePurchaseRequisition";
import CreateGRN from "./components/purchase/CreateGRN";
import GRNList from "./components/purchase/GRNList";
import ConstructionMaterial from "./components/ConstructionMaterial";
import SiteProgress from "./components/SiteProgress";
import Marketing from "./components/Marketing";
import HR from "./components/HR";
import HRAttendance from "./components/hr/HRAttendance";
import HREmployees from "./components/hr/HREmployees";
import HRLeaveRequests from "./components/hr/HRLeaveRequests";
import HRPayroll from "./components/hr/HRPayroll";
import SalesLeads from "./components/sales/SalesLeads";
import SalesBooking from "./components/sales/SalesBooking";
import BookingPaymentStages from "./components/sales/BookingPaymentStages";
import CreateBooking from "./components/sales/CreateBooking";
import SelfFinance from "./components/SelfFinance";
import Account from "./components/Account";
import AccountOverview from "./components/account/AccountOverview";
import AccountExpenseLedger from "./components/account/AccountExpenseLedger";
import AccountIncomeLedger from "./components/account/AccountIncomeLedger";
import AccountInvestors from "./components/account/AccountInvestors";
import AccountCapitalInvestment from "./components/account/AccountCapitalInvestment";
import AccountProfitLoss from "./components/account/AccountProfitLoss";
import FileManager from "./components/FileManager";
import ManageTools from "./components/ManageTools";
import Reports from "./components/Reports";
import Login from "./components/Login";
import ConstructionMaterialLayout from "./components/construction-material/ConstructionMaterialLayout";
import ConstructionMaterialStock from "./components/construction-material/ConstructionMaterialStock";
import ConstructionMaterialInward from "./components/construction-material/ConstructionMaterialInward";
import ConstructionMaterialOutward from "./components/construction-material/ConstructionMaterialOutward";
import ConstructionMaterialIssueRequest from "./components/construction-material/ConstructionMaterialIssueRequest";
import { flattenNavItems, getPageTitle, NAV_ITEMS } from "./navigation";
import { setAuthToken } from "./lib/api";
import { clearSession, getStoredSession, persistSession } from "./lib/session";

const ROUTE_COMPONENTS = {
  dashboard: <Dashboard />,
  master: <Master />,
  masterprojects: <MasterProjects />,
  masterpropertytypes: <MasterPropertyTypes />,
  masteramenities: <MasterAmenities />,
  masterbrokers: <MasterBrokers />,
  mastervendors: <MasterVendors />,
  land: <Land />,
  purchases: <Navigate to="/purchases/orders" replace />,
  purchaseorders: <Purchases />,
  purchaserequisitions: <PurchaseRequisitions />,
  siteprogress: <SiteProgress />,
  marketing: <Marketing />,
  hr: <HR />,
  hremployees: <HREmployees />,
  hrattendance: <HRAttendance />,
  hrpayroll: <HRPayroll />,
  hrleaverequests: <HRLeaveRequests />,
  sales: <Navigate to="/sales/leads" replace />,
  salesleads: <SalesLeads />,
  salesbooking: <SalesBooking />,
  selffinance: <SelfFinance />,
  filemanager: <FileManager />,
  managetools: <ManageTools />,
  reports: <Reports />,
};

const ROUTE_ITEMS = flattenNavItems(NAV_ITEMS).filter((item) => !item.id.startsWith("account") && !item.id.startsWith("constructionmaterial"));

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [session, setSession] = useState(() => getStoredSession());

  const isAuthenticated = Boolean(session?.token && session?.user);
  const user = session?.user ?? null;
  const userName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Admin";
  const userRole = user?.role || "Super Admin";
  const userInitials = `${user?.first_name?.[0] || "A"}${user?.last_name?.[0] || user?.email?.[0] || "D"}`.toUpperCase();

  const handleLogin = async (authData, options = {}) => {
    persistSession(authData, options);
    setAuthToken(authData.token);
    setSession(authData);
    navigate("/dashboard", { replace: true });
  };

  const handleLogout = () => {
    clearSession();
    setAuthToken(null);
    setSession(null);
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-100 text-[13px] text-neutral-700">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-4 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-700 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="truncate text-lg font-semibold text-neutral-900 sm:text-xl">{getPageTitle(location.pathname)}</div>
              <div className="hidden text-xs text-neutral-500 sm:block">ConstructPro operations dashboard</div>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            {/* <div className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-400 md:flex md:min-w-64">
              <Search size={14} />
              <span className="flex-1 text-xs">Search Anything</span>
              <span className="rounded-md border border-neutral-200 bg-white px-1.5 py-0.5 text-[10px] text-neutral-400">Ctrl K</span>
            </div> */}

            <div className="flex items-center gap-3 sm:gap-4">
              {/* <div className="hidden items-center sm:flex">
                {["bg-violet-400", "bg-orange-400"].map((cls, i) => (
                  <div
                    key={i}
                    className={`-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white first:ml-0 ${cls}`}
                  >
                    {["A", "B"][i]}
                  </div>
                ))}
                <span className="ml-2 text-xs text-neutral-500">+2</span>
              </div> */}

              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-neutral-600 transition hover:bg-neutral-50"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span className="hidden text-xs font-medium sm:inline">Logout</span>
              </button>

              <button className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-red-500" />
              </button>

              <button className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 transition hover:bg-neutral-50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[blueviolet] text-[11px] font-bold text-white">{userInitials}</div>
                <div className="hidden text-left sm:block">
                  <div className="text-xs font-semibold text-neutral-900">{userName}</div>
                  <div className="text-[11px] text-neutral-500">{userRole}</div>
                </div>
                <ChevronDown size={14} className="text-neutral-500" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Navigate to="/dashboard" replace />} />
            <Route path="/land" element={<Navigate to="/master/lands" replace />} />
            <Route path="/master/projects/:projectId" element={<ProjectDetails />} />
            <Route path="/master/projects/:projectId/towers" element={<ProjectTowers />} />
            <Route path="/master/projects/:projectId/units" element={<ProjectUnits />} />
            <Route path="/master/projects/:projectId/amenities" element={<ProjectAmenities />} />
            <Route path="/master/projects/:projectId/documents" element={<ProjectDocuments />} />
            <Route path="/purchases/create" element={<CreatePurchaseOrder />} />
            <Route path="/purchases/:id/edit" element={<CreatePurchaseOrder />} />
            <Route path="/purchases/orders/:id/grn" element={<CreateGRN />} />
            <Route path="/purchases/grn" element={<GRNList />} />
            <Route path="/purchases/requisitions/create" element={<CreatePurchaseRequisition />} />
            <Route path="/sales/booking/create" element={<CreateBooking />} />
            <Route path="/sales/booking/:bookingId/edit" element={<CreateBooking />} />
            <Route path="/sales/booking/:bookingId/payment-stages" element={<BookingPaymentStages />} />
            <Route path="/construction-material" element={<ConstructionMaterialLayout />}>
              <Route index element={<Navigate to="stock-register" replace />} />
              <Route path="stock-register" element={<ConstructionMaterialStock />} />
              <Route path="inward" element={<ConstructionMaterialInward />} />
              <Route path="outward" element={<ConstructionMaterialOutward />} />
              <Route path="issue-request" element={<ConstructionMaterialIssueRequest />} />
            </Route>
            <Route path="/account" element={<Account />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AccountOverview />} />
              <Route path="expense-ledger" element={<AccountExpenseLedger />} />
              <Route path="income-ledger" element={<AccountIncomeLedger />} />
              <Route path="investors" element={<AccountInvestors />} />
              <Route path="capital-investment" element={<AccountCapitalInvestment />} />
              <Route path="profit-loss" element={<AccountProfitLoss />} />
            </Route>
            {ROUTE_ITEMS.map((item) => (
              <Route key={item.id} path={item.path} element={ROUTE_COMPONENTS[item.id]} />
            ))}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
