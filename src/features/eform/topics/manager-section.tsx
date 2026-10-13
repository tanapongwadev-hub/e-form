"use client";

import { Controller, useFormContext, useWatch, type Control } from "react-hook-form";
import { CheckIcon } from "lucide-react";
import { CheckboxField, RadioField, TextField } from "@/components/form/fields";
import { FormGrid } from "@/components/form/form-section";
import { ListEditor } from "@/components/form/list-editor";
import { NATIONALITY_OPTIONS } from "../constants";
import { TOPIC_TEXT } from "./text";
import {
  deriveManagerConditions,
  managerRowSchema,
  type ManagerRow,
  type TopicValues,
  type TopicVisibility,
} from "./schema";
import { digitsOnly } from "../utils";
import { ConditionStatus, TopicBlock, TotalLine } from "./topic-block";

const EMPTY_ROW: ManagerRow = {
  title: "",
  name: "",
  lastName: "",
  nationality: "",
  citizenId: "",
  license: "",
  passport: "",
  isAuthorized: false,
};

/** Keeps only the ID fields that match the chosen nationality. */
const normalize = (row: ManagerRow): ManagerRow =>
  row.nationality === "สัญชาติไทย" ? { ...row, passport: "" } : { ...row, citizenId: "", license: "" };

export function ManagerSection({ visibility }: { visibility: TopicVisibility }) {
  const { control } = useFormContext<TopicValues>();
  const rows = useWatch({ control, name: "Manager" });
  const conditions = deriveManagerConditions(rows);

  return (
    <TopicBlock name="Manager_Check" label={TOPIC_TEXT.managerTitle}>
      <p className="text-sm text-muted-foreground">
        รายชื่อกรรมการดึงมาจากข้อมูลนิติบุคคล กรุณากด &quot;เพิ่มข้อมูล&quot; เพื่อระบุสัญชาติ เลขประจำตัว
        และผู้มีอำนาจลงนามให้ครบทุกคน
      </p>
      <Controller
        control={control}
        name="Manager"
        render={({ field, fieldState }) => (
          <ListEditor<ManagerRow>
            itemLabel="รายนามกรรมการ/หุ้นส่วนผู้จัดการ"
            rows={field.value}
            onChange={(next) => field.onChange(next.map(normalize))}
            canAdd={false}
            canRemove={false}
            editLabel={(row) => (row.nationality ? "แก้ไขข้อมูล" : "เพิ่มข้อมูล")}
            schema={managerRowSchema}
            emptyRow={EMPTY_ROW}
            error={fieldState.error?.message}
            invalid={fieldState.invalid}
            columns={[
              { header: "คำนำหน้า", cell: (r) => r.title },
              { header: "ชื่อ", cell: (r) => r.name },
              { header: "นามสกุล", cell: (r) => r.lastName },
              { header: "สัญชาติ", cell: (r) => r.nationality },
              { header: "เลขที่บัตรประจำตัวประชาชน", cell: (r) => r.citizenId, className: "tabular-nums" },
              { header: "เลขทะเบียนผู้สอบบัญชี", cell: (r) => r.license, className: "tabular-nums" },
              { header: "เลขที่หนังสือเดินทาง", cell: (r) => r.passport },
              {
                header: "ผู้มีอำนาจลงนาม",
                cell: (r) => (r.isAuthorized ? <CheckIcon className="size-4 text-primary" aria-label="ใช่" /> : ""),
                className: "text-center",
              },
            ]}
            renderFields={(rowControl) => <ManagerFields control={rowControl} />}
          />
        )}
      />
      <TotalLine label="จำนวนกรรมการ/หุ้นส่วนผู้จัดการผู้มีอำนาจลงนามผูกพันนิติบุคคล" value={conditions.totalAuthorized} />
      <div className="grid gap-2 md:grid-cols-3">
        <ConditionStatus label="เงื่อนไข เลขที่บัตรประชาชนและสัญชาติ" passed={conditions.conIdCardNation} />
        {visibility.conAudit && <ConditionStatus label="เงื่อนไขผู้สอบบัญชี" passed={conditions.conAudit} />}
        <ConditionStatus label="เงื่อนไข กรรมการหุ้นส่วน" passed={conditions.conNumber} />
      </div>
    </TopicBlock>
  );
}

function ManagerFields({ control }: { control: Control<ManagerRow> }) {
  const nationality = useWatch({ control, name: "nationality" });
  return (
    <FormGrid>
      <TextField control={control} name="title" label="คำนำหน้า" readOnly className="md:col-span-3" />
      <TextField control={control} name="name" label="ชื่อ" readOnly className="md:col-span-4" />
      <TextField control={control} name="lastName" label="นามสกุล" readOnly className="md:col-span-5" />
      <RadioField
        control={control}
        name="nationality"
        label="สัญชาติ"
        options={NATIONALITY_OPTIONS}
        required
        className="md:col-span-12"
      />
      {nationality === "สัญชาติไทย" && (
        <>
          <TextField
            control={control}
            name="citizenId"
            label="เลขที่บัตรประจำตัวประชาชน"
            inputMode="numeric"
            maxLength={13}
            sanitize={digitsOnly}
            required
            className="md:col-span-6"
          />
          <TextField
            control={control}
            name="license"
            label="เลขทะเบียนผู้สอบบัญชีรับอนุญาต"
            description="กรอกเฉพาะกรรมการที่เป็นผู้สอบบัญชีรับอนุญาต"
            inputMode="numeric"
            maxLength={5}
            sanitize={digitsOnly}
            className="md:col-span-6"
          />
        </>
      )}
      {nationality === "ต่างด้าว" && (
        <TextField
          control={control}
          name="passport"
          label="เลขที่หนังสือเดินทาง"
          maxLength={25}
          required
          className="md:col-span-6"
        />
      )}
      <CheckboxField
        control={control}
        name="isAuthorized"
        label="กรรมการ/หุ้นส่วน ผู้จัดการผู้มีอำนาจลงนามผูกพันนิติบุคคล"
        className="md:col-span-12"
      />
    </FormGrid>
  );
}
