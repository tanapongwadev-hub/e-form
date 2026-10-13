"use client";

import { useFormContext } from "react-hook-form";
import { FileCheck2Icon, TriangleAlertIcon } from "lucide-react";
import { CheckboxField } from "@/components/form/fields";
import { FormNote, FormSection } from "@/components/form/form-section";
import { COMMON_TEXT } from "../constants";

/**
 * "การรับรองข้อมูล": the `confirm_1` declaration and the legal warning.
 * `children` adds form-specific declarations above it (e.g. Confirm[...] in 68-001-4).
 */
export function CertificationSection({ children }: { children?: React.ReactNode }) {
  const { control } = useFormContext<{ confirm_1: boolean }>();
  return (
    <FormSection icon={FileCheck2Icon} title="การรับรองข้อมูล">
      {children}
      <div className="max-h-56 overflow-y-auto rounded-[14px] border border-[#d5e2f3] bg-muted/50 p-4 has-data-checked:border-primary/40 has-data-checked:bg-secondary/60 dark:border-border">
        <CheckboxField control={control} name="confirm_1" label={COMMON_TEXT.confirm} labelClassName="font-normal" />
      </div>
      <FormNote icon={TriangleAlertIcon} tone="danger">
        {COMMON_TEXT.warning}
      </FormNote>
    </FormSection>
  );
}
