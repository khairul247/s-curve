"use client";

import { useMemo, useState } from "react";
import { useSCurve } from "@/lib/context";
import type { ChartSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const fallbackSettings: ChartSettings = {
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
};

export function ChartSettingsDialog() {
  const { state, dispatch } = useSCurve();
  const { chartSettings } = state;
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<ChartSettings>(chartSettings);

  const mergedSettings = useMemo(
    () => ({
      ...fallbackSettings,
      ...chartSettings,
      colors: {
        ...fallbackSettings.colors,
        ...chartSettings.colors,
      },
    }),
    [chartSettings]
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setLocal(mergedSettings);
    }
  };

  const updateField = (field: keyof ChartSettings, value: string) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
  };

  const updateColor = (field: "planned" | "actual", value: string) => {
    setLocal((prev) => ({
      ...prev,
      colors: { ...prev.colors, [field]: value },
    }));
  };

  const updateRange = (field: "start" | "end", value: string) => {
    setLocal((prev) => ({
      ...prev,
      xRange: {
        ...prev.xRange,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    dispatch({ type: "SET_CHART_SETTINGS", payload: local });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Chart
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chart Settings</DialogTitle>
          <DialogDescription>
            Update axis labels, title, and legend colors.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="chartTitle">Chart Title</Label>
            <Input
              id="chartTitle"
              value={local.title}
              onChange={(event) => updateField("title", event.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="xAxis">X-Axis Label</Label>
              <Input
                id="xAxis"
                value={local.xLabel}
                onChange={(event) => updateField("xLabel", event.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="yAxis">Y-Axis Label</Label>
              <Input
                id="yAxis"
                value={local.yLabel}
                onChange={(event) => updateField("yLabel", event.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="plannedColor">Planned Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="plannedColor"
                  type="color"
                  value={local.colors.planned}
                  onChange={(event) => updateColor("planned", event.target.value)}
                  className="h-10 w-16 p-1"
                />
                <Input
                  value={local.colors.planned}
                  onChange={(event) => updateColor("planned", event.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="actualColor">Actual Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="actualColor"
                  type="color"
                  value={local.colors.actual}
                  onChange={(event) => updateColor("actual", event.target.value)}
                  className="h-10 w-16 p-1"
                />
                <Input
                  value={local.colors.actual}
                  onChange={(event) => updateColor("actual", event.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Chart Start</Label>
              <DatePicker
                value={local.xRange?.start || ""}
                onChange={(value) => updateRange("start", value)}
                placeholder="Start date"
              />
            </div>
            <div className="grid gap-2">
              <Label>Chart End</Label>
              <DatePicker
                value={local.xRange?.end || ""}
                onChange={(value) => updateRange("end", value)}
                placeholder="End date"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
