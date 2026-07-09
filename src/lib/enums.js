/**
 * Centralized enum constants matching the PostgreSQL ENUM types.
 * Keep these in sync with the database schema.
 *
 * Usage:
 *   import { USER_ROLE, UNIT_STATUS, LEAD_STATUS, ... } from '../lib/enums';
 */

// CREATE TYPE user_role AS ENUM (...)
export const USER_ROLE = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES: 'sales',
  ACCOUNTS: 'accounts',
  SITE_ENGINEER: 'site_engineer',
  CONTRACTOR: 'contractor',
  VIEWER: 'viewer',
};

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLE.SUPER_ADMIN,   label: 'Super Admin' },
  { value: USER_ROLE.ADMIN,         label: 'Admin' },
  { value: USER_ROLE.MANAGER,       label: 'Manager' },
  { value: USER_ROLE.SALES,         label: 'Sales' },
  { value: USER_ROLE.ACCOUNTS,      label: 'Accounts' },
  { value: USER_ROLE.SITE_ENGINEER, label: 'Site Engineer' },
  { value: USER_ROLE.CONTRACTOR,    label: 'Contractor' },
  { value: USER_ROLE.VIEWER,        label: 'Viewer' },
];

// CREATE TYPE unit_status AS ENUM (...)
export const UNIT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  SOLD: 'sold',
  ON_HOLD: 'on_hold',
  BLOCKED: 'blocked',
};

export const UNIT_STATUS_OPTIONS = [
  { value: UNIT_STATUS.AVAILABLE, label: 'Available' },
  { value: UNIT_STATUS.BOOKED,    label: 'Booked' },
  { value: UNIT_STATUS.SOLD,      label: 'Sold' },
  { value: UNIT_STATUS.ON_HOLD,   label: 'On Hold' },
  { value: UNIT_STATUS.BLOCKED,   label: 'Blocked' },
];

// CREATE TYPE lead_status AS ENUM (...)
export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  FOLLOW_UP: 'follow_up',
  SITE_VISIT: 'site_visit',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
  RE_MARKETING: 're_marketing',
};

export const LEAD_STATUS_OPTIONS = [
  { value: '',                         label: 'All' },
  { value: LEAD_STATUS.NEW,            label: 'New' },
  { value: LEAD_STATUS.CONTACTED,      label: 'Contacted' },
  { value: LEAD_STATUS.FOLLOW_UP,      label: 'Follow-Up' },
  { value: LEAD_STATUS.SITE_VISIT,     label: 'Site Visit' },
  { value: LEAD_STATUS.NEGOTIATION,    label: 'Negotiation' },
  { value: LEAD_STATUS.WON,            label: 'Won' },
  { value: LEAD_STATUS.LOST,           label: 'Lost' },
  { value: LEAD_STATUS.RE_MARKETING,   label: 'Re-Marketing' },
];

// CREATE TYPE lead_source AS ENUM (...)
export const LEAD_SOURCE = {
  FACEBOOK:      'facebook',
  INSTAGRAM:     'instagram',
  ACRES_99:      '99acres',
  MAKAAN:        'makaan',
  HOUSING_COM:   'housing_com',
  MAGIC_BRICKS:  'magic_bricks',
  WALK_IN:       'walk_in',
  REFERRAL:      'referral',
  WEBSITE:       'website',
  OTHER:         'other',
};

export const LEAD_SOURCE_OPTIONS = [
  { value: LEAD_SOURCE.FACEBOOK,     label: 'Facebook' },
  { value: LEAD_SOURCE.INSTAGRAM,    label: 'Instagram' },
  { value: LEAD_SOURCE.ACRES_99,     label: '99acres' },
  { value: LEAD_SOURCE.MAKAAN,       label: 'Makaan' },
  { value: LEAD_SOURCE.HOUSING_COM,  label: 'Housing.com' },
  { value: LEAD_SOURCE.MAGIC_BRICKS, label: 'Magic Bricks' },
  { value: LEAD_SOURCE.WALK_IN,      label: 'Walk-In' },
  { value: LEAD_SOURCE.REFERRAL,     label: 'Referral' },
  { value: LEAD_SOURCE.WEBSITE,      label: 'Website' },
  { value: LEAD_SOURCE.OTHER,        label: 'Other' },
];

// CREATE TYPE payment_status AS ENUM (...)
export const PAYMENT_STATUS = {
  PENDING:   'pending',
  PARTIAL:   'partial',
  PAID:      'paid',
  OVERDUE:   'overdue',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUS_OPTIONS = [
  { value: PAYMENT_STATUS.PENDING,   label: 'Pending' },
  { value: PAYMENT_STATUS.PARTIAL,   label: 'Partial' },
  { value: PAYMENT_STATUS.PAID,      label: 'Paid' },
  { value: PAYMENT_STATUS.OVERDUE,   label: 'Overdue' },
  { value: PAYMENT_STATUS.CANCELLED, label: 'Cancelled' },
];

// CREATE TYPE construction_status AS ENUM (...)
export const CONSTRUCTION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  ON_HOLD:     'on_hold',
  COMPLETED:   'completed',
  DELAYED:     'delayed',
};

export const CONSTRUCTION_STATUS_OPTIONS = [
  { value: CONSTRUCTION_STATUS.NOT_STARTED, label: 'Not Started' },
  { value: CONSTRUCTION_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: CONSTRUCTION_STATUS.ON_HOLD,     label: 'On Hold' },
  { value: CONSTRUCTION_STATUS.COMPLETED,   label: 'Completed' },
  { value: CONSTRUCTION_STATUS.DELAYED,     label: 'Delayed' },
];

