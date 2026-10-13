"use client";
import type { Control, FieldValues, Path } from "react-hook-form";
import { TextField } from "@/components/form/fields";
import { FormGrid } from "@/components/form/form-section";
import { ADDRESS_LABELS, type AddressValues } from "../address";
import { digitsOnly } from "../utils";

export function AddressFields<T extends FieldValues>({ control, prefix = "", branch = false, old = false }: { control: Control<T>; prefix?: string; branch?: boolean; old?: boolean }) {
  return <FormGrid>{(Object.keys(ADDRESS_LABELS) as (keyof AddressValues)[]).map((key) => {
    const editable = branch || ["Mobile", "Email"].includes(key) || (!old && ["TelePhone", "PostCode"].includes(key));
    return <TextField key={key} control={control} name={`${prefix}${key}` as Path<T>} label={ADDRESS_LABELS[key]}
      readOnly={!editable} required={editable && ["No", "SubDistrict", "District", "Province", "PostCode", "Branch_Code", "Mobile", "Email"].includes(key)}
      className="md:col-span-6" type={key === "Email" ? "email" : "text"}
      sanitize={["Branch_Code", "PostCode", "Mobile"].includes(key) ? digitsOnly : undefined}
      maxLength={["Branch_Code", "PostCode"].includes(key) ? 5 : key === "Mobile" ? 10 : undefined} />;
  })}</FormGrid>;
}
