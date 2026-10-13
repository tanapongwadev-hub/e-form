import type { ServiceType } from "@/features/eform/constants";
import { topicVisibility } from "@/features/eform/topics/schema";

export const FORM_CODE = "tfac-68-001-3";
export const FORM_TITLE = "การต่ออายุทะเบียนนิติบุคคล";

/** Which parts of the form apply to a service type (mirrors checkTheRadioAccountType in the original form). */
export function getVisibility(serviceType: ServiceType) {
  return {
    ...topicVisibility(serviceType),
    serviceIncome: serviceType !== "สอบบัญชี",
    auditIncome: serviceType !== "ทำบัญชี",
  };
}

export const ATTACHMENTS = [
  {
    code: "file_applicant_3_month",
    label: "สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล มีอายุไม่เกิน 3 เดือน",
    required: true,
    documentTypeId: "1",
  },
  {
    code: "image_authorization_id_card",
    label: "สำเนาบัตรประจำตัวประชาชนของกรรมการ/หุ้นส่วนผู้จัดการผู้มีอำนาจลงนาม",
    required: true,
    documentTypeId: "2",
  },
  { code: "image_payment_modify", label: "เอกสารอื่น ๆ", required: false, documentTypeId: "9" },
] as const;
export type AttachmentCode = (typeof ATTACHMENTS)[number]["code"];

