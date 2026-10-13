import { Suspense } from "react";
import type { Metadata } from "next";
import { SERVICE_TYPES } from "@/features/eform/constants";
import { getJuristicProfile, getTfacCorporate } from "@/features/eform/api";
import { FormPageHeader, FormSkeleton, todayThai } from "@/features/eform/form-page";
import { toIsoDate } from "@/features/eform/utils";
import { FORM_CODE, FORM_TITLE } from "@/features/tfac-68-001-2/constants";
import { Tfac68001_2Form } from "@/features/tfac-68-001-2/tfac-68-001-2-form";

export const metadata: Metadata = {
  title: `${FORM_TITLE} | E-Form TFAC`,
};

export default function Page({ searchParams }: PageProps<"/forms/tfac-68-001-2">) {
  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <FormPageHeader
        code={FORM_CODE}
        title={FORM_TITLE}
        subtitle="แจ้งรายละเอียดหลักประกันเพื่อประกันความรับผิดต่อบุคคลที่สามต่อสภาวิชาชีพบัญชี"
      />
      <Suspense fallback={<FormSkeleton />}>
        <FormLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FormLoader({ searchParams }: Pick<PageProps<"/forms/tfac-68-001-2">, "searchParams">) {
  // Per-request: the profile is the signed-in user's, and the dates are today's.
  const { service } = await searchParams;
  const profile = await getJuristicProfile();
  const corporate = await getTfacCorporate(profile.juristicId, SERVICE_TYPES.find((t) => t === service));
  return (
    <Tfac68001_2Form key={corporate.data.Corporate_Service_Name} profile={profile} corporate={corporate} writeDate={todayThai()} minDueDate={toIsoDate(new Date())}
      banner={<div className="flex flex-wrap gap-3 rounded-xl border border-dashed bg-amber-50 p-3 text-xs text-amber-900"><span>โหมดตัวอย่าง — ประเภทบริการ:</span>{SERVICE_TYPES.map((t) => <a key={t} href={`?service=${encodeURIComponent(t)}`}>{t}</a>)}</div>} />
  );
}

