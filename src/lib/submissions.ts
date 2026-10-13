export type SubmissionStatus = "new" | "pending" | "approved" | "rejected";

export type Submission = {
  id: string;
  form: string;
  applicant: string;
  submittedAt: string;
  status: SubmissionStatus;
};

export const SUBMISSION_STATUS_LABEL: Record<SubmissionStatus, string> = {
  new: "ใหม่",
  pending: "รออนุมัติ",
  approved: "อนุมัติแล้ว",
  rejected: "ไม่อนุมัติ",
};

export function isSubmissionStatus(value: unknown): value is SubmissionStatus {
  return typeof value === "string" && value in SUBMISSION_STATUS_LABEL;
}

export type TimelineStep = {
  label: string;
  state: "done" | "current" | "upcoming" | "rejected";
  at?: string;
  note?: string;
};

export type SubmissionDetail = Submission & {
  juristicId: string;
  serviceType: string;
  email: string;
  phone: string;
  channel: string;
  attachments: { name: string; size: string }[];
  timeline: TimelineStep[];
  /** Reviewer's remark, shown for decided requests. */
  remark?: string;
};

/** "TFAC 68-001-3" → "tfac-68-001-3" (the code used by config/forms.ts and form routes). */
export function formSlug(form: string) {
  return form.trim().toLowerCase().replace(/\s+/g, "-");
}
