// RC MIS Functions — loaded client-side
// Updated: 2026-05-19


// ══════════════════════════
// CORE DATA & HELPERS
// ══════════════════════════
const MN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MN_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const f = v => Number(v).toLocaleString('en-IN');
const fr = v => '₹' + f(v);

// ══════════════════════════
// GLOBAL PERIOD
// ══════════════════════════
function getGPeriod(){
  const y = parseInt(document.getElementById('gYear').value);
  const m = parseInt(document.getElementById('gMonth').value);
  const daysInMonth = new Date(y, m, 0).getDate();
  return {y, m, key:`${y}-${String(m).padStart(2,'0')}`,
          label:`${MN[m-1]} ${y}`, short:`${MN_SHORT[m-1]} ${y}`,
          days: daysInMonth};
}

function onGlobalChange(){
  const p = getGPeriod();
  document.getElementById('gPeriodLabel').textContent = p.label;
  const activeId = (document.querySelector('.pg.active')||{id:'pg-dashboard'}).id.replace('pg-','');
  refreshPage(activeId);
}

function prevPeriod(){
  const ySel=document.getElementById('gYear'), mSel=document.getElementById('gMonth');
  let m=parseInt(mSel.value)-1, y=parseInt(ySel.value);
  if(m<1){m=12;y--;}
  mSel.value=m; ySel.value=y; onGlobalChange();
}
function nextPeriod(){
  const ySel=document.getElementById('gYear'), mSel=document.getElementById('gMonth');
  let m=parseInt(mSel.value)+1, y=parseInt(ySel.value);
  if(m>12){m=1;y++;}
  mSel.value=m; ySel.value=y; onGlobalChange();
}

function refreshPage(id){
  const map = {
    dashboard:()=>setTimeout(buildCharts,100),
    sales: buildSalesReport, inventory: buildInventory,
    purchase: buildPurchase, foodcost: buildFoodCost,
    target: renderTarget, dailysales: rebuildDaily,
    consumption: renderConsumption, incentive: renderIncentive,
    monthly: renderMonthlyInput, yearly: buildYearlySummary,
    authorize:()=>{}
  };
  if(map[id]) map[id]();
}

function showTab(id, el){
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('pg-'+id).classList.add('active');
  if(el) el.classList.add('active');
  setTimeout(()=>refreshPage(id), 80);
}

function flash(msg, bg='#dcfce7', color='#166534'){
  const d=document.createElement('div');
  d.textContent=msg;
  d.style=`position:fixed;top:70px;right:24px;background:${bg};color:${color};padding:10px 18px;border-radius:8px;font-weight:700;font-size:13px;z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,.15)`;
  document.body.appendChild(d); setTimeout(()=>d.remove(),2500);
}

// ══════════════════════════
// PER-PERIOD DATA STORE
// All data keyed by "YYYY-MM"
// ══════════════════════════
const STORE = {
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
    '2026-01':939559,'2026-02':1004521,'2026-03':1085751,'2026-04':1193185,
    '2026-05':0,'2026-06':0,'2026-07':0,'2026-08':0,'2026-09':0,'2026-10':0,'2026-11':0,'2026-12':0
  },
  // Inventory: key -> {sites: [[start,close],...]}
  inv: {
    '2026-01': [[178548,139856],[2110,6845],[1750,2675],[5985,6132],[32154,18546]],
    '2026-02': [[139856,189546],[6845,5914],[2675,2548],[6132,5982],[18546,26854]],
    '2026-03': [[189546,128596],[5914,6475],[2548,3658],[5982,4958],[26854,21352]],
    '2026-04': [[128596,182654],[6475,7565],[3658,5987],[4958,532],[21352,29876]],
    '2026-05': [[0,0],[0,0],[0,0],[0,0],[0,0]],
  },
  // Sales monthly: key -> {sub, locked, stores[[dc,hc,da,ha,cs,foc],...]}
  sales: {
    // stores order: RC Express, Food Truck, Café, TCS, Events
    // store row: [dining_cnt, hd_cnt, dining_amt, hd_amt, credit_sales, foc]
    '2026-01': {sub:2766097, locked:true,  stores:[[41,0,75656,0,0,0],[607,0,131977,0,0,0],[2249,494,1897836,298506,0,0],[0,0,362122,0,0,0],[0,0,0,0,0,0]]},
    '2026-02': {sub:2598935, locked:true,  stores:[[0,0,88951,0,0,0],[870,0,180784,0,0,0],[1955,551,1676205,295219,0,0],[0,0,357776,0,0,0],[0,0,0,0,0,0]]},
    '2026-03': {sub:3111071, locked:true,  stores:[[0,0,97162,0,0,0],[891,0,157063,0,0,0],[2209,634,2099602,367248,0,0],[0,0,387258,0,0,0],[0,0,0,0,0,0]]},
    '2026-04': {sub:3107303, locked:true,  stores:[[0,0,102540,0,0,0],[945,0,215320,0,0,0],[2389,612,2198740,324180,0,0],[0,0,266523,0,0,0],[0,0,0,0,0,0]]},
    '2026-05': {sub:3603406, locked:false, stores:[[0,0,480000,0,0,0],[0,0,690000,0,0,0],[0,0,1620000,0,0,0],[0,0,680000,0,0,0],[0,0,133406,0,0,0]]},
    '2026-06': {sub:0, locked:false, stores:[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]},
    '2026-07': {sub:0, locked:false, stores:[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]},
    '2026-08': {sub:0, locked:false, stores:[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]},
    '2026-09': {sub:0, locked:false, stores:[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]},
    '2026-10': {sub:0, locked:false, stores:[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]},
    '2026-11': {sub:0, locked:false, stores:[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]},
    '2026-12': {sub:0, locked:false, stores:[[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]},
  },
  // Manual monthly: key -> [staffFood, dump, maintenance, otherIncome]
  manual: {
    '2026-01':[65199,2871,109960,0],'2026-02':[65199,3175,114754,0],
    '2026-03':[65199,4185,103254,0],'2026-04':[65199,5134,247542,0],
    '2026-05':[0,0,0,0]
  },
  // Consumption: key -> [{name,unit,cafe,truck,express,tcs,opening,purchase,wastage,staffFood,closing}]
  cons: {
    '2026-05': [
      {name:'Paneer',   unit:'kg',cafe:182,truck:18,express:15,tcs:92, opening:2, purchase:312,wastage:0,  staffFood:0, closing:4},
      {name:'Chicken',  unit:'kg',cafe:392,truck:72,express:0, tcs:124,opening:14,purchase:628,wastage:7.5,staffFood:30,closing:9},
      {name:'Ice Cream',unit:'kg',cafe:164,truck:16,express:0, tcs:42, opening:6, purchase:226,wastage:0,  staffFood:0, closing:8},
    ]
  },
  // Purchase locked state: key -> bool
  purLocked: {
    '2026-01':true,'2026-02':true,'2026-03':true,'2026-04':true,'2026-05':false
  },
  // Inventory locked: key -> bool
  invLocked: {
    '2026-01':true,'2026-02':true,'2026-03':true,'2026-04':true,'2026-05':false
  },
  // Sales locked: key -> bool
  salesLocked: {
    '2026-01':true,'2026-02':true,'2026-03':true,'2026-04':true,'2026-05':false
  },
  // Target data: key -> [{t,w},...]  (5 sites)
  target: {
    '2026-01':[{t:800000,w:30},{t:700000,w:30},{t:1200000,w:30},{t:500000,w:30},{t:0,w:30}],
    '2026-02':[{t:850000,w:28},{t:720000,w:28},{t:1250000,w:28},{t:520000,w:28},{t:0,w:28}],
    '2026-03':[{t:900000,w:31},{t:750000,w:31},{t:1300000,w:31},{t:550000,w:31},{t:0,w:31}],
    '2026-04':[{t:950000,w:30},{t:780000,w:30},{t:1350000,w:30},{t:580000,w:30},{t:0,w:30}],
    '2026-05':[{t:1000000,w:31},{t:800000,w:31},{t:1400000,w:31},{t:600000,w:31},{t:0,w:31}],
  },
  // Incentive employees: key -> [...]
  incentive: {
    '2026-05': [{name:'Yasin Shek',code:'9702483928',section:'Kitchen',pct:18,leave:0,absent:false,fixInc:'',mgrOverride:'',actualInc:'5400'}]
  }
};

// Get or init period data
function getPD(section, key, defaultVal){
  if(!STORE[section]) STORE[section]={};
  if(STORE[section][key]===undefined) STORE[section][key] = typeof defaultVal==='function'?defaultVal():JSON.parse(JSON.stringify(defaultVal));
  return STORE[section][key];
}

// ══════════════════════════
// DAILY SALES
// ══════════════════════════

function getDefaultDays(p){
  const rows=[];
  for(let d=1;d<=p.days;d++){
    const dt=new Date(p.y,p.m-1,d);
    const dn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
    const ds=String(d).padStart(2,'0')+'/'+String(p.m).padStart(2,'0')+'/'+p.y;
    rows.push([ds,dn,0,0,0,0,0,0,0,0,0,0,0,0,0]);
  }
  return rows;
}

function calcRow(r){
  const[date,day,cu,co,cc,eu,ec,tu,tc,tcs1,tcs2,tcsu,tcsc,ru,rc]=r;
  const cafeT=cu+co+cc,expT=eu+ec,truckT=tu+tc,tcsT=tcs1+tcs2,rcfT=ru+rc;
  const grand=cafeT+expT+truckT+tcsT+tcsu+tcsc+rcfT;
  return{date,day,cu,co,cc,cafeT,eu,ec,expT,tu,tc,truckT,tcs1,tcs2,tcsT,tcsu,tcsc,ru,rc,rcfT,grand};
}

const DAY_COLORS={Mon:'#25a244',Tue:'#25a244',Wed:'#25a244',Thu:'#25a244',Fri:'#25a244',Sat:'#E8A020',Sun:'#c44000'};
let editModeOn=false;

