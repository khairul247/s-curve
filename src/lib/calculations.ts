import {
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachDayOfInterval,
  format,
  parseISO,
  isAfter,
} from "date-fns";
import type { DataRow, SCurveDataPoint } from "./types";

export type IntervalType = "daily" | "weekly" | "monthly";

export function generateDateIntervals(
  startDate: string,
  endDate: string,
  intervalType: IntervalType
): string[] {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isAfter(start, end)) return [];

  let dates: Date[];
  switch (intervalType) {
    case "daily":
      dates = eachDayOfInterval({ start, end });
      break;
    case "weekly":
      dates = [start, ...eachWeekOfInterval({ start, end })];
      break;
    case "monthly":
      dates = [start, ...eachMonthOfInterval({ start, end })];
      break;
  }

  // Ensure end date is included
  const last = dates[dates.length - 1];
  if (last && format(last, "yyyy-MM-dd") !== endDate) {
    dates.push(end);
  }

  // Deduplicate and sort
  const unique = [...new Set(dates.map((d) => format(d, "yyyy-MM-dd")))];
  unique.sort();
  return unique;
}

export function computeChartData(
  rows: DataRow[],
  unitType: "percentage" | "value" = "percentage",
  totalItems: number = 100,
  todayDate?: string
): SCurveDataPoint[] {
  let actualCumulative = 0;
  let planCumulative = 0;

  return rows.map((row) => {
    const isFuture =
      todayDate && isAfter(parseISO(row.date), parseISO(todayDate));

    if (!isFuture) {
      actualCumulative += row.actual;
    }
    planCumulative += row.plan;

    const actualRaw = isFuture ? null : actualCumulative;
    const plannedRaw = planCumulative;

    const toPercent = unitType === "percentage" && totalItems > 0;
    const actualVal =
      actualRaw === null
        ? null
        : toPercent
          ? Math.round((actualRaw / totalItems) * 100 * 100) / 100
          : Math.round(actualRaw * 100) / 100;
    const plannedVal = toPercent
      ? Math.round((plannedRaw / totalItems) * 100 * 100) / 100
      : Math.round(plannedRaw * 100) / 100;

    return {
      date: row.date,
      actual: actualVal,
      planned: plannedVal,
    };
  });
}

export function computeCumulatives(
  rows: DataRow[],
  todayDate?: string
): { actualCumulative: number; planCumulative: number; isFuture: boolean }[] {
  let actualSum = 0;
  let planSum = 0;

  return rows.map((row) => {
    const isFuture =
      todayDate && isAfter(parseISO(row.date), parseISO(todayDate));
    if (!isFuture) {
      actualSum += row.actual;
    }
    planSum += row.plan;
    return {
      actualCumulative: Math.round(actualSum * 100) / 100,
      planCumulative: Math.round(planSum * 100) / 100,
      isFuture: Boolean(isFuture),
    };
  });
}
