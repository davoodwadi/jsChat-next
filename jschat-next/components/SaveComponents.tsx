"use client";

import { SaveButtonsTooltip } from "@/components/SaveButtonsTooltip";
import { HardDriveUpload, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

import { saveChatSession, loadChatSession } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { generateChatId } from "@/lib/chatUtils";

// function resetInterface(setUserMessages, setBotMessages) {
//   const newglobalIdUser = 1;
//   setGlobalUserId(newglobalIdUser);
//   setGlobalBotId(0);
//   setUserMessages((m) => [
//     { key: [1], content: "", role: "user", globalIdUser: newglobalIdUser },
//   ]);
//   setBotMessages((m) => []);
//   console.log("interface reset");
// }

type UserMessages = {
  key: string;
  content: string;
  role: string;
  globalIdUser: number;
}[];
type BotMessages = {
  key: string;
  content: string;
  role: string;
  globalIdBot: number;
  status: string;
  model: string;
}[];

export default function SaveItems({
  chatId,
  userMessages,
  botMessages,
  setUserMessages,
  setBotMessages,
  setChatContainerKey,
}: {
  chatId: string;
  userMessages: UserMessages;
  botMessages: BotMessages;
  setUserMessages: (userMessages: UserMessages) => void;
  setBotMessages: (botMessages: BotMessages) => void;
  setChatContainerKey: (updater: (key: number) => number) => void;
}) {
  // console.log("SaveItems userMessages", userMessages);
  // console.log("SaveItems botMessages", botMessages);
  const { toast } = useToast();
  const router = useRouter();

  const elements = [
    {
      Element: HardDriveUpload,
      text: "Load",
      onClickFn: async () => {
        console.log(`CLIENT: load ${chatId}`);
        const lastSession = await loadChatSession({ chatId });
        if (!lastSession) {
          console.log("No session found for chatid");
          toast({
            variant: "destructive",
            title: "Failed to load",
            description: "No session found for chatid",
          });
          return;
        } else {
          const content = lastSession.content;
          console.log(`CLIENT: content`, content);

          setUserMessages(content.userMessages);
          setBotMessages(content.botMessages);
          toast({
            variant: "default",
            title: "Successful load",
            description: "Session loaded successfully",
          });
        }
      },
    },
    {
      Element: Save,
      text: "Save",
      onClickFn: () => {
        console.log(`CLIENT: save ${chatId}`);
        const userMessagesJSON = JSON.stringify(userMessages);
        const botMessagesJSON = JSON.stringify(botMessages);
        saveChatSession({
          chatId,
          userMessagesJSON,
          botMessagesJSON,
          userMessages,
          botMessages,
        });
        toast({
          variant: "default",
          title: "Successful Save",
          description: "Session saved successfully",
        });
      },
    },
    {
      Element: RotateCcw,
      text: "Reset Interface",
      onClickFn: () => {
        // console.log("toast");
        // setChatContainerKey((v) => v + 1);
        const newChatId = generateChatId();
        console.log("newChatId", newChatId);
        router.push(`/chat/${newChatId}`);
        toast({
          title: "Chat Reset",
        });
      },
    },
  ];
  return (
    <div className="flex flex-row mx-auto mt-2">
      <SaveButtonsTooltip elements={elements} />
    </div>
  );
}
