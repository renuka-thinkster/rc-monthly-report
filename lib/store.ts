// RC MIS Data Store — Updated 2026-05-19

// ══════════════════════════
// CORE DATA & HELPERS
// ══════════════════════════
const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MN_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const f = (v: number) => Number(v).toLocaleString('en-IN');
const fr = (v: number) => '₹' + f(v);
const MD_YEARLY = {};
const DEV_THRESHOLD = 10;
const DAY_COLORS = {};
// ══════════════════════════
// GLOBAL PERIOD
// ══════════════════════════
function getGPeriod() {
  const yearEl =
  document.getElementById('gYear') as HTMLSelectElement | null;

const monthEl =
  document.getElementById('gMonth') as HTMLSelectElement | null;

const y =
  yearEl
    ? parseInt(yearEl.value)
    : new Date().getFullYear();

const m =
  monthEl
    ? parseInt(monthEl.value)
    : new Date().getMonth() + 1;
  const daysInMonth = new Date(y, m, 0).getDate();
  return {
    y,
    m,
    key: `${y}-${String(m).padStart(2, '0')}`,
    label: `${MN[m - 1]} ${y}`,
    short: `${MN_SHORT[m - 1]} ${y}`,
    days: daysInMonth,
  };
}

function onGlobalChange() {
  const p = getGPeriod();
  const gPeriodLabel = document.getElementById('gPeriodLabel');
  if (gPeriodLabel) {
    gPeriodLabel.textContent = p.label;
  }
  const activeId = (document.querySelector('.pg.active') || { id: 'pg-dashboard' }).id.replace('pg-', '');
  refreshPage(activeId);
}

function prevPeriod() {
  const ySel =
  document.getElementById('gYear') as HTMLSelectElement | null;

const mSel =
  document.getElementById('gMonth') as HTMLSelectElement | null;

if (ySel && mSel) {

  let m =
    parseInt(mSel.value) - 1;

  let y =
    parseInt(ySel.value);
    if (m < 1) {
      m = 12;
      y--;
    }
    mSel.value = String(m);
    ySel.value = String(y);
    onGlobalChange();
  }
}

function nextPeriod() {

  const ySel =
    document.getElementById('gYear') as HTMLSelectElement | null;

  const mSel =
    document.getElementById('gMonth') as HTMLSelectElement | null;

  if (ySel && mSel) {

    let m =
      parseInt(mSel.value) + 1;

    let y =
      parseInt(ySel.value);

    if (m > 12) {

      m = 1;
      y++;
    }

    mSel.value = String(m);

    ySel.value = String(y);

    onGlobalChange();
  }
}

function refreshPage(id: string) {
  const map: { [key: string]: () => void } = {
    dashboard: () => setTimeout(() => {}, 100), // Placeholder for buildCharts function
    sales: () => {}, // Placeholder for buildSalesReport function
    inventory: () => {}, // Placeholder for buildInventory function
    purchase: () => {}, // Placeholder for buildPurchase function
    foodcost: () => {}, // Placeholder for buildFoodCost function
    target: () => {}, // Placeholder for renderTarget function
    dailysales: () => {}, // Placeholder for rebuildDaily function
    consumption: () => {}, // Placeholder for renderConsumption function
    incentive: () => {}, // Placeholder for renderIncentive function
    monthly: () => {}, // Placeholder for renderMonthlyInput function
    yearly: () => {}, // Placeholder for buildYearlySummary function
    authorize: () => {},
  };
  if (map[id]) {
    map[id]();
  }
}

function showTab(id: string, el?: HTMLElement) {
  document.querySelectorAll('.pg').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach((t) => t.classList.remove('active'));
  const tab = document.getElementById(`pg-${id}`);
  if (tab) {
    tab.classList.add('active');
  }
  if (el) {
    el.classList.add('active');
  }
  setTimeout(() => refreshPage(id), 80);
}

function flash(msg: string, bg = '#dcfce7', color = '#166534') {
  const d = document.createElement('div');
  d.textContent = msg;
  d.style.cssText = `position:fixed;top:70px;right:24px;background:${bg};color:${color};padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.15)`;
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 2500);
}