function rebuildDaily(){
  // Read period from section selectors
  const dsM=document.getElementById('dsMonth');
  const dsY=document.getElementById('dsYear');
  const m=dsM?parseInt(dsM.value):5;
  const y=dsY?parseInt(dsY.value):2026;
  const days=new Date(y,m,0).getDate();
  const key=`${y}-${String(m).padStart(2,'0')}`;
  const label=MN[m-1]+' '+y;

  // Sync global bar
  const gM=document.getElementById('gMonth'),gY=document.getElementById('gYear');
  if(gM)gM.value=m; if(gY)gY.value=y;
  const gLbl=document.getElementById('gPeriodLabel');
  if(gLbl)gLbl.textContent=label;

  const tgt=parseInt((document.getElementById('pdTarget')||{value:107000}).value)||107000;
  const DAYS=getPD('daily',key,()=>getDefaultDays({y,m,days}));
  const tb=document.getElementById('dsTbody');
  const tf=document.getElementById('dsFoot');
  if(!tb)return;

  tb.innerHTML='';
  let tot={cu:0,co:0,cc:0,cafeT:0,eu:0,ec:0,expT:0,tu:0,tc:0,truckT:0,
           tcs1:0,tcs2:0,tcsT:0,tcsu:0,tcsc:0,ru:0,rc:0,rcfT:0,grand:0};
  let entered=0, ytd=0;

  DAYS.forEach((r,idx)=>{
    const d=calcRow(r);
    if(d.grand>0){entered++;ytd+=d.grand;}
    Object.keys(tot).forEach(k=>{if(d[k]!==undefined)tot[k]+=d[k];});

    const isZero=d.grand===0;
    const met=!isZero&&d.grand>=tgt;
    const dotColor=DAY_COLORS[d.day]||'#aaa';
    const delta=d.grand-tgt;
    const achPct=isZero?'—':(d.grand/tgt*100).toFixed(1)+'%';
    const diffAmt=isZero?'—':(delta>=0?'+':'')+f(delta);
    const diffPct=isZero?'—':(delta>=0?'+':'-')+(Math.abs(delta/tgt)*100).toFixed(1)+'%';
    const gc=met?'color:#166534;font-weight:700':'color:#b91c1c;font-weight:700';
    const statusHtml=isZero
      ?'<span style="color:#bbb;font-size:11px">—</span>'
      :met
        ?'<span class="tag g" style="font-size:11px">✅ Met</span>'
        :'<span class="tag r" style="font-size:11px">✕ Miss</span>';

    // Empty rows are always directly editable inline
    // Saved rows (grand>0) need edit mode to show ✏️ button
    const canEditInline = isZero;
    const showEditBtn = !isZero && editModeOn;
    const actionCell = canEditInline
      ? `<button onclick="saveInlineRow('${key}',${idx})" style="padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;border:none;background:#dcfce7;color:#166534">💾</button>`
      : showEditBtn
        ? `<button class="edit-btn" onclick="startEditRow('${key}',${idx})">✏️</button>`
        : '<span style="color:#ddd;font-size:11px">—</span>';

    // For empty rows: show input fields directly
    const cell = (val, fieldIdx, bg='') => {
      if(canEditInline){
        return `<td style="padding:2px 3px;text-align:right${bg?';background:'+bg:''}"><input type="number" value="${val}" id="inp_${idx}_${fieldIdx}" min="0" onchange="liveUpdate('${key}',${idx},${fieldIdx},this.value)" style="width:60px;padding:2px 4px;border:1px solid #ddd;border-radius:3px;font-size:11px;text-align:right;font-family:Inter,sans-serif;background:${bg||'#fffbe8'}"></td>`;
      }
      const z = val===0 ? `<span style="color:#ccc">0</span>` : f(val);
      return `<td style="padding:5px 6px;text-align:right${bg?';background:'+bg:''}">${z}</td>`;
    };
    const zt=v=>v===0?`<span style="color:#1a4fd6;opacity:.4">0</span>`:`<b style="color:#1a4fd6">${f(v)}</b>`;

    tb.innerHTML+=`<tr id="dsrow-${idx}" style="border-bottom:1px solid #ece9e3${canEditInline?';background:#fafff8':''}">
      <td style="padding:6px 10px;font-weight:600;font-size:12px;white-space:nowrap">${d.date}</td>
      <td style="padding:6px 6px;text-align:center">
        <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${dotColor};margin-right:3px;vertical-align:middle"></span>
        <span style="font-size:11px;font-weight:600;color:#555">${d.day}</span>
      </td>
      ${cell(d.cu,0)}${cell(d.co,1)}${cell(d.cc,2)}
      <td style="padding:5px 6px;text-align:right;background:#fff3e0">${zt(d.cafeT)}</td>
      ${cell(d.eu,3)}${cell(d.ec,4)}
      <td style="padding:5px 6px;text-align:right;background:#e8f4fd">${zt(d.expT)}</td>
      ${cell(d.tu,5)}${cell(d.tc,6)}
      <td style="padding:5px 6px;text-align:right;background:#f0f9ee">${zt(d.truckT)}</td>
      ${cell(d.tcs1,7)}${cell(d.tcs2,8)}
      <td style="padding:5px 6px;text-align:right;background:#fce8e8">${zt(d.tcsT)}</td>
      ${cell(d.tcsu,9)}${cell(d.tcsc,10)}
      ${cell(d.ru,11)}${cell(d.rc,12)}
      <td style="padding:6px 8px;text-align:right;font-size:13px;font-weight:700">${isZero?'<span style="color:#bbb">₹0</span>':'₹'+f(d.grand)}</td>
      <td style="padding:6px 8px;text-align:right;background:#f0fdf4;color:#166534;font-weight:700">${isZero?'<span style="color:#bbb">—</span>':'₹'+f(d.grand)}</td>
      <td style="padding:6px 8px;text-align:right;font-size:11px;color:#555">₹${f(tgt)}</td>
      <td style="padding:6px 8px;text-align:right;${isZero?'color:#bbb':gc}">${achPct}</td>
      <td style="padding:6px 8px;text-align:right;background:#fff7ed;${isZero?'color:#bbb':gc}">${diffAmt}</td>
      <td style="padding:6px 8px;text-align:right;background:#fff7ed;${isZero?'color:#bbb':gc}">${diffPct}</td>
      <td style="padding:6px 8px;text-align:center">${statusHtml}</td>
      <td style="padding:5px 6px;text-align:center">${actionCell}</td>
    </tr>`;
  });

  // Footer
  const tgtTot=tgt*entered;
  const gDiff=tot.grand-tgtTot;
  tf.innerHTML=`<tr style="background:#fff8f0;font-weight:700;border-top:2px solid #c44000;font-size:12px">
    <td style="padding:8px 10px;color:#c44000">🟩 ${label} (${entered} days)</td>
    <td style="text-align:right">${f(tot.cu)}</td>
    <td style="text-align:right">${f(tot.co)}</td>
    <td style="text-align:right">${f(tot.cc)}</td>
    <td style="text-align:right;background:#fff3e0;color:#1a4fd6">${f(tot.cafeT)}</td>
    <td style="text-align:right">${f(tot.eu)}</td>
    <td style="text-align:right">${f(tot.ec)}</td>
    <td style="text-align:right;background:#e8f4fd;color:#1a4fd6">${f(tot.expT)}</td>
    <td style="text-align:right">${f(tot.tu)}</td>
    <td style="text-align:right">${f(tot.tc)}</td>
    <td style="text-align:right;background:#f0f9ee;color:#1a4fd6">${f(tot.truckT)}</td>
    <td style="text-align:right">${f(tot.tcs1)}</td>
    <td style="text-align:right">${f(tot.tcs2)}</td>
    <td style="text-align:right;background:#fce8e8;color:#1a4fd6">${f(tot.tcsT)}</td>
    <td style="text-align:right">${f(tot.tcsu)}</td>
    <td style="text-align:right">${f(tot.tcsc)}</td>
    <td style="text-align:right">${f(tot.ru)}</td>
    <td style="text-align:right">${f(tot.rc)}</td>
    <td style="text-align:right;font-size:14px;color:#c44000">₹${f(tot.grand)}</td>
    <td style="text-align:right;background:#f0fdf4;color:#166534">₹${entered>0?f(Math.round(tot.grand/entered)):'—'}</td>
    <td style="text-align:right;font-size:11px;color:#555">₹${f(tgtTot)}</td>
    <td style="text-align:right;color:${tot.grand>=tgtTot?'#166534':'#b91c1c'}">${entered>0?(tot.grand/tgtTot*100).toFixed(1)+'%':'—'}</td>
    <td style="text-align:right;background:#fff7ed;color:${gDiff>=0?'#166534':'#b91c1c'}">${entered>0?(gDiff>=0?'+':'')+f(gDiff):'—'}</td>
    <td style="text-align:right;background:#fff7ed;color:${gDiff>=0?'#166534':'#b91c1c'}">${entered>0?(gDiff>=0?'+':'-')+(Math.abs(gDiff/tgtTot)*100).toFixed(1)+'%':'—'}</td>
    <td></td>
    <td style="text-align:center;font-size:11px;color:#666">Avg: ₹${entered>0?f(Math.round(tot.grand/entered)):'0'}</td>
  </tr>`;

  document.getElementById('ytdInfo').innerHTML=
    `<b>${entered}</b> days entered &nbsp;·&nbsp; ${label} total <b>₹${f(ytd)}</b>`;
}

function renderDailySales(){ rebuildDaily(); }

function addDayRow(){
  const dsM=document.getElementById('dsMonth'),dsY=document.getElementById('dsYear');
  const m=dsM?parseInt(dsM.value):5, y=dsY?parseInt(dsY.value):2026;
  const days=new Date(y,m,0).getDate();
  const key=`${y}-${String(m).padStart(2,'0')}`;
  const DAYS=getPD('daily',key,()=>getDefaultDays({y,m,days}));
  const n=DAYS.length+1;
  const ds=String(n).padStart(2,'0')+'/'+String(m).padStart(2,'0')+'/'+y;
  DAYS.push([ds,'',0,0,0,0,0,0,0,0,0,0,0,0,0]);
  rebuildDaily();
}

function requestEditSaved(){
  document.getElementById('modalConfirmEdit').classList.add('show');
}

function enableEditMode(){
  closeModal('modalConfirmEdit');
  editModeOn=true;
  document.getElementById('editModeInd').style.display='inline';
  document.getElementById('editSavedBtn').style.display='none';
  document.getElementById('exitEditBtn').style.display='inline-block';
  rebuildDaily();
}

function exitEditMode(){
  editModeOn=false;
  document.getElementById('editModeInd').style.display='none';
  document.getElementById('editSavedBtn').style.display='inline-block';
  document.getElementById('exitEditBtn').style.display='none';
  rebuildDaily();
}

function startEditRow(key,idx){
  const DAYS=STORE.daily[key];
  if(!DAYS||!DAYS[idx])return;
  const r=DAYS[idx];
  const tr=document.getElementById('dsrow-'+idx);
  if(!tr)return;
  const vals=r.slice(2);
  tr.style.background='#fffbe8';
  tr.innerHTML=`
    <td style="padding:5px 8px;font-weight:700;font-size:12px">${r[0]}</td>
    <td style="text-align:center;font-size:11px;font-weight:600">${r[1]}</td>
    ${vals.map((v,i)=>`<td style="padding:3px 4px"><input type="number" value="${v}" id="ei_${idx}_${i}" min="0" style="width:60px;padding:3px 4px;border:1px solid #c44000;border-radius:3px;font-size:11px;text-align:right;font-family:Inter,sans-serif"></td>`).join('')}
    <td colspan="7" style="text-align:center;padding:4px 8px">
      <button class="save-row-btn" onclick="saveRow('${key}',${idx})">💾 Save</button>
      &nbsp;
      <button class="cancel-row-btn" onclick="exitEditMode()">✕</button>
    </td>`;
}

function saveRow(key,idx){
  const vals=[];
  for(let i=0;i<13;i++){
    const el=document.getElementById(`ei_${idx}_${i}`);
    vals.push(el?parseInt(el.value)||0:0);
  }
  if(!STORE.daily[key])return;
  const r=STORE.daily[key][idx];
  STORE.daily[key][idx]=[r[0],r[1],...vals];
  document.getElementById('modalSaveRowSub').innerHTML=`Save edits for <b>${r[0]}</b>?`;
  document.getElementById('modalSaveRow').classList.add('show');
}

function confirmSaveRow(){
  closeModal('modalSaveRow');
  rebuildDaily();
  flash('✅ Row saved!');
}


