import { SUBMISSION_STATUS_LABEL, type SubmissionStatus } from "@/lib/submissions";
import { cn } from "@/lib/utils";

export const STATUS_BADGE_CLASS: Record<SubmissionStatus, string> = {
  new: "bg-[#e2f1ff] text-[#0869c9] dark:bg-sky-900/50 dark:text-sky-300",
  pending: "bg-[#fff2d7] text-[#996000] dark:bg-amber-900/50 dark:text-amber-300",
  approved: "bg-[#ddf8eb] text-[#08734d] dark:bg-emerald-900/50 dark:text-emerald-300",
  rejected: "bg-[#ffe7eb] text-[#bd2946] dark:bg-rose-900/50 dark:text-rose-300",
};

export function StatusBadge({ status, className }: { status: SubmissionStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-lg px-2.5 py-0.5 text-[11px] leading-normal font-medium whitespace-nowrap",
        STATUS_BADGE_CLASS[status],
        className,
      )}
    >
      {SUBMISSION_STATUS_LABEL[status]}
    </span>
  );
}
