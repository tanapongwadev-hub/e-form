import type { WizardStep } from "@/features/eform/form-wizard";
import type { FormValues } from "./schema";

export const STEPS: WizardStep<FormValues>[] = [
  {
    title: "ข้อมูลทั่วไป",
    heading: "ข้อมูลนิติบุคคลและการติดต่อ",
    description: "ตรวจสอบข้อมูลนิติบุคคลที่ดึงมาจากระบบ และกรอกข้อมูลสำหรับติดต่อกลับ",
    fields: ["Applicant"],
  },
  {
    title: "รายได้",
    heading: "รายได้จากการให้บริการ",
    description: "ประเภท จำนวน และรายได้จากธุรกิจที่ให้บริการในรอบปีบัญชีย้อนหลัง 1 ปี",
    fields: ["Retrospect"],
  },
  {
    title: "หัวข้อที่แก้ไข",
    heading: "หัวข้อที่ขอแก้ไข",
    description: "เลือกหัวข้อข้อมูลที่ได้แจ้งจดทะเบียนไว้กับสภาวิชาชีพบัญชีและต้องการแก้ไข",
    fields: ["Manager", "Accountant", "HeadOffice", "Examiner", "Beyond", "BeyondSpecialist"],
  },
  {
    title: "เอกสารและรับรอง",
    heading: "เอกสารแนบและการรับรองข้อมูล",
    description: "แนบหลักฐานการต่ออายุทะเบียนนิติบุคคล พร้อมรับรองสำเนาถูกต้องและประทับตรา (ถ้ามี)",
    fields: ["attachments", "confirm_1"],
  },
  {
    title: "ตรวจสอบและส่ง",
    heading: "ตรวจสอบข้อมูลก่อนส่งคำร้อง",
    description: "ตรวจสอบความถูกต้องของข้อมูลทั้งหมด หากต้องการแก้ไขให้กด \"แก้ไข\" ที่หัวข้อนั้น",
    fields: ["acceptTermOfService"],
  },
];

