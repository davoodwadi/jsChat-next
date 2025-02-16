"use client";

import { clearAllChatSessions } from "@/lib/save/saveActions";
import { Button } from "../ui/button";

import { Trash } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function ClearChatHistoryButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <Button
      // variant="destructive"
      size="sm"
      onClick={async (e) => {
        console.log("Clear Chat History");
        await clearAllChatSessions();
        const params = new URLSearchParams(searchParams.toString());
        params.set("status", "new");
        router.push(pathname + "?" + params.toString());
        // router.refresh();
      }}
    >
      <Trash />
      Clear Chat History
    </Button>
  );
}