// ══════════════════════════
// PRODUCT CONSUMPTION
// ══════════════════════════
const DEV_THRESHOLD=5;
function renderConsumption(){
  // Read from section's own month/year selectors
  const cM=document.getElementById('consMonth');
  const cY=document.getElementById('consYear');
  const m=cM?parseInt(cM.value):5;
  const y=cY?parseInt(cY.value):2026;
  const key=`${y}-${String(m).padStart(2,'0')}`;
  const label=MN[m-1]+' '+y;

  // Sync global bar
  const gM=document.getElementById('gMonth'),gY=document.getElementById('gYear');
  if(gM)gM.value=m; if(gY)gY.value=y;
  const gLbl=document.getElementById('gPeriodLabel');
  if(gLbl)gLbl.textContent=label;

  // Default items for any new month
  const defaultItems=[
    {name:'Paneer',unit:'kg',cafe:0,truck:0,express:0,tcs:0,opening:0,purchase:0,wastage:0,staffFood:0,closing:0},
    {name:'Chicken',unit:'kg',cafe:0,truck:0,express:0,tcs:0,opening:0,purchase:0,wastage:0,staffFood:0,closing:0},
    {name:'Ice Cream',unit:'kg',cafe:0,truck:0,express:0,tcs:0,opening:0,purchase:0,wastage:0,staffFood:0,closing:0},
  ];
  const items=getPD('cons',key,defaultItems);

  const tb=document.getElementById('consTbody');
  if(!tb)return;

  // Update month label in toolbar
  const lbl=document.getElementById('consMonthLbl');
  if(lbl)lbl.textContent=label;

  tb.innerHTML='';
  items.forEach((item,idx)=>{
    const total=item.cafe+item.truck+item.express+item.tcs;
    const dev=(item.opening+item.purchase)-(total+item.wastage+item.staffFood+item.closing);
    const devPct=item.purchase>0?(Math.abs(dev)/item.purchase*100).toFixed(2):0;
    const isOver=Math.abs(dev)>DEV_THRESHOLD;
    const devBg=isOver?'background:#fee2e2':'background:#f0fdf4';
    const devColor=isOver?'color:#b91c1c;font-weight:700':'color:#1a73e8;font-weight:700';
    const devLabel=Math.abs(dev).toFixed(dev%1===0?0:1)+' kg'+(isOver?' 🔴':'');

    const inp=(field,val,w='62px',step='1')=>
      `<input type="number" value="${val}" step="${step}" min="0"
        onchange="STORE.cons['${key}'][${idx}].${field}=parseFloat(this.value)||0;renderConsumption()"
        style="width:${w};padding:3px 5px;border:1px solid #ddd;border-radius:3px;font-size:11px;text-align:right;font-family:Inter,sans-serif;background:#fffbe8">`;

    tb.innerHTML+=`<tr style="border-bottom:1px solid #ece9e3">
      <td style="padding:8px 12px">
        <input value="${item.name}" onchange="STORE.cons['${key}'][${idx}].name=this.value"
          style="border:1px solid #ddd;border-radius:3px;padding:4px 7px;font-size:12px;font-family:Inter,sans-serif;font-weight:700;width:110px">
      </td>
      <td style="padding:8px 10px;text-align:center;color:#888">
        <input value="${item.unit}" onchange="STORE.cons['${key}'][${idx}].unit=this.value"
          style="border:1px solid #ddd;border-radius:3px;padding:3px 5px;font-size:11px;width:38px;text-align:center;font-family:Inter,sans-serif">
      </td>
      <td style="padding:5px 7px">${inp('cafe',item.cafe)}</td>
      <td style="padding:5px 7px">${inp('truck',item.truck)}</td>
      <td style="padding:5px 7px">${inp('express',item.express)}</td>
      <td style="padding:5px 7px">${inp('tcs',item.tcs)}</td>
      <td style="padding:8px 10px;text-align:right;background:#f0fdf4;color:#25a244;font-weight:700;font-size:14px">${total}</td>
      <td style="padding:5px 7px">${inp('opening',item.opening,'55px')}</td>
      <td style="padding:5px 7px">${inp('purchase',item.purchase,'65px')}</td>
      <td style="padding:5px 7px">${inp('wastage',item.wastage,'52px','0.5')}</td>
      <td style="padding:5px 7px">${inp('staffFood',item.staffFood,'58px')}</td>
      <td style="padding:5px 7px">${inp('closing',item.closing,'55px')}</td>
      <td style="padding:8px 10px;text-align:right;${devBg};${devColor}">${devLabel}</td>
      <td style="padding:8px 10px;text-align:right;${devColor}">${devPct}%</td>
      <td style="padding:6px 8px;text-align:center">
        <button onclick="removeConsItem('${key}',${idx})"
          style="padding:3px 7px;border-radius:4px;font-size:11px;cursor:pointer;border:none;background:#fee2e2;color:#b91c1c">🗑</button>
      </td>
    </tr>`;
  });
}


function addConsItem(){
  const cM=document.getElementById('consMonth'),cY=document.getElementById('consYear');
  const m=cM?parseInt(cM.value):5,y=cY?parseInt(cY.value):2026;
  const k=`${y}-${String(m).padStart(2,'0')}`;
  getPD('cons',k,[]);
  STORE.cons[k].push({name:'New Item',unit:'kg',cafe:0,truck:0,express:0,tcs:0,opening:0,purchase:0,wastage:0,staffFood:0,closing:0});
  renderConsumption();flash('✅ Item added!');
}
function removeConsItem(key,idx){if(!confirm('Remove item?'))return;STORE.cons[key].splice(idx,1);renderConsumption();}
function saveConsumption(){flash('💾 Consumption saved!');}

// ══════════════════════════
// PURCHASE
// ══════════════════════════
function buildPurchase(){
  const _p=typeof getPurPeriod==="function"?getPurPeriod():getGPeriod();
  const head=document.getElementById('purHead'),body=document.getElementById('purBody');
  if(!head)return;
  const months12=[];
  for(let i=1;i<=12;i++)months12.push({key:`2026-${String(i).padStart(2,'0')}`,label:`${MN_SHORT[i-1]} 2026`});
  const ytd=months12.reduce((s,m)=>s+(STORE.purchase[m.key]||0),0);
  let h=`<tr style="background:#fff8f0"><th style="padding:9px 12px;text-align:left;border-bottom:2px solid #d0cdc6;font-size:11px;font-weight:700;color:#555"></th>`;
  months12.forEach(m=>{const lk=STORE.purLocked[m.key];h+=`<th style="padding:9px 10px;text-align:center;border-bottom:2px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:11px;font-weight:700;color:${lk?'#c44000':'#555'}">${m.label} ${lk?'🔒':'✏️'}</th>`;});
  h+=`<th style="padding:9px 12px;text-align:right;border-bottom:2px solid #d0cdc6;border-left:2px solid #c44000;font-size:11px;font-weight:700;color:#1a73e8">YTD Total</th></tr>`;
  head.innerHTML=h;

  let valRow=`<tr style="border-bottom:1px solid #e0ddd6"><td style="padding:10px 12px;font-size:11px;font-weight:600;color:#888">Purchase (₹)</td>`;
  months12.forEach(m=>{
    const lk=STORE.purLocked[m.key];const v=STORE.purchase[m.key]||0;
    valRow+=`<td style="padding:8px 10px;text-align:center;border-left:1px solid #e0ddd6;background:${lk?'#fff8f5':'#fffbe8'}">`;
    if(lk) valRow+=`<span style="color:#555;font-weight:600">${v>0?f(v):v}</span>`;
    else valRow+=`<input type="number" value="${v}" min="0" onchange="STORE.purchase['${m.key}']=parseInt(this.value)||0;buildPurchase();buildFoodCost()" style="width:90px;padding:5px 7px;border:1px solid #ddd;border-radius:4px;font-size:12px;text-align:right;font-family:Inter,sans-serif;background:#fffbe8">`;
    valRow+=`</td>`;
  });
  valRow+=`<td style="padding:10px 12px;text-align:right;border-left:2px solid #c44000;color:#1a73e8;font-weight:700;font-size:14px">₹${f(ytd)}</td></tr>`;

  let actRow=`<tr style="background:#faf9f6"><td style="padding:7px 12px;font-size:11px;font-weight:600;color:#888">Action</td>`;
  months12.forEach(m=>{
    const lk=STORE.purLocked[m.key];
    actRow+=`<td style="padding:5px 8px;text-align:center;border-left:1px solid #e0ddd6">${lk?`<button onclick="STORE.purLocked['${m.key}']=false;buildPurchase()" style="padding:3px 9px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;border:none;background:#fff3e0;color:#8B3300">✏️ Edit</button>`:`<button onclick="STORE.purLocked['${m.key}']=true;buildPurchase();buildFoodCost()" style="padding:3px 9px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;border:none;background:#2c1a0e;color:#fff">💾 Save</button>`}</td>`;
  });
  actRow+=`<td style="border-left:2px solid #c44000"></td></tr>`;
  body.innerHTML=valRow+actRow;
}

// ══════════════════════════
// INVENTORY
// ══════════════════════════
const INV_SITES=['Store','Food Truck','Rolling Express','TCS','Café & Kitchen'];
function buildInventory(){
  const _p=typeof getInvPeriod==="function"?getInvPeriod():getGPeriod();
  const head=document.getElementById('invHead'),body=document.getElementById('invBody'),foot=document.getElementById('invFoot');
  if(!head)return;
  const months12=[];for(let i=1;i<=12;i++)months12.push({key:`2026-${String(i).padStart(2,'0')}`,label:`${MN_SHORT[i-1]} 2026`});

  let h1=`<tr style="background:#fff8f0"><th rowspan="2" style="padding:9px 12px;text-align:left;border-bottom:2px solid #d0cdc6;font-size:11px;font-weight:700;color:#c44000;min-width:110px">Site Name</th>`;
  months12.forEach(m=>{const lk=STORE.invLocked[m.key];h1+=`<th colspan="2" style="padding:7px 10px;text-align:center;border-bottom:1px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:11px;font-weight:700;color:${lk?'#c44000':'#555'};background:${lk?'#fff8f5':'#f5f3ee'}">${m.label} ${lk?'🔒':'✏️'}</th>`;});
  h1+=`</tr>`;
  let h2=`<tr style="background:#faf9f6">`;
  months12.forEach(m=>{const bg=STORE.invLocked[m.key]?'#fff8f5':'#f5f3ee';h2+=`<th style="padding:6px 8px;text-align:right;border-bottom:2px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:10px;font-weight:600;color:#555;background:${bg}">Start</th><th style="padding:6px 8px;text-align:right;border-bottom:2px solid #d0cdc6;font-size:10px;font-weight:600;color:#555;background:${bg}">Close</th>`;});
  h2+=`</tr>`;head.innerHTML=h1+h2;

  let bHtml='';
  INV_SITES.forEach((site,si)=>{
    bHtml+=`<tr style="border-bottom:1px solid #ece9e3"><td style="padding:8px 12px;font-weight:700;font-size:12px">${site}</td>`;
    months12.forEach(m=>{
      const lk=STORE.invLocked[m.key];
      const inv=getPD('inv',m.key,[[0,0],[0,0],[0,0],[0,0],[0,0]]);
      const[start,close]=inv[si]||[0,0];
      const bg=lk?'#fff8f5':'#fffbe8';
      const inp=(v,fi)=>lk?`<span style="color:#555">${v>0?f(v):'0'}</span>`:`<input type="number" value="${v}" min="0" onchange="STORE.inv['${m.key}']&&(STORE.inv['${m.key}'][${si}][${fi}]=parseInt(this.value)||0);buildInventory()" style="width:72px;padding:3px 5px;border:1px solid #ddd;border-radius:3px;font-size:11px;text-align:right;font-family:Inter,sans-serif;background:#fffbe8">`;
      bHtml+=`<td style="padding:6px 8px;text-align:right;background:${bg};border-left:1px solid #e0ddd6">${inp(start,0)}</td><td style="padding:6px 8px;text-align:right;background:${bg}">${inp(close,1)}</td>`;
    });bHtml+=`</tr>`;
  });body.innerHTML=bHtml;

  let totHtml=`<tr style="background:#fff8f0;border-top:2px solid #d0cdc6;font-weight:700"><td style="padding:9px 12px;font-size:12px">Total Inventory Value</td>`;
  months12.forEach(m=>{
    const inv=STORE.inv[m.key]||[[0,0],[0,0],[0,0],[0,0],[0,0]];
    const ts=inv.reduce((s,r)=>s+r[0],0),tc=inv.reduce((s,r)=>s+r[1],0);
    totHtml+=`<td style="padding:9px 8px;text-align:right;color:#25a244;border-left:1px solid #e0ddd6">₹${f(ts)}</td><td style="padding:9px 8px;text-align:right;color:#25a244">₹${f(tc)}</td>`;
  });totHtml+=`</tr>`;

  let actHtml=`<tr style="background:#faf9f6"><td style="padding:7px 12px;font-size:11px;font-weight:600;color:#888">Action</td>`;
  months12.forEach(m=>{
    const lk=STORE.invLocked[m.key];
    actHtml+=`<td colspan="2" style="padding:5px 6px;text-align:center;border-left:1px solid #e0ddd6">${lk?`<button onclick="STORE.invLocked['${m.key}']=false;buildInventory()" style="padding:3px 9px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;border:none;background:#fff3e0;color:#8B3300">✏️ Edit</button>`:`<button onclick="STORE.invLocked['${m.key}']=true;buildInventory()" style="padding:3px 9px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;border:none;background:#2c1a0e;color:#fff">💾 Save</button>`}</td>`;
  });actHtml+=`</tr>`;
  foot.innerHTML=totHtml+actHtml;
}

