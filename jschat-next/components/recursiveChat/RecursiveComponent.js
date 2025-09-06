"use client";

// export const maxDuration = 55;

import React from "react";
import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Suspense } from "react";
import { MultilineSkeleton } from "@/components/ui/skeleton";

import { AuthDialog, TopupDialog } from "@/components/auth/AuthDialog";
import SaveItems from "@/components/save/SaveComponents";
import { loadChatSession, saveChatSession } from "@/lib/save/saveActions";

import { useSidebar } from "@/components/ui/sidebar";

import RecursiveBranch from "./RecursiveBranch";
import { Button } from "../ui/button";
import { hasSiblings } from "./Branch";

export function RecursiveChatContainer(props) {
  // console.log("starting RecursiveChatContainer");
  // console.log("RecursiveChatContainer props", props);
  // console.log("RecursiveChatContainer props", props.systemPrompt);
  // console.log("props.refElementBot.current", props.refElementBot.current);
  // const refChatContainer = useRef(null);
  // console.log("props.model", props.model);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
      }
      setLoadingHistory(false);
    };
    loadHistory();
  }, [props.chatId]);

  useEffect(() => {
    // // save chat session
    // console.log("botMessageFinished", botMessageFinished);
    if (botMessageFinished) {
      // console.log("chat saved on submit", botMessages);
      saveChatSession({
        chatId: props.chatId,
        userMessages: userMessages,
        botMessages: botMessages,
        systemPrompt: props.systemPrompt,
      });

      if (botMessages.length === 1) {
        router.refresh();
        // focus to the new userMessage textarea
        // props.refElementUser?.current?.focus();
      }
    }
  }, [botMessages]);
  // console.log("botMessages", botMessages);

  useEffect(() => {
    const newBranchKeyToMaximize = getBranchKeyToMaximize({
      userMessages,
    });
    setBranchKeyToMaximize(newBranchKeyToMaximize);
  }, [globalIdUser, userMessages]);
  // console.log("branchKeyToMaximize", branchKeyToMaximize);
  // console.log("globalIdUser", globalIdUser);
  const { open } = useSidebar();

  let chatContainerClass =
    " h-[83vh] rounded-xl mx-auto overflow-y-auto overflow-x-auto"; // flex flex-col overflow-auto
  if (!open) {
    chatContainerClass += " w-[90vw] md:w-[90vw] ";
  } else {
    chatContainerClass += " w-[90vw] md:w-[calc(90vw-16rem)] ";
  }

  return (
    <>
      <Suspense
        fallback={
          <div className="w-3/4 mx-auto">
            <MultilineSkeleton lines={4} />
          </div>
        }
      >
        <div id="chat-container" className={chatContainerClass}>
          <Suspense
            fallback={
              <div className="w-3/4 mx-auto">
                <MultilineSkeleton lines={4} />
              </div>
            }
          >
            {loadingHistory ? (
              <>
                <div className="w-3/4 mx-auto">
                  <MultilineSkeleton lines={4} />
                </div>
              </>
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
                  model={props.model}
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
          setChatContainerKey={props.setChatContainerKey}
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
    <Suspense
      fallback={
        <div className="w-3/4 mx-auto">
          <MultilineSkeleton lines={4} />
        </div>
      }
    >
      <div className="flex flex-col mx-auto justify-center items-center py-2 px-4 md:px-6 ">
        <Suspense
          fallback={
            <div className="w-3/4 mx-auto">
              <MultilineSkeleton lines={4} />
            </div>
          }
        >
          <RecursiveChatContainer
            {...props}
            refElementUser={refUser}
            refElementBot={refBot}
            setIsDialogOpen={setIsDialogOpen}
            setIsTopupDialogOpen={setIsTopupDialogOpen}
          />
        </Suspense>
        <AuthDialog
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
//
function checkParentBranch(key) {
  // console.log("key", key);
  const array = JSON.parse(key);
  // if length of array is 1 it is the root branch
  if (array.length === 1) {
    // console.log("root branch", key);
    return { final: true, key: key };
  }
  // if last value in array > 1 -> it is a new horizontal branch
  // -> maximize it
  let lastArray = array[array.length - 1];
  // console.log("lastArray", lastArray);
  if (lastArray > 1) {
    return { final: true, key: key };
  } else {
    // if last value in array === 1 -> it is a new vertical branch
    // -> maximize its parent
    let parentArray = array.slice(0, -1);
    if (parentArray.length === 0) {
      // first botMessage in branch
      parentArray = array;
      return { final: true, key: key };
    }
    // for instace parentArray [2, 1, 1]
    return checkParentBranch(JSON.stringify(parentArray));
  }
}

export function getMaxGlobalIdUser(userMessages) {
  const maxUID = Math.max(...userMessages.map((m) => m.globalIdUser));
  // console.log("maxUID", maxUID);
  return maxUID;
}
