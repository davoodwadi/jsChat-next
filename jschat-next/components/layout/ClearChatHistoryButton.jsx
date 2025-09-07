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
      variant="ghost"
      title="Clear All Chat History"
      className={
        "group mx-auto flex w-max items-center gap-3 w-5 h-5 rounded-full shadow-lg backdrop-blur-lg transition-all hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-50"
      }
      disabled={isClearing}
      size="icon"
      onClick={async (e) => {
        try {
          setIsClearing(true);
          // console.log("Clear Chat History");
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
      <Trash className={`h-3 w-3 `} />
      {isClearing ? "" : ""}
    </Button>
  );
}
