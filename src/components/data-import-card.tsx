"use client";

import { useState } from "react";
import { useSCurve } from "@/lib/context";
import { parseExcelFile } from "@/lib/importer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DataImportCardProps {
  embedded?: boolean;
}

export function DataImportCard({ embedded = false }: DataImportCardProps) {
  const { dispatch } = useSCurve();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setError(null);
    setStatus("Reading file...");

    try {
      const result = await parseExcelFile(file);
      dispatch({ type: "SET_ROWS", payload: result.rows });
      const payload = {
        startDate: result.config.startDate ?? result.startDate,
        endDate: result.config.endDate ?? result.endDate,
        todayDate: result.config.todayDate,
        projectName: result.config.projectName,
        totalItems: result.config.totalItems,
      } as const;
      dispatch({
        type: "SET_PROJECT_CONFIG",
        payload: Object.fromEntries(
          Object.entries(payload).filter(([, value]) => value !== undefined)
        ),
      });
      if (result.intervalType) {
        dispatch({ type: "SET_INTERVAL_TYPE", payload: result.intervalType });
      }
      if (result.unitType) {
        dispatch({ type: "SET_UNIT_TYPE", payload: result.unitType });
      }
      setStatus(`Imported ${result.rows.length} rows from ${file.name}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed.";
      setError(message);
      setStatus(null);
    }
  };

  const content = (
    <div className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="fileUpload">Upload spreadsheet</Label>
          <Input
            id="fileUpload"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
          />
          <p className="text-xs text-muted-foreground">
            Columns supported: <span className="font-medium">date</span>,{" "}
            <span className="font-medium">actual</span> (or{" "}
            <span className="font-medium">actual cumulative</span>),{" "}
            <span className="font-medium">plan</span> (or{" "}
            <span className="font-medium">plan cumulative</span>).
          </p>
          <p className="text-xs text-muted-foreground">
            If only cumulative columns are provided, per-period values are
            derived automatically.
          </p>
        </div>
        {status && (
          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            {status}
          </div>
        )}
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </div>
  );

  if (embedded) {
    return content;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Excel / CSV</CardTitle>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
}