// ══════════════════════════
// FOOD COST
// ══════════════════════════
function buildFoodCost(){
  const head=document.getElementById('fcHead'),body=document.getElementById('fcBody');
  if(!head)return;
  const months12=[];for(let i=1;i<=12;i++)months12.push({key:`2026-${String(i).padStart(2,'0')}`,label:`${MN_SHORT[i-1]} 2026`});
  const fcSales={
    '2026-01':2766097,'2026-02':2598935,'2026-03':3111071,'2026-04':3107303,'2026-05':3603406
  };
  let h1=`<tr style="background:#fff8f0"><th rowspan="2" style="padding:9px 12px;text-align:left;border-bottom:2px solid #d0cdc6;font-size:11px;font-weight:700;color:#555;min-width:60px"></th>`;
  months12.forEach(m=>{h1+=`<th colspan="2" style="padding:7px 10px;text-align:center;border-bottom:1px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:11px;font-weight:700;color:#c44000">${m.label}</th>`;});
  h1+=`<th rowspan="2" style="padding:9px 12px;text-align:right;border-bottom:2px solid #d0cdc6;border-left:2px solid #c44000;font-size:11px;font-weight:700;color:#1a73e8;min-width:80px">Annual<br>FC</th></tr>`;
  let h2=`<tr style="background:#faf9f6">`;
  months12.forEach(()=>{h2+=`<th style="padding:6px 8px;text-align:right;border-bottom:2px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:10px;font-weight:700;color:#c44000;background:#fff8f5;white-space:nowrap">Actual FC (₹)</th><th style="padding:6px 8px;text-align:right;border-bottom:2px solid #d0cdc6;font-size:10px;font-weight:700;color:#c44000;background:#fff8f5">% FC</th>`;});
  h2+=`</tr>`;head.innerHTML=h1+h2;

  let row=`<tr style="border-bottom:1px solid #ece9e3"><td style="padding:10px 12px;font-size:12px;font-weight:600;color:#555">FC</td>`;
  let annualFC=0;
  months12.forEach(m=>{
    const inv=STORE.inv[m.key]||[[0,0],[0,0],[0,0],[0,0],[0,0]];
    const startInv=inv.reduce((s,r)=>s+r[0],0);
    const endInv=inv.reduce((s,r)=>s+r[1],0);
    const pur=STORE.purchase[m.key]||0;
    const fc=startInv+pur-endInv;
    const sales=fcSales[m.key]||0;
    const pct=sales>0?(fc/sales*100).toFixed(2):null;
    if(fc>0)annualFC+=fc;
    const fcColor=fc>0?'#c44000':'#bbb';
    const pctColor=pct?(parseFloat(pct)>37?'#b91c1c':parseFloat(pct)>33?'#E8A020':'#166634'):'#bbb';
    row+=`<td style="padding:10px 10px;text-align:right;border-left:1px solid #e0ddd6;color:${fcColor};font-weight:700">${fc>0?'₹'+f(fc):'<span style="color:#bbb">₹0</span>'}</td><td style="padding:10px 10px;text-align:right;color:${pctColor};font-weight:700">${pct&&fc>0?pct+'%':'<span style="color:#bbb">—</span>'}</td>`;
  });
  row+=`<td style="padding:10px 12px;text-align:right;border-left:2px solid #c44000;color:#1a73e8;font-weight:700;font-size:13px">₹${f(annualFC)}</td></tr>`;
  body.innerHTML=row;
}

// ══════════════════════════
// SALES REPORT
// ══════════════════════════
const STORE_NAMES=['RC Express','Food Truck','Café','TCS','Events'];
function buildSalesReport(){
  const panel=document.getElementById('salesPanel');
  if(!panel)return;
  // Year from global selector
  const gY=document.getElementById('gYear');
  const yr=gY?parseInt(gY.value):2026;
  const SNAMES=['RC Express','Food Truck','Café','TCS','Events'];

  let html=`<table style="width:100%;border-collapse:collapse;font-size:12px;min-width:1100px">
  <thead>
    <tr style="background:#fff8f0">
      <th style="padding:9px 12px;text-align:left;border-bottom:2px solid #d0cdc6;font-size:11px;font-weight:700;color:#c44000;min-width:110px">Store</th>
      <th colspan="3" style="padding:9px 12px;text-align:center;border-bottom:2px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:11px;font-weight:700;color:#c44000;background:#fff3e0">Order Count</th>
      <th style="padding:9px 8px;text-align:center;border-bottom:2px solid #d0cdc6;font-size:11px;font-weight:700;color:#25a244;background:#f0fdf4;min-width:55px">Avg /<br>day</th>
      <th colspan="5" style="padding:9px 12px;text-align:center;border-bottom:2px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:11px;font-weight:700;color:#c44000;background:#fff8f5">Amount (₹)</th>
    </tr>
    <tr style="background:#faf9f6">
      <th style="padding:7px 12px;text-align:left;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:600;color:#555"></th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:10px;font-weight:600;background:#fff3e0">Dining</th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:600;background:#fff3e0">Home Delivery</th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:700;color:#c44000;background:#fff3e0">Total Orders</th>
      <th style="padding:7px 8px;text-align:center;border-bottom:1px solid #d0cdc6;font-size:10px;background:#f0fdf4"></th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;border-left:1px solid #e0ddd6;font-size:10px;font-weight:600;background:#fff8f5">Dining</th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:600;background:#fff8f5">Home Delivery</th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:600;background:#fff8f5">Credit Sales</th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:600;background:#fff8f5">FOC</th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:700;color:#c44000;background:#fff8f5">Row Total</th>
      <th style="padding:7px 10px;text-align:right;border-bottom:1px solid #d0cdc6;font-size:10px;font-weight:700;color:#c44000;background:#fff3e8">Sub-Total<br>(Month)</th>
    </tr>
  </thead><tbody>`;

  for(let mi=1;mi<=12;mi++){
    const mk=`${yr}-${String(mi).padStart(2,'0')}`;
    const md=getPD('sales',mk,{sub:0,locked:false,stores:SNAMES.map(()=>[0,0,0,0,0,0])});
    const locked=md.locked;
    const daysInMon=new Date(yr,mi,0).getDate();
    const monthTotal=md.stores.reduce((s,r)=>s+(r[2]+r[3]+r[4]+r[5]),0)||(md.sub||0);
    const mLabel=MN_SHORT[mi-1]+' '+yr;

    // Month band — matches screenshot exactly
    html+=`<tr style="background:#6B1500">
      <td colspan="10" style="padding:9px 14px;color:#fff;font-weight:700;font-size:12px">
        ${mLabel.toUpperCase()} &nbsp;·&nbsp; SUB-TOTAL: ₹${f(monthTotal)}
        &nbsp;&nbsp;<span style="font-size:11px;font-weight:600;color:#ffd090">
          ${locked?'🔒':'✏️ EDITABLE'}
        </span>
      </td>
      <td style="padding:6px 10px;text-align:right;background:#5a1200">
        ${locked
          ? `<button onclick="toggleSalesLock('${mk}')" style="padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;border:none;background:#fff3e0;color:#8B3300">✏️ Edit</button>`
          : `<button onclick="saveSalesMonth('${mk}')" style="padding:4px 12px;border-radius:4px;font-size:11px;font-weight:700;cursor:pointer;border:none;background:#2c1a0e;color:#fff">💾 Save</button>`
        }
      </td>
    </tr>`;

    // Store rows
    md.stores.forEach((row,si)=>{
      const[dc,hc,da,ha,cs,foc]=row;
      const totalOrd=dc+hc;
      const rowTotal=da+ha+cs+foc;
      const avgDay=totalOrd>0?(totalOrd/daysInMon).toFixed(2):'0.00';

      const inp=(val,fi,si2)=>locked
        ?`<span style="display:block;text-align:right;padding:4px 6px">${val>0?f(val):'0'}</span>`
        :`<input type="number" value="${val}" min="0"
            onchange="updateSales('${mk}',${si2},${fi},this.value)"
            style="width:100%;padding:4px 6px;border:1px solid #ddd;border-radius:3px;font-size:11px;text-align:right;font-family:Inter,sans-serif;background:#fffbe8">`;

      html+=`<tr style="border-bottom:1px solid #ece9e3">
        <td style="padding:8px 12px;font-weight:600;font-size:12px">${SNAMES[si]}</td>
        <td style="padding:4px 6px;background:#fff3e0">${inp(dc,0,si)}</td>
        <td style="padding:4px 6px;background:#fff3e0">${inp(hc,1,si)}</td>
        <td style="padding:6px 8px;text-align:right;background:#f0fdf4;color:#25a244;font-weight:700">${totalOrd}</td>
        <td style="padding:6px 8px;text-align:center;background:#f0fdf4;color:#25a244">${avgDay}</td>
        <td style="padding:4px 6px;background:#fff8f5">${inp(da,2,si)}</td>
        <td style="padding:4px 6px;background:#fff8f5">${inp(ha,3,si)}</td>
        <td style="padding:4px 6px;background:#fff8f5">${inp(cs,4,si)}</td>
        <td style="padding:4px 6px;background:#fff8f5">${inp(foc,5,si)}</td>
        <td style="padding:8px 10px;text-align:right;color:${rowTotal>0?'#c44000':'#bbb'};font-weight:${rowTotal>0?'700':'400'}">
          ${rowTotal>0?'₹'+f(rowTotal):'₹0'}
        </td>
        <td style="padding:8px 10px;text-align:right;font-weight:700;background:#fff3e8;color:${si===0&&monthTotal>0?'#c44000':'transparent'}">
          ${si===0&&monthTotal>0?'₹'+f(monthTotal):''}
        </td>
      </tr>`;
    });
  }

  html+=`</tbody></table>`;
  panel.innerHTML=`<div class="tbl-wrap">${html}</div>`;
}

