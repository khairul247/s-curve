"use client";

import { format, parseISO, isAfter, isBefore } from "date-fns";
import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
  Label,
} from "recharts";
import { useSCurve } from "@/lib/context";
import { computeCumulatives } from "@/lib/calculations";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ChartControls } from "@/components/chart-controls";

export function SCurveChart() {
  const { state } = useSCurve();
  const { chartData, series, projectConfig, chartSettings, unitType } = state;
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [exporting, setExporting] = useState(false);
  const filteredChartData = chartSettings.xRange?.start || chartSettings.xRange?.end
    ? chartData.filter((point) => {
        const date = parseISO(point.date);
        const afterStart = chartSettings.xRange?.start
          ? !isBefore(date, parseISO(chartSettings.xRange.start))
          : true;
        const beforeEnd = chartSettings.xRange?.end
          ? !isAfter(date, parseISO(chartSettings.xRange.end))
          : true;
        return afterStart && beforeEnd;
      })
    : chartData;
  const cumulatives = computeCumulatives(
    state.rows,
    projectConfig.todayDate
  );
  const cumulativeByDate = new Map(
    state.rows.map((row, index) => [row.date, cumulatives[index]])
  );

  const visibleSeries = (key: string) =>
    series.find((s) => s.key === key)?.visible ?? true;

  if (filteredChartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{chartSettings.title}</CardTitle>
          <CardDescription>
            Configure your project and generate date rows to see the chart
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            No data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    planned: {
      label: "Plan Cumulative",
      color: chartSettings.colors.planned,
    },
    actual: {
      label: "Actual Cumulative",
      color: chartSettings.colors.actual,
    },
  } satisfies ChartConfig;

  const handleExport = async () => {
    if (!chartRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(chartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      const safeName =
        projectConfig.projectName?.trim().replace(/[^a-z0-9]+/gi, "-") ||
        "s-curve";
      link.download = `${safeName}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{chartSettings.title}</CardTitle>
            <CardDescription>{projectConfig.projectName}</CardDescription>
          </div>
          <ChartControls onExportPng={handleExport} exporting={exporting} />
        </div>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="rounded-lg bg-white p-3">
          <ChartContainer config={chartConfig} className="min-h-[400px] w-full">
          <LineChart
            accessibilityLayer
            data={filteredChartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                try {
                  return format(parseISO(value), "MMM dd");
                } catch {
                  return value;
                }
              }}
              interval="preserveStartEnd"
              height={40}
            >
              {chartSettings.xLabel && (
                <Label
                  value={chartSettings.xLabel}
                  position="insideBottom"
                  offset={-10}
                  className="fill-muted-foreground"
                />
              )}
            </XAxis>
            <YAxis
              domain={[0, "auto"]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) =>
                unitType === "percentage" ? `${value}%` : value
              }
            >
              {chartSettings.yLabel && (
                <Label
                  value={chartSettings.yLabel}
                  angle={-90}
                  position="insideLeft"
                  className="fill-muted-foreground"
                />
              )}
            </YAxis>
            <ChartTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const dateValue = String(payload[0]?.payload?.date ?? "");
                const meta = cumulativeByDate.get(dateValue);
                const total = projectConfig.totalItems || 0;

                const formatValue = (raw: number, isFuture?: boolean) => {
                  if (isFuture) return "—";
                  const percent =
                    total > 0
                      ? Math.round((raw / total) * 100 * 100) / 100
                      : 0;
                  const rawDisplay = raw.toLocaleString();
                  return `${rawDisplay} (${percent}%)`;
                };

                const byKey = new Map(
                  payload.map((item) => [String(item.dataKey), item])
                );
                const plannedItem = byKey.get("planned");
                const actualItem = byKey.get("actual");

                const rows = [
                  plannedItem && {
                    label: "Plan Cumulative",
                    color: plannedItem.color,
                    value: meta ? formatValue(meta.planCumulative, false) : "—",
                  },
                  actualItem && {
                    label: "Actual Cumulative",
                    color: actualItem.color,
                    value: meta
                      ? formatValue(meta.actualCumulative, meta.isFuture)
                      : "—",
                  },
                ].filter(Boolean) as { label: string; color?: string; value: string }[];

                const labelText = (() => {
                  try {
                    return format(parseISO(dateValue), "MMM dd, yyyy");
                  } catch {
                    return dateValue;
                  }
                })();

                return (
                  <div className="border-border/50 bg-background grid min-w-[12rem] gap-2 rounded-lg border px-3 py-2 text-xs shadow-xl">
                    <div className="font-medium">{labelText}</div>
                    <div className="grid gap-1.5">
                      {rows.map((row) => (
                        <div
                          key={row.label}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <span
                              className="h-[2px] w-6 shrink-0 rounded-full"
                              style={{ backgroundColor: row.color }}
                            />
                            <span>{row.label}</span>
                          </div>
                          <span className="text-foreground font-medium tabular-nums">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }}
            />
            <ChartLegend content={<ChartLegendContent />} />

            {/* Today marker */}
            {projectConfig.todayDate && (
              <ReferenceLine
                x={projectConfig.todayDate}
                stroke="hsl(0, 72%, 51%)"
                strokeDasharray="4 4"
                label={{
                  value: "Today",
                  position: "top",
                  fill: "hsl(0, 72%, 51%)",
                  fontSize: 12,
                }}
              />
            )}

            {visibleSeries("planned") && (
              <Line
                dataKey="planned"
                type="monotone"
                stroke="var(--color-planned)"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
            )}

            {visibleSeries("actual") && (
              <Line
                dataKey="actual"
                type="monotone"
                stroke="var(--color-actual)"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            )}
          </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
