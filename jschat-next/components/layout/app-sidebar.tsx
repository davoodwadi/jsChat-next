import {
  Calendar,
  Home,
  Inbox,
  Search,
  Settings,
  MessageCircle,
  User2,
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
import { loadAllChatSessions, loadChatSession } from "@/lib/save/saveActions";

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
  const session = await auth();
  const chatHistory = await loadAllChatSessions();
  if (!chatHistory) {
    console.log("loadAllChatSessions failed.");
    return;
  }
  console.log("chatHistory", chatHistory);
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Spreed</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

// <SidebarGroup>
//           <SidebarGroupLabel>History</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {chatHistory.map((item, i) => (
//                 <SidebarMenuItem key={i}>
//                   <SidebarMenuButton asChild>
//                     <a href={item.url}>
//                       {/* <MessageCircle /> */}
//                       <span>{item.title}</span>
//                     </a>
//                   </SidebarMenuButton>
//                 </SidebarMenuItem>
//               ))}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
