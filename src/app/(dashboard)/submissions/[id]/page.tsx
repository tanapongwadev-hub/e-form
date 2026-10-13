import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  Building2Icon,
  CheckIcon,
  ChevronRightIcon,
  FileTextIcon,
  GavelIcon,
  MessageSquareTextIcon,
  PaperclipIcon,
  RouteIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";
import { FormNote } from "@/components/form/form-section";
import { ReviewActions } from "@/components/submissions/review-actions";
import { StatusBadge } from "@/components/submissions/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FORMS } from "@/config/forms";
import { getMockSubmissionDetail } from "@/lib/mock/dashboard";
import { formSlug, type SubmissionDetail, type TimelineStep } from "@/lib/submissions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "รายละเอียดคำขอ | E-Form TFAC",
};

const CARD = "rounded-[17px] border bg-card shadow-[0_4px_15px_#254b7610] sm:rounded-[20px]";

export default function SubmissionDetailPage({ params }: PageProps<"/submissions/[id]">) {
  return (
    <div className="flex w-full flex-col gap-5">
      {/* params is runtime data under Cache Components, so it is read inside Suspense. */}
      <Suspense fallback={<DetailSkeleton />}>
        {params.then(({ id }) => (
          <Detail id={decodeURIComponent(id)} />
        ))}
      </Suspense>
    </div>
  );
}

