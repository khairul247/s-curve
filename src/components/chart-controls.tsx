"use client";

import { useSCurve, type UnitType } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { ChartSettingsDialog } from "@/components/chart-settings-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartControlsProps {
  className?: string;
  onExportPng?: () => void;
  exporting?: boolean;
}

export function ChartControls({ className, onExportPng, exporting }: ChartControlsProps) {
  const { state, dispatch } = useSCurve();
  const { series, unitType } = state;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-muted-foreground">Show:</span>
        {series.map((s) => (
          <Button
            key={s.key}
            variant={s.visible ? "default" : "outline"}
            size="sm"
            onClick={() => dispatch({ type: "TOGGLE_SERIES", payload: s.key })}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Y-Axis:</span>
          <Select
            value={unitType}
            onValueChange={(value) => {
              dispatch({
                type: "SET_UNIT_TYPE",
                payload: value as UnitType,
              });
            }}
          >
            <SelectTrigger className="h-8 w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="value">Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onExportPng}
          disabled={exporting || !onExportPng}
        >
          {exporting ? "Exporting..." : "Download PNG"}
        </Button>
        <ChartSettingsDialog />
      </div>
    </div>
  );
}