function saveSalesMonth(mk){
  getPD('sales',mk,{sub:0,locked:false,stores:[]}).locked=true;
  buildSalesReport();
  flash('💾 '+mk+' locked & saved!');
}


function updateSales(mk,si,fi,val){getPD('sales',mk,{sub:0,locked:false,stores:[0,0,0,0,0].map(()=>[0,0,0,0,0,0])}).stores[si][fi]=parseInt(val)||0;buildSalesReport();}
function toggleSalesLock(mk){const d=getPD('sales',mk,{sub:0,locked:false,stores:[0,0,0,0,0].map(()=>[0,0,0,0,0,0])});d.locked=!d.locked;buildSalesReport();}

// ══════════════════════════
// MONTHLY INPUT
// ══════════════════════════
const MI_MONTHS_ALL=MN_SHORT.map((_,i)=>`${MN_SHORT[i]} 2026`);
const MI_DERIVED={
  '2026-01':{s:2766097,p:939559,fc:986052},'2026-02':{s:2598935,p:1004521,fc:947731},
  '2026-03':{s:3111071,p:1085751,fc:1151556},'2026-04':{s:3107303,p:1193185,fc:1131610},
};
function renderMonthlyInput(){
  const _mm=document.getElementById('miMonth'),_my=document.getElementById('miYear');
  const _m=_mm?parseInt(_mm.value):5,_y=_my?parseInt(_my.value):2026;
  const p={m:_m,y:_y,days:new Date(_y,_m,0).getDate(),key:`${_y}-${String(_m).padStart(2,'0')}`,label:MN[_m-1]+' '+_y,short:MN_SHORT[_m-1]+' '+_y};
  const tb=document.getElementById('miBody'),tf=document.getElementById('miFoot');
  if(!tb)return;
  tb.innerHTML='';
  let totS=0,totP=0,totFC=0,totSF=0,totD=0,totM=0,totOI=0,totNP=0;
  MN_SHORT.forEach((ms,i)=>{
    const mk=`2026-${String(i+1).padStart(2,'0')}`;
    const d=MI_DERIVED[mk]||{s:0,p:0,fc:0};
    const man=getPD('manual',mk,[0,0,0,0]);
    const isActive=(i+1)===p.m;
    const locked=i+1<p.m;
    const hasData=d.s>0;
    const np=d.s-d.p-d.fc-man[0]-man[1]-man[2]+man[3];
    totS+=d.s;totP+=d.p;totFC+=d.fc;totSF+=man[0];totD+=man[1];totM+=man[2];totOI+=man[3];totNP+=np;
    const lockIcon=hasData?(locked?'🔒':isActive?'✏️':'✏️'):'✏️';
    const npColor=np>0?'color:#166534;font-weight:700':np<0?'color:#b91c1c;font-weight:700':'color:#bbb';
    const inp=(fi,val)=>(locked&&hasData)?`<span style="color:#444;font-weight:600">${val.toLocaleString('en-IN')}</span>`:`<input type="number" class="mi-inp" value="${val}" min="0" onchange="getPD('manual','${mk}',[0,0,0,0])[${fi}]=parseInt(this.value)||0;renderMonthlyInput()">`;
    tb.innerHTML+=`<tr style="border-bottom:1px solid #ece9e3;${isActive?'background:#fffdf5':!hasData?'background:#fafaf7':''}">
      <td class="l" style="font-weight:700;font-size:13px;${isActive?'color:#c44000':''}">${ms} 2026 ${lockIcon}</td>
      <td style="background:#fff8f5;color:${hasData?'#c44000':'#bbb'};font-weight:${hasData?'600':'400'};text-align:right">${hasData?'₹'+f(d.s):'₹0'}</td>
      <td style="background:#fff8f5;color:${hasData?'#c44000':'#bbb'};font-weight:${hasData?'600':'400'};text-align:right">${hasData?'₹'+f(d.p):'₹0'}</td>
      <td style="background:#fff8f5;color:${hasData?'#c44000':'#bbb'};font-weight:${hasData?'600':'400'};text-align:right">${hasData?'₹'+f(d.fc):'₹0'}</td>
      <td style="background:#fffbe8;text-align:right;padding:6px 10px">${inp(0,man[0])}</td>
      <td style="background:#fffbe8;text-align:right;padding:6px 10px">${inp(1,man[1])}</td>
      <td style="background:#fffbe8;text-align:right;padding:6px 10px">${inp(2,man[2])}</td>
      <td style="background:#fffbe8;text-align:right;padding:6px 10px">${inp(3,man[3])}</td>
      <td style="text-align:right;${hasData?npColor:'color:#bbb'}">${hasData?'₹'+f(np):'₹0'}</td>
    </tr>`;
  });
  tf.innerHTML=`<tr style="background:#fff8f0;border-top:2px solid #d0cdc6">
    <td class="l" style="padding:10px 14px;font-weight:700">TOTAL (YTD)</td>
    <td style="padding:10px;text-align:right;background:#fff8f5;color:#c44000;font-weight:700">₹${f(totS)}</td>
    <td style="padding:10px;text-align:right;background:#fff8f5;color:#c44000;font-weight:700">₹${f(totP)}</td>
    <td style="padding:10px;text-align:right;background:#fff8f5;color:#c44000;font-weight:700">₹${f(totFC)}</td>
    <td style="padding:10px;text-align:right;background:#fffbe8;font-weight:700">${f(totSF)}</td>
    <td style="padding:10px;text-align:right;background:#fffbe8;font-weight:700">${f(totD)}</td>
    <td style="padding:10px;text-align:right;background:#fffbe8;font-weight:700">${f(totM)}</td>
    <td style="padding:10px;text-align:right;background:#fffbe8;font-weight:700">${f(totOI)}</td>
    <td style="padding:10px;text-align:right;font-weight:700;font-size:14px;color:${totNP>=0?'#166534':'#b91c1c'}">₹${f(totNP)}</td>
  </tr>`;
}

// ══════════════════════════
// YEARLY SUMMARY
// ══════════════════════════
const MD_YEARLY=[
  {m:'Jan',s:2180000,ca:980000,tr:420000,ex:310000,tc:380000,rf:90000,pu:780000,fc:770000,op:85000,cl:92000,np:420000,tg:3200000},
  {m:'Feb',s:2340000,ca:1050000,tr:450000,ex:330000,tc:400000,rf:110000,pu:840000,fc:835000,op:92000,cl:88000,np:460000,tg:3200000},
  {m:'Mar',s:2590000,ca:1160000,tr:500000,ex:360000,tc:450000,rf:120000,pu:950000,fc:940000,op:88000,cl:95000,np:510000,tg:3300000},
  {m:'Apr',s:2870000,ca:1280000,tr:550000,ex:400000,tc:510000,rf:130000,pu:1060000,fc:1050000,op:95000,cl:102000,np:580000,tg:3300000},
  {m:'May',s:3603406,ca:1620000,tr:690000,ex:480000,tc:680000,rf:133406,pu:1393016,fc:1371949,op:102000,cl:110000,np:721770,tg:3317000},
];
function renderYearly(){ buildYearlySummary(); }
function buildYearlySummary(){
  const tY=document.getElementById('yrBody');if(!tY)return;tY.innerHTML='';
  let ys=0,yp=0,yf=0,yn=0;
  MD_YEARLY.forEach(d=>{ys+=d.s;yp+=d.pu;yf+=d.fc;yn+=d.np;
    const fc=(d.fc/d.s*100).toFixed(1),np=(d.np/d.s*100).toFixed(1);
    tY.innerHTML+=`<tr><td class="l"><b>${d.m}</b></td><td>${fr(d.s)}</td><td>${fr(d.pu)}</td><td>${fr(d.fc)}</td><td><span class="tag ${fc>37?'r':'g'}">${fc}%</span></td><td>${fr(d.np)}</td><td><span class="tag g">${np}%</span></td></tr>`;
  });
  tY.innerHTML+=`<tr class="tot-row"><td class="l"><b>YTD</b></td><td>${fr(ys)}</td><td>${fr(yp)}</td><td>${fr(yf)}</td><td>${(yf/ys*100).toFixed(1)}%</td><td>${fr(yn)}</td><td>${(yn/ys*100).toFixed(1)}%</td></tr>`;
}
// alias
function buildTables(){buildYearlySummary();}

// ══════════════════════════
// TARGET
// ══════════════════════════
const TARGET_SITES=['RC Express','Food Truck','Café','TCS','Events'];
function renderTarget(){
  const p=getGPeriod();
  const key=p.key;
  const sites=getPD('target',key,TARGET_SITES.map(()=>({t:0,w:p.days})));
  const tb=document.getElementById('tgtBody'),tf=document.getElementById('tgtFoot');
  if(!tb)return;
  const mSel=document.getElementById('tgtMonth');if(mSel)mSel.value=key;
  const asOf=document.getElementById('tgtAsOf');
  const daysEntered=(STORE.daily[key]||[]).filter(r=>calcRow(r).grand>0).length;
  tb.innerHTML='';let totTgt=0,totAch=0;
  const achData={'2026-01':[310000,420000,980000,380000,90000],'2026-02':[330000,450000,1050000,400000,110000],'2026-03':[360000,500000,1160000,450000,120000],'2026-04':[400000,550000,1280000,510000,130000],'2026-05':[480000,690000,1620000,680000,133406]};
  TARGET_SITES.forEach((site,i)=>{
    const row=sites[i];const tgt=row.t;const wd=row.w;
    const ach=(achData[key]||[])[i]||0;
    const dayTgt=wd>0?Math.round(tgt/wd):0;
    const perDay=daysEntered>0?Math.round(ach/daysEntered):0;
    const pctAch=tgt>0?(ach/tgt*100).toFixed(1):null;
    const pctDay=(dayTgt>0&&daysEntered>0)?(ach/(dayTgt*daysEntered)*100).toFixed(1):null;
    const isEvents=site==='Events';
    totTgt+=tgt;totAch+=ach;
    const pctAchHtml=pctAch===null?'<span style="color:#bbb">—</span>':`<span style="color:${parseFloat(pctAch)>=100?'#166534':parseFloat(pctAch)>=80?'#E8A020':'#b91c1c'};font-weight:700">${pctAch}%</span>`;
    const pctDayHtml=pctDay===null?'<span style="color:#bbb">—</span>':`<span style="color:${parseFloat(pctDay)>=100?'#166534':parseFloat(pctDay)>=80?'#E8A020':'#b91c1c'};font-weight:700">${pctDay}%</span>`;
    tb.innerHTML+=`<tr style="border-bottom:1px solid #ece9e3">
      <td style="padding:10px 16px;font-weight:700;font-size:13px">${site}</td>
      <td style="padding:8px 10px;text-align:right"><input type="number" value="${tgt}" min="0" onchange="getPD('target','${key}',TARGET_SITES.map(()=>({t:0,w:${p.days}})))[${i}].t=parseInt(this.value)||0;renderTarget()" style="width:120px;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;text-align:right;font-family:Inter,sans-serif;background:#f9f8f4"></td>
      <td style="padding:10px 14px;text-align:right;color:${ach>0?'#25a244':'#bbb'};font-weight:${ach>0?'700':'400'}">${ach>0?'₹'+f(ach):'<span style="color:#bbb">₹0</span>'}${isEvents&&ach>0?' <span style="font-size:10px;color:#888">(monthly)</span>':''}</td>
      <td style="padding:8px 10px;text-align:right"><input type="number" value="${wd}" min="0" max="31" onchange="getPD('target','${key}',TARGET_SITES.map(()=>({t:0,w:${p.days}})))[${i}].w=parseInt(this.value)||0;renderTarget()" style="width:70px;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;text-align:right;font-family:Inter,sans-serif;background:#f9f8f4"></td>
      <td style="padding:10px 14px;text-align:right;color:${daysEntered>0?'#1a73e8':'#bbb'};font-weight:700">${daysEntered}</td>
      <td style="padding:10px 14px;text-align:right;color:${dayTgt>0?'#555':'#bbb'}">${dayTgt>0?'₹'+f(dayTgt):'₹0'}</td>
      <td style="padding:10px 14px;text-align:right;color:${perDay>0?'#555':'#bbb'}">${perDay>0?'₹'+f(perDay):'₹0'}</td>
      <td style="padding:10px 14px;text-align:right">${pctAchHtml}</td>
      <td style="padding:10px 14px;text-align:right">${pctDayHtml}</td>
    </tr>`;
  });
  const totPctAch=totTgt>0?(totAch/totTgt*100).toFixed(1):null;
  tf.innerHTML=`<tr style="background:#fff8f0;font-weight:700;border-top:2px solid #d0cdc6">
    <td style="padding:10px 16px;font-size:12px">TOTAL</td>
    <td style="padding:10px 14px;text-align:right;color:#c44000;font-size:14px">₹${f(totTgt)}</td>
    <td style="padding:10px 14px;text-align:right;color:#25a244;font-size:14px">₹${f(totAch)}</td>
    <td colspan="4" style="padding:10px 14px;text-align:center;color:#888;font-size:11px">Gap: <b style="color:${totAch>=totTgt?'#166534':'#b91c1c'}">₹${f(totAch-totTgt)}</b></td>
    <td style="padding:10px 14px;text-align:right">${totPctAch?`<span style="color:${parseFloat(totPctAch)>=100?'#166534':parseFloat(totPctAch)>=80?'#E8A020':'#b91c1c'};font-weight:700">${totPctAch}%</span>`:'<span style="color:#bbb">—</span>'}</td>
    <td></td>
  </tr>`;
}
function copyFromPrev(){
  const p=getGPeriod();const key=p.key;
  let m=p.m-1,y=p.y;if(m<1){m=12;y--;}
  const prevKey=`${y}-${String(m).padStart(2,'0')}`;
  if(!STORE.target[prevKey]){alert('No previous month data.');return;}
  STORE.target[key]=STORE.target[prevKey].map(r=>({t:r.t,w:r.w}));
  renderTarget();flash('📋 Copied from '+MN_SHORT[m-1]+' '+y);
}
function saveTarget(){flash('💾 Target saved!');}

