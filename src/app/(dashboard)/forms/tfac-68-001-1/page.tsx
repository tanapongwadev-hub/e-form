import { Suspense } from "react";
import type { Metadata } from "next";
import { getJuristicProfile, getTfacCorporate } from "@/features/eform/api";
import { SERVICE_TYPES } from "@/features/eform/constants";
import { FormPageHeader, FormSkeleton, todayThai } from "@/features/eform/form-page";
import { FORM_CODE, FORM_TITLE } from "@/features/tfac-68-001-1/constants";
import { Tfac68001_1Form } from "@/features/tfac-68-001-1/tfac-68-001-1-form";

export const metadata: Metadata = { title: `${FORM_TITLE} | E-Form TFAC` };
export default function Page({ searchParams }: PageProps<"/forms/tfac-68-001-1">) {
  return <div className="flex min-w-0 w-full flex-col gap-4 sm:gap-5"><FormPageHeader code={FORM_CODE} title={FORM_TITLE} subtitle="แจ้งแก้ไขข้อมูลที่ได้จดทะเบียนไว้กับสภาวิชาชีพบัญชี" /><Suspense fallback={<FormSkeleton />}><FormLoader searchParams={searchParams} /></Suspense></div>;
}
async function FormLoader({ searchParams }: Pick<PageProps<"/forms/tfac-68-001-1">, "searchParams">) {
  const { previous, service } = await searchParams;
  const profile = await getJuristicProfile();
  const previousId = typeof previous === "string" && /^\d{13}$/.test(previous) ? previous : profile.juristicId;
  const corporate = await getTfacCorporate(previousId, SERVICE_TYPES.find((t) => t === service));
  return <Tfac68001_1Form key={`${previousId}:${corporate.data.Corporate_Service_Name}`} profile={profile} corporate={corporate} writeDate={todayThai()}
    banner={<div className="flex flex-wrap gap-3 rounded-xl border border-dashed bg-amber-50 p-3 text-xs text-amber-900"><span>โหมดตัวอย่าง:</span><a href="?">เลขทะเบียนเดิมตรงกับปัจจุบัน</a><a href="?previous=0105550123456">แปรสภาพนิติบุคคล (เลขทะเบียนเดิมต่างจากปัจจุบัน)</a>{SERVICE_TYPES.map((t) => <a key={t} href={`?service=${encodeURIComponent(t)}&previous=${previousId}`}>{t}</a>)}</div>} />;
}
