"use client";

import { useId } from "react";
import { Controller, useWatch, type Control, type FieldValues, type Path } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BaseProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  className?: string;
  description?: string;
};

/** Input look shared by every field (design: 43px tall, soft blue border). */
export const INPUT_CLASS = "h-11 rounded-[10px] border-[#d5e2f3] bg-card px-3 text-base md:text-xs hover:border-[#91b8eb] aria-invalid:bg-[#fff7f8] dark:border-input dark:aria-invalid:bg-transparent";
/** Read-only (API) input look. */
export const READONLY_CLASS = "border-[#e3edf9] bg-[#f1f6fd] text-[#7085a0] hover:border-[#e3edf9] dark:border-input dark:bg-muted dark:text-muted-foreground";

function Label({ htmlFor, label, required }: { htmlFor?: string; label: string; required?: boolean }) {
  return (
    <FieldLabel htmlFor={htmlFor} className="gap-1 text-xs font-normal text-[#395472] dark:text-muted-foreground">
      {label}
      {required && <span className="text-[#e24b62]">*</span>}
    </FieldLabel>
  );
}

/** Read-only display of API data, styled like a disabled input. */
export function ReadonlyField({ label, value, className }: { label: string; value?: string; className?: string }) {
  const id = useId();
  return (
    <Field className={className}>
      <Label htmlFor={id} label={label} />
      <Input id={id} value={value || "-"} readOnly tabIndex={-1} className={cn(INPUT_CLASS, READONLY_CLASS, "md:text-xs")} />
    </Field>
  );
}

type TextFieldProps<T extends FieldValues> = BaseProps<T> &
  Pick<React.ComponentProps<"input">, "type" | "inputMode" | "maxLength" | "placeholder" | "max" | "min"> & {
    readOnly?: boolean;
    /** Transforms the typed value, e.g. to keep digits only. */
    sanitize?: (value: string) => string;
    align?: "left" | "right";
  };

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  description,
  readOnly,
  sanitize,
  align = "left",
  ...inputProps
}: TextFieldProps<T>) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <Label htmlFor={id} label={label} required={required} />
          <Input
            {...inputProps}
            {...field}
            id={id}
            value={field.value ?? ""}
            onChange={(e) => field.onChange(sanitize ? sanitize(e.target.value) : e.target.value)}
            readOnly={readOnly}
            aria-invalid={fieldState.invalid}
            className={cn(INPUT_CLASS, readOnly && READONLY_CLASS, align === "right" && "text-right tabular-nums")}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

type TextareaFieldProps<T extends FieldValues> = BaseProps<T> & {
  placeholder?: string;
  maxLength?: number;
  rows?: number;
};

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  description,
  placeholder,
  maxLength,
  rows = 3,
}: TextareaFieldProps<T>) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <Label htmlFor={id} label={label} required={required} />
          <Textarea
            {...field}
            id={id}
            value={field.value ?? ""}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={rows}
            aria-invalid={fieldState.invalid}
            className="min-h-24 rounded-[10px] border-[#d5e2f3] bg-card text-base hover:border-[#91b8eb] aria-invalid:bg-[#fff7f8] md:text-xs dark:border-input dark:aria-invalid:bg-transparent"
          />
          {(description || maxLength) && (
            <FieldDescription className="flex justify-between gap-2 text-[11px]">
              <span>{description}</span>
              {maxLength && (
                <span className="shrink-0 tabular-nums">
                  {String(field.value ?? "").length}/{maxLength}
                </span>
              )}
            </FieldDescription>
          )}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

type RadioFieldProps<T extends FieldValues> = BaseProps<T> & {
  options: readonly string[];
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
};

