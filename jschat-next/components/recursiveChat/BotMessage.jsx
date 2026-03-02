"use client";

import { test } from "@/lib/test";
import dynamic from "next/dynamic";
import { saveChatSession } from "@/lib/save/saveActions";
import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";
import { findSingleParent } from "./RecursiveComponent";
import { ChevronsLeftRight, AlertCircle } from "lucide-react";
import {
  Trash2,
  SendHorizontal,
  Eraser,
  ImagePlus,
  Square,
  X,
  Microscope,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import {
  ThinkingSkeleton,
  ThinkingReadingSkeleton,
} from "@/components/ThinkingSkeleton";
import { useSidebar } from "@/components/ui/sidebar";
import { TTS } from "@/components/TTS";
import { Maximize } from "lucide-react";

let baseBotClass = ` p-4 m-1 relative   
    text-gray-900 rounded-xl  
    border-2 border-gray-100
    focus:ring-blue-500 focus:border-blue-500 
     dark:border-gray-600 dark:placeholder-gray-400 
     dark:text-white 
     dark:focus:ring-blue-500 dark:focus:border-blue-500 `;

export default function BotMessage(props) {
  // console.log("props?.botMessage.model.model", props?.botMessage.model.model);
  console.log("Bot props", props);
  // console.log("props?.botMessage?.status", props?.botMessage?.status);
  const isLatestBot = props.id === props.branchKeyToMaximize;
  const refRenderedText = useRef(null);
  // console.log("refRenderedText.current", refRenderedText.current);
  const [botClass, setBotClass] = useState(baseBotClass);
  const [textToSpeak, setTextToSpeak] = useState();

  const [interactionData, setInteractionData] = useState(() => {
    {
    }
  });

  useEffect(() => {
    if (refRenderedText.current) {
      // console.log("refRenderedText.current", refRenderedText.current);
      // console.log(
      //   "refRenderedText.current.textContent",
      //   refRenderedText.current.textContent
      // );
      setTextToSpeak(refRenderedText.current.textContent);
    }
  }, [refRenderedText.current]);
  useEffect(() => {
    // console.log(
    //   "useEffect botmessage fired props.branchKeyToMaximize",
    //   props.branchKeyToMaximize,
    // );
    // console.log("useEffect botmessage fired props.id", props.id);

    if (isLatestBot && props?.refElementBot.current) {
      // console.log("props.refElementBot.current", props.refElementBot.current);
      props.refElementBot.current.scrollIntoView({
        block: "start", // Vertically aligns the top of the element to the top of the screen
        inline: "center", // Horizontally aligns the center of the element to the center of the screen
        behavior: "smooth", // Optional: makes the transition smooth instead of a jump
      });
    }
  }, [isLatestBot, props.refElementBot, props.branchKeyToMaximize]);

  const handleCheckMessage = async () => {
    const taskId = props?.botMessage?.interaction?.interactionID;
    const modelName = props?.botMessage?.model?.model;

    if (!taskId) return;
    try {
      const response = await fetch(
        `/api/chat?taskId=${taskId}&model=${modelName}&email=${props?.email}`,
      );
      const data = await response.json();

      // console.log("Poll response:", data);
      if (data.status === "completed") {
        // set botMessages content for this key to data.content
        // props.setBotMessages
        const thisMessageKey = props.botMessage.key;
        console.log("settings bot message for ", thisMessageKey);
        // Calculate updated messages
        const updatedBotMessages = props.botMessages.map((bm) =>
          bm.key === thisMessageKey
            ? {
                ...bm,
                content: data.content,
                annotations: data.annotations,
                interaction: { ...bm.interaction, status: "completed" },
              }
            : bm,
        );
        // Update state
        props.setBotMessages(updatedBotMessages);
        // Save with the updated messages
        saveChatSession({
          chatId: props.chatId,
          userMessages: props.userMessages,
          botMessages: updatedBotMessages,
          systemPrompt: props.systemPrompt,
          globalModelInfo: props.globalModelInfo,
        });
      }
      setInteractionData(data);
    } catch (error) {
      console.error("Error polling task:", error);
    }
  };

  // console.log("props?.botMessage.interaction", props?.botMessage.interaction);
  const interactionPending =
    props?.botMessage?.interaction?.status !== "completed";
  // console.log("interactionPending", interactionPending);
  return (
    <div className={botClass} ref={props.thisBotRef}>
      <div className="flex flex-row justify-between text-xs mb-4">
        <p className="text-sm antialiased italic font-bold ">
          {props.model?.name}
        </p>
        <div className="flex flex-row gap-0">
          <Button
            variant={
              props.branchKeyToMaximize === props.id ? "outline" : "ghost"
            }
            className=""
            onClick={(e) => {
              const keyToMax = findSingleParent(props.id, props.userMessages);
              // console.log("onclick keyToMax", keyToMax);
              props.setBranchKeyToMaximize(keyToMax);
            }}
          >
            <ChevronsLeftRight size={16} />
          </Button>
          <Button
            variant="ghost"
            onClick={(e) => maximizeBotMessage(e, botClass, setBotClass)}
          >
            <Maximize size={16} />
          </Button>
          <TTS text={textToSpeak} />
          <CopyText text={props.children} />
        </div>
      </div>
      <div
        className="  focus:outline-none focus:border-none focus:ring-0"
        id={props.id}
        globalidbot={props.globalIdBot}
        maxglobalidbot={props.maxGlobalIdBot}
        data-latest={isLatestBot ? "true" : "false"}
        latest={isLatestBot ? "true" : "false"}
        ref={isLatestBot ? props.refElementBot : null}
      >
        {interactionPending ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="animate-pulse">
              <Microscope size={48} className=" mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">
                Deep Research in Progress
              </h3>
              <p className="text-muted-foreground max-w-md">
                This task is running in the background. It may take several
                minutes to complete depending on the depth of research required.
                Check the status periodically.
              </p>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              <Button
                onClick={handleCheckMessage}
                className="glass-button-dark flex items-center gap-2"
                variant="outline"
              >
                <Search size={16} />
                Check Status
              </Button>
              {/* <span className="text-xs text-muted-foreground font-mono mt-2">
                Task ID: {props?.botMessage.interaction.interactionID}
              </span> */}
            </div>

            {interactionData ? (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg w-full max-w-md text-left">
                <p className="font-semibold text-sm mb-1">
                  Status: {interactionData.status}
                </p>
                {interactionData.progress && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${interactionData.progress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
        {props?.botMessage?.status === "pending" && !interactionPending ? (
          <ThinkingSkeleton>{props.children}</ThinkingSkeleton>
        ) : props?.botMessage?.status === "reading" && !interactionPending ? (
          <ThinkingReadingSkeleton>
            <MarkdownComponent
              ref={refRenderedText}
              // groundingChunks={props?.groundingChunks}
              // groundingSupports={props?.groundingSupports}
              botMessage={props?.botMessage}
              {...props}
            >
              {props.children}
            </MarkdownComponent>
          </ThinkingReadingSkeleton>
        ) : !interactionPending ? (
          <MarkdownComponent
            ref={refRenderedText}
            // groundingChunks={props?.groundingChunks}
            // groundingSupports={props?.groundingSupports}
            botMessage={props?.botMessage}
            {...props}
          >
            {props.children}
          </MarkdownComponent>
        ) : null}
        {props?.botMessage?.errors?.error ? (
          <div className="mt-4 p-3 rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <AlertCircle
                  size={18}
                  className="text-red-600 dark:text-red-400 mt-0.5"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  {props.botMessage.errors.error}
                </p>
                {props.botMessage.errors.details && (
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    {props.botMessage.errors.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
const fullscreenBotMessage =
  "fixed inset-0 z-50 bg-white flex flex-col p-8 overflow-auto";
export function maximizeBotMessage(e, botClass, setBotClass) {
  console.log("e", e);
  botClass === baseBotClass
    ? setBotClass(fullscreenBotMessage)
    : setBotClass(baseBotClass);
}