// ══════════════════════════
// PER-PERIOD DATA STORE
// All data keyed by "YYYY-MM"
// ══════════════════════════
const STORE: { [key: string]: any } = {
  // Daily sales: key -> array of rows
  daily: {
    '2026-05': [
      ['01/05/2026','Fri', 65420,9876,13009, 3150,1330, 7820,0,    0,0,   16651,1215, 0,0],
      ['02/05/2026','Sat', 66294,8452,9684,  4592,1144, 5581,0,    0,0,   9769,1461,  0,0],
      ['03/05/2026','Sun', 107636,11569,8631,3614,1450, 9236,700,  0,0,   15888,1066, 0,0],
      ['04/05/2026','Mon', 39175,9506,9351,  2953,390,  8350,0,    13434,0,5758,883,  0,0],
      ['05/05/2026','Tue', 59955,9687,17987, 3350,1020, 2484,0,    19738,0,6847,847,  0,0],
      ['06/05/2026','Wed', 68999,3740,10372, 1670,780,  0,0,       18459,0,7816,752,  0,0],
      ['07/05/2026','Thu', 52521,3262,11642, 4732,730,  6262,0,    17402,0,9226,1394, 0,0],
      ['08/05/2026','Fri', 65992,6673,6315,  2805,450,  11546,0,   20332,0,15106,885, 0,0],
      ['09/05/2026','Sat', 88696,6026,9309,  4584,990,  4738,0,    0,0,   13008,2609, 0,0],
      ['10/05/2026','Sun', 88979,8287,16434, 4784,780,  0,0,       0,0,   15779,1931, 0,0],
      ['11/05/2026','Mon', 38972,2932,12968, 4099,820,  0,0,       17515,0,10012,4014,0,0],
      ['12/05/2026','Tue', 53325,3113,10489, 3115,1150, 7354,0,    9321,0, 7561,2071, 0,0],
      ['13/05/2026','Wed', 54217,6574,13812, 2250,380,  0,0,       12114,0,5354,2049, 0,0],
      ['14/05/2026','Thu', 61788,4110,757,   3135,960,  6597,466,  9644,0, 12465,230, 0,0],
      ['15/05/2026','Fri', 57274,6804,9717,  2205,1029, 4528,0,    10223,0,11262,495, 0,0],
      ['16/05/2026','Sat', 76318,9610,6277,  2774,770,  6816,265,  0,0,   11706,1240, 0,0],
      ['17/05/2026','Sun', 85795,12573,14887,3225,550,  2961,0,    0,0,   12909,3139, 0,0],
      ['18/05/2026','Mon', 0,0,0,0,0,0,0,0,0,0,0,0,0],
      ['19/05/2026','Tue', 0,0,0,0,0,0,0,0,0,0,0,0,0],
    ]
  },
  // Purchase: key -> value
  purchase: {
    '2026-01': 939559, '2026-02': 1004521, '2026-03': 1085751, '2026-04': 1193185,
    '2026-05': 0, '2026-06': 0, '2026-07': 0, '2026-08': 0, '2026-09': 0, '2026-10': 0, '2026-11': 0, '2026-12': 0
  },
  // Inventory: key -> {sites: [[start,close],...]}
  inv: {
    '2026-01': [[178548, 139856], [2110, 6845], [1750, 2675], [5985, 6132], [32154, 18546]],
    '2026-02': [[139856, 189546], [6845, 5914], [2675, 2548], [6132, 5982], [18546, 26854]],
    '2026-03': [[189546, 128596], [5914, 6475], [2548, 3658], [5982, 4958], [26854, 21352]],
    '2026-04': [[128596, 182654], [6475, 7565], [3658, 5987], [4958, 532], [21352, 29876]],
    '2026-05': [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  },
  // Sales monthly: key -> {sub, locked, stores[[dc,hc,da,ha,cs,foc],...]}
  sales: {
    // stores order: RC Express, Food Truck, Café, TCS, Events
    // store row: [dining_cnt, hd_cnt, dining_amt, hd_amt, credit_sales, foc]
    '2026-01': { sub: 2766097, locked: true, stores: [[41, 0, 75656, 0, 0, 0], [607, 0, 131977, 0, 0, 0], [2249, 494, 1897836, 298506, 0, 0], [0, 0, 362122, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-02': { sub: 2598935, locked: true, stores: [[0, 0, 88951, 0, 0, 0], [870, 0, 180784, 0, 0, 0], [1955, 551, 1676205, 295219, 0, 0], [0, 0, 357776, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-03': { sub: 3111071, locked: true, stores: [[0, 0, 97162, 0, 0, 0], [891, 0, 157063, 0, 0, 0], [2209, 634, 2099602, 367248, 0, 0], [0, 0, 387258, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-04': { sub: 3107303, locked: true, stores: [[0, 0, 102540, 0, 0, 0], [945, 0, 215320, 0, 0, 0], [2389, 612, 2198740, 324180, 0, 0], [0, 0, 266523, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-05': { sub: 3603406, locked: false, stores: [[0, 0, 480000, 0, 0, 0], [0, 0, 690000, 0, 0, 0], [0, 0, 1620000, 0, 0, 0], [0, 0, 680000, 0, 0, 0], [0, 0, 133406, 0, 0, 0]] },
    '2026-06': { sub: 0, locked: false, stores: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-07': { sub: 0, locked: false, stores: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-08': { sub: 0, locked: false, stores: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-09': { sub: 0, locked: false, stores: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-10': { sub: 0, locked: false, stores: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
    '2026-11': { sub: 0, locked: false, stores: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0,0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
'2026-12': { sub: 0, locked: false, stores: [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]] },
},
// Manual monthly: key -> [staffFood, dump, maintenance, otherIncome]
manual: {
'2026-01': [65199, 2871, 109960, 0], '2026-02': [65199, 3175, 114754, 0],
'2026-03': [65199, 4185, 103254, 0], '2026-04': [65199, 5134, 247542, 0],
'2026-05': [0, 0, 0, 0]
},
// Consumption: key -> [{name,unit,cafe,truck,express,tcs,opening,purchase,wastage,staffFood,closing}]
cons: {
'2026-05': [
{ name: 'Paneer', unit: 'kg', cafe: 182, truck: 18, express: 15, tcs: 92, opening: 2, purchase: 312, wastage: 0, staffFood: 0, closing: 4 },
{ name: 'Chicken', unit: 'kg', cafe: 392, truck: 72, express: 0, tcs: 124, opening: 14, purchase: 628, wastage: 7.5, staffFood: 30, closing: 9 },
{ name: 'Ice Cream', unit: 'kg', cafe: 164, truck: 16, express: 0, tcs: 42, opening: 6, purchase: 226, wastage: 0, staffFood: 0, closing: 8 },
]
},
// Purchase locked state: key -> bool
purLocked: {
'2026-01': true, '2026-02': true, '2026-03': true, '2026-04': true, '2026-05': false
},
// Inventory locked: key -> bool
invLocked: {
'2026-01': true, '2026-02': true, '2026-03': true, '2026-04': true, '2026-05': false
},
// Sales locked: key -> bool
salesLocked: {
'2026-01': true, '2026-02': true, '2026-03': true, '2026-04': true, '2026-05': false
},
// Target data: key -> [{t,w},...]  (5 sites)
target: {
'2026-01': [{ t: 800000, w: 30 }, { t: 700000, w: 30 }, { t: 1200000, w: 30 }, { t: 500000, w: 30 }, { t: 0, w: 30 }],
'2026-02': [{ t: 850000, w: 28 }, { t: 720000, w: 28 }, { t: 1250000, w: 28 }, { t: 520000, w: 28 }, { t: 0, w: 28 }],
'2026-03': [{ t: 900000, w: 31 }, { t: 750000, w: 31 }, { t: 1300000, w: 31 }, { t: 550000, w: 31 }, { t: 0, w: 31 }],
'2026-04': [{ t: 950000, w: 30 }, { t: 780000, w: 30 }, { t: 1350000, w: 30 }, { t: 580000, w: 30 }, { t: 0, w: 30 }],
'2026-05': [{ t: 1000000, w: 31 }, { t: 800000, w: 31 }, { t: 1400000, w: 31 }, { t: 600000, w: 31 }, { t: 0, w: 31 }],
},
// Incentive employees: key -> [...]
incentive: {
'2026-05': [{ name: 'Yasin Shek', code: '9702483928', section: 'Kitchen', pct: 18, leave: 0, absent: false, fixInc: '', mgrOverride: '', actualInc: '5400' }]
}
};
// Get or init period data
function getPD(section: string, key: string, defaultVal: any) {
if (!STORE[section]) {
STORE[section] = {};
}
if (STORE[section][key] === undefined) {
STORE[section][key] = typeof defaultVal === 'function' ? defaultVal() : JSON.parse(JSON.stringify(defaultVal));
}
return STORE[section][key];
}
// ══════════════════════════
// DAILY SALES
// ══════════════════════════
export {
  STORE,
  MD_YEARLY,
  DEV_THRESHOLD,
  DAY_COLORS,
  MN,
  MN_SHORT,
  getPD,
  f,
  fr,
  flash,
  getGPeriod
};