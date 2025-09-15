import { loadAllChatSessions } from "@/lib/save/saveActions";
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
import { MultilineGlassSkeleton } from "../ui/glassSkeleton";
import { ClearChatHistoryButton } from "@/components/layout/ClearChatHistoryButton";
import { cn } from "@/lib/utils";

import { Suspense } from "react";
import { HistoryItemSkeleton } from "@/components/layout/HistoryItemActive";
import HistoryItem from "./HistoryItem";

const getChatHistory = async () => {
  // console.log("ChatHistory loading");
  const result = await loadAllChatSessions();
  if (result) {
    return result;
  } else {
    return null;
  }
};
let chatHistoryTrue = false;

export default async function NavigationEvents() {
  const chatHistory = await getChatHistory();
  chatHistoryTrue =
    chatHistory !== undefined &&
    Array.isArray(chatHistory) &&
    chatHistory.length > 0;

  // console.log("NavigationEvents rerendered");
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="">
          <div className="flex flex-row justify-between w-full items-center pb-8">
            <div>History</div>
            <div>
              <ClearChatHistoryButton />
            </div>
          </div>
        </SidebarGroupLabel>
        <Suspense fallback={<HistoryItemsSkeleton />}>
          {chatHistoryTrue ? (
            <SidebarGroupContent>
              <SidebarMenu className="">
                {chatHistory.map((item, i) => {
                  // console.log("item", item);
                  const userMessageArray = item?.content?.userMessages;
                  const bookmarked = item?.bookmarked;
                  const isCanvas = !Array.isArray(userMessageArray);

                  let snippet;

                  if (!isCanvas) {
                    const snippetArray = userMessageArray.map((m) =>
                      typeof m.content === "string"
                        ? m.content
                        : m.content?.text
                          ? m.content?.text
                          : null
                    );
                    snippet = snippetArray.join("...");
                  } else {
                    snippet = item?.content?.canvasText;
                  }
                  return (
                    <HistoryItem
                      key={item.chatid}
                      item={item}
                      snippet={snippet}
                      isCanvas={isCanvas}
                      bookmarked={bookmarked}
                    />
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          ) : (
            <></>
          )}
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
