"use client";

export const maxDuration = 55;

import React from "react";
import { useState, useRef, useEffect } from "react";
import { Suspense } from "react";
import { MultilineSkeleton } from "@/components/ui/skeleton";

import { AuthDialog, TopupDialog } from "@/components/auth/AuthDialog";
import SaveItems from "@/components/save/SaveComponents";
import { getSessionTokensLeft } from "@/lib/actions";

import RecursiveBranch from "./RecursiveBranch";

export function RecursiveChatContainer(props) {
  // console.log("starting RecursiveChatContainer");
  // console.log("RecursiveChatContainer props", props);
  // console.log("props.refElementBot.current", props.refElementBot.current);
  // const refChatContainer = useRef(null);

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
    setBranchKeyToMaximize(newBranchKeyToMaximize);
  }, [globalIdUser]);

  let chatContainerClass =
    "  overflow-y-auto overflow-x-auto h-[70vh] rounded-xl mx-auto"; // flex flex-col overflow-auto

  chatContainerClass += " w-[90vw] md:w-[calc(90vw-16rem)] ";
  return (
    <>
      <Suspense
        fallback={
          <div className="w-3/4 mx-auto">
            <MultilineSkeleton lines={4} />
          </div>
        }
      >
        <div
          id="chat-container"
          className={chatContainerClass}
          // ref={refChatContainer}
        >
          <Suspense
            fallback={
              <div className="w-3/4 mx-auto">
                <MultilineSkeleton lines={4} />
              </div>
            }
          >
            <RecursiveBranch
              level={0}
              {...props}
              // refElementUser={props.refElementUser}
              // refElementBot={props.refElementBot}
              // setIsDialogOpen={props.setIsDialogOpen}
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
              // refChatContainer={refChatContainer}
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
  const [tokens, setTokens] = useState();
  useEffect(() => {
    const getTokensLeftAction = async () => {
      const { tokensRemaining } = await getSessionTokensLeft();
      setTokens(tokensRemaining);
    };
    getTokensLeftAction();
  }, []);
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
      <div>Tokens: {tokens}</div>
      <div className="flex flex-col mx-auto justify-center items-center py-2 px-4 md:px-6 ">
        <Suspense
          fallback={
            <div className="w-3/4 mx-auto">
              <MultilineSkeleton lines={4} />
            </div>
          }
        >
          <RecursiveChatContainer
            // setChatContainerKey={setChatContainerKey}
            refElementUser={refUser}
            refElementBot={refBot}
            setIsDialogOpen={setIsDialogOpen}
            setIsTopupDialogOpen={setIsTopupDialogOpen}
            {...props}
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

//
export function getBranchKeyToMaximize({ globalIdUser, userMessages }) {
  // console.log("globalIdUser", globalIdUser);
  // first user message -> maximize
  if (globalIdUser <= 1) {
    return JSON.stringify([1]);
  }
  // find user message with globalIdUser
  const thisUserMessage = userMessages.find(
    (userMessage) => userMessage.globalIdUser === globalIdUser
  );
  const messageKey = thisUserMessage?.key;
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
