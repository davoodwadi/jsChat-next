"use client";

import { SaveButtonsTooltip } from "@/components/save/SaveButtonsTooltip";
import { HardDriveUpload, Save, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

import { saveChatSession, loadChatSession } from "@/lib/save/saveActions";
import { useRouter } from "next/navigation";
import { generateChatId, generateCanvasId } from "@/lib/chatUtils";
import { useState } from "react";

import {
  createSaveChatSessionParams,
  createSaveCanvasSessionParams,
  // SaveChatSessionParams,
  SaveItemParams,
  SaveItemCanvasParams,
} from "@/app/types/types";

export default function SaveItems(params: SaveItemParams) {
  // console.log("SaveItems userMessages", userMessages);
  // console.log("SaveItems botMessages", botMessages);
  // console.log("SaveItems props", props);
  // console.log("SaveItems systemPrompt", systemPrompt);
  const { toast } = useToast();
  const router = useRouter();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingLoad, setLoadingLoad] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const chatId = params.chatId;
  const elements = [
    {
      Element: HardDriveUpload,
      text: "Load",
      loading: loadingLoad,
      onClickFn: async () => {
        setLoadingLoad(true);
        console.log(`CLIENT: load ${params.chatId}`);
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
          // console.log(`CLIENT: content`, content);

          params.setUserMessages(content.userMessages);
          params.setBotMessages(content.botMessages);
          if (!content?.systemPrompt) {
            // console.log("no system prompt", "setting it to empty string");
            params.setSystemPrompt("");
          } else {
            params.setSystemPrompt(content.systemPrompt);
          }
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
        console.log(`CLIENT: save ${params.chatId}`);
        const saveChatSessionParams = createSaveChatSessionParams(params);
        saveChatSession(saveChatSessionParams);
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

export function SaveItemsCanvas(params: SaveItemCanvasParams) {
  // console.log("SaveItems userMessages", userMessages);
  // console.log("SaveItems botMessages", botMessages);
  // console.log("SaveItems props", props);
  // console.log("SaveItems systemPrompt", systemPrompt);
  const { toast } = useToast();
  const router = useRouter();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingLoad, setLoadingLoad] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const chatId = params.canvasId;
  const elements = [
    {
      Element: HardDriveUpload,
      text: "Load",
      loading: loadingLoad,
      onClickFn: async () => {
        setLoadingLoad(true);
        console.log(`CLIENT: load ${params.canvasId}`);
        console.log(`CLIENT: load`, params);
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
          // console.log(`CLIENT: content`, content);

          // if (typeof params.editableRef.current?.innerText === "string") {
          params.setCanvasText(content.canvasText);
          params.setReferences(content?.references ? content?.references : "");
          params.setLLMInstructions(
            content?.llmInstructions ? content?.llmInstructions : ""
          );

          // params.editableRef.current.innerText = content.canvasText;
          // }
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
        console.log(`CLIENT: save ${params.canvasId}`);
        const saveCanvasSessionParams = createSaveCanvasSessionParams(params);
        // console.log("saveCanvasSessionParams", saveCanvasSessionParams);
        saveChatSession(saveCanvasSessionParams);
        toast({
          variant: "default",
          title: "Successful Save",
          description: "Session saved successfully",
        });
        // reflect the change in history
        const urlParams = new URLSearchParams(params.searchParams.toString());
        urlParams.set("status", "new");
        router.push(params.pathname + "?" + urlParams.toString(), {
          scroll: false,
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

        const newCanvasId = generateCanvasId();
        router.push(`/canvas/${newCanvasId}`);
        toast({
          title: "Canvas Reset",
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
