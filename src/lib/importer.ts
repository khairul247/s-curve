import { format, isValid, parseISO } from "date-fns";
import type { WorkSheet } from "xlsx";
import * as XLSX from "xlsx";
import type { DataRow, ProjectConfig } from "./types";
import type { IntervalType } from "./calculations";
import type { UnitType } from "./context";

export interface ImportResult {
  rows: DataRow[];
  startDate: string;
  endDate: string;
  config: Partial<ProjectConfig>;
  intervalType?: IntervalType;
  unitType?: UnitType;
}

const headerAliases = {
  date: ["date", "day", "period"],
  actual: ["actual", "actual value", "actuals"],
  actualCumulative: [
    "actual cumulative",
    "actual cum",
    "actual cum.",
    "actual_cumulative",
    "actual cumulative value",
  ],
  plan: ["plan", "planned", "plan value"],
  planCumulative: [
    "plan cumulative",
    "planned cumulative",
    "plan cum",
    "planned cum",
    "plan_cumulative",
  ],
};

type RawRow = {
  date: string;
  actual?: number;
  plan?: number;
  actualCumulative?: number;
  planCumulative?: number;
};

const normalizeHeader = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const parseNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (value === null || value === undefined) return 0;
  const cleaned = String(value).replace(/[^0-9.+-]/g, "");
  const parsed = parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseDateValue = (value: unknown): string | null => {
  if (value instanceof Date && isValid(value)) {
    return format(value, "yyyy-MM-dd");
  }

  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed && parsed.y && parsed.m && parsed.d) {
      const date = new Date(parsed.y, parsed.m - 1, parsed.d);
      if (isValid(date)) return format(date, "yyyy-MM-dd");
    }
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    let date = parseISO(trimmed);
    if (!isValid(date)) {
      date = new Date(trimmed);
    }
    if (isValid(date)) return format(date, "yyyy-MM-dd");
  }

  return null;
};

const diffFromCumulative = (values: number[]) =>
  values.map((value, index) =>
    index === 0 ? value : value - values[index - 1]
  );

export function parseSheetToRows(sheet: WorkSheet): ImportResult {
  const raw = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];

  if (raw.length < 2) {
    throw new Error("The uploaded file does not contain any data rows.");
  }

  const headers = raw[0].map(normalizeHeader);
  const findHeader = (aliases: string[]) =>
    headers.findIndex((header) => aliases.includes(header));

  const dateIndex = findHeader(headerAliases.date);
  const actualIndex = findHeader(headerAliases.actual);
  const actualCumIndex = findHeader(headerAliases.actualCumulative);
  const planIndex = findHeader(headerAliases.plan);
  const planCumIndex = findHeader(headerAliases.planCumulative);

  if (dateIndex === -1) {
    throw new Error("Missing a 'date' column in the uploaded file.");
  }
  if (actualIndex === -1 && actualCumIndex === -1) {
    throw new Error("Missing an 'actual' or 'actual cumulative' column.");
  }
  if (planIndex === -1 && planCumIndex === -1) {
    throw new Error("Missing a 'plan' or 'plan cumulative' column.");
  }

  const rawRows: RawRow[] = raw
    .slice(1)
    .map((row): RawRow | null => {
      const date = parseDateValue(row[dateIndex]);
      if (!date) return null;
      return {
        date,
        actual: actualIndex === -1 ? undefined : parseNumber(row[actualIndex]),
        plan: planIndex === -1 ? undefined : parseNumber(row[planIndex]),
        actualCumulative:
          actualCumIndex === -1 ? undefined : parseNumber(row[actualCumIndex]),
        planCumulative:
          planCumIndex === -1 ? undefined : parseNumber(row[planCumIndex]),
      };
    })
    .filter((row): row is RawRow => row !== null);

  if (rawRows.length === 0) {
    throw new Error("No valid date rows were found in the uploaded file.");
  }

  rawRows.sort((a, b) => a.date.localeCompare(b.date));

  const actualValues =
    actualIndex !== -1
      ? rawRows.map((row) => row.actual ?? 0)
      : diffFromCumulative(
          rawRows.map((row) => row.actualCumulative ?? 0)
        );

  const planValues =
    planIndex !== -1
      ? rawRows.map((row) => row.plan ?? 0)
      : diffFromCumulative(rawRows.map((row) => row.planCumulative ?? 0));

  const rows: DataRow[] = rawRows.map((row, index) => ({
    date: row.date,
    actual: Math.round(actualValues[index] * 100) / 100,
    plan: Math.round(planValues[index] * 100) / 100,
  }));

  return {
    rows,
    startDate: rows[0].date,
    endDate: rows[rows.length - 1].date,
    config: {},
  };
}

export async function parseExcelFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: true });
  const configSheetName = workbook.SheetNames[0];
  const dataSheetName = workbook.SheetNames[1];
  const configSheet = workbook.Sheets[configSheetName];
  const dataSheet = workbook.Sheets[dataSheetName];

  if (!dataSheet) {
    throw new Error("The uploaded file does not contain a worksheet.");
  }
  const dataResult = parseSheetToRows(dataSheet);

  if (!configSheet) {
    return dataResult;
  }

  const configRows = XLSX.utils.sheet_to_json(configSheet, {
    header: 1,
    raw: true,
    defval: "",
  }) as unknown[][];

  const config: Partial<ProjectConfig> = {};
  let intervalType: IntervalType | undefined;
  let unitType: UnitType | undefined;
  configRows.slice(1).forEach((row) => {
    const key = String(row[0] ?? "").trim();
    const value = row[1];
    if (!key) return;
    switch (key) {
      case "projectName":
        config.projectName = String(value ?? "").trim();
        break;
      case "totalItems":
        config.totalItems = parseNumber(value);
        break;
      case "startDate": {
        const parsed = parseDateValue(value);
        if (parsed) config.startDate = parsed;
        break;
      }
      case "endDate": {
        const parsed = parseDateValue(value);
        if (parsed) config.endDate = parsed;
        break;
      }
      case "todayDate": {
        const parsed = parseDateValue(value);
        if (parsed) config.todayDate = parsed;
        break;
      }
      case "unitType": {
        const normalized = String(value ?? "").trim().toLowerCase();
        if (normalized === "percentage" || normalized === "value") {
          unitType = normalized as UnitType;
        }
        break;
      }
      case "intervalType": {
        const normalized = String(value ?? "").trim().toLowerCase();
        if (normalized === "daily" || normalized === "weekly" || normalized === "monthly") {
          intervalType = normalized as IntervalType;
        }
        break;
      }
      default:
        break;
    }
  });

  return {
    ...dataResult,
    config,
    intervalType,
    unitType,
  };
}
