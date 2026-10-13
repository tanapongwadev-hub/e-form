"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Building2Icon, CheckIcon, ListChecksIcon, PaperclipIcon, WalletIcon } from "lucide-react";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import type { ServiceType } from "@/features/eform/constants";
import {
  DevPayload,
  ReviewAttachments,
  ReviewCard,
  ReviewEmpty,
  ReviewRow,
  ReviewStatus,
  TermsCheckbox,
} from "@/features/eform/sections/review";
import { formatThaiDate } from "@/features/eform/utils";
import { buildPayload } from "../defaults";
import type { FormValues } from "../schema";
import { STEPS } from "../steps";

type Props = {
  profile: JuristicProfile;
  corporate: TfacCorporate;
  serviceType: ServiceType;
  writeDate: string;
  onEdit: (step: number) => void;
};

export function ReviewSection({ profile, corporate, serviceType, writeDate, onEdit }: Props) {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;
  const p = buildPayload(values, profile, corporate, serviceType, writeDate);
  const a = p.Applicant;

  const topics = [
    p.Manager_Check === "1" && {
      label: "รายนามกรรมการ/หุ้นส่วนผู้จัดการ",
      detail: `${p.Manager.length} คน · ผู้มีอำนาจลงนาม ${p.Manager_TotalAmount} คน`,
    },
    p.Accountant_Check === "1" && { label: "รายนามผู้ทำบัญชี", detail: `${p.Accountant.length} คน` },
    p.HeadOffice && {
      label: "หัวหน้าสำนักงาน",
      detail: `${p.HeadOffice.Title}${p.HeadOffice.Name} ${p.HeadOffice.Lastname}`,
    },
    p.Examiner_Check === "1" && { label: "รายนามผู้สอบบัญชีรับอนุญาต", detail: `${p.Examiner.length} คน` },
    p.Beyond && {
      label: "ข้อมูลพนักงานและผู้สอบบัญชี",
      detail: `รวม ${p.Beyond.Editdata.TotalAmount} ราย (เดิม ${p.Beyond.Lastdata.TotalAmount} ราย)`,
    },
  ].filter((t): t is { label: string; detail: string } => !!t);

  return (
    <div className="flex flex-col gap-3.5 sm:gap-[18px]">
      <ReviewCard step={0} title={STEPS[0].title} icon={Building2Icon} onEdit={onEdit}>
        <ReviewRow label="นิติบุคคล" value={a.Name} hint={a.JuristicId} />
        <ReviewRow
          label="ที่อยู่"
          value={[
            a.Address.AddressNo,
            a.Address.BuildingName &&
              (a.Address.BuildingName.startsWith("อาคาร") ? a.Address.BuildingName : `อาคาร${a.Address.BuildingName}`),
            a.Address.FloorNo && `ชั้น ${a.Address.FloorNo}`,
            a.Address.Soi && `ซ.${a.Address.Soi}`,
            a.Address.Road && `ถ.${a.Address.Road}`,
            a.Address.SubDistrict,
            a.Address.District,
            a.Address.Province,
            a.Address.PostCode,
          ]
            .filter(Boolean)
            .join(" ")}
        />
        <ReviewRow label="อีเมลสำหรับติดต่อ" value={a.Email} />
        <ReviewRow label="อีเมลสำนักงาน" value={a.OfficeEmail} />
        <ReviewRow label="โทรศัพท์" value={[a.Mobile, a.Telephone].filter(Boolean).join(" · ")} />
      </ReviewCard>

      <ReviewCard step={1} title={STEPS[1].title} icon={WalletIcon} onEdit={onEdit}>
        <ReviewRow label="ประเภทการให้บริการ" value={p.Retrospect.AccountType} />
        <ReviewRow label="รอบปีบัญชีสิ้นสุด" value={formatThaiDate(p.Retrospect.EndDate)} />
        <ReviewRow
          label="รวมรายได้ค่าบริการ"
          value={`${p.Retrospect.ServiceIncome} บาท`}
          hint={p.Retrospect.ServiceIncomeText}
          emphasis
        />
      </ReviewCard>

      <ReviewCard step={2} title={STEPS[2].title} icon={ListChecksIcon} onEdit={onEdit}>
        {topics.length ? (
          <ul className="flex flex-col gap-2">
            {topics.map((t) => (
              <li
                key={t.label}
                className="flex flex-col gap-0.5 rounded-xl border bg-muted/40 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="flex items-center gap-2 text-xs font-semibold">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                  {t.label}
                </span>
                <span className="pl-7 text-xs text-muted-foreground tabular-nums sm:pl-0">{t.detail}</span>
              </li>
            ))}
          </ul>
        ) : (
          <ReviewEmpty>ไม่ได้เลือกหัวข้อที่ขอแก้ไข</ReviewEmpty>
        )}
        {p.Manager_Check === "1" && (
          <div className="flex flex-wrap gap-2">
            <ReviewStatus label="บัตรประชาชนและสัญชาติ" passed={!!p.conIdCardNation} />
            {serviceType !== "ทำบัญชี" && <ReviewStatus label="ผู้สอบบัญชี" passed={!!p.conAudit} />}
            <ReviewStatus label="กรรมการผู้มีอำนาจ" passed={!!p.conNumber} />
          </div>
        )}
      </ReviewCard>

      <ReviewCard step={3} title={STEPS[3].title} icon={PaperclipIcon} onEdit={onEdit}>
        <ReviewAttachments files={p.ApplicationAttachments.map((f) => ({ key: f.FileTypeCode, name: f.file }))} />
        <ReviewStatus label="รับรองความถูกต้องของข้อมูล" passed={p.confirm_1 === "1"} />
      </ReviewCard>

      <TermsCheckbox />
      <DevPayload payload={p} />
    </div>
  );
}
