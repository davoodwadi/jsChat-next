"use client";

// export const maxDuration = 55;

import React from "react";
import { useState, useRef, useEffect, useTransition, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Suspense } from "react";
import { TopupDialog } from "@/components/auth/AuthDialog";
import { AuthDialogClient } from "@/components/auth/AuthDialogClient";
import SaveItems from "@/components/save/SaveComponents";
import { loadChatSession, saveChatSession } from "@/lib/save/saveActions";

import { useSidebar } from "@/components/ui/sidebar";

import RecursiveBranch from "./RecursiveBranch";
import { Button } from "../ui/button";
import { hasSiblings } from "./Branch";
import ChatSkeleton from "@/app/chat-skeleton/page";
import { createQueryString } from "@/lib/myToolsClient";

export function RecursiveChatContainer(props) {
  // console.log("props", props);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new");
  // console.log("isNew", isNew);
  const abortControllerRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const [globalIdUser, setGlobalIdUser] = useState(1);
  const [globalIdBot, setGlobalIdBot] = useState(0);

  const [userMessages, setUserMessages] = useState(() => [
    {
      key: JSON.stringify([1]),
      content: "",
      role: "user",
      globalIdUser: globalIdUser,
    },
  ]);
  const [botMessages, setBotMessages] = useState(() => []);
  // load history if exists
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [botMessageFinished, setBotMessageFinished] = useState(false);
  const [branchKeyToMaximize, setBranchKeyToMaximize] = useState(
    JSON.stringify([1])
  );
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );
  // loadHistory: props.chatId
  useEffect(() => {
    const loadHistory = async () => {
      // console.log("loading history for ", props.chatId);
      const thisSession = await loadChatSession({ chatId: props.chatId });
      if (!thisSession) {
        // console.log("thisSession undefined");
        setLoadingHistory(false);
        return;
      }
      if (thisSession?.content?.userMessages) {
        // console.log(`CLIENT: thisSession`, thisSession);
        // props.setIsBookmarked(thisSession?.bookmarked);
        setUserMessages(thisSession?.content?.userMessages);
        setBotMessages(thisSession?.content?.botMessages);
        const maxUID = getMaxGlobalIdUser(thisSession.content.userMessages);
        setGlobalIdUser(maxUID);
        if (!thisSession?.content?.systemPrompt) {
          props.setSystemPrompt("");
        } else {
          props.setSystemPrompt(thisSession?.content?.systemPrompt);
        }
        if (thisSession?.content?.globalModelInfo) {
          props.setGlobalModelInfo(thisSession.content.globalModelInfo);
        }
      }
      setLoadingHistory(false);
    };

    if (!isNew | (isNew === "false")) {
      console.log("loadHistory");
      loadHistory();
    } else {
      setLoadingHistory(false);
    }
  }, [props.chatId]);

  // save chat session on finish: botMessages
  useEffect(() => {
    // console.log("botMessageFinished", botMessageFinished);
    if (botMessageFinished) {
      // console.log("chat saved on submit", botMessages);
      saveChatSession({
        chatId: props.chatId,
        userMessages: userMessages,
        botMessages: botMessages,
        systemPrompt: props.systemPrompt,
        globalModelInfo: props.globalModelInfo,
      });
      if (isNew === "true") {
        console.log("chat is new -> false");
        const queryString = pathname + "?" + createQueryString("new", "false");
        // console.log("queryString", queryString);
        router.push(queryString);
      }

      if (botMessages.length === 1) {
        router.refresh();
      }
    }
  }, [botMessages]);
  // update branch key to maximize: globalIdUser, userMessages
  useEffect(() => {
    const newBranchKeyToMaximize = getBranchKeyToMaximize({
      userMessages,
    });
    setBranchKeyToMaximize(newBranchKeyToMaximize);
  }, [globalIdUser, userMessages]);

  const { open } = useSidebar();

  let chatContainerClass =
    " h-[83vh] rounded-xl mx-auto overflow-y-auto overflow-x-auto py-16 "; // flex flex-col overflow-auto
  if (!open) {
    chatContainerClass += " w-[90vw] md:w-[90vw] ";
  } else {
    chatContainerClass += " w-[90vw] md:w-[calc(90vw-16rem)] ";
  }

  return (
    <>
      <Suspense fallback={<ChatSkeleton />}>
        <div id="recursive-chat-container" className={chatContainerClass}>
          <Suspense fallback={<ChatSkeleton />}>
            {loadingHistory ? (
              <ChatSkeleton />
            ) : (
              <>
                <RecursiveBranch
                  level={0}
                  {...props}
                  userMessages={userMessages}
                  setUserMessages={setUserMessages}
                  botMessages={botMessages}
                  setBotMessages={setBotMessages}
                  globalIdBot={globalIdBot}
                  setGlobalIdBot={setGlobalIdBot}
                  globalIdUser={globalIdUser}
                  setGlobalIdUser={setGlobalIdUser}
                  branchKeyToMaximize={branchKeyToMaximize}
                  setBranchKeyToMaximize={setBranchKeyToMaximize}
                  setBotMessageFinished={setBotMessageFinished}
                  isStreaming={isStreaming}
                  setIsStreaming={setIsStreaming}
                  abortControllerRef={abortControllerRef}
                />
              </>
            )}
          </Suspense>
        </div>
        <SaveItems
          chatId={props.chatId}
          userMessages={userMessages}
          botMessages={botMessages}
          setUserMessages={setUserMessages}
          setBotMessages={setBotMessages}
          systemPrompt={props.systemPrompt}
          setSystemPrompt={props.setSystemPrompt}
          {...props}
        />
      </Suspense>
    </>
  );
}

