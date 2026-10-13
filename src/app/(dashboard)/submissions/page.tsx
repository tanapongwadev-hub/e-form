import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { RecentRequests } from "@/components/dashboard/recent-requests";
import { Skeleton } from "@/components/ui/skeleton";
import { MOCK_SUBMISSIONS } from "@/lib/mock/dashboard";
import { SUBMISSION_STATUS_LABEL, isSubmissionStatus, type SubmissionStatus } from "@/lib/submissions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "คำขอ | E-Form TFAC",
};

const STATUS_DOT: Record<SubmissionStatus, string> = {
  new: "bg-[#0869c9]",
  pending: "bg-[#e0a21c]",
  approved: "bg-[#1a9b6c]",
  rejected: "bg-[#d94864]",
};

export default function SubmissionsPage({ searchParams }: PageProps<"/submissions">) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold tracking-[0.18em] text-[#5d83b2]">E-FORM MANAGEMENT</p>
        <h1 className="mt-1.5 text-[25px] font-bold tracking-tight sm:text-3xl">คำขอ</h1>
        <p className="mt-1 mb-3 text-[13px] text-muted-foreground">ค้นหาและติดตามสถานะคำขอที่ส่งเข้าระบบ</p>
        <div className="h-[3px] w-[52px] rounded bg-gradient-to-r from-[#166cea] to-[#32bac4]" />
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <SubmissionsList searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SubmissionsList({ searchParams }: Pick<PageProps<"/submissions">, "searchParams">) {
  const { status: param } = await searchParams;
  const status = isSubmissionStatus(param) ? param : undefined;

  const counts = Object.fromEntries(
    Object.keys(SUBMISSION_STATUS_LABEL).map((s) => [s, MOCK_SUBMISSIONS.filter((r) => r.status === s).length]),
  ) as Record<SubmissionStatus, number>;

  const tabs: { value?: SubmissionStatus; label: string; count: number }[] = [
    { label: "ทั้งหมด", count: MOCK_SUBMISSIONS.length },
    ...(Object.keys(SUBMISSION_STATUS_LABEL) as SubmissionStatus[]).map((value) => ({
      value,
      label: SUBMISSION_STATUS_LABEL[value],
      count: counts[value],
    })),
  ];

  return (
    <>
      <nav aria-label="สถานะคำขอ" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {tabs.map((tab) => {
          const active = tab.value === status;
          return (
            <Link
              key={tab.label}
              href={tab.value ? { query: { status: tab.value } } : "/submissions"}
              scroll={false}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs whitespace-nowrap shadow-[0_3px_9px_#163b6710] transition",
                active
                  ? "border-transparent bg-gradient-to-br from-[#157df6] to-[#1560e2] text-white"
                  : "bg-card hover:-translate-y-px hover:border-primary/40",
                !tab.value && "max-sm:col-span-2",
              )}
            >
              {tab.value && (
                <i className={cn("size-2 rounded-full", active ? "bg-white" : STATUS_DOT[tab.value])} aria-hidden />
              )}
              <span className={active ? "font-semibold" : "text-muted-foreground"}>{tab.label}</span>
              <span
                className={cn(
                  "ml-auto rounded-md px-1.5 text-[11px] font-bold tabular-nums sm:ml-1",
                  active ? "bg-white/20" : "bg-muted text-foreground",
                )}
              >
                {tab.count}
              </span>
            </Link>
          );
        })}
      </nav>

      <RecentRequests
        // Remount so the filter picks up a new ?status= from the tabs above.
        key={status ?? "all"}
        submissions={MOCK_SUBMISSIONS}
        initialStatus={status}
        title="รายการคำขอ"
        description="คำขอทั้งหมดในระบบ เรียงจากล่าสุด"
      />
    </>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="กำลังโหลดข้อมูล">
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-[76px] rounded-[22px]" />
      <Skeleton className="h-96 rounded-[22px]" />
    </div>
  );
}
