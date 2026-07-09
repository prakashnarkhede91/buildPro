export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Admin', path: '/dashboard', title: 'Dashboard' },
  {
    id: 'master',
    label: 'Master',
    path: '/master',
    title: 'Master',
    children: [
      { id: 'masterprojects', label: 'Projects', path: '/master/projects', title: 'Master / Projects' },
      { id: 'land', label: 'Land', path: '/master/lands', title: 'Master / Land' },
      { id: 'masterpropertytypes', label: 'Construction Material', path: '/construction-material/stock-register', title: 'Construction Material' },
      // { id: 'masteramenities', label: 'Amenities', path: '/master/amenities', title: 'Master / Amenities' },
      // { id: 'masterbrokers', label: 'Brokers', path: '/master/brokers', title: 'Master / Brokers' },
      { id: 'mastervendors', label: 'Vendors', path: '/master/vendors', title: 'Master / Vendors' },
    ],
  },
  {
    id: 'purchases',
    label: 'Purchases',
    path: '/purchases',
    title: 'Purchases',
    children: [
      { id: 'purchaseorders', label: 'Purchase Orders', path: '/purchases/orders', title: 'Purchases / Purchase Orders' },
      { id: 'purchaserequisitions', label: 'Purchase Requisitions', path: '/purchases/requisitions', title: 'Purchases / Purchase Requisitions' },
    ],
  },
  // {
  //   id: 'constructionmaterial',
  //   label: 'Construction Material',
  //   path: '/construction-material',
  //   title: 'Construction Material',
  //   children: [
  //     { id: 'constructionmaterial-stock', label: 'Stock Register', path: '/construction-material/stock-register', title: 'Construction Material / Stock Register' },
  //     { id: 'constructionmaterial-inward', label: 'Inward', path: '/construction-material/inward', title: 'Construction Material / Inward' },
  //     { id: 'constructionmaterial-outward', label: 'Outward', path: '/construction-material/outward', title: 'Construction Material / Outward' },
  //     { id: 'constructionmaterial-issue', label: 'Issue Request', path: '/construction-material/issue-request', title: 'Construction Material / Issue Request' },
  //   ],
  // },
  // { id: 'siteprogress', label: 'Site Progress', path: '/site-progress', title: 'Site Progress' },
  // { id: 'marketing', label: 'Marketing', path: '/marketing', title: 'Marketing' },
  {
    id: 'hr',
    label: 'HR',
    path: '/hr',
    title: 'HR Management',
    children: [
      { id: 'hremployees', label: 'Employees', path: '/hr/employees', title: 'HR / Employees' },
      // { id: 'hrattendance', label: 'Attendance', path: '/hr/attendance', title: 'HR / Attendance' },
      // { id: 'hrpayroll', label: 'Payroll', path: '/hr/payroll', title: 'HR / Payroll' },
      // { id: 'hrleaverequests', label: 'Leave Requests', path: '/hr/leave-requests', title: 'HR / Leave Requests' },
    ],
  },
  {
    id: 'sales',
    label: 'Sales',
    path: '/sales',
    title: 'Sales',
    children: [
      { id: 'salesleads', label: 'Leads', path: '/sales/leads', title: 'Sales / Leads' },
      { id: 'salesbooking', label: 'Booking', path: '/sales/booking', title: 'Sales / Booking' },
    ],
  },
  // { id: 'selffinance', label: 'Self Finance', path: '/self-finance', title: 'Self Finance' },
  {
    id: 'account',
    label: 'Account',
    path: '/account',
    title: 'Account',
    children: [
      // { id: 'accountoverview', label: 'Overview', path: '/account/overview', title: 'Account / Overview' },
      // { id: 'accountexpenseledger', label: 'Expense Ledger', path: '/account/expense-ledger', title: 'Account / Expense Ledger' },
      { id: 'accountincomeledger', label: 'Income Ledger', path: '/account/income-ledger', title: 'Account / Income Ledger' },
      { id: 'investors', label: 'Investors', path: '/account/investors', title: 'Account / Investors' },
      { id: 'capitalinvestment', label: 'Capital Investment', path: '/account/capital-investment', title: 'Account / Capital Investment' },
      // { id: 'accountprofitloss', label: 'P&L Report', path: '/account/profit-loss', title: 'Account / P&L Report' },
    ],
  },
  // { id: 'filemanager', label: 'File Manager', path: '/file-manager', title: 'File Manager' },
  // { id: 'managetools', label: 'Manage Tools', path: '/manage-tools', title: 'Manage Tools' },
  // { id: 'reports', label: 'Reports', path: '/reports', title: 'Reports' },
];

export function flattenNavItems(items = NAV_ITEMS) {
  return items.flatMap((item) => [item, ...(item.children ? flattenNavItems(item.children) : [])]);
}

export function getPageTitle(pathname) {
  if (/^\/master\/projects\/[^/]+$/.test(pathname)) {
    return 'Project Details';
  }

  if (pathname === '/construction-material') {
    return 'Construction Material';
  }

  if (/^\/construction-material\/(stock-register|inward|outward|issue-request)$/.test(pathname)) {
    return flattenNavItems().find(({ path }) => path === pathname)?.title || 'Construction Material';
  }

  if (pathname === '/purchases/create') {
    return 'Purchases / Create Purchase Order';
  }

  if (pathname === '/purchases/requisitions/create') {
    return 'Purchases / Create Purchase Requisition';
  }

  if (/^\/purchases\/[^/]+\/edit$/.test(pathname)) {
    return 'Purchases / Edit Purchase Order';
  }

  if (/^\/purchases\/orders\/[^/]+\/grn$/.test(pathname)) {
    return 'Purchases / Create Goods Receipt Note';
  }

  if (pathname === '/purchases/grn') {
    return 'Purchases / Goods Receipt Notes (GRN)';
  }

  if (pathname === '/sales/booking/create') {
    return 'Sales / Create Booking';
  }

  if (/^\/sales\/booking\/[^/]+\/edit$/.test(pathname)) {
    return 'Sales / Edit Booking';
  }

  if (/^\/sales\/booking\/[^/]+\/payment-stages$/.test(pathname)) {
    return 'Sales / Payment Stages';
  }

  if (/^\/master\/projects\/[^/]+\/units$/.test(pathname)) {
    return 'Project Units';
  }

  if (/^\/master\/projects\/[^/]+\/towers$/.test(pathname)) {
    return 'Project Towers';
  }

  if (/^\/master\/projects\/[^/]+\/amenities$/.test(pathname)) {
    return 'Project Amenities';
  }

  if (/^\/master\/projects\/[^/]+\/documents$/.test(pathname)) {
    return 'Project Documents';
  }

  const item = flattenNavItems().find(({ path }) => path === pathname);
  return item?.title || 'Dashboard';
}
