"use client";

import { useMemo } from "react";
import { Controller, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, ShieldCheckIcon, PaperclipIcon, InfoIcon } from "lucide-react";
import { CheckboxField, RadioField, ReadonlyField, TextField } from "@/components/form/fields";
import { FormGrid, FormNote, FormSection } from "@/components/form/form-section";
import { receiptAddress } from "@/features/eform/applicant";
import { submitApplication, type JuristicProfile, type TfacCorporate } from "@/features/eform/api";
import { collateralByLabel, COLLATERAL_TYPES, sumCollateral } from "@/features/eform/collateral";
import type { ServiceType } from "@/features/eform/constants";
import { FormWizard } from "@/features/eform/form-wizard";
import { AttachmentsSection } from "@/features/eform/sections/attachments-section";
import { CertificationSection } from "@/features/eform/sections/certification-section";
import { CollateralList } from "@/features/eform/sections/collateral-list";
import { JuristicSection } from "@/features/eform/sections/juristic-section";
import { DevPayload, ReviewAttachments, ReviewCard, ReviewRow, TermsCheckbox } from "@/features/eform/sections/review";
import { TopicsSection } from "@/features/eform/topics/sections";
import { formatMoney, sanitizeAmountInput, digitsOnly } from "@/features/eform/utils";
import { ATTACHMENTS, FORM_CODE, STATEMENT_TYPES, TEXT } from "./constants";
import { buildPayload } from "./payload";
import { buildDefaultValues, createFormSchema, deriveFinancial, INCOME_FIELDS, STEPS, type FormValues } from "./schema";

type Props = { profile: JuristicProfile; corporate: TfacCorporate; writeDate: string; minDueDate: string; banner?: React.ReactNode };
export function Tfac68001_2Form(props: Props) {
  const { profile, corporate, writeDate, minDueDate } = props;
  const serviceType = corporate.data.Corporate_Service_Name;
  const schema = useMemo(() => createFormSchema(serviceType, minDueDate), [serviceType, minDueDate]);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: buildDefaultValues(profile, corporate) });
  return <FormWizard form={form} formCode={FORM_CODE} steps={STEPS}
    banner={props.banner}
    applicant={{ name: profile.nameTh, id: profile.juristicId, badge: serviceType }} draftScope={`${profile.juristicId}:${serviceType}`}
    submit={(values) => submitApplication(FORM_CODE, buildPayload(values, profile, corporate, writeDate))}
    success={(values) => ({ description: "ระบบได้รับคำร้องการแจ้งรายละเอียดเกี่ยวกับหลักประกันของคุณแล้ว", rows: [["นิติบุคคล", profile.nameTh], ["ประเภทหลักประกัน", values.AccountSavingType], ["วันที่ยื่นคำขอ", writeDate]], email: values.Applicant.Email })}
    renderStep={(step, goTo) => <>
      {step === 0 && <JuristicSection profile={profile} address={receiptAddress(corporate)} writeDate={writeDate} />}
      {step === 1 && <><FormSection icon={Building2Icon} title="รายละเอียดคำขอ" tag="ข้อมูลจากระบบ"><FormGrid className="md:[&>*]:col-span-6"><ReadonlyField label="ประเภทนิติบุคคล" value={corporate.data.Business_Name} /><ReadonlyField label="ประเภทการให้บริการ" value={serviceType} /></FormGrid></FormSection><TopicsSection serviceType={serviceType} /></>}
      {step === 2 && <FinancialStep {...props} serviceType={serviceType} />}
      {step === 3 && <><AttachmentsSection attachments={ATTACHMENTS} title="เอกสารประกอบคำร้อง" description="พร้อมรับรองสำเนาถูกต้องและประทับตรา (ถ้ามี)" /><CertificationSection><CheckboxField control={form.control} name="Confirm_DueDate_Check" label={TEXT.confirmDueDate} /><CheckboxField control={form.control} name="Confirm_Change_Check" label={TEXT.confirmChange} /></CertificationSection></>}
      {step === 4 && <ReviewStep {...props} onEdit={goTo} />}
    </>} />;
}

