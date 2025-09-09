"use client";

import ChatSkeleton from "@/app/chat-skeleton/page";

import { generateChatId } from "@/lib/chatUtils";
// import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { delay } from "@/lib/myTools";
export default function Home({}: {}) {
  // console.log("loading ChatContainer");
  const router = useRouter();
  const chatId = generateChatId();
  // console.log("chatId ", chatId);
  // redirect(`/chat/${chatId}`); // redirect throws client side exception

  useEffect(() => {
    router.push(`/chat/${chatId}`);
  }, []);

  return (
    <>
      <ChatSkeleton />
    </>
  );
}
