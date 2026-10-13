/**
 * "หัวข้อที่ขอแก้ไข" — change topics shared by forms 68-001-1, 68-001-2 and 68-001-3
 * (Manager, Accountant, HeadOffice, Examiner, Beyond): identical field names in all three originals.
 */
import { z } from "zod";
import { OTHER_TITLE, type ServiceType } from "../constants";
import { findDuplicates, isValidThaiCitizenId, parseAmount } from "../utils";

const REQUIRED = "กรุณากรอกข้อมูล";
const requiredText = z.string().trim().min(1, REQUIRED);
const citizenId = z
  .string()
  .regex(/^\d{13}$/, "กรุณากรอกเลข 13 หลัก")
  .refine(isValidThaiCitizenId, "เลขที่บัตรประจำตัวประชาชนไม่ถูกต้อง");
const license = z.string().regex(/^\d{5}$/, "กรุณากรอกเลข 5 หลัก").refine((v) => v !== "00000", "เลขทะเบียนไม่ถูกต้อง");
/** Title select + free text when "อื่นๆ" is picked. */
const titleFields = {
  title: requiredText,
  titleOther: z.string(),
};
function refineTitle(row: { title: string; titleOther: string }, ctx: z.RefinementCtx) {
  if (row.title === OTHER_TITLE && !row.titleOther.trim()) {
    ctx.addIssue({ code: "custom", path: ["titleOther"], message: "กรุณาระบุคำนำหน้า" });
  }
}
export const resolveTitle = (row: { title: string; titleOther: string }) =>
  row.title === OTHER_TITLE ? row.titleOther.trim() : row.title;

// ---------- List rows ----------
// Each row has a loose shape (used inside the main form, where a topic may be unticked)
// and a strict schema used by the row's edit dialog.

const managerRowShape = z.object({
  title: z.string(),
  name: z.string(),
  lastName: z.string(),
  nationality: z.string(),
  citizenId: z.string(),
  license: z.string(),
  passport: z.string(),
  isAuthorized: z.boolean(),
});
const titledRowShape = { title: z.string(), titleOther: z.string(), name: z.string(), lastName: z.string() };
const accountantRowShape = z.object({ ...titledRowShape, citizenId: z.string(), working: z.string() });
const examinerRowShape = z.object({ ...titledRowShape, citizenId: z.string(), license: z.string(), working: z.string() });
const specialistRowShape = z.object({ special: z.string(), total: z.string() });

export const managerRowSchema = managerRowShape
  .superRefine((row, ctx) => {
    if (row.nationality === "") {
      ctx.addIssue({ code: "custom", path: ["nationality"], message: "กรุณาเลือกสัญชาติ" });
    } else if (row.nationality === "สัญชาติไทย") {
      const r = citizenId.safeParse(row.citizenId);
      if (!r.success) ctx.addIssue({ code: "custom", path: ["citizenId"], message: r.error.issues[0].message });
      if (row.license) {
        const l = license.safeParse(row.license);
        if (!l.success) ctx.addIssue({ code: "custom", path: ["license"], message: l.error.issues[0].message });
      }
    } else if (!row.passport.trim()) {
      ctx.addIssue({ code: "custom", path: ["passport"], message: "กรุณากรอกเลขที่หนังสือเดินทาง" });
    }
  });
export type ManagerRow = z.infer<typeof managerRowSchema>;

export const accountantRowSchema = z
  .object({ ...titleFields, name: requiredText, lastName: requiredText, citizenId, working: requiredText })
  .superRefine(refineTitle);
export type AccountantRow = z.infer<typeof accountantRowSchema>;

export const examinerRowSchema = z
  .object({ ...titleFields, name: requiredText, lastName: requiredText, citizenId, license, working: requiredText })
  .superRefine(refineTitle);
export type ExaminerRow = z.infer<typeof examinerRowSchema>;

export const specialistRowSchema = z.object({
  special: requiredText,
  total: z.string().regex(/^\d+$/, "กรุณากรอกจำนวนเป็นตัวเลข"),
});
export type SpecialistRow = z.infer<typeof specialistRowSchema>;

// ---------- Topic fields ----------

const staffCounts = z.object({
  AmountPartner: z.string(),
  AmountSeniorManager: z.string(),
  AmountManager: z.string(),
  AmountSenior: z.string(),
  AmountJunior: z.string(),
});
export type StaffCounts = z.infer<typeof staffCounts>;
export const STAFF_FIELDS: { key: keyof StaffCounts; label: string }[] = [
  { key: "AmountPartner", label: "ตำแหน่งหุ้นส่วน (Partner) (ราย)" },
  { key: "AmountSeniorManager", label: "ตำแหน่งผู้จัดการอาวุโส (Senior Manager) (ราย)" },
  { key: "AmountManager", label: "ตำแหน่งผู้จัดการ (Manager) (ราย)" },
  { key: "AmountSenior", label: "ตำแหน่งผู้ช่วยผู้สอบบัญชีอาวุโส (Senior) (ราย)" },
  { key: "AmountJunior", label: "ตำแหน่งผู้ช่วยสอบบัญชี (Junior) (ราย)" },
];

/** Spread into a form's z.object(). */
export const topicsShape = {
  Manager_Check: z.boolean(),
  Manager: z.array(managerRowShape),
  Accountant_Check: z.boolean(),
  Accountant: z.array(accountantRowShape),
  HeadOffice_Check: z.boolean(),
  HeadOffice: z.object({
    ...titledRowShape,
    numberAccount: z.string(),
    citizenId: z.string(),
    workingTime: z.string(),
  }),
  Examiner_Check: z.boolean(),
  Examiner: z.array(examinerRowShape),
  Beyond_Check: z.boolean(),
  Beyond: z.object({ Lastdata: staffCounts.extend({ AmountOther: z.string() }), Editdata: staffCounts }),
  BeyondSpecialist: z.array(specialistRowShape),
};
export type TopicValues = z.infer<z.ZodObject<typeof topicsShape>>;

