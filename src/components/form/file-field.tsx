"use client";

import { useId, useRef, useState } from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { CheckIcon, FileTextIcon, Loader2Icon, Trash2Icon, UploadIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export type UploadedFile = { name: string; size: number; type: string; uploadedAt: string };

type FileFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  required?: boolean;
  accept: string;
  maxSize: number;
  /** Uploads the file and returns its stored metadata. Defaults to a local mock (no network). */
  upload?: (file: File) => Promise<UploadedFile>;
};

const mockUpload = async (file: File): Promise<UploadedFile> => {
  await new Promise((r) => setTimeout(r, 400));
  return { name: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() };
};

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** ".pdf,.png" → "PDF, PNG" */
function formatAccept(accept: string) {
  return accept
    .split(",")
    .map((ext) => ext.replace(".", "").toUpperCase())
    .join(", ");
}

const dateTime =new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" });

/** One required/optional document: pick or drop a file, then show it as an uploaded chip. */
export function FileField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  accept,
  maxSize,
  upload = mockUpload,
}: FileFieldProps<T>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = field.value as UploadedFile | null;

        async function handleFile(file: File | undefined) {
          if (!file) return;
          const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
          if (!accept.split(",").includes(ext)) {
            toast.error(`ไม่รองรับไฟล์ชนิด ${ext}`);
            return;
          }
          if (file.size > maxSize) {
            toast.error(`ไฟล์มีขนาดเกิน ${formatSize(maxSize)}`);
            return;
          }
          setUploading(true);
          try {
            field.onChange(await upload(file));
          } catch {
            toast.error("อัปโหลดไฟล์ไม่สำเร็จ");
          } finally {
            setUploading(false);
          }
        }

        const canDrop = !value && !uploading;

        return (
          // Plain div: <Field> would force every child to full width.
          <div
            role="group"
            aria-labelledby={id}
            data-invalid={fieldState.invalid}
            onDragOver={(e) => {
              if (!canDrop) return;
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
            }}
            onDrop={(e) => {
              if (!canDrop) return;
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files[0]);
            }}
            className={cn(
              "flex flex-col gap-3 rounded-[14px] border p-4 transition-colors md:flex-row md:items-center md:gap-4",
              value
                ? "border-[#c3e8dc] bg-[#f4fcf8] dark:border-emerald-900 dark:bg-emerald-950/20"
                : "border-dashed border-[#d5e2f3] bg-card dark:border-border",
              dragging && "border-primary bg-secondary",
              fieldState.invalid && "border-destructive bg-[#fff7f8] dark:bg-destructive/10",
            )}
          >
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <span
                className={cn(
                  "flex size-[39px] shrink-0 items-center justify-center rounded-xl",
                  value
                    ? "bg-[#ddf8eb] text-[#08734d] dark:bg-emerald-900/50 dark:text-emerald-300"
                    : "bg-secondary text-primary",
                )}
              >
                {value ? <CheckIcon className="size-5" /> : <FileTextIcon className="size-5" strokeWidth={1.7} />}
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <p id={id} className="text-[13px] font-semibold">
                  {label}
                  {required && <span className="text-[#e24b62]"> *</span>}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  รองรับ {formatAccept(accept)} ขนาดไม่เกิน {formatSize(maxSize)}
                  {canDrop && <span className="hidden md:inline"> · ลากไฟล์มาวางที่นี่ได้</span>}
                </p>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs" />}
              </div>
            </div>

            {value ? (
              <div className="flex min-w-0 items-center gap-2.5 rounded-[10px] border bg-card py-2 pr-1.5 pl-3 md:w-80">
                <FileTextIcon className="size-[18px] shrink-0 text-primary" strokeWidth={1.7} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{value.name}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {formatSize(value.size)} · อัปโหลดเมื่อ {dateTime.format(new Date(value.uploadedAt))}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                  aria-label={`ลบไฟล์ ${value.name}`}
                  onClick={() => field.onChange(null)}
                >
                  <Trash2Icon />
                </Button>
              </div>
            ) : (
              <>
                <input
                  ref={(el) => {
                    inputRef.current = el;
                    field.ref(el);
                  }}
                  type="file"
                  accept={accept}
                  className="sr-only"
                  aria-labelledby={id}
                  onChange={(e) => {
                    void handleFile(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={uploading}
                  className="h-11 shrink-0 rounded-[10px] border-[#d6e3f4] px-4 text-xs text-[#38618d] md:h-[42px] dark:border-input dark:text-foreground"
                  onClick={() => inputRef.current?.click()}
                >
                  {uploading ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
                  {uploading ? "กำลังอัปโหลด…" : "เลือกเอกสาร"}
                </Button>
              </>
            )}
          </div>
        );
      }}
    />
  );
}
