import { Suspense } from "react";
import { generateChatId } from "@/lib/chatUtils";

import dynamic from "next/dynamic";

const ChatContainer = dynamic(() => import("@/components/RecursiveComponent"), {
  loading: () => <p>Dynamic Loading ChatContainer...</p>,
});

export default async function Chat({
  params,
}: {
  params: Promise<{ chatid: string }>;
}) {
  // console.log("loading ChatContainer");

  const chatId = (await params).chatid;

  // console.log("chatId", chatId);

  return (
    <>
      <Suspense fallback={<p>Loading ChatContainer</p>}>
        <ChatContainer chatId={chatId} />
      </Suspense>
    </>
  );
}
