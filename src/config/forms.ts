import { FORM_CODE as RENEWAL_CODE, FORM_TITLE as RENEWAL_TITLE } from "@/features/tfac-68-001-3/constants";

export type FormEntry = {
  code: string;
  title: string;
  description: string;
  /** Route of the built form; undefined while the form is still being developed. */
  href?: string;
};

/** Every TFAC e-form (originals live in src/forms/*.html). Add `href` once a form is built. */
export const FORMS: FormEntry[] = [
  {
    code: "tfac-68-001-1",
    href: "/forms/tfac-68-001-1",
    title: "การแก้ไขข้อมูลนิติบุคคล",
    description: "แจ้งแก้ไขข้อมูลนิติบุคคล สำนักงาน และรายนามกรรมการ/หุ้นส่วนผู้จัดการ",
  },
  {
    code: "tfac-68-001-2",
    href: "/forms/tfac-68-001-2",
    title: "การแจ้งรายละเอียดเกี่ยวกับหลักประกันเพื่อประกันความรับผิดต่อบุคคลที่สาม",
    description: "แจ้งรายละเอียดหลักประกันความรับผิดต่อบุคคลที่สามของนิติบุคคล",
  },
  {
    code: RENEWAL_CODE,
    title: RENEWAL_TITLE,
    description: "ตรวจสอบข้อมูลนิติบุคคล รายได้ และแจ้งหัวข้อที่แก้ไข เพื่อต่ออายุทะเบียน",
    href: `/forms/${RENEWAL_CODE}`,
  },
  {
    code: "tfac-68-001-4",
    title: "การเปลี่ยนแปลงประเภทของหลักประกันเพื่อประกันความรับผิดต่อบุคคลที่สาม",
    description: "แจ้งเปลี่ยนประเภทหลักประกัน เช่น บัญชีเงินฝากประจำหรือบัตรเงินฝาก",
    href: "/forms/tfac-68-001-4",
  },
  {
    code: "tfac-68-001-5",
    title: "การเลิกการให้บริการด้านการสอบบัญชีหรือทำบัญชี",
    description: "แจ้งเลิกการให้บริการด้านการสอบบัญชีหรือการทำบัญชีของนิติบุคคล",
    href: "/forms/tfac-68-001-5",
  },
];

