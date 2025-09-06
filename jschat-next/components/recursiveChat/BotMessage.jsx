"use client";

import { test } from "@/lib/test";
import dynamic from "next/dynamic";
import MarkdownComponent from "@/components/MarkdownComponent";
import CopyText from "@/components/CopyTextComponent";
import { findSingleParent } from "./RecursiveComponent";
import { ChevronsLeftRight } from "lucide-react";
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
  // console.log("Bot props", props);
  // console.log("props?.botMessage?.status", props?.botMessage?.status);
  const isLatestBot = props.maxGlobalIdBot === props.globalIdBot;
  const refRenderedText = useRef(null);
  // console.log("refRenderedText.current", refRenderedText.current);

  const [botClass, setBotClass] = useState(baseBotClass);
  const [textToSpeak, setTextToSpeak] = useState();

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
    if (isLatestBot && props?.refElementBot.current) {
      props.refElementBot.current.scrollIntoView({
        block: "center",
        inline: "center",
      });
    }
  }, [isLatestBot, props.refElementBot]);

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
        className=" break-words  focus:outline-none focus:border-none focus:ring-0"
        id={props.id}
        globalidbot={props.globalIdBot}
        maxglobalidbot={props.maxGlobalIdBot}
        data-latest={isLatestBot ? "true" : "false"}
        latest={isLatestBot ? "true" : "false"}
        ref={isLatestBot ? props.refElementBot : null}
      >
        {/* props.content === "" || props?.botMessage?.status === "pending" */}
        {props?.botMessage?.status === "pending" ? (
          // <MultilineSkeleton lines={4}>{props.children}</MultilineSkeleton>
          <ThinkingSkeleton>{props.children}</ThinkingSkeleton>
        ) : props?.botMessage?.status === "reading" ? (
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
        ) : (
          <MarkdownComponent
            ref={refRenderedText}
            // groundingChunks={props?.groundingChunks}
            // groundingSupports={props?.groundingSupports}
            botMessage={props?.botMessage}
            {...props}
          >
            {props.children}
          </MarkdownComponent>
        )}
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