export default function ChatContainer(props) {
  // has chatId prop
  // console.log("ChatContainer props", props);
  const refUser = useRef(null);
  const refBot = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTopupDialogOpen, setIsTopupDialogOpen] = useState(false);

  return (
    <Suspense fallback={<ChatSkeleton />}>
      <div className="flex flex-col mx-auto justify-center items-center py-2 px-4 md:px-6 ">
        <Suspense fallback={<ChatSkeleton />}>
          <RecursiveChatContainer
            {...props}
            refElementUser={refUser}
            refElementBot={refBot}
            setIsDialogOpen={setIsDialogOpen}
            setIsTopupDialogOpen={setIsTopupDialogOpen}
          />
        </Suspense>
        <AuthDialogClient
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
        <TopupDialog
          isDialogOpen={isTopupDialogOpen}
          setIsDialogOpen={setIsTopupDialogOpen}
        />
      </div>
    </Suspense>
  );
}

export function findSingleParent(key, userMessages) {
  // console.log("key", key);
  const singleParentKey = getBranchToMaxBasedOnSiblings({ key, userMessages });
  return singleParentKey;
}
function getBranchToMaxBasedOnSiblings({ key, userMessages }) {
  // console.log("key", key);
  const keyArr = JSON.parse(key);
  const siblingsBool = hasSiblings({ selectedKey: key, userMessages });
  // console.log("siblingsBool", siblingsBool);
  if (siblingsBool) {
    // console.log("has siblings", "maximize it");
    return key;
  } else {
    // check the parent
    const parentArr = keyArr.slice(0, -1);
    const parent = JSON.stringify(parentArr);
    // console.log("parent", parent);
    // check parent for root
    if (parentArr.length === 0) {
      // console.log("is root", "maximize it");
      return key;
    } else {
      // console.log("checking parent", parent);
      return getBranchToMaxBasedOnSiblings({ key: parent, userMessages });
    }
  }
}
//
export function getBranchKeyToMaximize({ userMessages }) {
  const maxUID = getMaxGlobalIdUser(userMessages);
  // console.log("getBranchKeyToMaximize maxUID", maxUID);
  const userMessageWithMaxUID = userMessages.find(
    (um) => um.globalIdUser === maxUID
  );
  // console.log("userMessageWithMaxUID", userMessageWithMaxUID);
  const key = userMessageWithMaxUID.key;
  const keyToMax = findSingleParent(key, userMessages);
  // console.log("keyToMax", keyToMax);
  return keyToMax;
}

export function getMaxGlobalIdUser(userMessages) {
  const maxUID = Math.max(...userMessages.map((m) => m.globalIdUser));
  // console.log("maxUID", maxUID);
  return maxUID;
}
