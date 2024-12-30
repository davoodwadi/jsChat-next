import { generateChatId } from "@/lib/chatUtils";

import { redirect } from "next/navigation";

export default async function Home({}: {}) {
  // console.log("loading ChatContainer");
  const chatId = generateChatId();
  console.log("chatId ", chatId);
  redirect(`/chat/${chatId}`);
}
