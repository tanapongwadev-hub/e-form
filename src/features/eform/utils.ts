const DIGIT_WORDS = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const POSITION_WORDS = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

/** Reads 0–999,999 in Thai. `hasHigher` makes a trailing 1 read "เอ็ด" (e.g. 1,000,001). */
function readBelowMillion(n: number, hasHigher: boolean): string {
  const digits = String(n);
  let text = "";
  for (let i = 0; i < digits.length; i++) {
    const d = Number(digits[i]);
    const pos = digits.length - 1 - i;
    if (d === 0) continue;
    if (pos === 0 && d === 1 && (digits.length > 1 || hasHigher)) text += "เอ็ด";
    else if (pos === 1 && d === 1) text += "สิบ";
    else if (pos === 1 && d === 2) text += "ยี่สิบ";
    else text += DIGIT_WORDS[d] + POSITION_WORDS[pos];
  }
  return text;
}

function readInteger(n: number): string {
  if (n < 1_000_000) return readBelowMillion(n, false);
  const millions = Math.floor(n / 1_000_000);
  const rest = n % 1_000_000;
  return readInteger(millions) + "ล้าน" + (rest ? readBelowMillion(rest, true) : "");
}

/** Converts an amount (number or "1,234.50") to Thai baht text, e.g. "หนึ่งพันสองร้อยสามสิบสี่บาทห้าสิบสตางค์". */
export function bahtText(value: number | string): string {
  const amount = typeof value === "number" ? value : parseAmount(value);
  if (!Number.isFinite(amount) || Math.round(amount * 100) === 0) return "ศูนย์บาทถ้วน";

  const totalSatang = Math.round(Math.abs(amount) * 100);
  const baht = Math.floor(totalSatang / 100);
  const satang = totalSatang % 100;

  const bahtPart = baht ? readInteger(baht) + "บาท" : "";
  const satangPart = satang ? readInteger(satang) + "สตางค์" : "ถ้วน";
  return bahtPart + satangPart;
}

/** "1,234.50" → 1234.5; empty or invalid → 0. */
export function parseAmount(value: string | undefined | null): number {
  const n = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** 1234.5 → "1,234.50" */
export function formatMoney(value: number): string {
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 1234 → "1,234" */
export function formatCount(value: number): string {
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/**
 * Live-formats a typed amount: keeps digits and one dot, max 2 decimals,
 * strips leading zeros and adds thousands separators. Empty becomes "0".
 */
export function sanitizeAmountInput(raw: string): string {
  let val = raw.replace(/[^0-9.]/g, "");
  const firstDot = val.indexOf(".");
  if (firstDot !== -1) {
    val = val.slice(0, firstDot + 1) + val.slice(firstDot + 1).replace(/\./g, "");
  }
  const [rawInt, decPart] = val.split(".");
  const intPart = (rawInt ?? "").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (decPart !== undefined) return `${intPart || "0"}.${decPart.slice(0, 2)}`;
  return intPart || "0";
}

/** Keeps digits only. */
export function digitsOnly(raw: string): string {
  return raw.replace(/\D/g, "");
}

/** Thai citizen ID: 13 digits with a valid mod-11 check digit. */
export function isValidThaiCitizenId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(id[i]) * (13 - i);
  return (11 - (sum % 11)) % 10 === Number(id[12]);
}

const thaiDateFormat = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "long", year: "numeric" });

/** ISO date (YYYY-MM-DD) → "9 ตุลาคม 2569". */
export function formatThaiDate(iso: string | undefined | null): string {
  if (!iso) return "-";
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  return Number.isNaN(date.getTime()) ? "-" : thaiDateFormat.format(date);
}

/** Local date as YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Returns the values that appear more than once (ignoring blanks). */
export function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const v of values) {
    const key = v.trim();
    if (!key) continue;
    if (seen.has(key)) dupes.add(key);
    seen.add(key);
  }
  return [...dupes];
}

/** Email check used by the original e-forms. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
