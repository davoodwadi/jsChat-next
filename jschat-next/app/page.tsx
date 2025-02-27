"use client";

import { MultilineSkeleton } from "@/components/ui/skeleton";
import { generateChatId } from "@/lib/chatUtils";
// import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import { delay } from "@/lib/myTools";
export default function Home({}: {}) {
  // console.log("loading ChatContainer");
  const router = useRouter();
  const chatId = generateChatId();
  console.log("chatId ", chatId);
  // redirect(`/chat/${chatId}`); // redirect throws client side exception

  useEffect(() => {
    router.push(`/chat/${chatId}`);
  }, []);
  // router.push(`/chat/${chatId}`);

  return (
    <>
      <div className="w-3/4 mx-auto">
        <MultilineSkeleton lines={4} />
      </div>
      <div className="w-3/4 mx-auto">
        <MultilineSkeleton lines={4} />
      </div>
    </>
  );
}
