"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { decideMockSubmission } from "@/lib/mock/dashboard";

const decisionSchema = z
  .object({
    id: z.string().min(1),
    decision: z.enum(["approved", "rejected"]),
    remark: z.string().trim().max(500, "ความเห็นต้องไม่เกิน 500 ตัวอักษร"),
  })
  .refine((d) => d.decision === "approved" || d.remark.length >= 5, {
    message: "กรุณาระบุเหตุผลที่ไม่อนุมัติ (อย่างน้อย 5 ตัวอักษร)",
    path: ["remark"],
  });

export type DecisionInput = z.input<typeof decisionSchema>;
export type DecisionResult = { ok: true } | { ok: false; error: string };

/** Approves or rejects a request, then refreshes the current page. */
export async function decideSubmission(input: DecisionInput): Promise<DecisionResult> {
  // Server Actions are public endpoints: check the session here, not only in the UI.
  if (!(await getCurrentUser())) {
    return { ok: false, error: "กรุณาเข้าสู่ระบบอีกครั้ง" };
  }

  const parsed = decisionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  // TODO: replace with the review API once it exists.
  await new Promise((r) => setTimeout(r, 600));
  const { id, decision, remark } = parsed.data;
  if (!decideMockSubmission(id, decision, remark)) {
    return { ok: false, error: "คำขอนี้ได้รับการพิจารณาแล้ว หรือไม่พบในระบบ" };
  }

  refresh();
  return { ok: true };
}
