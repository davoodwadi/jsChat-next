import { useSidebar } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { handleSubmit, resizeTextarea } from "@/lib/chatUtils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import UserMessage from "./UserMessage";
import BotMessage from "./BotMessage";
import RecursiveBranch from "./RecursiveBranch";

export default function Branch({ tm, ...props }) {
  const { open } = useSidebar();
  const { toast } = useToast();
  const [isHorizontallyMaxed, setIsHorizontallyMaxed] = useState(false);
  const thisBotRef = useRef(null);
  //   console.log("isHorizontallyMaxed", isHorizontallyMaxed);
  const getBotMessageForKey = (key) => {
    try {
      return props.botMessages.find((m) => m.key === key); // returns BotMessage for a given key
    } catch (error) {
      console.log("getBotMessageForKey", error);
      return null;
    }
  };

  const isPenultimateBranch = props.globalIdBot === props.maxGlobalIdBot;
  //   console.log("Branch props", props);
  let baseClass = "";
  const base = "mx-auto"; //border-2 border-red-300 flex-1
  let w;
  if (!open) {
    w = " w-[85vw] shrink-0 md:w-[85vw] ";
  } else {
    w = " w-[85vw] shrink-0 md:w-[calc(85vw-16rem)] ";
  }
  if (props.toMaximize || props.maxGlobalIdBot === 0) {
    baseClass = ` ${base} ${w} `;
  } else {
    baseClass = ` ${base} flex-1 `;
  }
  if (isHorizontallyMaxed) {
    baseClass = ` ${base} ${w} `;
  }
  // Run scroll after the re-render caused by isHorizontallyMaxed change
  useEffect(() => {
    if (isHorizontallyMaxed && thisBotRef.current) {
      thisBotRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center", // important for horizontal centering
      });
    }
  }, [isHorizontallyMaxed]);
  return (
    <div
      //   className="mx-auto flex-1"
      key={`branch ${tm.key}`}
      id={"branch" + props.id}
      className={baseClass}
      penultimate={isPenultimateBranch ? "true" : "false"}
      tomaximize={props.toMaximize ? "true" : "false"}
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
            toast,
            currentGlobalIdUser: tm.globalIdUser,
          })
        }
      >
        <Trash2 className="" />
      </Button>
      {/* remove branch END */}

      <div>
        <UserMessage
          {...props}
          {...tm}
          id={tm.key}
          key={tm.key}
          globalIdUser={tm.globalIdUser}
          maxGlobalIdUser={props.globalIdUser}
          toMaximize={props.branchKeyToMaximize === tm.key || props.toMaximize}
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
              toast,
            });
          }}
          refElementUser={props.refElementUser}
          refElementBot={props.refElementBot}
          userMessages={props.userMessages}
          model={props.model}
          setModel={props.setModel}
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
              toMaximize={
                props.branchKeyToMaximize === tm.key || props.toMaximize
              }
              refElementBot={props.refElementBot}
              botMessage={getBotMessageForKey(tm.key)}
              isHorizontallyMaxed={isHorizontallyMaxed}
              setIsHorizontallyMaxed={setIsHorizontallyMaxed}
              thisBotRef={thisBotRef}
            >
              {getBotMessageForKey(tm.key).content}
            </BotMessage>
            <RecursiveBranch
              {...props}
              parentKey={tm.key}
              parent={JSON.stringify(JSON.parse(tm.key)[props.level])}
              level={props.level + 1}
              toMaximize={
                props.branchKeyToMaximize === tm.key || props.toMaximize
              }
            />
          </>
        )}
      </div>
    </div>
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
