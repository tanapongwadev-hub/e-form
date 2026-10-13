import { z } from "zod";
import { applicantContactDefaults, applicantContactSchema, checkApplicantContact } from "@/features/eform/applicant";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import { attachmentsSchema, checkAttachments, emptyAttachments } from "@/features/eform/attachments";
import { collateralByLabel, collateralRowSchema, collateralRowSchemaShape, sumCollateral } from "@/features/eform/collateral";
import type { ServiceType } from "@/features/eform/constants";
import type { WizardStep } from "@/features/eform/form-wizard";
import { topicDefaults } from "@/features/eform/topics/defaults";
import { checkTopics, topicsShape, topicVisibility } from "@/features/eform/topics/schema";
import { parseAmount } from "@/features/eform/utils";
import { ATTACHMENTS, STATEMENT_TYPES } from "./constants";

export const INCOME_FIELDS = ["RegisterAmount", "RegisterIncome", "UnRegisterAmount", "UnRegisterIncome"] as const;
const baseSchema = z.object({
  Applicant: applicantContactSchema,
  ...topicsShape,
  Financial: z.object({ StatementType: z.string(), TotalIncomeDate: z.string(), Capital: z.string(),
    Number2RegisterAmount: z.string(), Number2RegisterIncome: z.string(), Number2UnRegisterAmount: z.string(), Number2UnRegisterIncome: z.string(),
    Number3RegisterAmount: z.string(), Number3RegisterIncome: z.string(), Number3UnRegisterAmount: z.string(), Number3UnRegisterIncome: z.string() }),
  AssetDetail: z.object({ Current: z.string(), NonCurrent: z.string() }),
  CapitalRegister: z.object({ Date: z.string() }),
  AccountSavingType: z.string(),
  Collateral: z.object({ Deposit: z.array(collateralRowSchemaShape), Card: z.array(collateralRowSchemaShape), BillGov: z.array(collateralRowSchemaShape), BillCorp: z.array(collateralRowSchemaShape), Policy: z.array(collateralRowSchemaShape) }),
  Confirm_DueDate_Check: z.boolean(), Confirm_Change_Check: z.boolean(), confirm_1: z.boolean(),
  attachments: attachmentsSchema(ATTACHMENTS), acceptTermOfService: z.boolean(),
});
export type FormValues = z.infer<typeof baseSchema>;

export function deriveFinancial(values: Pick<FormValues, "Financial" | "AssetDetail">, serviceType: ServiceType) {
  const f = values.Financial;
  const number2 = serviceType !== "สอบบัญชี" ? parseAmount(f.Number2RegisterIncome) + parseAmount(f.Number2UnRegisterIncome) : 0;
  const number3 = serviceType !== "ทำบัญชี" ? parseAmount(f.Number3RegisterIncome) + parseAmount(f.Number3UnRegisterIncome) : 0;
  const capital = parseAmount(f.Capital);
  return { number2, number3, income: number2 + number3, capital, capitalBasis: capital > number2 + number3,
    required: Math.round(Math.max(capital, number2 + number3) * 3) / 100,
    assets: parseAmount(values.AssetDetail.Current) + parseAmount(values.AssetDetail.NonCurrent) };
}

