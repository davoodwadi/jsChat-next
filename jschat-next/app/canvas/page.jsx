"use client";

import ChatSkeleton from "@/app/chat-skeleton/page";

import { generateCanvasId } from "@/lib/chatUtils";
// import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { delay } from "@/lib/myTools";
export default function Home() {
  // console.log("loading ChatContainer");
  const router = useRouter();
  const canvasId = generateCanvasId();
  // console.log("canvasId ", canvasId);
  // redirect(`/chat/${chatId}`); // redirect throws client side exception

  useEffect(() => {
    router.push(`/canvas/${canvasId}`);
  }, []);
  // router.push(`/chat/${chatId}`);

  return (
    <>
      <ChatSkeleton />
    </>
  );
}
