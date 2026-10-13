import { AppSidebar } from "@/components/layout/app-sidebar";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** Soft sky canvas: floating sidebar | translucent topbar over scrollable content (footer at its bottom). */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-svh overflow-hidden bg-transparent">
      <AppSidebar />
      <SidebarInset className="min-w-0 gap-3 bg-transparent p-3 md:pl-0">
        <Navbar />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="flex-1 px-1 py-2 md:px-3">{children}</div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
