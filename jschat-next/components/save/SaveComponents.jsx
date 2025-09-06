"use client";

import { SaveButtonsTooltip } from "@/components/save/SaveButtonsTooltip";
import { HardDriveUpload, Save, RotateCcw, Star, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as React from "react";

import { saveChatSession, loadChatSession } from "@/lib/save/saveActions";
import { useRouter } from "next/navigation";
import { generateChatId, generateCanvasId } from "@/lib/chatUtils";
import { useState, useTransition } from "react";
import {
  toggleBookmarkChatSession,
  getBookmarkStatus,
} from "@/lib/save/saveActions";
import {
  createSaveChatSessionParams,
  //   createSaveCanvasSessionParams,
  //   // SaveChatSessionParams,
  //   SaveItemParams,
  //   SaveItemCanvasParams,
} from "@/app/types/types";
import { FloatingActionMenu } from "@/components/FloatingActionMenu";

export default function SaveItems(props) {
  // console.log("SaveItems userMessages", userMessages);
  // console.log("SaveItems botMessages", botMessages);
  // console.log("SaveItems props", props);
  // console.log("SaveItems systemPrompt", systemPrompt);
  const { toast } = useToast();
  const router = useRouter();
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingLoad, setLoadingLoad] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [loadingBookmark, setLoadingBookmark] = useState(false);
  const [loadingSystemPrompt, setLoadingSystemPrompt] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleToggleBookmark = () => {
    startTransition(async () => {
      const res = await toggleBookmarkChatSession({ chatId: chatId });
      router.refresh();
    });
  };
  const chatId = props.chatId;
  const elements = [
    {
      Element: Star,
      text: "Bookmark",
      loading: loadingBookmark,
      enabled: props.bookmarked,
      onClickFn: async () => {
        setLoadingBookmark(true);
        await handleToggleBookmark();
        setLoadingBookmark(false);
      },
    },
    // {
    //   Element: Settings,
    //   text: "System Prompt",
    //   loading: loadingSystemPrompt,
    //   // enabled: props.bookmarked,
    //   onClickFn: async () => {
    //     setLoadingBookmark(true);
    //     await handleToggleBookmark();
    //     setLoadingBookmark(false);
    //   },
    // },
    {
      Element: HardDriveUpload,
      text: "Load",
      loading: loadingLoad,
      onClickFn: async () => {
        setLoadingLoad(true);
        console.log(`CLIENT: load ${props.chatId}`);
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

          props.setUserMessages(content.userMessages);
          props.setBotMessages(content.botMessages);
          if (!content?.systemPrompt) {
            // console.log("no system prompt", "setting it to empty string");
            props.setSystemPrompt("");
          } else {
            props.setSystemPrompt(content.systemPrompt);
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
        console.log(`CLIENT: save ${props.chatId}`);
        const saveChatSessionParams = createSaveChatSessionParams(props);
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
  // Position the FAB in the bottom right corner, which is a common and mobile-friendly pattern
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <FloatingActionMenu
        elements={elements}
        systemPrompt={props.systemPrompt}
        setSystemPrompt={props.setSystemPrompt}
      />
    </div>
  );
  // return (
  //   <div className="flex flex-row mx-auto mt-2 fixed bottom-6 z-50">
  //     <SaveButtonsTooltip elements={elements} />
  //   </div>
  // );
}

export function SaveItemsCanvas(params) {
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
          params.setExtraContext(
            content?.extraContext ? content?.extraContext : ""
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
    <div className="flex flex-row mx-auto mt-2 ">
      <SaveButtonsTooltip elements={elements} />
    </div>
  );
}
