"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InfoIcon } from "lucide-react";
import { FormNote } from "@/components/form/form-section";
import { submitApplication, type JuristicProfile, type TfacCorporate } from "@/features/eform/api";
import type { ServiceType } from "@/features/eform/constants";
import { FormWizard } from "@/features/eform/form-wizard";
import { BeyondSection } from "@/features/eform/topics/beyond-section";
import { ManagerSection } from "@/features/eform/topics/manager-section";
import { AccountantSection, ExaminerSection, HeadOfficeSection } from "@/features/eform/topics/people-sections";
import { TOPIC_TEXT } from "@/features/eform/topics/text";
import { FORM_CODE, getVisibility } from "./constants";
import { buildDefaultValues, buildPayload } from "./defaults";
import { createFormSchema, type FormValues } from "./schema";
import { DocumentsSection } from "./sections/documents-section";
import { JuristicSection } from "@/features/eform/sections/juristic-section";
import { RetrospectSection } from "./sections/retrospect-section";
import { ReviewSection } from "./sections/review-section";
import { STEPS } from "./steps";

type Props = {
  profile: JuristicProfile;
  corporate: TfacCorporate;
  writeDate: string;
  maxEndDate: string;
  /** Shown above the form while it is being filled in; hidden after submitting. */
  banner?: React.ReactNode;
};

export function Tfac68001_3Form({ profile, corporate, writeDate, maxEndDate, banner }: Props) {
  const serviceType: ServiceType = corporate.data.Corporate_Service_Name;
  const visibility = getVisibility(serviceType);
  const address = corporate.address.find((a) => a.Address_Type_ID === 4);

  const schema = useMemo(() => createFormSchema(serviceType, maxEndDate), [serviceType, maxEndDate]);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(profile, corporate),
  });

  return (
    <FormWizard
      form={form}
      formCode={FORM_CODE}
      steps={STEPS}
      applicant={{ name: profile.nameTh, id: profile.juristicId, badge: serviceType }}
      // The schema differs by service type, so drafts are kept per variant.
      draftScope={`${profile.juristicId}:${serviceType}`}
      banner={banner}
      submit={(values) =>
        submitApplication(FORM_CODE, buildPayload(values, profile, corporate, serviceType, writeDate))
      }
      success={(values) => ({
        description: "ระบบได้รับคำร้องการต่ออายุทะเบียนนิติบุคคลของคุณแล้ว",
        rows: [
          ["นิติบุคคล", profile.nameTh],
          ["เลขทะเบียนนิติบุคคล", profile.juristicId],
          ["ประเภทการให้บริการ", serviceType],
          ["วันที่ยื่นคำขอ", writeDate],
        ],
        email: values.Applicant.Email,
      })}
      renderStep={(step, goTo) => (
        <>
          {step === 0 && <JuristicSection profile={profile} address={address} writeDate={writeDate} />}
          {step === 1 && <RetrospectSection serviceType={serviceType} maxEndDate={maxEndDate} />}
          {step === 2 && (
            <>
              <FormNote icon={InfoIcon} tone="info">
                {TOPIC_TEXT.changeTopicsNote}
              </FormNote>
              <ManagerSection visibility={visibility} />
              {visibility.accountant && <AccountantSection />}
              {visibility.headOffice && <HeadOfficeSection />}
              {visibility.examiner && <ExaminerSection />}
              {visibility.beyond && <BeyondSection />}
            </>
          )}
          {step === 3 && <DocumentsSection />}
          {step === 4 && (
            <ReviewSection
              profile={profile}
              corporate={corporate}
              serviceType={serviceType}
              writeDate={writeDate}
              onEdit={goTo}
            />
          )}
        </>
      )}
    />
  );
}
