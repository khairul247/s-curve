"use client";

import { HelpGuideDialog } from "@/components/help-guide-dialog";

export function Header() {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Project Performance
          </p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            S-Curve Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Upload Excel or configure intervals to compare planned vs actual
            progress in a single view.
          </p>
        </div>
        <div className="pt-1">
          <HelpGuideDialog />
        </div>
      </div>
    </div>
  );
}
