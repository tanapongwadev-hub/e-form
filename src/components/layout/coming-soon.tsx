import { ConstructionIcon } from "lucide-react";

/** Placeholder for menu pages that are not built yet. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-muted-foreground">
        <ConstructionIcon className="size-8" />
        <p>หน้านี้อยู่ระหว่างการพัฒนา</p>
      </div>
    </div>
  );
}
