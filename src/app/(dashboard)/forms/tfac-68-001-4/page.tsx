import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getJuristicProfile, getTfacCorporate } from "@/features/eform/api";
import { FormPageHeader, FormSkeleton, todayThai } from "@/features/eform/form-page";
import { toIsoDate } from "@/features/eform/utils";
import { FORM_CODE, FORM_TITLE } from "@/features/tfac-68-001-4/constants";
import { Tfac68001_4Form } from "@/features/tfac-68-001-4/tfac-68-001-4-form";

export const metadata: Metadata = {
  title: `${FORM_TITLE} | E-Form TFAC`,
};

export default function Page() {
  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <FormPageHeader
        code={FORM_CODE}
        title={FORM_TITLE}
        subtitle="แจ้งเปลี่ยนประเภทหลักประกันเพื่อประกันความรับผิดต่อบุคคลที่สามต่อสภาวิชาชีพบัญชี"
      />
      <Suspense fallback={<FormSkeleton />}>
        <FormLoader />
      </Suspense>
    </div>
  );
}

async function FormLoader() {
  // Per-request: the profile is the signed-in user's, and the dates are today's.
  await connection();
  const profile = await getJuristicProfile();
  const corporate = await getTfacCorporate(profile.juristicId);
  return (
    <Tfac68001_4Form profile={profile} corporate={corporate} writeDate={todayThai()} minDueDate={toIsoDate(new Date())} />
  );
}
