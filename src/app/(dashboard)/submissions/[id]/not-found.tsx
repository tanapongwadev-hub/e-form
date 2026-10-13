import Link from "next/link";
import { ArrowLeftIcon, SearchXIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubmissionNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-[22px] border bg-card px-6 py-12 text-center shadow-[0_5px_22px_#294f8210]">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary">
        <SearchXIcon className="size-7" strokeWidth={1.7} />
      </span>
      <div>
        <h1 className="text-xl font-bold tracking-tight">ไม่พบคำขอนี้</h1>
        <p className="mt-1 text-xs text-muted-foreground">เลขที่คำขออาจไม่ถูกต้อง หรือคำขอนี้ถูกลบออกจากระบบแล้ว</p>
      </div>
      <Button className="h-11 rounded-[10px] px-5 text-xs" nativeButton={false} render={<Link href="/submissions" />}>
        <ArrowLeftIcon />
        กลับไปรายการคำขอ
      </Button>
    </div>
  );
}
