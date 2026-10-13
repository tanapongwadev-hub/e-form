"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { NAV_ITEMS, isNavActive } from "@/config/nav";

export function NavBreadcrumb() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => isNavActive(pathname, item.href));

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{current?.title ?? "E-Form TFAC"}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
