import { Suspense } from "react";

import dynamic from "next/dynamic";
import { MultilineSkeleton } from "@/components/ui/skeleton";

const ChatContainer = dynamic(
  () => import("@/components/recursiveChat/RecursiveComponent"),
  {
    loading: () => (
      <div className="w-3/4 mx-auto">
        <MultilineSkeleton lines={4} />
      </div>
    ),
  }
);

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
      <Suspense
        fallback={
          <div className="w-3/4 mx-auto">
            <MultilineSkeleton lines={4} />
          </div>
        }
      >
        <ChatContainer chatId={chatId} />
      </Suspense>
    </>
  );
}
