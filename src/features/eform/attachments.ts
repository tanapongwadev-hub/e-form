import { z } from "zod";
import { ACCEPTED_FILE_TYPES } from "./constants";

export type AttachmentSpec = {
  /** FileTypeCode sent to the backend, e.g. "file_applicant_3_month". */
  code: string;
  label: string;
  required: boolean;
  /** Defaults to ACCEPTED_FILE_TYPES. */
  accept?: string;
  documentTypeId?: string;
};

export const attachedFile = z.object({ name: z.string(), size: z.number(), type: z.string(), uploadedAt: z.string() });
export type AttachedFile = z.infer<typeof attachedFile>;
export type Attachments = Record<string, AttachedFile | null>;

/** `attachments` object schema: one nullable file per spec; required ones are checked by {@link checkAttachments}. */
export function attachmentsSchema(specs: readonly AttachmentSpec[]) {
  return z.object(Object.fromEntries(specs.map((a) => [a.code, attachedFile.nullable()])));
}

/** Adds "กรุณาแนบเอกสาร" for every missing required file (use inside superRefine). */
export function checkAttachments(specs: readonly AttachmentSpec[], files: Attachments, ctx: z.RefinementCtx) {
  for (const a of specs) {
    if (a.required && !files[a.code]) {
      ctx.addIssue({ code: "custom", path: ["attachments", a.code], message: "กรุณาแนบเอกสาร" });
    }
  }
}

export function emptyAttachments(specs: readonly AttachmentSpec[]): Attachments {
  return Object.fromEntries(specs.map((a) => [a.code, null]));
}

/** ApplicationAttachments[] in the original e-form's payload shape. */
export function attachmentsPayload(specs: readonly AttachmentSpec[], files: Attachments) {
  return specs.flatMap((a) => {
    const file = files[a.code];
    if (!file) return [];
    return [{ FileTypeCode: a.code, ...(a.documentTypeId && { Document_Type_ID: a.documentTypeId }), file: file.name }];
  });
}

export const acceptOf = (a: AttachmentSpec) => a.accept ?? ACCEPTED_FILE_TYPES;
