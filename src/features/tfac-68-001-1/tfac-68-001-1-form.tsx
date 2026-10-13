"use client";

import { useMemo } from "react";
import { Controller, useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, MapPinIcon, PaperclipIcon, UsersIcon } from "lucide-react";
import { CheckboxField, RadioField, ReadonlyField, SelectField, TextField } from "@/components/form/fields";
import { FormGrid, FormSection } from "@/components/form/form-section";
import { ListEditor } from "@/components/form/list-editor";
import { receiptAddress } from "@/features/eform/applicant";
import { addressDefaults, branchSchema } from "@/features/eform/address";
import { submitApplication, type JuristicProfile, type TfacCorporate } from "@/features/eform/api";
import { SERVICE_TYPES } from "@/features/eform/constants";
import { FormWizard } from "@/features/eform/form-wizard";
import { AddressFields } from "@/features/eform/sections/address-fields";
import { AttachmentsSection } from "@/features/eform/sections/attachments-section";
import { CertificationSection } from "@/features/eform/sections/certification-section";
import { JuristicSection } from "@/features/eform/sections/juristic-section";
import { DevPayload, ReviewAttachments, ReviewCard, ReviewRow, TermsCheckbox } from "@/features/eform/sections/review";
import { TopicsSection } from "@/features/eform/topics/sections";
import { topicVisibility } from "@/features/eform/topics/schema";
import { formatMoney, parseAmount } from "@/features/eform/utils";
import { ATTACHMENTS, EXTRA_TOPICS, FORM_CODE, ISSUE_CHOICES } from "./constants";
import { buildPayload } from "./payload";
import { buildDefaultValues, createFormSchema, effectiveService, STEPS, type FormValues } from "./schema";

type Props = { profile: JuristicProfile; corporate: TfacCorporate; writeDate: string; banner?: React.ReactNode };
export function Tfac68001_1Form({ profile, corporate, writeDate, banner }: Props) {
  const schema = useMemo(() => createFormSchema(corporate, profile), [corporate, profile]);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: buildDefaultValues(profile, corporate) });
  return <FormWizard form={form} formCode={FORM_CODE} steps={STEPS} banner={banner}
    applicant={{ name: profile.nameTh, id: profile.juristicId, badge: corporate.data.Corporate_Service_Name }}
    draftScope={`${profile.juristicId}:${corporate.data.Registration_No}:${corporate.data.Corporate_Service_Name}`}
    submit={(values) => submitApplication(FORM_CODE, buildPayload(values, profile, corporate, writeDate))}
    success={(values) => ({ description: "ระบบได้รับคำร้องการแก้ไขข้อมูลนิติบุคคลของคุณแล้ว", rows: [["นิติบุคคล", profile.nameTh], ["เลขทะเบียนนิติบุคคล", profile.juristicId], ["วันที่ยื่นคำขอ", writeDate]], email: values.Applicant.Email })}
    renderStep={(step, onEdit) => <>
      {step === 0 && <JuristicSection profile={profile} address={receiptAddress(corporate)} writeDate={writeDate} officeEmail={false} telephoneRequired />}
      {step === 1 && <ChangesStep corporate={corporate} profile={profile} />}
      {step === 2 && <PeopleStep corporate={corporate} />}
      {step === 3 && <><AttachmentsSection attachments={ATTACHMENTS} title="เอกสารประกอบคำร้อง" description="รับรองสำเนาถูกต้องและประทับตรา (ถ้ามี)" /><CertificationSection /></>}
      {step === 4 && <ReviewStep profile={profile} corporate={corporate} writeDate={writeDate} onEdit={onEdit} />}
    </>} />;
}

