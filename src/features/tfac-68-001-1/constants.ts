import type { AttachmentSpec } from "@/features/eform/attachments";
export const FORM_CODE = "tfac-68-001-1";
export const FORM_TITLE = "การแก้ไขข้อมูลนิติบุคคล";
export const ISSUE_CHOICES = ["เปลี่ยนชื่อนิติบุคคลหรือแปร สภาพนิติบุคคล", "ชำรุด / เสียหาย"] as const;
export const ATTACHMENTS: AttachmentSpec[] = [
  { code: "file_applicant_3_month", label: "สำเนาหนังสือรับรองการจดทะเบียนนิติบุคคล มีอายุไม่เกิน 3 เดือน", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  { code: "image_authorization_id_card", label: "สำเนาบัตรประจำตัวประชาชนของกรรมการ/หุ้นส่วนผู้จัดการผู้มีอำนาจลงนาม", required: true, accept: ".pdf,.jpg,.jpeg,.png" },
  { code: "image_payment_modify", label: "เอกสารอื่น ๆ", required: false },
];
export const EXTRA_TOPICS = [
  ["Modify_Check", "ชื่อนิติบุคคล"], ["Transformation_Check", "แปรสภาพนิติบุคคล"],
  ["JurLocation_Check", "ที่ตั้งนิติบุคคลและสำนักงานสาขา"], ["Capital_Check", "จำนวนทุนจดทะเบียน"],
  ["ServiceType_Check", "ประเภทของการให้บริการ"], ["IssueBook_Check", "ขอให้ออกหนังสือรับรองฉบับใหม่"],
] as const;
