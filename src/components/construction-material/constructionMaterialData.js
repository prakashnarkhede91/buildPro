export const initialMaterials = [
  { id: 1, name: 'Cement (OPC 53)', unit: 'Bags', stock: 320, min: 200, used: 680, project: 'Kasturi Courtyard', lastEntry: '22 Nov 2025' },
  { id: 2, name: 'TMT Steel 12mm', unit: 'Ton', stock: 8.5, min: 5, used: 21.5, project: 'Kasturi Courtyard', lastEntry: '21 Nov 2025' },
  { id: 3, name: 'Bricks (Standard)', unit: 'Nos', stock: 8200, min: 5000, used: 21800, project: 'Green Valley Phase 2', lastEntry: '20 Nov 2025' },
  { id: 4, name: 'River Sand', unit: 'Ton', stock: 42, min: 30, used: 108, project: 'Sunrise Heights', lastEntry: '19 Nov 2025' },
  { id: 5, name: 'Aggregate 20mm', unit: 'Ton', stock: 28, min: 20, used: 72, project: 'Kasturi Courtyard', lastEntry: '22 Nov 2025' },
  { id: 6, name: 'Electrical Wire', unit: 'Meter', stock: 1200, min: 500, used: 3800, project: 'Royal Palms', lastEntry: '18 Nov 2025' },
];

export const inwardEntries = [
  { date: '22 Nov 2025', material: 'Cement (OPC 53)', qty: '80 Bags', vendor: 'Mehta Cement', project: 'Kasturi Courtyard', grn: 'GRN-2025-089' },
  { date: '21 Nov 2025', material: 'TMT Steel 12mm', qty: '2 Ton', vendor: 'Steel King', project: 'Green Valley Phase 2', grn: 'GRN-2025-088' },
  { date: '20 Nov 2025', material: 'River Sand', qty: '15 Ton', vendor: 'Sharma Sand', project: 'Sunrise Heights', grn: 'GRN-2025-087' },
];

export const outwardEntries = [
  { date: '22 Nov 2025', material: 'Cement (OPC 53)', qty: '60 Bags', issuedTo: 'Floor 3 Team', purpose: 'RCC Column Work', project: 'Kasturi Courtyard' },
  { date: '21 Nov 2025', material: 'TMT Steel 12mm', qty: '1.5 Ton', issuedTo: 'Contractor A', purpose: 'Foundation Slab', project: 'Sunrise Heights' },
  { date: '20 Nov 2025', material: 'Bricks', qty: '2000 Nos', issuedTo: 'Masonry Team', purpose: '2nd Floor Walls', project: 'Green Valley Phase 2' },
];

export const issueRequests = [
  { req: 'IR-2025-021', material: 'Cement', qty: '100 Bags', requestedBy: 'Ramesh K.', project: 'Kasturi Courtyard', date: '22 Nov 2025', status: 'Approved' },
  { req: 'IR-2025-022', material: 'Sand', qty: '10 Ton', requestedBy: 'Vikram S.', project: 'Green Valley Phase 2', date: '22 Nov 2025', status: 'Pending' },
  { req: 'IR-2025-023', material: 'Bricks', qty: '3000 Nos', requestedBy: 'Anil P.', project: 'Sunrise Heights', date: '21 Nov 2025', status: 'Rejected' },
];
