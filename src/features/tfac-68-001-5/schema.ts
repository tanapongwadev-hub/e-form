import { z } from "zod";
import { attachmentsSchema, checkAttachments, emptyAttachments } from "@/features/eform/attachments";
import type { JuristicProfile } from "@/features/eform/api";
import type { WizardStep } from "@/features/eform/form-wizard";
import { EMAIL_PATTERN } from "@/features/eform/utils";
import { ATTACHMENTS, CANCEL_TOPICS } from "./constants";

// Rules ported from start1() in the original form's script.
export const formSchema = z
  .object({
    Applicant: z.object({ Email: z.string().trim() }),
    CancelType: z.object({ Topic: z.string(), Detail: z.string().trim().max(1000, "ไม่เกิน 1,000 ตัวอักษร") }),
    attachments: attachmentsSchema(ATTACHMENTS),
    acceptTermOfService: z.boolean(),
  })
  .superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
    if (!EMAIL_PATTERN.test(data.Applicant.Email)) issue(["Applicant", "Email"], "กรุณากรอกอีเมลให้ถูกต้อง");
    if (!(CANCEL_TOPICS as readonly string[]).includes(data.CancelType.Topic)) {
      issue(["CancelType", "Topic"], "กรุณาเลือกเหตุผล");
    } else if (!data.CancelType.Detail) {
      // The reason box only shows once a topic is picked, so only then is it required.
      issue(["CancelType", "Detail"], "กรุณาระบุเหตุผล");
    }
    checkAttachments(ATTACHMENTS, data.attachments, ctx);
    if (!data.acceptTermOfService) issue(["acceptTermOfService"], "กรุณาคลิกยอมรับเงื่อนไขการให้บริการ");
  });

export type FormValues = z.infer<typeof formSchema>;

export function buildDefaultValues(profile: JuristicProfile): FormValues {
  return {
    Applicant: { Email: profile.email },
    CancelType: { Topic: "", Detail: "" },
    attachments: emptyAttachments(ATTACHMENTS),
    acceptTermOfService: false,
  };
}

export const STEPS: WizardStep<FormValues>[] = [
  {
    title: "ข้อมูลทั่วไป",
    heading: "ข้อมูลนิติบุคคล",
    description: "ตรวจสอบข้อมูลนิติบุคคลที่ดึงมาจากระบบ และอีเมลสำหรับติดต่อกลับ",
    fields: ["Applicant"],
  },
  {
    title: "เหตุผลการเลิก",
    heading: "ข้อมูลการจดทะเบียนเลิกให้บริการ",
    description: "เลือกเหตุผลที่ขอยกเลิกการจดทะเบียน และระบุรายละเอียด",
    fields: ["CancelType"],
  },
  {
    title: "เอกสารแนบ",
    heading: "หลักฐานการเลิกให้บริการ",
    description: "แนบหลักฐานพร้อมรับรองสำเนาถูกต้องและประทับตรา (ถ้ามี)",
    fields: ["attachments"],
  },
  {
    title: "ตรวจสอบและส่ง",
    heading: "ตรวจสอบข้อมูลก่อนส่งคำร้อง",
    description: 'ตรวจสอบความถูกต้องของข้อมูลทั้งหมด หากต้องการแก้ไขให้กด "แก้ไข" ที่หัวข้อนั้น',
    fields: ["acceptTermOfService"],
  },
];
