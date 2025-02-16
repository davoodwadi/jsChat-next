"use client";

import { clearAllChatSessions } from "@/lib/save/saveActions";
import { Button } from "../ui/button";

import { Trash } from "lucide-react";

export function ClearChatHistoryButton() {
  return (
    <Button
      // variant="destructive"
      size="sm"
      onClick={async (e) => {
        console.log("Clear Chat History");
        await clearAllChatSessions();
      }}
    >
      <Trash />
      Clear Chat History
    </Button>
  );
}
