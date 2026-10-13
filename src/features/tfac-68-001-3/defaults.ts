import { applicantContactDefaults, applicantPayload } from "@/features/eform/applicant";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import { attachmentsPayload, emptyAttachments } from "@/features/eform/attachments";
import type { ServiceType } from "@/features/eform/constants";
import { topicDefaults, topicsPayload } from "@/features/eform/topics/defaults";
import { bahtText, formatMoney } from "@/features/eform/utils";
import { ATTACHMENTS } from "./constants";
import { deriveIncome, type FormValues } from "./schema";

/** Pre-fills the form from the API data (port of setupAllOldAndNewValue in the original form). */
export function buildDefaultValues(profile: JuristicProfile, corporate: TfacCorporate): FormValues {
  return {
    Applicant: applicantContactDefaults(profile, corporate),
    Retrospect: {
      EndDate: "",
      Service: { Amount: "0", MoneyNumber: "0" },
      Audit: { Amount: "0", MoneyNumber: "0" },
      OtherIncome: "0",
    },
    ...topicDefaults(profile, corporate),
    confirm_1: false,
    attachments: emptyAttachments(ATTACHMENTS),
    acceptTermOfService: false,
  };
}

/**
 * Builds the submission payload using the original e-form field names
 * (Applicant[...], Retrospect[...], Manager[][...] etc.) so the backend contract stays the same.
 */
export function buildPayload(
  values: FormValues,
  profile: JuristicProfile,
  corporate: TfacCorporate,
  serviceType: ServiceType,
  writeDate: string,
) {
  const income = deriveIncome(values.Retrospect, serviceType);

  return {
    Applicant: applicantPayload(profile, corporate, values.Applicant, writeDate),
    Retrospect: {
      EndDate: values.Retrospect.EndDate,
      AccountType: serviceType,
      Service: { ...values.Retrospect.Service, MoneyText: bahtText(income.service) },
      Audit: { ...values.Retrospect.Audit, MoneyText: bahtText(income.audit) },
      OtherIncome: values.Retrospect.OtherIncome,
      ServiceIncome: formatMoney(income.total),
      ServiceIncomeText: bahtText(income.total),
    },
    ...topicsPayload(values),
    confirm_1: values.confirm_1 ? "1" : "0",
    ApplicationAttachments: attachmentsPayload(ATTACHMENTS, values.attachments),
  };
}
