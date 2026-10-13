"use client";

import { useFormContext } from "react-hook-form";
import { CircleCheckIcon, InfoIcon, MapPinIcon, PhoneIcon } from "lucide-react";
import { ReadonlyField, TextField } from "@/components/form/fields";
import { FormGrid, FormNote, FormSection } from "@/components/form/form-section";
import type { ApplicantContact } from "../applicant";
import type { JuristicProfile, TfacAddress } from "../api";
import { COMMON_TEXT } from "../constants";
import { digitsOnly } from "../utils";
import { JuristicProfileSection } from "./juristic-profile-section";

type Props = {
  profile: JuristicProfile;
  address?: TfacAddress;
  writeDate: string;
  officeEmail?: boolean;
  telephoneRequired?: boolean;
};

/**
 * Step "ข้อมูลทั่วไป" shared by forms 68-001-1 … 68-001-4: read-only juristic profile and receipt
 * address, plus the editable Applicant[...] contact fields.
 */
export function JuristicSection({ profile, address, writeDate, officeEmail = true, telephoneRequired = false }: Props) {
  const { control } = useFormContext<{ Applicant: ApplicantContact }>();

  return (
    <>
      <JuristicProfileSection profile={profile} writeDate={writeDate} />

      <FormSection icon={MapPinIcon} title="ที่อยู่ตามทะเบียนนิติบุคคล" description="ใช้เป็นที่อยู่สำหรับออกใบเสร็จรับเงิน" tag="อ่านอย่างเดียว">
        <FormGrid>
          <ReadonlyField label="เลขที่" value={address?.Address_Number} className="md:col-span-3" />
          <ReadonlyField label="หมู่ที่" value={address?.Moo} className="md:col-span-2" />
          <ReadonlyField label="หมู่บ้าน" value={address?.Village} className="md:col-span-3" />
          <ReadonlyField label="อาคาร" value={address?.Building_Name} className="md:col-span-3" />
          <ReadonlyField label="ชั้น" value={address?.Floor} className="md:col-span-1" />
          <ReadonlyField label="ตรอก/ซอย" value={address?.Soi} className="md:col-span-6" />
          <ReadonlyField label="ถนน" value={address?.Street} className="md:col-span-6" />
          <ReadonlyField label="ตำบล/แขวง" value={address?.Sub_District} className="md:col-span-3" />
          <ReadonlyField label="อำเภอ/เขต" value={address?.District} className="md:col-span-3" />
          <ReadonlyField label="จังหวัด" value={address?.Province} className="md:col-span-4" />
          <ReadonlyField label="รหัสไปรษณีย์" value={address?.Post_Code} className="md:col-span-2" />
        </FormGrid>
        <FormNote icon={InfoIcon}>{COMMON_TEXT.addressNote}</FormNote>
      </FormSection>

      <FormSection icon={PhoneIcon} title="ข้อมูลติดต่อ" description="ตรวจสอบและแก้ไขให้เป็นข้อมูลปัจจุบัน">
        <FormGrid>
          <TextField
            control={control}
            name="Applicant.Email"
            label="อีเมลสำหรับติดต่อ"
            type="email"
            required
            className="md:col-span-6"
          />
          {officeEmail && <TextField
            control={control}
            name="Applicant.OfficeEmail"
            label="อีเมลสำนักงาน"
            type="email"
            required
            className="md:col-span-6"
          />}
          <TextField
            control={control}
            name="Applicant.Mobile"
            label="เบอร์โทรศัพท์มือถือสำนักงาน"
            inputMode="numeric"
            maxLength={10}
            sanitize={digitsOnly}
            required
            className="md:col-span-4"
          />
          <TextField
            control={control}
            name="Applicant.Telephone"
            required={telephoneRequired}
            label="เบอร์โทรศัพท์สำนักงาน"
            inputMode="tel"
            maxLength={20}
            className="md:col-span-4"
          />
          <ReadonlyField label="รหัสสาขา" value={address?.Branch_Code} className="md:col-span-4" />
        </FormGrid>
        <FormNote icon={CircleCheckIcon} tone="muted">
          กรุณาระบุอีเมลและเบอร์โทรศัพท์ที่สามารถติดต่อได้ เพื่อรับข้อมูลเกี่ยวกับคำขอ
        </FormNote>
      </FormSection>
    </>
  );
}
