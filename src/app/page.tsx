"use client";

import { Header } from "@/components/header";
import { ProjectConfigForm } from "@/components/project-config-form";
import { DataTable } from "@/components/data-table";
import { SCurveChart } from "@/components/s-curve-chart";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_55%)]">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        <Header />
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-2">
              <div className="h-full">
                <ProjectConfigForm />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-full">
                <DataTable />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-5">
              <SCurveChart />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
