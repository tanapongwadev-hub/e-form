"use client";

import { useMemo } from "react";
import { useWatch, type Control } from "react-hook-form";
import { ReadonlyField, SelectField, TextField } from "@/components/form/fields";
import { FormGrid } from "@/components/form/form-section";
import { ListEditor, type ListColumn } from "@/components/form/list-editor";
import {
  BANKS,
  FIELD_LABELS,
  TYPE_FIELDS,
  collateralByKey,
  collateralRowSchema,
  emptyCollateralRow,
  moneyText,
  type CollateralField,
  type CollateralKey,
  type CollateralRow,
} from "../collateral";
import { digitsOnly, formatMoney, formatThaiDate, parseAmount, sanitizeAmountInput } from "../utils";

type Props = {
  type: CollateralKey;
  rows: CollateralRow[];
  onChange?: (rows: CollateralRow[]) => void;
  /** Current collateral from the API: shown, not edited. */
  readOnly?: boolean;
  /** YYYY-MM-DD; due dates before this are rejected (original datepicker min = today). */
  minDueDate?: string;
  /** Pre-filled "ชื่อบัญชี" for new deposit rows (the juristic name, as in the original). */
  defaultAccountName?: string;
  error?: string;
};

const DATE_FIELDS = new Set<CollateralField>(["startDate", "dueDate"]);
const bankLabel = (value: string) => BANKS.find((b) => b.value === value)?.label ?? value;

function cellOf(field: CollateralField) {
  return (row: CollateralRow) => {
    const value = row[field];
    if (!value) return "";
    if (field === "bank") return bankLabel(value);
    if (DATE_FIELDS.has(field)) return formatThaiDate(value);
    if (field === "amount") return formatMoney(parseAmount(value));
    return value;
  };
}

/** List of one collateral type, edited row by row in a dialog (list-field in the original). */
export function CollateralList({ type, rows, onChange, readOnly, minDueDate, defaultAccountName, error }: Props) {
  const fields = TYPE_FIELDS[type];
  const schema = useMemo(() => collateralRowSchema(type, minDueDate), [type, minDueDate]);

  const columns: ListColumn<CollateralRow>[] = [
    ...fields.map((f) => ({
      header: FIELD_LABELS[f],
      cell: cellOf(f),
      className: f === "amount" ? "text-right tabular-nums whitespace-nowrap" : f === "duration" ? "text-right tabular-nums" : undefined,
    })),
    { header: "จำนวนเงิน (ตัวอักษร)", cell: (r) => (r.amount ? moneyText(r.amount) : "") },
  ];

  return (
    <ListEditor<CollateralRow>
      itemLabel={collateralByKey(type).label}
      rows={rows}
      onChange={onChange ?? (() => {})}
      columns={columns}
      schema={schema}
      emptyRow={emptyCollateralRow(defaultAccountName)}
      readOnly={readOnly}
      error={error}
      invalid={!!error}
      renderFields={(control) => <RowFields control={control} fields={fields} minDueDate={minDueDate} />}
    />
  );
}

function RowFields({
  control,
  fields,
  minDueDate,
}: {
  control: Control<CollateralRow>;
  fields: CollateralField[];
  minDueDate?: string;
}) {
  return (
    <FormGrid>
      {fields.map((f) => {
        const common = { control, name: f, label: FIELD_LABELS[f], required: true } as const;
        switch (f) {
          case "bank":
            return <SelectField key={f} {...common} options={BANKS} className="md:col-span-6" />;
          case "duration":
            return (
              <TextField
                key={f}
                {...common}
                inputMode="numeric"
                maxLength={3}
                sanitize={digitsOnly}
                align="right"
                description="ตั้งแต่ 12 เดือนขึ้นไป"
                className="md:col-span-6"
              />
            );
          case "startDate":
            return <TextField key={f} {...common} type="date" className="md:col-span-6" />;
          case "dueDate":
            return <TextField key={f} {...common} type="date" min={minDueDate} className="md:col-span-6" />;
          case "amount":
            return (
              <TextField
                key={f}
                {...common}
                inputMode="decimal"
                sanitize={sanitizeAmountInput}
                align="right"
                className="md:col-span-6"
              />
            );
          default:
            return <TextField key={f} {...common} className="md:col-span-6" />;
        }
      })}
      <MoneyText control={control} />
    </FormGrid>
  );
}

/** "จำนวนเงิน (ตัวอักษร)" follows the amount as it is typed (BAHTTEXT on keyup in the original). */
function MoneyText({ control }: { control: Control<CollateralRow> }) {
  const amount = useWatch({ control, name: "amount" });
  return <ReadonlyField label="จำนวนเงิน (ตัวอักษร)" value={moneyText(amount)} className="md:col-span-12" />;
}
