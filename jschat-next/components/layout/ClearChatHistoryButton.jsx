"use client";

import { clearAllChatSessions } from "@/lib/save/saveActions";
import { Button } from "../ui/button";

import { Trash } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

export function ClearChatHistoryButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClearing, setIsClearing] = useState(false);
  return (
    <Button
      // variant="destructive"
      disabled={isClearing}
      size="sm"
      onClick={async (e) => {
        try {
          setIsClearing(true);
          console.log("Clear Chat History");
          await clearAllChatSessions();

          const params = new URLSearchParams(searchParams.toString());
          params.set("status", "new");
          // console.log("params", params);
          router.push(pathname + "?" + params.toString(), { scroll: false });
          // const params = new URLSearchParams(searchParams.toString());
          // params.set("status", "new");
          // router.push(pathname + "?" + params.toString());
        } catch (error) {
          console.error("Failed to clear chat history:", error);
        } finally {
          setIsClearing(false);
        }
      }}
    >
      <Trash />
      {isClearing ? "Clearing..." : "Clear Chat History"}
    </Button>
  );
}
