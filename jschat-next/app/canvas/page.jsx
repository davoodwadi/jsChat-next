"use client";

import { MultilineSkeleton } from "@/components/ui/skeleton";
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
      <div className="w-3/4 mx-auto my-16">
        <MultilineSkeleton lines={8} />
        <MultilineSkeleton lines={4} />
      </div>
    </>
  );
}
