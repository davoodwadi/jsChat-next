import { Trash2 } from "lucide-react";
import { test } from "@/lib/test";
import { delay } from "@/lib/myTools";
import { useToast } from "@/hooks/use-toast";

import { handleSubmit, resizeTextarea } from "@/lib/chatUtils";

import dynamic from "next/dynamic";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { MultilineSkeleton } from "@/components/ui/skeleton";

import {
  UserMessage,
  BotMessage,
  // Branch,
  BranchContainer,
} from "./BranchComponents";

const Branch = dynamic(
  () => import("./BranchComponents").then((mod) => mod.Branch),
  {
    loading: () => <MultilineSkeleton lines={5} />,
  }
);

export default function RecursiveBranch(props) {
  // console.log("RecursiveBranch props", props);
  // console.log('runtime', typeof globalThis)

  const getBotMessageForKey = (key) => {
    try {
      return props.botMessages.find((m) => m.key === key); // returns BotMessage for a given key
    } catch (error) {
      console.log("getBotMessageForKey", error);
      return null;
    }
  };

  // tempMessages should be messages whose length is props.parentKey.length+1
  // and .slice(0,-1) JSON.stringify is equal to parent
  let tempUserMessages;
  if (props.parentKey) {
    // userMessages whose length is same as parent
    // (parent: the userMessage that called recursive)
    // &&
    // userMessages whose key matches the parent
    tempUserMessages = props.userMessages.filter(
      (m) =>
        JSON.parse(m.key).length - 1 === JSON.parse(props.parentKey).length &&
        JSON.stringify(JSON.parse(m.key).slice(0, -1)) === props.parentKey
    );
  } else {
    tempUserMessages = props.userMessages.filter(
      (m) => JSON.parse(m.key).length === 1
    );
  }
  // console.log("tempUserMessages", tempUserMessages);
  const { toast } = useToast();

  return (
    tempUserMessages[0] && (
      <Suspense
        fallback={
          <div className="w-3/4 mx-auto">
            <MultilineSkeleton lines={4} />
          </div>
        }
      >
        <BranchContainer id={props.level} key={props.level}>
          {tempUserMessages.map((tm, i) => {
            // console.log(
            //   "tm.globalIdUser, props.userMessages",
            //   tm.globalIdUser,
            //   props.userMessages
            // );

            return (
              <div className="mx-auto flex-1" key={`div ${tm.key}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mx-auto flex mb-0"
                  key={tm.key}
                  id={tm.key}
                  onClick={(event) =>
                    onRemoveBranchClick({
                      ...props,
                      event,
                      toast,
                      currentGlobalIdUser: tm.globalIdUser,
                    })
                  }
                >
                  <Trash2 className="" />
                </Button>

                <Branch
                  id={props.level}
                  key={`${props.level} ${i}`}
                  userKey={tm.key}
                  globalIdBot={
                    getBotMessageForKey(tm.key) &&
                    getBotMessageForKey(tm.key).globalIdBot
                  }
                  maxGlobalIdBot={props.globalIdBot}
                  toMaximize={
                    props.branchKeyToMaximize === tm.key || props.toMaximize
                  }
                >
                  <UserMessage
                    {...tm}
                    id={tm.key}
                    key={tm.key}
                    globalIdUser={tm.globalIdUser}
                    maxGlobalIdUser={props.globalIdUser}
                    toMaximize={
                      props.branchKeyToMaximize === tm.key || props.toMaximize
                    }
                    handleSubmit={(
                      botRef,
                      targetId,
                      multimediaMessage,
                      model
                    ) => {
                      handleSubmit({
                        ...props,
                        botRef,
                        targetId,
                        multimediaMessage,
                        model,
                        toast,
                      });
                      // } else {
                      // console.log("resizing");
                      // resizeTextarea(event);
                      // }
                    }}
                    refElementUser={props.refElementUser}
                    refElementBot={props.refElementBot}
                    userMessages={props.userMessages}
                    model={props.model}
                    setModel={props.setModel}
                    botModel={getBotMessageForKey(tm.key)?.model}
                  >
                    {tm.content}
                  </UserMessage>
                  {getBotMessageForKey(tm.key) && (
                    <>
                      <BotMessage
                        {...getBotMessageForKey(tm.key)}
                        id={tm.key}
                        key={"b" + tm.key}
                        globalIdBot={getBotMessageForKey(tm.key).globalIdBot}
                        maxGlobalIdBot={props.globalIdBot}
                        model={getBotMessageForKey(tm.key)?.model}
                        toMaximize={
                          props.branchKeyToMaximize === tm.key ||
                          props.toMaximize
                        }
                        refElementBot={props.refElementBot}
                        botMessage={getBotMessageForKey(tm.key)}
                      >
                        {getBotMessageForKey(tm.key).content}
                      </BotMessage>
                      <RecursiveBranch
                        {...props}
                        parentKey={tm.key}
                        parent={JSON.stringify(JSON.parse(tm.key)[props.level])}
                        level={props.level + 1}
                        toMaximize={
                          props.branchKeyToMaximize === tm.key ||
                          props.toMaximize
                        }
                      />
                    </>
                  )}
                </Branch>
              </div>
            );
          })}
        </BranchContainer>
      </Suspense>
    )
  );
}

function onRemoveBranchClick({
  event,
  toast,
  currentGlobalIdUser,
  ...mainProps
}) {
  const arr = JSON.parse(event.target.id);

  // console.log("event.target.id", event.target.id);
  // console.log("mainProps", mainProps);
  // console.log("currentGlobalIdUser", currentGlobalIdUser);
  // get parent split branch key
  const splitParentKey = getBranchSplitKey({
    currentIdUser: currentGlobalIdUser,
    userMessages: mainProps.userMessages,
  });
  // console.log("splitParentKey", splitParentKey);

  // 1. remove child branches
  const keptUserMessages = mainProps.userMessages.filter(
    (subArray) =>
      !(
        JSON.stringify(JSON.parse(subArray.key).slice(0, arr.length)) ===
        event.target.id
      )
  );
  // console.log(
  //   "splitParentKey === event.target.id",
  //   splitParentKey === event.target.id
  // );
  // console.log("keptUserMessages", keptUserMessages);
  if (splitParentKey === event.target.id) {
    // console.log(
    //   "splitParentKey===event.target.id split Branch",
    //   splitParentKey === event.target.id
    // );
    if (keptUserMessages.length === 0) {
      // only branch
      mainProps.setUserMessages(() => [
        {
          key: "[1]",
          content: "",
          role: "user",
          globalIdUser: mainProps.globalIdUser,
        },
      ]);
    } else {
      // split branch -> remove everything
      mainProps.setUserMessages((um) => [...keptUserMessages]);
    }
  } else {
    // serial child branch -> add empty userMessage with key event.target.id
    mainProps.setUserMessages((um) => [
      ...keptUserMessages,
      {
        key: event.target.id,
        content: "",
        role: "user",
        globalIdUser: mainProps.globalIdUser,
      },
    ]);
  }

  const keptBotMessages = mainProps.botMessages.filter(
    (subArray) =>
      !(
        JSON.stringify(JSON.parse(subArray.key).slice(0, arr.length)) ===
        event.target.id
      )
  );
  // console.log("keptBotMessages", keptBotMessages);
  mainProps.setBotMessages((bm) => keptBotMessages);
  toast({
    title: "Branch Removed",
    // description: "There was a problem with your request.",
  });
  //   console.log("userMessages", mainProps.userMessages);
  //
}

//
export function getBranchSplitKey({ currentIdUser, userMessages }) {
  // console.log("globalIdUser", globalIdUser);
  // first user message -> maximize
  // if (currentIdUser <= 1) {
  //   return JSON.stringify([1]);
  // }
  // find user message with globalIdUser
  const thisUserMessage = userMessages.find(
    (userMessage) => userMessage.globalIdUser === currentIdUser
  );
  const messageKey = thisUserMessage?.key;
  const splitBranchKey = checkParentSplit(messageKey, userMessages);
  // console.log("splitBranchKey", splitBranchKey);
  if (splitBranchKey) {
    return splitBranchKey;
  }
  // console.log("splitBranchKey NOT FOUND", splitBranchKey);

  return;
}
//
function checkParentSplit(key, userMessages) {
  // console.log("key", key);
  const array = JSON.parse(key);
  if (array.length === 1) {
    // it is root array
    // console.log("root branch", key);
    return key;
  }
  // console.log("array", array);
  // check to see how many siblings this branch has
  const siblings = userMessages.filter(
    (um) =>
      JSON.parse(um.key).length === JSON.parse(key).length && // same length
      // same parents
      JSON.stringify(JSON.parse(um.key).slice(0, -1)) ===
        JSON.stringify(JSON.parse(key).slice(0, -1))
  );
  // console.log("siblings", siblings);
  if (siblings.length > 1) {
    // console.log("siblings.length>1", siblings.length);

    return key;
  }
  let parentArray = array.slice(0, -1);
  // console.log("parentArray", parentArray);
  // for instace parentArray [2, 1, 1]
  return checkParentSplit(JSON.stringify(parentArray), userMessages);
}
