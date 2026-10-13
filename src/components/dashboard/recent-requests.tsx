"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon, ChevronRightIcon, ClockIcon, FileTextIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/submissions/status-badge";
import { SUBMISSION_STATUS_LABEL, type Submission, type SubmissionStatus } from "@/lib/submissions";

const CARD = "rounded-[22px] border bg-card shadow-[0_5px_22px_#294f8210]";
const CELL = "border-b px-3.5 py-4 group-last/row:border-0";
const SELECT = "min-w-0 flex-1 sm:max-w-56 sm:min-w-32 *:data-[slot=native-select]:h-11 *:data-[slot=native-select]:rounded-xl *:data-[slot=native-select]:bg-card *:data-[slot=native-select]:text-xs";

type RecentRequestsProps = {
  submissions: Submission[];
  title?: string;
  description?: string;
  /** Status filter to start with (e.g. from ?status= in the URL). */
  initialStatus?: SubmissionStatus;
  /** Shows a "ดูทั้งหมด" link in the list header. */
  viewAllHref?: string;
};

/** Filter bar + requests list: a table on desktop, stacked cards on mobile. */
export function RecentRequests({
  submissions,
  title = "คำขอล่าสุด",
  description = "รายการล่าสุดที่ส่งเข้าระบบ",
  initialStatus,
  viewAllHref,
}: RecentRequestsProps) {
  const [query, setQuery] = useState("");
  const [form, setForm] = useState("");
  const [status, setStatus] = useState<string>(initialStatus ?? "");

  const forms = [...new Set(submissions.map((s) => s.form))];
  const q = query.trim().toLowerCase();
  const list = submissions.filter(
    (s) =>
      (!q || [s.id, s.applicant, s.form].some((v) => v.toLowerCase().includes(q))) &&
      (!form || s.form === form) &&
      (!status || s.status === status),
  );
  const isFiltered = Boolean(query || form || status);

  function reset() {
    setQuery("");
    setForm("");
    setStatus("");
  }

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="ค้นหาและกรองคำขอ" className={cn(CARD, "flex flex-wrap items-center gap-2.5 p-3 sm:flex-nowrap sm:gap-3 sm:p-4")}>
        <label className="relative w-full sm:flex-[1.5]">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="ค้นหาเลขที่คำขอหรือผู้ยื่น"
            placeholder="ค้นหาเลขที่คำขอหรือผู้ยื่น"
            className="h-11 rounded-xl bg-card pl-10 text-xs md:text-xs"
          />
        </label>
        <NativeSelect className={SELECT} aria-label="กรองแบบฟอร์ม" value={form} onChange={(e) => setForm(e.target.value)}>
          <NativeSelectOption value="">แบบฟอร์มทั้งหมด</NativeSelectOption>
          {forms.map((f) => (
            <NativeSelectOption key={f} value={f}>
              {f}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect className={SELECT} aria-label="กรองสถานะ" value={status} onChange={(e) => setStatus(e.target.value)}>
          <NativeSelectOption value="">ทุกสถานะ</NativeSelectOption>
          {Object.entries(SUBMISSION_STATUS_LABEL).map(([value, label]) => (
            <NativeSelectOption key={value} value={value}>
              {label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button variant="outline" className="h-11 rounded-xl px-4 text-xs text-muted-foreground" onClick={reset} disabled={!isFiltered}>
          ล้างค่า
        </Button>
      </section>

      <section
        aria-labelledby="recent-title"
        className={cn(CARD, "p-6 max-sm:rounded-none max-sm:border-0 max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none")}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 id="recent-title" className="text-xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs text-primary hover:bg-secondary"
            >
              ดูทั้งหมด
              <ArrowRightIcon className="size-4" />
            </Link>
          )}
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <SearchIcon className="size-8" />
            <p>ไม่พบคำขอที่ตรงกับการค้นหา</p>
            <Button variant="ghost" className="text-primary" onClick={reset}>
              ล้างตัวกรองทั้งหมด
            </Button>
          </div>
        ) : (
          <>
            <table className="hidden w-full border-separate border-spacing-0 text-xs sm:table">
              <thead>
                <tr className="text-left text-[11px] text-[#526d95] dark:text-muted-foreground">
                  {["เลขที่คำขอ", "แบบฟอร์ม", "ผู้ยื่น", "วันที่ส่ง", "สถานะ"].map((h) => (
                    <th key={h} className="bg-muted px-3.5 py-3 font-semibold whitespace-nowrap first:rounded-l-xl">
                      {h}
                    </th>
                  ))}
                  <th className="w-10 rounded-r-xl bg-muted" aria-label="รายละเอียด" />
                </tr>
              </thead>
              <tbody>
                {list.map((row) => (
                  // The ID link stretches over the whole row (after:inset-0), so any cell opens the request.
                  <tr key={row.id} className="group/row relative hover:bg-muted/50">
                    <td className={cn(CELL, "font-bold whitespace-nowrap")}>
                      <Link
                        href={`/submissions/${row.id}`}
                        className="rounded outline-none after:absolute after:inset-0 after:rounded-xl group-hover/row:text-primary focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                      >
                        {row.id}
                      </Link>
                    </td>
                    <td className={cn(CELL, "whitespace-nowrap")}>{row.form}</td>
                    <td className={CELL}>{row.applicant}</td>
                    <td className={cn(CELL, "text-[11px] whitespace-nowrap text-muted-foreground tabular-nums")}>{row.submittedAt}</td>
                    <td className={CELL}>
                      <StatusBadge status={row.status} />
                    </td>
                    <td className={cn(CELL, "text-primary")}>
                      <ChevronRightIcon className="size-4 transition-transform group-hover/row:translate-x-0.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ul className="grid gap-3 sm:hidden">
              {list.map((row) => (
                <li key={row.id}>
                  <Link
                    href={`/submissions/${row.id}`}
                    className="block rounded-[17px] border bg-card p-4 shadow-[0_3px_12px_#22487e05] active:bg-muted/50"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <strong className="text-[13px]">{row.id}</strong>
                      <StatusBadge status={row.status} />
                    </div>
                    <p className="mb-2.5 text-xs [overflow-wrap:anywhere]">{row.applicant}</p>
                    <div className="flex justify-between gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileTextIcon className="size-3 text-primary/70" />
                        {row.form}
                      </span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <ClockIcon className="size-3 text-primary/70" />
                        {row.submittedAt}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-2 flex justify-between gap-2 border-t pt-3.5 text-[11px] text-muted-foreground max-sm:mt-4">
          <span role="status" aria-live="polite">
            แสดง {list.length} จาก {submissions.length} รายการ
          </span>
          <span className="flex items-center gap-1.5">
            <i className="size-1.5 rounded-full bg-[#73b4fb]" />
            ข้อมูลตัวอย่าง
          </span>
        </div>
      </section>
    </div>
  );
}
