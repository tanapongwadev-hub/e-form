"use client";

import { useFormContext } from "react-hook-form";
import { CheckCircle2Icon, CodeIcon, FileTextIcon, PencilIcon, XCircleIcon, type LucideIcon } from "lucide-react";
import { CheckboxField } from "@/components/form/fields";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COMMON_TEXT } from "../constants";

/** Summary card for one step of the review page, with a shortcut back to that step. */
export function ReviewCard({
  step,
  title,
  icon: Icon,
  onEdit,
  children,
}: {
  step: number;
  title: string;
  icon: LucideIcon;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[17px] border bg-card shadow-[0_4px_15px_#254b7610] sm:rounded-[20px]">
      <header className="flex items-center gap-2.5 border-b px-4 py-3.5 sm:gap-3 sm:px-6 sm:py-4">
        <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-secondary text-primary sm:size-[39px] sm:rounded-xl">
          <Icon className="size-5" strokeWidth={1.7} />
        </span>
        <div className="flex min-w-0 flex-col">
          <h3 className="text-sm font-semibold sm:text-[15px]">{title}</h3>
          <p className="text-[10px] text-muted-foreground sm:text-[11px]">ขั้นที่ {step + 1}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto h-8 rounded-lg px-2.5 text-xs text-primary hover:bg-secondary hover:text-primary"
          onClick={() => onEdit(step)}
          aria-label={`แก้ไข${title}`}
        >
          <PencilIcon />
          แก้ไข
        </Button>
      </header>
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 sm:py-5">{children}</div>
    </section>
  );
}

export function ReviewRow({
  label,
  value,
  hint,
  emphasis,
}: {
  label: string;
  value: string;
  hint?: string;
  emphasis?: boolean;
}) {
  return (
    <div className="grid gap-0.5 border-b border-dashed pb-3 text-xs last:border-0 last:pb-0 sm:grid-cols-[13rem_1fr] sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("[overflow-wrap:anywhere] whitespace-pre-line", emphasis ? "text-sm font-semibold" : "font-medium")}>
        {value || "-"}
        {hint && <span className="block text-[11px] font-normal text-muted-foreground">{hint}</span>}
      </span>
    </div>
  );
}

export function ReviewEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed bg-muted/40 px-4 py-3 text-center text-xs text-muted-foreground">
      {children}
    </p>
  );
}

export function ReviewStatus({ label, passed }: { label: string; passed: boolean }) {
  const Icon = passed ? CheckCircle2Icon : XCircleIcon;
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium",
        passed
          ? "bg-[#ddf8eb] text-[#08734d] dark:bg-emerald-950/50 dark:text-emerald-300"
          : "bg-[#ffe7eb] text-[#bd2946] dark:bg-rose-950/50 dark:text-rose-300",
      )}
    >
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

/** Uploaded files as green chips (or an empty note). */
export function ReviewAttachments({ files }: { files: { key: string; name: string }[] }) {
  if (!files.length) return <ReviewEmpty>ยังไม่ได้แนบเอกสาร</ReviewEmpty>;
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {files.map((f) => (
        <li
          key={f.key}
          className="flex min-w-0 items-center gap-2.5 rounded-[10px] border border-[#c3e8dc] bg-[#f4fcf8] px-3 py-2.5 text-xs dark:border-emerald-900 dark:bg-emerald-950/20"
        >
          <FileTextIcon className="size-[18px] shrink-0 text-[#08734d] dark:text-emerald-300" strokeWidth={1.7} />
          <span className="truncate font-medium">{f.name}</span>
        </li>
      ))}
    </ul>
  );
}

/** "คลิกเพื่อยอมรับเงื่อนไขการให้บริการ…" — every form binds it to `acceptTermOfService`. */
export function TermsCheckbox() {
  const { control } = useFormContext<{ acceptTermOfService: boolean }>();
  return (
    <div className="rounded-[17px] border border-primary/30 bg-[#f3f8ff] px-4 py-4 shadow-[0_4px_15px_#254b7610] has-data-checked:border-primary/60 sm:rounded-[20px] sm:px-6 sm:py-5 dark:bg-secondary/40">
      <CheckboxField
        control={control}
        name="acceptTermOfService"
        label={COMMON_TEXT.terms}
        labelClassName="text-[13px] font-semibold"
      />
    </div>
  );
}

/** Collapsed JSON of the payload, for checking the backend contract during development. */
export function DevPayload({ payload }: { payload: unknown }) {
  return (
    <details className="group rounded-[14px] border border-dashed text-xs">
      <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-muted-foreground select-none hover:text-foreground">
        <CodeIcon className="size-4" />
        สำหรับนักพัฒนา: ดูข้อมูล JSON ที่จะส่ง
      </summary>
      <pre className="max-h-96 overflow-auto rounded-b-[14px] border-t bg-muted p-4 text-[11px]">
        {JSON.stringify(payload, null, 2)}
      </pre>
    </details>
  );
}
