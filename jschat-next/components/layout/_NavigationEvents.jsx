"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { loadAllChatSessions } from "@/lib/save/saveActions";
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
import { MultilineSkeleton } from "@/components/ui/skeleton";
import { ClearChatHistoryButton } from "@/components/layout/ClearChatHistoryButton";
import HistoryItem from "./HistoryItem";

export function NavigationEvents() {
  const [chatHistory, setChatHistory] = useState();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // to reflect updates on new messages
  // useEffect(() => {
  //   const getChatHistory = async () => {
  //     const status = searchParams.get("status");
  //     // console.log("STATUS:::::::", status);
  //     const isStatusNew = status === "new";
  //     if (isStatusNew) {
  //       const result = await loadAllChatSessions();
  //       if (result) {
  //         result.reverse();
  //         setChatHistory((r) => result);
  //         // console.log("chatHistory loaded INSIDE", result);
  //       } else {
  //         setChatHistory([]);
  //       }
  //       // console.log("NavigationEvents pathname", pathname);
  //       router.push(pathname, { scroll: false });
  //     }
  //   };
  //   getChatHistory();
  // }, [searchParams]);

  // to show history on page load
  useEffect(() => {
    const getChatHistory = async () => {
      // console.log("ChatHistory loading");
      const result = await loadAllChatSessions();
      console.log("all chat loaded");
      // console.log("ChatHistory result", result);
      if (result) {
        result.reverse();
        setChatHistory(result);
        //   console.log("chatHistory loaded INSIDE", result);
      } else {
        setChatHistory(null);
      }
      // console.log("chatHistory loaded INSIDE", result);

      setLoading(false);
    };
    getChatHistory();
  }, []);

  const chatHistoryTrue =
    chatHistory !== undefined &&
    Array.isArray(chatHistory) &&
    chatHistory.length > 0;

  // console.log("chatHistory", chatHistory);
  return (
    <Suspense
      fallback={
        <div className="w-2/4 mx-auto">
          <MultilineSkeleton lines={10} />
        </div>
      }
    >
      <>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          {loading ? (
            <div className=" mx-auto">
              <MultilineSkeleton lines={10} />
            </div>
          ) : chatHistoryTrue ? (
            <SidebarGroupContent>
              <SidebarMenu>
                {chatHistory.map((item, i) => {
                  // console.log("chatHistory", chatHistory);
                  const userMessageArray = item?.content?.userMessages;
                  const bookmarked = item?.bookmarked;
                  const isCanvas = !Array.isArray(userMessageArray);

                  console.log("chatHistory.map rendered");
                  // return;
                  let snippet;

                  if (!isCanvas) {
                    const snippetArray = userMessageArray.map((m) =>
                      typeof m.content === "string"
                        ? m.content
                        : m.content?.text
                          ? m.content?.text
                          : null
                    );
                    // snippet = snippetArray.join("...").slice(0, snippetToShow);
                    snippet = snippetArray.join("...");
                  } else {
                    // snippet = item?.content?.canvasText.slice(0, snippetToShow);
                    snippet = item?.content?.canvasText;
                  }
                  // console.log("snippet", snippet);
                  return (
                    <HistoryItem
                      key={i}
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
        </SidebarGroup>
        {chatHistoryTrue && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <ClearChatHistoryButton />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </>
    </Suspense>
  );
}
