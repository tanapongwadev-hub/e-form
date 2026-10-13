/**
 * Collateral ("หลักประกันเพื่อประกันความรับผิดต่อบุคคลที่สาม") shared by forms 68-001-2 and 68-001-4.
 * One generic row model covers all five types; each type declares which fields it uses.
 * The forms map rows to their own original field names when building the payload.
 */
import { z } from "zod";
import type { TfacGuarantee } from "./api";
import { bahtText, parseAmount } from "./utils";

export const COLLATERAL_TYPES = [
  { id: 1, key: "Deposit", label: "บัญชีเงินฝากประจำ" },
  { id: 2, key: "Card", label: "บัตรเงินฝาก" },
  { id: 3, key: "BillGov", label: "พันธบัตรรัฐบาลไทย" },
  { id: 4, key: "BillCorp", label: "พันธบัตรองค์กรหรือรัฐวิสาหกิจ" },
  { id: 5, key: "Policy", label: "กรมธรรม์ประกันภัยความรับผิดทางวิชาชีพบัญชีของผู้ประกอบวิชาชีพบัญชี" },
] as const;
export type CollateralKey = (typeof COLLATERAL_TYPES)[number]["key"];
export type CollateralLabel = (typeof COLLATERAL_TYPES)[number]["label"];

export const collateralByKey = (key: CollateralKey) => COLLATERAL_TYPES.find((t) => t.key === key)!;
export const collateralByLabel = (label: string) => COLLATERAL_TYPES.find((t) => t.label === label);

/** Bank list from the original forms' script (value is what gets sent; label is shown). */
export const BANKS: { value: string; label: string }[] = [
  { value: "ธนาคารกรุงเทพ", label: "ธนาคารกรุงเทพ" },
  { value: "ธนาคารกรุงไทย", label: "ธนาคารกรุงไทย" },
  { value: "ธนาคารกรุงศรีอยุธยา", label: "ธนาคารกรุงศรีอยุธยา" },
  { value: "ธนาคารกสิกรไทย", label: "ธนาคารกสิกรไทย" },
  { value: "ธนาคารเกียรตินาคินภัทร", label: "ธนาคารเกียรตินาคินภัทร" },
  { value: "ธนาคารซีไอเอ็มบีไทย", label: "ธนาคารซีไอเอ็มบีไทย" },
  { value: "ธนาคารทิสโก้", label: "ธนาคารทิสโก้" },
  { value: "ธนาคารทหารไทยธนชาต", label: "ธนาคารทหารไทยธนชาต (ttb)" },
  { value: "ธนาคารไทยเครดิต", label: "ธนาคารไทยเครดิต" },
  { value: "ธนาคารไทยพาณิชย์", label: "ธนาคารไทยพาณิชย์" },
  { value: "ธนาคารยูไนเต็ด โอเวอร์ซีส์ (ไทย)", label: "ธนาคารยูโอบี (UOB)" },
  { value: "ธนาคารแลนด์ แอนด์ เฮาส์", label: "ธนาคารแลนด์ แอนด์ เฮาส์" },
  { value: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร", label: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)" },
  { value: "ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย", label: "ธนาคารเพื่อการส่งออกและนำเข้าแห่งประเทศไทย (EXIM)" },
  { value: "ธนาคารออมสิน", label: "ธนาคารออมสิน" },
  { value: "ธนาคารอาคารสงเคราะห์", label: "ธนาคารอาคารสงเคราะห์ (ธอส.)" },
  { value: "ธนาคารอิสลามแห่งประเทศไทย", label: "ธนาคารอิสลามแห่งประเทศไทย" },
  { value: "ธนาคาร Mizuho", label: "ธนาคารมิซูโฮ (Mizuho)" },
  { value: "ธนาคาร Standard Chartered", label: "ธนาคารสแตนดาร์ดชาร์เตอร์ด" },
  { value: "ธนาคารซูมิโตโม มิตซุย แบงกิ้ง คอร์ปอเรชั่น", label: "ธนาคารซูมิโตโม มิตซุย แบงกิ้ง คอร์ปอเรชั่น (SMBC)" },
  { value: "ธนาคารดอยซ์แบงก์", label: "ธนาคารดอยซ์แบงก์" },
  { value: "ธนาคารโอเวอร์ซี-ไชนีสแบงกิ้งคอร์ปอเรชั่น", label: "ธนาคารโอเวอร์ซี-ไชนีสแบงกิ้งคอร์ปอเรชั่น (OCBC)" },
  { value: "ธนาคารฮ่องกงและเซี่ยงไฮ้", label: "ธนาคารฮ่องกงและเซี่ยงไฮ้ (HSBC)" },
];