// ══════════════════════════
// EMPLOYEE INCENTIVE
// ══════════════════════════
const INC_SECTIONS=['Kitchen','Counter','Delivery','Manager','Accounts','Truck','Express','TCS'];
function renderIncentive(){
  const p=getGPeriod();const key=p.key;
  const pool=parseFloat(document.getElementById('incPool').value)||0;
  const daysInMonth=parseInt(document.getElementById('incDays').value)||p.days;
  const incDate=document.getElementById('incDate').value||`${p.y}-${String(p.m).padStart(2,'0')}-${String(p.days).padStart(2,'0')}`;
  const ym=incDate.slice(0,7);
  const EMPS=getPD('incentive',key,[]);
  const tb=document.getElementById('incTbody'),tf=document.getElementById('incFoot');
  if(!tb)return;
  const lbl=document.getElementById('incMonthLbl');if(lbl)lbl.textContent=p.label;
  tb.innerHTML='';let totalPayout=0;
  EMPS.forEach((emp,idx)=>{
    const calc=pool*emp.pct/100;const perDay=daysInMonth>0?calc/daysInMonth:0;
    const presentDays=daysInMonth-emp.leave;const proRated=perDay*presentDays;
    let finalInc;
    if(emp.absent)finalInc=0;
    else if(emp.fixInc!==''&&!isNaN(emp.fixInc))finalInc=parseFloat(emp.fixInc);
    else if(emp.mgrOverride!==''&&!isNaN(emp.mgrOverride))finalInc=parseFloat(emp.mgrOverride);
    else if(emp.actualInc!==''&&!isNaN(emp.actualInc))finalInc=parseFloat(emp.actualInc);
    else finalInc=proRated;
    totalPayout+=finalInc;
    const sOpts=INC_SECTIONS.map(s=>`<option${s===emp.section?' selected':''}>${s}</option>`).join('');
    tb.innerHTML+=`<tr style="border-bottom:1px solid #ece9e3;${emp.absent?'background:#fff5f5':''}">
      <td style="padding:7px 10px"><input value="${emp.name}" onchange="getPD('incentive','${key}',[])[${idx}].name=this.value" class="inc-inp" style="width:120px"></td>
      <td style="padding:7px 10px;color:#c44000;font-weight:600">${emp.code}</td>
      <td style="padding:7px 10px;text-align:right;color:#c44000;font-weight:700">₹${f(Math.round(finalInc))}</td>
      <td style="padding:7px 10px;text-align:center;color:#1a73e8">${ym}</td>
      <td style="padding:7px 10px;text-align:center;color:#1a73e8">${incDate}</td>
      <td style="padding:7px 10px;text-align:center"><select onchange="getPD('incentive','${key}',[])[${idx}].section=this.value;renderIncentive()" class="inc-inp">${sOpts}</select></td>
      <td style="padding:7px 10px;text-align:right"><input type="number" value="${emp.pct}" min="0" max="100" onchange="getPD('incentive','${key}',[])[${idx}].pct=parseFloat(this.value)||0;renderIncentive()" class="inc-inp" style="width:50px"></td>
      <td style="padding:7px 10px;text-align:right;background:#f0fdf4;color:#25a244;font-weight:700">₹${f(Math.round(calc))}</td>
      <td style="padding:7px 10px;text-align:right;background:#f0fdf4;color:#166534">₹${Math.round(perDay)}</td>
      <td style="padding:7px 10px;text-align:right"><input type="number" value="${emp.leave}" min="0" onchange="getPD('incentive','${key}',[])[${idx}].leave=parseInt(this.value)||0;renderIncentive()" class="inc-inp" style="width:50px"></td>
      <td style="padding:7px 10px;text-align:right;font-weight:600">${presentDays}</td>
      <td style="padding:7px 10px;text-align:right"><input type="number" value="${emp.actualInc!==''?emp.actualInc:Math.round(proRated)}" onchange="getPD('incentive','${key}',[])[${idx}].actualInc=this.value;renderIncentive()" class="inc-inp" style="width:80px;border-color:#c44000;color:#c44000;font-weight:700"></td>
      <td style="padding:7px 10px;text-align:center">
        <button onclick="toggleAbsent('${key}',${idx})" style="padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;border:none;background:${emp.absent?'#fee2e2':'#f0ede8'};color:${emp.absent?'#b91c1c':'#555'}">${emp.absent?'↩ Unmark':'🚫 Absent'}</button>
        <button onclick="removeEmployee('${key}',${idx})" style="padding:3px 8px;border-radius:4px;font-size:10px;font-weight:700;cursor:pointer;border:none;background:#fee2e2;color:#b91c1c;margin-left:3px">✕</button>
      </td>
    </tr>`;
  });
  tf.innerHTML=`<tr style="background:#fff8f0;font-weight:700;border-top:2px solid #d0cdc6">
    <td style="padding:10px;font-size:12px">TOTAL — ${EMPS.length} employee${EMPS.length!==1?'s':''}</td><td></td>
    <td style="padding:10px;text-align:right;color:#c44000;font-size:14px">₹${f(Math.round(totalPayout))}</td>
    <td colspan="10"></td>
  </tr>`;
  const el=document.getElementById('totalPayout');if(el)el.textContent='₹'+f(Math.round(totalPayout));
}
function toggleAbsent(key,idx){getPD('incentive',key,[])[idx].absent=!getPD('incentive',key,[])[idx].absent;renderIncentive();}
function removeEmployee(key,idx){if(!confirm('Remove?'))return;getPD('incentive',key,[]).splice(idx,1);renderIncentive();}
function addEmployee(){
  const p=getGPeriod();const key=p.key;
  getPD('incentive',key,[]).push({name:'New Employee',code:'',section:'Kitchen',pct:0,leave:0,absent:false,fixInc:'',mgrOverride:'',actualInc:''});
  renderIncentive();flash('✅ Employee added!');
}
function copyEmployees(){const p=getGPeriod();const emps=getPD('incentive',p.key,[]);const txt=emps.map(e=>`${e.name}\t${e.code}\t${e.section}\t${e.pct}%`).join('\n');navigator.clipboard.writeText(txt).then(()=>alert('Copied!')).catch(()=>alert('Copy failed'));}
function reopenSheet(){if(!confirm('Re-open sheet?'))return;flash('🔓 Sheet unlocked','#fff3e0','#8B3300');}
function downloadExcel(){
  const p=getGPeriod();const key=p.key;
  const pool=parseFloat(document.getElementById('incPool').value)||0;
  const daysInMonth=parseInt(document.getElementById('incDays').value)||p.days;
  const incDate=document.getElementById('incDate').value;
  const ym=incDate.slice(0,7);
  const EMPS=getPD('incentive',key,[]);
  const rows=[['Name','Emp Code','Incentive (₹)','Year-Month','Incentive Date','Section','%','Calculated (₹)','Per Day (₹)','Leave Days','Present Days','Actual Incentive (₹)']];
  let total=0;
  EMPS.forEach(emp=>{
    const calc=pool*emp.pct/100;const perDay=daysInMonth>0?calc/daysInMonth:0;const present=daysInMonth-emp.leave;const proRated=perDay*present;
    let fi=emp.absent?0:emp.fixInc!==''&&!isNaN(emp.fixInc)?parseFloat(emp.fixInc):emp.mgrOverride!==''&&!isNaN(emp.mgrOverride)?parseFloat(emp.mgrOverride):emp.actualInc!==''&&!isNaN(emp.actualInc)?parseFloat(emp.actualInc):proRated;
    total+=fi;rows.push([emp.name,emp.code,Math.round(fi),ym,incDate,emp.section,emp.pct+'%',Math.round(calc),Math.round(perDay),emp.leave,present,Math.round(fi)]);
  });
  rows.push([]);rows.push(['TOTAL','','₹'+Math.round(total),'','','','','','','','','₹'+Math.round(total)]);
  const csv='\uFEFF'+rows.map(r=>r.map(c=>{const s=String(c==null?'':c);return s.includes(',')?'"'+s+'"':s;}).join(',')).join('\r\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download=`RC_Incentive_${p.label.replace(' ','_')}.csv`;a.click();
  flash(`📥 Downloaded — ${EMPS.length} employees, Total ₹${Math.round(total).toLocaleString('en-IN')}`);
}
function sendWhatsApp(){
  const p=getGPeriod();const key=p.key;
  const pool=parseFloat(document.getElementById('incPool').value)||0;
  const daysInMonth=parseInt(document.getElementById('incDays').value)||p.days;
  const EMPS=getPD('incentive',key,[]);
  let msg=`*RC Employee Incentive — ${p.label}*\nPool: ₹${f(pool)} | Days: ${daysInMonth}\n\n`;
  EMPS.forEach(emp=>{
    const calc=pool*emp.pct/100;const perDay=daysInMonth>0?calc/daysInMonth:0;const present=daysInMonth-emp.leave;const proRated=perDay*present;
    let fi=emp.absent?0:emp.actualInc!==''&&!isNaN(emp.actualInc)?parseFloat(emp.actualInc):proRated;
    msg+=`👤 ${emp.name} (${emp.section}) — ₹${Math.round(fi).toLocaleString('en-IN')}\n`;
  });
  window.open('https://wa.me/?text='+encodeURIComponent(msg));
}

// ══════════════════════════
// CHARTS
// ══════════════════════════
function buildCharts(){
  // ── Update KPI cards ──
  const ytdS=MD_YEARLY.reduce((a,d)=>a+d.s,0);
  const ytdP=MD_YEARLY.reduce((a,d)=>a+d.pu,0);
  const ytdFC=MD_YEARLY.reduce((a,d)=>a+d.fc,0);
  const ytdNP=MD_YEARLY.reduce((a,d)=>a+d.np,0);
  const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  set('d-ytdSales','₹'+f(ytdS));
  set('d-ytdPur','₹'+f(ytdP));
  set('d-purPct',(ytdS?((ytdP/ytdS)*100).toFixed(2)+'% of Sales':''));
  set('d-ytdFC','₹'+f(ytdFC));
  set('d-fcPct','FC%: '+(ytdS?((ytdFC/ytdS)*100).toFixed(2)+'%':''));
  set('d-ytdNP','₹'+f(ytdNP));
  set('d-npPct','NP%: '+(ytdS?((ytdNP/ytdS)*100).toFixed(2)+'%':''));

  // ── Last closed day panel ──
  const p=getGPeriod();
  const todayRows=(STORE.daily[p.key]||[]).filter(r=>calcRow(r).grand>0);
  const lastRow=todayRows.length?todayRows[todayRows.length-1]:null;
  const lastD=lastRow?calcRow(lastRow):{date:'—',grand:0,cafeT:0,expT:0,truckT:0,tcsT:0,tcsu:0,tcsc:0,rcfT:0};
  set('d-lastDate', lastD.date!=='—'?'📍 Last Closed Day — '+lastD.date:'📍 No data entered yet');
  set('d-cafe',lastD.cafeT?'₹'+f(lastD.cafeT):'₹0');
  set('d-express',lastD.expT?'₹'+f(lastD.expT):'₹0');
  set('d-truck',lastD.truckT?'₹'+f(lastD.truckT):'₹0');
  set('d-tcs',(lastD.tcsT||0)+(lastD.tcsu||0)+(lastD.tcsc||0)?'₹'+f((lastD.tcsT||0)+(lastD.tcsu||0)+(lastD.tcsc||0)):'₹0');
  set('d-rcf',lastD.rcfT?'₹'+f(lastD.rcfT):'₹0');
  const lastTotal=lastD.grand||0;
  const tgt=parseInt((document.getElementById('pdTarget')||{value:'107000'}).value)||107000;
  set('d-lastTotal',lastTotal?'₹'+f(lastTotal):'₹0');
  set('d-perDayTgt','₹'+f(tgt));
  set('d-tgtAch',lastTotal?(lastTotal/tgt*100).toFixed(1)+'% achieved':'0.0% achieved');
  const missed=tgt-lastTotal;
  set('d-missed',missed>0?'₹'+f(missed):'₹0');
  // Progress bar
  const bar=document.getElementById('d-progressFill');
  if(bar)bar.style.width=Math.min(100,(lastTotal/tgt*100)).toFixed(1)+'%';

  const labs=MD_YEARLY.map(d=>d.m);
  const mk=(id,type,data,opts={})=>{const el=document.getElementById(id);if(!el)return;
    try{Chart.getChart(id)?.destroy();}catch(e){}
    new Chart(el,{type,data,options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{font:{family:'Inter',size:10},boxWidth:10,padding:6}}},...opts}});
  };
  const dv=(STORE.daily['2026-05']||[]).map(r=>calcRow(r).grand);
  mk('cDay','bar',{labels:(STORE.daily['2026-05']||[]).map(r=>r[0].slice(0,5)),datasets:[{label:'Sales',data:dv,backgroundColor:dv.map(v=>v>=107000?'#25a244':v>0?'#c44000':'#e0ddd6'),borderRadius:3},{label:'Target',data:Array(dv.length).fill(107000),type:'line',borderColor:'#8B4513',borderWidth:2,borderDash:[5,4],pointRadius:0,fill:false}]},{scales:{y:{ticks:{callback:v=>'₹'+(v/1000).toFixed(0)+'K',font:{size:10}}},x:{ticks:{font:{size:9}}}}});
  mk('cMS','bar',{labels:labs,datasets:[{label:'Sales',data:MD_YEARLY.map(d=>d.s),backgroundColor:'#E8A020',borderRadius:4}]},{plugins:{legend:{display:false}},scales:{y:{ticks:{callback:v=>(v/100000).toFixed(0)+'L',font:{size:10}}}}});
  mk('cLine','line',{labels:labs,datasets:[{label:'Sales',data:MD_YEARLY.map(d=>d.s),borderColor:'#25a244',backgroundColor:'rgba(37,162,68,0.07)',fill:true,tension:0.4,pointRadius:3},{label:'Food Cost',data:MD_YEARLY.map(d=>d.fc),borderColor:'#c44000',tension:0.4,fill:false,pointRadius:3},{label:'Net Profit',data:MD_YEARLY.map(d=>d.np),borderColor:'#1a73e8',tension:0.4,fill:false,pointRadius:3}]},{scales:{y:{ticks:{callback:v=>(v/100000).toFixed(1)+'L',font:{size:10}}}}});
  const fcv=MD_YEARLY.map(d=>+(d.fc/d.s*100).toFixed(2));
  mk('cFC','line',{labels:labs,datasets:[{label:'FC%',data:fcv,borderColor:'#c44000',backgroundColor:'rgba(196,64,0,0.07)',fill:true,tension:0.4,pointRadius:5,pointBackgroundColor:fcv.map(v=>v>37?'#c44000':'#25a244'),segment:{borderColor:ctx=>ctx.p1.raw>37?'#c44000':'#25a244'}}]},{plugins:{legend:{display:false}},scales:{y:{min:33,max:40,ticks:{callback:v=>v+'%',font:{size:10}}}}});
  const last=MD_YEARLY[MD_YEARLY.length-1];
  mk('cStore','doughnut',{labels:['Café','Truck','Express','TCS','RCF'],datasets:[{data:[last.ca,last.tr,last.ex,last.tc,last.rf],backgroundColor:['#c44000','#25a244','#1a73e8','#E8A020','#9CA3AF'],borderWidth:2,borderColor:'#fff'}]},{});
  mk('cInv','bar',{labels:labs,datasets:[{label:'Opening',data:MD_YEARLY.map(d=>d.op),backgroundColor:'#1a73e8',borderRadius:3},{label:'Closing',data:MD_YEARLY.map(d=>d.cl),backgroundColor:'#E8A020',borderRadius:3}]},{scales:{y:{ticks:{callback:v=>'₹'+(v/1000)+'K',font:{size:10}}}}});
  mk('cCost','bar',{labels:['YTD 2026'],datasets:[{label:'Food Cost',data:[ytdFC],backgroundColor:'#c44000',borderRadius:3},{label:'Other',data:[ytdS-ytdFC-ytdNP],backgroundColor:'#E8A020',borderRadius:3},{label:'Net Profit',data:[ytdNP],backgroundColor:'#25a244',borderRadius:3}]},{indexAxis:'y',scales:{x:{stacked:true,ticks:{callback:v=>(v/100000).toFixed(0)+'L',font:{size:10}}},y:{stacked:true}},plugins:{legend:{position:'bottom'}}});
}

