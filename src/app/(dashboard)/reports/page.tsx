import type { Metadata } from "next";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";

export const metadata: Metadata = {
  title: "รายงาน | E-Form TFAC",
};

export default function ReportsPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] text-[#5d83b2]">E-FORM MANAGEMENT</p>
        <h1 className="mt-1.5 text-[25px] font-bold tracking-tight sm:text-3xl">รายงาน</h1>
        <p className="mt-1 mb-3 text-[13px] text-muted-foreground">สถิติคำขอ ผลการพิจารณา และแบบฟอร์มที่ใช้งาน</p>
        <div className="h-[3px] w-[52px] rounded bg-gradient-to-r from-[#166cea] to-[#32bac4]" />
      </div>
      <ReportsDashboard />
    </div>
  );
}
