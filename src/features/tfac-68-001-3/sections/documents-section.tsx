"use client";

import { AttachmentsSection } from "@/features/eform/sections/attachments-section";
import { CertificationSection } from "@/features/eform/sections/certification-section";
import { ATTACHMENTS } from "../constants";

export function DocumentsSection() {
  return (
    <>
      <AttachmentsSection
        title="หลักฐานการต่ออายุทะเบียนนิติบุคคล"
        description="พร้อมรับรองสำเนาถูกต้องและประทับตรา (ถ้ามี)"
        attachments={ATTACHMENTS}
      />
      <CertificationSection />
    </>
  );
}
