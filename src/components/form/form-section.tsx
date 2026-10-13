import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FormSectionProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  /** Small pill at the right of the header, e.g. "อ่านอย่างเดียว". */
  tag?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** Card grouping related fields. */
export function FormSection({ title, description, icon: Icon, tag, className, children }: FormSectionProps) {
  return (
    <section
      className={cn(
        "flex flex-col gap-5 rounded-[17px] border bg-card px-4 py-5 shadow-[0_4px_15px_#254b7610] sm:rounded-[20px] md:gap-6 md:p-6",
        className,
      )}
    >
      <header className="flex items-center gap-2.5 sm:gap-3">
        {Icon && (
          <span className="flex size-[34px] shrink-0 items-center justify-center rounded-[10px] bg-secondary text-primary sm:size-[39px] sm:rounded-xl">
            <Icon className="size-5" strokeWidth={1.7} />
          </span>
        )}
        <div className="flex min-w-0 flex-col">
          <h3 className="text-sm font-semibold sm:text-[15px]">{title}</h3>
          {description && <div className="text-[10px] text-muted-foreground sm:text-[11px]">{description}</div>}
        </div>
        {tag && (
          <span className="ml-auto shrink-0 rounded-[7px] border px-2 py-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
            {tag}
          </span>
        )}
      </header>
      {children}
    </section>
  );
}

/** Heading for a group of fields inside a section. */
export function FormSubheading({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h4 className={cn("text-sm font-medium text-foreground md:col-span-12", className)}>{children}</h4>;
}

/** 12-column responsive grid; children set their width with `md:col-span-*`. */
export function FormGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-12 md:gap-y-5", className)}>{children}</div>;
}

const NOTE_TONES = {
  amber: "rounded-[10px] bg-[#fffae9] px-3 py-2.5 text-[#a0712b] dark:bg-amber-950/40 dark:text-amber-200",
  info: "rounded-[13px] border border-[#d6e6fb] bg-[#f3f8ff] px-4 py-3 text-[#38618d] dark:border-border dark:bg-secondary dark:text-secondary-foreground",
  danger: "rounded-[10px] border border-[#ffd3dc] bg-[#fff0f3] px-3 py-2.5 text-[#a72143] dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300",
  muted: "text-muted-foreground",
} as const;

/** Tinted note (amber = attention, info = guidance, danger = legal warning, muted = plain hint). */
export function FormNote({
  icon: Icon,
  tone = "amber",
  className,
  children,
}: {
  icon: LucideIcon;
  tone?: keyof typeof NOTE_TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start gap-2 text-[11px] leading-relaxed", NOTE_TONES[tone], className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
