"use client";

import { useEffect, useState } from "react";
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
import { ClearChatHistoryButton } from "@/components/layout/ClearChatHistoryButton";

import Link from "next/link";

export function NavigationEvents() {
  const [chatHistory, setChatHistory] = useState();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const snippetToShow = 100;
  // to reflect updates on new messages
  useEffect(() => {
    const getChatHistory = async () => {
      const status = searchParams.get("status");
      // console.log("STATUS:::::::", status);
      const isStatusNew = status === "new";
      if (isStatusNew) {
        const result = await loadAllChatSessions();
        if (result) {
          result.reverse();
          setChatHistory(result);
          //   console.log("chatHistory loaded INSIDE", result);
        } else {
          setChatHistory([]);
        }
        // console.log("NavigationEvents pathname", pathname);
        router.push(pathname, { scroll: false });
      }
    };
    getChatHistory();
  }, [searchParams]);

  // to show history on page load
  useEffect(() => {
    const getChatHistory = async () => {
      console.log("ChatHistory loading");
      const result = await loadAllChatSessions();
      // console.log("ChatHistory result", result);
      if (result) {
        result.reverse();
        setChatHistory(result);
        //   console.log("chatHistory loaded INSIDE", result);
      } else {
        setChatHistory(null);
      }
    };
    getChatHistory();
  }, []);

  const chatHistoryTrue =
    chatHistory !== undefined &&
    Array.isArray(chatHistory) &&
    chatHistory.length > 0;

  if (chatHistoryTrue) {
    return (
      <>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {chatHistory.map((item, i) => {
                const userMessageArray = item?.content?.userMessages;
                const isCanvas = !Array.isArray(userMessageArray);

                // console.log("isCanvas", isCanvas);
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
                  snippet = snippetArray.join("...").slice(0, snippetToShow);
                } else {
                  snippet = item?.content?.canvasText.slice(0, snippetToShow);
                }
                // console.log("snippet", snippet);
                return (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton asChild>
                      <Link
                        href={
                          isCanvas
                            ? `/canvas/${item.chatid}`
                            : `/chat/${item.chatid}`
                        }
                      >
                        {/* <MessageCircle /> */}
                        <span>{snippet.trim()}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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
      </>
    );
  } else {
    return (
      <>
        <SidebarGroup>
          <SidebarGroupLabel>History</SidebarGroupLabel>
        </SidebarGroup>

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
      </>
    );
  }
}
