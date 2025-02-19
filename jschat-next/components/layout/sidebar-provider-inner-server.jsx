import { SidebarProvider } from "@/components/ui/sidebar";

import { SidebarInnerServer } from "@/components/layout/sidebar-inner-server";

export async function SidebarProviderInnerServer({ defaultOpen, children }) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarInnerServer>{children}</SidebarInnerServer>
    </SidebarProvider>
  );
}
