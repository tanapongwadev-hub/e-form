import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { FlaskConicalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getJuristicProfile, getTfacCorporate } from "@/features/eform/api";
import { SERVICE_TYPES, type ServiceType } from "@/features/eform/constants";
import { FormPageHeader, FormSkeleton } from "@/features/eform/form-page";
import { FORM_CODE, FORM_TITLE } from "@/features/tfac-68-001-3/constants";
import { Tfac68001_3Form } from "@/features/tfac-68-001-3/tfac-68-001-3-form";
import { formatThaiDate, toIsoDate } from "@/features/eform/utils";

export const metadata: Metadata = {
  title: `${FORM_TITLE} | E-Form TFAC`,
};

export default function Page({ searchParams }: PageProps<"/forms/tfac-68-001-3">) {
  return (
    <div className="flex w-full flex-col gap-4 sm:gap-5">
      <FormPageHeader code={FORM_CODE} title={FORM_TITLE} subtitle="ตรวจสอบข้อมูลให้ครบถ้วน เพื่อดำเนินการต่ออายุทะเบียน" />
      <Suspense fallback={<FormSkeleton />}>
        <FormLoader searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function FormLoader({ searchParams }: Pick<PageProps<"/forms/tfac-68-001-3">, "searchParams">) {
  const { service } = await searchParams;
  const serviceType = SERVICE_TYPES.find((t) => t === service);

  const profile = await getJuristicProfile();
  const corporate = await getTfacCorporate(profile.juristicId, serviceType);

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  return (
    <Tfac68001_3Form
      // Remount when the mock service type changes so defaults are rebuilt.
      key={corporate.data.Corporate_Service_Name}
      profile={profile}
      corporate={corporate}
      writeDate={formatThaiDate(toIsoDate(today))}
      maxEndDate={toIsoDate(yesterday)}
      banner={<MockServiceSwitcher current={corporate.data.Corporate_Service_Name} />}
    />
  );
}

/** Mockup-only: switch the corporate service type to preview each form variant. */
function MockServiceSwitcher({ current }: { current: ServiceType }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[13px] border border-dashed border-[#eab855] bg-[#fff9e9] px-3 py-2.5 text-[10px] text-[#936311] sm:gap-2.5 sm:px-4 sm:text-[11px] dark:bg-amber-950/30 dark:text-amber-200">
      <span className="flex items-center gap-1.5">
        <FlaskConicalIcon className="size-4" />
        โหมดตัวอย่าง — ประเภทการให้บริการของนิติบุคคล:
      </span>
      <div role="group" aria-label="ประเภทการให้บริการ" className="grid w-full grid-cols-[1fr_1fr_1.5fr] gap-1 sm:flex sm:w-auto sm:gap-0.5">
        {SERVICE_TYPES.map((type) => (
          <Link
            key={type}
            href={{ query: { service: type } }}
            scroll={false}
            className={cn(
              "flex min-h-8 items-center justify-center rounded-[7px] px-3 py-1 transition-colors max-sm:min-h-[35px] max-sm:px-1.5",
              type === current
                ? "bg-[#ffecae] font-semibold text-[#805308] dark:bg-amber-900 dark:text-amber-100"
                : "text-[#996719] hover:bg-[#fff1c7] dark:text-amber-200 dark:hover:bg-amber-900/50",
            )}
            aria-current={type === current ? "true" : undefined}
          >
            {type}
          </Link>
        ))}
      </div>
    </div>
  );
}
