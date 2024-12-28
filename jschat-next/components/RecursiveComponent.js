"use client";

export const maxDuration = 55;

import React from "react";
import { useState, useRef, useEffect } from "react";
import { Suspense } from "react";

import { AuthDialog } from "@/components/AuthDialog";
import SaveItems from "@/components/SaveComponents";

import RecursiveBranch from "./RecursiveBranch";
import { Button } from "./ui/button";
import { sendEmail } from "@/lib/actions";

export function RecursiveChatContainer(props) {
  // console.log("starting RecursiveChatContainer");
  // console.log("RecursiveChatContainer props", props);
  // console.log("props.refElementBot.current", props.refElementBot.current);
  const refChatContainer = useRef(null);

  const [globalIdUser, setGlobalIdUser] = useState(1);
  const [globalIdBot, setGlobalIdBot] = useState(0);

  const [model, setModel] = useState("gpt-4o-mini");

  const [userMessages, setUserMessages] = useState(() => [
    {
      key: JSON.stringify([1]),
      content: "",
      role: "user",
      globalIdUser: globalIdUser,
    },
  ]);
  const [botMessages, setBotMessages] = useState(() => []);
  // console.log("botMessages", botMessages);

  const [response, setResponse] = useState({});
  const [branchKeyToMaximize, setBranchKeyToMaximize] = useState(
    JSON.stringify([1])
  );

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

  chatContainerClass += " w-[90vw] md:w-[calc(90vw-16rem)] ";
  return (
    <>
      <Suspense fallback={<p>Loading...</p>}>
        <div
          id="chat-container"
          className={chatContainerClass}
          ref={refChatContainer}
        >
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
              model={model}
              setResponse={setResponse}
              branchKeyToMaximize={branchKeyToMaximize}
              refChatContainer={refChatContainer}
            />
          </Suspense>
        </div>
        <SaveItems
          chatId={props.chatId}
          userMessages={userMessages}
          botMessages={botMessages}
          setUserMessages={setUserMessages}
          setBotMessages={setBotMessages}
          setChatContainerKey={props.setChatContainerKey}
        />
      </Suspense>
    </>
  );
}

export default function ChatContainer(props) {
  // console.log("ChatContainer props", props);
  const refUser = useRef(null);
  const refBot = useRef(null);
  const [chatContainerKey, setChatContainerKey] = useState(() => 1);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div
        key={chatContainerKey}
        id={chatContainerKey}
        className="flex flex-col mx-auto justify-center items-center py-2 px-4 md:px-6 "
      >
        <Button onClick={() => sendEmail()}>Send Email</Button>
        <Suspense fallback={<p>Loading...</p>}>
          <RecursiveChatContainer
            setChatContainerKey={setChatContainerKey}
            refElementUser={refUser}
            refElementBot={refBot}
            setIsDialogOpen={setIsDialogOpen}
            chatId={props.chatId}
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
function getBranchKeyToMaximize({ globalIdUser, userMessages }) {
  // console.log("globalIdUser", globalIdUser);
  // first user message -> maximize
  if (globalIdUser <= 1) {
    return JSON.stringify([1]);
  }
  // find user message with globalIdUser
  const latestUserMessage = userMessages.find(
    (userMessage) => userMessage.globalIdUser === globalIdUser
  );
  const messageKey = latestUserMessage?.key;
  const branchToMaxInfo = checkParentBranch(messageKey);
  // console.log("branchToMaxInfo", branchToMaxInfo);
  if (branchToMaxInfo.final) {
    return branchToMaxInfo.key;
  }
  console.log("getBranchKeyToMaximize NOT FOUND", branchToMaxInfo.final);

  return;
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
