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
import NavigationEvents, {
  NavigationEventsSkeleton,
} from "@/components/layout/NavigationEvents";
import { Suspense } from "react";
import { MultilineGlassSkeleton } from "../ui/glassSkeleton";
import { HistoryItemSkeleton } from "@/components/layout/HistoryItemClient";

import {
  SidebarProfile,
  SidebarCanvas,
  NewChatButton,
} from "@/components/layout/sidebarClientItems";
import { auth } from "@/auth";
import { User2, BookOpenText } from "lucide-react";

export async function AppSidebar() {
  // console.log("sidebar rerendered");
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Spreed</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Suspense fallback={<MultilineGlassSkeleton lines={1} />}>
                <NewChatButton />
              </Suspense>
              <Suspense fallback={<MultilineGlassSkeleton lines={1} />}>
                <SidebarCanvas />
              </Suspense>
              <Suspense fallback={<MultilineGlassSkeleton lines={1} />}>
                <SidebarProfile />
              </Suspense>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <Suspense fallback={<NavigationEventsSkeleton />}>
          <NavigationEvents />
        </Suspense>
      </SidebarContent>
    </Sidebar>
  );
}

export async function SidebarProfileParent() {
  const session = await auth();
  //   await wait(10000);
  if (session) {
    return <SidebarProfile />;
  }
}
