import { LEAD_SOURCE, LEAD_SOURCE_OPTIONS } from '../../lib/enums';

/**
 * @deprecated Use LEAD_SOURCE_OPTIONS from lib/enums instead.
 * Kept for any legacy references in this file.
 */
export const SOURCES = LEAD_SOURCE_OPTIONS.map((opt) => opt.label);

export const initLeads = [
  { id: 1, name: 'Ankit Sharma', mobile: '9755408189', email: 'ankit@gmail.com', source: LEAD_SOURCE.FACEBOOK, project: 'Kasturi Courtyard', agent: 'Pushpraj', status: 'Follow-Up', date: '22 Nov 2025', budget: '₹35L–₹45L', score: 85 },
  { id: 2, name: 'Ram Patel', mobile: '8085134821', email: 'ram.p@yahoo.com', source: LEAD_SOURCE.ACRES_99, project: 'Kasturi Courtyard', agent: 'Aman', status: 'Negotiation', date: '20 Nov 2025', budget: '₹50L–₹60L', score: 92 },
  { id: 3, name: 'Keshav Singh', mobile: '8103950632', email: 'keshav@hotmail.com', source: LEAD_SOURCE.MAGIC_BRICKS, project: 'Green Valley Phase 2', agent: 'Pushpraj', status: 'New', date: '19 Nov 2025', budget: '₹25L–₹30L', score: 60 },
  { id: 4, name: 'Brijesh Gurjar', mobile: '7898711782', email: 'brijesh@gmail.com', source: LEAD_SOURCE.WALK_IN, project: 'Sunrise Heights', agent: 'Aman', status: 'Booked', date: '18 Nov 2025', budget: '₹70L–₹80L', score: 98 },
  { id: 5, name: 'Adarsh Kumar', mobile: '9993157262', email: 'adarsh@gmail.com', source: LEAD_SOURCE.HOUSING_COM, project: 'Royal Palms', agent: 'Kumar', status: 'Lost', date: '15 Nov 2025', budget: '₹40L–₹50L', score: 30 },
  { id: 6, name: 'Prashant Mishra', mobile: '7354982165', email: 'prashant@gmail.com', source: LEAD_SOURCE.INSTAGRAM, project: 'City Square', agent: 'Pushpraj', status: 'Follow-Up', date: '14 Nov 2025', budget: '₹20L–₹25L', score: 70 },
  { id: 7, name: 'Deepak Verma', mobile: '9876543210', email: 'deepak@gmail.com', source: LEAD_SOURCE.REFERRAL, project: 'Kasturi Courtyard', agent: 'Ravi', status: 'New', date: '13 Nov 2025', budget: '₹55L–₹65L', score: 75 },
  { id: 8, name: 'Neha Joshi', mobile: '9012345678', email: 'neha.j@gmail.com', source: LEAD_SOURCE.MAKAAN, project: 'Green Valley Phase 2', agent: 'Sneha', status: 'Negotiation', date: '12 Nov 2025', budget: '₹30L–₹35L', score: 88 },
];

export const statusColors = { 'Follow-Up': 'blue', Negotiation: 'orange', New: 'grey', Booked: 'green', Lost: 'red' };

export const scoreColorClass = {
  '#16a34a': 'bg-emerald-600 text-emerald-600',
  '#ea580c': 'bg-orange-600 text-orange-600',
  '#cc0000': 'bg-[blueviolet] text-red-700',
};

export const statusTileClass = {
  All: { base: 'border-blue-600', active: 'bg-blue-600', muted: 'text-blue-600' },
  New: { base: 'border-neutral-300', active: 'bg-neutral-500', muted: 'text-neutral-500' },
  'Follow-Up': { base: 'border-blue-600', active: 'bg-blue-600', muted: 'text-blue-600' },
  Negotiation: { base: 'border-orange-600', active: 'bg-orange-600', muted: 'text-orange-600' },
  Booked: { base: 'border-emerald-600', active: 'bg-emerald-600', muted: 'text-emerald-600' },
  Lost: { base: 'border-red-700', active: 'bg-[blueviolet]', muted: 'text-red-700' },
};

export function getInitialLeadForm(projects = []) {
  return {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    alternate_phone: '',
    source: LEAD_SOURCE.WALK_IN,
    source_campaign: '',
    project_id: projects[0]?.id || '',
    interested_unit_type: 'apartment',
    interested_bhk: '',
    budget_min: '',
    budget_max: '',
    address: '',
    city: '',
    state: '',
    assigned_to: '',
    notes: '',
    next_follow_up: '',
  };
}

