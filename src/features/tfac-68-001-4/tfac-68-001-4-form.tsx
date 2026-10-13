"use client";

import { useMemo } from "react";
import { Controller, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, HistoryIcon, InfoIcon, PaperclipIcon, ShieldCheckIcon, TriangleAlertIcon } from "lucide-react";
import { CheckboxField, RadioField, ReadonlyField } from "@/components/form/fields";
import { FormGrid, FormNote, FormSection } from "@/components/form/form-section";
import { receiptAddress } from "@/features/eform/applicant";
import { submitApplication, type JuristicProfile, type TfacCorporate } from "@/features/eform/api";
import {
  COLLATERAL_TYPES,
  collateralByLabel,
  moneyText,
  sumCollateral,
  type CollateralRow,
} from "@/features/eform/collateral";
import { FormWizard } from "@/features/eform/form-wizard";
import { AttachmentsSection } from "@/features/eform/sections/attachments-section";
import { CertificationSection } from "@/features/eform/sections/certification-section";
import { CollateralList } from "@/features/eform/sections/collateral-list";
import { JuristicSection } from "@/features/eform/sections/juristic-section";
import {
  DevPayload,
  ReviewAttachments,
  ReviewCard,
  ReviewRow,
  ReviewStatus,
  TermsCheckbox,
} from "@/features/eform/sections/review";
import { formatMoney } from "@/features/eform/utils";
import { ATTACHMENTS, FORM_CODE, TEXT } from "./constants";
import { buildPayload } from "./payload";
import { STEPS, buildDefaultValues, createFormSchema, currentCollateral, type FormValues } from "./schema";

type Props = {
  profile: JuristicProfile;
  corporate: TfacCorporate;
  writeDate: string;
  /** Today as YYYY-MM-DD: due dates can't be earlier (datepicker min in the original). */
  minDueDate: string;
};

export function Tfac68001_4Form({ profile, corporate, writeDate, minDueDate }: Props) {
  const old = useMemo(() => currentCollateral(corporate), [corporate]);
  const schema = useMemo(() => createFormSchema(old?.label), [old]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(profile, corporate),
  });

  return (
    <FormWizard
      form={form}
      formCode={FORM_CODE}
      steps={STEPS}
      applicant={{ name: profile.nameTh, id: profile.juristicId, badge: old ? `เดิม: ${old.label}` : undefined }}
      draftScope={profile.juristicId}
      submit={(values) => submitApplication(FORM_CODE, buildPayload(values, profile, corporate, writeDate))}
      success={(values) => ({
        description: "ระบบได้รับคำร้องการเปลี่ยนแปลงประเภทของหลักประกันของคุณแล้ว",
        rows: [
          ["นิติบุคคล", profile.nameTh],
          ["หลักประกันเดิม", old?.label ?? "-"],
          ["หลักประกันใหม่", values.New_Guarantee],
          ["วันที่ยื่นคำขอ", writeDate],
        ],
        email: values.Applicant.Email,
      })}
      renderStep={(step, goTo) => (
        <>
          {step === 0 && <JuristicSection profile={profile} address={receiptAddress(corporate)} writeDate={writeDate} />}
          {step === 1 && <CollateralStep old={old} minDueDate={minDueDate} accountName={profile.nameTh} />}
          {step === 2 && <DocumentsStep />}
          {step === 3 && (
            <ReviewStep profile={profile} corporate={corporate} writeDate={writeDate} onEdit={goTo} />
          )}
        </>
      )}
    />
  );
}

type Current = ReturnType<typeof currentCollateral>;

function Totals({ label, rows }: { label: string; rows: CollateralRow[] }) {
  const total = sumCollateral(rows);
  return (
    <FormGrid>
      <ReadonlyField label={`จำนวนหลักประกัน${label}รวมทั้งหมด (บาท)`} value={formatMoney(total)} className="md:col-span-5" />
      <ReadonlyField label="จำนวนเงิน (ตัวอักษร)" value={moneyText(String(total))} className="md:col-span-7" />
    </FormGrid>
  );
}