export function createFormSchema(serviceType: ServiceType, minDueDate: string) {
  return baseSchema.superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
    checkApplicantContact(data.Applicant, ctx);
    checkTopics(data, topicVisibility(serviceType), ctx);
    if (!(STATEMENT_TYPES as readonly string[]).includes(data.Financial.StatementType)) issue(["Financial", "StatementType"], "กรุณาเลือกที่มาของตัวเลข");
    if (!data.Financial.TotalIncomeDate) issue(["Financial", "TotalIncomeDate"], "กรุณาเลือกวันที่");
    for (const n of [2, 3] as const) {
      if ((n === 2 && serviceType === "สอบบัญชี") || (n === 3 && serviceType === "ทำบัญชี")) continue;
      for (const field of INCOME_FIELDS) {
        const key = `Number${n}${field}` as const;
        const pattern = field.endsWith("Amount") ? /^\d+$/ : /^\d+(?:\.\d{1,2})?$/;
        if (!pattern.test(data.Financial[key].replace(/,/g, ""))) issue(["Financial", key], "กรุณากรอกจำนวนที่ถูกต้อง");
      }
    }
    for (const key of ["Current", "NonCurrent"] as const) if (!/^\d+(?:\.\d{1,2})?$/.test(data.AssetDetail[key].replace(/,/g, ""))) issue(["AssetDetail", key], "กรุณากรอกจำนวนเงิน");
    const financial = deriveFinancial(data, serviceType);
    if (financial.capitalBasis && !data.CapitalRegister.Date) issue(["CapitalRegister", "Date"], "กรุณาเลือกวันที่ของทุน");
    const type = collateralByLabel(data.AccountSavingType);
    if (!type) issue(["AccountSavingType"], "กรุณาเลือกประเภทหลักประกัน");
    else {
      const rows = data.Collateral[type.key];
      if (!rows.length) issue(["Collateral", type.key], "กรุณาเพิ่มหลักประกันอย่างน้อย 1 รายการ");
      else if (Math.round(sumCollateral(rows) * 100) < Math.round(financial.required * 100)) issue(["Collateral", type.key], "ยอดหลักประกันรวมต้องไม่น้อยกว่ายอดขั้นต่ำ 3%");
      rows.forEach((row, index) => {
        const result = collateralRowSchema(type.key, minDueDate).safeParse(row);
        if (!result.success) for (const error of result.error.issues) issue(["Collateral", type.key, index, ...error.path as (string | number)[]], error.message);
      });
    }
    for (const key of ["Confirm_DueDate_Check", "Confirm_Change_Check", "confirm_1", "acceptTermOfService"] as const) if (!data[key]) issue([key], "กรุณายืนยันข้อความนี้");
    checkAttachments(ATTACHMENTS, data.attachments, ctx);
  });
}

export function buildDefaultValues(profile: JuristicProfile, corporate: TfacCorporate): FormValues {
  const d = corporate.data;
  return { Applicant: applicantContactDefaults(profile, corporate), ...topicDefaults(profile, corporate),
    Financial: { StatementType: "", TotalIncomeDate: "", Capital: d.Capital,
      Number2RegisterAmount: d.Accounting_Customer_Amount, Number2RegisterIncome: d.Accounting_Customer_Income,
      Number2UnRegisterAmount: d.Accounting_Customer_None_Amount, Number2UnRegisterIncome: d.Accounting_Customer_None_Income,
      Number3RegisterAmount: d.Auditoring_Customer_Amount, Number3RegisterIncome: d.Auditoring_Customer_Income,
      Number3UnRegisterAmount: d.Auditoring_Customer_None_Amount, Number3UnRegisterIncome: d.Auditoring_Customer_None_Income },
    AssetDetail: { Current: "", NonCurrent: "" }, CapitalRegister: { Date: "" }, AccountSavingType: "",
    Collateral: { Deposit: [], Card: [], BillGov: [], BillCorp: [], Policy: [] },
    Confirm_DueDate_Check: true, Confirm_Change_Check: true, confirm_1: false,
    attachments: emptyAttachments(ATTACHMENTS), acceptTermOfService: false };
}

export const STEPS: WizardStep<FormValues>[] = [
  { title: "ข้อมูลทั่วไป", heading: "ข้อมูลนิติบุคคลและการติดต่อ", description: "ตรวจสอบข้อมูลและช่องทางติดต่อ", fields: ["Applicant"] },
  { title: "รายละเอียดคำขอ", heading: "รายละเอียดคำขอและหัวข้อที่ขอแก้ไข", description: "เลือกหัวข้อที่ต้องการแก้ไข", fields: ["Manager", "Accountant", "HeadOffice", "Examiner", "Beyond", "BeyondSpecialist"] },
  { title: "งบการเงินและหลักประกัน", heading: "งบการเงินและหลักประกัน", description: "กรอกข้อมูลเพื่อคำนวณหลักประกันขั้นต่ำ", fields: ["Financial", "AssetDetail", "CapitalRegister", "AccountSavingType", "Collateral"] },
  { title: "เอกสารและรับรอง", heading: "เอกสารแนบและการรับรองข้อมูล", description: "แนบเอกสารและรับรองความถูกต้อง", fields: ["attachments", "Confirm_DueDate_Check", "Confirm_Change_Check", "confirm_1"] },
  { title: "ตรวจสอบและส่ง", heading: "ตรวจสอบข้อมูลก่อนส่งคำร้อง", description: "ตรวจสอบข้อมูลทั้งหมดก่อนส่ง", fields: ["acceptTermOfService"] },
];
