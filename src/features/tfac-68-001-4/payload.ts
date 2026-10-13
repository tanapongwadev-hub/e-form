import { applicantPayload } from "@/features/eform/applicant";
import type { JuristicProfile, TfacCorporate } from "@/features/eform/api";
import { attachmentsPayload } from "@/features/eform/attachments";
import {
  collateralByLabel,
  moneyText,
  sumCollateral,
  type CollateralField,
  type CollateralKey,
  type CollateralRow,
} from "@/features/eform/collateral";
import { formatMoney, parseAmount } from "@/features/eform/utils";
import { ATTACHMENTS } from "./constants";
import { currentCollateral, type FormValues } from "./schema";

type Source = CollateralField | "runningNo" | "moneyText";

/*
 * Row keys exactly as the original e-form posts them — including its typos
 * (Old_Deposit_RunnginNo, Olb_BillCorp_*, Old_Billcorp_Number, New_Deposit_Duraion) —
 * so the backend contract does not change.
 */
const OLD_KEYS: Record<CollateralKey, [Source, string][]> = {
  Deposit: [
    ["runningNo", "Old_Deposit_RunnginNo"],
    ["duration", "Old_Deposit_Duration"],
    ["bank", "Old_Deposit_Bank"],
    ["branch", "Old_Deposit_Branch"],
    ["accountName", "Old_Deposit_AccountName"],
    ["accountNumber", "Old_Deposit_AccountNumber"],
    ["dueDate", "Old_Deposit_DueDate"],
    ["amount", "Old_Deposit_MoneyNumber"],
    ["moneyText", "Old_Deposit_MoneyText"],
  ],
  Card: [
    ["runningNo", "Old_Card_RunningNo"],
    ["bank", "Old_Card_Bank"],
    ["branch", "Old_Card_Branch"],
    ["accountName", "Old_Card_AccountName"],
    ["accountNumber", "Old_Card_AccountNumber"],
    ["amount", "Old_Card_MoneyNumber"],
    ["moneyText", "Old_Card_MoneyText"],
  ],
  BillGov: [
    ["runningNo", "Old_BillGov_RunningNo"],
    ["issuer", "Old_BillGov_CreateBy"],
    ["number", "Old_BillGov_Number"],
    ["startDate", "Old_BillGov_StartDate"],
    ["dueDate", "Old_BillGov_DueDate"],
    ["amount", "Old_BillGov_MoneyNumber"],
    ["moneyText", "Old_BillGov_MoneyText"],
  ],
  BillCorp: [
    ["runningNo", "Olb_BillCorp_RunningNo"],
    ["issuer", "Olb_BillCorp_CreateBy"],
    ["number", "Old_Billcorp_Number"],
    ["startDate", "Old_BillCorp_StartDate"],
    ["dueDate", "Old_BillCorp_DueDate"],
    ["amount", "Old_BillCorp_MoneyNumber"],
    ["moneyText", "Old_BillCorp_MoneyText"],
  ],
  Policy: [
    ["runningNo", "Old_Policy_RunningNo"],
    ["company", "Old_Policy_CreateBy"],
    ["number", "Old_Policy_Number"],
    ["startDate", "Old_Policy_StartDate"],
    ["dueDate", "Old_Policy_DueDate"],
    ["amount", "Old_Policy_MoneyNumber"],
    ["moneyText", "Old_Policy_MoneyText"],
  ],
};

const NEW_KEYS: Record<CollateralKey, [Source, string][]> = {
  Deposit: [
    ["runningNo", "New_Deposit_RunningNo"],
    ["duration", "New_Deposit_Duraion"],
    ["bank", "New_Deposit_Bank"],
    ["branch", "New_Deposit_Branch"],
    ["accountName", "New_Deposit_AccountName"],
    ["accountNumber", "New_Deposit_AccountNumber"],
    ["dueDate", "New_Deposit_DueDate"],
    ["amount", "New_Deposit_MoneyNumber"],
    ["moneyText", "New_Deposit_MoneyText"],
  ],
  Card: [
    ["runningNo", "New_Card_RunningNo"],
    ["bank", "New_Card_Bank"],
    ["branch", "New_Card_Branch"],
    ["accountName", "New_Card_AccountName"],
    ["accountNumber", "New_Card_AccountNumber"],
    ["dueDate", "New_Card_DueDate"],
    ["amount", "New_Card_MoneyNumber"],
    ["moneyText", "New_Card_MoneyText"],
  ],
  BillGov: [
    ["runningNo", "New_BillGov_RunningNo"],
    ["issuer", "New_BillGov_CreateBy"],
    ["number", "New_BillGov_Number"],
    ["startDate", "New_BillGov_StartDate"],
    ["dueDate", "New_BillGov_DueDate"],
    ["amount", "New_BillGov_MoneyNumber"],
    ["moneyText", "New_BillGov_MoneyText"],
  ],
  BillCorp: [
    ["runningNo", "New_BillCorp_RunningNo"],
    ["issuer", "New_BillCorp_CreateBy"],
    ["number", "New_BillCorp_Number"],
    ["startDate", "New_BillCorp_StartDate"],
    ["dueDate", "New_BillCorp_DueDate"],
    ["amount", "New_BillCorp_MoneyNumber"],
    ["moneyText", "New_BillCorp_MoneyText"],
  ],
  Policy: [
    ["runningNo", "New_Policy_RunningNo"],
    ["company", "New_Policy_Company"],
    ["number", "New_Policy_Number"],
    ["dueDate", "New_Policy_DueDate"],
    ["amount", "New_Policy_MoneyNumber"],
    ["moneyText", "New_Policy_MoneyText"],
  ],
};

function mapRows(rows: CollateralRow[], keys: [Source, string][]) {
  return rows.map((row, i) =>
    Object.fromEntries(
      keys.map(([source, key]) => {
        if (source === "runningNo") return [key, String(i + 1)];
        if (source === "moneyText") return [key, moneyText(row.amount)];
        if (source === "amount") return [key, formatMoney(parseAmount(row.amount))];
        return [key, row[source]];
      }),
    ),
  );
}

export function buildPayload(values: FormValues, profile: JuristicProfile, corporate: TfacCorporate, writeDate: string) {
  const old = currentCollateral(corporate);
  const next = collateralByLabel(values.New_Guarantee);
  const newRows = next ? values.New[next.key] : [];
  const sumOld = old ? sumCollateral(old.rows) : 0;
  const sumNew = sumCollateral(newRows);

  return {
    Applicant: applicantPayload(profile, corporate, values.Applicant, writeDate),
    Old_Guarantee: old?.label ?? "",
    ...(old && { [`Old_${old.key}`]: mapRows(old.rows, OLD_KEYS[old.key]) }),
    New_Guarantee: values.New_Guarantee,
    NewGuarantee_Type_ID: next ? String(next.id) : "",
    ...(next && { [`New_${next.key}`]: mapRows(newRows, NEW_KEYS[next.key]) }),
    Guarantee: {
      sumOldGuarantee: formatMoney(sumOld),
      sumOldGuaranteeText: moneyText(String(sumOld)),
      sumNewGuarantee: formatMoney(sumNew),
      sumNewGuaranteeText: moneyText(String(sumNew)),
    },
    Confirm: { DueDate: values.Confirm.DueDate ? "1" : "0", Change: values.Confirm.Change ? "1" : "0" },
    confirm_1: values.confirm_1 ? "1" : "0",
    ApplicationAttachments: attachmentsPayload(ATTACHMENTS, values.attachments),
  };
}