function CollateralStep({ old, minDueDate, accountName }: { old: Current; minDueDate: string; accountName: string }) {
  const { control } = useFormContext<FormValues>();
  const label = useWatch({ control, name: "New_Guarantee" });
  const next = collateralByLabel(label);
  const newRows = useWatch({ control, name: "New" });

  return (
    <>
      <FormNote icon={InfoIcon} tone="info">
        {TEXT.intro}
      </FormNote>

      <FormSection icon={HistoryIcon} title="หลักประกันเดิม" description="ข้อมูลที่แจ้งไว้กับสภาวิชาชีพบัญชี" tag="อ่านอย่างเดียว">
        {old ? (
          <>
            <FormGrid>
              <ReadonlyField label="ประเภทหลักประกันเดิม" value={old.label} className="md:col-span-12" />
            </FormGrid>
            <CollateralList type={old.key} rows={old.rows} readOnly />
            <Totals label="เดิม" rows={old.rows} />
          </>
        ) : (
          <FormNote icon={TriangleAlertIcon}>ไม่พบข้อมูลหลักประกันเดิมในระบบ กรุณาติดต่อสภาวิชาชีพบัญชี</FormNote>
        )}
      </FormSection>

      <FormSection icon={ShieldCheckIcon} title="หลักประกันใหม่" description="เลือกได้เพียง 1 ประเภท แล้วเพิ่มรายละเอียด">
        <RadioField
          control={control}
          name="New_Guarantee"
          label="ประเภทหลักประกันใหม่"
          // The current type is hidden from the choices, as in the original.
          options={COLLATERAL_TYPES.map((t) => t.label).filter((l) => l !== old?.label)}
          orientation="vertical"
          required
        />
        {next && (
          <>
            <Controller
              // Remount per type so each list keeps its own rows (separate list-fields in the original).
              key={next.key}
              control={control}
              name={`New.${next.key}`}
              render={({ field, fieldState }) => (
                <CollateralList
                  type={next.key}
                  rows={field.value}
                  onChange={field.onChange}
                  minDueDate={minDueDate}
                  defaultAccountName={accountName}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Totals label="ใหม่" rows={newRows[next.key]} />
          </>
        )}
      </FormSection>
    </>
  );
}

function DocumentsStep() {
  const { control } = useFormContext<FormValues>();
  const box =
    "rounded-[14px] border border-[#d5e2f3] bg-muted/50 p-4 has-data-checked:border-primary/40 has-data-checked:bg-secondary/60 dark:border-border";
  return (
    <>
      <AttachmentsSection title={TEXT.attachmentsTitle} description={TEXT.attachmentsDescription} attachments={ATTACHMENTS} />
      <CertificationSection>
        <div className={box}>
          <CheckboxField control={control} name="Confirm.DueDate" label={TEXT.confirmDueDate} labelClassName="font-normal" />
        </div>
        <div className={box}>
          <CheckboxField control={control} name="Confirm.Change" label={TEXT.confirmChange} labelClassName="font-normal" />
        </div>
        <FormNote icon={InfoIcon} tone="muted">
          {TEXT.changeDuty}
        </FormNote>
      </CertificationSection>
    </>
  );
}

function ReviewStep({
  profile,
  corporate,
  writeDate,
  onEdit,
}: {
  profile: JuristicProfile;
  corporate: TfacCorporate;
  writeDate: string;
  onEdit: (step: number) => void;
}) {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  const old = currentCollateral(corporate);
  const next = collateralByLabel(values.New_Guarantee);
  const newRows = next ? values.New[next.key] : [];

  return (
    <div className="flex flex-col gap-3.5 sm:gap-[18px]">
      <ReviewCard step={0} title={STEPS[0].title} icon={Building2Icon} onEdit={onEdit}>
        <ReviewRow label="นิติบุคคล" value={profile.nameTh} hint={profile.juristicId} />
        <ReviewRow label="อีเมลสำหรับติดต่อ" value={values.Applicant.Email} />
        <ReviewRow label="อีเมลสำนักงาน" value={values.Applicant.OfficeEmail} />
        <ReviewRow label="โทรศัพท์" value={[values.Applicant.Mobile, values.Applicant.Telephone].filter(Boolean).join(" · ")} />
      </ReviewCard>

      <ReviewCard step={1} title={STEPS[1].title} icon={ShieldCheckIcon} onEdit={onEdit}>
        <ReviewRow
          label="หลักประกันเดิม"
          value={old?.label ?? "-"}
          hint={old ? `${old.rows.length} รายการ · ${formatMoney(sumCollateral(old.rows))} บาท` : undefined}
        />
        <ReviewRow
          label="หลักประกันใหม่"
          value={values.New_Guarantee}
          hint={next ? `${newRows.length} รายการ` : undefined}
        />
        <ReviewRow
          label="จำนวนหลักประกันใหม่รวม"
          value={`${formatMoney(sumCollateral(newRows))} บาท`}
          hint={moneyText(String(sumCollateral(newRows)))}
          emphasis
        />
      </ReviewCard>

      <ReviewCard step={2} title={STEPS[2].title} icon={PaperclipIcon} onEdit={onEdit}>
        <ReviewAttachments
          files={ATTACHMENTS.flatMap((a) => {
            const file = values.attachments[a.code];
            return file ? [{ key: a.code, name: file.name }] : [];
          })}
        />
        <div className="flex flex-wrap gap-2">
          <ReviewStatus label="จัดให้มีหลักประกันภายใน 60 วัน" passed={values.Confirm.DueDate} />
          <ReviewStatus label="เปิดเผยข้อมูลหลักประกันในงบการเงิน" passed={values.Confirm.Change} />
          <ReviewStatus label="รับรองความถูกต้องของข้อมูล" passed={values.confirm_1} />
        </div>
      </ReviewCard>

      <TermsCheckbox />
      <DevPayload payload={buildPayload(values, profile, corporate, writeDate)} />
    </div>
  );
}
