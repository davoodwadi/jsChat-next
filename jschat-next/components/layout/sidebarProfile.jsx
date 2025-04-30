import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";

import { auth } from "@/auth";
import { User2, BookOpenText } from "lucide-react";
// import { wait } from "@/lib/actions";
export async function SidebarProfile() {
  const session = await auth();
  //   await wait(10000);
  if (session) {
    return (
      <SidebarMenuItem key="profile">
        <SidebarMenuButton asChild>
          <Link href="/profile">
            <User2 />
            <span>Profile</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }
}

export async function SidebarCanvas() {
  return (
    <SidebarMenuItem key="canvas">
      <SidebarMenuButton asChild>
        <Link href="/canvas">
          <BookOpenText />
          <span>New Canvas</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
