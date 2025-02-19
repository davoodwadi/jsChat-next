import { cookies } from "next/headers";

import { SidebarProviderInnerServer } from "@/components/layout/sidebar-provider-inner-server";

export async function SidebarProviderServer({ params, children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProviderInnerServer defaultOpen={defaultOpen}>
      {children}
    </SidebarProviderInnerServer>
  );
}
