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
          // Base styles for all items
          "glass-button glass-grain", // Using your premade button & grain styles
          "flex w-full text-left p-3 text-sm items-center transition-all duration-200",
          "text-foreground/70 hover:text-foreground/90", // Subtle text color

          // Conditional style for the ACTIVE item
          isActive && "glass-active"
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
