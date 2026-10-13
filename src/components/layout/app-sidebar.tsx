"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRightIcon, FileStackIcon } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NAV_GROUPS, isNavActive, type NavItem } from "@/config/nav";

export function AppSidebar() {
  return (
    <Sidebar
      variant="floating"
      collapsible="icon"
      className="**:data-[sidebar=sidebar]:rounded-3xl **:data-[sidebar=sidebar]:shadow-[0_5px_22px_#294f8210]"
    >
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-14 rounded-2xl" render={<Link href="/" />}>
              <div className="flex aspect-square size-10 items-center justify-center rounded-[14px] bg-secondary text-primary">
                <FileStackIcon className="size-5" />
              </div>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-lg font-bold tracking-tight text-secondary-foreground">E-Form TFAC</span>
                <span className="truncate text-[11px] text-muted-foreground">สภาวิชาชีพบัญชี</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-[11px] font-semibold text-muted-foreground">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              {/* usePathname() suspends on routes with runtime params (e.g. /submissions/[id]),
                  so only the menu waits for it; the fallback shows the same items without highlight. */}
              <Suspense fallback={<NavMenu items={group.items} />}>
                <ActiveNavMenu items={group.items} />
              </Suspense>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="group-data-[collapsible=icon]:hidden">
        <p className="mx-2 border-t pt-4 pb-1 text-[11px] text-muted-foreground">
          E-Form Management System
          <br />
          ระบบจัดการแบบฟอร์มและคำขอ
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function ActiveNavMenu({ items }: { items: NavItem[] }) {
  return <NavMenu items={items} pathname={usePathname()} />;
}

function NavMenu({ items, pathname = null }: { items: NavItem[]; pathname?: string | null }) {
  return (
    <SidebarMenu className="gap-2">
      {items.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            isActive={pathname !== null && isNavActive(pathname, item.href)}
            tooltip={item.title}
            render={<Link href={item.href} />}
            className="group/nav h-12 gap-2.5 rounded-[13px] border border-sidebar-border bg-card p-2 shadow-[0_3px_9px_#163b6710] transition hover:translate-x-0.5 data-active:border-transparent data-active:bg-gradient-to-br data-active:from-[#0878ed] data-active:to-[#0860db] data-active:text-white data-active:shadow-[0_5px_13px_#0868e829] data-active:hover:text-white group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:shadow-none"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-secondary text-primary group-data-active/nav:bg-white/20 group-data-active/nav:text-white group-data-[collapsible=icon]:-m-2">
              <item.icon />
            </span>
            <span className="flex-1">{item.title}</span>
            <ChevronRightIcon className="text-primary group-data-active/nav:text-white" />
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
