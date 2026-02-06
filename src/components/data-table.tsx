"use client";

import { useSCurve } from "@/lib/context";
import { computeCumulatives } from "@/lib/calculations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

export function DataTable() {
  const { state, dispatch } = useSCurve();
  const { rows, unitType, projectConfig } = state;
  const cumulatives = computeCumulatives(rows, projectConfig.todayDate);
  const isValue = unitType === "value";
  const total = projectConfig.totalItems;

  const toPercent = (cum: number) =>
    total > 0 ? Math.round((cum / total) * 100 * 100) / 100 : 0;

  const handleChange = (
    index: number,
    field: "actual" | "plan",
    raw: string
  ) => {
    const value = raw === "" ? 0 : parseFloat(raw);
    if (isNaN(value)) return;
    dispatch({ type: "UPDATE_ROW", payload: { index, field, value } });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          Project Data
          {isValue && total > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Target: {total} items)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60">
                <TableHead className="sticky top-0 bg-muted/60 z-10 w-28 text-center">
                  Date
                </TableHead>
                <TableHead className="sticky top-0 bg-muted/60 z-10 text-center w-24">
                  Actual
                </TableHead>
                <TableHead className="sticky top-0 bg-muted/60 z-10 text-center w-28">
                  Actual Cum.
                </TableHead>
                {isValue && (
                  <TableHead className="sticky top-0 bg-muted/60 z-10 text-center w-20">
                    Actual (%)
                  </TableHead>
                )}
                <TableHead className="sticky top-0 bg-muted/60 z-10 text-center w-24">
                  Plan
                </TableHead>
                <TableHead className="sticky top-0 bg-muted/60 z-10 text-center w-28">
                  Plan Cum.
                </TableHead>
                {isValue && (
                  <TableHead className="sticky top-0 bg-muted/60 z-10 text-center w-20">
                    Plan (%)
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={row.date} className={i % 2 === 0 ? "bg-muted/10" : ""}>
                  <TableCell className="font-medium py-3 text-center">{row.date}</TableCell>
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={cumulatives[i].isFuture ? "" : row.actual || ""}
                      onChange={(e) =>
                        handleChange(i, "actual", e.target.value)
                      }
                      className="h-9 text-center w-full bg-background"
                      disabled={cumulatives[i].isFuture}
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium tabular-nums py-3">
                    {cumulatives[i].isFuture ? "—" : cumulatives[i].actualCumulative}
                  </TableCell>
                  {isValue && (
                    <TableCell className="text-center tabular-nums text-muted-foreground py-3">
                      {cumulatives[i].isFuture
                        ? "—"
                        : `${toPercent(cumulatives[i].actualCumulative)}%`}
                    </TableCell>
                  )}
                  <TableCell className="py-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={row.plan || ""}
                      onChange={(e) =>
                        handleChange(i, "plan", e.target.value)
                      }
                      className="h-9 text-center w-full bg-background"
                    />
                  </TableCell>
                  <TableCell className="text-center font-medium tabular-nums py-3">
                    {cumulatives[i].planCumulative}
                  </TableCell>
                  {isValue && (
                    <TableCell className="text-center tabular-nums text-muted-foreground py-3">
                      {toPercent(cumulatives[i].planCumulative)}%
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
