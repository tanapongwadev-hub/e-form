"use client";

import { useFormContext, type Path } from "react-hook-form";
import { PaperclipIcon } from "lucide-react";
import { FileField } from "@/components/form/file-field";
import { FormSection } from "@/components/form/form-section";
import { acceptOf, type AttachmentSpec, type Attachments } from "../attachments";
import { MAX_FILE_SIZE } from "../constants";

type WithAttachments = { attachments: Attachments };

/** One upload card per document; files are bound to `attachments.<code>`. */
export function AttachmentsSection({
  title,
  description,
  attachments,
}: {
  title: string;
  description?: string;
  attachments: readonly AttachmentSpec[];
}) {
  const { control } = useFormContext<WithAttachments>();
  return (
    <FormSection icon={PaperclipIcon} title={title} description={description}>
      <div className="flex flex-col gap-3">
        {attachments.map((a) => (
          <FileField
            key={a.code}
            control={control}
            name={`attachments.${a.code}` as Path<WithAttachments>}
            label={a.label}
            required={a.required}
            accept={acceptOf(a)}
            maxSize={MAX_FILE_SIZE}
          />
        ))}
      </div>
    </FormSection>
  );
}
