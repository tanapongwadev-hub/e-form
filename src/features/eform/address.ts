import { z } from "zod";
import type { TfacAddress } from "./api";
import { EMAIL_PATTERN } from "./utils";

export const addressShape = z.object({
  No: z.string(), Moo: z.string(), Building: z.string(), Floor: z.string(), Room: z.string(), Village: z.string(),
  Alley: z.string(), Road: z.string(), SubDistrict: z.string(), District: z.string(), Province: z.string(),
  PostCode: z.string(), Branch_Code: z.string(), TelePhone: z.string(), Mobile: z.string(), Email: z.string(),
});
export type AddressValues = z.infer<typeof addressShape>;
export const ADDRESS_LABELS: Record<keyof AddressValues, string> = {
  No: "ที่อยู่เลขที่", Moo: "หมู่ที่", Building: "อาคาร", Floor: "ชั้น", Room: "ห้อง", Village: "หมู่บ้าน", Alley: "ตรอก/ซอย", Road: "ถนน",
  SubDistrict: "ตำบล/แขวง", District: "อำเภอ/เขต", Province: "จังหวัด", PostCode: "รหัสไปรษณีย์", Branch_Code: "รหัสสาขา", TelePhone: "เบอร์โทรศัพท์สำนักงาน", Mobile: "เบอร์มือถือสำนักงาน", Email: "อีเมลสำนักงาน",
};
export function addressDefaults(a?: TfacAddress): AddressValues {
  return { No: a?.Address_Number ?? "", Moo: a?.Moo ?? "", Building: a?.Building_Name ?? "", Floor: a?.Floor ?? "", Room: a?.Room ?? "", Village: a?.Village ?? "", Alley: a?.Soi ?? "", Road: a?.Street ?? "", SubDistrict: a?.Sub_District ?? "", District: a?.District ?? "", Province: a?.Province ?? "", PostCode: a?.Post_Code ?? "", Branch_Code: a?.Branch_Code ?? "", TelePhone: a?.Phone ?? "", Mobile: a?.Mobile_Phone ?? "", Email: a?.E_Mail ?? "" };
}
export function checkAddress(a: AddressValues, ctx: z.RefinementCtx, path: (string | number)[], branch = false) {
  const issue = (key: keyof AddressValues, message: string) => ctx.addIssue({ code: "custom", path: [...path, key], message });
  if (branch) for (const key of ["No", "SubDistrict", "District", "Province"] as const) if (!a[key].trim()) issue(key, "กรุณากรอกข้อมูล");
  if (!/^\d{5}$/.test(a.PostCode)) issue("PostCode", "กรุณากรอกรหัสไปรษณีย์ 5 หลัก");
  if (!/^\d{5}$/.test(a.Branch_Code)) issue("Branch_Code", "กรุณากรอกรหัสสาขา 5 หลัก");
  if (!/^0\d{8,9}$/.test(a.Mobile)) issue("Mobile", "กรุณากรอกเบอร์มือถือ 9–10 หลัก");
  if (!EMAIL_PATTERN.test(a.Email)) issue("Email", "กรุณากรอกอีเมลให้ถูกต้อง");
}
export const branchSchema = addressShape.superRefine((a, ctx) => checkAddress(a, ctx, [], true));
