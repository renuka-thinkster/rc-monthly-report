'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function Home() {
useEffect(() => {
    const init = async () => {
      const w = window as any
      if (typeof w.initPeriodSelectors !== 'function') return

      // Load saved data from the database FIRST
      if (typeof w.loadFromServer === 'function') {
        await w.loadFromServer()
      }

      w.initPeriodSelectors()
      w.onGlobalChange()
      w.rebuildDaily()
      w.buildSalesReport()
      w.buildInventory()
      w.buildPurchase()
      w.buildFoodCost()
      w.renderMonthlyInput()
      w.renderConsumption()
      w.buildYearlySummary()
      setTimeout(() => w.renderTarget?.(), 100)
      setTimeout(() => w.renderIncentive?.(), 150)
    }
    const timer = setTimeout(init, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"
        strategy="beforeInteractive"
      />
      <Script src="/rc-functions.js" strategy="afterInteractive" />
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }} />
    </>
  )
}

const bodyHTML = `
<!-- MODALS -->
<div class="modal-ov" id="modConfirm"><div class="modal"><div class="modal-icon">🔐</div><div class="modal-title">Admin Action Required</div><div class="modal-sub">Edit saved entries? Only Admin can modify locked data.</div><div class="modal-btns"><button class="mbtn cancel" onclick="closeModal('modConfirm')">✕ Cancel</button><button class="mbtn warn" onclick="doEnableEdit()">✓ Yes, Edit</button></div></div></div>
<div class="modal-ov" id="modSave"><div class="modal"><div class="modal-icon">💾</div><div class="modal-title">Save Changes?</div><div class="modal-sub" id="modSaveSub">Save edits?</div><div class="modal-btns"><button class="mbtn cancel" onclick="closeModal('modSave')">✕ Cancel</button><button class="mbtn ok" onclick="doSaveRow()">💾 Save</button></div></div></div>

<!-- HEADER -->
<!-- MODALS -->
<div class="modal-overlay" id="modalConfirmEdit">
  <div class="modal">
    <div class="modal-icon">🔐</div>
    <div class="modal-title">Admin Action Required</div>
    <div class="modal-sub">You are about to <b>edit saved daily sales entries</b>.<br>This is restricted to <b>Admin</b> only. Are you sure?</div>
    <div class="modal-row">
      <button class="modal-btn cancel" onclick="closeModal('modalConfirmEdit')">✕ Cancel</button>
      <button class="modal-btn confirm" onclick="enableEditMode()">✓ Yes, Edit</button>
    </div>
  </div>
</div>
<div class="modal-overlay" id="modalNotAuth">
  <div class="modal">
    <div class="modal-icon">🚫</div>
    <div class="modal-title">Access Denied</div>
    <div class="modal-sub">Only <b>Admin</b> users can edit saved entries.</div>
    <div class="modal-row"><button class="modal-btn ok" onclick="closeModal('modalNotAuth')">OK</button></div>
  </div>
</div>
<div class="modal-overlay" id="modalSaveRow">
  <div class="modal">
    <div class="modal-icon">💾</div>
    <div class="modal-title">Save Changes?</div>
    <div class="modal-sub" id="modalSaveRowSub">Save edits for this date?</div>
    <div class="modal-row">
      <button class="modal-btn cancel" onclick="closeModal('modalSaveRow')">✕ Cancel</button>
      <button class="modal-btn ok" onclick="confirmSaveRow()">💾 Save</button>
    </div>
  </div>
</div>

<div class="hdr">
  <div class="hdr-logo">RC</div>
  <div><div class="hdr-title">Rolling Crunchys — Daily &amp; Monthly MIS</div><div class="hdr-sub">RC Month Report (input) → Monthly Input (derived + manual) → Yearly Summary &amp; Dashboard</div></div>
</div>

<!-- CTRL BAR -->
<div class="ctrl">
  <span>🏢</span><select id="outletSel"><option>RC (Rolling Crunchys)</option></select>
  <span style="font-size:12px;color:#666">Year:</span>
  <select id="globalYear" onchange="onYearChange(this.value)">
    <option value="2026">2026</option><option value="2027">2027</option><option value="2025">2025</option>
  </select>
  <button class="btn btn-gray" style="font-size:11px">+ Year</button>
  <span style="width:1px;height:20px;background:#ddd;margin:0 4px"></span>
  <span style="font-size:11px;color:#888">🏢 RC &nbsp;·&nbsp; 👤 <b style="color:#1a73e8">tushar336@gmail.com</b> (admin) &nbsp;·&nbsp; <a href="#" style="color:#666;text-decoration:none">Logout</a></span>
  <div style="margin-left:auto;display:flex;gap:5px;flex-wrap:wrap">
    <button class="btn btn-dark" onclick="saveAll()">💾 Save</button>
    <button class="btn btn-outline" onclick="exportJSON()">📤 Export JSON</button>
    <button class="btn btn-outline" onclick="importJSON()">📥 Import JSON</button>
    <button class="btn btn-green" onclick="waText()">💬 WA — Text Summary</button>
    <button class="btn btn-blue" onclick="waLink()">🔗 WA — Data Link</button>
    <button class="btn btn-gray" onclick="window.print()">🖨️ Print/PDF</button>
    <button class="btn btn-gray" onclick="requestEdit()">🔓 Edit Past Data</button>
  </div>
</div>

<!-- NAV -->
<!-- GLOBAL MONTH/YEAR SELECTOR -->
<div style="background:#fff3e0;border-bottom:1px solid #f0c890;padding:7px 18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
  <span style="font-size:12px;font-weight:700;color:#8B3300">📅 Active Period:</span>
  <select id="gYear" onchange="onGlobalChange()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif;background:#fff"><option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option>
  </select>
  <select id="gMonth" onchange="onGlobalChange()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif;background:#fff">
    <option value="1">January</option><option value="2">February</option><option value="3">March</option>
    <option value="4">April</option><option value="5" selected>May</option><option value="6">June</option>
    <option value="7">July</option><option value="8">August</option><option value="9">September</option>
    <option value="10">October</option><option value="11">November</option><option value="12">December</option>
  </select>
  <span id="gPeriodLabel" style="font-size:12px;font-weight:700;color:#c44000;background:#ffe0c0;padding:3px 12px;border-radius:20px">May 2026</span>
  <span style="font-size:11px;color:#888">← All sections show data for this period</span>
  <div style="margin-left:auto;display:flex;gap:6px">
    <button onclick="prevPeriod()" style="padding:4px 10px;border-radius:5px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid #d0a060;background:#fff;color:#8B3300">◀ Prev</button>
    <button onclick="nextPeriod()" style="padding:4px 10px;border-radius:5px;font-size:12px;font-weight:700;cursor:pointer;border:1px solid #d0a060;background:#fff;color:#8B3300">Next ▶</button>
  </div>
</div>
<div class="nav-wrap"><div class="nav-row">
  <button class="nav-tab" onclick="showTab('dashboard',this)">📊 Dashboard</button>
  <div class="nav-div"></div>
  <span class="nav-sec-lbl">RC MONTH REPORT:</span>
  <button class="nav-tab" onclick="showTab('sales',this)">① Sales</button>
  <button class="nav-tab" onclick="showTab('inventory',this)">② Inventory</button>
  <button class="nav-tab" onclick="showTab('purchase',this)">③ Purchase</button>
  <button class="nav-tab" onclick="showTab('foodcost',this)">④ Food Cost</button>
  <button class="nav-tab" onclick="showTab('target',this)">⑤ Target</button>
  <div class="nav-div"></div>
  <span class="nav-sec-lbl">DAILY:</span>
  <button class="nav-tab active" onclick="showTab('dailysales',this)">📅 Daily Sales</button>
  <button class="nav-tab" onclick="showTab('consumption',this)">📦 Product Consumption</button>
  <button class="nav-tab" onclick="showTab('incentive',this)">💰 Employee Incentive</button>
  <div class="nav-div"></div>
  <span class="nav-sec-lbl">DERIVED:</span>
  <button class="nav-tab" onclick="showTab('monthly',this)">Monthly Input</button>
  <button class="nav-tab" onclick="showTab('yearly',this)">Yearly Summary</button>
  <div class="nav-div"></div>
  <span class="nav-sec-lbl">ADMIN:</span>
  <button class="nav-tab" onclick="showTab('authorize',this)">🛡️ Authorize</button>
</div></div>

<div class="main">

<!-- DASHBOARD -->
<div class="pg" id="pg-dashboard">
  <div class="sec-title">📊 Dashboard — Visual KPIs</div>
  <div class="sec-info">Live charts driven by all entered data across months.</div>
  <div class="kpi-grid">
    <div class="kpi" style="--ac:#c44000"><div class="kpi-lbl">YTD Sales</div><div class="kpi-val" id="d-ytdSales">₹0</div></div>
    <div class="kpi" style="--ac:#1a73e8"><div class="kpi-lbl">YTD Purchase</div><div class="kpi-val" id="d-ytdPur">₹0</div><div class="kpi-sub" id="d-purPct"></div></div>
    <div class="kpi" style="--ac:#E63946"><div class="kpi-lbl">YTD Food Cost</div><div class="kpi-val" id="d-ytdFC">₹0</div><div class="kpi-sub" id="d-fcPct"></div></div>
    <div class="kpi" style="--ac:#25a244"><div class="kpi-lbl">YTD Net Profit</div><div class="kpi-val" id="d-ytdNP" style="color:#25a244">₹0</div><div class="kpi-sub" id="d-npPct" style="color:#25a244;font-weight:600"></div></div>
  </div>

  <!-- Last Closed Day Panel -->
  <div style="background:#fff;border:1px solid #d0cdc6;border-radius:8px;overflow:hidden">
    <div style="padding:10px 16px;font-size:13px;font-weight:700;border-bottom:1px solid #e5e2dc;color:#c44000" id="d-lastDate">📍 Last Closed Day — </div>
    <div style="display:grid;grid-template-columns:repeat(5,1fr);border-bottom:1px solid #e5e2dc">
      <div style="padding:10px 14px;border-right:1px solid #e5e2dc;text-align:center"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">Café</div><div style="font-family:Barlow,sans-serif;font-size:17px;font-weight:800;color:#bbb" id="d-cafe">₹0</div></div>
      <div style="padding:10px 14px;border-right:1px solid #e5e2dc;text-align:center"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">RC Express</div><div style="font-family:Barlow,sans-serif;font-size:17px;font-weight:800;color:#bbb" id="d-express">₹0</div></div>
      <div style="padding:10px 14px;border-right:1px solid #e5e2dc;text-align:center"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">Truck</div><div style="font-family:Barlow,sans-serif;font-size:17px;font-weight:800;color:#bbb" id="d-truck">₹0</div></div>
      <div style="padding:10px 14px;border-right:1px solid #e5e2dc;text-align:center"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">TCS</div><div style="font-family:Barlow,sans-serif;font-size:17px;font-weight:800;color:#bbb" id="d-tcs">₹0</div></div>
      <div style="padding:10px 14px;text-align:center"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">RCF</div><div style="font-family:Barlow,sans-serif;font-size:17px;font-weight:800;color:#bbb" id="d-rcf">₹0</div></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr">
      <div style="padding:12px 18px;border-right:1px solid #e5e2dc;position:relative"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">Last Closed Day — Total</div><div style="font-family:Barlow,sans-serif;font-size:20px;font-weight:800" id="d-lastTotal">₹0</div><div style="font-size:11px;color:#888;margin-top:2px">Excludes RCF</div></div>
      <div style="padding:12px 18px;border-right:1px solid #e5e2dc"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">Per-Day Target</div><div style="font-family:Barlow,sans-serif;font-size:20px;font-weight:800" id="d-perDayTgt">₹1,07,000</div><div style="font-size:11px;color:#888;margin-top:2px" id="d-tgtAch">0.0% achieved</div></div>
      <div style="padding:12px 18px;position:relative"><div style="font-size:10px;font-weight:700;color:#888;text-transform:uppercase;margin-bottom:3px">Missed vs Target</div><div style="font-family:Barlow,sans-serif;font-size:20px;font-weight:800;color:#c44000" id="d-missed">₹1,07,000</div></div>
    </div>
  </div>
  <div class="chart-row">
    <div class="chart-card"><div class="chart-title">📅 Day-wise Sales vs Target</div><div class="chart-wrap"><canvas id="cDay"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">📆 Monthly Sales</div><div class="chart-wrap"><canvas id="cMS"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">Sales · Food Cost · Net Profit</div><div class="chart-wrap"><canvas id="cLine"></canvas></div></div>
  </div>
  <div class="chart-row">
    <div class="chart-card"><div class="chart-title">🔴🟢 % Food Cost MoM</div><div class="chart-wrap"><canvas id="cFC"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">🥧 YTD Sales by Store</div><div class="chart-wrap"><canvas id="cStore"></canvas></div></div>
    <div class="chart-card"><div class="chart-title">📦 Inventory Open vs Close</div><div class="chart-wrap"><canvas id="cInv"></canvas></div></div>
  </div>
  <div class="chart-row one"><div class="chart-card"><div class="chart-title">💼 Cost Composition YTD</div><div class="chart-wrap sm"><canvas id="cCost"></canvas></div></div></div>
</div>

<!-- SALES -->
<div class="pg" id="pg-sales">
  <div class="sec-title">① Total Sales Monthly Report</div>
  <div class="sec-info">Per month per store: enter <b>Order Count</b> (Dining, Home Delivery) and <b>Amount</b> (Dining, Home Delivery, Credit Sales, FOC). Total Orders, Avg/day, Row Total and Month Sub-Total are auto-computed.</div>
  <div style="display:flex;gap:14px;font-size:11px;color:#888;align-items:center;margin-bottom:4px">
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:10px;background:#fffbe8;border:1px solid #ddd;border-radius:2px"></span>Manual entry</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:10px;background:#f0fdf4;border:1px solid #ddd;border-radius:2px"></span>Auto-calculated</span>
    <span style="display:flex;align-items:center;gap:4px"><span style="display:inline-block;width:10px;height:10px;background:#6B1500;border:1px solid #ddd;border-radius:2px"></span>Month band</span>
  </div>
  <div class="panel" style="padding:0;overflow:hidden" id="salesPanel"></div>
</div>

<!-- INVENTORY -->
<div class="pg" id="pg-inventory">
  <div class="sec-title">② Inventory — Opening &amp; Closing</div>
  <div class="month-bar" style="background:#fff;border:1px solid #e0ddd6;border-radius:6px;padding:9px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    <span style="font-size:12px;font-weight:700;color:#8B3300">📅 Period:</span>
    <select id="invMonth" onchange="buildInventory()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <option value="1">January</option><option value="2">February</option><option value="3">March</option>
      <option value="4">April</option><option value="5" selected>May</option><option value="6">June</option>
      <option value="7">July</option><option value="8">August</option><option value="9">September</option>
      <option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
    <select id="invYear" onchange="buildInventory()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option></select>
    <span id="invPeriodLbl" style="font-size:12px;font-weight:700;color:#c44000;background:#ffe0c0;padding:3px 12px;border-radius:20px">May 2026</span>
    <button class="btn btn-orange" onclick="saveAll()" style="margin-left:auto">💾 Save</button>
    
  </div>
  <div class="sec-info">Per site × per month: enter Starting and Closing Inventory value (₹). Total row is auto-summed.</div>
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="invHead"></thead><tbody id="invBody"></tbody><tfoot id="invFoot"></tfoot></table></div>
  </div>
</div>

<!-- PURCHASE -->
<div class="pg" id="pg-purchase">
  <div class="sec-title">③ Total Value of New Purchase</div>
  <div class="month-bar" style="background:#fff;border:1px solid #e0ddd6;border-radius:6px;padding:9px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    <span style="font-size:12px;font-weight:700;color:#8B3300">📅 Period:</span>
    <select id="purMonth" onchange="buildPurchase()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <option value="1">January</option><option value="2">February</option><option value="3">March</option>
      <option value="4">April</option><option value="5" selected>May</option><option value="6">June</option>
      <option value="7">July</option><option value="8">August</option><option value="9">September</option>
      <option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
    <select id="purYear" onchange="buildPurchase()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option></select>
    <span id="purPeriodLbl" style="font-size:12px;font-weight:700;color:#c44000;background:#ffe0c0;padding:3px 12px;border-radius:20px">May 2026</span>
    <button class="btn btn-orange" onclick="saveAll()" style="margin-left:auto">💾 Save</button>
    
  </div>
  <div class="sec-info">Enter Total New Purchase value (₹) per month.</div>
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="purHead"></thead><tbody id="purBody"></tbody></table></div>
  </div>
  <div class="note-box"><b>Note:</b> Purchase data flows into Food Cost calculation and Monthly Input.</div>
</div>

<!-- FOOD COST -->
<div class="pg" id="pg-foodcost">
  <div class="sec-title">④ Actual Food Cost &amp; % Food Cost</div>
  <div class="month-bar" style="background:#fff;border:1px solid #e0ddd6;border-radius:6px;padding:9px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    <span style="font-size:12px;font-weight:700;color:#8B3300">📅 Period:</span>
    <select id="fcPMonth" onchange="buildFoodCost()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <option value="1">January</option><option value="2">February</option><option value="3">March</option>
      <option value="4">April</option><option value="5" selected>May</option><option value="6">June</option>
      <option value="7">July</option><option value="8">August</option><option value="9">September</option>
      <option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
    <select id="fcPYear" onchange="buildFoodCost()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option></select>
    <span id="fcPPeriodLbl" style="font-size:12px;font-weight:700;color:#c44000;background:#ffe0c0;padding:3px 12px;border-radius:20px">May 2026</span>
    
  </div>
  <div class="note-box"><b>Actual Food Cost</b> = Starting Inventory + Total Value of New Purchase – Ending Inventory<br><b>% Food Cost</b> = Actual Food Cost × 100 / Sales (Turnover)</div>
  <div class="sec-info">All values are <b>auto-derived</b> from sheets ②③ and ① (no manual entry).</div>
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="fcHead"></thead><tbody id="fcBody"></tbody></table></div>
  </div>
</div>

<!-- TARGET -->
<div class="pg" id="pg-target">
  <div class="sec-title">⑤ Target — By Site</div>
  <div class="sec-info"><b>Day Target</b> = Target ÷ Working Days &nbsp;·&nbsp; <b>Per Day Sales</b> = Achieved ÷ Days Entered &nbsp;·&nbsp; <b>% Achieved</b> = Achieved × 100 ÷ Target &nbsp;·&nbsp; <b>% Day Target</b> = on-pace measure (100% = exactly on track).</div>
  <div class="month-bar">
    <span style="font-weight:600;color:#555">Month:</span>
    <select id="tgtMonth" onchange="renderTarget()"></select>
    <select id="tgtYear" onchange="renderTarget()"></select>
    <span style="font-size:12px;color:#555">As-of:</span>
    <input type="date" id="tgtAsOf" value="2026-05-17" onchange="renderTarget()" style="padding:5px 8px;border:1.5px solid #c44000;border-radius:5px;font-size:12px;font-family:Inter,sans-serif">
    <button class="btn btn-gray" onclick="copyTargetFromPrev()">📋 Copy from prev</button>
    <span class="lock-badge open">✏️ Editable</span>
    <button class="btn btn-orange" onclick="saveAll()" style="margin-left:auto">💾 Save</button>
  </div>
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="tgtHead"></thead><tbody id="tgtBody"></tbody><tfoot id="tgtFoot"></tfoot></table></div>
  </div>
</div>

<!-- DAILY SALES -->
<div class="pg active" id="pg-dailysales">
  <div class="sec-title">📅 Daily Sales — Unit-wise (Date × Payment Mode)</div>
  <div class="sec-info">Track daily turnover per unit broken down by payment method. <b>Δ vs Target</b> shows daily achievement. Admin only can edit saved entries.</div>

  <!-- Auth bar -->
  <div class="auth-bar">
    <span>🔒</span>
    <span class="auth-badge">👤 tushar336@gmail.com &nbsp;·&nbsp; Admin</span>
    <span id="editModeInd" style="display:none;color:#c44000;font-weight:700;font-size:11px">✏️ Edit Mode Active — click ✏️ on any row</span>
    <span style="margin-left:auto;font-size:11px;color:#555">Edit: <b style="color:#25a244">Permitted (Admin)</b></span>
  </div>

  <!-- Toolbar -->
  <div class="panel" style="padding:10px 16px">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <label style="font-size:12px;font-weight:600;color:#555">Month:</label>
      <select id="dsMonth" onchange="rebuildDaily()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif;background:#fff3e0;color:#8B3300">
        <option value="1">January</option><option value="2">February</option><option value="3">March</option>
        <option value="4">April</option><option value="5" selected>May</option><option value="6">June</option>
        <option value="7">July</option><option value="8">August</option><option value="9">September</option>
        <option value="10">October</option><option value="11">November</option><option value="12">December</option>
      </select>
      <select id="dsYear" onchange="rebuildDaily()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
        <option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option>
      </select>
      <label style="font-size:12px;font-weight:600;color:#555">Per-Day Target ₹:</label>
      <input type="number" id="pdTarget" value="107000" onchange="rebuildDaily()" style="width:110px;padding:5px 9px;border:1.5px solid #c44000;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <button class="btn btn-orange" onclick="addDayRow()">+ Add Day</button>
      <button class="btn btn-gray" id="editSavedBtn" onclick="requestEditSaved()">📋 Edit Saved Entries</button>
      <button class="btn" id="exitEditBtn" style="display:none;background:#fee2e2;color:#b91c1c;border:1px solid #fca5a5" onclick="exitEditMode()">✕ Exit Edit Mode</button>
      <div style="margin-left:auto;font-size:12px;color:#666" id="ytdInfo">— days entered</div>
    </div>
  </div>

  <!-- Table -->
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap">
      <table class="ds-table" id="dsMainTable">
        <thead>
          <tr class="h1">
            <th rowspan="2" style="text-align:left;background:#f5f3ee;min-width:90px;padding:7px 10px">DATE</th>
            <th rowspan="2" style="text-align:center;background:#f5f3ee;min-width:45px;padding:7px 6px">DAY</th>
            <th colspan="4" class="th-cafe">CAFÉ</th>
            <th colspan="3" class="th-express">RC EXPRESS</th>
            <th colspan="3" class="th-truck">TRUCK</th>
            <th colspan="5" class="th-tcs">TCS</th>
            <th colspan="2" class="th-rcf">RCF</th>
            <th class="th-summary" style="font-weight:800;min-width:95px">GRAND TOTAL</th>
            <th class="th-summary" style="background:#e8f5e9!important;color:#166534!important;font-weight:800;min-width:85px">AVG/DAY</th>
            <th class="th-tgt" style="font-weight:800;min-width:85px">TARGET</th>
            <th class="th-tgt" style="font-weight:800;min-width:60px">ACH%</th>
            <th class="th-diff" style="font-weight:800;min-width:75px">DIFF ₹</th>
            <th class="th-diff" style="font-weight:800;min-width:60px">DIFF%</th>
            <th class="th-summary" style="min-width:70px">STATUS</th>
            <th rowspan="2" class="th-summary" style="min-width:60px;padding:7px 8px">ACTION</th>
          </tr>
          <tr class="h2">
            <th class="th-cafe">UPI</th><th class="th-cafe">ONLINE</th><th class="th-cafe">CASH</th><th class="th-cafe" style="font-weight:800;color:#8B4500">TOTAL</th>
            <th class="th-express">UPI</th><th class="th-express">CASH</th><th class="th-express" style="font-weight:800;color:#1a5a8a">TOTAL</th>
            <th class="th-truck">UPI</th><th class="th-truck">CASH</th><th class="th-truck" style="font-weight:800;color:#1a5a2a">TOTAL</th>
            <th class="th-tcs">TCS-1</th><th class="th-tcs">TCS-2</th><th class="th-tcs" style="font-weight:800;color:#8B1a1a">TOTAL</th><th class="th-tcs">UPI</th><th class="th-tcs">CASH</th>
            <th class="th-rcf">UPI</th><th class="th-rcf">CASH</th>
            <th class="th-summary"></th><th style="background:#e8f5e9!important"></th>
            <th class="th-tgt"></th><th class="th-tgt"></th><th class="th-diff"></th><th class="th-diff"></th><th class="th-summary"></th>
          </tr>
        </thead>
        <tbody id="dsTbody"></tbody>
        <tfoot id="dsFoot"></tfoot>
      </table>
    </div>
  </div>
</div>

<!-- PRODUCT CONSUMPTION -->
<div class="pg" id="pg-consumption">
  <div class="sec-title">📦 Product Consumption Report</div>
  <div class="sec-info">Per month, per product: enter <b>site usage</b> (Café · Truck · Express · TCS) plus <b>Opening Stock, Store Purchase, Wastage, Staff Food, Closing Stock</b>.<br><b>Deviation</b> = (Opening + Purchase) − (Total + Wastage + Staff Food + Closing). Cells turn <b style="color:#b91c1c">red</b> when |Deviation| &gt; 5 kg.</div>
  <div class="month-bar">
    <span style="font-weight:600;color:#555">Month:</span>
    <select id="consMonth" onchange="renderConsumption()"><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5" selected>May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
    <select id="consYear" onchange="renderConsumption()"><option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option></select>
    <span class="lock-badge open">✏️ Editable</span>
    <button class="btn btn-orange" onclick="saveAll()">💾 Save</button>
    <button class="btn btn-orange" onclick="addConsItem()" style="margin-left:auto">+ Add Item</button>
  </div>
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="consHead"></thead><tbody id="consTbody"></tbody></table></div>
  </div>
</div>

<!-- EMPLOYEE INCENTIVE -->
<div class="pg" id="pg-incentive">
  <div class="sec-title">💰 Employee Incentive Sheet</div>
  <div class="sec-info"><b>Creator</b> adds employees, sets Leave days, marks Absent. <b>Fix Incentive</b> overrides all calculation. <b>Manager</b> enters Total Incentive pool &amp; %.<br>Final = Absent→0 · Fix Incentive · Mgr Override · Pro-rated (Per Day × Present Days). Once ✅ Approved, sheet is locked.</div>
  <div class="month-bar">
    <span style="font-weight:600;color:#555">Month:</span>
    <select id="incMonth" onchange="renderIncentive()"><option value="1">January</option><option value="2">February</option><option value="3">March</option><option value="4">April</option><option value="5" selected>May</option><option value="6">June</option><option value="7">July</option><option value="8">August</option><option value="9">September</option><option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
    <select id="incYear" onchange="renderIncentive()"><option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option></select>
    <span style="background:#dcfce7;color:#166534;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700">✅ Approved</span>
    <button class="btn btn-orange" onclick="addEmployee()">+ Add Employee</button>
    <button class="btn btn-gray" onclick="copyEmployees()">📋 Copy Employees</button>
    <button class="btn" style="background:#fde8d0;color:#8B3300;border:1px solid #f0c090" onclick="reopenSheet()">🔓 Re-open</button>
    <button class="btn btn-green" onclick="downloadExcel()">📥 Excel</button>
    <button class="btn btn-green" onclick="sendWAInc()">💬 WhatsApp</button>
    <span style="margin-left:auto;font-size:12px;font-weight:700">Total Payout: <span id="totalPayout" style="color:#c44000">₹0</span></span>
  </div>
  <div class="panel" style="padding:10px 16px">
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="display:flex;align-items:center;gap:6px"><label style="font-size:12px;font-weight:600;color:#555">Pool (₹):</label><input type="number" id="incPool" value="30000" onchange="renderIncentive()" style="width:90px;padding:5px 8px;border:1px solid #ccc;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif"></div>
      <div style="display:flex;align-items:center;gap:6px"><label style="font-size:12px;font-weight:600;color:#555">Days in month:</label><input type="number" id="incDays" value="31" onchange="renderIncentive()" style="width:60px;padding:5px 8px;border:1px solid #ccc;border-radius:5px;font-size:13px;font-family:Inter,sans-serif"></div>
      <div style="display:flex;align-items:center;gap:6px"><label style="font-size:12px;font-weight:600;color:#555">Incentive Date:</label><input type="date" id="incDate" value="2026-05-31" style="padding:5px 8px;border:1px solid #ccc;border-radius:5px;font-size:12px;font-family:Inter,sans-serif"></div>
    </div>
  </div>
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="incHead"></thead><tbody id="incTbody"></tbody><tfoot id="incFoot"></tfoot></table></div>
  </div>
</div>

<!-- MONTHLY INPUT -->
<div class="pg" id="pg-monthly">
  <div class="sec-title">📋 Monthly Input — Derived &amp; Manual</div>
  <div class="month-bar" style="background:#fff;border:1px solid #e0ddd6;border-radius:6px;padding:9px 16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">
    <span style="font-size:12px;font-weight:700;color:#8B3300">📅 Period:</span>
    <select id="miMonth" onchange="renderMonthlyInput()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif">
      <option value="1">January</option><option value="2">February</option><option value="3">March</option>
      <option value="4">April</option><option value="5" selected>May</option><option value="6">June</option>
      <option value="7">July</option><option value="8">August</option><option value="9">September</option>
      <option value="10">October</option><option value="11">November</option><option value="12">December</option></select>
    <select id="miYear" onchange="renderMonthlyInput()" style="padding:5px 9px;border:1px solid #d0a060;border-radius:5px;font-size:13px;font-weight:700;font-family:Inter,sans-serif"><option value="2025">2025</option><option value="2026" selected>2026</option><option value="2027">2027</option></select>
    <span id="miPeriodLbl" style="font-size:12px;font-weight:700;color:#c44000;background:#ffe0c0;padding:3px 12px;border-radius:20px">May 2026</span>
    
  </div>
  <div class="sec-info"><b>Sales, Purchase, Food Cost</b> are auto-derived. <b>Staff Food, Dump, Maintenance, Other Income</b> are entered manually.</div>

  <div style="display:flex;gap:4px;margin-bottom:-1px">
    <span style="padding:5px 14px;font-size:11px;font-weight:600;color:#888;background:#f5f3ee;border:1px solid #ddd;border-bottom:none;border-radius:4px 4px 0 0">Auto-derived</span>
    <span style="padding:5px 14px;font-size:11px;font-weight:600;color:#666;background:#fffbe8;border:1px solid #ddd;border-bottom:none;border-radius:4px 4px 0 0;margin-left:4px">Manual entry</span>
  </div>
  <div class="panel" style="padding:0;border-radius:0 6px 6px 6px;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="miHead"></thead><tbody id="miBody"></tbody><tfoot id="miFoot"></tfoot></table></div>
  </div>
</div>

<!-- YEARLY SUMMARY -->
<div class="pg" id="pg-yearly">
  <div class="sec-title">📈 Yearly Summary</div>
  <div class="month-bar">
    <span style="font-weight:600;color:#555">Year:</span>
    <select id="yrYear" onchange="renderYearly()"></select>
  </div>
  <div class="kpi-grid" id="yrKpis" style="margin-bottom:4px"></div>
  <div class="panel" style="padding:0;overflow:hidden">
    <div class="tbl-wrap"><table><thead id="yrHead"></thead><tbody id="yrBody"></tbody><tfoot id="yrFoot"></tfoot></table></div>
  </div>
</div>

<!-- AUTHORIZE -->
<div class="pg" id="pg-authorize">
  <div class="sec-title">🛡️ Authorize</div>
  <div class="panel"><div style="font-weight:700;margin-bottom:12px">Authorized Users</div>
    <div class="tbl-wrap"><table><thead><tr><th class="l">Email</th><th class="l">Role</th><th class="l">Access</th></tr></thead>
    <tbody><tr><td class="l">tushar336@gmail.com</td><td class="l"><span class="tag o">Admin</span></td><td class="l">Full Access</td></tr></tbody></table></div>
    <br><div class="form-grid"><div class="fg"><label>Email</label><input type="email" placeholder="user@example.com"></div><div class="fg"><label>Role</label><select><option>Viewer</option><option>Editor</option><option>Admin</option></select></div></div>
    <br><button class="save-btn">+ Add User</button>
  </div>
</div>

</div><!-- /main -->
`