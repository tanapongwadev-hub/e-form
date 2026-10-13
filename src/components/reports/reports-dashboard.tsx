"use client";

import { useState } from "react";
import {
  CheckCircle2Icon,
  ClockIcon,
  FileTextIcon,
  HourglassIcon,
  InboxIcon,
  PercentIcon,
  TableIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { StatBox } from "@/components/dashboard/stat-box";
import { FORMS } from "@/config/forms";
import { MOCK_FORM_SHARE, MOCK_MONTHLY, type MonthlyReport } from "@/lib/mock/reports";
import { SUBMISSION_STATUS_LABEL, formSlug, type SubmissionStatus } from "@/lib/submissions";
import { cn } from "@/lib/utils";

const PERIODS = [3, 6, 12] as const;
type Period = (typeof PERIODS)[number];

const CARD = "rounded-[20px] border bg-card shadow-[0_4px_15px_#254b7610]";

/*
 * Status colors (validated with the dataviz palette checker, light + dark, in this stack order:
 * approved → new → pending → rejected). Amber is < 3:1 on the light surface, so every segment
 * also has a visible legend label with its value, and the monthly table repeats the numbers.
 */
const STATUS_ORDER: SubmissionStatus[] = ["approved", "new", "pending", "rejected"];
const STATUS_FILL: Record<SubmissionStatus, string> = {
  approved: "bg-[#0ca30c]",
  new: "bg-[#2a78d6] dark:bg-[#3987e5]",
  pending: "bg-[#eda100] dark:bg-[#c98500]",
  rejected: "bg-[#d03b3b]",
};
const STATUS_ICON: Record<SubmissionStatus, LucideIcon> = {
  approved: CheckCircle2Icon,
  new: InboxIcon,
  pending: ClockIcon,
  rejected: XCircleIcon,
};
// Single-series magnitude: one hue (brand blue), stepped for dark mode.
const SERIES_FILL = "bg-[#0868e8] dark:bg-[#3987e5]";

const total = (m: MonthlyReport) => Object.values(m.byStatus).reduce((a, b) => a + b, 0);
const nf = new Intl.NumberFormat("th-TH");

export function ReportsDashboard() {
  const [period, setPeriod] = useState<Period>(6);
  const months = MOCK_MONTHLY.slice(-period);

  const byStatus = Object.fromEntries(
    STATUS_ORDER.map((s) => [s, months.reduce((sum, m) => sum + m.byStatus[s], 0)]),
  ) as Record<SubmissionStatus, number>;
  const all = months.reduce((sum, m) => sum + total(m), 0);
  const decided = byStatus.approved + byStatus.rejected;
  const approvalRate = decided ? (byStatus.approved / decided) * 100 : 0;
  const avgDays = decided
    ? months.reduce((sum, m) => sum + m.avgDays * (m.byStatus.approved + m.byStatus.rejected), 0) / decided
    : 0;

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {/* One filter row scopes every figure and chart below. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="ช่วงเวลา" className="flex rounded-xl border bg-card p-1 shadow-[0_3px_9px_#163b6710]">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={p === period}
              onClick={() => setPeriod(p)}
              className={cn(
                "h-9 rounded-lg px-3.5 text-xs transition-colors focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-ring sm:px-4",
                p === period ? "bg-primary font-semibold text-primary-foreground" : "text-muted-foreground hover:bg-muted",
              )}
            >
              {p} เดือนล่าสุด
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          {months[0].monthFull} – {months.at(-1)!.monthFull} · ข้อมูลตัวอย่าง
        </p>
      </div>

      <section aria-label="ตัวชี้วัดหลัก" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatBox primary label="คำขอทั้งหมด" value={nf.format(all)} icon={FileTextIcon} />
        <StatBox label="อัตราการอนุมัติ" value={`${approvalRate.toFixed(1)}%`} unit="ของคำขอที่พิจารณาแล้ว" icon={PercentIcon} />
        <StatBox label="ระยะเวลาพิจารณาเฉลี่ย" value={avgDays.toFixed(1)} unit="วัน" icon={HourglassIcon} />
        <StatBox label="ค้างพิจารณา" value={nf.format(byStatus.new + byStatus.pending)} unit="ใหม่ + รออนุมัติ" icon={ClockIcon} />
      </section>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <MonthlyChart months={months} />
        <StatusBreakdown byStatus={byStatus} all={all} />
      </div>

      <div className="grid gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <ByForm all={all} />
        <MonthlyTable months={months} />
      </div>
    </div>
  );
}

function ChartCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(CARD, "flex min-w-0 flex-col gap-5 p-4 sm:p-6", className)}>
      <div>
        <h2 className="text-[15px] font-semibold">{title}</h2>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

/** A "nice" axis: a round step (1/2/2.5/5 × 10ⁿ) giving at most 5 intervals, and the max rounded up to it. */
function niceScale(value: number) {
  const base = 10 ** Math.floor(Math.log10(Math.max(value / 5, 1)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * base)
    .filter(Number.isInteger) // counts: no fractional ticks
    .find((c) => value / c <= 5) ?? 10 * base;
  const max = Math.ceil(value / step) * step;
  return { max, ticks: Array.from({ length: max / step + 1 }, (_, i) => i * step) };
}

function MonthlyChart({ months }: { months: MonthlyReport[] }) {
  const [active, setActive] = useState<number | null>(null);
  const totals = months.map(total);
  // 10% headroom so the peak bar and its label never touch the top gridline.
  const { max, ticks } = niceScale(Math.max(...totals) * 1.1);
  const peak = totals.indexOf(Math.max(...totals));
  const dense = months.length > 6;

  return (
    <ChartCard title="จำนวนคำขอรายเดือน" description="คำขอที่ยื่นเข้าระบบในแต่ละเดือน (ทุกสถานะ)">
      <div className="flex gap-2">
        {/* y-axis ticks */}
        <div className="relative h-56 w-7 shrink-0 text-right text-[10px] text-muted-foreground tabular-nums" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>
              {t}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          {/* gridlines: solid hairlines, one step off the surface */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56" aria-hidden>
            {ticks.map((t) => (
              <span key={t} className="absolute inset-x-0 h-px bg-border" style={{ bottom: `${(t / max) * 100}%` }} />
            ))}
          </div>

          <ol className="relative flex h-56 items-end" aria-label="จำนวนคำขอรายเดือน">
            {months.map((m, i) => {
              const value = totals[i];
              const isActive = active === i;
              return (
                <li key={m.month} className="relative flex h-full min-w-0 flex-1 justify-center">
                  {/* The whole band is the hit target; the bar stays thin. */}
                  <button
                    type="button"
                    className="group flex h-full w-full items-end justify-center rounded-md outline-none focus-visible:bg-muted/60"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${m.monthFull}: ${nf.format(value)} คำขอ`}
                  >
                    <span
                      className={cn(
                        "relative w-[45%] max-w-6 rounded-t-[4px] transition-opacity",
                        SERIES_FILL,
                        active !== null && !isActive && "opacity-40",
                      )}
                      style={{ height: `${(value / max) * 100}%` }}
                    >
                      {/* Selective direct label: only the peak month. */}
                      {i === peak && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap text-foreground">
                          {nf.format(value)}
                        </span>
                      )}
                    </span>
                  </button>
                  {isActive && <Tooltip month={m} value={value} align={i < months.length / 2 ? "left" : "right"} />}
                </li>
              );
            })}
          </ol>

          <ol className="mt-2 flex text-[10px] text-muted-foreground" aria-hidden>
            {months.map((m, i) => (
              // min-w-0: nowrap labels must not widen the chart past its card on narrow screens.
              <li key={m.month} className={cn("min-w-0 flex-1 text-center whitespace-nowrap", dense && i % 2 === 1 && "max-sm:invisible")}>
                {m.month}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ChartCard>
  );
}

function Tooltip({ month, value, align }: { month: MonthlyReport; value: number; align: "left" | "right" }) {
  return (
    <div
      role="tooltip"
      className={cn(
        "pointer-events-none absolute top-2 z-10 w-44 rounded-xl border bg-popover p-3 text-[11px] shadow-[0_8px_30px_#17395d20]",
        align === "left" ? "left-1/2" : "right-1/2",
      )}
    >
      <p className="mb-1.5 font-semibold">{month.monthFull}</p>
      <p className="mb-2 flex justify-between gap-2">
        <span className="text-muted-foreground">ทั้งหมด</span>
        <b className="tabular-nums">{nf.format(value)}</b>
      </p>
      <ul className="flex flex-col gap-1 border-t pt-2">
        {STATUS_ORDER.map((s) => (
          <li key={s} className="flex items-center gap-1.5">
            <i className={cn("size-2 rounded-[2px]", STATUS_FILL[s])} aria-hidden />
            <span className="text-muted-foreground">{SUBMISSION_STATUS_LABEL[s]}</span>
            <span className="ml-auto tabular-nums">{nf.format(month.byStatus[s])}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatusBreakdown({ byStatus, all }: { byStatus: Record<SubmissionStatus, number>; all: number }) {
  const [active, setActive] = useState<SubmissionStatus | null>(null);
  const pct = (n: number) => (all ? (n / all) * 100 : 0);

  return (
    <ChartCard title="สัดส่วนตามสถานะ" description="สถานะปัจจุบันของคำขอในช่วงเวลาที่เลือก">
      {/* 100% stacked bar: 24px thick, 2px surface gaps between segments, rounded outer ends. */}
      <div className="flex h-6 gap-[2px] overflow-hidden rounded-[4px]" role="img" aria-label="สัดส่วนคำขอตามสถานะ">
        {STATUS_ORDER.filter((s) => byStatus[s] > 0).map((s) => (
          <span
            key={s}
            className={cn("h-full transition-opacity", STATUS_FILL[s], active && active !== s && "opacity-30")}
            style={{ width: `${pct(byStatus[s])}%` }}
            onMouseEnter={() => setActive(s)}
            onMouseLeave={() => setActive(null)}
            title={`${SUBMISSION_STATUS_LABEL[s]}: ${nf.format(byStatus[s])} (${pct(byStatus[s]).toFixed(1)}%)`}
          />
        ))}
      </div>

      {/* Legend doubles as the value list: icon + label + number, text in ink (never the series color). */}
      <ul className="flex flex-col">
        {STATUS_ORDER.map((s) => {
          const Icon = STATUS_ICON[s];
          return (
            <li
              key={s}
              onMouseEnter={() => setActive(s)}
              onMouseLeave={() => setActive(null)}
              className={cn(
                "flex items-center gap-2.5 border-b border-dashed py-2.5 text-xs transition-opacity last:border-0",
                active && active !== s && "opacity-40",
              )}
            >
              <i className={cn("size-2.5 shrink-0 rounded-[3px]", STATUS_FILL[s])} aria-hidden />
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="flex-1">{SUBMISSION_STATUS_LABEL[s]}</span>
              <span className="font-semibold tabular-nums">{nf.format(byStatus[s])}</span>
              <span className="w-12 text-right text-muted-foreground tabular-nums">{pct(byStatus[s]).toFixed(1)}%</span>
            </li>
          );
        })}
      </ul>
    </ChartCard>
  );
}

function ByForm({ all }: { all: number }) {
  const rows = MOCK_FORM_SHARE.map((f) => ({
    code: f.code,
    title: FORMS.find((form) => form.code === formSlug(f.code))?.title ?? f.code,
    count: Math.round(all * f.share),
  })).sort((a, b) => b.count - a.count);
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <ChartCard title="คำขอแยกตามแบบฟอร์ม" description="เรียงจากมากไปน้อย">
      <ul className="flex flex-col gap-3.5">
        {rows.map((r) => (
          <li key={r.code} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="min-w-0 truncate" title={r.title}>
                <b className="font-semibold">{r.code}</b>
                <span className="text-muted-foreground"> · {r.title}</span>
              </span>
              <span className="shrink-0 font-semibold tabular-nums">{nf.format(r.count)}</span>
            </div>
            <div className="h-2.5 rounded-[4px] bg-muted">
              <div className={cn("h-full rounded-[4px]", SERIES_FILL)} style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}

/** Table twin of the charts: every number is readable without hover or color. */
function MonthlyTable({ months }: { months: MonthlyReport[] }) {
  const TH = "bg-muted px-3 py-2.5 text-right font-semibold whitespace-nowrap";
  const TD = "border-b px-3 py-2.5 text-right tabular-nums group-last/row:border-0";

  return (
    <section className={cn(CARD, "flex min-w-0 flex-col gap-4 p-4 sm:p-6")}>
      <div className="flex items-center gap-2">
        <TableIcon className="size-4 text-primary" />
        <h2 className="text-[15px] font-semibold">ตารางข้อมูลรายเดือน</h2>
        {/* Scrollbars are hidden app-wide, so say that the table scrolls sideways. */}
        <span className="ml-auto text-[10px] text-muted-foreground sm:hidden">เลื่อนซ้าย-ขวาเพื่อดูทั้งหมด</span>
      </div>
      <div className="relative w-0 min-w-full overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 text-xs">
          <thead>
            <tr className="text-[11px] text-[#526d95] dark:text-muted-foreground">
              <th className={cn(TH, "sticky left-0 z-10 rounded-l-xl text-left")}>เดือน</th>
              <th className={TH}>ทั้งหมด</th>
              {STATUS_ORDER.map((s) => (
                <th key={s} className={TH}>
                  {SUBMISSION_STATUS_LABEL[s]}
                </th>
              ))}
              <th className={cn(TH, "rounded-r-xl")}>เฉลี่ย (วัน)</th>
            </tr>
          </thead>
          <tbody>
            {[...months].reverse().map((m) => (
              <tr key={m.month} className="group/row hover:bg-muted/50">
                <td className={cn(TD, "sticky left-0 bg-card text-left font-medium whitespace-nowrap group-hover/row:bg-muted")}>
                  {m.monthFull}
                </td>
                <td className={cn(TD, "font-semibold")}>{nf.format(total(m))}</td>
                {STATUS_ORDER.map((s) => (
                  <td key={s} className={cn(TD, !m.byStatus[s] && "text-muted-foreground")}>
                    {nf.format(m.byStatus[s])}
                  </td>
                ))}
                <td className={TD}>{m.avgDays.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
