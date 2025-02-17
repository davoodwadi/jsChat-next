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
      //   console.log("status", status);
      const isStatusNew = status === "new";
      if (isStatusNew) {
        const result = await loadAllChatSessions();
        if (result) {
          result.reverse();
          setChatHistory(result);
          //   console.log("chatHistory loaded INSIDE", result);
        } else {
          setChatHistory(null);
        }
        router.push(pathname);
      }
    };
    getChatHistory();
  }, [searchParams]);

  // to show history on page load
  useEffect(() => {
    const getChatHistory = async () => {
      const result = await loadAllChatSessions();
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
                if (!Array.isArray(userMessageArray)) {
                  return;
                }
                const snippetArray = userMessageArray.map((m) => m.content);
                const snippet = snippetArray
                  .join("...")
                  .slice(0, snippetToShow);
                return (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton asChild>
                      <Link href={`/chat/${item.chatid}`}>
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
