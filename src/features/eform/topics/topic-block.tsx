"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { createContext, useContext } from "react";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { CheckboxField } from "@/components/form/fields";
import { cn } from "@/lib/utils";
import type { TopicValues } from "./schema";

type TopicName = "Manager_Check" | "Accountant_Check" | "HeadOffice_Check" | "Examiner_Check" | "Beyond_Check";
export const TopicLockContext = createContext(false);

/** A change topic the applicant can tick; its fields only show (and validate) while ticked. */
export function TopicBlock({ name, label, children }: { name: TopicName; label: string; children: React.ReactNode }) {
  const { control } = useFormContext<TopicValues>();
  const checked = useWatch({ control, name });
  const locked = useContext(TopicLockContext);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[17px] border bg-card shadow-[0_4px_15px_#254b7610] transition-[border-color,box-shadow] sm:rounded-[20px]",
        checked && "border-primary/40 shadow-[0_6px_20px_#0868e814]",
      )}
    >
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3.5 transition-colors sm:px-6 sm:py-4",
          checked ? "bg-[#f3f8ff] dark:bg-secondary/40" : "hover:bg-muted/40",
        )}
      >
        <CheckboxField
          control={control}
          disabled={locked}
          name={name}
          label={label}
          className="min-w-0 flex-1"
          labelClassName="text-[13px] font-semibold sm:text-sm"
        />
        <span
          className={cn(
            "hidden shrink-0 rounded-[7px] px-2 py-0.5 text-[10px] sm:inline",
            checked ? "bg-primary text-primary-foreground" : "border text-muted-foreground",
          )}
        >
          {checked ? "ขอแก้ไข" : "ไม่แก้ไข"}
        </span>
      </div>
      {checked && <div className="flex flex-col gap-4 border-t px-4 py-5 sm:p-6">{children}</div>}
    </section>
  );
}

/** Read-only pass/fail indicator (replaces the original's "ผ่าน"/"ไม่ผ่าน" text inputs). */
export function ConditionStatus({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-[10px] border px-3 py-2.5 text-xs",
        passed
          ? "border-[#c3e8dc] bg-[#effbf6] text-[#08734d] dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-[#ffd3dc] bg-[#fff0f3] text-[#bd2946] dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
      )}
    >
      {passed ? <CheckCircle2Icon className="size-4 shrink-0" /> : <XCircleIcon className="size-4 shrink-0" />}
      <span className="flex-1">{label}</span>
      <span
        className={cn(
          "shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold",
          passed ? "bg-[#ddf8eb] dark:bg-emerald-900/50" : "bg-[#ffe7eb] dark:bg-rose-900/50",
        )}
      >
        {passed ? "ผ่าน" : "ไม่ผ่าน"}
      </span>
    </div>
  );
}

/** "จำนวน ... (คน)" summary line under a list. */
export function TotalLine({ label, value }: { label: string; value: number }) {
  return (
    <p className="text-xs text-muted-foreground">
      {label}: <span className="font-semibold text-foreground tabular-nums">{value}</span> คน
    </p>
  );
}
