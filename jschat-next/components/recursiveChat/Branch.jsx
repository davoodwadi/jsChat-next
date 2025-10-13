import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { saveChatSession } from "@/lib/save/saveActions";

import { handleSubmit, resizeTextarea } from "@/lib/chatUtils";
import { getMaxGlobalIdUser } from "./RecursiveComponent";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import UserMessage from "./UserMessage";
import BotMessage from "./BotMessage";
import RecursiveBranch from "./RecursiveBranch";

export default function Branch({ tm, ...props }) {
  const { open } = useSidebar();
  // const [isHorizontallyMaxed, setIsHorizontallyMaxed] = useState(false);
  const thisBotRef = useRef(null);
  const branchRef = useRef(null);
  //   console.log("isHorizontallyMaxed", isHorizontallyMaxed);
  const getBotMessageForKey = (key) => {
    try {
      return props.botMessages.find((m) => m.key === key); // returns BotMessage for a given key
    } catch (error) {
      console.log("getBotMessageForKey", error);
      return null;
    }
  };
  const maxUID = getMaxGlobalIdUser(props.userMessages);

  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot;
  const toMaximize = props.branchKeyToMaximize === tm.key;

  // console.log("Branch props", props);
  let baseClass;
  // const base = " flex-1 min-w-72"; //border-2 border-red-300 flex-1
  const base = " "; //border-2 border-red-300 flex-1
  let w;
  if (!open) {
    w = " w-[85vw] shrink-0 md:w-[85vw] ";
  } else {
    w = " w-[85vw] shrink-0 md:w-[calc(85vw-16rem)] ";
  }
  if (toMaximize) {
    baseClass = ` ${base} ${w} `;
  } else {
    baseClass = ` ${base} flex-1 w-full  `;
  }

  // scroll to latest branch after mount
  // useEffect(() => {
  //   if (toMaximize && branchRef.current) {
  //     // console.log("useEffect branch fired", props.branchKeyToMaximize);
  //     // console.log("...for element", branchRef.current);
  //     // console.log("scrolling to branch with key ", tm.key);
  //     branchRef.current.scrollIntoView({
  //       behavior: "smooth",
  //       block: "start",
  //       inline: "center", // important for horizontal centering
  //     });
  //   }
  // }, [branchRef.current, props.branchKeyToMaximize]);
  // console.log("branch tm", tm);
  // console.log("branch props.id", props.id);
  // console.log("branch toMaximize", toMaximize);
  return (
    <div
      //   className="mx-auto flex-1"
      key={`branch ${tm.key}`}
      id={"branch" + props.id}
      className={baseClass}
      penultimate={isPenultimateBranch ? "true" : "false"}
      tomaximize={String(toMaximize)}
      ref={branchRef}
    >
      {/* remove branch START */}
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
            currentGlobalIdUser: tm.globalIdUser,
          })
        }
      >
        <Trash2 className="" />
      </Button>
      {/* remove branch END */}

      {/* debug start */}
      {/* <div
        className={
          toMaximize
            ? "mx-auto flex flex-col mb-0 border-2 border-green-700 "
            : "mx-auto flex flex-col mb-0 border-2 border-red-700 "
        }
      >
        <div className="">
          tm.key: {tm.key} {typeof tm.key} {typeof props.branchKeyToMaximize}
        </div>
        <div className="">
          props.branchKeyToMaximize: {props.branchKeyToMaximize}
        </div>
        <div className="">toMaximize: {String(toMaximize)}</div>
        <div className="">tm.globalIdUser: {String(tm.globalIdUser)}</div>
        <div className="">maxUID: {String(maxUID)}</div>
      </div> */}
      {/* debug end */}

      <div>
        <UserMessage
          {...props}
          {...tm}
          tm={tm}
          id={tm.key}
          key={tm.key}
          maxUID={maxUID}
          globalIdUser={tm.globalIdUser}
          maxGlobalIdUser={props.globalIdUser}
          toMaximize={toMaximize}
          handleSubmit={(
            botRef,
            targetId,
            multimediaMessage,
            userMessageModelInfo
          ) => {
            handleSubmit({
              ...props,
              botRef,
              targetId,
              multimediaMessage,
              userMessageModelInfo,
            });
          }}
          refElementUser={props.refElementUser}
          refElementBot={props.refElementBot}
          userMessages={props.userMessages}
          botModel={getBotMessageForKey(tm.key)?.model}
          botMessage={getBotMessageForKey(tm.key)}
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
              toMaximize={toMaximize}
              refElementBot={props.refElementBot}
              botMessage={getBotMessageForKey(tm.key)}
              // isHorizontallyMaxed={isHorizontallyMaxed}
              // setIsHorizontallyMaxed={setIsHorizontallyMaxed}
              thisBotRef={thisBotRef}
              branchKeyToMaximize={props.branchKeyToMaximize}
              setBranchKeyToMaximize={props.setBranchKeyToMaximize}
              userMessages={props.userMessages}
            >
              {getBotMessageForKey(tm.key).content}
            </BotMessage>
            <RecursiveBranch
              {...props}
              parentKey={tm.key}
              parent={JSON.stringify(JSON.parse(tm.key)[props.level])}
              level={props.level + 1}
              toMaximize={toMaximize}
            />
          </>
        )}
      </div>
    </div>
  );
}