export function RadioField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  options,
  disabled,
  orientation = "horizontal",
}: RadioFieldProps<T>) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <Label label={label} required={required} />
          <RadioGroup
            ref={field.ref}
            value={field.value ?? ""}
            onValueChange={(value) => field.onChange(value)}
            disabled={disabled}
            aria-invalid={fieldState.invalid}
            className={cn(orientation === "horizontal" && "flex flex-wrap gap-x-6")}
          >
            {options.map((option, i) => (
              <Field key={option} orientation="horizontal" className="w-auto">
                <RadioGroupItem value={option} id={`${id}-${i}`} aria-invalid={fieldState.invalid} />
                <FieldLabel htmlFor={`${id}-${i}`} className="font-normal">
                  {option}
                </FieldLabel>
              </Field>
            ))}
          </RadioGroup>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

type CheckboxFieldProps<T extends FieldValues> = Omit<BaseProps<T>, "label"> & {
  label: React.ReactNode;
  labelClassName?: string;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  className,
  labelClassName,
  disabled,
  onCheckedChange,
}: CheckboxFieldProps<T>) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <Field orientation="horizontal" className="items-start">
            <Checkbox
              ref={field.ref}
              id={id}
              checked={!!field.value}
              onCheckedChange={(checked) => { field.onChange(checked); onCheckedChange?.(checked === true); }}
              disabled={disabled}
              aria-invalid={fieldState.invalid}
              className="mt-0.5"
            />
            <FieldLabel htmlFor={id} className={cn("leading-relaxed", labelClassName)}>
              {label}
            </FieldLabel>
          </Field>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

type SelectFieldProps<T extends FieldValues> = BaseProps<T> & {
  options: readonly (string | { value: string; label: string })[];
  placeholder?: string;
};

export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  className,
  description,
  options,
  placeholder = "-- กรุณาเลือก --",
}: SelectFieldProps<T>) {
  const id = useId();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className={className}>
          <Label htmlFor={id} label={label} required={required} />
          <NativeSelect
            {...field}
            id={id}
            value={field.value ?? ""}
            aria-invalid={fieldState.invalid}
            className="w-full *:data-[slot=native-select]:h-11 *:data-[slot=native-select]:rounded-[10px] *:data-[slot=native-select]:border-[#d5e2f3] *:data-[slot=native-select]:bg-card *:data-[slot=native-select]:text-xs dark:*:data-[slot=native-select]:border-input"
          >
            <NativeSelectOption value="">{placeholder}</NativeSelectOption>
            {options.map((o) => {
              const { value, label: text } = typeof o === "string" ? { value: o, label: o } : o;
              return (
                <NativeSelectOption key={value} value={value}>
                  {text}
                </NativeSelectOption>
              );
            })}
          </NativeSelect>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}

type TitleFieldProps<T extends FieldValues> = Omit<BaseProps<T>, "name"> & {
  name: Path<T>;
  otherName: Path<T>;
  options: readonly string[];
  /** Option value that reveals the free-text input. */
  otherValue: string;
};

/** Title select; picking `otherValue` shows a free-text input bound to `otherName`. */
export function TitleField<T extends FieldValues>({
  control,
  name,
  otherName,
  label,
  required,
  className,
  options,
  otherValue,
}: TitleFieldProps<T>) {
  const id = useId();
  const title = useWatch({ control, name });
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Label htmlFor={id} label={label} required={required} />
            <NativeSelect
              {...field}
              id={id}
              value={field.value ?? ""}
              aria-invalid={fieldState.invalid}
              className={cn("w-full *:data-[slot=native-select]:h-11 *:data-[slot=native-select]:rounded-[10px] *:data-[slot=native-select]:border-[#d5e2f3] *:data-[slot=native-select]:bg-card *:data-[slot=native-select]:text-xs dark:*:data-[slot=native-select]:border-input")}
            >
              <NativeSelectOption value="">-- เลือก --</NativeSelectOption>
              {options.map((o) => (
                <NativeSelectOption key={o} value={o}>
                  {o}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      {title === otherValue && (
        <Controller
          control={control}
          name={otherName}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                value={field.value ?? ""}
                className={INPUT_CLASS}
                placeholder="ระบุคำนำหน้า"
                aria-label="ระบุคำนำหน้า"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      )}
    </div>
  );
}