export const collateralRowSchemaShape = z.object({
  duration: z.string(), // months, Deposit only
  bank: z.string(),
  branch: z.string(),
  accountName: z.string(),
  accountNumber: z.string(),
  issuer: z.string(), // "ออกโดย" (bonds)
  company: z.string(), // insurer (Policy)
  number: z.string(),
  startDate: z.string(),
  dueDate: z.string(),
  amount: z.string(),
});
export type CollateralRow = z.infer<typeof collateralRowSchemaShape>;
export type CollateralField = Exclude<keyof CollateralRow, never>;

export const FIELD_LABELS: Record<CollateralField, string> = {
  duration: "ระยะเวลาฝากประจำ (เดือน)",
  bank: "ธนาคาร",
  branch: "สาขา",
  accountName: "ชื่อบัญชี",
  accountNumber: "เลขที่บัญชี",
  issuer: "ออกโดย",
  company: "บริษัท",
  number: "เลขที่",
  startDate: "วันที่",
  dueDate: "วันที่ครบกำหนด",
  amount: "จำนวนเงิน (บาท)",
};

/** Fields used by each type, in table/dialog order. */
export const TYPE_FIELDS: Record<CollateralKey, CollateralField[]> = {
  Deposit: ["duration", "bank", "branch", "accountName", "accountNumber", "dueDate", "amount"],
  Card: ["bank", "branch", "accountName", "accountNumber", "dueDate", "amount"],
  BillGov: ["issuer", "number", "startDate", "dueDate", "amount"],
  BillCorp: ["issuer", "number", "startDate", "dueDate", "amount"],
  Policy: ["company", "number", "dueDate", "amount"],
};

export const emptyCollateralRow = (accountName = ""): CollateralRow => ({
  duration: "",
  bank: "",
  branch: "",
  accountName,
  accountNumber: "",
  issuer: "",
  company: "",
  number: "",
  startDate: "",
  dueDate: "",
  amount: "",
});

export const UNDER_12_MONTHS = "ต้องเป็นบัญชีประเภทฝากประจำตั้งแต่ 12 เดือนขึ้นไป";

/**
 * Row schema for one type (used by the row dialog). `minDueDate` (YYYY-MM-DD) mirrors the
 * original datepicker's min date for due dates.
 */
export function collateralRowSchema(key: CollateralKey, minDueDate?: string) {
  return collateralRowSchemaShape.superRefine((row, ctx) => {
    for (const field of TYPE_FIELDS[key]) {
      if (!row[field].trim()) ctx.addIssue({ code: "custom", path: [field], message: "กรุณากรอกข้อมูล" });
    }
    if (key === "Deposit" && row.duration && Number(row.duration) < 12) {
      ctx.addIssue({ code: "custom", path: ["duration"], message: UNDER_12_MONTHS });
    }
    if (row.amount && parseAmount(row.amount) <= 0) {
      ctx.addIssue({ code: "custom", path: ["amount"], message: "จำนวนเงินต้องมากกว่า 0" });
    }
    if (minDueDate && row.dueDate && row.dueDate < minDueDate) {
      ctx.addIssue({ code: "custom", path: ["dueDate"], message: "วันที่ครบกำหนดต้องไม่ก่อนวันนี้" });
    }
    if (row.startDate && row.dueDate && row.dueDate < row.startDate) {
      ctx.addIssue({ code: "custom", path: ["dueDate"], message: "วันที่ครบกำหนดต้องไม่ก่อนวันที่ออก" });
    }
  });
}

export const sumCollateral = (rows: CollateralRow[]) => rows.reduce((sum, r) => sum + parseAmount(r.amount), 0);
export const moneyText = (amount: string) => bahtText(amount);

/** Rows of the current collateral from the TFAC corporate API (getJurData in 68-001-4). */
export function rowsFromGuarantee(items: TfacGuarantee[]): CollateralRow[] {
  return items.map((g) => ({
    ...emptyCollateralRow(),
    duration: g.Bank_Year ?? "",
    bank: g.Bank_Name ?? "",
    branch: g.Bank_Branch ?? "",
    accountName: g.Bank_Account_Name ?? "",
    accountNumber: g.Bank_Account_ID ?? "",
    issuer: g.Bond_Of ?? "",
    company: g.Bond_Of ?? "",
    number: g.Bond_No ?? "",
    startDate: g.Bond_Date ?? "",
    dueDate: g.Bond_Due_Date ?? g.Bank_Due_Date ?? "",
    amount: g.Amount,
  }));
}
