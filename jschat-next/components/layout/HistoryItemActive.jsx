"use client";

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
import { useSidebar } from "@/components/ui/sidebar";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Star, Trash, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HistoryItemActive({
  item,
  isCanvas,
  bookmarked,
  snippet,
}) {
  const params = useParams();
  const currentChatId = params?.chatid;
  //   console.log("currentChatId", currentChatId);
  const isActive = String(currentChatId) === String(item.chatid);
  const { isMobile, setOpenMobile } = useSidebar();
  function handleClick() {
    if (isMobile) {
      setOpenMobile(false); // ✅ close sidebar on mobile after click
    }
  }
  return (
    <SidebarMenuButton asChild isActive={isActive} className="flex-1 min-w-0 ">
      <Link
        href={isCanvas ? `/canvas/${item.chatid}` : `/chat/${item.chatid}`}
        // className={`
        //       flex items-center truncate pr-10
        //       ${isActive ? "bg-muted text-primary font-medium" : "text-muted-foreground"}
        //     `}
        className={cn(
          "glass-sidebar-item",
          // 2. Add standard layout and text styles
          "flex w-full text-left p-2.5 rounded-lg text-xs items-center",
          // 3. Conditionally apply our new active class
          isActive && "glass-sidebar-item-active"
        )}
        onClick={(e) => handleClick()}
      >
        {bookmarked && (
          <Star className="!w-3 !h-3 mr-1 text-yellow-500 fill-current" />
        )}
        <span className="truncate">{snippet.trim()}</span>
      </Link>
    </SidebarMenuButton>
  );
}

export function HistoryItemSkeleton() {
  return (
    <div
      className={cn(
        // 1. Use the SAME base class as the real item for consistent layout
        "glass-sidebar-item",
        "flex w-full text-left p-2.5 rounded-lg text-xs items-center",
        "glass-skeleton-shimmer"
      )}
    >
      <div
        className={cn(
          // For Light Mode: Use a muted gray (like black with low opacity)
          "bg-black/10",
          // For Dark Mode: Use a muted white (like white with low opacity)
          "dark:bg-white/10",
          // Standard layout styles
          "h-3 rounded-full animate-pulse" // Added animate-pulse for extra effect
        )}
        style={{ width: `${Math.floor(Math.random() * 20) + 80}%` }}
      ></div>
    </div>
  );
}
