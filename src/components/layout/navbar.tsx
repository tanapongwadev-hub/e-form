import { Suspense } from "react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUser } from "@/lib/auth/session";
import { NavBreadcrumb } from "./nav-breadcrumb";
import { NavUser } from "./nav-user";

export function Navbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 rounded-2xl bg-white/85 px-4 shadow-[0_5px_22px_#294f8210] ring-1 ring-border backdrop-blur dark:bg-card">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-center" />
      {/* usePathname() inside suspends on routes with runtime params. */}
      <Suspense fallback={<span className="text-sm text-muted-foreground">E-Form TFAC</span>}>
        <NavBreadcrumb />
      </Suspense>
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground md:inline">
          ต้นแบบ • ข้อมูลตัวอย่าง
        </span>
        <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
          <CurrentUser />
        </Suspense>
      </div>
    </header>
  );
}

async function CurrentUser() {
  const user = await getCurrentUser();
  return user ? <NavUser user={user} /> : null;
}
