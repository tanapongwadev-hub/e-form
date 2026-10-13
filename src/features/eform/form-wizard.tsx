"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, type FieldErrors, type FieldPath, type FieldValues, type UseFormReturn } from "react-hook-form";
import { ArrowLeftIcon, ArrowRightIcon, Building2Icon, FileTextIcon, Loader2Icon, SendIcon } from "lucide-react";
import { toast } from "sonner";
import { Stepper } from "@/components/form/stepper";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { clearDraft, draftKey, formatSavedAt, parseDraft, readDraftRaw, saveDraft, subscribeDrafts } from "./draft";
import { SuccessPanel, type SuccessInfo } from "./success-panel";

export type WizardStep<T extends FieldValues> = {
  title: string;
  heading: string;
  description: string;
  /** Fields validated before leaving this step. */
  fields: FieldPath<T>[];
};

/** Index of the first step owning one of the given error keys (the last step if none). */
export function firstStepWithError<T extends FieldValues>(steps: WizardStep<T>[], errorKeys: string[]): number {
  const index = steps.findIndex((s) => s.fields.some((f) => errorKeys.includes(f.split(".")[0])));
  return index === -1 ? steps.length - 1 : index;
}

type FormWizardProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  formCode: string;
  steps: WizardStep<T>[];
  /** Shown in the progress card header. */
  applicant: { name: string; id: string; badge?: string };
  /** Drafts are kept per form + scope (e.g. juristic ID, plus the variant when the schema differs). */
  draftScope: string;
  /** Bump when the form values change shape so old drafts are ignored. */
  draftVersion?: number;
  renderStep: (step: number, goTo: (index: number) => void) => React.ReactNode;
  submit: (values: T) => Promise<{ referenceNo: string }>;
  success: (values: T) => SuccessInfo;
  /** Shown above the form while it is being filled in; hidden after submitting. */
  banner?: React.ReactNode;
};

const BAR_BUTTON = "h-11 gap-2 rounded-[10px] px-4 text-xs sm:h-[42px]";
const DIALOG = "gap-5 rounded-[22px] p-6 sm:max-w-[480px]";
const DIALOG_FOOTER = "-mx-6 -mb-6 rounded-b-[22px] px-6";

/**
 * Multi-step e-form shell shared by every TFAC form: progress card + stepper, per-step validation,
 * sticky action bar, browser drafts (save / restore / discard), cancel confirmation and the success panel.
 */
