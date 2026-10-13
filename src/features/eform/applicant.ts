import { z } from "zod";
import type { JuristicProfile, TfacAddress, TfacCorporate } from "./api";
import { EMAIL_PATTERN } from "./utils";

/** Applicant[...] contact fields the applicant can correct (forms 68-001-1 … 68-001-4). */
export const applicantContactSchema = z.object({
  Email: z.string(),
  Telephone: z.string(),
  Mobile: z.string(),
  OfficeEmail: z.string(),
});
export type ApplicantContact = z.infer<typeof applicantContactSchema>;

/** Validation ported from the original forms' start1(); use inside superRefine. */
export function checkApplicantContact(contact: ApplicantContact, ctx: z.RefinementCtx, officeEmailRequired = true) {
  const issue = (field: keyof ApplicantContact, message: string) =>
    ctx.addIssue({ code: "custom", path: ["Applicant", field], message });
  if (!EMAIL_PATTERN.test(contact.Email)) issue("Email", "กรุณากรอกอีเมลให้ถูกต้อง");
  if (!/^0\d{8,9}$/.test(contact.Mobile)) issue("Mobile", "กรุณากรอกเบอร์มือถือ 9–10 หลัก");
  if (officeEmailRequired && !EMAIL_PATTERN.test(contact.OfficeEmail)) issue("OfficeEmail", "กรุณากรอกอีเมลให้ถูกต้อง");
}

/** Address_Type_ID 4 = the address used for receipts. */
export function receiptAddress(corporate: TfacCorporate): TfacAddress | undefined {
  return corporate.address.find((a) => a.Address_Type_ID === 4);
}

/** Pre-fills contact fields from the profile and the receipt address (getJurData in the original forms). */
export function applicantContactDefaults(profile: JuristicProfile, corporate: TfacCorporate): ApplicantContact {
  const address = receiptAddress(corporate);
  return {
    Email: profile.email,
    Telephone: address?.Phone ?? "",
    Mobile: address?.Mobile_Phone ?? "",
    OfficeEmail: address?.E_Mail ?? "",
  };
}

/** Applicant[...] block of the payload (same keys as the original e-forms). */
export function applicantPayload(
  profile: JuristicProfile,
  corporate: TfacCorporate,
  contact: ApplicantContact,
  writeDate: string,
) {
  const a = receiptAddress(corporate);
  return {
    WriteDate: writeDate,
    WriteAt: "Biz Portal",
    IdentityTypeTitle: "นิติบุคคล",
    Name: profile.nameTh,
    NameEn: profile.nameEn,
    JuristicType: profile.juristicType,
    JuristicId: profile.juristicId,
    RegisterCapital: profile.registerCapital,
    RegisterDate: profile.registerDate,
    Email: contact.Email,
    OfficeEmail: contact.OfficeEmail,
    Mobile: contact.Mobile,
    Telephone: contact.Telephone,
    Branch_Code: a?.Branch_Code ?? "",
    Address: {
      AddressNo: a?.Address_Number ?? "",
      VillageNo: a?.Moo ?? "",
      Village: a?.Village ?? "",
      BuildingName: a?.Building_Name ?? "",
      FloorNo: a?.Floor ?? "",
      Soi: a?.Soi ?? "",
      Road: a?.Street ?? "",
      SubDistrict: a?.Sub_District ?? "",
      District: a?.District ?? "",
      Province: a?.Province ?? "",
      PostCode: a?.Post_Code ?? "",
    },
  };
}