// ══════════════════════════
// WA / EXPORT
// ══════════════════════════
function waText(){
  const p=getGPeriod();
  const tgt=parseInt((document.getElementById('pdTarget')||{value:107000}).value)||107000;

  // ── Yesterday's data: current date - 1 ──
  const yesterday=new Date();
  yesterday.setDate(yesterday.getDate()-1);
  const yyDD=String(yesterday.getDate()).padStart(2,'0');
  const yyMM=String(yesterday.getMonth()+1).padStart(2,'0');
  const yyYY=yesterday.getFullYear();
  const yesterdayStr=`${yyDD}/${yyMM}/${yyYY}`;
  const dayRows=(STORE.daily[p.key]||[]);
  const enteredRows=dayRows.filter(r=>calcRow(r).grand>0);
  // Find yesterday's row, fallback to last entered row
  const todayRow=dayRows.find(r=>r[0]===yesterdayStr&&calcRow(r).grand>0)
    || (enteredRows.length?enteredRows[enteredRows.length-1]:null);
  const td=todayRow?calcRow(todayRow):null;

  // ── Monthly totals ──
  const allGrand=enteredRows.map(r=>calcRow(r).grand);
  const monthTotal=allGrand.reduce((a,b)=>a+b,0);
  const entered=enteredRows.length;
  const avgDay=entered>0?Math.round(monthTotal/entered):0;
  const monthTgt=tgt*entered;
  const monthDiff=monthTotal-monthTgt;
  const monthAch=monthTgt>0?(monthTotal/monthTgt*100).toFixed(1):0;

  // ── YTD ──
  const ytdS=MD_YEARLY.reduce((a,d)=>a+d.s,0);
  const ytdFC=MD_YEARLY.reduce((a,d)=>a+d.fc,0);
  const ytdNP=MD_YEARLY.reduce((a,d)=>a+d.np,0);

  // ── WhatsApp uses monospace with backtick blocks for tables ──
  // Line builder: pad to fixed width
  const pad=(str,n,right=false)=>{
    const s=String(str);
    return right?s.padStart(n):s.padEnd(n);
  };
  const line=(a,b,c2)=>`${pad(a,14)} ${pad(b,12,true)} ${pad(c2||'',10,true)}`;
  const divider='─'.repeat(38);

  let msg='';
  msg+=`🍽 *Rolling Crunchys — Daily MIS*\n`;
  msg+=`📅 *${p.label}*  |  🎯 Target: ₹${f(tgt)}/day\n`;
  msg+=`\`\`\`\n`;

  // ── TODAY's unit-wise sales ──
  if(td){
    const reportDate=todayRow[0]===yesterdayStr?yesterdayStr:todayRow[0];
    const isYesterday=todayRow[0]===yesterdayStr;
    msg+=`📍 *Sales Report: ${yesterdayStr} (Yesterday)*\n`;
    if(!isYesterday) msg+=`_(Last available: ${todayRow[0]})_\n`;
    msg+=divider+'\n';
    msg+=line('Store','Sales','vs Tgt')+'\n';
    msg+=divider+'\n';
    const stores=[
      ['☕ Café',    td.cafeT],
      ['🚐 Express', td.expT],
      ['🚚 Truck',   td.truckT],
      ['🏢 TCS',     (td.tcsT||0)+(td.tcsu||0)+(td.tcsc||0)],
      ['📦 RCF',     td.rcfT],
    ];
    stores.forEach(([name,val])=>{
      if(val>0) msg+=line(name,'₹'+f(val),'')+'\n';
    });
    msg+=divider+'\n';
    const todayDiff=td.grand-tgt;
    const todayAch=(td.grand/tgt*100).toFixed(1);
    msg+=line('TOTAL','₹'+f(td.grand),todayAch+'%')+'\n';
    msg+=line('Target','₹'+f(tgt),(todayDiff>=0?'+':'')+f(todayDiff))+'\n';
    msg+=line('Status',td.grand>=tgt?'✅ MET':'❌ MISSED','')+'\n';
    msg+='\n';
  } else {
    msg+=`📍 No sales entered for yesterday (${yesterdayStr})\n\n`;
  }

  // ── MONTH summary ──
  msg+=`📊 ${p.label} — ${entered} Days\n`;
  msg+=divider+'\n';
  msg+=line('Total Sales','₹'+f(monthTotal),'')+'\n';
  msg+=line('Avg/Day','₹'+f(avgDay),'')+'\n';
  msg+=line('Month Target','₹'+f(monthTgt),'')+'\n';
  msg+=line('Achieved',monthAch+'%',(monthDiff>=0?'+':'')+f(monthDiff))+'\n';
  msg+='\n';

  // ── TARGET vs ACTUAL per day (last 5 entered days) ──
  if(enteredRows.length>0){
    msg+=`📈 Recent Days — Tgt ₹${f(tgt)}\n`;
    msg+=divider+'\n';
    msg+=`${pad('Date',12)} ${pad('Sales',10,true)} ${pad('Ach%',6,true)} ${pad('Diff',8,true)}\n`;
    msg+=divider+'\n';
    const recent=enteredRows.slice(-5);
    recent.forEach(r=>{
      const d=calcRow(r);
      const ach=(d.grand/tgt*100).toFixed(0)+'%';
      const diff=(d.grand>=tgt?'+':'')+f(d.grand-tgt);
      msg+=`${pad(r[0].slice(0,10),12)} ${pad('₹'+f(d.grand),10,true)} ${pad(ach,6,true)} ${pad(diff,8,true)}\n`;
    });
    msg+='\n';
  }

  // ── YTD ──
  msg+=`📦 YTD Summary (2026)\n`;
  msg+=divider+'\n';
  msg+=line('Sales','₹'+f(ytdS),'')+'\n';
  msg+=line('Food Cost','₹'+f(ytdFC),(ytdS?(ytdFC/ytdS*100).toFixed(1)+'%':''))+'\n';
  msg+=line('Net Profit','₹'+f(ytdNP),(ytdS?(ytdNP/ytdS*100).toFixed(1)+'%':''))+'\n';
  msg+='`\`\`\n';
  // ── Link to daily sales ──
  // WhatsApp only hyperlinks a URL that is:
  // 1. On its own line
  // 2. Starts with https://
  // 3. Has NO surrounding text on same line
  const hostedBase=getHostedURL().split('#')[0];
  const pageUrl=hostedBase+'#pg-dailysales';
  const isLocal=pageUrl.startsWith('file://') || pageUrl.startsWith('blob:');
  msg+=`\n`;
  msg+=`📊 *View Full Daily Sales Report*\n`;
  if(isLocal){
    msg+=`\n⚠️ Set a hosted URL for clickable links\n`;
    msg+=`_(Tap 🔗 Set URL button in the app)_\n`;
  } else {
    // URL must be alone on its own line — no prefix, no suffix
    msg+=`\n`;
    msg+=pageUrl;
    msg+=`\n`;
  }
  msg+=`\n\n_Sent from RC MIS · ${new Date().toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})}_`;

  window.open('https://wa.me/?text='+encodeURIComponent(msg));
}
function getHostedURL(){
  return localStorage.getItem('rcHostedURL') || window.location.href;
}

