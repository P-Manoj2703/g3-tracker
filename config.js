const CONFIG = {

  project: {
    name: 'G3 Builders',
    tagline: 'Site Management System',
    budget: 5000000,
    startDate: '2025-04-01',
    currency: 'INR',
    alertThreshold: 0.80,
  },

  sheetURL: 'https://script.google.com/macros/s/AKfycbzMP63sqJ4xMPt0GyNm6b3-m__J0ZVFD0__bjXw0h7Fvw4d6V-xRsXLT50R1ceyi53HYg/exec',
  ownerPhone: '91XXXXXXXXXX',

  categories: [
    { id: 'materials',   name: 'Materials',      emoji: '🧱', type: 'expense', roles: 'all' },
    { id: 'labour',      name: 'Labour',          emoji: '👷', type: 'expense', roles: 'all' },
    { id: 'equipment',   name: 'Equipment',       emoji: '🔧', type: 'expense', roles: 'all' },
    { id: 'transport',   name: 'Transport',       emoji: '🚛', type: 'expense', roles: 'all' },
    { id: 'permits',     name: 'Permits & Fees',  emoji: '📋', type: 'expense', roles: 'all' },
    { id: 'utilities',   name: 'Utilities',       emoji: '💡', type: 'expense', roles: 'all' },
    { id: 'land',        name: 'Land Cost',       emoji: '🏕️', type: 'expense', roles: 'owner' },
    { id: 'capital',     name: 'Capital Infusion',emoji: '💰', type: 'income',  roles: 'owner' },
    { id: 'misc',        name: 'Miscellaneous',   emoji: '📦', type: 'expense', roles: 'all' },
  ],

  paymodes: ['Cash', 'UPI', 'IMPS', 'NEFT', 'Cheque'],

  vendors: [
    { id: 'v1', name: 'Sri Sai Cement Works',    type: 'Materials' },
    { id: 'v2', name: 'Krishna Steel Traders',   type: 'Materials' },
    { id: 'v3', name: 'Raju Labour Contractor',  type: 'Labour' },
    { id: 'v4', name: 'Venkat Equipment Hire',   type: 'Equipment' },
    { id: 'v5', name: 'Balaji Transport Co.',    type: 'Transport' },
    { id: 'v6', name: 'Suresh Electrical Works', type: 'Utilities' },
    { id: 'v7', name: 'Ganesh Plumbing Works',   type: 'Materials' },
    { id: 'v8', name: 'Laxmi Hardware Store',    type: 'Materials' },
  ],

  blocks: ['A', 'B', 'C'],
  floors: [1, 2, 3, 4],
  unitsPerFloor: 3,

  flats: (function() {
    const list = [];
    const blocks = ['A', 'B', 'C'];
    const floors = [1, 2, 3, 4];
    const units = [1, 2, 3];
    blocks.forEach(b => {
      floors.forEach(f => {
        units.forEach(u => {
          const id = b + f + '0' + u;
          list.push({ id, name: id, block: b, floor: f, status: 'available' });
        });
      });
    });
    return list;
  })(),

  flatStatuses: ['available', 'booked', 'registered', 'sold'],

  roles: ['owner', 'supervisor', 'investor'],

  largeAmountAlert: 25000,

  colors: {
    accent:   '#f0a500',
    accent2:  '#e05c2a',
    success:  '#22c55e',
    danger:   '#ef4444',
    warning:  '#f59e0b',
    info:     '#818cf8',
  },

  chartColors: ['#f0a500','#e05c2a','#22c55e','#818cf8','#06b6d4','#f43f5e','#a78bfa','#34d399'],

  fmt(n) {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  },

  fmtDate(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  },

  fmtShort(d) {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  },
};
