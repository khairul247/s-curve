"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function HelpGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Help & Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Use the S-Curve Generator</DialogTitle>
          <DialogDescription>
            Upload Excel/CSV, review the data table, and export the chart.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 text-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Quick Steps</h3>
            <ol className="list-decimal space-y-1 pl-4 text-muted-foreground">
              <li>Set project dates and total items (optional).</li>
              <li>Upload Excel or CSV to populate project data.</li>
              <li>Edit actual/plan values directly in the table.</li>
              <li>Adjust chart settings and download PNG when ready.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">Excel Structure</h3>
              <p className="text-muted-foreground">
                Sheet 1 is <span className="font-medium">Config</span>. Sheet 2
                is <span className="font-medium">Project Data</span>.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Config Sheet (First Sheet)
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>projectName</TableCell>
                    <TableCell>Sample Project</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>totalItems</TableCell>
                    <TableCell>200</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>startDate</TableCell>
                    <TableCell>2026-02-01</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>endDate</TableCell>
                    <TableCell>2026-03-02</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>todayDate</TableCell>
                    <TableCell>2026-02-08</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>intervalType</TableCell>
                    <TableCell>daily | weekly | monthly</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>unitType</TableCell>
                    <TableCell>value | percentage</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Project Data Sheet (Second Sheet)
              </p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>date</TableCell>
                    <TableCell>YYYY-MM-DD</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>actual</TableCell>
                    <TableCell>Per-period progress value</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>actual cumulative</TableCell>
                    <TableCell>Optional. Used to derive actual</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>plan</TableCell>
                    <TableCell>Per-period planned value</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>plan cumulative</TableCell>
                    <TableCell>Optional. Used to derive plan</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <p className="text-muted-foreground">
                At minimum, include <span className="font-medium">date</span> +
                one of <span className="font-medium">actual</span> or
                <span className="font-medium">actual cumulative</span>, and one
                of <span className="font-medium">plan</span> or
                <span className="font-medium">plan cumulative</span>.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
