import { z } from "zod";
import {
  applicantContactDefaults,
  applicantContactSchema,
  checkApplicantContact,
} from "@/features/eform/applicant";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import { attachmentsSchema, checkAttachments, emptyAttachments } from "@/features/eform/attachments";
import {
  COLLATERAL_TYPES,
  collateralByLabel,
  collateralRowSchemaShape,
  rowsFromGuarantee,
  type CollateralKey,
  type CollateralRow,
} from "@/features/eform/collateral";
import type { WizardStep } from "@/features/eform/form-wizard";
import { ATTACHMENTS } from "./constants";

const rows = z.array(collateralRowSchemaShape);

const baseSchema = z.object({
  Applicant: applicantContactSchema,
  /** Label of the new collateral type (radio value in the original). */
  New_Guarantee: z.string(),
  /** One list per type, like the original's separate list-fields; only the chosen type is sent. */
  New: z.object({ Deposit: rows, Card: rows, BillGov: rows, BillCorp: rows, Policy: rows }),
  Confirm: z.object({ DueDate: z.boolean(), Change: z.boolean() }),
  confirm_1: z.boolean(),
  attachments: attachmentsSchema(ATTACHMENTS),
  acceptTermOfService: z.boolean(),
});
export type FormValues = z.infer<typeof baseSchema>;

/** Current collateral from the API: its type is fixed and can't be chosen again as the new one. */
export function currentCollateral(corporate: TfacCorporate): { key: CollateralKey; label: string; rows: CollateralRow[] } | null {
  const first = corporate.guarantee[0];
  const type = COLLATERAL_TYPES.find((t) => t.id === first?.Guarantee_Type_ID);
  return type ? { key: type.key, label: type.label, rows: rowsFromGuarantee(corporate.guarantee) } : null;
}

/** Rules ported from start1() in the original form's script. */
export function createFormSchema(oldLabel: string | undefined) {
  return baseSchema.superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });

    checkApplicantContact(data.Applicant, ctx);

    const type = collateralByLabel(data.New_Guarantee);
    if (!type) issue(["New_Guarantee"], "กรุณาเลือกหลักประกันใหม่");
    else if (type.label === oldLabel) issue(["New_Guarantee"], "หลักประกันใหม่ต้องเป็นคนละประเภทกับหลักประกันเดิม");
    else if (!data.New[type.key].length) issue(["New", type.key], `กรุณาเพิ่มข้อมูล${type.label} อย่างน้อย 1 รายการ`);

    if (!data.Confirm.DueDate) issue(["Confirm", "DueDate"], "กรุณายืนยันข้อความนี้");
    if (!data.Confirm.Change) issue(["Confirm", "Change"], "กรุณายืนยันข้อความนี้");
    if (!data.confirm_1) issue(["confirm_1"], "กรุณายืนยันการรับรองข้อมูล");
    checkAttachments(ATTACHMENTS, data.attachments, ctx);
    if (!data.acceptTermOfService) issue(["acceptTermOfService"], "กรุณาคลิกยอมรับเงื่อนไขการให้บริการ");
  });
}

export function buildDefaultValues(profile: JuristicProfile, corporate: TfacCorporate): FormValues {
  return {
    Applicant: applicantContactDefaults(profile, corporate),
    New_Guarantee: "",
    New: { Deposit: [], Card: [], BillGov: [], BillCorp: [], Policy: [] },
    // Both declarations start ticked in the original (checked="checked").
    Confirm: { DueDate: true, Change: true },
    confirm_1: false,
    attachments: emptyAttachments(ATTACHMENTS),
    acceptTermOfService: false,
  };
}

export const STEPS: WizardStep<FormValues>[] = [
  {
    title: "ข้อมูลทั่วไป",
    heading: "ข้อมูลนิติบุคคลและการติดต่อ",
    description: "ตรวจสอบข้อมูลนิติบุคคลที่ดึงมาจากระบบ และกรอกข้อมูลสำหรับติดต่อกลับ",
    fields: ["Applicant"],
  },
  {
    title: "หลักประกัน",
    heading: "ข้อมูลการแจ้งเปลี่ยนแปลงประเภทหลักประกัน",
    description: "ตรวจสอบหลักประกันเดิม เลือกประเภทหลักประกันใหม่ และเพิ่มรายละเอียด",
    fields: ["New_Guarantee", "New"],
  },
  {
    title: "เอกสารและรับรอง",
    heading: "เอกสารแนบและการรับรองข้อมูล",
    description: "แนบหลักฐานการเปลี่ยนแปลงหลักประกัน พร้อมรับรองข้อมูล",
    fields: ["attachments", "Confirm", "confirm_1"],
  },
  {
    title: "ตรวจสอบและส่ง",
    heading: "ตรวจสอบข้อมูลก่อนส่งคำร้อง",
    description: 'ตรวจสอบความถูกต้องของข้อมูลทั้งหมด หากต้องการแก้ไขให้กด "แก้ไข" ที่หัวข้อนั้น',
    fields: ["acceptTermOfService"],
  },
];