/** Which topics apply to a service type (mirrors checkTheRadioAccountType in the original forms). */
export function topicVisibility(serviceType: ServiceType) {
  const accounting = serviceType !== "สอบบัญชี";
  const auditing = serviceType !== "ทำบัญชี";
  return { accountant: accounting, headOffice: auditing, examiner: auditing, beyond: auditing, conAudit: auditing };
}
export type TopicVisibility = ReturnType<typeof topicVisibility>;

// ---------- Derived values (totals, conditions) ----------

export function deriveManagerConditions(rows: ManagerRow[]) {
  const filled = rows.length > 0;
  return {
    totalAuthorized: rows.filter((r) => r.isAuthorized).length,
    /** every committee has nationality + matching ID */
    conIdCardNation:
      filled &&
      rows.every((r) =>
        r.nationality === "สัญชาติไทย" ? !!r.citizenId : r.nationality === "ต่างด้าว" ? !!r.passport : false,
      ),
    /** at least one committee is a licensed auditor */
    conAudit: rows.some((r) => r.nationality === "สัญชาติไทย" && !!r.license.trim()),
    /** at least one committee is an authorized signer */
    conNumber: rows.some((r) => r.isAuthorized),
  };
}

export function sumStaff(counts: Partial<Record<string, string>>) {
  return Object.values(counts).reduce((sum, v) => sum + parseAmount(v), 0);
}

export function sumSpecialists(rows: SpecialistRow[]) {
  return rows.reduce((sum, r) => sum + parseAmount(r.total), 0);
}

// ---------- Validation ----------

/** Topic rules ported from the original forms' start1(); use inside a form's superRefine. */
export function checkTopics(data: TopicValues, v: TopicVisibility, ctx: z.RefinementCtx) {
  const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
  const required = (value: string, path: (string | number)[]) => {
    if (!value.trim()) issue(path, REQUIRED);
  };

  // Managers
  if (data.Manager_Check) {
    const c = deriveManagerConditions(data.Manager);
    if (!c.conIdCardNation) issue(["Manager"], "กรุณาเพิ่มสัญชาติและเลขบัตรประชาชน/หนังสือเดินทางของกรรมการให้ครบทุกคน");
    else if (v.conAudit && !c.conAudit) issue(["Manager"], "ต้องมีกรรมการอย่างน้อย 1 คนที่เป็นผู้สอบบัญชีรับอนุญาต");
    else if (!c.conNumber) issue(["Manager"], "ต้องมีกรรมการผู้มีอำนาจลงนามอย่างน้อย 1 คน");
    if (findDuplicates(data.Manager.map((r) => r.citizenId)).length)
      issue(["Manager"], "ตรวจสอบพบเลขที่บัตรประจำตัวประชาชนซ้ำในรายนามกรรมการ");
    if (findDuplicates(data.Manager.map((r) => r.license)).length)
      issue(["Manager"], "ตรวจสอบพบเลขทะเบียนผู้สอบบัญชีรับอนุญาตซ้ำในรายนามกรรมการ");
  }

  // Accountants
  if (v.accountant && data.Accountant_Check) {
    if (!data.Accountant.length) issue(["Accountant"], "กรุณาเพิ่มรายนามผู้ทำบัญชีอย่างน้อย 1 คน");
    if (findDuplicates(data.Accountant.map((r) => r.citizenId)).length)
      issue(["Accountant"], "ตรวจพบเลขที่บัตรประจำตัวประชาชนซ้ำในรายนามผู้ทำบัญชี");
  }

  // Head of office
  if (v.headOffice && data.HeadOffice_Check) {
    const h = data.HeadOffice;
    const path = (k: string) => ["HeadOffice", k];
    required(h.title, path("title"));
    if (h.title === OTHER_TITLE && !h.titleOther.trim()) issue(path("titleOther"), "กรุณาระบุคำนำหน้า");
    required(h.name, path("name"));
    required(h.lastName, path("lastName"));
    const l = license.safeParse(h.numberAccount);
    if (!l.success) issue(path("numberAccount"), l.error.issues[0].message);
    const c = citizenId.safeParse(h.citizenId);
    if (!c.success) issue(path("citizenId"), c.error.issues[0].message);
    required(h.workingTime, path("workingTime"));
  }

  // Auditors
  if (v.examiner && data.Examiner_Check) {
    if (!data.Examiner.length) issue(["Examiner"], "กรุณาเพิ่มรายนามผู้สอบบัญชีรับอนุญาตอย่างน้อย 1 คน");
    if (findDuplicates(data.Examiner.map((r) => r.citizenId)).length)
      issue(["Examiner"], "ตรวจสอบพบเลขที่บัตรประจำตัวประชาชนซ้ำในรายนามผู้สอบบัญชีรับอนุญาต");
    if (findDuplicates(data.Examiner.map((r) => r.license)).length)
      issue(["Examiner"], "ตรวจสอบพบเลขทะเบียนผู้สอบบัญชีรับอนุญาตซ้ำในรายนามผู้สอบบัญชีรับอนุญาต");
  }

  // Staff
  if (v.beyond && data.Beyond_Check) {
    for (const key of Object.keys(data.Beyond.Editdata) as (keyof StaffCounts)[]) {
      required(data.Beyond.Editdata[key], ["Beyond", "Editdata", key]);
    }
  }
}
