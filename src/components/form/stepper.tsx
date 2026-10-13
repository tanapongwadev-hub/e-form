"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StepperStep = { title: string };

type StepperProps = {
  steps: StepperStep[];
  current: number;
  /** Furthest step reached; steps up to here can be clicked. */
  maxReached: number;
  onSelect: (index: number) => void;
};

/** Horizontal step indicator: numbered circles joined by a progress line, labels underneath. */
export function Stepper({ steps, current, maxReached, onSelect }: StepperProps) {
  return (
    <nav aria-label="ขั้นตอนการกรอกแบบฟอร์ม">
      <ol className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const reachable = i <= maxReached;
          return (
            <li
              key={step.title}
              className={cn(
                "relative flex flex-col items-center",
                // connector to the next step, drawn from this circle's centre
                i < steps.length - 1 &&
                  "after:absolute after:top-3.5 after:left-[calc(50%+14px)] after:h-0.5 after:w-[calc(100%-28px)] after:bg-[#e8eff9] sm:after:top-[17px] sm:after:left-[calc(50%+17px)] sm:after:w-[calc(100%-34px)] dark:after:bg-border",
                i < current && "after:bg-primary dark:after:bg-primary",
              )}
            >
              <button
                type="button"
                disabled={!reachable || active}
                onClick={() => onSelect(i)}
                aria-current={active ? "step" : undefined}
                className="group flex flex-col items-center gap-2 rounded-lg px-0.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default"
              >
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full border-2 bg-card text-[11px] font-semibold transition-colors sm:size-[34px] sm:text-[13px]",
                    done && "border-primary bg-primary text-primary-foreground",
                    active && "border-[#2280ff] text-primary ring-3 ring-[#edf5ff] sm:ring-5 dark:ring-primary/15",
                    !done && !active && reachable && "border-primary/50 text-primary",
                    !done && !active && !reachable && "border-[#e4edf9] text-[#8a9bb4] dark:border-border",
                    reachable && !active && "group-hover:border-primary",
                  )}
                >
                  {done ? <CheckIcon className="size-4" strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-center text-[8px] leading-tight sm:text-[11px]",
                    active ? "font-semibold text-[#165da9] dark:text-primary" : "text-[#8a9bb4]",
                  )}
                >
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
