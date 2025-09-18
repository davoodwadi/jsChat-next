import Link from "next/link";

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
import HistoryButton from "./HistoryButton";
import { MultilineGlassSkeleton } from "../ui/glassSkeleton";
import { cn } from "@/lib/utils";

import { Suspense } from "react";
import { HistoryItemSkeleton } from "@/components/layout/HistoryItemClient";
import ChatHistory from "./ChatHistory";

export default async function NavigationEvents() {
  // console.log("NavigationEvents rerendered");
  return (
    <>
      <SidebarGroup>
        <HistoryButton />
        <Suspense fallback={<HistoryItemsSkeleton />}>
          <ChatHistory />
        </Suspense>
      </SidebarGroup>
    </>
  );
}

const HistoryItemsSkeleton = () => {
  return (
    <>
      <SidebarGroupContent>
        <SidebarMenu className="">
          {Array.from({ length: 8 }).map((_, i) => (
            <HistoryItemSkeleton key={i} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </>
  );
};

export const NavigationEventsSkeleton = () => {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="">
          <div className="flex flex-row justify-between w-full items-center pb-8">
            <div
              className={cn(
                // For Light Mode: Use a muted gray (like black with low opacity)
                "bg-black/10",
                // For Dark Mode: Use a muted white (like white with low opacity)
                "dark:bg-white/10",
                // Standard layout styles
                "h-3 rounded-full animate-pulse", // Added animate-pulse for extra effect
                "w-10"
              )}
            ></div>
            <div>
              <div
                className={cn(
                  // For Light Mode: Use a muted gray (like black with low opacity)
                  "bg-black/10",
                  // For Dark Mode: Use a muted white (like white with low opacity)
                  "dark:bg-white/10",
                  // Standard layout styles
                  "h-3 rounded-full animate-pulse", // Added animate-pulse for extra effect
                  "w-6"
                )}
              ></div>
            </div>
          </div>
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu className="">
            {Array.from({ length: 8 }).map((_, i) => (
              <HistoryItemSkeleton key={i} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};
