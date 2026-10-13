import { applicantPayload } from "@/features/eform/applicant";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import { attachmentsPayload } from "@/features/eform/attachments";
import { topicsPayload } from "@/features/eform/topics/defaults";
import type { AddressValues } from "@/features/eform/address";
import { ATTACHMENTS, EXTRA_TOPICS } from "./constants";
import { effectiveService, type FormValues } from "./schema";

// Preserve Allay / Amphur / Postcode, and unprefixed Branch_Code, as in the original list.
const BRANCH_KEYS: Record<keyof AddressValues, string> = { No: "JurLocation_AddrNo", Moo: "JurLocation_Moo", Building: "JurLocation_Building", Floor: "JurLocation_Floor", Room: "JurLocation_Room", Village: "JurLocation_Village", Alley: "JurLocation_Allay", Road: "JurLocation_Road", SubDistrict: "JurLocation_Tambon", District: "JurLocation_Amphur", Province: "JurLocation_Province", PostCode: "JurLocation_Postcode", TelePhone: "JurLocation_Telephone", Mobile: "JurLocation_Mobile", Email: "JurLocation_Email", Branch_Code: "Branch_Code" };
export function buildPayload(values: FormValues, profile: JuristicProfile, corporate: TfacCorporate, writeDate: string) {
  return {
    Applicant: applicantPayload(profile, corporate, values.Applicant, writeDate),
    ...topicsPayload(values, effectiveService(values, corporate.data.Corporate_Service_Name)),
    ...Object.fromEntries(EXTRA_TOPICS.map(([key]) => [key, values[key] ? "1" : "0"])),
    Modify: values.Modify_Check ? values.Modify : undefined,
    Transformation: values.Transformation_Check ? values.Transformation : undefined,
    Capital: values.Capital_Check ? values.Capital : undefined,
    ServiceType: values.ServiceType_Check ? values.ServiceType : undefined,
    IssueBook: values.IssueBook_Check ? values.IssueBook : undefined,
    JurLocation: values.JurLocation_Check ? { ...values.JurLocation,
      Old: { ...values.JurLocation.Old, Address_Type_ID: "1" }, New: { ...values.JurLocation.New, Address_Type_ID: "1" },
      Address_Branch: values.JurLocation.Address_Receipt === "สำนักงานใหญ่" ? "00000" : values.JurLocation.Address_Branch,
    } : undefined,
    JurLocation_Other: values.JurLocation_Check ? values.JurLocation_Other.map((row, index) => ({ JurLocation_RunningNo: String(index + 2), ...Object.fromEntries(Object.entries(BRANCH_KEYS).map(([key, target]) => [target, row[key as keyof AddressValues]])) })) : [],
    JurLocation_TotalAmount: String(values.JurLocation_Other.length + 1),
    confirm_1: values.confirm_1 ? "1" : "0", ApplicationAttachments: attachmentsPayload(ATTACHMENTS, values.attachments),
  };
}