function setHostedURL(){
  const current = localStorage.getItem('rcHostedURL') || '';
  const url = prompt(
    '🔗 Enter your hosted URL for WhatsApp links\n\n' +
    'Example: https://rc-mis.vercel.app\n' +
    'Or leave blank to use current page URL\n\n' +
    'Current: ' + (current || 'not set'),
    current
  );
  if(url === null) return; // cancelled
  if(url.trim()) {
    localStorage.setItem('rcHostedURL', url.trim());
    flash('✅ URL saved: ' + url.trim(), '#dcfce7', '#166534');
  } else {
    localStorage.removeItem('rcHostedURL');
    flash('🔗 URL cleared — using page URL', '#fff3e0', '#8B3300');
  }
}

function waLink(){
  const base = getHostedURL().split('#')[0];
  const url = base + '#pg-dailysales';
  // URL must be on its own line for WhatsApp to hyperlink it
  const waMsg = '*RC MIS — Daily Sales*\n' +
    '📊 View full report here:\n' +
    '\n' +
    url +
    '\n';
  window.open('https://wa.me/?text=' + encodeURIComponent(waMsg));
}
function exportJSON(){const blob=new Blob([JSON.stringify({store:STORE},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='RC_MIS_Full.json';a.click();}


// ══════════════════════════
// PERIOD SELECTOR INIT
// ══════════════════════════
function initPeriodSelectors(){
  const now = new Date();
  // Use actual current date: May 2026
  const curY = 2026, curM = 5;

  // Populate gYear if needed
  const gY = document.getElementById('gYear');
  if(gY && !gY.value) gY.value = curY;

  // Populate gMonth
  const gM = document.getElementById('gMonth');
  if(gM) gM.value = curM;

  // Populate all section month selectors with same options
  const monthSels = ['dsMonth','consMonth','incMonth','salesMonth','invMonth','purMonth','fcPMonth','miMonth'];
  const yearSels  = ['dsYear','consYear','incYear','salesYear','invYear','purYear','fcPYear','miYear'];

  monthSels.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = '';
    MN.forEach((name,i)=>{
      const opt = document.createElement('option');
      opt.value = i+1;
      opt.textContent = name;
      if(i+1 === curM) opt.selected = true;
      el.appendChild(opt);
    });
  });

  yearSels.forEach(id=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.innerHTML = '';
    [2025,2026,2027].forEach(y=>{
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      if(y === curY) opt.selected = true;
      el.appendChild(opt);
    });
  });

  // Update label
  const lbl = document.getElementById('gPeriodLabel');
  if(lbl) lbl.textContent = MN[curM-1]+' '+curY;
}

// renderDailySales = rebuildDaily (section uses its own month/year selectors)
function renderDailySales(){ rebuildDaily(); }

// Sync global selectors → section selectors
function syncSectionSelectors(p){
  const monthSels = ['dsMonth','consMonth','incMonth','salesMonth','invMonth','purMonth','fcPMonth','miMonth'];
  const yearSels  = ['dsYear','consYear','incYear','salesYear','invYear','purYear','fcPYear','miYear'];
  const allMonthSels=['dsMonth','consMonth','incMonth','salesMonth','invMonth','purMonth','fcPMonth','miMonth'];
  const allYearSels=['dsYear','consYear','incYear','salesYear','invYear','purYear','fcPYear','miYear'];
  allMonthSels.forEach(id=>{const el=document.getElementById(id);if(el)el.value=p.m;});
  allYearSels.forEach(id=>{const el=document.getElementById(id);if(el)el.value=p.y;});
  // Update period labels
  ['dsPeriodLbl','consPeriodLbl','incPeriodLbl','salesPeriodLbl','invPeriodLbl','purPeriodLbl','fcPPeriodLbl','miPeriodLbl'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=p.label;});
  // Also sync target month selector
  const tgtM = document.getElementById('tgtMonth');
  if(tgtM){
    for(let o of tgtM.options){
      if(o.value===p.key){tgtM.value=p.key;break;}
    }
  }
  // Sync incentive date
  const incDate = document.getElementById('incDate');
  if(incDate) incDate.value = `${p.y}-${String(p.m).padStart(2,'0')}-${String(p.days).padStart(2,'0')}`;
  // Sync incentive days
  const incDays = document.getElementById('incDays');
  if(incDays) incDays.value = p.days;
}


// ── Section-level period getters ──
function getSectionPeriod(mId, yId){
  const m = parseInt((document.getElementById(mId)||{value:'5'}).value)||5;
  const y = parseInt((document.getElementById(yId)||{value:'2026'}).value)||2026;
  const days = new Date(y,m,0).getDate();
  const key = `${y}-${String(m).padStart(2,'0')}`;
  return {m,y,days,key,label:MN[m-1]+' '+y,short:MN_SHORT[m-1]+' '+y};
}
function getSalesPeriod(){ return getSectionPeriod('salesMonth','salesYear'); }
function getInvPeriod(){   return getSectionPeriod('invMonth','invYear'); }
function getPurPeriod(){   return getSectionPeriod('purMonth','purYear'); }
function getFCPeriod(){    return getSectionPeriod('fcPMonth','fcPYear'); }
function getMIPeriod(){    return getSectionPeriod('miMonth','miYear'); }


function closeModal(id){
  const el=document.getElementById(id);
  if(el)el.classList.remove('show');
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.modal-overlay').forEach(m=>{
    m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show');});
  });
});


function liveUpdate(key, idx, fieldIdx, val){
  const DAYS=getPD('daily',key,()=>[]);
  if(!DAYS[idx])return;
  DAYS[idx][2+fieldIdx]=parseInt(val)||0;
  // Recalc the totals in that row without full rebuild
  const d=calcRow(DAYS[idx]);
  const tgt=parseInt((document.getElementById('pdTarget')||{value:107000}).value)||107000;
  const tr=document.getElementById('dsrow-'+idx);
  if(!tr)return;
  // Update total cells (positions in the row)
  const cells=tr.querySelectorAll('td');
  // cafeT at index 5, expT at 8, truckT at 11, tcsT at 14, grand at 19, avg at 20
  const setCell=(i,html)=>{if(cells[i])cells[i].innerHTML=html;};
  const zt=v=>v===0?'<span style="color:#1a4fd6;opacity:.4">0</span>':`<b style="color:#1a4fd6">${f(v)}</b>`;
  setCell(5,zt(d.cafeT));
  setCell(8,zt(d.expT));
  setCell(11,zt(d.truckT));
  setCell(14,zt(d.tcsT));
  const isZero=d.grand===0;
  const met=!isZero&&d.grand>=tgt;
  const delta=d.grand-tgt;
  const gc=met?'color:#166534;font-weight:700':'color:#b91c1c;font-weight:700';
  setCell(19,isZero?'<span style="color:#bbb">₹0</span>':'₹'+f(d.grand));
  setCell(20,isZero?'<span style="color:#bbb">—</span>':'₹'+f(d.grand));
  setCell(21,'₹'+f(tgt));
  setCell(22,`<span style="${isZero?'color:#bbb':gc}">${isZero?'—':(d.grand/tgt*100).toFixed(1)+'%'}</span>`);
  setCell(23,`<span style="${isZero?'color:#bbb':gc}">${isZero?'—':(delta>=0?'+':'')+f(delta)}</span>`);
  setCell(24,`<span style="${isZero?'color:#bbb':gc}">${isZero?'—':(delta>=0?'+':'-')+(Math.abs(delta/tgt)*100).toFixed(1)+'%'}</span>`);
  const statusHtml=isZero?'<span style="color:#bbb;font-size:11px">—</span>':met?'<span class="tag g" style="font-size:11px">✅ Met</span>':'<span class="tag r" style="font-size:11px">✕ Miss</span>';
  setCell(25,statusHtml);
}

function saveInlineRow(key,idx){
  const DAYS=getPD('daily',key,()=>[]);
  if(!DAYS[idx])return;
  // Values already saved via liveUpdate - just rebuild to show read-only
  const d=calcRow(DAYS[idx]);
  if(d.grand>0){
    rebuildDaily();
    flash('✅ Day saved — ₹'+f(d.grand));
  }
}

// ══════════════════════════
// INIT
// ══════════════════════════
initPeriodSelectors();
onGlobalChange();
rebuildDaily();
buildSalesReport();
buildInventory();
buildPurchase();
buildFoodCost();
renderMonthlyInput();
renderConsumption();
buildYearlySummary();
setTimeout(renderTarget,100);
setTimeout(renderIncentive,150);

