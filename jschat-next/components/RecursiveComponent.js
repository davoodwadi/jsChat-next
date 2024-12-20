"use client";

export const maxDuration = 55;

import React from "react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
// import { useIsMobile, useIsMobileLayout } from "@/hooks/use-mobile";
import { Suspense } from "react";

import { AuthDialog } from "@/components/AuthDialog";

import RecursiveBranch from "./RecursiveBranch";

export function RecursiveChatContainer(props) {
  // console.log("starting RecursiveChatContainer");

  const [globalIdUser, setGlobalIdUser] = useState(1);
  const [globalIdBot, setGlobalIdBot] = useState(0);

  const [model, setModel] = useState("gpt-4o-mini");

  const [userMessages, setUserMessages] = useState(() => [
    { key: [1], content: "", role: "user", globalIdUser: globalIdUser },
  ]);
  const [botMessages, setBotMessages] = useState(() => []);

  const [response, setResponse] = useState({});
  const [branchKeyToMaximize, setBranchKeyToMaximize] = useState(
    JSON.stringify([1])
  );

  // scroll to latest bot message
  useLayoutEffect(() => {
    // console.log("props.refElementBot.current");
    props.refElementBot.current?.scrollIntoView({
      // behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }, [props.refElementBot.current]);

  useEffect(() => {
    const newBranchKeyToMaximize = getBranchKeyToMaximize({
      globalIdBot,
      botMessages,
    });
    // console.log("newBranchKeyToMaximize", newBranchKeyToMaximize);
    setBranchKeyToMaximize(newBranchKeyToMaximize);
  }, [globalIdBot]);

  let chatContainerClass =
    " overflow-y-auto overflow-x-auto h-[70vh] rounded-xl mx-auto"; // flex flex-col overflow-auto
  // chatContainerClass += props.isMobile
  //   ? " w-[90vw] "
  //   : ` w-[calc(90vw-${SIDEBAR_WIDTH})] `;
  chatContainerClass += " w-[90vw] md:w-[calc(90vw-16rem)] ";
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div id="chat-container" className={chatContainerClass}>
        <Suspense fallback={<p>Loading...</p>}>
          <RecursiveBranch
            level={0}
            refElementUser={props.refElementUser}
            refElementBot={props.refElementBot}
            setIsDialogOpen={props.setIsDialogOpen}
            userMessages={userMessages}
            setUserMessages={setUserMessages}
            botMessages={botMessages}
            setBotMessages={setBotMessages}
            globalIdBot={globalIdBot}
            setGlobalIdBot={setGlobalIdBot}
            globalIdUser={globalIdUser}
            setGlobalIdUser={setGlobalIdUser}
            isMobile={props.isMobile}
            model={model}
            setResponse={setResponse}
            branchKeyToMaximize={branchKeyToMaximize}
            // toMaximize={true}
          />
        </Suspense>
      </div>
    </Suspense>
  );
}

export default function ChatContainer(props) {
  // console.log("props", props);
  const refUser = useRef(null);
  const refBot = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const isMobile = useIsMobileLayout();
  const isMobile = true;
  // console.log("window.innerWidth", window.innerWidth);
  // const [isStillLoading, setIsStillLoading] = useState(true);
  // useEffect(() => {
  //   const asyncWait = async () => {
  //     console.log("START wait 3s");
  //     await delay(3000);
  //     setIsStillLoading(false);
  //     console.log("END wait 3s");
  //   };
  //   asyncWait();
  // }, [isStillLoading]);
  // if (isStillLoading) {
  //   return <p>Loading...</p>;
  // }
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="my-auto mx-auto py-2 px-4 md:px-6 ">
        <Suspense fallback={<p>Loading...</p>}>
          <RecursiveChatContainer
            refElementUser={refUser}
            refElementBot={refBot}
            setIsDialogOpen={setIsDialogOpen}
            isMobile={isMobile}
          />
        </Suspense>
        <AuthDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>
    </Suspense>
  );
}

//
function getBranchKeyToMaximize({ globalIdBot, botMessages }) {
  // first user message -> maximize
  if (globalIdBot === 0) {
    return JSON.stringify([1]);
  }
  // find bot message with globalIdBot
  const latestBotMessage = botMessages.find(
    (botMessage) => botMessage.globalIdBot === globalIdBot
  );
  const messageKey = latestBotMessage.key;

  const branchToMaxInfo = checkParentBranch(messageKey);
  // console.log("branchToMaxInfo", branchToMaxInfo);
  if (branchToMaxInfo.final) {
    return branchToMaxInfo.key;
  }

  return;
}
//
function checkParentBranch(key) {
  // console.log("key", key);
  // if length of key is 1 it is the root branch
  if (key.length === 1) {
    // console.log("root branch", key);
    return { final: true, key: JSON.stringify(key) };
  }
  // if last value in key > 1 -> it is a new horizontal branch
  // -> maximize it
  let lastKey = key[key.length - 1];
  // console.log("lastKey", lastKey);
  if (lastKey > 1) {
    return { final: true, key: JSON.stringify(key) };
  } else {
    // if last value in key === 1 -> it is a new vertical branch
    // -> maximize its parent
    let parentKey = key.slice(0, -1);
    if (parentKey.length === 0) {
      // first botMessage in branch
      parentKey = key;
      return { final: true, key: JSON.stringify(key) };
    }
    // for instace parentKey [2, 1, 1]
    return checkParentBranch(parentKey);
  }
}
