import { Building2Icon } from "lucide-react";
import { ReadonlyField } from "@/components/form/fields";
import { FormGrid, FormSection } from "@/components/form/form-section";
import type { JuristicProfile } from "../api";
import { formatThaiDate } from "../utils";

/** "ข้อมูลนิติบุคคล" — read-only BizPortal profile shown at the top of every TFAC form. */
export function JuristicProfileSection({
  profile,
  writeDate,
  children,
}: {
  profile: JuristicProfile;
  writeDate: string;
  /** Extra (editable) fields for this form, rendered inside the same grid. */
  children?: React.ReactNode;
}) {
  return (
    <FormSection icon={Building2Icon} title="ข้อมูลนิติบุคคล" description="ดึงมาจากระบบ แก้ไขไม่ได้" tag={children ? undefined : "อ่านอย่างเดียว"}>
      <FormGrid>
        <ReadonlyField label="ชื่อนิติบุคคล ภาษาไทย" value={profile.nameTh} className="md:col-span-6" />
        <ReadonlyField label="ชื่อนิติบุคคล ภาษาอังกฤษ" value={profile.nameEn} className="md:col-span-6" />
        <ReadonlyField label="เลขทะเบียนนิติบุคคล 13 หลัก" value={profile.juristicId} className="md:col-span-4" />
        <ReadonlyField label="ประเภทนิติบุคคล" value={profile.juristicType} className="md:col-span-4" />
        <ReadonlyField label="เงินทุนจดทะเบียน (บาท)" value={profile.registerCapital} className="md:col-span-4" />
        <ReadonlyField label="วันที่จดทะเบียนนิติบุคคล" value={formatThaiDate(profile.registerDate)} className="md:col-span-4" />
        <ReadonlyField label="วันที่ยื่นคำขอ" value={writeDate} className="md:col-span-4" />
        <ReadonlyField label="เขียนที่" value="Biz Portal" className="md:col-span-4" />
        {children}
      </FormGrid>
    </FormSection>
  );
}
