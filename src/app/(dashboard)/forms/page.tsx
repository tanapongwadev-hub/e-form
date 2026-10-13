import Link from "next/link";
import { ArrowRightIcon, ClockIcon, FileCheck2Icon, FileTextIcon, LayersIcon } from "lucide-react";
import { FORMS, type FormEntry } from "@/config/forms";
import { cn } from "@/lib/utils";

export default function FormsPage() {
  const available = FORMS.filter((f) => f.href).length;
  // Ready forms first; otherwise keep the official numbering order.
  const forms = [...FORMS].sort((a, b) => Number(!a.href) - Number(!b.href));

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-[#5d83b2]">E-FORM MANAGEMENT</p>
          <h1 className="mt-1.5 text-[25px] font-bold tracking-tight sm:text-3xl">แบบฟอร์ม</h1>
          <p className="mt-1 mb-3 text-[13px] text-muted-foreground">เลือกแบบฟอร์มอิเล็กทรอนิกส์ที่ต้องการยื่นคำขอ</p>
          <div className="h-[3px] w-[52px] rounded bg-gradient-to-r from-[#166cea] to-[#32bac4]" />
        </div>
        <dl className="flex flex-wrap gap-2 text-[11px]">
          <Summary icon={LayersIcon} label="ทั้งหมด" value={FORMS.length} />
          <Summary icon={FileCheck2Icon} label="พร้อมใช้งาน" value={available} highlight />
          <Summary icon={ClockIcon} label="ระหว่างพัฒนา" value={FORMS.length - available} />
        </dl>
      </div>

      <section aria-label="รายการแบบฟอร์ม" className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
        {forms.map((form) => (
          <FormCard key={form.code} form={form} />
        ))}
      </section>
    </div>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof LayersIcon;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-xl border bg-card px-2.5 py-2 whitespace-nowrap shadow-[0_3px_9px_#163b6710] sm:gap-2 sm:px-3",
        highlight && "border-transparent bg-gradient-to-br from-[#157df6] to-[#1560e2] text-white",
      )}
    >
      <Icon className={cn("hidden size-4 sm:block", highlight ? "text-white" : "text-primary")} />
      <dt className={highlight ? "text-blue-100" : "text-muted-foreground"}>{label}</dt>
      <dd className="text-sm font-bold tabular-nums">{value}</dd>
    </div>
  );
}

function FormCard({ form }: { form: FormEntry }) {
  const ready = Boolean(form.href);

  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-[14px]",
            ready ? "bg-secondary text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          <FileTextIcon className="size-[22px]" strokeWidth={1.7} />
        </span>
        <span
          className={cn(
            "rounded-lg px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
            ready
              ? "bg-[#ddf8eb] text-[#08734d] dark:bg-emerald-900/50 dark:text-emerald-300"
              : "bg-[#fff2d7] text-[#996000] dark:bg-amber-900/50 dark:text-amber-300",
          )}
        >
          {ready ? "พร้อมใช้งาน" : "อยู่ระหว่างพัฒนา"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <p className="text-[11px] font-bold tracking-[0.08em] text-[#5d83b2] uppercase">{form.code}</p>
        <h2 className="text-[15px] leading-snug font-semibold">{form.title}</h2>
        <p className="text-xs leading-relaxed text-muted-foreground">{form.description}</p>
      </div>

      <div className="flex items-center justify-between border-t pt-3.5 text-xs">
        {ready ? (
          <>
            <span className="font-semibold text-primary">เริ่มกรอกแบบฟอร์ม</span>
            <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:translate-x-0.5">
              <ArrowRightIcon className="size-4" />
            </span>
          </>
        ) : (
          <span className="text-muted-foreground">เปิดให้ใช้งานเร็ว ๆ นี้</span>
        )}
      </div>
    </>
  );

  const className =
    "group relative flex min-h-60 flex-col gap-4 rounded-[22px] border bg-card p-5 shadow-[0_5px_22px_#294f8210] transition";

  return form.href ? (
    <Link
      href={form.href}
      className={cn(
        className,
        "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_9px_24px_#1a5cbb20] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring",
      )}
    >
      {body}
    </Link>
  ) : (
    <article className={cn(className, "opacity-80")}>
      {body}
    </article>
  );
}
