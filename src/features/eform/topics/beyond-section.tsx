"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { ReadonlyField, TextField } from "@/components/form/fields";
import { FormGrid, FormSubheading } from "@/components/form/form-section";
import { ListEditor } from "@/components/form/list-editor";
import { TOPIC_TEXT } from "./text";
import {
  STAFF_FIELDS,
  specialistRowSchema,
  sumSpecialists,
  sumStaff,
  type TopicValues,
  type SpecialistRow,
} from "./schema";
import { digitsOnly, formatCount, sanitizeAmountInput } from "../utils";
import { TopicBlock } from "./topic-block";

export function BeyondSection() {
  const { control } = useFormContext<TopicValues>();
  const beyond = useWatch({ control, name: "Beyond" });
  const specialists = useWatch({ control, name: "BeyondSpecialist" });
  const editOther = sumSpecialists(specialists);

  return (
    <TopicBlock name="Beyond_Check" label={TOPIC_TEXT.beyondTitle}>
      <FormGrid>
        <FormSubheading>รายละเอียดพนักงานเดิมที่ลงทะเบียนไว้</FormSubheading>
        {STAFF_FIELDS.map((f) => (
          <ReadonlyField key={f.key} label={f.label} value={beyond.Lastdata[f.key]} className="md:col-span-6" />
        ))}
        <ReadonlyField label="ผู้เชี่ยวชาญด้านอื่น ๆ" value={beyond.Lastdata.AmountOther} className="md:col-span-6" />
        <ReadonlyField label="รวมทั้งหมด" value={formatCount(sumStaff(beyond.Lastdata))} className="md:col-span-6" />
      </FormGrid>

      <FormGrid>
        <FormSubheading>รายละเอียดพนักงานที่ต้องการแก้ไข</FormSubheading>
        {STAFF_FIELDS.map((f) => (
          <TextField
            key={f.key}
            control={control}
            name={`Beyond.Editdata.${f.key}`}
            label={f.label}
            inputMode="numeric"
            sanitize={sanitizeAmountInput}
            align="right"
            required
            className="md:col-span-6"
          />
        ))}
        <ReadonlyField label="ผู้เชี่ยวชาญด้านอื่น ๆ (จากรายการด้านล่าง)" value={formatCount(editOther)} className="md:col-span-6" />
        <ReadonlyField
          label="รวมทั้งหมด"
          value={formatCount(sumStaff(beyond.Editdata) + editOther)}
          className="md:col-span-6"
        />
      </FormGrid>

      <div className="flex flex-col gap-2">
        <FormSubheading>{TOPIC_TEXT.beyondSpecialistTitle}</FormSubheading>
        <Controller
          control={control}
          name="BeyondSpecialist"
          render={({ field }) => (
            <ListEditor<SpecialistRow>
              itemLabel="ผู้เชี่ยวชาญ"
              rows={field.value}
              onChange={field.onChange}
              schema={specialistRowSchema}
              emptyRow={{ special: "", total: "" }}
              columns={[
                { header: "ผู้เชี่ยวชาญด้าน", cell: (r) => r.special },
                { header: "จำนวน", cell: (r) => r.total, className: "text-right tabular-nums" },
              ]}
              renderFields={(c) => (
                <FormGrid>
                  <TextField control={c} name="special" label="ผู้เชี่ยวชาญด้าน (โปรดระบุ)" required className="md:col-span-9" />
                  <TextField
                    control={c}
                    name="total"
                    label="จำนวน"
                    inputMode="numeric"
                    sanitize={digitsOnly}
                    align="right"
                    required
                    className="md:col-span-3"
                  />
                </FormGrid>
              )}
            />
          )}
        />
      </div>
    </TopicBlock>
  );
}
