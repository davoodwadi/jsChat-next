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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import {
  toggleBookmarkChatSession,
  deleteChatSession,
} from "@/lib/save/saveActions";

import { useSidebar } from "@/components/ui/sidebar";
import { useParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Trash, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export function HistoryItemText({ item, isCanvas, bookmarked, snippet }) {
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
        className={cn(
          "glass-sidebar-item",
          "flex w-full text-left p-2.5 rounded-lg text-xs items-center",
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

export function HistoryItemActions({ bookmarked, chatId }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [optimisticBookmarked, setOptimisticBookmarked] = useState(bookmarked);

  const handleBookmarkToggle = async () => {
    setOptimisticBookmarked(!optimisticBookmarked);

    startTransition(async () => {
      // Call the server action
      await toggleBookmarkChatSession({ chatId });
      // This ensures the data is consistent after the action completes.
      router.refresh();
    });
  };

  const handleDelete = async () => {
    // You could add a confirmation dialog here
    startTransition(async () => {
      await deleteChatSession({ chatId });
      router.refresh();
    });
  };
  return (
    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100">
      {/* Bookmark Action */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={handleBookmarkToggle}
            className={cn(
              "h-5 w-5 glass-button",
              optimisticBookmarked && "glass-button-yellow-enabled"
            )}
          >
            <Star className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="glass-tooltip text-zinc-800 dark:text-zinc-200">
          <p>{optimisticBookmarked ? "Unbookmark" : "Bookmark"}</p>
        </TooltipContent>
      </Tooltip>

      {/* Delete Action */}
      <Tooltip>
        <TooltipTrigger asChild>
          {/* <form
            action={async () => {
              "use server";
              console.log("deleting");
              await deleteChatSession({ chatId: item.chatid });
              console.log("DONE deleting");
            }}
          > */}
          <Button
            variant="ghost"
            size="icon"
            disabled={isPending}
            onClick={handleDelete}
            className="h-5 w-5 glass-button hover:!bg-red-500/20 hover:text-red-500"
          >
            <Trash className="h-4 w-4" />
          </Button>
          {/* </form> */}
        </TooltipTrigger>
        <TooltipContent className="glass-tooltip  text-zinc-800 dark:text-zinc-200">
          <p>Delete</p>
        </TooltipContent>
      </Tooltip>
    </div>
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
