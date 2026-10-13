"use client";

import { useId, useState, useTransition } from "react";
import { CheckIcon, Loader2Icon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { decideSubmission } from "@/lib/submission-actions";
import { cn } from "@/lib/utils";

type Decision = "approved" | "rejected";

const COPY: Record<Decision, { title: string; description: string; label: string; placeholder: string; confirm: string }> = {
  approved: {
    title: "ยืนยันการอนุมัติคำขอ",
    description: "ผู้ยื่นจะได้รับแจ้งผลการอนุมัติทางอีเมล และไม่สามารถเปลี่ยนผลการพิจารณาได้ภายหลัง",
    label: "ความเห็นเพิ่มเติม (ถ้ามี)",
    placeholder: "เช่น เอกสารครบถ้วน อนุมัติตามคำขอ",
    confirm: "ยืนยันอนุมัติ",
  },
  rejected: {
    title: "ยืนยันไม่อนุมัติคำขอ",
    description: "ผู้ยื่นจะได้รับแจ้งเหตุผลทางอีเมล และต้องยื่นคำขอใหม่หากต้องการดำเนินการต่อ",
    label: "เหตุผลที่ไม่อนุมัติ",
    placeholder: "ระบุเหตุผล เช่น เอกสารไม่ครบถ้วน หรือข้อมูลไม่ตรงกับทะเบียน",
    confirm: "ยืนยันไม่อนุมัติ",
  },
};

const BUTTON = "h-11 rounded-[10px] px-4 text-xs sm:h-[42px]";

/** Approve / reject buttons for a request still under review, each behind a confirmation dialog. */
export function ReviewActions({ id }: { id: string }) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [remark, setRemark] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const remarkId = useId();

  function open(next: Decision) {
    setDecision(next);
    setRemark("");
    setError(null);
  }

  function confirm() {
    if (!decision) return;
    const trimmed = remark.trim();
    if (decision === "rejected" && trimmed.length < 5) {
      setError("กรุณาระบุเหตุผลที่ไม่อนุมัติ (อย่างน้อย 5 ตัวอักษร)");
      return;
    }
    startTransition(async () => {
      const result = await decideSubmission({ id, decision, remark: trimmed });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDecision(null);
      toast.success(decision === "approved" ? `อนุมัติคำขอ ${id} แล้ว` : `บันทึกผลไม่อนุมัติคำขอ ${id} แล้ว`);
    });
  }

  const copy = decision ? COPY[decision] : null;

  return (
    <>
      <div className="flex flex-col gap-3">
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          ตรวจสอบข้อมูลและเอกสารแนบให้ครบถ้วนก่อนบันทึกผลการพิจารณา
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className={cn(BUTTON, "border-[#ffd3dc] text-[#bd2946] hover:bg-[#fff0f3] hover:text-[#bd2946] dark:border-rose-900 dark:text-rose-300")}
            onClick={() => open("rejected")}
          >
            <XIcon />
            ไม่อนุมัติ
          </Button>
          <Button className={BUTTON} onClick={() => open("approved")}>
            <CheckIcon />
            อนุมัติ
          </Button>
        </div>
      </div>

      <Dialog open={decision !== null} onOpenChange={(isOpen) => !isOpen && !pending && setDecision(null)}>
        <DialogContent className="gap-5 rounded-[22px] p-6 sm:max-w-[480px]" showCloseButton={!pending}>
          {copy && (
            <>
              <DialogHeader className="flex-row items-start gap-3">
                <span
                  className={cn(
                    "flex size-[39px] shrink-0 items-center justify-center rounded-xl",
                    decision === "approved"
                      ? "bg-[#ddf8eb] text-[#08734d] dark:bg-emerald-900/50 dark:text-emerald-300"
                      : "bg-[#ffe7eb] text-[#bd2946] dark:bg-rose-900/50 dark:text-rose-300",
                  )}
                >
                  {decision === "approved" ? <CheckIcon className="size-5" /> : <XIcon className="size-5" />}
                </span>
                <div className="flex flex-col gap-1">
                  <DialogTitle className="text-base">{copy.title}</DialogTitle>
                  <DialogDescription className="text-xs leading-relaxed">
                    คำขอ <b className="font-semibold text-foreground">{id}</b> · {copy.description}
                  </DialogDescription>
                </div>
              </DialogHeader>

              <div className="flex flex-col gap-1.5">
                <label htmlFor={remarkId} className="text-xs text-[#395472] dark:text-muted-foreground">
                  {copy.label}
                  {decision === "rejected" && <span className="text-[#e24b62]"> *</span>}
                </label>
                <Textarea
                  id={remarkId}
                  value={remark}
                  onChange={(e) => {
                    setRemark(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={copy.placeholder}
                  maxLength={500}
                  rows={3}
                  disabled={pending}
                  aria-invalid={!!error}
                  aria-describedby={error ? `${remarkId}-error` : undefined}
                  className="min-h-24 rounded-[10px] border-[#d5e2f3] bg-card text-base md:text-xs dark:border-input"
                />
                <div className="flex justify-between gap-2 text-[11px]">
                  <span id={`${remarkId}-error`} role="alert" className="text-destructive">
                    {error}
                  </span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">{remark.length}/500</span>
                </div>
              </div>

              <DialogFooter className="-mx-6 -mb-6 rounded-b-[22px] px-6">
                <Button variant="outline" className={BUTTON} onClick={() => setDecision(null)} disabled={pending}>
                  ยกเลิก
                </Button>
                <Button
                  variant={decision === "rejected" ? "destructive" : "default"}
                  className={cn(BUTTON, decision === "rejected" && "bg-[#d94864] text-white hover:bg-[#c23a55]")}
                  onClick={confirm}
                  disabled={pending}
                >
                  {pending && <Loader2Icon className="animate-spin" />}
                  {copy.confirm}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
