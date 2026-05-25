# Rolling Crunchys — Daily & Monthly MIS

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Build for production

```bash
npm run build
npm start
```

## Structure

```
rc-mis/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main MIS page (client component)
│   └── globals.css       # All styles
├── lib/
│   ├── store.ts          # Central data store (STORE object)
│   └── functions.ts      # All render functions
├── public/
│   └── rc-functions.js   # Client-side JS bundle
└── package.json
```

## Features

- Dashboard with live KPI cards and 7 charts
- ① Sales Monthly Report (all 12 months, per-store)
- ② Inventory Opening & Closing (per site × month)
- ③ Purchase (all 12 months, YTD total)
- ④ Food Cost (auto-derived from inventory + purchase)
- ⑤ Target by Site (RC Express, Food Truck, Café, TCS, Events)
- Daily Sales (unit-wise, date × payment mode)
- Product Consumption (with deviation tracking)
- Employee Incentive Sheet
- Monthly Input (derived + manual)
- Yearly Summary
- Admin authorization

## Data

All data is stored in `public/rc-functions.js` in the `STORE` object.
Pre-loaded with Jan–May 2026 actual data for Rolling Crunchys, Infocity Bhubaneswar.
