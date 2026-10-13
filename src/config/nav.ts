import {
  BarChart3Icon,
  FileTextIcon,
  InboxIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "เมนูหลัก",
    items: [
      { title: "แดชบอร์ด", href: "/", icon: LayoutDashboardIcon },
      { title: "แบบฟอร์ม", href: "/forms", icon: FileTextIcon },
      { title: "คำขอ", href: "/submissions", icon: InboxIcon },
      { title: "รายงาน", href: "/reports", icon: BarChart3Icon },
    ],
  },
  {
    label: "ระบบ",
    items: [
      { title: "ผู้ใช้งาน", href: "/users", icon: UsersIcon },
      { title: "ตั้งค่า", href: "/settings", icon: SettingsIcon },
    ],
  },
];

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

export function isNavActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
