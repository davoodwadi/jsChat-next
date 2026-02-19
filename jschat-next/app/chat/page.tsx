import ChatSkeleton from "@/app/chat-skeleton/page";

import { generateChatId } from "@/lib/chatUtils";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/actions";
// import { delay } from "@/lib/myTools";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Home(props: { searchParams: SearchParams }) {
  // console.log("loading ChatContainer");
  const searchParams = await props.searchParams;

  const authStatus = await getAuth();
  console.log("authStatus ", authStatus);
  if (authStatus === 400) {
    // Redirect to signin immediately
    redirect("/signin?callbackUrl=/chat");
  }

  // 3. Handle Authenticated
  if (typeof authStatus === "string") {
    const chatId = generateChatId();

    // --- FIX STARTS HERE ---
    // Create a new URLSearchParams instance
    const params = new URLSearchParams();

    // Safely add existing search params
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value === "string") {
          params.set(key, value);
        } else if (Array.isArray(value)) {
          // If it's an array, take the first value or join them, depending on your needs
          // Usually taking the first one is safe for simple params
          if (value.length > 0) params.set(key, value[0]);
        }
      });
    }

    // Add your specific param
    params.set("new", "true");
    // --- FIX ENDS HERE ---

    redirect(`/chat/${chatId}?${params.toString()}`);
  }

  return (
    <>
      <ChatSkeleton />
    </>
  );
}
