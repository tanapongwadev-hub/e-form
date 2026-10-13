"use client";

import { useForm, useFormContext, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2Icon, FileXIcon, InfoIcon, PaperclipIcon } from "lucide-react";
import { RadioField, TextareaField, TextField } from "@/components/form/fields";
import { FormNote, FormSection } from "@/components/form/form-section";
import { submitApplication, type JuristicProfile } from "@/features/eform/api";
import { attachmentsPayload } from "@/features/eform/attachments";
import { FormWizard } from "@/features/eform/form-wizard";
import { AttachmentsSection } from "@/features/eform/sections/attachments-section";
import { JuristicProfileSection } from "@/features/eform/sections/juristic-profile-section";
import { DevPayload, ReviewAttachments, ReviewCard, ReviewRow, TermsCheckbox } from "@/features/eform/sections/review";
import { ATTACHMENTS, CANCEL_TOPICS, FORM_CODE, TEXT } from "./constants";
import { STEPS, buildDefaultValues, formSchema, type FormValues } from "./schema";

type Props = {
  profile: JuristicProfile;
  writeDate: string;
};

/** Payload in the original e-form's field names (Applicant[...], CancelType[...], ApplicationAttachments[]). */
function buildPayload(values: FormValues, profile: JuristicProfile, writeDate: string) {
  return {
    Applicant: {
      WriteDate: writeDate,
      WriteAt: "Biz Portal",
      IdentityTypeTitle: "นิติบุคคล",
      Name: profile.nameTh,
      NameEn: profile.nameEn,
      JuristicType: profile.juristicType,
      JuristicId: profile.juristicId,
      RegisterCapital: profile.registerCapital,
      RegisterDate: profile.registerDate,
      Email: values.Applicant.Email,
    },
    CancelType: { Topic: values.CancelType.Topic, Detail: values.CancelType.Detail },
    ApplicationAttachments: attachmentsPayload(ATTACHMENTS, values.attachments),
    hdn1: "",
  };
}

export function Tfac68001_5Form({ profile, writeDate }: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(profile),
  });

  return (
    <FormWizard
      form={form}
      formCode={FORM_CODE}
      steps={STEPS}
      applicant={{ name: profile.nameTh, id: profile.juristicId }}
      draftScope={profile.juristicId}
      submit={(values) => submitApplication(FORM_CODE, buildPayload(values, profile, writeDate))}
      success={(values) => ({
        description: "ระบบได้รับคำร้องการเลิกการให้บริการของคุณแล้ว",
        rows: [
          ["นิติบุคคล", profile.nameTh],
          ["เลขทะเบียนนิติบุคคล", profile.juristicId],
          ["เหตุผล", values.CancelType.Topic.replace(" (โปรดระบุเหตุผล)", "")],
          ["วันที่ยื่นคำขอ", writeDate],
        ],
        email: values.Applicant.Email,
      })}
      renderStep={(step, goTo) => (
        <>
          {step === 0 && <GeneralStep profile={profile} writeDate={writeDate} />}
          {step === 1 && <CancelStep />}
          {step === 2 && (
            <>
              <FormNote icon={InfoIcon} tone="info">
                {TEXT.evidence}
              </FormNote>
              <AttachmentsSection
                title={TEXT.attachmentsTitle}
                description={TEXT.attachmentsDescription}
                attachments={ATTACHMENTS}
              />
            </>
          )}
          {step === 3 && <ReviewStep profile={profile} writeDate={writeDate} onEdit={goTo} />}
        </>
      )}
    />
  );
}

function GeneralStep({ profile, writeDate }: { profile: JuristicProfile; writeDate: string }) {
  const { control } = useFormContext<FormValues>();
  return (
    <JuristicProfileSection profile={profile} writeDate={writeDate}>
      <TextField
        control={control}
        name="Applicant.Email"
        label="อีเมล (ที่ใช้สำหรับติดต่อ)"
        type="email"
        required
        className="md:col-span-6"
      />
    </JuristicProfileSection>
  );
}

function CancelStep() {
  const { control } = useFormContext<FormValues>();
  // The reason box appears once a topic is picked (data-show-selector="#Detail" in the original).
  const topic = useWatch({ control, name: "CancelType.Topic" });
  return (
    <FormSection icon={FileXIcon} title="ขอยกเลิกการจดทะเบียนนิติบุคคล เนื่องจาก" description={TEXT.intro}>
      <RadioField
        control={control}
        name="CancelType.Topic"
        label="เหตุผลการยกเลิก"
        options={CANCEL_TOPICS}
        orientation="vertical"
        required
      />
      {topic && (
        <TextareaField
          control={control}
          name="CancelType.Detail"
          label="กรุณาระบุเหตุผล"
          placeholder="ระบุรายละเอียดเหตุผลการยกเลิก"
          maxLength={1000}
          required
        />
      )}
    </FormSection>
  );
}

function ReviewStep({
  profile,
  writeDate,
  onEdit,
}: {
  profile: JuristicProfile;
  writeDate: string;
  onEdit: (step: number) => void;
}) {
  const { control } = useFormContext<FormValues>();
  const values = useWatch({ control }) as FormValues;

  return (
    <div className="flex flex-col gap-3.5 sm:gap-[18px]">
      <ReviewCard step={0} title={STEPS[0].title} icon={Building2Icon} onEdit={onEdit}>
        <ReviewRow label="นิติบุคคล" value={profile.nameTh} hint={profile.juristicId} />
        <ReviewRow label="วันที่ยื่นคำขอ" value={writeDate} />
        <ReviewRow label="อีเมลสำหรับติดต่อ" value={values.Applicant.Email} />
      </ReviewCard>
      <ReviewCard step={1} title={STEPS[1].title} icon={FileXIcon} onEdit={onEdit}>
        <ReviewRow label="เหตุผล" value={values.CancelType.Topic} />
        <ReviewRow label="รายละเอียด" value={values.CancelType.Detail} />
      </ReviewCard>
      <ReviewCard step={2} title={STEPS[2].title} icon={PaperclipIcon} onEdit={onEdit}>
        <ReviewAttachments
          files={ATTACHMENTS.flatMap((a) => {
            const file = values.attachments[a.code];
            return file ? [{ key: a.code, name: file.name }] : [];
          })}
        />
      </ReviewCard>
      <TermsCheckbox />
      <DevPayload payload={buildPayload(values, profile, writeDate)} />
    </div>
  );
}
