// import ChatComponent from "@/components/ChatComponent"
// import ChatContainer from "@/components/RecursiveComponent";

import { Suspense } from "react";
import { generateChatId } from "@/lib/chatUtils";

import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

const ChatContainer = dynamic(() => import("@/components/RecursiveComponent"), {
  loading: () => <p>Dynamic Loading ChatContainer...</p>,
});

export default async function Home({}: {}) {
  // console.log("loading ChatContainer");
  const chatId = generateChatId();
  console.log("chatId ", chatId);
  redirect(`/chat/${chatId}`);
  // return (
  //   <>
  //     <Suspense fallback={<p>Loading ChatContainer</p>}>
  //       <ChatContainer />
  //     </Suspense>
  //   </>
  // );
}