// CREATE TYPE task_status AS ENUM (...)
export const TASK_STATUS = {
  PENDING:     'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  OVERDUE:     'overdue',
  CANCELLED:   'cancelled',
};

export const TASK_STATUS_OPTIONS = [
  { value: TASK_STATUS.PENDING,     label: 'Pending' },
  { value: TASK_STATUS.IN_PROGRESS, label: 'In Progress' },
  { value: TASK_STATUS.COMPLETED,   label: 'Completed' },
  { value: TASK_STATUS.OVERDUE,     label: 'Overdue' },
  { value: TASK_STATUS.CANCELLED,   label: 'Cancelled' },
];

// CREATE TYPE transaction_type AS ENUM (...)
export const TRANSACTION_TYPE = {
  INCOME:   'income',
  EXPENSE:  'expense',
  TRANSFER: 'transfer',
};

export const TRANSACTION_TYPE_OPTIONS = [
  { value: TRANSACTION_TYPE.INCOME,   label: 'Income' },
  { value: TRANSACTION_TYPE.EXPENSE,  label: 'Expense' },
  { value: TRANSACTION_TYPE.TRANSFER, label: 'Transfer' },
];

// CREATE TYPE document_type AS ENUM (...)
export const DOCUMENT_TYPE = {
  AGREEMENT: 'agreement',
  RECEIPT:   'receipt',
  NOC:       'noc',
  REGISTRY:  'registry',
  PLAN:      'plan',
  PHOTO:     'photo',
  OTHER:     'other',
};

export const DOCUMENT_TYPE_OPTIONS = [
  { value: DOCUMENT_TYPE.AGREEMENT, label: 'Agreement' },
  { value: DOCUMENT_TYPE.RECEIPT,   label: 'Receipt' },
  { value: DOCUMENT_TYPE.NOC,       label: 'NOC' },
  { value: DOCUMENT_TYPE.REGISTRY,  label: 'Registry' },
  { value: DOCUMENT_TYPE.PLAN,      label: 'Plan' },
  { value: DOCUMENT_TYPE.PHOTO,     label: 'Photo' },
  { value: DOCUMENT_TYPE.OTHER,     label: 'Other' },
];

// CREATE TYPE project_type AS ENUM (...)
export const PROJECT_TYPE = {
  RESIDENTIAL: 'residential',
  COMMERCIAL:  'commercial',
  MIXED:       'mixed',
  PLOTTED:     'plotted',
};

export const PROJECT_TYPE_OPTIONS = [
  { value: PROJECT_TYPE.RESIDENTIAL, label: 'Residential' },
  { value: PROJECT_TYPE.COMMERCIAL,  label: 'Commercial' },
  { value: PROJECT_TYPE.MIXED,       label: 'Mixed' },
  { value: PROJECT_TYPE.PLOTTED,     label: 'Plotted' },
];

// CREATE TYPE unit_type AS ENUM (...)
export const UNIT_TYPE = {
  APARTMENT: 'apartment',
  VILLA:     'villa',
  PLOT:      'plot',
  SHOP:      'shop',
  OFFICE:    'office',
};

export const UNIT_TYPE_OPTIONS = [
  { value: UNIT_TYPE.APARTMENT, label: 'Apartment' },
  { value: UNIT_TYPE.VILLA,     label: 'Villa' },
  { value: UNIT_TYPE.PLOT,      label: 'Plot' },
  { value: UNIT_TYPE.SHOP,      label: 'Shop' },
  { value: UNIT_TYPE.OFFICE,    label: 'Office' },
];

// CREATE TYPE purchase_status AS ENUM (...)
export const PURCHASE_STATUS = {
  DRAFT:            'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED:         'approved',
  REJECTED:         'rejected',
  ORDERED:          'ordered',
  RECEIVED:         'received',
  INVOICED:         'invoiced',
};

export const PURCHASE_STATUS_OPTIONS = [
  { value: PURCHASE_STATUS.DRAFT,            label: 'Draft' },
  { value: PURCHASE_STATUS.PENDING_APPROVAL, label: 'Pending Approval' },
  { value: PURCHASE_STATUS.APPROVED,         label: 'Approved' },
  { value: PURCHASE_STATUS.REJECTED,         label: 'Rejected' },
  { value: PURCHASE_STATUS.ORDERED,          label: 'Ordered' },
  { value: PURCHASE_STATUS.RECEIVED,         label: 'Received' },
  { value: PURCHASE_STATUS.INVOICED,         label: 'Invoiced' },
];

// CREATE TYPE grn_status AS ENUM (...)
export const GRN_STATUS = {
  PENDING:  'pending',
  PARTIAL:  'partial',
  COMPLETE: 'complete',
};

export const GRN_STATUS_OPTIONS = [
  { value: GRN_STATUS.PENDING,  label: 'Pending' },
  { value: GRN_STATUS.PARTIAL,  label: 'Partial' },
  { value: GRN_STATUS.COMPLETE, label: 'Complete' },
];

// CREATE TYPE follow_up_mode AS ENUM (...)
export const FOLLOW_UP_MODE = {
  CALL:       'call',
  EMAIL:      'email',
  MEETING:    'meeting',
  MESSAGE:    'message',
  SITE_VISIT: 'site_visit',
};

export const FOLLOW_UP_MODE_OPTIONS = [
  { value: FOLLOW_UP_MODE.CALL,       label: 'Call' },
  { value: FOLLOW_UP_MODE.EMAIL,      label: 'Email' },
  { value: FOLLOW_UP_MODE.MEETING,    label: 'Meeting' },
  { value: FOLLOW_UP_MODE.MESSAGE,    label: 'Message' },
  { value: FOLLOW_UP_MODE.SITE_VISIT, label: 'Site Visit' },
];
