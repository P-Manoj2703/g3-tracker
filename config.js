const CONFIG = {

  project: {
    name:       'G3 Builders',
    tagline:    'Site Management System',
    budget:     5000000,
    startDate:  '2025-04-01',
    currency:   'INR',
  },

  sheetURL: 'https://script.google.com/macros/s/AKfycbzMP63sqJ4xMPt0GyNm6b3-m__J0ZVFD0__bjXw0h7Fvw4d6V-xRsXLT50R1ceyi53HYg/exec',

  largeAmountAlert: 25000,

  categories: [
    { id: 'materials',  name: 'Materials',       emoji: '🧱' },
    { id: 'labour',     name: 'Labour',           emoji: '👷' },
    { id: 'equipment',  name: 'Equipment',        emoji: '🔧' },
    { id: 'transport',  name: 'Transport',        emoji: '🚛' },
    { id: 'permits',    name: 'Permits & Fees',   emoji: '📋' },
    { id: 'utilities',  name: 'Utilities',        emoji: '💡' },
    { id: 'misc',       name: 'Miscellaneous',    emoji: '📦' },
  ],

  landCategories: [
    'Land Purchase',
    'Registration',
    'Stamp Duty',
    'Legal Fees',
    'Survey Charges',
    'Conversion Fees',
    'Other',
  ],

  paymentModes: ['Cash', 'UPI', 'IMPS', 'NEFT', 'Cheque'],

  roles: ['owner', 'supervisor', 'accountant'],

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

  vendorTypes: ['Materials', 'Labour', 'Equipment', 'Transport', 'Utilities', 'Contractor', 'Other'],

  partners: [
    { id: 'p1', name: 'Partner 1' },
    { id: 'p2', name: 'Partner 2' },
    { id: 'p3', name: 'Partner 3' },
  ],

  flats: (function() {
    const list = [];
    ['A','B','C'].forEach(b => {
      [1,2,3,4].forEach(f => {
        [1,2,3].forEach(u => {
          const id = b + f + '0' + u;
          list.push({ id, name: id, block: b, floor: f });
        });
      });
    });
    return list;
  })(),

  saleStages: [
    'Booking Amount',
    'Token Advance',
    'Agreement Amount',
    'Construction Linked 1',
    'Construction Linked 2',
    'Construction Linked 3',
    'Pre-Registration',
    'Registration Amount',
    'Final Payment',
  ],

  docTypes: [
    'Invoice', 'Receipt', 'Agreement', 'Plan',
    'Permit', 'Legal Doc', 'Photo', 'Other',
  ],

  chartColors: ['#f0a500','#e05c2a','#22c55e','#818cf8','#06b6d4','#f43f5e','#a78bfa','#34d399'],

  fmt(n) {
    return '₹' + Math.round(n || 0).toLocaleString('en-IN');
  },

  fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  },

  fmtShort(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
  },

  genID(prefix) {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yy = String(d.getFullYear()).slice(-2);
    return prefix + '-' + dd + mm + yy + '-' + (Math.floor(Math.random()*900)+100);
  },
};