function onRemoveBranchClick({ event, currentGlobalIdUser, ...mainProps }) {
  const selectedKey = event.target.id;
  const selectedKeyArr = JSON.parse(selectedKey);

  // console.log("selectedKey", selectedKey);
  // console.log("mainProps", mainProps);
  // console.log("currentGlobalIdUser", currentGlobalIdUser);
  // get parent split branch key
  const siblingBool = hasSiblings({
    selectedKey: selectedKey,
    userMessages: mainProps.userMessages,
  });
  // console.log("siblingBool", siblingBool);

  // 1. remove child branches
  const keptUserMessages = mainProps.userMessages.filter(
    (um) =>
      !(
        JSON.stringify(JSON.parse(um.key).slice(0, selectedKeyArr.length)) ===
        selectedKey
      )
  );
  const keptBotMessages = mainProps.botMessages.filter(
    (bm) =>
      !(
        JSON.stringify(JSON.parse(bm.key).slice(0, selectedKeyArr.length)) ===
        selectedKey
      )
  );
  // console.log("keptBotMessages", keptBotMessages);
  // return;
  // console.log("keptUserMessages", keptUserMessages);
  const maxUID = getMaxGlobalIdUser(mainProps.userMessages);

  if (keptUserMessages.length === 0) {
    // only branch
    mainProps.setUserMessages(() => [
      {
        key: "[1]",
        content: "",
        role: "user",
        globalIdUser: 1,
      },
    ]);
    mainProps.setBotMessages((bms) => []);
    toast("Branch Removed", {
      // title: "Branch Removed",
      // description: "There was a problem with your request.",
    });
    saveChatSession({
      chatId: mainProps.chatId,
      userMessages: mainProps.userMessages,
      botMessages: mainProps.botMessages,
      systemPrompt: mainProps.systemPrompt,
      globalModelInfo: mainProps.globalModelInfo,
    });
    return;
  }
  // user messages are left after remove
  if (siblingBool) {
    // console.log("removing the whole branch. siblings will cover");
    mainProps.setUserMessages((ums) => keptUserMessages);
    mainProps.setBotMessages((bms) => keptBotMessages);

    toast("Branch Removed", {
      // title: "Branch Removed",
    });
    saveChatSession({
      chatId: mainProps.chatId,
      userMessages: mainProps.userMessages,
      botMessages: mainProps.botMessages,
      systemPrompt: mainProps.systemPrompt,
      globalModelInfo: mainProps.globalModelInfo,
    });
    return;
  }
  // no sibling to cover for it => it new userMessage to cover
  // console.log("no sibling to cover for it => add new userMessage to cover");
  mainProps.setUserMessages((um) => [
    ...keptUserMessages,
    {
      key: selectedKey,
      content: "",
      role: "user",
      globalIdUser: maxUID + 1,
    },
  ]);
  mainProps.setBotMessages((bms) => keptBotMessages);

  toast("Branch Removed", {
    // title: "Branch Removed",
  });
  saveChatSession({
    chatId: mainProps.chatId,
    userMessages: mainProps.userMessages,
    botMessages: mainProps.botMessages,
    systemPrompt: mainProps.systemPrompt,
    globalModelInfo: mainProps.globalModelInfo,
  });
  return;
}

export function hasSiblings({ selectedKey, userMessages }) {
  // console.log("selectedKey", selectedKey);
  const selectedKeyArr = JSON.parse(selectedKey);
  const parentArr = selectedKeyArr.slice(0, -1);
  const parentString = JSON.stringify(parentArr);
  // console.log("parentString", parentString);
  // console.log("userMessages", userMessages);
  const siblings = userMessages.filter(
    (um) =>
      JSON.stringify(JSON.parse(um.key).slice(0, -1)) === parentString &&
      um.key !== selectedKey
  );
  // console.log("siblings", siblings);
  if (siblings.length > 0) {
    return true;
  } else {
    return false;
  }
}