function ChangesStep({ corporate, profile }: Pick<Props, "corporate" | "profile">) {
  const { control, setValue, getValues } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  const transformation = corporate.data.Registration_No !== profile.juristicId;
  function forceTopics(service: string, checked: boolean) {
    const v = topicVisibility(service as typeof SERVICE_TYPES[number]);
    if (checked) {
      setValue("Manager_Check", true, { shouldDirty: true });
      setValue("Accountant_Check", v.accountant, { shouldDirty: true });
      setValue("HeadOffice_Check", v.headOffice, { shouldDirty: true });
      setValue("Examiner_Check", v.examiner, { shouldDirty: true });
      setValue("Beyond_Check", v.beyond, { shouldDirty: true });
    }
  }
  return <>{EXTRA_TOPICS.map(([key, label]) => {
    if ((key === "Transformation_Check" && !transformation) || (key === "Modify_Check" && transformation)) return null;
    const checked = values[key];
    return <FormSection key={key} title={label} icon={key === "JurLocation_Check" ? MapPinIcon : Building2Icon}>
      <CheckboxField control={control} name={key} label={`ขอแก้ไข${label}`}
        disabled={(key === "Transformation_Check" && transformation) || (key === "IssueBook_Check" && (transformation || values.Modify_Check))}
        onCheckedChange={(enabled) => {
          if (key === "Modify_Check") { setValue("IssueBook_Check", enabled, { shouldDirty: true }); setValue("IssueBook.Choice", enabled ? ISSUE_CHOICES[0] : "", { shouldDirty: true }); }
          if (key === "ServiceType_Check") forceTopics(getValues("ServiceType.NewData") || corporate.data.Corporate_Service_Name, enabled);
        }} />
      {checked && <>
        {key === "Modify_Check" && <FormGrid className="md:[&>*]:col-span-6"><ReadonlyField label="ชื่อภาษาไทยเดิม" value={values.Modify.Old.NameTh} /><ReadonlyField label="ชื่อภาษาไทยใหม่" value={values.Modify.New.NameTh} /><ReadonlyField label="ชื่อภาษาอังกฤษเดิม" value={values.Modify.Old.NameEn} /><TextField control={control} name="Modify.New.NameEn" label="ชื่อภาษาอังกฤษใหม่" sanitize={(s) => s.replace(/[^A-Za-z0-9., ]/g, "")} /></FormGrid>}
        {key === "Transformation_Check" && <FormGrid className="md:[&>*]:col-span-6">{(["Old", "New"] as const).map((side) => <div key={side} className="flex flex-col gap-3 md:col-span-6"><h3 className="text-sm font-semibold">{side === "Old" ? "ข้อมูลเดิม" : "ข้อมูลใหม่"}</h3>{(["NameTh", "NameEn", "Number", "Type"] as const).map((field, i) => <ReadonlyField key={field} label={["ชื่อภาษาไทย", "ชื่อภาษาอังกฤษ", "เลขทะเบียนนิติบุคคล", "ประเภทนิติบุคคล"][i]} value={values.Transformation[side][field]} />)}</div>)}</FormGrid>}
        {key === "Capital_Check" && <FormGrid className="md:[&>*]:col-span-6"><ReadonlyField label="ทุนจดทะเบียนเดิม (บาท)" value={formatMoney(parseAmount(values.Capital.OldAmount))} /><ReadonlyField label="ทุนจดทะเบียนใหม่ (บาท)" value={formatMoney(parseAmount(values.Capital.NowAmount))} /></FormGrid>}
        {key === "ServiceType_Check" && <><ReadonlyField label="ประเภทบริการเดิม" value={corporate.data.Corporate_Service_Name} /><Controller control={control} name="ServiceType.NewData" render={({ field, fieldState }) => <div><label className="text-xs">ประเภทบริการใหม่ *</label><select aria-label="ประเภทบริการใหม่" value={field.value} onChange={(e) => { field.onChange(e.target.value); forceTopics(e.target.value, true); }} className="mt-2 h-11 w-full min-w-0 rounded-xl border bg-card px-3 text-sm"><option value="">กรุณาเลือก</option>{SERVICE_TYPES.filter((t) => t !== corporate.data.Corporate_Service_Name).map((t) => <option key={t}>{t}</option>)}</select>{fieldState.error && <p role="alert" className="text-xs text-destructive">{fieldState.error.message}</p>}</div>} /></>}
        {key === "IssueBook_Check" && <RadioField control={control} name="IssueBook.Choice" label="เหตุผล" required options={transformation || values.Modify_Check ? [ISSUE_CHOICES[0]] : ISSUE_CHOICES} disabled={transformation || values.Modify_Check} />}
        {key === "JurLocation_Check" && <LocationStep />}
      </>}
    </FormSection>;
  })}</>;
}

