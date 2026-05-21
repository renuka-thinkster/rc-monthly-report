# RC MIS — Delta Update (2026-05-19)

## What changed from previous build

### Files to replace in your existing rc-mis project:

| File | Change |
|------|--------|
| `public/rc-functions.js` | All JS updated — waText, waLink, setHostedURL, getHostedURL, buildSalesReport, renderConsumption, daily sales fixes |
| `app/page.tsx` | Updated body HTML + better onLoad init |
| `app/globals.css` | Modal CSS fixes |
| `lib/store.ts` | Updated data store |
| `lib/functions.ts` | Updated functions |

## How to apply delta

```bash
# Copy these files into your existing rc-mis folder:
cp -r rc-mis-delta/* rc-mis/

# Rebuild
cd rc-mis
npm run build
npm start
```

## Key changes in this delta

- ✅ WA Text Summary — shows yesterday's (date-1) unit-wise sales
- ✅ WA Text Summary — tabular monospace format with all columns
- ✅ WA link — URL on its own line for WhatsApp to hyperlink it
- ✅ 🔗 Set URL button — save hosted URL in localStorage for WA links
- ✅ Sales Report — no month dropdown, all 12 months stacked with Edit/Save
- ✅ Product Consumption — month/year selector working correctly
- ✅ Edit Saved Entries — modal fixed, inline edit for empty rows
- ✅ Daily Sales — empty rows directly editable, live total update
- ✅ Modal CSS — modals hidden by default (display:none fix)
- ✅ Dashboard KPI cards — live YTD data
