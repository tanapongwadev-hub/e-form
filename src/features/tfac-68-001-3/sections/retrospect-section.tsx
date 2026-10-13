"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { BookOpenCheckIcon, CalendarIcon, SearchCheckIcon } from "lucide-react";
import { ReadonlyField, TextField } from "@/components/form/fields";
import { FormGrid, FormSection } from "@/components/form/form-section";
import { Badge } from "@/components/ui/badge";
import { type ServiceType } from "@/features/eform/constants";
import { getVisibility } from "../constants";
import { deriveIncome, type FormValues } from "../schema";
import { bahtText, formatMoney, sanitizeAmountInput } from "@/features/eform/utils";

type Props = { serviceType: ServiceType; maxEndDate: string };

export function RetrospectSection({ serviceType, maxEndDate }: Props) {
  const { control } = useFormContext<FormValues>();
  const retrospect = useWatch({ control, name: "Retrospect" });
  const v = getVisibility(serviceType);
  const income = deriveIncome(retrospect, serviceType);

  return (
    <>
      <FormSection icon={CalendarIcon} title="รอบปีบัญชี">
        <FormGrid>
          <TextField
            control={control}
            name="Retrospect.EndDate"
            label="รอบปีบัญชีสิ้นสุด (ย้อนหลัง 1 ปี)"
            type="date"
            max={maxEndDate}
            required
            className="md:col-span-6"
          />
          <div className="flex flex-col gap-2 md:col-span-6">
            <span className="text-sm font-medium">ประเภทของการให้บริการบัญชี</span>
            <div className="flex h-8 items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {serviceType}
              </Badge>
              <span className="text-xs text-muted-foreground">ตามที่จดทะเบียนไว้</span>
            </div>
          </div>
        </FormGrid>
      </FormSection>

      {v.serviceIncome && (
        <FormSection icon={BookOpenCheckIcon} title="บริการทำบัญชี">
          <IncomeFields prefix="Service" />
        </FormSection>
      )}

      {v.auditIncome && (
        <FormSection icon={SearchCheckIcon} title="บริการสอบบัญชี">
          <IncomeFields prefix="Audit" />
        </FormSection>
      )}

      <FormSection title="รายได้อื่น ๆ และรายได้รวม" description="รวมรายได้ค่าบริการต้องตรงตามงบการเงิน">
        <FormGrid>
          <TextField
            control={control}
            name="Retrospect.OtherIncome"
            label="รายได้อื่น ๆ (บาท)"
            inputMode="decimal"
            sanitize={sanitizeAmountInput}
            align="right"
            required
            className="md:col-span-6"
          />
        </FormGrid>
        <div className="flex flex-col gap-1 rounded-lg bg-primary px-5 py-4 text-primary-foreground sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm opacity-80">รวมรายได้ค่าบริการ</p>
            <p className="text-2xl font-semibold tabular-nums">{formatMoney(income.total)} บาท</p>
          </div>
          <p className="text-sm opacity-90">({bahtText(income.total)})</p>
        </div>
      </FormSection>
    </>
  );
}

function IncomeFields({ prefix }: { prefix: "Service" | "Audit" }) {
  const { control } = useFormContext<FormValues>();
  const money = useWatch({ control, name: `Retrospect.${prefix}.MoneyNumber` });
  return (
    <FormGrid>
      <TextField
        control={control}
        name={`Retrospect.${prefix}.Amount`}
        label="จำนวน (ราย)"
        inputMode="decimal"
        sanitize={sanitizeAmountInput}
        align="right"
        required
        className="md:col-span-4"
      />
      <TextField
        control={control}
        name={`Retrospect.${prefix}.MoneyNumber`}
        label="รายได้ (บาท)"
        inputMode="decimal"
        sanitize={sanitizeAmountInput}
        align="right"
        required
        className="md:col-span-4"
      />
      <ReadonlyField label="จำนวนเงิน (ตัวอักษร)" value={bahtText(money)} className="md:col-span-4" />
    </FormGrid>
  );
}
