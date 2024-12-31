"use client";

import { SaveButtonsTooltip } from "@/components/save/SaveButtonsTooltip";
import { HardDriveUpload, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

import { saveChatSession, loadChatSession } from "@/lib/save/saveActions";
import { useRouter } from "next/navigation";
import { generateChatId } from "@/lib/chatUtils";
import { useState } from "react";

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
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingLoad, setLoadingLoad] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);

  const elements = [
    {
      Element: HardDriveUpload,
      text: "Load",
      loading: loadingLoad,
      onClickFn: async () => {
        setLoadingLoad(true);
        console.log(`CLIENT: load ${chatId}`);
        const thisSession = await loadChatSession({ chatId });
        if (!thisSession) {
          console.log("No session found for chatid");
          toast({
            variant: "destructive",
            title: "Failed to load",
            description: "No session found for the chat. Please save first.",
          });
          setLoadingLoad(false);

          return;
        } else {
          const content = thisSession.content;
          console.log(`CLIENT: content`, content);

          setUserMessages(content.userMessages);
          setBotMessages(content.botMessages);
          toast({
            variant: "default",
            title: "Successful load",
            description: "Session loaded successfully",
          });
          setLoadingLoad(false);
        }
      },
    },
    {
      Element: Save,
      text: "Save",
      loading: loadingSave,
      onClickFn: () => {
        setLoadingSave(true);

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
        setLoadingSave(false);
      },
    },
    {
      Element: RotateCcw,
      text: "Reset Interface",
      loading: loadingReset,
      onClickFn: () => {
        setLoadingReset(true);

        // console.log("toast");
        // setChatContainerKey((v) => v + 1);
        const newChatId = generateChatId();
        router.push(`/chat/${newChatId}`);
        toast({
          title: "Chat Reset",
        });
        setLoadingReset(false);
      },
    },
  ];
  return (
    <div className="flex flex-row mx-auto mt-2">
      <SaveButtonsTooltip elements={elements} />
    </div>
  );
}
