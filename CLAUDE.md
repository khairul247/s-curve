# S-Curve Generator

## Overview
A web app for generating project S-curves (cumulative progress charts). Users pick a date range and interval, a spreadsheet-style table is generated, and they fill in per-period Plan and Actual values. Cumulative columns auto-calculate and the S-curve chart updates live.

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **UI**: shadcn/ui components (Tailwind CSS v4)
- **Charts**: Recharts via shadcn chart component
- **Date handling**: date-fns
- **State**: React Context + useReducer (no external state library)

## Commands
- `npm run dev` - Start dev server (Turbopack)
- `npm run build` - Production build
- `npm run lint` - ESLint

## Project Structure
```
src/
  app/
    layout.tsx          - Root layout, wraps app in SCurveProvider
    page.tsx            - Main page (two-column: data left, chart right)
    globals.css         - Tailwind + shadcn CSS variables
  components/
    ui/                 - shadcn generated components (do not edit manually)
    header.tsx          - App title
    date-picker.tsx     - Reusable date picker (Popover + Calendar)
    project-config-form.tsx - Project name, dates, interval, generate button
    data-table.tsx      - Editable spreadsheet (Date, Actual, Actual Cum, Plan, Plan Cum)
    s-curve-chart.tsx   - The main chart (LineChart with planned + actual curves)
    chart-controls.tsx  - Toggle series visibility
  lib/
    types.ts            - TypeScript interfaces (DataRow, ProjectConfig, etc.)
    calculations.ts     - generateDateIntervals, computeChartData, computeCumulatives
    context.tsx         - SCurveProvider, useSCurve hook, reducer, sample data
    utils.ts            - shadcn cn() utility
```

## Architecture
- All state lives in `SCurveProvider` (context.tsx) via `useReducer`
- User sets start date, end date, interval → clicks "Generate Date Rows" → rows created
- User fills in per-period Actual and Plan values in the data table
- Cumulative columns auto-sum (running total)
- Chart data auto-recalculates from rows via `computeChartData()`
- When date range/interval changes and rows regenerate, existing data is preserved for matching dates
