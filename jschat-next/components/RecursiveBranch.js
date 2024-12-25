import { Trash2 } from "lucide-react";
import { test } from "@/lib/test";
import { delay } from "@/lib/myTools";
import { SIDEBAR_WIDTH, SIDEBAR_WIDTH_MOBILE } from "@/components/ui/sidebar";

import { handleSubmit, resizeTextarea } from "@/lib/chatUtils";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Button } from "./ui/button";

import {
  UserMessage,
  BotMessage,
  // Branch,
  BranchContainer,
} from "./BranchComponents";

const Branch = dynamic(
  () => import("./BranchComponents").then((mod) => mod.Branch),
  {
    loading: () => <p>Loading Branch...</p>,
  }
);

export default function RecursiveBranch(props) {
  // console.log("RecursiveBranch props", props);

  // useTraceUpdate(props);

  const getBotMessageForKey = (key) =>
    props.botMessages.find(
      (m) => JSON.stringify(m.key) === JSON.stringify(key)
    ); // returns BotMessage for a given key

  // tempMessages should be messages whose length is props.parentKey.length+1
  // and .slice(0,-1) JSON.stringify is equal to parent
  let tempUserMessages;
  if (props.parentKey) {
    // console.log("props.parentKey", props.parentKey.length);
    // userMessages whose length is same as parent
    // (parent: the userMessage that called recursive)
    // &&
    // userMessages whose key matches the parent
    tempUserMessages = props.userMessages.filter(
      (m) =>
        m.key.length - 1 === JSON.parse(props.parentKey).length &&
        JSON.stringify(m.key.slice(0, -1)) === props.parentKey
    );
  } else {
    tempUserMessages = props.userMessages.filter((m) => m.key.length === 1);
  }

  return (
    tempUserMessages[0] && (
      <Suspense fallback={<p>Loading...</p>}>
        <BranchContainer id={props.level} key={props.level}>
          {tempUserMessages.map((tm, i) => {
            // console.log("tm", tm);
            return (
              <div className="mx-auto flex-1" key={`div ${tm.key}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mx-auto flex mb-0"
                  key={JSON.stringify(tm.key)}
                  id={JSON.stringify(tm.key)}
                  onClick={(event) =>
                    onRemoveBranchClick({ event, mainProps: props })
                  }
                >
                  <Trash2 className="" />
                </Button>

                <Branch
                  id={props.level}
                  key={`${props.level} ${i}`}
                  userKey={JSON.stringify(tm.key)}
                  globalIdBot={
                    getBotMessageForKey(tm.key) &&
                    getBotMessageForKey(tm.key).globalIdBot
                  }
                  maxGlobalIdBot={props.globalIdBot}
                  isMobile={props.isMobile}
                  toMaximize={
                    props.branchKeyToMaximize === JSON.stringify(tm.key) ||
                    props.toMaximize
                  }
                >
                  <UserMessage
                    {...tm}
                    id={JSON.stringify(tm.key)}
                    key={JSON.stringify(tm.key)}
                    globalIdUser={tm.globalIdUser}
                    maxGlobalIdUser={props.globalIdUser}
                    isMobile={props.isMobile}
                    toMaximize={
                      props.branchKeyToMaximize === JSON.stringify(tm.key) ||
                      props.toMaximize
                    }
                    handleSubmit={(botRef, targetId, targetValue) => {
                      // console.log(targetId, targetValue);
                      handleSubmit({
                        botRef,
                        targetId,
                        targetValue,
                        userMessages: props.userMessages,
                        setUserMessages: props.setUserMessages,
                        botMessages: props.botMessages,
                        setBotMessages: props.setBotMessages,
                        globalIdUser: props.globalIdUser,
                        setGlobalIdUser: props.setGlobalIdUser,
                        globalIdBot: props.globalIdBot,
                        setGlobalIdBot: props.setGlobalIdBot,
                        setResponse: props.setResponse,
                        model: props.model,
                        setIsDialogOpen: props.setIsDialogOpen,
                        refChatContainer: props.refChatContainer,
                        setRandomNumber: props.setRandomNumber,
                      });
                      // } else {
                      // console.log("resizing");
                      // resizeTextarea(event);
                      // }
                    }}
                    refElementUser={props.refElementUser}
                    refElementBot={props.refElementBot}
                  >
                    {tm.content}
                  </UserMessage>
                  {getBotMessageForKey(tm.key) && ( // tempBotMessages[i]
                    <BotMessage
                      {...getBotMessageForKey(tm.key)}
                      id={JSON.stringify(tm.key)}
                      key={"b" + JSON.stringify(tm.key)}
                      globalIdBot={getBotMessageForKey(tm.key).globalIdBot}
                      maxGlobalIdBot={props.globalIdBot}
                      model={getBotMessageForKey(tm.key)?.model}
                      toMaximize={
                        props.branchKeyToMaximize === JSON.stringify(tm.key) ||
                        props.toMaximize
                      }
                      refElementBot={props.refElementBot}
                    >
                      {getBotMessageForKey(tm.key).content}
                    </BotMessage>
                  )}

                  <RecursiveBranch
                    parentKey={JSON.stringify(tm.key)}
                    parent={tm.key[props.level]}
                    level={props.level + 1}
                    refElementUser={props.refElementUser}
                    refElementBot={props.refElementBot}
                    setIsDialogOpen={props.setIsDialogOpen}
                    userMessages={props.userMessages}
                    setUserMessages={props.setUserMessages}
                    botMessages={props.botMessages}
                    setBotMessages={props.setBotMessages}
                    globalIdBot={props.globalIdBot}
                    setGlobalIdBot={props.setGlobalIdBot}
                    globalIdUser={props.globalIdUser}
                    setGlobalIdUser={props.setGlobalIdUser}
                    isMobile={props.isMobile}
                    model={props.model}
                    setResponse={props.setResponse}
                    branchKeyToMaximize={props.branchKeyToMaximize}
                    toMaximize={
                      props.branchKeyToMaximize === JSON.stringify(tm.key) ||
                      props.toMaximize
                    }
                    refChatContainer={props.refChatContainer}
                    setRandomNumber={props.setRandomNumber}
                  />
                </Branch>
              </div>
            );
          })}
        </BranchContainer>
      </Suspense>
    )
  );
}

function onRemoveBranchClick({ event, mainProps }) {
  const arr = JSON.parse(event.target.id);
  //   console.log(arr);
  //   console.log(mainProps);

  // 1. remove child branches
  const keptUserMessages = mainProps.userMessages.filter(
    (subArray) =>
      !(
        JSON.stringify(subArray.key.slice(0, arr.length)) ===
        JSON.stringify(arr)
      )
  );

  //   console.log("keptUserMessages", keptUserMessages);
  if (keptUserMessages.length === 0) {
    // only branch
    mainProps.setUserMessages(() => [
      {
        key: [1],
        content: "",
        role: "user",
        globalIdUser: mainProps.globalIdUser,
      },
    ]);
  } else {
    mainProps.setUserMessages((um) => keptUserMessages);
  }
  const keptBotMessages = mainProps.botMessages.filter(
    (subArray) =>
      !(
        JSON.stringify(subArray.key.slice(0, arr.length)) ===
        JSON.stringify(arr)
      )
  );
  //   console.log("keptBotMessages", keptBotMessages);
  mainProps.setBotMessages((bm) => keptBotMessages);

  //   console.log("userMessages", mainProps.userMessages);
  //
}
