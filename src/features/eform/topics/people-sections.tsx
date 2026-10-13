"use client";

import { Controller, useFormContext, type Control, type FieldValues, type Path } from "react-hook-form";
import { RadioField, TextField, TitleField } from "@/components/form/fields";
import { FormGrid } from "@/components/form/form-section";
import { ListEditor } from "@/components/form/list-editor";
import { OTHER_TITLE, TITLE_OPTIONS, WORKING_OPTIONS } from "../constants";
import { TOPIC_TEXT } from "./text";
import {
  accountantRowSchema,
  examinerRowSchema,
  resolveTitle,
  type AccountantRow,
  type ExaminerRow,
  type TopicValues,
} from "./schema";
import { digitsOnly } from "../utils";
import { TopicBlock, TotalLine } from "./topic-block";

/** Shared person fields: title, first/last name, citizen ID, optional license, working time. */
function PersonFields<T extends FieldValues>({
  control,
  prefix = "",
  licenseName,
  licenseLabel = "เลขทะเบียนผู้สอบบัญชีรับอนุญาต",
  workingName,
}: {
  control: Control<T>;
  prefix?: string;
  licenseName?: string;
  licenseLabel?: string;
  workingName: string;
}) {
  const p = (name: string) => `${prefix}${name}` as Path<T>;
  return (
    <FormGrid>
      <TitleField
        control={control}
        name={p("title")}
        otherName={p("titleOther")}
        label="คำนำหน้า"
        options={TITLE_OPTIONS}
        otherValue={OTHER_TITLE}
        required
        className="md:col-span-3"
      />
      <TextField control={control} name={p("name")} label="ชื่อ" required className="md:col-span-4" />
      <TextField control={control} name={p("lastName")} label="นามสกุล" required className="md:col-span-5" />
      <TextField
        control={control}
        name={p("citizenId")}
        label="เลขที่บัตรประจำตัวประชาชน"
        inputMode="numeric"
        maxLength={13}
        sanitize={digitsOnly}
        required
        className="md:col-span-6"
      />
      {licenseName && (
        <TextField
          control={control}
          name={p(licenseName)}
          label={licenseLabel}
          inputMode="numeric"
          maxLength={5}
          sanitize={digitsOnly}
          required
          className="md:col-span-6"
        />
      )}
      <RadioField
        control={control}
        name={p(workingName)}
        label="การปฏิบัติงาน"
        options={WORKING_OPTIONS}
        required
        className="md:col-span-12"
      />
    </FormGrid>
  );
}

const EMPTY_ACCOUNTANT: AccountantRow = {
  title: "",
  titleOther: "",
  name: "",
  lastName: "",
  citizenId: "",
  working: "",
};

export function AccountantSection() {
  const { control } = useFormContext<TopicValues>();
  return (
    <TopicBlock name="Accountant_Check" label={TOPIC_TEXT.accountantTitle}>
      <Controller
        control={control}
        name="Accountant"
        render={({ field, fieldState }) => (
          <>
            <ListEditor<AccountantRow>
              itemLabel="รายนามผู้ทำบัญชี"
              rows={field.value}
              onChange={field.onChange}
              schema={accountantRowSchema}
              emptyRow={EMPTY_ACCOUNTANT}
              error={fieldState.error?.message}
              invalid={fieldState.invalid}
              columns={[
                { header: "คำนำหน้า", cell: resolveTitle },
                { header: "ชื่อ", cell: (r) => r.name },
                { header: "นามสกุล", cell: (r) => r.lastName },
                { header: "เลขที่บัตรประจำตัวประชาชน", cell: (r) => r.citizenId, className: "tabular-nums" },
                { header: "การปฏิบัติงาน", cell: (r) => r.working },
              ]}
              renderFields={(c) => <PersonFields control={c} workingName="working" />}
            />
            <TotalLine label="จำนวนผู้ทำบัญชีที่รับผิดชอบในฐานะผู้ทำบัญชีของนิติบุคคล" value={field.value.length} />
          </>
        )}
      />
    </TopicBlock>
  );
}

export function HeadOfficeSection() {
  const { control } = useFormContext<TopicValues>();
  return (
    <TopicBlock name="HeadOffice_Check" label={TOPIC_TEXT.headOfficeTitle}>
      <PersonFields
        control={control}
        prefix="HeadOffice."
        licenseName="numberAccount"
        workingName="workingTime"
      />
    </TopicBlock>
  );
}

const EMPTY_EXAMINER: ExaminerRow = { ...EMPTY_ACCOUNTANT, license: "" };

export function ExaminerSection() {
  const { control } = useFormContext<TopicValues>();
  return (
    <TopicBlock name="Examiner_Check" label={TOPIC_TEXT.examinerTitle}>
      <Controller
        control={control}
        name="Examiner"
        render={({ field, fieldState }) => (
          <>
            <ListEditor<ExaminerRow>
              itemLabel="รายนามผู้สอบบัญชีรับอนุญาต"
              rows={field.value}
              onChange={field.onChange}
              schema={examinerRowSchema}
              emptyRow={EMPTY_EXAMINER}
              error={fieldState.error?.message}
              invalid={fieldState.invalid}
              columns={[
                { header: "คำนำหน้า", cell: resolveTitle },
                { header: "ชื่อ", cell: (r) => r.name },
                { header: "นามสกุล", cell: (r) => r.lastName },
                { header: "เลขที่บัตรประจำตัวประชาชน", cell: (r) => r.citizenId, className: "tabular-nums" },
                { header: "เลขทะเบียนผู้สอบบัญชี", cell: (r) => r.license, className: "tabular-nums" },
                { header: "การปฏิบัติงาน", cell: (r) => r.working },
              ]}
              renderFields={(c) => <PersonFields control={c} licenseName="license" workingName="working" />}
            />
            <TotalLine
              label="จำนวนผู้สอบบัญชีรับอนุญาตที่ลงลายมือชื่อในฐานะผู้สอบบัญชีรับอนุญาตนิติบุคคล"
              value={field.value.length}
            />
          </>
        )}
      />
    </TopicBlock>
  );
}