function FinancialStep({ serviceType, minDueDate, profile }: Props & { serviceType: ServiceType }) {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  const f = deriveFinancial(values, serviceType);
  const type = collateralByLabel(values.AccountSavingType);
  const labels = ["บริษัทจดทะเบียน — จำนวนราย", "บริษัทจดทะเบียน — รายได้ (บาท)", "ไม่ใช่บริษัทจดทะเบียน — จำนวนราย", "ไม่ใช่บริษัทจดทะเบียน — รายได้ (บาท)"];
  return <>
    <FormSection icon={Building2Icon} title="ข้อมูลทางการเงิน">
      <RadioField control={control} name="Financial.StatementType" label="ที่มาของตัวเลข" options={STATEMENT_TYPES} orientation="vertical" required />
      <FormGrid className="md:[&>*]:col-span-6"><TextField control={control} name="Financial.TotalIncomeDate" label="วันสิ้นรอบปีบัญชี" type="date" required /><ReadonlyField label="ทุน (ช่องที่ 1) (บาท)" value={formatMoney(f.capital)} /></FormGrid>
      {([2, 3] as const).filter((n) => n === 2 ? serviceType !== "สอบบัญชี" : serviceType !== "ทำบัญชี").map((n) => <div key={n} className="flex flex-col gap-3"><h3 className="text-sm font-semibold">{n === 2 ? "รายได้จากการทำบัญชี (ช่องที่ 2)" : "รายได้จากการสอบบัญชี (ช่องที่ 3)"}</h3><FormGrid className="md:[&>*]:col-span-6">{INCOME_FIELDS.map((field, i) => <TextField key={field} control={control} name={`Financial.Number${n}${field}`} label={labels[i]} sanitize={field.endsWith("Amount") ? digitsOnly : sanitizeAmountInput} inputMode="decimal" required />)}<ReadonlyField label="รายได้รวม (บาท)" value={formatMoney(n === 2 ? f.number2 : f.number3)} /></FormGrid></div>)}
      <FormGrid className="md:[&>*]:col-span-6"><ReadonlyField label="รายได้บริการรวม (ช่องที่ 2 + 3) (บาท)" value={formatMoney(f.income)} /><TextField control={control} name="AssetDetail.Current" label="สินทรัพย์หมุนเวียน (บาท)" sanitize={sanitizeAmountInput} required /><TextField control={control} name="AssetDetail.NonCurrent" label="สินทรัพย์ไม่หมุนเวียน (บาท)" sanitize={sanitizeAmountInput} required /><ReadonlyField label="สินทรัพย์รวม (บาท)" value={formatMoney(f.assets)} /></FormGrid>
    </FormSection>
    <FormSection icon={ShieldCheckIcon} title="หลักประกันเพื่อประกันความรับผิดต่อบุคคลที่สาม">
      <p className="text-xs leading-relaxed">{TEXT.intro}</p>
      <FormNote icon={InfoIcon} tone="info">หลักประกันขั้นต่ำเท่ากับ 3% ของทุนหรือรายได้บริการ แล้วแต่จำนวนใดมากกว่า</FormNote>
      <FormGrid className="md:[&>*]:col-span-6"><ReadonlyField label="ฐานคำนวณ" value={f.capitalBasis ? "ทุน" : "รายได้บริการ"} /><ReadonlyField label="หลักประกันขั้นต่ำ 3% (บาท)" value={formatMoney(f.required)} />{f.capitalBasis && <TextField control={control} name="CapitalRegister.Date" label="วันที่ของทุน ณ วันที่ยื่นจดทะเบียน / วันสิ้นรอบปีบัญชี" type="date" required />}</FormGrid>
      <RadioField control={control} name="AccountSavingType" label="ประเภทหลักประกัน" options={COLLATERAL_TYPES.map((t) => t.label)} orientation="vertical" required />
      {type && <><Controller key={type.key} control={control} name={`Collateral.${type.key}`} render={({ field, fieldState }) => <CollateralList type={type.key} rows={field.value} onChange={field.onChange} minDueDate={minDueDate} defaultAccountName={profile.nameTh} error={fieldState.error?.message} />} /><ReadonlyField label="ยอดหลักประกันรวม (บาท)" value={formatMoney(sumCollateral(values.Collateral[type.key]))} /></>}
      <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{TEXT.definitions}</p>
    </FormSection>
  </>;
}

function ReviewStep({ profile, corporate, writeDate, onEdit }: Props & { onEdit: (step: number) => void }) {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  const payload = buildPayload(values, profile, corporate, writeDate);
  return <>
    <ReviewCard step={0} title="ข้อมูลทั่วไป" icon={Building2Icon} onEdit={onEdit}><ReviewRow label="นิติบุคคล" value={profile.nameTh} hint={profile.juristicId} /><ReviewRow label="อีเมล" value={values.Applicant.Email} /></ReviewCard>
    <ReviewCard step={1} title="หัวข้อที่ขอแก้ไข" icon={Building2Icon} onEdit={onEdit}>{(["Manager", "Accountant", "HeadOffice", "Examiner", "Beyond"] as const).map((key, i) => <ReviewRow key={key} label={["กรรมการ", "ผู้ทำบัญชี", "หัวหน้าสำนักงาน", "ผู้สอบบัญชี", "บุคลากร"][i]} value={values[`${key}_Check`] ? "ขอแก้ไข" : "ไม่แก้ไข"} />)}</ReviewCard>
    <ReviewCard step={2} title="งบการเงินและหลักประกัน" icon={ShieldCheckIcon} onEdit={onEdit}><ReviewRow label="ที่มาของตัวเลข" value={values.Financial.StatementType} /><ReviewRow label="วันสิ้นรอบปีบัญชี" value={values.Financial.TotalIncomeDate} /><ReviewRow label="หลักประกันขั้นต่ำ (บาท)" value={payload.sumOldGuarantee} /><ReviewRow label="ประเภทหลักประกัน" value={values.AccountSavingType} /><ReviewRow label="ยอดหลักประกันรวม (บาท)" value={payload.sumNewGuarantee} emphasis /></ReviewCard>
    <ReviewCard step={3} title="เอกสารและรับรอง" icon={PaperclipIcon} onEdit={onEdit}><ReviewAttachments files={ATTACHMENTS.flatMap((a) => values.attachments[a.code] ? [{ key: a.code, name: values.attachments[a.code]!.name }] : [])} /><ReviewRow label="การรับรองข้อมูล" value={values.confirm_1 ? "รับรองแล้ว" : "ยังไม่รับรอง"} /></ReviewCard>
    <TermsCheckbox /><DevPayload payload={payload} />
  </>;
}