async function Detail({ id }: { id: string }) {
  // TODO: replace with the submissions API once it exists.
  const s = getMockSubmissionDetail(id);
  if (!s) notFound();

  const form = FORMS.find((f) => f.code === formSlug(s.form));

  return (
    <>
      <div>
        <nav aria-label="breadcrumb" className="mb-3.5 flex items-center gap-1.5 text-[10px] text-[#7290b2] sm:text-[11px]">
          <Link href="/submissions" className="hover:text-primary">
            คำขอ
          </Link>
          <ChevronRightIcon className="size-3" />
          <span aria-current="page">{s.id}</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold tracking-[0.1em] text-[#5d83b2] uppercase">{s.form}</p>
            <div className="mt-1 mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-[25px] leading-snug font-bold tracking-tight sm:text-[27px]">{s.id}</h1>
              <StatusBadge status={s.status} className="text-xs" />
            </div>
            <p className="mb-3 text-[12px] text-muted-foreground sm:text-[13px]">{form?.title ?? "แบบฟอร์มอิเล็กทรอนิกส์"}</p>
            <div className="h-[3px] w-[52px] rounded bg-gradient-to-r from-[#166cea] to-[#32bac4]" />
          </div>
          <Button
            variant="outline"
            className="h-10 shrink-0 self-start rounded-[10px] px-4 text-xs"
            nativeButton={false}
            render={<Link href="/submissions" />}
          >
            <ArrowLeftIcon />
            กลับไปรายการคำขอ
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,360px)] lg:items-start sm:gap-5">
        <div className="flex flex-col gap-4 sm:gap-5">
          <Card icon={Building2Icon} title="ข้อมูลผู้ยื่นคำขอ">
            <Fields
              rows={[
                ["ชื่อนิติบุคคล", s.applicant],
                ["เลขทะเบียนนิติบุคคล", s.juristicId],
                ["ประเภทการให้บริการ", s.serviceType],
                ["อีเมลสำหรับติดต่อ", s.email],
                ["เบอร์โทรศัพท์มือถือ", s.phone],
              ]}
            />
          </Card>

          <Card icon={FileTextIcon} title="รายละเอียดคำขอ">
            <Fields
              rows={[
                ["เลขที่คำขอ", s.id],
                ["แบบฟอร์ม", form ? `${s.form} · ${form.title}` : s.form],
                ["วันที่ส่ง", s.submittedAt],
                ["ช่องทาง", s.channel],
              ]}
            />
          </Card>

          <Card icon={PaperclipIcon} title="เอกสารแนบ" aside={`${s.attachments.length} ไฟล์`}>
            <ul className="grid gap-2 md:grid-cols-2">
              {s.attachments.map((file) => (
                <li
                  key={file.name}
                  className="flex min-w-0 items-center gap-2.5 rounded-[10px] border bg-muted/40 px-3 py-2.5 text-xs"
                >
                  <FileTextIcon className="size-[18px] shrink-0 text-primary" strokeWidth={1.7} />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{file.size}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-4 max-lg:order-first sm:gap-5 lg:sticky lg:top-0">
          {(s.status === "new" || s.status === "pending") && (
            <Card icon={GavelIcon} title="การพิจารณา">
              <ReviewActions id={s.id} />
            </Card>
          )}

          <Card icon={RouteIcon} title="สถานะคำขอ">
            <Timeline steps={s.timeline} />
          </Card>

          {s.remark && (
            <Card icon={MessageSquareTextIcon} title="ความเห็นผู้พิจารณา">
              <FormNote icon={s.status === "rejected" ? XIcon : CheckIcon} tone={s.status === "rejected" ? "danger" : "info"}>
                {s.remark}
              </FormNote>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

function Card({
  icon: Icon,
  title,
  aside,
  children,
}: {
  icon: LucideIcon;
  title: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={CARD}>
      <header className="flex items-center gap-2.5 border-b px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-4">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-secondary text-primary sm:size-[39px] sm:rounded-xl">
          <Icon className="size-5" strokeWidth={1.7} />
        </span>
        <h2 className="text-sm font-semibold sm:text-[15px]">{title}</h2>
        {aside && <span className="ml-auto text-[11px] text-muted-foreground">{aside}</span>}
      </header>
      <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

function Fields({ rows }: { rows: [label: string, value: string][] }) {
  return (
    <dl className="flex flex-col text-xs">
      {rows.map(([label, value]) => (
        <div
          key={label}
          className="grid gap-0.5 border-b border-dashed py-3 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[12rem_1fr] sm:gap-4"
        >
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium [overflow-wrap:anywhere]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const DOT: Record<TimelineStep["state"], string> = {
  done: "border-primary bg-primary text-primary-foreground",
  current: "border-[#2280ff] bg-card text-primary ring-4 ring-[#edf5ff] dark:ring-primary/15",
  upcoming: "border-[#e4edf9] bg-card text-[#8a9bb4] dark:border-border",
  rejected: "border-[#d94864] bg-[#d94864] text-white",
};

function Timeline({ steps }: { steps: SubmissionDetail["timeline"] }) {
  return (
    <ol className="flex flex-col">
      {steps.map((step, i) => (
        <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "absolute top-8 bottom-1 left-[13px] w-0.5 rounded-full",
                step.state === "done" ? "bg-primary" : "bg-[#e8eff9] dark:bg-border",
              )}
            />
          )}
          <span
            className={cn(
              "relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-semibold",
              DOT[step.state],
            )}
          >
            {step.state === "done" ? (
              <CheckIcon className="size-3.5" strokeWidth={3} />
            ) : step.state === "rejected" ? (
              <XIcon className="size-3.5" strokeWidth={3} />
            ) : (
              i + 1
            )}
          </span>
          <div className="min-w-0 pt-0.5">
            <p
              className={cn(
                "text-xs font-semibold",
                step.state === "upcoming" && "font-normal text-muted-foreground",
                step.state === "current" && "text-primary",
                step.state === "rejected" && "text-[#bd2946] dark:text-rose-300",
              )}
            >
              {step.label}
              {step.state === "current" && (
                <span className="ml-2 rounded-md bg-secondary px-1.5 py-0.5 text-[10px] font-medium">กำลังดำเนินการ</span>
              )}
            </p>
            {step.at && <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">{step.at}</p>}
            {step.note && <p className="mt-0.5 text-[11px] text-muted-foreground">{step.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="กำลังโหลดข้อมูล">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-80 rounded-[20px]" />
        <Skeleton className="h-64 rounded-[20px]" />
      </div>
    </div>
  );
}
