import { z } from "zod";
import { applicantContactSchema, checkApplicantContact } from "@/features/eform/applicant";
import { attachmentsSchema, checkAttachments } from "@/features/eform/attachments";
import type { ServiceType } from "@/features/eform/constants";
import { checkTopics, topicsShape } from "@/features/eform/topics/schema";
import { parseAmount } from "@/features/eform/utils";
import { ATTACHMENTS, getVisibility } from "./constants";

const REQUIRED = "กรุณากรอกข้อมูล";

const baseSchema = z.object({
  Applicant: applicantContactSchema,
  Retrospect: z.object({
    EndDate: z.string(),
    Service: z.object({ Amount: z.string(), MoneyNumber: z.string() }),
    Audit: z.object({ Amount: z.string(), MoneyNumber: z.string() }),
    OtherIncome: z.string(),
  }),
  ...topicsShape,
  confirm_1: z.boolean(),
  attachments: attachmentsSchema(ATTACHMENTS),
  acceptTermOfService: z.boolean(),
});
export type FormValues = z.infer<typeof baseSchema>;

export function deriveIncome(retrospect: FormValues["Retrospect"], serviceType: ServiceType) {
  const v = getVisibility(serviceType);
  const service = v.serviceIncome ? parseAmount(retrospect.Service.MoneyNumber) : 0;
  const audit = v.auditIncome ? parseAmount(retrospect.Audit.MoneyNumber) : 0;
  return { service, audit, total: service + audit + parseAmount(retrospect.OtherIncome) };
}

/** Builds the form schema; which rules apply depends on the corporate service type and the chosen topics. */
export function createFormSchema(serviceType: ServiceType, maxEndDate: string) {
  const v = getVisibility(serviceType);

  return baseSchema.superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
    const required = (value: string, path: (string | number)[]) => {
      if (!value.trim()) issue(path, REQUIRED);
    };

    checkApplicantContact(data.Applicant, ctx);

    // Retrospect
    if (!data.Retrospect.EndDate) issue(["Retrospect", "EndDate"], "กรุณาเลือกวันที่");
    else if (data.Retrospect.EndDate > maxEndDate) issue(["Retrospect", "EndDate"], "เลือกได้ถึงวันที่เมื่อวานเท่านั้น");
    if (v.serviceIncome) {
      required(data.Retrospect.Service.Amount, ["Retrospect", "Service", "Amount"]);
      required(data.Retrospect.Service.MoneyNumber, ["Retrospect", "Service", "MoneyNumber"]);
    }
    if (v.auditIncome) {
      required(data.Retrospect.Audit.Amount, ["Retrospect", "Audit", "Amount"]);
      required(data.Retrospect.Audit.MoneyNumber, ["Retrospect", "Audit", "MoneyNumber"]);
    }
    required(data.Retrospect.OtherIncome, ["Retrospect", "OtherIncome"]);

    checkTopics(data, v, ctx);

    // Declaration, attachments, terms
    if (!data.confirm_1) issue(["confirm_1"], "กรุณายืนยันการรับรองข้อมูล");
    checkAttachments(ATTACHMENTS, data.attachments, ctx);
    if (!data.acceptTermOfService) issue(["acceptTermOfService"], "กรุณาคลิกยอมรับเงื่อนไขการให้บริการ");
  });
}
