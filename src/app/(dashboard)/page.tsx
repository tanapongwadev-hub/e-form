import { CheckCircle2Icon, ClockIcon, FileTextIcon, InboxIcon } from "lucide-react";
import { RecentRequests } from "@/components/dashboard/recent-requests";
import { StatBox } from "@/components/dashboard/stat-box";
import { MOCK_RECENT_SUBMISSIONS, MOCK_STATS } from "@/lib/mock/dashboard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] text-[#5d83b2]">E-FORM MANAGEMENT</p>
        <h1 className="mt-1.5 text-[25px] font-bold tracking-tight sm:text-3xl">แดชบอร์ด</h1>
        <p className="mt-1 mb-3 text-[13px] text-muted-foreground">ภาพรวมแบบฟอร์มและคำขอในระบบ</p>
        <div className="h-[3px] w-[52px] rounded bg-gradient-to-r from-[#166cea] to-[#32bac4]" />
      </div>

      <section aria-label="ภาพรวมระบบ" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatBox primary label="แบบฟอร์มทั้งหมด" value={MOCK_STATS.forms} icon={FileTextIcon} href="/forms" />
        <StatBox label="คำขอใหม่" value={MOCK_STATS.newSubmissions} icon={InboxIcon} href="/submissions?status=new" />
        <StatBox label="รออนุมัติ" value={MOCK_STATS.pending} icon={ClockIcon} href="/submissions?status=pending" />
        <StatBox label="อนุมัติแล้ว" value={MOCK_STATS.approved} icon={CheckCircle2Icon} href="/submissions?status=approved" />
      </section>

      <RecentRequests submissions={MOCK_RECENT_SUBMISSIONS} viewAllHref="/submissions" />
    </div>
  );
}
