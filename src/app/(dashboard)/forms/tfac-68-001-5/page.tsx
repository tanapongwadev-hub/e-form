import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getJuristicProfile } from "@/features/eform/api";
import { FormPageHeader, FormSkeleton, todayThai } from "@/features/eform/form-page";
import { FORM_CODE, FORM_TITLE } from "@/features/tfac-68-001-5/constants";
import { Tfac68001_5Form } from "@/features/tfac-68-001-5/tfac-68-001-5-form";

export const metadata: Metadata = {
  title: `${FORM_TITLE} | E-Form TFAC`,
};

export default function Page() {
  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <FormPageHeader code={FORM_CODE} title={FORM_TITLE} subtitle="แจ้งเลิกการให้บริการด้านการสอบบัญชีหรือการทำบัญชีของนิติบุคคล" />
      <Suspense fallback={<FormSkeleton />}>
        <FormLoader />
      </Suspense>
    </div>
  );
}

async function FormLoader() {
  // Per-request: the profile is the signed-in user's, and the date is today.
  await connection();
  const profile = await getJuristicProfile();
  return <Tfac68001_5Form profile={profile} writeDate={todayThai()} />;
}
