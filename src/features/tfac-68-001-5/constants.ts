import type { AttachmentSpec } from "@/features/eform/attachments";

export const FORM_CODE = "tfac-68-001-5";
export const FORM_TITLE = "การเลิกการให้บริการด้านการสอบบัญชีหรือทำบัญชี";

/** CancelType[Topic] options (values are sent as-is, like the original radio buttons). */
export const CANCEL_TOPICS = [
  "เลิกกิจการ (โปรดระบุเหตุผล)",
  "เปลี่ยนแปลงวัตถุประสงค์ (โปรดระบุเหตุผล)",
  "อื่น ๆ (โปรดระบุเหตุผล)",
] as const;

export const ATTACHMENTS: AttachmentSpec[] = [
  {
    code: "file_applicant_3_month",
    label: "สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล มีอายุไม่เกิน 3 เดือน",
    required: true,
    accept: ".pdf,.jpg,.jpeg",
  },
  {
    code: "image_authorization_id_card",
    label: "สำเนาบัตรประจำตัวประชาชนของกรรมการ/หุ้นส่วนผู้จัดการผู้มีอำนาจลงนาม",
    required: true,
  },
  { code: "OtherDoc", label: "เอกสารอื่น ๆ", required: false },
];

export const TEXT = {
  intro:
    "ข้าพเจ้าขอแก้ไขข้อมูลนิติบุคคลที่ได้แจ้งจดทะเบียนไว้กับสภาวิชาชีพบัญชีตามมาตรา 11 และมาตรา 78 พระราชบัญญัติวิชาชีพบัญชี พ.ศ. 2547 โดยมีรายละเอียดดังนี้ (กรุณาเลือกหัวข้อที่มีความประสงค์)",
  evidence:
    "แนบหลักฐานที่แสดงว่าได้ยกเลิกการจดทะเบียนนิติบุคคล หรือยกเลิกการให้บริการด้านการทำบัญชี หรือด้านการสอบบัญชี",
  attachmentsTitle: "หลักฐานการจดทะเบียนเลิกให้บริการด้านการสอบบัญชีหรือด้านการทำบัญชี",
  attachmentsDescription: "พร้อมรับรองสำเนาถูกต้องและประทับตรา (ถ้ามี)",
};
