"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CopyIcon, MailIcon } from "lucide-react";
import { toast } from "sonner";
import { FormNote } from "@/components/form/form-section";
import { Button } from "@/components/ui/button";

export type SuccessInfo = {
  /** e.g. "ระบบได้รับคำร้องการต่ออายุทะเบียนนิติบุคคลของคุณแล้ว" */
  description: string;
  rows: [label: string, value: string][];
  email: string;
};

/** Confirmation shown after a request is submitted. */
export function SuccessPanel({ referenceNo, description, rows, email }: SuccessInfo & { referenceNo: string }) {
  const ref = useRef<HTMLElement>(null);

  // The form above was long; bring the confirmation into view.
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(referenceNo);
      toast.success("คัดลอกเลขที่คำร้องแล้ว");
    } catch {
      toast.error("คัดลอกไม่สำเร็จ");
    }
  }

  return (
    <section
      ref={ref}
      aria-labelledby="success-title"
      className="mx-auto w-full max-w-xl overflow-hidden rounded-[22px] border bg-card shadow-[0_5px_22px_#294f8210]"
    >
      <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-[#effbf6] to-card px-6 pt-10 pb-6 text-center dark:from-emerald-950/30">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#ddf8eb] text-[#08734d] ring-8 ring-[#effbf6]/80 dark:bg-emerald-900/60 dark:text-emerald-300 dark:ring-emerald-950/40">
          <CheckIcon className="size-8" strokeWidth={3} />
        </span>
        <div>
          <h2 id="success-title" className="text-[22px] font-bold tracking-tight">
            ส่งคำร้องเรียบร้อยแล้ว
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="flex flex-col gap-5 px-5 pb-6 sm:px-7 sm:pb-7">
        <div className="flex items-center gap-3 rounded-[14px] border border-[#d6e6fb] bg-[#f3f8ff] px-4 py-3 dark:border-border dark:bg-secondary/40">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">เลขที่คำร้อง</p>
            <p className="truncate font-mono text-lg font-bold tracking-wide text-[#075cbf] dark:text-primary">{referenceNo}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-9 shrink-0 rounded-[10px] px-3 text-xs"
            onClick={() => void copyReference()}
          >
            <CopyIcon />
            คัดลอก
          </Button>
        </div>

        <dl className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-x-4 text-xs">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="border-b border-dashed py-2.5 text-muted-foreground">{label}</dt>
              <dd className="border-b border-dashed py-2.5 font-medium [overflow-wrap:anywhere]">{value}</dd>
            </div>
          ))}
          <dt className="py-2.5 text-muted-foreground">สถานะ</dt>
          <dd className="py-2.5">
            <span className="inline-block rounded-lg bg-[#fff2d7] px-2.5 py-0.5 text-[11px] font-medium text-[#996000] dark:bg-amber-900/50 dark:text-amber-300">
              รอตรวจสอบ
            </span>
          </dd>
        </dl>

        <FormNote icon={MailIcon} tone="info">
          สภาวิชาชีพบัญชีจะแจ้งผลการพิจารณาไปยังอีเมล <b className="font-semibold [overflow-wrap:anywhere]">{email}</b>
          {" "}กรุณาเก็บเลขที่คำร้องไว้สำหรับติดตามสถานะ
        </FormNote>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button variant="outline" className="h-11 rounded-[10px] text-xs" nativeButton={false} render={<Link href="/forms" />}>
            <ArrowLeftIcon />
            กลับไปหน้าแบบฟอร์ม
          </Button>
          <Button className="h-11 rounded-[10px] text-xs" nativeButton={false} render={<Link href="/" />}>
            ไปหน้าแดชบอร์ด
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </section>
  );
}