function LocationStep() {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  return <>
    <h3 className="text-sm font-semibold">ที่ตั้งนิติบุคคลเดิม</h3><AddressFields control={control} prefix="JurLocation.Old." old />
    <h3 className="text-sm font-semibold">ที่ตั้งนิติบุคคลใหม่</h3><AddressFields control={control} prefix="JurLocation.New." />
    <h3 className="text-sm font-semibold">สำนักงานสาขาอื่น</h3>
    <Controller control={control} name="JurLocation_Other" render={({ field, fieldState }) => <ListEditor itemLabel="สำนักงานสาขา" rows={field.value} onChange={field.onChange} schema={branchSchema} emptyRow={addressDefaults()}
      columns={[{ header: "รหัสสาขา", cell: (r) => r.Branch_Code }, { header: "ที่อยู่", cell: (r) => `${r.No} ${r.SubDistrict} ${r.District} ${r.Province} ${r.PostCode}` }, { header: "อีเมล", cell: (r) => r.Email }]}
      renderFields={(rowControl) => <AddressFields control={rowControl} branch />} error={fieldState.error?.message} />} />
    <ReadonlyField label="จำนวนที่ตั้งนิติบุคคล (รวมสำนักงานใหญ่)" value={String(values.JurLocation_Other.length + 1)} />
    <RadioField control={control} name="JurLocation.Address_Receipt" label="ที่อยู่สำหรับออกใบเสร็จรับเงิน" options={["สำนักงานใหญ่", "สำนักงานสาขา"]} required />
    {values.JurLocation.Address_Receipt === "สำนักงานสาขา" && <SelectField control={control} name="JurLocation.Address_Branch" label="สำนักงานสาขาสำหรับออกใบเสร็จ" options={values.JurLocation_Other.map((r) => r.Branch_Code)} required />}
  </>;
}

function PeopleStep({ corporate }: Pick<Props, "corporate">) {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  return <TopicsSection serviceType={effectiveService(values, corporate.data.Corporate_Service_Name)} locked={values.ServiceType_Check} />;
}

function ReviewStep({ profile, corporate, writeDate, onEdit }: Props & { onEdit: (step: number) => void }) {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  return <>
    <ReviewCard step={0} title="ข้อมูลทั่วไป" icon={Building2Icon} onEdit={onEdit}><ReviewRow label="นิติบุคคล" value={profile.nameTh} hint={profile.juristicId} /><ReviewRow label="อีเมล" value={values.Applicant.Email} /></ReviewCard>
    <ReviewCard step={1} title="ข้อมูลที่ขอแก้ไข" icon={Building2Icon} onEdit={onEdit}>{EXTRA_TOPICS.map(([key, label]) => <ReviewRow key={key} label={label} value={values[key] ? "ขอแก้ไข" : "ไม่แก้ไข"} />)}{values.ServiceType_Check && <ReviewRow label="บริการใหม่" value={values.ServiceType.NewData} />}{values.JurLocation_Check && <ReviewRow label="ที่อยู่สำหรับออกใบเสร็จ" value={values.JurLocation.Address_Receipt} hint={values.JurLocation.Address_Branch} />}</ReviewCard>
    <ReviewCard step={2} title="รายนามและบุคลากร" icon={UsersIcon} onEdit={onEdit}>{(["Manager", "Accountant", "HeadOffice", "Examiner", "Beyond"] as const).map((key, i) => <ReviewRow key={key} label={["กรรมการ", "ผู้ทำบัญชี", "หัวหน้าสำนักงาน", "ผู้สอบบัญชี", "บุคลากร"][i]} value={values[`${key}_Check`] ? "ขอแก้ไข" : "ไม่แก้ไข"} />)}</ReviewCard>
    <ReviewCard step={3} title="เอกสารและรับรอง" icon={PaperclipIcon} onEdit={onEdit}><ReviewAttachments files={ATTACHMENTS.flatMap((a) => values.attachments[a.code] ? [{ key: a.code, name: values.attachments[a.code]!.name }] : [])} /><ReviewRow label="การรับรองข้อมูล" value={values.confirm_1 ? "รับรองแล้ว" : "ยังไม่รับรอง"} /></ReviewCard>
    <TermsCheckbox /><DevPayload payload={buildPayload(values, profile, corporate, writeDate)} />
  </>;
}

