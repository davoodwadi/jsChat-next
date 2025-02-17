import { MessageCircle } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { NavigationEvents } from "@/components/layout/NavigationEvents";
import { Suspense } from "react";
import { MultilineSkeleton } from "@/components/ui/skeleton";
import { SidebarProfile } from "@/components/layout/sidebarProfile";

// Menu items.

export async function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Spreed</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="1">
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <MessageCircle />
                    <span>New Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Suspense fallback={<MultilineSkeleton lines={1} />}>
                <SidebarProfile />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Suspense fallback={<MultilineSkeleton lines={10} />}>
          <NavigationEvents />
        </Suspense>
      </SidebarContent>
    </Sidebar>
  );
}
