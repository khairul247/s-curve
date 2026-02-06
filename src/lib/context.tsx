"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";
import { format } from "date-fns";
import type {
  DataRow,
  ProjectConfig,
  SCurveDataPoint,
  ChartSeries,
  ChartSettings,
} from "./types";
import {
  generateDateIntervals,
  computeChartData,
  type IntervalType,
} from "./calculations";

const today = format(new Date(), "yyyy-MM-dd");

// Sample data: 200 findings to complete over ~4 weeks (weekly intervals)
// Plan forms an S-curve: slow start, ramp up, taper off. Total = 200.
const sampleRows: DataRow[] = [
  { date: "2026-02-02", actual: 8, plan: 10 },
  { date: "2026-02-08", actual: 18, plan: 20 },
  { date: "2026-02-09", actual: 30, plan: 35 },
  { date: "2026-02-16", actual: 0, plan: 45 },
  { date: "2026-02-23", actual: 0, plan: 40 },
  { date: "2026-03-01", actual: 0, plan: 30 },
  { date: "2026-03-02", actual: 0, plan: 20 },
];

export type UnitType = "percentage" | "value";

export interface SCurveState {
  projectConfig: ProjectConfig;
  rows: DataRow[];
  chartData: SCurveDataPoint[];
  series: ChartSeries[];
  chartSettings: ChartSettings;
  intervalType: IntervalType;
  unitType: UnitType;
}

type SCurveAction =
  | { type: "SET_PROJECT_CONFIG"; payload: Partial<ProjectConfig> }
  | { type: "SET_ROWS"; payload: DataRow[] }
  | { type: "UPDATE_ROW"; payload: { index: number; field: "actual" | "plan"; value: number } }
  | { type: "SET_INTERVAL_TYPE"; payload: IntervalType }
  | { type: "SET_UNIT_TYPE"; payload: UnitType }
  | { type: "SET_CHART_SETTINGS"; payload: Partial<ChartSettings> }
  | { type: "REGENERATE_ROWS" }
  | { type: "TOGGLE_SERIES"; payload: string }
  | { type: "SET_CHART_DATA"; payload: SCurveDataPoint[] };

const defaultSeries: ChartSeries[] = [
  { key: "planned", label: "Planned", color: "var(--chart-1)", visible: true },
  { key: "actual", label: "Actual", color: "var(--chart-2)", visible: true },
];

const initialState: SCurveState = {
  projectConfig: {
    projectName: "Audit Findings Remediation",
    startDate: "2026-02-02",
    endDate: "2026-03-02",
    todayDate: today,
    totalItems: 200,
  },
  rows: sampleRows,
  chartData: [],
  series: defaultSeries,
  chartSettings: {
    title: "S-Curve",
    xLabel: "Date",
    yLabel: "Cumulative Progress",
    xRange: {
      start: "",
      end: "",
    },
    colors: {
      planned: "#f59e0b",
      actual: "#0ea5a4",
    },
  },
  intervalType: "weekly",
  unitType: "value",
};

function regenerateRows(
  startDate: string,
  endDate: string,
  intervalType: IntervalType,
  existingRows: DataRow[]
): DataRow[] {
  const dates = generateDateIntervals(startDate, endDate, intervalType);
  const existingMap = new Map(existingRows.map((r) => [r.date, r]));

  return dates.map((date) => {
    const existing = existingMap.get(date);
    return existing ?? { date, actual: 0, plan: 0 };
  });
}

function reducer(state: SCurveState, action: SCurveAction): SCurveState {
  switch (action.type) {
    case "SET_PROJECT_CONFIG":
      return {
        ...state,
        projectConfig: { ...state.projectConfig, ...action.payload },
      };
    case "SET_ROWS":
      return { ...state, rows: action.payload };
    case "UPDATE_ROW": {
      const { index, field, value } = action.payload;
      const newRows = [...state.rows];
      newRows[index] = { ...newRows[index], [field]: value };
      return { ...state, rows: newRows };
    }
    case "SET_INTERVAL_TYPE":
      return { ...state, intervalType: action.payload };
    case "SET_UNIT_TYPE":
      return { ...state, unitType: action.payload };
    case "SET_CHART_SETTINGS":
      return {
        ...state,
        chartSettings: {
          ...state.chartSettings,
          ...action.payload,
          colors: {
            ...state.chartSettings.colors,
            ...action.payload.colors,
          },
        },
      };
    case "REGENERATE_ROWS": {
      const newRows = regenerateRows(
        state.projectConfig.startDate,
        state.projectConfig.endDate,
        state.intervalType,
        state.rows
      );
      return { ...state, rows: newRows };
    }
    case "TOGGLE_SERIES":
      return {
        ...state,
        series: state.series.map((s) =>
          s.key === action.payload ? { ...s, visible: !s.visible } : s
        ),
      };
    case "SET_CHART_DATA":
      return { ...state, chartData: action.payload };
    default:
      return state;
  }
}

interface SCurveContextType {
  state: SCurveState;
  dispatch: React.Dispatch<SCurveAction>;
}

const SCurveContext = createContext<SCurveContextType | null>(null);

export function SCurveProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Recalculate chart data when rows, unitType, or totalItems change
  useEffect(() => {
    const chartData = computeChartData(
      state.rows,
      state.unitType,
      state.projectConfig.totalItems,
      state.projectConfig.todayDate
    );
    dispatch({ type: "SET_CHART_DATA", payload: chartData });
  }, [
    state.rows,
    state.unitType,
    state.projectConfig.totalItems,
    state.projectConfig.todayDate,
  ]);

  return (
    <SCurveContext.Provider value={{ state, dispatch }}>
      {children}
    </SCurveContext.Provider>
  );
}

export function useSCurve() {
  const context = useContext(SCurveContext);
  if (!context) {
    throw new Error("useSCurve must be used within SCurveProvider");
  }
  return context;
}
