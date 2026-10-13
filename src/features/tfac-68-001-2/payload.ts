import { applicantPayload } from "@/features/eform/applicant";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import { attachmentsPayload } from "@/features/eform/attachments";
import { collateralByLabel, moneyText, sumCollateral, type CollateralKey, type CollateralRow } from "@/features/eform/collateral";
import { topicsPayload } from "@/features/eform/topics/defaults";
import { formatMoney } from "@/features/eform/utils";
import { ATTACHMENTS } from "./constants";
import { deriveFinancial, type FormValues } from "./schema";

const ROW_KEYS: Record<CollateralKey, Partial<Record<keyof CollateralRow, string>>> = {
  Deposit: { duration: "MonthDuration", bank: "BankName", branch: "BankBranch", accountName: "AccountName", accountNumber: "AccountNumber", dueDate: "DueDate", amount: "MoneyNumber" },
  Card: { bank: "BankName", branch: "BankBranch", accountName: "AccountName", accountNumber: "AccountNumber", dueDate: "DueDate", amount: "MoneyNumber" },
  BillGov: { issuer: "CreateBy", number: "Number", startDate: "StartDate", dueDate: "DueDate", amount: "MoneyNumber" },
  BillCorp: { issuer: "CreateBy", number: "Number", startDate: "StartDate", dueDate: "DueDate", amount: "MoneyNumber" },
  Policy: { company: "Company", number: "Number", dueDate: "DueDate", amount: "MoneyNumber" },
};
export function buildPayload(values: FormValues, profile: JuristicProfile, corporate: TfacCorporate, writeDate: string) {
  const type = collateralByLabel(values.AccountSavingType);
  const rows = type ? values.Collateral[type.key] : [];
  const f = deriveFinancial(values, corporate.data.Corporate_Service_Name);
  const money = { MoneyNumber: formatMoney(f.required), MoneyText: moneyText(String(f.required)) };
  return {
    Applicant: applicantPayload(profile, corporate, values.Applicant, writeDate),
    AccountTypeJuristic: corporate.data.Business_Name, AccountTypeService: corporate.data.Corporate_Service_Name,
    ...topicsPayload(values, corporate.data.Corporate_Service_Name),
    Financial: { ...Object.fromEntries(Object.entries(values.Financial).filter(([key]) =>
      !(corporate.data.Corporate_Service_Name === "สอบบัญชี" && key.startsWith("Number2")) &&
      !(corporate.data.Corporate_Service_Name === "ทำบัญชี" && key.startsWith("Number3")))),
      ...(corporate.data.Corporate_Service_Name !== "สอบบัญชี" && { Number2Total: formatMoney(f.number2), Number2TotalText: moneyText(String(f.number2)) }),
      ...(corporate.data.Corporate_Service_Name !== "ทำบัญชี" && { Number3Total: formatMoney(f.number3), Number3TotalText: moneyText(String(f.number3)) }) },
    AssetDetail: { ...values.AssetDetail, Number1: formatMoney(f.capital), Number23: formatMoney(f.income), CurrentTotalNumber: formatMoney(f.assets), CurrentTotalText: moneyText(String(f.assets)) },
    CapitalRegister_Check: f.capitalBasis ? "1" : "0", CapitalRegister: f.capitalBasis ? { Date: values.CapitalRegister.Date, ...money } : undefined,
    LastEndIncome_Check: f.capitalBasis ? "0" : "1", LastEndIncome: f.capitalBasis ? undefined : money,
    AccountSavingType: values.AccountSavingType, NewGuarantee_Type_ID: type ? String(type.id) : "",
    ...(type && { [type.key]: rows.map((row, index) => ({
      [`${type.key}_RunningNo`]: String(index + 1),
      ...Object.fromEntries(Object.entries(ROW_KEYS[type.key]).map(([key, suffix]) => [`${type.key}_${suffix}`, row[key as keyof CollateralRow]])),
      [`${type.key}_MoneyText`]: moneyText(row.amount),
    })) }),
    sumOldGuarantee: formatMoney(f.required), sumOldGuaranteeText: money.MoneyText,
    sumNewGuarantee: formatMoney(sumCollateral(rows)), sumNewGuaranteeText: moneyText(String(sumCollateral(rows))),
    conGuarantee: sumCollateral(rows) >= f.required ? "ผ่านเกณฑ์" : "",
    Confirm_DueDate_Check: values.Confirm_DueDate_Check ? "1" : "0", Confirm_Change_Check: values.Confirm_Change_Check ? "1" : "0",
    confirm_1: values.confirm_1 ? "1" : "0", ApplicationAttachments: attachmentsPayload(ATTACHMENTS, values.attachments),
  };
}
