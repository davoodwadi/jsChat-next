"use client";

export const maxDuration = 55;

import React from "react";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
// import { useIsMobile, useIsMobileLayout } from "@/hooks/use-mobile";
import { Suspense } from "react";

import { AuthDialog } from "@/components/AuthDialog";
import SaveItems from "@/components/SaveComponents";

import RecursiveBranch from "./RecursiveBranch";

export function RecursiveChatContainer(props) {
  // console.log("starting RecursiveChatContainer");
  // console.log("RecursiveChatContainer props", props);

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
  useEffect(() => {
    // console.log(
    //   "props.refElementBot.current",
    //   props.refElementBot.current
    // );
    // console.log("props.refElementUser:", props.refElementUser.current);
    props.refElementUser.current?.scrollIntoView({
      block: "center",
      inline: "center",
    });
  }, [globalIdUser]);

  useEffect(() => {
    const newBranchKeyToMaximize = getBranchKeyToMaximize({
      globalIdUser,
      userMessages,
    });
    // console.log("newBranchKeyToMaximize", newBranchKeyToMaximize);
    setBranchKeyToMaximize(newBranchKeyToMaximize);
  }, [globalIdUser]);

  let chatContainerClass =
    "  overflow-y-auto overflow-x-auto h-[70vh] rounded-xl mx-auto"; // flex flex-col overflow-auto
  // chatContainerClass += props.isMobile
  //   ? " w-[90vw] "
  //   : ` w-[calc(90vw-${SIDEBAR_WIDTH})] `;
  chatContainerClass += " w-[90vw] md:w-[calc(90vw-16rem)] ";
  return (
    <>
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
            />
          </Suspense>
        </div>
      </Suspense>
    </>
  );
}

export default function ChatContainer(props) {
  // console.log("ChatContainer props", props);
  const refUser = useRef(null);
  const refBot = useRef(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const isMobile = useIsMobileLayout();
  const isMobile = true;
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="flex flex-col mx-auto justify-center items-center py-2 px-4 md:px-6 ">
        <Suspense fallback={<p>Loading...</p>}>
          <RecursiveChatContainer
            refElementUser={refUser}
            refElementBot={refBot}
            setIsDialogOpen={setIsDialogOpen}
            isMobile={isMobile}
          />
        </Suspense>
        <SaveItems />
        <AuthDialog
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      </div>
    </Suspense>
  );
}

//
function getBranchKeyToMaximize({ globalIdUser, userMessages }) {
  // first user message -> maximize
  if (globalIdUser === 0) {
    return JSON.stringify([1]);
  }
  // find user message with globalIdUser
  const latestUserMessage = userMessages.find(
    (userMessage) => userMessage.globalIdUser === globalIdUser
  );
  // console.log("getBranchKeyToMaximize latestUserMessage", latestUserMessage);
  const messageKey = latestUserMessage?.key;

  const branchToMaxInfo = checkParentBranch(messageKey);
  // console.log("branchToMaxInfo", branchToMaxInfo);
  if (branchToMaxInfo.final) {
    console.log("getBranchKeyToMaximize", branchToMaxInfo.key);
    return branchToMaxInfo.key;
  }
  console.log("getBranchKeyToMaximize NOT FOUND", branchToMaxInfo.final);

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
