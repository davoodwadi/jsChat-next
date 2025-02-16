import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  MessageCircle,
  User2,
  Trash,
} from "lucide-react";

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
import { loadAllChatSessions, loadChatSession } from "@/lib/save/saveActions";

import Link from "next/link";

import { auth } from "@/auth";

// Menu items.
const items = [
  {
    title: "Chat",
    url: "/",
    icon: MessageCircle,
  },

  {
    title: "Profile",
    url: "/profile",
    icon: User2,
  },
];

// Menu items.

export async function AppSidebar() {
  const chatHistory = await loadAllChatSessions();
  const chatHistoryTrue =
    chatHistory !== undefined &&
    Array.isArray(chatHistory) &&
    chatHistory.length > 0;
  if (chatHistoryTrue) {
    chatHistory.reverse();
  }
  const session = await auth();

  const snippetToShow = 100;

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
                    <span>Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {session && (
                <SidebarMenuItem key="2">
                  <SidebarMenuButton asChild>
                    <Link href="/profile">
                      <User2 />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {chatHistoryTrue && (
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
                    .join(" - ")
                    .slice(0, snippetToShow);
                  return (
                    <SidebarMenuItem key={i}>
                      <SidebarMenuButton asChild>
                        <Link href={`/chat/${item.chatid}`}>
                          {/* <MessageCircle /> */}
                          <span>{snippet.trim()}...</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
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
      </SidebarContent>
    </Sidebar>
  );
}
