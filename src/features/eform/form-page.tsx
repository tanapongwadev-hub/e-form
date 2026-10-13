import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/** Header of a form page: breadcrumb, form code, title and subtitle. */
export function FormPageHeader({ code, title, subtitle }: { code: string; title: string; subtitle: string }) {
  return (
    <div>
      <nav aria-label="breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-[10px] text-[#7290b2] sm:text-[11px]">
        <Link href="/forms" className="hover:text-primary">
          แบบฟอร์ม
        </Link>
        <ChevronRightIcon className="size-3" />
        <span aria-current="page" className="truncate">
          {title}
        </span>
      </nav>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold tracking-[0.1em] text-[#5d83b2] uppercase">{code}</p>
          <h1 className="mt-1 mb-2 text-[23px] leading-snug font-bold tracking-tight sm:text-[27px]">{title}</h1>
          <p className="mb-3 text-[11px] text-muted-foreground sm:text-[13px]">{subtitle}</p>
          <div className="h-[3px] w-[52px] rounded bg-gradient-to-r from-[#166cea] to-[#32bac4]" />
        </div>
        <span className="hidden shrink-0 rounded-lg bg-[#e2eeff] px-2.5 py-1.5 text-[11px] whitespace-nowrap text-[#175eac] sm:inline dark:bg-secondary dark:text-secondary-foreground">
          แบบฟอร์มอิเล็กทรอนิกส์
        </span>
      </div>
    </div>
  );
}

/** Placeholder while a form's data loads. */
export function FormSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="กำลังโหลดข้อมูล">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-4 rounded-[20px] border bg-card p-6">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }, (_, j) => (
              <Skeleton key={j} className="h-14" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Today's date for "วันที่ยื่นคำขอ", in Thai. */
export function todayThai() {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" }).format(new Date());
}
