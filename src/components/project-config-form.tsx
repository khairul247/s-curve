"use client";

import { useSCurve, type UnitType } from "@/lib/context";
import type { IntervalType } from "@/lib/calculations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "./date-picker";
import { Separator } from "@/components/ui/separator";
import { DataImportCard } from "@/components/data-import-card";

export function ProjectConfigForm() {
  const { state, dispatch } = useSCurve();
  const { projectConfig, intervalType, unitType } = state;

  const update = (field: string, value: string) => {
    dispatch({
      type: "SET_PROJECT_CONFIG",
      payload: { [field]: value },
    });
  };

  const handleGenerate = () => {
    dispatch({ type: "REGENERATE_ROWS" });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Project Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="projectName">Project Name</Label>
          <Input
            id="projectName"
            value={projectConfig.projectName}
            onChange={(e) => update("projectName", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <DatePicker
              value={projectConfig.startDate}
              onChange={(v) => update("startDate", v)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <DatePicker
              value={projectConfig.endDate}
              onChange={(v) => update("endDate", v)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Today&apos;s Date</Label>
            <DatePicker
              value={projectConfig.todayDate}
              onChange={(v) => update("todayDate", v)}
            />
          </div>
          <div className="space-y-2">
            <Label>Interval</Label>
            <Select
              value={intervalType}
              onValueChange={(v) => {
                dispatch({
                  type: "SET_INTERVAL_TYPE",
                  payload: v as IntervalType,
                });
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Unit</Label>
            <Select
            value={unitType}
            onValueChange={(v) => {
              dispatch({
                type: "SET_UNIT_TYPE",
                payload: v as UnitType,
              });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage (%)</SelectItem>
              <SelectItem value="value">Value</SelectItem>
            </SelectContent>
          </Select>
          </div>
          {unitType === "value" && (
            <div className="space-y-2">
              <Label htmlFor="totalItems">Total Items</Label>
              <Input
                id="totalItems"
                type="number"
                min="1"
                value={projectConfig.totalItems || ""}
                onChange={(e) => {
                  const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                  if (!isNaN(val)) {
                    dispatch({
                      type: "SET_PROJECT_CONFIG",
                      payload: { totalItems: val },
                    });
                  }
                }}
                placeholder="e.g. 200"
              />
            </div>
          )}
        </div>
        <Button onClick={handleGenerate} className="w-full">
          Generate Date Rows
        </Button>
        <Separator />
        <div className="space-y-2">
          <div>
            <h3 className="text-sm font-semibold">Import Excel / CSV</h3>
            <p className="text-xs text-muted-foreground">
              Upload your spreadsheet to populate the project data table.
            </p>
          </div>
          <DataImportCard embedded />
        </div>
      </CardContent>
    </Card>
  );
}
