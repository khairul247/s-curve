# S-Curve Generator

A client‑side S‑curve dashboard for comparing **planned vs actual** progress over time. Upload Excel/CSV, edit values in a table, and export the chart as PNG. No backend required.

---

## What This App Does

- Generates and visualizes S‑curves for project progress.
- Accepts Excel/CSV uploads with **Config** + **Project Data** sheets.
- Lets users edit actual/plan values in the table after import.
- Supports value or percentage modes.
- Allows chart customization (title, axis labels, legend colors, X‑axis range).
- Exports the chart as a PNG.

---

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS** + shadcn UI primitives
- **Recharts** for charts
- **xlsx** for Excel/CSV parsing (client‑side)
- **html-to-image** for PNG export

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

---

## Scripts

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run production server
- `npm run lint` — lint

---

## How It Works (High Level)

1. **Project Configuration** defines dates, interval type, unit type, and total items.
2. **Import Excel/CSV** loads data into memory using `xlsx`.
3. **Project Data** table is editable; updates recalculate chart data immediately.
4. **Chart** uses cumulative values. It hides future actuals (after today date).
5. **Export** button converts chart DOM to PNG (client‑side).

Everything runs in the browser. No data leaves the user’s machine.

---

## Excel/CSV Import Format

The importer expects **two sheets**:

### Sheet 1 — Config (first sheet)
Two columns: `field`, `value`.

Supported fields:

| field        | value example     | notes |
|--------------|-------------------|-------|
| projectName  | Sample Project    | Optional |
| totalItems   | 200               | Used for % conversion |
| startDate    | 2026-02-01         | ISO date |
| endDate      | 2026-03-02         | ISO date |
| todayDate    | 2026-02-08         | Used to hide future actuals |
| intervalType | daily             | `daily | weekly | monthly` |
| unitType     | value             | `value | percentage` |

### Sheet 2 — Project Data (second sheet)

Columns:

| column             | description |
|--------------------|-------------|
| date               | `YYYY-MM-DD` |
| actual             | per‑period progress value |
| actual cumulative  | optional; used to derive actual if `actual` missing |
| plan               | per‑period planned value |
| plan cumulative    | optional; used to derive plan if `plan` missing |

Minimum required:
- `date`
- one of `actual` or `actual cumulative`
- one of `plan` or `plan cumulative`

If only cumulative columns are present, per‑period values are derived automatically.

---

## Sample Files

Sample Excel files live in the repo root:

- `sample-s-curve.xlsx`
- `sample-s-curve-30-days.xlsx`
- `sample-s-curve-30-days-with-total.xlsx`

The `*-with-total` file contains a `Config` sheet + `Project Data` sheet and is the best import example.

---

## UI Overview

### Project Configuration
- Set `projectName`, `startDate`, `endDate`, `todayDate`.
- Choose interval and unit type.
- Set total items when using value mode.
- Import Excel/CSV is embedded here.

### Project Data
- Table of all date rows.
- **Actual** inputs are disabled for dates after `todayDate`.
- Cumulative actuals also stop after today.

### Chart
- Toggle series, Y‑axis unit, and edit chart settings.
- Configure title, axis labels, legend colors, and X‑axis range.
- Download PNG from chart header.

---

## Key Files & Architecture

```
src/
  app/
    layout.tsx         # App shell, fonts, provider
    page.tsx           # Main layout
    globals.css        # Theme tokens + base styles

  components/
    header.tsx                 # Title + Help dialog
    help-guide-dialog.tsx      # Usage + import format guide
    project-config-form.tsx    # Project form + import
    data-import-card.tsx       # Import UI logic
    data-table.tsx             # Editable rows
    s-curve-chart.tsx          # Chart + tooltip + export
    chart-controls.tsx         # Series toggles + axis toggle + export
    chart-settings-dialog.tsx  # Title/axes/colors/range

  lib/
    context.tsx         # Global state + reducer
    calculations.ts     # Date intervals + cumulative + chart values
    importer.ts         # Excel/CSV parsing
    types.ts            # Shared types
```

### Data Flow

- `ProjectConfigForm` updates context state.
- `DataImportCard` parses Excel -> dispatches rows + config.
- `computeChartData()` derives cumulative values (and hides future actuals).
- Chart consumes `chartData` + `chartSettings`.

---

## Exporting PNG

The chart uses `html-to-image` to export the rendered chart DOM as a PNG. It’s triggered from the **Download PNG** button in the chart header. All work happens client‑side.

---

## Common Issues / Troubleshooting

### Percent shows 100% too early
- Ensure `totalItems` in Config is the correct total.
- Percent = cumulative / totalItems * 100.

### Import fails
- Make sure the workbook has **two sheets**.
- Sheet 1 must be config, sheet 2 must be data.
- Ensure required columns exist in Project Data.

### Actual values appear blank
- Actual values after `todayDate` are intentionally hidden.

---

## Build From Scratch (Checklist)

1. Create Next.js app with App Router.
2. Add Tailwind CSS + shadcn UI components.
3. Add `recharts`, `xlsx`, `html-to-image` dependencies.
4. Implement context state:
   - project config
   - rows
   - chart settings
   - series
5. Implement Excel parser using `xlsx`:
   - config sheet (first)
   - data sheet (second)
6. Build chart with cumulative computations and date filtering.
7. Add chart settings + export button.
8. Add editable data table.
9. Add help/guide dialog.

---

## License

This repo is currently unlicensed. Add a license if you plan to distribute.

---

## Deployment

Typical flow:

```bash
npm install
npm run lint
npm run build
npm run start
```

If deploying on Vercel, the defaults should work without changes.
