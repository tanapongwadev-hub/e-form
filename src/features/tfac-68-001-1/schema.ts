import { z } from "zod";
import { applicantContactDefaults, applicantContactSchema, checkApplicantContact } from "@/features/eform/applicant";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import { addressDefaults, addressShape, checkAddress } from "@/features/eform/address";
import { attachmentsSchema, checkAttachments, emptyAttachments } from "@/features/eform/attachments";
import { SERVICE_TYPES, type ServiceType } from "@/features/eform/constants";
import type { WizardStep } from "@/features/eform/form-wizard";
import { topicDefaults } from "@/features/eform/topics/defaults";
import { checkTopics, topicsShape, topicVisibility } from "@/features/eform/topics/schema";
import { ATTACHMENTS, ISSUE_CHOICES } from "./constants";

const nameShape = z.object({ NameTh: z.string(), NameEn: z.string() });
const transformed = nameShape.extend({ Number: z.string(), Type: z.string() });
const baseSchema = z.object({
  Applicant: applicantContactSchema, ...topicsShape,
  Modify_Check: z.boolean(), Modify: z.object({ Old: nameShape, New: nameShape }),
  Transformation_Check: z.boolean(), Transformation: z.object({ Old: transformed, New: transformed }),
  Capital_Check: z.boolean(), Capital: z.object({ OldAmount: z.string(), NowAmount: z.string() }),
  JurLocation_Check: z.boolean(), JurLocation: z.object({ Old: addressShape, New: addressShape, Address_Receipt: z.string(), Address_Branch: z.string() }),
  JurLocation_Other: z.array(addressShape), ServiceType_Check: z.boolean(), ServiceType: z.object({ OldData: z.string(), NewData: z.string() }),
  IssueBook_Check: z.boolean(), IssueBook: z.object({ Choice: z.string() }),
  confirm_1: z.boolean(), attachments: attachmentsSchema(ATTACHMENTS), acceptTermOfService: z.boolean(),
});
export type FormValues = z.infer<typeof baseSchema>;
export function effectiveService(values: Pick<FormValues, "ServiceType" | "ServiceType_Check">, old: ServiceType): ServiceType {
  return values.ServiceType_Check && SERVICE_TYPES.includes(values.ServiceType.NewData as ServiceType) ? values.ServiceType.NewData as ServiceType : old;
}
export function createFormSchema(corporate: TfacCorporate, profile: JuristicProfile) {
  return baseSchema.superRefine((data, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });
    checkApplicantContact(data.Applicant, ctx, false);
    if (!data.Applicant.Telephone.trim()) issue(["Applicant", "Telephone"], "กรุณากรอกเบอร์โทรศัพท์สำนักงาน");
    const serviceType = effectiveService(data, corporate.data.Corporate_Service_Name);
    const v = topicVisibility(serviceType);
    checkTopics(data, v, ctx);
    if (data.ServiceType_Check) {
      if (!SERVICE_TYPES.includes(data.ServiceType.NewData as ServiceType)) issue(["ServiceType", "NewData"], "กรุณาเลือกประเภทบริการใหม่");
      else if (data.ServiceType.NewData === corporate.data.Corporate_Service_Name) issue(["ServiceType", "NewData"], "ประเภทบริการใหม่ต้องต่างจากเดิม");
      for (const key of ["Manager_Check", ...(v.accountant ? ["Accountant_Check"] as const : []), ...(v.headOffice ? ["HeadOffice_Check", "Examiner_Check", "Beyond_Check"] as const : [])] as const) if (!data[key]) issue([key], "กรุณากรอกหัวข้อที่เกี่ยวข้องกับประเภทบริการใหม่");
    }
    if (data.JurLocation_Check) {
      checkAddress(data.JurLocation.Old, ctx, ["JurLocation", "Old"]);
      checkAddress(data.JurLocation.New, ctx, ["JurLocation", "New"]);
      data.JurLocation_Other.forEach((a, i) => checkAddress(a, ctx, ["JurLocation_Other", i], true));
      const codes = data.JurLocation_Other.map((a) => a.Branch_Code);
      if (codes.includes("00000") || new Set(codes).size !== codes.length) issue(["JurLocation_Other"], "รหัสสาขาต้องไม่ซ้ำกันหรือซ้ำสำนักงานใหญ่ 00000");
      if (!["สำนักงานใหญ่", "สำนักงานสาขา"].includes(data.JurLocation.Address_Receipt)) issue(["JurLocation", "Address_Receipt"], "กรุณาเลือกที่อยู่สำหรับออกใบเสร็จ");
      if (data.JurLocation.Address_Receipt === "สำนักงานสาขา" && !codes.includes(data.JurLocation.Address_Branch)) issue(["JurLocation", "Address_Branch"], "กรุณาเพิ่มและเลือกสำนักงานสาขาสำหรับออกใบเสร็จ");
    }
    const transformation = corporate.data.Registration_No !== profile.juristicId;
    if (transformation && !data.Transformation_Check) issue(["Transformation_Check"], "กรุณาระบุการแปรสภาพนิติบุคคล");
    if ((data.Modify_Check || transformation) && (!data.IssueBook_Check || data.IssueBook.Choice !== ISSUE_CHOICES[0])) issue(["IssueBook", "Choice"], "กรณีเปลี่ยนชื่อหรือแปรสภาพ ต้องขอหนังสือรับรองฉบับใหม่");
    if (data.IssueBook_Check && !(ISSUE_CHOICES as readonly string[]).includes(data.IssueBook.Choice)) issue(["IssueBook", "Choice"], "กรุณาเลือกเหตุผลในการขอหนังสือรับรอง");
    if (!data.confirm_1) issue(["confirm_1"], "กรุณายืนยันการรับรองข้อมูล");
    checkAttachments(ATTACHMENTS, data.attachments, ctx);
    if (!data.acceptTermOfService) issue(["acceptTermOfService"], "กรุณายอมรับเงื่อนไขการให้บริการ");
  });
}
export function buildDefaultValues(profile: JuristicProfile, corporate: TfacCorporate): FormValues {
  const d = corporate.data;
  const transformation = d.Registration_No !== profile.juristicId;
  return { Applicant: applicantContactDefaults(profile, corporate), ...topicDefaults(profile, corporate),
    Modify_Check: false, Modify: { Old: { NameTh: d.Name_TH, NameEn: d.Name_EN }, New: { NameTh: profile.nameTh, NameEn: profile.nameEn } },
    Transformation_Check: transformation, Transformation: { Old: { NameTh: d.Name_TH, NameEn: d.Name_EN, Number: d.Registration_No, Type: d.Business_Name }, New: { NameTh: profile.nameTh, NameEn: profile.nameEn, Number: profile.juristicId, Type: profile.juristicType } },
    Capital_Check: false, Capital: { OldAmount: d.Capital, NowAmount: profile.registerCapital },
    JurLocation_Check: false, JurLocation: { Old: addressDefaults(corporate.address.find((a) => a.Address_Type_ID === 1)), New: { ...addressDefaults(profile.registeredAddress), Mobile: "", Email: "", TelePhone: "" }, Address_Receipt: "", Address_Branch: "" },
    JurLocation_Other: corporate.address.filter((a) => a.Address_Type_ID === 2).map(addressDefaults),
    ServiceType_Check: false, ServiceType: { OldData: d.Corporate_Service_Name, NewData: "" },
    IssueBook_Check: transformation, IssueBook: { Choice: transformation ? ISSUE_CHOICES[0] : "" },
    confirm_1: false, attachments: emptyAttachments(ATTACHMENTS), acceptTermOfService: false };
}
export const STEPS: WizardStep<FormValues>[] = [
  { title: "ข้อมูลทั่วไป", heading: "ข้อมูลนิติบุคคลและการติดต่อ", description: "ตรวจสอบข้อมูลและช่องทางติดต่อ", fields: ["Applicant"] },
  { title: "ข้อมูลที่ขอแก้ไข", heading: "ข้อมูลนิติบุคคลที่ขอแก้ไข", description: "เลือกหัวข้อและกรอกข้อมูลใหม่", fields: ["Modify", "Transformation", "Transformation_Check", "Capital", "JurLocation", "JurLocation_Other", "ServiceType", "IssueBook"] },
  { title: "รายนามและบุคลากร", heading: "รายนามและบุคลากรที่ขอแก้ไข", description: "กรอกข้อมูลตามประเภทบริการ", fields: ["Manager_Check", "Manager", "Accountant_Check", "Accountant", "HeadOffice_Check", "HeadOffice", "Examiner_Check", "Examiner", "Beyond_Check", "Beyond", "BeyondSpecialist"] },
  { title: "เอกสารและรับรอง", heading: "เอกสารแนบและการรับรองข้อมูล", description: "แนบเอกสารประกอบคำร้อง", fields: ["attachments", "confirm_1"] },
  { title: "ตรวจสอบและส่ง", heading: "ตรวจสอบข้อมูลก่อนส่งคำร้อง", description: "ตรวจสอบความถูกต้องก่อนส่ง", fields: ["acceptTermOfService"] },
];
