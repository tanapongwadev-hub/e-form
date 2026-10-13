import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatBoxProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Highlighted blue-gradient variant. */
  primary?: boolean;
  unit?: string;
  href?: string;
};

/** Summary card: icon + label, a big number and a faint watermark icon. The whole card links to `href`. */
export function StatBox({ label, value, icon: Icon, primary = false, unit = "รายการ", href }: StatBoxProps) {
  const className = cn(
    "relative block min-h-36 overflow-hidden rounded-[22px] border p-4 text-left shadow-[0_5px_22px_#294f8210] transition hover:-translate-y-0.5 hover:shadow-[0_9px_24px_#1a5cbb20] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ring sm:min-h-40 sm:p-5",
    primary ? "border-transparent bg-gradient-to-br from-[#157df6] to-[#1560e2] text-white" : "bg-card",
  );
  const body = (
    <>
      <span className="relative z-10 flex items-center gap-2.5 text-xs font-semibold sm:text-[13px]">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-xl sm:size-9",
            primary ? "bg-white/15 text-white" : "bg-secondary text-primary",
          )}
        >
          <Icon className="size-5" />
        </span>
        {label}
      </span>
      <span className="relative z-10 mt-3 block text-[32px] leading-tight font-bold tracking-tight sm:text-[38px]">
        {value}
      </span>
      <span className={cn("relative z-10 text-[11px]", primary ? "text-blue-100" : "text-muted-foreground")}>{unit}</span>
      <Icon
        aria-hidden
        className={cn("absolute right-4 bottom-4 size-11 sm:size-14", primary ? "text-white/10" : "text-secondary")}
        strokeWidth={1.5}
      />
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}
