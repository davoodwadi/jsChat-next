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

import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { User2, BookOpenText } from "lucide-react";
// import { wait } from "@/lib/actions";

export function NewChatButton() {
  const { isMobile, setOpenMobile } = useSidebar();
  function handleClick() {
    if (isMobile) {
      setOpenMobile(false); // close sidebar on mobile after click
    }
  }
  return (
    <SidebarMenuItem key="1">
      <SidebarMenuButton asChild className="">
        <Link href="/" onClick={(e) => handleClick()}>
          <MessageCircle />
          <span>New Chat</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function SidebarCanvas() {
  const { isMobile, setOpenMobile } = useSidebar();
  function handleClick() {
    if (isMobile) {
      setOpenMobile(false); // ✅ close sidebar on mobile after click
    }
  }
  return (
    <SidebarMenuItem key="canvas">
      <SidebarMenuButton asChild className="">
        <Link href="/canvas" onClick={(e) => handleClick()}>
          <BookOpenText />
          <span>New Canvas</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function SidebarProfile() {
  const { isMobile, setOpenMobile } = useSidebar();
  function handleClick() {
    if (isMobile) {
      setOpenMobile(false); // ✅ close sidebar on mobile after click
    }
  }
  return (
    <SidebarMenuItem key="profile">
      <SidebarMenuButton asChild className="">
        <Link href="/profile" onClick={(e) => handleClick()}>
          <User2 />
          <span>Profile</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