export function FormWizard<T extends FieldValues>({
  form,
  formCode,
  steps,
  applicant,
  draftScope,
  draftVersion = 1,
  renderStep,
  submit,
  success,
  banner,
}: FormWizardProps<T>) {
  const lastStep = steps.length - 1;
  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ referenceNo: string; info: SuccessInfo } | null>(null);
  const topRef = useRef<HTMLElement>(null);

  // Draft (saved in this browser only)
  const router = useRouter();
  const key = draftKey(formCode, draftScope);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  // Offer to restore a stored draft once per visit; saving here also counts as handled.
  const [restoreHandled, setRestoreHandled] = useState(false);
  const [saveStatus, setSaveStatus] = useState("ยังไม่ได้บันทึกร่าง");
  const [unsaved, setUnsaved] = useState(false);
  const draftRaw = useSyncExternalStore(subscribeDrafts, () => readDraftRaw(key), () => null);
  const foundDraft = useMemo(() => parseDraft<T>(draftRaw, draftVersion), [draftRaw, draftVersion]);
  const dialog = saveDialogOpen ? "save" : foundDraft && !restoreHandled ? "restore" : null;

  const { subscribe } = form;
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        // Only user edits carry a field name; reset() from restoring a draft does not.
        callback: ({ name }) => {
          if (!name) return;
          setUnsaved(true);
          setSaveStatus("มีการแก้ไขที่ยังไม่ได้บันทึก");
        },
      }),
    [subscribe],
  );

  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  function closeDialog() {
    setSaveDialogOpen(false);
    setRestoreHandled(true);
  }

  function handleSaveDraft() {
    closeDialog();
    const draft = saveDraft(key, draftVersion, form.getValues());
    if (!draft) {
      toast.error("เบราว์เซอร์ไม่อนุญาตให้บันทึกร่าง ข้อมูลยังอยู่ในแบบฟอร์ม");
      return;
    }
    setUnsaved(false);
    setSaveStatus(`บันทึกร่างแล้ว ${formatSavedAt(draft.savedAt)}`);
    toast.success("บันทึกร่างในเบราว์เซอร์นี้แล้ว");
  }

  function handleRestoreDraft() {
    closeDialog();
    if (!foundDraft) return;
    form.reset({ ...form.getValues(), ...foundDraft.values });
    setUnsaved(false);
    setSaveStatus(`เรียกคืนแบบร่าง ${formatSavedAt(foundDraft.savedAt)}`);
    toast.success("เรียกคืนแบบร่างเรียบร้อย");
  }

  function handleDiscardDraft() {
    closeDialog();
    clearDraft(key);
  }

  function handleConfirmCancel() {
    setCancelDialogOpen(false);
    setUnsaved(false);
    router.push("/forms");
  }

  // Scroll back to the progress card whenever the step changes (not on first render).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  function goTo(index: number) {
    setStep(index);
    setMaxReached((m) => Math.max(m, index));
  }

  function revealFirstError() {
    toast.error("กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง");
    // List/file errors have no focusable input, so bring the first error into view.
    setTimeout(() => {
      document
        .querySelector('[data-invalid="true"], [aria-invalid="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  async function next() {
    const valid = await form.trigger(steps[step].fields);
    if (valid) goTo(step + 1);
    else revealFirstError();
  }

  async function onValid(values: T) {
    setSubmitting(true);
    try {
      const { referenceNo } = await submit(values);
      clearDraft(key);
      setUnsaved(false);
      setResult({ referenceNo, info: success(values) });
      toast.success("ส่งคำร้องเรียบร้อยแล้ว");
    } catch {
      toast.error("ส่งคำร้องไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  function onInvalid(errors: FieldErrors<T>) {
    const target = firstStepWithError(steps, Object.keys(errors));
    if (target !== step) goTo(target);
    revealFirstError();
  }

  if (result) {
    return <SuccessPanel referenceNo={result.referenceNo} {...result.info} />;
  }

  const current = steps[step];

  return (
    <>
      {banner}
      <FormProvider {...form}>
        <form
          noValidate
          onSubmit={(e) => {
            // Enter on earlier steps moves forward instead of submitting.
            if (step < lastStep) {
              e.preventDefault();
              void next();
              return;
            }
            void form.handleSubmit(onValid, onInvalid)(e);
          }}
          className="flex flex-col gap-6 sm:gap-7"
        >
          <section
            ref={topRef}
            aria-label="ความคืบหน้าการกรอกแบบฟอร์ม"
            className="flex scroll-mt-6 flex-col gap-5 rounded-[17px] border bg-card p-4 shadow-[0_5px_22px_#294f8210] sm:gap-6 sm:rounded-[20px] sm:px-6 sm:py-5"
          >
            <div className="flex items-start gap-2 border-b pb-3 text-[11px] sm:items-center sm:gap-2.5 sm:pb-4 sm:text-xs">
              <Building2Icon className="mt-0.5 size-[19px] shrink-0 text-primary sm:mt-0" strokeWidth={1.7} />
              <p className="min-w-0 font-semibold">
                {applicant.name}
                <small className="block text-[10px] font-normal text-muted-foreground tabular-nums sm:ml-2.5 sm:inline sm:text-[11px]">
                  {applicant.id}
                </small>
              </p>
              {applicant.badge && (
                <span className="ml-auto shrink-0 rounded-lg bg-[#e2f1ff] px-2 py-1 text-[9px] font-medium text-[#0869c9] sm:px-2.5 sm:text-[11px] dark:bg-sky-900/50 dark:text-sky-300">
                  {applicant.badge}
                </span>
              )}
            </div>
            <Stepper steps={steps} current={step} maxReached={maxReached} onSelect={goTo} />
          </section>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p className="text-[11px] font-semibold text-primary">
                ขั้นที่ {step + 1} จาก {steps.length}
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight sm:text-[21px]">{current.heading}</h2>
              <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">{current.description}</p>
            </div>
            <p className="shrink-0 text-[10px] text-muted-foreground sm:text-[11px]">
              <b className="text-[#e24b62]">*</b> ข้อมูลที่จำเป็นต้องกรอก
            </p>
          </div>

          <div className="-mt-1 flex flex-col gap-3.5 sm:gap-[18px]">{renderStep(step, goTo)}</div>

          <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border bg-card/95 px-3.5 py-3 shadow-[0_-4px_20px_#2b568309] backdrop-blur-md sm:px-[18px] sm:py-3.5">
            {step === 0 ? (
              <Button type="button" variant="ghost" className={BAR_BUTTON} onClick={() => setCancelDialogOpen(true)}>
                ยกเลิก
              </Button>
            ) : (
              <Button type="button" variant="outline" className={BAR_BUTTON} onClick={() => goTo(step - 1)} disabled={submitting}>
                <ArrowLeftIcon />
                ย้อนกลับ
              </Button>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground sm:hidden">
              ขั้นที่ {step + 1} / {steps.length}
            </span>
            <div className="grid w-full grid-cols-2 gap-2 sm:ml-auto sm:flex sm:w-auto sm:items-center sm:gap-3">
              <p role="status" className="order-last col-span-full text-center text-[9px] text-muted-foreground sm:order-none sm:text-[10px]">
                {saveStatus}
              </p>
              <Button type="button" variant="outline" className={BAR_BUTTON} onClick={() => setSaveDialogOpen(true)} disabled={submitting}>
                <FileTextIcon />
                บันทึกร่าง
              </Button>
              {step < lastStep ? (
                <Button type="submit" className={BAR_BUTTON}>
                  ถัดไป<span className="hidden sm:inline">: {steps[step + 1].title}</span>
                  <ArrowRightIcon />
                </Button>
              ) : (
                <Button type="submit" className={BAR_BUTTON} disabled={submitting}>
                  {submitting ? <Loader2Icon className="animate-spin" /> : <SendIcon />}
                  ส่งคำร้อง
                </Button>
              )}
            </div>
          </div>
        </form>

        <Dialog open={dialog === "restore"} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className={DIALOG}>
            <DialogHeader>
              <DialogTitle className="text-lg">พบแบบร่างที่บันทึกไว้</DialogTitle>
              <DialogDescription className="leading-relaxed">
                {foundDraft && `บันทึกเมื่อ ${formatSavedAt(foundDraft.savedAt)} `}
                ต้องการเรียกคืนข้อมูลจากแบบร่างในเบราว์เซอร์นี้หรือไม่? เอกสารแนบต้องอัปโหลดใหม่
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={DIALOG_FOOTER}>
              <Button variant="outline" className={BAR_BUTTON} onClick={handleDiscardDraft}>
                ลบแบบร่าง เริ่มใหม่
              </Button>
              <Button className={BAR_BUTTON} onClick={handleRestoreDraft}>
                เรียกคืนแบบร่าง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className={DIALOG}>
            <DialogHeader>
              <DialogTitle className="text-lg">ยกเลิกการกรอกแบบฟอร์ม?</DialogTitle>
              <DialogDescription className="leading-relaxed">
                {unsaved
                  ? "ข้อมูลที่แก้ไขและยังไม่ได้บันทึกร่างจะหายไป และกลับไปหน้ารายการแบบฟอร์ม"
                  : "ออกจากแบบฟอร์มนี้และกลับไปหน้ารายการแบบฟอร์ม"}
                {foundDraft && " แบบร่างที่บันทึกไว้ในเบราว์เซอร์นี้จะยังคงอยู่"}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={DIALOG_FOOTER}>
              <Button variant="outline" className={BAR_BUTTON} onClick={() => setCancelDialogOpen(false)}>
                กลับไปกรอกต่อ
              </Button>
              <Button variant="destructive" className={BAR_BUTTON} onClick={handleConfirmCancel}>
                ยืนยันยกเลิก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={dialog === "save"} onOpenChange={(open) => !open && closeDialog()}>
          <DialogContent className={DIALOG}>
            <DialogHeader>
              <DialogTitle className="text-lg">บันทึกร่างในเบราว์เซอร์นี้</DialogTitle>
              <DialogDescription className="leading-relaxed">
                ข้อมูลที่กรอกจะถูกเก็บในเบราว์เซอร์ของเครื่องนี้ และเรียกคืนได้เมื่อกลับมาเปิดแบบฟอร์มอีกครั้ง
                (ไม่รวมเอกสารแนบ) ไม่มีการส่งข้อมูลไปยังเซิร์ฟเวอร์ หากเป็นเครื่องที่ใช้ร่วมกันควรระมัดระวัง
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className={DIALOG_FOOTER}>
              <Button variant="outline" className={BAR_BUTTON} onClick={closeDialog}>
                กลับไปกรอกต่อ
              </Button>
              <Button className={BAR_BUTTON} onClick={handleSaveDraft}>
                <FileTextIcon />
                บันทึกร่าง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </FormProvider>
    </>
  );
}
